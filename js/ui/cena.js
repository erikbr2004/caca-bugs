/* Caça-Bugs — desenho do mapa e animação do robô (RF004). */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const ANGULO = { l: 0, s: 90, o: 180, n: 270 };

  class Cena {
    constructor(elemento) {
      this.el = elemento;
      this.mapa = null;
      this.angulo = 0;
      this.ultimaFoto = null;
    }

    /** Desenha os ladrilhos fixos de um mapa, ajustando o tamanho ao espaço disponível. */
    montar(mapa, espaco) {
      this.mapa = mapa;
      const larguraLivre = Math.max(200, (espaco && espaco.largura) || this.el.clientWidth || 500) - 32;
      const alturaLivre = Math.max(140, (espaco && espaco.altura) || 300);
      this.t = Math.max(26, Math.min(56, Math.floor(Math.min(larguraLivre / mapa.largura, alturaLivre / mapa.altura))));
      const t = this.t;
      let ladrilhos = '';
      mapa.celulas.forEach((tipo) => {
        const cls = tipo === 'parede' ? 'parede' : tipo === 'esteira' ? 'esteira' : '';
        ladrilhos += `<div class="lad ${cls}"></div>`;
      });
      this.el.innerHTML = `
        <div class="mapa-grade" style="width:${mapa.largura * t + 4}px">
          <div class="ladrilhos" style="grid-template-columns:repeat(${mapa.largura},${t}px);grid-auto-rows:${t}px">${ladrilhos}</div>
          <div class="camada camada-rastro"></div>
          <div class="camada camada-caixas"></div>
          <div class="camada camada-robo">
            <div class="robo-mapa" style="width:${t}px;height:${t}px"><div class="giro"></div><span class="carga oculto"></span></div>
          </div>
          <div class="camada camada-erro"></div>
        </div>
        <div class="legenda" aria-hidden="true">
          <span><i style="background:repeating-linear-gradient(135deg,#FACC15 0 4px,#1F2937 4px 8px)"></i>esteira (destino)</span>
          <span><i style="background:#C98A2E"></i>caixa</span>
          <span><i style="background:#BFDBFE;border:2px solid #2563EB;border-radius:50%"></i>rastro</span>
        </div>`;
      this.robo = this.el.querySelector('.robo-mapa');
      this.giro = this.robo.querySelector('.giro');
      this.cargaEl = this.robo.querySelector('.carga');
      this.camadaCaixas = this.el.querySelector('.camada-caixas');
      this.camadaRastro = this.el.querySelector('.camada-rastro');
      this.camadaErro = this.el.querySelector('.camada-erro');
      this.angulo = ANGULO[mapa.roboInicial.dir];
      this.ultimaFoto = null;
      this.caixasDesenhadas = null;
      this.segurandoDesenhado = null;
      this.mostrar({ x: mapa.roboInicial.x, y: mapa.roboInicial.y, dir: mapa.roboInicial.dir, carga: 0, caixas: mapa.caixasIniciais }, { instantaneo: true });
    }

    /**
     * Mostra um estado do mundo.
     * opcoes: { rastro: [[x,y]...], erro: {codigo,x,y}|null, instantaneo: bool, duracao: ms }
     */
    mostrar(foto, opcoes = {}) {
      if (!this.mapa) return;
      const t = this.t;
      const duracao = opcoes.instantaneo ? 0 : Math.max(60, Math.min(260, opcoes.duracao || 220));
      this.robo.style.transitionDuration = duracao + 'ms';
      this.giro.style.transitionDuration = duracao + 'ms';

      // rotação pelo caminho mais curto
      const alvo = ANGULO[foto.dir];
      const atual = ((this.angulo % 360) + 360) % 360;
      let delta = ((alvo - atual + 540) % 360) - 180;
      if (opcoes.instantaneo) delta = alvo - this.angulo;
      this.angulo += delta;
      this.robo.style.transform = `translate(${foto.x * t}px, ${foto.y * t}px)`;
      this.giro.style.transform = `rotate(${this.angulo}deg)`;

      const segurando = foto.carga > 0;
      if (this.segurandoDesenhado !== segurando) {
        this.giro.innerHTML = CB.Icones.roboTopo(segurando);
        const s = Math.round(t * 0.82);
        this.giro.firstElementChild.setAttribute('width', s);
        this.giro.firstElementChild.setAttribute('height', s);
        this.segurandoDesenhado = segurando;
      }
      this.cargaEl.textContent = foto.carga;
      this.cargaEl.classList.toggle('oculto', foto.carga < 2);

      const assinatura = foto.caixas.join(',');
      if (assinatura !== this.caixasDesenhadas) {
        let html = '';
        foto.caixas.forEach((n, i) => {
          if (!n) return;
          const x = i % this.mapa.largura;
          const y = Math.floor(i / this.mapa.largura);
          const s = Math.round(t * 0.62);
          html += `<div class="caixa-mapa" style="left:${x * t}px;top:${y * t}px;width:${t}px;height:${t}px">
            <span style="width:${s}px;height:${s}px;display:flex">${CB.Icones.caixa()}</span>${n > 1 ? `<span class="qtd">${n}</span>` : ''}</div>`;
        });
        this.camadaCaixas.innerHTML = html;
        this.caixasDesenhadas = assinatura;
      }

      if (opcoes.rastro) {
        const d = Math.max(8, Math.round(t * 0.22));
        this.camadaRastro.innerHTML = opcoes.rastro.map(([x, y]) =>
          `<span class="rastro" style="left:${x * t + t / 2}px;top:${y * t + t / 2}px;width:${d}px;height:${d}px"></span>`).join('');
      } else {
        this.camadaRastro.innerHTML = '';
      }

      this.camadaErro.innerHTML = '';
      this.robo.classList.remove('colidiu');
      if (opcoes.erro) {
        const e = opcoes.erro;
        if (e.codigo === 'colisao') {
          const [dx, dy] = CB.DELTA[foto.dir];
          const x = foto.x + dx;
          const y = foto.y + dy;
          this.camadaErro.innerHTML = `<span class="marca-erro" style="left:${x * t}px;top:${y * t}px;width:${t}px;height:${t}px" aria-hidden="true">✗</span>`;
        }
        void this.robo.offsetWidth; // reinicia a animação de tremor
        this.robo.classList.add('colidiu');
      }
      this.ultimaFoto = foto;
    }
  }

  /** Lista de casas visitadas até o evento k (0 = estado inicial). */
  Cena.rastroAte = function (inicial, eventos, k) {
    const casas = [[inicial.x, inicial.y]];
    const vistos = new Set([inicial.x + ',' + inicial.y]);
    for (let i = 0; i < k && i < eventos.length; i++) {
      const f = eventos[i].foto;
      const chave = f.x + ',' + f.y;
      if (!vistos.has(chave)) { vistos.add(chave); casas.push([f.x, f.y]); }
    }
    return casas;
  };

  CB.Cena = Cena;
})(typeof window !== 'undefined' ? window : globalThis);
