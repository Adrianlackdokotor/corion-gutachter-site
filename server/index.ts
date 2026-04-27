import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes.js";
import { initDB } from "./db.js";
import { registerOrchestratorRoutes, initOrchestratorDB } from "./orchestrator/index.js";

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
    allowedHeaders: ["Content-Type"],
    credentials: false,
  })
);

app.use(express.json({ limit: "32kb" }));

// Servim folderul assets/ (CSS, imagini, iconițe) și fișierele HTML statice din rădăcina proiectului
const projectRoot = path.resolve(__dirname, "..");
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

// HTML pages statice DE (în afara React app care e la /gutachter)
const staticHtmlPages = ["index.html", "servicii.html", "blog.html", "contact.html", "formular.html"];
staticHtmlPages.forEach((page) => {
  app.get(`/${page}`, (_req, res) => {
    res.sendFile(path.join(projectRoot, page));
  });
});
// Ruta root "/" serveste index.html static
app.get("/", (_req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

// ─── Rute RO (/ro/) ───────────────────────────────────────────────────────
app.get(["/ro", "/ro/"], (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "index.html"));
});
app.get("/ro/servicii", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "servicii.html"));
});
app.get("/ro/faq", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "faq.html"));
});
app.get("/ro/frankfurt", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "frankfurt.html"));
});
app.get("/ro/wiesbaden", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "wiesbaden.html"));
});
app.get("/ro/mainz", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "mainz.html"));
});
app.get("/ro/hofheim", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "hofheim.html"));
});
app.get("/ro/accident-germania-ce-fac", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "accident-germania-ce-fac.html"));
});
app.get("/ro/blog/plata-fictiva-abtretung-germania", (_req, res) => {
  res.sendFile(path.join(projectRoot, "ro", "blog", "plata-fictiva-abtretung-germania.html"));
});
app.get(["/impressum", "/impressum.html"], (_req, res) => {
  res.sendFile(path.join(projectRoot, "impressum.html"));
});

async function main() {
  await initDB();
  await initOrchestratorDB();
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
