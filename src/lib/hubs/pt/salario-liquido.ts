import type { HubData } from '../types';
import {
  SALARIO_MINIMO,
  INSS_FAIXAS,
  INSS_TETO,
  IRRF_FAIXAS,
  IRRF_DEDUCAO_DEPENDENTE,
  IRRF_ISENCAO_REDUTOR,
  IRRF_REDUTOR_TETO,
} from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Quanto realmente cai na minha conta?"
 *
 * Absorve 10 calculadoras soltas de folha de pagamento. Todas as constantes saem
 * de src/lib/data/brasil-2026.ts, a mesma fonte das fórmulas vivas — nada de
 * memória. As faixas do INSS e do IRRF viajam ao script como arrays simples
 * (Infinity → null, porque não sobrevive a `define:vars`).
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As tabelas do INSS e do IRRF mudam por portaria e a sua convenção coletiva pode prever regras próprias; confira o holerite e consulte o RH ou um contador antes de tomar decisões.';

export const MINIMO = SALARIO_MINIMO;
export const TETO_INSS = INSS_TETO;
export const DEP = IRRF_DEDUCAO_DEPENDENTE;
export const REDUTOR = { isencao: IRRF_ISENCAO_REDUTOR, teto: IRRF_REDUTOR_TETO };

/** Faixas do INSS 2026 (progressivas, com parcela a deduzir). Espelho de INSS_FAIXAS. */
export const INSS = INSS_FAIXAS.map((f) => ({ ate: f.ate, aliquota: f.aliquota, deduzir: f.deduzir }));

/** Tabela mensal do IRRF. `Infinity` → null para sobreviver à serialização. */
export const IRRF = IRRF_FAIXAS.map((f) => ({
  ate: Number.isFinite(f.ate) ? f.ate : null,
  aliquota: f.aliquota,
  deduzir: f.deduzir,
}));

/** Adicionais da CLT: insalubridade sobre o mínimo (art. 192), periculosidade sobre o salário base (art. 193). */
export const ADICIONAIS = {
  insalubridadeGraus: { minimo: 0.1, medio: 0.2, maximo: 0.4 },
  periculosidade: 0.3,
  noturno: 0.2,
  /** Hora noturna reduzida: 52 min 30 s valem 1 hora (art. 73 §1º CLT). */
  horaNoturnaMin: 52.5,
};

/** Margem consignável: 35% + 5% de cartão de crédito consignado + 5% de cartão benefício. */
export const CONSIGNADO = { margem: 0.35, cartao: 0.05, beneficio: 0.05 };

