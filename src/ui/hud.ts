import p5 from 'p5';
import { Runtime, pressure } from '../game/rules';
import { PALETTE } from '../render/palette';
import { drawText } from '../render/font';

export const VIEW_W = 640;
export const VIEW_H = 360;

export const HUD_TAB = { x: 10, y: 10, w: 44, h: 44 };
export const HUD_HINT = { x: 58, y: 10, w: 44, h: 44 };
export const HUD_ESC = { x: 10, y: VIEW_H - 54, w: 44, h: 44 };
export const HUD_UNDO = { x: 10, y: VIEW_H - 106, w: 44, h: 44 };
export const HUD_E = { x: 10, y: VIEW_H - 158, w: 44, h: 44 };
export const HUD_HATCH = { x: 58, y: VIEW_H - 158, w: 44, h: 44 };
export const HUD_FULLSCREEN = { x: VIEW_W - 54, y: 10, w: 44, h: 44 };

export function drawFrame(p: p5, x: number, y: number, w: number, h: number, active = false): void {
  p.noStroke();
  p.fill(8, 15, 24, 220);
  p.rect(x, y, w, h);
  p.fill(53, 230, 242, active ? 34 : 18);
  p.rect(x + 2, y + 2, w - 4, h - 4);
  p.fill(active ? PALETTE.cyan : PALETTE.cyanDim);
  p.rect(x, y, w, 2);
  p.rect(x, y + h - 2, w, 2);
  p.rect(x, y, 2, h);
  p.rect(x + w - 2, y, 2, h);
  // colchetes
  p.fill(PALETTE.cyan);
  const b = 8;
  p.rect(x - 3, y - 3, b, 2);
  p.rect(x - 3, y - 3, 2, b);
  p.rect(x + w - b + 3, y - 3, b, 2);
  p.rect(x + w + 1, y - 3, 2, b);
  p.rect(x - 3, y + h + 1, b, 2);
  p.rect(x - 3, y + h - b + 3, 2, b);
  p.rect(x + w - b + 3, y + h + 1, b, 2);
  p.rect(x + w + 1, y + h - b + 3, 2, b);
}

const LOOP_DOTS: [number, number][] = [
  [0, 4], [1, 3], [1, 2], [2, 1], [3, 0], [4, 0],
  [8, 4], [7, 3], [7, 2], [6, 1], [5, 0],
  [0, 4], [1, 5], [1, 6], [2, 7], [3, 8], [4, 8],
  [5, 8], [6, 7], [7, 6], [8, 5],
];

function drawLoopGlyph(p: p5, x: number, y: number, s: number, color: string): void {
  p.noStroke();
  p.fill(color);
  for (const [gx, gy] of LOOP_DOTS) p.rect(x + gx * s, y + gy * s, s, s);
  // seta
  p.rect(x + 9 * s, y + 2 * s, s, s);
  p.rect(x + 8 * s, y + 3 * s, s, s);
  p.rect(x + 7 * s, y + 4 * s, s, s);
  p.rect(x + 9 * s, y + 4 * s, s, s);
}

function drawMenuGlyph(p: p5, x: number, y: number, s: number, color: string): void {
  p.noStroke();
  p.fill(color);
  for (let row = 0; row < 3; row++) {
    const ry = y + row * 4 * s;
    p.rect(x, ry + s, s, s);
    p.rect(x + 2 * s, ry, 7 * s, s);
    p.rect(x + 2 * s, ry + s, 7 * s, s);
  }
}

function drawUndoGlyph(p: p5, x: number, y: number, s: number, color: string): void {
  p.noStroke();
  p.fill(color);
  // ponta da seta
  p.rect(x, y + 3 * s, s, s);
  p.rect(x + s, y + 2 * s, s, s);
  p.rect(x + s, y + 4 * s, s, s);
  p.rect(x + 2 * s, y + s, s, s);
  p.rect(x + 2 * s, y + 5 * s, s, s);
  p.rect(x + 3 * s, y, s, s);
  p.rect(x + 3 * s, y + 6 * s, s, s);
  // haste
  p.rect(x + 3 * s, y + 3 * s, 5 * s, s);
}

