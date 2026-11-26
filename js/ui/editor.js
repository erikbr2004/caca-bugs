/*
 * Caça-Bugs — editor de blocos (RF003, RF007).
 * Arrastar e soltar com mouse ou toque (Pointer Events) e edição completa pelo teclado (RNF005):
 *   Delete apaga · Alt+↑/↓ move · Alt+→ coloca dentro do bloco acima · Alt+← tira de dentro
 *   B marca ponto de parada · ↑/↓ navega · Enter na paleta insere depois do bloco selecionado
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const P = CB.Programa;

  const PALETA = [
    { cat: 'mov', titulo: 'Movimento', itens: [
      { tipo: 'andar', op: 'andar', rotulo: 'andar' },
      { tipo: 'virarEsquerda', op: 'virar', rotulo: 'virar à esquerda' },
      { tipo: 'virarDireita', op: 'virar', rotulo: 'virar à direita' }] },
    { cat: 'act', titulo: 'Ações', itens: [
      { tipo: 'pegar', op: 'pegar', rotulo: 'pegar' },
      { tipo: 'soltar', op: 'soltar', rotulo: 'soltar' }] },
    { cat: 'rep', titulo: 'Repetição', itens: [
      { tipo: 'repetirVezes', op: 'repetir', rotulo: 'repetir 2 vezes' },
      { tipo: 'repetirAte', op: 'repetir', rotulo: 'repetir até …', sensor: true }] },
    { cat: 'cond', titulo: 'Seleção', itens: [
      { tipo: 'se', op: 'se', rotulo: 'se … então' },
      { tipo: 'seSenao', op: 'se', rotulo: 'se … senão' }] },
    { cat: 'proc', titulo: 'Procedimentos', itens: [
      { tipo: 'chamar', op: 'chamar', rotulo: 'executar A' }] },
    { cat: 'var', titulo: 'Variável', itens: [
      { tipo: 'definir', op: 'definir', rotulo: 'contador = 0' },
      { tipo: 'aumentar', op: 'aumentar', rotulo: 'aumentar contador' }] },
  ];

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const opcao = (valor, texto, atual) => `<option value="${esc(valor)}"${valor === atual ? ' selected' : ''}>${esc(texto)}</option>`;

  /** Texto do bloco para leitores de tela e mensagens. */
  function descrever(no) {
    switch (no.op) {
      case 'virar': return `virar à ${no.lado}`;
      case 'repetir': return no.ate !== undefined ? `repetir até ${CB.rotuloCondicao(no.ate)}` : `repetir ${CB.plural(no.vezes, 'vez', 'vezes')}`;
      case 'se': return `se ${CB.rotuloCondicao(no.cond)} então${no.senao ? ', com senão' : ''}`;
      case 'chamar': return `executar ${no.proc}`;
      case 'definir': return `contador = ${no.valor}`;
      case 'aumentar': return 'aumentar contador';
      default: return no.op;
    }
  }

  /** Conteúdo estático de um bloco (Insetário e relatórios). */
  function textoEstatico(no) {
    const v = (t) => `<span class="valor">${esc(t)}</span>`;
    switch (no.op) {
      case 'virar': return `virar ${v('à ' + no.lado)}`;
      case 'repetir': return `repetir ${v(no.ate !== undefined ? 'até ' + CB.rotuloCondicao(no.ate) : CB.plural(no.vezes, 'vez', 'vezes'))}`;
      case 'se': return `se ${v(CB.rotuloCondicao(no.cond))} então`;
      case 'chamar': return `executar ${v(no.proc)}`;
      case 'definir': return `contador = ${v(no.valor)}`;
      case 'aumentar': return 'aumentar contador';
      default: return esc(no.op);
    }
  }

  function miniNo(no) {
    const cat = CB.BLOCOS[no.op].cat;
    const cont = CB.BLOCOS[no.op].container;
    let h = `<li class="item"><div class="linha"><div class="blk ${cat}${cont ? ' cab' : ''}">${textoEstatico(no)}</div></div>`;
    const corpo = (lista) => `<div class="corpo"><div class="barra-c ${cat}"></div><ol class="lista">${lista.map(miniNo).join('') || '<li class="vazio">vazio</li>'}</ol></div>`;
    if (no.op === 'repetir') h += corpo(no.corpo) + `<div class="pe ${cat}"></div>`;
    if (no.op === 'se') {
      h += corpo(no.entao);
      if (no.senao) h += `<div class="senao-rotulo ${cat}">senão</div>` + corpo(no.senao);
      h += `<div class="pe ${cat}"></div>`;
    }
    return h + '</li>';
  }

  class Editor {
    /**
     * @param {HTMLElement} raizPrograma  área do programa (#programa)
     * @param {HTMLElement} raizPaleta    área da paleta
     * @param {{aoAlterar:Function, confirmar:Function, anunciar:Function}} opcoes
     */
    constructor(raizPrograma, raizPaleta, opcoes) {
      this.raiz = raizPrograma;
      this.raizPaleta = raizPaleta;
      this.opcoes = opcoes;
      this.bloqueado = false;
      this.pontos = new Set();
      this.historico = [];
      this.selecionado = null;
      this.destaques = {};
      this.arraste = null;
      this.ligarEventos();
    }

    carregar(fase, programa) {
      this.fase = fase;
      this.programa = CB.clonar(programa);
      this.pontos = new Set();
      this.historico = [];
      this.selecionado = null;
      this.destaques = {};
      this.renderizarPaleta();
      this.renderizar();
    }

    obterPrograma() { return CB.clonar(this.programa); }

    /** Substitui o programa (ex.: reiniciar a fase) guardando o estado anterior para desfazer. */
    substituir(programa) {
      this.alterar((p) => { p.principal = CB.clonar(programa.principal); p.procedimentos = CB.clonar(programa.procedimentos); });
    }

    podeDesfazer() { return this.historico.length > 0 && !this.bloqueado; }

    // ------------------------------------------------------------ alterações
    alterar(fn, mensagem) {
      if (this.bloqueado) return false;
      const antes = JSON.stringify(this.programa);
      if (fn(this.programa) === false) return false;
      if (JSON.stringify(this.programa) === antes) return false;
      this.historico.push(antes);
      if (this.historico.length > 60) this.historico.shift();
      const ids = new Set();
      P.percorrer(this.programa, (no) => ids.add(no.id));
      for (const id of [...this.pontos]) if (!ids.has(id)) this.pontos.delete(id);
      if (this.selecionado && !ids.has(this.selecionado)) this.selecionado = null;
      this.renderizar();
      this.opcoes.aoAlterar();
      if (mensagem) this.opcoes.anunciar(mensagem);
      return true;
    }

    desfazer() {
      if (!this.podeDesfazer()) return;
      this.programa = JSON.parse(this.historico.pop());
      this.renderizar();
      this.opcoes.aoAlterar();
      this.opcoes.anunciar('Alteração desfeita.');
    }

    // ------------------------------------------------------------ desenho
    renderizarPaleta() {
      const f = this.fase;
      let h = '';
      for (const grupo of PALETA) {
        const liberados = grupo.itens.filter((it) => f.blocos.includes(it.op) && (!it.sensor || f.sensores.length)
          && (it.op !== 'chamar' || Object.keys(this.programa.procedimentos).length));
        const trancada = liberados.length === 0;
        h += `<div class="categoria${trancada ? ' trancada' : ''}"><h3><i class="${grupo.cat}"></i>${grupo.titulo}${trancada ? ' <span aria-label="ainda bloqueado">🔒</span>' : ''}</h3>`;
        for (const it of grupo.itens) {
          if (!trancada && !liberados.includes(it)) continue;
          const rotulo = it.tipo === 'chamar' ? `executar ${Object.keys(this.programa.procedimentos).sort()[0] || 'A'}` : it.rotulo;
          h += `<button type="button" class="blk ${grupo.cat}" data-tipo="${it.tipo}" ${trancada ? 'disabled' : ''} aria-label="Adicionar bloco ${esc(rotulo)}">${esc(rotulo)}</button>`;
        }
        h += '</div>';
      }
      if (f.sensores.length) {
        h += `<div class="categoria"><h3><i style="background:#334155"></i>Sensores</h3>${f.sensores.map((s) => `<span class="sens">${CB.SENSORES[s]}</span>`).join('')}</div>`;
        h += '<p class="dica-paleta">Os sensores são escolhidos dentro dos blocos <b>repetir até</b> e <b>se</b>.</p>';
      }
      h += '<p class="dica-paleta">Arraste um bloco para o programa ou selecione-o e tecle <kbd>Enter</kbd>. Para apagar, arraste o bloco para fora do programa.</p>';
      this.raizPaleta.innerHTML = h;
    }

    renderizar() {
      const linhas = P.numerarLinhas(this.programa);
      this.linhas = linhas;
      const procs = Object.keys(this.programa.procedimentos).sort();
      let h = `<div class="secao" data-secao="principal">${procs.length ? '<div class="secao-titulo">Programa principal</div>' : ''}${this.htmlLista(this.programa.principal, 'principal', 0, linhas)}</div>`;
      for (const nome of procs) {
        h += `<div class="secao" data-secao="proc:${nome}"><div class="secao-titulo de-proc">Procedimento ${nome}</div>${this.htmlLista(this.programa.procedimentos[nome], 'proc:' + nome, 0, linhas)}</div>`;
      }
      h += '<div class="indicador oculto" aria-hidden="true"></div>';
      this.raiz.innerHTML = h;
      this.raiz.classList.toggle('editor-bloqueado', this.bloqueado);
      this.aplicarDestaques();
      if (this.focarAposRender && this.selecionado) {
        const chip = this.chip(this.selecionado);
        if (chip) chip.focus();
      }
      this.focarAposRender = false;
    }

    htmlLista(lista, caminho, prof, linhas) {
      let h = `<ol class="lista" data-lista="${caminho}" data-prof="${prof}">`;
      if (!lista.length) h += `<li class="vazio">${prof === 0 ? 'Arraste blocos para cá' : 'solte blocos aqui'}</li>`;
      for (const no of lista) h += this.htmlNo(no, prof, linhas);
      return h + '</ol>';
    }

    htmlNo(no, prof, linhas) {
      const cat = CB.BLOCOS[no.op].cat;
      const n = linhas.get(no.id);
      const comPonto = this.fase.ferramentas.includes('pontoDeParada');
      const calha = `<div class="calha"><span>${n}</span><button type="button" class="bp${comPonto ? '' : ' oculto-bp'}" data-bp="${no.id}" aria-pressed="${this.pontos.has(no.id)}" aria-label="Ponto de parada na linha ${n}" title="Ponto de parada (tecla B)" tabindex="${comPonto ? 0 : -1}"></button></div>`;
      const cont = CB.BLOCOS[no.op].container;
      const chip = `<div class="blk ${cat}${cont ? ' cab' : ''}" tabindex="0" data-id="${no.id}" role="group" aria-label="${esc(descrever(no))}, linha ${n}">${this.htmlConteudo(no)}</div>`;
      let h = `<li class="item" data-id="${no.id}" style="--prof:${prof}"><div class="linha">${calha}${chip}</div>`;
      const corpo = (lista, campo) => `<div class="corpo"><div class="barra-c ${cat}"></div>${this.htmlLista(lista, `${no.id}.${campo}`, prof + 1, linhas)}</div>`;
      if (no.op === 'repetir') h += corpo(no.corpo, 'corpo') + `<div class="pe ${cat}"></div>`;
      if (no.op === 'se') {
        h += corpo(no.entao, 'entao');
        if (no.senao) h += `<div class="senao-rotulo ${cat}">senão</div>` + corpo(no.senao, 'senao');
        h += `<div class="pe ${cat}"></div>`;
      }
      return h + '</li>';
    }

    htmlConteudo(no) {
      const d = this.bloqueado ? ' disabled' : '';
      switch (no.op) {
        case 'virar':
          return `virar <select data-campo="lado" aria-label="Direção do giro"${d}>${opcao('esquerda', 'à esquerda', no.lado)}${opcao('direita', 'à direita', no.lado)}</select>`;
        case 'repetir': {
          const atual = no.ate !== undefined ? 'a:' + no.ate : 'v:' + no.vezes;
          let o = '';
          for (let v = 1; v <= 10; v++) o += opcao('v:' + v, CB.plural(v, 'vez', 'vezes'), atual);
          const conds = P.opcoesCondicao(this.fase);
          if (conds.length) o += `<optgroup label="até uma condição">${conds.map((c) => opcao('a:' + c, 'até ' + CB.rotuloCondicao(c), atual)).join('')}</optgroup>`;
          return `repetir <select data-campo="modo" aria-label="Quantas vezes repetir"${d}>${o}</select>`;
        }
        case 'se': {
          const conds = P.opcoesCondicao(this.fase);
          return `se <select data-campo="cond" aria-label="Condição"${d}>${conds.map((c) => opcao(c, CB.rotuloCondicao(c), no.cond)).join('')}</select> então `
            + `<button type="button" class="alternar" data-alternar="${no.id}"${d}>${no.senao ? '− senão' : '+ senão'}</button>`;
        }
        case 'chamar':
          return `executar <select data-campo="proc" aria-label="Procedimento"${d}>${Object.keys(this.programa.procedimentos).sort().map((p) => opcao(p, p, no.proc)).join('')}</select>`;
        case 'definir': {
          let o = '';
          for (let v = 0; v <= 10; v++) o += opcao(String(v), String(v), String(no.valor));
          return `contador = <select data-campo="valor" aria-label="Valor do contador"${d}>${o}</select>`;
        }
        case 'aumentar': return 'aumentar contador';
        default: return esc(no.op);
      }
    }

    chip(id) { return this.raiz.querySelector(`.blk[data-id="${id}"]`); }

    linhaDe(id) {
      const chip = this.chip(id);
      return chip ? chip.parentElement : null;
    }

    /** Destaques da execução: { exec, prox, erro, dica: [ids] } */
    destacar(d) {
      this.destaques = d || {};
      this.aplicarDestaques();
    }

    aplicarDestaques() {
      this.raiz.querySelectorAll('.linha.exec, .linha.prox, .linha.erro, .linha.dica').forEach((l) => l.classList.remove('exec', 'prox', 'erro', 'dica'));
      const d = this.destaques;
      const marcar = (id, cls) => { const l = id && this.linhaDe(id); if (l) l.classList.add(cls); return l; };
      const ativa = marcar(d.erro, 'erro') || marcar(d.exec, 'exec');
      marcar(d.prox, 'prox');
      (d.dica || []).forEach((id) => marcar(id, 'dica'));
      const alvo = ativa || (d.prox && this.linhaDe(d.prox));
      if (alvo && d.rolar !== false) alvo.scrollIntoView({ block: 'nearest' });
    }

    definirBloqueado(b) {
      this.bloqueado = b;
      this.raiz.classList.toggle('editor-bloqueado', b);
      this.raiz.querySelectorAll('.blk select, .blk .alternar').forEach((el) => { el.disabled = b; });
      this.raizPaleta.querySelectorAll('button.blk').forEach((el) => {
        if (!el.closest('.trancada')) el.disabled = b;
      });
    }

    alternarPonto(id) {
      if (!this.fase.ferramentas.includes('pontoDeParada')) return;
      const n = this.linhas.get(id);
      if (this.pontos.has(id)) {
        this.pontos.delete(id);
        this.opcoes.anunciar(`Ponto de parada removido da linha ${n}.`);
      } else {
        this.pontos.add(id);
        this.opcoes.anunciar(`Ponto de parada marcado na linha ${n}.`);
      }
      const bp = this.raiz.querySelector(`.bp[data-bp="${id}"]`);
      if (bp) bp.setAttribute('aria-pressed', String(this.pontos.has(id)));
    }

    // ------------------------------------------------------------ eventos
    ligarEventos() {
      this.raiz.addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-campo]');
        if (!sel) return;
        const id = sel.closest('.blk').dataset.id;
        const campo = sel.dataset.campo;
        const valor = sel.value;
        this.selecionado = id;
        this.focarAposRender = true;
        const mudou = this.alterar((p) => {
          const no = P.encontrar(p, id).no;
          if (campo === 'modo') {
            if (valor.startsWith('a:')) { no.ate = valor.slice(2); delete no.vezes; } else { no.vezes = Number(valor.slice(2)); delete no.ate; }
          } else if (campo === 'valor') {
            no.valor = Number(valor);
          } else {
            no[campo] = valor;
          }
        });
        if (mudou) this.opcoes.anunciar(`Bloco alterado: ${descrever(P.encontrar(this.programa, id).no)}.`);
        const chip = this.chip(id);
        if (chip) chip.focus();
      });

      this.raiz.addEventListener('click', async (e) => {
        const bp = e.target.closest('.bp');
        if (bp) { this.alternarPonto(bp.dataset.bp); return; }
        const alt = e.target.closest('.alternar');
        if (alt) {
          const id = alt.dataset.alternar;
          const no = P.encontrar(this.programa, id).no;
          if (no.senao && no.senao.length && !(await this.opcoes.confirmar('Remover o senão apaga os blocos que estão dentro dele. Continuar?'))) return;
          this.selecionado = id;
          this.focarAposRender = true;
          this.alterar((p) => {
            const n = P.encontrar(p, id).no;
            if (n.senao) delete n.senao; else n.senao = [];
          }, no.senao ? 'Senão removido.' : 'Senão acrescentado.');
        }
      });

      this.raiz.addEventListener('focusin', (e) => {
        const chip = e.target.closest('.blk[data-id]');
        if (chip) this.selecionado = chip.dataset.id;
      });

      this.raiz.addEventListener('pointerdown', (e) => {
        const chip = e.target.closest('.blk[data-id]');
        if (!chip || e.target.closest('select, button')) return;
        this.iniciarPossivelArraste(e, { tipo: 'programa', id: chip.dataset.id }, chip);
      });

      this.raiz.addEventListener('keydown', (e) => this.teclado(e));

      this.raizPaleta.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('button.blk[data-tipo]');
        if (!b || b.disabled) return;
        this.iniciarPossivelArraste(e, { tipo: 'paleta', bloco: b.dataset.tipo }, b);
      });
      this.raizPaleta.addEventListener('click', (e) => {
        const b = e.target.closest('button.blk[data-tipo]');
        if (!b || b.disabled || this.ignorarClique) return;
        this.inserirDaPaleta(b.dataset.tipo);
      });
    }

    inserirDaPaleta(tipo) {
      let caminho = 'principal';
      let indice = this.programa.principal.length;
      const r = this.selecionado && P.encontrar(this.programa, this.selecionado);
      if (r) { caminho = r.lista; indice = r.indice + 1; }
      this.alterar((p) => {
        const no = P.criarNo(tipo, p, this.fase);
        P.inserir(p, caminho, indice, no);
        this.selecionado = no.id;
        this.focarAposRender = true;
      }, 'Bloco adicionado.');
    }

    teclado(e) {
      const chip = e.target.closest('.blk[data-id]');
      if (!chip || e.target.closest('select, button')) return;
      const id = chip.dataset.id;
      const r = P.encontrar(this.programa, id);
      if (!r) return;
      const mover = (caminho, indice, msg) => {
        e.preventDefault();
        this.selecionado = id;
        this.focarAposRender = true;
        this.alterar((p) => P.mover(p, id, caminho, indice), msg);
      };
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const chips = [...this.raiz.querySelectorAll('.blk[data-id]')];
        const i = chips.indexOf(chip);
        const vizinho = chips[i + 1] && !chip.closest('li.item').contains(chips[i + 1]) ? chips[i + 1] : chips[i - 1];
        this.selecionado = vizinho ? vizinho.dataset.id : null;
        this.focarAposRender = true;
        this.alterar((p) => { P.remover(p, id); }, 'Bloco apagado.');
      } else if (e.altKey && e.key === 'ArrowUp') {
        if (r.indice > 0) mover(r.lista, r.indice - 1, 'Bloco movido para cima.');
      } else if (e.altKey && e.key === 'ArrowDown') {
        const lista = P.obterLista(this.programa, r.lista);
        if (r.indice < lista.length - 1) mover(r.lista, r.indice + 2, 'Bloco movido para baixo.');
      } else if (e.altKey && e.key === 'ArrowRight') {
        const lista = P.obterLista(this.programa, r.lista);
        const anterior = lista[r.indice - 1];
        if (anterior && CB.BLOCOS[anterior.op].container) {
          const campo = anterior.op === 'repetir' ? 'corpo' : anterior.senao ? 'senao' : 'entao';
          mover(`${anterior.id}.${campo}`, anterior[campo].length, 'Bloco colocado dentro do bloco de cima.');
        }
      } else if (e.altKey && e.key === 'ArrowLeft') {
        if (r.lista.includes('.')) {
          const pai = P.encontrar(this.programa, r.lista.split('.')[0]);
          mover(pai.lista, pai.indice + 1, 'Bloco tirado de dentro do bloco.');
        }
      } else if (!e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const chips = [...this.raiz.querySelectorAll('.blk[data-id]')];
        const i = chips.indexOf(chip) + (e.key === 'ArrowUp' ? -1 : 1);
        if (chips[i]) chips[i].focus();
      } else if ((e.key === 'b' || e.key === 'B' || e.key === 'F9') && !e.ctrlKey) {
        e.preventDefault();
        this.alternarPonto(id);
      }
    }

    // ------------------------------------------------------------ arrastar e soltar
    iniciarPossivelArraste(e, origem, elemento) {
      if (this.bloqueado || e.button > 0) return;
      const inicio = { x: e.clientX, y: e.clientY };
      let arrastando = false;
      const limpar = () => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        window.removeEventListener('pointercancel', cancelar);
      };
      const mover = (ev) => {
        if (!arrastando) {
          if (Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) < 6) return;
          arrastando = true;
          this.comecarArraste(origem, elemento);
        }
        ev.preventDefault();
        this.moverArraste(ev.clientX, ev.clientY);
      };
      const soltar = (ev) => {
        limpar();
        if (!arrastando) return;
        this.ignorarClique = true;
        setTimeout(() => { this.ignorarClique = false; }, 0);
        this.terminarArraste(ev.clientX, ev.clientY);
      };
      const cancelar = () => {
        limpar();
        if (arrastando) this.encerrarArraste();
      };
      window.addEventListener('pointermove', mover, { passive: false });
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', cancelar);
    }

    comecarArraste(origem, elemento) {
      const fantasma = elemento.cloneNode(true);
      fantasma.classList.add('fantasma-arraste');
      fantasma.removeAttribute('data-id');
      fantasma.querySelectorAll('select, button').forEach((el) => { el.disabled = true; el.tabIndex = -1; });
      document.body.appendChild(fantasma);
      document.body.classList.add('arrastando');
      if (origem.tipo === 'programa') {
        const li = elemento.closest('li.item');
        if (li) li.style.opacity = '.4';
      }
      this.arraste = { origem, fantasma, alvo: null };
    }

    moverArraste(x, y) {
      const a = this.arraste;
      if (!a) return;
      a.fantasma.style.left = (x + 10) + 'px';
      a.fantasma.style.top = (y + 6) + 'px';
      const rolagem = this.raiz.parentElement;
      const area = rolagem.getBoundingClientRect();
      if (x > area.left && x < area.right) {
        if (y < area.top + 28) rolagem.scrollTop -= 12;
        else if (y > area.bottom - 28) rolagem.scrollTop += 12;
      }
      a.alvo = this.calcularAlvo(x, y);
      const ind = this.raiz.querySelector('.indicador');
      if (a.alvo) {
        const base = this.raiz.getBoundingClientRect();
        ind.style.top = (a.alvo.topo - base.top - 2) + 'px';
        ind.style.left = (a.alvo.esquerda - base.left) + 'px';
        ind.style.width = a.alvo.largura + 'px';
        ind.classList.remove('oculto');
      } else {
        ind.classList.add('oculto');
      }
      a.fantasma.classList.toggle('apagar', !a.alvo && a.origem.tipo === 'programa');
    }

    calcularAlvo(x, y) {
      const area = this.raiz.parentElement.getBoundingClientRect();
      if (x < area.left || x > area.right || y < area.top || y > area.bottom) return null;
      const arrastado = this.arraste.origem.tipo === 'programa' ? this.arraste.origem.id : null;
      let melhor = null;
      for (const lista of this.raiz.querySelectorAll('ol.lista')) {
        const dono = lista.closest('li.item');
        if (arrastado && dono && dono.closest(`li.item[data-id="${arrastado}"]`)) continue;
        const r = lista.getBoundingClientRect();
        if (y < r.top - 6 || y > r.bottom + 6 || x < r.left - 14) continue;
        const prof = Number(lista.dataset.prof);
        if (!melhor || prof > melhor.prof) melhor = { lista, prof };
      }
      if (!melhor) {
        // abaixo de tudo: vai para o fim da seção mais próxima
        let menor = Infinity;
        for (const lista of this.raiz.querySelectorAll(':scope > .secao > ol.lista')) {
          const r = lista.getBoundingClientRect();
          const dist = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
          if (dist < menor) { menor = dist; melhor = { lista, prof: 0 }; }
        }
        if (!melhor) return null;
      }
      const itens = [...melhor.lista.children].filter((li) => li.classList.contains('item'));
      let indice = 0;
      itens.forEach((li, i) => {
        const lr = li.querySelector(':scope > .linha').getBoundingClientRect();
        if (y > lr.top + lr.height / 2) indice = i + 1;
      });
      const lr = melhor.lista.getBoundingClientRect();
      let topo;
      if (indice < itens.length) topo = itens[indice].getBoundingClientRect().top;
      else if (itens.length) topo = itens[itens.length - 1].getBoundingClientRect().bottom;
      else topo = (melhor.lista.querySelector('li.vazio') || melhor.lista).getBoundingClientRect().top;
      return { lista: melhor.lista.dataset.lista, indice, topo, esquerda: lr.left, largura: Math.min(lr.width, 280) };
    }

    terminarArraste() {
      const { origem, alvo } = this.arraste;
      this.encerrarArraste();
      if (alvo) {
        if (origem.tipo === 'paleta') {
          this.alterar((p) => {
            const no = P.criarNo(origem.bloco, p, this.fase);
            P.inserir(p, alvo.lista, alvo.indice, no);
            this.selecionado = no.id;
          }, 'Bloco adicionado.');
        } else {
          this.selecionado = origem.id;
          this.alterar((p) => P.mover(p, origem.id, alvo.lista, alvo.indice), 'Bloco movido.');
        }
      } else if (origem.tipo === 'programa') {
        this.alterar((p) => { P.remover(p, origem.id); }, 'Bloco apagado.');
      }
    }

    encerrarArraste() {
      if (!this.arraste) return;
      this.arraste.fantasma.remove();
      document.body.classList.remove('arrastando');
      const ind = this.raiz.querySelector('.indicador');
      if (ind) ind.classList.add('oculto');
      this.raiz.querySelectorAll('li.item').forEach((li) => { li.style.opacity = ''; });
      this.arraste = null;
    }
  }

  Editor.descrever = descrever;
  /** HTML somente leitura de uma lista de blocos (usado no Insetário). */
  Editor.miniHTML = (lista) => `<div class="mini"><ol class="lista">${lista.map(miniNo).join('')}</ol></div>`;

  CB.Editor = Editor;
})(typeof window !== 'undefined' ? window : globalThis);
