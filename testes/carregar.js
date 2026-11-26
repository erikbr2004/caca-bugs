/* Carrega os arquivos do núcleo do jogo no Node, na mesma ordem do index.html. */
'use strict';
const path = require('path');

const raiz = path.join(__dirname, '..');
for (const arquivo of ['base', 'mundo', 'programa', 'interpretador', 'progresso']) {
  require(path.join(raiz, 'js', 'nucleo', `${arquivo}.js`));
}

module.exports = globalThis.CB;
