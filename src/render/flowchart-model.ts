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
// Fluxograma completo — acesso, menu, loop da fase e campanha em um só fluxo
// ---------------------------------------------------------------------------

export const FLOW_COMBINED: FlowDiagram = {
  id: 'fluxograma-completo',
  title: 'FLUXOGRAMA COMPLETO — LOOPBOUND',
  subtitle:
    'Do login ao fim da campanha, passando pelo loop completo de cada fase',
  width: 2400,
  height: 3320,
  nodes: [
    // acesso
    n('c-inicio', 'terminal', 1180, 100, 240, 56, 'INÍCIO'),
    n(
      'c-boot',
      'process',
      1120,
      190,
      360,
      70,
      'ABRIR O JOGO',
      'save · assets · service worker',
    ),
    n('c-sessao', 'decision', 1140, 300, 320, 110, 'TEM SESSÃO', 'SALVA?'),
    n(
      'c-login',
      'io',
      470,
      310,
      300,
      76,
      'LOGIN OU CADASTRO',
      'API + PostgreSQL',
    ),
    n('c-cred', 'decision', 500, 430, 240, 100, 'CREDENCIAIS', 'VÁLIDAS?'),
    n('c-prologo', 'decision', 1140, 460, 320, 110, 'PRÓLOGO', 'JÁ VISTO?'),
    n(
      'c-prologo-sub',
      'subroutine',
      1780,
      470,
      360,
      84,
      'EXIBIR PRÓLOGO',
      'história em quadrinhos',
    ),
    n('c-tutorial', 'decision', 1140, 620, 320, 110, 'TUTORIAL', 'CONCLUÍDO?'),
    n(
      'c-tutorial-sub',
      'subroutine',
      1780,
      635,
      360,
      84,
      'TUTORIAL',
      '8 salas',
    ),
    n(
      'c-menu',
      'process',
      1120,
      780,
      360,
      84,
      'MENU PRINCIPAL',
      'JOGAR · FASES · HISTÓRIA',
      'HISTÓRICO · PERFIL',
    ),
    n('c-escolheu', 'decision', 1140, 915, 320, 110, 'ESCOLHEU', 'UMA FASE?'),
    n(
      'c-visita',
      'decision',
      1140,
      1060,
      320,
      110,
      '1ª VISITA',
      'AO SETOR?',
    ),
    n(
      'c-abertura',
      'subroutine',
      1780,
      1072,
      360,
      84,
      'HISTÓRIA DE ABERTURA',
      'do setor (HQ)',
    ),
    // loop da fase
    n('c-carregar', 'process', 1120, 1210, 360, 80, 'CARREGAR A FASE', 'mapa · tema · estado inicial'),
    n(
      'c-entrada',
      'io',
      1120,
      1330,
      360,
      70,
      'LER ENTRADA',
      'setas · E · TAB · H · ESC',
    ),
    n('c-pausar', 'decision', 1140, 1440, 320, 100, 'ESC —', 'PAUSAR?'),
    n(
      'c-pausa-menu',
      'process',
      1780,
      1450,
      360,
      84,
      'MENU DE PAUSA',
      'continuar · reiniciar · sair',
    ),
    n('c-acao', 'decision', 1140, 1580, 320, 110, 'QUAL AÇÃO?'),
    n(
      'c-mover',
      'process',
      470,
      1595,
      340,
      80,
      'MOVER / EMPURRAR',
      'caixotes em cadeia',
    ),
    n('c-valido', 'decision', 520, 1720, 260, 110, 'MOVIMENTO', 'VÁLIDO?'),
    n('c-bloqueio', 'process', 470, 1870, 340, 64, 'BLOQUEIO', 'som + nada acontece'),
    n(
      'c-interagir',
      'process',
      1780,
      1580,
      360,
      96,
      'INTERAGIR (E)',
      'alavanca · botão · terminal',
      'duto · passagem · alçapão',
    ),
    n(
      'c-tab',
      'process',
      1780,
      1710,
      360,
      80,
      'ENCERRAR CICLO (TAB)',
      'grava o eco e reinicia',
    ),
    n(
      'c-resolver',
      'process',
      1120,
      1880,
      360,
      84,
      'RESOLVER A CASA PISADA',
      'gema · chave · porta',
      'duto · passagem secreta',
    ),
    n('c-bueiro', 'decision', 1140, 2010, 320, 110, 'BUEIRO SEM', 'TAMPA?'),
    n(
      'c-captura',
      'process',
      1780,
      2020,
      360,
      80,
      'ALIENÍGENA CAPTURA',
      'animação + som',
    ),
    n(
      'c-reiniciar',
      'process',
      1780,
      2140,
      360,
      72,
      'REINICIAR A FASE',
      'captura · morte · orçamento',
    ),
    n('c-vazio', 'decision', 1140, 2160, 320, 110, 'CAIU NO', 'VAZIO?'),
    n('c-saida', 'decision', 1140, 2300, 320, 110, 'CHEGOU À', 'SAÍDA?'),
    n(
      'c-vitoria',
      'process',
      1780,
      2310,
      360,
      86,
      'VITÓRIA',
      'salva progresso e',
      'libera a próxima fase',
    ),
    n(
      'c-passos',
      'decision',
      1140,
      2440,
      320,
      110,
      'ESGOTOU OS',
      'PASSOS DO CICLO?',
    ),
    // campanha
    n('c-fim-setor', 'decision', 1140, 2760, 320, 110, 'FIM DO', 'SETOR?'),
    n(
      'c-encerramento',
      'subroutine',
      1780,
      2772,
      360,
      84,
      'HISTÓRIA DE ENCERRAMENTO',
      'do setor (HQ)',
    ),
    n('c-ultima', 'decision', 1140, 2910, 320, 110, 'ÚLTIMA FASE', '(30)?'),
    n(
      'c-proxima',
      'process',
      470,
      2931,
      340,
      68,
      'AVANÇAR PARA',
      'A PRÓXIMA FASE',
    ),
    n(
      'c-final',
      'subroutine',
      1120,
      3060,
      360,
      76,
      'CENA FINAL (HQ)',
      'pós-créditos',
    ),
    n('c-fim', 'terminal', 1180, 3170, 240, 56, 'FIM'),
    // conectores
    n('c-a-topo', 'connector', 878, 1228, 44, 44, 'A'),
    n('c-a-base', 'connector', 1938, 2223, 44, 44, 'A'),
    n('c-b-topo', 'connector', 878, 1343, 44, 44, 'B'),
    n('c-b-base', 'connector', 878, 2598, 44, 44, 'B'),
    n('c-c-topo', 'connector', 1538, 1228, 44, 44, 'C'),
    n('c-c-base', 'connector', 618, 3018, 44, 44, 'C'),
  ],
  edges: [
    // acesso
    { points: [[1300, 156], [1300, 190]] },
    { points: [[1300, 260], [1300, 300]] },
    {
      points: [[1140, 355], [770, 355]],
      label: 'NÃO',
      labelAt: [955, 330],
    },
    { points: [[620, 386], [620, 430]] },
    {
      points: [[500, 480], [420, 480], [420, 348], [470, 348]],
      label: 'NÃO',
      labelAt: [455, 505],
      labelAlign: 'end',
    },
    {
      points: [[740, 480], [880, 480], [880, 515], [1140, 515]],
      label: 'SIM',
      labelAt: [850, 458],
      labelAlign: 'end',
    },
    {
      points: [[1300, 410], [1300, 460]],
      label: 'SIM',
      labelAt: [1320, 436],
      labelAlign: 'start',
    },
    {
      points: [[1460, 515], [1780, 512]],
      label: 'NÃO',
      labelAt: [1620, 490],
    },
    {
      points: [[1300, 570], [1300, 620]],
      label: 'SIM',
      labelAt: [1320, 595],
      labelAlign: 'start',
    },
    { points: [[1960, 554], [1960, 675], [1460, 675]] },
    {
      points: [[1460, 675], [1780, 677]],
      label: 'NÃO',
      labelAt: [1620, 652],
    },
    {
      points: [[1300, 730], [1300, 780]],
      label: 'SIM',
      labelAt: [1320, 755],
      labelAlign: 'start',
    },
    { points: [[1960, 719], [1960, 822], [1480, 822]] },
    { points: [[1300, 864], [1300, 915]] },
    {
      points: [[1140, 970], [1030, 970], [1030, 822], [1120, 822]],
      label: 'NÃO',
      labelAt: [1096, 948],
      labelAlign: 'end',
    },
    {
      points: [[1300, 1025], [1300, 1060]],
      label: 'SIM',
      labelAt: [1320, 1042],
      labelAlign: 'start',
    },
    {
      points: [[1460, 1115], [1780, 1114]],
      label: 'SIM',
      labelAt: [1620, 1090],
    },
    {
      points: [[1300, 1170], [1300, 1210]],
      label: 'NÃO',
      labelAt: [1320, 1190],
      labelAlign: 'start',
    },
    { points: [[1960, 1156], [1960, 1190], [1400, 1190], [1400, 1210]] },
    // loop da fase
    { points: [[1300, 1290], [1300, 1330]] },
    { points: [[1300, 1400], [1300, 1440]] },
    {
      points: [[1460, 1490], [1780, 1492]],
      label: 'SIM',
      labelAt: [1620, 1466],
    },
    {
      points: [[1960, 1450], [1960, 1300], [1550, 1300], [1550, 1365], [1480, 1365]],
      label: 'CONTINUAR',
      labelAt: [1750, 1278],
    },
    {
      points: [[1300, 1540], [1300, 1580]],
      label: 'NÃO',
      labelAt: [1320, 1560],
      labelAlign: 'start',
    },
    {
      points: [[1140, 1635], [810, 1635]],
      label: 'MOVER',
      labelAt: [975, 1610],
    },
    {
      points: [[1460, 1635], [1600, 1635], [1600, 1628], [1780, 1628]],
      label: 'INTERAGIR (E)',
      labelAt: [1620, 1602],
    },
    {
      points: [[1300, 1690], [1600, 1690], [1600, 1750], [1780, 1750]],
      label: 'TAB',
      labelAt: [1450, 1668],
    },
    { points: [[640, 1675], [640, 1700], [650, 1700], [650, 1720]] },
    {
      points: [[520, 1775], [430, 1775], [430, 1902], [470, 1902]],
      label: 'NÃO',
      labelAt: [452, 1748],
    },
    {
      points: [[650, 1830], [650, 1855], [1300, 1855], [1300, 1880]],
      label: 'SIM',
      labelAt: [980, 1833],
    },
    { points: [[640, 1934], [640, 2620], [878, 2620]] },
    {
      points: [[1960, 1676], [2240, 1676], [2240, 2620], [922, 2620]],
    },
    {
      points: [[1960, 1790], [2240, 1790]],
      arrow: false,
    },
    { points: [[1300, 1964], [1300, 2010]] },
    {
      points: [[1460, 2065], [1600, 2065], [1600, 2060], [1780, 2060]],
      label: 'SIM',
      labelAt: [1620, 2038],
    },
    {
      points: [[1300, 2120], [1300, 2160]],
      label: 'NÃO',
      labelAt: [1320, 2140],
      labelAlign: 'start',
    },
    { points: [[1960, 2100], [1960, 2140]] },
    {
      points: [[1460, 2215], [1600, 2215], [1600, 2176], [1780, 2176]],
      label: 'SIM',
      labelAt: [1620, 2192],
    },
    {
      points: [[1300, 2270], [1300, 2300]],
      label: 'NÃO',
      labelAt: [1320, 2285],
      labelAlign: 'start',
    },
    {
      points: [[1460, 2355], [1600, 2355], [1600, 2353], [1780, 2353]],
      label: 'SIM',
      labelAt: [1620, 2330],
    },
    {
      points: [[1300, 2410], [1300, 2440]],
      label: 'NÃO',
      labelAt: [1320, 2425],
      labelAlign: 'start',
    },
    {
      points: [[1460, 2495], [2180, 2495], [2180, 2176], [2140, 2176]],
      label: 'SIM',
      labelAt: [1620, 2472],
    },
    {
      points: [[1300, 2550], [1300, 2580], [900, 2580], [900, 2598]],
      label: 'NÃO (CONTINUA)',
      labelAt: [1320, 2568],
      labelAlign: 'start',
    },
    { points: [[1960, 2212], [1960, 2223]] },
    { points: [[922, 1250], [1120, 1250]] },
    { points: [[922, 1365], [1120, 1365]] },
    { points: [[1538, 1250], [1480, 1250]] },
    // campanha
    { points: [[1960, 2396], [1960, 2700], [1300, 2700], [1300, 2760]] },
    {
      points: [[1460, 2815], [1780, 2814]],
      label: 'SIM',
      labelAt: [1620, 2792],
    },
    { points: [[1960, 2856], [1960, 2965], [1460, 2965]] },
    {
      points: [[1300, 2870], [1300, 2910]],
      label: 'NÃO',
      labelAt: [1320, 2890],
      labelAlign: 'start',
    },
    {
      points: [[1140, 2965], [810, 2965]],
      label: 'NÃO',
      labelAt: [975, 2940],
    },
    { points: [[640, 2999], [640, 3018]] },
    {
      points: [[1300, 3020], [1300, 3060]],
      label: 'SIM',
      labelAt: [1320, 3040],
      labelAlign: 'start',
    },
    { points: [[1300, 3136], [1300, 3170]] },
  ],
  notes: [
    { x: 60, y: 240, lines: ['ACESSO'] },
    { x: 60, y: 1470, lines: ['LOOP', 'DA FASE'] },
  ],
  legend: {
    x: 60,
    y: 2680,
    w: 400,
    title: 'LEGENDA — SÍMBOLOS',
    entries: [
      { shape: 'terminal', label: 'INÍCIO / FIM' },
      { shape: 'process', label: 'PROCESSO' },
      { shape: 'decision', label: 'DECISÃO (SIM / NÃO)' },
      { shape: 'io', label: 'ENTRADA / SAÍDA' },
      { shape: 'subroutine', label: 'SUBPROCESSO' },
      { shape: 'connector', label: 'CONECTOR (A / B / C)' },
    ],
  },
};

export const FLOW_DIAGRAMS: FlowDiagram[] = [FLOW_COMBINED];

