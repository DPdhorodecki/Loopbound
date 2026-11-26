/**
 * Arte do menu em tela cheia.
 *
 * O sprite do Kennedyto é desenhado em código (como no jogo) e exportado como
 * PNG para poder ser posicionado no fundo do login/menu com CSS. Assim o menu
 * usa o mesmo pixel art do jogo, sem baixar uma imagem nova.
 */

import { KENNEDITO_FRAMES, KEN_H, KEN_W } from './kennedito';
import { CHAR_COLORS } from './palette';

import chuchutyCutout from '../assets/characters/alien-chuchuty-cutout.png';
import marcinhoCutout from '../assets/characters/general-marcinho-cutout.png';

/** PNGs dos personagens sem o fundo, para flutuar sobre o hero. */
export const HERO_CHUCHUTY = chuchutyCutout;
export const HERO_MARCINHO = marcinhoCutout;

let cache: string | null = null;

/** Frame idle do Kennedyto como data URL (crisp, nearest-neighbor no CSS). */
export function kenHeroDataUrl(scale = 8): string {
  if (cache) return cache;
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = KEN_W * scale;
  canvas.height = KEN_H * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const rows = KENNEDITO_FRAMES.idle0;
  for (let y = 0; y < KEN_H; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < KEN_W; x++) {
      const ch = row[x];
      if (!ch || ch === '.') continue;
      ctx.fillStyle = CHAR_COLORS[ch] ?? '#FF00FF';
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  cache = canvas.toDataURL('image/png');
  return cache;
}
