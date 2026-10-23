import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { KENNEDITO_FRAMES } from '../src/render/kennedito';
import { CHAR_COLORS } from '../src/render/palette';

const OUT = 'public/icons';
mkdirSync(OUT, { recursive: true });

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const CEPK: Record<string, string[]> = {
  C: ['###', '#..', '#..', '#..', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
};

function icon(size: number, spriteScale: number, maskable = false, badge = true): PNG {
  const png = new PNG({ width: size, height: size });
  const bg = hex('#0B1220');
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      const dx = (x - size / 2) / (size / 2);
      const dy = (y - size / 2) / (size / 2);
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      const glow = Math.max(0, 1 - d) * (maskable ? 14 : 20);
      png.data[i] = bg[0] + glow * 0.2;
      png.data[i + 1] = bg[1] + glow * 1.4;
      png.data[i + 2] = bg[2] + glow * 1.6;
      png.data[i + 3] = 255;
    }
  }

  const cyan = hex('#35E6F2');
  const inset = Math.round(size * 0.055);
  const thick = Math.max(2, Math.round(size * 0.012));
  const put = (x: number, y: number, c: number[]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (size * y + x) << 2;
    png.data[i] = c[0];
    png.data[i + 1] = c[1];
    png.data[i + 2] = c[2];
    png.data[i + 3] = 255;
  };
  for (let t = 0; t < thick; t++) {
    for (let x = inset; x < size - inset; x++) {
      put(x, inset + t, cyan);
      put(x, size - 1 - inset - t, cyan);
    }
    for (let y = inset; y < size - inset; y++) {
      put(inset + t, y, cyan);
      put(size - 1 - inset - t, y, cyan);
    }
  }
  const rows = KENNEDITO_FRAMES.idle0;
  const sw = 16 * spriteScale;
  const sh = 24 * spriteScale;

  // placa CEPK
  const bs = Math.max(1, Math.round(size / 80));
  const textW = 4 * (3 + 1) * bs - bs;
  const textH = 5 * bs;
  const plateW = textW + 4 * bs;
  const plateH = textH + 3 * bs;
  const gap = badge ? Math.round(size * 0.025) : 0;
  const badgeH = badge ? plateH : 0;

  const y0 = Math.round((size - sh - badgeH - gap) / 2);
  const x0 = Math.round((size - sw) / 2);

  for (let y = 0; y < 24; y++) {
    for (let x = 0; x < 16; x++) {
      const ch = rows[y]?.[x] ?? '.';
      if (ch === '.') continue;
      const col = hex(CHAR_COLORS[ch] ?? '#FF00FF');
      for (let sy = 0; sy < spriteScale; sy++) {
        for (let sx = 0; sx < spriteScale; sx++) {
          put(x0 + x * spriteScale + sx, y0 + y * spriteScale + sy, col);
        }
      }
    }
  }

  if (badge) {
    const gold = hex('#F0C24B');
    const dark = hex('#0B1220');
    const px = Math.round((size - plateW) / 2);
    const py = y0 + sh + gap;
    for (let y = 0; y < plateH; y++) {
      for (let x = 0; x < plateW; x++) put(px + x, py + y, gold);
    }
    for (let y = bs; y < plateH - bs; y++) {
      for (let x = bs; x < plateW - bs; x++) put(px + x, py + y, dark);
    }
    const tx = Math.round((size - textW) / 2);
    const ty = py + Math.round((plateH - textH) / 2);
    let cursor = tx;
    for (const ch of 'CEPK') {
      const glyph = CEPK[ch];
      for (let gy = 0; gy < 5; gy++) {
        for (let gx = 0; gx < 3; gx++) {
          if (glyph[gy][gx] !== '#') continue;
          for (let sy = 0; sy < bs; sy++) {
            for (let sx = 0; sx < bs; sx++) put(cursor + gx * bs + sx, ty + gy * bs + sy, gold);
          }
        }
      }
      cursor += 4 * bs;
    }
  }

  return png;
}

const targets: [string, number, number, boolean, boolean][] = [
  ['icon-32.png', 32, 1, false, false],
  ['apple-touch-icon.png', 180, 4, false, true],
  ['icon-192.png', 192, 4, false, true],
  ['icon-512.png', 512, 12, false, true],
  ['maskable-512.png', 512, 11, true, true],
];

for (const [name, size, scale, maskable, badge] of targets) {
  writeFileSync(`${OUT}/${name}`, PNG.sync.write(icon(size, scale, maskable, badge)));
  console.log(`${name} ${size}x${size}`);
}
