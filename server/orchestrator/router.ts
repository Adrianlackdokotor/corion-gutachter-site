import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { CLASSIFIER_PROMPT, getSkill, SKILLS } from "./skills.js";
import {
  getOrCreateConversation,
  getConversationMessages,
  saveMessage,
  deleteConversation,
} from "./storage.js";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function classifyIntent(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const classification = response.choices?.[0]?.message?.content?.trim().toLowerCase() || "general";
    return SKILLS[classification] ? classification : "general";
  } catch (error) {
    console.error("Classification error:", error);
    return "general";
  }
}

function buildChatHistory(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): { role: "system" | "user" | "assistant"; content: string }[] {
  const history: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];
  for (const msg of messages) {
    if (msg.role === "user" || msg.role === "assistant") {
      history.push({ role: msg.role, content: msg.content });
    }
  }
  return history;
}

export function registerOrchestratorRoutes(app: Express) {
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
      const chatHistory = buildChatHistory(skill.systemPrompt, history);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatHistory,
        temperature: skill.temperature,
        max_tokens: skill.maxTokens,
      });

      const reply = response.choices?.[0]?.message?.content || "Entschuldigung, ich konnte keine Antwort generieren.";

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

  app.post("/api/orchestrator/chat/stream", async (req: Request, res: Response) => {
    let clientDisconnected = false;

    req.on("close", () => {
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
      const chatHistory = buildChatHistory(skill.systemPrompt, history);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      res.write(`data: ${JSON.stringify({ type: "meta", skillId, skillName: skill.name, sessionId: session })}\n\n`);

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatHistory,
        temperature: skill.temperature,
        max_tokens: skill.maxTokens,
        stream: true,
      });

      let fullReply = "";

      try {
        for await (const chunk of stream) {
          if (clientDisconnected) break;
          const content = chunk.choices[0]?.delta?.content || "";
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
