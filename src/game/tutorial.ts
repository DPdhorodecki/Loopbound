import { LevelDef } from './level';

export interface TutorialRoom {
  def: LevelDef;
  /** Título curto mostrado no painel de dica. */
  title: string;
  /** Linhas explicativas mostradas enquanto o jogador não deu o primeiro passo. */
  lines: string[];
}

/**
 * Tutorial em 4 salas: andar, empurrar, eco e chave.
 * Cada sala reaproveita o núcleo de regras (`tryMove`) e a solução é validada
 * pelo teste `tests/tutorial.test.ts`.
 */
export const TUTORIAL_ROOMS: TutorialRoom[] = [
  {
    title: 'SALA 1 - ANDAR',
    lines: [
      'MOVER: WASD, SETAS OU DESLIZAR O DEDO.',
      'CHEGUE AO NUCLEO. A GEMA E OPCIONAL.',
    ],
    def: {
      id: 'tuto-andar',
      name: 'Andar',
      subtitle: 'Vá até o núcleo.',
      cycleLength: 24,
      maxEchoes: 0,
      par: { cycles: 1, steps: 10 },
      map: [
        '#############',
        '#P.........E#',
        '#....g......#',
        '#...........#',
        '#############',
      ],
      solution: [['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R']],
    },
  },
  {
    title: 'SALA 2 - EMPURRAR',
    lines: [
      'EMPURRE O CAIXOTE ATE A PLACA VERMELHA.',
      'A PLACA ABRE O PORTAO. CRUZE E SAIA.',
    ],
    def: {
      id: 'tuto-empurrar',
      name: 'Empurrar',
      subtitle: 'Caixote na placa abre o portão.',
      cycleLength: 24,
      maxEchoes: 0,
      par: { cycles: 1, steps: 12 },
      map: [
        '#############',
        '#P....#.....#',
        '#.....#.....#',
        '#..C..R....E#',
        '#..r..#.....#',
        '#.....#.....#',
        '#############',
      ],
      solution: [
        ['R', 'R', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      ],
    },
  },
  {
    title: 'SALA 3 - ECO',
    lines: [
      'PISE NA PLACA E APERTE TAB PARA ENCERRAR.',
      'O ECO FICA NA PLACA. AGORA CRUZE O PORTAO.',
    ],
    def: {
      id: 'tuto-eco',
      name: 'Eco',
      subtitle: 'Encerrar o ciclo deixa um eco.',
      cycleLength: 20,
      maxEchoes: 1,
      par: { cycles: 2, steps: 19 },
      map: [
        '#################',
        '#P...#......E...#',
        '#....#..........#',
        '#....R..........#',
        '#.r..#..........#',
        '#....#..........#',
        '#################',
      ],
      solution: [
        ['D', 'D', 'D', 'R'],
        ['D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
      ],
    },
  },
  {
    title: 'SALA 4 - CHAVE',
    lines: [
      'PEGUE A CHAVE. ELA ABRE A PORTA TRANCADA.',
      'UM ECO NA PLACA ABRE O PORTAO NO MEIO.',
    ],
    def: {
      id: 'tuto-chave',
      name: 'Chave',
      subtitle: 'Chave, porta e eco.',
      cycleLength: 20,
      maxEchoes: 2,
      par: { cycles: 2, steps: 19 },
      map: [
        '#################',
        '#P..K.#.........#',
        '#.....#.........#',
        '#.....D...R.E...#',
        '#.....#.........#',
        '#..r..#.........#',
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
  },
];
