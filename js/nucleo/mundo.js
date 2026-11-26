/*
 * Caça-Bugs — o mundo em grade onde o robô trabalha.
 *
 * Símbolos dos mapas (arquivos de fase):
 *   #  parede          .  chão          E  esteira (destino das caixas)
 *   C  uma caixa       2..9  pilha com essa quantidade de caixas
 *   > < ^ v  robô (posição inicial e direção), sempre sobre o chão
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;
  const ROBO = { '>': 'l', '<': 'o', '^': 'n', v: 's' };

  /** Erro causado pelo programa do jogador (colisão, pegar sem caixa...). */
  class ErroExecucao extends Error {
    constructor(codigo, mensagem) {
      super(mensagem);
      this.codigo = codigo;
    }
  }

  /** Converte as linhas de texto de um mapa em uma estrutura de dados. */
  function lerMapa(linhas) {
    if (!Array.isArray(linhas) || linhas.length === 0) throw new Error('Mapa vazio.');
    const altura = linhas.length;
    const largura = Math.max(...linhas.map((l) => l.length));
    const celulas = [];
    const caixas = [];
    let robo = null;
    for (let y = 0; y < altura; y++) {
      for (let x = 0; x < largura; x++) {
        const ch = linhas[y][x] === undefined ? '#' : linhas[y][x];
        let tipo = 'chao';
        let n = 0;
        if (ch === '#') tipo = 'parede';
        else if (ch === 'E') tipo = 'esteira';
        else if (ch === 'C') n = 1;
        else if (/[2-9]/.test(ch)) n = Number(ch);
        else if (ROBO[ch]) {
          if (robo) throw new Error('O mapa tem mais de um robô.');
          robo = { x, y, dir: ROBO[ch] };
        } else if (ch !== '.') {
          throw new Error(`Símbolo desconhecido '${ch}' no mapa (linha ${y + 1}, coluna ${x + 1}).`);
        }
        celulas.push(tipo);
        caixas.push(n);
      }
    }
    if (!robo) throw new Error('O mapa não tem robô (use >, <, ^ ou v).');
    return { largura, altura, celulas, caixasIniciais: caixas, roboInicial: robo, linhas: linhas.slice() };
  }

  class Mundo {
    constructor(mapa, opcoes = {}) {
      this.mapa = mapa;
      this.capacidade = opcoes.capacidade || 1;
      this.x = mapa.roboInicial.x;
      this.y = mapa.roboInicial.y;
      this.dir = mapa.roboInicial.dir;
      this.carga = 0;
      this.caixas = mapa.caixasIniciais.slice();
      this.totalCaixas = this.caixas.reduce((a, b) => a + b, 0);
    }

    indice(x, y) { return y * this.mapa.largura + x; }

    tipo(x, y) {
      if (x < 0 || y < 0 || x >= this.mapa.largura || y >= this.mapa.altura) return 'parede';
      return this.mapa.celulas[this.indice(x, y)];
    }

    frente() {
      const [dx, dy] = CB.DELTA[this.dir];
      return [this.x + dx, this.y + dy];
    }

    sensor(nome) {
      switch (nome) {
        case 'paredeFrente': { const [fx, fy] = this.frente(); return this.tipo(fx, fy) === 'parede'; }
        case 'caminhoLivre': { const [fx, fy] = this.frente(); return this.tipo(fx, fy) !== 'parede'; }
        case 'sobreCaixa': return this.tipo(this.x, this.y) !== 'esteira' && this.caixas[this.indice(this.x, this.y)] > 0;
        case 'sobreEsteira': return this.tipo(this.x, this.y) === 'esteira';
        case 'segurandoCaixa': return this.carga > 0;
        default: throw new Error('Sensor desconhecido: ' + nome);
      }
    }

    andar() {
      const [fx, fy] = this.frente();
      if (this.tipo(fx, fy) === 'parede') throw new ErroExecucao('colisao', 'o robô bateu na parede');
      this.x = fx;
      this.y = fy;
    }

    virar(lado) {
      const i = CB.DIRECOES.indexOf(this.dir);
      this.dir = CB.DIRECOES[(i + (lado === 'direita' ? 1 : 3)) % 4];
    }

    pegar() {
      const i = this.indice(this.x, this.y);
      if (this.tipo(this.x, this.y) === 'esteira' && this.caixas[i] > 0) {
        throw new ErroExecucao('pegarEsteira', 'tentou pegar uma caixa que já estava entregue na esteira');
      }
      if (this.caixas[i] === 0) throw new ErroExecucao('pegarVazio', 'tentou pegar, mas não havia caixa aqui');
      if (this.carga >= this.capacidade) {
        throw new ErroExecucao('pegarCheio', this.capacidade === 1
          ? 'tentou pegar, mas já estava segurando uma caixa'
          : 'tentou pegar, mas o carrinho já estava cheio');
      }
      this.caixas[i]--;
      this.carga++;
    }

    soltar() {
      if (this.carga === 0) throw new ErroExecucao('soltarVazio', 'tentou soltar, mas não estava segurando nenhuma caixa');
      if (this.tipo(this.x, this.y) !== 'esteira') throw new ErroExecucao('soltarFora', 'soltou a caixa fora da esteira');
      this.caixas[this.indice(this.x, this.y)]++;
      this.carga--;
    }

    caixasNaEsteira() {
      let n = 0;
      this.mapa.celulas.forEach((t, i) => { if (t === 'esteira') n += this.caixas[i]; });
      return n;
    }

    /** Cópia compacta do estado, usada no rastro de execução. */
    foto() {
      return { x: this.x, y: this.y, dir: this.dir, carga: this.carga, caixas: this.caixas.slice() };
    }
  }

  /** Confere se a missão foi cumprida ao final do programa. */
  function avaliarObjetivo(objetivo, mundo) {
    const o = objetivo || {};
    const entregues = mundo.caixasNaEsteira();
    if (o.quantidade === undefined || o.quantidade === 'todas') {
      const faltam = mundo.totalCaixas - entregues;
      if (faltam > 0) {
        return { ok: false, codigo: 'missao', mensagem: faltam === 1
          ? 'o programa terminou, mas faltou entregar 1 caixa'
          : `o programa terminou, mas faltaram ${faltam} caixas` };
      }
    } else {
      if (entregues < o.quantidade) {
        return { ok: false, codigo: 'missao', mensagem: `a esteira recebeu ${CB.plural(entregues, 'caixa', 'caixas')}, mas o pedido era de ${o.quantidade}` };
      }
      if (o.exata && entregues > o.quantidade) {
        return { ok: false, codigo: 'excesso', mensagem: `a esteira recebeu ${entregues} caixas, mas o pedido era de só ${o.quantidade}` };
      }
    }
    if (mundo.carga > 0) {
      return { ok: false, codigo: 'carga', mensagem: 'o programa terminou com o robô ainda segurando caixa' };
    }
    if (o.terminarSobre === 'esteira' && !mundo.sensor('sobreEsteira')) {
      return { ok: false, codigo: 'posicao', mensagem: 'o programa terminou, mas o robô não parou sobre a esteira' };
    }
    return { ok: true, codigo: 'ok', mensagem: 'missão cumprida' };
  }

  /** Recria um mundo a partir de uma foto do rastro (usado pelo inspetor de sensores). */
  function mundoEm(mapa, foto, capacidade) {
    const m = new Mundo(mapa, { capacidade });
    m.x = foto.x;
    m.y = foto.y;
    m.dir = foto.dir;
    m.carga = foto.carga;
    m.caixas = foto.caixas.slice();
    return m;
  }

  CB.mundoEm = mundoEm;
  CB.ErroExecucao = ErroExecucao;
  CB.lerMapa = lerMapa;
  CB.Mundo = Mundo;
  CB.avaliarObjetivo = avaliarObjetivo;
})(typeof window !== 'undefined' ? window : globalThis);
