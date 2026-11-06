import { LEVELS } from '../src/game/levels';
import { solveSingleCycle } from './solver';
import { parseLevel } from '../src/game/level';

const id = process.argv[2];
const def = LEVELS.find((l) => l.id === id);
if (!def) {
  console.error('fase não encontrada:', id);
  process.exit(1);
}
const level = parseLevel(def);
const solution = solveSingleCycle({ ...def, cycleLength: 200, maxEchoes: 0 }, 2_000_000);
if (!solution) {
  console.error('sem solução');
  process.exit(1);
}
const moves = solution.filter((t) => 'UDLR'.includes(t)).length;
console.log(`passos=${moves}`);
console.log(JSON.stringify(solution));
void level;
