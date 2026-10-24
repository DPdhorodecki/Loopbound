import p5 from 'p5';
import { ColorKey, CODE_COLORS, Dir, ROMAN } from '../game/types';
import { drawText } from './font';
import { PALETTE } from './palette';

export const COLOR_RAMP: Record<ColorKey, { bright: string; light: string; dark: string }> = {
  red: { bright: PALETTE.red, light: '#E4675C', dark: PALETTE.redDark },
  blue: { bright: PALETTE.blue, light: '#65A9E8', dark: PALETTE.blueDark },
  gold: { bright: PALETTE.gold, light: '#F0C868', dark: PALETTE.goldDark },
};

export function drawShadow(p: p5, cx: number, cy: number, rx: number, alpha = 90): void {
  p.noStroke();
  p.fill(0, 0, 0, alpha);
  p.ellipse(cx, cy, rx * 2, Math.max(3, rx * 0.9));
}

export function drawCrate(p: p5, x: number, y: number): void {
  p.noStroke();
  p.fill(PALETTE.woodNail);
  p.rect(x, y, 16, 16);
  p.fill(PALETTE.woodMid);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill(PALETTE.woodHi);
  p.rect(x + 1, y + 1, 14, 2);
  p.rect(x + 1, y + 1, 2, 14);
  p.fill(PALETTE.woodLo);
  p.rect(x + 1, y + 13, 14, 2);
  p.rect(x + 13, y + 1, 2, 14);
  // tábua diagonal
  for (let i = 0; i < 12; i++) {
    p.fill(i % 4 === 0 ? PALETTE.woodHi : PALETTE.woodLo);
    p.rect(x + 3 + i, y + 3 + i, 2, 1);
  }
  // pregos
  p.fill(PALETTE.woodNail);
  p.rect(x + 3, y + 3, 1, 1);
  p.rect(x + 12, y + 3, 1, 1);
  p.rect(x + 3, y + 12, 1, 1);
  p.rect(x + 12, y + 12, 1, 1);
}

export function drawPlate(p: p5, x: number, y: number, color: ColorKey, pressed: boolean, t: number): void {
  const c = COLOR_RAMP[color];
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 1, y + 1, 14, 14);
  const inset = pressed ? 3 : 2;
  const size = 16 - inset * 2;
  const px = x + inset;
  const py = y + inset + (pressed ? 1 : 0);
  p.fill(c.dark);
  p.rect(px, py, size, size);
  p.fill(pressed ? c.dark : c.bright);
  p.rect(px + 1, py + 1, size - 2, size - 2);
  p.fill(c.light);
  p.rect(px + 1, py + 1, size - 2, 1);

  const cx = px + size / 2;
  const cy = py + size / 2;
  const pulse = pressed ? 1 : 0.55 + Math.sin(t * 3) * 0.15;
  p.push();
  p.noFill();
  p.stroke(255, 255, 255, 180 * pulse);
  p.strokeWeight(1);
  if (color === 'red') p.circle(cx, cy + 0.5, 5);
  else if (color === 'blue') p.rect(cx - 2.5, cy - 2.5, 5, 5);
  else p.triangle(cx, cy - 3, cx - 3, cy + 2, cx + 3, cy + 2);
  p.pop();
}

