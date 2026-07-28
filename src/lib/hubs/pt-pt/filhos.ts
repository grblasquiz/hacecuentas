import type { HubData } from '../types';
import { ABONO_FAMILIA_2026, PROPINAS_2026_27, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Quanto custam os filhos e que apoios lhes pertencem?"
 *
 * Absorve quatro calculadoras: abono de família, orçamento do regresso às aulas,
 * propinas do ensino superior e pensão de alimentos.
 *
 * ATENÇÃO: só o abono e as propinas têm valores oficiais em portugal-2026.ts. Os
 * custos do regresso às aulas são estimativas de mercado e a pensão de alimentos
 * não tem fórmula legal — ambos vêm assinalados como tal no copy e nos avisos.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `family`. */
const DISCLAIMER_FAMILY =
  'Informação geral. Em decisões de saúde, fertilidade, gravidez ou cuidados familiares, consulte o profissional adequado.';

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `legal`. */
const DISCLAIMER_LEGAL =
  'Guia informativo para estimar requisitos, prazos ou valores. Confirme a norma vigente no órgão oficial; quando houver efeitos jurídicos, consulte um profissional habilitado.';

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `finance`. */
const DISCLAIMER_FINANCE =
  'Estimativa informativa. Taxas, custos e condições reais dependem da instituição e do contrato; compare os documentos oficiais antes de decidir.';

/** Abono de família — Portaria n.º 60/2026/1. Escalões e montantes por faixa etária. */
export const ABONO = {
  escaloesLimite: ABONO_FAMILIA_2026.escaloesLimite.slice(),
  montante: {
    ate36meses: ABONO_FAMILIA_2026.montante.ate36meses.slice(),
    de36a72meses: ABONO_FAMILIA_2026.montante.de36a72meses.slice(),
    mais72meses: ABONO_FAMILIA_2026.montante.mais72meses.slice(),
  },
  majoracaoMonoparental: ABONO_FAMILIA_2026.majoracaoMonoparentalPct,
  iasBaseNovosPedidos: ABONO_FAMILIA_2026.iasBaseNovosPedidos,
};

/** Propinas do ensino superior público — descongelamento de 2026/2027. */
export const PROPINAS = {
  maxPublicoAnual: PROPINAS_2026_27.maxPublicoAnual,
  anteriorAnual: PROPINAS_2026_27.anteriorAnual,
  prestacoesPadrao: PROPINAS_2026_27.prestacoesPadrao,
};

/**
 * Custos do regresso às aulas. NÃO são valores oficiais: são referências de mercado
 * (levantamentos de associações de consumidores) que vinham escritas na fórmula
 * original. Servem de ponto de partida e o utilizador deve ajustá-las à sua realidade.
 */
export const ESCOLA = {
  material: { pre: 60, ciclo1: 90, ciclo2: 110, ciclo3: 130, secundario: 150 },
  manuaisPrivada: { pre: 0, ciclo1: 150, ciclo2: 200, ciclo3: 250, secundario: 300 },
  vestuario: 120,
  extras: { pre: 20, ciclo1: 25, ciclo2: 35, ciclo3: 45, secundario: 110 },
  refeicaoDiaPublica: 1.6,
  refeicaoDiaPrivada: 6,
  diasRefeicaoMes: 20,
  mesesAnoLetivo: 10,
  ciclos: {
    pre: 'Pré-escolar',
    ciclo1: '1.º ciclo',
    ciclo2: '2.º ciclo',
    ciclo3: '3.º ciclo',
    secundario: 'Secundário',
  },
};

export const hub: HubData = {
  slug: 'pt-pt/familia/filhos',
  title: 'Filhos em Portugal: abono de família, escola, propinas e pensão de alimentos',
  description:
    'Que escalão de abono de família lhe corresponde e quanto recebe por mês, quanto custa o regresso às aulas por ciclo, o que se paga de propinas no superior e como se estima uma pensão de alimentos.',
  silo: 'Família',
  siloHref: '/pt-pt/familia',
  locale: 'pt-pt',

  eyebrow: 'Portugal · Segurança Social · escola',
  h1: 'Quanto custam os filhos — e o que o Estado devolve.',
  lede:
    'De um lado o abono de família, que depende do rendimento do agregado e da idade da criança. Do outro as despesas: setembro, propinas e, quando os pais estão separados, a pensão de alimentos. Aqui estão as quatro contas.',
  stamps: [
    `Abono até ${fmtEUR(ABONO.montante.ate36meses[0])}/mês no 1.º escalão · majoração de ${(ABONO.majoracaoMonoparental * 100).toLocaleString('de-DE')} % nas famílias monoparentais`,
    `Propina máxima do ensino superior público: ${fmtEUR(PROPINAS.maxPublicoAnual)}/ano`,
    '4 calculadoras lá dentro',
  ],

  resultLabel: 'Resultado do seu caso',

  cases: {
    title: 'O que quer saber?',
    intro:
      'Os filhos custam dinheiro em fases diferentes e cada fase tem a sua conta. Começamos pelo apoio que mais famílias recebem.',
    items: [
      {
        id: 'abono',
        label: 'Quanto recebo de abono de família',
        hint: 'Escalão por rendimento · Segurança Social',
        answer:
          'O escalão sai do rendimento de referência do agregado, que é o rendimento anual dividido pelo número de filhos com direito mais um.',
        yes: [
          'Rendimento de referência = rendimentos anuais do agregado ÷ (número de titulares + 1)',
          'Quatro escalões com direito a abono; acima do quarto limite não há abono',
          'O montante muda com a idade: mais alto até aos 36 meses, mais baixo depois',
          `Famílias monoparentais têm majoração de ${(ABONO.majoracaoMonoparental * 100).toLocaleString('de-DE')} % sobre o valor do abono`,
        ],
        warn: [
          DISCLAIMER_FAMILY,
          'Os escalões dos pedidos novos são calculados com o IAS de um ano anterior; quem já recebia pode ter um enquadramento diferente',
          'Um aumento pequeno de rendimento pode fazer subir de escalão e cortar mais abono do que o próprio aumento rende: os escalões têm corte seco',
          'Além do abono há majorações e prestações complementares (deficiência, pré-natal) que esta conta não inclui',
        ],
        plazo: 'o abono é requerido na Segurança Social Direta e a prova de condição de recursos é feita oficiosamente todos os anos, com base na declaração de IRS.',
      },
      {
        id: 'escola',
        label: 'Quanto custa o regresso às aulas',
        hint: 'Material, manuais, vestuário e refeições',
        answer:
          'Na escola pública os manuais são gratuitos até ao 12.º ano — o grosso da despesa é material, vestuário e refeições.',
        yes: [
          'Material escolar, mochila e vestuário de início de ano',
          'Manuais escolares gratuitos na escola pública, do 1.º ao 12.º ano',
          'Refeições escolares ao longo do ano letivo',
          'Extras que pesam sobretudo no secundário, como a calculadora gráfica',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Os valores por ciclo são referências de mercado, não preços oficiais: ajuste-os à sua escola e à sua realidade',
          'Não estão incluídos transportes escolares, atividades extracurriculares nem explicações, que muitas vezes são a maior despesa',
          'Os apoios da Ação Social Escolar reduzem ou anulam parte destes custos consoante o escalão do agregado',
        ],
        plazo: 'os vouchers dos manuais gratuitos costumam ser levantados a partir do final de julho, na plataforma do Ministério da Educação.',
      },
      {
        id: 'universidade',
        label: 'Quanto custam as propinas',
        hint: 'Ensino superior · pagamento em prestações',
        answer: `No ensino superior público a propina máxima é de ${fmtEUR(PROPINAS.maxPublicoAnual)} por ano, habitualmente paga em ${PROPINAS.prestacoesPadrao} prestações.`,
        yes: [
          `Propina máxima do público: ${fmtEUR(PROPINAS.maxPublicoAnual)}/ano (era ${fmtEUR(PROPINAS.anteriorAnual)})`,
          `Pagamento habitual em ${PROPINAS.prestacoesPadrao} prestações ao longo do ano letivo`,
          'O ensino privado não tem tabela oficial e varia muito de instituição para instituição',
          'A propina é só uma parte: há ainda a taxa de matrícula, o seguro escolar e os materiais',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'O valor máximo aplica-se a TeSP, licenciaturas e mestrados integrados; mestrados e doutoramentos têm propinas próprias, muitas vezes bem mais altas',
          'Estudantes internacionais fora do espaço europeu pagam propinas de valor diferente, fixadas por cada instituição',
          'As bolsas de ação social podem cobrir a propina por inteiro, mas têm de ser requeridas dentro do prazo',
        ],
        plazo: 'as candidaturas a bolsa de ação social do ensino superior abrem antes do início do ano letivo e têm prazo próprio: perder o prazo custa o ano inteiro.',
      },
      {
        id: 'pensao',
        label: 'Quanto é uma pensão de alimentos',
        hint: 'Sem fórmula legal · decisão do tribunal',
        answer:
          'Não existe uma fórmula na lei: o tribunal reparte o custo real da criança pelos rendimentos de cada progenitor.',
        yes: [
          'Repartição proporcional: quem ganha mais suporta uma fatia maior do custo da criança',
          'Contam os rendimentos e o património de cada progenitor e as necessidades reais do filho',
          'Despesas extraordinárias de saúde e educação costumam ser repartidas à parte, meio a meio',
          'O valor é atualizável quando muda a situação de qualquer das partes',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Este número é meramente indicativo: não há fórmula legal e a fixação é sempre do Tribunal de Família e Menores',
          'O incumprimento é crime de violação da obrigação de alimentos, e existe um fundo de garantia que pode adiantar a prestação',
          'A guarda partilhada com residência alternada muda por completo a lógica do cálculo',
        ],
        plazo: 'a pensão vence-se mensalmente e pode ser exigida judicialmente desde a data em que foi pedida, não apenas desde a sentença.',
      },
    ],
  },

  inputsTitle: 'Os seus dados',
  inputsIntro:
    'Preencha o que interessa ao seu caso: os restantes campos ficam de fora da conta.',
  fields: [
    {
      id: 'rendimentoAnualAgregado',
      label: 'Rendimento anual do agregado (€)',
      value: '24.000',
      thousands: true,
      suffix: '€',
      help: 'A soma dos rendimentos anuais de todos os elementos do agregado.',
    },
    {
      id: 'nFilhos',
      label: 'Filhos com direito a abono',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'Entra no divisor do rendimento de referência: quanto mais filhos, mais baixo o rendimento de referência.',
    },
    {
      id: 'idadeAbono',
      label: 'Idade da criança',
      type: 'select',
      value: 'ate36',
      options: [
        { value: 'ate36', label: 'Até 36 meses' },
        { value: 'de36a72', label: 'Dos 36 aos 72 meses' },
        { value: 'mais72', label: 'Mais de 72 meses' },
      ],
      help: 'O abono é bastante mais alto na primeira infância.',
    },
    {
      id: 'monoparental',
      label: 'Família monoparental',
      type: 'select',
      value: 'nao',
      options: [
        { value: 'nao', label: 'Não' },
        { value: 'sim', label: 'Sim' },
      ],
      help: `Aplica a majoração de ${(ABONO.majoracaoMonoparental * 100).toLocaleString('de-DE')} % sobre o abono.`,
    },
    {
      id: 'ciclo',
      label: 'Ciclo de ensino',
      type: 'select',
      value: 'ciclo1',
      options: [
        { value: 'pre', label: 'Pré-escolar' },
        { value: 'ciclo1', label: '1.º ciclo (1.º ao 4.º ano)' },
        { value: 'ciclo2', label: '2.º ciclo (5.º e 6.º ano)' },
        { value: 'ciclo3', label: '3.º ciclo (7.º ao 9.º ano)' },
        { value: 'secundario', label: 'Secundário (10.º ao 12.º ano)' },
      ],
      help: 'O material e os extras sobem com o ciclo.',
    },
    {
      id: 'tipoEscola',
      label: 'Tipo de escola',
      type: 'select',
      value: 'publica',
      options: [
        { value: 'publica', label: 'Pública' },
        { value: 'privada', label: 'Privada' },
      ],
      help: 'Na pública os manuais são gratuitos e as refeições são mais baratas.',
    },
    {
      id: 'refeicoes',
      label: 'Come na escola',
      type: 'select',
      value: 'sim',
      options: [
        { value: 'sim', label: 'Sim' },
        { value: 'nao', label: 'Não' },
      ],
      help: 'As refeições costumam ser a maior despesa recorrente do ano letivo.',
    },
    {
      id: 'propinaAnual',
      label: 'Propina anual (€)',
      type: 'number',
      value: 710,
      min: 0,
      max: 30000,
      step: 10,
      help: `No público o máximo é ${fmtEUR(PROPINAS.maxPublicoAnual)}. No privado varia muito: confirme com a instituição.`,
    },
    {
      id: 'nAnos',
      label: 'Duração do curso (anos)',
      type: 'number',
      value: 3,
      min: 1,
      max: 8,
      step: 1,
      help: 'Licenciatura costuma ser 3 anos; mestrado integrado, 5.',
    },
    {
      id: 'nPrestacoes',
      label: 'Prestações do pagamento anual',
      type: 'number',
      value: 10,
      min: 1,
      max: 12,
      step: 1,
      help: `A maioria das instituições públicas divide em ${PROPINAS.prestacoesPadrao}.`,
    },
    {
      id: 'rendimentoPagador',
      label: 'Rendimento mensal de quem paga a pensão (€)',
      value: '1.400',
      thousands: true,
      suffix: '€',
      help: 'O progenitor que não tem a guarda.',
    },
    {
      id: 'rendimentoOutro',
      label: 'Rendimento mensal do outro progenitor (€)',
      value: '1.200',
      thousands: true,
      suffix: '€',
      help: 'O progenitor com quem a criança reside.',
    },
    {
      id: 'custoMensalCrianca',
      label: 'Custo mensal da criança (€)',
      type: 'number',
      value: 400,
      min: 0,
      max: 5000,
      step: 10,
      help: 'Alimentação, roupa, escola, saúde e a parte da habitação que lhe corresponde.',
    },
  ],
  fineprint: DISCLAIMER_FAMILY,

  chart: {
    type: 'donut',
    title: 'Como se reparte o dinheiro deste caso',
    caption:
      'Mostra a composição do resultado: as rubricas da despesa escolar, o peso de cada progenitor no custo da criança ou o abono face ao rendimento do agregado.',
  },
  breakdownTitle: 'A conta, linha a linha',
  breakdownIntro:
    'O escalão em que cai, os montantes de cada rubrica e as referências oficiais quando existem — e a indicação clara de quando o valor é apenas uma estimativa.',

  faq: [
    {
      q: 'Como se calcula o escalão do abono de família?',
      a: 'Primeiro apura-se o rendimento de referência: soma-se o rendimento anual de todo o agregado e divide-se pelo número de crianças com direito a abono mais um. Esse valor é comparado com os limites dos escalões, que são múltiplos do IAS. Do primeiro ao quarto escalão há abono; acima do quarto limite não há direito. É por isso que ter mais filhos pode baixar o escalão e aumentar o abono por criança.',
    },
    {
      q: 'Quanto se recebe de abono por mês?',
      a: `Depende do escalão e da idade da criança. Até aos 36 meses os valores são substancialmente mais altos — no primeiro escalão chegam a ${fmtEUR(ABONO.montante.ate36meses[0])} por mês — e caem depois dessa idade. A partir dos 72 meses, o quarto escalão deixa mesmo de ter direito a abono. As famílias monoparentais recebem mais ${(ABONO.majoracaoMonoparental * 100).toLocaleString('de-DE')} % sobre esse valor.`,
    },
    {
      q: 'Tenho de pedir o abono todos os anos?',
      a: 'O pedido inicial faz-se uma vez, na Segurança Social Direta. Depois disso, a prova de condição de recursos é feita oficiosamente todos os anos com base na declaração de IRS, sem ser preciso repetir nada — desde que a declaração seja entregue dentro do prazo. Quem não entrega o IRS arrisca ver o abono suspenso por falta de dados.',
    },
    {
      q: 'Os manuais escolares são mesmo gratuitos?',
      a: 'Na escola pública, sim, do 1.º ao 12.º ano, através dos vouchers da plataforma do Ministério da Educação, que se levantam normalmente a partir do final de julho. Os manuais são emprestados e têm de ser devolvidos no fim do ano letivo em bom estado. Cadernos de atividades, material de desgaste e livros auxiliares continuam a ser pagos pelas famílias.',
    },
    {
      q: 'Quanto custa mandar um filho à escola por ano?',
      a: 'O arranque de setembro — material, mochila, vestuário e extras — costuma pesar entre uma e duas centenas de euros por criança na escola pública, subindo bastante no secundário por causa de equipamento como a calculadora gráfica. A esse valor somam-se as refeições ao longo do ano letivo, que na pública são fortemente subsidiadas e na privada podem custar várias vezes mais. Os números desta calculadora são referências de mercado, não preços oficiais.',
    },
    {
      q: 'Quanto se paga de propinas no ensino superior público?',
      a: `A propina máxima de licenciaturas, TeSP e mestrados integrados subiu para ${fmtEUR(PROPINAS.maxPublicoAnual)} por ano, depois de anos congelada em ${fmtEUR(PROPINAS.anteriorAnual)}. Cada instituição pode cobrar menos, mas não mais. O pagamento é habitualmente dividido em ${PROPINAS.prestacoesPadrao} prestações ao longo do ano letivo. Mestrados não integrados e doutoramentos têm propinas fixadas livremente e costumam ser bastante mais caros.`,
    },
    {
      q: 'As bolsas cobrem a propina?',
      a: 'A bolsa de ação social do ensino superior inclui uma componente destinada a cobrir a propina, além de um valor mensal de subsistência que depende do rendimento do agregado e de o estudante estar ou não deslocado. Há ainda complementos de alojamento. O ponto crítico é o prazo: as candidaturas abrem antes do ano letivo e quem falha o prazo perde a bolsa desse ano inteiro.',
    },
    {
      q: 'Como se calcula a pensão de alimentos em Portugal?',
      a: 'Não há fórmula legal. O Código Civil manda ponderar as necessidades de quem recebe e as possibilidades de quem presta, e é o Tribunal de Família e Menores que fixa o valor caso a caso. A estimativa desta calculadora aplica o critério mais comum na prática: apura-se o custo mensal real da criança e reparte-se pelos progenitores na proporção dos rendimentos de cada um.',
    },
    {
      q: 'O que acontece se o outro progenitor não pagar a pensão?',
      a: 'O incumprimento pode ser executado judicialmente, com penhora do salário ou de contas bancárias, e constitui crime de violação da obrigação de alimentos. Existe ainda o Fundo de Garantia de Alimentos Devidos a Menores, que pode adiantar a prestação quando o devedor não paga e o agregado não tem rendimentos suficientes, dentro de limites definidos por lei.',
    },
    {
      q: 'As despesas de saúde e educação entram na pensão?',
      a: 'Normalmente não. A pensão cobre as despesas correntes e previsíveis. As despesas extraordinárias — aparelho dentário, óculos, cirurgias, viagens de estudo, explicações — costumam ficar num regime próprio no acordo de regulação das responsabilidades parentais, quase sempre repartidas em partes iguais mediante apresentação de comprovativo.',
    },
    {
      q: 'A pensão de alimentos desconta no IRS?',
      a: 'Quem paga pensão de alimentos fixada por sentença ou acordo homologado pode deduzir à coleta uma percentagem dos valores pagos, dentro de um limite por beneficiário. Do outro lado, a pensão recebida é rendimento tributável da criança, ainda que na prática fique quase sempre isenta por ficar abaixo do mínimo de existência. Guarde os comprovativos: sem eles a dedução não passa.',
    },
    {
      q: 'Receber abono impede outros apoios?',
      a: 'Não. O abono de família acumula com a Ação Social Escolar, com as bolsas do ensino superior e com prestações como o subsídio parental. O que acontece é que quase todos usam a mesma condição de recursos, por isso quem entra no escalão mais baixo de um costuma entrar no dos outros. Vale a pena verificar todos de uma vez, porque cada um se requer separadamente.',
    },
  ],

  sources: [
    {
      name: 'Portaria n.º 60/2026/1 — montantes do abono de família',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/60-2026',
      publisher: 'Diário da República',
    },
    {
      name: 'Segurança Social — abono de família para crianças e jovens',
      url: 'https://www.seg-social.pt/abono-de-familia-para-criancas-e-jovens',
      publisher: 'Segurança Social',
    },
    {
      name: 'Direção-Geral do Ensino Superior — propinas e ação social',
      url: 'https://www.dges.gov.pt/',
      publisher: 'DGES',
    },
    {
      name: 'Ministério da Educação — manuais escolares gratuitos',
      url: 'https://www.manuaisescolares.pt/',
      publisher: 'Ministério da Educação',
    },
    {
      name: 'Código Civil — arts. 2003.º e 2004.º, obrigação de alimentos',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075',
      publisher: 'Diário da República',
    },
    {
      name: 'Portaria n.º 480-A/2025/1 — valor do IAS, base dos escalões do abono',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025',
      publisher: 'Diário da República',
      date: '30-12-2025',
    },
  ],

  replaces: [
    '/pt-pt/simulador-abono-de-familia-2026-escaloes-portugal',
    '/pt-pt/calculadora-orcamento-regresso-as-aulas-2026',
    '/pt-pt/calculadora-propinas-universidade-portugal-2026',
    '/pt-pt/simulador-pensao-alimentos-filhos-portugal',
  ],

  lastReviewed: '2026-07-28',
};
