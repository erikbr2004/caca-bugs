/*
 * Caça-Bugs — base comum do jogo.
 * Define o espaço de nomes global CB, constantes e rótulos em português.
 * Os arquivos do núcleo funcionam no navegador (scripts clássicos, sem módulos,
 * para abrir o index.html direto do disco) e no Node (para os testes automatizados).
 */
(function (raiz) {
  'use strict';
  const CB = raiz.CB = raiz.CB || {};

  CB.VERSAO = '1.0.4'; // ao mudar, atualize também o "?v=" dos arquivos no index.html
  CB.LIMITE_PASSOS = 1000; // RNF007: interrompe programas que chegam a 1.000 passos

  // Direções no sentido horário: norte, leste, sul, oeste.
  CB.DIRECOES = ['n', 'l', 's', 'o'];
  CB.DELTA = { n: [0, -1], l: [1, 0], s: [0, 1], o: [-1, 0] };
  CB.NOME_DIRECAO = { n: 'norte', l: 'leste', s: 'sul', o: 'oeste' };
  CB.SETA = { n: '↑', l: '→', s: '↓', o: '←' };

  CB.SENSORES = {
    paredeFrente: 'parede à frente',
    caminhoLivre: 'caminho livre à frente',
    sobreCaixa: 'sobre caixa',
    sobreEsteira: 'sobre a esteira',
    segurandoCaixa: 'segurando caixa',
  };

  // Blocos da linguagem. "cat" define a cor e o grupo na paleta.
  CB.BLOCOS = {
    andar: { cat: 'mov', nome: 'andar' },
    virar: { cat: 'mov', nome: 'virar' },
    pegar: { cat: 'act', nome: 'pegar' },
    soltar: { cat: 'act', nome: 'soltar' },
    repetir: { cat: 'rep', nome: 'repetir', container: true },
    se: { cat: 'cond', nome: 'se', container: true },
    chamar: { cat: 'proc', nome: 'executar' },
    definir: { cat: 'var', nome: 'contador =' },
    aumentar: { cat: 'var', nome: 'aumentar contador' },
  };

  CB.FERRAMENTAS = {
    passoAPasso: 'passo a passo',
    pontoDeParada: 'pontos de parada',
    inspetorSensores: 'inspetor de sensores',
    inspetorVariaveis: 'inspetor de variáveis',
  };

  /** Rótulo em português de uma condição ("sobreEsteira", "!caminhoLivre", "contador<2"). */
  CB.rotuloCondicao = function (cond) {
    const negada = cond.startsWith('!');
    const base = negada ? cond.slice(1) : cond;
    const m = /^contador(<|=|>)(\d+)$/.exec(base);
    const texto = m ? `contador ${m[1]} ${m[2]}` : (CB.SENSORES[base] || base);
    return negada ? 'não ' + texto : texto;
  };

  /** Avalia uma condição usando a função de sensores e as variáveis. */
  CB.avaliarCondicao = function (cond, sensor, vars) {
    const negada = cond.startsWith('!');
    const base = negada ? cond.slice(1) : cond;
    const m = /^contador(<|=|>)(\d+)$/.exec(base);
    let v;
    if (m) {
      const n = Number(m[2]);
      const c = vars.contador;
      v = m[1] === '<' ? c < n : m[1] === '=' ? c === n : c > n;
    } else {
      v = sensor(base);
    }
    return negada ? !v : v;
  };

  CB.clonar = (x) => JSON.parse(JSON.stringify(x));

  CB.plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

  if (typeof module !== 'undefined' && module.exports) module.exports = CB;
})(typeof window !== 'undefined' ? window : globalThis);
