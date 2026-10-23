import { describe, expect, it } from 'vitest';
import { TUTORIAL_ROOMS } from '../src/game/tutorial';
import { parseLevel } from '../src/game/level';
import { createRuntime, endCycle, tryMove } from '../src/game/rules';

describe('tutorial', () => {
  it('tem 4 salas com ids únicos', () => {
    const ids = TUTORIAL_ROOMS.map((r) => r.def.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const room of TUTORIAL_ROOMS) {
    it(`${room.def.id}: solução vence`, () => {
      const level = parseLevel(room.def);
      const rt = createRuntime(level);
      room.def.solution.forEach((moves, index) => {
        const isLast = index === room.def.solution.length - 1;
        moves.forEach((dir) => {
          const res = tryMove(rt, dir);
          expect(res.moved, `movimento ${dir} bloqueado no ciclo ${index + 1}`).toBe(true);
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
