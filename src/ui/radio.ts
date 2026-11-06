import p5 from 'p5';
import { HintMessage } from '../game/hints';
import { drawText, textWidth } from '../render/font';
import { PortraitId, drawPortrait } from '../render/portraits';
import { drawFrame, VIEW_H, VIEW_W } from './hud';

const PANEL_W = 384;
const PANEL_H = 78;
const PANEL_X = VIEW_W - PANEL_W - 10;
const PANEL_Y = VIEW_H - PANEL_H - 8;

function paletteFor(speaker: HintMessage['speaker']): { name: string; color: string; glow: string } {
  if (speaker === 'chuchuty') return { name: 'ALIEN CHUCHUTY', color: '#E4675C', glow: '#C43B31' };
  if (speaker === 'system') return { name: 'SISTEMA', color: '#8FB3A6', glow: '#3C4E48' };
  return { name: 'GENERAL MARCINHO', color: '#F2D27A', glow: '#8F6A1F' };
}

function portraitFor(speaker: HintMessage['speaker']): PortraitId {
  if (speaker === 'chuchuty') return 'chuchuty';
  if (speaker === 'system') return 'system';
  return 'marcinho';
}

function wrap(text: string, maxWidth: number, scale: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const probe = line ? `${line} ${word}` : word;
    if (textWidth(probe, scale) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

/**
 * Painel de rádio desenhado no canvas. Aparece no canto inferior direito e
 * nunca cobre o HUD da esquerda nem o medidor de ciclo.
 */
export function drawRadioPanel(p: p5, message: HintMessage, time: number): void {
  const meta = paletteFor(message.speaker);
  const alert = message.speaker === 'chuchuty';
  const pulse = alert ? 0.55 + Math.sin(time * 5) * 0.25 : 1;

  p.noStroke();
  p.fill(6, 10, 18, 220);
  p.rect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
  drawFrame(p, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, true);

  // Selo de alerta do Chuchuty.
  p.fill(meta.glow);
  p.drawingContext.globalAlpha = pulse;
  p.rect(PANEL_X, PANEL_Y, 4, PANEL_H);
  p.drawingContext.globalAlpha = 1;

  // Retrato
  const px = PANEL_X + 10;
  const py = PANEL_Y + 18;
  p.fill(10, 16, 24, 255);
  p.rect(px - 3, py - 3, 38, 46);
  p.fill(meta.color);
  p.rect(px - 3, py - 3, 38, 1);
  p.rect(px - 3, py + 42, 38, 1);
  p.rect(px - 3, py - 3, 1, 46);
  p.rect(px + 34, py - 3, 1, 46);
  drawPortrait(p.drawingContext, portraitFor(message.speaker), px, py, 2);

  // Cabeçalho
  const tx = PANEL_X + 52;
  p.fill(meta.color);
  p.rect(tx, PANEL_Y + 12, 6, 6);
  drawText(p, meta.name, tx + 10, PANEL_Y + 10, 1, meta.color, 'left');
  const tag = message.briefing ? 'BRIEFING' : message.speaker === 'chuchuty' ? 'ALERTA' : 'DICA';
  drawText(p, tag, PANEL_X + PANEL_W - 10, PANEL_Y + 10, 1, '#5C7369', 'right');

  // Texto
  const lines = wrap(message.text, PANEL_W - 64, 1);
  lines.forEach((line, i) => {
    drawText(p, line, tx, PANEL_Y + 26 + i * 12, 1, '#DCE9E2', 'left');
  });

  // Pisca o "novo" por alguns instantes.
  if (alert) {
    p.fill(meta.color);
    p.drawingContext.globalAlpha = pulse;
    p.rect(PANEL_X + PANEL_W - 8, PANEL_Y + 8, 2, 2);
    p.drawingContext.globalAlpha = 1;
  }
}
