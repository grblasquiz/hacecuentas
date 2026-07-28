import type { HubData } from '../types';
import { PORTUGAL_2026, AIMI_2026, IMT_JOVEM_2026, SELO_TRANSMISSAO_GRATUITA_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Que impostos pago por comprar e ter casa em Portugal?"
 *
 * Absorve quatro calculadoras da mesma pergunta: IMI anual, AIMI de quem tem
 * vários imóveis, IMT + Imposto do Selo na compra (com o benefício IMT Jovem) e
 * Imposto do Selo nas heranças e partilhas.
 *
 * Constantes: src/lib/data/portugal-2026.ts, a mesma tabela mestra das fórmulas vivas.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `tax`. */
const DISCLAIMER_TAX =
  'Estimativa informativa baseada nos parâmetros indicados. Regras e faixas podem mudar; confira o órgão fiscal aplicável e consulte um profissional tributário para a apuração definitiva.';

/** Taxas de IMI de prédios urbanos: intervalo legal e valor por defeito. */
export const IMI_TAXAS = {
  min: PORTUGAL_2026.imi.urbanoMin,
  max: PORTUGAL_2026.imi.urbanoMax,
  padrao: PORTUGAL_2026.imi.urbanoPadrao,
  rustico: PORTUGAL_2026.imi.rustico,
};

/** AIMI — art. 135.º-F do CIMI. Deduções e bandas marginais. */
export const AIMI = {
  deducaoSingular: AIMI_2026.deducaoSingular,
  deducaoCasal: AIMI_2026.deducaoCasal,
  banda1Ate: AIMI_2026.banda1Ate,
  taxa1: AIMI_2026.taxa1,
  banda2Ate: AIMI_2026.banda2Ate,
  taxa2: AIMI_2026.taxa2,
  taxa3: AIMI_2026.taxa3,
};

/**
 * Tabela de IMT para habitação própria e permanente (continente).
 * Ofício Circulado AT n.º 40129/2026. `Infinity` viaja como null em `define:vars`.
 */
export const IMT_HPP = PORTUGAL_2026.imt.hpp.map((e) => ({
  ate: Number.isFinite(e.ateEuros) ? e.ateEuros : null,
  taxa: e.taxa,
  abater: e.abater,
}));

/** IMT Jovem — Decreto-Lei n.º 48-A/2024. */
export const IMT_JOVEM = {
  isencaoTotalAte: IMT_JOVEM_2026.isencaoTotalAte,
  isencaoParcialAte: IMT_JOVEM_2026.isencaoParcialAte,
  taxaExcedente: IMT_JOVEM_2026.taxaExcedente,
  seloAquisicao: IMT_JOVEM_2026.seloAquisicao,
  idadeMaxima: IMT_JOVEM_2026.idadeMaxima,
};

/** Imposto do Selo das transmissões gratuitas — verba 1.2 da TGIS. */
export const SELO_GRATUITAS = {
  taxa: SELO_TRANSMISSAO_GRATUITA_2026.taxa,
};

export const hub: HubData = {
  slug: 'pt-pt/impostos/casa',
  title: 'Impostos da casa em Portugal: IMI, AIMI, IMT e Imposto do Selo',
  description:
    'Quanto custa comprar e ter casa em Portugal: IMI anual sobre o VPT e prestações, AIMI de quem tem vários imóveis, IMT e Imposto do Selo na compra com a isenção jovem, e o Selo de heranças e partilhas.',
  silo: 'Impostos',
  siloHref: '/pt-pt/impostos',
  locale: 'pt-pt',

  eyebrow: 'Portugal · continente · Autoridade Tributária',
  h1: 'Os impostos de comprar e de ter casa.',
  lede:
    'A casa é tributada três vezes: quando compra (IMT e Imposto do Selo), todos os anos que a tem (IMI, e AIMI se o património passar a dedução) e quando muda de mãos por herança ou partilha. Esta calculadora responde às quatro contas com os valores em vigor.',
  stamps: [
    `IMI urbano ${(IMI_TAXAS.min * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % a ${(IMI_TAXAS.max * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % · a maioria dos concelhos aplica ${(IMI_TAXAS.padrao * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`,
    `IMT Jovem isento até ${fmtEUR(IMT_JOVEM.isencaoTotalAte)} · AIMI a partir de ${fmtEUR(AIMI.deducaoSingular)}`,
    '4 calculadoras lá dentro',
  ],

  resultLabel: 'Imposto a pagar',

  cases: {
    title: 'Em que ponto está?',
    intro:
      'Cada momento da casa tem o seu imposto e a sua regra própria. Começamos pelo mais comum: já ter casa e receber a nota do IMI.',
    items: [
      {
        id: 'tenho',
        label: 'Já tenho casa e quero saber o IMI',
        hint: 'IMI anual · pago em prestações',
        answer: 'O IMI é o VPT do imóvel multiplicado pela taxa que o seu município fixou — não pelo preço a que comprou.',
        yes: [
          `Taxa municipal entre ${(IMI_TAXAS.min * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % e ${(IMI_TAXAS.max * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % nos prédios urbanos, fixada por cada câmara`,
          `Prédios rústicos têm taxa única de ${(IMI_TAXAS.rustico * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % em todo o país`,
          'Pagamento em uma, duas ou três prestações conforme o valor anual (art. 120.º do CIMI)',
          'Isenção temporária para habitação própria e permanente de VPT baixo, a pedir nas Finanças',
        ],
        warn: [
          DISCLAIMER_TAX,
          'A taxa muda de concelho para concelho e é fixada todos os anos: confirme a do seu município antes de assumir os 0,30 %',
          'O VPT pode estar desatualizado. Pode pedir reavaliação, mas ela tanto pode descer como subir o imposto',
          'Prédios devolutos ou em ruína têm agravamentos que podem multiplicar a taxa várias vezes',
        ],
        plazo: 'o IMI de um ano é liquidado no ano seguinte: a primeira prestação vence em maio, a segunda em agosto e a terceira em novembro.',
      },
      {
        id: 'varias',
        label: 'Tenho vários imóveis ou um património alto',
        hint: 'AIMI · adicional ao IMI',
        answer: `O AIMI só morde acima de ${fmtEUR(AIMI.deducaoSingular)} de VPT habitacional (${fmtEUR(AIMI.deducaoCasal)} no casal com tributação conjunta).`,
        yes: [
          'Somatório do VPT dos prédios habitacionais e dos terrenos para construção que tem a 1 de janeiro',
          `Dedução de ${fmtEUR(AIMI.deducaoSingular)} por pessoa singular, ou ${fmtEUR(AIMI.deducaoCasal)} no casal que opte pela tributação conjunta`,
          `Bandas marginais: ${(AIMI.taxa1 * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % até ${fmtEUR(AIMI.banda1Ate)}, ${(AIMI.taxa2 * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} % até ${fmtEUR(AIMI.banda2Ate)} e ${(AIMI.taxa3 * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % acima disso`,
          'No casal com tributação conjunta os limites das bandas também duplicam',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Comércio, serviços e indústria não entram: o AIMI só conta habitação e terrenos para construção',
          'O AIMI acresce ao IMI, não o substitui — paga os dois',
          'A opção pela tributação conjunta para efeitos de AIMI é anual e faz-se num prazo próprio, não é a mesma da declaração de IRS',
        ],
        plazo: 'o AIMI é liquidado em junho e pago em setembro.',
      },
      {
        id: 'comprar',
        label: 'Vou comprar casa',
        hint: 'IMT + Imposto do Selo · isenção jovem',
        answer: `Até aos ${IMT_JOVEM.idadeMaxima} anos, na primeira habitação própria e permanente, não paga nada de IMT nem de Selo até ${fmtEUR(IMT_JOVEM.isencaoTotalAte)}.`,
        yes: [
          'IMT calculado sobre o maior valor entre o preço de compra e o VPT',
          `Isenção total de IMT e de Imposto do Selo até ${fmtEUR(IMT_JOVEM.isencaoTotalAte)} para quem tem até ${IMT_JOVEM.idadeMaxima} anos e compra a primeira habitação própria e permanente`,
          `Isenção parcial entre ${fmtEUR(IMT_JOVEM.isencaoTotalAte)} e ${fmtEUR(IMT_JOVEM.isencaoParcialAte)}: paga só sobre o excedente`,
          `Imposto do Selo da aquisição: ${(IMT_JOVEM.seloAquisicao * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % do valor`,
        ],
        warn: [
          DISCLAIMER_TAX,
          `Acima de ${fmtEUR(IMT_JOVEM.isencaoParcialAte)} não há benefício nenhum: paga o IMT e o Selo normais`,
          'O IMT e o Selo pagam-se ANTES da escritura, e não entram no crédito à habitação: tem de ter esse dinheiro à parte',
          'Se a casa não for habitação própria e permanente, a tabela é outra e o primeiro escalão já não é isento',
          'Deixar de usar a casa como habitação própria e permanente nos anos seguintes pode obrigar a devolver o imposto que não pagou',
        ],
        plazo: 'o IMT e o Imposto do Selo são liquidados e pagos antes da celebração da escritura ou do documento particular autenticado.',
      },
      {
        id: 'heranca',
        label: 'Herdei ou vou fazer partilhas',
        hint: 'Imposto do Selo · verba 1.2 da TGIS',
        answer: 'Portugal não tem imposto sucessório: cônjuge, filhos, netos, pais e avós não pagam nada.',
        yes: [
          `Estão isentos o cônjuge ou unido de facto, os descendentes e os ascendentes`,
          `Os restantes herdeiros pagam ${(SELO_GRATUITAS.taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} % sobre o valor que recebem`,
          'A mesma regra vale para as doações em vida',
          'Nos imóveis, o valor que conta é o VPT, não o valor de mercado',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Ser isento de Imposto do Selo não dispensa a participação da transmissão às Finanças: essa obrigação existe na mesma',
          'A isenção é da transmissão. Vender depois o imóvel herdado gera mais-valias em IRS, com regras próprias',
          'Nas partilhas, quem recebe mais do que o seu quinhão paga IMT sobre esse excesso — é uma tornas, não uma herança',
        ],
        plazo: 'a participação da transmissão gratuita entrega-se nas Finanças até ao final do terceiro mês seguinte ao do óbito.',
      },
    ],
  },

  inputsTitle: 'Os seus números',
  inputsIntro:
    'Tudo em euros. Preencha o que interessa ao seu caso: os restantes campos ficam de fora da conta.',
  fields: [
    {
      id: 'vpt',
      label: 'VPT do imóvel (€)',
      value: '120.000',
      thousands: true,
      suffix: '€',
      help: 'O valor patrimonial tributário que consta na caderneta predial — não é o preço de mercado.',
    },
    {
      id: 'taxaImi',
      label: 'Taxa de IMI do seu município (%)',
      type: 'number',
      value: 0.3,
      min: 0.1,
      max: 1,
      step: 0.005,
      help: `Entre ${(IMI_TAXAS.min * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % e ${(IMI_TAXAS.max * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % nos prédios urbanos. Confirme a do seu concelho.`,
    },
    {
      id: 'vptTotal',
      label: 'Somatório do VPT habitacional (€)',
      value: '750.000',
      thousands: true,
      suffix: '€',
      help: 'Todos os prédios habitacionais e terrenos para construção que tinha a 1 de janeiro. Só conta no AIMI.',
    },
    {
      id: 'conjunta',
      label: 'AIMI com tributação conjunta do casal',
      type: 'select',
      value: 'nao',
      options: [
        { value: 'nao', label: 'Não — pessoa singular' },
        { value: 'sim', label: 'Sim — casal em tributação conjunta' },
      ],
      help: 'A tributação conjunta duplica a dedução e os limites das bandas.',
    },
    {
      id: 'valorCompra',
      label: 'Valor de compra da casa (€)',
      value: '250.000',
      thousands: true,
      suffix: '€',
      help: 'O maior entre o preço acordado e o VPT. É essa a base do IMT.',
    },
    {
      id: 'idade',
      label: 'Idade do comprador',
      type: 'number',
      value: 30,
      min: 16,
      max: 100,
      step: 1,
      help: `A isenção jovem exige ter até ${IMT_JOVEM.idadeMaxima} anos.`,
    },
    {
      id: 'valorHeranca',
      label: 'Valor recebido por herança ou doação (€)',
      value: '80.000',
      thousands: true,
      suffix: '€',
      help: 'Nos imóveis conta o VPT. É o seu quinhão, não o total da herança.',
    },
    {
      id: 'parentesco',
      label: 'Grau de parentesco com quem transmite',
      type: 'select',
      value: 'proximo',
      options: [
        { value: 'proximo', label: 'Cônjuge, unido de facto, filho, neto, pai ou avô' },
        { value: 'outros', label: 'Irmão, sobrinho, tio, primo ou terceiro' },
      ],
      help: 'O núcleo próximo está isento; os restantes pagam 10 %.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'Quanto do valor em causa é imposto',
    caption:
      'Compara a parte que fica consigo — o valor do imóvel ou da herança — com a fatia que vai para a Autoridade Tributária.',
  },
  breakdownTitle: 'A conta, linha a linha',
  breakdownIntro:
    'A base tributável, a taxa que se lhe aplica, a parcela a abater quando existe, e o imposto final com o calendário de pagamento.',

  faq: [
    {
      q: 'Como se calcula o IMI?',
      a: `O IMI é o valor patrimonial tributário do imóvel multiplicado pela taxa fixada pelo município. Nos prédios urbanos a taxa vai de ${(IMI_TAXAS.min * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % a ${(IMI_TAXAS.max * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %, e a esmagadora maioria dos concelhos aplica ${(IMI_TAXAS.padrao * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %. Nos prédios rústicos a taxa é única, ${(IMI_TAXAS.rustico * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %, igual em todo o país. O preço a que comprou a casa é irrelevante para esta conta: o que conta é o VPT da caderneta predial.`,
    },
    {
      q: 'Quando é que se paga o IMI e em quantas prestações?',
      a: 'O IMI de um ano é liquidado e pago no ano seguinte. Até 100 € paga tudo de uma vez, em maio. Entre 100 € e 500 € divide-se em duas prestações, maio e novembro. Acima de 500 € são três prestações: maio, agosto e novembro. Pode sempre optar por pagar tudo na primeira prestação, mas não há desconto por o fazer.',
    },
    {
      q: 'A partir de quando é que pago AIMI?',
      a: `Quando o somatório do VPT dos seus prédios habitacionais e terrenos para construção, a 1 de janeiro, passa ${fmtEUR(AIMI.deducaoSingular)} — ou ${fmtEUR(AIMI.deducaoCasal)} se for casal com tributação conjunta. Só a parte acima da dedução é tributada, por bandas marginais: ${(AIMI.taxa1 * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %, ${(AIMI.taxa2 * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} % e ${(AIMI.taxa3 * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %. Quem tem uma casa única, mesmo cara, quase nunca chega lá.`,
    },
    {
      q: 'O AIMI substitui o IMI?',
      a: 'Não. É um adicional: paga o IMI normal a cada município e, por cima, o AIMI ao Estado sobre o excedente da dedução. São duas liquidações distintas, com calendários diferentes — o IMI vence em maio, agosto e novembro, e o AIMI é liquidado em junho e pago em setembro.',
    },
    {
      q: 'Quem tem direito à isenção de IMT Jovem?',
      a: `Quem tem até ${IMT_JOVEM.idadeMaxima} anos, não é considerado dependente para efeitos de IRS e compra o primeiro imóvel destinado a habitação própria e permanente. Até ${fmtEUR(IMT_JOVEM.isencaoTotalAte)} a isenção é total, de IMT e de Imposto do Selo. Entre ${fmtEUR(IMT_JOVEM.isencaoTotalAte)} e ${fmtEUR(IMT_JOVEM.isencaoParcialAte)} a isenção é parcial: paga apenas sobre a parte que excede o primeiro limite. Acima de ${fmtEUR(IMT_JOVEM.isencaoParcialAte)} o benefício desaparece por completo.`,
    },
    {
      q: 'O IMT paga-se antes ou depois da escritura?',
      a: 'Antes, sempre. O IMT e o Imposto do Selo são liquidados e pagos antes da celebração da escritura ou do documento particular autenticado, e o comprovativo é exigido no ato. É por isso que estes impostos não podem ser financiados pelo crédito à habitação: têm de sair do dinheiro que tem disponível, tal como a comissão do banco e os custos de registo.',
    },
    {
      q: 'O IMT é calculado sobre o preço ou sobre o VPT?',
      a: 'Sobre o maior dos dois. Se comprar por 200.000 € uma casa com VPT de 230.000 €, o IMT calcula-se sobre 230.000 €. A regra existe justamente para desincentivar a declaração de preços abaixo do valor real. Compensa consultar a caderneta predial antes de fechar o negócio, para não ter surpresas na conta.',
    },
    {
      q: 'Paga-se imposto de herança em Portugal?',
      a: `Não existe imposto sucessório. A única tributação das transmissões gratuitas é o Imposto do Selo da verba 1.2 da TGIS, de ${(SELO_GRATUITAS.taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} %, e dele estão isentos o cônjuge ou unido de facto, os descendentes e os ascendentes. Na prática, a esmagadora maioria das heranças em linha reta não paga nada. Quem paga são irmãos, sobrinhos, primos, amigos e terceiros.`,
    },
    {
      q: 'Se estou isento, tenho de participar a herança às Finanças?',
      a: 'Tem. A isenção dispensa o pagamento, não a obrigação declarativa. A participação da transmissão gratuita entrega-se num serviço de finanças até ao final do terceiro mês seguinte ao do óbito, e é dela que sai o documento que permite depois registar os bens em nome dos herdeiros. Falhar o prazo tem coima, mesmo quando não há imposto nenhum a pagar.',
    },
    {
      q: 'Nas partilhas, quem fica com a casa paga alguma coisa?',
      a: 'Se ficar com bens de valor superior ao seu quinhão e compensar os outros herdeiros em dinheiro — as chamadas tornas —, paga IMT sobre esse excesso. É tratado como uma compra dessa parte, não como herança. Já a parte que corresponde ao seu quinhão continua a ser transmissão gratuita e segue as regras do Imposto do Selo.',
    },
    {
      q: 'Vale a pena pedir a reavaliação do VPT?',
      a: 'Pode valer, se o imóvel foi avaliado há muitos anos e entretanto envelheceu, porque o coeficiente de vetustez faz baixar o valor e com ele o IMI. Mas o pedido é uma faca de dois gumes: a avaliação nova tanto pode descer como subir, sobretudo se a zona valorizou muito ou se houve obras. Uma vez pedida, o resultado vale, e não há como voltar atrás.',
    },
    {
      q: 'Que outras isenções de IMI existem?',
      a: 'A mais conhecida é a isenção temporária para habitação própria e permanente de VPT baixo, com duração limitada e sujeita a um tope de rendimentos do agregado. Há ainda a isenção permanente para agregados de baixos rendimentos e prédios de valor reduzido, e isenções para reabilitação urbana e imóveis classificados. Nenhuma é automática em todos os casos: têm de ser pedidas nas Finanças, dentro de prazo.',
    },
  ],

  sources: [
    {
      name: 'Código do IMI — texto consolidado (incluindo o AIMI, art. 135.º-A e seguintes)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cimi/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Código do IMT — texto consolidado',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cimsisd/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Ofício Circulado AT n.º 40129/2026 — escalões de IMT',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/instrucoes_administrativas/',
      publisher: 'Autoridade Tributária e Aduaneira',
      date: '06-01-2026',
    },
    {
      name: 'Decreto-Lei n.º 48-A/2024 — isenção de IMT e Selo para jovens até aos 35 anos',
      url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/48-a-2024',
      publisher: 'Diário da República',
    },
    {
      name: 'Tabela Geral do Imposto do Selo — verbas 1.1 e 1.2',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/selo/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Autoridade Tributária — IMI: pagamento e prestações',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/',
      publisher: 'Portal das Finanças',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-imi-portugal',
    '/pt-pt/simulador-aimi-adicional-imi-portugal',
    '/pt-pt/simulador-isencao-imt-imposto-selo-jovem-portugal',
    '/pt-pt/simulador-imposto-selo-heranca-partilhas-portugal',
  ],

  lastReviewed: '2026-07-28',
};
