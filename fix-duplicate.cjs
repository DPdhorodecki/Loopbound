const fs = require('fs');
let source = fs.readFileSync('src/game/levels.ts', 'utf8');

// Remover linhas duplicadas de "    ]," quando a linha anterior já termina com "],"
const lines = source.split('\n');
const result = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Se esta linha é "    ]," e a linha anterior também termina com "    ],", pular esta
  if (line.trim() === '],' && i > 0 && lines[i - 1].trim().endsWith('],')) {
    console.log('Removendo linha duplicada:', i + 1, line.trim());
    continue;
  }
  result.push(line);
}

fs.writeFileSync('src/game/levels.ts', result.join('\n'));
console.log('Concluído!');
