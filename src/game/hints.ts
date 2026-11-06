import { LevelRadio, radioFor } from './story';

/**
 * Dicas graduais do General Marcinho.
 *
 * A progressão é sempre a mesma — briefing, dica 1, dica 2 — e nunca pula
 * etapa. A dica 2 é a mais específica, mas o texto é escrito para orientar o
 * raciocínio sem entregar a senha (que é sorteada em tempo de execução).
 */

export type HintStage = 0 | 1 | 2;

export interface HintMessage {
  stage: HintStage;
  speaker: 'marcinho' | 'chuchuty' | 'system';
  text: string;
  /** `true` quando a mensagem é o briefing inicial da fase. */
  briefing: boolean;
}

/** Segundos parados antes da dica automática. */
export const AUTO_HINT_DELAY = 24;
/** Segundos extras parados antes da segunda dica automática. */
export const AUTO_HINT_DELAY_2 = 52;

export class HintSystem {
  levelId = '';
  radio: LevelRadio = radioFor('');
  private stage: HintStage = 0;
  private idle = 0;
  private seen = new Set<HintStage>();
  private solved = false;

  /** Reinicia o sistema para uma fase e devolve o briefing. */
  begin(levelId: string, radio: LevelRadio = radioFor(levelId)): HintMessage {
    this.levelId = levelId;
    this.radio = radio;
    this.stage = 0;
    this.idle = 0;
    this.seen.clear();
    this.solved = false;
    return {
      stage: 0,
      speaker: 'marcinho',
      text: radio.briefing,
      briefing: true,
    };
  }

  /** O jogador andou/interagiu: zera o relógio de ociosidade. */
  notifyAction(): void {
    this.idle = 0;
  }

  /** Marca a fase como resolvida (interrompe dicas automáticas). */
  markSolved(): void {
    this.solved = true;
  }

  get currentStage(): HintStage {
    return this.stage;
  }

  get isSolved(): boolean {
    return this.solved;
  }

  /** Pedido manual (tecla H / botão do HUD). Avança no máximo uma etapa. */
  request(): HintMessage | null {
    if (this.solved) return null;
    this.idle = 0;
    if (this.stage >= 2) {
      return { stage: 2, speaker: 'marcinho', text: this.radio.hints[1], briefing: false };
    }
    this.stage = (this.stage + 1) as HintStage;
    this.seen.add(this.stage);
    return this.messageFor(this.stage);
  }

  /**
   * Chama a cada frame. Devolve uma dica automática quando o jogador fica
   * parado tempo suficiente. A primeira demora 24 s; a segunda, 52 s.
   */
  tick(dtSeconds: number): HintMessage | null {
    if (this.solved) return null;
    this.idle += Math.max(0, dtSeconds);
    if (this.stage === 0 && this.idle >= AUTO_HINT_DELAY) return this.request();
    if (this.stage === 1 && this.idle >= AUTO_HINT_DELAY_2) return this.request();
    return null;
  }

  /** Mensagem de comemoração ao concluir a fase. */
  solvedMessage(): HintMessage {
    this.solved = true;
    return {
      stage: 2,
      speaker: 'marcinho',
      text: this.radio.solved,
      briefing: false,
    };
  }

  /** Aviso vermelho do Chuchuty, quando a fase tiver uma transmissão dele. */
  chuchutyMessage(): HintMessage | null {
    if (!this.radio.chuchuty) return null;
    return { stage: this.stage, speaker: 'chuchuty', text: this.radio.chuchuty, briefing: false };
  }

  private messageFor(stage: HintStage): HintMessage {
    const index = stage === 2 ? 1 : 0;
    return {
      stage,
      speaker: 'marcinho',
      text: this.radio.hints[index] ?? this.radio.hints[this.radio.hints.length - 1],
      briefing: false,
    };
  }
}

/** Atalho puro para testar a escada de dicas sem instanciar o sistema. */
export function escalation(radio: LevelRadio): string[] {
  return [radio.briefing, radio.hints[0], radio.hints[1]];
}

/**
 * Verifica se um texto de dica entrega a senha literalmente. As dicas nunca
 * devem conter a sequência resolvida, nem frases como "a senha é".
 */
export function revealsPassword(text: string, sequence: readonly number[], type: 'roman' | 'color'): boolean {
  const upper = text.toUpperCase();
  if (/A\s+SENHA\s+(É|E)\s*[:\-]/i.test(upper)) return true;
  const tokens =
    type === 'roman'
      ? sequence.map((n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][n])
      : sequence.map((n) => String(n + 1));
  // Sequência inteira em ordem, ou os símbolos todos na mesma frase, conta como entrega.
  const joined = tokens.join(' ');
  if (tokens.length > 1 && upper.includes(joined)) return true;
  return false;
}
