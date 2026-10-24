import fs from 'node:fs';
import { LEVELS } from '../src/game/levels';
import { LevelDef, Level, parseLevel } from '../src/game/level';
import { Action, Dir } from '../src/game/types';
import { solveSingleCycle } from './solver';

const MOVES: Dir[] = ['U', 'D', 'L', 'R'];

interface NewLevel {
  id: string;
  name: string;
  subtitle: string;
  maxEchoes: number;
  map: string[];
  code?: { type: 'roman' | 'color' };
  crates?: { x: number; y: number }[];
}

const NEW_LEVELS: NewLevel[] = [
  {
    id: 'circuito-duplo',
    name: 'Circuito Duplo',
    subtitle: 'A alavanca abre o portão. O caixote, a placa.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.......#....#.....#',
      '#........#....#.....#',
      '#..V.....#.C..#....E#',
      '#........#....#.....#',
      '#........R.b..L.....#',
      '#####################',
    ],
  },
  {
    id: 'prelo',
    name: 'Prelo',
    subtitle: 'O botão só cede com peso em cima.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.......#..........#',
      '#........#..........#',
      '#..C.....#........E.#',
      '#........#..........#',
      '#..I.....L..........#',
      '#####################',
    ],
  },
  {
    id: 'dois-botoes',
    name: 'Dois Botões',
    subtitle: 'Um caixote para cada circuito.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.......#.....#..........#',
      '#..C.....#..C..#.....E....#',
      '#....H...#....I#..........#',
      '#........#.....#..........#',
      '#........R.....L..........#',
      '###########################',
    ],
  },
  {
    id: 'alavanca-e-botao',
    name: 'Alavanca e Botão',
    subtitle: 'Ligue a alavanca; preve o botão com o caixote.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.......#....#.....#',
      '#........#....#.....#',
      '#..V.....#.IC.#....E#',
      '#........#....#.....#',
      '#........R....L.....#',
      '#####################',
    ],
  },
  {
    id: 'conduto',
    name: 'Conduto',
    subtitle: 'O duto cruza a sala. O caixote abre a passagem.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.......#.....#..........#',
      '#..O.....#.....#.....E....#',
      '#........#..o..#..........#',
      '#....C...#..W..#..........#',
      '#........#.....L..........#',
      '###########################',
    ],
  },
  {
    id: 'duto-coberto',
    name: 'Duto Coberto',
    subtitle: 'Um caixote no par do duto o desliga.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.......#..........#',
      '#.O.o....#..........#',
      '#..C.....#........E.#',
      '#........#..........#',
      '#..V.....R..........#',
      '#####################',
    ],
  },
  {
    id: 'dutos-em-serie',
    name: 'Dutos em Série',
    subtitle: 'Um duto leva ao outro até a alavanca.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.......#.....#..........#',
      '#.O......#..o..#.....E....#',
      '#........#..W..#..........#',
      '#.....Q..#.....#..........#',
      '#....q...#.....L..........#',
      '###########################',
    ],
  },
  {
    id: 'codigo-romano',
    name: 'Código Romano',
    subtitle: 'Leia as pistas no chão e digite a senha.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.1.2.3.#........E.#',
      '#........#..........#',
      '#..X.....@..........#',
      '#..C..r..#..........#',
      '#........#..........#',
      '#####################',
    ],
    code: { type: 'roman' },
  },
  {
    id: 'codigo-de-cor',
    name: 'Código de Cor',
    subtitle: 'As cores no chão, na ordem certa.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.c.c.c.#........E.#',
      '#........#..........#',
      '#..X.....@..........#',
      '#..C..b..#..........#',
      '#........#..........#',
      '#####################',
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-peso',
    name: 'Código e Peso',
    subtitle: 'O caixote na placa e a senha na tela.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.c.c.c.#........E.#',
      '#..C.....#..........#',
      '#..X..r..@..........#',
      '#........#..........#',
      '#........#..........#',
      '#####################',
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-alavanca',
    name: 'Código e Alavanca',
    subtitle: 'Resolva a tela e ligue a alavanca para abrir o portão.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.c.c.c.#....#...E.#',
      '#..X.....#....#.....#',
      '#..V.....@....R.....#',
      '#........#....#.....#',
      '#........#....#.....#',
      '#####################',
    ],
    code: { type: 'color' },
  },
  {
    id: 'codigo-e-duto',
    name: 'Código e Duto',
    subtitle: 'Senha, duto e alavanca até a saída.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.1.2.3.#....#...E.#',
      '#........#....#.....#',
      '#..X.....@....R.....#',
      '#.O....V.#....#.....#',
      '#....o...#....#.....#',
      '#####################',
    ],
    code: { type: 'roman' },
  },
  {
    id: 'cores-e-botoes',
    name: 'Cores e Botões',
    subtitle: 'Senha de cor e um botão que precisa de peso.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.c.c.c.#........E.#',
      '#..X..C..#..........#',
      '#.....I..@..........#',
      '#........#..........#',
      '#........#..........#',
      '#####################',
    ],
    code: { type: 'color' },
  },
  {
    id: 'senha-e-vao',
    name: 'Senha e Vão',
    subtitle: 'Cuidado com o vazio; a alavanca abre o portão da saída.',
    maxEchoes: 0,
    map: [
      '#####################',
      '#P.1.2.3.#....#...E.#',
      '#..~~~...#....#.....#',
      '#..X.....@....R.....#',
      '#..V.....#....#.....#',
      '#........#....#.....#',
      '#####################',
    ],
    code: { type: 'roman' },
  },
  {
    id: 'tres-mecanismos',
    name: 'Três Mecanismos',
    subtitle: 'Caixote, alavanca e senha. Nessa ordem.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.1.2.3.#.....#..........#',
      '#........#..C..#.....E....#',
      '#..X..V..@.....#..........#',
      '#........#.....#..........#',
      '#........R..b..L..........#',
      '###########################',
    ],
    code: { type: 'roman' },
  },
  {
    id: 'quatro-mecanismos',
    name: 'Quatro Mecanismos',
    subtitle: 'Duto, alavanca, botão e senha numa travessia.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.c.c.c.#.....#..........#',
      '#..X.....@.....#.....E....#',
      '#.O.....C#..I..#..........#',
      '#....o...#.....#..........#',
      '#........R.....L..........#',
      '###########################',
    ],
    code: { type: 'color' },
  },
  {
    id: 'labirinto-final',
    name: 'Labirinto Final',
    subtitle: 'Duas alavancas, um caixote e um duto.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.......#.....#..........#',
      '#..V.....#..C..#.....E....#',
      '#........#.....#..........#',
      '#...O....#..I..#..........#',
      '#......o.R.....L..........#',
      '###########################',
    ],
  },
  {
    id: 'ultima-prova',
    name: 'Última Prova',
    subtitle: 'Senha, duto, alavanca, botão e peso. Tudo junto.',
    maxEchoes: 0,
    map: [
      '###########################',
      '#P.c.c.c.#.....#..........#',
      '#..X..V..@..C..#.....E....#',
      '#........#.....#..........#',
      '#.O....o.#.....#..........#',
      '#........R..b..L..........#',
      '###########################',
    ],
    code: { type: 'color' },
  },
];

