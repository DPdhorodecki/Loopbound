import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { TUTORIAL_ROOMS } from '../src/game/tutorial';
import { LevelDef, parseLevel, tileAt } from '../src/game/level';
import {
  clearCode,
  colorPowered,
  confirmCode,
  createRuntime,
  endCycle,
  interact,
  pressCode,
  pressNext,
  pressure,
  tryMove,
  undo,
} from '../src/game/rules';
import { Action, Dir, TILE_VOID, TILE_WALL } from '../src/game/types';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

/** Aplica um token da solução; devolve o resultado quando é um movimento. */
function applyAction(rt: ReturnType<typeof createRuntime>, token: Action) {
  if (MOVES.includes(token as Dir)) return tryMove(rt, token as Dir);
  if (token === 'E') interact(rt);
  else if (token === 'C') confirmCode(rt);
  else if (token === 'X') clearCode(rt);
  else if (token === '?') pressNext(rt);
  else pressCode(rt, Number(token) - 1);
  return null;
}

/**
 * Caminho "sem mecânica": portões, portas, portão de código e dutos são
 * tratados como parede (o jogador não pode andar por cima deles) e caixotes
 * bloqueiam. Se ainda assim dá pra chegar à saída, a fase tem caminho livre e a
 * mecânica é opcional — o que não pode acontecer.
 */
function hasFreePath(def: LevelDef): boolean {
  const level = parseLevel(def);
  const blocked = (x: number, y: number) =>
    tileAt(level, x, y) === TILE_WALL ||
    tileAt(level, x, y) === TILE_VOID ||
    level.gates.some((g) => g.x === x && g.y === y) ||
    level.doors.some((d) => d.x === x && d.y === y) ||
    level.codeGates.some((g) => g.x === x && g.y === y) ||
    level.crates.some((c) => c.x === x && c.y === y) ||
    level.ducts.some((d) => d.x === x && d.y === y);

  const start = level.spawn;
  const seen = new Set<string>([`${start.x},${start.y}`]);
  const queue: { x: number; y: number }[] = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.x === level.exit.x && cur.y === level.exit.y) return true;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= level.w || ny >= level.h) continue;
      if (seen.has(key) || blocked(nx, ny)) continue;
      seen.add(key);
      queue.push({ x: nx, y: ny });
    }
  }
  return false;
}

/** A solução de referência não pode estourar o orçamento no meio de um ciclo. */
function hasPrematureCycleEnd(def: LevelDef): boolean {
  const level = parseLevel(def);
  const rt = createRuntime(level);
  let bad = false;
  def.solution.forEach((moves, index) => {
    const isLast = index === def.solution.length - 1;
    moves.forEach((token) => {
      const res = applyAction(rt, token);
      if (res?.cycleEnded && !(isLast && res.won)) bad = true;
    });
    if (!isLast) endCycle(rt, 'tab');
  });
  return bad;
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
      tryMove(rt, 'D');
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
      map: ['##############', '#P.X..E......#', '#.1.2.3......#', '##############'],
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

/**
 * Invariantes de design. A fase `primeiros-passos` (e a sala `tuto-andar`) são
 * intencionalmente um caminho livre, pois ensinam a andar.
 */
const FREE_PATH_OK = new Set(['primeiros-passos', 'tuto-andar']);

describe('invariantes das fases', () => {
  for (const def of LEVELS) {
    it(`${def.id}: não tem caminho livre`, () => {
      if (FREE_PATH_OK.has(def.id)) return;
      expect(hasFreePath(def)).toBe(false);
    });
    it(`${def.id}: solução não encerra o ciclo antes da hora`, () => {
      expect(hasPrematureCycleEnd(def)).toBe(false);
    });
  }
});

describe('invariantes do tutorial', () => {
  for (const room of TUTORIAL_ROOMS) {
    it(`${room.def.id}: não tem caminho livre`, () => {
      if (FREE_PATH_OK.has(room.def.id)) return;
      expect(hasFreePath(room.def)).toBe(false);
    });
  }
});

/** Gerador determinístico para testar a senha sorteada. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Conta as categorias de mecânica presentes numa fase. */
function mechanicCount(level: ReturnType<typeof parseLevel>): number {
  const set = new Set<string>();
  if (level.levers.length) set.add('lever');
  if (level.buttons.length) set.add('button');
  if (level.ducts.length) set.add('duct');
  if (level.code) set.add('code');
  if (level.plates.length || level.gates.length) set.add('peso/cor');
  if (level.crates.length) set.add('crate');
  if (level.doors.length || level.key) set.add('chave/porta');
  if (level.gems.length) set.add('gem');
  if (level.tiles.some((t) => t === TILE_VOID)) set.add('void');
  if (level.def.maxEchoes > 0) set.add('echo');
  return set.size;
}

describe('sistema de senha gerado por fase', () => {
  const codeLevels = LEVELS.filter((l) => l.code);

  it('há várias fases com senha e mais de uma de cor', () => {
    expect(codeLevels.length).toBeGreaterThanOrEqual(6);
    expect(codeLevels.filter((l) => l.code!.type === 'color').length).toBeGreaterThanOrEqual(4);
  });

  for (const def of codeLevels) {
    it(`${def.id}: sorteia senha não trivial e escreve nas pistas do chão`, () => {
      const level = parseLevel(def, mulberry32(12345));
      expect(level.code).not.toBeNull();
      const seq = level.code!.sequence;
      // Uma pista de chão para cada símbolo, na ordem de leitura.
      expect(level.clueTiles).toHaveLength(seq.length);
      expect(level.clueTiles.every((c) => c.kind === def.code!.type)).toBe(true);
      // A pista mostra exatamente o símbolo exigido (é a senha no chão).
      level.clueTiles.forEach((clue, i) => expect(clue.value).toBe(seq[i]));
      // Nunca trivial: um único símbolo, ou 0,1,2…/2,1,0…
      expect(new Set(seq).size).toBeGreaterThanOrEqual(2);
      const asc = seq.every((v, i) => i === 0 || v === seq[i - 1] + 1);
      const desc = seq.every((v, i) => i === 0 || v === seq[i - 1] - 1);
      expect(asc || desc).toBe(false);
    });

    it(`${def.id}: duas cargas sorteiam senhas diferentes (não é fixa)`, () => {
      const a = parseLevel(def, mulberry32(1)).code!.sequence.join(',');
      const b = parseLevel(def, mulberry32(999)).code!.sequence.join(',');
      expect(a).not.toBe(b);
    });
  }
});

describe('diversidade das fases', () => {
  it('as fases 13–30 têm pelo menos 3 mecânicas', () => {
    for (let i = 12; i < LEVELS.length; i++) {
      const level = parseLevel(LEVELS[i], mulberry32(i));
      expect(mechanicCount(level), `${LEVELS[i].id} tem poucas mecânicas`).toBeGreaterThanOrEqual(3);
    }
  });

  it('as fases 15 e 16 são diferentes', () => {
    expect(LEVELS[14].map.join('|')).not.toBe(LEVELS[15].map.join('|'));
  });

  it('os mapas têm pelo menos 3 linhas de altura útil (não são um corredor único)', () => {
    for (let i = 12; i < LEVELS.length; i++) {
      expect(LEVELS[i].map.length, `${LEVELS[i].id} é baixo demais`).toBeGreaterThanOrEqual(5);
    }
  });
});

