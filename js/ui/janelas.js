/* Caça-Bugs — janelas (modais), anúncios para leitores de tela e eventos da interface. */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /** Barramento simples de eventos (usado pelo tutorial). */
  const ouvintes = {};
  CB.eventos = {
    ouvir(nome, fn) {
      (ouvintes[nome] = ouvintes[nome] || []).push(fn);
      return () => { ouvintes[nome] = (ouvintes[nome] || []).filter((f) => f !== fn); };
    },
    emitir(nome, dados) { (ouvintes[nome] || []).slice().forEach((fn) => fn(dados)); },
  };

  function anunciar(texto) {
    const el = document.getElementById('anuncio');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = texto; }, 40);
  }

  /**
   * Abre uma janela modal e devolve uma promessa com o valor do botão escolhido
   * (ou null ao fechar com Esc).
   */
  function modal({ titulo, html, botoes, largo = false, lateral = false, aoAbrir }) {
    const lista = botoes || [{ texto: 'Fechar', valor: null, classe: 'primario' }];
    return new Promise((resolve) => {
      const anterior = document.activeElement;
      const fundo = document.createElement('div');
      fundo.className = 'fundo-modal' + (lateral ? ' lateral' : '');
      fundo.innerHTML = `<div class="modal${largo ? ' largo' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
          <h2 id="modal-titulo">${titulo}</h2>
          <div class="modal-conteudo">${html}</div>
          <div class="modal-botoes">${lista.map((b, i) => `<button type="button" class="btn ${b.classe || 'claro'}" data-i="${i}">${b.texto}</button>`).join('')}</div>
        </div>`;
      document.body.appendChild(fundo);
      const janela = fundo.querySelector('.modal');
      const fechar = (valor) => {
        document.removeEventListener('keydown', tecla, true);
        fundo.remove();
        if (anterior && document.body.contains(anterior)) anterior.focus();
        resolve(valor);
      };
      const tecla = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(null); return; }
        if (e.key === 'Tab') {
          const focaveis = [...janela.querySelectorAll('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled);
          if (!focaveis.length) return;
          const primeiro = focaveis[0];
          const ultimo = focaveis[focaveis.length - 1];
          if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
          else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
        }
      };
      document.addEventListener('keydown', tecla, true);
      fundo.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-i]');
        if (b) fechar(lista[Number(b.dataset.i)].valor);
      });
      const foco = janela.querySelector('[autofocus]') || janela.querySelector('.modal-botoes .btn.primario') || janela.querySelector('.modal-botoes .btn');
      if (foco) foco.focus();
      if (aoAbrir) aoAbrir(janela, fechar);
    });
  }

  function confirmar(mensagem, { sim = 'Sim', nao = 'Cancelar', titulo = 'Confirmar' } = {}) {
    return modal({
      titulo: esc(titulo),
      html: `<p>${esc(mensagem)}</p>`,
      botoes: [{ texto: esc(nao), valor: false, classe: 'claro' }, { texto: esc(sim), valor: true, classe: 'primario' }],
    }).then((v) => v === true);
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  CB.UI = { esc, anunciar, modal, confirmar, esperar };
})(typeof window !== 'undefined' ? window : globalThis);
