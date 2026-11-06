const fs = require('fs');

const solutions = {
  'primeiros-passos': ["'R','R','R','D','D','L','L','L','D','D','D','R','R','R','R','R','R'"],
  'peso-morto': ["'D','R','R','D','R','R','R','R','R','R','R','U','U','R','R','R','R','R'"],
  'primeiro-eco': ["'D','D','R','R','R','R','R','R','R','R','U','U'"],
  'o-vao': ["'D','D','R','R','U','R','R','R','R','R','R','R','R','R','R','D','R'"],
  'a-estrela-do-batedor': ["'D','D','R','R','R','R','R','R','R','R','R','R','R'"],
  'peso-extra': ["'D','D','R','R','R','R','R','R','R','R','R','R','R','R'"],
  'tres-portoes': ["'D','R','R','R','R','R','R','R','R','R','R','R','R','R','U','R','R','R','R'"],
  'pavio-curto': ["'R','R','R','R','R'"],
  'caminhos-cruzados': ["'U','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R'"],
  'ultima-luz': ["'R','R','R','R','R','R','R','R','R','R','R','R','R','R'"],
  'a-alavanca': ["'R','R','R','E','R','R','R','R','R','R','R','R','R'"],
  'dois-interruptores': ["'R','R','E','R','R','R','R','E','R','R','R','R','R','R','R','R'"],
  'circuito-duplo': ["'D','D','R','R','E','D','D','R','R','R','R','R','R','R','R','R','R','R','R','U','U','R','R','R','R'"],
  'prelo': ["'R','R','D','R','D','D','D','D','R','R','R','R','R','R','U','R','R','R','R','R','U','R','R','U','R','R'"],
  'dois-botoes': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U','U','U','R','R','R','R','R'"],
  'alavanca-e-botao': ["'D','D','R','R','E','D','D','R','R','R','R','R','R','R','U','R','R','U','L','D','D','R','R','R','R','U','U','R','R','R'"],
  'conduto': ["'D','R','R','D','R','E','D','R','R','R','R','U','U','U','R','R','R','R'"],
  'duto-coberto': ["'D','D','D','D','R','R','E','R','R','U','U','R','R','R','R','R','R','R','R','R'"],
  'dutos-em-serie': ["'D','R','U','R','R','R','D','R','R','R','R','R'"],
  'codigo-romano': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','U','U','R','R','R','R','R','U','U','U','R','R','R','R'"],
  'codigo-de-cor': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','U','U','R','R','R','R','R','U','U','U','R','R','R','R'"],
  'codigo-e-peso': ["'D','D','R','R','E','?','?','?','C','R','R','R','R','R','R','R','R','R','R','R','U','R','U','R','R','R','R'"],
  'codigo-e-alavanca': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','U','U','R','R','R','R','R','U','U','U','R','R','R','R'"],
  'codigo-e-duto': ["'D','D','D','R','U','R','R','E','R','R','U','R','R','R','R','R','U','R','U','R','R','R','R'"],
  'cores-e-botoes': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','U','U','R','R','R','R','R','U','U','U','R','R','R','R'"],
  'senha-e-vao': ["'R','R','R','R','R','R','R','R','D','R','R','R','R','U','R','R','R','R'"],
  'tres-mecanismos': ["'D','D','D','D','D','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','U','U','U','U','R','R','R','R'"],
  'quatro-mecanismos': ["'D','D','R','R','R','U','R','R','R','R','R','R','R','R','U','R','R','R','R','R'"],
  'labirinto-final': ["'D','R','R','E','D','D','R','R','R','R','U','R','R','R','R','R','R','U','U','R','R','R','R'"],
  'ultima-prova': ["'D','D','D','R','D','D','R','R','R','R','R','R','R','R','U','R','R','U','U','U','R','R','R']"],
};

let source = fs.readFileSync('src/game/levels.ts', 'utf8');

for (const [id, solArray] of Object.entries(solutions)) {
  const idIndex = source.indexOf("id: '" + id + "'");
  if (idIndex === -1) {
    console.log('Nao encontrado: ' + id);
    continue;
  }
  const solIndex = source.indexOf('solution: [', idIndex);
  if (solIndex === -1) {
    console.log('Solucao nao encontrada: ' + id);
    continue;
  }
  const endIndex = source.indexOf('],', solIndex);
  if (endIndex === -1) {
    console.log('Fechamento nao encontrado: ' + id);
    continue;
  }
  
  const before = source.substring(0, solIndex + 'solution: ['.length);
  const after = source.substring(endIndex);
  const newSol = '\n      [' + solArray.join(',\n      ') + ']\n    ';
  
  source = before + newSol + after;
  console.log('Atualizado: ' + id);
}

fs.writeFileSync('src/game/levels.ts', source);
console.log('Concluído!');
