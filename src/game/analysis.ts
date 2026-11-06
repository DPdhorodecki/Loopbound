import { Level, LevelDef, parseLevel } from './level';
import {
  clearCode,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  pressNext,
  Runtime,
  tryMove,
} from './rules';
import { Action, Dir, cellKey } from './types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

export interface MechanicTrace {
  levers: Set<string>;
  buttons: Set<string>;
  plates: Set<string>;
  ducts: Set<number>;
  gates: Set<string>;
  codeGates: Set<string>;
  doors: Set<string>;
  keys: number;
  terminals: number;
  codes: number;
  cratesPushed: Set<number>;
  gems: Set<string>;
  echoes: number;
  deaths: number;
  prematureEnd: string[];
}

export interface TraceReport {
  trace: MechanicTrace;
  won: boolean;
  blocked: string[];
  prematureEnd: string[];
}

const emptyTrace = (): MechanicTrace => ({
  levers: new Set(),
  buttons: new Set(),
  plates: new Set(),
  ducts: new Set(),
  gates: new Set(),
  codeGates: new Set(),
  doors: new Set(),
  keys: 0,
  terminals: 0,
  codes: 0,
  cratesPushed: new Set(),
  gems: new Set(),
  echoes: 0,
  deaths: 0,
  prematureEnd: [],
});

function occupied(rt: Runtime): Set<string> {
  const out = new Set<string>();
  out.add(cellKey(rt.player.x, rt.player.y));
  rt.crates.forEach((c) => out.add(cellKey(c.x, c.y)));
  rt.echoes.forEach((echo) => {
    const p = echo.track[Math.min(rt.beat, echo.track.length - 1)];
    out.add(cellKey(p.x, p.y));
  });
  return out;
}

/** Marca tudo o que está fisicamente em cima de uma placa/botão (jogador, caixote ou eco). */
function markPlates(rt: Runtime, trace: MechanicTrace): void {
  const cells = occupied(rt);
  for (const plate of rt.level.plates) {
    if (cells.has(cellKey(plate.x, plate.y))) trace.plates.add(cellKey(plate.x, plate.y));
  }
  for (const button of rt.level.buttons) {
    if (cells.has(cellKey(button.x, button.y)) || rt.playerPress.has(cellKey(button.x, button.y))) {
      trace.buttons.add(cellKey(button.x, button.y));
    }
  }
}

function applyAction(rt: Runtime, token: Action, trace: MechanicTrace, cycle: number): void {
  if (MOVES.includes(token as Dir)) {
    const before = rt.player;
    const beforeCrates = rt.crates.map((c) => `${c.x},${c.y}`);
    const res = tryMove(rt, token as Dir);
    if (!res.moved) return;
    if (res.pushed) {
      rt.crates.forEach((c, i) => {
        if (`${c.x},${c.y}` !== beforeCrates[i]) trace.cratesPushed.add(i);
      });
    }
    if (res.teleported) {
      const d = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }[token as Dir];
      const entry = rt.level.ducts.find(
        (duct) => duct.x === before.x + d[0] && duct.y === before.y + d[1],
      );
      if (entry) trace.ducts.add(entry.pair);
    }
    if (res.gem) trace.gems.add(cellKey(rt.player.x, rt.player.y));
    if (res.key) trace.keys++;
    if (res.door) trace.doors.add(cellKey(rt.player.x, rt.player.y));
    if (res.died) trace.deaths++;
    if (res.cycleEnded) trace.prematureEnd.push(`ciclo ${cycle}: ${token}`);
    const here = cellKey(rt.player.x, rt.player.y);
    const gate = rt.level.gates.find((g) => cellKey(g.x, g.y) === here);
    if (gate) trace.gates.add(here);
    if (rt.level.codeGates.some((g) => cellKey(g.x, g.y) === here)) trace.codeGates.add(here);
    markPlates(rt, trace);
    return;
  }

  if (token === 'E') {
    const leversBefore = new Set(rt.leversOn);
    const buttonsBefore = new Set(rt.playerPress);
    const target = interact(rt);
    if (target === 'terminal') {
      trace.terminals++;
    } else if (target === 'lever') {
      for (const lever of rt.level.levers) {
        const key = cellKey(lever.x, lever.y);
        if (leversBefore.has(key) !== rt.leversOn.has(key)) trace.levers.add(key);
      }
    } else if (target === 'button') {
      for (const button of rt.level.buttons) {
        const key = cellKey(button.x, button.y);
        if (buttonsBefore.has(key) !== rt.playerPress.has(key)) trace.buttons.add(key);
      }
    }
    markPlates(rt, trace);
    return;
  }

  if (token === '?') {
    pressNext(rt);
    return;
  }
  if (token === 'C') {
    if (confirmCode(rt)) trace.codes++;
    return;
  }
  if (token === 'X') {
    clearCode(rt);
    return;
  }
  if (token >= '1' && token <= '9') pressCode(rt, Number(token) - 1);
}