function mechanicsOf(def: LevelDef): string[] {
  const level: Level = parseLevel(def);
  const set = new Set<string>();
  if (level.levers.length) set.add('lever');
  if (level.buttons.length) set.add('button');
  if (level.ducts.length) set.add('duct');
  if (level.code) set.add('code');
  if (level.plates.length) set.add('plate');
  if (level.gates.length) set.add('gate');
  if (level.crates.length) set.add('crate');
  if (level.doors.length) set.add('door');
  if (level.key) set.add('key');
  if (level.clueTiles.length) set.add('clue');
  if (level.gems.length) set.add('gem');
  if (level.tiles.some((t) => t === 2)) set.add('void');
  return [...set];
}

const q = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

interface Solved {
  def: LevelDef;
  solution: Action[];
}

const solved: Solved[] = [];
const problems: string[] = [];

for (const nl of NEW_LEVELS) {
  const widths = new Set(nl.map.map((r) => r.length));
  if (widths.size !== 1) problems.push(`${nl.id}: linhas de larguras diferentes ${[...widths]}`);
  const def: LevelDef = {
    id: nl.id,
    name: nl.name,
    subtitle: nl.subtitle,
    cycleLength: 200,
    maxEchoes: nl.maxEchoes,
    par: { cycles: 1, steps: 0 },
    map: nl.map,
    solution: [],
    code: nl.code,
    crates: nl.crates,
  };
  const mech = mechanicsOf(def);
  if (nl.maxEchoes === 0) {
    const stats = { nodes: 0, capped: false };
    const sol = solveSingleCycle(def, 800_000, stats);
    if (!sol) {
      problems.push(
        `${nl.id}: SEM SOLUCAO (mecânicas: ${mech.join(', ')}${stats.capped ? ', LIMITE DE NÓS' : ''})`,
      );
      continue;
    }
    solved.push({ def, solution: sol });
  } else {
    problems.push(`${nl.id}: requer solução manual (ecos)`);
  }
}

