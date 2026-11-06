import { LEVELS } from './src/game/levels';
import { solveSingleCycle } from './scripts/solver';
import { parseLevel } from './src/game/level';

for (const def of LEVELS) {
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: 300, maxEchoes: def.maxEchoes }, 500000);
    if (!solution) {
      console.log(def.id + ': SEM SOLUCAO');
      continue;
    }
    const formatted = JSON.stringify(solution)
      .slice(1, -1)
      .replace(/\],\[/g, '],\n      [')
      .replace(/"/g, "'");
    console.log(def.id + ':::' + formatted);
  } catch (e) {
    console.log(def.id + ':::ERRO ' + e.message);
  }
}
