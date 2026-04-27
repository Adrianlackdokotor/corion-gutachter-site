import express, { type Request, type Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes.js";
import { initDB } from "./db.js";
import { registerOrchestratorRoutes, initOrchestratorDB } from "./orchestrator/index.js";
import { issueToken } from "./analytics-token.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_ORIGINS: string[] = [
  "https://www.corion-gutachter.de",
  "https://corion-gutachter.de",
];

if (process.env.REPLIT_DEV_DOMAIN) {
  ALLOWED_ORIGINS.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
    credentials: false,
  })
);

app.use(express.json({ limit: "32kb" }));

// ── HTML injection helper ─────────────────────────────────────────────────────
// Reads an HTML file and injects a single-use analytics token before </body>.
// The token is a cryptographically random value bound to the requesting IP+UA,
// stored server-side, and consumed on first use. No public endpoint issues tokens.
const projectRoot = path.resolve(__dirname, "..");

async function sendHtmlWithToken(req: Request, res: Response, filePath: string) {
  try {
    const content = await readFile(filePath, "utf-8");
    const token = issueToken(req);
    const injected = content.replace(
      "</body>",
      `<script>window.__CORION_ANALYTICS_TOKEN="${token}";</script></body>`
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(injected);
  } catch {
    res.status(404).send("Not found");
  }
}

// Servim folderul assets/ (CSS, imagini, iconițe)
app.use("/assets", express.static(path.join(projectRoot, "assets")));
app.use("/favicon.svg", express.static(path.join(projectRoot, "favicon.svg")));
app.get("/favicon.ico", (_req, res) => res.sendFile(path.join(projectRoot, "favicon.svg")));

// Sitemap & robots.txt
app.get("/sitemap.xml", (_req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.sendFile(path.join(projectRoot, "sitemap.xml"));
});
app.get("/robots.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(
    "User-agent: *\nAllow: /\nAllow: /ro/\nAllow: /ro/servicii\nAllow: /ro/faq\nSitemap: https://www.corion-gutachter.de/sitemap.xml\n"
  );
});

// ─── DE HTML pages ────────────────────────────────────────────────────────────
const staticHtmlPages = ["index.html", "servicii.html", "blog.html", "contact.html", "formular.html"];
staticHtmlPages.forEach((page) => {
  app.get(`/${page}`, (req, res) => {
    sendHtmlWithToken(req, res, path.join(projectRoot, page));
  });
});
app.get("/", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "index.html"));
});

// ─── RO pages ─────────────────────────────────────────────────────────────────
app.get(["/ro", "/ro/"], (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "index.html"));
});
app.get("/ro/servicii", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "servicii.html"));
});
app.get("/ro/faq", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "faq.html"));
});
app.get("/ro/frankfurt", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "frankfurt.html"));
});
app.get("/ro/wiesbaden", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "wiesbaden.html"));
});
app.get("/ro/mainz", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "mainz.html"));
});
app.get("/ro/hofheim", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "hofheim.html"));
});
app.get("/ro/accident-germania-ce-fac", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "accident-germania-ce-fac.html"));
});
app.get("/ro/blog/plata-fictiva-abtretung-germania", (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "ro", "blog", "plata-fictiva-abtretung-germania.html"));
});
app.get(["/impressum", "/impressum.html"], (req, res) => {
  sendHtmlWithToken(req, res, path.join(projectRoot, "impressum.html"));
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
const aiAssistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
});

const trackEventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests." },
});

async function main() {
  await initDB();
  await initOrchestratorDB();
  app.use("/api/gutachter/unfall-assistent", aiAssistantLimiter);
  app.use("/api/track-event", trackEventLimiter);
  setupRoutes(app);
  registerOrchestratorRoutes(app);

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "../dist/public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(5000, "0.0.0.0", () => {
      console.log("Production server running on port 5000");
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(5000, "0.0.0.0", () => {
      console.log("Dev server running on port 5000");
    });
  }
}

main().catch(console.error);
