import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { pool } from './db.js';

const SESSION_DAYS = 30;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function newToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(userId: string): Promise<string> {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    'insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)',
    [userId, hashToken(token), expires],
  );
  return token;
}

export interface AuthedUser {
  id: string;
  username: string;
  avatar: string;
}

export async function userFromToken(token: string | null): Promise<AuthedUser | null> {
  if (!token) return null;
  const result = await pool.query<AuthedUser & { expires_at: Date }>(
    `select u.id, u.username, u.avatar, s.expires_at
       from sessions s
       join users u on u.id = s.user_id
      where s.token_hash = $1
      limit 1`,
    [hashToken(token)],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await pool.query('delete from sessions where token_hash = $1', [hashToken(token)]);
    return null;
  }
  return { id: row.id, username: row.username, avatar: row.avatar };
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query('delete from sessions where token_hash = $1', [hashToken(token)]);
}

/** Limite simples em memória para rotas sensíveis (login/cadastro). */
const attempts = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}
