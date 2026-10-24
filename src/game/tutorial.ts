import { LevelDef } from './level';

export interface TutorialRoom {
  def: LevelDef;
  /** Título curto mostrado no painel de dica. */
  title: string;
  /** Linhas explicativas mostradas enquanto o jogador não deu o primeiro passo. */
  lines: string[];
}

/**
 * Tutorial em 8 salas: andar, empurrar, eco, chave, alavanca, botão, duto e
 * código. Cada sala reaproveita o núcleo de regras (`tryMove`/`interact`) e a
 * solução é validada pelo teste `tests/tutorial.test.ts`.
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
      cycleLength: 14,
      maxEchoes: 0,
      par: { cycles: 1, steps: 10 },
      map: [
        '#############',
        '#P.........E#',
        '#....g......#',
        '#...........#',
        '#############',
      ],
      solution: [
        ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      ],
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
      cycleLength: 16,
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
      cycleLength: 19,
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
      cycleLength: 17,
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
        ['R', 'R', 'R', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      ],
    },
  },
  {
    title: 'SALA 5 - ALAVANCA',
    lines: [
      'ENCARE A ALAVANCA E APERTE E PARA LIGAR.',
      'ELA FICA LIGADA E ABRE O PORTAO DA COR.',
    ],
    def: {
      id: 'tuto-alavanca',
      name: 'Alavanca',
      subtitle: 'Ligue a alavanca com E.',
      cycleLength: 13,
      maxEchoes: 0,
      par: { cycles: 1, steps: 9 },
      map: [
        '############',
        '#P.V.R....E#',
        '############',
      ],
      solution: [
        ['R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      ],
    },
  },
  {
    title: 'SALA 6 - BOTAO',
    lines: [
      'O BOTAO SO FICA PRESSIONADO COM UM CAIXOTE EM CIMA.',
      'EMPURRE O CAIXOTE PARA O BOTAO E CRUZE O PORTAO.',
    ],
    def: {
      id: 'tuto-botao',
      name: 'Botão',
      subtitle: 'Caixote mantém o botão pressionado.',
      cycleLength: 15,
      maxEchoes: 0,
      par: { cycles: 1, steps: 11 },
      map: [
        '############',
        '#P...R....E#',
        '#.C.H#######',
        '############',
      ],
      solution: [
        ['D', 'R', 'R', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      ],
    },
  },
  {
    title: 'SALA 7 - DUTO',
    lines: [
      'PISE NO DUTO E VOCE E TELEPORTADO PARA O PAR.',
      'SE UM CAIXOTE COBRIR O PAR, ELE NAO FUNCIONA.',
    ],
    def: {
      id: 'tuto-duto',
      name: 'Duto',
      subtitle: 'O duto teleporta para o par.',
      cycleLength: 9,
      maxEchoes: 0,
      par: { cycles: 1, steps: 5 },
      map: [
        '#############',
        '#P...#......#',
        '#....#......#',
        '#O...#....o.#',
        '#....#......#',
        '#....#.....E#',
        '#############',
      ],
      solution: [
        ['D', 'D', 'R', 'D', 'D'],
      ],
    },
  },
  {
    title: 'SALA 8 - CODIGO',
    lines: [
      'AS PISTAS NO CHAO MOSTRAM A ORDEM DO CODIGO.',
      'APERTE E NA TELA, DIGITE 1-9, CONFIRME COM C.',
    ],
    def: {
      id: 'tuto-codigo',
      name: 'Código',
      subtitle: 'Descubra a sequência e abra o portão.',
      cycleLength: 14,
      maxEchoes: 0,
      par: { cycles: 1, steps: 10 },
      map: [
        '#############',
        '#P.1.2.X.@.E#',
        '#############',
      ],
      solution: [
        ['R', 'R', 'R', 'R', 'R', 'R', 'E', '1', '2', 'C', 'R', 'R', 'R', 'R'],
      ],
      code: { type: 'roman', sequence: [0, 1] },
    },
  },
];
