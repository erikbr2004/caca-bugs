/* Arquivo gerado por ferramentas/empacotar-dados.js a partir de dados/*.json. Não edite à mão. */
window.CB_DADOS = {
 "mundos": [
  {
   "numero": 1,
   "nome": "Esteira de Montagem",
   "conceito": "Sequência",
   "cor": "mov",
   "fases": [
    "m1f1",
    "m1f2",
    "m1f3"
   ],
   "novidade": "Ferramenta: passo a passo"
  },
  {
   "numero": 2,
   "nome": "Depósito",
   "conceito": "Repetição",
   "cor": "rep",
   "fases": [
    "m2f1",
    "m2f2",
    "m2f3"
   ],
   "novidade": "Ferramenta nova: pontos de parada"
  },
  {
   "numero": 3,
   "nome": "Sala dos Sensores",
   "conceito": "Seleção",
   "cor": "cond",
   "fases": [
    "m3f1",
    "m3f2",
    "m3f3"
   ],
   "novidade": "Ferramenta nova: inspetor de sensores"
  },
  {
   "numero": 4,
   "nome": "Linha de Produção",
   "conceito": "Procedimentos e variáveis",
   "cor": "proc",
   "fases": [
    "m4f1",
    "m4f2",
    "m4f3"
   ],
   "novidade": "Ferramenta nova: inspetor de variáveis"
  }
 ],
 "insetario": [
  {
   "id": "besouro",
   "nome": "Besouro da Ordem Trocada",
   "cor": "#2563EB",
   "mundos": "Mundo 1",
   "erro": "Instruções certas na ordem errada.",
   "comoReconhecer": "O robô faz as ações certas, mas na hora errada: tenta pegar antes de chegar à caixa ou vira antes do tempo.",
   "comoCorrigir": "Acompanhe o passo a passo e arraste o bloco para o momento em que ele deve acontecer.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "pegar"
     },
     {
      "id": "x2",
      "op": "andar"
     }
    ],
    "depois": [
     {
      "id": "x2",
      "op": "andar"
     },
     {
      "id": "x1",
      "op": "pegar"
     }
    ]
   }
  },
  {
   "id": "grilo",
   "nome": "Grilo Canhoto",
   "cor": "#16A34A",
   "mundos": "Mundo 1",
   "erro": "Giro para o lado errado (esquerda × direita).",
   "comoReconhecer": "O robô vira e logo bate na parede ou segue para o lado oposto ao destino.",
   "comoCorrigir": "Imagine-se no lugar do robô, olhando para onde ele olha, e troque a direção no próprio bloco virar.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "virar",
      "lado": "esquerda"
     },
     {
      "id": "x2",
      "op": "andar"
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "virar",
      "lado": "direita"
     },
     {
      "id": "x2",
      "op": "andar"
     }
    ]
   }
  },
  {
   "id": "formiga",
   "nome": "Formiga do Passo a Mais",
   "cor": "#B91C1C",
   "mundos": "Mundos 1 e 2",
   "erro": "Erro por um: um passo ou uma repetição a mais ou a menos.",
   "comoReconhecer": "O robô passa uma casa do ponto (e às vezes bate na parede) ou para uma casa antes.",
   "comoCorrigir": "Conte as casas no mapa e compare com os passos ou com as voltas mostradas no inspetor.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "repetir",
      "vezes": 5,
      "corpo": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "repetir",
      "vezes": 4,
      "corpo": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ]
   }
  },
  {
   "id": "lagarta",
   "nome": "Lagarta da Contagem Fixa",
   "cor": "#D97706",
   "mundos": "Mundo 2",
   "erro": "Número fixo de repetições onde o tamanho do cenário varia.",
   "comoReconhecer": "O programa passa em um teste e falha nos outros, sempre perto do fim do caminho.",
   "comoCorrigir": "Quando o tamanho muda de um teste para outro, troque o número fixo por repetir até, usando um sensor.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "repetir",
      "vezes": 4,
      "corpo": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "repetir",
      "ate": "sobreEsteira",
      "corpo": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ]
   }
  },
  {
   "id": "cupim",
   "nome": "Cupim do Laço Infinito",
   "cor": "#A16207",
   "mundos": "Mundo 2",
   "erro": "Laço cuja condição de parada nunca acontece.",
   "comoReconhecer": "O robô fica parado (ou andando em círculos) enquanto o número de passos não para de subir.",
   "comoCorrigir": "Garanta que algum bloco dentro do laço aproxime o robô da condição de parada.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "repetir",
      "ate": "sobreEsteira",
      "corpo": []
     },
     {
      "id": "x2",
      "op": "andar"
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "repetir",
      "ate": "sobreEsteira",
      "corpo": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ]
   }
  },
  {
   "id": "traca",
   "nome": "Traça do Escopo",
   "cor": "#64748B",
   "mundos": "Mundos 2 e 3",
   "erro": "Instrução dentro ou fora do bloco errado (laço ou condição).",
   "comoReconhecer": "Uma ação acontece vezes demais, vezes de menos ou em momentos em que não deveria.",
   "comoCorrigir": "Veja o que está encaixado dentro de cada repetir e de cada se, e mova o bloco para o encaixe certo.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "se",
      "cond": "caminhoLivre",
      "entao": [
       {
        "id": "x2",
        "op": "andar"
       }
      ],
      "senao": [
       {
        "id": "x3",
        "op": "virar",
        "lado": "direita"
       }
      ]
     },
     {
      "id": "x4",
      "op": "se",
      "cond": "paredeFrente",
      "entao": [
       {
        "id": "x5",
        "op": "virar",
        "lado": "esquerda"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "se",
      "cond": "caminhoLivre",
      "entao": [
       {
        "id": "x2",
        "op": "andar"
       }
      ],
      "senao": [
       {
        "id": "x3",
        "op": "virar",
        "lado": "direita"
       },
       {
        "id": "x4",
        "op": "se",
        "cond": "paredeFrente",
        "entao": [
         {
          "id": "x5",
          "op": "virar",
          "lado": "esquerda"
         }
        ]
       }
      ]
     }
    ]
   }
  },
  {
   "id": "barata",
   "nome": "Barata da Condição Invertida",
   "cor": "#7C2D12",
   "mundos": "Mundo 3",
   "erro": "Condição com o sentido trocado.",
   "comoReconhecer": "O robô faz exatamente o contrário do esperado: age quando não deveria e não age quando deveria.",
   "comoCorrigir": "Leia a condição em voz alta e confira o sensor no inspetor; troque para a condição oposta.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "se",
      "cond": "!sobreCaixa",
      "entao": [
       {
        "id": "x2",
        "op": "pegar"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "se",
      "cond": "sobreCaixa",
      "entao": [
       {
        "id": "x2",
        "op": "pegar"
       }
      ]
     }
    ]
   }
  },
  {
   "id": "mosquito",
   "nome": "Mosquito do Caso Esquecido",
   "cor": "#334155",
   "mundos": "Mundo 3",
   "erro": "Situação não tratada (falta o senão).",
   "comoReconhecer": "O programa funciona em alguns cenários, mas o robô trava quando aparece uma situação nova.",
   "comoCorrigir": "Pergunte-se: e se a condição for falsa? Acrescente o senão com o que o robô deve fazer.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "se",
      "cond": "caminhoLivre",
      "entao": [
       {
        "id": "x2",
        "op": "andar"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "se",
      "cond": "caminhoLivre",
      "entao": [
       {
        "id": "x2",
        "op": "andar"
       }
      ],
      "senao": [
       {
        "id": "x3",
        "op": "virar",
        "lado": "direita"
       }
      ]
     }
    ]
   }
  },
  {
   "id": "vespa",
   "nome": "Vespa do Procedimento",
   "cor": "#CA8A04",
   "mundos": "Mundo 4",
   "erro": "Erro dentro de um procedimento usado em vários lugares.",
   "comoReconhecer": "O mesmo problema se repete em todos os lugares em que o procedimento é chamado, ou só aparece na segunda chamada.",
   "comoCorrigir": "Corrija dentro do procedimento: uma única correção vale para todas as chamadas.",
   "exemplo": {
    "legenda": "Final do procedimento A",
    "antes": [
     {
      "id": "x1",
      "op": "andar"
     },
     {
      "id": "x2",
      "op": "virar",
      "lado": "esquerda"
     }
    ],
    "depois": [
     {
      "id": "x1",
      "op": "andar"
     },
     {
      "id": "x2",
      "op": "virar",
      "lado": "direita"
     }
    ]
   }
  },
  {
   "id": "joaninha",
   "nome": "Joaninha do Contador",
   "cor": "#DC2626",
   "mundos": "Mundo 4",
   "erro": "Variável com valor inicial errado ou atualizada no lugar errado.",
   "comoReconhecer": "O contador volta a zero, conta demais ou nunca chega ao valor esperado; acompanhe-o no inspetor.",
   "comoCorrigir": "Dê o valor inicial antes do laço e atualize a variável só quando o evento contado acontecer.",
   "exemplo": {
    "antes": [
     {
      "id": "x1",
      "op": "repetir",
      "ate": "sobreEsteira",
      "corpo": [
       {
        "id": "x2",
        "op": "definir",
        "valor": 0
       },
       {
        "id": "x3",
        "op": "aumentar",
        "valor": 1
       },
       {
        "id": "x4",
        "op": "andar"
       }
      ]
     }
    ],
    "depois": [
     {
      "id": "x2",
      "op": "definir",
      "valor": 0
     },
     {
      "id": "x1",
      "op": "repetir",
      "ate": "sobreEsteira",
      "corpo": [
       {
        "id": "x3",
        "op": "aumentar",
        "valor": 1
       },
       {
        "id": "x4",
        "op": "andar"
       }
      ]
     }
    ]
   }
  }
 ],
 "fases": {
  "m1f1": {
   "id": "m1f1",
   "mundo": 1,
   "numero": 1,
   "titulo": "Primeiros passos",
   "missao": "Pegue a caixa e coloque-a na esteira.",
   "tutorial": true,
   "bugs": [
    "besouro"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar"
   ],
   "sensores": [],
   "ferramentas": [
    "passoAPasso"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "#>C..E#",
      "#######"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "pegar"
    },
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b3",
     "op": "andar"
    },
    {
     "id": "b4",
     "op": "andar"
    },
    {
     "id": "b5",
     "op": "andar"
    },
    {
     "id": "b6",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b1",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "andar"
    },
    {
     "id": "b4",
     "op": "andar"
    },
    {
     "id": "b5",
     "op": "andar"
    },
    {
     "id": "b6",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "Execute os testes e observe o primeiro passo do robô. Onde ele está quando tenta pegar a caixa?"
    },
    {
     "texto": "O problema está no bloco “pegar” (linha 1). O robô já está em cima da caixa nesse momento?",
     "destacar": [
      "b1"
     ]
    },
    {
     "texto": "É um Besouro da Ordem Trocada: os blocos certos estão na ordem errada. Arraste o bloco para o momento certo.",
     "bug": "besouro"
    }
   ],
   "explicacao": "O robô tentava pegar a caixa antes de chegar até ela. Ao mover o bloco “pegar” para depois do primeiro “andar”, as instruções ficaram na ordem certa."
  },
  "m1f2": {
   "id": "m1f2",
   "mundo": 1,
   "numero": 2,
   "titulo": "Curva na esteira",
   "missao": "Leve a caixa até a esteira, fazendo a curva no fim do corredor.",
   "bugs": [
    "grilo"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar"
   ],
   "sensores": [],
   "ferramentas": [
    "passoAPasso"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "######",
      "#>.C.#",
      "####.#",
      "####E#",
      "######"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b3",
     "op": "pegar"
    },
    {
     "id": "b4",
     "op": "andar"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b6",
     "op": "andar"
    },
    {
     "id": "b7",
     "op": "andar"
    },
    {
     "id": "b8",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b3",
     "op": "pegar"
    },
    {
     "id": "b4",
     "op": "andar"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "direita"
    },
    {
     "id": "b6",
     "op": "andar"
    },
    {
     "id": "b7",
     "op": "andar"
    },
    {
     "id": "b8",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "Observe o que o robô faz quando chega ao fim do corredor, por volta do passo 5."
    },
    {
     "texto": "Confira o bloco “virar” da linha 5. Olhando na mesma direção que o robô, para que lado fica a esteira?",
     "destacar": [
      "b5"
     ]
    },
    {
     "texto": "É um Grilo Canhoto: o robô virou para o lado errado. Troque a direção no próprio bloco.",
     "bug": "grilo"
    }
   ],
   "explicacao": "O robô virava para a esquerda, mas, do ponto de vista dele, a esteira ficava à direita. Trocar a direção do bloco “virar” corrigiu o caminho."
  },
  "m1f3": {
   "id": "m1f3",
   "mundo": 1,
   "numero": 3,
   "titulo": "Ida e volta",
   "missao": "Busque a caixa no fim do corredor e traga-a de volta até a esteira.",
   "bugs": [
    "formiga"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar"
   ],
   "sensores": [],
   "ferramentas": [
    "passoAPasso"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "#E>..C#",
      "#######"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b3",
     "op": "andar"
    },
    {
     "id": "b4",
     "op": "pegar"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b6",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b7",
     "op": "andar"
    },
    {
     "id": "b8",
     "op": "andar"
    },
    {
     "id": "b9",
     "op": "andar"
    },
    {
     "id": "b10",
     "op": "andar"
    },
    {
     "id": "b11",
     "op": "andar"
    },
    {
     "id": "b12",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "andar"
    },
    {
     "id": "b3",
     "op": "andar"
    },
    {
     "id": "b4",
     "op": "pegar"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b6",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b7",
     "op": "andar"
    },
    {
     "id": "b8",
     "op": "andar"
    },
    {
     "id": "b9",
     "op": "andar"
    },
    {
     "id": "b10",
     "op": "andar"
    },
    {
     "id": "b12",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "O robô chega à esteira, mas não para. Use o passo a passo e conte quantos passos ele dá na volta."
    },
    {
     "texto": "Compare a quantidade de blocos “andar” da volta (linhas 7 a 11) com o número de casas entre a caixa e a esteira.",
     "destacar": [
      "b7",
      "b8",
      "b9",
      "b10",
      "b11"
     ]
    },
    {
     "texto": "É uma Formiga do Passo a Mais: sobrou um passo. Para apagar um bloco, arraste-o para fora do programa.",
     "bug": "formiga"
    }
   ],
   "explicacao": "Na volta havia cinco blocos “andar”, mas a esteira estava a quatro casas da caixa. O passo extra fazia o robô bater na parede."
  },
  "m2f1": {
   "id": "m2f1",
   "mundo": 2,
   "numero": 1,
   "titulo": "Caixa no fim do corredor",
   "missao": "Use o bloco repetir para levar a caixa até a esteira no fim do corredor.",
   "bugs": [
    "formiga"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir"
   ],
   "sensores": [],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "########",
      "#>C...E#",
      "########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "vezes": 5,
     "corpo": [
      {
       "id": "b4",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b5",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "vezes": 4,
     "corpo": [
      {
       "id": "b4",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b5",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "Marque um ponto de parada no bloco “andar” de dentro do laço e avance volta por volta. Em qual volta o robô bate?"
    },
    {
     "texto": "O número de repetições do bloco “repetir” (linha 3) está certo? Conte as casas entre a caixa e a esteira.",
     "destacar": [
      "b3"
     ]
    },
    {
     "texto": "É uma Formiga do Passo a Mais: o laço dá uma volta a mais do que deveria.",
     "bug": "formiga"
    }
   ],
   "explicacao": "O laço repetia 5 vezes, mas a esteira estava a 4 casas da caixa. Com 4 repetições, o robô para exatamente sobre a esteira."
  },
  "m2f2": {
   "id": "m2f2",
   "mundo": 2,
   "numero": 2,
   "titulo": "Corredor das Caixas",
   "missao": "Leve a caixa até a esteira, qualquer que seja o tamanho do corredor.",
   "bugs": [
    "lagarta"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir"
   ],
   "sensores": [
    "sobreEsteira",
    "sobreCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "########",
      "#>C...E#",
      "########"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "##########",
      "#>C.....E#",
      "##########"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "#######",
      "#>C..E#",
      "#######"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "vezes": 4,
     "corpo": [
      {
       "id": "b4",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b5",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b4",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b5",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "O programa passa no Teste 1, mas falha nos outros. Compare o tamanho do corredor em cada teste."
    },
    {
     "texto": "Observe o bloco “repetir 4 vezes” (linha 3) no Teste 2 e no Teste 3. O que muda no corredor de um teste para o outro?",
     "destacar": [
      "b3"
     ]
    },
    {
     "texto": "É uma Lagarta da Contagem Fixa: um número fixo de repetições não serve para corredores de tamanhos diferentes. Experimente repetir até uma condição.",
     "bug": "lagarta"
    }
   ],
   "explicacao": "O programa repetia o passo sempre 4 vezes, mas cada corredor tinha um tamanho. Trocar por “repetir até sobre a esteira” fez o robô funcionar em todos os cenários."
  },
  "m2f3": {
   "id": "m2f3",
   "mundo": 2,
   "numero": 3,
   "titulo": "A esteira que não para",
   "missao": "Busque a caixa no fim do corredor e traga-a até a esteira, em corredores de qualquer tamanho.",
   "bugs": [
    "cupim"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir"
   ],
   "sensores": [
    "sobreEsteira",
    "sobreCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "#E>..C#",
      "#######"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "##########",
      "#E>.....C#",
      "##########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "repetir",
     "ate": "sobreCaixa",
     "corpo": [
      {
       "id": "b2",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b3",
     "op": "pegar"
    },
    {
     "id": "b4",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b6",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": []
    },
    {
     "id": "b7",
     "op": "andar"
    },
    {
     "id": "b8",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "repetir",
     "ate": "sobreCaixa",
     "corpo": [
      {
       "id": "b2",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b3",
     "op": "pegar"
    },
    {
     "id": "b4",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b5",
     "op": "virar",
     "lado": "esquerda"
    },
    {
     "id": "b6",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b7",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b8",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "No passo a passo, observe o robô depois que ele pega a caixa e dá meia-volta: ele continua se mexendo?"
    },
    {
     "texto": "Veja o bloco “repetir até sobre a esteira” (linha 6). O que há dentro dele? Algum bloco ali leva o robô até a esteira?",
     "destacar": [
      "b6"
     ]
    },
    {
     "texto": "É um Cupim do Laço Infinito: a condição de parada nunca acontece, porque nada dentro do laço muda a situação do robô.",
     "bug": "cupim"
    }
   ],
   "explicacao": "O bloco “andar” tinha ficado logo abaixo do laço, e não dentro dele. Com o laço vazio, o robô nunca chegava à esteira e repetia para sempre. Colocar o “andar” dentro do laço resolveu."
  },
  "m3f1": {
   "id": "m3f1",
   "mundo": 3,
   "numero": 1,
   "titulo": "Tem caixa aqui?",
   "missao": "Às vezes há uma caixa logo à frente do robô, às vezes não. Se houver, leve-a até a esteira; em todo caso, termine sobre a esteira.",
   "bugs": [
    "barata"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores"
   ],
   "objetivo": {
    "quantidade": "todas",
    "terminarSobre": "esteira"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "#>C..E#",
      "#######"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "########",
      "#>....E#",
      "########"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "#########",
      "#>C....E#",
      "#########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "se",
     "cond": "!sobreCaixa",
     "entao": [
      {
       "id": "b3",
       "op": "pegar"
      }
     ]
    },
    {
     "id": "b4",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b5",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b6",
     "op": "se",
     "cond": "segurandoCaixa",
     "entao": [
      {
       "id": "b7",
       "op": "soltar"
      }
     ]
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "se",
     "cond": "sobreCaixa",
     "entao": [
      {
       "id": "b3",
       "op": "pegar"
      }
     ]
    },
    {
     "id": "b4",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b5",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b6",
     "op": "se",
     "cond": "segurandoCaixa",
     "entao": [
      {
       "id": "b7",
       "op": "soltar"
      }
     ]
    }
   ],
   "dicas": [
    {
     "texto": "Compare o Teste 1 (com caixa) e o Teste 2 (sem caixa). Em qual deles o robô tenta pegar?"
    },
    {
     "texto": "Observe a condição do bloco “se” da linha 2 e o sensor “sobre caixa” no inspetor, logo depois do primeiro passo.",
     "destacar": [
      "b2"
     ]
    },
    {
     "texto": "É uma Barata da Condição Invertida: a condição está com o sentido trocado.",
     "bug": "barata"
    }
   ],
   "explicacao": "A condição dizia “se não sobre caixa, pegar”: o robô tentava pegar justamente quando não havia caixa. Trocando para “se sobre caixa”, ele só pega quando a caixa existe."
  },
  "m3f2": {
   "id": "m3f2",
   "mundo": 3,
   "numero": 2,
   "titulo": "Curva no corredor",
   "missao": "Leve a caixa até a esteira. O corredor pode ser reto ou fazer uma curva para a direita.",
   "bugs": [
    "mosquito"
   ],
   "metaAlteracoes": 2,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "########",
      "#>C...E#",
      "########"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "#######",
      "#>C...#",
      "#####.#",
      "#####E#",
      "#######"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "#########",
      "#>C.....#",
      "#######.#",
      "#######.#",
      "#######E#",
      "#########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b4",
       "op": "se",
       "cond": "caminhoLivre",
       "entao": [
        {
         "id": "b5",
         "op": "andar"
        }
       ]
      }
     ]
    },
    {
     "id": "b6",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b4",
       "op": "se",
       "cond": "caminhoLivre",
       "entao": [
        {
         "id": "b5",
         "op": "andar"
        }
       ],
       "senao": [
        {
         "id": "s1",
         "op": "virar",
         "lado": "direita"
        }
       ]
      }
     ]
    },
    {
     "id": "b6",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "O Teste 1 passa, mas nos testes com curva o robô para na esquina e não sai mais de lá. Use o passo a passo nessa parte do caminho."
    },
    {
     "texto": "O bloco “se caminho livre à frente” (linha 4) diz o que fazer quando o caminho está livre. E quando não está?",
     "destacar": [
      "b4"
     ]
    },
    {
     "texto": "É um Mosquito do Caso Esquecido: falta tratar a situação em que a condição é falsa. Use o botão “+ senão” do bloco.",
     "bug": "mosquito"
    }
   ],
   "explicacao": "O programa só dizia o que fazer quando o caminho estava livre. Na curva, o caminho fica bloqueado e o robô ficava parado para sempre. O “senão: virar à direita” tratou o caso esquecido."
  },
  "m3f3": {
   "id": "m3f3",
   "mundo": 3,
   "numero": 3,
   "titulo": "Labirinto dos sensores",
   "missao": "Leve a caixa até a esteira por corredores com curvas para a direita e para a esquerda.",
   "bugs": [
    "traca"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "#>C...#",
      "#####.#",
      "#####E#",
      "#######"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "#######",
      "#####E#",
      "#####.#",
      "#>C...#",
      "#######"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "#########",
      "#>C..####",
      "####.####",
      "####...E#",
      "#########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b4",
       "op": "se",
       "cond": "caminhoLivre",
       "entao": [
        {
         "id": "b5",
         "op": "andar"
        }
       ],
       "senao": [
        {
         "id": "b6",
         "op": "virar",
         "lado": "direita"
        }
       ]
      },
      {
       "id": "b7",
       "op": "se",
       "cond": "paredeFrente",
       "entao": [
        {
         "id": "b8",
         "op": "virar",
         "lado": "esquerda"
        },
        {
         "id": "b9",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      }
     ]
    },
    {
     "id": "b10",
     "op": "soltar"
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "andar"
    },
    {
     "id": "b2",
     "op": "pegar"
    },
    {
     "id": "b3",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b4",
       "op": "se",
       "cond": "caminhoLivre",
       "entao": [
        {
         "id": "b5",
         "op": "andar"
        }
       ],
       "senao": [
        {
         "id": "b6",
         "op": "virar",
         "lado": "direita"
        },
        {
         "id": "b7",
         "op": "se",
         "cond": "paredeFrente",
         "entao": [
          {
           "id": "b8",
           "op": "virar",
           "lado": "esquerda"
          },
          {
           "id": "b9",
           "op": "virar",
           "lado": "esquerda"
          }
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "b10",
     "op": "soltar"
    }
   ],
   "dicas": [
    {
     "texto": "Em todos os testes o robô vai e volta sem parar. Use o passo a passo e veja o que acontece logo depois que ele anda até perto de uma parede."
    },
    {
     "texto": "O bloco “se parede à frente” (linha 7) é executado em toda volta do laço. Ele deveria rodar sempre ou só logo depois de o robô virar?",
     "destacar": [
      "b7"
     ]
    },
    {
     "texto": "É uma Traça do Escopo: um bloco está encaixado no lugar errado. Mova-o para dentro do encaixe certo.",
     "bug": "traca"
    }
   ],
   "explicacao": "O teste “se parede à frente” estava fora do “senão”, então rodava em toda volta e fazia o robô dar meia-volta no meio do caminho. Dentro do “senão”, ele só confere a parede depois de virar na curva."
  },
  "m4f1": {
   "id": "m4f1",
   "mundo": 4,
   "numero": 1,
   "titulo": "Montagem em série",
   "missao": "Em cada estação, pegue a caixa de cima e coloque-a na esteira de baixo. O procedimento A faz a entrega em uma estação.",
   "bugs": [
    "vespa"
   ],
   "metaAlteracoes": 1,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se",
    "chamar"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#########",
      "##C#C#C##",
      "#>......#",
      "##E#E#E##",
      "#########"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "#######",
      "##C#C##",
      "#>....#",
      "##E#E##",
      "#######"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "###########",
      "##C#C#C#C##",
      "#>........#",
      "##E#E#E#E##",
      "###########"
     ]
    }
   ],
   "programa": {
    "principal": [
     {
      "id": "b1",
      "op": "repetir",
      "ate": "paredeFrente",
      "corpo": [
       {
        "id": "b2",
        "op": "andar"
       },
       {
        "id": "b3",
        "op": "chamar",
        "proc": "A"
       },
       {
        "id": "b4",
        "op": "andar"
       }
      ]
     }
    ],
    "procedimentos": {
     "A": [
      {
       "id": "a1",
       "op": "virar",
       "lado": "esquerda"
      },
      {
       "id": "a2",
       "op": "andar"
      },
      {
       "id": "a3",
       "op": "pegar"
      },
      {
       "id": "a4",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a5",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a6",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a7",
         "op": "andar"
        }
       ]
      },
      {
       "id": "a8",
       "op": "soltar"
      },
      {
       "id": "a9",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a10",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a11",
       "op": "andar"
      },
      {
       "id": "a12",
       "op": "virar",
       "lado": "esquerda"
      }
     ]
    }
   },
   "solucao": {
    "principal": [
     {
      "id": "b1",
      "op": "repetir",
      "ate": "paredeFrente",
      "corpo": [
       {
        "id": "b2",
        "op": "andar"
       },
       {
        "id": "b3",
        "op": "chamar",
        "proc": "A"
       },
       {
        "id": "b4",
        "op": "andar"
       }
      ]
     }
    ],
    "procedimentos": {
     "A": [
      {
       "id": "a1",
       "op": "virar",
       "lado": "esquerda"
      },
      {
       "id": "a2",
       "op": "andar"
      },
      {
       "id": "a3",
       "op": "pegar"
      },
      {
       "id": "a4",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a5",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a6",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a7",
         "op": "andar"
        }
       ]
      },
      {
       "id": "a8",
       "op": "soltar"
      },
      {
       "id": "a9",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a10",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a11",
       "op": "andar"
      },
      {
       "id": "a12",
       "op": "virar",
       "lado": "direita"
      }
     ]
    }
   },
   "dicas": [
    {
     "texto": "O robô entrega a primeira caixa e depois para. Observe para onde ele está virado logo depois da primeira entrega."
    },
    {
     "texto": "O problema está dentro do procedimento A, que é usado em todas as estações. Para que lado o robô fica virado no fim do procedimento?",
     "destacar": [
      "a11",
      "a12"
     ]
    },
    {
     "texto": "É uma Vespa do Procedimento: um erro dentro do procedimento aparece em todos os lugares em que ele é usado. Corrija uma vez e todas as chamadas melhoram.",
     "bug": "vespa"
    }
   ],
   "explicacao": "O procedimento A terminava com o robô virado para a esquerda, de costas para as próximas estações. Como A é usado em todas as estações, corrigir o último giro uma única vez consertou todas as entregas."
  },
  "m4f2": {
   "id": "m4f2",
   "mundo": 4,
   "numero": 2,
   "titulo": "Contando caixas",
   "missao": "O caminhão só leva 2 caixas. Recolha as 2 primeiras caixas do corredor com o carrinho e entregue exatamente 2 na esteira.",
   "bugs": [
    "joaninha"
   ],
   "metaAlteracoes": 1,
   "capacidade": 3,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se",
    "definir",
    "aumentar"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores",
    "inspetorVariaveis"
   ],
   "objetivo": {
    "quantidade": 2,
    "exata": true
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "##########",
      "#>C.C.C.E#",
      "##########"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "#########",
      "#>.CC..E#",
      "#########"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "###########",
      "#>CCCC...E#",
      "###########"
     ]
    }
   ],
   "programa": [
    {
     "id": "b2",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b1",
       "op": "definir",
       "valor": 0
      },
      {
       "id": "b3",
       "op": "se",
       "cond": "sobreCaixa",
       "entao": [
        {
         "id": "b4",
         "op": "se",
         "cond": "contador<2",
         "entao": [
          {
           "id": "b5",
           "op": "pegar"
          },
          {
           "id": "b6",
           "op": "aumentar",
           "valor": 1
          }
         ]
        }
       ]
      },
      {
       "id": "b7",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b8",
     "op": "repetir",
     "ate": "!segurandoCaixa",
     "corpo": [
      {
       "id": "b9",
       "op": "soltar"
      }
     ]
    }
   ],
   "solucao": [
    {
     "id": "b1",
     "op": "definir",
     "valor": 0
    },
    {
     "id": "b2",
     "op": "repetir",
     "ate": "sobreEsteira",
     "corpo": [
      {
       "id": "b3",
       "op": "se",
       "cond": "sobreCaixa",
       "entao": [
        {
         "id": "b4",
         "op": "se",
         "cond": "contador<2",
         "entao": [
          {
           "id": "b5",
           "op": "pegar"
          },
          {
           "id": "b6",
           "op": "aumentar",
           "valor": 1
          }
         ]
        }
       ]
      },
      {
       "id": "b7",
       "op": "andar"
      }
     ]
    },
    {
     "id": "b8",
     "op": "repetir",
     "ate": "!segurandoCaixa",
     "corpo": [
      {
       "id": "b9",
       "op": "soltar"
      }
     ]
    }
   ],
   "dicas": [
    {
     "texto": "Abra o inspetor de variáveis no passo a passo e observe o valor do contador a cada volta do laço."
    },
    {
     "texto": "O bloco “contador = 0” (linha 2) está dentro do laço. O que acontece com a contagem a cada volta?",
     "destacar": [
      "b1"
     ]
    },
    {
     "texto": "É uma Joaninha do Contador: a variável recebe o valor inicial no lugar errado.",
     "bug": "joaninha"
    }
   ],
   "explicacao": "O bloco “contador = 0” estava dentro do laço e zerava a contagem a cada volta, então o robô recolhia todas as caixas. Colocado antes do laço, o contador chega a 2 e o robô para de recolher."
  },
  "m4f3": {
   "id": "m4f3",
   "mundo": 4,
   "numero": 3,
   "titulo": "Ninho de bugs",
   "missao": "A linha de produção final está com vários bugs ao mesmo tempo. Faça as entregas funcionarem com qualquer número de estações.",
   "bugs": [
    "besouro",
    "grilo",
    "lagarta"
   ],
   "metaAlteracoes": 3,
   "blocos": [
    "andar",
    "virar",
    "pegar",
    "soltar",
    "repetir",
    "se",
    "chamar",
    "definir",
    "aumentar"
   ],
   "sensores": [
    "sobreCaixa",
    "sobreEsteira",
    "segurandoCaixa",
    "paredeFrente",
    "caminhoLivre"
   ],
   "ferramentas": [
    "passoAPasso",
    "pontoDeParada",
    "inspetorSensores",
    "inspetorVariaveis"
   ],
   "objetivo": {
    "quantidade": "todas"
   },
   "cenarios": [
    {
     "nome": "Teste 1",
     "mapa": [
      "#######",
      "##C#C##",
      "#>....#",
      "##E#E##",
      "#######"
     ]
    },
    {
     "nome": "Teste 2",
     "mapa": [
      "#########",
      "##C#C#C##",
      "#>......#",
      "##E#E#E##",
      "#########"
     ]
    },
    {
     "nome": "Teste 3",
     "mapa": [
      "###########",
      "##C#C#C#C##",
      "#>........#",
      "##E#E#E#E##",
      "###########"
     ]
    }
   ],
   "programa": {
    "principal": [
     {
      "id": "b1",
      "op": "repetir",
      "vezes": 3,
      "corpo": [
       {
        "id": "b2",
        "op": "andar"
       },
       {
        "id": "b3",
        "op": "chamar",
        "proc": "A"
       },
       {
        "id": "b4",
        "op": "andar"
       }
      ]
     }
    ],
    "procedimentos": {
     "A": [
      {
       "id": "a1",
       "op": "virar",
       "lado": "esquerda"
      },
      {
       "id": "a3",
       "op": "pegar"
      },
      {
       "id": "a2",
       "op": "andar"
      },
      {
       "id": "a4",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a5",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a6",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a7",
         "op": "andar"
        }
       ]
      },
      {
       "id": "a8",
       "op": "soltar"
      },
      {
       "id": "a9",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a10",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a11",
       "op": "andar"
      },
      {
       "id": "a12",
       "op": "virar",
       "lado": "esquerda"
      }
     ]
    }
   },
   "solucao": {
    "principal": [
     {
      "id": "b1",
      "op": "repetir",
      "ate": "paredeFrente",
      "corpo": [
       {
        "id": "b2",
        "op": "andar"
       },
       {
        "id": "b3",
        "op": "chamar",
        "proc": "A"
       },
       {
        "id": "b4",
        "op": "andar"
       }
      ]
     }
    ],
    "procedimentos": {
     "A": [
      {
       "id": "a1",
       "op": "virar",
       "lado": "esquerda"
      },
      {
       "id": "a2",
       "op": "andar"
      },
      {
       "id": "a3",
       "op": "pegar"
      },
      {
       "id": "a4",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a5",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a6",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a7",
         "op": "andar"
        }
       ]
      },
      {
       "id": "a8",
       "op": "soltar"
      },
      {
       "id": "a9",
       "op": "repetir",
       "vezes": 2,
       "corpo": [
        {
         "id": "a10",
         "op": "virar",
         "lado": "esquerda"
        }
       ]
      },
      {
       "id": "a11",
       "op": "andar"
      },
      {
       "id": "a12",
       "op": "virar",
       "lado": "direita"
      }
     ]
    }
   },
   "dicas": [
    {
     "texto": "Há mais de um bug! Corrija o primeiro erro que aparecer no passo a passo, teste de novo e siga para o próximo."
    },
    {
     "texto": "Procure dentro do procedimento A (a ordem dos primeiros blocos e o último giro) e também no laço principal (linha 1).",
     "destacar": [
      "a3",
      "a12",
      "b1"
     ]
    },
    {
     "texto": "Neste ninho há um Besouro da Ordem Trocada, um Grilo Canhoto e uma Lagarta da Contagem Fixa.",
     "bug": "besouro"
    }
   ],
   "explicacao": "Três bugs estavam escondidos juntos. No procedimento A, o robô tentava pegar antes de chegar à caixa (Besouro) e terminava virado para o lado errado (Grilo). No programa principal, o laço repetia sempre 3 vezes, mas o número de estações mudava de um teste para outro (Lagarta)."
  }
 }
};
