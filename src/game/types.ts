export type Dir = 'U' | 'D' | 'L' | 'R';

/**
 * Tokens que formam a solução de uma fase (replayada nos testes).
 * Além dos movimentos, há a interação (`E`), as teclas do painel de código
 * (`1`..`9` selecionam, `C` confirma, `X` limpa).
 */
export type Action =
  | Dir
  | 'E'
  | 'C'
  | 'X'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'] as const;

/** Paleta do código por cor (9 cores). */
export const CODE_COLORS = [
  '#C43B31', // vermelho
  '#E07B39', // laranja
  '#D9A63C', // amarelo
  '#45E08C', // verde
  '#35E6F2', // ciano
  '#2E86D8', // azul
  '#8B5BE0', // roxo
  '#E05B9A', // rosa
  '#F4F6F5', // branco
] as const;

export type ColorKey = 'red' | 'blue' | 'gold';

export type EndReason = 'tab' | 'steps' | 'death';

export interface Vec {
  x: number;
  y: number;
}

export interface Pose extends Vec {
  facing: Dir;
}

export const DIRS: Record<Dir, Vec> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Dir, Dir> = { U: 'D', D: 'U', L: 'R', R: 'L' };

export const TILE_FLOOR = 0;
export const TILE_WALL = 1;
export const TILE_VOID = 2;
export type TileId = typeof TILE_FLOOR | typeof TILE_WALL | typeof TILE_VOID;

export const cellKey = (x: number, y: number): string => `${x},${y}`;
