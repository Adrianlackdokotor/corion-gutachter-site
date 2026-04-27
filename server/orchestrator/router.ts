import type { Express, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { CLASSIFIER_PROMPT, getSkill, SKILLS } from "./skills.js";
import {
  getOrCreateConversation,
  getConversationMessages,
  saveMessage,
  deleteConversation,
} from "./storage.js";

// Gemini via Replit AI Integrations — fara cheie API proprie
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

async function classifyIntent(message: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: CLASSIFIER_PROMPT + "\n\nNachricht: " + message }] },
      ],
      config: { maxOutputTokens: 10, temperature: 0.1 },
    });

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
  // Gemini nu accepta "system" role in history — injectam system prompt in primul mesaj user
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

export function registerOrchestratorRoutes(app: Express) {
  // Endpoint non-streaming
  app.post("/api/orchestrator/chat", async (req: Request, res: Response) => {
    try {
      const { message, sessionId } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ status: "error", message: "Nachricht darf nicht leer sein." });
      }

      const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const conversation = await getOrCreateConversation(session);
      const skillId = await classifyIntent(message);
      const skill = getSkill(skillId);

      await saveMessage(conversation.id, "user", message, skillId);

      const history = await getConversationMessages(conversation.id, 10);
      const geminiHistory = buildGeminiHistory(skill.systemPrompt, history);

      // Daca nu exista istoric, folosim system prompt + mesaj curent
      const contents = geminiHistory.length > 0
        ? geminiHistory
        : [{ role: "user", parts: [{ text: `${skill.systemPrompt}\n\n---\n\nNutzeranfrage: ${message}` }] }];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          maxOutputTokens: skill.maxTokens,
          temperature: skill.temperature,
        },
      });

      const reply = response.text || "Entschuldigung, ich konnte keine Antwort generieren.";

      await saveMessage(conversation.id, "assistant", reply, skillId);

      res.json({
        status: "success",
        reply,
        skillId,
        skillName: skill.name,
        sessionId: session,
      });
    } catch (error) {
      console.error("Orchestrator error:", error);
      res.status(500).json({
        status: "error",
        message: "CORA ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.",
      });
    }
  });

  // Endpoint streaming (SSE)
  app.post("/api/orchestrator/chat/stream", async (req: Request, res: Response) => {
    let clientDisconnected = false;

    res.on("close", () => {
      clientDisconnected = true;
    });

    try {
      const { message, sessionId } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ status: "error", message: "Nachricht darf nicht leer sein." });
      }

      const session = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const conversation = await getOrCreateConversation(session);
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

      res.write(`data: ${JSON.stringify({ type: "meta", skillId, skillName: skill.name, sessionId: session })}\n\n`);

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          maxOutputTokens: skill.maxTokens,
          temperature: skill.temperature,
        },
      });

      let fullReply = "";

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
      }

      if (fullReply) {
        await saveMessage(conversation.id, "assistant", fullReply, skillId).catch(console.error);
      }

      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("Orchestrator stream error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", message: "Verbindung unterbrochen." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ status: "error", message: "CORA ist derzeit nicht erreichbar." });
      }
    }
  });

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
      await deleteConversation(req.params.sessionId as string);
      res.json({ status: "success" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ status: "error", message: "Fehler beim Löschen." });
    }
  });
}
