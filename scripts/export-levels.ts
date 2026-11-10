/**
 * Exporta uma imagem PNG por fase da campanha, usando o RENDER REAL do jogo.
 *
 * Para cada fase, abre `?level=N&shot=1` (modo captura: sem HUD, rádio ou
 * faixa de título) em um navegador headless, tira um screenshot e recorta
 * exatamente a área da sala. O resultado bate com o que o jogador vê.
 *
 * Uso: npx vite-node scripts/export-levels.ts [pasta-de-saida] [url]
 *
 * Requisitos: Microsoft Edge ou Google Chrome instalado. Se nenhum servidor
 * estiver rodando na URL informada, o script sobe um `vite` temporário.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { LEVELS } from '../src/game/levels';

const VIEW_W = 640;
const VIEW_H = 360;

const OUT = resolve(process.argv[2] ?? 'C:/Users/Computador/Downloads/fases_loopbound');
const BASE_URL = (process.argv[3] ?? 'http://localhost:5199').replace(/\/$/, '');
const ONLY = Number(process.env.ONLY ?? 0); // exporta só uma fase (debug)
const PORT = Number(new URL(BASE_URL).port || 5199);
const DISPLAY_SCALE = 2; // window-size = 640*2 x 360*2
const SHOT_W = VIEW_W * DISPLAY_SCALE;
const SHOT_H = VIEW_H * DISPLAY_SCALE;

function findBrowser(): string {
  const candidates = [
    process.env.EDGE_PATH,
    process.env.CHROME_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean) as string[];
  for (const c of candidates) if (existsSync(c)) return c;
  throw new Error('Edge/Chrome não encontrado. Defina EDGE_PATH ou CHROME_PATH.');
}

/** Mesma conta de posicionamento usada em `App.load()`. */
function roomRect(def: (typeof LEVELS)[number]) {
  const w = def.map[0].length;
  const h = def.map.length;
  const availW = VIEW_W - 80;
  const availH = VIEW_H - 24;
  const fit = Math.min(availW / (w * 16), availH / (h * 16));
  const zoom = Math.max(1, Math.min(2, Math.floor(fit)));
  const ox = Math.max(64, Math.round((VIEW_W - w * 16 * zoom) / 2));
  const oy = Math.round((VIEW_H - h * 16 * zoom) / 2);
  return {
    x: ox * DISPLAY_SCALE,
    y: oy * DISPLAY_SCALE,
    w: w * 16 * zoom * DISPLAY_SCALE,
    h: h * 16 * zoom * DISPLAY_SCALE,
  };
}

async function serverUp(): Promise<boolean> {
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

function crop(src: PNG, x: number, y: number, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h });
  for (let row = 0; row < h; row++) {
    const from = ((y + row) * src.width + x) << 2;
    const to = (row * w) << 2;
    src.data.copy(out.data, to, from, from + (w << 2));
  }
  return out;
}

async function screenshot(browser: string, url: string, file: string, profile: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await new Promise<void>((resolvePromise, reject) => {
        const child = spawn(
          browser,
          [
            '--headless=new',
            '--disable-gpu',
            '--no-sandbox',
            '--hide-scrollbars',
            '--disable-extensions',
            '--disable-background-networking',
            `--user-data-dir=${profile}`,
            `--window-size=${SHOT_W},${SHOT_H}`,
            '--virtual-time-budget=5000',
            `--screenshot=${file}`,
            url,
          ],
          { stdio: 'ignore' },
        );
        child.on('error', reject);
        child.on('exit', (code) =>
          code === 0 || existsSync(file)
            ? resolvePromise()
            : reject(new Error(`browser saiu com código ${code}`)),
        );
      });
      return;
    } catch (err) {
      if (existsSync(file)) return;
      rmSync(profile, { recursive: true, force: true });
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

async function ensureServer(): Promise<() => void> {
  if (await serverUp()) return () => {};
  console.log(`subindo vite em ${BASE_URL} ...`);
  const vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    shell: true,
    stdio: 'ignore',
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (await serverUp()) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!(await serverUp())) {
    vite.kill();
    throw new Error('não foi possível subir o servidor de desenvolvimento');
  }
  return () => vite.kill();
}

async function writeWithRetry(file: string, data: Buffer): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      writeFileSync(file, data);
      return;
    } catch (err) {
      lastErr = err;
      // Arquivo temporariamente bloqueado (antivírus/visualizador): tenta de novo.
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw lastErr;
}

const browser = findBrowser();
mkdirSync(OUT, { recursive: true });
const stopServer = await ensureServer();
const work = mkdtempSync(join(tmpdir(), 'loopbound-shots-'));
let ok = 0;

for (let i = 0; i < LEVELS.length; i++) {
  if (ONLY && i + 1 !== ONLY) continue;
  const def = LEVELS[i];
  const shot = join(work, `${i + 1}.png`);
  const profile = join(work, `profile-${i + 1}`);
  const url = `${BASE_URL}/?level=${i + 1}&shot=1`;

  const started = Date.now();
  await screenshot(browser, url, shot, profile);
  const waitMs = Math.max(0, 1200 - (Date.now() - started));
  if (waitMs) await new Promise((r) => setTimeout(r, waitMs));

  if (!existsSync(shot)) {
    console.error(`XX ${def.id}: screenshot não gerado`);
    continue;
  }
  const full = PNG.sync.read(readFileSync(shot));
  if (full.width !== SHOT_W || full.height !== SHOT_H) {
    console.error(`XX ${def.id}: screenshot ${full.width}x${full.height}, esperado ${SHOT_W}x${SHOT_H}`);
    continue;
  }
  const r = roomRect(def);
  const img = crop(full, r.x, r.y, r.w, r.h);
  const safe = def.id.replace(/[^a-z0-9-]/gi, '-');
  const file = join(OUT, `${String(i + 1).padStart(2, '0')}-${safe}.png`);
  await writeWithRetry(file, PNG.sync.write(img));
  ok++;
  console.log(`ok ${file} (${r.w}x${r.h}px)`);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
  } catch {
    // O navegador pode manter o perfil bloqueado por alguns instantes no Windows.
  }
}

stopServer();
try {
  rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
} catch {
  // Pasta temporária é descartável.
}
console.log(`\n${ok}/${LEVELS.length} imagens geradas em ${OUT}`);
