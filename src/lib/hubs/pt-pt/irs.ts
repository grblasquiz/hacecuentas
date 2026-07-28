import type { HubData } from '../types';
import { PORTUGAL_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "IRS: quanto pago, quanto me devolvem e quando recebo?"
 *
 * Absorve quatro calculadoras que respondiam pedaços da mesma declaração anual:
 * reembolso e prazos, tributação conjunta vs separada, mais-valias de ações e
 * cripto, e recibos verdes.
 *
 * Constantes: src/lib/data/portugal-2026.ts. As que não vivem lá (coeficientes
 * do regime simplificado e prazos da campanha) estão marcadas com a norma.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `tax`. */
const DISCLAIMER_TAX =
  'Estimativa informativa baseada nos parâmetros indicados. Regras e faixas podem mudar; confira o órgão fiscal aplicável e consulte um profissional tributário para a apuração definitiva.';

export const IAS = PORTUGAL_2026.ias;

/**
 * Escalões de IRS (Lei n.º 73-A/2025), taxas marginais reais.
 * `Infinity` não sobrevive à serialização de `define:vars` → viaja como null.
 */
export const ESCALOES = PORTUGAL_2026.irs.escaloes.map((e) => ({
  ate: Number.isFinite(e.ateEuros) ? e.ateEuros : null,
  taxa: e.taxa,
}));

export const IRS_BASES = {
  deducaoEspecifica: PORTUGAL_2026.irs.deducaoEspecificaTrabalho,
  fatorIas: PORTUGAL_2026.irs.deducaoEspecificaFatorIas,
  minimoExistencia: PORTUGAL_2026.irs.minimoExistenciaAnual,
  /** Taxa autónoma de mais-valias mobiliárias e de rendimentos de capitais (art. 72.º CIRS). */
  taxaAutonoma: PORTUGAL_2026.irs.taxaAutonomaMaisValias,
};

export const SS = {
  trabalhador: PORTUGAL_2026.segSocial.trabalhador,
  independenteGeral: PORTUGAL_2026.segSocial.independente.taxaGeral,
  relevanteServicos: PORTUGAL_2026.segSocial.independente.percRendimentoRelevanteServicos,
  relevanteBens: PORTUGAL_2026.segSocial.independente.percRendimentoRelevanteBens,
  baseMaximaMensal: PORTUGAL_2026.segSocial.independente.baseMaximaMensal,
};

/**
 * Coeficientes do regime simplificado da Categoria B (art. 31.º do CIRS).
 * NÃO vivem em portugal-2026.ts: estavam escritos na fórmula da calculadora de
 * recibos verdes. Mantêm-se aqui com a norma à vista para poderem ser auditados.
 */
export const CAT_B = {
  coefServicos: 0.75,
  coefBens: 0.15,
};

/**
 * Prazos da campanha de IRS. A entrega decorre de 1 de abril a 30 de junho; a
 * liquidação tem de estar feita até 31 de julho e o reembolso pago até 31 de
 * agosto para as declarações entregues dentro do prazo (CIRS).
 * As janelas em dias são a observação das últimas campanhas da AT, não um prazo legal.
 */
export const PRAZOS = {
  entregaDe: '2026-04-01',
  entregaAte: '2026-06-30',
  liquidacaoAte: '2026-07-31',
  reembolsoAte: '2026-08-31',
  diasAutomatico: [10, 15],
  diasNormal: [17, 30],
  diasForaDePrazo: [30, 120],
};

export const hub: HubData = {
  slug: 'pt-pt/impostos/irs',
  title: 'IRS em Portugal: quanto pago, quanto me devolvem e quando recebo',
  description:
    'Simule o IRS do ano com os escalões em vigor: saldo a pagar ou a reembolsar, tributação conjunta ou separada dos casados, mais-valias de ações e cripto a 28 %, recibos verdes e a janela real do reembolso.',
  silo: 'Impostos',
  siloHref: '/pt-pt/impostos',
  locale: 'pt-pt',

  eyebrow: 'Portugal · continente · declaração anual',
  h1: 'IRS: quanto paga, quanto lhe devolvem e quando recebe.',
  lede:
    'Uma só conta responde às três perguntas. Com o rendimento do ano e o que já lhe retiveram, a calculadora apura o imposto pelos escalões, diz-lhe se fica com saldo a pagar ou a receber, e estima quando é que o reembolso cai na conta.',
  stamps: [
    `9 escalões · ${(ESCALOES[0].taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} % a ${(ESCALOES[ESCALOES.length - 1].taxa * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 })} %`,
    `Dedução específica ${fmtEUR(IRS_BASES.deducaoEspecifica)} · mínimo de existência ${fmtEUR(IRS_BASES.minimoExistencia)}`,
    '4 calculadoras lá dentro',
  ],

  resultLabel: 'Saldo de IRS do ano',

  cases: {
    title: 'De onde vem o seu rendimento?',
    intro:
      'A tabela do imposto é a mesma para todos, mas o que se abate antes muda muito conforme a categoria. Começamos pelo caso mais frequente.',
    items: [
      {
        id: 'dependente',
        label: 'Sou trabalhador por conta de outrem',
        hint: 'Categoria A · trabalho dependente',
        answer:
          'O imposto sai dos escalões depois de abater a dedução específica; o que já lhe retiveram durante o ano é adiantamento e acerta-se agora.',
        yes: [
          `Dedução específica de ${fmtEUR(IRS_BASES.deducaoEspecifica)} (${IRS_BASES.fatorIas} × IAS) ou o total das contribuições para a Segurança Social, o que for maior`,
          `Mínimo de existência de ${fmtEUR(IRS_BASES.minimoExistencia)}: abaixo disso não há IRS a pagar`,
          'As retenções na fonte de todo o ano abatem-se ao imposto apurado',
          'Deduções à coleta: saúde, educação, habitação, lares, IVA de faturas e dependentes',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Esta conta usa a dedução específica; as suas deduções à coleta reais (faturas, saúde, educação) podem baixar ainda mais o imposto',
          'Se tiver mais do que uma entidade pagadora, cada uma retém como se fosse a única: é a causa mais comum de ficar com IRS a pagar no fim',
        ],
        plazo: 'a declaração entrega-se entre 1 de abril e 30 de junho; a liquidação tem de estar feita até 31 de julho e o reembolso pago até 31 de agosto.',
      },
      {
        id: 'casados',
        label: 'Somos casados ou unidos de facto',
        hint: 'Conjunta vs separada · quociente conjugal',
        answer:
          'A tributação conjunta divide o rendimento do casal por dois antes de aplicar os escalões: compensa quando os rendimentos são muito diferentes.',
        yes: [
          'Opção pela tributação conjunta assinalada na declaração, ano a ano',
          'Quociente conjugal: soma-se o rendimento dos dois, divide-se por dois, apura-se o imposto e multiplica-se por dois',
          'Com rendimentos parecidos, conjunta e separada dão praticamente o mesmo',
          'Unidos de facto há mais de dois anos podem optar pela tributação conjunta como se fossem casados',
        ],
        warn: [
          DISCLAIMER_TAX,
          'A opção é feita todos os anos e não se altera depois do prazo de entrega: vale a pena simular antes de submeter',
          'Em tributação conjunta os dois respondem solidariamente pela dívida de imposto',
          'Este simulador compara só o efeito dos escalões; as deduções à coleta e os limites por agregado podem mudar qual das opções ganha',
        ],
        plazo: 'a opção assinala-se na declaração modelo 3, entregue entre 1 de abril e 30 de junho.',
      },
      {
        id: 'maisvalias',
        label: 'Vendi ações, ETF ou criptoativos',
        hint: 'Categoria G · taxa autónoma de 28 %',
        answer: `A mais-valia é tributada à taxa autónoma de ${(IRS_BASES.taxaAutonoma * 100).toLocaleString('de-DE')} %, com opção de englobamento — e a cripto detida um ano ou mais está isenta.`,
        yes: [
          `Mais-valia = valor de realização − valor de aquisição − despesas e comissões`,
          `Ações e ETF: ${(IRS_BASES.taxaAutonoma * 100).toLocaleString('de-DE')} % sobre a mais-valia, com opção de englobar aos restantes rendimentos`,
          'Criptoativos detidos 365 dias ou mais: isentos de IRS (detenção não profissional)',
          'Menos-valias do ano podem ser compensadas com as mais-valias do mesmo ano',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Ativos detidos há menos de 365 dias por quem fica no escalão mais alto são de englobamento obrigatório — nesse caso a taxa não é 28 %, é a marginal',
          'Quem faz da compra e venda a sua atividade sai da categoria G e passa a categoria B: o regime é outro',
          'Mais-valias em contas no estrangeiro obrigam ao anexo J e à comunicação das contas, mesmo quando não há imposto a pagar',
        ],
        plazo: 'as mais-valias declaram-se no anexo G da modelo 3, no mesmo prazo de 1 de abril a 30 de junho.',
      },
      {
        id: 'independente',
        label: 'Passo recibos verdes',
        hint: 'Categoria B · regime simplificado',
        answer:
          'No regime simplificado só uma parte do que fatura é rendimento tributável — mas a Segurança Social cobra à parte, todos os meses.',
        yes: [
          `Coeficiente de ${CAT_B.coefServicos.toLocaleString('de-DE')} na prestação de serviços e de ${CAT_B.coefBens.toLocaleString('de-DE')} na venda de bens (art. 31.º do CIRS)`,
          `Segurança Social: ${(SS.independenteGeral * 100).toLocaleString('de-DE')} % sobre ${(SS.relevanteServicos * 100).toLocaleString('de-DE')} % do faturado em serviços (ou ${(SS.relevanteBens * 100).toLocaleString('de-DE')} % na venda de bens)`,
          `Base contributiva mensal com tope em 12 × IAS = ${fmtEUR(SS.baseMaximaMensal)}`,
          'No primeiro ano de atividade há isenção de contribuições durante doze meses',
        ],
        warn: [
          DISCLAIMER_TAX,
          'A parte do rendimento que o coeficiente deixa de fora tem de ser justificada com despesas da atividade acima de um certo nível de faturação: sem faturas, o imposto sobe',
          'A Segurança Social é trimestral e independente do IRS: mesmo com IRS zero, as contribuições pagam-se',
          'Quem tem um único cliente com mais de 80 % da faturação obriga essa entidade a contribuir também — e fica exposto a uma requalificação do contrato',
        ],
        plazo: 'a declaração trimestral de rendimentos à Segurança Social entrega-se até ao dia 20 de janeiro, abril, julho e outubro.',
      },
    ],
  },

  inputsTitle: 'Os seus números do ano',
  inputsIntro:
    'Tudo em euros e em valores anuais do ano que está a declarar. Preencha o que interessa ao seu caso — os restantes campos ficam de fora da conta.',
  fields: [
    {
      id: 'rendimento1',
      label: 'Rendimento bruto anual (€)',
      value: '25.200',
      thousands: true,
      suffix: '€',
      help: 'Tudo o que recebeu no ano. Num salário mensal, são 14 vezes o bruto.',
    },
    {
      id: 'rendimento2',
      label: 'Rendimento bruto anual do outro titular (€)',
      value: '14.000',
      thousands: true,
      suffix: '€',
      help: 'Só conta no caso dos casados ou unidos de facto.',
    },
    {
      id: 'retencoes',
      label: 'IRS retido na fonte durante o ano (€)',
      value: '2.400',
      thousands: true,
      suffix: '€',
      help: 'A soma das retenções dos recibos de vencimento ou dos recibos verdes.',
    },
    {
      id: 'tipoAtividade',
      label: 'Atividade nos recibos verdes',
      type: 'select',
      value: 'servicos',
      options: [
        { value: 'servicos', label: 'Prestação de serviços' },
        { value: 'bens', label: 'Venda de bens ou mercadorias' },
      ],
      help: 'Muda o coeficiente do IRS e a base da Segurança Social.',
    },
    {
      id: 'tipoAtivo',
      label: 'Ativo que vendeu',
      type: 'select',
      value: 'acoes',
      options: [
        { value: 'acoes', label: 'Ações' },
        { value: 'etf', label: 'ETF ou fundos' },
        { value: 'cripto', label: 'Criptoativos' },
      ],
      help: 'A cripto detida 365 dias ou mais está isenta; ações e ETF não têm essa isenção.',
    },
    {
      id: 'valorVenda',
      label: 'Valor de venda (€)',
      value: '12.000',
      thousands: true,
      suffix: '€',
      help: 'O valor de realização, antes de comissões.',
    },
    {
      id: 'valorCompra',
      label: 'Valor de aquisição (€)',
      value: '9.000',
      thousands: true,
      suffix: '€',
      help: 'O que pagou pelo ativo quando o comprou.',
    },
    {
      id: 'despesas',
      label: 'Comissões e despesas (€)',
      type: 'number',
      value: 120,
      min: 0,
      step: 1,
      help: 'Comissões de compra e de venda, que abatem à mais-valia.',
    },
    {
      id: 'diasDetencao',
      label: 'Dias que deteve o ativo',
      type: 'number',
      value: 400,
      min: 0,
      max: 20000,
      step: 1,
      help: 'A partir de 365 dias a cripto fica isenta.',
    },
    {
      id: 'dataEntrega',
      label: 'Data em que entregou a declaração',
      type: 'date',
      value: '2026-04-15',
      help: 'Serve para estimar a janela do reembolso.',
    },
    {
      id: 'tipoEntrega',
      label: 'Como entregou a declaração',
      type: 'select',
      value: 'automatico',
      options: [
        { value: 'automatico', label: 'IRS Automático' },
        { value: 'normal', label: 'Modelo 3, preenchida por si' },
      ],
      help: 'O IRS Automático costuma ser pago bastante mais depressa.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'O que acontece ao rendimento do ano',
    caption:
      'Compara a parte do rendimento que fica consigo com a que sai para o IRS e, quando existe, para a Segurança Social.',
  },
  breakdownTitle: 'A sua declaração, linha a linha',
  breakdownIntro:
    'A mesma ordem da modelo 3: rendimento, o que se abate, o rendimento coletável, o escalão, o imposto e o acerto com o que já lhe retiveram.',

  faq: [
    {
      q: 'Quando é que se entrega o IRS e quando chega o reembolso?',
      a: 'A declaração entrega-se entre 1 de abril e 30 de junho, sem distinção por categoria de rendimento. Para quem entrega dentro do prazo, a liquidação tem de estar feita até 31 de julho e o reembolso pago até 31 de agosto. Na prática a Autoridade Tributária costuma pagar muito antes: nas últimas campanhas, o IRS Automático foi reembolsado em cerca de duas semanas e a modelo 3 preenchida manualmente em três a quatro semanas.',
    },
    {
      q: 'Porque é que ainda não recebi o meu reembolso?',
      a: 'As causas mais comuns são o IBAN desatualizado no Portal das Finanças, uma divergência assinalada na declaração, dívidas fiscais ou à Segurança Social que levam à compensação do crédito, ou a declaração ter sido selecionada para verificação. Pode acompanhar tudo em "Consultar Declaração" no Portal das Finanças: enquanto o estado não passar a "liquidada", não há reembolso a caminho.',
    },
    {
      q: 'Compensa entregar em conjunto ou em separado?',
      a: 'Depende da diferença de rendimentos entre os dois. A tributação conjunta aplica o quociente conjugal: soma os rendimentos, divide por dois, calcula o imposto sobre essa metade e multiplica por dois. Como os escalões são progressivos, isso baixa a taxa média quando um dos titulares ganha muito mais do que o outro. Com rendimentos parecidos a poupança é praticamente nula, e há casos em que a separada ganha por causa das deduções. Simule antes de submeter — depois do prazo a opção já não se muda.',
    },
    {
      q: 'Quanto se paga de IRS sobre mais-valias de ações?',
      a: `A taxa autónoma é de ${(IRS_BASES.taxaAutonoma * 100).toLocaleString('de-DE')} % sobre a mais-valia, e pode optar pelo englobamento se a sua taxa marginal for mais baixa. Atenção a uma regra que apanha muita gente: quem fica no escalão mais alto e vendeu ativos detidos há menos de 365 dias é obrigado a englobar, e aí a taxa deixa de ser 28 % e passa a ser a marginal. Menos-valias do mesmo ano podem ser compensadas com as mais-valias.`,
    },
    {
      q: 'A cripto paga IRS em Portugal?',
      a: 'Paga, desde 2023. Ganhos com criptoativos detidos menos de 365 dias são tributados a 28 % na categoria G. Detidos 365 dias ou mais ficam isentos, desde que a atividade não seja profissional. Quem compra e vende com regularidade, com meios organizados, cai na categoria B e nesse caso não há isenção nenhuma — passa a ser rendimento empresarial.',
    },
    {
      q: 'Quanto fica para mim nos recibos verdes?',
      a: `No regime simplificado, o rendimento tributável é ${CAT_B.coefServicos.toLocaleString('de-DE')} do que fatura em prestação de serviços (ou ${CAT_B.coefBens.toLocaleString('de-DE')} na venda de bens), e é sobre esse valor que correm os escalões. À parte, a Segurança Social cobra ${(SS.independenteGeral * 100).toLocaleString('de-DE')} % sobre ${(SS.relevanteServicos * 100).toLocaleString('de-DE')} % do faturado, com base mensal limitada a ${fmtEUR(SS.baseMaximaMensal)}. Somando as duas coisas, a carga costuma andar entre um quarto e um terço do que fatura.`,
    },
    {
      q: 'O que é a dedução específica?',
      a: `É um abatimento automático ao rendimento de trabalho dependente e de pensões, antes de aplicar os escalões. Vale ${IRS_BASES.fatorIas} × IAS = ${fmtEUR(IRS_BASES.deducaoEspecifica)} por ano, ou o total das contribuições obrigatórias para a Segurança Social se for maior. Não é preciso pedir nem justificar: aplica-se sempre.`,
    },
    {
      q: 'A partir de que rendimento se começa a pagar IRS?',
      a: `Pelo mínimo de existência, um rendimento anual até ${fmtEUR(IRS_BASES.minimoExistencia)} não paga IRS. Esse valor está calibrado para coincidir com 14 vezes a retribuição mínima mensal garantida, precisamente para que quem ganha o salário mínimo não tenha imposto. Acima disso entra a dedução específica e só o que sobra passa pelos escalões.`,
    },
    {
      q: 'O que é o IRS Automático e posso confiar nele?',
      a: 'É uma declaração pré-preenchida que a Autoridade Tributária apresenta a quem só tem rendimentos simples de trabalho dependente ou pensões, sem anexos complicados. Se aceitar sem alterar, é entregue nesse momento e o reembolso costuma sair muito mais depressa. Vale a pena confirmar sempre os dependentes, as deduções e o IBAN antes de confirmar: aceitar um pré-preenchido errado é da sua responsabilidade, não da AT.',
    },
    {
      q: 'O que acontece se entregar fora do prazo?',
      a: 'A declaração continua a poder ser entregue, mas perde as garantias de calendário: os limites de 31 de julho para a liquidação e de 31 de agosto para o reembolso deixam de se aplicar, e o pagamento pode arrastar-se meses. Além disso, a entrega fora de prazo tem coima própria, mais baixa se for regularizada voluntariamente antes de qualquer notificação da AT.',
    },
    {
      q: 'Porque é que me ficou IRS a pagar se me retiveram todos os meses?',
      a: 'Quase sempre por ter mais do que uma fonte de rendimento. Cada entidade retém como se fosse a única pagadora, por isso, quando os rendimentos se somam na declaração, o conjunto sobe de escalão e a retenção feita fica curta. Acontece o mesmo a quem mudou de emprego a meio do ano ou acumulou trabalho dependente com recibos verdes. A solução preventiva é pedir a uma das entidades que retenha a uma taxa mais alta.',
    },
    {
      q: 'Qual é a diferença entre taxa marginal e taxa efetiva?',
      a: 'A marginal é a do escalão onde cai o seu rendimento coletável, e aplica-se apenas à parte que entra nesse escalão: é o que paga o seu último euro. A efetiva é o imposto total a dividir pelo rendimento bruto e dá sempre bastante menos. Alguém com taxa marginal de 34,9 % pode ter uma taxa efetiva à volta dos 15 %. É esse o efeito de uma tabela progressiva.',
    },
  ],

  sources: [
    {
      name: 'Lei n.º 73-A/2025 — Orçamento do Estado, escalões de IRS',
      url: 'https://diariodarepublica.pt/dr/detalhe/lei/73-a-2025',
      publisher: 'Diário da República',
    },
    {
      name: 'Código do IRS — texto consolidado',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Autoridade Tributária — entrega da declaração modelo 3 de IRS',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Modelo3_IRS/',
      publisher: 'Portal das Finanças',
    },
    {
      name: 'Portaria n.º 480-A/2025/1 — valor do IAS',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025',
      publisher: 'Diário da República',
      date: '30-12-2025',
    },
    {
      name: 'Segurança Social — trabalhadores independentes, contribuições',
      url: 'https://www.seg-social.pt/trabalhadores-independentes',
      publisher: 'Segurança Social',
    },
    {
      name: 'Código dos Regimes Contributivos — regime dos trabalhadores independentes',
      url: 'https://www.seg-social.pt/legislacao',
      publisher: 'Segurança Social',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-reembolso-irs-2026-quando-recebo',
    '/pt-pt/simulador-irs-conjunto-vs-separado-casados-portugal',
    '/pt-pt/calculadora-mais-valias-acoes-cripto-irs-portugal',
    '/pt-pt/calculadora-recibos-verdes-trabalhador-independente-portugal',
  ],

  lastReviewed: '2026-07-28',
};
