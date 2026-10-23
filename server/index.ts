import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { migrate, pool, requireDatabaseURL } from './db.js';
import {
  createSession,
  deleteSession,
  hashPassword,
  rateLimit,
  userFromToken,
  verifyPassword,
  type AuthedUser,
} from './auth.js';

requireDatabaseURL();

const app = express();
app.use(express.json({ limit: '64kb' }));

const ORIGINS = (process.env.APP_ORIGIN ?? 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (ORIGINS.includes('*') || ORIGINS.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

interface AuthedRequest extends Request {
  user?: AuthedUser;
  token?: string;
}

function bearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = bearer(req);
  const user = await userFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Sessão inválida. Entre novamente.' });
    return;
  }
  req.user = user;
  req.token = token!;
  next();
}

const credentials = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'O nome precisa de 3 letras.')
    .max(20, 'O nome pode ter até 20 letras.')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Só letras, números, ponto e underline.'),
  password: z.string().min(6, 'A senha precisa de 6 caracteres.').max(100),
});

async function loadMe(userId: string) {
  const [progress, bests, history] = await Promise.all([
    pool.query('select unlocked, tutorial_done, muted from progress where user_id = $1', [userId]),
    pool.query(
      'select level_id, steps, cycles, gems from level_bests where user_id = $1',
      [userId],
    ),
    pool.query(
      `select level_id, steps, cycles, gems, total_gems, won, created_at
         from runs where user_id = $1 order by created_at desc limit 15`,
      [userId],
    ),
  ]);
  return {
    progress: progress.rows[0] ?? { unlocked: 1, tutorial_done: false, muted: false },
    bests: bests.rows,
    history: history.rows,
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const ip = req.ip ?? 'local';
  if (!rateLimit(`register:${ip}`)) {
    res.status(429).json({ error: 'Muitas tentativas. Espere um pouco.' });
    return;
  }
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { username, password } = parsed.data;
  try {
    const hash = await hashPassword(password);
    const result = await pool.query<{ id: string }>(
      'insert into users (username, password_hash) values ($1, $2) returning id',
      [username, hash],
    );
    const id = result.rows[0].id;
    await pool.query('insert into progress (user_id) values ($1)', [id]);
    const token = await createSession(id);
    res.status(201).json({ token, username, ...(await loadMe(id)) });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === '23505') {
      res.status(409).json({ error: 'Esse nome já está em uso.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Não foi possível criar a conta.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip ?? 'local';
  if (!rateLimit(`login:${ip}`)) {
    res.status(429).json({ error: 'Muitas tentativas. Espere um pouco.' });
    return;
  }
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { username, password } = parsed.data;
  const result = await pool.query<{ id: string; password_hash: string; avatar: string }>(
    'select id, password_hash, avatar from users where lower(username) = lower($1)',
    [username],
  );
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    res.status(401).json({ error: 'Nome ou senha incorretos.' });
    return;
  }
  const token = await createSession(user.id);
  res.json({ token, username, ...(await loadMe(user.id)) });
});

app.post('/api/auth/logout', requireAuth, async (req: AuthedRequest, res) => {
  await deleteSession(req.token!);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, async (req: AuthedRequest, res) => {
  res.json({
    user: req.user,
    ...(await loadMe(req.user!.id)),
  });
});

const progressSchema = z.object({
  unlocked: z.number().int().min(1).max(50).optional(),
  tutorialDone: z.boolean().optional(),
  muted: z.boolean().optional(),
  avatar: z.string().max(40).optional(),
});

app.put('/api/progress', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Progresso inválido.' });
    return;
  }
  const { unlocked, tutorialDone, muted } = parsed.data;
  await pool.query(
    `insert into progress (user_id, unlocked, tutorial_done, muted)
     values ($1, coalesce($2, 1), coalesce($3, false), coalesce($4, false))
     on conflict (user_id) do update set
       unlocked = greatest(progress.unlocked, coalesce($2, progress.unlocked)),
       tutorial_done = progress.tutorial_done or coalesce($3, false),
       muted = coalesce($4, progress.muted),
       updated_at = now()`,
    [req.user!.id, unlocked ?? null, tutorialDone ?? null, muted ?? null],
  );
  res.json({ ok: true });
});

const runSchema = z.object({
  levelId: z.string().min(1).max(60),
  levelName: z.string().max(80).optional(),
  steps: z.number().int().min(0).max(100000),
  cycles: z.number().int().min(1).max(1000),
  gems: z.number().int().min(0).max(999),
  totalGems: z.number().int().min(0).max(999).optional(),
  won: z.boolean().optional(),
});

app.post('/api/runs', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = runSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Partida inválida.' });
    return;
  }
  const run = parsed.data;
  await pool.query(
    `insert into runs (user_id, level_id, level_name, steps, cycles, gems, total_gems, won)
     values ($1, $2, $3, $4, $5, $6, $7, coalesce($8, true))`,
    [
      req.user!.id,
      run.levelId,
      run.levelName ?? run.levelId,
      run.steps,
      run.cycles,
      run.gems,
      run.totalGems ?? 0,
      run.won ?? null,
    ],
  );
  await pool.query(
    `insert into level_bests (user_id, level_id, steps, cycles, gems)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, level_id) do update set
       steps = least(level_bests.steps, excluded.steps),
       cycles = least(level_bests.cycles, excluded.cycles),
       gems = greatest(level_bests.gems, excluded.gems),
       updated_at = now()`,
    [req.user!.id, run.levelId, run.steps, run.cycles, run.gems],
  );
  res.status(201).json({ ok: true });
});

app.get('/api/history', requireAuth, async (req: AuthedRequest, res) => {
  const limit = Math.min(Number(req.query.limit ?? 15) || 15, 50);
  const result = await pool.query(
    `select level_id, level_name, steps, cycles, gems, total_gems, won, created_at
       from runs where user_id = $1 order by created_at desc limit $2`,
    [req.user!.id, limit],
  );
  res.json({ runs: result.rows });
});

app.get('/api/leaderboard', async (_req, res) => {
  const result = await pool.query(
    `select u.username, b.level_id, b.steps
       from level_bests b join users u on u.id = b.user_id
      order by b.steps asc limit 20`,
  );
  res.json({ entries: result.rows });
});

const port = Number(process.env.PORT ?? 3001);

migrate()
  .then(() => {
    app.listen(port, () => console.log(`Loopbound API em http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Falha ao migrar o banco:', error);
    process.exit(1);
  });
