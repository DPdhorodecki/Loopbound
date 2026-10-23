/**
 * Kennedito, o batedor — desenhado por código em uma grade de 16×24.
 * Formas primitivas + contorno automático mantêm o sprite consistente
 * entre os quadros de animação.
 */

export const KEN_W = 16;
export const KEN_H = 24;

type Cell = string | null;
type Grid = Cell[];

export type KenFrame = 'idle0' | 'idle1' | 'walk0' | 'walk1' | 'push' | 'fall' | 'cheer';

const idx = (x: number, y: number) => y * KEN_W + x;

function set(g: Grid, x: number, y: number, ch: string): void {
  if (x < 0 || y < 0 || x >= KEN_W || y >= KEN_H) return;
  g[idx(x, y)] = ch;
}

function rect(g: Grid, x: number, y: number, w: number, h: number, ch: string): void {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(g, xx, yy, ch);
}

function ellipse(g: Grid, cx: number, cy: number, rx: number, ry: number, ch: string): void {
  const x0 = Math.floor(cx - rx);
  const x1 = Math.ceil(cx + rx);
  const y0 = Math.floor(cy - ry);
  const y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) set(g, x, y, ch);
    }
  }
}

function tri(g: Grid, ax: number, ay: number, bx: number, by: number, cx: number, cy: number, ch: string): void {
  const minX = Math.floor(Math.min(ax, bx, cx));
  const maxX = Math.ceil(Math.max(ax, bx, cx));
  const minY = Math.floor(Math.min(ay, by, cy));
  const maxY = Math.ceil(Math.max(ay, by, cy));
  const sign = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) =>
    (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const d1 = sign(px, py, ax, ay, bx, by);
      const d2 = sign(px, py, bx, by, cx, cy);
      const d3 = sign(px, py, cx, cy, ax, ay);
      const neg = d1 < 0 || d2 < 0 || d3 < 0;
      const pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) set(g, x, y, ch);
    }
  }
}

function outline(g: Grid): void {
  const filled = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= KEN_W || y >= KEN_H) return false;
    return g[idx(x, y)] !== null;
  };
  const marks: number[] = [];
  for (let y = 0; y < KEN_H; y++) {
    for (let x = 0; x < KEN_W; x++) {
      if (g[idx(x, y)] !== null) continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) {
        marks.push(idx(x, y));
      }
    }
  }
  for (const m of marks) g[m] = 'o';
}

interface Pose {
  bob?: number;
  legPhase?: number;
  capeSway?: number;
  arm?: 'down' | 'up' | 'push';
  squash?: boolean;
}

