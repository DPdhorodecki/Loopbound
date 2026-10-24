import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === '1' ? { rejectUnauthorized: false } : undefined,
  // Se o Neon estiver acordando (ou fora do ar), não deixe o health check
  // pendurado: o Render considera o serviço doente depois de alguns segundos.
  connectionTimeoutMillis: 8000,
  query_timeout: 8000,
});

export async function migrate(): Promise<void> {
  const sql = readFileSync(join(here, 'migrations', '001_init.sql'), 'utf8');
  await pool.query(sql);
}

export function requireDatabaseURL(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada. Veja .env.example.');
  }
}
