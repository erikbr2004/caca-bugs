/*
 * Caça-Bugs — progresso do jogador (RF001, RF012, RF013, RF015).
 * Fica salvo apenas no navegador (localStorage) e não contém dados pessoais (RNF002, RNF003).
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const CHAVE = 'cacabugs:progresso:v1';

  function novoEstado() {
    return { versao: 1, fases: {}, insetario: {}, tutorialVisto: false, liberarTudo: false };
  }

  function armazenamentoPadrao() {
    try { return raiz.localStorage || null; } catch (e) { return null; }
  }

  class Progresso {
    /** @param {string[]} ordem ids das fases na ordem do jogo */
    constructor(ordem, armazenamento) {
      this.ordem = ordem;
      this.armazenamento = armazenamento === undefined ? armazenamentoPadrao() : armazenamento;
      this.estado = novoEstado();
      this.situacao = 'novo'; // novo | ok | corrompido | indisponivel
    }

    carregar() {
      if (!this.armazenamento) { this.situacao = 'indisponivel'; return this; }
      let texto = null;
      try { texto = this.armazenamento.getItem(CHAVE); } catch (e) { this.situacao = 'indisponivel'; return this; }
      if (!texto) { this.situacao = 'novo'; return this; }
      try {
        const o = JSON.parse(texto);
        if (!o || o.versao !== 1 || typeof o.fases !== 'object' || typeof o.insetario !== 'object') throw new Error('formato');
        this.estado = Object.assign(novoEstado(), o);
        this.situacao = 'ok';
      } catch (e) {
        this.estado = novoEstado();
        this.situacao = 'corrompido';
      }
      return this;
    }

    salvar() {
      if (!this.armazenamento) return false;
      try { this.armazenamento.setItem(CHAVE, JSON.stringify(this.estado)); return true; } catch (e) { return false; }
    }

    recomecar() {
      this.estado = novoEstado();
      this.situacao = 'novo';
      this.salvar();
    }

    dadosFase(id) {
      return this.estado.fases[id] || { concluida: false, estrelas: 0, execucoes: 0, dicas: 0 };
    }

    liberada(id) {
      const i = this.ordem.indexOf(id);
      if (i <= 0 || this.estado.liberarTudo) return i >= 0;
      return this.dadosFase(this.ordem[i - 1]).concluida;
    }

    /** Primeira fase liberada e ainda não concluída (ou a última, se todas foram concluídas). */
    faseAtual() {
      return this.ordem.find((id) => this.liberada(id) && !this.dadosFase(id).concluida) || this.ordem[this.ordem.length - 1];
    }

    totalConcluidas() {
      return this.ordem.filter((id) => this.dadosFase(id).concluida).length;
    }

    totalBugs() {
      return Object.keys(this.estado.insetario).length;
    }

    /** Soma execuções e dicas de uma tentativa (mesmo sem concluir). */
    registrarTentativa(id, { execucoes = 0, dicas = 0 }) {
      const f = Object.assign(this.dadosFase(id), {});
      f.execucoes += execucoes;
      f.dicas += dicas;
      this.estado.fases[id] = f;
      this.salvar();
    }

    /**
     * Registra a conclusão da fase e os bugs capturados.
     * @returns {{estrelas:number, novosBugs:string[]}}
     */
    registrarConclusao(id, { estrelas, bugs = [] }) {
      const f = this.dadosFase(id);
      f.concluida = true;
      f.estrelas = Math.max(f.estrelas || 0, estrelas);
      this.estado.fases[id] = f;
      const novosBugs = [];
      for (const bug of bugs) {
        if (!this.estado.insetario[bug]) {
          this.estado.insetario[bug] = { fase: id };
          novosBugs.push(bug);
        }
      }
      this.salvar();
      return { estrelas: f.estrelas, novosBugs };
    }

    /** CSV para o professor (RF015): separado por ponto e vírgula, sem dados pessoais. */
    exportarCSV(fases) {
      const linhas = [['mundo', 'fase', 'titulo', 'situacao', 'estrelas', 'execucoes', 'dicas'].join(';')];
      for (const id of this.ordem) {
        const fase = fases[id];
        const d = this.dadosFase(id);
        const situacao = d.concluida ? 'concluida' : this.liberada(id) ? 'liberada' : 'bloqueada';
        const titulo = '"' + String(fase.titulo).replace(/"/g, '""') + '"';
        linhas.push([fase.mundo, fase.numero, titulo, situacao, d.estrelas || 0, d.execucoes || 0, d.dicas || 0].join(';'));
      }
      return '﻿' + linhas.join('\r\n') + '\r\n';
    }
  }

  /** Estrelas da fase (RF012): passar nos testes, correção enxuta e nenhuma dica. */
  CB.calcularEstrelas = function (alteracoes, meta, dicasUsadas) {
    return 1 + (alteracoes <= meta ? 1 : 0) + (dicasUsadas === 0 ? 1 : 0);
  };

  CB.Progresso = Progresso;
  CB.CHAVE_PROGRESSO = CHAVE;
})(typeof window !== 'undefined' ? window : globalThis);
