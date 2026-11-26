/*
 * Caça-Bugs — tela da fase: executar testes (CDU002), depurar (CDU003), pedir dica (CDU004),
 * reiniciar (RF016) e concluir a fase (RF009, RF011, RF012).
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const { esc, esperar } = CB.UI;
  const ATRASOS = [700, 450, 280, 160, 70]; // velocidade 1 (lenta) a 5 (rápida)

  class TelaFase {
    constructor(app) {
      this.app = app;
      this.el = document.getElementById('tela-fase');
      this.modo = 'edicao'; // edicao | animando | depurando
      this.editor = new CB.Editor(this.$('#programa'), this.$('#paleta'), {
        aoAlterar: () => this.aoEditar(),
        confirmar: (msg) => CB.UI.confirmar(msg),
        anunciar: (msg) => CB.UI.anunciar(msg),
      });
      this.cena = new CB.Cena(this.$('#cena'));
      this.ligar();
    }

    $(sel) { return this.el.querySelector(sel); }

    ligar() {
      this.$('#fase-marca').innerHTML = CB.Icones.marca() + 'Caça-Bugs';
      this.$('#fase-marca').addEventListener('click', () => { this.sair(); this.app.irPara('mapa'); });
      this.$('#btn-executar').addEventListener('click', () => this.executarTestes());
      this.$('#btn-passo').addEventListener('click', () => this.passo());
      this.$('#btn-ate-parada').addEventListener('click', () => this.ateParada());
      this.$('#btn-parar').addEventListener('click', () => this.parar());
      this.$('#btn-dica').addEventListener('click', () => this.pedirDica());
      this.$('#btn-reiniciar').addEventListener('click', () => this.reiniciar());
      this.$('#btn-desfazer').addEventListener('click', () => this.editor.desfazer());
      this.$('#btn-mapa').addEventListener('click', () => { this.sair(); this.app.irPara('mapa'); });
      this.$('#btn-ajuda').addEventListener('click', () => CB.Telas.ajuda());
      this.$('#abas').addEventListener('click', (e) => {
        const aba = e.target.closest('[data-cenario]');
        if (aba) this.selecionarCenario(Number(aba.dataset.cenario));
      });
      this.$('#abas').addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        const n = this.fase.cenarios.length;
        const i = (this.cenario + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
        this.selecionarCenario(i);
        this.$(`[data-cenario="${i}"]`).focus();
      });
      document.addEventListener('keydown', (e) => {
        if (this.app.telaAtual !== 'fase' || document.querySelector('.fundo-modal')) return;
        const emCampo = e.target.closest && e.target.closest('select, input, textarea');
        if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !emCampo) { e.preventDefault(); this.editor.desfazer(); }
        else if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); this.executarTestes(); }
        else if (e.key === 'F10') { e.preventDefault(); this.passo(); }
        else if (e.key === 'F8') { e.preventDefault(); this.ateParada(); }
        else if (e.key === 'Escape' && this.modo !== 'edicao') { this.parar(); }
      });
      let espera;
      window.addEventListener('resize', () => {
        clearTimeout(espera);
        espera = setTimeout(() => { if (this.app.telaAtual === 'fase' && this.fase) this.redesenharCena(); }, 150);
      });
    }

    // -------------------------------------------------------------- abrir / sair
    abrir(id) {
      this.cancelarAnimacao();
      const fase = this.app.fase(id);
      const mundo = this.app.mundoDe(fase);
      this.fase = fase;
      this.id = id;
      this.original = CB.clonar(fase.programa);
      this.execucoes = 0;
      this.dicasUsadas = 0;
      this.resultados = null;
      this.cenario = 0;
      this.modo = 'edicao';
      this.depuracao = null;
      this.$('#fase-crumb').innerHTML = `Mundo ${fase.mundo} · ${esc(mundo.nome)} <span aria-hidden="true">›</span> <b>Fase ${fase.numero} — ${esc(fase.titulo)}</b>`;
      this.$('#fase-missao').textContent = fase.missao;
      this.$('#fase-cenarios').textContent = CB.plural(fase.cenarios.length, 'cenário de teste', 'cenários de teste');
      this.$('#meta-alteracoes').textContent = fase.metaAlteracoes;
      this.$('#btn-ate-parada').classList.toggle('oculto', !fase.ferramentas.includes('pontoDeParada'));
      this.editor.carregar(fase, fase.programa);
      this.$('#inspetor').classList.add('oculto');
      this.$('#resumo').classList.remove('oculto');
      this.$('#resumo').innerHTML = '';
      this.app.mostrar('fase');
      this.renderAbas();
      this.redesenharCena();
      this.mensagem('info', 'Execute os testes para ver se o robô cumpre a missão em todos os cenários.');
      this.atualizarEstatisticas();
      this.atualizarControles();
      document.title = `${fase.titulo} · Caça-Bugs`;
      this.$('#btn-executar').focus();
      if (fase.tutorial && !this.app.progresso.estado.tutorialVisto) {
        setTimeout(() => CB.Tutorial.iniciar(this.app), 350);
      }
    }

    sair() {
      this.cancelarAnimacao();
      this.sairDepuracao(false);
      CB.Tutorial.encerrar();
    }

    redesenharCena() {
      const painel = this.$('#painel-testes');
      const espaco = { largura: painel.clientWidth, altura: Math.max(150, painel.clientHeight * 0.5) };
      this.cena.montar(this.fase.cenarios[this.cenario].mapa, espaco);
      if (this.modo === 'depurando' && this.depuracao) this.mostrarEstado(this.depuracao.r, this.depuracao.cursor, { instantaneo: true, proximo: true });
    }

    // -------------------------------------------------------------- interface
    mensagem(tipo, html) {
      const el = this.$('#resultado');
      el.className = 'resultado ' + tipo;
      el.innerHTML = html;
    }

    renderAbas() {
      this.$('#abas').innerHTML = this.fase.cenarios.map((c, i) => {
        const r = this.resultados && this.resultados[i];
        const icone = !r ? '<span aria-hidden="true">•</span>' : r.ok ? '<span class="ok" aria-hidden="true">✓</span>' : '<span class="ko" aria-hidden="true">✗</span>';
        const estado = !r ? 'ainda não executado' : r.ok ? 'passou' : 'falhou';
        const sel = i === this.cenario;
        return `<button type="button" class="aba" role="tab" data-cenario="${i}" aria-selected="${sel}" tabindex="${sel ? 0 : -1}" aria-label="${esc(c.nome)}: ${estado}">${icone} ${esc(c.nome)}</button>`;
      }).join('');
    }

    renderResumo() {
      const ul = this.$('#resumo');
      if (!this.resultados) { ul.innerHTML = ''; return; }
      const ok = this.resultados.filter((r) => r.ok).length;
      ul.innerHTML = this.resultados.map((r) => r.ok
        ? `<li><span class="ok" aria-hidden="true">✓</span> ${esc(r.nome)} — passou</li>`
        : `<li><span class="ko" aria-hidden="true">✗</span> ${esc(r.nome)} — ${esc(r.resultado.mensagem)}${r.resultado.passo && r.resultado.codigo !== 'limite' ? ` (passo ${r.resultado.passo})` : ''}</li>`).join('')
        + `<li class="total">${ok} de ${this.resultados.length} ${this.resultados.length === 1 ? 'teste passou' : 'testes passaram'}</li>`;
    }

    atualizarEstatisticas() {
      const prog = this.editor.obterPrograma();
      const alteracoes = CB.Programa.contarAlteracoes(this.original, prog);
      this.$('#n-blocos').textContent = CB.Programa.contarBlocos(prog);
      this.$('#n-alteracoes').textContent = alteracoes;
      this.$('#n-execucoes').textContent = this.execucoes;
      this.$('#n-dicas').textContent = this.dicasUsadas;
      this.$('#dicas-restantes').textContent = this.fase.dicas.length - this.dicasUsadas;
      this.$('#btn-desfazer').disabled = !this.editor.podeDesfazer();
      this.$('#programa-status').textContent = alteracoes === 0 ? 'programa original com defeito'
        : `${CB.plural(alteracoes, 'alteração', 'alterações')} no programa original`;
    }

    atualizarControles() {
      const animando = this.modo === 'animando';
      this.$('#btn-executar').disabled = animando;
      this.$('#btn-passo').disabled = animando;
      this.$('#btn-ate-parada').disabled = animando;
      this.$('#btn-parar').disabled = this.modo === 'edicao';
      this.$('#btn-reiniciar').disabled = animando;
      this.$('#btn-desfazer').disabled = animando || !this.editor.podeDesfazer();
    }

    atraso() { return ATRASOS[Number(this.$('#velocidade').value) - 1] || 280; }

    // -------------------------------------------------------------- edição
    aoEditar() {
      this.cancelarAnimacao();
      this.sairDepuracao(false);
      this.resultados = null;
      this.renderAbas();
      this.renderResumo();
      const mapa = this.fase.cenarios[this.cenario].mapa;
      this.cena.mostrar({ x: mapa.roboInicial.x, y: mapa.roboInicial.y, dir: mapa.roboInicial.dir, carga: 0, caixas: mapa.caixasIniciais }, { instantaneo: true });
      this.editor.destacar({ rolar: false });
      this.mensagem('info', 'Programa alterado. Execute os testes de novo para conferir.');
      this.atualizarEstatisticas();
      this.atualizarControles();
      CB.eventos.emitir('programa-alterado');
    }

    async reiniciar() {
      const ok = await CB.UI.confirmar('O programa volta a ser o original, com defeito. Você pode desfazer depois, se quiser.', { titulo: 'Reiniciar a fase?', sim: 'Reiniciar' });
      if (!ok) return;
      this.cancelarAnimacao();
      this.sairDepuracao(false);
      this.editor.substituir(this.original);
      this.editor.destacar({});
      this.mensagem('info', 'Fase reiniciada: o programa voltou a ser o original.');
    }

    // -------------------------------------------------------------- testes (CDU002)
    async executarTestes() {
      if (this.modo === 'animando') return;
      this.sairDepuracao(false);
      const programa = this.editor.obterPrograma();
      this.resultados = CB.executarTestes(this.fase, programa);
      this.execucoes++;
      this.app.progresso.registrarTentativa(this.id, { execucoes: 1 });
      this.atualizarEstatisticas();
      const falhas = this.resultados.filter((r) => !r.ok);
      let alvo = this.cenario;
      if (this.resultados[alvo].ok && falhas.length) alvo = falhas[0].indice;
      if (alvo !== this.cenario) { this.cenario = alvo; this.redesenharCena(); }
      this.renderAbas();
      this.renderResumo();
      CB.UI.anunciar(falhas.length ? `${this.resultados.length - falhas.length} de ${this.resultados.length} testes passaram.` : 'Todos os testes passaram!');
      CB.eventos.emitir('testes-executados', { ok: !falhas.length });
      const id = this.id;
      await this.animar(this.resultados[alvo]);
      // a fase é concluída pelos testes (RF009), mesmo que a animação seja interrompida com "Parar"
      if (!falhas.length && this.app.telaAtual === 'fase' && this.id === id) this.concluir(programa);
    }

    /** Anima o rastro de um cenário. Devolve false se for interrompido. */
    async animar(r) {
      const token = {};
      this.token = token;
      this.modo = 'animando';
      this.editor.definirBloqueado(true);
      this.atualizarControles();
      this.mensagem('info', `▶ Executando o ${esc(r.nome)}...`);
      const n = r.eventos.length;
      const ate = n > 120 ? 40 : n;
      this.mostrarEstado(r, 0, { instantaneo: true });
      for (let k = 1; k <= ate; k++) {
        await esperar(this.atraso());
        if (this.token !== token) return false;
        this.mostrarEstado(r, k);
      }
      if (ate < n) {
        this.mensagem('info', '⏩ O robô está repetindo os mesmos passos há muito tempo. Pulando para o fim...');
        await esperar(900);
        if (this.token !== token) return false;
        this.mostrarEstado(r, n, { instantaneo: true });
      }
      this.token = null;
      this.modo = 'edicao';
      this.editor.definirBloqueado(false);
      this.atualizarControles();
      this.mostrarFim(r);
      return true;
    }

    cancelarAnimacao() {
      this.token = null;
      if (this.modo === 'animando') {
        this.modo = 'edicao';
        this.editor.definirBloqueado(false);
        this.atualizarControles();
      }
    }

    mostrarEstado(r, k, opcoes = {}) {
      const ev = k > 0 ? r.eventos[k - 1] : null;
      const foto = ev ? ev.foto : r.inicial;
      this.cena.mostrar(foto, {
        rastro: CB.Cena.rastroAte(r.inicial, r.eventos, k),
        erro: ev && ev.erro ? { codigo: ev.codigoErro } : null,
        instantaneo: opcoes.instantaneo,
        duracao: this.modo === 'animando' ? this.atraso() * 0.8 : 220,
      });
      const proximo = opcoes.proximo && k < r.eventos.length ? r.eventos[k].id : null;
      this.editor.destacar({ exec: ev && !ev.erro ? ev.id : null, erro: ev && ev.erro ? ev.id : null, prox: proximo });
      if (this.modo === 'depurando') this.renderInspetor(r, k);
    }

    mostrarFim(r) {
      if (r.ok) {
        this.mensagem('ok', `<b>✓ ${esc(r.nome)} passou:</b> missão cumprida em ${CB.plural(r.eventos.length, 'passo', 'passos')}.`);
      } else {
        const passo = r.resultado.passo && r.resultado.codigo !== 'limite' ? ` (passo ${r.resultado.passo} de ${r.eventos.length})` : '';
        this.mensagem('ko', `<b>✗ ${esc(r.nome)} falhou:</b> ${esc(r.resultado.mensagem)}${passo}.`);
      }
    }

    selecionarCenario(i) {
      if (i === this.cenario && this.modo === 'edicao') return;
      this.cancelarAnimacao();
      this.sairDepuracao(false);
      this.cenario = i;
      this.renderAbas();
      this.redesenharCena();
      this.editor.destacar({ rolar: false });
      if (this.resultados) this.mostrarFim(this.resultados[i]);
      else this.mensagem('info', `${esc(this.fase.cenarios[i].nome)} selecionado. Execute os testes ou use o passo a passo.`);
    }

    // -------------------------------------------------------------- depuração (CDU003)
    iniciarDepuracao() {
      const cenario = this.fase.cenarios[this.cenario];
      const programa = this.editor.obterPrograma();
      const r = CB.simular(programa, cenario.mapa, { capacidade: this.fase.capacidade, objetivo: this.fase.objetivo });
      r.nome = cenario.nome;
      const nos = new Map();
      CB.Programa.percorrer(programa, (no) => nos.set(no.id, no));
      this.depuracao = { r, cursor: 0, nos, linhas: CB.Programa.numerarLinhas(programa) };
      this.modo = 'depurando';
      this.$('#resumo').classList.add('oculto');
      this.$('#inspetor').classList.remove('oculto');
      this.mostrarEstado(r, 0, { instantaneo: true, proximo: true });
      this.mensagem('info', `Depurando o ${esc(r.nome)}. O bloco com contorno azul é o próximo a executar.`);
      this.atualizarControles();
      CB.eventos.emitir('depuracao-iniciada');
    }

    sairDepuracao(redesenhar) {
      if (this.modo === 'depurando') {
        this.modo = 'edicao';
        this.depuracao = null;
        this.$('#inspetor').classList.add('oculto');
        this.$('#resumo').classList.remove('oculto');
      }
      if (redesenhar) {
        const mapa = this.fase.cenarios[this.cenario].mapa;
        this.cena.mostrar({ x: mapa.roboInicial.x, y: mapa.roboInicial.y, dir: mapa.roboInicial.dir, carga: 0, caixas: mapa.caixasIniciais }, { instantaneo: true });
        this.editor.destacar({ rolar: false });
        if (this.resultados) this.mostrarFim(this.resultados[this.cenario]);
        else this.mensagem('info', 'Execução parada. O robô voltou ao início.');
      }
      this.atualizarControles();
    }

    passo() {
      if (this.modo === 'animando') return;
      if (this.modo !== 'depurando') this.iniciarDepuracao();
      const d = this.depuracao;
      const n = d.r.eventos.length;
      if (d.cursor >= n) { this.mostrarFimDepuracao(); return; }
      d.cursor++;
      this.mostrarEstado(d.r, d.cursor, { proximo: true });
      if (d.cursor >= n) this.mostrarFimDepuracao();
      else this.mensagem('info', this.descreverEvento(d.r.eventos[d.cursor - 1]));
      CB.eventos.emitir('passo');
    }

    async ateParada() {
      if (this.modo === 'animando') return;
      const pontos = this.editor.pontos;
      if (!pontos.size) {
        this.mensagem('info', 'Marque um ponto de parada: clique no círculo ao lado do número da linha (ou selecione o bloco e tecle <kbd>B</kbd>).');
        return;
      }
      if (this.modo !== 'depurando') this.iniciarDepuracao();
      const d = this.depuracao;
      const ev = d.r.eventos;
      const n = ev.length;
      let i = d.cursor + 1;
      if (d.cursor === 0 && n && pontos.has(ev[0].id)) i = 0;
      while (i < n && !pontos.has(ev[i].id)) i++;
      const token = {};
      this.token = token;
      if (i - d.cursor <= 80) {
        for (let k = d.cursor + 1; k <= i; k++) {
          await esperar(60);
          if (this.token !== token || this.modo !== 'depurando') return;
          this.mostrarEstado(d.r, k, { proximo: k === i });
        }
      }
      this.token = null;
      if (this.modo !== 'depurando') return;
      d.cursor = i;
      this.mostrarEstado(d.r, i, { instantaneo: true, proximo: true });
      if (i >= n) this.mostrarFimDepuracao();
      else this.mensagem('info', `⏸ Parado no ponto de parada, antes da linha ${d.linhas.get(ev[i].id)}. Passo ${i} de ${n}.`);
    }

    mostrarFimDepuracao() {
      const r = this.depuracao.r;
      if (r.ok) this.mensagem('ok', `<b>✓ Fim da execução:</b> o ${esc(r.nome)} passou.`);
      else this.mensagem('ko', `<b>✗ Fim da execução:</b> ${esc(r.resultado.mensagem)}${r.resultado.passo ? ` (passo ${r.resultado.passo})` : ''}. Clique em Parar para voltar ao início.`);
    }

    descreverEvento(ev) {
      const no = this.depuracao.nos.get(ev.id);
      const linha = `Passo ${ev.passo} · linha ${this.depuracao.linhas.get(ev.id)}:`;
      if (!no) return linha;
      if (ev.erro) return `<b>${linha}</b> ✗ ${esc(ev.erro)}.`;
      switch (no.op) {
        case 'repetir':
          if (no.ate === undefined) return `<b>${linha}</b> repetir — volta ${ev.voltas.at(-1).volta} de ${no.vezes}.`;
          return `<b>${linha}</b> repetir até “${esc(CB.rotuloCondicao(no.ate))}”? ${ev.cond ? '<b>sim</b> → sai do laço.' : `<b>não</b> → executa o laço (volta ${ev.voltas.at(-1).volta}).`}`;
        case 'se':
          return `<b>${linha}</b> se “${esc(CB.rotuloCondicao(no.cond))}”? ${ev.cond ? '<b>sim</b> → executa o “então”.' : no.senao ? '<b>não</b> → executa o “senão”.' : '<b>não</b> → pula o bloco.'}`;
        case 'chamar': return `<b>${linha}</b> executa o procedimento ${esc(no.proc)}.`;
        case 'definir': case 'aumentar': return `<b>${linha}</b> ${esc(CB.Editor.descrever(no))} → contador agora vale ${ev.vars.contador}.`;
        default: return `<b>${linha}</b> ${esc(CB.Editor.descrever(no))}.`;
      }
    }

    renderInspetor(r, k) {
      const ev = k > 0 ? r.eventos[k - 1] : null;
      const foto = ev ? ev.foto : r.inicial;
      const f = this.fase;
      const mundo = CB.mundoEm(f.cenarios[this.cenario].mapa, foto, f.capacidade);
      const sim = '<span class="sim">✓ sim</span>';
      const nao = '<span class="nao">✗ não</span>';
      const linhas = [
        ['Posição', `coluna ${foto.x + 1}, linha ${foto.y + 1}`],
        ['Direção', `${CB.SETA[foto.dir]} ${CB.NOME_DIRECAO[foto.dir]}`],
        ['Segurando', foto.carga === 0 ? 'nada' : f.capacidade > 1 ? CB.plural(foto.carga, 'caixa', 'caixas') : 'caixa'],
      ];
      const volta = ev && ev.voltas.length ? ev.voltas[ev.voltas.length - 1] : null;
      if (volta) linhas.push(['Repetição atual', volta.total ? `volta ${volta.volta} de ${volta.total}` : `volta ${volta.volta}`]);
      if (ev && ev.chamadas.length) linhas.push(['Dentro do procedimento', ev.chamadas.join(' › ')]);
      if (f.ferramentas.includes('inspetorSensores')) {
        for (const s of f.sensores) linhas.push([`Sensor “${CB.SENSORES[s]}”`, mundo.sensor(s) ? sim : nao]);
      }
      if (f.ferramentas.includes('inspetorVariaveis')) linhas.push(['Variável contador', `<b>${ev ? ev.vars.contador : 0}</b>`]);
      this.$('#inspetor').innerHTML = `<h4>Inspetor de estado <span>passo ${k} de ${r.eventos.length}</span></h4>
        <table>${linhas.map(([a, b]) => `<tr><td>${a}</td><td><b>${b}</b></td></tr>`).join('')}</table>`;
    }

    parar() {
      this.cancelarAnimacao();
      this.sairDepuracao(true);
    }

    // -------------------------------------------------------------- dicas (CDU004)
    async pedirDica() {
      const dicas = this.fase.dicas;
      if (this.modo === 'animando') this.cancelarAnimacao();
      if (!this.resultados && this.dicasUsadas === 0 && this.execucoes === 0) {
        const verMesmo = await CB.UI.confirmar('Que tal executar os testes antes? Eles mostram onde o robô falha.', {
          titulo: 'Antes da dica...', sim: 'Ver a dica mesmo assim', nao: 'Executar os testes',
        });
        if (!verMesmo) { this.executarTestes(); return; }
      }
      let nivel = this.dicasUsadas === dicas.length ? dicas.length : this.dicasUsadas + 1;
      for (;;) {
        if (nivel > this.dicasUsadas) {
          this.dicasUsadas = nivel;
          this.app.progresso.registrarTentativa(this.id, { dicas: 1 });
          this.atualizarEstatisticas();
        }
        const dica = dicas[nivel - 1];
        if (dica.destacar) this.editor.destacar({ dica: dica.destacar });
        let extra = '';
        if (dica.bug) {
          const bug = this.app.bug(dica.bug);
          extra = `<div class="capturado">${CB.Icones.inseto(bug.cor)}<div><div class="rotulo">TIPO DE BUG</div><div class="nome">${esc(bug.nome)}</div><div>${esc(bug.erro)}</div></div></div>`;
        }
        const nomes = ['Onde observar', 'Onde procurar', 'Tipo de bug'];
        const niveis = nomes.map((t, i) => `<span class="${i + 1 < nivel ? 'feito' : i + 1 === nivel ? 'agora' : ''}">${i + 1} · ${t}</span>`).join('');
        const restantes = dicas.length - nivel;
        const botoes = [];
        if (restantes > 0) botoes.push({ texto: `Próxima dica (${restantes} ${restantes === 1 ? 'restante' : 'restantes'})`, valor: 'proxima', classe: 'claro' });
        botoes.push({ texto: 'Voltar ao programa', valor: 'fechar', classe: 'primario' });
        const escolha = await CB.UI.modal({
          titulo: `💡 Dica ${nivel} de ${dicas.length}`,
          lateral: true,
          html: `<div class="niveis-dica">${niveis}</div><p>${esc(dica.texto)}</p>${extra}
            <p class="nota">As dicas nunca mostram a solução. Usar dicas não impede de concluir a fase, mas custa a terceira estrela.</p>`,
          botoes,
        });
        if (escolha !== 'proxima') break;
        nivel++;
      }
    }

    // -------------------------------------------------------------- conclusão (RF009, RF011, RF012)
    async concluir(programa) {
      const alteracoes = CB.Programa.contarAlteracoes(this.original, programa);
      const estrelas = CB.calcularEstrelas(alteracoes, this.fase.metaAlteracoes, this.dicasUsadas);
      const { novosBugs } = this.app.progresso.registrarConclusao(this.id, { estrelas, bugs: this.fase.bugs });
      CB.eventos.emitir('fase-concluida');
      const proxima = this.app.proximaFase(this.id);
      const acao = await CB.Telas.relatorio(this.app, {
        fase: this.fase, estrelas, alteracoes, dicas: this.dicasUsadas, execucoes: this.execucoes, novosBugs, proxima,
      });
      if (acao === 'proxima' && proxima) { this.sair(); this.app.abrirFase(proxima); }
      else if (acao === 'insetario') { this.sair(); this.app.irPara('insetario', { bug: this.fase.bugs[0] }); }
      else if (acao === 'mapa') { this.sair(); this.app.irPara('mapa'); }
    }
  }

  CB.TelaFase = TelaFase;
})(typeof window !== 'undefined' ? window : globalThis);
