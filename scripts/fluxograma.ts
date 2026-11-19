/**
 * Gera os dois fluxogramas do jogo em `public/fluxogramas/`:
 *
 *   fluxo-do-jogo.svg / .png   — fluxo geral (acesso → campanha → fim)
 *   fluxo-da-fase.svg / .png   — loop de uma fase (ações, decisões, falhas)
 *
 * Os desenhos vêm de `src/render/flowchart-model.ts`, fonte única de verdade.
 * O SVG é escrito diretamente; o PNG é rasterizado em 2× com o Edge/Chrome
 * headless instalado na máquina (se nenhum navegador for encontrado, o SVG
 * ainda é gerado e o script avisa).
 *
 * Uso: npm run fluxograma
 *      NO_PNG=1 npm run fluxograma   (só SVG)
 */
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { PNG } from 'pngjs';
import {
  FLOW_COLORS,
  FLOW_DIAGRAMS,
  FLOW_STYLE,
  FlowDiagram,
  FlowEdge,
  FlowLegend,
  FlowNode,
  FlowShape,
} from '../src/render/flowchart-model';

const OUT_DIR = resolve(process.argv[2] ?? 'public/fluxogramas');
const SCALE = 2;

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SHADOW_OFFSET = 6;

function shapeMarkup(
  shape: FlowShape,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  strokeWidth = 2,
): string {
  const common = `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"`;
  switch (shape) {
    case 'terminal':
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" ${common} />`;
    case 'process':
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ${common} />`;
    case 'decision': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      return `<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" ${common} />`;
    }
    case 'io': {
      const k = Math.min(20, w * 0.08);
      return `<polygon points="${x + k},${y} ${x + w},${y} ${x + w - k},${y + h} ${x},${y + h}" ${common} />`;
    }
    case 'subroutine':
      return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" ${common} /><line x1="${x + 14}" y1="${y + 4}" x2="${x + 14}" y2="${y + h - 4}" stroke="${stroke}" stroke-width="${strokeWidth}" /><line x1="${x + w - 14}" y1="${y + 4}" x2="${x + w - 14}" y2="${y + h - 4}" stroke="${stroke}" stroke-width="${strokeWidth}" /></g>`;
    case 'connector':
      return `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${Math.min(w, h) / 2}" ${common} />`;
  }
}

function fontSize(lines: string[]): number {
  if (lines.length >= 4) return 15;
  if (lines.length === 3) return 16;
  return 18;
}

function fittedSize(node: FlowNode): number {
  if (node.shape === 'connector') return 20;
  let size = fontSize(node.lines);
  const maxWidth =
    node.w - (node.shape === 'io' ? 46 : node.shape === 'decision' ? 46 : 28);
  const widest = Math.max(...node.lines.map((line) => line.length));
  while (size > 11 && widest * size * 0.62 > maxWidth) size -= 1;
  return size;
}

function nodeText(node: FlowNode): string {
  const size = fittedSize(node);
  const lineH = size + 5;
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const startY = cy - ((node.lines.length - 1) * lineH) / 2;
  return node.lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${startY + i * lineH}" font-family="'Courier New', monospace" font-weight="bold" font-size="${size}" fill="${FLOW_STYLE[node.shape].text}" text-anchor="middle" dominant-baseline="middle">${esc(line)}</text>`,
    )
    .join('');
}

function nodeMarkup(node: FlowNode): string {
  const style = FLOW_STYLE[node.shape];
  return `<g>
    ${shapeMarkup(node.shape, node.x + SHADOW_OFFSET, node.y + SHADOW_OFFSET, node.w, node.h, 'rgba(30,32,52,0.18)', 'none', 0)}
    ${shapeMarkup(node.shape, node.x, node.y, node.w, node.h, style.fill, style.stroke)}
    ${nodeText(node)}
  </g>`;
}

function arrowHead(tip: [number, number], from: [number, number], size = 14): string {
  const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const base = (a: number): string =>
    `${(tip[0] - size * Math.cos(angle - a)).toFixed(1)},${(tip[1] - size * Math.sin(angle - a)).toFixed(1)}`;
  return `<polygon points="${tip[0]},${tip[1]} ${base(0.42)} ${base(-0.42)}" fill="${FLOW_COLORS.arrow}" />`;
}

function edgeLabel(edge: FlowEdge): string {
  if (!edge.label) return '';
  const pts = edge.points;
  const at = edge.labelAt ?? pts[Math.floor(pts.length / 2)];
  const align = edge.labelAlign ?? 'middle';
  const size = 14;
  const width = edge.label.length * (size * 0.64) + 10;
  const x = align === 'start' ? at[0] : align === 'end' ? at[0] - width : at[0] - width / 2;
  const anchor = align === 'start' ? 'start' : align === 'end' ? 'end' : 'middle';
  const textX = align === 'start' ? at[0] + 5 : align === 'end' ? at[0] - 5 : at[0];
  return `<g>
    <rect x="${x}" y="${at[1] - 11}" width="${width}" height="22" rx="4" fill="${FLOW_COLORS.labelBg}" fill-opacity="0.92" />
    <text x="${textX}" y="${at[1]}" font-family="'Courier New', monospace" font-weight="bold" font-size="${size}" fill="${FLOW_COLORS.ink}" text-anchor="${anchor}" dominant-baseline="middle">${esc(edge.label)}</text>
  </g>`;
}

function edgeMarkup(edge: FlowEdge): string {
  const pts = edge.points;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const head =
    edge.arrow === false
      ? ''
      : arrowHead(pts[pts.length - 1], pts[pts.length - 2]);
  return `<path d="${d}" fill="none" stroke="${FLOW_COLORS.arrow}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  ${head}
  ${edgeLabel(edge)}`;
}

