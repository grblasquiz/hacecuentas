import type { HubData } from '../types';
import {
  IRRF_FAIXAS,
  IRRF_DEDUCAO_DEPENDENTE,
  IRRF_ISENCAO_REDUTOR,
  IRRF_REDUTOR_TETO,
} from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Preciso declarar, quanto pago e quando cai a restituição?"
 *
 * Absorve 3 calculadoras soltas (restituição por lote, IR de swing trade e DARF
 * de cripto) e resolve, no mesmo lugar, a decisão que fica de fora delas:
 * declaração simplificada ou completa.
 *
 * As faixas do IRPF saem de src/lib/data/brasil-2026.ts, a mesma fonte do
 * simulador de holerite. Anualizadas por 12, que é como a Receita monta a tabela
 * da declaração a partir da tabela mensal.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. A tabela do imposto de renda, os limites de obrigatoriedade e o calendário de restituição mudam por instrução normativa a cada ano; confira o programa oficial da Receita Federal e, em caso de dúvida, consulte um contador antes de declarar.';

/** Tabela anual do IRPF = tabela mensal × 12 (art. 1º da Lei 11.482/2007 e alterações). */
export const IRPF_ANUAL = IRRF_FAIXAS.map((f) => ({
  ate: Number.isFinite(f.ate) ? f.ate * 12 : null,
  aliquota: f.aliquota,
  deduzir: f.deduzir * 12,
}));

export const DEDUCAO_DEPENDENTE_ANUAL = IRRF_DEDUCAO_DEPENDENTE * 12;
export const REDUTOR_ANUAL = {
  isencao: IRRF_ISENCAO_REDUTOR * 12,
  teto: IRRF_REDUTOR_TETO * 12,
};

/** Desconto simplificado: 20% da renda tributável, com teto anual. */
export const SIMPLIFICADO_PERCENTUAL = 0.2;
/**
 * 🔴 Teto do desconto simplificado anual: NÃO existe em src/lib/data/brasil-2026.ts
 * nem nas fórmulas antigas. Vai como valor inicial de um campo editável, com aviso
 * no `help`, para o usuário confirmar na instrução normativa da DIRPF do ano.
 */
export const SIMPLIFICADO_TETO_PADRAO = 16_754.34;

/** Ações na B3 — Lei 11.033/2004 art. 3º I e Lei 8.981/1995 art. 72 §§. */
export const ACOES = {
  /** Isenção mensal: vale pelo VALOR DE VENDA, não pelo lucro, e só no swing trade de ações. */
  isencaoVendasMes: 20_000,
  aliquotaSwing: 0.15,
  aliquotaDayTrade: 0.2,
  darf: '6015',
  /** Retenção "dedo-duro" na fonte: 0,005% no swing, 1% no day trade. */
  fonteSwing: 0.00005,
  fonteDayTrade: 0.01,
};

/** Criptoativos — IN RFB 1.888/2019 e Lei 13.259/2016 (ganho de capital progressivo). */
export const CRIPTO = {
  isencaoVendasMes: 35_000,
  /** Obrigação de informar operações à Receita quando o volume do mês passa disso. */
  limiteDeclaracaoMensal: 30_000,
  /** Saldo em custódia a partir do qual a posição vai na ficha Bens e Direitos. */
  limiteBensEDireitos: 5_000,
  darf: '4600',
  /** Faixas progressivas do ganho de capital — art. 21 da Lei 8.981/1995 (Lei 13.259/2016). */
  faixas: [
    { ate: 5_000_000, aliquota: 0.15 },
    { ate: 10_000_000, aliquota: 0.175 },
    { ate: 30_000_000, aliquota: 0.2 },
    { ate: null as number | null, aliquota: 0.225 },
  ],
};

/**
 * Calendário de lotes da restituição. As datas mudam todo ano por instrução
 * normativa; o que não muda é a ordem de prioridade legal e a regra de correção
 * (Selic acumulada do mês seguinte ao prazo de entrega até o mês anterior ao
 * pagamento, mais 1% no mês do pagamento — art. 16 da Lei 9.250/1995).
 */
