/* Caça-Bugs — tutorial interativo da primeira fase (RF014). */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  const PASSOS = [
    { titulo: 'Bem-vindo(a) à Fábrica Byte!', texto: 'Os robôs estão com bugs nos programas. Você vai aprender a encontrá-los e consertá-los. Vamos conhecer a tela?' },
    { alvo: '.missao', titulo: 'A missão', texto: 'Aqui está o que o robô precisa fazer nesta fase.' },
    { alvo: '#programa', titulo: 'O programa do robô', texto: 'Estes blocos são o programa. Ele tem um bug escondido! O robô faz exatamente o que está escrito, nem mais, nem menos.' },
    { alvo: '#painel-testes', titulo: 'Os cenários de teste', texto: 'O programa precisa funcionar em todos os cenários. Nesta primeira fase, há só um.' },
    { alvo: '#btn-executar', titulo: 'Execute os testes', texto: 'Clique em “Executar testes” para ver o que o robô faz.', esperar: 'testes-executados' },
    { alvo: '#resultado', titulo: 'O teste falhou', texto: 'Leia o motivo e o passo em que o robô errou. Essa é a pista para achar o bug.' },
    { alvo: '#btn-passo', titulo: 'Investigue com o passo a passo', texto: 'Clique em “Passo a passo” para executar um bloco de cada vez. O bloco amarelo acabou de rodar.', esperar: 'passo' },
    { alvo: '#programa', titulo: 'Conserte o programa', texto: 'Arraste os blocos para mudar a ordem. Para apagar um bloco, arraste-o para fora do programa. Depois, execute os testes de novo.' },
    { titulo: 'Boa caçada!', texto: 'Quando todos os testes passarem, o bug vai para o Insetário. Se precisar, use as dicas (💡) e a ajuda (❔).' },
  ];

  let atual = null;

  function encerrar() {
    if (!atual) return;
    atual.desligar();
    atual.el.remove();
    window.removeEventListener('resize', atual.reposicionar);
    atual = null;
  }

  function iniciar(app) {
    encerrar();
    const el = document.createElement('div');
    el.className = 'tutorial-fundo';
    el.innerHTML = '<div class="tutorial-foco"></div><div class="tutorial-cartao" role="dialog" aria-live="polite" aria-labelledby="tut-titulo"></div>';
    document.body.appendChild(el);
    const foco = el.querySelector('.tutorial-foco');
    const cartao = el.querySelector('.tutorial-cartao');
    let i = 0;
    let desligar = () => {};

    const terminar = () => {
      app.progresso.estado.tutorialVisto = true;
      app.progresso.salvar();
      encerrar();
    };

    const reposicionar = () => {
      const p = PASSOS[i];
      const alvo = p.alvo && document.querySelector(p.alvo);
      if (alvo) {
        const r = alvo.getBoundingClientRect();
        Object.assign(foco.style, { display: 'block', left: (r.left - 6) + 'px', top: (r.top - 6) + 'px', width: (r.width + 12) + 'px', height: (r.height + 12) + 'px' });
        const w = 340;
        let left = r.right + 18;
        let top = r.top;
        if (left + w > window.innerWidth - 10) { left = Math.max(10, r.left - w - 18); }
        if (left < 10 || (r.width > window.innerWidth * 0.5)) { left = Math.min(window.innerWidth - w - 10, Math.max(10, r.left)); top = r.bottom + 14; }
        const h = cartao.offsetHeight || 180;
        if (top + h > window.innerHeight - 10) top = Math.max(10, r.top - h - 14);
        cartao.style.left = left + 'px';
        cartao.style.top = top + 'px';
      } else {
        Object.assign(foco.style, { display: 'block', left: '50%', top: '50%', width: '0px', height: '0px' });
        cartao.style.left = (window.innerWidth / 2 - 170) + 'px';
        cartao.style.top = (window.innerHeight / 2 - 100) + 'px';
      }
    };

    const mostrar = () => {
      desligar();
      const p = PASSOS[i];
      const ultimo = i === PASSOS.length - 1;
      cartao.innerHTML = `<div class="passos">Tutorial · ${i + 1} de ${PASSOS.length}</div>
        <h3 id="tut-titulo">${p.titulo}</h3><p>${p.texto}</p>
        <div class="botoes"><button type="button" class="btn claro" data-tut="pular">Pular tutorial</button>
        ${p.esperar ? '<span class="aguardando">Faça isso para continuar</span>' : `<button type="button" class="btn primario" data-tut="proximo">${ultimo ? 'Começar' : 'Próximo'}</button>`}</div>`;
      if (p.esperar) {
        desligar = CB.eventos.ouvir(p.esperar, () => setTimeout(avancar, p.esperar === 'testes-executados' ? 1600 : 400));
      } else {
        desligar = () => {};
        const b = cartao.querySelector('[data-tut="proximo"]');
        if (b) b.focus();
      }
      if (atual) atual.desligar = () => desligar();
      reposicionar();
      requestAnimationFrame(reposicionar);
    };

    const avancar = () => {
      if (!atual) return;
      if (i >= PASSOS.length - 1) { terminar(); return; }
      i++;
      mostrar();
    };

    cartao.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tut]');
      if (!b) return;
      if (b.dataset.tut === 'pular') terminar();
      else avancar();
    });

    atual = { el, desligar: () => desligar(), reposicionar };
    window.addEventListener('resize', reposicionar);
    mostrar();
  }

  CB.Tutorial = { iniciar, encerrar };
})(typeof window !== 'undefined' ? window : globalThis);
