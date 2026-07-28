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
 * Hub de decisão BR — "Férias e 13º: quanto eu recebo e quando cai?"
 *
 * Absorve 5 calculadoras soltas. Constantes de INSS e IRRF vêm de
 * src/lib/data/brasil-2026.ts (mesma fonte das fórmulas vivas). Regras de férias
 * e 13º: CLT arts. 129-145, Lei 4.090/1962 e Lei 4.749/1965.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As tabelas do INSS e do IRRF mudam por portaria e a sua convenção coletiva pode prever regras próprias; confira o recibo de férias e consulte o RH ou um contador.';

export const MINIMO = SALARIO_MINIMO;
export const TETO_INSS = INSS_TETO;
export const DEP = IRRF_DEDUCAO_DEPENDENTE;
export const REDUTOR = { isencao: IRRF_ISENCAO_REDUTOR, teto: IRRF_REDUTOR_TETO };

export const INSS = INSS_FAIXAS.map((f) => ({ ate: f.ate, aliquota: f.aliquota, deduzir: f.deduzir }));
/** `Infinity` não sobrevive ao define:vars → viaja como null. */
export const IRRF = IRRF_FAIXAS.map((f) => ({
  ate: Number.isFinite(f.ate) ? f.ate : null,
  aliquota: f.aliquota,
  deduzir: f.deduzir,
}));

