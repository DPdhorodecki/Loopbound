import p5 from 'p5';
import { KENNEDITO_FRAMES, KEN_H, KEN_W, KenFrame } from './kennedito';

export interface Atlas {
  ken: Record<KenFrame, p5.Image>;
  echo: Record<KenFrame, p5.Image>;
}

const FRAMES: KenFrame[] = ['idle0', 'idle1', 'walk0', 'walk1', 'push', 'fall', 'cheer'];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const COLOR_CACHE = new Map<string, [number, number, number]>();
const rgb = (hex: string): [number, number, number] => {
  let c = COLOR_CACHE.get(hex);
  if (!c) {
    c = hexToRgb(hex);
    COLOR_CACHE.set(hex, c);
  }
  return c;
};

function bake(
  p: p5,
  rows: string[],
  colors: Record<string, string>,
  override?: { color: string; alpha: number },
): p5.Image {
  const w = KEN_W;
  const h = KEN_H;
  const img = p.createImage(w, h);
  img.loadPixels();
  const solid = override ? rgb(override.color) : null;
  for (let y = 0; y < h; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      const i = (y * w + x) * 4;
      if (!ch || ch === '.') {
        img.pixels[i + 3] = 0;
        continue;
      }
      const c = solid ?? rgb(colors[ch] ?? '#FF00FF');
      img.pixels[i] = c[0];
      img.pixels[i + 1] = c[1];
      img.pixels[i + 2] = c[2];
      img.pixels[i + 3] = override ? override.alpha : 255;
    }
  }
  img.updatePixels();
  return img;
}

export function buildAtlas(p: p5, colors: Record<string, string>): Atlas {
  const ken = {} as Record<KenFrame, p5.Image>;
  const echo = {} as Record<KenFrame, p5.Image>;
  for (const frame of FRAMES) {
    ken[frame] = bake(p, KENNEDITO_FRAMES[frame], colors);
    echo[frame] = bake(p, KENNEDITO_FRAMES[frame], colors, { color: '#57D8E6', alpha: 130 });
  }
  return { ken, echo };
}

export const SPRITE_W = KEN_W;
export const SPRITE_H = KEN_H;
