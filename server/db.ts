import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS repair_requests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(255),
      message TEXT,
      request_type VARCHAR(50) DEFAULT 'gutachten',
      location VARCHAR(100),
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Database initialized");
}

export { pool };
