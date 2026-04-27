import type { Express, Request, Response } from "express";
import { pool } from "./db.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export function setupRoutes(app: Express) {
  app.post("/api/gutachter/contact", async (req: Request, res: Response) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!email) {
        return res.status(400).json({ status: "error", message: "Bitte geben Sie Ihre E-Mail-Adresse ein." });
      }

      const result = await pool.query(
        `INSERT INTO repair_requests (name, email, phone, subject, message, request_type, status)
         VALUES ($1, $2, $3, $4, $5, 'gutachten', 'new')
         RETURNING id`,
        [name || "", email, phone || "", subject || "Gutachten-Anfrage", message || ""]
      );

      res.json({
        status: "success",
        message: "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.",
        id: result.rows[0].id,
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ status: "error", message: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." });
    }
  });

  app.post("/api/gutachter/unfall-assistent", async (req: Request, res: Response) => {
    try {
      const { description } = req.body;

      if (!description || description.trim() === "") {
        return res.status(400).json({ status: "error", message: "Bitte geben Sie eine Beschreibung ein." });
      }

      const systemPrompt = `Sie sind ein hilfreicher KI-Assistent für Corion Gutachter, ein unabhängiges Kfz-Sachverständigenbüro mit Standorten in Frankfurt, Hofheim, Wiesbaden und Mainz. Ein Nutzer hat einen Unfall beschrieben. Erstellen Sie eine allgemeine Checkliste mit Schritten, die nach einem Unfall zu beachten sind. Geben Sie keine Rechtsberatung. Betonen Sie, dass dies allgemeine Ratschläge sind und bei Fahrzeugschäden immer ein unabhängiger Kfz-Sachverständiger wie Corion Gutachter kontaktiert werden sollte. Die Checkliste sollte klar, prägnant und für Laien verständlich sein. Verwenden Sie Markdown-Format mit Aufzählungszeichen.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Unfallbeschreibung: ${description}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const advice = response.choices?.[0]?.message?.content || "Keine Antwort erhalten.";

      res.json({ status: "success", advice });
    } catch (error) {
      console.error("AI assistant error:", error);
      res.status(500).json({ status: "error", message: "KI-Assistent ist derzeit nicht erreichbar." });
    }
  });

  // ── GA4 Measurement Protocol — server-side conversion tracking ──────────────
  const GA4_ALLOWED_EVENTS = new Set([
    "whatsapp_click",
    "phone_click",
    "lead_form_submit",
    "maps_click",
    "photo_upload_click",
  ]);

  app.post("/api/track-event", async (req: Request, res: Response) => {
    try {
      const { event_name, client_id, language, page_path, lead_type, source } = req.body;

      if (!GA4_ALLOWED_EVENTS.has(event_name)) {
        return res.status(400).json({ status: "error", message: "Invalid event_name" });
      }

      const safeClientId =
        client_id && typeof client_id === "string" && client_id.trim().length > 0
          ? client_id.trim()
          : `srv.${Date.now()}.${Math.random().toString(36).substring(2)}`;

      const safeLanguage = language === "ro" || language === "de" ? language : "unknown";
      const safePath     = typeof page_path  === "string" ? page_path  : "/";
      const safeLeadType = typeof lead_type  === "string" ? lead_type  : "";
      const safeSource   = typeof source     === "string" ? source     : "website";

      const measurementId = process.env.GA4_MEASUREMENT_ID;
      const apiSecret     = process.env.GA4_API_SECRET;

      if (!measurementId || !apiSecret) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[GA4 MP] Skipped — GA4_MEASUREMENT_ID or GA4_API_SECRET not set");
        }
        return res.json({ status: "ok", note: "GA4 not configured" });
      }

      const payload = {
        client_id: safeClientId,
        events: [
          {
            name: event_name,
            params: {
              language:  safeLanguage,
              page_path: safePath,
              lead_type: safeLeadType,
              source:    safeSource,
            },
          },
        ],
      };

      const gaUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

      const gaResponse = await fetch(gaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (process.env.NODE_ENV !== "production") {
        console.log(`[GA4 MP] ${event_name} lang=${safeLanguage} → HTTP ${gaResponse.status}`);
      }

      res.json({ status: "ok" });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[GA4 MP] Error:", error);
      }
      // Never crash the app — fail silently from the client's perspective
      res.json({ status: "ok", note: "tracking failed silently" });
    }
  });

  app.get("/api/repair-requests", async (req: Request, res: Response) => {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || req.headers["x-admin-key"] !== adminKey) {
      return res.status(403).json({ status: "error", message: "Nicht autorisiert." });
    }
    try {
      const result = await pool.query(
        "SELECT id, name, email, phone, subject, request_type, status, created_at FROM repair_requests ORDER BY created_at DESC LIMIT 100"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("List requests error:", error);
      res.status(500).json({ status: "error", message: "Fehler beim Laden der Anfragen." });
    }
  });
}
