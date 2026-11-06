import { LEVELS } from './src/game/levels.ts';
import { solveSingleCycle } from './scripts/solver.ts';
import { parseLevel } from './src/game/level.ts';

for (const def of LEVELS) {
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: 300, maxEchoes: def.maxEchoes }, 500_000);
    if (!solution) {
      console.log(`${def.id}: SEM SOLUCAO`);
      continue;
    }
    const moves = JSON.stringify(solution);
    console.log(`${def.id}: OK ${moves}`);
  } catch (e) {
    console.log(`${def.id}: ERRO ${e.message}`);
  }
}
