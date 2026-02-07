import type { Express, Request, Response } from "express";
import { pool } from "./db.js";

export function setupRoutes(app: Express) {
  // Endpoint: Primire formular de contact și creare repair_request
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

  // Endpoint: KI-Unfall-Assistent — generează checklist pe baza descrierii accidentului
  app.post("/api/gutachter/unfall-assistent", async (req: Request, res: Response) => {
    try {
      const { description } = req.body;

      if (!description || description.trim() === "") {
        return res.status(400).json({ status: "error", message: "Bitte geben Sie eine Beschreibung ein." });
      }

      const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          status: "error",
          message: "KI-Service ist derzeit nicht verfügbar.",
        });
      }

      const systemPrompt = `Sie sind ein hilfreicher KI-Assistent für Corion Gutachter. Ein Nutzer hat einen Unfall beschrieben. Erstellen Sie eine allgemeine Checkliste mit Schritten, die nach einem Unfall zu beachten sind. Geben Sie keine Rechtsberatung. Betonen Sie, dass dies allgemeine Ratschläge sind und bei Fahrzeugschäden immer ein unabhängiger Kfz-Sachverständiger wie Corion Gutachter kontaktiert werden sollte. Die Checkliste sollte klar, prägnant und für Laien verständlich sein. Verwenden Sie Markdown-Format mit Aufzählungszeichen.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Unfallbeschreibung: ${description}` },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const advice = data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";

      res.json({ status: "success", advice });
    } catch (error) {
      console.error("AI assistant error:", error);
      res.status(500).json({ status: "error", message: "KI-Assistent ist derzeit nicht erreichbar." });
    }
  });

  // Endpoint: Listare repair requests (pentru admin)
  app.get("/api/repair-requests", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query("SELECT * FROM repair_requests ORDER BY created_at DESC LIMIT 100");
      res.json(result.rows);
    } catch (error) {
      console.error("List requests error:", error);
      res.status(500).json({ status: "error", message: "Fehler beim Laden der Anfragen." });
    }
  });
}
