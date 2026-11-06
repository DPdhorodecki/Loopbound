import { LEVELS } from '../src/game/levels';
import { TUTORIAL_ROOMS } from '../src/game/tutorial';
import { parseLevel } from '../src/game/level';
import { orphans, traceSolution, unusedMechanics } from '../src/game/analysis';

function inspect(name: string, def: (typeof LEVELS)[number]) {
  const level = parseLevel(def);
  const report = traceSolution(def, level);
  const orphan = orphans(level);
  const unused = unusedMechanics(level, report.trace);
  const problems: string[] = [];
  if (!report.won) problems.push('NÃO VENCE');
  if (report.blocked.length) problems.push(`BLOQUEIO: ${report.blocked.join(' | ')}`);
  if (report.prematureEnd.length) problems.push(`FIM PREMATURO: ${report.prematureEnd.join(' | ')}`);
  [...orphan.gatesWithoutSource, ...orphan.sourcesWithoutGate, ...orphan.unpairedDucts, ...orphan.codeWithoutTerminal, ...orphan.keyDoorMismatch].forEach(
    (p) => problems.push(`ÓRFÃ: ${p}`),
  );
  unused.forEach((p) => problems.push(`NÃO USADA: ${p}`));
  const status = problems.length ? `XX ${problems.join('; ')}` : 'ok';
  console.log(`${name.padEnd(24)} ${status}`);
}

console.log('=== CAMPANHA ===');
for (const def of LEVELS) inspect(def.id, def);
console.log('=== TUTORIAL ===');
for (const room of TUTORIAL_ROOMS) inspect(room.def.id, room.def);
