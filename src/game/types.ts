export type Dir = 'U' | 'D' | 'L' | 'R';

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
