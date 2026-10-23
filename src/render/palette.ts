export const PALETTE = {
  bgDeep: '#0B1220',
  bgPanel: '#111C2E',
  bgPanelHi: '#16263C',
  stoneEdge: '#9BC0B2',
  stoneHi: '#5C7369',
  stoneMid: '#3C4E48',
  stoneLo: '#26332F',
  stoneShadow: '#16201D',
  void: '#04070B',
  woodHi: '#C48D57',
  woodMid: '#8B5B35',
  woodLo: '#5A3A21',
  woodNail: '#2B1C11',
  cyan: '#35E6F2',
  cyanDim: '#127F8E',
  blue: '#2E86D8',
  blueDark: '#1B4E86',
  gold: '#D9A63C',
  goldDark: '#8F6A1F',
  red: '#C43B31',
  redDark: '#7C2620',
  emerald: '#45E08C',
  emeraldDark: '#1C8A54',
  white: '#F4F6F5',
  ink: '#0A0D14',
} as const;

export const CHAR_COLORS: Record<string, string> = {
  o: '#2A1E17', // contorno
  F: '#C9AE8B', // pelo claro
  f: '#A8896A', // pelo
  d: '#6E5540', // pelo escuro
  m: '#D8C3A5', // focinho
  e: '#F4F6F5', // olho
  k: '#1B1410', // pupila
  c: '#2FA24A', // boné
  C: '#5FD07A', // boné claro
  K: '#1B6E33', // boné escuro
  p: '#E8DCC0', // emblema
  P: '#2C8F45', // capa
  Q: '#1A5C2C', // capa escura
  l: '#7A4A2A', // couro
  L: '#4A2A16', // couro escuro
  b: '#D9A63C', // fivela
  B: '#6B4326', // bota
  s: '#F2C94C', // estrela
  S: '#D9A63C', // estrela escura
  r: '#C43B31', // língua
};
