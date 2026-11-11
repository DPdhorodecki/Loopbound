import {
  FLOW_BANNER,
  FLOW_COLORS,
  FLOW_EDGES,
  FLOW_H,
  FLOW_NODES,
  FLOW_NOTES,
  FLOW_W,
  FlowEdge,
  FlowNode,
} from './flowchart-model';

/**
 * Fluxograma completo do jogo LoopBound, desenhado em pixel art no canvas.
 *
 * O desenho vem de `flowchart-model.ts`, o mesmo modelo usado para gerar o
 * SVG versionado em `public/fluxograma-jogo.svg` (`npm run fluxograma`).
 */

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Desenha uma caixa com sombra 3D (estilo da referência). */
function box(ctx: CanvasRenderingContext2D, node: FlowNode): void {
  const { x, y, w, h } = node;
  const radius = node.kind === 'terminal' ? h / 2 : 12;

  // sombra
  ctx.fillStyle = FLOW_COLORS.shadow;
  roundedRect(ctx, x + 6, y + 6, w, h, radius);
  ctx.fill();

  // corpo
  ctx.fillStyle = FLOW_COLORS.box;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();

  // texto
  ctx.fillStyle = FLOW_COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = node.lines.length > 2 ? 'bold 15px monospace' : 'bold 17px monospace';
  const lineH = 20;
  const startY = y + h / 2 - ((node.lines.length - 1) * lineH) / 2;
  node.lines.forEach((line, i) => ctx.fillText(line, x + w / 2, startY + i * lineH));
}

/** Desenha o losango (decisão) com sombra. */
function diamond(ctx: CanvasRenderingContext2D, node: FlowNode): void {
  const { x, y, w, h } = node;
  const mid = x + w / 2;

  ctx.fillStyle = FLOW_COLORS.shadow;
  ctx.beginPath();
  ctx.moveTo(mid + 6, y + 6);
  ctx.lineTo(x + w + 6, y + 6);
  ctx.lineTo(x + w + 6, y + h + 6);
  ctx.lineTo(mid + 6, y + h + 6);
  ctx.lineTo(x + 6, y + h + 6);
  ctx.lineTo(x + 6, y + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = FLOW_COLORS.box;
  ctx.beginPath();
  ctx.moveTo(mid, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(mid, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = FLOW_COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px monospace';
  const lineH = 20;
  const startY = y + h / 2 - ((node.lines.length - 1) * lineH) / 2;
  node.lines.forEach((line, i) => ctx.fillText(line, mid, startY + i * lineH));
}

/** Seta com ponta desenhada na última linha do caminho. */
function arrow(ctx: CanvasRenderingContext2D, edge: FlowEdge): void {
  const pts = edge.path;
  ctx.strokeStyle = FLOW_COLORS.arrow;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();

  const [tx, ty] = pts[pts.length - 1];
  const [px, py] = pts[pts.length - 2];
  const angle = Math.atan2(ty - py, tx - px);
  ctx.fillStyle = FLOW_COLORS.arrow;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - 22 * Math.cos(angle - 0.4), ty - 22 * Math.sin(angle - 0.4));
  ctx.lineTo(tx - 22 * Math.cos(angle + 0.4), ty - 22 * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  if (edge.label) {
    const mid = pts[Math.floor(pts.length / 2)];
    const [dx, dy] = edge.labelOffset ?? [0, -14];
    ctx.fillStyle = FLOW_COLORS.boxDark;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.label, mid[0] + dx, mid[1] + dy);
  }
}

export function drawFlowchart(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = FLOW_COLORS.bg;
  ctx.fillRect(0, 0, FLOW_W, FLOW_H);

  // grade
  ctx.strokeStyle = FLOW_COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FLOW_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FLOW_H);
    ctx.stroke();
  }
  for (let y = 0; y <= FLOW_H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FLOW_W, y);
    ctx.stroke();
  }

  // banner lateral
  ctx.fillStyle = FLOW_COLORS.boxDark;
  ctx.fillRect(0, 0, 50, FLOW_H);
  ctx.fillStyle = FLOW_COLORS.text;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(25, FLOW_H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(FLOW_BANNER, 0, 0);
  ctx.restore();

  // notas (títulos e legendas)
  for (const note of FLOW_NOTES) {
    ctx.fillStyle = FLOW_COLORS.boxDark;
    ctx.textAlign = note.align === 'middle' ? 'center' : note.align === 'end' ? 'right' : 'left';
    ctx.textBaseline = 'top';
    const isTitle = note.lines.length === 1 && note.y < 60;
    ctx.font = isTitle ? 'bold 24px monospace' : 'bold 15px monospace';
    note.lines.forEach((line, i) => ctx.fillText(line, note.x, note.y + i * (isTitle ? 28 : 22)));
  }

  // arestas primeiro (ficam atrás das caixas)
  for (const edge of FLOW_EDGES) arrow(ctx, edge);

  // nós
  for (const node of FLOW_NODES) {
    if (node.kind === 'diamond') diamond(ctx, node);
    else box(ctx, node);
  }
}
