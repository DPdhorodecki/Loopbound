import { LEVELS } from './src/game/levels';
import { solveSingleCycle } from './scripts/solver';
import { parseLevel } from './src/game/level';

for (const def of LEVELS) {
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: def.cycleLength, maxEchoes: def.maxEchoes }, 100000);
    if (!solution) {
      console.log(def.id + ': SEM SOLUCAO (cl=' + def.cycleLength + ')');
    } else {
      const moves = solution.filter((t: any) => 'UDLR'.includes(t)).length;
      console.log(def.id + ': OK (passos=' + moves + ', cl=' + def.cycleLength + ')');
    }
  } catch (e: any) {
    console.log(def.id + ': ERRO ' + e.message);
  }
}
