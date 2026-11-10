/**
 * Regera as fases 2–30 com desenhos e percursos únicos.
 *
 * Estratégia:
 *  - Usa os mapas compactos de `scripts/core-levels.ts` (base anterior à
 *    ampliação repetitiva) para preservar os puzzles originais das fases 2–12.
 *  - A saída antiga (`E`) vira uma passagem secreta (`S`). O cofre selado de
 *    cada fase é um anexo próprio, com formato/dimensões/posição diferentes,
 *    ligado apenas pelo teleporte da passagem. Dentro dele ficam `s`, `A`
 *    (alçapão), `B` (bueiro) e a nova saída `E`.
 *  - Fases 2–12 têm ecos; a solução original é preservada e o desvio do cofre
 *    é anexado ao último ciclo.
 *  - Fases 13–30 são de ciclo único; além do anexo, o miolo recebe mutações
 *    de parede validadas pelo solver BFS, gerando rotas próprias.
 *
 * Uso: npx vite-node scripts/refactor-levels.ts
 */
import { writeFileSync } from 'node:fs';
import { LEVELS as CURRENT } from '../src/game/levels';
import { LEVELS as CORE } from './core-levels';
import { parseLevel, tileAt, type LevelDef } from '../src/game/level';
import {
  clearCode,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  pressNext,
  tryMove,
  type Runtime,
} from '../src/game/rules';
import { unusedMechanics, traceSolution } from '../src/game/analysis';
import { solveSingleCycle } from './solver';
import type { Action, Dir, Vec } from '../src/game/types';
import { TILE_VOID, TILE_WALL } from '../src/game/types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];
const DELTA: Record<Dir, [number, number]> = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
};
const MAX_W = 36;
const MAX_H = 21;

function cloneGrid(map: string[]): string[][] {
  return map.map((row) => [...row]);
}

function toMap(grid: string[][]): string[] {
  return grid.map((row) => row.join(''));
}

function blankGrid(w: number, h: number): string[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => '#'));
}

function applyAction(rt: Runtime, token: Action) {
  if (MOVES.includes(token as Dir)) return tryMove(rt, token as Dir);
  if (token === 'E') interact(rt);
  else if (token === 'C') confirmCode(rt);
  else if (token === 'X') clearCode(rt);
  else if (token === '?') pressNext(rt);
  else if (token >= '1' && token <= '9') pressCode(rt, Number(token) - 1);
  return null;
}

interface Approach {
  x: number;
  y: number;
  dir: Dir;
}

/** Replaya a solução e devolve a célula/direção do último passo para a saída. */
function lastApproach(def: LevelDef): Approach {
  const level = parseLevel(def);
  const rt = createRuntime(level);
  let approach: Approach | null = null;
  def.solution.forEach((cycle, ci) => {
    const isLast = ci === def.solution.length - 1;
    for (const token of cycle) {
      if (isLast && MOVES.includes(token as Dir)) {
        approach = { x: rt.player.x, y: rt.player.y, dir: token as Dir };
      }
      applyAction(rt, token);
    }
    if (!isLast) endCycle(rt, 'tab');
  });
  if (!approach) throw new Error(`${def.id}: solução não termina em movimento`);
  return approach;
}

/** Células pisadas (e ocupadas por caixotes) em toda a solução. */
function visitedCells(def: LevelDef): Set<string> {
  const level = parseLevel(def);
  const rt = createRuntime(level);
  const seen = new Set<string>();
  const mark = () => {
    seen.add(`${rt.player.x},${rt.player.y}`);
    for (const c of rt.crates) seen.add(`${c.x},${c.y}`);
  };
  mark();
  def.solution.forEach((cycle, ci) => {
    const isLast = ci === def.solution.length - 1;
    for (const token of cycle) {
      applyAction(rt, token);
      mark();
    }
    if (!isLast) endCycle(rt, 'tab');
  });
  return seen;
}

/** Serpentina com uma parede entre as linhas: caminho único de `s` a `E`. */
function serpentine(w: number, h: number, vertical: boolean, reverse: boolean): Vec[] {
  const make = (width: number, height: number): Vec[] => {
    const out: Vec[] = [];
    const rows = Math.floor((height + 1) / 2);
    for (let r = 0; r < rows; r++) {
      const y = r * 2;
      const leftToRight = reverse ? r % 2 === 1 : r % 2 === 0;
      if (leftToRight) {
        for (let x = 0; x < width; x++) out.push({ x, y });
      } else {
        for (let x = width - 1; x >= 0; x--) out.push({ x, y });
      }
      if (r < rows - 1) {
        const endX = leftToRight ? width - 1 : 0;
        out.push({ x: endX, y: y + 1 });
      }
    }
    return out;
  };
  if (!vertical) return make(w, h);
  return make(h, w).map((p) => ({ x: p.y, y: p.x }));
}

