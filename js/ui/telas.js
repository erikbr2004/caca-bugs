/* Caça-Bugs — telas de início, mapa de mundos (CDU005), Insetário (CDU006), professor (CDU007) e relatório. */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const { esc } = CB.UI;
  const CODIGO_PROFESSOR = 'professor';

  const estrelasHTML = (n, total = 3) => `<span class="estrelas" aria-label="${n} de ${total} estrelas">${'★'.repeat(n)}<span class="vazia">${'★'.repeat(total - n)}</span></span>`;

  function topo(titulo, acoes) {
    return `<header class="topbar">
      <button type="button" class="marca" data-ir="inicio" aria-label="Caça-Bugs: voltar ao início">${CB.Icones.marca()}Caça-Bugs</button>
      <div class="crumb"><b>${titulo}</b></div>
      <div class="acoes">${acoes || ''}</div>
    </header>`;
  }

  function ligarNavegacao(el, app) {
    el.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => app.irPara(b.dataset.ir)));
  }

  // ------------------------------------------------------------------ início
  function inicio(app) {
    const el = document.getElementById('tela-inicio');
    const p = app.progresso;
    const aviso = p.situacao === 'indisponivel'
      ? '<p class="linha-progresso">⚠ Este navegador não permite salvar o progresso: dá para jogar, mas ele será perdido ao fechar a página.</p>' : '';
    el.innerHTML = `
      <div class="palco">
        <div>
          <h1 class="logo">${CB.Icones.marca()}<span>Caça-<em>Bugs</em></span></h1>
          <p class="chamada">Os robôs da Fábrica Byte estão com bugs nos programas. Investigue, depure e conserte o código para a fábrica voltar a funcionar!</p>
          <div class="menu">
            <button type="button" class="btn primario grande" data-ir="mapa">▶&nbsp; ${p.totalConcluidas() ? 'Continuar' : 'Jogar'}</button>
            <button type="button" class="btn claro grande" data-ir="insetario">🐞&nbsp; Insetário</button>
            <button type="button" class="btn claro grande" id="btn-como-jogar">❔&nbsp; Como jogar</button>
          </div>
          <p class="linha-progresso">Seu progresso: <b>${p.totalConcluidas()} de ${app.ordem.length} fases</b> · <b>${p.totalBugs()} de ${app.dados.insetario.length} bugs</b> capturados</p>
          ${aviso}
        </div>
        <div class="ilustracao">${CB.Icones.roboGrande()}</div>
      </div>
      <div class="rodape-inicio">
        <button type="button" class="btn" id="btn-professor">🎓 Modo professor</button>
        <span>Projeto Final · Informática na Educação · v${CB.VERSAO}</span>
      </div>`;
    ligarNavegacao(el, app);
    el.querySelector('#btn-como-jogar').addEventListener('click', () => ajuda());
    el.querySelector('#btn-professor').addEventListener('click', async () => {
      if (await codigoProfessor()) app.irPara('professor');
    });
  }

  // ------------------------------------------------------------------ mapa de mundos
  function mapa(app) {
    const el = document.getElementById('tela-mapa');
    const p = app.progresso;
    const atual = p.faseAtual();
    const concluidas = p.totalConcluidas();
    const mundos = app.dados.mundos.map((m) => {
      const fases = m.fases.map((id) => app.fase(id));
      const liberado = p.liberada(m.fases[0]);
      const nos = fases.map((f) => {
        const d = p.dadosFase(f.id);
        const lib = p.liberada(f.id);
        const cls = d.concluida ? 'concluida' : !lib ? 'bloqueada' : f.id === atual ? 'atual' : '';
        const conteudo = d.concluida ? '✓' : lib ? f.numero : '🔒';
        const fundo = d.concluida ? `style="background:var(--${m.cor})"` : '';
        const estado = d.concluida ? `concluída, ${d.estrelas} de 3 estrelas` : lib ? 'liberada' : 'bloqueada';
        return `<button type="button" class="no-fase ${cls}" data-fase="${f.id}" aria-label="Fase ${f.numero}: ${esc(f.titulo)} (${estado})">
            ${f.id === atual && !d.concluida ? '<span class="aqui">Você está aqui</span>' : ''}
            <span class="bolinha" ${fundo}>${conteudo}</span>
            <span class="nome">${f.numero}. ${esc(f.titulo)}</span>
            ${d.concluida ? estrelasHTML(d.estrelas) : lib ? estrelasHTML(0) : ''}
          </button>`;
      }).join('');
      const anterior = app.dados.mundos[m.numero - 2];
      return `<section class="mundo${liberado ? '' : ' bloqueado'}" aria-label="Mundo ${m.numero}: ${esc(m.nome)}">
          <div class="mundo-cab" style="background:var(--${m.cor})"><div><small>MUNDO ${m.numero}</small><h2>${esc(m.nome)}</h2></div><span class="chip">${esc(m.conceito)}</span></div>
          <div class="nos">${nos}</div>
          <div class="mundo-rodape">${esc(m.novidade)}</div>
          ${liberado ? '' : `<div class="aviso-bloqueio">🔒 Conclua o Mundo ${anterior.numero} para liberar</div>`}
        </section>`;
    }).join('');
    el.innerHTML = topo('Mapa da Fábrica Byte', `<button type="button" class="btn fantasma" data-ir="insetario">🐞 Insetário <span class="contador-pill">${p.totalBugs()}/${app.dados.insetario.length}</span></button>
        <button type="button" class="btn fantasma" data-ir="inicio">⌂ Início</button>`)
      + `<div class="corpo-mapa">
          <div class="barra-progresso">Seu progresso <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${app.ordem.length}" aria-valuenow="${concluidas}"><i style="width:${(100 * concluidas) / app.ordem.length}%"></i></div> ${concluidas} de ${app.ordem.length} fases concluídas</div>
          <div class="mundos">${mundos}</div>
        </div>`;
    ligarNavegacao(el, app);
    el.querySelectorAll('[data-fase]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.fase;
      if (p.liberada(id)) { app.abrirFase(id); return; }
      const anterior = app.fase(app.ordem[app.ordem.indexOf(id) - 1]);
      CB.UI.modal({ titulo: '🔒 Fase bloqueada', html: `<p>Conclua antes a fase <b>${esc(anterior.titulo)}</b> (Mundo ${anterior.mundo}, fase ${anterior.numero}).</p>` });
    }));
  }

  // ------------------------------------------------------------------ insetário
  function insetario(app, opcoes = {}) {
    const el = document.getElementById('tela-insetario');
    const p = app.progresso;
    const bugs = app.dados.insetario;
    let selecionado = opcoes.bug || (bugs.find((b) => p.estado.insetario[b.id]) || bugs[0]).id;

    const desenhar = () => {
      const grade = bugs.map((b) => {
        const capturado = !!p.estado.insetario[b.id];
        return `<button type="button" class="cartao-bug${capturado ? '' : ' silhueta'}" data-bug="${b.id}" aria-pressed="${b.id === selecionado}"
            aria-label="${capturado ? esc(b.nome) : 'Bug ainda não capturado'}">${CB.Icones.inseto(b.cor)}${capturado ? esc(b.nome) : '???'}<small>${esc(b.mundos)}</small></button>`;
      }).join('');
      const b = bugs.find((x) => x.id === selecionado);
      const registro = p.estado.insetario[b.id];
      let detalhe;
      if (registro) {
        const fase = app.fase(registro.fase);
        const ex = b.exemplo;
        detalhe = `<h3>${CB.Icones.inseto(b.cor)}${esc(b.nome)}</h3>
          <div>Capturado no Mundo ${fase.mundo}, fase ${fase.numero}: ${esc(fase.titulo)}</div>
          <dl><dt>O erro</dt><dd>${esc(b.erro)}</dd>
          <dt>Como reconhecer</dt><dd>${esc(b.comoReconhecer)}</dd>
          <dt>Como corrigir</dt><dd>${esc(b.comoCorrigir)}</dd>
          <dt>Exemplo${ex.legenda ? ` · ${esc(ex.legenda)}` : ''}</dt>
          <dd class="exemplo"><div><h5>Com o bug</h5>${CB.Editor.miniHTML(ex.antes)}</div><div><h5>Corrigido</h5>${CB.Editor.miniHTML(ex.depois)}</div></dd></dl>`;
      } else {
        detalhe = `<h3>${CB.Icones.inseto('#CBD5E1')}Bug ainda não capturado</h3>
          <p>Este inseto aparece no <b>${esc(b.mundos)}</b>. Conserte os programas dessa parte da fábrica para capturá-lo.</p>`;
      }
      el.querySelector('#grade-bugs').innerHTML = grade;
      el.querySelector('#detalhe-bug').innerHTML = detalhe;
    };

    el.innerHTML = topo('Insetário', `<button type="button" class="btn fantasma" data-ir="mapa">☰ Mapa</button><button type="button" class="btn fantasma" data-ir="inicio">⌂ Início</button>`)
      + `<div class="corpo-insetario">
          <section class="painel"><div class="painel-cab">Tipos de bug <span class="dir">${p.totalBugs()} de ${bugs.length} capturados</span></div>
            <div class="rolagem"><div class="grade-bugs" id="grade-bugs"></div></div></section>
          <section class="painel" aria-live="polite"><div class="painel-cab">Ficha do bug</div><div class="rolagem"><div class="detalhe-bug" id="detalhe-bug"></div></div></section>
        </div>`;
    ligarNavegacao(el, app);
    el.querySelector('#grade-bugs').addEventListener('click', (e) => {
      const c = e.target.closest('[data-bug]');
      if (!c) return;
      selecionado = c.dataset.bug;
      desenhar();
      el.querySelector(`[data-bug="${selecionado}"]`).focus();
    });
    desenhar();
  }

  // ------------------------------------------------------------------ professor
  async function codigoProfessor() {
    let digitado = '';
    const ok = await CB.UI.modal({
      titulo: '🎓 Modo professor',
      html: `<p>Digite o código de acesso descrito no manual do professor (README).</p>
        <label class="sr" for="codigo-prof">Código de acesso</label>
        <input type="password" id="codigo-prof" autocomplete="off" autofocus>
        <p class="nota" id="erro-codigo" hidden>Código inválido. Tente de novo.</p>`,
      botoes: [{ texto: 'Cancelar', valor: false }, { texto: 'Entrar', valor: true, classe: 'primario' }],
      aoAbrir: (janela, fechar) => {
        const campo = janela.querySelector('#codigo-prof');
        campo.focus();
        campo.addEventListener('input', () => { digitado = campo.value; });
        campo.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          // Enter faz o mesmo que "Entrar". O preventDefault impede que a mesma tecla
          // acione o botão que recebe o foco quando o painel do professor abre.
          e.preventDefault();
          digitado = campo.value;
          fechar(true);
        });
      },
    });
    if (!ok) return false;
    if (digitado.trim().toLowerCase() === CODIGO_PROFESSOR) return true;
    await CB.UI.modal({ titulo: 'Código inválido', html: '<p>O código de acesso não confere. Consulte o README do jogo.</p>' });
    return false;
  }

  function professor(app) {
    const el = document.getElementById('tela-professor');
    const p = app.progresso;
    const linhas = app.ordem.map((id) => {
      const f = app.fase(id);
      const m = app.mundoDe(f);
      const d = p.dadosFase(id);
      const sit = d.concluida ? 'concluida' : p.liberada(id) ? 'liberada' : 'bloqueada';
      const rot = { concluida: '✓ Concluída', liberada: '▶ Liberada', bloqueada: '🔒 Bloqueada' }[sit];
      return `<tr><td>${m.numero} · ${esc(m.nome)}</td><td>${esc(f.titulo)}</td><td><span class="situacao ${sit}">${rot}</span></td>
        <td>${estrelasHTML(d.estrelas || 0)}</td><td class="n">${d.execucoes || 0}</td><td class="n">${d.dicas || 0}</td></tr>`;
    }).join('');
    el.innerHTML = topo('Painel do professor', '<button type="button" class="btn fantasma" data-ir="inicio">Sair do modo professor</button>')
      + `<div class="corpo-professor">
          <div class="pilha">
            <div class="cartao"><h3>Liberação de fases</h3>
              <label class="interruptor"><input type="checkbox" id="liberar-tudo" ${p.estado.liberarTudo ? 'checked' : ''}> Liberar todas as fases neste navegador</label>
              <p>Útil quando a turma vai trabalhar direto em um mundo específico, como repetição ou seleção.</p></div>
            <div class="cartao"><h3>Exportar progresso</h3>
              <p>Gera um arquivo CSV com a situação, as estrelas, as execuções e as dicas de cada fase.</p>
              <button type="button" class="btn primario" id="exportar">⬇ Exportar progresso (CSV)</button></div>
            <div class="cartao"><h3>Privacidade</h3>
              <p>O jogo não coleta dados pessoais. O progresso fica salvo apenas neste navegador e só sai dele quando você exporta o arquivo.</p>
              <button type="button" class="btn perigo" id="apagar">Apagar o progresso deste navegador</button></div>
          </div>
          <section class="painel"><div class="painel-cab">Progresso registrado neste navegador <span class="dir">${p.totalConcluidas()} de ${app.ordem.length} fases concluídas</span></div>
            <div class="rolagem"><table class="tabela-progresso"><thead><tr><th>Mundo</th><th>Fase</th><th>Situação</th><th>Estrelas</th><th>Execuções</th><th>Dicas</th></tr></thead><tbody>${linhas}</tbody></table></div>
          </section>
        </div>`;
    ligarNavegacao(el, app);
    el.querySelector('#liberar-tudo').addEventListener('change', (e) => {
      p.estado.liberarTudo = e.target.checked;
      p.salvar();
      CB.UI.anunciar(e.target.checked ? 'Todas as fases foram liberadas.' : 'Liberação das fases voltou ao normal.');
      professor(app);
      el.querySelector('#liberar-tudo').focus();
    });
    el.querySelector('#exportar').addEventListener('click', () => {
      const fases = {};
      app.ordem.forEach((id) => { fases[id] = app.fase(id); });
      const csv = p.exportarCSV(fases);
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'caca-bugs-progresso.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      CB.UI.anunciar('Arquivo caca-bugs-progresso.csv gerado.');
    });
    el.querySelector('#apagar').addEventListener('click', async () => {
      const ok = await CB.UI.confirmar('Todo o progresso, as estrelas e o Insetário deste navegador serão apagados. Isso não pode ser desfeito.', { titulo: 'Apagar progresso?', sim: 'Apagar' });
      if (!ok) return;
      p.recomecar();
      professor(app);
      CB.UI.anunciar('Progresso apagado.');
    });
  }

  // ------------------------------------------------------------------ relatório do conserto (RF011, RF012)
  function relatorio(app, info) {
    const { fase, estrelas, alteracoes, dicas, execucoes, novosBugs, proxima } = info;
    const capturas = fase.bugs.map((id) => {
      const b = app.bug(id);
      const novo = novosBugs.includes(id);
      return `<div class="capturado">${CB.Icones.inseto(b.cor)}<div><div class="rotulo">${novo ? 'BUG CAPTURADO' : 'BUG CAPTURADO DE NOVO'}</div>
        <div class="nome">${esc(b.nome)}${novo ? '<span class="novo">NOVO</span>' : ''}</div><div>${esc(b.erro)}</div></div></div>`;
    }).join('');
    const ultima = !proxima;
    const botoes = [];
    botoes.push({ texto: '☰ Mapa', valor: 'mapa', classe: 'claro' });
    botoes.push({ texto: '🐞 Ver no Insetário', valor: 'insetario', classe: 'claro' });
    if (proxima) botoes.push({ texto: 'Próxima fase ›', valor: 'proxima', classe: 'primario' });
    return CB.UI.modal({
      titulo: ultima ? 'Fábrica consertada! 🎉' : 'Fase concluída! 🎉',
      largo: true,
      html: `<div class="estrelas-grandes" aria-label="${estrelas} de 3 estrelas">${'★'.repeat(estrelas)}<span class="vazia">${'★'.repeat(3 - estrelas)}</span></div>
        ${capturas}
        <p>${esc(fase.explicacao)}</p>
        ${ultima ? '<p><b>Parabéns!</b> Você consertou todos os programas da Fábrica Byte.</p>' : ''}
        <table class="tabela-kv">
          <tr><td>Testes aprovados</td><td class="ok">${fase.cenarios.length} de ${fase.cenarios.length} ✓ ★</td></tr>
          <tr><td>Blocos alterados (meta: até ${fase.metaAlteracoes})</td><td>${alteracoes} ${alteracoes <= fase.metaAlteracoes ? '<span class="ok">✓ ★</span>' : '<span class="estrelas"><span class="vazia">★</span></span>'}</td></tr>
          <tr><td>Dicas usadas</td><td>${dicas} ${dicas === 0 ? '<span class="ok">✓ ★</span>' : '<span class="estrelas"><span class="vazia">★</span></span>'}</td></tr>
          <tr><td>Execuções dos testes</td><td>${execucoes}</td></tr>
        </table>`,
      botoes,
    });
  }

  // ------------------------------------------------------------------ ajuda
  function ajuda() {
    return CB.UI.modal({
      titulo: '❔ Como jogar',
      largo: true,
      html: `<div class="ajuda">
        <p>Cada robô da Fábrica Byte chega com um programa em blocos <b>com defeito</b>. Sua missão é encontrar o bug e consertar o programa.</p>
        <h3>O ciclo de cada fase</h3>
        <ul>
          <li><b>Executar testes:</b> roda o programa em todos os cenários. A fase só termina quando todos passam.</li>
          <li><b>Passo a passo:</b> executa um bloco de cada vez. O bloco amarelo acabou de rodar; o de contorno azul é o próximo.</li>
          <li><b>Pontos de parada</b> (a partir do Mundo 2): clique no círculo ao lado do número da linha e use <b>Até o ponto de parada</b>.</li>
          <li><b>Inspetor de estado:</b> durante a depuração mostra posição, direção, carga, voltas do laço, sensores e o contador.</li>
          <li><b>Dicas:</b> até três por fase, cada vez mais específicas, sem mostrar a solução.</li>
        </ul>
        <h3>Editando o programa</h3>
        <ul>
          <li>Arraste blocos da paleta para o programa e arraste-os para mudar de lugar. Para apagar, arraste o bloco para fora do programa.</li>
          <li>Os valores dentro dos blocos (direção, repetições, condição) são escolhidos nas caixinhas brancas.</li>
          <li>Pelo teclado: <kbd>Tab</kbd> chega aos blocos; <kbd>↑</kbd>/<kbd>↓</kbd> navegam; <kbd>Delete</kbd> apaga; <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> move;
            <kbd>Alt</kbd>+<kbd>→</kbd> coloca dentro do bloco de cima; <kbd>Alt</kbd>+<kbd>←</kbd> tira de dentro; <kbd>B</kbd> marca ponto de parada; na paleta, <kbd>Enter</kbd> insere o bloco.</li>
          <li>Atalhos: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> executa os testes · <kbd>F10</kbd> passo a passo · <kbd>F8</kbd> até o ponto de parada · <kbd>Ctrl</kbd>+<kbd>Z</kbd> desfaz · <kbd>Esc</kbd> para a execução.</li>
        </ul>
        <h3>Estrelas</h3>
        <ul><li>★ passar em todos os testes · ★ alterar no máximo o número de blocos da meta · ★ não usar dicas.</li></ul>
        <p class="nota">Cada bug consertado vai para o Insetário, com a explicação do erro e de como reconhecê-lo da próxima vez.</p>
      </div>`,
    });
  }

  CB.Telas = { inicio, mapa, insetario, professor, relatorio, ajuda, codigoProfessor, CODIGO_PROFESSOR };
})(typeof window !== 'undefined' ? window : globalThis);
