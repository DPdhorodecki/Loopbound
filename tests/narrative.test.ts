import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { parseLevel } from '../src/game/level';
import { orphans, traceSolution, unusedMechanics } from '../src/game/analysis';
import {
  AUTO_HINT_DELAY,
  AUTO_HINT_DELAY_2,
  HintSystem,
  escalation,
  revealsPassword,
} from '../src/game/hints';
import {
  ENDING,
  LEVEL_RADIO,
  PROLOGUE,
  SECTORS,
  isSectorStart,
  radioFor,
  sectorForLevel,
  speakerName,
} from '../src/game/story';

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

describe('campanha narrativa', () => {
  it('tem cinco setores de seis fases cobrindo as 30 fases', () => {
    expect(SECTORS).toHaveLength(5);
    const seen = new Set<number>();
    for (const sector of SECTORS) {
      expect(sector.range[1] - sector.range[0] + 1).toBe(6);
      for (let i = sector.range[0]; i <= sector.range[1]; i++) {
        expect(seen.has(i)).toBe(false);
        seen.add(i);
        expect(sectorForLevel(i).id).toBe(sector.id);
      }
      expect(isSectorStart(sector.range[0])).toBe(true);
      expect(isSectorStart(sector.range[0] + 1)).toBe(false);
    }
    expect(seen.size).toBe(30);
  });

  it('tem prólogo, encerramento e cenas em todos os setores', () => {
    expect(PROLOGUE.length).toBeGreaterThanOrEqual(4);
    expect(ENDING.length).toBeGreaterThanOrEqual(4);
    for (const sector of SECTORS) {
      expect(sector.intro.length).toBeGreaterThan(0);
      expect(sector.outro.length).toBeGreaterThan(0);
      for (const slide of [...sector.intro, ...sector.outro]) {
        expect(slide.text.length).toBeGreaterThan(10);
        expect(slide.name).toBe(speakerName(slide.speaker));
      }
    }
  });

  it('o final tem a mensagem pós-créditos do Chuchuty', () => {
    const last = ENDING[ENDING.length - 1];
    expect(last.speaker).toBe('chuchuty');
    expect(last.text).toContain('CHUCHUTY AINDA ESTÁ VIVO');
  });

  it('cobre as 30 fases com briefing, duas dicas e comemoração', () => {
    for (const def of LEVELS) {
      const radio = LEVEL_RADIO[def.id];
      expect(radio, `${def.id} sem rádio`).toBeTruthy();
      expect(radio.briefing.length).toBeGreaterThan(10);
      expect(radio.hints).toHaveLength(2);
      expect(radio.hints[0].length).toBeGreaterThan(5);
      expect(radio.hints[1].length).toBeGreaterThan(5);
      expect(radio.solved.length).toBeGreaterThan(5);
      expect(radioFor(def.id)).toBe(radio);
    }
  });

  it('a segunda dica é diferente e mais específica que a primeira', () => {
    for (const def of LEVELS) {
      const radio = LEVEL_RADIO[def.id];
      const [a, b] = radio.hints;
      expect(a).not.toBe(b);
      expect(escalation(radio)).toEqual([radio.briefing, a, b]);
    }
  });

  it('as dicas nunca entregam a senha sorteada', () => {
    for (const def of LEVELS.filter((l) => l.code)) {
      const level = parseLevel(def, mulberry32(def.id.length * 977));
      const sequence = level.code!.sequence;
      for (const text of escalation(radioFor(def.id))) {
        expect(revealsPassword(text, sequence, def.code!.type), `${def.id}: ${text}`).toBe(false);
      }
    }
  });
});

describe('escada de dicas', () => {
  it('vai do briefing à dica 1 e à dica 2, sem pular etapas', () => {
    const hints = new HintSystem();
    const radio = radioFor('peso-morto');
    const briefing = hints.begin('peso-morto', radio);
    expect(briefing.briefing).toBe(true);
    expect(briefing.text).toBe(radio.briefing);
    expect(hints.currentStage).toBe(0);

    const first = hints.request()!;
    expect(first.stage).toBe(1);
    expect(first.text).toBe(radio.hints[0]);
    expect(first.briefing).toBe(false);

    const second = hints.request()!;
    expect(second.stage).toBe(2);
    expect(second.text).toBe(radio.hints[1]);

    // Repetir não inventa uma terceira dica nem volta para a primeira.
    const again = hints.request()!;
    expect(again.stage).toBe(2);
    expect(again.text).toBe(radio.hints[1]);
  });

  it('dispara dicas automáticas depois de tempo parado', () => {
    const hints = new HintSystem();
    hints.begin('peso-morto');
    expect(hints.tick(AUTO_HINT_DELAY - 1)).toBeNull();
    const auto1 = hints.tick(1);
    expect(auto1?.stage).toBe(1);
    expect(hints.tick(AUTO_HINT_DELAY_2 - 1)).toBeNull();
    const auto2 = hints.tick(1);
    expect(auto2?.stage).toBe(2);
  });

  it('uma ação do jogador zera o relógio de ociosidade', () => {
    const hints = new HintSystem();
    hints.begin('peso-morto');
    hints.tick(AUTO_HINT_DELAY - 2);
    hints.notifyAction();
    expect(hints.tick(3)).toBeNull();
    expect(hints.currentStage).toBe(0);
  });

  it('não dá dicas depois de resolver a fase', () => {
    const hints = new HintSystem();
    hints.begin('peso-morto');
    const solved = hints.solvedMessage();
    expect(solved.text).toBe(radioFor('peso-morto').solved);
    expect(hints.request()).toBeNull();
    expect(hints.tick(999)).toBeNull();
  });
});

describe('auditoria de mecânicas', () => {
  for (const def of LEVELS) {
    it(`${def.id}: toda mecânica do mapa participa da solução`, () => {
      const level = parseLevel(def, mulberry32(def.id.length));
      const report = traceSolution(def, level);
      expect(report.won, `${def.id} não vence`).toBe(true);
      expect(report.blocked, `${def.id} tem bloqueios`).toEqual([]);
      expect(report.prematureEnd, `${def.id} encerra cedo`).toEqual([]);
      const unused = unusedMechanics(level, report.trace);
      expect(unused, `${def.id} tem mecânicas não usadas: ${unused.join(', ')}`).toEqual([]);
      const orphan = orphans(level);
      expect(orphan.gatesWithoutSource).toEqual([]);
      expect(orphan.sourcesWithoutGate).toEqual([]);
      expect(orphan.unpairedDucts).toEqual([]);
      expect(orphan.codeWithoutTerminal).toEqual([]);
      expect(orphan.keyDoorMismatch).toEqual([]);
    });
  }

  it('não há mais a mecânica morta de âncoras', () => {
    for (const def of LEVELS) {
      const level = parseLevel(def, mulberry32(1)) as unknown as Record<string, unknown>;
      expect(level.anchors).toBeUndefined();
    }
  });

  it('as fases de código exigem terminal e portão de código de verdade', () => {
    for (const def of LEVELS.filter((l) => l.code)) {
      const level = parseLevel(def, mulberry32(1));
      expect(level.terminal, `${def.id} sem terminal`).not.toBeNull();
      expect(level.codeGates.length, `${def.id} sem portão de código`).toBeGreaterThan(0);
    }
  });
});
