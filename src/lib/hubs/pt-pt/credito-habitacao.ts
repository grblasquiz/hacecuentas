import type { HubData } from '../types';
import { PORTUGAL_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Aguento esta prestação e vale a pena amortizar?"
 *
 * Absorve quatro calculadoras da mesma decisão de dinheiro: taxa de esforço,
 * amortização antecipada, Certificados de Aforro Série F e atualização de rendas.
 *
 * ATENÇÃO às constantes: ao contrário dos hubs fiscais, quase nada disto vive em
 * portugal-2026.ts. As comissões, os limites de taxa de esforço, os prémios dos
 * Certificados e o coeficiente das rendas vinham escritos nas próprias fórmulas.
 * Ficam aqui com a fonte à vista e, quando são dados vivos (Euribor, TAN, taxa
 * base dos Certificados, coeficiente do ano), são campos editáveis pelo utilizador.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `finance`. */
const DISCLAIMER_FINANCE =
  'Estimativa informativa. Taxas, custos e condições reais dependem da instituição e do contrato; compare os documentos oficiais antes de decidir.';

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `investment`. */
const DISCLAIMER_INVESTMENT =
  'Ferramenta educativa, não é recomendação de investimento. Retorno e capital podem variar ou ser perdidos; confira custos e riscos com instituição ou assessor habilitado.';

/**
 * Referências de taxa de esforço. Não são um limite legal: são as referências que
 * o Banco de Portugal usa na avaliação da solvabilidade e que os bancos aplicam.
 */
export const ESFORCO = {
  confortavel: 35,
  maximo: 45,
};

/**
 * Comissão de reembolso antecipado do crédito à habitação (Decreto-Lei n.º 74-A/2017):
 * 0,5 % do capital amortizado em contratos de taxa fixa e 0,25 % em taxa variável.
 */
export const COMISSAO_REEMBOLSO = {
  fixa: 0.005,
  variavel: 0.0025,
};

/**
 * Certificados de Aforro Série F (IGCP). A taxa base segue a média da Euribor a 3
 * meses com piso de 0 % e teto de 2,5 %; o prémio de permanência soma-se por cima
 * do teto. Capitalização trimestral, unidade de 1 € e máximo de 250.000 € por titular.
 * Os juros são tributados à taxa de IRS dos rendimentos de capitais.
 */
export const AFORRO = {
  tetoBase: 2.5,
  limiteMaximo: 250000,
  irsJuros: PORTUGAL_2026.irs.taxaAutonomaMaisValias,
  /** Prémio de permanência em pontos percentuais, por ano de detenção. */
  premios: [
    { ate: 1, premio: 0 },
    { ate: 5, premio: 0.25 },
    { ate: 9, premio: 0.5 },
    { ate: 11, premio: 1 },
    { ate: 13, premio: 1.5 },
    { ate: 15, premio: 1.75 },
  ],
};

/**
 * Coeficiente de atualização anual das rendas, apurado pelo INE.
 * O valor por defeito é o do Aviso n.º 23174/2025/2 (DR, 19-09-2025): 1,0224.
 * É um dado que muda todos os anos — por isso o campo é editável.
 */
export const RENDA = {
  coeficientePadrao: 1.0224,
  avisoPadrao: 'Aviso n.º 23174/2025/2',
  preAvisoDias: 30,
};

export const hub: HubData = {
  slug: 'pt-pt/financas/credito-habitacao',
  title: 'Crédito à habitação: aguento a prestação e vale a pena amortizar?',
  description:
    'Taxa de esforço com as referências do Banco de Portugal, poupança real de uma amortização antecipada depois da comissão, comparação com os Certificados de Aforro Série F e atualização anual da renda.',
  silo: 'Finanças',
  siloHref: '/pt-pt/financas',
  locale: 'pt-pt',

  eyebrow: 'Portugal · casa · decisões de dinheiro',
  h1: 'Aguenta a prestação — e vale a pena amortizar?',
  lede:
    'Duas contas decidem quase tudo na casa: quanto do seu rendimento fica preso na prestação, e o que ganha mesmo se usar uma poupança para amortizar em vez de a deixar a render. Aqui estão as duas, com a comissão do banco já descontada.',
  stamps: [
    `Taxa de esforço confortável até ${ESFORCO.confortavel} % · limite de referência ${ESFORCO.maximo} %`,
    `Comissão de reembolso ${(COMISSAO_REEMBOLSO.variavel * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % em taxa variável e ${(COMISSAO_REEMBOLSO.fixa * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % em taxa fixa`,
    '4 calculadoras lá dentro',
  ],

  resultLabel: 'Resultado da decisão',

  cases: {
    title: 'O que está a decidir?',
    intro:
      'São quatro momentos diferentes da mesma casa. Começamos pelo primeiro: saber se o banco lhe aprova o crédito.',
    items: [
      {
        id: 'pedir',
        label: 'Vou pedir crédito e quero saber se passo',
        hint: 'Taxa de esforço · referências do Banco de Portugal',
        answer: `A taxa de esforço é o peso de todas as prestações no rendimento líquido: até ${ESFORCO.confortavel} % é confortável e acima de ${ESFORCO.maximo} % raramente é aprovado.`,
        yes: [
          'Rendimento líquido mensal de todo o agregado, já depois de impostos e Segurança Social',
          'A prestação do crédito novo mais todas as outras prestações que já paga',
          `Referência confortável: até ${ESFORCO.confortavel} % do rendimento`,
          `Limite prático da banca: à volta de ${ESFORCO.maximo} %`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Não é um limite legal: cada banco tem a sua política e pondera também o histórico de crédito e a estabilidade do emprego',
          'A prestação de uma taxa variável sobe se a Euribor subir — simule com uma taxa mais alta do que a de hoje antes de decidir',
          'O seguro de vida e o seguro multirriscos não entram nesta conta e são um custo mensal real',
        ],
        plazo: 'o banco tem de lhe entregar a Ficha de Informação Normalizada Europeia e dar-lhe pelo menos sete dias para refletir antes da escritura.',
      },
      {
        id: 'amortizar',
        label: 'Já tenho crédito e quero amortizar',
        hint: 'Amortização antecipada · reduzir prazo ou prestação',
        answer:
          'Reduzir o prazo poupa sempre mais juros do que reduzir a prestação — mas quem precisa de folga mensal deve escolher a prestação.',
        yes: [
          'Capital em dívida atual, TAN e prazo que ainda falta',
          'Reduzir o prazo mantém a prestação e encurta o crédito: é a opção que mais juros poupa',
          'Reduzir a prestação mantém o prazo e alivia o orçamento todos os meses',
          `Comissão de reembolso antecipado de ${(COMISSAO_REEMBOLSO.variavel * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % em taxa variável e ${(COMISSAO_REEMBOLSO.fixa * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % em taxa fixa`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Amortizar é irreversível: o dinheiro que mete na casa deixa de estar disponível para uma emergência',
          'Antes de amortizar, pague primeiro qualquer crédito pessoal ou de cartão — a taxa desses é muito mais alta',
          'A simulação assume a TAN constante até ao fim; numa taxa variável a poupança real muda com a Euribor',
        ],
        plazo: 'o pedido de amortização antecipada deve ser comunicado ao banco com sete dias úteis de antecedência nos contratos de taxa variável.',
      },
      {
        id: 'aforro',
        label: 'Amortizo ou ponho nos Certificados de Aforro?',
        hint: 'Série F · capitalização trimestral',
        answer:
          'Compara-se a poupança líquida de amortizar com o que a mesma quantia renderia nos Certificados, já com o IRS dos juros descontado.',
        yes: [
          `Taxa base dos Certificados indexada à Euribor a 3 meses, com teto de ${AFORRO.tetoBase.toLocaleString('de-DE')} %`,
          'Prémio de permanência que sobe com os anos e fica fora do teto',
          'Capitalização trimestral e resgate possível a partir dos três meses',
          `Juros tributados a ${(AFORRO.irsJuros * 100).toLocaleString('de-DE')} % de IRS`,
        ],
        warn: [
          DISCLAIMER_INVESTMENT,
          'Regra prática: se a TAN do crédito for maior do que a taxa líquida dos Certificados, amortizar ganha',
          'A projeção mantém a taxa base constante, mas ela muda todos os meses com a Euribor',
          `O limite de subscrição da Série F é de ${fmtEUR(AFORRO.limiteMaximo)} por titular`,
          'Resgatar antes de um ano faz perder o prémio de permanência acumulado',
        ],
        plazo: 'os Certificados só podem ser resgatados três meses depois da subscrição; os juros são pagos trimestralmente e capitalizados.',
      },
      {
        id: 'renda',
        label: 'Estou a arrendar e querem atualizar-me a renda',
        hint: 'Coeficiente anual do INE',
        answer:
          'A renda só pode subir pelo coeficiente que o INE publica todos os anos, e o senhorio tem de avisar por escrito com antecedência.',
        yes: [
          'Coeficiente de atualização publicado por aviso no Diário da República',
          'A atualização é uma faculdade do senhorio, não uma obrigação',
          `Comunicação por escrito com pelo menos ${RENDA.preAvisoDias} dias de antecedência`,
          'Só se pode atualizar uma vez por ano e depois de o contrato ter um ano de vigência',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Uma subida acima do coeficiente do ano não é válida, mesmo que conste de um aditamento assinado',
          'Sem a comunicação escrita e no prazo, o aumento não produz efeitos nesse ano',
          'Contratos com apoios públicos ou com renda condicionada têm regras próprias',
        ],
        plazo: `a comunicação tem de chegar ao inquilino com ${RENDA.preAvisoDias} dias de antecedência em relação ao mês em que a nova renda começa a vigorar.`,
      },
    ],
  },

  inputsTitle: 'Os seus números',
  inputsIntro:
    'Preencha o que interessa ao seu caso. As taxas de mercado — Euribor, TAN, taxa base dos Certificados e coeficiente das rendas — são campos editáveis de propósito: mudam ao longo do ano e o valor certo é o que o seu contrato ou o aviso do ano disserem.',
  fields: [
    {
      id: 'rendimentoLiquido',
      label: 'Rendimento líquido mensal do agregado (€)',
      value: '2.400',
      thousands: true,
      suffix: '€',
      help: 'O que entra mesmo na conta, somando os dois titulares.',
    },
    {
      id: 'prestacao',
      label: 'Prestação do crédito à habitação (€)',
      value: '650',
      thousands: true,
      suffix: '€',
      help: 'A prestação atual, ou a que o simulador do banco lhe indicou.',
    },
    {
      id: 'outrosCreditos',
      label: 'Outras prestações mensais (€)',
      value: '150',
      thousands: true,
      suffix: '€',
      help: 'Crédito automóvel, pessoal, cartões e crédito ao consumo.',
    },
    {
      id: 'capitalEmDivida',
      label: 'Capital em dívida (€)',
      value: '120.000',
      thousands: true,
      suffix: '€',
      help: 'O que ainda deve ao banco, não o valor da casa.',
    },
    {
      id: 'taxaAnual',
      label: 'TAN do seu crédito (%)',
      type: 'number',
      value: 3.2,
      min: 0,
      max: 20,
      step: 0.01,
      help: 'A taxa anual nominal do contrato. Numa taxa variável é a Euribor do seu prazo mais o spread.',
    },
    {
      id: 'prazoRestanteAnos',
      label: 'Prazo que ainda falta (anos)',
      type: 'number',
      value: 25,
      min: 1,
      max: 50,
      step: 1,
      help: 'Também é o horizonte usado na comparação com os Certificados de Aforro.',
    },
    {
      id: 'valorAmortizar',
      label: 'Dinheiro que tem para aplicar (€)',
      value: '10.000',
      thousands: true,
      suffix: '€',
      help: 'A quantia que pode amortizar — ou, em alternativa, pôr nos Certificados.',
    },
    {
      id: 'tipoTaxa',
      label: 'O seu crédito é de taxa',
      type: 'select',
      value: 'variavel',
      options: [
        { value: 'variavel', label: 'Variável (indexada à Euribor)' },
        { value: 'fixa', label: 'Fixa' },
      ],
      help: 'Muda a comissão de reembolso antecipado.',
    },
    {
      id: 'estrategia',
      label: 'Ao amortizar quer',
      type: 'select',
      value: 'prazo',
      options: [
        { value: 'prazo', label: 'Encurtar o prazo e manter a prestação' },
        { value: 'prestacao', label: 'Baixar a prestação e manter o prazo' },
      ],
      help: 'Encurtar o prazo poupa mais juros; baixar a prestação dá folga mensal.',
    },
    {
      id: 'taxaBaseAforro',
      label: 'Taxa base dos Certificados de Aforro (%)',
      type: 'number',
      value: 2,
      min: 0,
      max: 2.5,
      step: 0.001,
      help: `Média da Euribor a 3 meses, com teto de ${AFORRO.tetoBase.toLocaleString('de-DE')} %. Confirme o valor do mês no site do IGCP.`,
    },
    {
      id: 'rendaAtual',
      label: 'Renda mensal atual (€)',
      value: '700',
      thousands: true,
      suffix: '€',
      help: 'A renda que paga hoje, antes da atualização.',
    },
    {
      id: 'coeficiente',
      label: 'Coeficiente de atualização das rendas',
      type: 'number',
      value: 1.0224,
      min: 1,
      max: 1.5,
      step: 0.0001,
      help: `Publicado todos os anos pelo INE. O valor pré-carregado é o do ${RENDA.avisoPadrao}.`,
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Para onde vai o dinheiro nesta decisão',
    caption:
      'Mostra a composição do caso que escolheu: o peso das prestações no rendimento, os juros que poupa face aos que continua a pagar, ou o que rende a poupança depois do imposto.',
  },
  breakdownTitle: 'A conta, linha a linha',
  breakdownIntro:
    'Os números que o banco usa e os que ele não lhe mostra: a margem que ainda tem, a comissão que desconta a poupança e o que a mesma quantia rendia noutro sítio.',

  faq: [
    {
      q: 'Qual é a taxa de esforço máxima para conseguir crédito à habitação?',
      a: `Não há um limite escrito na lei, mas há referências que a banca segue: até ${ESFORCO.confortavel} % do rendimento líquido é considerado confortável, e a partir de cerca de ${ESFORCO.maximo} % as recusas tornam-se a regra. O Banco de Portugal recomenda ainda que a avaliação seja feita com uma taxa de juro superior à do momento, precisamente para testar se o agregado aguenta uma subida da Euribor.`,
    },
    {
      q: 'O que conta para a taxa de esforço?',
      a: 'Todas as prestações de crédito que o agregado paga, não só a da casa: automóvel, crédito pessoal, crédito ao consumo e cartões com pagamento faseado. Do outro lado entra o rendimento líquido, já depois de IRS e Segurança Social. Rendimentos irregulares como comissões ou subsídios costumam ser considerados apenas em parte, ou nem sequer entrar.',
    },
    {
      q: 'Compensa mais reduzir o prazo ou reduzir a prestação?',
      a: 'Reduzir o prazo poupa sempre mais juros, porque o capital fica menos tempo a vencer juros e a prestação continua a atacar mais capital todos os meses. Reduzir a prestação poupa menos, mas liberta dinheiro no orçamento mensal. A escolha não é financeira, é de risco: quem tem folga escolhe o prazo, quem está apertado escolhe a prestação.',
    },
    {
      q: 'Quanto custa amortizar antecipadamente?',
      a: `A comissão de reembolso antecipado é de ${(COMISSAO_REEMBOLSO.variavel * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % do capital amortizado nos contratos de taxa variável e de ${(COMISSAO_REEMBOLSO.fixa * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % nos de taxa fixa. É pouco face aos juros que se poupam: numa amortização de 10.000 € falamos de dezenas de euros contra milhares de euros de juros evitados. Houve períodos de suspensão temporária desta comissão em taxa variável, por isso vale a pena confirmar o que está em vigor antes de avançar.`,
    },
    {
      q: 'É melhor amortizar o crédito ou pôr o dinheiro a render?',
      a: `A regra é simples: compare a TAN do crédito com a taxa líquida do que a poupança rende. Amortizar é um investimento sem risco cujo retorno é exatamente a taxa do crédito, e sem imposto — porque juros que não paga não são rendimento tributável. Já os juros dos Certificados de Aforro pagam ${(AFORRO.irsJuros * 100).toLocaleString('de-DE')} % de IRS. Com uma TAN acima de 3 % e a taxa base dos Certificados no teto, amortizar costuma ganhar.`,
    },
    {
      q: 'Como funcionam os Certificados de Aforro Série F?',
      a: `A taxa base segue a média da Euribor a 3 meses, com um piso de 0 % e um teto de ${AFORRO.tetoBase.toLocaleString('de-DE')} %. A partir do segundo ano acresce um prémio de permanência que sobe por patamares e fica de fora do teto, o que premeia quem não mexe no dinheiro. Os juros capitalizam trimestralmente, a unidade é de 1 € e o limite é de ${fmtEUR(AFORRO.limiteMaximo)} por titular. O resgate só é possível três meses depois da subscrição.`,
    },
    {
      q: 'Devo amortizar ou guardar um fundo de emergência?',
      a: 'Primeiro o fundo de emergência. Amortizar é irreversível: o dinheiro entra na casa e não volta a sair sem vender ou pedir novo crédito. A ordem sensata é ter três a seis meses de despesas líquidas de parte, depois liquidar créditos caros — pessoal, automóvel, cartões —, e só no fim atacar o crédito à habitação, que é quase sempre o mais barato que se consegue em Portugal.',
    },
    {
      q: 'Quanto pode o senhorio aumentar a renda?',
      a: `Apenas o que resultar da aplicação do coeficiente de atualização que o INE apura e que é publicado por aviso no Diário da República. O coeficiente pré-carregado nesta calculadora é o do ${RENDA.avisoPadrao}. Um aumento superior não é válido, mesmo que o inquilino tenha assinado um aditamento nesse sentido, e a atualização só pode acontecer uma vez por ano.`,
    },
    {
      q: 'O senhorio tem de avisar antes de subir a renda?',
      a: `Tem, por escrito e com pelo menos ${RENDA.preAvisoDias} dias de antecedência em relação ao mês em que a nova renda passa a vigorar. Sem essa comunicação, feita a tempo, o aumento não produz efeitos nesse ano — e o senhorio não pode recuperar depois a diferença. A atualização é também uma faculdade, não uma obrigação: há senhorios que optam por não atualizar para manter o inquilino.`,
    },
    {
      q: 'A prestação sobe se a Euribor subir?',
      a: 'Numa taxa variável, sim, e no prazo de revisão que o contrato definir: a cada três, seis ou doze meses. Nas taxas fixas a prestação não muda durante o período contratado. É por isso que faz sentido simular a taxa de esforço com uma taxa acima da atual: o que interessa não é aguentar a prestação de hoje, é aguentar a de daqui a dois anos.',
    },
    {
      q: 'Qual é a diferença entre TAN e TAEG?',
      a: 'A TAN é só a taxa de juro que remunera o capital, e é a que se usa para calcular a prestação. A TAEG inclui, além dos juros, as comissões, os seguros exigidos e os impostos associados, e serve para comparar propostas de bancos diferentes. Duas propostas com a mesma TAN podem ter TAEG muito diferentes se uma delas obrigar a seguros caros ou a domiciliações com custos.',
    },
  ],

  sources: [
    {
      name: 'Banco de Portugal — crédito à habitação e avaliação da solvabilidade',
      url: 'https://clientebancario.bportugal.pt/pt-pt/credito-habitacao',
      publisher: 'Banco de Portugal',
    },
    {
      name: 'Decreto-Lei n.º 74-A/2017 — contratos de crédito relativos a imóveis de habitação',
      url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/74-a-2017',
      publisher: 'Diário da República',
    },
    {
      name: 'IGCP — Certificados de Aforro Série F',
      url: 'https://www.igcp.pt/pt/produtos-de-aforro/certificados-de-aforro/',
      publisher: 'Agência de Gestão da Tesouraria e da Dívida Pública',
    },
    {
      name: 'INE — coeficiente de atualização anual das rendas',
      url: 'https://www.ine.pt/',
      publisher: 'Instituto Nacional de Estatística',
    },
    {
      name: 'Novo Regime do Arrendamento Urbano — atualização de rendas',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2006-34455875',
      publisher: 'Diário da República',
    },
    {
      name: 'Código do IRS — art. 71.º e 72.º, tributação dos rendimentos de capitais',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/',
      publisher: 'Portal das Finanças',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-taxa-de-esforco-credito-habitacao-portugal',
    '/pt-pt/calculadora-amortizacao-antecipada-credito-habitacao-portugal',
    '/pt-pt/calculadora-certificados-de-aforro-serie-f-portugal',
    '/pt-pt/calculadora-atualizacao-renda-arrendamento-portugal',
  ],

  lastReviewed: '2026-07-28',
};