/** Cantos de "expandir" do botão de tela cheia. */
function drawFullscreenGlyph(p: p5, x: number, y: number, s: number, color: string): void {
  p.noStroke();
  p.fill(color);
  const L = 5 * s;
  const T = s;
  // quatro cantos
  p.rect(x, y, L, T);
  p.rect(x, y, T, L);
  p.rect(x + 9 * s - L + T, y, L, T);
  p.rect(x + 9 * s - T, y, T, L);
  p.rect(x, y + 9 * s - T, L, T);
  p.rect(x, y + 9 * s - L + T, T, L);
  p.rect(x + 9 * s - L + T, y + 9 * s - T, L, T);
  p.rect(x + 9 * s - T, y + 9 * s - L + T, T, L);
}

/** Tampa/alçapão do HUD: mostra se o item está no inventário. */
function drawHatchGlyph(p: p5, x: number, y: number, s: number, color: string, filled: boolean): void {
  p.noStroke();
  p.fill(color);
  p.rect(x, y + s, 9 * s, s);
  p.rect(x + s, y + 2 * s, 7 * s, s);
  if (filled) {
    p.rect(x + s, y + 3 * s, 7 * s, 3 * s);
    p.fill('#0A0F16');
    p.rect(x + 4 * s, y + 4 * s, s, 2 * s);
  } else {
    p.rect(x + s, y + 3 * s, 7 * s, s);
  }
}

function drawGemIcon(p: p5, x: number, y: number, scale = 1): void {
  p.noStroke();
  p.fill(PALETTE.emeraldDark);
  p.rect(x + scale, y, 3 * scale, scale);
  p.rect(x, y + scale, 5 * scale, 3 * scale);
  p.rect(x + scale, y + 4 * scale, 3 * scale, scale);
  p.fill(PALETTE.emerald);
  p.rect(x + scale, y + scale, 3 * scale, 2 * scale);
  p.fill('#A8F5CB');
  p.rect(x + scale, y + scale, scale, scale);
}

function drawEchoPip(p: p5, x: number, y: number, on: boolean, s = 1): void {
  p.noStroke();
  p.fill(on ? PALETTE.cyan : PALETTE.cyanDim);
  p.rect(x, y - 3 * s, 3 * s, 3 * s);
  p.rect(x - 3 * s, y, 9 * s, 3 * s);
  p.rect(x, y + 3 * s, 3 * s, 3 * s);
}

