export interface SectorTheme {
  id: number;
  label: string;
  /** Piso */
  floor: string;
  floorHi: string;
  floorLo: string;
  /** Paredes */
  wallBase: string;
  wallBody: string;
  wallCap: string;
  wallCapHi: string;
  wallShadow: string;
  /** Detalhes decorativos */
  accent: string;
  accentDim: string;
  panel: string;
  pipe: string;
  /** Tipo de enfeite dominante. */
  decor: 'cells' | 'lab' | 'factory' | 'command' | 'hangar';
  /** Cor da nebulosa de fundo. */
  nebula: [number, number, number];
}

export const SECTOR_THEMES: Record<number, SectorTheme> = {
  1: {
    id: 1,
    label: 'CELA',
    floor: '#2C3A45',
    floorHi: '#3A4C59',
    floorLo: '#1F2B34',
    wallBase: '#101820',
    wallBody: '#18242E',
    wallCap: '#4A6273',
    wallCapHi: '#7E9DAF',
    wallShadow: '#080D12',
    accent: '#4FC3D9',
    accentDim: '#24697A',
    panel: '#1E2E3A',
    pipe: '#3E5A6B',
    decor: 'cells',
    nebula: [40, 90, 130],
  },
  2: {
    id: 2,
    label: 'LABORATÓRIO',
    floor: '#2B3B38',
    floorHi: '#3B524D',
    floorLo: '#1E2B28',
    wallBase: '#0F1A1A',
    wallBody: '#172726',
    wallCap: '#4C6E66',
    wallCapHi: '#83B3A3',
    wallShadow: '#07100F',
    accent: '#4FE0B0',
    accentDim: '#1F7A60',
    panel: '#1A302C',
    pipe: '#3E6B5E',
    decor: 'lab',
    nebula: [30, 120, 100],
  },
  3: {
    id: 3,
    label: 'INDÚSTRIA',
    floor: '#3B322A',
    floorHi: '#514338',
    floorLo: '#28211B',
    wallBase: '#1A120C',
    wallBody: '#261B13',
    wallCap: '#6B5138',
    wallCapHi: '#A87B4E',
    wallShadow: '#0D0805',
    accent: '#E8A03C',
    accentDim: '#8A5A1E',
    panel: '#2E2117',
    pipe: '#6B4B2D',
    decor: 'factory',
    nebula: [140, 80, 30],
  },
  4: {
    id: 4,
    label: 'COMANDO',
    floor: '#302C42',
    floorHi: '#443E5C',
    floorLo: '#211E2E',
    wallBase: '#120F1E',
    wallBody: '#1D1830',
    wallCap: '#57497A',
    wallCapHi: '#8E7AB8',
    wallShadow: '#09060F',
    accent: '#B07BFF',
    accentDim: '#5E3C99',
    panel: '#251E3B',
    pipe: '#4D3C70',
    decor: 'command',
    nebula: [90, 50, 150],
  },
  5: {
    id: 5,
    label: 'HANGAR',
    floor: '#3A2C2A',
    floorHi: '#54403C',
    floorLo: '#271D1B',
    wallBase: '#1A0F0D',
    wallBody: '#271614',
    wallCap: '#71453C',
    wallCapHi: '#B07A68',
    wallShadow: '#0D0605',
    accent: '#FF7A4D',
    accentDim: '#9E3D25',
    panel: '#2E1916',
    pipe: '#704037',
    decor: 'hangar',
    nebula: [170, 65, 40],
  },
};

export function themeFor(sector: number): SectorTheme {
  return SECTOR_THEMES[sector] ?? SECTOR_THEMES[1];
}
