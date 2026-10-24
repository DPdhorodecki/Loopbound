import { LEVELS } from '../src/game/levels';
import { TUTORIAL_ROOMS } from '../src/game/tutorial';
import { LevelDef, Level, parseLevel, tileAt } from '../src/game/level';
import {
  clearCode,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  pressNext,
  tryMove,
} from '../src/game/rules';
import { Action, Dir, TILE_VOID, TILE_WALL } from '../src/game/types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

function applyAction(rt: ReturnType<typeof createRuntime>, token: Action) {
  if (MOVES.includes(token as Dir)) return tryMove(rt, token as Dir);
  if (token === 'E') interact(rt);
  else if (token === 'C') confirmCode(rt);
  else if (token === 'X') clearCode(rt);
  else if (token === '?') pressNext(rt);
  else pressCode(rt, Number(token) - 1);
  return null;
}

interface ReplayReport {
  won: boolean;
  prematureEnd: number[]; // índices de ciclo (1-based) que encerraram no meio
  deaths: number;
  blocked: string[];
}

function replay(def: LevelDef): ReplayReport {
  const level = parseLevel(def);
  const rt = createRuntime(level);
  const report: ReplayReport = { won: false, prematureEnd: [], deaths: 0, blocked: [] };
  def.solution.forEach((moves, index) => {
    const isLast = index === def.solution.length - 1;
    moves.forEach((token) => {
      const res = applyAction(rt, token);
      if (!res) return;
      if (!res.moved) report.blocked.push(`ciclo ${index + 1}: ${token}`);
      if (res.died) report.deaths++;
      if (res.cycleEnded && !(isLast && res.won)) {
        report.prematureEnd.push(index + 1);
      }
    });
    if (!isLast) {
      if (rt.status !== 'playing') report.blocked.push(`ciclo ${index + 1}: status ${rt.status} antes do fim`);
      endCycle(rt, 'tab');
    }
  });
  report.won = rt.status === 'won';
  return report;
}

/** BFS ignorando mecânicas: portões/portas/código = parede; caixotes = parede; sem teleporte. */
function freePath(def: LevelDef): boolean {
  const level = parseLevel(def);
  const w = level.w;
  const h = level.h;
  const blockedCell = (x: number, y: number) => {
    const t = tileAt(level, x, y);
    if (t === TILE_WALL) return true;
    if (level.gates.some((g) => g.x === x && g.y === y)) return true;
    if (level.doors.some((d) => d.x === x && d.y === y)) return true;
    if (level.codeGates.some((g) => g.x === x && g.y === y)) return true;
    if (level.crates.some((c) => c.x === x && c.y === y)) return true;
    // duoto teleporta: não dá pra "atravessar" andando na mesma direção
    if (level.ducts.some((d) => d.x === x && d.y === y)) return true;
    if (t === TILE_VOID) return true; // vazio mata
    return false;
  };
  const key = (x: number, y: number) => `${x},${y}`;
  const seen = new Set<string>([key(level.spawn.x, level.spawn.y)]);
  const q: [number, number][] = [[level.spawn.x, level.spawn.y]];
  while (q.length) {
    const [x, y] = q.shift()!;
    if (x === level.exit.x && y === level.exit.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (seen.has(key(nx, ny))) continue;
      if (blockedCell(nx, ny)) continue;
      seen.add(key(nx, ny));
      q.push([nx, ny]);
    }
  }
  return false;
}

function dirChanges(def: LevelDef): number {
  const flat: Dir[] = [];
  for (const cycle of def.solution) for (const t of cycle) if (MOVES.includes(t as Dir)) flat.push(t as Dir);
  let changes = 0;
  for (let i = 1; i < flat.length; i++) if (flat[i] !== flat[i - 1]) changes++;
  return changes;
}

function report(name: string, def: LevelDef) {
  const r = replay(def);
  const free = freePath(def);
  const perCycle = def.solution.map((c) => c.filter((t) => MOVES.includes(t as Dir)).length);
  const maxCycle = Math.max(...perCycle);
  const flags: string[] = [];
  if (!r.won) flags.push('NAO VENCE');
  if (r.prematureEnd.length) flags.push(`FIM PREMATURO ciclos ${[...new Set(r.prematureEnd)].join(',')}`);
  if (r.deaths) flags.push(`MORTES ${r.deaths}`);
  if (r.blocked.length) flags.push(`BLOQUEIOS ${r.blocked.slice(0, 3).join(' | ')}`);
  if (free) flags.push('CAMINHO LIVRE');
  const dc = dirChanges(def);
  if (dc <= 2 && !free) flags.push(`CORREDOR RETO(${dc})`);
  const status = flags.length ? 'XX ' + flags.join('; ') : 'ok';
  const steps = def.solution.reduce((n, c) => n + c.filter((t) => MOVES.includes(t as Dir)).length, 0);
  const slack = def.cycleLength - maxCycle;
  console.log(
    `${name.padEnd(28)} steps=${String(steps).padStart(3)} cycles=${def.solution.length} cl=${String(def.cycleLength).padStart(2)} max=${String(maxCycle).padStart(2)} folga=${String(slack).padStart(2)} ${status}`,
  );
}

console.log('=== CAMPANHA ===');
for (const def of LEVELS) report(def.id, def);
console.log('=== TUTORIAL ===');
for (const room of TUTORIAL_ROOMS) report(room.def.id, room.def);
