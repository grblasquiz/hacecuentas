import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Poupança, CDB, Tesouro ou FII?"
 *
 * Absorve 7 calculadoras soltas de investimento. Todas as tabelas de imposto
 * saem de lei citada no comentário de cada constante; nada de memória. O que
 * é preço de mercado (Selic, CDI, IPCA, juro real do IPCA+, dividend yield)
 * é campo editável, porque muda todo dia e o projeto não tem fonte viva.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. Rentabilidade passada não garante rentabilidade futura, as taxas de mercado mudam todos os dias e a tributação depende do produto e do prazo efetivo; confira a lâmina do investimento e, se for o caso, procure um profissional certificado antes de decidir.';

/**
 * IR regressivo de renda fixa — art. 1º da Lei 11.033/2004.
 * Os prazos são contados em DIAS CORRIDOS entre a aplicação e o resgate.
 */
export const IR_REGRESSIVO = [
  { ateDias: 180, aliquota: 0.225 },
  { ateDias: 360, aliquota: 0.2 },
  { ateDias: 720, aliquota: 0.175 },
  { ateDias: null as number | null, aliquota: 0.15 },
];

/**
 * IOF regressivo dos 30 primeiros dias — anexo do Decreto 6.306/2007.
 * Índice 0 = 1º dia (96% do rendimento). A partir do 30º dia, zero.
 */
export const IOF_TABELA = [
  0.96, 0.93, 0.9, 0.86, 0.83, 0.8, 0.76, 0.73, 0.7, 0.66, 0.63, 0.6, 0.56, 0.53, 0.5, 0.46, 0.43,
  0.4, 0.36, 0.33, 0.3, 0.26, 0.23, 0.2, 0.16, 0.13, 0.1, 0.06, 0.03, 0.0,
];

/**
 * Tabela regressiva da previdência privada — art. 1º da Lei 11.053/2004.
 * A alíquota é a do prazo de CADA aporte, não a do plano.
 */
export const IR_PREVIDENCIA = [
  { ateAnos: 2, aliquota: 0.35 },
  { ateAnos: 4, aliquota: 0.3 },
  { ateAnos: 6, aliquota: 0.25 },
  { ateAnos: 8, aliquota: 0.2 },
  { ateAnos: 10, aliquota: 0.15 },
  { ateAnos: null as number | null, aliquota: 0.1 },
];

/** Regra da poupança — art. 12 da Lei 8.177/1991 com a redação da Lei 12.703/2012. */
export const POUPANCA = {
  /** Selic meta acima disso: 0,5% ao mês + TR. */
  selicGatilho: 0.085,
  taxaMensalCheia: 0.005,
  /** Selic meta igual ou abaixo do gatilho: 70% da Selic + TR. */
  fracaoSelic: 0.7,
};

/** Taxa de custódia da B3 no Tesouro Direto, sobre o valor mantido em conta. */
export const CUSTODIA_B3 = 0.002;

/** Convenção de mercado: o CDI roda cerca de 0,10 p.p. abaixo da Selic meta. */
export const SPREAD_CDI_SELIC = 0.001;

/** Teto de dedução do PGBL na declaração completa — art. 11 da Lei 9.532/1997. */
export const PGBL_TETO_DEDUCAO = 0.12;

/** IR sobre ganho de capital na venda de cotas de FII — art. 18 da Lei 8.668/1993. */
export const FII_IR_GANHO = 0.2;

/** Dias de um mês médio, para converter prazo em meses no prazo em dias do IR. */
export const DIAS_POR_MES = 30.4375;

