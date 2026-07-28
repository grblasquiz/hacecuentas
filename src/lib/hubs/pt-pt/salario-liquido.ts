import type { HubData } from '../types';
import { PORTUGAL_2026, AJUDAS_CUSTO_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Quanto é que recebo mesmo ao fim do mês?"
 *
 * Absorve seis calculadoras que respondiam pedaços da mesma pergunta: salário
 * líquido, retenção na fonte, subsídio de férias, subsídio de refeição, valor
 * da hora ao salário mínimo e ajudas de custo.
 *
 * Fonte única de constantes: src/lib/data/portugal-2026.ts (a mesma tabela mestra
 * que as fórmulas vivas usam). Nada escrito de memória aqui.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `labor`. */
const DISCLAIMER_LABOR =
  'Cálculo orientativo conforme as regras indicadas. Convenções, limites e situações individuais podem alterar o resultado; confirme com RH, órgão trabalhista ou profissional habilitado.';

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `tax`. */
const DISCLAIMER_TAX =
  'Estimativa informativa baseada nos parâmetros indicados. Regras e faixas podem mudar; confira o órgão fiscal aplicável e consulte um profissional tributário para a apuração definitiva.';

/** IAS 2026 — Portaria n.º 480-A/2025/1. */
export const IAS = PORTUGAL_2026.ias;

/** RMMG 2026 (continente) — Decreto-Lei n.º 139/2025. */
export const RMMG = {
  mensal: PORTUGAL_2026.rmmg.mensal,
  meses: PORTUGAL_2026.rmmg.meses,
  anual: PORTUGAL_2026.rmmg.anual,
  horasSemanaPadrao: PORTUGAL_2026.rmmg.horasSemanaPadrao,
};

/** Taxas contributivas da Segurança Social (TCO) — Código dos Regimes Contributivos. */
export const SS = {
  trabalhador: PORTUGAL_2026.segSocial.trabalhador,
  empregador: PORTUGAL_2026.segSocial.empregador,
};

/**
 * Escalões de IRS 2026 (Lei n.º 73-A/2025). Taxas marginais reais.
 * `Infinity` não sobrevive à serialização de `define:vars` → viaja como null.
 */
export const ESCALOES = PORTUGAL_2026.irs.escaloes.map((e) => ({
  ate: Number.isFinite(e.ateEuros) ? e.ateEuros : null,
  taxa: e.taxa,
}));

/** Dedução específica de trabalho dependente (8,54 × IAS) e mínimo de existência. */
export const IRS_BASES = {
  deducaoEspecifica: PORTUGAL_2026.irs.deducaoEspecificaTrabalho,
  fatorIas: PORTUGAL_2026.irs.deducaoEspecificaFatorIas,
  minimoExistencia: PORTUGAL_2026.irs.minimoExistenciaAnual,
};

/** IRS Jovem — Lei n.º 73-A/2025. Escala de isenção por ano de rendimentos. */
export const IRS_JOVEM = {
  idadeMaxima: PORTUGAL_2026.irsJovem.idadeMaxima,
  anosMaximos: PORTUGAL_2026.irsJovem.anosMaximos,
  limiteIsencaoAnual: PORTUGAL_2026.irsJovem.limiteIsencaoAnual,
  limiteFatorIas: PORTUGAL_2026.irsJovem.limiteIsencaoFatorIas,
};

/** Limites diários isentos do subsídio de refeição (valor da função pública). */
export const REFEICAO = {
  dinheiro: PORTUGAL_2026.subsidios.refeicao.isentoDinheiroDia,
  cartao: PORTUGAL_2026.subsidios.refeicao.isentoCartaoDia,
};

/** Ajudas de custo e deslocação em viatura própria — limites isentos de IRS/SS. */
export const AJUDAS = {
  nacionalDia: AJUDAS_CUSTO_2026.nacionalDia,
  estrangeiroDia: AJUDAS_CUSTO_2026.estrangeiroDia,
  kmViaturaPropria: AJUDAS_CUSTO_2026.kmViaturaPropria,
};

export const hub: HubData = {
  slug: 'pt-pt/trabalho/salario-liquido',
  title: 'Salário líquido em Portugal: quanto recebo mesmo ao fim do mês?',
  description:
    'Do bruto ao líquido em mão: 11 % de Segurança Social, retenção de IRS pelos escalões em vigor, subsídio de refeição isento, ajudas de custo, valor da sua hora e subsídios de férias e de Natal.',
  silo: 'Trabalho',
  siloHref: '/pt-pt/trabalho',
  locale: 'pt-pt',

  eyebrow: 'Portugal · continente · recibo de vencimento',
  h1: 'Quanto é que recebe mesmo ao fim do mês.',
  lede:
    'O bruto do contrato não é o que entra na conta. Esta calculadora desconta a Segurança Social e a retenção de IRS, soma o subsídio de refeição e as ajudas de custo que são isentos, e mostra-lhe o valor da sua hora e quanto sobra dos subsídios de férias e de Natal.',
  stamps: [
    `Segurança Social ${(SS.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % · entidade patronal ${(SS.empregador * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`,
    `RMMG ${fmtEUR(RMMG.mensal)} × ${RMMG.meses} meses · IAS ${fmtEUR(IAS)}`,
    '6 calculadoras lá dentro',
  ],

  resultLabel: 'Total em mão no mês',

  cases: {
    title: 'Qual é a sua situação?',
    intro:
      'As taxas são as mesmas para todos, mas o que fica de fora do imposto muda muito conforme o caso. Começamos pelo mais frequente.',
    items: [
      {
        id: 'tco',
        label: 'Sou trabalhador por conta de outrem',
        hint: 'Contrato normal · 14 meses',
        answer:
          'Descontam-lhe 11 % de Segurança Social sobre o bruto e uma retenção de IRS que depende do escalão em que cai o seu rendimento anual.',
        yes: [
          `Segurança Social do trabalhador: ${(SS.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % sobre a remuneração ilíquida`,
          `Retenção de IRS calculada sobre o rendimento anual a ${RMMG.meses} meses, com a dedução específica de ${fmtEUR(IRS_BASES.deducaoEspecifica)} (${IRS_BASES.fatorIas} × IAS)`,
          `Subsídio de refeição isento até ${fmtEUR(REFEICAO.cartao)}/dia em cartão ou ${fmtEUR(REFEICAO.dinheiro)}/dia em dinheiro`,
          'Subsídios de férias e de Natal, cada um igual a um mês de retribuição base',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Os ${(SS.empregador * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % da entidade patronal não saem do seu recibo: são custo da empresa, não desconto seu`,
          'A retenção mensal da tabela da AT costuma ser um pouco mais alta do que o imposto final: a diferença volta no acerto do IRS do ano seguinte',
        ],
        plazo: 'o recibo de vencimento tem de lhe ser entregue até ao dia do pagamento e a empresa entrega a declaração mensal de remunerações até ao dia 10 do mês seguinte.',
      },
      {
        id: 'jovem',
        label: 'Tenho direito ao IRS Jovem',
        hint: `Até aos ${IRS_JOVEM.idadeMaxima} anos · máximo ${IRS_JOVEM.anosMaximos} anos`,
        answer: `No 1.º ano de rendimentos fica 100 % isento de IRS, com o tope anual de ${fmtEUR(IRS_JOVEM.limiteIsencaoAnual)}.`,
        yes: [
          'Isenção de 100 % no 1.º ano, 75 % do 2.º ao 4.º, 50 % do 5.º ao 7.º e 25 % do 8.º ao 10.º',
          `Limite anual de rendimento isento: ${IRS_JOVEM.limiteFatorIas} × IAS = ${fmtEUR(IRS_JOVEM.limiteIsencaoAnual)}`,
          'Aplica-se a rendimentos das categorias A (trabalho dependente) e B (independente)',
          'A Segurança Social continua a descontar na mesma: a isenção é só de IRS',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Não pode ser considerado dependente no agregado de outra pessoa no ano em que usa o benefício',
          'A percentagem que a calculadora usa é a do ano que indicar; se se enganar no ano, o líquido sai errado para cima',
          'O benefício conta-se por anos de obtenção de rendimentos, não por anos de idade: podem não ser seguidos',
        ],
        plazo: 'a opção pelo regime tem de ser assinalada na declaração de IRS e comunicada à entidade empregadora para a retenção mensal já refletir a isenção.',
      },
      {
        id: 'minimo',
        label: 'Ganho o salário mínimo ou perto disso',
        hint: `RMMG ${fmtEUR(RMMG.mensal)} · ${RMMG.meses} meses`,
        answer: `Quem ganha a RMMG não tem retenção de IRS: o rendimento anual (${fmtEUR(RMMG.anual)}) fica no mínimo de existência.`,
        yes: [
          `Mínimo de existência de ${fmtEUR(IRS_BASES.minimoExistencia)} por ano — coincide de propósito com ${RMMG.meses} × ${fmtEUR(RMMG.mensal)}`,
          `Desconta-se só a Segurança Social (${(SS.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %)`,
          `Valor/hora legal calculado pelo art. 271.º do Código do Trabalho: RMMG × 12 ÷ (52 × horas por semana)`,
          'A tempo parcial a retribuição é proporcional, mas o valor/hora mínimo mantém-se',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Os Açores e a Madeira têm RMMG regional própria, mais alta do que a do continente — esta conta é do continente',
          'Ficar isento de IRS não o dispensa de entregar a declaração se tiver outros rendimentos',
          'Se o subsídio de refeição em dinheiro passar o limite isento, o excedente entra na base de IRS e de Segurança Social mesmo ganhando o mínimo',
        ],
        plazo: 'a RMMG é atualizada por decreto-lei em dezembro, com efeitos a 1 de janeiro.',
      },
      {
        id: 'ajudas',
        label: 'Recebo ajudas de custo ou km em viatura própria',
        hint: 'Deslocações · isento até ao limite',
        answer: 'Dentro dos limites da tabela, as ajudas de custo entram inteiras no bolso: não descontam IRS nem Segurança Social.',
        yes: [
          `Deslocação em território nacional: até ${fmtEUR(AJUDAS.nacionalDia)}/dia isentos`,
          `Deslocação ao estrangeiro: até ${fmtEUR(AJUDAS.estrangeiroDia)}/dia isentos`,
          `Viatura própria ao serviço da empresa: até ${fmtEUR(AJUDAS.kmViaturaPropria)}/km isentos`,
          'O que estiver dentro do limite não conta para o rendimento coletável nem para a base contributiva',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Só o que exceder o limite é tributado — mas é tributado por inteiro, em IRS e em Segurança Social',
          'Ajudas de custo não são retribuição: não contam para o subsídio de férias, para o de Natal nem para a compensação por cessação do contrato',
          'Sem boletim de itinerário ou mapa de deslocações a Autoridade Tributária pode requalificar tudo como remuneração',
        ],
        plazo: 'os mapas de deslocação devem ser guardados durante quatro anos, o prazo geral de caducidade da liquidação de impostos.',
      },
    ],
  },

  inputsTitle: 'Os seus números do mês',
  inputsIntro:
    'Valores em euros e do continente. Pode deixar o exemplo carregado e voltar depois com os seus.',
  fields: [
    {
      id: 'bruto',
      label: 'Salário base mensal bruto (€)',
      value: '1.400',
      thousands: true,
      suffix: '€',
      help: 'O valor do contrato, antes de qualquer desconto. Sem subsídio de refeição.',
    },
    {
      id: 'refeicaoDia',
      label: 'Subsídio de refeição por dia (€)',
      type: 'number',
      value: 10.46,
      min: 0,
      max: 30,
      step: 0.01,
      help: `Isento até ${fmtEUR(REFEICAO.cartao)}/dia em cartão e ${fmtEUR(REFEICAO.dinheiro)}/dia em dinheiro. Ponha 0 se não recebe.`,
    },
    {
      id: 'meioRefeicao',
      label: 'Como recebe o subsídio de refeição',
      type: 'select',
      value: 'cartao',
      options: [
        { value: 'cartao', label: 'Cartão ou vale de refeição' },
        { value: 'dinheiro', label: 'Em dinheiro, no recibo' },
      ],
      help: 'O limite isento em cartão é quase o dobro do limite em dinheiro.',
    },
    {
      id: 'diasTrabalho',
      label: 'Dias de trabalho no mês',
      type: 'number',
      value: 22,
      min: 0,
      max: 31,
      step: 1,
      help: 'Dias em que efetivamente recebe subsídio de refeição.',
    },
    {
      id: 'horasSemana',
      label: 'Horas de trabalho por semana',
      type: 'number',
      value: 40,
      min: 1,
      max: 60,
      step: 1,
      help: 'Serve para calcular o valor da sua hora e compará-lo com o mínimo legal.',
    },
    {
      id: 'anoJovem',
      label: 'Ano de rendimentos no IRS Jovem',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: '1.º ano isenta 100 %, 2.º a 4.º isentam 75 %, 5.º a 7.º isentam 50 %, 8.º a 10.º isentam 25 %. Só conta no caso do IRS Jovem.',
    },
    {
      id: 'diasDeslocacao',
      label: 'Dias de deslocação no mês',
      type: 'number',
      value: 0,
      min: 0,
      max: 31,
      step: 1,
      help: 'Dias com direito a ajuda de custo. Só conta no caso das ajudas de custo.',
    },
    {
      id: 'destino',
      label: 'Destino das deslocações',
      type: 'select',
      value: 'nacional',
      options: [
        { value: 'nacional', label: 'Território nacional' },
        { value: 'estrangeiro', label: 'Estrangeiro' },
      ],
      help: `${fmtEUR(AJUDAS.nacionalDia)}/dia em Portugal e ${fmtEUR(AJUDAS.estrangeiroDia)}/dia no estrangeiro.`,
    },
    {
      id: 'km',
      label: 'Quilómetros em viatura própria',
      type: 'number',
      value: 0,
      min: 0,
      max: 10000,
      step: 10,
      help: `Pagos a ${fmtEUR(AJUDAS.kmViaturaPropria)}/km sem impostos, dentro do limite legal.`,
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'O que acontece a cada euro que a empresa lhe paga',
    caption:
      'Compara o que fica em mão (líquido, subsídio de refeição isento e ajudas de custo) com o que sai para a Segurança Social e para a retenção de IRS.',
  },
  breakdownTitle: 'O seu recibo, linha a linha',
  breakdownIntro:
    'A mesma ordem do recibo de vencimento: bruto, o que é isento, a base de incidência, os descontos e o que sobra — mais o valor da sua hora e os subsídios de férias e de Natal.',

  faq: [
    {
      q: 'Quanto se desconta ao salário bruto em Portugal?',
      a: `Ao trabalhador por conta de outrem descontam-se ${(SS.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % de Segurança Social sobre a remuneração ilíquida e a retenção na fonte de IRS, que é progressiva. A entidade patronal paga ainda ${(SS.empregador * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % por cima, mas essa parte é custo da empresa e não aparece como desconto no seu recibo — o total que entra na Segurança Social por si é de ${(PORTUGAL_2026.segSocial.totalTco * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %.`,
    },
    {
      q: 'Quanto recebo líquido com o salário mínimo?',
      a: `A RMMG de ${fmtEUR(RMMG.mensal)} não tem retenção de IRS: o rendimento anual (${RMMG.meses} × ${fmtEUR(RMMG.mensal)} = ${fmtEUR(RMMG.anual)}) fica exatamente no mínimo de existência de ${fmtEUR(IRS_BASES.minimoExistencia)}. Sobra o desconto de ${(SS.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % de Segurança Social, ou seja ${fmtEUR(RMMG.mensal * SS.trabalhador)}, e o líquido fica em ${fmtEUR(RMMG.mensal * (1 - SS.trabalhador))} por mês, mais o subsídio de refeição que for pago.`,
    },
    {
      q: 'Como se calcula o valor da minha hora?',
      a: `Pelo art. 271.º do Código do Trabalho: retribuição mensal × 12 ÷ (52 × número de horas de trabalho por semana). Com a RMMG e uma semana de ${RMMG.horasSemanaPadrao} horas dá ${fmtEUR(PORTUGAL_2026.rmmg.horaPara40h)}/hora. Repare que a fórmula usa 12 e não 14: os subsídios de férias e de Natal não entram no valor/hora, entram no rendimento anual.`,
    },
    {
      q: 'Porque é que o salário é pago 14 vezes?',
      a: 'Porque além dos 12 ordenados a lei obriga ao subsídio de férias (art. 264.º do Código do Trabalho) e ao subsídio de Natal (art. 263.º), cada um igual a um mês de retribuição base mais diuturnidades. Quem entra ou sai a meio do ano recebe-os em proporção dos meses de serviço. Ambos descontam Segurança Social e IRS, por isso o líquido de cada um é menor do que o valor bruto.',
    },
    {
      q: 'O subsídio de refeição desconta impostos?',
      a: `Só a parte que passa o limite. Em cartão ou vale de refeição está isento até ${fmtEUR(REFEICAO.cartao)} por dia; pago em dinheiro, só até ${fmtEUR(REFEICAO.dinheiro)} por dia. O excedente soma ao rendimento tributável e entra na base de incidência da Segurança Social. É por isso que quase todas as empresas pagam em cartão: pelo mesmo custo, o trabalhador leva mais para casa.`,
    },
    {
      q: 'Porque é que a retenção que me fazem não bate certo com o imposto final?',
      a: 'Porque são duas coisas diferentes. A retenção mensal segue as tabelas de retenção na fonte publicadas pela Autoridade Tributária, que são desenhadas com folga e costumam reter um pouco a mais. O imposto verdadeiro só se apura na declaração anual, com as suas deduções à coleta, e a diferença volta como reembolso. Esta calculadora estima a retenção que faria o acerto ficar perto de zero, por isso pode dar alguns euros abaixo do que a empresa lhe retém.',
    },
    {
      q: 'O que é a dedução específica e porque é que baixa o meu IRS?',
      a: `É um valor que se abate ao rendimento bruto antes de aplicar os escalões, precisamente para reconhecer que nem todo o salário é rendimento disponível. Vale ${IRS_BASES.fatorIas} × IAS = ${fmtEUR(IRS_BASES.deducaoEspecifica)} por ano, ou o total das contribuições obrigatórias para a Segurança Social se estas forem mais altas — aplica-se sempre a maior das duas. Só o que sobra é que passa pelos escalões.`,
    },
    {
      q: 'Quais são os escalões de IRS e como é que se aplicam?',
      a: `São nove escalões com taxas marginais que vão de ${(ESCALOES[0].taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % até ${(ESCALOES[ESCALOES.length - 1].taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} %, e aplicam-se ao rendimento coletável, não ao salário bruto. São marginais: entrar no escalão seguinte só faz subir o imposto da parte que entra nesse escalão, nunca do rendimento todo. Ganhar mais um euro nunca o deixa com menos dinheiro em mão.`,
    },
    {
      q: 'As ajudas de custo contam para o subsídio de férias?',
      a: `Não. Ajudas de custo e o pagamento de quilómetros em viatura própria não são retribuição: destinam-se a compensar despesas. Dentro dos limites (${fmtEUR(AJUDAS.nacionalDia)}/dia em Portugal, ${fmtEUR(AJUDAS.estrangeiroDia)}/dia no estrangeiro e ${fmtEUR(AJUDAS.kmViaturaPropria)}/km) são isentas de IRS e de Segurança Social, mas em contrapartida não entram no cálculo dos subsídios de férias e de Natal nem da compensação por cessação do contrato.`,
    },
    {
      q: 'Vale a pena o IRS Jovem?',
      a: `Para quem tem direito, sim: no 1.º ano de rendimentos a isenção é total, com o tope anual de ${fmtEUR(IRS_JOVEM.limiteIsencaoAnual)} (${IRS_JOVEM.limiteFatorIas} × IAS), e depois vai descendo por patamares ao longo de um máximo de ${IRS_JOVEM.anosMaximos} anos, até aos ${IRS_JOVEM.idadeMaxima} anos. A Segurança Social continua a descontar na mesma. O ponto a não esquecer é que os anos contam por obtenção de rendimentos: se estiver um ano sem trabalhar, esse ano não gasta um patamar.`,
    },
    {
      q: 'Ganhar mais pode fazer-me receber menos?',
      a: 'Não, por causa do imposto. As taxas são marginais, por isso um aumento nunca reduz o líquido. O que pode acontecer é perder apoios sociais com condição de recursos — abono de família, RSI ou bolsas — que têm escalões com corte seco. Aí sim, um aumento pequeno pode custar mais do que rende, mas o culpado é o escalão do apoio, não o IRS.',
    },
    {
      q: 'Quanto custo eu à empresa?',
      a: `O custo é o seu bruto mais ${(SS.empregador * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % de contribuição patronal, mais o subsídio de refeição, mais a parte proporcional dos subsídios de férias e de Natal e do seguro de acidentes de trabalho. Na prática, um salário de ${fmtEUR(1400)} custa à empresa mais de ${fmtEUR(1400 * (1 + SS.empregador))} por mês, sem contar refeição nem subsídios.`,
    },
  ],

  sources: [
    {
      name: 'Decreto-Lei n.º 139/2025 — retribuição mínima mensal garantida',
      url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/139-2025',
      publisher: 'Diário da República',
      date: '29-12-2025',
    },
    {
      name: 'Lei n.º 73-A/2025 — Orçamento do Estado, escalões de IRS e IRS Jovem',
      url: 'https://diariodarepublica.pt/dr/detalhe/lei/73-a-2025',
      publisher: 'Diário da República',
    },
    {
      name: 'Portaria n.º 480-A/2025/1 — valor do IAS',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025',
      publisher: 'Diário da República',
      date: '30-12-2025',
    },
    {
      name: 'Código dos Regimes Contributivos do Sistema Previdencial de Segurança Social',
      url: 'https://www.seg-social.pt/legislacao',
      publisher: 'Segurança Social',
    },
    {
      name: 'Código do Trabalho — arts. 263.º, 264.º e 271.º (subsídios e valor da hora)',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475',
      publisher: 'Diário da República',
    },
    {
      name: 'Autoridade Tributária — tabelas de retenção na fonte de IRS',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Tabelas_IRS/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Código do IRS — art. 25.º (dedução específica) e art. 70.º (mínimo de existência)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/',
      publisher: 'Portal das Finanças',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-salario-liquido-portugal',
    '/pt-pt/calculadora-retencao-na-fonte-irs-portugal',
    '/pt-pt/calculadora-subsidio-ferias-portugal',
    '/pt-pt/calculadora-subsidio-refeicao-portugal',
    '/pt-pt/calculadora-salario-minimo-portugal-hora',
    '/pt-pt/simulador-ajudas-de-custo-portugal-2026',
  ],

  lastReviewed: '2026-07-28',
};
