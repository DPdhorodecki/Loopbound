/**
 * Cenas da HQ em pixel art.
 *
 * Os painéis usam os PNGs fornecidos pelo autor (1920×1080) quando disponíveis,
 * com fallback para desenho em código caso a imagem não carregue.
 */

import { ComicPanelId } from '../game/story';
import { drawPortrait } from './portraits';

import schoolSrc from '../assets/comic/school.png';
import abductionSrc from '../assets/comic/abduction.png';
import labSrc from '../assets/comic/lab.png';
import cellSrc from '../assets/comic/cell.png';
import radioSrc from '../assets/comic/radio.png';
import escapeSrc from '../assets/comic/escape.png';
import landingSrc from '../assets/comic/landing.png';
import signalSrc from '../assets/comic/signal.png';
import capsuleSrc from '../assets/comic/capsule.png';

const W = 640;
const H = 360;

type Ctx = CanvasRenderingContext2D;

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function bands(ctx: Ctx, colors: string[]): void {
  const h = Math.ceil(H / colors.length);
  colors.forEach((color, i) => rect(ctx, 0, i * h, W, h + 1, color));
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stars(ctx: Ctx, seed: number, count = 70, maxY = H * 0.7): void {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * maxY);
    const bright = r() > 0.75;
    rect(ctx, x, y, bright ? 2 : 1, bright ? 2 : 1, bright ? '#F4F6F5' : '#8FB3A6');
  }
}

function scanlines(ctx: Ctx): void {
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 380);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function border(ctx: Ctx): void {
  rect(ctx, 0, 0, W, 3, '#35E6F2');
  rect(ctx, 0, H - 3, W, 3, '#127F8E');
  rect(ctx, 0, 0, 3, H, '#35E6F2');
  rect(ctx, W - 3, 0, 3, H, '#127F8E');
}

/** Kennedyto em corpo inteiro, 20×28 unidades lógicas (fallback). */
function dog(ctx: Ctx, x: number, y: number, s: number, pose: 'stand' | 'run' | 'float' = 'stand'): void {
  const u = (cx: number, cy: number, cw: number, ch: number, color: string) =>
    rect(ctx, x + cx * s, y + cy * s, cw * s, ch * s, color);
  u(-5, 10, 5, 12, '#1A5C2C');
  u(-6, 18, 7, 4, '#1A5C2C');
  u(-5, 10, 5, 1, '#2FA24A');
  u(0, 10, 12, 11, '#A8896A');
  u(2, 11, 8, 7, '#C9AE8B');
  u(9, 12, 3, 8, '#C9AE8B');
  if (pose === 'run') {
    u(1, 21, 3, 6, '#6E5540');
    u(7, 21, 3, 5, '#6E5540');
    u(10, 20, 4, 3, '#6E5540');
    u(-1, 22, 4, 3, '#6E5540');
  } else if (pose === 'float') {
    u(1, 22, 3, 7, '#6E5540');
    u(8, 22, 3, 7, '#6E5540');
  } else {
    u(1, 21, 3, 8, '#6E5540');
    u(8, 21, 3, 8, '#6E5540');
    u(0, 29, 5, 2, '#2B1C11');
    u(7, 29, 5, 2, '#2B1C11');
  }
  u(5, 1, 10, 9, '#C9AE8B');
  u(4, 3, 2, 5, '#6E5540');
  u(14, 3, 2, 5, '#6E5540');
  u(7, 4, 2, 2, '#F4F6F5');
  u(12, 4, 2, 2, '#F4F6F5');
  u(8, 5, 1, 1, '#1B1410');
  u(13, 5, 1, 1, '#1B1410');
  u(10, 7, 4, 2, '#D8C3A5');
  u(11, 7, 1, 1, '#1B1410');
  u(4, 0, 12, 3, '#2FA24A');
  u(3, 2, 14, 2, '#5FD07A');
  u(5, 1, 10, 1, '#1B6E33');
  u(15, 2, 4, 2, '#2FA24A');
  u(3, 13, 2, 2, '#D9A63C');
  u(2, 14, 4, 1, '#D9A63C');
}