export const hub: HubData = {
  slug: 'pt/dinheiro/investir-renda-fixa',
  title: 'Poupança, CDB, Tesouro ou FII: onde rende mais depois do imposto?',
  description:
    'Compare poupança, CDB, Tesouro Selic, Tesouro IPCA+, FII e previdência privada com IR regressivo, IOF dos 30 primeiros dias, custódia da B3 e a dedução de 12% do PGBL, tudo no líquido.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · renda fixa e fundos imobiliários',
  h1: 'Onde colocar o dinheiro, considerando o que o imposto leva.',
  lede:
    'Comparar rentabilidade bruta é o jeito mais rápido de escolher errado. A poupança é isenta e rende pouco; o CDB rende mais e paga IR de até 22,5%; o Tesouro tem custódia; o FII distribui rendimento isento mas cobra 20% no ganho da venda. Esta conta coloca todos no mesmo campo: quanto sobra na sua mão no fim do prazo.',
  stamps: [
    'IR regressivo da Lei 11.033/2004 · IOF do Decreto 6.306/2007',
    'Poupança pela Lei 8.177/1991 · PGBL pelo art. 11 da Lei 9.532/1997',
    '7 calculadoras dentro',
  ],

  resultLabel: 'Valor líquido no fim do prazo',

  cases: {
    title: 'Para que é esse dinheiro?',
    intro:
      'Não existe melhor investimento: existe o investimento que combina com o prazo em que você vai precisar do dinheiro. O objetivo define a liquidez exigida, e a liquidez define quanto imposto você paga.',
    items: [
      {
        id: 'reserva',
        label: 'Reserva de emergência',
        hint: 'Liquidez diária, risco baixo, prazo indefinido',
        answer:
          'Aqui a regra é liquidez, não rentabilidade: Tesouro Selic ou CDB de liquidez diária com garantia do FGC.',
        yes: [
          'Tesouro Selic: resgate em D+1, oscilação praticamente nula, custódia da B3 de 0,20% ao ano',
          'CDB de liquidez diária com pelo menos 100% do CDI, coberto pelo FGC até R$ 250 mil por CPF e instituição',
          'Poupança: isenta de IR e de IOF, com liquidez imediata — e rendimento menor que os dois acima',
          'Todos rendem no dia a dia, então o valor "parado" não perde para a inflação como no dinheiro em conta',
        ],
        warn: [
          AVISO_LEGAL,
          'Resgate antes de 30 dias paga IOF sobre o rendimento, começando em 96% no primeiro dia — reserva de emergência recém-formada rende quase nada se for usada na primeira semana',
          'A poupança tem aniversário: sacar um dia antes da data de aniversário significa perder o rendimento do mês inteiro',
          'Prefixado e IPCA+ não servem para reserva: vendidos antes do vencimento, sofrem marcação a mercado e podem devolver menos do que você aplicou',
        ],
        plazo:
          'reserva usual: de 3 a 6 meses de despesas para quem tem renda estável, de 12 meses para autônomos e PJ.',
      },
      {
        id: 'medio',
        label: 'Objetivo de 2 a 5 anos',
        hint: 'Entrada de imóvel, carro, viagem, faculdade',
        answer:
          'Passando de 720 dias o IR cai para 15%, a menor alíquota — e é aí que prefixado e IPCA+ passam a valer a pena.',
        yes: [
          'Acima de 720 dias corridos, a alíquota de IR é 15% em qualquer produto de renda fixa',
          'Tesouro Prefixado trava a taxa: você sabe hoje quanto vai receber no vencimento',
          'Tesouro IPCA+ protege da inflação: rende IPCA mais um juro real contratado',
          'CDB, LCI e LCA com vencimento próximo do objetivo evitam a marcação a mercado',
        ],
        warn: [
          AVISO_LEGAL,
          'Prefixado só entrega a taxa contratada se você segurar até o vencimento; vendendo antes, o preço é o de mercado do dia',
          'LCI e LCA são isentas de IR para pessoa física, o que muda a comparação: 90% do CDI isento pode ganhar de 110% do CDI tributado',
          'Se o dinheiro pode ser preciso antes da data, o produto certo não é o de maior taxa, é o de vencimento mais próximo',
        ],
        plazo:
          'a alíquota de IR muda em 181, 361 e 721 dias corridos: adiar um resgate em poucos dias pode valer 2,5 pontos percentuais.',
      },
      {
        id: 'aposentadoria',
        label: 'Aposentadoria (PGBL ou VGBL)',
        hint: 'Prazo longo, benefício fiscal, tabela regressiva',
        answer:
          'PGBL só compensa quem declara no modelo completo e contribui para o INSS; para todo o resto, VGBL.',
        yes: [
          'PGBL: o aporte deduz da base do IRPF até 12% da renda bruta tributável anual, mas o IR do resgate incide sobre o valor total',
          'VGBL: o aporte não deduz nada, e o IR do resgate incide apenas sobre o rendimento',
          'Na tabela regressiva, a alíquota cai de 35% para 10% conforme o prazo de cada aporte',
          'Previdência não tem come-cotas, o que ajuda no acúmulo de prazo longo',
        ],
        warn: [
          AVISO_LEGAL,
          'A dedução do PGBL exige declaração no modelo completo e contribuição para o INSS ou regime próprio — sem isso, o benefício simplesmente não existe',
          'A tabela regressiva conta o prazo de CADA aporte, e não a idade do plano: dinheiro colocado no ano passado ainda paga 35%',
          'Escolher a tabela regressiva é decisão irreversível em muitos planos; a progressiva pode ser melhor para quem vai resgatar valores mensais pequenos',
          'Taxa de carregamento e taxa de administração corroem o benefício fiscal: um plano com 2% ao ano de administração pode anular a vantagem do PGBL',
        ],
        plazo:
          'o aporte precisa estar pago dentro do ano-calendário para deduzir na declaração do ano seguinte — 31 de dezembro é o corte.',
      },
      {
        id: 'renda',
        label: 'Renda mensal com FII',
        hint: 'Dividendo isento, ganho de capital tributado',
        answer:
          'O rendimento mensal do FII é isento de IR para pessoa física; o lucro na venda das cotas paga 20%, sem isenção nenhuma.',
        yes: [
          'Rendimento distribuído isento de IR para pessoa física (art. 3º, III da Lei 11.033/2004)',
          'Distribuição normalmente mensal, o que serve a quem precisa de fluxo de caixa',
          'Ganho de capital na venda das cotas tributado em 20%, recolhido por DARF pelo próprio investidor',
          'Prejuízo com FII compensa ganho com FII em meses seguintes',
        ],
        warn: [
          AVISO_LEGAL,
          'A isenção do rendimento tem três condições cumulativas: fundo com pelo menos 100 cotistas, cotas negociadas em bolsa ou balcão organizado e o investidor com menos de 10% das cotas — fora disso, o rendimento é tributado',
          'FII não é renda fixa: a cota oscila, o dividendo pode cair e fundo de tijolo sofre com vacância e inadimplência',
          'A isenção de R$ 20 mil de vendas mensais vale para ações, não para FII: qualquer lucro na venda de cota é tributado',
          'Dividend yield alto costuma vir de fundo com risco alto ou de receita não recorrente; olhe o relatório gerencial antes do número',
        ],
        plazo:
          'o DARF do ganho de capital com FII vence no último dia útil do mês seguinte ao da venda.',
      },
    ],
  },

  inputsTitle: 'Quanto, por quanto tempo e a que taxa',
  inputsIntro:
    'Selic, CDI, IPCA e juro real do Tesouro mudam todos os dias: os valores abaixo são apenas um ponto de partida. Troque pelos números do dia da sua aplicação.',
  fields: [
    {
      id: 'objetivo',
      label: 'Para que é o dinheiro',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'reserva', label: 'Reserva de emergência' },
        { value: 'medio', label: 'Objetivo de 2 a 5 anos' },
        { value: 'aposentadoria', label: 'Aposentadoria (PGBL ou VGBL)' },
        { value: 'renda', label: 'Renda mensal com FII' },
      ],
      help: 'Muda quais produtos entram na comparação e qual deles é destacado no resultado.',
    },
    {
      id: 'aporte',
      label: 'Quanto você vai aplicar (R$)',
      prefix: 'R$',
      value: '10.000',
      thousands: true,
      help: 'Aporte único. Para aporte mensal na previdência, informe o valor anual no campo próprio.',
    },
    {
      id: 'meses',
      label: 'Por quantos meses',
      type: 'number',
      value: 24,
      min: 1,
      max: 480,
      step: 1,
      help: 'O prazo define a alíquota de IR: acima de 720 dias corridos ela chega ao mínimo de 15%.',
    },
    {
      id: 'selic',
      label: 'Selic meta hoje (% ao ano)',
      type: 'number',
      value: 15,
      min: 0,
      max: 60,
      step: 0.25,
      suffix: '%',
      help: 'Publicada pelo Copom no site do Banco Central. Define a poupança e o Tesouro Selic.',
    },
    {
      id: 'pctCdi',
      label: 'Quanto o CDB paga do CDI (%)',
      type: 'number',
      value: 105,
      min: 0,
      max: 200,
      step: 1,
      suffix: '%',
      help: 'Está na oferta do banco. O CDI roda cerca de 0,10 ponto abaixo da Selic meta.',
    },
    {
      id: 'ipca',
      label: 'IPCA esperado (% ao ano)',
      type: 'number',
      value: 4.5,
      min: 0,
      max: 50,
      step: 0.1,
      suffix: '%',
      help: 'Use a projeção do boletim Focus do Banco Central para o período do investimento.',
    },
    {
      id: 'juroReal',
      label: 'Juro real do Tesouro IPCA+ (% ao ano)',
      type: 'number',
      value: 7,
      min: 0,
      max: 20,
      step: 0.1,
      suffix: '%',
      help: 'É a taxa que aparece ao lado do título na página do Tesouro Direto, o "IPCA + X%".',
    },
    {
      id: 'dyMensal',
      label: 'Dividend yield mensal do FII (%)',
      type: 'number',
      value: 0.85,
      min: 0,
      max: 5,
      step: 0.01,
      suffix: '%',
      help: 'Rendimento distribuído no mês dividido pelo preço da cota. Está no relatório do fundo.',
    },
    {
      id: 'rendaBrutaAnual',
      label: 'Sua renda bruta tributável anual (R$)',
      prefix: 'R$',
      value: '120.000',
      thousands: true,
      help: 'Base do teto de 12% do PGBL. Só é usada no objetivo aposentadoria.',
    },
    {
      id: 'aliquotaIrpf',
      label: 'Sua alíquota marginal do IRPF (%)',
      type: 'number',
      value: 27.5,
      min: 0,
      max: 27.5,
      step: 0.5,
      suffix: '%',
      help: 'A faixa mais alta em que a sua renda cai: 0, 7,5, 15, 22,5 ou 27,5. Define a economia real do PGBL.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Do que rendeu, quanto ficou com você',
    caption:
      'Reparte o valor final da opção destacada entre o capital que você aplicou, o que sobrou de rendimento e o que foi embora em imposto, IOF e taxa de custódia.',
  },
  breakdownTitle: 'Cada opção, já no líquido',
  breakdownIntro:
    'Todos os valores abaixo são o que sobra na sua mão no fim do prazo, já descontados IR, IOF e custódia. Compare linha a linha.',

  faq: [
    {
      q: 'Como funciona o IR regressivo da renda fixa?',
      a: 'A alíquota depende do tempo entre a aplicação e o resgate, contado em dias corridos: 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720 dias. O imposto incide só sobre o rendimento, nunca sobre o valor aplicado, e é retido na fonte no resgate. Vale para CDB, RDB, Tesouro Direto, debêntures comuns e fundos de renda fixa. LCI, LCA, CRI, CRA e poupança são isentos para pessoa física.',
    },
    {
      q: 'O que é o IOF dos 30 primeiros dias?',
      a: 'É um imposto que morde o rendimento de quem resgata muito cedo. Começa em 96% do rendimento no primeiro dia e vai caindo cerca de 3 pontos por dia até zerar no trigésimo. Ele é cobrado antes do IR, sobre o que rendeu, não sobre o principal — você nunca perde o valor aplicado. Na prática, aplicação de renda fixa resgatada na primeira semana rende quase nada. Poupança, LCI e LCA não pagam IOF.',
    },
    {
      q: 'A poupança ainda vale a pena?',
      a: 'Raramente. Com a Selic acima de 8,5% ao ano, a poupança rende 0,5% ao mês mais TR, o que dá cerca de 6,2% ao ano — bem abaixo do CDI. Com a Selic igual ou abaixo de 8,5%, ela rende 70% da Selic mais TR, o que continua sendo menos que o Tesouro Selic. A vantagem da poupança é ser isenta de IR e de IOF e ter liquidez imediata; mesmo assim, um Tesouro Selic ou um CDB de liquidez diária a 100% do CDI costuma ganhar dela no líquido em qualquer prazo acima de um mês.',
    },
    {
      q: 'O que é o aniversário da poupança?',
      a: 'A poupança credita rendimento apenas na data mensal correspondente ao dia do depósito. Se você depositou no dia 10 e sacar no dia 9 do mês seguinte, recebe zero de rendimento pelo mês inteiro. Nenhum outro investimento funciona assim: CDB e Tesouro rendem todo dia útil, de forma proporcional. É a razão pela qual quem movimenta dinheiro com frequência perde muito mais na poupança do que a diferença de taxa sugere.',
    },
    {
      q: 'Quando o Tesouro IPCA+ é melhor que o prefixado?',
      a: 'O IPCA+ garante um ganho real acima da inflação, seja ela qual for; o prefixado garante uma taxa nominal fixa. Se a inflação surpreender para cima, o IPCA+ ganha; se ela cair mais do que o mercado espera, o prefixado ganha. Para objetivo de prazo longo e finalidade de preservar poder de compra — aposentadoria, faculdade dos filhos, entrada de imóvel — o IPCA+ é o mais coerente, porque o que importa não é o número na tela, é quanto ele compra. Nos dois casos a taxa contratada só é entregue se o título for levado ao vencimento.',
    },
    {
      q: 'Como funciona a taxa de custódia da B3 no Tesouro Direto?',
      a: 'É de 0,20% ao ano sobre o valor mantido em custódia, cobrada semestralmente ou no resgate, o que vier primeiro. Há isenção para saldos de até R$ 10 mil em Tesouro Selic — acima disso, a taxa incide apenas sobre o excedente. Os demais títulos pagam a taxa desde o primeiro real. A corretora pode cobrar taxa própria além dessa, embora hoje a maioria não cobre.',
    },
    {
      q: 'PGBL ou VGBL: como decidir sem errar?',
      a: 'Três perguntas em sequência. Você declara no modelo completo? Se não, VGBL, ponto final. Você contribui para o INSS ou regime próprio? Se não, VGBL de novo, porque a dedução exige isso. Seus aportes cabem em 12% da sua renda bruta tributável anual? O que passar disso não deduz e deve ir para um VGBL. Só quando as três respostas ajudam é que o PGBL vence — e mesmo assim ele exige disciplina: o benefício vem de investir a economia de imposto, não de gastá-la.',
    },
    {
      q: 'Como funciona a tabela regressiva da previdência?',
      a: 'Ela vai de 35% para aportes com menos de 2 anos até 10% para aportes com mais de 10 anos, caindo 5 pontos a cada dois anos. A armadilha está em qual prazo conta: é o prazo de cada aporte individual, e não a idade do plano. Quem abriu um plano há 12 anos mas depositou dinheiro no mês passado paga 35% sobre esse aporte se resgatar agora. Os planos costumam usar a regra PEPS, em que o dinheiro mais antigo sai primeiro, o que ajuda — mas a conta é aporte a aporte.',
    },
    {
      q: 'O rendimento de FII é sempre isento de imposto?',
      a: 'Não. A isenção do art. 3º, III da Lei 11.033/2004 exige três condições ao mesmo tempo: o fundo precisa ter no mínimo 100 cotistas, as cotas precisam ser negociadas exclusivamente em bolsa ou balcão organizado, e o investidor não pode deter 10% ou mais das cotas do fundo nem ter direito a 10% ou mais dos rendimentos. Faltando qualquer uma, o rendimento é tributado em 20% na fonte. E a isenção nunca alcançou o ganho de capital na venda das cotas, que paga 20% sempre.',
    },
    {
      q: 'Qual é a diferença entre rentabilidade bruta, líquida e real?',
      a: 'A bruta é o que o produto rendeu antes de qualquer desconto. A líquida é o que sobrou depois de IR, IOF e taxas — é a que importa para comparar produtos. A real é a líquida descontada da inflação do período, e é a única que responde à pergunta que importa: você ficou mais rico ou apenas com mais reais na conta? Um investimento que rendeu 12% líquidos num ano de 10% de inflação entregou menos de 2% de ganho real.',
    },
    {
      q: 'O que é o FGC e até quanto ele cobre?',
      a: 'O Fundo Garantidor de Créditos cobre CDB, RDB, LCI, LCA, poupança e conta corrente até R$ 250 mil por CPF e por instituição financeira, com teto global de R$ 1 milhão renovável a cada quatro anos. Títulos públicos não têm FGC porque têm algo melhor: são garantidos pelo Tesouro Nacional. FII, ações, debêntures e fundos de investimento não têm cobertura nenhuma — quem oferece 130% do CDI num CDB está pagando pelo risco de crédito, e o FGC é justamente o que torna esse risco aceitável dentro do limite.',
    },
    {
      q: 'O que é come-cotas e quais produtos sofrem com ele?',
      a: 'É a antecipação semestral do imposto de renda que atinge fundos de investimento abertos de renda fixa e multimercado, cobrada em maio e novembro pela menor alíquota da tabela do fundo. Ela reduz a quantidade de cotas e, por tirar dinheiro do bolo antes da hora, corrói o efeito dos juros compostos ao longo dos anos. CDB, Tesouro Direto, ações, FII e previdência privada não têm come-cotas — o que é uma vantagem estrutural desses produtos no prazo longo.',
    },
  ],

  sources: [
    {
      name: 'Lei 11.033/2004 — IR regressivo da renda fixa e isenção dos FII',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Decreto 6.306/2007 — regulamento do IOF e tabela dos 30 dias',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 11.053/2004 — tributação regressiva da previdência complementar',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11053.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 8.177/1991 — remuneração da caderneta de poupança',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8177.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Tesouro Direto — taxas, títulos e custódia da B3',
      url: 'https://www.tesourodireto.com.br/titulos/taxas.htm',
      publisher: 'Tesouro Nacional',
    },
    {
      name: 'Taxa Selic e boletim Focus',
      url: 'https://www.bcb.gov.br/controleinflacao/taxaselic',
      publisher: 'Banco Central do Brasil',
    },
    {
      name: 'Fundo Garantidor de Créditos — coberturas e limites',
      url: 'https://www.fgc.org.br/garantia-fgc/valores-garantidos',
      publisher: 'FGC',
    },
  ],

  replaces: [
    '/pt/calculadora-rentabilidade-cdb-poupanca-tesouro',
    '/pt/cdb-rendimento-liquido-ir-regressivo',
    '/pt/tesouro-ipca-mais-juro-real-composto',
    '/pt/tesouro-prefixado-rendimento-vencimento',
    '/pt/fundo-imobiliario-fii-rendimento-dividendo',
    '/pt/previdencia-pgbl-vs-vgbl-comparador',
    '/pt/irpf-deducao-previdencia-pgbl-12-porcento',
  ],

  lastReviewed: '2026-07-28',
};