interface AnnexPlan {
  map: string[];
  path: Vec[];
  dirs: Dir[];
  aIndex: number;
  bIndex: number;
  approach: Approach;
}

function planAnnex(def: LevelDef, meta: LevelDef, seed: number): AnnexPlan {
  const core = cloneGrid(def.map);
  const coreH = core.length;
  const coreW = core[0].length;
  const approach = lastApproach(def);

  const side = (['right', 'bottom', 'left', 'top'] as const)[seed % 4];
  const awBase = 4 + ((seed >> 2) % 4); // 4..7
  const ahBase = 5 + ((seed >> 4) % 4); // 5..8
  const vertical = ((seed >> 6) & 1) === 1;
  const reverse = ((seed >> 7) & 1) === 1;

  let aw = vertical ? Math.min(awBase, 6) : awBase;
  let ah = vertical ? Math.max(ahBase, 6) : ahBase;
  let path = serpentine(aw, ah, vertical, reverse);

  // Caminho curto demais: aumenta a dimensão no eixo principal.
  while (path.length < 13) {
    if (vertical) aw = Math.min(7, aw + 1);
    else ah = Math.min(9, ah + 1);
    if (aw === 7 && ah === 9) break;
    path = serpentine(aw, ah, vertical, reverse);
  }

  let coreX = 0;
  let coreY = 0;
  let newW = coreW;
  let newH = coreH;
  let ax = 1;
  let ay = 1;

  if (side === 'right') {
    newW = coreW + aw + 2;
    newH = Math.max(coreH, ah + 2);
    ax = coreW + 1;
    ay = 1 + ((seed * 7) % Math.max(1, newH - ah - 1));
  } else if (side === 'left') {
    newW = aw + 2 + coreW;
    newH = Math.max(coreH, ah + 2);
    coreX = aw + 2;
    ax = 1;
    ay = 1 + ((seed * 7) % Math.max(1, newH - ah - 1));
  } else if (side === 'bottom') {
    newW = Math.max(coreW, aw + 2);
    newH = coreH + ah + 2;
    ax = 1 + ((seed * 11) % Math.max(1, newW - aw - 1));
    ay = coreH + 1;
  } else {
    newW = Math.max(coreW, aw + 2);
    newH = ah + 2 + coreH;
    coreY = ah + 2;
    ax = 1 + ((seed * 11) % Math.max(1, newW - aw - 1));
    ay = 1;
  }

  if (newW > MAX_W || newH > MAX_H) {
    throw new Error(`${def.id}: anexo ${side} passou do limite (${newW}x${newH})`);
  }

  const grid = blankGrid(newW, newH);
  for (let y = 0; y < coreH; y++) {
    for (let x = 0; x < coreW; x++) {
      const ch = core[y][x];
      grid[coreY + y][coreX + x] = ch === 'E' ? 'S' : ch;
    }
  }

  const absPath = path.map((p) => ({ x: ax + p.x, y: ay + p.y }));
  for (const p of absPath) grid[p.y][p.x] = '.';

  const aIndex = Math.max(2, Math.floor(absPath.length * 0.34));
  const bIndex = Math.min(
    absPath.length - 3,
    Math.max(aIndex + 2, Math.floor(absPath.length * 0.7)),
  );
  if (bIndex <= aIndex || bIndex >= absPath.length - 1) {
    throw new Error(`${def.id}: índices de alçapão/bueiro inválidos`);
  }

  grid[absPath[0].y][absPath[0].x] = 's';
  grid[absPath[aIndex].y][absPath[aIndex].x] = 'A';
  grid[absPath[bIndex].y][absPath[bIndex].x] = 'B';
  grid[absPath[absPath.length - 1].y][absPath[absPath.length - 1].x] = 'E';

  // Nichos decorativos: apenas células adjacentes a UM trecho do caminho,
  // para não criar atalhos entre linhas da serpentina.
  const pathKeys = new Set(absPath.map((p) => `${p.x},${p.y}`));
  const decorChars = ['!', '%', ':', ';', '='];
  let placed = 0;
  for (let i = 2; i < absPath.length - 2 && placed < 4; i += 3) {
    const p = absPath[i];
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const x = p.x + dx;
      const y = p.y + dy;
      if (x < ax || y < ay || x >= ax + aw || y >= ay + ah) continue;
      if (grid[y][x] !== '#') continue;
      const neighbours = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].filter(([nx, ny]) => pathKeys.has(`${x + nx},${y + ny}`)).length;
      if (neighbours !== 1) continue;
      grid[y][x] = decorChars[(seed + placed) % decorChars.length];
      placed++;
      break;
    }
  }

  const dirs: Dir[] = [];
  for (let i = 0; i < absPath.length - 1; i++) {
    const dx = absPath[i + 1].x - absPath[i].x;
    const dy = absPath[i + 1].y - absPath[i].y;
    const dir = MOVES.find((d) => DELTA[d][0] === dx && DELTA[d][1] === dy);
    if (!dir) throw new Error(`${def.id}: caminho do anexo quebrado`);
    dirs.push(dir);
  }

  const approachDef: Approach = {
    x: approach.x + coreX,
    y: approach.y + coreY,
    dir: approach.dir,
  };

  return {
    map: toMap(grid),
    path: absPath,
    dirs,
    aIndex,
    bIndex,
    approach: approachDef,
  };
}

