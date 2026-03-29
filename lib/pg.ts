import { Pool, PoolClient } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your DATABASE_URL to .env.local');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function connectToDatabase(): Promise<PoolClient> {
  const client = await pool.connect();
  
  // Initialize all tables if they don't already exist
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS networks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        society_type TEXT NOT NULL,
        persona_count INTEGER NOT NULL,
        personas JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_networks_user_id ON networks(user_id);
      CREATE INDEX IF NOT EXISTS idx_networks_created_at ON networks(created_at DESC);

      CREATE TABLE IF NOT EXISTS simulations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        personas JSONB NOT NULL,
        persona_responses JSONB NOT NULL,
        insights JSONB NOT NULL,
        response_count INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
      CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);
    `);
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
  }

  return client;
}

export default pool;
