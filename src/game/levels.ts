import { LevelDef } from './level';

/**
 * Campanha principal (10 fases).
 *
 * Cada fase tem `solution`: um array de movimentos por ciclo. O teste
 * `tests/game.test.ts` replaya cada solução e falha se ela não vencer.
 *
 * Os mapas das fases foram "fechados" por `scripts/tighten.ts`, que replaya a
 * solução e transforma em parede todo tile de piso que nenhum ciclo pisa. Assim
 * nenhuma fase é um campo aberto: todas têm corredores, salas e becos.
 *
 * Para ajustar um mapa à mão, edite aqui e rode `npm test`; se preferir gerar a
 * versão fechada de novo, rode `npx vite-node scripts/tighten.ts`.
 */
export const LEVELS: LevelDef[] = [
  {
    id: 'primeiros-passos',
    name: 'Primeiros Passos',
    subtitle: 'Ande até o núcleo.',
    cycleLength: 16,
    maxEchoes: 0,
    par: { cycles: 1, steps: 12 },
    map: [
      '###############',
      '#P..###########',
      '##.############',
      '#..############',
      '#.#############',
      '#..############',
      '#.#############',
      '#...gE.########',
      '###############',
    ],
    solution: [['R', 'D', 'D', 'L', 'D', 'D', 'D', 'D', 'R', 'R', 'R', 'R']],
  },
  {
    id: 'peso-morto',
    name: 'Peso Morto',
    subtitle: 'Caixotes seguram placas. Você, não.',
    cycleLength: 24,
    maxEchoes: 0,
    par: { cycles: 1, steps: 20 },
    map: [
      '#############',
      '#P..#####..E#',
      '#......#....#',
      '#..C...R....#',
      '#......#...##',
      '#...r.#######',
      '##...########',
      '#############',
    ],
    solution: [
      [
        'D', 'R', 'R', 'D', 'D', 'L', 'D', 'R', 'U', 'U',
        'R', 'R', 'R', 'R', 'R', 'R', 'R',
        'U', 'U', 'R',
      ],
    ],
  },
  {
    id: 'primeiro-eco',
    name: 'Primeiro Eco',
    subtitle: 'Terminar o ciclo também é um movimento.',
    cycleLength: 16,
    maxEchoes: 1,
    par: { cycles: 2, steps: 19 },
    map: [
      '#################',
      '#P.########.E.###',
      '#....#........###',
      '#....R........###',
      '#.r..#.......####',
      '#..##############',
      '#################',
    ],
    solution: [
      ['D', 'D', 'D', 'R'],
      ['D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
  },
  {
    id: 'o-vao',
    name: 'O Vão',
    subtitle: 'Duas placas, dois ecos, uma travessia.',
    cycleLength: 20,
    maxEchoes: 2,
    par: { cycles: 3, steps: 25 },
    map: [
      '#################',
      '#P.##############',
      '#.......#~~~#..##',
      '#..r....R...L.E.#',
      '#.......#~~~#..##',
      '#..b.############',
      '#...#############',
      '#################',
    ],
    solution: [
      ['D', 'D', 'R', 'R'],
      ['D', 'D', 'D', 'D', 'R', 'R'],
      [
        'D', 'D',
        'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
      ],
    ],
  },
  {
    id: 'a-estrela-do-batedor',
    name: 'A Estrela do Batedor',
    subtitle: 'A chave abre a porta. O eco abre o resto.',
    cycleLength: 16,
    maxEchoes: 2,
    par: { cycles: 2, steps: 19 },
    map: [
      '#################',
      '#P..K.###########',
      '#.....#......####',
      '#.....D...R.E.###',
      '#.....#......####',
      '#..r.############',
      '#################',
    ],
    solution: [
      ['D', 'D', 'D', 'D', 'R', 'R'],
      [
        'R', 'R', 'R',
        'D', 'D',
        'R', 'R',
        'R', 'R', 'R', 'R',
        'R', 'R',
      ],
    ],
  },
  {
    id: 'peso-extra',
    name: 'Peso Extra',
    subtitle: 'O caixote segura uma placa. O eco, a outra.',
    cycleLength: 24,
    maxEchoes: 1,
    par: { cycles: 2, steps: 26 },
    map: [
      '###############',
      '#P.....########',
      '#....C........#',
      '#..#...g.R.L.E#',
      '#.............#',
      '#..b..r.#######',
      '#......########',
      '###############',
    ],
    solution: [
      ['D', 'D', 'D', 'D', 'R', 'R'],
      [
        'R', 'R', 'R', 'R',
        'D', 'D', 'D',
        'L', 'D', 'R',
        'U', 'U',
        'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
      ],
    ],
  },
  {
    id: 'tres-portoes',
    name: 'Três Portões',
    subtitle: 'Um eco para cada cor. Você só passa.',
    cycleLength: 24,
    maxEchoes: 3,
    par: { cycles: 4, steps: 34 },
    map: [
      '#################',
      '#P......#########',
      '#..r...R.########',
      '#........########',
      '#..b.#.L.########',
      '#...##..........#',
      '#..y.#.Y.......E#',
      '#################',
    ],
    solution: [
      ['D', 'R', 'R'],
      ['D', 'D', 'D', 'R', 'R'],
      ['D', 'D', 'D', 'D', 'D', 'R', 'R'],
      [
        'D',
        'R', 'R', 'R', 'R', 'R', 'R',
        'D', 'D',
        'D', 'D',
        'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
      ],
    ],
  },
  {
    id: 'pavio-curto',
    name: 'Pavio Curto',
    subtitle: 'O ciclo é curto. O eco é a ponte.',
    cycleLength: 8,
    maxEchoes: 1,
    par: { cycles: 2, steps: 10 },
    map: [
      '#################',
      '#P....R.E.#######',
      '#.....#..########',
      '#...#############',
      '#.r.#############',
      '##.##############',
      '#################',
    ],
    solution: [
      ['R', 'D', 'D', 'D'],
      ['R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'caminhos-cruzados',
    name: 'Caminhos Cruzados',
    subtitle: 'O caixote abre um lado. O eco, o outro.',
    cycleLength: 28,
    maxEchoes: 1,
    par: { cycles: 2, steps: 39 },
    map: [
      '#################',
      '#P...........####',
      '#....C.........##',
      '##.....L.R....E.#',
      '##.............##',
      '##.b...###.r.####',
      '###.#######.#####',
      '#################',
      '#################',
    ],
    solution: [
      ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'D', 'D', 'D', 'D'],
      [
        'R', 'R', 'R', 'R', 'R',
        'D',
        'L', 'L',
        'U', 'L',
        'D', 'D', 'D',
        'R', 'R', 'R',
        'U',
        'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R',
      ],
    ],
  },
  {
    id: 'ultima-luz',
    name: 'Última Luz',
    subtitle: 'Três portões, dois ecos e um caixote.',
    cycleLength: 28,
    maxEchoes: 2,
    par: { cycles: 3, steps: 38 },
    map: [
      '###############',
      '#############E#',
      '#############R#',
      '#############L#',
      '#############Y#',
      '#############.#',
      '#############.#',
      '#############.#',
      '#.............#',
      '#P..r..bC.y...#',
      '###############',
    ],
    solution: [
      ['R', 'R', 'R'],
      [
        'R', 'R', 'R', 'R', 'R', 'R',
        'U', 'R', 'R', 'D', 'R',
      ],
      [
        'R', 'R', 'R', 'R', 'R', 'R',
        'U', 'R', 'R', 'D',
        'L',
        'R', 'R', 'R', 'R', 'R',
        'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U',
      ],
    ],
  },
];

export const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);
