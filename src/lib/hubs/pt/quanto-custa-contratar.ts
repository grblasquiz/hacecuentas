import type { HubData } from '../types';
import {
  SALARIO_MINIMO,
  INSS_FAIXAS,
  INSS_TETO,
  IRRF_FAIXAS,
  IRRF_ISENCAO_REDUTOR,
  IRRF_REDUTOR_TETO,
  FGTS_ALIQUOTA_DEPOSITO,
  DOMESTICA_ENCARGOS,
  SALARIO_FAMILIA_COTA,
  SALARIO_FAMILIA_TETO,
} from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Quanto custa ter alguém trabalhando pra mim?"
 *
 * Absorve 4 calculadoras soltas (INSS patronal, custo de doméstica no eSocial,
 * comparador PJ vs CLT e salário-família). Constantes: Lei 8.212/1991 art. 22
 * (contribuição patronal e RAT), Lei 8.036/1990 art. 15 (FGTS 8%),
 * LC 123/2006 (Simples Nacional), LC 150/2015 (empregado doméstico) e as tabelas
 * de src/lib/data/brasil-2026.ts. Nada de memória.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As alíquotas, os anexos do Simples e as convenções coletivas mudam; confira a folha com o seu contador antes de fechar qualquer contratação.';

export const MINIMO = SALARIO_MINIMO;
export const TETO_INSS = INSS_TETO;
export const FGTS_PCT = FGTS_ALIQUOTA_DEPOSITO;

/** Faixas do INSS 2026 (progressivas, com parcela a deduzir). Espelho de INSS_FAIXAS. */
export const INSS = INSS_FAIXAS.map((f) => ({ ate: f.ate, aliquota: f.aliquota, deduzir: f.deduzir }));

/** Tabela mensal do IRRF. `Infinity` → null para sobreviver à serialização do define:vars. */
export const IRRF = IRRF_FAIXAS.map((f) => ({
  ate: Number.isFinite(f.ate) ? f.ate : null,
  aliquota: f.aliquota,
  deduzir: f.deduzir,
}));

/** Redutor 2026: IR zerado até esta base, redução linear até o teto. */
export const REDUTOR = { isencao: IRRF_ISENCAO_REDUTOR, teto: IRRF_REDUTOR_TETO };

/** Lei 8.212/1991, art. 22: contribuição patronal de 20% e RAT de 1%, 2% ou 3%. */
export const PATRONAL = { inss: 0.2, ratOpcoes: { '1': 0.01, '2': 0.02, '3': 0.03 } as Record<string, number> };

/** Encargos do empregador doméstico no DAE (LC 150/2015, art. 34) — espelho de brasil-2026.ts. */
export const DOMESTICA = {
  inssPatronal: DOMESTICA_ENCARGOS.inssPatronal,
  fgts: DOMESTICA_ENCARGOS.fgts,
  fgtsCompensatorio: DOMESTICA_ENCARGOS.fgtsCompensatorio,
  gilrat: DOMESTICA_ENCARGOS.gilrat,
  total: DOMESTICA_ENCARGOS.patronalTotal,
};

/** Salário-família 2026 (INSS): cota por filho e teto de remuneração. */
export const SALARIO_FAMILIA = { cota: SALARIO_FAMILIA_COTA, teto: SALARIO_FAMILIA_TETO };

