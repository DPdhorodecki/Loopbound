/**
 * Retratos em pixel art desenhados por código.
 * A grade é pintada com `fillRect` no contexto 2D, então funciona tanto no
 * canvas do jogo quanto nos retratos em DOM da tela de história.
 */

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

export const PORTRAIT_W = 16;
export const PORTRAIT_H = 20;

export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  who: PortraitId,
  x: number,
  y: number,
  scale = 3,
): void {
  const grid = GRIDS[who];
  for (let py = 0; py < grid.length; py++) {
    const row = grid[py];
    for (let px = 0; px < row.length; px++) {
      const ch = row[px];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = PALETTE[ch] ?? '#FF00FF';
      ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
    }
  }
}

/** Versão em data URL para usar em `<img>` ou no DOM. */
export function portraitDataUrl(who: PortraitId, scale = 5): string {
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_W * scale;
  canvas.height = PORTRAIT_H * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  drawPortrait(ctx, who, 0, 0, scale);
  return canvas.toDataURL('image/png');
}
