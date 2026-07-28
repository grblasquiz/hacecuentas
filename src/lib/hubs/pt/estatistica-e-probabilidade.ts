import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Qual é a chance disso acontecer?"
 *
 * Absorve as calculadoras soltas de estatística descritiva, contagem e
 * probabilidade do mercado BR. Não é dinheiro: TODAS as linhas usam format
 * 'plain' ou 'unit'.
 */

export const hub: HubData = {
  slug: 'pt/matematica/estatistica-e-probabilidade',
  title: 'Desvio padrão, combinações e probabilidade binomial em uma conta só',
  description:
    'Média, variância e desvio padrão (populacional ou amostral) de um conjunto de dados, permutações e combinações de n elementos tomados k a k, e a probabilidade de obter exatamente, no máximo ou no mínimo k sucessos em n tentativas.',
  silo: 'Matemática',
  siloHref: '/pt/matematica',
  locale: 'pt',

  eyebrow: 'Matemática · estatística e probabilidade',
  h1: 'Qual é a chance disso acontecer?',
  lede:
    'Toda pergunta de probabilidade começa em um destes três lugares: quão espalhados estão os meus dados, de quantos jeitos isso pode sair, e qual a chance de acontecer k vezes em n tentativas. As três contas usam o mesmo maquinário e quase sempre aparecem juntas — aqui elas estão na mesma página, com a fórmula à mostra.',
  stamps: [
    'Desvio padrão populacional e amostral · arranjos e combinações · distribuição binomial',
    'Aceita vírgula decimal e ponto e vírgula como separador',
    '4 calculadoras dentro',
  ],

  resultLabel: 'Resultado do cálculo',

  cases: {
    title: 'Que pergunta você está fazendo?',
    intro:
      'Escolha o tipo de conta. Cada caso usa só os campos de que precisa — os outros ficam de fora.',
    items: [
      {
        id: 'dispersao',
        label: 'Quão espalhados estão os meus dados?',
        hint: 'Média, variância, desvio padrão e coeficiente de variação',
        answer:
          'O desvio padrão diz, em média, o quanto cada dado se afasta da média — na mesma unidade dos dados.',
        yes: [
          'Média aritmética do conjunto',
          'Variância: média dos quadrados dos desvios, dividida por N (população) ou por N−1 (amostra)',
          'Desvio padrão: a raiz quadrada da variância, na unidade original dos dados',
          'Coeficiente de variação = desvio padrão ÷ média, que permite comparar conjuntos de escalas diferentes',
          'Quantos dados caem dentro de um desvio padrão da média',
          'Mínimo, máximo, amplitude e mediana',
        ],
        warn: [
          'Dividir por N−1 (correção de Bessel) é obrigatório quando os dados são uma AMOSTRA de um universo maior; dividir por N só vale quando você tem a população inteira',
          'O desvio padrão é sensível a valores extremos: um único ponto fora da curva pode dobrá-lo — olhe também a mediana',
          'O coeficiente de variação não faz sentido quando a média está perto de zero ou é negativa',
        ],
        plazo:
          'com N−1 o desvio padrão sempre sai um pouco maior que com N, e a diferença desaparece conforme a amostra cresce.',
      },
      {
        id: 'contagem',
        label: 'De quantas maneiras isso pode sair?',
        hint: 'Arranjos (com ordem) e combinações (sem ordem)',
        answer:
          'Se a ordem importa é arranjo; se não importa é combinação, e a combinação é sempre menor.',
        yes: [
          'Arranjo A(n,k) = n! ÷ (n−k)!, quando a ordem dos escolhidos importa',
          'Combinação C(n,k) = n! ÷ (k! × (n−k)!), quando a ordem não importa',
          'Permutação de todos os n elementos, que é o caso A(n,n) = n!',
          'Arranjos com repetição, quando cada posição pode repetir os elementos',
          'Quantas ordenações extras o arranjo tem em relação à combinação',
        ],
        warn: [
          'k tem de estar entre 0 e n: não dá para escolher mais elementos do que existem',
          'Fatoriais crescem muito rápido — acima de n = 170 o resultado ultrapassa o maior número que o navegador representa e vira infinito',
          'Sorteios como a Mega-Sena são combinações (a ordem das dezenas não importa); senha de cofre é arranjo com repetição',
        ],
        plazo:
          'a relação entre os dois é fixa: A(n,k) = C(n,k) × k!, porque cada combinação pode ser ordenada de k! maneiras.',
      },
      {
        id: 'binomial',
        label: 'Qual a chance de acontecer k vezes em n tentativas?',
        hint: 'Distribuição binomial · exatamente, no máximo ou no mínimo k',
        answer:
          'P(X = k) = C(n,k) × p^k × (1−p)^(n−k): a chance de exatamente k sucessos em n tentativas independentes.',
        yes: [
          'Probabilidade pontual de exatamente k sucessos',
          'Probabilidade acumulada de no máximo k e de pelo menos k sucessos',
          'Média esperada (n × p) e desvio padrão da distribuição (√(n × p × (1−p)))',
          'A chance de pelo menos um sucesso, que é 1 − (1−p)^n',
        ],
        warn: [
          'A binomial exige tentativas INDEPENDENTES e com a mesma probabilidade p em todas — sorteio sem reposição não é binomial, é hipergeométrica',
          'p é uma probabilidade entre 0 e 1: 50% se escreve 0,5. Informar 50 não é o mesmo que informar 0,5',
          'Nenhum resultado aqui prevê o próximo sorteio: em eventos independentes, o que saiu antes não muda a chance do que vem depois',
        ],
        plazo:
          'quando n é grande e p não é extremo, a binomial se aproxima de uma normal de média n×p — é o que sustenta as margens de erro de pesquisa eleitoral.',
      },
    ],
  },

  inputsTitle: 'Os seus números',
  inputsIntro:
    'Preencha o que o seu caso pede. A lista de dados aceita vírgula, ponto e vírgula, espaço ou quebra de linha como separador.',

  fields: [
    {
      id: 'dados',
      label: 'Conjunto de dados',
      type: 'text',
      value: '2; 4; 4; 4; 5; 5; 7; 9',
      help: 'Separe por ponto e vírgula quando usar vírgula decimal (2,5; 3,1). Vírgula, espaço e quebra de linha também funcionam como separador.',
    },
    {
      id: 'tipoAmostra',
      label: 'Os dados são',
      type: 'select',
      value: 'populacao',
      options: [
        { value: 'populacao', label: 'A população inteira (divide por N)' },
        { value: 'amostra', label: 'Uma amostra (divide por N−1)' },
      ],
    },
    { id: 'n', label: 'n — total de elementos ou de tentativas', type: 'number', value: 10, min: 0, max: 1000, step: 1 },
    { id: 'k', label: 'k — quantos você escolhe ou quantos sucessos', type: 'number', value: 3, min: 0, max: 1000, step: 1 },
    {
      id: 'ordem',
      label: 'Na contagem, a ordem',
      type: 'select',
      value: 'importa',
      options: [
        { value: 'importa', label: 'Importa — arranjo A(n,k)' },
        { value: 'naoimporta', label: 'Não importa — combinação C(n,k)' },
        { value: 'repeticao', label: 'Importa e pode repetir — n^k' },
      ],
    },
    { id: 'p', label: 'p — probabilidade de sucesso em cada tentativa', type: 'number', value: 0.5, min: 0, max: 1, step: 0.001, help: 'Entre 0 e 1. Meio a meio é 0,5; 30% é 0,3.' },
    {
      id: 'modoBinomial',
      label: 'Você quer a chance de',
      type: 'select',
      value: 'exato',
      options: [
        { value: 'exato', label: 'Exatamente k sucessos' },
        { value: 'atek', label: 'No máximo k sucessos' },
        { value: 'pelomenos', label: 'Pelo menos k sucessos' },
      ],
    },
  ],

  fineprint:
    'Conta de estatística, não de dinheiro: todos os valores saem como números puros, percentuais ou unidades — nunca em reais. As fórmulas ficam visíveis em cada linha para você refazer na mão.',

  chart: {
    type: 'bars',
    title: 'Como o resultado se reparte',
    caption:
      'Na dispersão, as fatias mostram quantos dados caem dentro e fora de um desvio padrão da média. Na contagem, quanto do total de arranjos vem das combinações e quanto vem só de reordenar. Na binomial, as três fatias são a probabilidade de menos, de exatamente e de mais que k sucessos — juntas somam 100%.',
  },

  breakdownTitle: 'A conta, aberta',
  breakdownIntro:
    'Cada linha traz a fórmula que gerou o número, com o denominador que foi usado e a razão dele.',

  faq: [
    {
      q: 'Quando eu divido por N e quando divido por N−1?',
      a: 'Divide por N quando os dados que você tem são a população inteira — as notas de todos os alunos daquela turma, o salário de todos os funcionários daquela empresa. Divide por N−1 quando eles são uma amostra usada para estimar o comportamento de um universo maior. A correção de Bessel (o N−1) existe porque a média da amostra já foi calculada a partir dos próprios dados e "puxa" os desvios para baixo, subestimando a variância real. Dividir por N−1 corrige esse viés. Na dúvida, se você pretende generalizar o resultado, use N−1.',
    },
    {
      q: 'Qual a diferença entre variância e desvio padrão?',
      a: 'A variância é a média dos quadrados dos desvios em relação à média; o desvio padrão é a raiz quadrada dela. Eles carregam a mesma informação, mas o desvio padrão está na unidade original dos dados — se os dados são reais, o desvio padrão é em reais e a variância é em "reais ao quadrado", que não significa nada intuitivo. Por isso a variância aparece nas contas intermediárias e nas demonstrações, e o desvio padrão aparece nos relatórios.',
    },
    {
      q: 'O que é coeficiente de variação e para que serve?',
      a: 'É o desvio padrão dividido pela média, geralmente em porcentagem. Serve para comparar a dispersão de conjuntos com escalas diferentes: um desvio padrão de 10 é enorme se a média é 20 e é irrelevante se a média é 10.000. Como referência prática usada em muitas áreas, abaixo de 15% costuma indicar dados homogêneos, entre 15% e 30% dispersão moderada, e acima de 30% dispersão alta. Não use o coeficiente quando a média estiver perto de zero ou for negativa, porque ele explode ou muda de sinal.',
    },
    {
      q: 'Arranjo e combinação: como não confundir?',
      a: 'Pergunte se trocar a ordem gera um resultado diferente. Pódio de uma corrida: ouro, prata e bronze em ordens diferentes são resultados diferentes, então é arranjo. Comissão de três pessoas escolhidas entre dez: quem entrou primeiro não muda nada, então é combinação. A relação entre os dois é A(n,k) = C(n,k) × k!, porque cada grupo de k pessoas pode ser ordenado de k! maneiras. Por isso o arranjo é sempre maior ou igual à combinação.',
    },
    {
      q: 'Qual a chance de acertar a Mega-Sena?',
      a: 'É uma combinação: escolhem-se 6 dezenas entre 60 e a ordem não importa. C(60,6) = 50.063.860, então um jogo simples tem uma chance em 50.063.860, cerca de 0,000002%. Como cada sorteio é independente, jogar os mesmos números todas as semanas não aumenta a chance de nenhum deles — só aumenta o número de tentativas. E números "atrasados" não ficam mais prováveis: a bola não tem memória.',
    },
    {
      q: 'Quando a distribuição binomial se aplica de verdade?',
      a: 'Quando quatro condições valem ao mesmo tempo: o número de tentativas é fixo, cada tentativa tem só dois resultados possíveis (sucesso e fracasso), a probabilidade de sucesso é a mesma em todas as tentativas, e as tentativas são independentes entre si. Jogar uma moeda dez vezes se encaixa. Tirar cinco cartas de um baralho sem devolver não se encaixa, porque a probabilidade muda a cada carta retirada — esse caso é a distribuição hipergeométrica.',
    },
    {
      q: 'Como calculo "pelo menos um sucesso"?',
      a: 'Pelo complemento, que é muito mais rápido: a chance de pelo menos um sucesso é 1 menos a chance de nenhum, ou seja 1 − (1−p)^n. Se um teste falha 10% das vezes e você o roda 20 vezes, a chance de nunca falhar é 0,9^20 ≈ 12,2%, então a chance de pelo menos uma falha é cerca de 87,8%. É esse cálculo que explica por que bugs raros aparecem sempre em produção: basta rodar muitas vezes.',
    },
    {
      q: 'Por que p tem de ser um número entre 0 e 1 e não uma porcentagem?',
      a: 'Porque a fórmula eleva p à potência k e multiplica por (1−p) elevado a (n−k). Com p = 50 em vez de 0,5, o termo (1−p) fica negativo e o resultado perde qualquer sentido — pode até dar probabilidade maior que 1 ou negativa. Converta sempre dividindo por 100: 5% é 0,05, 30% é 0,3, 99% é 0,99. Esta conta rejeita valores fora do intervalo em vez de devolver um número errado.',
    },
    {
      q: 'O que a média e o desvio padrão de uma binomial significam?',
      a: 'A média n × p é quantos sucessos você esperaria em média se repetisse o experimento inteiro muitas vezes. O desvio padrão √(n × p × (1−p)) mede o quanto o resultado costuma se afastar dessa média. Em 100 lançamentos de uma moeda honesta, a média é 50 e o desvio padrão é 5 — então resultados entre 45 e 55 são comuns, entre 40 e 60 ainda são normais, e algo como 70 caras seria muito improvável e sugeriria moeda viciada.',
    },
    {
      q: 'Por que o fatorial de números grandes dá infinito?',
      a: 'Porque cresce mais rápido que qualquer exponencial: 20! já passa de 2 quintilhões e 171! ultrapassa o maior número que o padrão de ponto flutuante do navegador consegue representar, virando "Infinity". Por isso esta conta calcula arranjos e combinações pelo produto encurtado — C(n,k) multiplica e divide alternadamente em vez de calcular três fatoriais gigantes e dividir no fim. Assim C(60,6) sai exato, sem estourar.',
    },
    {
      q: 'A minha lista tem vírgula decimal. Como escrevo?',
      a: 'Use ponto e vírgula para separar os dados: "2,5; 3,75; 4,2". Se você separar tudo por vírgula, a conta trata cada vírgula como separador de dados, e "2,5" viraria dois números, 2 e 5. Espaço e quebra de linha também funcionam como separador, então colar uma coluna do Excel direto no campo funciona. Esta era a principal armadilha das calculadoras antigas de desvio padrão, que só aceitavam vírgula como separador — justamente o caractere que o Brasil usa como decimal.',
    },
    {
      q: 'Desvio padrão alto significa que os dados estão errados?',
      a: 'Não. Significa que há variabilidade real, e às vezes é exatamente isso que você quer medir: a dispersão dos salários de um setor, a variação de temperatura de um processo, o tempo de resposta de um servidor. O que um desvio padrão muito alto pede é uma olhada nos extremos — verifique se não há erro de digitação, unidade trocada ou um valor de outro contexto misturado. Comparar média com mediana ajuda: se as duas estão muito distantes, provavelmente há valores extremos puxando a média.',
    },
  ],

  sources: [
    {
      name: 'Base Nacional Comum Curricular — Matemática (estatística e probabilidade)',
      url: 'http://basenacionalcomum.mec.gov.br/abase/',
      publisher: 'Ministério da Educação',
    },
    {
      name: 'NIST/SEMATECH e-Handbook of Statistical Methods — medidas de dispersão e distribuição binomial',
      url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda35.htm',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'Probabilidades da Mega-Sena e demais loterias',
      url: 'https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx',
      publisher: 'Caixa Econômica Federal',
    },
    {
      name: 'IBGE — conceitos de população e amostra nas pesquisas domiciliares',
      url: 'https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html',
      publisher: 'Instituto Brasileiro de Geografia e Estatística',
    },
  ],

  replaces: [
    '/pt/desvio-padrao-variancia',
    '/pt/permutacoes-n-escolhidos-k',
    '/pt/probabilidade-binomial-ensaios-sucessos',
    // Absorvida só por URL (301): sequências e séries, não probabilidade. Ver relatório.
    '/pt/progressao-geometrica-soma-termo',
  ],

  lastReviewed: '2026-07-28',
};