/** Desvio: abre S, teleporta, pega A, tampa B e segue até a nova saída. */
function detour(plan: AnnexPlan, finalDir: Dir): Action[] {
  const { dirs, aIndex, bIndex } = plan;
  const n = dirs.length + 1;
  return [
    'E',
    finalDir,
    ...dirs.slice(0, aIndex),
    'E',
    ...dirs.slice(aIndex, bIndex - 1),
    'E',
    ...dirs.slice(bIndex - 1, n - 1),
  ];
}

function withDetour(core: LevelDef, plan: AnnexPlan, map: string[]): LevelDef {
  const solution = core.solution.map((cycle) => [...cycle]);
  const last = solution[solution.length - 1];
  if (!MOVES.includes(last[last.length - 1] as Dir)) {
    throw new Error(`${core.id}: último token não é movimento`);
  }
  last.pop();
  last.push(...detour(plan, plan.approach.dir));
  return { ...core, map, solution };
}

function moveCount(def: LevelDef): number {
  return def.solution.reduce(
    (n, cycle) => n + cycle.filter((t) => MOVES.includes(t as Dir)).length,
    0,
  );
}

function maxCycleMoves(def: LevelDef): number {
  return Math.max(
    ...def.solution.map((cycle) => cycle.filter((t) => MOVES.includes(t as Dir)).length),
  );
}

function hasFreePath(def: LevelDef): boolean {
  const level = parseLevel(def);
  const blocked = (x: number, y: number) =>
    tileAt(level, x, y) === TILE_WALL ||
    tileAt(level, x, y) === TILE_VOID ||
    level.gates.some((g) => g.x === x && g.y === y) ||
    level.doors.some((d) => d.x === x && d.y === y) ||
    level.codeGates.some((g) => g.x === x && g.y === y) ||
    level.crates.some((c) => c.x === x && c.y === y) ||
    level.ducts.some((d) => d.x === x && d.y === y) ||
    level.drains.some((d) => d.x === x && d.y === y) ||
    level.secrets.some((s) => s.x === x && s.y === y);
  const seen = new Set<string>([`${level.spawn.x},${level.spawn.y}`]);
  const queue = [level.spawn];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.x === level.exit.x && cur.y === level.exit.y) return true;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= level.w || ny >= level.h) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key) || blocked(nx, ny)) continue;
      seen.add(key);
      queue.push({ x: nx, y: ny });
    }
  }
  return false;
}

interface Validation {
  ok: boolean;
  issues: string[];
}

