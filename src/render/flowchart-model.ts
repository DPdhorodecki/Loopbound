/**
 * Modelo do fluxograma do LoopBound.
 *
 * Fonte única de verdade: o SVG versionado em `public/fluxograma-jogo.svg`
 * (`npm run fluxograma`) e o renderizador em canvas (`src/render/flowchart.ts`)
 * leem este mesmo modelo, então os dois nunca divergem.
 */

export type FlowKind = 'box' | 'diamond' | 'terminal';

export interface FlowNode {
  id: string;
  kind: FlowKind;
  /** Canto superior esquerdo. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Linhas de texto (centralizadas). */
  lines: string[];
}

export interface FlowEdge {
  /** Pontos do caminho, do começo (sem seta) até a ponta (com seta). */
  path: [number, number][];
  /** Rótulo opcional, desenhado perto do meio do caminho. */
  label?: string;
  /** Deslocamento do rótulo em relação ao ponto médio. */
  labelOffset?: [number, number];
}

export interface FlowNote {
  x: number;
  y: number;
  lines: string[];
  align?: 'start' | 'middle' | 'end';
}

export const FLOW_W = 1500;
export const FLOW_H = 1000;

export const FLOW_COLORS = {
  box: '#5B5F97',
  boxDark: '#3A3F70',
  shadow: '#2A2C4A',
  text: '#FFFFFF',
  arrow: '#000000',
  bg: '#FFFFFF',
  grid: '#E8E8E8',
  title: '#3A3F70',
} as const;

const box = (id: string, x: number, y: number, w: number, h: number, ...lines: string[]): FlowNode => ({
  id,
  kind: 'box',
  x,
  y,
  w,
  h,
  lines,
});

const diamond = (id: string, x: number, y: number, w: number, h: number, ...lines: string[]): FlowNode => ({
  id,
  kind: 'diamond',
  x,
  y,
  w,
  h,
  lines,
});

const terminal = (id: string, x: number, y: number, w: number, h: number, ...lines: string[]): FlowNode => ({
  id,
  kind: 'terminal',
  x,
  y,
  w,
  h,
  lines,
});

/** Nós do fluxograma (coordenadas da grade de 40 px). */
export const FLOW_NODES: FlowNode[] = [
  // ---- acesso
  box('titulo', 90, 100, 170, 56, 'TELA TÍTULO'),
  box('login', 290, 100, 190, 56, 'LOGIN / CADASTRO'),
  diamond('conta', 510, 90, 180, 90, 'JÁ TEM CONTA?'),
  box('menu', 730, 100, 230, 56, 'MENU PRINCIPAL'),
  box('cadastrar', 90, 196, 190, 52, 'CADASTRAR'),
  box('tutorial', 90, 300, 190, 64, 'TUTORIAL', '8 SALAS'),
  box('historia', 320, 300, 270, 64, 'HISTÓRIA', 'VOLTAR · PRÓXIMA · PULAR'),
  box('fases', 600, 300, 190, 64, 'ESCOLHER FASE', '(MENU FASES)'),
  // ---- jogo
  box('setor', 90, 420, 220, 64, 'CARREGAR SETOR', 'TEMA + DECORAÇÃO'),
  box('loop', 340, 410, 300, 84, 'LOOP DE JOGO', 'MOVER · INTERAGIR (E)', 'HUD: TAB · Z · H · ESC · TELA'),
  diamond('venceu', 700, 470, 200, 150, 'VENCEU?'),
  box('eco', 90, 540, 220, 64, 'TAB: GRAVAR ECO', 'O ECO REPETE O CAMINHO'),
  box('falha', 930, 700, 240, 76, 'BUEIRO: CAPTURA', 'VAZIO / PASSOS: MORTE', 'REINICIA A FASE'),
  box('vitoria', 600, 700, 240, 64, 'TELA DE VITÓRIA', 'PROGRESSO SALVO'),
  box('proxima', 330, 700, 240, 64, 'PRÓXIMA FASE', '(HISTÓRIA DO SETOR)'),
  box('creditos', 120, 860, 300, 64, 'FASE 30 → PRÓS-CRÉDITOS', 'CHUCHUTY AINDA ESTÁ VIVO'),
  terminal('fim', 460, 860, 140, 64, 'FIM'),
  // ---- painel de setores (decoração das paredes)
  box('s1', 1190, 110, 300, 80, 'SETOR 1 · CELA (1-6)', 'CELAS + CABINE DE GUARDA'),
  box('s2', 1190, 210, 300, 90, 'SETOR 2 · LAB (7-12)', 'FRASCOS · MICROSCOPIOS', 'TANQUES DE ESPÉCIE'),
  box('s3', 1190, 320, 300, 90, 'SETOR 3 · FÁBRICA (13-18)', 'ESTEIRAS · PRENSAS', 'TUBULAÇÃO'),
  box('s4', 1190, 430, 300, 90, 'SETOR 4 · COMANDO (19-24)', 'ESCRITÓRIOS · SERVIDORES', 'MESAS · ALIENÍGENAS'),
  box('s5', 1190, 540, 300, 90, 'SETOR 5 · HANGAR (25-30)', 'PEÇAS DE NAVE', 'BRAÇOS ROBÓTICOS · BARREIRA'),
];

