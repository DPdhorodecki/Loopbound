/**
 * Cliente da API do Loopbound.
 *
 * Em desenvolvimento o Vite faz proxy de `/api` para o servidor local
 * (veja `vite.config.ts`). Em produção, defina `VITE_API_URL` no build com a
 * URL pública da API (ex.: https://loopbound-api.onrender.com).
 */

export interface LevelBest {
  level_id: string;
  steps: number;
  cycles: number;
  gems: number;
}

export interface Run {
  level_id: string;
  level_name: string | null;
  steps: number;
  cycles: number;
  gems: number;
  total_gems: number;
  won: boolean;
  created_at: string;
}

export interface Progress {
  unlocked: number;
  tutorial_done: boolean;
  muted: boolean;
}

export interface ProgressInput {
  unlocked?: number;
  tutorialDone?: boolean;
  muted?: boolean;
  avatar?: string;
}

export interface Me {
  user?: { id: string; username: string; avatar: string };
  username?: string;
  token?: string;
  progress: Progress;
  bests: LevelBest[];
  history: Run[];
}

const RAW = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
const API = RAW.replace(/\/$/, '');
const TOKEN_KEY = 'loopbound.token.v1';
const CACHE_KEY = 'loopbound.me.v1';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* modo privado */
  }
}

export function cachedMe(): Me | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Me) : null;
  } catch {
    return null;
  }
}

function cacheMe(me: Me | null): void {
  try {
    if (me) localStorage.setItem(CACHE_KEY, JSON.stringify(me));
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    /* modo privado */
  }
}

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (auth && token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...init, headers });
  const text = await response.text();
  const body = text ? (JSON.parse(text) as T & { error?: string }) : ({} as T);
  if (!response.ok) {
    throw new ApiError((body as { error?: string }).error ?? 'Erro de rede.', response.status);
  }
  return body as T;
}

export async function register(username: string, password: string): Promise<Me> {
  const data = await request<Me>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    false,
  );
  return finishAuth(data, username);
}

export async function login(username: string, password: string): Promise<Me> {
  const data = await request<Me>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    false,
  );
  return finishAuth(data, username);
}

function finishAuth(data: Me, username: string): Me {
  if (data.token) setToken(data.token);
  const clean: Me = {
    ...data,
    token: undefined,
    username,
    user: { id: data.user?.id ?? '', username, avatar: data.user?.avatar ?? 'kennedito' },
  };
  cacheMe(clean);
  return clean;
}

export async function logout(): Promise<void> {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } catch {
    /* segue desconectando localmente */
  }
  setToken(null);
  cacheMe(null);
}

export async function me(): Promise<Me> {
  const data = await request<Me>('/api/me');
  cacheMe(data);
  return data;
}

export async function saveProgress(input: ProgressInput): Promise<void> {
  await request('/api/progress', { method: 'PUT', body: JSON.stringify(input) });
}

export async function sendRun(input: {
  levelId: string;
  levelName: string;
  steps: number;
  cycles: number;
  gems: number;
  totalGems: number;
  won: boolean;
}): Promise<void> {
  await request('/api/runs', { method: 'POST', body: JSON.stringify(input) });
}
