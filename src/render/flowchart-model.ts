/**
 * Modelo dos fluxogramas do LoopBound.
 *
 * Fonte única de verdade dos dois diagramas versionados em
 * `public/fluxogramas/` (SVG + PNG gerados por `npm run fluxograma`).
 *
 * Simbologia usada (padrão ANSI/ISO para fluxogramas):
 * - terminal     → início / fim (elipse alongada)
 * - process      → processo (retângulo)
 * - decision     → decisão (losango)
 * - io           → entrada / saída (paralelogramo)
 * - subroutine   → subprocesso (retângulo com barras laterais)
 * - connector    → conector de página (círculo)
 */

export type FlowShape =
  | 'terminal'
  | 'process'
  | 'decision'
  | 'io'
  | 'subroutine'
  | 'connector';

export interface FlowNode {
  id: string;
  shape: FlowShape;
  /** Canto superior esquerdo. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Linhas de texto, centralizadas. */
  lines: string[];
}

export interface FlowEdge {
  /** Pontos do caminho, do início até a ponta da seta. */
  points: [number, number][];
  /** Rótulo opcional (SIM / NÃO / TAB...). */
  label?: string;
  /** Posição absoluta do rótulo (padrão: meio do caminho). */
  labelAt?: [number, number];
  labelAlign?: 'start' | 'middle' | 'end';
  /** `false` desenha só a linha, sem ponta de seta (junção). */
  arrow?: boolean;
}

export interface FlowNote {
  x: number;
  y: number;
  lines: string[];
  align?: 'start' | 'middle' | 'end';
}

export interface FlowLegend {
  x: number;
  y: number;
  w: number;
  title: string;
  entries: { shape: FlowShape; label: string }[];
}

export interface FlowDiagram {
  id: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  notes?: FlowNote[];
  legend?: FlowLegend;
}

/** Cores no estilo do jogo (pixel art / painéis roxos). */
export const FLOW_STYLE: Record<
  FlowShape,
  { fill: string; stroke: string; text: string }
> = {
  terminal: { fill: '#2E7D5B', stroke: '#1B4F38', text: '#FFFFFF' },
  process: { fill: '#5B5F97', stroke: '#3A3F70', text: '#FFFFFF' },
  decision: { fill: '#A66A1E', stroke: '#6E4410', text: '#FFFFFF' },
  io: { fill: '#2E6F8E', stroke: '#1D4A60', text: '#FFFFFF' },
  subroutine: { fill: '#6A4C93', stroke: '#46306A', text: '#FFFFFF' },
  connector: { fill: '#3A3F70', stroke: '#22254A', text: '#FFFFFF' },
};

export const FLOW_COLORS = {
  bg: '#FFFFFF',
  grid: '#ECEEF3',
  ink: '#2A2C4A',
  arrow: '#20223A',
  labelBg: '#FFFFFF',
  title: '#2A2C4A',
} as const;

const n = (
  id: string,
  shape: FlowShape,
  x: number,
  y: number,
  w: number,
  h: number,
  ...lines: string[]
): FlowNode => ({ id, shape, x, y, w, h, lines });

// ---------------------------------------------------------------------------
// Fluxograma 1 — fluxo geral do jogo (acesso → campanha → fim)
// ---------------------------------------------------------------------------

