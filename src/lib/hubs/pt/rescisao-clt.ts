import type { HubData } from '../types';
import { SALARIO_MINIMO, SEGURO_DESEMPREGO } from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Fui demitido: quanto eu vou receber?"
 *
 * Absorve 7 calculadoras soltas de rescisão. Constantes trabalhistas: CLT
 * (Decreto-Lei 5.452/1943), Lei 12.506/2011 (aviso proporcional), Lei 8.036/1990
 * (FGTS) e a tabela do seguro-desemprego de src/lib/data/brasil-2026.ts — que é a
 * mesma fonte que a fórmula viva `seguro-desemprego-valor.ts`. Nada de memória.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As normas e as tabelas podem mudar; confira o TRCT, a convenção coletiva da sua categoria e consulte um contador ou advogado trabalhista antes de assinar a rescisão.';

/** Lei 12.506/2011: 30 dias + 3 dias por ano completo, teto de 90 dias. */
export const AVISO = { baseDias: 30, diasPorAno: 3, maxDias: 90 };

/** Multa rescisória sobre o saldo do FGTS: 40% (art. 18 §1º Lei 8.036/90) e 20% no acordo (art. 484-A CLT). */
export const MULTA_FGTS = { semJustaCausa: 0.4, acordoMutuo: 0.2 };

/** Tabela do seguro-desemprego (MTE) — espelho de brasil-2026.ts. */
export const SD = {
  faixa1: SEGURO_DESEMPREGO.faixa1,
  faixa2: SEGURO_DESEMPREGO.faixa2,
  parcelaFixa: SEGURO_DESEMPREGO.parcelaFixa,
  teto: SEGURO_DESEMPREGO.teto,
  piso: SEGURO_DESEMPREGO.piso,
};

