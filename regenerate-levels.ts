import { LEVELS } from './src/game/levels';
import { solveSingleCycle } from './scripts/solver';
import { parseLevel } from './src/game/level';
import * as fs from 'fs';

function formatSolution(solution: any[]): string {
  return '      [' + solution.map((t) => "'" + t + "'").join(',') + ']';
}

let output = `import { LevelDef } from './level';

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
 *
 * Decorações temáticas (piso livre, sem colisão e sem circuito):
 *  \`!\` = cela/grade alienígena
 *  \`%\` = cápsula/ninho alienígena
 *  \`:\` = console/monitor
 *  \`;\` = raiz/vine
 *  \`=\` = cápsula de estase
 */
export const LEVELS: LevelDef[] = [\n`;

let allOk = true;

for (let i = 0; i < LEVELS.length; i++) {
  const def = LEVELS[i];
  try {
    const level = parseLevel(def);
    const solution = solveSingleCycle({ ...def, cycleLength: def.cycleLength, maxEchoes: def.maxEchoes }, 500000);
    if (!solution) {
      console.log(def.id + ': SEM SOLUCAO');
      allOk = false;
      continue;
    }
    
    // Converter solution para string formatada
    const formatted = formatSolution(solution);
    
    // Montar o bloco do nível
    const mapStr = def.map.map((row) => '      \'' + row + '\'').join(',\n');
    
    let block = `  {\n    id: '${def.id}',\n    name: '${def.name}',\n    subtitle: '${def.subtitle}',\n    cycleLength: ${def.cycleLength},\n    maxEchoes: ${def.maxEchoes},\n    par: { cycles: ${def.par.cycles}, steps: ${def.par.steps} },\n    map: [\n${mapStr}\n    ],\n    solution: [\n${formatted}\n    ],\n`;
    
    if (def.code) {
      block += `    code: { type: '${def.code.type}' },\n`;
    }
    
    block += `  },\n`;
    
    output += block;
    console.log(def.id + ': OK');
  } catch (e: any) {
    console.log(def.id + ': ERRO ' + e.message);
    allOk = false;
  }
}

output += `];\n\nexport const levelById = (id: string): LevelDef | undefined => LEVELS.find((l) => l.id === id);\n`;

fs.writeFileSync('src/game/levels.ts', output);
console.log(allOk ? 'Todas as fases resolvidas!' : 'Algumas fases falharam.');
