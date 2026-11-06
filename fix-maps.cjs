const fs = require('fs');
let s = fs.readFileSync('src/game/levels.ts', 'utf8');

function padRow(row, targetLen, ch = '#') {
  if (row.length === targetLen) return row;
  if (row.length > targetLen) return row.slice(0, targetLen);
  return row + ch.repeat(targetLen - row.length);
}

const regex = /(id: '([^']+)'[\s\S]*?map: \[)([\s\S]*?)(\],\s*solution)/g;
s = s.replace(regex, (match, prefix, id, mapStr, suffix) => {
  const rows = [...mapStr.matchAll(/'([^']*)'/g)].map(x => x[1]);
  if (rows.length === 0) return match;
  const targetLen = rows[0].length;
  const fixedRows = rows.map(r => padRow(r, targetLen));
  const fixedMap = fixedRows.map(r => "'" + r + "'").join(',\n      ');
  return prefix + '\n      ' + fixedMap + '\n    ' + suffix;
});

fs.writeFileSync('src/game/levels.ts', s);
console.log('Correção concluída.');