export const MINIMO = SALARIO_MINIMO;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/rescisao-clt',
  title: 'Rescisão CLT: quanto vou receber ao ser demitido?',
  description:
    'Calcule sua rescisão completa: saldo de salário, aviso prévio proporcional, 13º e férias proporcionais + 1/3, férias vencidas, multa de 40% do FGTS e quantas parcelas de seguro-desemprego você tem direito.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · CLT · verbas rescisórias',
  h1: 'Saí do emprego: quanto entra na minha conta?',
  lede:
    'O valor da rescisão muda completamente conforme o motivo da saída. Informe suas datas e seu salário: a conta separa parcela por parcela, aplica o aviso prévio proporcional da Lei 12.506/2011, a multa do FGTS que cabe a cada caso e mostra se você tem direito ao seguro-desemprego.',
  stamps: [
    `Salário mínimo vigente: ${brl(MINIMO)}`,
    'CLT arts. 477, 484-A e 487 · Lei 12.506/2011 · Lei 8.036/1990',
    '7 calculadoras dentro',
  ],

  resultLabel: 'Total bruto da rescisão',

  cases: {
    title: 'Por que o contrato terminou?',
    intro:
      'É a pergunta que define tudo. As mesmas datas e o mesmo salário podem valer quatro números bem diferentes conforme o motivo da saída.',
    items: [
      {
        id: 'sem_justa_causa',
        label: 'Fui demitido sem justa causa',
        hint: 'Rescisão completa · multa de 40% · seguro-desemprego',
        answer:
          'É a saída mais completa: você recebe todas as parcelas, saca o FGTS com multa de 40% e pode pedir seguro-desemprego.',
        yes: [
          'Saldo de salário dos dias trabalhados no mês da saída',
          'Aviso prévio indenizado: 30 dias + 3 dias por ano completo de casa, até 90 dias (Lei 12.506/2011)',
          '13º salário proporcional aos meses do ano, com a projeção do aviso indenizado somada (art. 487 §1º CLT)',
          'Férias proporcionais + 1/3, e as férias vencidas que ainda não tirou',
          'Multa de 40% sobre todo o saldo depositado do FGTS, inclusive o que você já sacou pelo aniversário',
          'Saque integral do FGTS e habilitação ao seguro-desemprego',
        ],
        warn: [
          AVISO_LEGAL,
          'Os valores da tela são brutos: INSS e IRRF ainda incidem sobre saldo de salário e 13º (férias indenizadas e multa do FGTS não sofrem esses descontos)',
          'Se você aderiu ao saque-aniversário, o saldo fica bloqueado para saque rescisório — a multa de 40% você recebe, o saldo não',
        ],
        plazo:
          'a empresa tem 10 dias corridos a partir do fim do contrato para pagar e dar baixa na carteira (art. 477 §6º CLT); depois disso corre multa de um salário a seu favor.',
      },
      {
        id: 'pedido_demissao',
        label: 'Eu pedi demissão',
        hint: 'Sem multa · sem saque · sem seguro-desemprego',
        answer:
          'Você recebe o que já era seu, mas abre mão da multa de 40%, do saque do FGTS e do seguro-desemprego.',
        yes: [
          'Saldo de salário dos dias trabalhados',
          '13º salário proporcional',
          'Férias proporcionais + 1/3 e férias vencidas + 1/3',
        ],
        warn: [
          AVISO_LEGAL,
          'Se você não cumprir o aviso prévio de 30 dias, a empresa pode descontar esse valor da rescisão',
          'O aviso proporcional (os 3 dias por ano) é um direito só do trabalhador: quem pede demissão deve apenas os 30 dias',
          'Sem saque do FGTS e sem seguro-desemprego',
        ],
        plazo: 'mesmo prazo de 10 dias corridos para o acerto e a baixa na carteira.',
      },
      {
        id: 'acordo_mutuo',
        label: 'Fizemos acordo (art. 484-A)',
        hint: 'Metade do aviso · multa de 20% · saque de 80%',
        answer:
          'No acordo tudo que é rescisório cai pela metade: meio aviso, multa de 20% e saque de até 80% do FGTS.',
        yes: [
          'Saldo de salário e 13º proporcional integrais',
          'Férias proporcionais + 1/3 e vencidas integrais',
          'Metade do aviso prévio indenizado',
          'Multa de 20% sobre o saldo do FGTS',
          'Saque de até 80% do saldo do FGTS',
        ],
        warn: [
          AVISO_LEGAL,
          'O acordo do art. 484-A NÃO dá direito ao seguro-desemprego — é a diferença mais cara e a menos avisada',
          'Acordo simulado, em que na prática houve dispensa, é fraude e pode ser desfeito na Justiça do Trabalho',
        ],
        plazo: 'os 10 dias corridos do art. 477 valem igual; o saque de 80% fica disponível na Caixa após a comunicação da rescisão.',
      },
      {
        id: 'justa_causa',
        label: 'Fui demitido por justa causa',
        hint: 'Só saldo e férias vencidas',
        answer:
          'Na justa causa sobra o mínimo: saldo de salário e as férias vencidas + 1/3, se houver.',
        yes: [
          'Saldo de salário dos dias trabalhados',
          'Férias vencidas + 1/3 (período aquisitivo já completo — Súmula 171 do TST)',
        ],
        warn: [
          AVISO_LEGAL,
          'Sem aviso prévio, sem 13º proporcional, sem férias proporcionais, sem multa de 40% e sem saque do FGTS',
          'A justa causa exige falta grave enquadrada no art. 482 da CLT e prova; muita demissão rotulada de justa causa é revertida na Justiça do Trabalho',
        ],
        plazo: 'se você discorda do enquadramento, a ação trabalhista prescreve em 2 anos a contar do fim do contrato (art. 7º XXIX da Constituição).',
      },
      {
        id: 'prazo_determinado',
        label: 'Acabou meu contrato por prazo determinado',
        hint: 'Experiência ou contrato a termo, no prazo previsto',
        answer:
          'Terminando na data combinada não há aviso prévio, mas há 13º, férias proporcionais + 1/3 e multa de 40%.',
        yes: [
          'Saldo de salário até o último dia',
          '13º proporcional e férias proporcionais + 1/3',
          'Multa de 40% do FGTS e saque do saldo',
          'Direito ao seguro-desemprego, se cumpridos os requisitos de tempo de trabalho',
        ],
        warn: [
          AVISO_LEGAL,
          'Não há aviso prévio quando o contrato chega ao termo final combinado',
          'Se a empresa rompe antes do prazo, deve metade dos salários que faltavam até o fim (art. 479 CLT); se você rompe antes, paga a indenização do art. 480',
        ],
        plazo: 'o acerto do contrato a termo que chega ao fim tem de ser pago até o primeiro dia útil seguinte ao término (art. 477 §6º, I da CLT).',
      },
    ],
  },

  inputsTitle: 'Seus dados do contrato',
  inputsIntro:
    'Salário bruto mensal, as duas datas do contrato e o saldo do FGTS que aparece no aplicativo da Caixa. O resto a conta deduz sozinha.',
  fields: [
    {
      id: 'salario',
      label: 'Salário bruto mensal (R$)',
      prefix: 'R$',
      value: '3.500',
      thousands: true,
      help: 'O salário base + adicionais fixos (insalubridade, periculosidade, comissões habituais). É a média que entra em todas as parcelas.',
    },
    {
      id: 'admissao',
      label: 'Data de admissão',
      type: 'date',
      value: '2022-03-15',
      help: 'Como está na carteira de trabalho. Define os anos completos do aviso proporcional e o período aquisitivo das férias.',
    },
    {
      id: 'saida',
      label: 'Data da saída',
      type: 'date',
      value: '2026-07-20',
      help: 'Último dia trabalhado. Se o aviso for indenizado, a conta projeta esses dias para frente, como manda o art. 487 §1º da CLT.',
    },
    {
      id: 'saldoFgts',
      label: 'Saldo do FGTS depositado (R$)',
      prefix: 'R$',
      value: '12.000',
      thousands: true,
      help: 'Some tudo que foi depositado no contrato, inclusive o que você já sacou pelo aniversário: a multa incide sobre o total depositado.',
    },
    {
      id: 'feriasVencidas',
      label: 'Períodos de férias vencidas e não gozadas',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Nenhum — estou em dia' },
        { value: '1', label: 'Um período (12 meses vencidos)' },
        { value: '2', label: 'Dois períodos (24 meses vencidos)' },
      ],
      help: 'Cada período vencido vale um salário + 1/3. Se a empresa deixou passar o prazo de concessão, o art. 137 da CLT manda pagar em dobro.',
    },
    {
      id: 'mesesTrabalhados',
      label: 'Meses trabalhados nos últimos 36 meses',
      type: 'number',
      value: 36,
      min: 0,
      max: 36,
      step: 1,
      help: 'Define quantas parcelas de seguro-desemprego você pode receber. Conte só os meses com vínculo formal.',
    },
    {
      id: 'solicitacao',
      label: 'É a sua qual solicitação de seguro-desemprego?',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Primeira vez' },
        { value: '2', label: 'Segunda vez' },
        { value: '3', label: 'Terceira ou mais' },
      ],
      help: 'A carência cai a cada solicitação: 12 meses na primeira, 9 na segunda e 6 da terceira em diante.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'De onde vem cada real da sua rescisão',
    caption:
      'Mostra o peso de cada parcela no total bruto: o que é salário atrasado, o que é indenização (aviso e multa do FGTS) e o que é férias e 13º acumulados.',
  },
  breakdownTitle: 'Sua rescisão, parcela por parcela',
  breakdownIntro:
    'A mesma ordem do TRCT (Termo de Rescisão do Contrato de Trabalho). Compare linha a linha com o papel que a empresa te entregar.',

  faq: [
    {
      q: 'Como se calcula o aviso prévio proporcional?',
      a: `São 30 dias fixos mais 3 dias por ano completo de casa, com teto de 90 dias — regra da Lei 12.506/2011. Quem tem 4 anos completos recebe 42 dias; quem tem 20 anos ou mais bate o teto de 90. O adicional proporcional é direito exclusivo do trabalhador: quando é você quem pede demissão, deve à empresa apenas os 30 dias básicos, nunca os proporcionais.`,
    },
    {
      q: 'O aviso indenizado conta como tempo de serviço?',
      a: 'Sim, e isso quase sempre aumenta a rescisão. O art. 487 §1º da CLT manda projetar os dias do aviso indenizado para frente, como se você tivesse trabalhado. Essa projeção pode empurrar o contrato para o mês seguinte e render mais um avo de 13º e mais um avo de férias proporcionais. A conta desta página já faz essa projeção nos casos em que ela se aplica.',
    },
    {
      q: 'A multa de 40% é sobre o saldo que está na minha conta hoje?',
      a: 'Não: é sobre tudo que foi depositado durante o contrato, corrigido, mesmo que você já tenha sacado parte pelo saque-aniversário ou por outra hipótese legal. Por isso quem aderiu ao saque-aniversário continua recebendo a multa cheia, mas não consegue sacar o saldo na demissão — só a multa. É a pegadinha mais comum do saque-aniversário.',
    },
    {
      q: 'Quantas parcelas de seguro-desemprego eu recebo?',
      a: 'Depende de quanto tempo você trabalhou nos últimos 36 meses e de quantas vezes já pediu o benefício. Na primeira solicitação: 4 parcelas com 12 a 23 meses trabalhados e 5 parcelas com 24 meses ou mais. Na segunda: 3 parcelas com 9 a 11 meses, 4 com 12 a 23 e 5 com 24 ou mais. Da terceira em diante: 3 parcelas com 6 a 11 meses, 4 com 12 a 23 e 5 com 24 ou mais.',
    },
    {
      q: 'Quanto vale cada parcela do seguro-desemprego?',
      a: `Sobre a média dos três últimos salários: até ${brl(SD.faixa1)} a parcela é 80% da média; entre ${brl(SD.faixa1)} e ${brl(SD.faixa2)} é ${brl(SD.parcelaFixa)} mais 50% do que passar da primeira faixa; acima disso vale o teto de ${brl(SD.teto)}. Nenhuma parcela pode ser menor que um salário mínimo (${brl(SD.piso)}). Os valores são reajustados todo ano em janeiro pelo INPC.`,
    },
    {
      q: 'A rescisão tem desconto de INSS e imposto de renda?',
      a: 'Parte dela sim. Saldo de salário e 13º salário sofrem INSS e IRRF (o 13º é tributado em separado, com tabela própria). Já as férias indenizadas — proporcionais e vencidas — mais o 1/3 sobre elas, o aviso prévio indenizado e a multa de 40% do FGTS não sofrem esses descontos. Por isso o líquido costuma ficar bem mais perto do bruto numa rescisão do que num mês normal de trabalho.',
    },
    {
      q: 'Quando a empresa tem que me pagar?',
      a: 'Dez dias corridos contados do término do contrato, para qualquer modalidade, junto com a baixa na carteira e a entrega das guias — art. 477 §6º da CLT, na redação da reforma de 2017. Se atrasar, a empresa deve uma multa equivalente a um salário seu, além do valor devido (art. 477 §8º). O único prazo mais curto é o do contrato a termo que chega ao fim.',
    },
    {
      q: 'Recebo férias vencidas em dobro?',
      a: 'Se a empresa deixou passar o período concessivo — os 12 meses seguintes ao período aquisitivo — sim: o art. 137 da CLT manda pagar essas férias em dobro, e o 1/3 constitucional incide sobre o valor dobrado. Esta conta mostra o valor simples; se for o seu caso, dobre a linha de férias vencidas e leve a diferença ao sindicato ou a um advogado.',
    },
    {
      q: 'Fui demitido por justa causa. Vale a pena discutir?',
      a: 'Frequentemente vale, porque a justa causa é a punição mais severa da CLT e exige requisitos rígidos: falta enquadrada no art. 482, prova, imediatidade entre a falta e a punição e ausência de dupla punição pelo mesmo fato. Revertida a justa causa na Justiça do Trabalho, você recebe tudo que teria numa dispensa sem justa causa, incluindo aviso, multa de 40% e habilitação ao seguro-desemprego. O prazo para ajuizar é de 2 anos após o fim do contrato.',
    },
    {
      q: 'O acordo do art. 484-A dá seguro-desemprego?',
      a: 'Não. É a principal desvantagem do acordo e a que mais gente descobre tarde. No acordo você recebe metade do aviso, 20% de multa e pode sacar 80% do FGTS, mas fica fora do programa do seguro-desemprego. Antes de aceitar, compare o que você ganharia de parcelas do benefício com o que perde ao não ser demitido de fato.',
    },
    {
      q: 'O que é o TRCT e por que devo conferir?',
      a: 'É o Termo de Rescisão do Contrato de Trabalho, o documento que discrimina cada verba paga e cada desconto. Confira uma a uma: código da causa do afastamento (é ele que libera ou não o saque do FGTS e o seguro-desemprego), dias de aviso, avos de 13º e de férias, base da multa do FGTS e descontos. Assinar o TRCT não impede você de cobrar diferenças depois, mas conferir antes evita meses de discussão.',
    },
    {
      q: 'Trabalhei poucos meses. Tenho direito a férias proporcionais?',
      a: 'Sim. Desde a Súmula 261 do TST, mesmo com menos de 12 meses de casa você recebe férias proporcionais + 1/3 na dispensa sem justa causa e também quando pede demissão. Cada mês com 15 dias ou mais de trabalho conta como um avo. A única hipótese em que se perdem as férias proporcionais é a demissão por justa causa.',
    },
  ],

  sources: [
    {
      name: 'CLT — Decreto-Lei 5.452/1943 (arts. 477, 482, 484-A, 487 e 137)',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 12.506/2011 — aviso prévio proporcional ao tempo de serviço',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12506.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 8.036/1990 — FGTS e multa rescisória de 40%',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 7.998/1990 — Programa do Seguro-Desemprego',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l7998.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Seguro-desemprego — requisitos, parcelas e valores',
      url: 'https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/seguro-desemprego',
      publisher: 'Ministério do Trabalho e Emprego',
    },
    {
      name: 'FGTS — saque rescisório e saque-aniversário',
      url: 'https://www.fgts.gov.br/',
      publisher: 'Caixa Econômica Federal',
    },
  ],

  replaces: [
    '/pt/rescisao-clt-sem-justa-causa',
    '/pt/rescisao-clt-justa-causa',
    '/pt/aviso-previo-indenizado-30-dias',
    '/pt/aviso-previo-proporcional-3-dias-ano',
    '/pt/ferias-proporcionais-clt-demitido',
    '/pt/decimo-terceiro-salario-proporcional',
    '/pt/seguro-desemprego-valor-parcelas-trabalhador-clt',
  ],

  lastReviewed: '2026-07-28',
};