function validate(def: LevelDef): Validation {
  const issues: string[] = [];
  const level = parseLevel(def);
  if (level.w > MAX_W || level.h > MAX_H) issues.push(`tamanho ${level.w}x${level.h}`);
  if (level.w * 16 > 576 || level.h * 16 > 336) issues.push(`não cabe na tela`);

  const rt = createRuntime(level);
  def.solution.forEach((cycle, ci) => {
    const isLast = ci === def.solution.length - 1;
    for (const token of cycle) {
      const res = applyAction(rt, token);
      if (res && !res.moved) issues.push(`ciclo ${ci + 1}: ${token} bloqueado`);
      if (res?.died) issues.push(`ciclo ${ci + 1}: morte`);
      if (res?.captured) issues.push(`ciclo ${ci + 1}: captura`);
      if (res?.cycleEnded && !(isLast && res.won)) issues.push(`ciclo ${ci + 1}: fim prematuro`);
    }
    if (!isLast) {
      if (rt.status !== 'playing') issues.push(`ciclo ${ci + 1}: status ${rt.status}`);
      endCycle(rt, 'tab');
    }
  });
  if (rt.status !== 'won') issues.push(`não venceu (${rt.status})`);
  if (def.solution.length - 1 > def.maxEchoes) issues.push('ciclos acima de maxEchoes');
  if (hasFreePath(def)) issues.push('caminho livre');

  const trace = traceSolution(def, level);
  if (!trace.won) issues.push('trace não venceu');
  if (trace.blocked.length) issues.push(`trace bloqueado: ${trace.blocked[0]}`);
  const unused = unusedMechanics(level, trace.trace);
  if (unused.length) issues.push(`não usada: ${unused.slice(0, 3).join(', ')}`);

  return { ok: issues.length === 0, issues };
}

function mutateCore(def: LevelDef, visited: Set<string>, seed: number, density: number): string[] {
  const level = parseLevel(def);
  const grid = cloneGrid(def.map);
  let rng = seed >>> 0;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  for (let y = 1; y < level.h - 1; y++) {
    for (let x = 1; x < level.w - 1; x++) {
      if (grid[y][x] !== '.') continue;
      if (visited.has(`${x},${y}`)) continue;
      if (rand() < density) grid[y][x] = '#';
    }
  }
  return toMap(grid);
}

function mutateSolved(def: LevelDef, seed: number): { map: string[]; changes: number } {
  const level = parseLevel(def);
  const grid = cloneGrid(def.map);
  let rng = (seed * 2654435761) >>> 0;
  const rand = () => {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  const protectedCells = new Set<string>([
    `${level.spawn.x},${level.spawn.y}`,
    `${level.exit.x},${level.exit.y}`,
  ]);
  for (const s of level.secrets) protectedCells.add(`${s.x},${s.y}`);
  // Não isola a entrada da passagem (célula imediatamente antes de S).
  for (const s of level.secrets) {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      protectedCells.add(`${s.x + dx},${s.y + dy}`);
    }
  }

  let changes = 0;
  const density = 0.1 + ((seed % 5) * 0.035);
  for (let y = 1; y < level.h - 1; y++) {
    for (let x = 1; x < level.w - 1; x++) {
      if (grid[y][x] !== '.') continue;
      const key = `${x},${y}`;
      if (protectedCells.has(key)) continue;
      if (rand() > density) continue;
      // Muta só o miolo original (não mexe nos corredores do anexo).
      if (x > level.w - 1 || y > level.h - 1) continue;
      grid[y][x] = '#';
      changes++;
    }
  }
  return { map: toMap(grid), changes };
}

function solveCandidate(base: LevelDef, seed: number): LevelDef | null {
  const { map, changes } = mutateSolved(base, seed);
  if (changes === 0) return null;
  const level = parseLevel({ ...base, map });
  const stats = { nodes: 0, capped: false };
  const solution = solveSingleCycle({ ...base, map, solution: [] }, 350_000, stats);
  if (!solution) return null;
  const def: LevelDef = {
    ...base,
    map,
    solution: [solution],
    cycleLength: Math.max(base.cycleLength, solution.length + 5),
  };
  const v = validate(def);
  if (!v.ok) return null;
  // Prefere mapas mais diferentes, mas sem soluções absurdamente longas.
  return solution.length > 150 ? null : def;
}