export function drawHud(
  p: p5,
  rt: Runtime,
  t: number,
  muted: boolean,
  opts: { hintStage?: number; sector?: string } = {},
): void {
  const pressed = pressure(rt);

  // TAB
  drawFrame(p, HUD_TAB.x, HUD_TAB.y, HUD_TAB.w, HUD_TAB.h, rt.beat > 0);
  drawLoopGlyph(p, HUD_TAB.x + 9, HUD_TAB.y + 5, 3, rt.beat > 0 ? PALETTE.cyan : PALETTE.cyanDim);
  drawText(p, 'TAB', HUD_TAB.x + HUD_TAB.w / 2, HUD_TAB.y + HUD_TAB.h - 9, 1, PALETTE.cyan, 'center');

  // Dica (General Marcinho)
  const hintStage = opts.hintStage ?? 0;
  drawFrame(p, HUD_HINT.x, HUD_HINT.y, HUD_HINT.w, HUD_HINT.h, hintStage > 0);
  drawText(p, '?', HUD_HINT.x + HUD_HINT.w / 2, HUD_HINT.y + 10, 3, hintStage > 0 ? PALETTE.gold : PALETTE.cyanDim, 'center');
  drawText(p, 'H', HUD_HINT.x + HUD_HINT.w / 2, HUD_HINT.y + HUD_HINT.h - 9, 1, PALETTE.cyan, 'center');

  // Setor atual
  if (opts.sector) {
    drawText(p, opts.sector, VIEW_W / 2, 12, 1, '#8FB3A6', 'center');
  }

  // Desfazer
  drawFrame(p, HUD_UNDO.x, HUD_UNDO.y, HUD_UNDO.w, HUD_UNDO.h, rt.beat > 0);
  drawUndoGlyph(p, HUD_UNDO.x + 10, HUD_UNDO.y + 8, 3, rt.beat > 0 ? PALETTE.cyan : PALETTE.cyanDim);
  drawText(p, 'Z', HUD_UNDO.x + HUD_UNDO.w / 2, HUD_UNDO.y + HUD_UNDO.h - 9, 1, rt.beat > 0 ? PALETTE.cyan : PALETTE.cyanDim, 'center');

  // ESC
  drawFrame(p, HUD_ESC.x, HUD_ESC.y, HUD_ESC.w, HUD_ESC.h, false);
  drawMenuGlyph(p, HUD_ESC.x + 9, HUD_ESC.y + 9, 2, PALETTE.cyanDim);
  drawText(p, 'ESC', HUD_ESC.x + HUD_ESC.w / 2, HUD_ESC.y + HUD_ESC.h - 9, 1, PALETTE.cyanDim, 'center');

  // Interagir (só nas fases com alavanca, botão, tela, alçapão ou passagem)
  const interactive =
    rt.level.levers.length > 0 ||
    rt.level.buttons.length > 0 ||
    rt.level.terminal !== null ||
    rt.level.hatch !== null ||
    rt.level.secrets.length > 0 ||
    rt.level.drains.length > 0;
  if (interactive) {
    drawFrame(p, HUD_E.x, HUD_E.y, HUD_E.w, HUD_E.h, false);
    drawText(p, 'E', HUD_E.x + HUD_E.w / 2, HUD_E.y + 12, 3, PALETTE.cyan, 'center');
    drawText(p, 'USA', HUD_E.x + HUD_E.w / 2, HUD_E.y + HUD_E.h - 9, 1, PALETTE.cyanDim, 'center');
  }

  // Alçapão (só nas fases com bueiro)
  if (rt.level.drains.length > 0) {
    const ready = rt.hasHatch;
    drawFrame(p, HUD_HATCH.x, HUD_HATCH.y, HUD_HATCH.w, HUD_HATCH.h, ready);
    drawHatchGlyph(
      p,
      HUD_HATCH.x + 13,
      HUD_HATCH.y + 9,
      2,
      ready ? PALETTE.gold : PALETTE.cyanDim,
      ready,
    );
    drawText(
      p,
      ready ? 'TAMPA' : 'VAZIO',
      HUD_HATCH.x + HUD_HATCH.w / 2,
      HUD_HATCH.y + HUD_HATCH.h - 9,
      1,
      ready ? PALETTE.gold : PALETTE.cyanDim,
      'center',
    );
  }

  // Tela cheia (topo direito)
  drawFrame(p, HUD_FULLSCREEN.x, HUD_FULLSCREEN.y, HUD_FULLSCREEN.w, HUD_FULLSCREEN.h, false);
  drawFullscreenGlyph(
    p,
    HUD_FULLSCREEN.x + 13,
    HUD_FULLSCREEN.y + 10,
    2,
    PALETTE.cyan,
  );
  drawText(
    p,
    'TELA',
    HUD_FULLSCREEN.x + HUD_FULLSCREEN.w / 2,
    HUD_FULLSCREEN.y + HUD_FULLSCREEN.h - 9,
    1,
    PALETTE.cyanDim,
    'center',
  );

  // Gemas (à esquerda do botão de tela cheia)
  drawGemIcon(p, VIEW_W - 128, 18, 2);
  drawText(p, `${rt.gems.size}/${rt.level.gems.length}`, VIEW_W - 108, 18, 2, PALETTE.emerald, 'left');

  // Pips de eco
  const total = rt.level.def.maxEchoes;
  for (let i = 0; i < total; i++) {
    const ex = VIEW_W - 26 - (total - 1 - i) * 16;
    drawEchoPip(p, ex, VIEW_H - 34, i < rt.echoes.length);
  }


  // Medidor de ciclo
  const totalBeats = rt.level.def.cycleLength;
  const w = Math.min(260, totalBeats * 14);
  const bx = VIEW_W / 2 - w / 2;
  const by = VIEW_H - 14;
  for (let i = 0; i < totalBeats; i++) {
    const step = w / totalBeats;
    p.noStroke();
    p.fill(i < rt.beat ? PALETTE.cyanDim : PALETTE.cyan);
    p.rect(bx + i * step, by, Math.max(1, step - 3), 4);
  }

  if (muted) drawText(p, 'MUDO', VIEW_W - 12, VIEW_H - 26, 1, PALETTE.cyanDim, 'right');

  void pressed;
  void t;
}