/** Ligações (setas) do fluxograma. */
export const FLOW_EDGES: FlowEdge[] = [
  { path: [[260, 128], [290, 128]] },
  { path: [[480, 128], [510, 135]] },
  { path: [[690, 135], [730, 128]] },
  { path: [[600, 180], [600, 222], [280, 222], [280, 196]], label: 'NÃO', labelOffset: [34, -6] },
  { path: [[185, 196], [185, 170], [330, 170], [330, 156]], label: 'DEPOIS', labelOffset: [0, 18] },
  // barramento do menu
  { path: [[845, 156], [845, 270], [185, 270]] },
  { path: [[185, 270], [185, 300]] },
  { path: [[440, 270], [440, 300]] },
  { path: [[695, 270], [695, 300]] },
  // da escolha de fase para o jogo
  { path: [[695, 364], [695, 392], [200, 392], [200, 420]] },
  { path: [[310, 452], [340, 452]] },
  // loop
  { path: [[640, 452], [700, 500]] },
  { path: [[400, 494], [400, 522], [200, 522], [200, 540]], label: 'TAB' },
  { path: [[310, 572], [330, 572], [330, 494]], label: 'ECO' },
  { path: [[900, 545], [1050, 545], [1050, 700]], label: 'NÃO' },
  { path: [[930, 738], [870, 738], [870, 640], [640, 640], [640, 494]] },
  { path: [[800, 620], [800, 660], [720, 660], [720, 700]], label: 'SIM', labelOffset: [-46, -4] },
  { path: [[600, 732], [570, 732]] },
  { path: [[390, 764], [390, 800], [270, 800], [270, 860]], label: 'ÚLTIMA FASE (30)' },
  { path: [[420, 892], [460, 892]] },
];

/** Textos avulsos (títulos e legendas). */
export const FLOW_NOTES: FlowNote[] = [
  { x: FLOW_W / 2, y: 40, lines: ['FLUXOGRAMA — LOOPBOUND: KENNEDYTO E A FUGA DA INSTALAÇÃO ALIENÍGENA'], align: 'middle' },
  { x: 845, y: 222, lines: ['MENU → TUTORIAL / HISTÓRIA / FASES'], align: 'middle' },
  { x: 470, y: 248, lines: ['QUALQUER UM DESTES VOLTA AO MENU'], align: 'middle' },
  { x: 1190, y: 78, lines: ['SETORES E DECORAÇÃO DAS PAREDES'], align: 'start' },
  {
    x: 1190,
    y: 660,
    lines: [
      'LEGENDA DE PAREDE (SÓ DESENHO)',
      '| CELA   ^ BANCADA   & TANQUE',
      '/ ESTEIRA   + PRENSA   - TUBO',
      'w ESCRITÓRIO   f SERVIDOR   m MESA',
      'a ALIENÍGENA   h PEÇA DE NAVE',
      'p TRABALHANDO   t BRAÇO   F BARREIRA',
    ],
    align: 'start',
  },
  {
    x: 1190,
    y: 810,
    lines: [
      'MECÂNICAS',
      'PLACA · ALAVANCA · BOTÃO · DUTO',
      'PASSAGEM SECRETA · ALÇAPÃO',
      'BUEIRO · TELA DE CÓDIGO (SENHA)',
      'GEMA · CHAVE · PORTA · VAZIO',
    ],
    align: 'start',
  },
];

/** Banner lateral (roda na vertical). */
export const FLOW_BANNER = 'INÍCIO · MENU · HISTÓRIA · TUTORIAL · JOGAR · SETORES · VITÓRIA · CRÉDITOS';
