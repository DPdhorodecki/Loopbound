import { Level, LevelDef, parseLevel } from '../src/game/level';
import { Runtime, clearCode, confirmCode, createRuntime, interact, pressCode, tryMove } from '../src/game/rules';
import { Action, Dir } from '../src/game/types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

interface State {
  px: number;
  py: number;
  facing: Dir;
  beat: number;
  crates: { x: number; y: number }[];
  leversOn: string[];
  doorsOpen: string[];
  codeSolved: boolean;
  codeEntry: number[];
  gems: string[];
  hasKey: boolean;
  keyTaken: boolean;
  terminalOpen: boolean;
}

function toState(rt: Runtime): State {
  return {
    px: rt.player.x,
    py: rt.player.y,
    facing: rt.player.facing,
    beat: rt.beat,
    crates: rt.crates.map((c) => ({ x: c.x, y: c.y })),
    leversOn: [...rt.leversOn],
    doorsOpen: [...rt.doorsOpen],
    codeSolved: rt.codeSolved,
    codeEntry: [...rt.codeEntry],
    gems: [...rt.gems],
    hasKey: rt.hasKey,
    keyTaken: rt.keyTaken,
    terminalOpen: rt.terminalOpen,
  };
}

function fromState(level: Level, s: State): Runtime {
  const rt = createRuntime(level);
  rt.player = { x: s.px, y: s.py, facing: s.facing };
  rt.beat = s.beat;
  rt.crates = s.crates.map((c) => ({ ...c }));
  rt.leversOn = new Set(s.leversOn);
  rt.doorsOpen = new Set(s.doorsOpen);
  rt.codeSolved = s.codeSolved;
  rt.codeEntry = [...s.codeEntry];
  rt.gems = new Set(s.gems);
  rt.hasKey = s.hasKey;
  rt.keyTaken = s.keyTaken;
  rt.terminalOpen = s.terminalOpen;
  return rt;
}

function stateKey(s: State): string {
  const crates = s.crates.map((c) => `${c.x},${c.y}`).sort();
  return `${s.px},${s.py}|${crates.join(';')}|${[...s.leversOn].sort().join(',')}|${[...s.doorsOpen]
    .sort()
    .join(',')}|${s.codeSolved ? 1 : 0}|${s.codeEntry.join(',')}|${[...s.gems].sort().join(',')}|${
    s.keyTaken ? 1 : 0
  }${s.hasKey ? 1 : 0}${s.terminalOpen ? 1 : 0}`;
}

export interface SolveStats {
  nodes: number;
  capped: boolean;
}

/** Encontra a menor sequência de ações (um ciclo) que vence a fase. */
export function solveSingleCycle(
  def: LevelDef,
  maxNodes = 500_000,
  stats: SolveStats = { nodes: 0, capped: false },
): Action[] | null {
  const budget = Math.max(def.cycleLength, 200);
  const level = parseLevel({ ...def, cycleLength: budget, maxEchoes: 0 });
  const startState = toState(createRuntime(level));
  const states: State[] = [startState];
  const parent: number[] = [-1];
  const actionOf: (Action | null)[] = [null];
  const seen = new Set<string>([stateKey(startState)]);
  const queue = [0];
  let head = 0;

  while (head < queue.length) {
    const idx = queue[head++];
    const state = states[idx];
    const rt = fromState(level, state);

    const actions: Action[] = [...MOVES];
    if (!rt.terminalOpen) actions.push('E');
    else {
      const code = rt.level.code;
      if (code) {
        if (rt.codeEntry.length < code.sequence.length) actions.push('?');
        actions.push('C', 'X');
      }
    }

    for (const action of actions) {
      const next = fromState(level, state);
      let won = false;
      if (action === 'E') interact(next);
      else if (action === '?') pressCode(next, next.level.code!.sequence[next.codeEntry.length]);
      else if (action === 'C') confirmCode(next);
      else if (action === 'X') clearCode(next);
      else {
        const res = tryMove(next, action as Dir);
        if (!res.moved || res.died || res.cycleEnded) continue;
        if (res.won) won = true;
      }
      if (won) {
        const path: Action[] = [action];
        let cur = idx;
        while (actionOf[cur] !== null) {
          path.push(actionOf[cur]!);
          cur = parent[cur];
        }
        path.reverse();
        return path;
      }
      const ns = toState(next);
      const key = stateKey(ns);
      if (seen.has(key)) continue;
      seen.add(key);
      states.push(ns);
      parent.push(idx);
      actionOf.push(action);
      queue.push(states.length - 1);
      if (states.length > maxNodes) {
        stats.nodes = states.length;
        stats.capped = true;
        return null;
      }
    }
  }
  stats.nodes = states.length;
  return null;
}
