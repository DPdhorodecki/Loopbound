import { Level, tileAt } from './level';
import {
  ColorKey,
  DIRS,
  Dir,
  EndReason,
  Pose,
  TILE_VOID,
  TILE_WALL,
  Vec,
  cellKey,
} from './types';

export interface Echo {
  track: Pose[];
}

export interface Snapshot {
  player: Pose;
  crates: Vec[];
  gems: string[];
  hasKey: boolean;
  keyTaken: boolean;
  doorsOpen: string[];
  beat: number;
  trackLen: number;
}

export interface Runtime {
  level: Level;
  player: Pose;
  crates: Vec[];
  gems: Set<string>;
  hasKey: boolean;
  keyTaken: boolean;
  doorsOpen: Set<string>;
  anchorsOn: Set<string>;
  echoes: Echo[];
  beat: number;
  cycle: number;
  cyclesUsed: number;
  stepsTotal: number;
  track: Pose[];
  history: Snapshot[];
  status: 'playing' | 'won';
  lastEnd: EndReason | null;
}

export interface MoveResult {
  moved: boolean;
  blocked?: 'wall' | 'gate' | 'door' | 'crate' | 'void';
  pushed?: boolean;
  died?: boolean;
  won?: boolean;
  cycleEnded?: boolean;
  endReason?: EndReason;
  gem?: boolean;
  key?: boolean;
  door?: boolean;
}

const clonePose = (p: Pose): Pose => ({ x: p.x, y: p.y, facing: p.facing });
const cloneVec = (v: Vec): Vec => ({ x: v.x, y: v.y });

export function createRuntime(level: Level): Runtime {
  return {
    level,
    player: { ...level.spawn, facing: 'D' },
    crates: level.crates.map(cloneVec),
    gems: new Set<string>(),
    hasKey: false,
    keyTaken: false,
    doorsOpen: new Set<string>(),
    anchorsOn: new Set<string>(),
    echoes: [],
    beat: 0,
    cycle: 1,
    cyclesUsed: 0,
    stepsTotal: 0,
    track: [{ ...level.spawn, facing: 'D' }],
    history: [],
    status: 'playing',
    lastEnd: null,
  };
}

export function restartLevel(level: Level): Runtime {
  return createRuntime(level);
}

export function crateIndexAt(rt: Runtime, x: number, y: number): number {
  return rt.crates.findIndex((c) => c.x === x && c.y === y);
}

export function gateAt(rt: Runtime, x: number, y: number) {
  return rt.level.gates.find((g) => g.x === x && g.y === y);
}

export function plateAt(rt: Runtime, x: number, y: number) {
  return rt.level.plates.find((p) => p.x === x && p.y === y);
}

export function doorAt(rt: Runtime, x: number, y: number): boolean {
  return rt.level.doors.some((d) => d.x === x && d.y === y);
}

export function echoPoses(rt: Runtime): Pose[] {
  return rt.echoes.map((e) => e.track[Math.min(rt.beat, e.track.length - 1)]);
}

/** Quem está em cima de cada placa agora (jogador, caixotes e ecos têm peso). */
export function pressure(rt: Runtime): Record<ColorKey, boolean> {
  const occupied = new Set<string>();
  occupied.add(cellKey(rt.player.x, rt.player.y));
  rt.crates.forEach((c) => occupied.add(cellKey(c.x, c.y)));
  echoPoses(rt).forEach((e) => occupied.add(cellKey(e.x, e.y)));

  const result: Record<ColorKey, boolean> = { red: false, blue: false, gold: false };
  for (const plate of rt.level.plates) {
    if (occupied.has(cellKey(plate.x, plate.y))) result[plate.color] = true;
  }
  return result;
}

export function gateOpenAt(rt: Runtime, x: number, y: number): boolean {
  const gate = gateAt(rt, x, y);
  if (!gate) return true;
  return pressure(rt)[gate.color];
}

export function isDoorOpen(rt: Runtime, x: number, y: number): boolean {
  return rt.doorsOpen.has(cellKey(x, y));
}

function blockedBy(rt: Runtime, x: number, y: number, forCrate = false): MoveResult['blocked'] | null {
  if (tileAt(rt.level, x, y) === TILE_WALL) return 'wall';
  const gate = gateAt(rt, x, y);
  if (gate && !gateOpenAt(rt, x, y)) return 'gate';
  if (doorAt(rt, x, y) && !isDoorOpen(rt, x, y)) {
    if (!rt.hasKey) return 'door';
  }
  if (forCrate && tileAt(rt.level, x, y) === TILE_VOID) return 'void';
  return null;
}

