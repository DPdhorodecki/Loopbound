import p5 from 'p5';
import { VIEW_H, VIEW_W } from '../ui/hud';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261106);
const STARS: Star[] = Array.from({ length: 110 }, () => ({
  x: rng() * VIEW_W,
  y: rng() * VIEW_H,
  size: rng() < 0.82 ? 1 : 2,
  speed: 2 + rng() * 10,
  phase: rng() * Math.PI * 2,
}));

/** Fundo espacial animado: gradiente, nebulosa, estrelas e silhueta da instalação. */
export function drawSpaceBackdrop(
  p: p5,
  time: number,
  nebula: [number, number, number] = [40, 90, 130],
): void {
  p.noStroke();
  // Gradiente vertical em faixas (pixel art).
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const r = Math.round(8 + nebula[0] * 0.05 * (1 - t));
    const g = Math.round(12 + nebula[1] * 0.06 * (1 - t));
    const b = Math.round(24 + nebula[2] * 0.08 * (1 - t) + 14 * t);
    p.fill(r, g, b);
    p.rect(0, Math.floor((VIEW_H / 18) * i), VIEW_W, Math.ceil(VIEW_H / 18) + 1);
  }

  // Nebulosa pulsante.
  const pulse = 0.5 + Math.sin(time * 0.35) * 0.18;
  p.fill(nebula[0], nebula[1], nebula[2], 26 * pulse);
  p.ellipse(VIEW_W * 0.72, VIEW_H * 0.34, 300, 150);
  p.fill(nebula[0], nebula[1], nebula[2], 18 * pulse);
  p.ellipse(VIEW_W * 0.24, VIEW_H * 0.66, 260, 120);

  // Estrelas com leve deriva e cintilância.
  for (const star of STARS) {
    const twinkle = 0.55 + 0.45 * Math.sin(time * 1.6 + star.phase);
    const x = (star.x + time * star.speed) % (VIEW_W + 8) - 4;
    p.fill(210, 230, 255, Math.round(120 * twinkle));
    p.rect(x, star.y, star.size, star.size);
    if (star.size === 2) {
      p.fill(255, 255, 255, Math.round(190 * twinkle));
      p.rect(x, star.y, 1, 1);
    }
  }

  // Silhueta distante da instalação alienígena.
  const base = VIEW_H - 40;
  p.fill(4, 7, 12, 150);
  p.rect(VIEW_W - 190, base - 46, 90, 46);
  p.rect(VIEW_W - 214, base - 20, 150, 20);
  p.rect(VIEW_W - 168, base - 64, 22, 20);
  p.fill(nebula[0], nebula[1], nebula[2], 60);
  p.rect(VIEW_W - 164, base - 58, 12, 3);
  p.rect(VIEW_W - 150, base - 34, 26, 2);
  for (let i = 0; i < 4; i++) {
    p.fill(nebula[0], nebula[1], nebula[2], 40 + i * 6);
    p.rect(VIEW_W - 186 + i * 20, base - 42, 2, 2);
  }
}
