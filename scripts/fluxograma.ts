/**
 * Gera o SVG do fluxograma do jogo em `public/fluxograma-jogo.svg`.
 *
 * O desenho vem de `src/render/flowchart-model.ts` — o mesmo modelo usado
 * pelo renderizador em canvas (`src/render/flowchart.ts`).
 *
 * Uso: npx vite-node scripts/fluxograma.ts [arquivo-de-saida]
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
} from '../src/render/flowchart-model';

const OUT = resolve(process.argv[2] ?? 'public/fluxograma-jogo.svg');

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function shadow(): string {
  return `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
      <feOffset dx="8" dy="8" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>`;
}

function style(): string {
  return `<style>
      .bg { fill: ${FLOW_COLORS.bg}; }
      .grid { stroke: ${FLOW_COLORS.grid}; stroke-width: 1; }
      .box { fill: ${FLOW_COLORS.box}; stroke: ${FLOW_COLORS.boxDark}; stroke-width: 2; filter: url(#shadow); }
      .box-text { fill: ${FLOW_COLORS.text}; font-family: 'Courier New', monospace; font-weight: bold; font-size: 17px; text-anchor: middle; }
      .box-text.small { font-size: 15px; }
      .arrow { stroke: ${FLOW_COLORS.arrow}; stroke-width: 5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .arrow-head { fill: ${FLOW_COLORS.arrow}; stroke: none; }
      .banner { fill: ${FLOW_COLORS.boxDark}; }
      .banner-text { fill: ${FLOW_COLORS.text}; font-family: 'Courier New', monospace; font-weight: bold; font-size: 16px; text-anchor: middle; dominant-baseline: middle; }
      .title { fill: ${FLOW_COLORS.boxDark}; font-family: 'Courier New', monospace; font-weight: bold; font-size: 24px; text-anchor: middle; }
      .note { fill: ${FLOW_COLORS.boxDark}; font-family: 'Courier New', monospace; font-weight: bold; font-size: 15px; }
      .note.small { font-size: 14px; }
    </style>`;
}

function grid(): string {
  const lines: string[] = [];
  for (let x = 40; x < FLOW_W; x += 40) lines.push(`    <line x1="${x}" y1="0" x2="${x}" y2="${FLOW_H}" />`);
  for (let y = 40; y < FLOW_H; y += 40) lines.push(`    <line x1="0" y1="${y}" x2="${FLOW_W}" y2="${y}" />`);
  return `  <g class="grid">\n${lines.join('\n')}\n  </g>`;
}

function nodeText(node: FlowNode): string {
  const cls = node.lines.length > 2 ? 'box-text small' : 'box-text';
  const lineH = node.lines.length > 2 ? 20 : 24;
  const startY = node.y + node.h / 2 - ((node.lines.length - 1) * lineH) / 2;
  return node.lines
    .map((line, i) => `  <text class="${cls}" x="${node.x + node.w / 2}" y="${startY + i * lineH}">${esc(line)}</text>`)
    .join('\n');
}

function boxNode(node: FlowNode): string {
  const r = node.kind === 'terminal' ? node.h / 2 : 12;
  return `  <rect class="box" x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="${r}" />
${nodeText(node)}`;
}

function diamondNode(node: FlowNode): string {
  const mid = node.x + node.w / 2;
  const points = [
    [mid, node.y],
    [node.x + node.w, node.y],
    [node.x + node.w, node.y + node.h],
    [mid, node.y + node.h],
    [node.x, node.y + node.h],
    [node.x, node.y],
  ]
    .map((p) => p.join(','))
    .join(' ');
  return `  <polygon class="box" points="${points}" />
${nodeText(node)}`;
}

function arrow(edge: FlowEdge): string {
  const pts = edge.path;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const [tx, ty] = pts[pts.length - 1];
  const [px, py] = pts[pts.length - 2];
  const angle = Math.atan2(ty - py, tx - px);
  const head = (a: number, r = 22): string =>
    `${(tx - r * Math.cos(angle - a)).toFixed(1)} ${(ty - r * Math.sin(angle - a)).toFixed(1)}`;
  const mid = pts[Math.floor(pts.length / 2)];
  const [dx, dy] = edge.labelOffset ?? [0, -14];
  const label = edge.label
    ? `\n  <text class="note" x="${mid[0] + dx}" y="${mid[1] + dy}" text-anchor="middle">${esc(edge.label)}</text>`
    : '';
  return `  <path class="arrow" d="${d}" />
  <path class="arrow-head" d="M ${tx} ${ty} L ${head(0.4)} L ${head(-0.4)} Z" />${label}`;
}

const notes = FLOW_NOTES.map((note) => {
  const isTitle = note.lines.length === 1 && note.y < 60;
  const cls = isTitle ? 'title' : note.lines.length > 2 ? 'note small' : 'note';
  const anchor = note.align === 'middle' ? 'middle' : note.align === 'end' ? 'end' : 'start';
  const lineH = isTitle ? 28 : 22;
  return note.lines
    .map(
      (line, i) =>
        `  <text class="${cls}" x="${note.x}" y="${note.y + i * lineH}" text-anchor="${anchor}">${esc(line)}</text>`,
    )
    .join('\n');
}).join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${FLOW_W}" height="${FLOW_H}" viewBox="0 0 ${FLOW_W} ${FLOW_H}">
  <defs>
    ${shadow()}
    ${style()}
  </defs>

  <!-- Fundo -->
  <rect class="bg" width="${FLOW_W}" height="${FLOW_H}" />

${grid()}

  <!-- Banner lateral -->
  <rect class="banner" x="0" y="0" width="50" height="${FLOW_H}" />
  <text class="banner-text" x="25" y="${FLOW_H / 2}" transform="rotate(-90 25,${FLOW_H / 2})">${esc(FLOW_BANNER)}</text>

  <!-- Títulos e notas -->
${notes}

  <!-- Ligações -->
${FLOW_EDGES.map((e) => arrow(e)).join('\n')}

  <!-- Caixas -->
${FLOW_NODES.map((n) => (n.kind === 'diamond' ? diamondNode(n) : boxNode(n))).join('\n')}
</svg>
`;

writeFileSync(OUT, svg, 'utf8');
console.log(`fluxograma gerado: ${OUT} (${FLOW_W}x${FLOW_H})`);
