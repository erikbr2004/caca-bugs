#!/usr/bin/env node
/*
 * Junta os arquivos JSON de dados/ em dados/dados.js.
 *
 * O navegador não deixa uma página aberta direto do disco (file://) ler arquivos .json,
 * então o jogo carrega este pacote como um script comum. Sempre que editar uma fase,
 * o mundo ou o Insetário, rode:   npm run empacotar   (ou: node ferramentas/empacotar-dados.js)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', 'dados');

function lerJSON(arquivo) {
  const texto = fs.readFileSync(arquivo, 'utf8');
  try {
    return JSON.parse(texto);
  } catch (e) {
    throw new Error(`JSON inválido em ${path.relative(process.cwd(), arquivo)}: ${e.message}`);
  }
}

function montarDados() {
  const mundos = lerJSON(path.join(RAIZ, 'mundos.json'));
  const insetario = lerJSON(path.join(RAIZ, 'insetario.json'));
  const fases = {};
  for (const mundo of mundos) {
    for (const id of mundo.fases) {
      const fase = lerJSON(path.join(RAIZ, 'fases', `${id}.json`));
      if (fase.id !== id) throw new Error(`O arquivo ${id}.json tem id "${fase.id}".`);
      fases[id] = fase;
    }
  }
  return { mundos, insetario, fases };
}

function gerarScript(dados) {
  return '/* Arquivo gerado por ferramentas/empacotar-dados.js a partir de dados/*.json. Não edite à mão. */\n'
    + 'window.CB_DADOS = ' + JSON.stringify(dados, null, 1) + ';\n';
}

if (require.main === module) {
  const dados = montarDados();
  const destino = path.join(RAIZ, 'dados.js');
  fs.writeFileSync(destino, gerarScript(dados), 'utf8');
  console.log(`dados.js gerado: ${Object.keys(dados.fases).length} fases, ${dados.insetario.length} bugs no Insetário.`);
}

module.exports = { montarDados, gerarScript };