/** Replaya a solução de referência e registra cada mecânica realmente usada. */
export function traceSolution(def: LevelDef, level: Level = parseLevel(def)): TraceReport {
  const rt = createRuntime(level);
  const trace = emptyTrace();
  const blocked: string[] = [];
  const prematureEnd = trace.prematureEnd;

  def.solution.forEach((cycle, index) => {
    const isLast = index === def.solution.length - 1;
    markPlates(rt, trace);
    for (const token of cycle) {
      applyAction(rt, token, trace, index + 1);
      if (rt.lastEnd === 'steps' && !isLast) prematureEnd.push(`ciclo ${index + 1}: orçamento`);
    }
    if (!isLast) {
      if (rt.status !== 'playing') blocked.push(`ciclo ${index + 1}: status ${rt.status}`);
      endCycle(rt, 'tab');
      trace.echoes = Math.max(trace.echoes, rt.echoes.length);
    }
  });

  return { trace, won: rt.status === 'won', blocked, prematureEnd };
}

export interface OrphanReport {
  gatesWithoutSource: string[];
  sourcesWithoutGate: string[];
  unpairedDucts: string[];
  codeWithoutTerminal: string[];
  keyDoorMismatch: string[];
}

/** Aponta mecânicas que existem no mapa mas não participam de nenhum circuito. */
export function orphans(level: Level): OrphanReport {
  const sources = new Set<string>();
  level.plates.forEach((p) => sources.add(p.color));
  level.levers.forEach((l) => sources.add(l.color));
  level.buttons.forEach((b) => sources.add(b.color));
  const gates = new Set<string>();
  level.gates.forEach((g) => gates.add(g.color));

  const gatesWithoutSource: string[] = [];
  const sourcesWithoutGate: string[] = [];
  gates.forEach((color) => {
    if (!sources.has(color)) gatesWithoutSource.push(color);
  });
  sources.forEach((color) => {
    if (!gates.has(color)) sourcesWithoutGate.push(color);
  });

  const unpairedDucts: string[] = [];
  const pairs = new Set<number>();
  level.ducts.forEach((d) => pairs.add(d.pair));
  pairs.forEach((pair) => {
    if (level.ducts.filter((d) => d.pair === pair).length !== 2) {
      unpairedDucts.push(String(pair));
    }
  });

  const codeWithoutTerminal: string[] = [];
  if (level.code && !level.terminal) codeWithoutTerminal.push('code sem terminal');
  if (level.codeGates.length > 0 && !level.code) codeWithoutTerminal.push('portão de código sem senha');
  if (level.terminal && !level.code) codeWithoutTerminal.push('terminal sem senha');

  const keyDoorMismatch: string[] = [];
  if (level.key && level.doors.length === 0) keyDoorMismatch.push('chave sem porta');
  if (!level.key && level.doors.length > 0) keyDoorMismatch.push('porta sem chave');
  if (level.doors.length > 1) keyDoorMismatch.push('mais de uma porta para uma chave');

  return { gatesWithoutSource, sourcesWithoutGate, unpairedDucts, codeWithoutTerminal, keyDoorMismatch };
}

/** Lista as mecânicas que a solução não usou. Vazio = tudo é obrigatório. */
export function unusedMechanics(level: Level, trace: MechanicTrace): string[] {
  const unused: string[] = [];
  level.levers.forEach((l) => {
    if (!trace.levers.has(cellKey(l.x, l.y))) unused.push(`alavanca ${l.x},${l.y}`);
  });
  level.buttons.forEach((b) => {
    if (!trace.buttons.has(cellKey(b.x, b.y))) unused.push(`botão ${b.x},${b.y}`);
  });
  level.plates.forEach((p) => {
    if (!trace.plates.has(cellKey(p.x, p.y))) unused.push(`placa ${p.x},${p.y}`);
  });
  const pairs = new Set(level.ducts.map((d) => d.pair));
  pairs.forEach((pair) => {
    if (!trace.ducts.has(pair)) unused.push(`duto ${pair}`);
  });
  level.gates.forEach((g) => {
    if (!trace.gates.has(cellKey(g.x, g.y))) unused.push(`portão ${g.x},${g.y}`);
  });
  level.codeGates.forEach((g) => {
    if (!trace.codeGates.has(cellKey(g.x, g.y))) unused.push(`portão de código ${g.x},${g.y}`);
  });
  level.doors.forEach((d) => {
    if (!trace.doors.has(cellKey(d.x, d.y))) unused.push(`porta ${d.x},${d.y}`);
  });
  if (level.key && trace.keys < 1) unused.push('chave');
  if (level.terminal && trace.terminals < 1) unused.push('terminal');
  if (level.code && trace.codes < 1) unused.push('senha');
  level.crates.forEach((_, i) => {
    if (!trace.cratesPushed.has(i)) unused.push(`caixote ${i + 1}`);
  });
  return unused;
}
