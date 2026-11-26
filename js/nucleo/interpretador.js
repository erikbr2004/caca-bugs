/*
 * Caça-Bugs — interpretador dos programas em blocos.
 *
 * simular() executa o programa inteiro e devolve o rastro de eventos:
 * um evento por bloco executado (inclusive cada verificação de laço e de "se").
 * O jogo usa esse rastro para animar, executar passo a passo, parar em pontos
 * de parada e mostrar o inspetor de estado. Como tudo é pré-calculado e limitado
 * a CB.LIMITE_PASSOS eventos, um laço infinito nunca trava o navegador (RNF007).
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  /** Interrompe a execução (erro do programa ou limite de passos). */
  class Parada {
    constructor(info) { this.info = info; }
  }

  function registrar(ctx, no, extra) {
    const evento = {
      passo: ctx.eventos.length + 1,
      id: no.id,
      op: no.op,
      foto: ctx.mundo.foto(),
      vars: { contador: ctx.vars.contador },
      voltas: ctx.voltas.map((v) => ({ id: v.id, volta: v.volta, total: v.total })),
      chamadas: ctx.chamadas.slice(),
    };
    if (extra) Object.assign(evento, extra);
    ctx.eventos.push(evento);
    if (!evento.erro && ctx.eventos.length >= ctx.limite) {
      throw new Parada({
        codigo: 'limite', id: no.id, passo: evento.passo,
        mensagem: `o programa chegou a ${ctx.limite.toLocaleString('pt-BR')} passos sem terminar: pode ser um laço infinito`,
      });
    }
    return evento;
  }

  function condicao(ctx, cond) {
    return CB.avaliarCondicao(cond, (s) => ctx.mundo.sensor(s), ctx.vars);
  }

  function executarAcao(ctx, no) {
    const m = ctx.mundo;
    try {
      if (no.op === 'andar') m.andar();
      else if (no.op === 'virar') m.virar(no.lado);
      else if (no.op === 'pegar') m.pegar();
      else m.soltar();
    } catch (erro) {
      if (!(erro instanceof CB.ErroExecucao)) throw erro;
      const ev = registrar(ctx, no, { erro: erro.message, codigoErro: erro.codigo });
      throw new Parada({ codigo: erro.codigo, mensagem: erro.message, id: no.id, passo: ev.passo });
    }
    registrar(ctx, no);
  }

  function executarLista(lista, ctx) {
    for (const no of lista) executarNo(no, ctx);
  }

  function executarNo(no, ctx) {
    switch (no.op) {
      case 'andar': case 'virar': case 'pegar': case 'soltar':
        executarAcao(ctx, no);
        return;
      case 'repetir':
        if (no.ate !== undefined) {
          for (let volta = 1; ; volta++) {
            const v = condicao(ctx, no.ate);
            ctx.voltas.push({ id: no.id, volta, total: null });
            registrar(ctx, no, { cond: v });
            if (v) { ctx.voltas.pop(); break; }
            executarLista(no.corpo, ctx);
            ctx.voltas.pop();
          }
        } else {
          for (let volta = 1; volta <= no.vezes; volta++) {
            ctx.voltas.push({ id: no.id, volta, total: no.vezes });
            registrar(ctx, no);
            executarLista(no.corpo, ctx);
            ctx.voltas.pop();
          }
        }
        return;
      case 'se': {
        const v = condicao(ctx, no.cond);
        registrar(ctx, no, { cond: v });
        if (v) executarLista(no.entao, ctx);
        else if (no.senao) executarLista(no.senao, ctx);
        return;
      }
      case 'chamar': {
        const corpo = ctx.programa.procedimentos[no.proc];
        const ev = registrar(ctx, no);
        if (!corpo) throw new Parada({ codigo: 'procedimento', id: no.id, passo: ev.passo, mensagem: `o procedimento ${no.proc} não existe` });
        if (ctx.chamadas.length >= 50) {
          throw new Parada({ codigo: 'recursao', id: no.id, passo: ev.passo, mensagem: 'procedimentos demais chamando uns aos outros' });
        }
        ctx.chamadas.push(no.proc);
        executarLista(corpo, ctx);
        ctx.chamadas.pop();
        return;
      }
      case 'definir':
        ctx.vars.contador = no.valor;
        registrar(ctx, no);
        return;
      case 'aumentar':
        ctx.vars.contador += no.valor === undefined ? 1 : no.valor;
        registrar(ctx, no);
        return;
      default:
        throw new Error('Bloco desconhecido: ' + no.op);
    }
  }

  /**
   * Executa o programa em um cenário.
   * @returns {{ok:boolean, eventos:Array, inicial:object, final:object, resultado:object}}
   */
  function simular(programa, mapa, opcoes = {}) {
    const mundo = new CB.Mundo(mapa, { capacidade: opcoes.capacidade });
    const ctx = {
      mundo, programa, eventos: [], vars: { contador: 0 }, voltas: [], chamadas: [],
      limite: opcoes.limite || CB.LIMITE_PASSOS,
    };
    const inicial = mundo.foto();
    let resultado;
    try {
      executarLista(programa.principal, ctx);
      resultado = CB.avaliarObjetivo(opcoes.objetivo, mundo);
      resultado.passo = ctx.eventos.length;
    } catch (e) {
      if (!(e instanceof Parada)) throw e;
      resultado = Object.assign({ ok: false }, e.info);
    }
    return { ok: resultado.ok, eventos: ctx.eventos, inicial, final: mundo.foto(), resultado };
  }

  /** Executa o programa em todos os cenários de teste da fase (RF005). */
  function executarTestes(fase, programa) {
    return fase.cenarios.map((cenario, i) => {
      const r = simular(programa, cenario.mapa, { capacidade: fase.capacidade, objetivo: fase.objetivo });
      r.indice = i;
      r.nome = cenario.nome;
      return r;
    });
  }

  /** Frase curta para o resultado de um cenário. */
  function descreverResultado(r) {
    if (r.ok) return `${r.nome} passou`;
    const onde = r.resultado.passo && r.resultado.codigo !== 'limite' ? ` (passo ${r.resultado.passo})` : '';
    return `${r.nome} falhou: ${r.resultado.mensagem}${onde}`;
  }

  CB.simular = simular;
  CB.executarTestes = executarTestes;
  CB.descreverResultado = descreverResultado;
})(typeof window !== 'undefined' ? window : globalThis);
