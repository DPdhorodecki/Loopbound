import { describe, expect, it } from 'vitest';
import { TUTORIAL_ROOMS } from '../src/game/tutorial';
import { parseLevel } from '../src/game/level';
import { clearCode, confirmCode, createRuntime, endCycle, interact, pressCode, tryMove } from '../src/game/rules';
import { Action, Dir } from '../src/game/types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

/** Aplica um token da solução; devolve o resultado quando é um movimento. */
function applyAction(rt: ReturnType<typeof createRuntime>, token: Action) {
  if (MOVES.includes(token as Dir)) return tryMove(rt, token as Dir);
  if (token === 'E') interact(rt);
  else if (token === 'C') confirmCode(rt);
  else if (token === 'X') clearCode(rt);
  else pressCode(rt, Number(token) - 1);
  return null;
}

describe('tutorial', () => {
  it('tem 8 salas com ids únicos', () => {
    const ids = TUTORIAL_ROOMS.map((r) => r.def.id);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const room of TUTORIAL_ROOMS) {
    it(`${room.def.id}: solução vence`, () => {
      const level = parseLevel(room.def);
      const rt = createRuntime(level);
      room.def.solution.forEach((moves, index) => {
        const isLast = index === room.def.solution.length - 1;
        moves.forEach((token) => {
          const res = applyAction(rt, token);
          if (!res) return;
          expect(res.moved, `movimento ${token} bloqueado no ciclo ${index + 1}`).toBe(true);
        });
        if (!isLast) {
          expect(rt.status).toBe('playing');
          endCycle(rt, 'tab');
        }
      });
      expect(rt.status).toBe('won');
    });
  }
});
