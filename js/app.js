/* Caça-Bugs — inicialização e navegação entre as telas. */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  class App {
    constructor(dados) {
      this.dados = dados;
      this.ordem = dados.mundos.flatMap((m) => m.fases);
      this.cacheFases = {};
      this.progresso = new CB.Progresso(this.ordem).carregar();
      this.telaAtual = null;
      this.verificarDados();
      this.telaFase = new CB.TelaFase(this);
    }

    /** Avisa no console se algum arquivo de fase tiver problema (útil para quem cria fases). */
    verificarDados() {
      for (const id of this.ordem) {
        try {
          const fase = this.fase(id);
          const erros = CB.Programa.validar(fase.programa, fase);
          if (erros.length) console.warn(`Fase ${id}:`, erros);
        } catch (e) {
          console.error(`Fase ${id} inválida:`, e.message);
        }
      }
    }

    fase(id) {
      if (!this.cacheFases[id]) this.cacheFases[id] = CB.Programa.prepararFase(this.dados.fases[id]);
      return this.cacheFases[id];
    }

    mundoDe(fase) { return this.dados.mundos.find((m) => m.numero === fase.mundo); }

    bug(id) { return this.dados.insetario.find((b) => b.id === id); }

    proximaFase(id) { return this.ordem[this.ordem.indexOf(id) + 1] || null; }

    mostrar(nome) {
      document.querySelectorAll('.tela').forEach((t) => t.classList.toggle('ativa', t.id === 'tela-' + nome));
      this.telaAtual = nome;
    }

    irPara(nome, parametros) {
      if (this.telaAtual === 'fase' && nome !== 'fase') this.telaFase.sair();
      const titulos = { inicio: 'Caça-Bugs', mapa: 'Mapa · Caça-Bugs', insetario: 'Insetário · Caça-Bugs', professor: 'Professor · Caça-Bugs' };
      if (nome === 'inicio') CB.Telas.inicio(this);
      else if (nome === 'mapa') CB.Telas.mapa(this);
      else if (nome === 'insetario') CB.Telas.insetario(this, parametros);
      else if (nome === 'professor') CB.Telas.professor(this);
      this.mostrar(nome);
      document.title = titulos[nome] || 'Caça-Bugs';
      const alvo = document.querySelector(`#tela-${nome} .btn.primario, #tela-${nome} .marca`);
      if (alvo) alvo.focus();
    }

    abrirFase(id) {
      if (!this.progresso.liberada(id)) { this.irPara('mapa'); return; }
      this.telaFase.abrir(id);
    }

    async iniciar() {
      this.irPara('inicio');
      if (this.progresso.situacao === 'corrompido') {
        await CB.UI.modal({
          titulo: 'Progresso danificado',
          html: '<p>O progresso salvo neste navegador está danificado e não pôde ser lido. O jogo vai recomeçar do início.</p>',
          botoes: [{ texto: 'Recomeçar do início', valor: true, classe: 'primario' }],
        });
        this.progresso.recomecar();
        this.irPara('inicio');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!raiz.CB_DADOS) {
      document.body.innerHTML = '<p style="padding:40px;font-size:18px">Não foi possível carregar os dados das fases (dados/dados.js). Confira se a pasta do jogo está completa.</p>';
      return;
    }
    CB.app = new App(raiz.CB_DADOS);
    CB.app.iniciar();
  });
})(window);
