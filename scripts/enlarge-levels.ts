/**
 * Alarga e decora as 30 fases da campanha.
 *
 * Estratégia segura: o mapa original é mantido intacto no canto superior
 * esquerdo (mesmas coordenadas, mesma solução). Ao redor dele são anexadas
 * duas grandes câmaras decoradas (uma à direita, uma abaixo), cada uma ligada
 * por UMA porta. Como são becos sem saída, elas não criam atalhos nem tornam
 * nenhuma mecânica opcional — o audit de "caminho livre" continua limpo.
 *
 * Os enfeites usam apenas caracteres de piso (`!` cela, `%` cápsula, `:`
 * console, `;` vinha, `=` estojo), que não colidem nem ativam nada.
 *
 * Uso: npx vite-node scripts/enlarge-levels.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { LEVELS } from '../src/game/levels';
import type { LevelDef } from '../src/game/level';
import type { Action } from '../src/game/types';

// Proteção contra execução dupla: rodar de novo empilharia outra câmara.
const SOURCE = 'src/game/levels.ts';
if (readFileSync(SOURCE, 'utf8').includes('câmaras decoradas anexas')) {
  console.log('levels.ts já foi ampliado; nada a fazer.');
  process.exit(0);
}

const MAX_W = 35; // 35 * 16 = 560 px <= 576 px (640 - HUD)
const MAX_H = 21; // 21 * 16 = 336 px <= 336 px

const WALKABLE = new Set(['.', 'P', 'E', 'C', 'K', 'D', 'R', 'L', 'Y', 'r', 'b', 'y', 'g', '*', 'V', 'W', 'Z', 'H', 'I', 'J', 'O', 'o', 'Q', 'q', 'X', '@', 'c', 'd', 'e', '!', '%', ':', ';', '=']);

/** Hash determinístico para variar os enfeites sem aleatoriedade. */
function hash(x: number, y: number, salt: number): number {
  let n = (x * 374761393 + y * 668265263 + salt * 1442695040) >>> 0;
  n = (n ^ (n >>> 13)) * 1274126177;
  return (n ^ (n >>> 16)) >>> 0;
}

const DECOR = ['!', '!', '%', ':', ';', '='];

function decorFor(x: number, y: number, ring: boolean, salt: number): string {
  const h = hash(x, y, salt);
  if (ring) {
    // Células alienígenas alinhadas junto às paredes; consoles esparsos.
    if (h % 11 === 0) return ':';
    if (h % 13 === 0) return '%';
    return '!';
  }
  const pick = h % 10;
  if (pick <= 2) return '%';
  if (pick === 3) return ':';
  if (pick <= 5) return ';';
  if (pick === 6) return '=';
  if (pick === 7) return '!';
  return '.';
}

interface Door {
  /** Células de parede a escavar (inclui a borda). */
  cells: [number, number][];
  /** Célula de piso já existente onde o túnel termina. */
  end: [number, number];
}

const isWallOrEdge = (map: string[], x: number, y: number): boolean =>
  y < 0 || y >= map.length || x < 0 || x >= map[0].length || map[y][x] === '#';

/**
 * Procura uma porta na borda. Se não houver piso encostado nela, abre um
 * túnel curto (até 4 tiles) por dentro de uma parede contínua. Exige que as
 * laterais do túnel também sejam parede, para não abrir uma segunda ligação.
 */
function findDoorWithTunnel(
  map: string[],
  side: 'right' | 'bottom',
): Door | null {
  const h = map.length;
  const w = map[0].length;

  if (side === 'right') {
    for (let y = h - 2; y >= 1; y--) {
      if (map[y][w - 1] !== '#') continue;
      const cells: [number, number][] = [[w - 1, y]];
      let ok = true;
      for (let x = w - 2; x >= Math.max(1, w - 5); x--) {
        const ch = map[y][x];
        if (WALKABLE.has(ch)) return { cells, end: [x, y] };
        if (ch !== '#' || !isWallOrEdge(map, x, y - 1) || !isWallOrEdge(map, x, y + 1)) {
          ok = false;
          break;
        }
        cells.push([x, y]);
      }
      if (!ok) continue;
    }
  } else {
    for (let x = 1; x <= w - 2; x++) {
      if (map[h - 1][x] !== '#') continue;
      const cells: [number, number][] = [[x, h - 1]];
      let ok = true;
      for (let y = h - 2; y >= Math.max(1, h - 5); y--) {
        const ch = map[y][x];
        if (WALKABLE.has(ch)) return { cells, end: [x, y] };
        if (ch !== '#' || !isWallOrEdge(map, x - 1, y) || !isWallOrEdge(map, x + 1, y)) {
          ok = false;
          break;
        }
        cells.push([x, y]);
      }
      if (!ok) continue;
    }
  }
  return null;
}