function school(ctx: Ctx, x: number, y: number, s = 1): void {
  rect(ctx, x, y, 380 * s, 150 * s, '#1A2430');
  rect(ctx, x, y, 380 * s, 6 * s, '#4A6273');
  rect(ctx, x - 20 * s, y + 150 * s, 420 * s, 10 * s, '#0F1A24');
  for (let i = 0; i < 7; i++) {
    const lit = i === 2 || i === 3 || i === 5;
    rect(ctx, x + (16 + i * 50) * s, y + 24 * s, 30 * s, 40 * s, lit ? '#D9A63C' : '#243244');
    rect(ctx, x + (16 + i * 50) * s, y + 80 * s, 30 * s, 30 * s, i === 1 ? '#D9A63C' : '#243244');
  }
  rect(ctx, x + 160 * s, y + 100 * s, 46 * s, 50 * s, '#141C24');
  rect(ctx, x + 120 * s, y + 98 * s, 126 * s, 12 * s, '#2C3A45');
  rect(ctx, x + 126 * s, y + 102 * s, 114 * s, 4 * s, '#8FB3A6');
  rect(ctx, x + 20 * s, y + 160 * s, 300 * s, 4 * s, '#3B4F47');
}

function ufo(ctx: Ctx, cx: number, cy: number, s = 1, glow = true): void {
  if (glow) {
    const grad = ctx.createRadialGradient(cx, cy + 8 * s, 2, cx, cy + 8 * s, 90 * s);
    grad.addColorStop(0, 'rgba(70,220,140,0.35)');
    grad.addColorStop(1, 'rgba(70,220,140,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 100 * s, cy - 80 * s, 200 * s, 200 * s);
  }
  rect(ctx, cx - 58 * s, cy - 10 * s, 116 * s, 18 * s, '#111820');
  rect(ctx, cx - 40 * s, cy - 24 * s, 80 * s, 18 * s, '#1D2A34');
  rect(ctx, cx - 20 * s, cy - 32 * s, 40 * s, 10 * s, '#2A3A44');
  rect(ctx, cx - 48 * s, cy - 6 * s, 8 * s, 4 * s, '#45E08C');
  rect(ctx, cx - 16 * s, cy - 6 * s, 8 * s, 4 * s, '#45E08C');
  rect(ctx, cx + 16 * s, cy - 6 * s, 8 * s, 4 * s, '#45E08C');
  rect(ctx, cx + 44 * s, cy - 6 * s, 8 * s, 4 * s, '#45E08C');
}

function alien(ctx: Ctx, x: number, y: number, s: number): void {
  drawPortrait(ctx, 'chuchuty', x, y, s);
}

function marcinho(ctx: Ctx, x: number, y: number, s: number): void {
  drawPortrait(ctx, 'marcinho', x, y, s);
}

function bars(ctx: Ctx, x: number, y: number, w: number, h: number): void {
  rect(ctx, x, y, w, h, 'rgba(53,230,242,0.10)');
  for (let i = 0; i < w; i += 10) {
    rect(ctx, x + i, y, 2, h, 'rgba(53,230,242,0.55)');
  }
  rect(ctx, x, y, w, 2, '#35E6F2');
  rect(ctx, x, y + h - 2, w, 2, '#127F8E');
}

function capsule(ctx: Ctx, x: number, y: number, s = 1): void {
  rect(ctx, x, y, 34 * s, 90 * s, '#DCE9E2');
  rect(ctx, x + 6 * s, y + 6 * s, 22 * s, 12 * s, '#35E6F2');
  rect(ctx, x - 8 * s, y + 74 * s, 50 * s, 12 * s, '#C43B31');
  rect(ctx, x + 4 * s, y + 86 * s, 26 * s, 10 * s, '#8F6A1F');
  rect(ctx, x - 4 * s, y + 94 * s, 42 * s, 6 * s, 'rgba(255,180,80,0.75)');
  rect(ctx, x - 2 * s, y + 100 * s, 38 * s, 8 * s, 'rgba(255,120,40,0.35)');
}

/** Imagens PNG externas (1920×1080). */
const PHOTOS: Partial<Record<ComicPanelId, string>> = {
  school: schoolSrc,
  abduction: abductionSrc,
  lab: labSrc,
  cell: cellSrc,
  radio: radioSrc,
  escape: escapeSrc,
  landing: landingSrc,
  signal: signalSrc,
  capsule: capsuleSrc,
};

/**
 * Foco horizontal do recorte (cover) por painel: 0 = canto esquerdo,
 * 0.5 = centro (padrão), 1 = canto direito.
 *
 * A cena da fuga do hangar é panorâmica (1622×534) e, centralizada, cortava
 * o batedor; com 0.21 cabem o batedor e a cápsula inteira.
 */
const PHOTOS_FOCUS: Partial<Record<ComicPanelId, number>> = {
  capsule: 0.21,
};

const images = new Map<string, HTMLImageElement>();

function photoImage(id: ComicPanelId): HTMLImageElement | null {
  const src = PHOTOS[id];
  if (!src || typeof Image === 'undefined') return null;
  let img = images.get(src);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = src;
    images.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/** Pré-carrega as imagens das cenas da HQ. */
export function preloadComicArt(): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  return Promise.all(
    Object.values(PHOTOS).map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.set(src, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);
}

/**
 * Desenha um painel de HQ numa caixa de 640×360.
 * Para PNGs, faz crop central (cover) sem suavizar.
 * Fallback: desenho em código se a imagem não estiver disponível.
 */
function drawComicPanel(ctx: Ctx, id: ComicPanelId): void {
  const photo = photoImage(id);
  if (photo) {
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    const target = W / H;
    const srcRatio = iw / ih;
    let sx = 0;
    let sy = 0;
    let sw = iw;
    let sh = ih;
    if (srcRatio > target) {
      sw = ih * target;
      const focus = PHOTOS_FOCUS[id] ?? 0.5;
      sx = (iw - sw) * focus;
    } else {
      sh = iw / target;
      sy = (ih - sh) * 0.32; // prioriza o rosto/tronco
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, W, H);
    return;
  }

  // Fallback: desenho em código
  const r = rng(id.length * 977 + id.charCodeAt(0));
  switch (id) {
    case 'school': {
      bands(ctx, ['#050A18', '#081126', '#0B1830', '#0E1D36', '#122540']);
      stars(ctx, 11);
      rect(ctx, 520, 34, 34, 34, '#E8E2C8');
      rect(ctx, 526, 30, 22, 42, '#E8E2C8');
      rect(ctx, 510, 42, 54, 18, '#E8E2C8');
      ufo(ctx, 210, 58, 0.8);
      school(ctx, 120, 150, 1);
      for (let i = 0; i < 18; i++) rect(ctx, 40 + i * 34, 292, 3, 40, '#3B4F47');
      rect(ctx, 38, 300, 590, 3, '#3B4F47');
      rect(ctx, 38, 316, 590, 3, '#3B4F47');
      rect(ctx, 0, 330, W, 30, '#0F1A24');
      dog(ctx, 300, 286, 2.1, 'stand');
      ctx.fillStyle = 'rgba(70,220,140,0.12)';
      ctx.beginPath();
      ctx.moveTo(190, 70);
      ctx.lineTo(130, 330);
      ctx.lineTo(290, 330);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'abduction': {
      bands(ctx, ['#0A1018', '#0E1722', '#13202C', '#172A36']);
      rect(ctx, 0, 250, W, 110, '#3B322A');
      for (let i = 0; i < 9; i++) rect(ctx, 0, 252 + i * 12, W, 1, '#2A211B');
      for (let i = 0; i < 5; i++) rect(ctx, 0, 190 + i * 12, 180, 8, '#243244');
      rect(ctx, 520, 120, 6, 130, '#4A6273');
      rect(ctx, 480, 120, 54, 4, '#C43B31');
      ctx.strokeStyle = '#DCE9E2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(510, 130, 18, 0, Math.PI);
      ctx.stroke();
      rect(ctx, 200, 0, 190, 40, '#05070B');
      ctx.fillStyle = 'rgba(90,240,150,0.22)';
      ctx.beginPath();
      ctx.moveTo(230, 24);
      ctx.lineTo(150, 330);
      ctx.lineTo(430, 330);
      ctx.lineTo(360, 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(120,255,180,0.12)';
      ctx.beginPath();
      ctx.moveTo(265, 24);
      ctx.lineTo(215, 330);
      ctx.lineTo(365, 330);
      ctx.lineTo(325, 24);
      ctx.closePath();
      ctx.fill();
      ufo(ctx, 295, 8, 1.2, false);
      dog(ctx, 260, 180, 3, 'float');
      for (let i = 0; i < 22; i++) {
        rect(ctx, 150 + r() * 300, 60 + r() * 240, 3, 3, '#8FB3A6');
      }
      break;
    }
    case 'lab': {
      bands(ctx, ['#061210', '#081916', '#0B211C', '#0E2A23']);
      for (let i = 0; i < 4; i++) {
        const x = 40 + i * 70;
        rect(ctx, x, 80, 40, 200, 'rgba(69,224,140,0.16)');
        rect(ctx, x, 80, 40, 4, '#45E08C');
        rect(ctx, x, 276, 40, 4, '#1C8A54');
        ctx.fillStyle = 'rgba(69,224,140,0.45)';
        ctx.beginPath();
        ctx.ellipse(x + 20, 130 + i * 22, 12, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      rect(ctx, 320, 220, 220, 60, '#12211D');
      rect(ctx, 328, 228, 204, 44, '#0A1512');
      for (let i = 0; i < 8; i++) rect(ctx, 336 + i * 24, 238, 14, 6, i % 3 ? '#1C8A54' : '#45E08C');
      alien(ctx, 380, 40, 8.5);
      rect(ctx, 210, 190, 64, 150, 'rgba(53,230,242,0.14)');
      rect(ctx, 210, 190, 64, 4, '#35E6F2');
      rect(ctx, 210, 336, 64, 4, '#127F8E');
      dog(ctx, 226, 218, 1.4, 'float');
      break;
    }
    case 'cell': {
      bands(ctx, ['#071016', '#0A1620', '#0D1C28', '#102230']);
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 155;
        rect(ctx, x, 70, 130, 170, '#0A1218');
        rect(ctx, x + 6, 76, 118, 158, '#0D1A24');
        bars(ctx, x + 10, 90, 110, 140);
        rect(ctx, x + 10, 90, 110, 6, '#1A2A36');
      }
      rect(ctx, 0, 240, W, 120, '#16222C');
      for (let i = 0; i < 8; i++) rect(ctx, 0, 244 + i * 14, W, 1, '#101A22');
      rect(ctx, 492, 52, 96, 48, '#0A1218');
      rect(ctx, 500, 58, 80, 36, '#1A2A36');
      for (let i = 0; i < 5; i++) rect(ctx, 504 + i * 16, 62, 3, 28, '#4A6273');
      dog(ctx, 90, 236, 2.4, 'stand');
      ctx.strokeStyle = 'rgba(53,230,242,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(132, 320, 54, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(53,230,242,0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(132, 320, 76, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'radio': {
      bands(ctx, ['#05090F', '#071019', '#0A1620']);
      rect(ctx, 0, 280, W, 80, '#0A1218');
      rect(ctx, 120, 44, 400, 250, '#0A1218');
      rect(ctx, 128, 52, 384, 234, '#101C24');
      marcinho(ctx, 200, 70, 8.6);
      for (let i = 0; i < 18; i++) {
        rect(ctx, 128 + r() * 384, 52 + r() * 234, 2 + r() * 18, 1, 'rgba(217,166,60,0.35)');
      }
      ctx.strokeStyle = '#D9A63C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < 120; x++) {
        const y = 316 + Math.sin(x * 0.22 + 1) * 9 * Math.sin(x * 0.03);
        if (x === 0) ctx.moveTo(480 + x, y);
        else ctx.lineTo(480 + x, y);
      }
      ctx.stroke();
      dog(ctx, 40, 250, 2.2, 'stand');
      break;
    }
    case 'escape': {
      bands(ctx, ['#120A0A', '#1A0D0C', '#24110F', '#2E1512']);
      ctx.fillStyle = '#3A2C2A';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(170, 120);
      ctx.lineTo(170, 240);
      ctx.lineTo(0, 360);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(640, 0);
      ctx.lineTo(470, 120);
      ctx.lineTo(470, 240);
      ctx.lineTo(640, 360);
      ctx.closePath();
      ctx.fill();
      rect(ctx, 170, 0, 300, 360, '#1A0F0D');
      rect(ctx, 200, 80, 240, 200, '#2E1916');
      for (let i = 0; i < 3; i++) {
        const x = 210 + i * 78;
        rect(ctx, x, 110, 44, 140, '#0A0705');
        for (let b = 0; b < 4; b++) rect(ctx, x + 6 + b * 10, 116, 3, 128, '#C43B31');
        rect(ctx, x, 106, 44, 4, '#E4675C');
      }
      for (let i = 0; i < 6; i++) {
        const x = 60 + i * 105;
        rect(ctx, x, 18, 10, 6, '#FF7A4D');
        ctx.fillStyle = 'rgba(255,122,77,0.18)';
        ctx.beginPath();
        ctx.moveTo(x + 5, 24);
        ctx.lineTo(x - 40, 240);
        ctx.lineTo(x + 50, 240);
        ctx.closePath();
        ctx.fill();
      }
      dog(ctx, 268, 250, 2.6, 'run');
      break;
    }
    case 'capsule': {
      bands(ctx, ['#0B0F18', '#101725', '#151E30', '#1A253C']);
      stars(ctx, 29, 45, 110);
      rect(ctx, 0, 240, W, 120, '#2A211B');
      for (let i = 0; i < 10; i++) rect(ctx, i * 70, 240, 6, 120, '#1A120C');
      rect(ctx, 0, 0, W, 60, '#0D0805');
      rect(ctx, 60, 60, 200, 12, '#4A6273');
      rect(ctx, 380, 60, 200, 12, '#4A6273');
      capsule(ctx, 300, 120, 1.4);
      rect(ctx, 270, 96, 110, 10, '#45E08C');
      alien(ctx, 80, 130, 5.2);
      dog(ctx, 220, 250, 2.3, 'run');
      for (let i = 0; i < 26; i++) rect(ctx, 250 + r() * 160, 220 + r() * 110, 2, 2, '#FF7A4D');
      break;
    }
    case 'landing': {
      bands(ctx, ['#1A1630', '#2A2447', '#4A3B5C', '#8A5A54', '#D98A5A']);
      stars(ctx, 41, 40, 90);
      ctx.fillStyle = 'rgba(255,200,120,0.5)';
      ctx.beginPath();
      ctx.arc(480, 250, 80, 0, Math.PI * 2);
      ctx.fill();
      rect(ctx, 400, 210, 160, 60, 'rgba(255,200,120,0.25)');
      rect(ctx, 0, 240, W, 120, '#3B322A');
      school(ctx, 60, 170, 0.7);
      capsule(ctx, 470, 190, 0.8);
      dog(ctx, 250, 268, 2.2, 'stand');
      marcinho(ctx, 340, 200, 5.4);
      for (let i = 0; i < 80; i++) rect(ctx, r() * W, 330 + r() * 26, 2, 4, '#24452B');
      break;
    }
    case 'signal': {
      bands(ctx, ['#04070B', '#070D14', '#0A121A']);
      rect(ctx, 100, 180, 440, 120, '#0A1218');
      rect(ctx, 112, 192, 416, 96, '#101C24');
      rect(ctx, 140, 70, 360, 190, '#050A0F');
      rect(ctx, 148, 78, 344, 174, '#081018');
      ctx.strokeStyle = 'rgba(196,59,49,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < 344; x++) {
        const y = 165 + Math.sin(x * 0.09) * 22 * Math.sin(x * 0.017);
        if (x === 0) ctx.moveTo(148 + x, y);
        else ctx.lineTo(148 + x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#45C45A';
      ctx.beginPath();
      ctx.ellipse(320, 140, 54, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0A0D14';
      ctx.beginPath();
      ctx.arc(334, 140, 12, 0, Math.PI * 2);
      ctx.fill();
      rect(ctx, 300, 120, 40, 6, '#1C8A54');
      ctx.fillStyle = 'rgba(69,196,90,0.14)';
      ctx.beginPath();
      ctx.arc(320, 140, 90, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

const cache = new Map<ComicPanelId, string>();

/** Desenha um painel e devolve um data URL pronto para ``. */
export function comicArt(id: ComicPanelId): string {
  const cached = cache.get(id);
  if (cached) return cached;
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  drawComicPanel(ctx, id);
  scanlines(ctx);
  border(ctx);
  const url = canvas.toDataURL('image/png');
  cache.set(id, url);
  return url;
}