for (const { def, solution } of solved) {
  const moves = solution.filter((t) => MOVES.includes(t as Dir)).length;
  const mech = mechanicsOf(def);
  const flag = mech.length >= 3 ? 'ok ' : `XX(${mech.length} mech)`;
  console.log(
    `${def.id.padEnd(22)} passos=${String(moves).padStart(3)} mech=${mech.length} ${flag} [${mech.join(', ')}]`,
  );
}

if (problems.length) {
  console.log('\nPROBLEMAS:');
  for (const p of problems) console.log('  ' + p);
  process.exit(1);
}

// ------------------------------------------------------------------ emitir

const kept = LEVELS.slice(0, 12);

function fmtMap(map: string[]): string {
  return map.map((row) => `      ${q(row)},`).join('\n');
}
function fmtSolution(cycles: Action[][]): string {
  return cycles.map((c) => '      [' + c.map((t) => `'${t}'`).join(', ') + '],').join('\n');
}

let out = `import { LevelDef } from './level';

/**
 * Campanha principal (30 fases).
 *
 * Cada fase tem \`solution\`: um array de ações por ciclo. O teste
 * \`tests/game.test.ts\` replaya cada solução e falha se ela não vencer.
 *
 * Nas fases com senha (tela \`X\` + portão de código \`@\`) o chão guarda as
 * pistas na ordem de leitura (um índice 1, 2, 3… aparece sobre cada pista). A
 * senha é **sorteada no início da fase** por \`parseLevel\` e escrita nessas
 * pistas; por isso a solução usa \`?\`, que pressiona sempre o próximo símbolo
 * correto — o replay funciona qualquer que seja a senha gerada.
 */
export const LEVELS: LevelDef[] = [
`;

for (const def of kept) {
  out += '  {\n';
  out += `    id: ${q(def.id)},\n`;
  out += `    name: ${q(def.name)},\n`;
  out += `    subtitle: ${q(def.subtitle)},\n`;
  out += `    cycleLength: ${def.cycleLength},\n`;
  out += `    maxEchoes: ${def.maxEchoes},\n`;
  out += `    par: { cycles: ${def.par.cycles}, steps: ${def.par.steps} },\n`;
  out += '    map: [\n' + fmtMap(def.map) + '\n    ],\n';
  out += '    solution: [\n' + fmtSolution(def.solution) + '\n    ],\n';
  if (def.code) out += `    code: { type: '${def.code.type}', sequence: [${def.code.sequence!.join(', ')}] },\n`;
  if (def.crates) out += `    crates: [${def.crates.map((c) => `{ x: ${c.x}, y: ${c.y} }`).join(', ')}],\n`;
  out += '  },\n';
}

for (const { def, solution } of solved) {
  const moves = solution.filter((t) => MOVES.includes(t as Dir)).length;
  out += '  {\n';
  out += `    id: ${q(def.id)},\n`;
  out += `    name: ${q(def.name)},\n`;
  out += `    subtitle: ${q(def.subtitle)},\n`;
  out += `    cycleLength: ${moves + 1},\n`;
  out += `    maxEchoes: ${def.maxEchoes},\n`;
  out += `    par: { cycles: 1, steps: ${moves} },\n`;
  out += '    map: [\n' + fmtMap(def.map) + '\n    ],\n';
  out += `    solution: [\n      [${solution.map((t) => `'${t}'`).join(', ')}],\n    ],\n`;
  if (def.code) out += `    code: { type: '${def.code.type}' },\n`;
  if (def.crates) out += `    crates: [${def.crates.map((c) => `{ x: ${c.x}, y: ${c.y} }`).join(', ')}],\n`;
  out += '  },\n';
}

out += '];\n\nexport const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);\n';

fs.writeFileSync('src/game/levels.ts', out, 'utf8');
console.log(`\nlevels.ts regravado: ${kept.length} mantidas + ${solved.length} novas.`);
