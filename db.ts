import pg, { QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type DB = {
  query: (text: string, params: any[]) => Promise<QueryResult>;
  getClient: () => Promise<pg.PoolClient>;
};

export async function query(text: string, params: any[]): Promise<QueryResult> {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Do not connect to database in test mode');
  }
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function getClient() {
  return await pool.connect();
}

export default { query, getClient };