export function drawGate(p: p5, x: number, y: number, color: ColorKey, open: boolean, t: number): void {
  const c = COLOR_RAMP[color];
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x, y, 16, 16);
  p.fill(0, 0, 0, 160);
  p.rect(x + 1, y + 1, 14, 14);
  if (!open) {
    for (let i = 0; i < 3; i++) {
      const bx = x + 2 + i * 4;
      p.fill(c.dark);
      p.rect(bx, y + 1, 3, 14);
      p.fill(c.bright);
      p.rect(bx, y + 1, 2, 14);
      p.fill(c.light);
      p.rect(bx, y + 1, 2, 1);
    }
    p.fill(c.bright);
    p.rect(x + 1, y + 1, 14, 1);
    p.rect(x + 1, y + 14, 14, 1);
    // marca de forma (acessibilidade: combina com a placa sem depender da cor)
    p.fill(0, 0, 0, 210);
    p.rect(x + 4, y + 4, 8, 8);
    p.push();
    p.noFill();
    p.stroke(255, 255, 255, 210);
    p.strokeWeight(1);
    const cx = x + 8;
    const cy = y + 8;
    if (color === 'red') p.circle(cx, cy, 5);
    else if (color === 'blue') p.rect(cx - 2.5, cy - 2.5, 5, 5);
    else p.triangle(cx, cy - 3, cx - 3, cy + 2, cx + 3, cy + 2);
    p.pop();
  } else {
    const glow = 0.35 + Math.sin(t * 3) * 0.12;
    p.fill(c.bright);
    p.rect(x + 1, y + 1, 14, 2);
    p.rect(x + 1, y + 13, 14, 2);
    p.drawingContext.globalAlpha = glow;
    p.fill(c.bright);
    p.rect(x + 1, y + 3, 1, 10);
    p.rect(x + 14, y + 3, 1, 10);
    p.drawingContext.globalAlpha = 1;
  }
}

export function drawGem(p: p5, x: number, y: number, t: number): void {
  const bob = Math.round(Math.sin(t * 3 + x * 0.4));
  const gx = x + 5;
  const gy = y + 4 + bob;
  p.noStroke();
  p.fill(PALETTE.emeraldDark);
  p.rect(gx + 1, gy, 4, 1);
  p.rect(gx, gy + 1, 6, 5);
  p.rect(gx + 1, gy + 6, 4, 1);
  p.fill(PALETTE.emerald);
  p.rect(gx + 1, gy + 1, 4, 4);
  p.fill('#A8F5CB');
  p.rect(gx + 1, gy + 1, 2, 1);
  p.rect(gx + 1, gy + 2, 1, 1);
  const spark = (Math.sin(t * 2 + x) + 1) / 2;
  if (spark > 0.7) {
    p.fill(255, 255, 255, 190);
    p.rect(gx + 5, gy + 1, 1, 1);
  }
}

export function drawKey(p: p5, x: number, y: number, t: number): void {
  const bob = Math.round(Math.sin(t * 2.4) * 1.5);
  const kx = x + 3;
  const ky = y + 5 + bob;
  p.noStroke();
  // argola
  p.fill(PALETTE.goldDark);
  p.rect(kx, ky, 6, 6);
  p.fill('#0A0F16');
  p.rect(kx + 2, ky + 2, 2, 2);
  p.fill(PALETTE.gold);
  p.rect(kx + 1, ky + 1, 4, 1);
  p.rect(kx + 1, ky + 1, 1, 4);
  p.fill('#F7E1A0');
  p.rect(kx + 1, ky + 1, 2, 1);
  // haste e dentes
  p.fill(PALETTE.goldDark);
  p.rect(kx + 5, ky + 2, 6, 2);
  p.fill(PALETTE.gold);
  p.rect(kx + 5, ky + 2, 5, 1);
  p.fill(PALETTE.goldDark);
  p.rect(kx + 8, ky + 4, 1, 2);
  p.rect(kx + 10, ky + 4, 1, 2);
}

export function drawDoor(p: p5, x: number, y: number, open: boolean): void {
  p.noStroke();
  if (open) {
    p.fill(PALETTE.stoneShadow);
    p.rect(x, y, 16, 16);
    p.fill('#0A0F16');
    p.rect(x + 1, y + 1, 14, 14);
    p.fill(PALETTE.stoneLo);
    p.rect(x, y, 1, 16);
    p.rect(x + 15, y, 1, 16);
    return;
  }
  p.fill(PALETTE.woodNail);
  p.rect(x + 1, y, 14, 16);
  p.fill(PALETTE.woodLo);
  p.rect(x + 2, y + 1, 12, 14);
  p.fill(PALETTE.woodMid);
  p.rect(x + 3, y + 2, 10, 13);
  p.fill(PALETTE.woodNail);
  p.rect(x + 7, y + 2, 1, 13);
  p.fill(PALETTE.woodHi);
  p.rect(x + 3, y + 2, 10, 1);
  // fechadura
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 10, y + 7, 3, 4);
  p.fill(PALETTE.gold);
  p.rect(x + 11, y + 8, 1, 1);
  p.rect(x + 11, y + 9, 1, 1);
}

