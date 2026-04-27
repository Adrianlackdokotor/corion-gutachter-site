import { randomUUID } from "crypto";
import { pool } from "../db.js";

export interface Conversation {
  id: number;
  session_id: string;
  access_token: string;
  skill_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  skill_id: string | null;
  created_at: Date;
}

export async function initOrchestratorDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orchestrator_conversations (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100) NOT NULL UNIQUE,
      access_token VARCHAR(100) NOT NULL DEFAULT '',
      skill_id VARCHAR(50) DEFAULT 'general',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE orchestrator_conversations
    ADD COLUMN IF NOT EXISTS access_token VARCHAR(100) NOT NULL DEFAULT '';
  `).catch(() => {});

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orchestrator_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES orchestrator_conversations(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL,
      content TEXT NOT NULL,
      skill_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orchestrator_ip_quotas (
      ip_hash VARCHAR(64) NOT NULL,
      quota_date DATE NOT NULL DEFAULT CURRENT_DATE,
      request_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (ip_hash, quota_date)
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orch_conv_session ON orchestrator_conversations(session_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orch_msg_conv ON orchestrator_messages(conversation_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orch_ip_quota ON orchestrator_ip_quotas(quota_date);
  `);

  await purgeOldConversations();

  const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    purgeOldConversations().catch(console.error);
  }, PURGE_INTERVAL_MS).unref();
}

export async function purgeOldConversations(): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM orchestrator_conversations WHERE updated_at < NOW() - INTERVAL '30 days'`
    );
    await pool.query(
      `DELETE FROM orchestrator_ip_quotas WHERE quota_date < CURRENT_DATE - INTERVAL '7 days'`
    );
  } catch (error) {
    console.error("Purge old conversations error:", error);
  }
}

export async function checkAndIncrementIPQuota(
  ipHash: string,
  maxPerDay: number
): Promise<boolean> {
  const result = await pool.query(
    `INSERT INTO orchestrator_ip_quotas (ip_hash, quota_date, request_count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (ip_hash, quota_date)
     DO UPDATE SET request_count = orchestrator_ip_quotas.request_count + 1
     RETURNING request_count`,
    [ipHash]
  );
  return result.rows[0].request_count <= maxPerDay;
}

export async function getSessionMessageCount(conversationId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) AS cnt FROM orchestrator_messages WHERE conversation_id = $1`,
    [conversationId]
  );
  return parseInt(result.rows[0].cnt, 10);
}

export async function createConversation(): Promise<Conversation> {
  const sessionId = randomUUID();
  const accessToken = randomUUID();
  const result = await pool.query(
    `INSERT INTO orchestrator_conversations (session_id, access_token) VALUES ($1, $2) RETURNING *`,
    [sessionId, accessToken]
  );
  return result.rows[0];
}

export async function validateAndGetConversation(
  sessionId: string,
  accessToken: string
): Promise<Conversation | null> {
  const result = await pool.query(
    `SELECT * FROM orchestrator_conversations WHERE session_id = $1 AND access_token = $2`,
    [sessionId, accessToken]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getConversationMessages(conversationId: number, limit = 20): Promise<Message[]> {
  const result = await pool.query(
    `SELECT * FROM orchestrator_messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2`,
    [conversationId, limit]
  );
  return result.rows;
}

export async function saveMessage(
  conversationId: number,
  role: string,
  content: string,
  skillId: string | null = null
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO orchestrator_messages (conversation_id, role, content, skill_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [conversationId, role, content, skillId]
  );

  await pool.query(
    `UPDATE orchestrator_conversations SET updated_at = NOW(), skill_id = COALESCE($2, skill_id) WHERE id = $1`,
    [conversationId, skillId]
  );

  return result.rows[0];
}

export async function deleteConversation(sessionId: string, accessToken: string): Promise<boolean> {
  const conv = await pool.query(
    `SELECT id FROM orchestrator_conversations WHERE session_id = $1 AND access_token = $2`,
    [sessionId, accessToken]
  );
  if (conv.rows.length === 0) {
    return false;
  }
  await pool.query(`DELETE FROM orchestrator_messages WHERE conversation_id = $1`, [conv.rows[0].id]);
  await pool.query(`DELETE FROM orchestrator_conversations WHERE id = $1`, [conv.rows[0].id]);
  return true;
}
