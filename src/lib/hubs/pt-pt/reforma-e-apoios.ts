import type { HubData } from '../types';
import { PORTUGAL_2026, CSI_2026, RSI_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Que rendimento me garante o Estado?"
 *
 * Absorve três calculadoras: pensão de reforma da Segurança Social, Complemento
 * Solidário para Idosos e Rendimento Social de Inserção. As três respondem à
 * mesma pergunta a partir de ângulos diferentes: quanto me entra por mês quando
 * o salário deixa de entrar.
 *
 * DIFERENÇA DELIBERADA face à fórmula antiga da pensão: a fórmula viva aplicava
 * um piso de "pensão mínima" igual a 0,55 × IAS, valor que o seu próprio
 * comentário assume como "referência indicativa" e que NÃO está em portugal-2026.ts
 * nem em nenhuma portaria citada. Aqui esse piso inventado não é aplicado; em vez
 * disso avisa-se que existe uma pensão mínima legal fixada por portaria anual,
 * cujo valor não está verificado neste repositório.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `finance`. */
const DISCLAIMER_FINANCE =
  'Estimativa informativa. Taxas, custos e condições reais dependem da instituição e do contrato; compare os documentos oficiais antes de decidir.';

export const IAS = PORTUGAL_2026.ias;

/**
 * Taxa anual de formação da pensão (regime geral, Decreto-Lei n.º 187/2007).
 * Carreiras até 20 anos: 2 % por ano. Acima de 20 anos, taxa escalonada de 2,0 %
 * a 2,3 % conforme a fração da remuneração de referência em múltiplos de IAS.
 * Limite global de 92 % da remuneração de referência.
 */
export const PENSAO = {
  taxaAnualAte20Anos: 0.02,
  limiteGlobal: 0.92,
  anosDeCorte: 20,
  /** `Infinity` viaja como null em `define:vars`. */
  escaloes: [
    { ateIas: 1.1, taxaAno: 0.023 },
    { ateIas: 2.0, taxaAno: 0.0225 },
    { ateIas: 4.0, taxaAno: 0.0221 },
    { ateIas: 8.0, taxaAno: 0.0216 },
    { ateIas: null, taxaAno: 0.02 },
  ],
  /** Anos de carreira contributiva exigidos para aceder à pensão do regime geral. */
  anosMinimosCarreira: 15,
};

/** CSI — valores de referência anuais. */
export const CSI = {
  isoladoAnual: CSI_2026.referenciaIsoladoAnual,
  casalAnual: CSI_2026.referenciaCasalAnual,
  idadeMinima: 66,
};

/** RSI — escala de equivalência mensal. */
export const RSI = {
  titular: RSI_2026.titular,
  adultoAdicional: RSI_2026.adultoAdicional,
  crianca: RSI_2026.crianca,
};

export const hub: HubData = {
  slug: 'pt-pt/financas/reforma-e-apoios',
  title: 'Pensão de reforma, CSI e RSI: que rendimento me garante o Estado',
  description:
    'Estime a pensão de reforma pela taxa de formação da sua carreira contributiva, veja se tem direito ao Complemento Solidário para Idosos e calcule o Rendimento Social de Inserção do seu agregado.',
  silo: 'Finanças',
  siloHref: '/pt-pt/financas',
  locale: 'pt-pt',

  eyebrow: 'Portugal · Segurança Social · prestações diferenciais',
  h1: 'Quando o salário deixa de entrar: o que o Estado garante.',
  lede:
    'A pensão de reforma depende dos anos de descontos e da remuneração de referência. Quando não chega, há duas prestações diferenciais que completam o rendimento até um mínimo: o CSI, para quem tem 66 anos ou mais, e o RSI, para agregados sem rendimentos suficientes.',
  stamps: [
    `IAS ${fmtEUR(IAS)} · taxa de formação da pensão de 2 % a 2,3 % por ano, com limite de ${(PENSAO.limiteGlobal * 100).toLocaleString('de-DE')} %`,
    `CSI ${fmtEUR(CSI.isoladoAnual)}/ano para isolado e ${fmtEUR(CSI.casalAnual)}/ano para casal · RSI ${fmtEUR(RSI.titular)}/mês para o titular`,
    '3 calculadoras lá dentro',
  ],

  resultLabel: 'Rendimento mensal estimado',

  cases: {
    title: 'O que quer saber?',
    intro:
      'As três prestações respondem à mesma pergunta em momentos diferentes da vida. Começamos pela pensão de reforma.',
    items: [
      {
        id: 'pensao',
        label: 'Quanto vou receber de pensão',
        hint: 'Regime geral · taxa de formação',
        answer:
          'A pensão é a remuneração de referência multiplicada pela taxa de formação, que resulta dos anos de carreira contributiva.',
        yes: [
          `${(PENSAO.taxaAnualAte20Anos * 100).toLocaleString('de-DE')} % por cada ano de carreira, até aos ${PENSAO.anosDeCorte} anos de descontos`,
          'Acima de 20 anos, a taxa anual sobe até 2,3 % nas remunerações de referência mais baixas',
          `Limite global de ${(PENSAO.limiteGlobal * 100).toLocaleString('de-DE')} % da remuneração de referência`,
          `São precisos pelo menos ${PENSAO.anosMinimosCarreira} anos civis com registo de remunerações para aceder à pensão do regime geral`,
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Estimativa. O cálculo oficial usa toda a carreira contributiva registada e não apenas uma remuneração média que indique aqui',
          'Não está aplicado o fator de sustentabilidade nem a penalização por reforma antecipada, que podem cortar uma fatia importante do valor',
          'Existe uma pensão mínima legal, fixada anualmente por portaria e dependente dos anos de carreira: o seu valor não está verificado nesta ferramenta, pelo que o resultado pode sair abaixo do mínimo a que teria direito',
          'Confirme sempre a sua carreira contributiva na Segurança Social Direta antes de tomar decisões sobre a data da reforma',
        ],
        plazo: 'a carreira contributiva pode ser consultada e corrigida a qualquer momento na Segurança Social Direta; o pedido de pensão apresenta-se com antecedência em relação à data pretendida.',
      },
      {
        id: 'csi',
        label: 'Tenho direito ao Complemento Solidário para Idosos',
        hint: `A partir dos ${CSI.idadeMinima} anos · prestação diferencial`,
        answer: `O CSI paga a diferença entre os seus rendimentos e o valor de referência: ${fmtEUR(CSI.isoladoAnual)} por ano se vive só, ${fmtEUR(CSI.casalAnual)} se é casal.`,
        yes: [
          `Ter ${CSI.idadeMinima} anos ou mais e residir em Portugal`,
          `Valor de referência anual de ${fmtEUR(CSI.isoladoAnual)} para quem vive só`,
          `Valor de referência anual de ${fmtEUR(CSI.casalAnual)} para o casal`,
          'O complemento é a diferença, dividida por doze meses',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'É uma prestação sujeita a condição de recursos: entram os rendimentos do requerente e, no casal, os dos dois',
          'A condição de recursos considera também o património mobiliário e os rendimentos dos filhos, o que exclui muita gente que à primeira vista teria direito',
          'Quem recebe CSI mantém acesso a benefícios adicionais em saúde, como comparticipação de medicamentos e de óculos',
        ],
        plazo: 'o CSI é requerido na Segurança Social e a condição de recursos é reavaliada anualmente.',
      },
      {
        id: 'rsi',
        label: 'Quanto é o Rendimento Social de Inserção',
        hint: 'Prestação diferencial · escala de equivalência',
        answer:
          'Soma-se um valor de referência por cada elemento do agregado e paga-se a diferença face aos rendimentos que já entram.',
        yes: [
          `${fmtEUR(RSI.titular)} por mês pelo titular`,
          `${fmtEUR(RSI.adultoAdicional)} por cada adulto adicional do agregado`,
          `${fmtEUR(RSI.crianca)} por cada criança ou jovem com menos de 18 anos`,
          'A prestação é a diferença entre esse valor de referência e o rendimento mensal do agregado',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'O RSI implica assinar e cumprir um contrato de inserção: formação, procura ativa de emprego ou acompanhamento social',
          'Sendo diferencial, cada euro de rendimento que entra retira um euro de prestação',
          'A condição de recursos considera o património e os rendimentos de todo o agregado, não só de quem requer',
        ],
        plazo: 'o RSI é requerido nos serviços da Segurança Social e é reavaliado periodicamente, com obrigação de comunicar qualquer alteração de rendimentos.',
      },
    ],
  },

  inputsTitle: 'Os seus números',
  inputsIntro:
    'Preencha o que interessa ao seu caso: os restantes campos ficam de fora da conta.',
  fields: [
    {
      id: 'remuneracaoMedia',
      label: 'Remuneração de referência mensal (€)',
      value: '1.400',
      thousands: true,
      suffix: '€',
      help: 'A média das remunerações da sua carreira contributiva, não o salário de hoje.',
    },
    {
      id: 'anosDescontos',
      label: 'Anos de descontos',
      type: 'number',
      value: 30,
      min: 0,
      max: 50,
      step: 1,
      help: `Anos civis com registo de remunerações. São precisos ${PENSAO.anosMinimosCarreira} para aceder à pensão do regime geral.`,
    },
    {
      id: 'situacaoCsi',
      label: 'Situação para o CSI',
      type: 'select',
      value: 'isolado',
      options: [
        { value: 'isolado', label: 'Vivo só' },
        { value: 'casal', label: 'Casal' },
      ],
      help: 'O valor de referência do casal é mais alto, mas contam os rendimentos dos dois.',
    },
    {
      id: 'rendimentosAnuais',
      label: 'Rendimentos anuais para o CSI (€)',
      value: '6.000',
      thousands: true,
      suffix: '€',
      help: 'Pensões e outros rendimentos anuais do requerente ou do casal.',
    },
    {
      id: 'nAdultos',
      label: 'Adultos no agregado',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'Contando o titular. Só conta no RSI.',
    },
    {
      id: 'nCriancas',
      label: 'Crianças e jovens com menos de 18 anos',
      type: 'number',
      value: 2,
      min: 0,
      max: 12,
      step: 1,
      help: 'Só conta no RSI.',
    },
    {
      id: 'rendimentosMensais',
      label: 'Rendimentos mensais do agregado (€)',
      value: '300',
      thousands: true,
      suffix: '€',
      help: 'Tudo o que já entra por mês. Cada euro que entra retira um euro de RSI.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'De onde vem o rendimento do mês',
    caption:
      'Compara a parte que já entra por rendimentos próprios com a parte que o Estado acrescenta — ou, na pensão, a fatia da remuneração de referência que a carreira contributiva conseguiu formar.',
  },
  breakdownTitle: 'A conta, linha a linha',
  breakdownIntro:
    'A taxa que a sua carreira formou, o valor de referência do seu agregado e a diferença que a prestação cobre.',

  faq: [
    {
      q: 'Como se calcula a pensão de reforma em Portugal?',
      a: `A pensão do regime geral é a remuneração de referência multiplicada pela taxa global de formação. Essa taxa é de ${(PENSAO.taxaAnualAte20Anos * 100).toLocaleString('de-DE')} % por cada ano de carreira até aos ${PENSAO.anosDeCorte} anos de descontos; acima disso passa a uma escala que vai de 2,0 % a 2,3 % por ano, mais generosa para as remunerações de referência mais baixas. O total nunca ultrapassa ${(PENSAO.limiteGlobal * 100).toLocaleString('de-DE')} % da remuneração de referência.`,
    },
    {
      q: 'Quantos anos de descontos são precisos para ter pensão?',
      a: `São precisos pelo menos ${PENSAO.anosMinimosCarreira} anos civis com registo de remunerações para aceder à pensão de velhice do regime geral. Quem não chega lá pode ter direito à pensão social de velhice, que é uma prestação do regime não contributivo, sujeita a condição de recursos e de valor bastante mais baixo. Vale a pena confirmar a carreira na Segurança Social Direta: anos em falta por erro de registo são corrigíveis.`,
    },
    {
      q: 'O que é o fator de sustentabilidade?',
      a: 'É um coeficiente que reduz a pensão de quem se reforma antes da idade normal de acesso, para refletir o aumento da esperança média de vida. É atualizado todos os anos e aplica-se sobre o valor calculado pela taxa de formação. Não está incluído nesta estimativa: quem pensa em reformar-se antecipadamente deve contar com um corte adicional relevante e permanente.',
    },
    {
      q: 'Existe uma pensão mínima?',
      a: 'Existe, e é fixada anualmente por portaria, com valores diferentes conforme os anos de carreira contributiva. Esta ferramenta não aplica esse mínimo porque o valor em vigor não está verificado aqui — se o resultado lhe parecer baixo demais, confirme o valor da pensão mínima do seu escalão de carreira junto da Segurança Social antes de tirar conclusões.',
    },
    {
      q: 'O que é o CSI e quem tem direito?',
      a: `O Complemento Solidário para Idosos é uma prestação diferencial para quem tem ${CSI.idadeMinima} anos ou mais e rendimentos abaixo de um valor de referência: ${fmtEUR(CSI.isoladoAnual)} por ano para quem vive só e ${fmtEUR(CSI.casalAnual)} para o casal. O complemento é exatamente a diferença entre esse valor e os rendimentos, dividida por doze. Quem já atinge o valor de referência não recebe nada.`,
    },
    {
      q: 'A condição de recursos do CSI olha para os filhos?',
      a: 'Olha. Além dos rendimentos e do património do requerente, a avaliação considera a situação económica dos filhos, partindo do princípio legal de que existe um dever de solidariedade familiar. É por isso que muita gente com pensões muito baixas acaba por não ter direito ao complemento: não é o rendimento próprio que a exclui, é o do agregado familiar alargado.',
    },
    {
      q: 'Como se calcula o RSI?',
      a: `Aplica-se uma escala de equivalência ao agregado: ${fmtEUR(RSI.titular)} pelo titular, mais ${fmtEUR(RSI.adultoAdicional)} por cada adulto adicional e ${fmtEUR(RSI.crianca)} por cada criança ou jovem com menos de 18 anos. A soma é o valor de referência do agregado. A prestação é a diferença entre esse valor e os rendimentos mensais que já entram. Se os rendimentos igualam ou superam a referência, não há prestação.`,
    },
    {
      q: 'Trabalhar faz perder o RSI?',
      a: 'Faz descer, porque a prestação é diferencial: cada euro de rendimento retira um euro de RSI. Há, no entanto, regras de majoração que permitem não contabilizar a totalidade dos rendimentos do trabalho durante um período, precisamente para que aceitar um emprego não seja financeiramente indiferente. Não comunicar um novo rendimento é motivo de cessação e de devolução dos valores recebidos indevidamente.',
    },
    {
      q: 'O RSI obriga a alguma contrapartida?',
      a: 'Obriga. A atribuição depende da assinatura de um contrato de inserção com ações concretas — procura ativa de emprego, formação profissional, acompanhamento social ou de saúde, garantia de escolaridade das crianças do agregado. O incumprimento injustificado dessas ações leva à cessação da prestação, e o contrato é revisto periodicamente.',
    },
    {
      q: 'Posso acumular pensão com CSI ou com RSI?',
      a: 'Com o CSI, sim: o complemento existe exatamente para completar pensões baixas até ao valor de referência, e a maioria de quem o recebe é pensionista. Com o RSI a lógica é a mesma — é diferencial e conta a pensão como rendimento —, mas na prática quem tem 66 anos ou mais é encaminhado para o CSI, que é mais favorável.',
    },
    {
      q: 'A pensão paga IRS?',
      a: 'Paga. As pensões são rendimentos da categoria H e estão sujeitas aos mesmos escalões de IRS do trabalho, com a mesma dedução específica e o mesmo mínimo de existência. Na prática, isso significa que pensões de valor baixo não têm retenção nenhuma. Já o CSI e o RSI são prestações sociais sujeitas a condição de recursos e não são tributadas.',
    },
    {
      q: 'Vale a pena adiar a reforma?',
      a: 'Financeiramente, quase sempre. Adiar acrescenta anos de carreira, o que aumenta a taxa de formação até ao limite legal, e evita ou reduz a penalização do fator de sustentabilidade. Há ainda bonificações para quem continua a trabalhar depois de reunir as condições de acesso. A conta é individual e depende da saúde e da situação profissional, mas o efeito sobre o valor mensal é permanente.',
    },
  ],

  sources: [
    {
      name: 'Decreto-Lei n.º 187/2007 — regime de proteção nas eventualidades invalidez e velhice',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2007-34506275',
      publisher: 'Diário da República',
    },
    {
      name: 'Segurança Social — pensão de velhice',
      url: 'https://www.seg-social.pt/pensao-de-velhice',
      publisher: 'Segurança Social',
    },
    {
      name: 'Segurança Social — Complemento Solidário para Idosos',
      url: 'https://www.seg-social.pt/complemento-solidario-para-idosos',
      publisher: 'Segurança Social',
    },
    {
      name: 'Segurança Social — Rendimento Social de Inserção',
      url: 'https://www.seg-social.pt/rendimento-social-de-insercao',
      publisher: 'Segurança Social',
    },
    {
      name: 'Portaria n.º 480-A/2025/1 — valor do IAS',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025',
      publisher: 'Diário da República',
      date: '30-12-2025',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-pensao-reforma-seguranca-social-portugal',
    '/pt-pt/simulador-csi-complemento-solidario-idosos-portugal',
    '/pt-pt/simulador-rsi-rendimento-social-insercao-2026-portugal',
  ],

  lastReviewed: '2026-07-28',
};