function enlarge(def: LevelDef): { map: string[]; w: number; h: number } {
  const w0 = def.map[0].length;
  const h0 = def.map.length;

  const rightDoor = findDoorWithTunnel(def.map, 'right');
  const bottomDoor = findDoorWithTunnel(def.map, 'bottom');

  // Alarga o mapa sempre que houver qualquer câmara (a inferior também pode
  // se estender para a direita, mesmo sem porta na borda direita).
  const W = rightDoor || bottomDoor ? Math.min(MAX_W, Math.max(31, w0 + 8)) : w0;
  const H = bottomDoor ? Math.min(MAX_H, Math.max(15, h0 + 6)) : h0;

  // Grade inicial toda em parede (bordas externas garantidas).
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('#'));

  // Mapa original intacto.
  for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) g[y][x] = def.map[y][x];

  if (rightDoor && h0 >= 6) {
    for (const [x, y] of rightDoor.cells) g[y][x] = '.';

    // -------------------------------------------------------------- câmara direita
    for (let y = 1; y <= h0 - 2; y++) {
      for (let x = w0; x <= W - 2; x++) {
        const ring = y === 1 || y === h0 - 2 || x === w0 || x === W - 2;
        g[y][x] = decorFor(x, y, ring, 7);
      }
    }
    for (let x = w0; x <= Math.min(W - 2, w0 + 1); x++) g[rightDoor.end[1]][x] = '.';

    // Pilares curtos para dar volume (sem desconectar).
    for (let x = w0 + 3; x < W - 2; x += 5) {
      for (let y = 3; y < h0 - 3; y += 4) {
        if (g[y][x] === '#' || g[y][x] === '!') continue;
        g[y][x] = '#';
        if (y + 1 < h0 - 2) g[y + 1][x] = '#';
      }
    }
  }

  if (bottomDoor) {
    for (const [x, y] of bottomDoor.cells) g[y][x] = '.';

    // -------------------------------------------------------------- câmara inferior
    for (let y = h0; y <= H - 2; y++) {
      for (let x = 1; x <= W - 2; x++) {
        const ring = y === h0 || y === H - 2 || x === 1 || x === W - 2;
        g[y][x] = decorFor(x, y, ring, 23);
      }
    }
    for (let y = h0; y <= Math.min(H - 2, h0 + 1); y++) g[y][bottomDoor.end[0]] = '.';

    for (let y = h0 + 3; y < H - 2; y += 4) {
      for (let x = 3; x < W - 2; x += 5) {
        if (g[y][x] === '#') continue;
        g[y][x] = '#';
        if (x + 1 < W - 2) g[y][x + 1] = '#';
      }
    }
  }

  return { map: g.map((r) => r.join('')), w: W, h: H };
}

// ------------------------------------------------------------------ emitir

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const header = `import { LevelDef } from './level';

/**
 * Campanha principal (30 fases).
 *
 * Cada fase tem \`solution\`: um array de ações por ciclo. O teste
 * \`tests/game.test.ts\` replaya cada solução e falha se ela não vencer.
 *
 * Nas fases com senha (tela \`X\` + portão de código \`@\`) o chão guarda as
 * pistas na ordem de leitura (um índice 1, 2, 3… aparece sobre cada pista). A
 * senha é **sorteada no início da fase** por \`parseLevel\` e escrita nessas
 * pistas; por isso a solução usa \`?\`, que pressiona sempre o próximo símbolo
 * correto — o replay funciona qualquer que seja a senha gerada.
 *
 * Os mapas têm câmaras decoradas anexas (células alienígenas, cápsulas,
 * consoles e vinhas). Elas são becos sem saída: deixam a instalação maior e
 * mais densa sem criar atalhos nem tornar mecânicas opcionais.
 */
export const LEVELS: LevelDef[] = [
`;

let out = header;
const report: string[] = [];

for (const def of LEVELS) {
  const { map, w, h } = enlarge(def);
  report.push(`${def.id.padEnd(22)} ${w}x${h}  (${def.map[0].length}x${def.map.length})`);
  out += '  {\n';
  out += `    id: ${q(def.id)},\n`;
  out += `    name: ${q(def.name)},\n`;
  out += `    subtitle: ${q(def.subtitle)},\n`;
  out += `    cycleLength: ${def.cycleLength},\n`;
  out += `    maxEchoes: ${def.maxEchoes},\n`;
  out += `    par: { cycles: ${def.par.cycles}, steps: ${def.par.steps} },\n`;
  out += '    map: [\n';
  out += map.map((row) => `      ${q(row)},`).join('\n') + '\n';
  out += '    ],\n';
  out += '    solution: [\n';
  out += def.solution.map((c) => '      [' + c.map((t: Action) => `'${t}'`).join(', ') + '],').join('\n') + '\n';
  out += '    ],\n';
  if (def.code) {
    out += `    code: { type: '${def.code.type}'`;
    if (def.code.sequence) out += `, sequence: [${def.code.sequence.join(', ')}]`;
    out += ' },\n';
  }
  if (def.crates?.length) {
    out += `    crates: [${def.crates.map((c) => `{ x: ${c.x}, y: ${c.y} }`).join(', ')}],\n`;
  }
  out += '  },\n';
}

out += '];\n\nexport const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);\n';

writeFileSync('src/game/levels.ts', out, 'utf8');
console.log(report.join('\n'));
console.log(`\nlevels.ts regravado: ${LEVELS.length} fases ampliadas.`);
