import { LEVELS } from './src/game/levels.ts';
import { solveSingleCycle } from './scripts/solver.ts';
import { parseLevel } from './src/game/level.ts';
import * as fs from 'fs';

const solutions: Record<string, string> = {};

for (const def of LEVELS) {
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: 300, maxEchoes: def.maxEchoes }, 500_000);
    if (!solution) {
      console.log(`${def.id}: SEM SOLUCAO`);
      continue;
    }
    const moves = JSON.stringify(solution);
    solutions[def.id] = moves;
    console.log(`${def.id}: OK`);
  } catch (e) {
    console.log(`${def.id}: ERRO ${e.message}`);
  }
}

// Gerar o novo arquivo levels.ts
const source = fs.readFileSync('src/game/levels.ts', 'utf8');

let result = source;
for (const [id, moves] of Object.entries(solutions)) {
  // Encontrar o bloco solution deste nível e substituir
  const solRegex = new RegExp(
    `(\\n\\s+id: '${id}'[\\s\\S]*?\\n\\s+solution: \\[)([\\s\\S]*?)(\\n\\s+\\],)`,
    'g'
  );
  result = result.replace(solRegex, (match, prefix, oldSol, suffix) => {
    const formatted = moves
      .slice(1, -1) // remover colchetes externos
      .replace(/\],\[/g, '],\n      [')
      .replace(/"/g, "'");
    return prefix + '\n      [' + formatted + ']\n    ' + suffix.slice(1);
  });
}

fs.writeFileSync('src/game/levels.ts', result);
console.log('Arquivo levels.ts atualizado com soluções do solver.');
