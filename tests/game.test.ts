import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { parseLevel } from '../src/game/level';
import {
  clearCode,
  colorPowered,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  pressure,
  tryMove,
  undo,
} from '../src/game/rules';
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

describe('fases', () => {
  it('tem 30 fases com ids únicos', () => {
    const ids = LEVELS.map((l) => l.id);
    expect(LEVELS).toHaveLength(30);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const def of LEVELS) {
    it(`${def.id}: mapa válido e solução vencedora`, () => {
      const level = parseLevel(def);
      const rt = createRuntime(level);

      def.solution.forEach((moves, index) => {
        const isLast = index === def.solution.length - 1;
        moves.forEach((token) => {
          const res = applyAction(rt, token);
          if (!res) return;
          expect(res.moved, `movimento ${token} bloqueado no ciclo ${index + 1}`).toBe(true);
          expect(rt.status === 'won').toBe(res.won ?? false);
        });
        if (!isLast) {
          expect(rt.status).toBe('playing');
          endCycle(rt, 'tab');
        }
      });

      expect(rt.status).toBe('won');
    });

    it(`${def.id}: solução usa no máximo maxEchoes ciclos`, () => {
      expect(def.solution.length - 1).toBeLessThanOrEqual(def.maxEchoes);
    });
  }
});

describe('regras', () => {
  it('empurra caixote e pressiona a placa', () => {
    const level = parseLevel(LEVELS[1]);
    const rt = createRuntime(level);
    // anda até empurrar o caixote para a placa
    for (const dir of ['D', 'R', 'R', 'D', 'D', 'L', 'D', 'R'] as const) {
      expect(tryMove(rt, dir).moved).toBe(true);
    }
    expect(pressure(rt).red).toBe(true);
    const gate = level.gates.find((g) => g.color === 'red')!;
    // atravessa a porta aberta
    for (const dir of ['U', 'U', 'R'] as const) tryMove(rt, dir);
    expect(rt.player.x).toBe(4);
    expect(rt.player.y).toBe(3);
    for (const dir of ['R', 'R', 'R'] as const) expect(tryMove(rt, dir).moved).toBe(true);
    expect(rt.player.x).toBe(7);
    expect(rt.player.y).toBe(3);
    expect(gate.x).toBe(7);
  });

  it('eco tem peso em placa', () => {
    const level = parseLevel(LEVELS[2]);
    const rt = createRuntime(level);
    for (const dir of ['D', 'D', 'D', 'R'] as const) tryMove(rt, dir);
    expect(pressure(rt).red).toBe(true);
    endCycle(rt, 'tab');
    expect(rt.echoes).toHaveLength(1);
    // no ciclo seguinte o eco chega à placa e o jogador sai de cima dela
    for (const dir of ['D', 'D', 'D', 'R', 'U'] as const) tryMove(rt, dir);
    expect(rt.player.x).toBe(2);
    expect(rt.player.y).toBe(3);
    expect(pressure(rt).red).toBe(true);
  });

  it('undo volta jogador, caixote e passo', () => {
    const level = parseLevel(LEVELS[1]);
    const rt = createRuntime(level);
    for (const dir of ['D', 'R', 'R'] as const) tryMove(rt, dir);
    const before = { x: rt.player.x, y: rt.player.y, beat: rt.beat };
    tryMove(rt, 'D');
    expect(rt.beat).toBe(before.beat + 1);
    expect(undo(rt)).toBe(true);
    expect(rt.player.x).toBe(before.x);
    expect(rt.player.y).toBe(before.y);
    expect(rt.beat).toBe(before.beat);
  });

  it('vazio mata e encerra o ciclo', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-vazio',
      map: ['#####', '#P~E#', '#####'],
      maxEchoes: 1,
      solution: [],
    });
    const rt = createRuntime(level);
    rt.player = { x: 1, y: 1, facing: 'R' };
    const res = tryMove(rt, 'R');
    expect(res.died).toBe(true);
    expect(rt.echoes).toHaveLength(1);
    expect(rt.player.x).toBe(1);
    expect(rt.player.y).toBe(1);
  });

  it('não deixa empurrar caixote para o vazio', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-caixote-vazio',
      map: ['#######', '#PC~.E#', '#######'],
      solution: [],
    });
    const rt = createRuntime(level);
    const res = tryMove(rt, 'R');
    expect(res.moved).toBe(false);
    expect(res.blocked).toBe('void');
  });

  it('limita o número de ecos', () => {
    const level = parseLevel(LEVELS[2]);
    const rt = createRuntime(level);
    for (let i = 0; i < 3; i++) {
      tryMove(rt, i % 2 === 0 ? 'R' : 'L');
      endCycle(rt, 'tab');
    }
    expect(rt.echoes).toHaveLength(level.def.maxEchoes);
  });
});

describe('mecânicas novas', () => {
  it('alavanca abre o portão e fica ligada', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-alavanca',
      map: ['########', '#P.VR.E#', '########'],
      maxEchoes: 0,
      solution: [],
    });
    const rt = createRuntime(level);
    tryMove(rt, 'R'); // (2,1), encara a alavanca
    expect(interact(rt)).toBe('lever');
    expect(rt.leversOn.size).toBe(1);
    tryMove(rt, 'R'); // pisa na alavanca
    tryMove(rt, 'R'); // cruza o portão aberto
    expect(rt.player.x).toBe(4);
  });

  it('botão liga com caixote em cima', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-botao',
      map: ['#########', '#P...R.E#', '#.C.....#', '#.H.....#', '#########'],
      maxEchoes: 0,
      solution: [],
    });
    const rt = createRuntime(level);
    tryMove(rt, 'R'); // (2,1)
    tryMove(rt, 'D'); // empurra o caixote para o botão
    expect(colorPowered(rt).red).toBe(true);
    tryMove(rt, 'U');
    for (const dir of ['R', 'R', 'R', 'R', 'R'] as const) {
      expect(tryMove(rt, dir).moved).toBe(true);
    }
    expect(rt.status).toBe('won');
  });

  it('duto teleporta para o par', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-duto',
      map: ['########', '#P.O.###', '#...#oE#', '########'],
      maxEchoes: 0,
      solution: [],
    });
    const rt = createRuntime(level);
    tryMove(rt, 'R');
    const res = tryMove(rt, 'R');
    expect(res.teleported).toBe(true);
    expect(rt.player.x).toBe(5);
    expect(rt.player.y).toBe(2);
  });

  it('tela de código abre com a sequência certa', () => {
    const level = parseLevel({
      ...LEVELS[0],
      id: 'teste-codigo',
      map: ['########', '#P.X..E#', '########'],
      maxEchoes: 0,
      solution: [],
      code: { type: 'roman', sequence: [2, 0, 1] },
    });
    const rt = createRuntime(level);
    tryMove(rt, 'R');
    expect(interact(rt)).toBe('terminal');
    expect(rt.terminalOpen).toBe(true);
    pressCode(rt, 0);
    expect(confirmCode(rt)).toBe(false);
    expect(rt.codeSolved).toBe(false);
    expect(interact(rt)).toBe('terminal');
    pressCode(rt, 2);
    pressCode(rt, 0);
    pressCode(rt, 1);
    expect(confirmCode(rt)).toBe(true);
    expect(rt.codeSolved).toBe(true);
  });
});
