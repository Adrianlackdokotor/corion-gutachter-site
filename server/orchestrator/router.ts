import { createHash } from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import { CLASSIFIER_PROMPT, getSkill, SKILLS } from "./skills.js";
import {
  createConversation,
  validateAndGetConversation,
  getConversationMessages,
  saveMessage,
  deleteConversation,
  checkAndIncrementIPQuota,
  getSessionMessageCount,
} from "./storage.js";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const MAX_CONCURRENT_STREAMS = 5;
const AI_CALL_TIMEOUT_MS = 30_000;
const STREAM_LIFETIME_MS = 45_000;
const MAX_IP_REQUESTS_PER_DAY = 100;
const MAX_MESSAGES_PER_SESSION = 30;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let activeStreams = 0;

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("AI call timed out")), ms)
    ),
  ]);
}

async function classifyIntent(message: string): Promise<string> {
  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: CLASSIFIER_PROMPT + "\n\nNachricht: " + message }] },
        ],
        config: { maxOutputTokens: 10, temperature: 0.1 },
      }),
      AI_CALL_TIMEOUT_MS
    );

    const classification = (response.text || "").trim().toLowerCase();
    return SKILLS[classification] ? classification : "general";
  } catch (error) {
    console.error("Classification error:", error);
    return "general";
  }
}

function buildGeminiHistory(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): { role: string; parts: { text: string }[] }[] {
  const history: { role: string; parts: { text: string }[] }[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user") {
      const text = i === 0
        ? `${systemPrompt}\n\n---\n\nNutzeranfrage: ${msg.content}`
        : msg.content;
      history.push({ role: "user", parts: [{ text }] });
    } else if (msg.role === "assistant") {
      history.push({ role: "model", parts: [{ text: msg.content }] });
    }
  }

  return history;
}

function orchestratorRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      status: "error",
      message: "Zu viele Anfragen. Bitte warten Sie eine Minute.",
    });
  }
  next();
}

function orchestratorBodyLimit(req: Request, res: Response, next: NextFunction) {
  const { message } = req.body || {};
  if (typeof message === "string" && message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      status: "error",
      message: `Nachricht zu lang. Maximal ${MAX_MESSAGE_LENGTH} Zeichen erlaubt.`,
    });
  }
  next();
}

async function checkDailyQuota(req: Request, res: Response): Promise<boolean> {
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);
  const allowed = await checkAndIncrementIPQuota(ipHash, MAX_IP_REQUESTS_PER_DAY);
  if (!allowed) {
    res.status(429).json({
      status: "error",
      message: "Tageslimit erreicht. Bitte versuchen Sie es morgen erneut.",
    });
    return false;
  }
  return true;
}

