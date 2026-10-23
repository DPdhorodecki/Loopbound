import p5 from 'p5';

/** Fonte bitmap 3×5 desenhada em código, com acentos compostos. */
const GLYPHS: Record<string, string[]> = {
  A: ['###', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '###'],
  C: ['###', '#..', '#..', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['###', '#..', '#.#', '#.#', '###'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['#.#', '##.', '#.#', '#.#', '#.#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
  Q: ['###', '#.#', '#.#', '###', '..#'],
  R: ['###', '#.#', '##.', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '###', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '..#', '..#', '..#'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  '.': ['...', '...', '...', '...', '.#.'],
  ',': ['...', '...', '...', '.#.', '#..'],
  ':': ['...', '.#.', '...', '.#.', '...'],
  ';': ['...', '.#.', '...', '.#.', '#..'],
  '-': ['...', '...', '###', '...', '...'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '?': ['###', '..#', '.##', '...', '.#.'],
  "'": ['.#.', '.#.', '...', '...', '...'],
  '(': ['..#', '.#.', '.#.', '.#.', '..#'],
  ')': ['#..', '.#.', '.#.', '.#.', '#..'],
  '[': ['##.', '#..', '#..', '#..', '##.'],
  ']': ['.##', '..#', '..#', '..#', '.##'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '=': ['...', '###', '...', '###', '...'],
  '*': ['...', '#.#', '.#.', '#.#', '...'],
};

type Mark = 'acute' | 'grave' | 'circ' | 'tilde' | 'cedil';

const ACCENTS: Record<string, [string, Mark]> = {
  Á: ['A', 'acute'],
  À: ['A', 'grave'],
  Â: ['A', 'circ'],
  Ã: ['A', 'tilde'],
  É: ['E', 'acute'],
  Ê: ['E', 'circ'],
  Í: ['I', 'acute'],
  Ó: ['O', 'acute'],
  Ô: ['O', 'circ'],
  Õ: ['O', 'tilde'],
  Ú: ['U', 'acute'],
  Ç: ['C', 'cedil'],
};

export const CHAR_W = 3;
export const CHAR_H = 5;
export const CHAR_GAP = 1;

export function textWidth(text: string, scale = 1): number {
  return text.length * (CHAR_W + CHAR_GAP) * scale - CHAR_GAP * scale;
}

function drawGlyph(p: p5, glyph: string[], x: number, y: number, s: number, color: string): void {
  p.fill(color);
  p.noStroke();
  for (let gy = 0; gy < glyph.length; gy++) {
    const row = glyph[gy];
    for (let gx = 0; gx < row.length; gx++) {
      if (row[gx] === '#') p.rect(x + gx * s, y + gy * s, s, s);
    }
  }
}

export function drawText(
  p: p5,
  text: string,
  x: number,
  y: number,
  scale: number,
  color: string,
  align: 'left' | 'center' | 'right' = 'left',
  shadow?: string,
): void {
  const s = Math.max(1, Math.round(scale));
  const width = textWidth(text, s);
  let cursor = x;
  if (align === 'center') cursor = Math.round(x - width / 2);
  else if (align === 'right') cursor = Math.round(x - width);

  if (shadow) {
    drawText(p, text, cursor + s, y + s, s, shadow, 'left');
  }

  for (const raw of text) {
    const ch = raw.toUpperCase();
    let glyph = GLYPHS[ch];
    let mark: Mark | null = null;
    if (!glyph && ACCENTS[ch]) {
      const [base, m] = ACCENTS[ch];
      glyph = GLYPHS[base];
      mark = m;
    }
    if (!glyph) {
      cursor += (CHAR_W + CHAR_GAP) * s;
      continue;
    }
    drawGlyph(p, glyph, cursor, y, s, color);
    if (mark) {
      p.fill(color);
      if (mark === 'acute') p.rect(cursor + 2 * s, y - 2 * s, s, s);
      else if (mark === 'grave') p.rect(cursor, y - 2 * s, s, s);
      else if (mark === 'circ') {
        p.rect(cursor + s, y - 2 * s, s, s);
        p.rect(cursor, y - s, s, s);
        p.rect(cursor + 2 * s, y - s, s, s);
      } else if (mark === 'tilde') {
        p.rect(cursor, y - s, s, s);
        p.rect(cursor + s, y - 2 * s, s, s);
        p.rect(cursor + 2 * s, y - s, s, s);
      } else if (mark === 'cedil') {
        p.rect(cursor + s, y + CHAR_H * s, s, s);
        p.rect(cursor, y + CHAR_H * s + s, s, s);
      }
    }
    cursor += (CHAR_W + CHAR_GAP) * s;
  }
}
