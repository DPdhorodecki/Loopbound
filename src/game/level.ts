import { ColorKey, Dir, TILE_FLOOR, TILE_VOID, TILE_WALL, TileId, Vec } from './types';

export interface Gate extends Vec {
  color: ColorKey;
}

export interface Plate extends Vec {
  color: ColorKey;
}

export interface LevelDef {
  id: string;
  name: string;
  subtitle: string;
  cycleLength: number;
  maxEchoes: number;
  par: { cycles: number; steps: number };
  map: string[];
  /** Um array de movimentos por ciclo. O último ciclo precisa terminar vencendo. */
  solution: Dir[][];
}

export interface Level {
  def: LevelDef;
  w: number;
  h: number;
  tiles: TileId[];
  spawn: Vec;
  exit: Vec;
  crates: Vec[];
  gems: Vec[];
  key: Vec | null;
  doors: Vec[];
  gates: Gate[];
  plates: Plate[];
  anchors: Vec[];
}

const CHAR_TILE: Record<string, TileId> = {
  '#': TILE_WALL,
  '.': TILE_FLOOR,
  '~': TILE_VOID,
  P: TILE_FLOOR,
  E: TILE_FLOOR,
  C: TILE_FLOOR,
  K: TILE_FLOOR,
  D: TILE_FLOOR,
  R: TILE_FLOOR,
  L: TILE_FLOOR,
  Y: TILE_FLOOR,
  r: TILE_FLOOR,
  b: TILE_FLOOR,
  y: TILE_FLOOR,
  g: TILE_FLOOR,
  '*': TILE_FLOOR,
  S: TILE_FLOOR,
};

const GATE_COLOR: Record<string, ColorKey> = { R: 'red', L: 'blue', Y: 'gold' };
const PLATE_COLOR: Record<string, ColorKey> = { r: 'red', b: 'blue', y: 'gold' };

export class LevelError extends Error {}

export function parseLevel(def: LevelDef): Level {
  const h = def.map.length;
  if (h < 3) throw new LevelError(`${def.id}: mapa muito pequeno`);
  const w = def.map[0].length;
  const level: Level = {
    def,
    w,
    h,
    tiles: new Array(w * h).fill(TILE_WALL) as TileId[],
    spawn: { x: 1, y: 1 },
    exit: { x: w - 2, y: h - 2 },
    crates: [],
    gems: [],
    key: null,
    doors: [],
    gates: [],
    plates: [],
    anchors: [],
  };
  let spawns = 0;
  let exits = 0;

  def.map.forEach((row, y) => {
    if (row.length !== w) {
      throw new LevelError(`${def.id}: linha ${y} tem ${row.length} colunas, esperado ${w}`);
    }
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      const tile = CHAR_TILE[ch];
      if (tile === undefined) throw new LevelError(`${def.id}: caractere desconhecido "${ch}" em ${x},${y}`);
      level.tiles[y * w + x] = tile;

      if (ch === 'P') {
        level.spawn = { x, y };
        spawns++;
      } else if (ch === 'E') {
        level.exit = { x, y };
        exits++;
      } else if (ch === 'C') level.crates.push({ x, y });
      else if (ch === 'g') level.gems.push({ x, y });
      else if (ch === 'K') level.key = { x, y };
      else if (ch === 'D') level.doors.push({ x, y });
      else if (ch === 'S') level.anchors.push({ x, y });
      else if (GATE_COLOR[ch]) level.gates.push({ x, y, color: GATE_COLOR[ch] });
      else if (PLATE_COLOR[ch]) level.plates.push({ x, y, color: PLATE_COLOR[ch] });
    }
  });

  if (spawns !== 1) throw new LevelError(`${def.id}: precisa de exatamente 1 spawn, tem ${spawns}`);
  if (exits !== 1) throw new LevelError(`${def.id}: precisa de exatamente 1 saída, tem ${exits}`);
  if (def.cycleLength < 1) throw new LevelError(`${def.id}: cycleLength inválido`);
  if (def.maxEchoes < 0) throw new LevelError(`${def.id}: maxEchoes inválido`);
  return level;
}

export function tileAt(level: Level, x: number, y: number): TileId {
  if (x < 0 || y < 0 || x >= level.w || y >= level.h) return TILE_WALL;
  return level.tiles[y * level.w + x];
}
