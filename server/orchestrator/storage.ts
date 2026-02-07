import { pool } from "../db.js";

export interface Conversation {
  id: number;
  session_id: string;
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
      skill_id VARCHAR(50) DEFAULT 'general',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

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
    CREATE INDEX IF NOT EXISTS idx_orch_conv_session ON orchestrator_conversations(session_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orch_msg_conv ON orchestrator_messages(conversation_id);
  `);
}

export async function getOrCreateConversation(sessionId: string): Promise<Conversation> {
  const existing = await pool.query(
    `SELECT * FROM orchestrator_conversations WHERE session_id = $1`,
    [sessionId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO orchestrator_conversations (session_id) VALUES ($1)
     ON CONFLICT (session_id) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [sessionId]
  );
  return result.rows[0];
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

export async function deleteConversation(sessionId: string): Promise<void> {
  const conv = await pool.query(
    `SELECT id FROM orchestrator_conversations WHERE session_id = $1`,
    [sessionId]
  );
  if (conv.rows.length > 0) {
    await pool.query(`DELETE FROM orchestrator_messages WHERE conversation_id = $1`, [conv.rows[0].id]);
    await pool.query(`DELETE FROM orchestrator_conversations WHERE id = $1`, [conv.rows[0].id]);
  }
}