export function registerOrchestratorRoutes(app: Express) {
  app.post(
    "/api/orchestrator/chat",
    orchestratorRateLimit,
    orchestratorBodyLimit,
    async (req: Request, res: Response) => {
      try {
        if (!(await checkDailyQuota(req, res))) return;

        const { message, sessionId, sessionToken } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
          return res.status(400).json({ status: "error", message: "Nachricht darf nicht leer sein." });
        }

        let conversation;
        if (sessionId && sessionToken) {
          conversation = await validateAndGetConversation(sessionId, sessionToken);
        }
        if (!conversation) {
          conversation = await createConversation();
        } else {
          const msgCount = await getSessionMessageCount(conversation.id);
          if (msgCount >= MAX_MESSAGES_PER_SESSION) {
            return res.status(429).json({
              status: "error",
              message: "Sitzungslimit erreicht. Bitte starten Sie eine neue Unterhaltung.",
            });
          }
        }

        const skillId = await classifyIntent(message);
        const skill = getSkill(skillId);

        await saveMessage(conversation.id, "user", message, skillId);

        const history = await getConversationMessages(conversation.id, 10);
        const geminiHistory = buildGeminiHistory(skill.systemPrompt, history);

        const contents = geminiHistory.length > 0
          ? geminiHistory
          : [{ role: "user", parts: [{ text: `${skill.systemPrompt}\n\n---\n\nNutzeranfrage: ${message}` }] }];

        const response = await withTimeout(
          ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
              maxOutputTokens: skill.maxTokens,
              temperature: skill.temperature,
            },
          }),
          AI_CALL_TIMEOUT_MS
        );

        const reply = response.text || "Entschuldigung, ich konnte keine Antwort generieren.";

        await saveMessage(conversation.id, "assistant", reply, skillId);

        res.json({
          status: "success",
          reply,
          skillId,
          skillName: skill.name,
          sessionId: conversation.session_id,
          sessionToken: conversation.access_token,
        });
      } catch (error) {
        console.error("Orchestrator error:", error);
        res.status(500).json({
          status: "error",
          message: "CORA ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.",
        });
      }
    }
  );

  app.post(
    "/api/orchestrator/chat/stream",
    orchestratorRateLimit,
    orchestratorBodyLimit,
    async (req: Request, res: Response) => {
      if (activeStreams >= MAX_CONCURRENT_STREAMS) {
        return res.status(503).json({
          status: "error",
          message: "Zu viele gleichzeitige Verbindungen. Bitte versuchen Sie es in Kürze.",
        });
      }

      activeStreams += 1;
      let clientDisconnected = false;
      let streamDecremented = false;

      function decrementStreams() {
        if (!streamDecremented) {
          streamDecremented = true;
          activeStreams = Math.max(0, activeStreams - 1);
        }
      }

      res.on("close", () => {
        clientDisconnected = true;
        decrementStreams();
      });

      try {
        if (!(await checkDailyQuota(req, res))) {
          decrementStreams();
          return;
        }

        const { message, sessionId, sessionToken } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
          decrementStreams();
          return res.status(400).json({ status: "error", message: "Nachricht darf nicht leer sein." });
        }

        let conversation;
        if (sessionId && sessionToken) {
          conversation = await validateAndGetConversation(sessionId, sessionToken);
        }
        if (!conversation) {
          conversation = await createConversation();
        } else {
          const msgCount = await getSessionMessageCount(conversation.id);
          if (msgCount >= MAX_MESSAGES_PER_SESSION) {
            decrementStreams();
            return res.status(429).json({
              status: "error",
              message: "Sitzungslimit erreicht. Bitte starten Sie eine neue Unterhaltung.",
            });
          }
        }

        const skillId = await classifyIntent(message);
        const skill = getSkill(skillId);

        await saveMessage(conversation.id, "user", message, skillId);

        const history = await getConversationMessages(conversation.id, 10);
        const geminiHistory = buildGeminiHistory(skill.systemPrompt, history);

        const contents = geminiHistory.length > 0
          ? geminiHistory
          : [{ role: "user", parts: [{ text: `${skill.systemPrompt}\n\n---\n\nNutzeranfrage: ${message}` }] }];

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();

        res.write(
          `data: ${JSON.stringify({
            type: "meta",
            skillId,
            skillName: skill.name,
            sessionId: conversation.session_id,
            sessionToken: conversation.access_token,
          })}\n\n`
        );

        const streamPromise = ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents,
          config: {
            maxOutputTokens: skill.maxTokens,
            temperature: skill.temperature,
          },
        });

        const stream = await withTimeout(streamPromise, AI_CALL_TIMEOUT_MS);

        let fullReply = "";

        const streamLifetimeTimer = setTimeout(() => {
          clientDisconnected = true;
        }, STREAM_LIFETIME_MS);

        try {
          for await (const chunk of stream) {
            if (clientDisconnected) break;
            const content = chunk.text || "";
            if (content) {
              fullReply += content;
              res.write(`data: ${JSON.stringify({ type: "content", content })}\n\n`);
            }
          }
        } catch (streamError) {
          console.error("Stream iteration error:", streamError);
          if (!clientDisconnected) {
            res.write(`data: ${JSON.stringify({ type: "error", message: "Verbindung unterbrochen." })}\n\n`);
          }
        } finally {
          clearTimeout(streamLifetimeTimer);
        }

        if (fullReply) {
          await saveMessage(conversation.id, "assistant", fullReply, skillId).catch(console.error);
        }

        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
          res.end();
        }
      } catch (error) {
        decrementStreams();
        console.error("Orchestrator stream error:", error);
        if (res.headersSent) {
          if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify({ type: "error", message: "Verbindung unterbrochen." })}\n\n`);
            res.end();
          }
        } else {
          res.status(500).json({ status: "error", message: "CORA ist derzeit nicht erreichbar." });
        }
      }
    }
  );

  app.get("/api/orchestrator/skills", (_req: Request, res: Response) => {
    const skills = Object.values(SKILLS).map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));
    res.json(skills);
  });

  app.delete("/api/orchestrator/conversation/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionToken } = req.body || {};
      if (!sessionToken) {
        return res.status(403).json({ status: "error", message: "Nicht autorisiert." });
      }
      const deleted = await deleteConversation(req.params.sessionId as string, sessionToken);
      if (!deleted) {
        return res.status(403).json({ status: "error", message: "Nicht autorisiert." });
      }
      res.json({ status: "success" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ status: "error", message: "Fehler beim Löschen." });
    }
  });
}
