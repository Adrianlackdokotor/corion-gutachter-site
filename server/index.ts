import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { setupRoutes } from "./routes.js";
import { initDB } from "./db.js";
import { registerOrchestratorRoutes, initOrchestratorDB } from "./orchestrator/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

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