/** Vale-transporte: desconto de até 6% do salário base (art. 4º par. único da Lei 7.418/1985). */
export const VALE_TRANSPORTE_PCT = 0.06;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/salario-liquido',
  title: 'Salário líquido CLT: quanto cai na conta depois dos descontos?',
  description:
    'Simule seu holerite completo: INSS progressivo, IRRF com o redutor vigente e dedução por dependente, adicional noturno, insalubridade ou periculosidade, DSR, vale-transporte, pensão alimentícia e margem do consignado.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · CLT · folha de pagamento',
  h1: 'Do bruto ao que cai na conta: onde foi parar o seu salário.',
  lede:
    'O bruto do contrato quase nunca é o que aparece no extrato. Esta conta monta o holerite inteiro na ordem certa: primeiro os adicionais que aumentam a base, depois o INSS progressivo, o IRRF com o redutor vigente e, por último, os descontos que não são imposto — vale-transporte, pensão e consignado.',
  stamps: [
    `Salário mínimo: ${brl(MINIMO)} · teto do INSS: ${brl(TETO_INSS)}`,
    'CLT arts. 73, 192 e 193 · Lei 7.418/1985 · tabela do IRRF vigente',
    '10 calculadoras dentro',
  ],

  resultLabel: 'Salário líquido do mês',

  cases: {
    title: 'Como é o seu contracheque?',
    intro:
      'Os descontos obrigatórios são iguais para todo mundo. O que muda de verdade é o que entra na base antes deles — e é aí que a maioria das contas erra.',
    items: [
      {
        id: 'padrao',
        label: 'CLT padrão, sem adicionais',
        hint: 'Salário fixo · INSS + IRRF',
        answer: 'Só dois descontos obrigatórios: INSS progressivo e IRRF sobre o que sobra dele.',
        yes: [
          'INSS progressivo por faixas, com parcela a deduzir, limitado ao teto',
          'Base do IRRF = bruto − INSS − dedução por dependente',
          'IRRF pela tabela mensal, com o redutor que zera o imposto em bases menores',
          'Dedução por dependente legal, cumulativa por dependente',
        ],
        warn: [
          AVISO_LEGAL,
          'Cada dependente precisa se enquadrar no art. 35 da Lei 9.250/1995: filhos até 21 anos (ou 24 cursando superior), cônjuge, pais sem renda própria acima do limite',
        ],
        plazo:
          'o pagamento tem de ser feito até o 5º dia útil do mês seguinte (art. 459 §1º da CLT); sábado conta como dia útil nessa contagem.',
      },
      {
        id: 'noturno',
        label: 'Trabalho à noite',
        hint: 'Adicional de 20% + hora reduzida',
        answer:
          'Você ganha duas vezes: 20% de adicional e a hora noturna contada como 52 min 30 s.',
        yes: [
          'Adicional noturno de no mínimo 20% sobre a hora diurna (art. 73 CLT)',
          'Hora noturna reduzida: cada 52 min 30 s trabalhados entre 22h e 5h valem 1 hora cheia',
          'O adicional integra o salário para férias, 13º, FGTS e rescisão quando é habitual',
          'DSR sobre o adicional noturno habitual',
        ],
        warn: [
          AVISO_LEGAL,
          'Muita empresa paga os 20% e "esquece" a hora reduzida — as duas coisas são cumulativas e a segunda vale mais que a primeira',
          'No trabalho rural os horários e os percentuais são outros (Lei 5.889/1973)',
        ],
        plazo:
          'diferenças de adicional noturno prescrevem em 5 anos, limitadas a 2 anos após o fim do contrato.',
      },
      {
        id: 'insalubre',
        label: 'Insalubridade ou periculosidade',
        hint: 'Bases de cálculo diferentes',
        answer:
          'Insalubridade incide sobre o salário mínimo; periculosidade, sobre o seu salário base. E não se acumulam.',
        yes: [
          'Insalubridade de 10%, 20% ou 40% conforme o grau, sobre o salário mínimo (art. 192 CLT)',
          'Periculosidade de 30% sobre o salário base, sem adicionais (art. 193 CLT)',
          'Ambos exigem laudo técnico (LTCAT/PPRA) e enquadramento em norma do Ministério do Trabalho',
        ],
        warn: [
          AVISO_LEGAL,
          'Quando os dois cabem, você escolhe um: a lei veda a cumulação (art. 193 §2º CLT)',
          'Algumas convenções coletivas mandam calcular a insalubridade sobre o salário base, e não sobre o mínimo: nesse caso vale a convenção, que é mais favorável',
          'Fornecer EPI eficaz pode eliminar o direito ao adicional de insalubridade — não elimina o de periculosidade',
        ],
        plazo:
          'o adicional é devido enquanto durar a exposição; cessada a condição, cessa o pagamento (art. 194 CLT).',
      },
      {
        id: 'pensao',
        label: 'Pago pensão alimentícia em folha',
        hint: 'Desconto sobre o líquido, na ordem certa',
        answer:
          'A pensão sai depois do INSS e do IRRF, e o valor pago abate a base do imposto.',
        yes: [
          'Percentual fixado na sentença, aplicado sobre a base que a decisão definir',
          'A pensão judicial é dedutível da base do IRRF (art. 8º da Lei 9.250/1995)',
          'O desconto vem discriminado no holerite e é repassado pelo empregador',
        ],
        warn: [
          AVISO_LEGAL,
          'Só é dedutível do IR a pensão fixada por decisão judicial, acordo homologado ou escritura pública — acordo informal não deduz',
          'Se a sentença fala em "salário líquido", confira exatamente quais descontos ela manda considerar: a redação muda o valor',
        ],
        plazo:
          'o empregador é responsável pelo repasse; atraso pode gerar execução contra a empresa, não só contra o alimentante.',
      },
      {
        id: 'consignado',
        label: 'Tenho ou quero empréstimo consignado',
        hint: 'Margem de 35% + 5% + 5%',
        answer:
          'A margem consignável é de 35% do que você recebe, mais 5% para cartão consignado e 5% para cartão benefício.',
        yes: [
          '35% da remuneração disponível para parcelas de empréstimo consignado',
          '+5% exclusivos para cartão de crédito consignado',
          '+5% exclusivos para cartão benefício',
          'A base é a remuneração após os descontos obrigatórios',
        ],
        warn: [
          AVISO_LEGAL,
          'Estourar a margem não é problema do banco: é do seu orçamento — 45% comprometidos deixam pouco para o mês',
          'Aposentados e pensionistas do INSS têm regra própria de margem, revista periodicamente por decreto',
        ],
        plazo:
          'a portabilidade do consignado para outro banco com juro menor é um direito seu e pode ser pedida a qualquer momento.',
      },
    ],
  },

  inputsTitle: 'Os números do seu contracheque',
  inputsIntro:
    'Comece pelo salário base do contrato. Os adicionais e descontos que não se aplicam ao seu caso, deixe em zero.',
  fields: [
    {
      id: 'salario',
      label: 'Salário base mensal (R$)',
      prefix: 'R$',
      value: '3.500',
      thousands: true,
      help: 'O valor do contrato, sem adicionais nem horas extras.',
    },
    {
      id: 'dependentes',
      label: 'Dependentes para o IRRF',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada dependente legal abate ${brl(DEP)} da base do imposto de renda.`,
    },
    {
      id: 'horasNoturnas',
      label: 'Horas trabalhadas entre 22h e 5h, por mês',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 1,
      help: 'A conta aplica o adicional de 20% e a hora noturna reduzida de 52 min 30 s (art. 73 CLT).',
    },
    {
      id: 'adicional',
      label: 'Adicional de risco',
      type: 'select',
      value: 'nenhum',
      options: [
        { value: 'nenhum', label: 'Nenhum' },
        { value: 'insal10', label: 'Insalubridade grau mínimo (10% do salário mínimo)' },
        { value: 'insal20', label: 'Insalubridade grau médio (20% do salário mínimo)' },
        { value: 'insal40', label: 'Insalubridade grau máximo (40% do salário mínimo)' },
        { value: 'peric', label: 'Periculosidade (30% do salário base)' },
      ],
      help: 'Insalubridade e periculosidade não se acumulam: escolha a que a empresa paga.',
    },
    {
      id: 'variaveis',
      label: 'Horas extras e comissões do mês (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'A conta calcula o DSR sobre esse valor variável e soma à base.',
    },
    {
      id: 'diasUteis',
      label: 'Dias úteis do mês',
      type: 'number',
      value: 22,
      min: 1,
      max: 27,
      step: 1,
      help: 'Usado no DSR: valor variável ÷ dias úteis × domingos e feriados do mês.',
    },
    {
      id: 'domingos',
      label: 'Domingos e feriados do mês',
      type: 'number',
      value: 5,
      min: 0,
      max: 12,
      step: 1,
      help: 'Base do descanso semanal remunerado sobre o que é variável (Lei 605/1949).',
    },
    {
      id: 'valeTransporte',
      label: 'Custo mensal do vale-transporte (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: `O desconto é o menor entre o custo real e ${Math.round(VALE_TRANSPORTE_PCT * 100)}% do salário base.`,
    },
    {
      id: 'pensaoPct',
      label: 'Pensão alimentícia (% do líquido)',
      type: 'number',
      value: 0,
      min: 0,
      max: 70,
      step: 1,
      suffix: '%',
      help: 'Percentual fixado na sentença. O valor pago abate a base do IRRF.',
    },
    {
      id: 'consignado',
      label: 'Parcela mensal de consignado (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'A conta compara com a margem de 35% e avisa se estourou.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Para onde vai o seu bruto',
    caption:
      'Separa o que sobra na mão do que é INSS, IRRF e descontos não tributários. A soma das fatias é a sua remuneração bruta do mês.',
  },
  breakdownTitle: 'Seu holerite, linha por linha',
  breakdownIntro:
    'Proventos primeiro, descontos depois — a mesma ordem do contracheque. Compare cada linha com a que o RH emitiu.',

  faq: [
    {
      q: 'Como funciona o INSS progressivo?',
      a: `Desde 2020 o desconto não é mais uma alíquota única sobre o salário inteiro: cada faixa é tributada com a sua própria alíquota, exatamente como no imposto de renda. Na prática usa-se a alíquota da faixa em que o salário cai menos uma parcela a deduzir, o que dá o mesmo resultado. As faixas são de 7,5%, 9%, 12% e 14%, e nada acima do teto de ${brl(TETO_INSS)} sofre desconto — por isso quem ganha muito tem alíquota efetiva baixa.`,
    },
    {
      q: 'Por que meu IRRF deu zero se meu salário é maior que a primeira faixa?',
      a: `Porque a base do imposto não é o salário bruto: dela se descontam o INSS e ${brl(DEP)} por dependente. Além disso o redutor vigente zera o imposto para bases de até ${brl(REDUTOR.isencao)} e reduz o valor de forma decrescente até ${brl(REDUTOR.teto)}. Só acima disso a tabela mensal cheia é aplicada sem abatimento.`,
    },
    {
      q: 'Insalubridade e periculosidade podem ser pagas juntas?',
      a: 'Não. O art. 193 §2º da CLT obriga a escolher: você opta pelo adicional que for mais vantajoso. E as bases são diferentes, o que muda tudo — a insalubridade incide sobre o salário mínimo nacional, então vale o mesmo para quem ganha R$ 2.000 e para quem ganha R$ 12.000; a periculosidade é 30% do seu salário base, então cresce com o salário. Para quem ganha bem, periculosidade quase sempre vale mais.',
    },
    {
      q: 'O que é a hora noturna reduzida?',
      a: 'É a regra do art. 73 §1º da CLT: no período entre 22h e 5h, cada 52 minutos e 30 segundos trabalhados contam como uma hora cheia. Somada ao adicional de 20%, ela faz a hora noturna valer cerca de 37% mais que a diurna, não 20%. É o erro de folha mais frequente no Brasil, e a diferença acumulada em anos costuma ser alta.',
    },
    {
      q: 'O que é o DSR e sobre o que ele incide?',
      a: 'O Descanso Semanal Remunerado (Lei 605/1949) garante que domingos e feriados sejam pagos. No salário fixo mensal ele já está embutido. O que precisa ser calculado à parte é o DSR sobre a parte variável: horas extras, adicional noturno, comissões e prêmios habituais. A conta é o total variável dividido pelos dias úteis do mês, multiplicado pelo número de domingos e feriados. Empresa que paga hora extra sem o DSR está pagando a menos.',
    },
    {
      q: 'Quanto pode ser descontado de vale-transporte?',
      a: `O menor entre o custo real do seu deslocamento e ${Math.round(VALE_TRANSPORTE_PCT * 100)}% do salário base — regra do parágrafo único do art. 4º da Lei 7.418/1985. Se o transporte custa menos que esse limite, o desconto é o custo real e a empresa não pode arredondar para cima. E o vale-transporte não integra o salário para nenhum efeito: não entra em férias, 13º nem FGTS.`,
    },
    {
      q: 'A pensão alimentícia diminui meu imposto de renda?',
      a: 'Sim, quando decorre de decisão judicial, acordo homologado em juízo ou escritura pública de separação ou divórcio. Nesses casos o valor pago é dedutível integralmente da base do IRRF, conforme o art. 8º da Lei 9.250/1995. Pagamentos por acordo informal, sem título, não são dedutíveis, ainda que você tenha os comprovantes.',
    },
    {
      q: 'Qual é a margem do empréstimo consignado?',
      a: `Para o trabalhador CLT, ${Math.round(CONSIGNADO.margem * 100)}% da remuneração disponível para parcelas de empréstimo, mais ${Math.round(CONSIGNADO.cartao * 100)}% reservados a cartão de crédito consignado e ${Math.round(CONSIGNADO.beneficio * 100)}% a cartão benefício — cada faixa só pode ser usada para a sua finalidade. Aposentados e pensionistas do INSS seguem regra própria, revista por decreto. Comprometer a margem inteira significa entregar quase metade do salário antes de o mês começar.`,
    },
    {
      q: 'Adicionais entram no cálculo de férias, 13º e FGTS?',
      a: 'Quando são habituais, sim. Adicional noturno, insalubridade, periculosidade, horas extras e comissões pagos com habitualidade integram a remuneração para todos os efeitos: base do FGTS, média das férias, média do 13º e das verbas rescisórias. Por isso um adicional "pequeno" pago todo mês custa à empresa bem mais do que o valor mensal — e vale bem mais para você.',
    },
    {
      q: 'Até quando o salário tem que ser pago?',
      a: 'Até o 5º dia útil do mês seguinte ao trabalhado, conforme o art. 459 §1º da CLT. Nessa contagem o sábado conta como dia útil, mas domingos e feriados não. O adiantamento quinzenal, quando existe, é uma prática da empresa ou da convenção coletiva, não uma obrigação legal.',
    },
    {
      q: 'O que é alíquota efetiva e por que ela é menor do que a da tabela?',
      a: 'A alíquota da tabela é marginal: vale só para a parte do salário que cai naquela faixa. A efetiva é o total descontado dividido pelo bruto e sempre dá menos. Alguém na faixa de 27,5% do IRRF pode ter alíquota efetiva de 10% ou 12%, porque a maior parte do salário foi tributada nas faixas de baixo — ou nem chegou a ser tributada.',
    },
    {
      q: 'Meu holerite tem um desconto que não reconheço. O que faço?',
      a: 'Peça ao RH a discriminação da rubrica: todo desconto precisa ter base legal, autorização sua por escrito ou previsão em convenção coletiva (art. 462 da CLT). Descontos comuns e legítimos são INSS, IRRF, vale-transporte, coparticipação de plano de saúde, contribuição associativa autorizada e consignado. Desconto de prejuízo causado por você só é válido se houve dolo ou se há cláusula contratual expressa e culpa comprovada.',
    },
  ],

  sources: [
    {
      name: 'CLT — Decreto-Lei 5.452/1943 (arts. 73, 192, 193, 459 e 462)',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 9.250/1995 — deduções do imposto de renda (dependentes e pensão)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l9250.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 7.418/1985 — vale-transporte',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l7418.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 605/1949 — repouso semanal remunerado',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l0605.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Tabela de contribuição mensal do INSS',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal',
      publisher: 'INSS',
    },
    {
      name: 'Imposto de Renda Retido na Fonte — tabela progressiva mensal',
      url: 'https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/irpf',
      publisher: 'Receita Federal',
    },
  ],

  replaces: [
    '/pt/salario-liquido-clt-inss-irrf-2026',
    '/pt/simulador-holerite-clt',
    '/pt/irrf-mensal-folha-pagamento-2026',
    '/pt/salario-liquido-com-pensao-alimenticia-br',
    '/pt/adicional-noturno-20-porcento-clt',
    '/pt/adicional-insalubridade-periculosidade-clt-10-20-30-40',
    '/pt/dsr-descanso-semanal-remunerado-clt',
    '/pt/vale-transporte-desconto-6-porcento-br',
    '/pt/emprestimo-consignado-margem-consignavel-inss-clt',
    '/pt/calculadora-de-horas-soma-banco-horas-jornada',
  ],

  lastReviewed: '2026-07-28',
};