export function drawExit(p: p5, x: number, y: number, t: number, active: boolean): void {
  const glow = active ? 0.55 + Math.sin(t * 2.5) * 0.25 : 0.25;
  p.noStroke();
  p.fill(PALETTE.stoneEdge);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill(PALETTE.stoneLo);
  p.rect(x + 2, y + 2, 12, 12);
  p.fill('#1B2733');
  p.rect(x + 3, y + 3, 10, 10);
  p.fill(53, 230, 242, 40 + glow * 90);
  p.rect(x + 2, y + 2, 12, 12);
  p.fill(53, 230, 242, 90 + glow * 120);
  p.rect(x + 3, y + 3, 10, 1);
  p.rect(x + 3, y + 12, 10, 1);
  p.rect(x + 3, y + 3, 1, 10);
  p.rect(x + 12, y + 3, 1, 10);
  p.fill(53, 230, 242, 160 + glow * 95);
  const cx = x + 8;
  const cy = y + 8;
  p.rect(cx - 1, cy - 4, 2, 3);
  p.rect(cx - 4, cy - 1, 3, 2);
  p.rect(cx + 2, cy - 1, 3, 2);
  p.rect(cx - 1, cy + 2, 2, 3);
  p.rect(cx - 1, cy - 1, 2, 2);
}

export function drawPlayer(
  p: p5,
  img: p5.Image,
  px: number,
  py: number,
  facing: Dir,
  alpha = 255,
  tintRgb?: [number, number, number],
): void {
  p.push();
  if (tintRgb) p.tint(tintRgb[0], tintRgb[1], tintRgb[2], alpha);
  else p.tint(255, alpha);
  if (facing === 'L') {
    p.translate(px + 16, py);
    p.scale(-1, 1);
    p.image(img, 0, -8);
  } else {
    p.image(img, px, py - 8);
  }
  p.pop();
  p.noTint();
}

// ------------------------------------------------------- mecânicas novas

/** Alavanca: acionada com `E`; fica ligada até ser acionada de novo. */
export function drawLever(p: p5, x: number, y: number, color: ColorKey, on: boolean, t: number): void {
  const c = COLOR_RAMP[color];
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill('#2A3A36');
  p.rect(x + 2, y + 2, 12, 12);
  p.fill(on ? c.dark : '#3C4E48');
  p.rect(x + 3, y + 10, 10, 3);
  // cabo
  const sway = on ? 4 : 10;
  p.fill('#1A221F');
  p.rect(x + (on ? 11 : 4), y + sway, 3, 3);
  p.fill(on ? c.bright : PALETTE.stoneHi);
  p.rect(x + (on ? 11 : 4), y + sway, 3, 2);
  // brilho quando ligada
  if (on) {
    p.drawingContext.globalAlpha = 0.4 + Math.sin(t * 4) * 0.2;
    p.fill(c.bright);
    p.rect(x + 1, y + 1, 14, 1);
    p.rect(x + 1, y + 14, 14, 1);
    p.drawingContext.globalAlpha = 1;
  }
  p.fill(c.bright);
  p.rect(x + 4, y + 4, 2, 2);
}

/** Botão: precisa de peso (caixote) para ficar pressionado. */
export function drawButton(p: p5, x: number, y: number, color: ColorKey, pressed: boolean, t: number): void {
  const c = COLOR_RAMP[color];
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill('#26332F');
  p.rect(x + 2, y + 2, 12, 12);
  const inset = pressed ? 4 : 3;
  const size = 16 - inset * 2;
  p.fill(c.dark);
  p.rect(x + inset, y + inset + (pressed ? 1 : 0), size, size);
  p.fill(pressed ? c.bright : c.dark);
  p.rect(x + inset + 1, y + inset + 1, size - 2, size - 2);
  if (!pressed) {
    const pulse = 0.5 + Math.sin(t * 3) * 0.15;
    p.fill(c.bright);
    p.drawingContext.globalAlpha = pulse;
    p.rect(x + 5, y + 5, 6, 6);
    p.drawingContext.globalAlpha = 1;
  }
}

