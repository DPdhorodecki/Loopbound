import { LevelDef } from '../src/game/level';

/**
 * Campanha principal (30 fases).
 *
 * Cada fase tem `solution`: um array de a├º├Áes por ciclo. O teste
 * `tests/game.test.ts` replaya cada solu├º├úo e falha se ela n├úo vencer.
 *
 * Nas fases com senha (tela `X` + port├úo de c├│digo `@`) o ch├úo guarda as
 * pistas na ordem de leitura (um ├¡ndice 1, 2, 3ÔÇª aparece sobre cada pista). A
 * senha ├® **sorteada no in├¡cio da fase** por `parseLevel` e escrita nessas
 * pistas; por isso a solu├º├úo usa `?`, que pressiona sempre o pr├│ximo s├¡mbolo
 * correto ÔÇö o replay funciona qualquer que seja a senha gerada.
 */
export const LEVELS: LevelDef[] = [
  {
    id: 'primeiros-passos',
    name: 'O Despertar',
    subtitle: 'Acorde e encontre a escotilha da cela.',
    cycleLength: 13,
    maxEchoes: 0,
    par: { cycles: 1, steps: 12 },
    map: [
      '###############',
      '#P!############',
      '##.############',
      '#..############',
      '#.#############',
      '#.#############',
      '#.#############',
      '#..!gE#########',
      '###############'
    ],
    solution: [
      ['R', 'D', 'D', 'L', 'D', 'D', 'D', 'D', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'peso-morto',
    name: 'Peso Morto',
    subtitle: 'O cont├¬iner segura a placa. Voc├¬, n├úo.',
    cycleLength: 21,
    maxEchoes: 0,
    par: { cycles: 1, steps: 20 },
    map: [
      '#############',
      '#P########.E#',
      '#!..######.##',
      '###C!.!R...##',
      '##.!#########',
      '##..r########',
      '#############',
      '#############'
    ],
    solution: [
      ['D', 'R', 'R', 'D', 'D', 'L', 'D', 'R', 'U', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'R'],
    ],
  },
  {
    id: 'primeiro-eco',
    name: 'Primeiro Eco',
    subtitle: 'O campo de loop se lembra de voc├¬.',
    cycleLength: 16,
    maxEchoes: 1,
    par: { cycles: 2, steps: 19 },
    map: [
      '#################',
      '#P##########E####',
      '#.##########.####',
      '#....R.......####',
      '#.r##############',
      '#################',
      '#################'
    ],
    solution: [
      ['D', 'D', 'D', 'R'],
      ['D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
  },
  {
    id: 'o-vao',
    name: 'O V├úo',
    subtitle: 'Duas placas, dois ecos e o abismo.',
    cycleLength: 16,
    maxEchoes: 2,
    par: { cycles: 3, steps: 25 },
    map: [
      '#################',
      '#P###############',
      '#.#######~~~#####',
      '#!.r...!R.!.L.E##',
      '#.#######~~~#####',
      '#!.b#############',
      '#################',
      '#################'
    ],
    solution: [
      ['D', 'D', 'R', 'R'],
      ['D', 'D', 'D', 'D', 'R', 'R'],
      ['D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'a-estrela-do-batedor',
    name: 'Cart├úo de Acesso',
    subtitle: 'O cart├úo abre a porta. O eco, o resto.',
    cycleLength: 14,
    maxEchoes: 2,
    par: { cycles: 2, steps: 19 },
    map: [
      '#################',
      '#P..K############',
      '#.##.############',
      '#.##..D.!.R.E####',
      '#.###############',
      '#..r#############',
      '#################'
    ],
    solution: [
      ['D', 'D', 'D', 'D', 'R', 'R'],
      ['R', 'R', 'R', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'peso-extra',
    name: 'Peso Extra',
    subtitle: 'O cont├¬iner segura uma placa; o eco, a outra.',
    cycleLength: 21,
    maxEchoes: 1,
    par: { cycles: 2, steps: 26 },
    map: [
      '###############',
      '#P.!..#########',
      '#.###C#########',
      '#.###..g.R.L.E#',
      '#.##.!#########',
      '#!!b..r########',
      '###############',
      '###############'
    ],
    solution: [
      ['D', 'D', 'D', 'D', 'R', 'R'],
      ['R', 'R', 'R', 'R', 'D', 'D', 'D', 'L', 'D', 'R', 'U', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'tres-portoes',
    name: 'Tr├¬s Barreiras',
    subtitle: 'Um eco para cada cor. Voc├¬ s├│ passa.',
    cycleLength: 20,
    maxEchoes: 3,
    par: { cycles: 4, steps: 34 },
    map: [
      '#################',
      '#P###############',
      '#..r...R#########',
      '#.#####.#########',
      '#!!b###L#########',
      '#.#####.#########',
      '#..y###Y......!E#',
      '#################'
    ],
    solution: [
      ['D', 'R', 'R'],
      ['D', 'D', 'D', 'R', 'R'],
      ['D', 'D', 'D', 'D', 'D', 'R', 'R'],
      ['D', 'R', 'R', 'R', 'R', 'R', 'R', 'D', 'D', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'pavio-curto',
    name: 'Pavio Curto',
    subtitle: 'Ciclo curto, eco certeiro.',
    cycleLength: 8,
    maxEchoes: 1,
    par: { cycles: 2, steps: 11 },
    map: [
      '#################',
      '#P.!!.R.E########',
      '##.##############',
      '##.##############',
      '##r##############',
      '#################',
      '#################'
    ],
    solution: [
      ['R', 'D', 'D', 'D'],
      ['R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'caminhos-cruzados',
    name: 'Caminhos Cruzados',
    subtitle: 'O cont├¬iner e o eco abrem lados opostos.',
    cycleLength: 22,
    maxEchoes: 1,
    par: { cycles: 2, steps: 36 },
    map: [
      '#################',
      '###############E#',
      '###############R#',
      '###############L#',
      '###############.#',
      '###############!#',
      '#P..C...!b....r.#',
      '#....!..........#',
      '#################'
    ],
    solution: [
      ['D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U'],
      ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'U', 'U', 'U'],
    ],
  },
  {
    id: 'ultima-luz',
    name: '├Ültima Luz',
    subtitle: 'Tr├¬s port├Áes, dois ecos e um cont├¬iner.',
    cycleLength: 25,
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
      '#######...###!#',
      '#P.!r..bC.y...#',
      '###############'
    ],
    solution: [
      ['R', 'R', 'R'],
      ['R', 'R', 'R', 'R', 'R', 'R', 'U', 'R', 'R', 'D', 'R'],
      ['R', 'R', 'R', 'R', 'R', 'R', 'U', 'R', 'R', 'D', 'L', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'U', 'U', 'U', 'U', 'U'],
    ],
  },
  {
    id: 'a-alavanca',
    name: 'A V├ílvula',
    subtitle: 'Aperte E para ligar a corrente.',
    cycleLength: 12,
    maxEchoes: 0,
    par: { cycles: 1, steps: 11 },
    map: [
      '###############',
      '#P..V!.R...!E##',
      '###############'
    ],
    solution: [
      ['R', 'R', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'dois-interruptores',
    name: 'Dois Circuitos',
    subtitle: 'Duas alavancas, dois port├Áes.',
    cycleLength: 15,
    maxEchoes: 0,
    par: { cycles: 1, steps: 14 },
    map: [
      '#################',
      '#P!V..R.W..L...E#',
      '#################'
    ],
    solution: [
      ['R', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'circuito-duplo',
    name: 'Circuito Duplo',
    subtitle: 'A alavanca abre um port├úo; o cont├¬iner, o outro.',
    cycleLength: 31,
    maxEchoes: 0,
    par: { cycles: 1, steps: 30 },
    map: [
      '#####################',
      '#P.......#....#.....#',
      '#.....!..#.!..#....!#',
      '#.!V..!.!#.C!.#...!E#',
      '#..!...!.#.!.!#!..!.#',
      '#...!.!!.R!b.!L.....#',
      '#####################'
    ],
    solution: [
      ['D', 'D', 'R', 'R', 'E', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'D', 'D', 'R', 'D', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'prelo',
    name: 'Prelo',
    subtitle: 'A prensa s├│ cede com peso em cima.',
    cycleLength: 24,
    maxEchoes: 0,
    par: { cycles: 1, steps: 23 },
    map: [
      '#####################',
      '#P...!...#......!...#',
      '#!.......#.!!..!....#',
      '#..C...!.#........E.#',
      '#.!....!.#..........#',
      '#..I.!...L..!..!....#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'R', 'D', 'D', 'R', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'dois-botoes',
    name: 'Dois Bot├Áes',
    subtitle: 'Um cont├¬iner para cada circuito.',
    cycleLength: 40,
    maxEchoes: 0,
    par: { cycles: 1, steps: 39 },
    map: [
      '###########################',
      '#P..!...!#.....#....!.!...#',
      '#!.C.....#..C!.#.....E....#',
      '#!...H...#....I#.!........#',
      '#........#....!#..........#',
      '#..!.....R.....L....!.....#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'R', 'R', 'U', 'R', 'D', 'R', 'D', 'D', 'D', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'U', 'R', 'R', 'D', 'L', 'D', 'R', 'R', 'D', 'D', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'alavanca-e-botao',
    name: 'V├ílvula e Prensa',
    subtitle: 'Ligue a alavanca e pressione o bot├úo.',
    cycleLength: 31,
    maxEchoes: 0,
    par: { cycles: 1, steps: 30 },
    map: [
      '#####################',
      '#P.!.....#!...#.!!..#',
      '#.!...!..#....#...!.#',
      '#!.V....!#.IC.#....E#',
      '#.......!#....#.....#',
      '#........R..!.L...!.#',
      '#####################'
    ],
    solution: [
      ['D', 'D', 'R', 'R', 'E', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'R', 'R', 'R', 'U', 'L', 'D', 'D', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'conduto',
    name: 'Conduto',
    subtitle: 'O duto atravessa a parede da f├íbrica.',
    cycleLength: 18,
    maxEchoes: 0,
    par: { cycles: 1, steps: 17 },
    map: [
      '###########################',
      '#P.......#.....#..........#',
      '#..O.!.!.#.....#.....E....#',
      '#........#..o..#..........#',
      '#......!.#..W..#..........#',
      '#!!......#.....L..........#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'R', 'D', 'E', 'D', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'duto-coberto',
    name: 'Duto Coberto',
    subtitle: 'A rota at├® a v├ílvula ├® o desafio.',
    cycleLength: 24,
    maxEchoes: 0,
    par: { cycles: 1, steps: 23 },
    map: [
      '#####################',
      '#P..!....#.....#....#',
      '#.....!..#.....#....#',
      '#...!....#.....R...E#',
      '#.......!#.....#....#',
      '#.!V..O..#o....#....#',
      '#####################'
    ],
    solution: [
      ['D', 'D', 'D', 'D', 'R', 'R', 'E', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'dutos-em-serie',
    name: 'Dutos em S├®rie',
    subtitle: 'Um duto leva ao outro at├® a v├ílvula.',
    cycleLength: 18,
    maxEchoes: 0,
    par: { cycles: 1, steps: 17 },
    map: [
      '###########################',
      '#P!....!.#.....#..........#',
      '#.O......#..o..#.....E....#',
      '#...!!!..#..W..#..........#',
      '#!.!.....#.....#..........#',
      '#........#.....L..........#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'D', 'E', 'D', 'D', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'codigo-romano',
    name: 'Arquivo Romano',
    subtitle: 'Leia as pistas da instala├º├úo e digite a senha.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.1.2.3.#...#....E.#',
      '#!.......#!!.#......#',
      '#..X.V...@...R......#',
      '#!.!.....#...#......#',
      '#........#!..#...!..#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'D', 'R', 'E', '?', '?', '?', 'C', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
    code: { type: 'roman' },
  },
  {
    id: 'codigo-de-cor',
    name: 'Arquivo de Cor',
    subtitle: 'As cores no ch├úo, na ordem certa.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.c.c.c.#!..#.!.!E.#',
      '#....!!..#...#..!...#',
      '#..X.W...@...L......#',
      '#........#!..#.!....#',
      '#.......!#.!.#..!...#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'D', 'R', 'E', '?', '?', '?', 'C', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-peso',
    name: 'Arquivo e Peso',
    subtitle: 'A senha abre o caminho; o peso, a porta.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.c.c.c!#!..#!...E.#',
      '#.......!#..!#......#',
      '#.!X.Z!!.@...Y......#',
      '#........#...#......#',
      '#....!...#...#......#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'D', 'R', 'E', '?', '?', '?', 'C', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-alavanca',
    name: 'Arquivo e V├ílvula',
    subtitle: 'Resolva a tela e ligue a alavanca para abrir o port├úo.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.c.c.c.#...!#..!E.#',
      '#..X.....#....#.....#',
      '#..V.!..!@..!.R.....#',
      '#...!....#...!#...!.#',
      '#.!....!.#....#!..!.#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'R', 'E', '?', '?', '?', 'C', 'D', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R'],
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-duto',
    name: 'Arquivo e Duto',
    subtitle: 'Senha, duto e alavanca at├® a sa├¡da.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.1.2!3!#....#..!E.#',
      '#.!......#....#.....#',
      '#..X.!...@....R.....#',
      '#.O....V.#....#.....#',
      '#....o!..#....#.!...#',
      '#####################'
    ],
    solution: [
      ['D', 'D', 'R', 'E', '?', '?', '?', 'C', 'D', 'U', 'R', 'R', 'E', 'U', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R'],
    ],
    code: { type: 'roman' },
  },
  {
    id: 'cores-e-botoes',
    name: 'Consoles de Cor',
    subtitle: 'A senha de cor e a prensa do hangar.',
    cycleLength: 22,
    maxEchoes: 0,
    par: { cycles: 1, steps: 21 },
    map: [
      '#####################',
      '#P.c!c.c.#...#....E.#',
      '#!......!#...#......#',
      '#..X.V...@...R.....!#',
      '#!!..!..!#...#......#',
      '#........#...#......#',
      '#####################'
    ],
    solution: [
      ['D', 'R', 'D', 'R', 'E', '?', '?', '?', 'C', 'R', 'E', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U'],
    ],
    code: { type: 'color' },
  },
  {
    id: 'senha-e-vao',
    name: 'Senha e V├ícuo',
    subtitle: 'Cuidado com o vazio; a alavanca abre a sa├¡da.',
    cycleLength: 24,
    maxEchoes: 0,
    par: { cycles: 1, steps: 23 },
    map: [
      '#####################',
      '#P.1.2.3.#.!..#!.!E.#',
      '#.!~~~...#!...#.....#',
      '#..X.....@....R.....#',
      '#!.V.....#....#.....#',
      '#...!!...#.!..#.....#',
      '#####################'
    ],
    solution: [
      ['D', 'D', 'D', 'R', 'R', 'E', 'U', 'E', '?', '?', '?', 'C', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'U', 'U', 'R', 'R', 'R'],
    ],
    code: { type: 'roman' },
  },
  {
    id: 'tres-mecanismos',
    name: 'Protocolo de Lan├ºamento',
    subtitle: 'Alavanca, cont├¬iner e dois port├Áes. Nessa ordem.',
    cycleLength: 36,
    maxEchoes: 0,
    par: { cycles: 1, steps: 35 },
    map: [
      '###########################',
      '#P..!!...#..!..#!....!....#',
      '#........#..C..#.....E.!!.#',
      '#!....V..#.!...#...!......#',
      '#.......!#.....#.....!....#',
      '#........R..b..L...!!.....#',
      '###########################'
    ],
    solution: [
      ['D', 'D', 'R', 'R', 'R', 'R', 'R', 'E', 'D', 'D', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'U', 'R', 'R', 'D', 'D', 'D', 'R', 'D', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'quatro-mecanismos',
    name: 'Quatro Sistemas',
    subtitle: 'Duto, alavanca, bot├úo e senha numa travessia.',
    cycleLength: 40,
    maxEchoes: 0,
    par: { cycles: 1, steps: 31 },
    map: [
      '###########################',
      '#P.c.c.c.#.....#.........!#',
      '#..X.....@.!...#...!.E!!..#',
      '#.O!.!..C#..I.!#......!.!.#',
      '#....o...#....!#.........!#',
      '#..!....!......L..........#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'E', '?', '?', '?', 'C', 'D', 'R', 'R', 'R', 'U', 'L', 'U', 'R', 'R', 'R', 'R', 'U', 'R', 'D', 'R', 'D', 'D', 'D', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
    code: { type: 'color' },
  },
  {
    id: 'labirinto-final',
    name: 'Labirinto de Lan├ºamento',
    subtitle: 'Duas alavancas, um cont├¬iner e um duto.',
    cycleLength: 32,
    maxEchoes: 0,
    par: { cycles: 1, steps: 31 },
    map: [
      '###########################',
      '#P..!....#.....#.!......!.#',
      '#..V.....#..C..#.!...E!...#',
      '#.!.....!#...!!#!....!!!..#',
      '#...O!...#..I..#...!!.!...#',
      '#!.....o.R!!...L..........#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'R', 'E', 'D', 'D', 'R', 'R', 'R', 'R', 'U', 'U', 'U', 'U', 'R', 'R', 'D', 'D', 'R', 'D', 'D', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
  },
  {
    id: 'ultima-prova',
    name: 'A Grande Fuga',
    subtitle: 'Senha, duto, alavanca e peso. Tudo junto.',
    cycleLength: 29,
    maxEchoes: 0,
    par: { cycles: 1, steps: 28 },
    map: [
      '###########################',
      '#P.c!c.c.#...!.#!.......!.#',
      '#..X.!!.!@..C..#.....E....#',
      '#.!..!!..#.!...#.......!.!#',
      '#.O...!o.#.....#...!....!.#',
      '#.........!.b..L..........#',
      '###########################'
    ],
    solution: [
      ['D', 'R', 'E', '?', '?', '?', 'C', 'D', 'D', 'U', 'U', 'R', 'R', 'R', 'U', 'R', 'R', 'D', 'D', 'D', 'R', 'D', 'R', 'R', 'R', 'U', 'U', 'U', 'R', 'R', 'R', 'R', 'R'],
    ],
    code: { type: 'color' },
  },
];

export const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);
