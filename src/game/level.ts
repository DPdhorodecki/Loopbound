import { Action, CODE_COLORS, ColorKey, ROMAN, TILE_FLOOR, TILE_VOID, TILE_WALL, TileId, Vec } from './types';

export interface Gate extends Vec {
  color: ColorKey;
}

export interface Plate extends Vec {
  color: ColorKey;
}

/** Alavanca: acionada com `E`; fica ligada até ser acionada de novo. */
export interface Lever extends Vec {
  color: ColorKey;
}

/** Botão: precisa de peso — um caixote em cima o mantém pressionado. */
export interface Button extends Vec {
  color: ColorKey;
}

/** Duto: pisar nele teleporta para o par (mesmo `pair`). */
export interface Duct extends Vec {
  pair: number;
}

/** Quadrado de código desenhado no chão (pista). */
export interface ClueTile extends Vec {
  kind: 'roman' | 'color';
  /** Índice do símbolo (0..8). Sobrescrito pela senha gerada no load. */
  value: number;
}

/** Código resolvido para uma fase carregada (a resposta que a tela espera). */
export interface ResolvedCode {
  type: 'roman' | 'color';
  /** Índices 0..8, na ordem exigida. */
  sequence: number[];
}

export interface CodeSpec {
  type: 'roman' | 'color';
  /**
   * Senha fixa (tutorial/testes). Quando ausente, o `parseLevel` sorteia uma
   * sequência no início da fase e escreve os valores nas pistas do chão.
   */
  sequence?: number[];
}

export interface LevelDef {
  id: string;
  name: string;
  subtitle: string;
  cycleLength: number;
  maxEchoes: number;
  par: { cycles: number; steps: number };
  map: string[];
  /** Um array de ações por ciclo. O último ciclo precisa terminar vencendo. */
  solution: Action[][];
  /** Cofre de código opcional (tela `X`). */
  code?: CodeSpec;
  /**
   * Caixotes posicionados fora do mapa (o caractere fica livre para outra
   * entidade). Usado, por exemplo, para um caixote começar em cima de um duto.
   */
  crates?: Vec[];
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
  levers: Lever[];
  buttons: Button[];
  ducts: Duct[];
  codeGates: Vec[];
  terminal: Vec | null;
  clueTiles: ClueTile[];
  /** Código resolvido (senha já sorteada) ou `null` se a fase não tem senha. */
  code: ResolvedCode | null;
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
  // mecânicas novas
  V: TILE_FLOOR,
  W: TILE_FLOOR,
  Z: TILE_FLOOR,
  H: TILE_FLOOR,
  I: TILE_FLOOR,
  J: TILE_FLOOR,
  O: TILE_FLOOR,
  o: TILE_FLOOR,
  Q: TILE_FLOOR,
  q: TILE_FLOOR,
  X: TILE_FLOOR,
  '@': TILE_FLOOR,
  c: TILE_FLOOR,
  d: TILE_FLOOR,
  e: TILE_FLOOR,
  '1': TILE_FLOOR,
  '2': TILE_FLOOR,
  '3': TILE_FLOOR,
  '4': TILE_FLOOR,
  '5': TILE_FLOOR,
  '6': TILE_FLOOR,
  '7': TILE_FLOOR,
  '8': TILE_FLOOR,
  '9': TILE_FLOOR,
};

const GATE_COLOR: Record<string, ColorKey> = { R: 'red', L: 'blue', Y: 'gold' };
const PLATE_COLOR: Record<string, ColorKey> = { r: 'red', b: 'blue', y: 'gold' };
const LEVER_COLOR: Record<string, ColorKey> = { V: 'red', W: 'blue', Z: 'gold' };
const BUTTON_COLOR: Record<string, ColorKey> = { H: 'red', I: 'blue', J: 'gold' };
const DUCT_PAIR: Record<string, number> = { O: 0, o: 0, Q: 1, q: 1 };
/** Caracteres que marcam uma pista de cor no chão (o valor é sobrescrito). */
const COLOR_CLUE: Record<string, number> = { c: 0, d: 0, e: 0 };

export class LevelError extends Error {}

const SYMBOLS = { roman: ROMAN.length, color: CODE_COLORS.length } as const;

/**
 * Sorteia a senha da fase. Rejeita sequências triviais (um único símbolo
 * repetido, ou uma contagem crescente/decrescente 0,1,2…) para que a senha
 * nunca seja previsível.
 */
