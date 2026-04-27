import { createHmac, randomBytes } from "crypto";
import type { Request } from "express";

// ── Single-use, requester-bound analytics token store ────────────────────────
// Each page load gets a unique random token stored server-side with:
//   - TTL expiry (10 minutes)
//   - The issuing request's IP + User-Agent fingerprint
// On validation the token is consumed (deleted) and the current request's
// IP+UA must match the fingerprint recorded at issue time.
//
// No public endpoint exists to request a token: they are injected directly into
// first-party HTML responses. An attacker must load a page from our server to
// get a token, and they can only use it once from the same IP and User-Agent.

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface TokenEntry {
  fingerprint: string;
  expiresAt: number;
}

const tokenStore = new Map<string, TokenEntry>();

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of tokenStore) {
    if (entry.expiresAt < now) tokenStore.delete(token);
  }
}, 5 * 60 * 1000).unref();

function fingerprint(req: Request): string {
  const ip = (req.ip ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] ?? "").substring(0, 300);
  // Hash rather than store raw values to keep the map compact
  return createHmac("sha256", "corion-fp").update(`${ip}|${ua}`).digest("hex");
}

export function issueToken(req: Request): string {
  const token = randomBytes(32).toString("hex");
  tokenStore.set(token, {
    fingerprint: fingerprint(req),
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  return token;
}

export function validateAndConsumeToken(token: unknown, req: Request): boolean {
  if (!token || typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const entry = tokenStore.get(token);
  if (!entry) return false;
  tokenStore.delete(token); // consume immediately — single-use
  if (entry.expiresAt < Date.now()) return false;
  return entry.fingerprint === fingerprint(req);
}