export const LOTES = [
  { id: 'l1', meses: 0 },
  { id: 'l2', meses: 1 },
  { id: 'l3', meses: 2 },
  { id: 'l4', meses: 3 },
  { id: 'l5', meses: 4 },
];

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/dinheiro/imposto-de-renda',
  title: 'Imposto de Renda 2026: quem declara e quanto paga ou recebe',
  description:
    'Simule o Imposto de Renda 2026: declaração simplificada ou completa, imposto a pagar ou restituir, lotes da restituição, day trade na B3 e DARF de cripto.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · DIRPF · Receita Federal',
  h1: 'Quanto você paga (ou recebe de volta) no imposto de renda.',
  lede:
    'A conta do imposto de renda é sempre a mesma: rendimento tributável menos deduções, tabela progressiva sobre o que sobrou, menos o que já foi retido na fonte. O que muda de pessoa para pessoa é qual desconto vale mais — o simplificado de 20% ou a soma das deduções legais — e o que fazer com o que veio da bolsa e das criptos.',
  stamps: [
    'Tabela progressiva vigente do IRPF · Lei 9.250/1995 e Lei 11.482/2007',
    'Isenção de R$ 20 mil em ações (Lei 11.033/2004) e de R$ 35 mil em cripto (IN RFB 1.888/2019)',
    '3 calculadoras dentro',
  ],

  resultLabel: 'Imposto a pagar ou a restituir',

  cases: {
    title: 'De onde vem a sua renda?',
    intro:
      'Cada origem de renda tem uma regra própria, e é comum a mesma pessoa cair em mais de uma. Escolha a que responde a sua dúvida principal — as demais continuam valendo e estão explicadas abaixo.',
    items: [
      {
        id: 'assalariado',
        label: 'Salário, aposentadoria ou aluguel',
        hint: 'Restituição, ajuste anual e lote de pagamento',
        answer:
          'O ajuste anual compara o que foi retido na fonte com o que era devido pela tabela: a diferença vira restituição ou imposto a pagar.',
        yes: [
          'Rendimento tributável do ano, somando todas as fontes pagadoras',
          'Escolha automática entre desconto simplificado de 20% e soma das deduções legais',
          'Dedução por dependente, previdência oficial, PGBL, despesas médicas sem teto e instrução com limite',
          'Comparação com o IRRF já retido para achar a restituição',
        ],
        warn: [
          AVISO_LEGAL,
          'Quem tem mais de uma fonte pagadora quase sempre cai com imposto a pagar: cada fonte reteve como se fosse a única, aplicando a faixa isenta duas vezes',
          'Despesa médica não tem teto, mas é a que mais cai na malha fina: guarde recibo com CPF do profissional, e o valor precisa ter sido efetivamente pago por você',
          'Aluguel recebido de pessoa física exige carnê-leão mensal, com DARF pago até o último dia útil do mês seguinte — não basta declarar no ano seguinte',
        ],
        plazo:
          'a entrega vai de março a maio; quem entrega no primeiro dia costuma cair no primeiro lote, respeitadas as prioridades legais.',
      },
      {
        id: 'acoes',
        label: 'Ações e fundos na B3',
        hint: 'Isenção de R$ 20 mil, swing 15%, day trade 20%',
        answer:
          'Vendeu até R$ 20 mil em ações no mês, no swing trade, o lucro é isento; passou disso, 15% sobre o ganho, com DARF pago no mês seguinte.',
        yes: [
          'A isenção olha o VALOR VENDIDO no mês, não o lucro: vender R$ 19 mil com R$ 8 mil de lucro é isento',
          'Swing trade: 15% sobre o ganho líquido do mês, apurado por operação',
          'Day trade: 20% sobre o ganho, sem isenção nenhuma, em qualquer valor',
          'Prejuízo compensa lucro futuro sem prazo de validade, mas só dentro da mesma modalidade',
          'DARF 6015, vencimento no último dia útil do mês seguinte ao da apuração',
        ],
        warn: [
          AVISO_LEGAL,
          'A isenção de R$ 20 mil não vale para day trade, ETF, FII, BDR, opções nem contratos futuros: em todos esses, qualquer lucro é tributado',
          'A corretora retém 0,005% na fonte no swing trade e 1% no day trade — é o "dedo-duro", que informa à Receita que houve operação; esse valor é deduzido do DARF',
          'Prejuízo de swing trade não compensa lucro de day trade, e vice-versa: são compartimentos separados',
          'O imposto é apurado e pago por você, não pela corretora; atraso gera multa de 0,33% ao dia, limitada a 20%, mais juros pela Selic',
        ],
        plazo:
          'o DARF vence no último dia útil do mês seguinte ao da venda; o valor mínimo para emissão de DARF é R$ 10, e abaixo disso o imposto é acumulado para o mês seguinte.',
      },
      {
        id: 'cripto',
        label: 'Criptomoedas',
        hint: 'Isenção de R$ 35 mil por mês, 15% acima disso',
        answer:
          'Vendeu até R$ 35 mil em cripto no mês, somando todas as moedas, o ganho é isento; acima disso, ganho de capital com alíquota a partir de 15%.',
        yes: [
          'A isenção mensal de R$ 35 mil soma TODAS as criptomoedas vendidas no mês, não uma a uma',
          'Passando do limite, o ganho é tributado pelas faixas do ganho de capital: 15%, 17,5%, 20% e 22,5%',
          'DARF 4600, com vencimento no último dia útil do mês seguinte',
          'Saldo em custódia acima de R$ 5 mil por tipo de ativo vai na ficha Bens e Direitos, mesmo sem venda no ano',
        ],
        warn: [
          AVISO_LEGAL,
          'Troca de uma cripto por outra é fato gerador: mesmo sem sacar para reais, houve alienação e o ganho pode ser tributável',
          'Operações acima de R$ 30 mil no mês em exchange estrangeira ou entre pessoas exigem declaração mensal à Receita pelo e-CAC, com multa própria por atraso',
          'A exchange nacional informa suas operações à Receita: a omissão é detectada por cruzamento automático',
          'As faixas do ganho de capital são progressivas por parcela, como no IRPF — aplicar 17,5% sobre o ganho inteiro superestima o imposto de quem passou pouco dos R$ 5 milhões',
        ],
        plazo:
          'a declaração mensal de operações, quando obrigatória, vence no último dia útil do mês seguinte ao das operações.',
      },
      {
        id: 'modelo',
        label: 'Simplificada ou completa?',
        hint: 'Comparação direta das duas contas',
        answer:
          'Some as deduções legais que você consegue comprovar: se derem mais que o desconto simplificado, a completa vence; se derem menos, a simplificada.',
        yes: [
          'Simplificada: desconto de 20% da renda tributável, limitado a um teto anual, sem precisar comprovar nada',
          'Completa: soma das deduções legais efetivamente comprovadas',
          'Despesa médica sem limite de valor, para você e seus dependentes',
          'Instrução com limite anual por pessoa, previdência oficial integral e PGBL até 12% da renda',
          'Pensão alimentícia judicial integral e dependentes com valor fixo por cabeça',
        ],
        warn: [
          AVISO_LEGAL,
          'O programa da Receita calcula as duas e sugere a mais vantajosa, mas só com o que você digitou: deduções não lançadas não entram na comparação',
          'Dependente traz dedução, mas também traz os rendimentos dele para a sua declaração — às vezes é melhor deixar de fora',
          'Plano de saúde de empresa descontado em folha é dedutível apenas na parte que você pagou, não na parte da empresa',
          'Gasto com academia, medicamento de farmácia, vacina e material escolar não é dedutível, por mais que a despesa seja de saúde ou de ensino',
        ],
        plazo:
          'a opção pode ser trocada por declaração retificadora enquanto não terminar o prazo de entrega; depois disso, o modelo fica travado.',
      },
    ],
  },

  inputsTitle: 'Os números do seu ano',
  inputsIntro:
    'Preencha o que se aplica ao seu caso e deixe o resto em zero. Os campos de bolsa e cripto são mensais, porque essas apurações são mensais por lei.',
  fields: [
    {
      id: 'situacao',
      label: 'O que você quer calcular',
      type: 'select',
      value: 'assalariado',
      options: [
        { value: 'assalariado', label: 'Ajuste anual: quanto pago ou recebo de volta' },
        { value: 'acoes', label: 'IR do mês em ações na B3' },
        { value: 'cripto', label: 'DARF de criptomoedas do mês' },
      ],
      help: 'A comparação entre declaração simplificada e completa aparece sempre no ajuste anual.',
    },
    {
      id: 'rendimentoAnual',
      label: 'Rendimento tributável do ano (R$)',
      prefix: 'R$',
      value: '90.000',
      thousands: true,
      help: 'Soma dos informes de rendimento de todas as fontes pagadoras, antes de qualquer desconto.',
    },
    {
      id: 'irrfRetido',
      label: 'IRRF já retido na fonte no ano (R$)',
      prefix: 'R$',
      value: '7.000',
      thousands: true,
      help: 'Está no informe de rendimentos, na linha de imposto retido na fonte.',
    },
    {
      id: 'inss',
      label: 'INSS descontado no ano (R$)',
      prefix: 'R$',
      value: '8.000',
      thousands: true,
      help: 'Previdência oficial é dedutível integralmente na declaração completa.',
    },
    {
      id: 'dependentes',
      label: 'Dependentes',
      type: 'number',
      value: 0,
      min: 0,
      max: 15,
      step: 1,
      help: `Cada dependente deduz ${brl(DEDUCAO_DEPENDENTE_ANUAL)} por ano na declaração completa.`,
    },
    {
      id: 'saude',
      label: 'Despesas médicas do ano (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Sem limite de valor, mas exige comprovação com CPF ou CNPJ do prestador.',
    },
    {
      id: 'outrasDeducoes',
      label: 'Outras deduções: instrução, PGBL, pensão judicial (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Some aqui o que já está dentro dos respectivos limites legais de cada rubrica.',
    },
    {
      id: 'tetoSimplificado',
      label: 'Teto do desconto simplificado no ano (R$)',
      prefix: 'R$',
      value: '16.754,34',
      thousands: true,
      help: 'Confirme o valor vigente na instrução normativa da DIRPF do ano: ele é reajustado e não está travado nesta conta de propósito.',
    },
    {
      id: 'selicMensal',
      label: 'Selic mensal para corrigir a restituição (%)',
      type: 'number',
      value: 1.1,
      min: 0,
      max: 5,
      step: 0.01,
      suffix: '%',
      help: 'A restituição é corrigida pela Selic acumulada mais 1% no mês do pagamento. Use a Selic do mês publicada pelo Banco Central.',
    },
    {
      id: 'vendasMes',
      label: 'Valor total vendido no mês, em ações ou cripto (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'É o valor da venda, não o lucro. É ele que define a isenção de R$ 20 mil (ações) e de R$ 35 mil (cripto).',
    },
    {
      id: 'lucroMes',
      label: 'Lucro do mês nessas operações (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Venda menos custo de aquisição menos corretagem e emolumentos.',
    },
    {
      id: 'prejuizoAcumulado',
      label: 'Prejuízo acumulado a compensar (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Só compensa dentro da mesma modalidade: swing com swing, day trade com day trade.',
    },
    {
      id: 'modalidade',
      label: 'Modalidade das operações do mês',
      type: 'select',
      value: 'swing',
      options: [
        { value: 'swing', label: 'Swing trade (compra e venda em dias diferentes)' },
        { value: 'daytrade', label: 'Day trade (compra e venda no mesmo dia)' },
      ],
      help: 'Day trade não tem isenção e paga 20%, com retenção na fonte de 1%.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Para onde vai a sua renda tributável',
    caption:
      'Separa a parte da renda que as deduções tiraram da conta, a parte que ficou isenta pela faixa inicial da tabela e a parte que virou imposto de fato.',
  },
  breakdownTitle: 'A conta linha a linha',
  breakdownIntro:
    'Mesma sequência do programa da Receita: rendimento, deduções, base de cálculo, imposto pela tabela, imposto já retido e, no fim, a diferença.',

  faq: [
    {
      q: 'Quem é obrigado a declarar imposto de renda?',
      a: 'A obrigatoriedade não depende só do salário. Declara quem teve rendimento tributável acima do limite do ano, quem recebeu rendimentos isentos ou tributados exclusivamente na fonte acima do limite próprio, quem obteve ganho de capital ou operou em bolsa acima dos limites, quem tinha bens acima do valor de corte em 31 de dezembro, quem passou a residir no Brasil no ano ou quem quer usar prejuízo de atividade rural. Os valores exatos de cada critério saem na instrução normativa da DIRPF de cada ano — vale conferir todos, porque a maioria das pessoas que "não precisava declarar" precisava por um critério que não é o do salário.',
    },
    {
      q: 'Simplificada ou completa: como escolher?',
      a: 'É uma comparação aritmética, não uma questão de perfil. Na simplificada você abate 20% da renda tributável, respeitado um teto anual, sem comprovar nada. Na completa você abate a soma das deduções legais que consegue comprovar. Se essa soma for maior que o desconto simplificado, a completa vence; se for menor, a simplificada. Quem tem despesa médica alta, dependentes, plano de saúde e previdência privada quase sempre fica melhor na completa. Quem é solteiro, assalariado e sem gastos dedutíveis fica melhor na simplificada, e a comparação nem chega perto.',
    },
    {
      q: 'Como funciona a correção da restituição?',
      a: 'A restituição é corrigida pela Selic acumulada desde o mês seguinte ao do prazo final de entrega até o mês anterior ao do pagamento, mais 1% no mês em que o crédito é feito — regra do art. 16 da Lei 9.250/1995. Por isso o mesmo valor declarado rende mais quando cai num lote posterior. Isso não é motivo para atrasar a entrega: o crédito no primeiro lote e o dinheiro na mão costumam valer mais do que a diferença de correção, e quem entrega tarde corre risco de multa.',
    },
    {
      q: 'Quem tem prioridade nos primeiros lotes da restituição?',
      a: 'A ordem legal de prioridade é: pessoas com 80 anos ou mais; depois pessoas com 60 anos ou mais, com deficiência ou com moléstia grave; depois contribuintes cuja maior fonte de renda seja o magistério; depois quem usou a declaração pré-preenchida ou optou por receber por Pix. Só depois de todos esses vem a ordem de entrega. É por isso que entregar no primeiro minuto do primeiro dia não garante o primeiro lote a ninguém que não esteja em uma dessas faixas.',
    },
    {
      q: 'Por que a isenção de R$ 20 mil em ações não me atendeu?',
      a: 'Provavelmente por um destes motivos: ela olha o valor total vendido no mês, não o lucro — vender R$ 21 mil com R$ 500 de lucro já tributa; ela não vale para day trade; e não vale para ETF, FII, BDR, opções ou futuros, mesmo que a operação seja swing. Além disso, o limite é mensal e considera todas as vendas de ações do mês somadas, em todas as corretoras. Muita gente perde a isenção sem perceber ao rebalancear a carteira num único dia.',
    },
    {
      q: 'Como declaro prejuízo em bolsa e por quanto tempo posso usar?',
      a: 'O prejuízo é apurado mês a mês e não vence: pode ser compensado com lucros futuros indefinidamente, desde que você o registre na declaração todos os anos, na ficha de renda variável. A compensação é restrita à mesma modalidade — prejuízo de swing trade abate lucro de swing trade, prejuízo de day trade abate lucro de day trade. Quem deixa de declarar o prejuízo num ano perde o direito de usá-lo depois, e essa perda é definitiva.',
    },
    {
      q: 'Preciso declarar cripto mesmo sem ter vendido nada?',
      a: 'Sim, se o custo de aquisição da posição em cada tipo de ativo passar do valor de corte da ficha Bens e Direitos — a regra usual é R$ 5 mil por tipo de ativo. A posição vai declarada pelo custo de aquisição, não pelo valor de mercado, no grupo de criptoativos. A isenção de R$ 35 mil vale para o imposto sobre o ganho, e não dispensa a declaração patrimonial. Omitir a posição é o que mais gera intimação: as exchanges nacionais informam tudo à Receita.',
    },
    {
      q: 'Trocar uma cripto por outra gera imposto?',
      a: 'Gera fato gerador. A permuta de um ativo por outro é alienação, e a diferença entre o custo de aquisição da moeda entregue e o valor da moeda recebida é ganho de capital. Se as alienações do mês somadas ficarem em até R$ 35 mil, o ganho é isento; acima disso, é tributado normalmente. É a regra mais ignorada da tributação de cripto no Brasil, e a que mais gera passivo em quem opera com frequência entre pares sem nunca sacar para reais.',
    },
    {
      q: 'O que é malha fina e como sair dela?',
      a: 'É a retenção da declaração para verificação, quando algum dado não bate com o que as fontes informaram à Receita — informe de rendimento, recibo médico, valor de aluguel, operação em bolsa. Dá para consultar a pendência no e-CAC, em "Meu Imposto de Renda", na opção de processamento. Havendo erro seu, a saída é entregar declaração retificadora antes de qualquer intimação, o que evita multa de ofício. Havendo divergência da fonte pagadora, é preciso o comprovante e, às vezes, a retificação por parte dela.',
    },
    {
      q: 'Quais despesas médicas podem ser deduzidas?',
      a: 'Consultas, exames, internações, cirurgias, plano de saúde, tratamento dentário, fisioterapia, psicoterapia por profissional habilitado e próteses ortopédicas ou dentárias, para você e seus dependentes, sem limite de valor. Não entram medicamentos comprados em farmácia, salvo quando incluídos na conta hospitalar, nem vacinas fora de internação, nem despesas reembolsadas pelo plano — o que foi reembolsado tem de ser abatido. Todo recibo precisa ter nome, endereço e CPF ou CNPJ do prestador.',
    },
    {
      q: 'O que acontece se eu entregar a declaração atrasada?',
      a: 'A multa é de 1% ao mês sobre o imposto devido, com mínimo de R$ 165,74 e máximo de 20% do imposto. Quem tem restituição a receber também paga a multa: ela é descontada do valor a restituir. Além da multa, o CPF pode ficar pendente de regularização, o que trava financiamento, empréstimo, emissão de passaporte e concurso público. A declaração atrasada continua sendo aceita pelo programa da Receita a qualquer momento.',
    },
    {
      q: 'Recebo aluguel de pessoa física. Como funciona o carnê-leão?',
      a: 'Rendimento recebido de pessoa física não tem retenção na fonte, então o próprio contribuinte recolhe mensalmente, pelo carnê-leão, aplicando a tabela progressiva mensal. O DARF vence no último dia útil do mês seguinte ao recebimento. Podem ser abatidos do aluguel os valores de IPTU, condomínio e taxa de administração, quando pagos pelo locador. Quem não recolhe mensalmente e só declara no ano seguinte paga multa e juros sobre cada mês em atraso, ainda que a declaração final esteja certa.',
    },
  ],

  sources: [
    {
      name: 'Lei 9.250/1995 — deduções do IRPF e correção da restituição (art. 16)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l9250.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 11.033/2004 — isenção de R$ 20 mil e IR de renda variável',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 8.981/1995 — ganho de capital e faixas progressivas',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8981.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'IN RFB 1.888/2019 — obrigação de informar operações com criptoativos',
      url: 'https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=100592',
      publisher: 'Receita Federal',
    },
    {
      name: 'Meu Imposto de Renda — tabelas, prazos e calendário de restituição',
      url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda',
      publisher: 'Receita Federal',
    },
    {
      name: 'Portal e-CAC — consulta de malha fina e declaração retificadora',
      url: 'https://cav.receita.fazenda.gov.br/autenticacao/login',
      publisher: 'Receita Federal',
    },
  ],

  replaces: [
    '/pt/calculadora-restituicao-imposto-renda-2026-lotes',
    '/pt/ir-swing-trade-acoes-15-porcento-isento-20k',
    '/pt/darf-cripto-15-porcento-ganho-35k-mensal',
  ],

  lastReviewed: '2026-08-16',
};
