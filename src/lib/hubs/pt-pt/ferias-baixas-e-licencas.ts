import type { HubData } from '../types';
import { PORTUGAL_2026, FERIADOS_2026, PRE_AVISO_DEMISSAO_2026, LAYOFF_2026, fmtEUR } from '../../data/portugal-2026';

/**
 * Hub de decisão PT — "Quantos dias posso estar fora do trabalho e quanto recebo?"
 *
 * Absorve seis calculadoras da mesma pergunta: dias de férias, dias úteis e
 * feriados, subsídio de doença, subsídio parental, compensação de layoff e
 * pré-aviso de demissão.
 *
 * Constantes: src/lib/data/portugal-2026.ts. As percentagens dos subsídios e os
 * dias de férias vivem nas fórmulas (não na tabela mestra) e vêm aqui com o
 * artigo do Código do Trabalho ou da Segurança Social à vista.
 */

/** Disclaimer YMYL — cópia textual de src/lib/disclaimers.ts, idioma `pt`, domínio `labor`. */
const DISCLAIMER_LABOR =
  'Cálculo orientativo conforme as regras indicadas. Convenções, limites e situações individuais podem alterar o resultado; confirme com RH, órgão trabalhista ou profissional habilitado.';

export const IAS = PORTUGAL_2026.ias;
export const RMMG_MENSAL = PORTUGAL_2026.rmmg.mensal;

/** Direito a férias — art. 238.º do Código do Trabalho. */
export const FERIAS = {
  anoCompleto: 22,
  diasPorMesNoAnoDeAdmissao: 2,
  maximoNoAnoDeAdmissao: 20,
  mesesAtePoderGozar: 6,
};

/** Feriados nacionais obrigatórios do ano. O Carnaval é facultativo e entra à parte. */
export const FERIADOS = FERIADOS_2026.map((f) => ({ data: f.data, nome: f.nome }));
export const CARNAVAL = { data: '2026-02-17', nome: 'Carnaval (facultativo)' };

/**
 * Subsídio de doença — escalões por duração da baixa. Os três primeiros dias não
 * são pagos ao trabalhador por conta de outrem. Mínimo diário de 30 % do IAS.
 * `Infinity` viaja como null em `define:vars`.
 */
export const DOENCA = {
  diasNaoPagos: 3,
  minimoDiario: Math.round((PORTUGAL_2026.ias / 30) * 0.3 * 100) / 100,
  escaloes: [
    { ate: 30, pct: 0.55, majoracao: 0.05 },
    { ate: 90, pct: 0.6, majoracao: 0.05 },
    { ate: 365, pct: 0.7, majoracao: 0 },
    { ate: null, pct: 0.75, majoracao: 0 },
  ],
};

/** Subsídio parental inicial — modalidades e mínimo diário de 80 % do IAS. */
export const PARENTAL = {
  minimoDiario: Math.round((PORTUGAL_2026.ias / 30) * 0.8 * 100) / 100,
  modalidades: {
    '120': { dias: 120, pct: 1.0, label: '120 dias a 100 %' },
    '150': { dias: 150, pct: 0.8, label: '150 dias a 80 %' },
    partilha150: { dias: 150, pct: 1.0, label: '120 + 30 de partilha = 150 dias a 100 %' },
    partilha180: { dias: 180, pct: 0.83, label: '150 + 30 de partilha = 180 dias a 83 %' },
  },
};

/** Compensação retributiva em layoff — art. 305.º do Código do Trabalho. */
export const LAYOFF = {
  fracao: LAYOFF_2026.fracao,
  piso: LAYOFF_2026.piso,
  teto: LAYOFF_2026.teto,
  parteSegSocialAte60Dias: 0.8,
  parteEntidadeAte60Dias: 0.2,
  parteSegSocialDepois: 0.7,
  parteEntidadeDepois: 0.3,
};

/** Pré-aviso de denúncia do contrato pelo trabalhador — art. 400.º do Código do Trabalho. */
export const PRE_AVISO = PRE_AVISO_DEMISSAO_2026;

