const fs = require('fs');
let source = fs.readFileSync('src/game/levels.ts', 'utf8');

// Corrigir padrão: '...]\n    ],' → '...]\n    ],'
// Quando uma linha termina com ']]' e a próxima é '    ],', remover a próxima
const lines = source.split('\n');
const result = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === '],' && i > 0 && lines[i - 1].trim().endsWith(']]')) {
    console.log('Removendo linha duplicada:', i + 1);
    continue;
  }
  result.push(line);
}

fs.writeFileSync('src/game/levels.ts', result.join('\n'));
console.log('Concluído!');