/** Estágio: 30 dias de recesso remunerado a cada 12 meses, proporcional se o contrato for menor (art. 13 da Lei 11.788/2008). */
export const ESTAGIO_RECESSO_DIAS = 30;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/ferias-e-decimo-terceiro',
  title: 'Férias e 13º salário: quanto vou receber e quando cai?',
  description:
    'Calcule as férias com o 1/3 constitucional, o abono pecuniário da venda de 10 dias, os descontos de INSS e IRRF, as duas parcelas do 13º salário e o recesso proporcional do estagiário.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · CLT · férias e 13º',
  h1: 'Férias e 13º: o valor certo e a data em que cai.',
  lede:
    'As duas verbas que mais geram dúvida no ano têm regras de desconto diferentes: as férias saem com 1/3 a mais e desconto na hora, o 13º vem em duas parcelas e só a segunda leva imposto. Informe seu salário e a situação: a conta separa proventos, descontos e prazos legais.',
  stamps: [
    `Salário mínimo: ${brl(MINIMO)} · teto do INSS: ${brl(TETO_INSS)}`,
    'CLT arts. 129 a 145 · Lei 4.090/1962 · Lei 11.788/2008',
    '5 calculadoras dentro',
  ],

  resultLabel: 'Valor líquido a receber',

  cases: {
    title: 'Qual é a sua situação?',
    intro:
      'Férias integrais, férias com venda de dias, férias fracionadas e as parcelas do 13º seguem contas parecidas, mas descontos e prazos bem diferentes.',
    items: [
      {
        id: 'ferias_integrais',
        label: 'Vou tirar 30 dias de férias',
        hint: 'Férias integrais + 1/3 constitucional',
        answer: 'Você recebe o salário do período mais 1/3, com INSS e IRRF calculados sobre o total.',
        yes: [
          'Remuneração dos dias de férias, com a média dos adicionais habituais',
          '1/3 constitucional sobre esse valor (art. 7º XVII da Constituição)',
          'INSS e IRRF incidem sobre férias gozadas, inclusive sobre o terço',
          'Adiantamento do 13º, se você pedir até janeiro do ano em que vai tirar férias',
        ],
        warn: [
          AVISO_LEGAL,
          'O pagamento tem de ser feito até 2 dias antes do início das férias (art. 145 CLT); pagar depois gera o direito ao dobro, segundo a Súmula 450 do TST',
          'As férias não podem começar nos 2 dias que antecedem feriado nem no dia de repouso semanal (art. 134 §3º)',
        ],
        plazo:
          'a empresa tem 12 meses após o fim do período aquisitivo para conceder as férias; passou disso, paga em dobro (art. 137 CLT).',
      },
      {
        id: 'abono',
        label: 'Quero vender 10 dias das minhas férias',
        hint: 'Abono pecuniário · 1/3 dos dias',
        answer:
          'Você pode converter até 1/3 das férias em dinheiro: 10 dias, quando o direito é de 30.',
        yes: [
          '20 dias de férias gozadas + 1/3 sobre eles',
          '10 dias vendidos (abono pecuniário) + 1/3 sobre o abono',
          'O abono pecuniário e o seu terço não sofrem INSS nem IRRF',
        ],
        warn: [
          AVISO_LEGAL,
          'É direito do trabalhador, mas precisa ser requerido até 15 dias antes do fim do período aquisitivo (art. 143 §1º CLT)',
          'A empresa não pode obrigar você a vender dias, nem recusar o pedido feito no prazo',
          'Se o direito às férias for reduzido por faltas, o terço vendável cai junto: sempre 1/3 do que você tem direito',
        ],
        plazo: 'o abono é pago junto com as férias, no mesmo prazo de 2 dias antes do início.',
      },
      {
        id: 'fracionadas',
        label: 'Vou fracionar minhas férias',
        hint: 'Até 3 períodos · um de 14 dias no mínimo',
        answer:
          'Desde a reforma de 2017, as férias podem ser divididas em até três períodos, com regras de tamanho mínimo.',
        yes: [
          'Até 3 períodos, um deles com no mínimo 14 dias corridos',
          'Os outros dois não podem ter menos de 5 dias corridos cada',
          'Cada período leva o seu 1/3 proporcional',
          'O fracionamento depende da concordância do trabalhador',
        ],
        warn: [
          AVISO_LEGAL,
          'Menores de 18 e maiores de 50 anos deixaram de ter proibição de fracionar com a reforma, mas a regra dos 14 + 5 + 5 continua valendo para todos',
          'Fracionar em muitos pedaços dilui o descanso e costuma sair pior para a saúde do que para o bolso',
        ],
        plazo: 'cada período tem o seu próprio prazo de pagamento: 2 dias antes de cada início.',
      },
      {
        id: 'decimo',
        label: 'Quero saber do meu 13º salário',
        hint: 'Duas parcelas · descontos só na segunda',
        answer:
          'A primeira parcela é metade do salário, sem descontos; a segunda leva INSS e IRRF do 13º inteiro.',
        yes: [
          '1ª parcela: 50% do salário, paga entre fevereiro e 30 de novembro, sem nenhum desconto',
          '2ª parcela: paga até 20 de dezembro, com INSS e IRRF calculados sobre o 13º integral',
          'Cada mês com 15 dias ou mais de trabalho vale 1/12 do 13º',
          'A média dos adicionais habituais entra na base',
        ],
        warn: [
          AVISO_LEGAL,
          'O 13º é tributado em separado do salário do mês: não soma com dezembro para efeito de faixa do IRRF',
          'Por isso a 2ª parcela costuma vir bem menor que a 1ª — não é erro da empresa',
          'Quem recebe a 1ª parcela junto com as férias tem de pedir por escrito até 31 de janeiro (art. 2º §2º da Lei 4.749/1965)',
        ],
        plazo:
          'os prazos são legais e improrrogáveis: 30 de novembro para a 1ª parcela e 20 de dezembro para a 2ª.',
      },
      {
        id: 'estagio',
        label: 'Sou estagiário',
        hint: 'Recesso remunerado, não férias',
        answer:
          'Estagiário não tem férias nem 13º: tem 30 dias de recesso remunerado por ano de estágio, proporcional se ficar menos.',
        yes: [
          '30 dias de recesso a cada 12 meses de estágio, proporcionais em contratos menores',
          'Remunerado quando o estágio é remunerado (art. 13 da Lei 11.788/2008)',
          'Deve ser gozado, preferencialmente, junto com as férias escolares',
        ],
        warn: [
          AVISO_LEGAL,
          'Estágio não gera vínculo empregatício: não há 13º, FGTS, aviso prévio nem multa rescisória',
          'Se o estágio na prática funcionar como emprego (subordinação, sem projeto pedagógico, sem supervisão), o vínculo pode ser reconhecido na Justiça com todos os direitos da CLT',
          'A bolsa e o auxílio-transporte são obrigatórios no estágio não obrigatório',
        ],
        plazo: 'o recesso não gozado até o fim do estágio deve ser indenizado proporcionalmente.',
      },
    ],
  },

  inputsTitle: 'Seus números',
  inputsIntro:
    'Salário bruto mensal e o tempo do período. Os campos que não se aplicam ao seu caso podem ficar como estão.',
  fields: [
    {
      id: 'salario',
      label: 'Salário bruto mensal (R$)',
      prefix: 'R$',
      value: '3.500',
      thousands: true,
      help: 'Inclua a média dos adicionais habituais: horas extras, noturno, insalubridade, comissões.',
    },
    {
      id: 'diasFerias',
      label: 'Dias de férias que vai tirar',
      type: 'number',
      value: 30,
      min: 1,
      max: 30,
      step: 1,
      help: 'Se vendeu 10 dias, informe 20. O direito cai conforme as faltas injustificadas do período (art. 130 CLT).',
    },
    {
      id: 'vendeDias',
      label: 'Dias vendidos (abono pecuniário)',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: 'Até 1/3 do direito. Com 30 dias de direito, o máximo é 10. O abono não sofre INSS nem IRRF.',
    },
    {
      id: 'meses13',
      label: 'Meses trabalhados no ano (para o 13º)',
      type: 'number',
      value: 12,
      min: 0,
      max: 12,
      step: 1,
      help: 'Cada mês com 15 dias ou mais de trabalho vale um avo.',
    },
    {
      id: 'dependentes',
      label: 'Dependentes para o IRRF',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada dependente abate ${brl(DEP)} da base do imposto.`,
    },
    {
      id: 'mesesEstagio',
      label: 'Meses de estágio cumpridos',
      type: 'number',
      value: 0,
      min: 0,
      max: 24,
      step: 1,
      help: 'Só para estagiários: 30 dias de recesso a cada 12 meses, proporcional.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Proventos e descontos do período',
    caption:
      'Compara o que é remuneração de férias, o que é o 1/3 constitucional, o que é abono isento e quanto vai para INSS e IRRF.',
  },
  breakdownTitle: 'Seu recibo, linha por linha',
  breakdownIntro:
    'A mesma ordem do recibo de férias e do recibo do 13º. Compare com o papel que o RH entregar.',

  faq: [
    {
      q: 'Como se calcula o 1/3 constitucional das férias?',
      a: 'É um terço da remuneração das férias, garantido pelo art. 7º, inciso XVII da Constituição. Incide sobre os dias gozados e também sobre o abono pecuniário, se você vendeu dias. Não é um bônus da empresa nem algo negociável: é adicional constitucional obrigatório, devido inclusive nas férias indenizadas da rescisão.',
    },
    {
      q: 'Férias têm desconto de INSS e imposto de renda?',
      a: 'Férias gozadas, sim: INSS e IRRF incidem sobre o valor das férias e sobre o terço. Férias indenizadas na rescisão e o abono pecuniário da venda de dias, não — nem o terço que acompanha o abono. Essa é a diferença que faz o líquido de quem vende 10 dias subir mais do que a maioria espera.',
    },
    {
      q: 'Quantos dias posso vender das minhas férias?',
      a: 'Até um terço do período a que você tem direito — 10 dias, quando o direito é de 30. O pedido tem de ser feito até 15 dias antes do fim do período aquisitivo (art. 143 §1º da CLT). É uma faculdade sua: a empresa não pode impor a venda nem recusar o pedido feito no prazo. Se o seu direito for reduzido por faltas, o máximo vendável cai proporcionalmente.',
    },
    {
      q: 'Faltas podem reduzir meus dias de férias?',
      a: 'Sim, e bastante. Pelo art. 130 da CLT: até 5 faltas injustificadas no período aquisitivo, 30 dias de férias; de 6 a 14 faltas, 24 dias; de 15 a 23, 18 dias; de 24 a 32, 12 dias; com mais de 32 faltas, você perde o direito às férias daquele período. Faltas justificadas e abonadas não entram nessa conta.',
    },
    {
      q: 'Posso fracionar as férias em três períodos?',
      a: 'Pode, desde a reforma trabalhista de 2017 (art. 134 §1º da CLT), com duas condições: um dos períodos precisa ter no mínimo 14 dias corridos e os outros dois, no mínimo 5 dias corridos cada. E o fracionamento depende da sua concordância — não é decisão unilateral da empresa.',
    },
    {
      q: 'Quando o 13º salário tem que ser pago?',
      a: 'A primeira parcela, correspondente a 50% do salário, entre 1º de fevereiro e 30 de novembro. A segunda, até 20 de dezembro. São prazos legais das Leis 4.090/1962 e 4.749/1965, e o atraso sujeita a empresa a multa administrativa, além do pagamento do que deve. Você também pode pedir para receber a 1ª parcela junto com as férias, desde que requeira por escrito até 31 de janeiro.',
    },
    {
      q: 'Por que a segunda parcela do 13º vem tão menor?',
      a: 'Porque a primeira é paga bruta, sem nenhum desconto, e todos os descontos de INSS e IRRF do 13º inteiro são feitos de uma vez só na segunda. Quem tem salário mais alto pode ver a segunda parcela cair para menos da metade da primeira. Não é erro: é a forma de cálculo prevista em lei.',
    },
    {
      q: 'O 13º soma com o salário de dezembro para o imposto de renda?',
      a: 'Não. O 13º tem tributação exclusiva na fonte: é calculado em separado, com a sua própria base e a sua própria faixa da tabela mensal. Isso costuma ser bom para você, porque evita que a soma das duas verbas empurre tudo para uma faixa mais alta. Na declaração anual ele entra como rendimento de tributação exclusiva, e não se soma aos rendimentos tributáveis.',
    },
    {
      q: 'Quantos avos de 13º eu tenho?',
      a: 'Um avo por mês em que você trabalhou 15 dias ou mais. Quem foi admitido no dia 10 de março tem o mês de março contado; quem entrou no dia 20, não. Na saída vale a mesma regra, e o aviso prévio indenizado projeta o contrato para frente, o que pode render mais um avo.',
    },
    {
      q: 'Estagiário tem direito a férias e 13º?',
      a: 'Não, porque o estágio não gera vínculo de emprego. O que a Lei 11.788/2008 garante é o recesso: 30 dias remunerados a cada 12 meses de estágio, proporcionais quando o contrato é mais curto, de preferência coincidindo com as férias escolares. Não há 13º, FGTS nem verbas rescisórias. Se o estágio, na prática, funcionar como emprego, o vínculo pode ser reconhecido na Justiça com todos os direitos.',
    },
    {
      q: 'A empresa pode escolher quando eu tiro férias?',
      a: 'Em regra sim: a época da concessão é definida pelo empregador, conforme o interesse do serviço (art. 136 da CLT). Há exceções — membros de uma mesma família que trabalham na mesma empresa podem gozar juntos, e o estudante menor de 18 anos pode fazer coincidir com as férias escolares. O que a empresa não pode é deixar o prazo de 12 meses passar sem conceder: aí paga em dobro.',
    },
    {
      q: 'O que acontece se a empresa pagar as férias com atraso?',
      a: 'O art. 145 da CLT manda pagar até 2 dias antes do início das férias. Segundo a Súmula 450 do TST, o pagamento fora desse prazo gera o direito ao pagamento em dobro das férias e do terço, mesmo que elas tenham sido concedidas dentro do prazo legal. Guarde o comprovante da data do depósito.',
    },
  ],

  sources: [
    {
      name: 'CLT — Decreto-Lei 5.452/1943 (arts. 129 a 145: férias, fracionamento e abono)',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 4.090/1962 — gratificação de Natal (13º salário)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l4090.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 4.749/1965 — pagamento do 13º em duas parcelas',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l4749.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 11.788/2008 — estágio e recesso remunerado (art. 13)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Súmula 450 do TST — pagamento de férias fora do prazo',
      url: 'https://www3.tst.jus.br/jurisprudencia/Sumulas_com_indice/Sumulas_Ind_401_450.html',
      publisher: 'Tribunal Superior do Trabalho',
    },
    {
      name: 'Tabela de contribuição mensal do INSS',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal',
      publisher: 'INSS',
    },
  ],

  replaces: [
    '/pt/calculadora-ferias-1-3-empregado-clt',
    '/pt/ferias-clt-integrais-mais-um-terco',
    '/pt/abono-pecuniario-10-dias-ferias',
    '/pt/decimo-terceiro-segunda-parcela-dezembro',
    '/pt/recesso-estagio-proporcional-dias',
  ],

  lastReviewed: '2026-07-28',
};