function pushSnapshot(rt: Runtime): void {
  rt.history.push({
    player: clonePose(rt.player),
    crates: rt.crates.map(cloneVec),
    gems: [...rt.gems],
    hasKey: rt.hasKey,
    keyTaken: rt.keyTaken,
    doorsOpen: [...rt.doorsOpen],
    beat: rt.beat,
    trackLen: rt.track.length,
  });
  if (rt.history.length > 256) rt.history.shift();
}

export function undo(rt: Runtime): boolean {
  const snap = rt.history.pop();
  if (!snap) return false;
  rt.player = clonePose(snap.player);
  rt.crates = snap.crates.map(cloneVec);
  rt.gems = new Set(snap.gems);
  rt.hasKey = snap.hasKey;
  rt.keyTaken = snap.keyTaken;
  rt.doorsOpen = new Set(snap.doorsOpen);
  rt.beat = snap.beat;
  rt.track = rt.track.slice(0, snap.trackLen);
  rt.status = 'playing';
  rt.lastEnd = null;
  return true;
}

export function tryMove(rt: Runtime, dir: Dir): MoveResult {
  if (rt.status !== 'playing') return { moved: false };
  const d = DIRS[dir];
  const nx = rt.player.x + d.x;
  const ny = rt.player.y + d.y;

  const direct = blockedBy(rt, nx, ny);
  if (direct) return { moved: false, blocked: direct };

  // Cadeia de caixotes
  const chain: number[] = [];
  let cx = nx;
  let cy = ny;
  let guard = 0;
  while (crateIndexAt(rt, cx, cy) >= 0 && guard++ < 32) {
    chain.push(crateIndexAt(rt, cx, cy));
    cx += d.x;
    cy += d.y;
  }

  if (chain.length > 0) {
    const beyond = blockedBy(rt, cx, cy, true);
    if (beyond) return { moved: false, blocked: beyond };
    if (crateIndexAt(rt, cx, cy) >= 0) return { moved: false, blocked: 'crate' };
    for (let i = chain.length - 1; i >= 0; i--) {
      const c = rt.crates[chain[i]];
      rt.crates[chain[i]] = { x: c.x + d.x, y: c.y + d.y };
    }
  }

  pushSnapshot(rt);
  rt.player = { x: nx, y: ny, facing: dir };
  rt.beat++;
  rt.stepsTotal++;
  rt.track.push(clonePose(rt.player));

  const result: MoveResult = { moved: true, pushed: chain.length > 0 };

  // Porta com chave
  if (doorAt(rt, nx, ny) && !isDoorOpen(rt, nx, ny) && rt.hasKey) {
    rt.doorsOpen.add(cellKey(nx, ny));
    rt.hasKey = false;
    result.door = true;
  }

  // Coletáveis
  const gemKey = cellKey(nx, ny);
  if (rt.level.gems.some((g) => cellKey(g.x, g.y) === gemKey) && !rt.gems.has(gemKey)) {
    rt.gems.add(gemKey);
    result.gem = true;
  }
  if (!rt.keyTaken && rt.level.key && rt.level.key.x === nx && rt.level.key.y === ny) {
    rt.keyTaken = true;
    rt.hasKey = true;
    result.key = true;
  }

  // Morte
  if (tileAt(rt.level, nx, ny) === TILE_VOID) {
    result.died = true;
    endCycle(rt, 'death');
    result.cycleEnded = true;
    result.endReason = 'death';
    return result;
  }

  // Vitória
  if (nx === rt.level.exit.x && ny === rt.level.exit.y) {
    rt.status = 'won';
    result.won = true;
    return result;
  }

  // Fim por orçamento
  if (rt.beat >= rt.level.def.cycleLength) {
    endCycle(rt, 'steps');
    result.cycleEnded = true;
    result.endReason = 'steps';
  }
  return result;
}

export function endCycle(rt: Runtime, reason: EndReason): void {
  if (rt.status === 'won') return;

  if (rt.track.length > 1) {
    rt.echoes.push({ track: rt.track.map(clonePose) });
    while (rt.echoes.length > rt.level.def.maxEchoes) rt.echoes.shift();
  }

  rt.cyclesUsed++;
  rt.lastEnd = reason;
  rt.player = { ...rt.level.spawn, facing: 'D' };
  rt.crates = rt.level.crates.map(cloneVec);
  rt.beat = 0;
  rt.track = [{ ...rt.level.spawn, facing: 'D' }];
  rt.history = [];
  rt.cycle++;
  rt.status = 'playing';
}

export function gemsRemaining(rt: Runtime): number {
  return rt.level.gems.length - rt.gems.size;
}

export function hasEchoRoom(rt: Runtime): boolean {
  return rt.echoes.length < rt.level.def.maxEchoes;
}
