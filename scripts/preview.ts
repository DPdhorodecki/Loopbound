import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { KENNEDITO_FRAMES, KEN_W, KEN_H } from '../src/render/kennedito';
import { CHAR_COLORS } from '../src/render/palette';

const SCALE = 10;
const PAD = 1;
const frames = Object.entries(KENNEDITO_FRAMES);
const cols = frames.length;

const cellW = (KEN_W + PAD) * SCALE;
const cellH = (KEN_H + PAD) * SCALE;
const png = new PNG({ width: cellW * cols, height: cellH });

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const put = (x: number, y: number, rgb: number[], a = 255) => {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (png.width * y + x) << 2;
  png.data[i] = rgb[0];
  png.data[i + 1] = rgb[1];
  png.data[i + 2] = rgb[2];
  png.data[i + 3] = a;
};

frames.forEach(([, rows], n) => {
  for (let y = 0; y < KEN_H; y++) {
    for (let x = 0; x < KEN_W; x++) {
      const ch = rows[y]?.[x] ?? '.';
      const col = ch === '.' ? null : CHAR_COLORS[ch];
      for (let sy = 0; sy < SCALE; sy++) {
        for (let sx = 0; sx < SCALE; sx++) {
          const px = n * cellW + x * SCALE + sx;
          const py = y * SCALE + sy;
          if (col) put(px, py, hex(col));
          else {
            const checker = ((x + y) % 2) * 12;
            put(px, py, [18 + checker, 24 + checker, 36 + checker]);
          }
        }
      }
    }
  }
});

mkdirSync('/tmp/opencode/preview', { recursive: true });
writeFileSync('/tmp/opencode/preview/kennedito.png', PNG.sync.write(png));

// zoom do idle em 24x
const Z = 24;
const hero = new PNG({ width: KEN_W * Z, height: KEN_H * Z });
const rows = KENNEDITO_FRAMES.idle0;
for (let y = 0; y < KEN_H; y++) {
  for (let x = 0; x < KEN_W; x++) {
    const ch = rows[y]?.[x] ?? '.';
    const col = ch === '.' ? null : CHAR_COLORS[ch];
    for (let sy = 0; sy < Z; sy++) {
      for (let sx = 0; sx < Z; sx++) {
        const i = (hero.width * (y * Z + sy) + (x * Z + sx)) << 2;
        const c = col ? hex(col) : [16, 22, 34];
        hero.data[i] = c[0];
        hero.data[i + 1] = c[1];
        hero.data[i + 2] = c[2];
        hero.data[i + 3] = 255;
      }
    }
  }
}
writeFileSync('/tmp/opencode/preview/kennedito-idle.png', PNG.sync.write(hero));
console.log('frames:', frames.map(([k]) => k).join(', '));