/** Multa rescisória do FGTS provisionada mês a mês: 40% sobre o depósito (art. 18 §1º Lei 8.036/90). */
export const MULTA_FGTS_PCT = 0.4;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/quanto-custa-contratar',
  title: 'Quanto custa contratar: CLT, Simples, doméstica ou PJ?',
  description:
    'Calcule o custo real de ter alguém trabalhando pra você: INSS patronal de 20%, RAT, terceiros, FGTS de 8%, provisões de 13º e férias + 1/3, encargos do DAE do empregado doméstico e a comparação líquida entre CLT e PJ.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · folha de pagamento · encargos',
  h1: 'Quanto custa ter alguém trabalhando pra mim?',
  lede:
    'O salário combinado é só o começo. Dependendo do regime da empresa e do tipo de vínculo, os encargos somam de 8% a mais de 70% em cima do salário — e quase sempre quem contrata descobre isso depois de assinar. Informe o salário e o regime: a conta separa cada encargo, provisiona 13º e férias e mostra o custo mensal e anual de verdade.',
  stamps: [
    `Salário mínimo vigente: ${brl(MINIMO)}`,
    'Lei 8.212/1991 art. 22 · Lei 8.036/1990 · LC 123/2006 · LC 150/2015',
    '4 calculadoras dentro',
  ],

  resultLabel: 'Custo mensal real',

  cases: {
    title: 'Que tipo de contratação é a sua?',
    intro:
      'O mesmo salário custa números bem diferentes conforme quem contrata. Uma empresa do lucro real paga 20% de INSS patronal; a mesma empresa no Simples anexo III não paga nada disso separado, porque já está dentro do DAS.',
    items: [
      {
        id: 'clt_geral',
        label: 'CLT numa empresa do lucro real ou presumido',
        hint: 'INSS patronal 20% + RAT + terceiros + FGTS + provisões',
        answer:
          'É o cenário mais caro: sobre o salário incidem 20% de INSS patronal, RAT de 1% a 3%, terceiros de até 5,8% e 8% de FGTS, além das provisões de 13º e férias.',
        yes: [
          'INSS patronal de 20% sobre a folha, sem teto — art. 22, I da Lei 8.212/1991',
          'RAT de 1%, 2% ou 3% conforme o grau de risco da atividade, multiplicado pelo FAP (de 0,5 a 2,0)',
          'Contribuição a terceiros (Sistema S, INCRA, SEBRAE, salário-educação): até 5,8%',
          'FGTS de 8% depositado todo mês — art. 15 da Lei 8.036/1990',
          'Provisões mensais de 13º salário e de férias + 1/3, com encargos sobre elas',
          'Provisão da multa de 40% do FGTS, para o caso de dispensa sem justa causa',
        ],
        warn: [
          AVISO_LEGAL,
          'O INSS patronal não tem teto: diferente do desconto do empregado, a empresa paga 20% sobre o salário inteiro, por maior que seja',
          'O RAT pode dobrar ou cair pela metade conforme o FAP da empresa, que é publicado anualmente pela Previdência — confirme o seu com o contador',
          'Vale-transporte, vale-refeição, plano de saúde e convenção coletiva ainda entram por cima disso',
        ],
        plazo:
          'FGTS até o dia 20 do mês seguinte (via FGTS Digital) e a contribuição previdenciária na DCTFWeb, também até o dia 20.',
      },
      {
        id: 'clt_simples',
        label: 'CLT numa empresa do Simples Nacional',
        hint: 'Anexos I a III não recolhem a CPP separada',
        answer:
          'Nos anexos I, II, III e V a contribuição previdenciária patronal já está dentro do DAS: sobra o FGTS de 8% e as provisões. No anexo IV, a CPP volta a ser paga à parte.',
        yes: [
          'Anexos I, II, III e V: a CPP (os 20%) está incluída na alíquota do DAS — art. 13 §3º da LC 123/2006',
          'FGTS de 8% continua sendo devido em qualquer anexo',
          'Provisões de 13º e de férias + 1/3, com FGTS sobre elas',
          'Anexo IV (construção, limpeza, vigilância): CPP de 20% + RAT + terceiros pagos fora do DAS',
        ],
        warn: [
          AVISO_LEGAL,
          'A economia do Simples nos anexos I a III e V é real, mas o DAS incide sobre o faturamento, não sobre a folha — em empresa de serviço com folha alta o Fator R pode mudar completamente a conta',
          'Empresa do Simples não recolhe a contribuição a terceiros (Sistema S), exceto no anexo IV',
        ],
        plazo:
          'DAS até o dia 20 do mês seguinte; FGTS no mesmo prazo, pelo FGTS Digital.',
      },
      {
        id: 'domestico',
        label: 'Empregado doméstico (eSocial / DAE)',
        hint: 'Simples Doméstico: 20% de encargos num guia só',
        answer:
          'Pelo Simples Doméstico da LC 150/2015 você recolhe tudo num DAE só: 8% de INSS patronal, 8% de FGTS, 3,2% de FGTS compensatório e 0,8% de GILRAT — 20% ao todo.',
        yes: [
          'INSS patronal de 8% — art. 34, I da LC 150/2015',
          'FGTS de 8% e FGTS compensatório de 3,2% (antecipação da multa rescisória)',
          'Seguro contra acidentes do trabalho (GILRAT) de 0,8%',
          'INSS do empregado retido no mesmo DAE (tabela progressiva de 7,5% a 14%) — é dinheiro do trabalhador, não custo extra do patrão',
          'Provisões de 13º e de férias + 1/3, com os mesmos 20% de encargos sobre elas',
        ],
        warn: [
          AVISO_LEGAL,
          'O salário não pode ser menor que o mínimo nacional (ou o piso estadual, onde houver) — a conta trava nesse piso',
          'Os 3,2% de FGTS compensatório ficam com o empregado se a dispensa for sem justa causa e voltam ao empregador se for por justa causa ou pedido de demissão',
          'Vale-transporte é obrigatório se houver deslocamento, com desconto de no máximo 6% do salário',
        ],
        plazo:
          'o DAE vence no dia 7 do mês seguinte (antecipa para o dia útil anterior se cair em fim de semana ou feriado).',
      },
      {
        id: 'pj',
        label: 'Contratar como PJ (ou virar PJ)',
        hint: 'Comparador líquido: CLT com benefícios vs PJ com DAS',
        answer:
          'Como PJ não há encargos patronais, mas também não há FGTS, 13º, férias nem seguro-desemprego — a comparação só faz sentido em valor líquido, somando o que o CLT tem de benefício.',
        yes: [
          'Lado CLT: salário menos INSS e IRRF, mais FGTS de 8%, provisão da multa de 40%, 13º, 1/3 de férias e os benefícios em dinheiro',
          'Lado PJ: faturamento menos DAS do Simples, menos contador, menos INSS e IRRF sobre o pró-labore',
          'Pró-labore mínimo de um salário mínimo, com INSS de 11% retido (art. 4º da Lei 10.666/2003)',
          'O saldo mostra quanto o PJ precisa faturar para empatar com o CLT equivalente',
        ],
        warn: [
          AVISO_LEGAL,
          'Como PJ não há FGTS, 13º, férias remuneradas, aviso prévio nem seguro-desemprego: o valor a mais no mês precisa cobrir tudo isso e ainda a reserva para o mês em que você não faturar',
          'Contratar como PJ alguém que trabalha com pessoalidade, habitualidade, subordinação e onerosidade é pejotização e pode ser reconhecido como vínculo na Justiça do Trabalho, com todos os encargos retroativos',
          'A alíquota do DAS não é fixa: depende do anexo e do faturamento dos últimos 12 meses (RBT12), e no anexo V depende do Fator R',
        ],
        plazo:
          'a alíquota efetiva do DAS muda todo mês conforme o RBT12; refaça a conta quando o faturamento acumulado mudar de faixa.',
      },
    ],
  },

  inputsTitle: 'Os dados da contratação',
  inputsIntro:
    'O salário bruto é o único campo obrigatório. Os demais só entram no caso que você escolher — grau de risco na empresa comum, faturamento e alíquota no comparador PJ.',
  fields: [
    {
      id: 'salario',
      label: 'Salário bruto mensal (R$)',
      prefix: 'R$',
      value: '3.000',
      thousands: true,
      help: 'Salário base mais adicionais fixos. É sobre ele que incidem todos os encargos e as provisões.',
    },
    {
      id: 'grauRisco',
      label: 'Grau de risco da atividade (RAT)',
      type: 'select',
      value: '2',
      options: [
        { value: '1', label: 'Leve — 1% (escritório, comércio, TI)' },
        { value: '2', label: 'Médio — 2% (indústria leve, transporte)' },
        { value: '3', label: 'Grave — 3% (construção, mineração, frigorífico)' },
      ],
      help: 'Definido pelo CNAE principal da empresa, na tabela do Anexo V do Decreto 3.048/1999. Art. 22, II da Lei 8.212/1991.',
    },
    {
      id: 'fap',
      label: 'FAP — Fator Acidentário de Prevenção',
      type: 'number',
      value: 1,
      min: 0.5,
      max: 2,
      step: 0.01,
      help: 'Multiplica o RAT e vai de 0,5 a 2,0 conforme o histórico de acidentes da empresa. É publicado todo ano pela Previdência e não é uma constante — consulte o FAP da sua empresa no portal gov.br antes de confiar no valor padrão de 1,0.',
    },
    {
      id: 'terceiros',
      label: 'Contribuição a terceiros (%)',
      type: 'number',
      value: 5.8,
      min: 0,
      max: 8,
      step: 0.1,
      suffix: '%',
      help: 'Sistema S, INCRA, SEBRAE e salário-educação. Varia de 2,5% a 5,8% conforme o enquadramento do FPAS da empresa; 5,8% é o caso mais comum na indústria e no comércio.',
    },
    {
      id: 'anexoSimples',
      label: 'Anexo do Simples Nacional',
      type: 'select',
      value: 'iii',
      options: [
        { value: 'i', label: 'Anexo I — comércio' },
        { value: 'ii', label: 'Anexo II — indústria' },
        { value: 'iii', label: 'Anexo III — serviços em geral' },
        { value: 'iv', label: 'Anexo IV — construção, limpeza, vigilância (CPP fora do DAS)' },
        { value: 'v', label: 'Anexo V — serviços de maior valor agregado' },
      ],
      help: 'Só o anexo IV recolhe a contribuição previdenciária patronal fora do DAS (art. 18 §5º-C da LC 123/2006). Nos demais, os 20% já estão embutidos na alíquota.',
    },
    {
      id: 'filhos',
      label: 'Filhos de até 14 anos (salário-família)',
      type: 'number',
      value: 0,
      min: 0,
      max: 12,
      step: 1,
      help: `Cota de ${brl(SALARIO_FAMILIA.cota)} por filho, paga ao empregado que ganha até ${brl(SALARIO_FAMILIA.teto)}. A empresa adianta e compensa na guia — não é custo dela.`,
    },
    {
      id: 'beneficios',
      label: 'Benefícios em dinheiro por mês (R$)',
      prefix: 'R$',
      value: '800',
      thousands: true,
      help: 'Vale-transporte, vale-refeição, plano de saúde e o que mais você pagar por fora do salário. No comparador PJ, é isso que o CLT ganha e o PJ não.',
    },
    {
      id: 'faturamentoPj',
      label: 'Faturamento mensal como PJ (R$)',
      prefix: 'R$',
      value: '9.000',
      thousands: true,
      help: 'O valor bruto da nota fiscal. Só usado no caso PJ.',
    },
    {
      id: 'aliquotaDas',
      label: 'Alíquota efetiva do DAS (%)',
      type: 'number',
      value: 6,
      min: 0,
      max: 33,
      step: 0.01,
      suffix: '%',
      help: 'A alíquota efetiva depende do anexo e do faturamento dos últimos 12 meses. Na primeira faixa do anexo III é 6%; no anexo V pode passar de 15%. Calcule a sua e substitua aqui.',
    },
    {
      id: 'contador',
      label: 'Custo mensal do contador (R$)',
      prefix: 'R$',
      value: '400',
      thousands: true,
      help: 'Honorários de contabilidade da PJ. Só usado no comparador PJ.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'De que é feito o custo mensal',
    caption:
      'Mostra quanto do custo é salário na mão do trabalhador e quanto é encargo e provisão. Quanto maior a fatia que não é salário, maior a distância entre o que você paga e o que a pessoa recebe.',
  },
  breakdownTitle: 'O custo, linha por linha',
  breakdownIntro:
    'Primeiro o salário, depois cada encargo com a sua base legal e, no fim, o custo mensal real e o custo anual — que é o número que interessa para orçar uma contratação.',

  faq: [
    {
      q: 'Quanto custa a mais do que o salário contratar um CLT?',
      a: 'Numa empresa do lucro real ou presumido, os encargos diretos somam cerca de 28% a 37% (20% de INSS patronal, 1% a 3% de RAT, até 5,8% de terceiros e 8% de FGTS). Somando as provisões de 13º e de férias + 1/3 com os encargos sobre elas, o custo mensal real fica entre 65% e 75% acima do salário. Numa empresa do Simples nos anexos I a III, sem a CPP separada, o acréscimo cai para cerca de 25% a 30%. Benefícios em dinheiro e convenção coletiva entram por cima disso.',
    },
    {
      q: 'O INSS patronal tem teto, como o desconto do empregado?',
      a: `Não. O desconto do empregado para no teto do INSS (${brl(TETO_INSS)}), mas a contribuição patronal de 20% incide sobre o total da folha, sem limite algum — art. 22, I da Lei 8.212/1991. É por isso que um salário alto custa proporcionalmente mais para a empresa do que se poderia imaginar olhando só a tabela do segurado.`,
    },
    {
      q: 'O que é o RAT e por que ele pode dobrar?',
      a: 'RAT é a contribuição para o financiamento dos benefícios acidentários: 1%, 2% ou 3% conforme o grau de risco do CNAE da empresa, na tabela do Anexo V do Decreto 3.048/1999. Sobre essa alíquota aplica-se o FAP (Fator Acidentário de Prevenção), um multiplicador de 0,5 a 2,0 calculado a partir do histórico de acidentes e afastamentos da própria empresa. Uma empresa de grau 3 com FAP 2,0 paga 6% de RAT; a mesma empresa com FAP 0,5 paga 1,5%. O FAP é publicado anualmente e pode ser contestado.',
    },
    {
      q: 'Empresa do Simples paga INSS patronal?',
      a: 'Nos anexos I, II, III e V, não separadamente: a contribuição previdenciária patronal já está embutida na alíquota do DAS, por força do art. 13 §3º da LC 123/2006. O anexo IV é a exceção — construção civil, limpeza, conservação e vigilância recolhem a CPP de 20%, o RAT e os terceiros fora do DAS, exatamente como uma empresa do lucro presumido. O FGTS de 8%, esse, é devido em todos os anexos, sem exceção.',
    },
    {
      q: 'Quanto custa uma empregada doméstica com carteira assinada?',
      a: `Pelo Simples Doméstico da LC 150/2015, os encargos patronais somam 20% da remuneração num único DAE: 8% de INSS patronal, 8% de FGTS, 3,2% de FGTS compensatório e 0,8% de GILRAT. Sobre um salário mínimo de ${brl(MINIMO)}, são cerca de ${brl(MINIMO * DOMESTICA.total)} por mês de encargos. Somando as provisões de 13º e de férias + 1/3 com encargos, o custo real fica em torno de 40% acima do salário. O INSS do empregado (7,5% a 14%) também vai no DAE, mas é retido do salário dele, não custo extra do patrão.`,
    },
    {
      q: 'O que é o FGTS compensatório de 3,2% da doméstica?',
      a: 'É uma antecipação mensal da multa rescisória, criada pelo art. 22 da LC 150/2015 para que o empregador doméstico não seja surpreendido por um pagamento grande na hora da dispensa. Ele é depositado numa conta vinculada separada. Se a dispensa for sem justa causa, esse saldo vai para o empregado; se for por justa causa, por pedido de demissão ou por término de contrato por prazo determinado, o valor volta para o empregador. Ou seja: é custo mensal certo, mas nem sempre é custo definitivo.',
    },
    {
      q: 'Quanto o PJ precisa faturar para empatar com um CLT?',
      a: 'Depende dos benefícios, mas a regra prática é que o faturamento bruto do PJ precisa ficar entre 30% e 40% acima do salário CLT para empatar em dinheiro no mês. E empatar no mês não é empatar de verdade: o CLT ainda tem FGTS acumulando, aviso prévio, seguro-desemprego, estabilidade em caso de acidente e auxílio-doença com salário de benefício maior. Use esta conta com os seus números reais de plano de saúde, vale-refeição e vale-transporte, porque é aí que a diferença aparece.',
    },
    {
      q: 'Contratar PJ em vez de CLT é legal?',
      a: 'É legal quando a relação realmente é entre empresas: sem pessoalidade obrigatória, sem horário imposto, sem subordinação e com autonomia sobre como o trabalho é feito. Quando esses quatro elementos do art. 3º da CLT estão presentes, existe vínculo de emprego mesmo com contrato de prestação de serviços assinado, e a Justiça do Trabalho pode reconhecê-lo com todos os encargos retroativos, multas e FGTS. A economia aparente vira passivo. O tema é sensível e tem tido decisões divergentes; vale consultar um advogado antes de estruturar.',
    },
    {
      q: 'Quem paga o salário-família, a empresa ou o INSS?',
      a: `Quem paga é o INSS, mas o pagamento é operacionalizado pela empresa: ela adianta a cota junto com o salário e compensa o valor na guia de recolhimento previdenciário. Ou seja, não é custo do empregador. Em 2026 a cota é de ${brl(SALARIO_FAMILIA.cota)} por filho de até 14 anos (ou inválido de qualquer idade), para o empregado que recebe até ${brl(SALARIO_FAMILIA.teto)} por mês. Acima desse teto de remuneração, o direito desaparece no mês.`,
    },
    {
      q: 'Provisão de 13º e de férias é dinheiro que sai do caixa todo mês?',
      a: 'Contabilmente sim, e financeiramente também deveria. O 13º equivale a um salário por ano, o que dá 1/12 do salário por mês, com todos os encargos por cima. As férias custam o salário mais o terço constitucional, o que dá 1,333 salário por período aquisitivo, também com encargos. Empresa que não provisiona esses valores mês a mês descobre em novembro e em dezembro que precisa de dois salários extras de caixa — é uma das causas mais comuns de aperto financeiro em pequenos negócios.',
    },
    {
      q: 'Vale-transporte e vale-refeição entram na base dos encargos?',
      a: 'Em regra, não. O vale-transporte tem natureza indenizatória expressa (Lei 7.418/1985) e não integra o salário de contribuição; o desconto do empregado é de até 6% do salário base. O vale-refeição pago dentro do PAT também não integra a remuneração para fins previdenciários. Já o pagamento de alimentação em dinheiro, fora do PAT, pode ser considerado salário-utilidade e atrair encargos. Confirme o enquadramento com o contador antes de trocar o benefício por dinheiro.',
    },
    {
      q: 'Quais são os prazos de recolhimento?',
      a: 'FGTS e contribuição previdenciária (DCTFWeb) vencem no dia 20 do mês seguinte ao da competência; o DAS do Simples Nacional também vence no dia 20. O DAE do empregado doméstico é a exceção: vence no dia 7 do mês seguinte, antecipando para o dia útil anterior quando cai em fim de semana ou feriado. Atraso gera multa e juros e, no caso do FGTS, ainda bloqueia a emissão da certidão de regularidade, que é exigida em licitações e financiamentos.',
    },
  ],

  sources: [
    {
      name: 'Lei 8.212/1991, art. 22 — contribuição patronal de 20% e RAT',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 8.036/1990, art. 15 — depósito de 8% do FGTS',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei Complementar 123/2006 — Simples Nacional e anexos I a V',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei Complementar 150/2015, art. 34 — Simples Doméstico e composição do DAE',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp150.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'eSocial Doméstico — cadastro, DAE e obrigações do empregador',
      url: 'https://www.gov.br/esocial/pt-br/empregador-domestico',
      publisher: 'Governo Federal',
    },
    {
      name: 'FAP — Fator Acidentário de Prevenção e consulta da alíquota da empresa',
      url: 'https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/fap',
      publisher: 'Ministério da Previdência Social',
    },
    {
      name: 'Salário-família — valor da cota e teto de remuneração',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/salario-familia',
      publisher: 'Instituto Nacional do Seguro Social',
    },
    {
      name: 'FGTS Digital — prazos e recolhimento',
      url: 'https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgts-digital',
      publisher: 'Ministério do Trabalho e Emprego',
    },
  ],

  replaces: [
    '/pt/inss-patronal-empresa-20-porcento-folha',
    '/pt/custo-empregada-domestica-esocial-2026',
    '/pt/pj-vs-clt-comparador-liquido-br',
    '/pt/salario-familia-2026-valor-filhos',
  ],

  lastReviewed: '2026-07-28',
};
