'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const CB = require('./carregar');

const P = CB.Programa;
const corredor = CB.lerMapa(['#######', '#>C..E#', '#######']);

test('lerMapa encontra robô, caixas e esteira', () => {
  assert.deepEqual(corredor.roboInicial, { x: 1, y: 1, dir: 'l' });
  assert.equal(corredor.caixasIniciais[1 * 7 + 2], 1);
  assert.equal(corredor.celulas[1 * 7 + 5], 'esteira');
  assert.throws(() => CB.lerMapa(['###', '#.#']), /robô/);
  assert.throws(() => CB.lerMapa(['#>X#']), /desconhecido/);
});

test('ações do robô e sensores', () => {
  const m = new CB.Mundo(corredor);
  assert.equal(m.sensor('caminhoLivre'), true);
  m.andar();
  assert.equal(m.sensor('sobreCaixa'), true);
  m.pegar();
  assert.equal(m.sensor('segurandoCaixa'), true);
  assert.throws(() => m.pegar(), (e) => e.codigo === 'pegarVazio');
  m.andar(); m.andar();
  assert.throws(() => m.soltar(), (e) => e.codigo === 'soltarFora');
  m.andar();
  assert.equal(m.sensor('sobreEsteira'), true);
  assert.equal(m.sensor('paredeFrente'), true);
  assert.throws(() => m.andar(), (e) => e.codigo === 'colisao');
  m.soltar();
  assert.equal(m.caixasNaEsteira(), 1);
  m.virar('direita');
  assert.equal(m.dir, 's');
  m.virar('esquerda'); m.virar('esquerda');
  assert.equal(m.dir, 'n');
});

test('simular registra um evento por bloco e avalia a missão', () => {
  const prog = P.normalizar([
    { id: 'a', op: 'andar' }, { id: 'b', op: 'pegar' },
    { id: 'c', op: 'repetir', vezes: 3, corpo: [{ id: 'd', op: 'andar' }] },
    { id: 'e', op: 'soltar' },
  ]);
  const r = CB.simular(prog, corredor, {});
  assert.equal(r.ok, true);
  // andar, pegar, 3 x (cabeçalho do laço + andar), soltar
  assert.equal(r.eventos.length, 9);
  assert.deepEqual(r.eventos[2].voltas, [{ id: 'c', volta: 1, total: 3 }]);
  assert.equal(r.eventos.at(-1).foto.carga, 0);
});

test('erros param a execução no bloco certo', () => {
  const prog = P.normalizar([{ id: 'a', op: 'pegar' }]);
  const r = CB.simular(prog, corredor, {});
  assert.equal(r.ok, false);
  assert.equal(r.resultado.codigo, 'pegarVazio');
  assert.equal(r.resultado.passo, 1);
  assert.equal(r.eventos[0].erro, 'tentou pegar, mas não havia caixa aqui');
});

test('laço infinito é interrompido no limite de passos (RNF007)', () => {
  const prog = P.normalizar([{ id: 'a', op: 'repetir', ate: 'sobreEsteira', corpo: [] }]);
  const r = CB.simular(prog, corredor, {});
  assert.equal(r.ok, false);
  assert.equal(r.resultado.codigo, 'limite');
  assert.equal(r.eventos.length, CB.LIMITE_PASSOS);
});

test('se/senão, procedimentos e contador', () => {
  const prog = P.normalizar({
    principal: [
      { id: 'd', op: 'definir', valor: 1 },
      { id: 's', op: 'se', cond: 'contador=1', entao: [{ id: 'c', op: 'chamar', proc: 'A' }], senao: [{ id: 'x', op: 'pegar' }] },
      { id: 'u', op: 'aumentar', valor: 1 },
    ],
    procedimentos: { A: [{ id: 'p1', op: 'andar' }, { id: 'p2', op: 'pegar' }] },
  });
  const r = CB.simular(prog, corredor, { objetivo: { quantidade: 0 } });
  assert.equal(r.eventos.find((e) => e.id === 's').cond, true);
  assert.deepEqual(r.eventos.find((e) => e.id === 'p1').chamadas, ['A']);
  assert.equal(r.eventos.at(-1).vars.contador, 2);
  assert.equal(r.resultado.codigo, 'carga'); // terminou segurando a caixa
});

