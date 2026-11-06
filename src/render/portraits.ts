/**
 * Retratos dos personagens.
 *
 * O General Marcinho e o Alien Chuchuty usam as artes em PNG enviadas pelo
 * autor; Kennedyto e o sistema continuam em pixel art desenhada por código.
 * As imagens são carregadas uma única vez e desenhadas com nearest-neighbor.
 */

import marcinhoSrc from '../assets/characters/general-marcinho.png';
import chuchutySrc from '../assets/characters/alien-chuchuty.png';

export type PortraitId = 'marcinho' | 'chuchuty' | 'kennedyto' | 'system';

const PALETTE: Record<string, string> = {
  o: '#0A0D14',
  k: '#171A20',
  w: '#F4F6F5',
  s: '#D9A066',
  S: '#F0C08A',
  n: '#A86B3F',
  g: '#3C6B42',
  G: '#24452B',
  h: '#5C8F5E',
  y: '#D9A63C',
  Y: '#F2D27A',
  d: '#8F6A1F',
  r: '#B64A32',
  R: '#D9784A',
  q: '#6E2A1A',
  v: '#45C45A',
  V: '#2A8A3C',
  b: '#111820',
  B: '#2A3038',
  t: '#20242C',
  T: '#343A44',
  c: '#C43B31',
  C: '#E4675C',
  p: '#8B5BE0',
};

const MARCINHO = [
  '......oooo......',
  '.....oyyyyo.....',
  '....oyYYYYyo....',
  '...oyYyYYyYyo...',
  '...oyyyyyyyyo...',
  '..oooooooooooo..',
  '...oSSSSSSSSo...',
  '...oSbbSSbbSo...',
  '...oSSSSSSSSo...',
  '...oSSSnnSSSo...',
  '...oSSSSSSSSo...',
  '..oyyggggggyy...',
  '.oyggggggggggyo.',
  '.oggggggggggggo.',
  '.oggyyygggggggo.',
  '.oggggggggggggo.',
  '.oggggggggggggo.',
  '..oGGGGGGGGGGo..',
  '..oGGGG..GGGGo..',
  '..obbb....bbbo..',
];

const CHUCHUTY = [
  '..o..........o..',
  '..o...oooo...o..',
  '...o..orro..o...',
  '....orrrrrro....',
  '...orrrrrrrro...',
  '..orrrrrrrrrro..',
  '..ovvvvvvvvvvo..',
  '..ovvbbvvbbvvo..',
  '..ovvbwvvbwvvo..',
  '..ovvvvvvvvvvo..',
  '..orrrrrrrrrro..',
  '...orrrrrrrro...',
  '..otttttttttto..',
  '.otttttttttttto.',
  '.otttccccccttto.',
  '.otttcCCCCCttto.',
  '.otttttttttttto.',
  '..oBBBBBBBBBBo..',
  '..oBBB....BBBo..',
  '..obbb....bbbo..',
];

const KENNEDYTO = [
  '......oooo......',
  '.....occcco.....',
  '....ocCCCCco....',
  '....occccccK....',
  '...offfffffo....',
  '...offkffkffo...',
  '...offffffmfo...',
  '...offffffmfo...',
  '....offffffo....',
  '..oooooooooooo..',
  '..oPPPPPPPPPPo..',
  '.oPlllllllllPPo.',
  '.oPllbllblllPPo.',
  '.oPlllllllllPPo.',
  '..oQlllllllQo...',
  '...oBBBBBBBo....',
  '...oBBo.oBBo....',
  '...obbo.obbo....',
  '................',
  '................',
];

const SYSTEM = [
  '................',
  '....oooooooo....',
  '...obbbbbbbbo...',
  '...obwwwwwwbo...',
  '...obwbbbbwbo...',
  '...obwboobwbo...',
  '...obwbbbbwbo...',
  '...obwwwwwwbo...',
  '...obbbbbbbbo...',
  '....oooooooo....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const GRIDS: Record<PortraitId, string[]> = {
  marcinho: MARCINHO,
  chuchuty: CHUCHUTY,
  kennedyto: KENNEDYTO,
  system: SYSTEM,
};

/** Artes em PNG (personagens que ganharam retrato ilustrado). */
const PHOTOS: Partial<Record<PortraitId, string>> = {
  marcinho: marcinhoSrc,
  chuchuty: chuchutySrc,
};

const images = new Map<string, HTMLImageElement>();

function photoImage(who: PortraitId): HTMLImageElement | null {
  const src = PHOTOS[who];
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

/** Pré-carrega os retratos para que a primeira cena já apareça com a arte. */
export function preloadPortraits(): Promise<void> {
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

export const PORTRAIT_W = 16;
export const PORTRAIT_H = 20;

export function hasPhotoPortrait(who: PortraitId): boolean {
  return Boolean(PHOTOS[who]);
}

/** URL direta do PNG (ou data URL do sprite) para usar em `<img>`. */
export function portraitDataUrl(who: PortraitId, scale = 5): string {
  const photo = PHOTOS[who];
  if (photo) return photo;
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_W * scale;
  canvas.height = PORTRAIT_H * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  drawPortrait(ctx, who, 0, 0, scale);
  return canvas.toDataURL('image/png');
}

/**
 * Desenha o retrato numa caixa de `19*scale` por `24*scale`.
 * Para PNGs, faz crop central (cover) sem suavizar.
 */
export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  who: PortraitId,
  x: number,
  y: number,
  scale = 3,
): void {
  const boxW = 19 * scale;
  const boxH = 24 * scale;
  const photo = photoImage(who);

  if (photo) {
    const iw = photo.naturalWidth;
    const ih = photo.naturalHeight;
    const target = boxW / boxH;
    const srcRatio = iw / ih;
    let sx = 0;
    let sy = 0;
    let sw = iw;
    let sh = ih;
    if (srcRatio > target) {
      sw = ih * target;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / target;
      sy = (ih - sh) * 0.32; // prioriza o rosto/tronco
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(photo, sx, sy, sw, sh, x, y, boxW, boxH);
    return;
  }

  const grid = GRIDS[who];
  const px = Math.max(1, Math.floor(boxW / PORTRAIT_W));
  const ox = x + Math.floor((boxW - PORTRAIT_W * px) / 2);
  for (let gy = 0; gy < grid.length; gy++) {
    const row = grid[gy];
    for (let gx = 0; gx < row.length; gx++) {
      const ch = row[gx];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = PALETTE[ch] ?? '#FF00FF';
      ctx.fillRect(ox + gx * px, y + gy * px, px, px);
    }
  }
}
