'use strict';
/*
 * Confere o desenho de cada fase:
 * - o programa com defeito falha em pelo menos um cenário (senão não haveria bug);
 * - a solução de referência passa em todos os cenários;
 * - a correção cabe na meta de blocos alterados (2ª estrela é alcançável);
 * - blocos, sensores, dicas e bugs são válidos;
 * - dados/dados.js está em dia com os arquivos JSON.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const CB = require('./carregar');
const { montarDados, gerarScript } = require('../ferramentas/empacotar-dados');

const dados = montarDados();
const bugs = new Set(dados.insetario.map((b) => b.id));

test('dados/dados.js está atualizado (rode "npm run empacotar" se falhar)', () => {
  const atual = fs.readFileSync(path.join(__dirname, '..', 'dados', 'dados.js'), 'utf8');
  assert.equal(atual, gerarScript(dados));
});

test('há 4 mundos com 3 fases cada e 10 bugs no Insetário', () => {
  assert.equal(dados.mundos.length, 4);
  assert.deepEqual(dados.mundos.map((m) => m.fases.length), [3, 3, 3, 3]);
  assert.equal(bugs.size, 10);
  const usados = new Set(Object.values(dados.fases).flatMap((f) => f.bugs));
  assert.deepEqual([...usados].sort(), [...bugs].sort(), 'cada bug aparece em alguma fase');
});

for (const json of Object.values(dados.fases)) {
  test(`fase ${json.id} – ${json.titulo}`, () => {
    const fase = CB.Programa.prepararFase(json);
    assert.ok(fase.cenarios.length >= 1 && fase.cenarios.length <= 4, '1 a 4 cenários');
    assert.deepEqual(CB.Programa.validar(fase.programa, fase), [], 'programa inicial válido');
    assert.deepEqual(CB.Programa.validar(fase.solucao, fase), [], 'solução válida');

    const comDefeito = CB.executarTestes(fase, fase.programa);
    assert.ok(comDefeito.some((r) => !r.ok), 'o programa inicial precisa falhar em algum cenário');

    const solucao = CB.executarTestes(fase, fase.solucao);
    for (const r of solucao) assert.ok(r.ok, `solução falhou: ${CB.descreverResultado(r)}`);

    const alteracoes = CB.Programa.contarAlteracoes(fase.programa, fase.solucao);
    assert.ok(alteracoes >= 1 && alteracoes <= fase.metaAlteracoes, `alterações da solução: ${alteracoes}, meta: ${fase.metaAlteracoes}`);

    assert.equal(json.dicas.length, 3, 'três dicas graduais');
    const ids = new Set();
    CB.Programa.percorrer(fase.programa, (no) => ids.add(no.id));
    for (const dica of json.dicas) for (const id of dica.destacar || []) assert.ok(ids.has(id), `dica destaca bloco inexistente ${id}`);
    assert.ok(bugs.has(json.dicas[2].bug), 'a 3ª dica aponta um bug do Insetário');
    for (const b of json.bugs) assert.ok(bugs.has(b), `bug desconhecido ${b}`);
    assert.ok(json.missao && json.explicacao, 'missão e explicação preenchidas');
  });
}