/** Duto: teleporta. Fica escuro/inativo quando um caixote cobre. */
export function drawDuct(p: p5, x: number, y: number, active: boolean, t: number): void {
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill(active ? '#123A44' : '#1B2733');
  p.rect(x + 2, y + 2, 12, 12);
  const glow = active ? 120 + Math.sin(t * 4) * 60 : 40;
  p.fill(53, 230, 242, glow);
  // aberturas em cruz
  p.rect(x + 4, y + 7, 8, 2);
  p.rect(x + 7, y + 4, 2, 8);
  p.fill('#9BEFF6');
  p.rect(x + 7, y + 7, 2, 2);
}

/** Portão de código (`@`): abre quando a tela de código é resolvida. */
export function drawCodeGate(p: p5, x: number, y: number, open: boolean, t: number): void {
  const violet = '#8B5BE0';
  const violetDark = '#4A2E86';
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x, y, 16, 16);
  if (!open) {
    p.fill(0, 0, 0, 160);
    p.rect(x + 1, y + 1, 14, 14);
    for (let i = 0; i < 3; i++) {
      const bx = x + 2 + i * 4;
      p.fill(violetDark);
      p.rect(bx, y + 1, 3, 14);
      p.fill(violet);
      p.rect(bx, y + 1, 2, 14);
    }
    // cadeado
    p.fill('#0A0F16');
    p.rect(x + 4, y + 5, 8, 7);
    p.fill(violet);
    p.rect(x + 5, y + 6, 6, 5);
    p.noStroke();
    p.fill('#0A0F16');
    p.rect(x + 7, y + 7, 2, 3);
  } else {
    const glow = 0.35 + Math.sin(t * 3) * 0.12;
    p.fill(violet);
    p.rect(x + 1, y + 1, 14, 2);
    p.rect(x + 1, y + 13, 14, 2);
    p.drawingContext.globalAlpha = glow;
    p.fill(violet);
    p.rect(x + 1, y + 3, 1, 10);
    p.rect(x + 14, y + 3, 1, 10);
    p.drawingContext.globalAlpha = 1;
  }
}

/** Tela de código (`X`). */
export function drawTerminal(p: p5, x: number, y: number, solved: boolean, t: number): void {
  p.noStroke();
  p.fill(PALETTE.stoneShadow);
  p.rect(x + 1, y + 1, 14, 14);
  p.fill(solved ? '#0F3B2A' : '#1B2733');
  p.rect(x + 3, y + 2, 10, 10);
  const c = solved ? PALETTE.emerald : PALETTE.cyan;
  const glow = 0.5 + Math.sin(t * 4) * 0.25;
  p.drawingContext.globalAlpha = glow;
  p.fill(c);
  p.rect(x + 4, y + 3, 8, 1);
  p.rect(x + 4, y + 5, 5, 1);
  p.rect(x + 4, y + 7, 7, 1);
  p.rect(x + 4, y + 9, 4, 1);
  p.drawingContext.globalAlpha = 1;
  p.fill(PALETTE.stoneHi);
  p.rect(x + 2, y + 12, 12, 2);
}

/** Quadrado de pista no chão (romano ou cor). */
export function drawClue(p: p5, x: number, y: number, kind: 'roman' | 'color', value: number, t: number): void {
  p.noStroke();
  if (kind === 'roman') {
    p.fill('#1B2733');
    p.rect(x + 2, y + 2, 12, 12);
    p.fill(PALETTE.stoneHi);
    p.rect(x + 2, y + 2, 12, 1);
    p.rect(x + 2, y + 13, 12, 1);
    drawText(p, ROMAN[value - 1] ?? String(value), x + 8, y + 6, 1, PALETTE.cyan, 'center');
  } else {
    const col = CODE_COLORS[value] ?? PALETTE.cyan;
    p.fill('#1B2733');
    p.rect(x + 2, y + 2, 12, 12);
    p.fill(col);
    p.rect(x + 4, y + 4, 8, 8);
    p.fill(255, 255, 255, 60 + Math.sin(t * 3) * 30);
    p.rect(x + 4, y + 4, 8, 2);
  }
}