function paint({ bob = 0, legPhase = 0, capeSway = 0, arm = 'down', squash = false }: Pose): string[] {
  const g: Grid = new Array(KEN_W * KEN_H).fill(null);
  const b = bob;

  // Capa (atrás de tudo)
  ellipse(g, 8 + capeSway * 0.7, 16 + b, 6.2, 6, 'P');
  rect(g, 2 + capeSway, 12 + b, 2, 8, 'P');
  rect(g, 12 + capeSway, 12 + b, 2, 8, 'P');
  rect(g, 3 + capeSway, 19 + b, 3, 2, 'Q');
  rect(g, 10 + capeSway, 19 + b, 3, 2, 'Q');

  // Pernas + botas
  const lx = 4 - legPhase;
  const rx = 9 + legPhase;
  rect(g, lx + 1, 17 + b, 2, 4, 'd');
  rect(g, rx, 17 + b, 2, 4, 'd');
  rect(g, lx, 21 + b, 3, 2, 'B');
  rect(g, rx, 21 + b, 3, 2, 'B');
  rect(g, lx, 22 + b, 3, 1, 'L');
  rect(g, rx, 22 + b, 3, 1, 'L');

  // Torso de couro
  rect(g, 4, 11 + b, 8, 6, 'l');
  rect(g, 4, 11 + b, 8, 1, 'L');
  rect(g, 5, 12 + b, 3, 4, 'L');
  rect(g, 9, 12 + b, 2, 4, 'l');
  rect(g, 5, 13 + b, 1, 1, 'b');
  // Cinto
  rect(g, 4, 16 + b, 8, 1, 'L');
  rect(g, 7, 16 + b, 2, 1, 'b');
  // Gola
  rect(g, 5, 10 + b, 6, 1, 'L');

  // Braço esquerdo
  if (arm === 'push') {
    rect(g, 2, 12 + b, 3, 2, 'l');
    rect(g, 1, 13 + b, 2, 1, 'f');
  } else if (arm === 'up') {
    rect(g, 10, 8 + b, 2, 4, 'l');
    rect(g, 10, 7 + b, 2, 1, 'f');
  } else {
    rect(g, 3, 12 + b, 2, 4, 'l');
    rect(g, 3, 15 + b, 2, 2, 'f');
  }

  // Orelhas (atrás da cabeça)
  tri(g, 1, 2 + b, 5, 3 + b, 4, 8 + b, 'f');
  tri(g, 15, 2 + b, 11, 3 + b, 12, 8 + b, 'f');
  tri(g, 2, 3 + b, 4, 4 + b, 4, 7 + b, 'd');
  tri(g, 14, 3 + b, 12, 4 + b, 12, 7 + b, 'd');

  // Cabeça
  ellipse(g, 8, 7 + b, 5.2, 4.2, 'f');
  ellipse(g, 6.4, 8.2 + b, 2.2, 1.8, 'F');

  // Focinho
  ellipse(g, 9.6, 9.2 + b, 2.8, 1.6, 'm');
  rect(g, 11, 8 + b, 1, 1, 'k');
  rect(g, 10, 10 + b, 2, 1, 'k');

  // Olhos
  rect(g, 5, 6 + b, 2, 2, 'e');
  rect(g, 9, 6 + b, 2, 2, 'e');
  rect(g, 6, 7 + b, 1, 1, 'k');
  rect(g, 10, 7 + b, 1, 1, 'k');
  rect(g, 5, 5 + b, 2, 1, 'd');
  rect(g, 9, 5 + b, 2, 1, 'd');

  // Boné
  ellipse(g, 8, 3 + b, 5.4, 2.5, 'c');
  rect(g, 3, 1 + b, 4, 1, 'C');
  rect(g, 8, 4 + b, 7, 1, 'K');
  rect(g, 4, 2 + b, 3, 2, 'p');
  rect(g, 5, 2 + b, 1, 1, 'K');

  // Estrela na mão direita (brilho de quatro pontas, com contorno)
  const sx = 10;
  const sy = (arm === "up" ? 5 : 10) + b;
  const star = (ch: string, dx = 0, dy = 0) => {
    rect(g, sx + 2 + dx, sy + dy, 1, 1, ch);
    rect(g, sx + dx, sy + 1 + dy, 5, 1, ch);
    rect(g, sx + 1 + dx, sy + 2 + dy, 3, 1, ch);
    rect(g, sx + dx, sy + 3 + dy, 5, 1, ch);
    rect(g, sx + 2 + dx, sy + 4 + dy, 1, 1, ch);
  };
  star('o', -1, 0);
  star('o', 1, 0);
  star('o', 0, -1);
  star('o', 0, 1);
  star('s');
  rect(g, sx + 2, sy + 2, 1, 1, 'S');

  if (squash) {
    for (let x = 0; x < KEN_W; x++) {
      const a = g[idx(x, 22)];
      g[idx(x, 22)] = g[idx(x, 21)];
      g[idx(x, 21)] = a;
    }
  }

  outline(g);

  const rows: string[] = [];
  for (let y = 0; y < KEN_H; y++) {
    let row = '';
    for (let x = 0; x < KEN_W; x++) row += g[idx(x, y)] ?? '.';
    rows.push(row);
  }
  return rows;
}

export const KENNEDITO_FRAMES: Record<KenFrame, string[]> = {
  idle0: paint({}),
  idle1: paint({ bob: 1 }),
  walk0: paint({ legPhase: 1, capeSway: -1 }),
  walk1: paint({ legPhase: -1, capeSway: 1 }),
  push: paint({ arm: 'push', legPhase: 1 }),
  fall: paint({ arm: 'up', squash: true }),
  cheer: paint({ arm: 'up' }),
};