export const hub: HubData = {
  slug: 'pt-pt/trabalho/ferias-baixas-e-licencas',
  title: 'Férias, feriados, baixas e licenças em Portugal: dias e quanto recebe',
  description:
    'Quantos dias de férias tem por lei, quantos dias úteis e feriados há no período que quer marcar, quanto paga a Segurança Social numa baixa médica ou numa licença parental, o que recebe em layoff e que pré-aviso tem de dar se sair.',
  silo: 'Trabalho',
  siloHref: '/pt-pt/trabalho',
  locale: 'pt-pt',

  eyebrow: 'Portugal · Código do Trabalho · Segurança Social',
  h1: 'Os dias em que não trabalha — e quanto recebe por eles.',
  lede:
    'Férias, feriados, baixa médica, licença parental, layoff e a saída da empresa têm todos a mesma pergunta por trás: quantos dias e com que dinheiro. Esta calculadora responde às seis situações com os artigos e as percentagens em vigor.',
  stamps: [
    `${FERIAS.anoCompleto} dias úteis de férias por ano · ${FERIADOS.length} feriados nacionais obrigatórios`,
    `IAS ${fmtEUR(IAS)} · mínimo diário de doença ${fmtEUR(DOENCA.minimoDiario)} e parental ${fmtEUR(PARENTAL.minimoDiario)}`,
    '6 calculadoras lá dentro',
  ],

  resultLabel: 'O que lhe corresponde',

  cases: {
    title: 'Porque é que vai faltar?',
    intro:
      'Cada ausência tem a sua regra e a sua percentagem. Começamos pela mais frequente: marcar férias.',
    items: [
      {
        id: 'ferias',
        label: 'Vou marcar férias',
        hint: `${FERIAS.anoCompleto} dias úteis · art. 238.º CT`,
        answer: `Num ano civil completo tem direito a ${FERIAS.anoCompleto} dias úteis de férias — e dias úteis não incluem fins de semana nem feriados.`,
        yes: [
          `${FERIAS.anoCompleto} dias úteis por ano civil completo`,
          `No ano de admissão: ${FERIAS.diasPorMesNoAnoDeAdmissao} dias úteis por cada mês de contrato, até ${FERIAS.maximoNoAnoDeAdmissao} dias`,
          `No ano de admissão as férias só se gozam depois de ${FERIAS.mesesAtePoderGozar} meses completos de contrato`,
          'As férias são pagas como se estivesse a trabalhar, e ainda dão direito ao subsídio de férias',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Contratos coletivos podem atribuir mais do que o mínimo legal: confirme o seu IRCT antes de contar apenas 22',
          'A marcação faz-se por acordo; sem acordo, o empregador marca, mas nunca menos de dez dias úteis seguidos entre 1 de maio e 31 de outubro',
          'Férias não gozadas por facto imputável ao empregador dão direito ao triplo da retribuição desses dias',
        ],
        plazo: 'o mapa de férias tem de estar afixado na empresa até 15 de abril e manter-se até 31 de outubro.',
      },
      {
        id: 'doenca',
        label: 'Estou de baixa médica',
        hint: 'Subsídio de doença · sobe com a duração',
        answer: `Os três primeiros dias não são pagos, e a partir daí a percentagem sobe com a duração da baixa: 55 %, 60 %, 70 % e 75 %.`,
        yes: [
          `Dias 1 a ${DOENCA.diasNaoPagos}: sem subsídio, para trabalhador por conta de outrem`,
          'Dias 4 a 30: 55 % da remuneração de referência diária',
          'Dias 31 a 90: 60 %. Dias 91 a 365: 70 %. Acima de um ano: 75 %',
          `Majoração de 5 pontos percentuais nos dois primeiros escalões para quem tem remuneração de referência baixa ou três ou mais filhos`,
          `Mínimo garantido de ${fmtEUR(DOENCA.minimoDiario)} por dia (30 % do IAS)`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'A remuneração de referência é a média dos seis meses anteriores aos dois que precedem a baixa, não o salário do mês passado',
          'A baixa por internamento hospitalar ou por tuberculose tem regras próprias, mais favoráveis, que esta conta não aplica',
          'Há convenções coletivas em que o empregador paga os três primeiros dias — confirme antes de assumir que perde esses dias',
        ],
        plazo: 'o certificado de incapacidade temporária é comunicado eletronicamente pelo médico; o subsídio costuma ser pago no prazo de algumas semanas após o fim de cada período.',
      },
      {
        id: 'parental',
        label: 'Vou ter um filho',
        hint: 'Licença parental inicial · 120 a 180 dias',
        answer:
          'A escolha é entre receber tudo durante menos tempo ou menos por mais tempo — e a partilha entre os dois progenitores muda a conta.',
        yes: [
          '120 dias pagos a 100 % da remuneração de referência',
          '150 dias pagos a 80 %',
          'Partilha entre os dois progenitores: 150 dias a 100 % ou 180 dias a 83 %',
          `Mínimo garantido de ${fmtEUR(PARENTAL.minimoDiario)} por dia (80 % do IAS)`,
          'A licença exclusiva do pai é sempre paga a 100 %',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'A modalidade escolhida não se pode alterar depois de comunicada à Segurança Social',
          'O subsídio parental não desconta IRS nem Segurança Social, por isso o valor apurado é o que recebe mesmo',
          'Só há acesso ao subsídio com um mínimo de meses de descontos registados antes do parto',
        ],
        plazo: 'o requerimento entrega-se na Segurança Social Direta nos seis meses seguintes ao início da licença.',
      },
      {
        id: 'layoff',
        label: 'A empresa pôs-me em layoff',
        hint: 'Compensação retributiva · art. 305.º CT',
        answer: `Recebe dois terços da retribuição normal ilíquida, nunca abaixo de ${fmtEUR(LAYOFF.piso)} nem acima de ${fmtEUR(LAYOFF.teto)}.`,
        yes: [
          'Compensação retributiva igual a dois terços da retribuição normal ilíquida',
          `Piso na retribuição mínima mensal garantida: ${fmtEUR(LAYOFF.piso)}`,
          `Teto em três vezes a RMMG: ${fmtEUR(LAYOFF.teto)}`,
          `Nos primeiros 60 dias a Segurança Social suporta ${(LAYOFF.parteSegSocialAte60Dias * 100).toLocaleString('de-DE')} % e a entidade ${(LAYOFF.parteEntidadeAte60Dias * 100).toLocaleString('de-DE')} %`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Durante o layoff mantêm-se os direitos a férias, subsídios e antiguidade, calculados sobre a retribuição normal',
          'A empresa tem de comunicar a medida por escrito, com fundamentação e prazo definido, e ouvir os representantes dos trabalhadores',
          'Se a empresa não pagar a sua parte, o trabalhador pode resolver o contrato com justa causa e direito a compensação',
        ],
        plazo: 'a comunicação da medida tem de ser feita aos trabalhadores com pelo menos cinco dias de antecedência em relação ao início.',
      },
      {
        id: 'sair',
        label: 'Vou despedir-me',
        hint: 'Pré-aviso · art. 400.º CT',
        answer:
          'O pré-aviso depende do tipo de contrato e da antiguidade, e conta-se em dias de calendário, não em dias úteis.',
        yes: [
          `Contrato sem termo com até 2 anos de antiguidade: ${PRE_AVISO.semTermoAte2anos} dias`,
          `Contrato sem termo com mais de 2 anos: ${PRE_AVISO.semTermoMais2anos} dias`,
          `Contrato a termo com duração de 6 meses ou mais: ${PRE_AVISO.termo6mesesOuMais} dias`,
          `Contrato a termo com duração inferior a 6 meses: ${PRE_AVISO.termoMenos6meses} dias`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Não cumprir o pré-aviso obriga a indemnizar o empregador pela retribuição base e diuturnidades dos dias em falta',
          'Cargos de direção ou administração podem ter o pré-aviso alargado até seis meses por instrumento de regulamentação coletiva',
          'Demitir-se por iniciativa própria não dá acesso a subsídio de desemprego, salvo nos casos de resolução com justa causa',
        ],
        plazo: 'a denúncia tem de ser comunicada por escrito e os dias de pré-aviso contam-se em dias de calendário a partir dessa comunicação.',
      },
    ],
  },

  inputsTitle: 'Os seus dados',
  inputsIntro:
    'Preencha o que interessa ao seu caso: os restantes campos ficam de fora da conta.',
  fields: [
    {
      id: 'situacaoFerias',
      label: 'Situação para as férias',
      type: 'select',
      value: 'completo',
      options: [
        { value: 'completo', label: 'Ano civil completo na empresa' },
        { value: 'admissao', label: 'Ano de admissão (entrei este ano)' },
      ],
      help: 'No ano de admissão o direito é proporcional aos meses de contrato.',
    },
    {
      id: 'mesesContrato',
      label: 'Meses de contrato no ano de admissão',
      type: 'number',
      value: 7,
      min: 0,
      max: 12,
      step: 1,
      help: `${FERIAS.diasPorMesNoAnoDeAdmissao} dias úteis por mês, até ao máximo de ${FERIAS.maximoNoAnoDeAdmissao}.`,
    },
    {
      id: 'dataInicio',
      label: 'Início do período a contar',
      type: 'date',
      value: '2026-08-01',
      help: 'Serve para contar dias úteis e feriados do período de férias que quer marcar.',
    },
    {
      id: 'dataFim',
      label: 'Fim do período a contar',
      type: 'date',
      value: '2026-08-31',
      help: 'Ambas as datas entram na contagem.',
    },
    {
      id: 'incluirCarnaval',
      label: 'Contar o Carnaval como feriado',
      type: 'select',
      value: 'nao',
      options: [
        { value: 'nao', label: 'Não — é facultativo' },
        { value: 'sim', label: 'Sim — a minha empresa dá' },
      ],
      help: 'O Carnaval não é feriado obrigatório: depende da empresa ou do município.',
    },
    {
      id: 'remuneracaoMedia',
      label: 'Remuneração de referência mensal (€)',
      value: '1.400',
      thousands: true,
      suffix: '€',
      help: 'Nos subsídios da Segurança Social é a média dos meses anteriores; no layoff é a retribuição normal ilíquida.',
    },
    {
      id: 'diasBaixa',
      label: 'Dias de baixa médica',
      type: 'number',
      value: 20,
      min: 0,
      max: 1095,
      step: 1,
      help: `Os primeiros ${DOENCA.diasNaoPagos} dias não são pagos.`,
    },
    {
      id: 'majoracao',
      label: 'Tem direito à majoração da baixa',
      type: 'select',
      value: 'nao',
      options: [
        { value: 'nao', label: 'Não' },
        { value: 'sim', label: 'Sim — remuneração baixa ou 3 ou mais filhos' },
      ],
      help: 'Soma 5 pontos percentuais nos escalões de 55 % e 60 %.',
    },
    {
      id: 'modalidade',
      label: 'Modalidade da licença parental',
      type: 'select',
      value: '120',
      options: [
        { value: '120', label: '120 dias a 100 %' },
        { value: '150', label: '150 dias a 80 %' },
        { value: 'partilha150', label: 'Partilhada: 150 dias a 100 %' },
        { value: 'partilha180', label: 'Partilhada: 180 dias a 83 %' },
      ],
      help: 'Mais dias significa menos por dia, exceto quando há partilha entre os dois progenitores.',
    },
    {
      id: 'tipoContrato',
      label: 'Tipo de contrato',
      type: 'select',
      value: 'sem_termo',
      options: [
        { value: 'sem_termo', label: 'Sem termo (efetivo)' },
        { value: 'a_termo', label: 'A termo' },
      ],
      help: 'Determina a regra do pré-aviso.',
    },
    {
      id: 'antiguidade',
      label: 'Anos de antiguidade',
      type: 'number',
      value: 3,
      min: 0,
      max: 50,
      step: 1,
      help: 'Só conta nos contratos sem termo: acima de 2 anos o pré-aviso duplica.',
    },
    {
      id: 'duracaoContrato',
      label: 'Duração do contrato a termo',
      type: 'select',
      value: '6mais',
      options: [
        { value: '6mais', label: '6 meses ou mais' },
        { value: 'menos6', label: 'Menos de 6 meses' },
      ],
      help: 'Só conta nos contratos a termo.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Quanto do período é que fica coberto',
    caption:
      'Mostra a composição do caso que escolheu: dias úteis contra fins de semana e feriados, ou a parte da retribuição que o subsídio cobre e a parte que perde.',
  },
  breakdownTitle: 'A conta, linha a linha',
  breakdownIntro:
    'Os dias que a lei lhe dá, a percentagem que se aplica a cada escalão, o mínimo garantido e o que sobra face ao que ganharia a trabalhar.',

  faq: [
    {
      q: 'Quantos dias de férias tenho por lei?',
      a: `${FERIAS.anoCompleto} dias úteis por ano civil completo, segundo o art. 238.º do Código do Trabalho. Dias úteis quer dizer que sábados, domingos e feriados não contam — na prática, ${FERIAS.anoCompleto} dias úteis correspondem a mais de um mês de calendário. Muitos contratos coletivos atribuem mais do que o mínimo legal, por isso vale sempre a pena confirmar o IRCT do setor.`,
    },
    {
      q: 'E no ano em que entrei na empresa?',
      a: `O direito é proporcional: ${FERIAS.diasPorMesNoAnoDeAdmissao} dias úteis por cada mês de duração do contrato nesse ano civil, até ao máximo de ${FERIAS.maximoNoAnoDeAdmissao} dias. Há ainda uma condição de tempo: no ano de admissão as férias só podem ser gozadas depois de ${FERIAS.mesesAtePoderGozar} meses completos de contrato. Quem entra em novembro, por exemplo, só goza férias já no ano seguinte.`,
    },
    {
      q: 'Quantos feriados há em Portugal?',
      a: `São ${FERIADOS.length} feriados nacionais obrigatórios, a que acresce um feriado municipal em cada concelho. O Carnaval não é feriado obrigatório: é uma tolerância que depende da empresa ou do município. Quando um feriado cai a um sábado ou domingo, perde-se — a lei não prevê transferência para o dia útil seguinte.`,
    },
    {
      q: 'Quanto se recebe de baixa médica?',
      a: `Os primeiros ${DOENCA.diasNaoPagos} dias não são pagos ao trabalhador por conta de outrem. A partir do quarto dia, o subsídio é uma percentagem da remuneração de referência diária que sobe com a duração: 55 % até aos 30 dias, 60 % dos 31 aos 90, 70 % dos 91 aos 365 e 75 % acima de um ano. Há uma majoração de 5 pontos percentuais nos dois primeiros escalões para remunerações baixas ou agregados com três ou mais filhos, e um mínimo garantido de ${fmtEUR(DOENCA.minimoDiario)} por dia.`,
    },
    {
      q: 'Como se calcula a remuneração de referência?',
      a: 'É a média diária das remunerações registadas nos seis meses civis que antecedem os dois meses anteriores ao início da baixa. Não é o salário do mês passado: quem teve um aumento recente vai receber sobre a média antiga, e quem esteve sem descontar tem os meses em falta a puxar a média para baixo. É por isso que o valor do subsídio surpreende muita gente.',
    },
    {
      q: 'Que licença parental compensa mais?',
      a: 'Depende de precisar de tempo ou de dinheiro. Os 120 dias a 100 % e os 150 dias a 80 % dão exatamente o mesmo total, por isso a escolha entre esses dois é só de calendário. A diferença real está na partilha: se os dois progenitores partilharem, chega-se a 150 dias a 100 % — mais dias e mais dinheiro do que qualquer das opções individuais. É a modalidade que mais compensa quando ambos podem faltar.',
    },
    {
      q: 'O subsídio parental desconta impostos?',
      a: 'Não. As prestações sociais de substituição de rendimento pagas pela Segurança Social não estão sujeitas a retenção de IRS nem a contribuições. O valor apurado é o valor que recebe. Isso faz com que o líquido de uma licença a 100 % possa ficar muito próximo do líquido do salário, apesar de a base de cálculo ser a remuneração ilíquida.',
    },
    {
      q: 'Quanto se recebe em layoff?',
      a: `A compensação retributiva é de dois terços da retribuição normal ilíquida, com um piso na retribuição mínima mensal garantida (${fmtEUR(LAYOFF.piso)}) e um teto de três vezes esse valor (${fmtEUR(LAYOFF.teto)}). Nos primeiros 60 dias a Segurança Social suporta ${(LAYOFF.parteSegSocialAte60Dias * 100).toLocaleString('de-DE')} % e a entidade empregadora ${(LAYOFF.parteEntidadeAte60Dias * 100).toLocaleString('de-DE')} %; depois disso a repartição passa a ${(LAYOFF.parteSegSocialDepois * 100).toLocaleString('de-DE')} % e ${(LAYOFF.parteEntidadeDepois * 100).toLocaleString('de-DE')} %.`,
    },
    {
      q: 'Em layoff continuo a acumular férias e subsídios?',
      a: 'Sim. A suspensão do contrato por layoff não suspende os direitos a férias, aos subsídios de férias e de Natal nem à contagem da antiguidade, e esses valores são calculados sobre a retribuição normal, não sobre a compensação reduzida. É uma diferença importante face a outras situações de suspensão do contrato.',
    },
    {
      q: 'Que pré-aviso tenho de dar para me despedir?',
      a: `Num contrato sem termo, ${PRE_AVISO.semTermoAte2anos} dias se tiver até dois anos de antiguidade e ${PRE_AVISO.semTermoMais2anos} dias se tiver mais. Num contrato a termo, ${PRE_AVISO.termo6mesesOuMais} dias se a duração for de seis meses ou mais e ${PRE_AVISO.termoMenos6meses} dias se for inferior. São sempre dias de calendário, contados da comunicação escrita.`,
    },
    {
      q: 'O que acontece se não cumprir o pré-aviso?',
      a: 'Fica obrigado a indemnizar o empregador num valor igual à retribuição base e diuturnidades correspondentes aos dias de pré-aviso em falta. Na prática, a empresa desconta esse valor no acerto de contas final. Não é uma sanção adicional nem impede a saída: o contrato cessa na mesma, só sai mais caro.',
    },
    {
      q: 'Ao sair, o que me têm de pagar?',
      a: 'As férias vencidas e não gozadas, o respetivo subsídio de férias, a proporção de férias e de subsídio de férias do ano da saída e a proporção do subsídio de Natal. A tudo isso somam-se as horas extraordinárias em dívida. Quem se despede por iniciativa própria não tem direito a compensação por cessação nem, em regra, a subsídio de desemprego.',
    },
  ],

  sources: [
    {
      name: 'Código do Trabalho — arts. 238.º (férias), 305.º (layoff) e 400.º (pré-aviso)',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475',
      publisher: 'Diário da República',
    },
    {
      name: 'Segurança Social — subsídio de doença',
      url: 'https://www.seg-social.pt/subsidio-de-doenca',
      publisher: 'Segurança Social',
    },
    {
      name: 'Segurança Social — subsídio parental inicial',
      url: 'https://www.seg-social.pt/parentalidade',
      publisher: 'Segurança Social',
    },
    {
      name: 'Portaria n.º 480-A/2025/1 — valor do IAS',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025',
      publisher: 'Diário da República',
      date: '30-12-2025',
    },
    {
      name: 'Decreto-Lei n.º 139/2025 — retribuição mínima mensal garantida',
      url: 'https://diariodarepublica.pt/dr/detalhe/decreto-lei/139-2025',
      publisher: 'Diário da República',
      date: '29-12-2025',
    },
    {
      name: 'Lei n.º 62/90 — feriados nacionais obrigatórios (na redação em vigor)',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2009-34546475',
      publisher: 'Diário da República',
    },
  ],

  replaces: [
    '/pt-pt/calculadora-dias-de-ferias-portugal',
    '/pt-pt/calculadora-dias-uteis-feriados-portugal-2026',
    '/pt-pt/calculadora-subsidio-de-doenca-baixa-medica-portugal',
    '/pt-pt/calculadora-subsidio-parental-licenca-parental-portugal',
    '/pt-pt/simulador-salario-layoff-portugal',
    '/pt-pt/simulador-pre-aviso-demissao-portugal',
  ],

  lastReviewed: '2026-07-28',
};
