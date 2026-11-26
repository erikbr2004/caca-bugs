/*
 * Caça-Bugs — estrutura dos programas em blocos.
 *
 * Um programa é { principal: [nós], procedimentos: { A: [nós] } }.
 * Cada nó tem um id estável e um "op":
 *   andar | virar(lado) | pegar | soltar
 *   repetir(vezes | ate, corpo) | se(cond, entao, senao?)
 *   chamar(proc) | definir(valor) | aumentar(valor)
 * Condições são textos: "sobreEsteira", "!caminhoLivre", "contador<2".
 *
 * As listas são identificadas por caminhos: "principal", "proc:A",
 * "<id>.corpo", "<id>.entao" e "<id>.senao".
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  function normalizar(p) {
    if (Array.isArray(p)) return { principal: CB.clonar(p), procedimentos: {} };
    return { principal: CB.clonar(p.principal || []), procedimentos: CB.clonar(p.procedimentos || {}) };
  }

  function filhosDe(no) {
    if (no.op === 'repetir') return [['corpo', no.corpo]];
    if (no.op === 'se') return no.senao ? [['entao', no.entao], ['senao', no.senao]] : [['entao', no.entao]];
    return [];
  }

  /** Visita todos os nós em pré-ordem: fn(no, caminhoDaLista, indice, profundidade). */
  function percorrer(prog, fn) {
    const visitar = (lista, caminho, prof) => {
      lista.forEach((no, i) => {
        fn(no, caminho, i, prof);
        for (const [campo, filhos] of filhosDe(no)) visitar(filhos, `${no.id}.${campo}`, prof + 1);
      });
    };
    visitar(prog.principal, 'principal', 0);
    for (const nome of Object.keys(prog.procedimentos).sort()) visitar(prog.procedimentos[nome], 'proc:' + nome, 0);
  }

  function encontrar(prog, id) {
    let r = null;
    percorrer(prog, (no, lista, indice) => { if (!r && no.id === id) r = { no, lista, indice }; });
    return r;
  }

  function obterLista(prog, caminho) {
    if (caminho === 'principal') return prog.principal;
    if (caminho.startsWith('proc:')) return prog.procedimentos[caminho.slice(5)];
    const [id, campo] = caminho.split('.');
    const r = encontrar(prog, id);
    return r ? r.no[campo] : undefined;
  }

  /** O nó (ou algum descendente) tem este id? */
  function contem(no, id) {
    if (no.id === id) return true;
    return filhosDe(no).some(([, filhos]) => filhos.some((f) => contem(f, id)));
  }

  function inserir(prog, caminho, indice, no) {
    const lista = obterLista(prog, caminho);
    if (!lista) throw new Error('Lista inexistente: ' + caminho);
    lista.splice(Math.max(0, Math.min(indice, lista.length)), 0, no);
  }

  function remover(prog, id) {
    const r = encontrar(prog, id);
    if (!r) return null;
    obterLista(prog, r.lista).splice(r.indice, 1);
    return r.no;
  }

  /** Move um nó para outra posição. Devolve false se o destino ficaria dentro dele mesmo. */
  function mover(prog, id, caminho, indice) {
    const r = encontrar(prog, id);
    if (!r) return false;
    if (caminho.includes('.') && contem(r.no, caminho.split('.')[0])) return false;
    obterLista(prog, r.lista).splice(r.indice, 1);
    let i = indice;
    if (r.lista === caminho && r.indice < i) i--;
    inserir(prog, caminho, i, r.no);
    return true;
  }

  function idsDe(prog) {
    const ids = new Set();
    percorrer(prog, (no) => ids.add(no.id));
    return ids;
  }

  function novoId(prog) {
    const ids = idsDe(prog);
    let n = ids.size + 1;
    while (ids.has('n' + n)) n++;
    return 'n' + n;
  }

  function contarBlocos(prog) {
    let n = 0;
    percorrer(prog, () => n++);
    return n;
  }

  /** Número da linha (ordem de exibição) de cada bloco. */
  function numerarLinhas(prog) {
    const linhas = new Map();
    let n = 0;
    percorrer(prog, (no) => linhas.set(no.id, ++n));
    return linhas;
  }

  /** Resumo dos parâmetros de um bloco (sem os filhos), para detectar alterações. */
  function assinatura(no) {
    switch (no.op) {
      case 'virar': return 'virar:' + no.lado;
      case 'repetir': return no.ate !== undefined ? 'repetir:ate:' + no.ate : 'repetir:vezes:' + no.vezes;
      case 'se': return 'se:' + no.cond + (no.senao ? ':senao' : '');
      case 'chamar': return 'chamar:' + no.proc;
      case 'definir': return 'definir:' + no.valor;
      case 'aumentar': return 'aumentar:' + (no.valor === undefined ? 1 : no.valor);
      default: return no.op;
    }
  }

  function indexar(prog) {
    const nos = new Map();
    const listas = new Map();
    percorrer(prog, (no, lista) => {
      nos.set(no.id, { no, lista });
      if (!listas.has(lista)) listas.set(lista, []);
      listas.get(lista).push(no.id);
    });
    return { nos, listas };
  }

  function tamanhoLCS(a, b) {
    const dp = new Array(b.length + 1).fill(0);
    for (const x of a) {
      let anterior = 0;
      for (let j = 1; j <= b.length; j++) {
        const guardado = dp[j];
        dp[j] = x === b[j - 1] ? anterior + 1 : Math.max(dp[j], dp[j - 1]);
        anterior = guardado;
      }
    }
    return dp[b.length];
  }

  /**
   * Quantos blocos foram alterados entre o programa original e o atual:
   * removidos + inseridos + com parâmetro trocado + movidos (de lista ou de ordem).
   */
  function contarAlteracoes(original, atual) {
    const A = indexar(original);
    const B = indexar(atual);
    let n = 0;
    for (const [id, a] of A.nos) {
      const b = B.nos.get(id);
      if (!b) { n++; continue; }
      if (assinatura(a.no) !== assinatura(b.no)) n++;
      if (a.lista !== b.lista) n++;
    }
    for (const id of B.nos.keys()) if (!A.nos.has(id)) n++;
    for (const [lista, idsAtuais] of B.listas) {
      const atuais = idsAtuais.filter((id) => A.nos.has(id) && A.nos.get(id).lista === lista);
      const originais = (A.listas.get(lista) || []).filter((id) => B.nos.has(id) && B.nos.get(id).lista === lista);
      n += atuais.length - tamanhoLCS(originais, atuais);
    }
    return n;
  }

  /** Condições que podem ser escolhidas nesta fase. */
  function opcoesCondicao(fase) {
    const ops = [];
    for (const s of fase.sensores || []) ops.push(s);
    for (const s of fase.sensores || []) ops.push('!' + s);
    if ((fase.blocos || []).includes('definir')) {
      for (let n = 1; n <= 5; n++) ops.push('contador<' + n);
      for (let n = 0; n <= 5; n++) ops.push('contador=' + n);
      for (let n = 0; n <= 4; n++) ops.push('contador>' + n);
    }
    return ops;
  }

  function condicaoValida(cond, fase) {
    return opcoesCondicao(fase).includes(cond);
  }

  /** Confere se o programa só usa blocos, sensores e procedimentos permitidos na fase. */
  function validar(prog, fase) {
    const erros = [];
    const vistos = new Set();
    const permitidos = new Set(fase.blocos || []);
    percorrer(prog, (no) => {
      const onde = `bloco ${no.id || '?'}`;
      if (!no.id) erros.push(`${onde}: sem id`);
      else if (vistos.has(no.id)) erros.push(`${onde}: id repetido`);
      vistos.add(no.id);
      if (!CB.BLOCOS[no.op]) { erros.push(`${onde}: tipo desconhecido "${no.op}"`); return; }
      if (!permitidos.has(no.op)) erros.push(`${onde}: o bloco "${no.op}" não está liberado nesta fase`);
      if (no.op === 'virar' && !['esquerda', 'direita'].includes(no.lado)) erros.push(`${onde}: lado inválido`);
      if (no.op === 'repetir') {
        if (!Array.isArray(no.corpo)) erros.push(`${onde}: repetir sem corpo`);
        if (no.ate !== undefined) {
          if (!condicaoValida(no.ate, fase)) erros.push(`${onde}: condição "${no.ate}" não disponível`);
        } else if (!(Number.isInteger(no.vezes) && no.vezes >= 1 && no.vezes <= 10)) {
          erros.push(`${onde}: número de repetições inválido`);
        }
      }
      if (no.op === 'se') {
        if (!Array.isArray(no.entao)) erros.push(`${onde}: se sem "entao"`);
        if (no.senao !== undefined && !Array.isArray(no.senao)) erros.push(`${onde}: "senao" inválido`);
        if (!condicaoValida(no.cond, fase)) erros.push(`${onde}: condição "${no.cond}" não disponível`);
      }
      if (no.op === 'chamar' && !prog.procedimentos[no.proc]) erros.push(`${onde}: procedimento ${no.proc} não existe`);
      if (no.op === 'definir' && !(Number.isInteger(no.valor) && no.valor >= 0 && no.valor <= 10)) erros.push(`${onde}: valor inválido`);
    });
    return erros;
  }

  /** Cria um bloco novo a partir de um item da paleta. */
  function criarNo(tipo, prog, fase) {
    const id = novoId(prog);
    const cond = (fase.sensores && fase.sensores[0]) || 'contador<1';
    switch (tipo) {
      case 'andar': return { id, op: 'andar' };
      case 'virarEsquerda': return { id, op: 'virar', lado: 'esquerda' };
      case 'virarDireita': return { id, op: 'virar', lado: 'direita' };
      case 'pegar': return { id, op: 'pegar' };
      case 'soltar': return { id, op: 'soltar' };
      case 'repetirVezes': return { id, op: 'repetir', vezes: 2, corpo: [] };
      case 'repetirAte': return { id, op: 'repetir', ate: cond, corpo: [] };
      case 'se': return { id, op: 'se', cond, entao: [] };
      case 'seSenao': return { id, op: 'se', cond, entao: [], senao: [] };
      case 'chamar': return { id, op: 'chamar', proc: Object.keys(prog.procedimentos).sort()[0] || 'A' };
      case 'definir': return { id, op: 'definir', valor: 0 };
      case 'aumentar': return { id, op: 'aumentar', valor: 1 };
      default: throw new Error('Bloco desconhecido: ' + tipo);
    }
  }

  /** Converte o JSON de uma fase na estrutura usada pelo jogo. */
  function prepararFase(json) {
    const fase = CB.clonar(json);
    fase.programa = normalizar(json.programa);
    fase.solucao = json.solucao ? normalizar(json.solucao) : null;
    fase.capacidade = json.capacidade || 1;
    fase.sensores = json.sensores || [];
    fase.ferramentas = json.ferramentas || [];
    fase.cenarios = json.cenarios.map((c, i) => ({ nome: c.nome || `Teste ${i + 1}`, mapa: CB.lerMapa(c.mapa) }));
    return fase;
  }

  CB.Programa = {
    normalizar, filhosDe, percorrer, encontrar, obterLista, contem, inserir, remover, mover,
    novoId, contarBlocos, numerarLinhas, assinatura, contarAlteracoes, opcoesCondicao,
    condicaoValida, validar, criarNo, prepararFase,
  };
})(typeof window !== 'undefined' ? window : globalThis);
