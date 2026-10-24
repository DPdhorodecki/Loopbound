import { LEVELS } from '../src/game/levels';
import { LevelDef } from '../src/game/level';
import { parseLevel } from '../src/game/level';
import {
  clearCode,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  tryMove,
} from '../src/game/rules';
import { Action, Dir, TILE_VOID, TILE_WALL } from '../src/game/types';

/**
 * Fecha as salas: replaya a solução de cada fase e transforma em parede todo
 * tile de piso que nenhum ciclo pisa (mantendo um halo de 1 tile e todas as
 * células de placas, portões, portas, gemas, chave, caixotes, spawn e saída).
 *
 * Uso: npx vite-node scripts/tighten.ts
 * O resultado é impresso como um bloco pronto para colar em src/game/levels.ts.
 */
function tighten(def: LevelDef, halo = 1): string[] {
  const level = parseLevel(def);
  const keep = new Set<string>();
  const add = (x: number, y: number) => keep.add(`${x},${y}`);

  add(level.spawn.x, level.spawn.y);
  add(level.exit.x, level.exit.y);
  level.gems.forEach((g) => add(g.x, g.y));
  level.plates.forEach((p) => add(p.x, p.y));
  level.gates.forEach((g) => add(g.x, g.y));
  level.doors.forEach((d) => add(d.x, d.y));
  level.anchors.forEach((a) => add(a.x, a.y));
  if (level.key) add(level.key.x, level.key.y);
  level.crates.forEach((c) => add(c.x, c.y));

  const rt = createRuntime(level);
  const apply = (token: Action) => {
    if (token === 'E') interact(rt);
    else if (token === 'C') confirmCode(rt);
    else if (token === 'X') clearCode(rt);
    else if (token >= '1' && token <= '9') pressCode(rt, Number(token) - 1);
    else tryMove(rt, token as Dir);
  };
  const visit = () => {
    add(rt.player.x, rt.player.y);
    rt.crates.forEach((c) => add(c.x, c.y));
    rt.level.levers.forEach((l) => add(l.x, l.y));
    rt.level.buttons.forEach((b) => add(b.x, b.y));
    rt.level.ducts.forEach((d) => {
      if (!rt.crates.some((c) => c.x === d.x && c.y === d.y)) add(d.x, d.y);
    });
    if (rt.level.terminal) add(rt.level.terminal.x, rt.level.terminal.y);
    rt.level.clueTiles.forEach((c) => add(c.x, c.y));
  };
  def.solution.forEach((moves, index) => {
    moves.forEach((token) => {
      apply(token);
      visit();
    });
    if (index < def.solution.length - 1) endCycle(rt, 'tab');
  });

  const open = new Set(keep);
  for (let n = 0; n < halo; n++) {
    for (const key of [...open]) {
      const [x, y] = key.split(',').map(Number);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        open.add(`${x + dx},${y + dy}`);
      }
    }
  }

  const rows: string[] = [];
  for (let y = 0; y < level.h; y++) {
    let row = '';
    for (let x = 0; x < level.w; x++) {
      const ch = def.map[y][x];
      const tile = level.tiles[y * level.w + x];
      if (tile === TILE_VOID) row += '~';
      else if (tile === TILE_WALL) row += '#';
      else row += open.has(`${x},${y}`) ? ch : '#';
    }
    rows.push(row);
  }
  return rows;
}

for (const def of LEVELS) {
  const map = tighten(def);
  console.log(`    id: '${def.id}',`);
  console.log('    map: [');
  for (const row of map) console.log(`      '${row}',`);
  console.log('    ],');
  console.log('');
}