export const GAME_FLOW: FlowDiagram = {
  id: 'fluxo-do-jogo',
  title: 'FLUXOGRAMA 1 — FLUXO GERAL DO JOGO',
  subtitle:
    'LoopBound: Kennedyto e a Fuga da Instalação Alienígena · do acesso ao fim da campanha',
  width: 1500,
  height: 2000,
  nodes: [
    n('inicio', 'terminal', 580, 100, 240, 56, 'INÍCIO'),
    n(
      'boot',
      'process',
      530,
      196,
      340,
      70,
      'ABRIR O JOGO',
      'save · assets · service worker',
    ),
    n('tem-sessao', 'decision', 550, 306, 300, 110, 'TEM SESSÃO', 'SALVA?'),
    n(
      'login',
      'io',
      140,
      316,
      280,
      76,
      'LOGIN OU CADASTRO',
      'API + PostgreSQL',
    ),
    n('autenticado', 'decision', 160, 432, 240, 100, 'CREDENCIAIS', 'VÁLIDAS?'),
    n('prologo-visto', 'decision', 550, 456, 300, 110, 'PRÓLOGO', 'JÁ VISTO?'),
    n(
      'prologo',
      'subroutine',
      1080,
      468,
      300,
      84,
      'EXIBIR PRÓLOGO',
      'história em quadrinhos',
    ),
    n('tutorial-ok', 'decision', 550, 616, 300, 110, 'TUTORIAL', 'CONCLUÍDO?'),
    n('tutorial', 'subroutine', 1080, 628, 300, 84, 'TUTORIAL', '8 salas'),
    n(
      'menu',
      'process',
      530,
      776,
      340,
      84,
      'MENU PRINCIPAL',
      'JOGAR · FASES · HISTÓRIA',
      'HISTÓRICO · PERFIL',
    ),
    n('escolheu', 'decision', 550, 910, 300, 110, 'ESCOLHEU', 'UMA FASE?'),
    n(
      'primeira-visita',
      'decision',
      550,
      1060,
      300,
      110,
      '1ª VISITA',
      'AO SETOR?',
    ),
    n(
      'abertura-setor',
      'subroutine',
      1080,
      1072,
      300,
      84,
      'HISTÓRIA DE ABERTURA',
      'do setor (HQ)',
    ),
    n(
      'executar-fase',
      'process',
      530,
      1210,
      340,
      80,
      'EXECUTAR A FASE',
      'ver Fluxograma 2',
    ),
    n('venceu', 'decision', 550, 1340, 300, 110, 'VENCEU', 'A FASE?'),
    n('fim-setor', 'decision', 550, 1490, 300, 110, 'FIM DO', 'SETOR?'),
    n(
      'encerramento-setor',
      'subroutine',
      1080,
      1502,
      300,
      84,
      'HISTÓRIA DE ENCERRAMENTO',
      'do setor (HQ)',
    ),
    n('ultima-fase', 'decision', 550, 1650, 300, 110, 'ÚLTIMA FASE', '(30)?'),
    n(
      'proxima-fase',
      'process',
      140,
      1671,
      290,
      68,
      'AVANÇAR PARA',
      'A PRÓXIMA FASE',
    ),
    n(
      'final',
      'subroutine',
      530,
      1800,
      340,
      76,
      'CENA FINAL (HQ)',
      'pós-créditos',
    ),
    n('fim', 'terminal', 580, 1916, 240, 56, 'FIM'),
  ],
  edges: [
    { points: [[700, 156], [700, 196]] },
    { points: [[700, 266], [700, 306]] },
    {
      points: [[550, 361], [420, 361]],
      label: 'NÃO',
      labelAt: [505, 338],
    },
    { points: [[280, 392], [280, 432]] },
    {
      points: [[160, 482], [90, 482], [90, 354], [140, 354]],
      label: 'NÃO',
      labelAt: [122, 500],
      labelAlign: 'end',
    },
    {
      points: [[400, 482], [480, 482], [480, 511], [550, 511]],
      label: 'SIM',
      labelAt: [458, 464],
      labelAlign: 'end',
    },
    {
      points: [[700, 416], [700, 456]],
      label: 'SIM',
      labelAt: [720, 436],
      labelAlign: 'start',
    },
    {
      points: [[850, 511], [1080, 510]],
      label: 'NÃO',
      labelAt: [965, 486],
    },
    {
      points: [[700, 566], [700, 616]],
      label: 'SIM',
      labelAt: [720, 591],
      labelAlign: 'start',
    },
    { points: [[1230, 552], [1230, 671], [850, 671]] },
    {
      points: [[850, 671], [1080, 670]],
      label: 'NÃO',
      labelAt: [965, 646],
    },
    {
      points: [[700, 726], [700, 776]],
      label: 'SIM',
      labelAt: [720, 751],
      labelAlign: 'start',
    },
    { points: [[1230, 712], [1230, 818], [870, 818]] },
    { points: [[700, 860], [700, 910]] },
    {
      points: [[550, 965], [450, 965], [450, 818], [530, 818]],
      label: 'NÃO',
      labelAt: [512, 943],
      labelAlign: 'end',
    },
    {
      points: [[700, 1020], [700, 1060]],
      label: 'SIM',
      labelAt: [720, 1040],
      labelAlign: 'start',
    },
    {
      points: [[850, 1115], [1080, 1114]],
      label: 'SIM',
      labelAt: [965, 1090],
    },
    {
      points: [[700, 1170], [700, 1210]],
      label: 'NÃO',
      labelAt: [720, 1190],
      labelAlign: 'start',
    },
    { points: [[1230, 1156], [1230, 1250], [870, 1250]] },
    { points: [[700, 1290], [700, 1340]] },
    {
      points: [[550, 1395], [480, 1395], [480, 1235], [530, 1235]],
      label: 'NÃO',
      labelAt: [502, 1370],
      labelAlign: 'end',
    },
    {
      points: [[700, 1450], [700, 1490]],
      label: 'SIM',
      labelAt: [720, 1470],
      labelAlign: 'start',
    },
    {
      points: [[850, 1545], [1080, 1544]],
      label: 'SIM',
      labelAt: [965, 1520],
    },
    {
      points: [[700, 1600], [700, 1650]],
      label: 'NÃO',
      labelAt: [720, 1625],
      labelAlign: 'start',
    },
    { points: [[1230, 1586], [1230, 1705], [850, 1705]] },
    {
      points: [[550, 1705], [430, 1705]],
      label: 'NÃO',
      labelAt: [494, 1682],
      labelAlign: 'end',
    },
    { points: [[285, 1671], [285, 1268], [530, 1268]] },
    {
      points: [[700, 1760], [700, 1800]],
      label: 'SIM',
      labelAt: [720, 1780],
      labelAlign: 'start',
    },
    { points: [[700, 1876], [700, 1916]] },
  ],
  notes: [
    { x: 60, y: 248, lines: ['ACESSO'] },
    { x: 60, y: 640, lines: ['PRIMEIRA', 'SESSÃO'] },
    { x: 60, y: 1120, lines: ['CAMPANHA'] },
  ],
  legend: {
    x: 1060,
    y: 1730,
    w: 380,
    title: 'LEGENDA — SÍMBOLOS',
    entries: [
      { shape: 'terminal', label: 'INÍCIO / FIM' },
      { shape: 'process', label: 'PROCESSO' },
      { shape: 'decision', label: 'DECISÃO (SIM / NÃO)' },
      { shape: 'io', label: 'ENTRADA / SAÍDA' },
      { shape: 'subroutine', label: 'SUBPROCESSO' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Fluxograma 2 — loop de uma fase (do carregamento à vitória)
// ---------------------------------------------------------------------------

export const LEVEL_FLOW: FlowDiagram = {
  id: 'fluxo-da-fase',
  title: 'FLUXOGRAMA 2 — LOOP DE UMA FASE',
  subtitle:
    'Ações, decisões, falhas e a vitória dentro de uma fase',
  width: 1560,
  height: 1800,
  nodes: [
    n('inicio-fase', 'terminal', 600, 90, 200, 56, 'INÍCIO DA FASE'),
    n(
      'carregar',
      'process',
      530,
      180,
      340,
      76,
      'CARREGAR A FASE',
      'mapa · tema do setor',
      'estado inicial',
    ),
    n('conector-a-topo', 'connector', 408, 196, 44, 44, 'A'),
    n(
      'ler-entrada',
      'io',
      530,
      300,
      340,
      70,
      'LER ENTRADA',
      'setas · E · TAB · H · ESC',
    ),
    n('pausar', 'decision', 550, 410, 300, 100, 'ESC —', 'PAUSAR?'),
    n(
      'menu-pausa',
      'process',
      1060,
      420,
      340,
      84,
      'MENU DE PAUSA',
      'continuar · reiniciar · sair',
    ),
    n('acao', 'decision', 550, 550, 300, 110, 'QUAL AÇÃO?'),
    n(
      'mover',
      'process',
      120,
      565,
      340,
      80,
      'MOVER / EMPURRAR',
      'caixotes em cadeia',
    ),
    n('movimento-ok', 'decision', 170, 690, 260, 110, 'MOVIMENTO', 'VÁLIDO?'),
    n('bloqueio', 'process', 100, 860, 300, 64, 'BLOQUEIO', 'som + nada acontece'),
    n(
      'interagir',
      'process',
      1060,
      550,
      340,
      96,
      'INTERAGIR (E)',
      'alavanca · botão · terminal',
      'duto · passagem · alçapão',
    ),
    n(
      'encerrar-ciclo',
      'process',
      1060,
      700,
      340,
      80,
      'ENCERRAR CICLO (TAB)',
      'grava o eco e reinicia',
    ),
    n(
      'resolver',
      'process',
      530,
      850,
      340,
      84,
      'RESOLVER A CASA PISADA',
      'gema · chave · porta',
      'duto · passagem secreta',
    ),
    n('bueiro', 'decision', 550, 980, 300, 110, 'BUEIRO SEM', 'TAMPA?'),
    n(
      'captura',
      'process',
      1060,
      990,
      320,
      80,
      'ALIENÍGENA CAPTURA',
      'animação + som',
    ),
    n(
      'reiniciar',
      'process',
      1060,
      1110,
      320,
      72,
      'REINICIAR A FASE',
      'captura · morte · orçamento',
    ),
    n('vazio', 'decision', 550, 1150, 300, 110, 'CAIU NO', 'VAZIO?'),
    n('saida', 'decision', 550, 1300, 300, 110, 'CHEGOU À', 'SAÍDA?'),
    n(
      'passos',
      'decision',
      550,
      1450,
      300,
      110,
      'ESGOTOU OS',
      'PASSOS DO CICLO?',
    ),
    n(
      'vitoria',
      'process',
      1060,
      1310,
      320,
      86,
      'VITÓRIA',
      'salva progresso e',
      'libera a próxima fase',
    ),
    n('fim-fase', 'terminal', 1120, 1430, 200, 56, 'FIM DA FASE'),
    n('conector-a-base', 'connector', 1198, 1216, 44, 44, 'A'),
    n('conector-b-topo', 'connector', 408, 313, 44, 44, 'B'),
    n('conector-b-base', 'connector', 678, 1678, 44, 44, 'B'),
  ],
  edges: [
    { points: [[700, 146], [700, 180]] },
    { points: [[700, 256], [700, 300]] },
    { points: [[452, 218], [530, 218]] },
    { points: [[700, 370], [700, 410]] },
    {
      points: [[850, 460], [1060, 462]],
      label: 'SIM',
      labelAt: [955, 438],
    },
    {
      points: [[1230, 420], [1230, 320], [900, 320], [900, 335], [870, 335]],
      label: 'CONTINUAR',
      labelAt: [1055, 298],
    },
    {
      points: [[700, 510], [700, 550]],
      label: 'NÃO',
      labelAt: [720, 530],
      labelAlign: 'start',
    },
    {
      points: [[550, 605], [460, 605]],
      label: 'MOVER',
      labelAt: [505, 582],
    },
    {
      points: [[850, 605], [950, 605], [950, 598], [1060, 598]],
      label: 'INTERAGIR (E)',
      labelAt: [950, 572],
    },
    {
      points: [[700, 660], [960, 660], [960, 740], [1060, 740]],
      label: 'TAB',
      labelAt: [820, 638],
    },
    { points: [[290, 645], [290, 665], [300, 665], [300, 690]] },
    {
      points: [[170, 745], [90, 745], [90, 892], [100, 892]],
      label: 'NÃO',
      labelAt: [142, 718],
    },
    {
      points: [[300, 800], [300, 825], [700, 825], [700, 850]],
      label: 'SIM',
      labelAt: [505, 803],
    },
    { points: [[250, 924], [250, 1700], [678, 1700]] },
    {
      points: [[1230, 646], [1430, 646], [1430, 1700], [722, 1700]],
    },
    {
      points: [[1230, 780], [1230, 820], [1430, 820]],
      arrow: false,
    },
    { points: [[700, 934], [700, 980]] },
    {
      points: [[850, 1035], [950, 1035], [950, 1030], [1060, 1030]],
      label: 'SIM',
      labelAt: [955, 1006],
    },
    {
      points: [[700, 1090], [700, 1150]],
      label: 'NÃO',
      labelAt: [720, 1120],
      labelAlign: 'start',
    },
    { points: [[1220, 1070], [1220, 1110]] },
    {
      points: [[850, 1205], [950, 1205], [950, 1146], [1060, 1146]],
      label: 'SIM',
      labelAt: [955, 1180],
    },
    {
      points: [[700, 1260], [700, 1300]],
      label: 'NÃO',
      labelAt: [720, 1280],
      labelAlign: 'start',
    },
    {
      points: [[850, 1355], [950, 1355], [950, 1353], [1060, 1353]],
      label: 'SIM',
      labelAt: [955, 1330],
    },
    {
      points: [[700, 1410], [700, 1450]],
      label: 'NÃO',
      labelAt: [720, 1428],
      labelAlign: 'start',
    },
    {
      points: [[850, 1505], [980, 1505], [980, 1170], [1060, 1170]],
      label: 'SIM',
      labelAt: [955, 1480],
    },
    {
      points: [[700, 1560], [700, 1678]],
      label: 'NÃO (CONTINUA)',
      labelAt: [720, 1608],
      labelAlign: 'start',
    },
    { points: [[1220, 1396], [1220, 1430]] },
    { points: [[1220, 1182], [1220, 1216]] },
    { points: [[452, 335], [530, 335]] },
  ],
  legend: {
    x: 1080,
    y: 54,
    w: 400,
    title: 'LEGENDA — SÍMBOLOS',
    entries: [
      { shape: 'terminal', label: 'INÍCIO / FIM' },
      { shape: 'process', label: 'PROCESSO' },
      { shape: 'decision', label: 'DECISÃO' },
      { shape: 'io', label: 'ENTRADA / SAÍDA' },
      { shape: 'connector', label: 'CONECTOR (A / B)' },
    ],
  },
};

export const FLOW_DIAGRAMS: FlowDiagram[] = [GAME_FLOW, LEVEL_FLOW];