function legendMarkup(legend: FlowLegend): string {
  const rowH = 34;
  const height = 50 + legend.entries.length * rowH;
  const rows = legend.entries
    .map((entry, i) => {
      const rowY = legend.y + 44 + i * rowH;
      const style = FLOW_STYLE[entry.shape];
      const w = entry.shape === 'connector' ? 26 : 64;
      const h = entry.shape === 'decision' ? 26 : 26;
      const x = legend.x + 18;
      return `<g>
        ${shapeMarkup(entry.shape, x, rowY, w, h, style.fill, style.stroke, 1.5)}
        <text x="${legend.x + 100}" y="${rowY + h / 2}" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="${FLOW_COLORS.ink}" dominant-baseline="middle">${esc(entry.label)}</text>
      </g>`;
    })
    .join('');
  return `<g>
    <rect x="${legend.x}" y="${legend.y}" width="${legend.w}" height="${height}" rx="10" fill="#FFFFFF" fill-opacity="0.94" stroke="#C9CEDC" stroke-width="1.5" />
    <text x="${legend.x + 18}" y="${legend.y + 22}" font-family="'Courier New', monospace" font-weight="bold" font-size="15" fill="${FLOW_COLORS.ink}">${esc(legend.title)}</text>
    ${rows}
  </g>`;
}

function svgFor(diagram: FlowDiagram): string {
  const { width, height } = diagram;
  const grid: string[] = [];
  for (let x = 40; x < width; x += 40) {
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" />`);
  }
  for (let y = 40; y < height; y += 40) {
    grid.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" />`);
  }

  const notes = (diagram.notes ?? [])
    .map((note) => {
      const anchor = note.align === 'middle' ? 'middle' : note.align === 'end' ? 'end' : 'start';
      return note.lines
        .map(
          (line, i) =>
            `<text x="${note.x}" y="${note.y + i * 20}" font-family="'Courier New', monospace" font-weight="bold" font-size="16" fill="#8A90A8" text-anchor="${anchor}">${esc(line)}</text>`,
        )
        .join('');
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${FLOW_COLORS.bg}" />
  <g stroke="${FLOW_COLORS.grid}" stroke-width="1">${grid.join('')}</g>

  <text x="${width / 2}" y="44" font-family="'Courier New', monospace" font-weight="bold" font-size="27" fill="${FLOW_COLORS.title}" text-anchor="middle">${esc(diagram.title)}</text>
  <text x="${width / 2}" y="72" font-family="'Courier New', monospace" font-weight="bold" font-size="14" fill="#6D7389" text-anchor="middle">${esc(diagram.subtitle)}</text>

  ${notes}

  <g>${diagram.edges.map(edgeMarkup).join('\n')}</g>
  <g>${diagram.nodes.map(nodeMarkup).join('\n')}</g>
  ${diagram.legend ? legendMarkup(diagram.legend) : ''}

  <text x="${width - 24}" y="${height - 16}" font-family="'Courier New', monospace" font-size="12" fill="#A2A7B8" text-anchor="end">LoopBound · npm run fluxograma</text>
</svg>
`;
}

function findBrowser(): string | null {
  const candidates = [
    process.env.EDGE_PATH,
    process.env.CHROME_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter((p): p is string => Boolean(p));
  return candidates.find((p) => existsSync(p)) ?? null;
}

function cropPng(file: string, width: number, height: number): void {
  const img = PNG.sync.read(readFileSync(file));
  if (img.width === width && img.height === height) return;
  if (img.width < width || img.height < height) {
    throw new Error(`captura ${img.width}x${img.height} menor que ${width}x${height}`);
  }
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    const from = (y * img.width) * 4;
    const to = (y * width) * 4;
    img.data.copy(out.data, to, from, from + width * 4);
  }
  writeFileSync(file, PNG.sync.write(out));
}

function rasterize(browser: string, svg: string, pngPath: string, w: number, h: number): void {
  const profile = mkdtempSync(join(tmpdir(), 'lb-flow-'));
  const htmlPath = join(profile, 'flow.html');
  try {
    const scaled = svg.replace(
      /<svg ([^>]*?)width="[^"]+" height="[^"]+"/,
      `<svg $1width="${w * SCALE}" height="${h * SCALE}"`,
    );
    writeFileSync(
      htmlPath,
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff;overflow:hidden}svg{display:block}</style></head><body>${scaled}</body></html>`,
      'utf8',
    );

    const result = spawnSync(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--no-first-run',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        `--user-data-dir=${profile}`,
        `--window-size=${w * SCALE},${h * SCALE}`,
        '--virtual-time-budget=5000',
        `--screenshot=${pngPath}`,
        `file:///${htmlPath.replace(/\\/g, '/')}`,
      ],
      { stdio: 'ignore', timeout: 120_000 },
    );
    if (result.error) throw result.error;
    cropPng(pngPath, w * SCALE, h * SCALE);
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const browser = findBrowser();

for (const diagram of FLOW_DIAGRAMS) {
  const svgPath = join(OUT_DIR, `${diagram.id}.svg`);
  const svg = svgFor(diagram);
  writeFileSync(svgPath, svg, 'utf8');
  console.log(`SVG  ${svgPath} (${diagram.width}x${diagram.height})`);

  if (process.env.NO_PNG) continue;
  if (!browser) {
    console.warn('PNG  ignorado: Edge/Chrome não encontrado (defina CHROME_PATH).');
    continue;
  }
  const pngPath = join(OUT_DIR, `${diagram.id}.png`);
  rasterize(browser, svg, pngPath, diagram.width, diagram.height);
  console.log(`PNG  ${pngPath} (${diagram.width * SCALE}x${diagram.height * SCALE})`);
}