export function generateSequence(length: number, alphabet: number, rng: () => number = Math.random): number[] {
  for (let attempt = 0; attempt < 400; attempt++) {
    const seq = Array.from({ length }, () => Math.floor(rng() * alphabet));
    if (new Set(seq).size < 2) continue;
    let asc = true;
    let desc = true;
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] !== seq[i - 1] + 1) asc = false;
      if (seq[i] !== seq[i - 1] - 1) desc = false;
    }
    if (asc || desc) continue;
    return seq;
  }
  // Rede de segurança determinística (nunca trivial).
  return Array.from({ length }, (_, i) => (i * 2 + 1) % alphabet);
}

export function parseLevel(def: LevelDef, rng: () => number = Math.random): Level {
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
    levers: [],
    buttons: [],
    ducts: [],
    codeGates: [],
    terminal: null,
    clueTiles: [],
    code: null,
  };
  let spawns = 0;
  let exits = 0;
  let terminals = 0;

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
      else if (ch === 'X') {
        level.terminal = { x, y };
        terminals++;
      } else if (ch === '@') level.codeGates.push({ x, y });
      else if (LEVER_COLOR[ch]) level.levers.push({ x, y, color: LEVER_COLOR[ch] });
      else if (BUTTON_COLOR[ch]) level.buttons.push({ x, y, color: BUTTON_COLOR[ch] });
      else if (ch in DUCT_PAIR) level.ducts.push({ x, y, pair: DUCT_PAIR[ch] });
      else if (ch in COLOR_CLUE) level.clueTiles.push({ x, y, kind: 'color', value: 0 });
      else if (ch >= '1' && ch <= '9') level.clueTiles.push({ x, y, kind: 'roman', value: Number(ch) - 1 });
      else if (GATE_COLOR[ch]) level.gates.push({ x, y, color: GATE_COLOR[ch] });
      else if (PLATE_COLOR[ch]) level.plates.push({ x, y, color: PLATE_COLOR[ch] });
    }
  });

  if (def.crates) {
    for (const c of def.crates) level.crates.push({ x: c.x, y: c.y });
  }

  if (def.code) {
    const spec = def.code;
    if (level.clueTiles.length < 2) {
      throw new LevelError(`${def.id}: fase de código precisa de ao menos 2 pistas no chão`);
    }
    const kinds = new Set(level.clueTiles.map((c) => c.kind));
    if (kinds.size !== 1 || !kinds.has(spec.type)) {
      throw new LevelError(`${def.id}: pistas de chão não batem com o tipo "${spec.type}"`);
    }
    const sequence = spec.sequence ?? generateSequence(level.clueTiles.length, SYMBOLS[spec.type], rng);
    if (sequence.length !== level.clueTiles.length) {
      throw new LevelError(
        `${def.id}: senha tem ${sequence.length} símbolos, mas há ${level.clueTiles.length} pistas no chão`,
      );
    }
    if (sequence.some((v) => !Number.isInteger(v) || v < 0 || v >= SYMBOLS[spec.type])) {
      throw new LevelError(`${def.id}: símbolo de senha fora do intervalo`);
    }
    level.clueTiles.forEach((clue, i) => {
      clue.value = sequence[i];
    });
    level.code = { type: spec.type, sequence: [...sequence] };
  }

  if (spawns !== 1) throw new LevelError(`${def.id}: precisa de exatamente 1 spawn, tem ${spawns}`);
  if (exits !== 1) throw new LevelError(`${def.id}: precisa de exatamente 1 saída, tem ${exits}`);
  if (def.cycleLength < 1) throw new LevelError(`${def.id}: cycleLength inválido`);
  if (def.maxEchoes < 0) throw new LevelError(`${def.id}: maxEchoes inválido`);
  if (terminals > 1) throw new LevelError(`${def.id}: no máximo 1 tela de código, tem ${terminals}`);
  if (level.terminal && !def.code) throw new LevelError(`${def.id}: tela de código sem \`code\` definido`);
  if (def.code && !level.terminal) throw new LevelError(`${def.id}: \`code\` definido sem tela de código (\`X\`)`);
  return level;
}

export function tileAt(level: Level, x: number, y: number): TileId {
  if (x < 0 || y < 0 || x >= level.w || y >= level.h) return TILE_WALL;
  return level.tiles[y * level.w + x];
}
