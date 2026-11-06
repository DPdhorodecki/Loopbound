import { LEVELS } from './src/game/levels';
import { solveSingleCycle } from './scripts/solver';
import { parseLevel } from './src/game/level';
import * as fs from 'fs';

const solutions = {};

for (const def of LEVELS) {
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: 300, maxEchoes: def.maxEchoes }, 500000);
    if (!solution) {
      console.log(def.id + ': SEM SOLUCAO');
      continue;
    }
    const moves = JSON.stringify(solution);
    solutions[def.id] = moves;
    console.log(def.id + ': OK');
  } catch (e) {
    console.log(def.id + ': ERRO ' + e.message);
  }
}

const source = fs.readFileSync('src/game/levels.ts', 'utf8');

let result = source;
for (const [id, moves] of Object.entries(solutions)) {
  const solRegex = new RegExp(
    '(\\n\\s+id: \\'' + id + '\\'' + '[\\s\\S]*?\\n\\s+solution: \\[' + '[\\s\\S]*?)(\\n\\s+\\],)',
    'g'
  );
  result = result.replace(solRegex, (match, prefix, oldSol, suffix) => {
    const formatted = moves
      .slice(1, -1)
      .replace(/\],\[/g, '],\n      [')
      .replace(/"/g, "'");
    return prefix + '\n      [' + formatted + ']\n    ' + suffix.slice(1);
  });
}

fs.writeFileSync('src/game/levels.ts', result);
console.log('Arquivo levels.ts atualizado com solucoes do solver.');