function buildLevel(index: number): LevelDef {
  const core = CORE[index];
  const meta = CURRENT[index];
  const def: LevelDef = {
    id: meta.id,
    name: meta.name,
    subtitle: meta.subtitle,
    cycleLength: core.cycleLength,
    maxEchoes: core.maxEchoes,
    par: { ...core.par },
    map: core.map,
    solution: core.solution.map((cycle) => [...cycle]),
    code: meta.code ? { type: meta.code.type } : undefined,
  };

  const plan = planAnnex(def, meta, index * 97 + 13);
  const base = withDetour(core, plan, plan.map);
  base.cycleLength = Math.max(core.cycleLength, maxCycleMoves(base) + 4);
  base.par = { cycles: base.solution.length, steps: moveCount(base) };

  const baseValidation = validate(base);
  if (!baseValidation.ok) {
    throw new Error(`${base.id}: base inválida: ${baseValidation.issues.join('; ')}`);
  }

  if (core.maxEchoes > 0) {
    // 2–12: preserva a solução com ecos; só fecha células nunca pisadas.
    const visited = visitedCells(core);
    const density = 0.08 + ((index * 13) % 7) * 0.025;
    const map = mutateCore(base, visited, index * 131 + 7, density);
    const mutated: LevelDef = { ...base, map };
    if (!validate(mutated).ok) return base;
    return mutated;
  }

  // 13–30: tenta miolos únicos com solver; cai para a base se nada passar.
  let best: LevelDef | null = null;
  let bestChanges = -1;
  for (let attempt = 0; attempt < 28; attempt++) {
    const seed = index * 1009 + attempt * 37 + 11;
    const candidate = solveCandidate(base, seed);
    if (!candidate) continue;
    let changes = 0;
    for (let y = 0; y < candidate.map.length; y++) {
      for (let x = 0; x < candidate.map[y].length; x++) {
        if (candidate.map[y][x] !== base.map[y][x]) changes++;
      }
    }
    if (changes > bestChanges) {
      best = candidate;
      bestChanges = changes;
    }
  }
  return best ?? base;
}

const levels: LevelDef[] = [];

// Fase 1: mantém o mapa maior atual e apenas aumenta o orçamento.
const first = CURRENT[0];
levels.push({
  ...first,
  cycleLength: 180,
  par: { cycles: 1, steps: 124 },
  solution: first.solution.map((cycle) => [...cycle]),
});

for (let i = 1; i < CORE.length; i++) levels.push(buildLevel(i));

// Verificações finais de unicidade.
const signatures = new Set(levels.map((l) => l.map.join('|')));
if (signatures.size !== levels.length) {
  throw new Error('há mapas repetidos entre as fases');
}

function serialize(def: LevelDef): string {
  const lines: string[] = [];
  lines.push('  {');
  lines.push(`    id: ${JSON.stringify(def.id)},`);
  lines.push(`    name: ${JSON.stringify(def.name)},`);
  lines.push(`    subtitle: ${JSON.stringify(def.subtitle)},`);
  lines.push(`    cycleLength: ${def.cycleLength},`);
  lines.push(`    maxEchoes: ${def.maxEchoes},`);
  lines.push(`    par: { cycles: ${def.par.cycles}, steps: ${def.par.steps} },`);
  lines.push('    map: [');
  for (const row of def.map) lines.push(`      ${JSON.stringify(row)},`);
  lines.push('    ],');
  lines.push('    solution: [');
  for (const cycle of def.solution) {
    lines.push(`      [${cycle.map((t) => JSON.stringify(t)).join(', ')}],`);
  }
  lines.push('    ],');
  if (def.code) lines.push(`    code: { type: ${JSON.stringify(def.code.type)} },`);
  lines.push('  },');
  return lines.join('\n');
}

const header = `import { LevelDef } from './level';

/**
 * Campanha principal (30 fases).
 *
 * Cada fase tem \`solution\`: um array de ações por ciclo. O teste
 * \`tests/game.test.ts\` replaya cada solução e falha se ela não vencer.
 *
 * A partir da fase 2, a saída antiga vira uma passagem secreta (\`S\`). O cofre
 * selado de cada fase é um anexo com desenho próprio, alcançado apenas pelo
 * teleporte da passagem: \`s\` (chegada), \`A\` (alçapão), \`B\` (bueiro) e \`E\`
 * (saída). O alçapão é recolhido com \`E\` e tampa o bueiro antes da fuga.
 *
 * Nas fases com senha (tela \`X\` + portão de código \`@\`) o chão guarda as
 * pistas na ordem de leitura. A senha é sorteada no início da fase por
 * \`parseLevel\` e escrita nessas pistas; por isso a solução usa \`?\`, que
 * pressiona sempre o próximo símbolo correto.
 */
export const LEVELS: LevelDef[] = [
`;

writeFileSync('src/game/levels.ts', `${header}${levels.map(serialize).join('\n')}\n];\n`, 'utf8');

console.log('Fases regeradas:');
for (const [i, def] of levels.entries()) {
  const l = parseLevel(def);
  const v = validate(def);
  console.log(
    `${String(i + 1).padStart(2)} ${def.id.padEnd(24)} ${String(l.w)
      .padStart(2)
      .padStart(2)}x${String(l.h).padStart(2)} cl=${String(def.cycleLength).padStart(3)} ciclos=${def.solution.length} passos=${moveCount(def)} ${v.ok ? 'ok' : `XX ${v.issues.join('; ')}`}`,
  );
}
