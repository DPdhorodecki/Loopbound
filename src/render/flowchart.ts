/**
 * Fluxograma completo do jogo LoopBound, desenhado em pixel art no canvas.
 * Devido ao limite diário de geração de imagens por IA, o fluxograma é
 * renderizado sob demanda com p5.js/Canvas 2D, usando o mesmo estilo dos
 * painéis da HQ (estilo 16-bit, cores purple/blue, sombras 3D).
 */

import p5 from 'p5';

const W = 900;
const H = 700;

const BOX_COLOR = '#5B5F97';
const BOX_SHADOW = '#2A2C4A';
const TEXT_COLOR = '#FFFFFF';
const ARROW_COLOR = '#000000';
const BG_COLOR = '#FFFFFF';
const GRID_COLOR = '#E8E8E8';

/**
 * Desenha uma caixa com sombra 3D (estilo da referência).
 */
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string, rounded = true): void {
  // sombra
  ctx.fillStyle = BOX_SHADOW;
  if (rounded) {
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 6, w, h, 12);
    ctx.fill();
  } else {
    ctx.fillRect(x + 6, y + 6, w, h);
  }
  // corpo
  ctx.fillStyle = BOX_COLOR;
  if (rounded) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
  // texto
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = text.split(' ');
  const lineH = 26;
  const startY = y + h / 2 - (lines.length - 1) * lineH / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, startY + i * lineH);
  });
}

/**
 * Desenha um losango (decisão) com sombra.
 */
function diamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, text: string): void {
  // sombra
  ctx.fillStyle = BOX_SHADOW;
  ctx.beginPath();
  ctx.moveTo(cx + 6 + w / 2, cy + 6);
  ctx.lineTo(cx + 6 + w, cy + 6 + h / 2);
  ctx.lineTo(cx + 6 + w / 2, cy + 6 + h);
  ctx.lineTo(cx + 6, cy + 6 + h / 2);
  ctx.closePath();
  ctx.fill();
  // corpo
  ctx.fillStyle = BOX_COLOR;
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy);
  ctx.lineTo(cx + w, cy + h / 2);
  ctx.lineTo(cx + w / 2, cy + h);
  ctx.lineTo(cx, cy + h / 2);
  ctx.closePath();
  ctx.fill();
  // texto
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = text.split(' ');
  const lineH = 24;
  const startY = cy - (lines.length - 1) * lineH / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineH);
  });
}

/**
 * Desenha uma seta espessa preta entre dois pontos.
 */
function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.strokeStyle = ARROW_COLOR;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // cabeça da seta
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const head = 22;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * ux + 9 * uy, y2 - head * uy - 9 * ux);
  ctx.lineTo(x2 - head * ux - 9 * uy, y2 - head * uy + 9 * ux);
  ctx.closePath();
  ctx.fillStyle = ARROW_COLOR;
  ctx.fill();
}

/**
 * Desenha um banner lateral (rótulo de seção).
 */
function banner(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, text: string): void {
  ctx.fillStyle = '#3A3F70';
  ctx.fillRect(x, y, 50, h);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(x + 25, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

export function drawFlowchart(ctx: CanvasRenderingContext2D): void {
  // fundo
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, W, H);

  // grade
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // títulos laterais
  banner(ctx, 0, 0, H, 'INÍCIO  ·  MENU  ·  TUTORIAL  ·  JOGAR  ·  VITÓRIA  ·  CRÉDITOS');

  // Título do fluxograma
  ctx.fillStyle = '#3A3F70';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FLUXOGRAMA — LOOPBOUND: KENNEDYTO E A FUGA', W / 2, 40);

  // ============ LINHA 1: Título → Login → Menu ============
  box(ctx, 100, 120, 220, 60, 'TELA TÍTULO');
  arrow(ctx, 320, 150, 370, 150);
  box(ctx, 380, 120, 240, 60, 'LOGIN / CADASTRO');
  arrow(ctx, 620, 150, 670, 150);
  box(ctx, 680, 120, 240, 60, 'MENU PRINCIPAL');

  // ============ LINHA 2: Decisão "Já tem conta?" ============
  diamond(ctx, 500, 260, 180, 140, 'JÁ TEM CONTA?');

  // Seta não → Cadastrar
  arrow(ctx, 620, 330, 800, 330);
  box(ctx, 810, 300, 220, 60, 'CADASTRAR');
  arrow(ctx, 1030, 330, 960, 410); // volta para o menu (seta longa)
  box(ctx, 680, 420, 240, 60, 'MENU');

  // Seta sim → Menu direto
  arrow(ctx, 590, 330, 700, 410);

  // ============ LINHA 3: Escolher fase → Iniciar ============
  box(ctx, 100, 440, 220, 60, 'ESCOLHER FASE');
  arrow(ctx, 320, 470, 370, 470);
  box(ctx, 380, 440, 240, 60, 'INICIAR FASE');

  // ============ LINHA 4: Loop de jogo ============
  box(ctx, 100, 540, 340, 60, 'LOOP DE JOGO: INPUT → MOVER → ECO REGISTRA');
  arrow(ctx, 440, 570, 500, 570);
  diamond(ctx, 520, 510, 160, 120, 'CICLO ACABOU?');

  // Não → volta para loop
  arrow(ctx, 560, 570, 720, 570);
  arrow(ctx, 720, 570, 720, 500);
  arrow(ctx, 720, 500, 420, 500);
  arrow(ctx, 420, 500, 420, 570); // desce de volta ao loop

  // Sim → Grava eco
  arrow(ctx, 600, 570, 780, 570);
  box(ctx, 790, 540, 220, 60, 'GRAVAR ECO');

  // ============ LINHA 5: Decisão "Venceu?" ============
  diamond(ctx, 600, 660, 180, 140, 'VENCEU?');

  // Não → Reiniciar fase
  arrow(ctx, 690, 730, 850, 730);
  box(ctx, 860, 700, 200, 60, 'REINICIAR FASE');
  arrow(ctx, 1060, 730, 520, 730); // volta para o loop
  arrow(ctx, 520, 730, 520, 500); // sobe para o loop

  // Sim → Tela vitória
  arrow(ctx, 690, 730, 300, 730);
  box(ctx, 100, 700, 240, 60, 'TELA VITÓRIA');
  arrow(ctx, 340, 730, 460, 730);
  box(ctx, 470, 700, 240, 60, 'PRÓXIMA FASE OU FIM');

  // ============ LINHA 6: Pós-créditos ============
  box(ctx, 470, 800, 340, 60, 'PÓS-CRÉDITOS: CHUCHUTY AINDA ESTÁ VIVO');
  arrow(ctx, 640, 830, 740, 830);
  box(ctx, 750, 800, 140, 60, 'FIM', false);

  // ============ Título das seções laterais (repetido para clareza) ============
  ctx.fillStyle = '#3A3F70';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MENU', 25, 200);
  ctx.fillText('JOGAR', 25, 400);
  ctx.fillText('VITÓRIA', 25, 650);
}