test('condições negadas e de contador', () => {
  const sensor = (s) => s === 'sobreCaixa';
  assert.equal(CB.avaliarCondicao('!sobreCaixa', sensor, { contador: 0 }), false);
  assert.equal(CB.avaliarCondicao('contador<2', sensor, { contador: 1 }), true);
  assert.equal(CB.avaliarCondicao('contador>2', sensor, { contador: 1 }), false);
  assert.equal(CB.rotuloCondicao('!caminhoLivre'), 'não caminho livre à frente');
});

test('editar programa: inserir, mover e remover', () => {
  const prog = P.normalizar([
    { id: 'a', op: 'andar' },
    { id: 'r', op: 'repetir', vezes: 2, corpo: [{ id: 'b', op: 'andar' }] },
  ]);
  P.inserir(prog, 'r.corpo', 1, { id: 'c', op: 'pegar' });
  assert.deepEqual(prog.principal[1].corpo.map((n) => n.id), ['b', 'c']);
  assert.equal(P.mover(prog, 'a', 'r.corpo', 0), true);
  assert.deepEqual(prog.principal.map((n) => n.id), ['r']);
  assert.equal(P.mover(prog, 'r', 'r.corpo', 0), false, 'não pode mover um bloco para dentro dele mesmo');
  P.remover(prog, 'b');
  assert.deepEqual(prog.principal[0].corpo.map((n) => n.id), ['a', 'c']);
  assert.deepEqual([...P.numerarLinhas(prog).entries()], [['r', 1], ['a', 2], ['c', 3]]);
});

test('contarAlteracoes mede a correção feita', () => {
  const original = P.normalizar([
    { id: 'a', op: 'pegar' }, { id: 'b', op: 'andar' }, { id: 'c', op: 'andar' },
    { id: 'r', op: 'repetir', vezes: 4, corpo: [{ id: 'd', op: 'andar' }] },
  ]);
  const igual = CB.clonar(original);
  assert.equal(P.contarAlteracoes(original, igual), 0);

  const trocaOrdem = CB.clonar(original);
  P.mover(trocaOrdem, 'a', 'principal', 2);
  assert.equal(P.contarAlteracoes(original, trocaOrdem), 1);

  const parametro = CB.clonar(original);
  delete parametro.principal[3].vezes;
  parametro.principal[3].ate = 'sobreEsteira';
  assert.equal(P.contarAlteracoes(original, parametro), 1);

  const novoEApagado = CB.clonar(original);
  P.remover(novoEApagado, 'c');
  P.inserir(novoEApagado, 'principal', 0, { id: 'z', op: 'soltar' });
  assert.equal(P.contarAlteracoes(original, novoEApagado), 2);

  const outraLista = CB.clonar(original);
  P.mover(outraLista, 'c', 'r.corpo', 1);
  assert.equal(P.contarAlteracoes(original, outraLista), 1);
});

test('progresso: liberação de fases, estrelas e CSV', () => {
  const memoria = new Map();
  const armazenamento = { getItem: (k) => memoria.get(k) ?? null, setItem: (k, v) => memoria.set(k, v) };
  const p = new CB.Progresso(['f1', 'f2', 'f3'], armazenamento).carregar();
  assert.equal(p.liberada('f1'), true);
  assert.equal(p.liberada('f2'), false);
  const r = p.registrarConclusao('f1', { estrelas: CB.calcularEstrelas(1, 1, 0), bugs: ['besouro'] });
  assert.deepEqual(r, { estrelas: 3, novosBugs: ['besouro'] });
  assert.equal(p.liberada('f2'), true);
  assert.equal(CB.calcularEstrelas(2, 1, 1), 1);

  const recarregado = new CB.Progresso(['f1', 'f2', 'f3'], armazenamento).carregar();
  assert.equal(recarregado.situacao, 'ok');
  assert.equal(recarregado.totalBugs(), 1);

  memoria.set(CB.CHAVE_PROGRESSO, '{quebrado');
  assert.equal(new CB.Progresso(['f1'], armazenamento).carregar().situacao, 'corrompido');

  const fases = { f1: { mundo: 1, numero: 1, titulo: 'Um "teste"' }, f2: { mundo: 1, numero: 2, titulo: 'Dois' }, f3: { mundo: 1, numero: 3, titulo: 'Três' } };
  const csv = recarregado.exportarCSV(fases);
  assert.match(csv, /^﻿mundo;fase;titulo;situacao;estrelas;execucoes;dicas\r\n1;1;"Um ""teste""";concluida;3;0;0/);
});
