import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Em que anexo eu caio e quanto pago de DAS?"
 *
 * Absorve as 6 calculadoras soltas do Simples Nacional (Anexos I a V + Fator R).
 * As tabelas saem dos Anexos I a V da LC 123/2006. Foram conferidas uma a uma
 * pela regra de continuidade da própria lei (a alíquota efetiva no topo de uma
 * faixa tem de ser igual à do piso da faixa seguinte, exceto na 6ª, onde a lei
 * abre um degrau de propósito). Esse teste pegou um erro na fórmula antiga do
 * Anexo I — ver comentário na tabela.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. O enquadramento no Simples Nacional depende do CNAE, do contrato social e de obrigações acessórias que esta conta não avalia; confira o PGDAS-D e consulte o seu contador antes de tomar decisões.';

export const TETO_SIMPLES = 4_800_000;
export const TETO_SUBLIMITE_ICMS_ISS = 3_600_000;
export const FATOR_R_LIMITE = 0.28;

export interface FaixaSimples {
  ate: number;
  aliquota: number;
  deduzir: number;
}

/**
 * Anexo I — Comércio.
 * 🔴 A fórmula antiga usava parcela a deduzir de R$ 5.760 na 2ª faixa. O valor
 * legal é R$ 5.940: no topo da 1ª faixa a efetiva é 4% (R$ 7.200 sobre
 * R$ 180.000) e a 2ª faixa tem de começar no mesmo ponto —
 * 180.000 × 7,30% − PD = 7.200 → PD = 5.940.
 */
export const ANEXO_I: FaixaSimples[] = [
  { ate: 180_000, aliquota: 4.0, deduzir: 0 },
  { ate: 360_000, aliquota: 7.3, deduzir: 5_940 },
  { ate: 720_000, aliquota: 9.5, deduzir: 13_860 },
  { ate: 1_800_000, aliquota: 10.7, deduzir: 22_500 },
  { ate: 3_600_000, aliquota: 14.3, deduzir: 87_300 },
  { ate: 4_800_000, aliquota: 19.0, deduzir: 378_000 },
];

/** Anexo II — Indústria. */
export const ANEXO_II: FaixaSimples[] = [
  { ate: 180_000, aliquota: 4.5, deduzir: 0 },
  { ate: 360_000, aliquota: 7.8, deduzir: 5_940 },
  { ate: 720_000, aliquota: 10.0, deduzir: 13_860 },
  { ate: 1_800_000, aliquota: 11.2, deduzir: 22_500 },
  { ate: 3_600_000, aliquota: 14.7, deduzir: 85_500 },
  { ate: 4_800_000, aliquota: 30.0, deduzir: 720_000 },
];

/** Anexo III — Serviços do §5º-B e serviços do Fator R com folha ≥ 28%. */
export const ANEXO_III: FaixaSimples[] = [
  { ate: 180_000, aliquota: 6.0, deduzir: 0 },
  { ate: 360_000, aliquota: 11.2, deduzir: 9_360 },
  { ate: 720_000, aliquota: 13.5, deduzir: 17_640 },
  { ate: 1_800_000, aliquota: 16.0, deduzir: 35_640 },
  { ate: 3_600_000, aliquota: 21.0, deduzir: 125_640 },
  { ate: 4_800_000, aliquota: 33.0, deduzir: 648_000 },
];

/** Anexo IV — construção civil, advocacia, limpeza, vigilância. Sem CPP no DAS. */
export const ANEXO_IV: FaixaSimples[] = [
  { ate: 180_000, aliquota: 4.5, deduzir: 0 },
  { ate: 360_000, aliquota: 9.0, deduzir: 8_100 },
  { ate: 720_000, aliquota: 10.2, deduzir: 12_420 },
  { ate: 1_800_000, aliquota: 14.0, deduzir: 39_780 },
  { ate: 3_600_000, aliquota: 22.0, deduzir: 183_780 },
  { ate: 4_800_000, aliquota: 33.0, deduzir: 828_000 },
];

/** Anexo V — serviços do Fator R com folha abaixo de 28%. */
export const ANEXO_V: FaixaSimples[] = [
  { ate: 180_000, aliquota: 15.5, deduzir: 0 },
  { ate: 360_000, aliquota: 18.0, deduzir: 4_500 },
  { ate: 720_000, aliquota: 19.5, deduzir: 9_900 },
  { ate: 1_800_000, aliquota: 20.5, deduzir: 17_100 },
  { ate: 3_600_000, aliquota: 23.0, deduzir: 62_100 },
  { ate: 4_800_000, aliquota: 30.5, deduzir: 540_000 },
];

export const ANEXOS = {
  i: ANEXO_I,
  ii: ANEXO_II,
  iii: ANEXO_III,
  iv: ANEXO_IV,
  v: ANEXO_V,
};

/** Alíquota nominal máxima de cada anexo — serve de escala do gráfico. */
export const ESCALA_MAX = 33;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const hub: HubData = {
  slug: 'pt/dinheiro/simples-nacional',
  title: 'Simples Nacional: em que anexo eu caio e quanto pago de DAS?',
  description:
    'Descubra o anexo do seu CNPJ (I a V), o Fator R da sua folha, a faixa do RBT12, a alíquota efetiva real e o valor do DAS do mês. Tabelas dos Anexos I a V da LC 123/2006 conferidas faixa por faixa.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · Simples Nacional · LC 123/2006',
  h1: 'Em que anexo você cai e quanto sai o DAS deste mês.',
  lede:
    'A alíquota que aparece na tabela quase nunca é a que você paga. O Simples cobra a alíquota efetiva, que desconta uma parcela fixa da faixa — e, para quem presta serviço, o anexo nem é fixo: depende do Fator R, a relação entre a folha dos últimos 12 meses e o faturamento. Esta conta resolve as duas coisas de uma vez.',
  stamps: [
    'Anexos I a V da LC 123/2006 · faixas conferidas pela regra de continuidade',
    `Teto do Simples: ${brl(TETO_SIMPLES)} de RBT12 · sublimite de ICMS/ISS: ${brl(TETO_SUBLIMITE_ICMS_ISS)}`,
    '6 calculadoras dentro',
  ],

  resultLabel: 'DAS do mês',

  cases: {
    title: 'Qual é a atividade da sua empresa?',
    intro:
      'O anexo não se escolhe: ele decorre da atividade registrada no CNAE. A única porta que se abre pelo seu comportamento é o Fator R — e ela vale bilhões em DAS todo ano no Brasil.',
    items: [
      {
        id: 'comercio',
        label: 'Comércio (Anexo I)',
        hint: 'Lojas, mercados, revenda, e-commerce de produto físico',
        answer:
          'É o anexo mais barato do Simples: começa em 4% e o DAS já inclui o ICMS.',
        yes: [
          'Alíquota nominal de 4% na primeira faixa, até R$ 180.000 de RBT12',
          'O DAS reúne IRPJ, CSLL, PIS, COFINS, CPP e ICMS num guia só',
          'A CPP (INSS patronal) está incluída — não há GPS à parte sobre a folha',
          'Revenda de mercadoria, mesmo importada, permanece no Anexo I',
        ],
        warn: [
          AVISO_LEGAL,
          `Acima de ${brl(TETO_SUBLIMITE_ICMS_ISS)} de RBT12 o ICMS sai do DAS e passa a ser recolhido direto ao estado, ainda que a empresa continue no Simples`,
          'Substituição tributária de ICMS (ST) não entra no DAS: o imposto já foi retido na cadeia e a receita tem de ser segregada no PGDAS-D',
        ],
        plazo:
          'o DAS vence no dia 20 do mês seguinte ao da apuração; caindo em fim de semana ou feriado, antecipa-se para o dia útil anterior.',
      },
      {
        id: 'industria',
        label: 'Indústria (Anexo II)',
        hint: 'Fabricação, transformação, montagem',
        answer:
          'Começa em 4,5% porque, além do ICMS, o DAS carrega também o IPI.',
        yes: [
          'Alíquota nominal de 4,5% na primeira faixa',
          'O DAS inclui IPI, além de IRPJ, CSLL, PIS, COFINS, CPP e ICMS',
          'Vale para quem transforma insumo em produto novo, ainda que sob encomenda',
        ],
        warn: [
          AVISO_LEGAL,
          'Empresa que fabrica e também revende precisa segregar as receitas no PGDAS-D: cada parcela vai para o seu anexo',
          'A sexta faixa do Anexo II salta para 30% de alíquota nominal — perto do teto, o Simples deixa de ser vantajoso para muita indústria',
        ],
        plazo:
          'a segregação de receitas é feita mês a mês no PGDAS-D; erro de segregação é retificável, mas gera diferença com multa e juros.',
      },
      {
        id: 'servicos3',
        label: 'Serviço do Anexo III (fixo)',
        hint: 'Academia, salão, escola, agência de viagem',
        answer:
          'Atividade listada no art. 18 §5º-B: fica no Anexo III sempre, sem depender de folha.',
        yes: [
          'Alíquota nominal de 6% na primeira faixa e ISS dentro do DAS',
          'Independe do Fator R: a lista do §5º-B garante o Anexo III',
          'A CPP está incluída no DAS',
        ],
        warn: [
          AVISO_LEGAL,
          'O ISS tem retenção na fonte em várias prefeituras: quando o tomador retém, a receita continua sendo declarada, mas o ISS retido é deduzido no PGDAS-D — não deduzir é pagar duas vezes',
          `Acima de ${brl(TETO_SUBLIMITE_ICMS_ISS)} de RBT12 o ISS sai do DAS e vai direto ao município`,
        ],
        plazo:
          'a alíquota do mês usa o RBT12 dos 12 meses anteriores, não do ano-calendário: ela muda todo mês.',
      },
      {
        id: 'fator-r',
        label: 'Serviço sujeito ao Fator R',
        hint: 'Dev, designer, consultor, médico, engenheiro',
        answer:
          'Se a folha dos últimos 12 meses for pelo menos 28% da receita, você cai no Anexo III; abaixo disso, no Anexo V — quase o triplo de alíquota na primeira faixa.',
        yes: [
          'Fator R = folha de 12 meses ÷ receita bruta de 12 meses',
          'Fator R ≥ 28% → Anexo III (6% na primeira faixa)',
          'Fator R < 28% → Anexo V (15,5% na primeira faixa)',
          'Entram na folha os salários, o pró-labore, o 13º, as férias e o FGTS',
        ],
        warn: [
          AVISO_LEGAL,
          'O Fator R é apurado mês a mês, sempre com os 12 meses anteriores: a empresa pode oscilar entre III e V ao longo do ano',
          'Aumentar o pró-labore para atingir os 28% custa INSS (11% do sócio, limitado ao teto) e IRRF — só compensa quando a economia de DAS supera esse custo, e esta conta mostra os dois lados',
          'Distribuição de lucros não é folha e não conta no Fator R',
        ],
        plazo:
          'o Fator R do mês olha os 12 meses anteriores; uma folha aumentada hoje só mexe no enquadramento nos meses seguintes.',
      },
      {
        id: 'anexo4',
        label: 'Construção, advocacia, limpeza ou vigilância (Anexo IV)',
        hint: 'Atenção: a CPP fica de fora do DAS',
        answer:
          'A alíquota parece baixa (4,5%) porque o INSS patronal não está no DAS: ele é pago à parte, sobre a folha.',
        yes: [
          'Alíquota nominal de 4,5% na primeira faixa, com ISS incluído',
          'O DAS reúne IRPJ, CSLL, PIS, COFINS e ISS — mas não a CPP',
          'A contribuição previdenciária patronal (20% sobre a folha, mais RAT e terceiros) é recolhida separadamente',
          'Atividades típicas: obras e serviços de engenharia, advocacia, limpeza, conservação e vigilância',
        ],
        warn: [
          AVISO_LEGAL,
          'Comparar a alíquota do Anexo IV com a dos outros anexos sem somar a folha é o erro de conta mais caro do Simples: com equipe grande, o custo total supera o do Anexo III',
          'A retenção de 11% de INSS sobre a nota de cessão de mão de obra continua se aplicando às atividades do Anexo IV',
        ],
        plazo:
          'a CPP é apurada e recolhida junto com a folha, pelo eSocial e pela DCTFWeb, com vencimento próprio no dia 20.',
      },
    ],
  },

  inputsTitle: 'Os números da sua empresa',
  inputsIntro:
    'O RBT12 é a receita bruta acumulada dos 12 meses anteriores ao mês que você está apurando — não é o faturamento do ano-calendário nem a projeção do ano.',
  fields: [
    {
      id: 'anexo',
      label: 'Atividade da empresa',
      type: 'select',
      value: 'fator-r',
      options: [
        { value: 'i', label: 'Anexo I — comércio' },
        { value: 'ii', label: 'Anexo II — indústria' },
        { value: 'iii', label: 'Anexo III — serviço listado no §5º-B (fixo)' },
        { value: 'iv', label: 'Anexo IV — construção, advocacia, limpeza, vigilância' },
        { value: 'fator-r', label: 'Serviço sujeito ao Fator R (Anexo III ou V)' },
      ],
      help: 'Na dúvida, olhe o CNAE principal no cartão CNPJ e confirme com o contador.',
    },
    {
      id: 'rbt12',
      label: 'RBT12 — receita bruta dos últimos 12 meses (R$)',
      prefix: 'R$',
      value: '300.000',
      thousands: true,
      help: `Define a faixa e a alíquota. Acima de ${brl(TETO_SIMPLES)} a empresa é excluída do Simples.`,
    },
    {
      id: 'faturamentoMes',
      label: 'Faturamento do mês que você vai apurar (R$)',
      prefix: 'R$',
      value: '30.000',
      thousands: true,
      help: 'A alíquota efetiva vem do RBT12, mas o DAS é cobrado sobre a receita deste mês.',
    },
    {
      id: 'folha12m',
      label: 'Folha dos últimos 12 meses, com pró-labore (R$)',
      prefix: 'R$',
      value: '90.000',
      thousands: true,
      help: 'Salários, pró-labore, 13º, férias e FGTS. Só importa quando a atividade está sujeita ao Fator R.',
    },
    {
      id: 'proLaboreExtra',
      label: 'Aumento mensal de pró-labore que você cogita (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Simula o custo de subir a folha para alcançar os 28% do Fator R: a conta soma INSS de 11% sobre o valor.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'scale',
    title: 'Sua alíquota efetiva dentro da escala do Simples',
    caption:
      'A escala vai de 0% a 33%, o topo nominal dos anexos de serviço. O marcador mostra a alíquota efetiva que você paga de fato — sempre menor que a nominal da faixa, por causa da parcela a deduzir.',
    bands: [
      { label: 'Até 6% — muito baixa', from: 0, to: 6, tone: 'good' },
      { label: '6% a 12%', from: 6, to: 12, tone: 'neutral' },
      { label: '12% a 20%', from: 12, to: 20, tone: 'warn' },
      { label: 'Acima de 20%', from: 20, to: 33, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Como se chega ao valor do DAS',
  breakdownIntro:
    'Faixa, alíquota nominal, parcela a deduzir, alíquota efetiva e, só no fim, o valor do mês. É exatamente a ordem que o PGDAS-D segue.',

  faq: [
    {
      q: 'O que é alíquota efetiva e por que ela é menor que a da tabela?',
      a: 'A tabela dos anexos traz uma alíquota nominal e uma parcela a deduzir. A conta que a lei manda fazer é (RBT12 × alíquota nominal − parcela a deduzir) ÷ RBT12. O resultado é a alíquota efetiva, que é a que incide sobre o faturamento do mês. Quem está no começo de uma faixa paga quase a alíquota efetiva do fim da faixa anterior; quem está no fim paga quase a nominal. Por isso duas empresas do mesmo anexo podem pagar percentuais bem diferentes, e por isso não existe "a alíquota do Simples" — existe a sua.',
    },
    {
      q: 'O que é o RBT12 e por que ele não é o faturamento do ano?',
      a: 'RBT12 é a receita bruta total dos 12 meses anteriores ao mês da apuração. É uma janela móvel: ao apurar março, você soma março do ano anterior a fevereiro deste ano. Não é o ano-calendário nem a projeção anual. Por isso a alíquota muda todo mês, mesmo sem mudar de faixa. Empresa nova, sem 12 meses de história, usa a receita do primeiro mês proporcionalizada por 12 e vai ajustando conforme acumula meses.',
    },
    {
      q: 'Como funciona o Fator R na prática?',
      a: 'Fator R é a folha de salários dos últimos 12 meses dividida pela receita bruta dos últimos 12 meses. Se der 28% ou mais, as atividades listadas no art. 18 §5º-M da LC 123/2006 são tributadas pelo Anexo III; se der menos, pelo Anexo V. A diferença na primeira faixa é de 6% contra 15,5% — mais que o dobro. Entram na folha os salários, o pró-labore do sócio, o 13º, as férias com o terço e o FGTS. Não entram a distribuição de lucros nem o pagamento a autônomos por RPA sem vínculo.',
    },
    {
      q: 'Vale a pena aumentar o pró-labore só para chegar aos 28%?',
      a: 'Depende do tamanho da diferença. Aumentar o pró-labore custa 11% de INSS do sócio (até o teto do salário de contribuição) e pode gerar IRRF. Em compensação, derruba a alíquota do DAS de todo o faturamento. Como o DAS incide sobre a receita inteira e o INSS só sobre o valor aumentado, a conta costuma fechar a favor do aumento quando falta pouco para os 28% e o faturamento é alto. Esta calculadora mostra os dois valores lado a lado para você comparar sem chute. E há um bônus fora da planilha: pró-labore maior significa salário de benefício maior na aposentadoria.',
    },
    {
      q: 'Por que o Anexo IV tem alíquota menor e mesmo assim pode sair mais caro?',
      a: 'Porque o Anexo IV não inclui a CPP, a contribuição previdenciária patronal. Nos Anexos I, II, III e V os 20% de INSS sobre a folha já estão dentro do DAS; no IV, não — eles são recolhidos à parte, junto com o RAT e as contribuições a terceiros. Comparar 4,5% do Anexo IV com 6% do Anexo III sem somar a folha leva a uma decisão errada. Numa construtora ou num escritório de advocacia com muitos empregados, o custo total do Anexo IV supera com folga o de anexos de alíquota nominal maior.',
    },
    {
      q: 'O que muda quando o faturamento passa de R$ 3,6 milhões?',
      a: 'A empresa continua no Simples até R$ 4,8 milhões de RBT12, mas o ICMS e o ISS saem do DAS: passam a ser apurados e recolhidos pelas regras normais do estado e do município. Esse é o chamado sublimite. Na prática, a empresa ganha obrigações acessórias novas — apuração de ICMS, escrituração fiscal, guias estaduais — e o custo administrativo dá um salto. Muita empresa que atravessa esse ponto redescobre que o lucro presumido pode ser mais barato.',
    },
    {
      q: 'Quando o DAS vence e o que acontece se atrasar?',
      a: 'O DAS vence no dia 20 do mês seguinte ao da apuração. Se o dia 20 cair em sábado, domingo ou feriado, o vencimento antecipa para o dia útil anterior — atenção, antecipa, não prorroga. O atraso gera multa de 0,33% por dia, limitada a 20%, mais juros pela Selic acumulada. Atraso reiterado é motivo de exclusão do regime, com efeito a partir do ano seguinte, e a exclusão só é revertida depois da regularização integral.',
    },
    {
      q: 'Quais tributos estão dentro do DAS?',
      a: 'O DAS reúne num único documento até oito tributos: IRPJ, CSLL, PIS/Pasep, COFINS, CPP (INSS patronal), IPI, ICMS e ISS. Quais deles aparecem depende do anexo: o Anexo I traz ICMS e não traz IPI nem ISS; o II traz IPI e ICMS; os III, IV e V trazem ISS; e o IV é o único que não traz a CPP. O percentual de cada tributo dentro do DAS varia por anexo e por faixa e está nas tabelas de repartição dos próprios Anexos I a V da LC 123/2006 — o extrato do PGDAS-D mostra a partilha exata do seu mês.',
    },
    {
      q: 'Substituição tributária e receitas de exportação entram na base?',
      a: 'Entram na receita bruta para efeito de RBT12 e de enquadramento, mas precisam ser segregadas no PGDAS-D. Nas receitas com ICMS já retido por substituição tributária, o sistema desconta a parcela de ICMS da alíquota efetiva daquela receita, para não cobrar duas vezes. Nas exportações, saem PIS, COFINS, ICMS e ISS. Quem informa tudo como "receita normal" paga a mais e dificilmente percebe, porque o guia sai com valor aparentemente correto.',
    },
    {
      q: 'MEI é a mesma coisa que Simples Nacional?',
      a: 'O MEI é uma modalidade dentro do Simples, com regras próprias: limite de faturamento bem menor, um empregado no máximo e valor fixo mensal em vez de percentual sobre a receita. Ao ultrapassar o limite do MEI, a empresa passa a ser microempresa no Simples comum e aí sim entra nas tabelas dos anexos, com DAS proporcional ao faturamento. A transição não é automática do ponto de vista contábil: é preciso desenquadrar e comunicar.',
    },
    {
      q: 'Empresa sem faturamento no mês precisa pagar DAS?',
      a: 'Sem receita no mês, não há DAS a pagar — mas a declaração no PGDAS-D continua obrigatória, com valor zero. Deixar de declarar gera multa mínima mesmo sem imposto devido. E atenção: se houver empregado ou pró-labore, os encargos de folha (FGTS, INSS retido) continuam sendo devidos independentemente de faturamento.',
    },
    {
      q: 'Posso mudar de anexo mudando o CNAE?',
      a: 'O anexo decorre da atividade efetivamente exercida, e não do código que está registrado. Alterar o CNAE sem alterar a operação real é simulação e, se identificada em fiscalização, gera cobrança retroativa da diferença com multa qualificada. O que é legítimo é revisar o CNAE quando ele está desatualizado em relação ao que a empresa de fato faz — situação bastante comum em empresa que mudou de foco ao longo dos anos.',
    },
  ],

  sources: [
    {
      name: 'Lei Complementar 123/2006 — Simples Nacional, Anexos I a V e art. 18',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Resolução CGSN 140/2018 — regulamento do Simples Nacional',
      url: 'https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=92278',
      publisher: 'Comitê Gestor do Simples Nacional',
    },
    {
      name: 'Portal do Simples Nacional — PGDAS-D e cálculo do DAS',
      url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/',
      publisher: 'Receita Federal',
    },
    {
      name: 'Perguntas e respostas oficiais sobre o Fator R',
      url: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/PerguntasSN.pdf',
      publisher: 'Receita Federal',
    },
  ],

  replaces: [
    '/pt/simples-nacional-anexo-i-comercio',
    '/pt/simples-nacional-anexo-ii-industria',
    '/pt/simples-nacional-anexo-iii-servicos',
    '/pt/simples-nacional-anexo-iv-servicos-construcao',
    '/pt/simples-nacional-anexo-v-profissional-liberal',
    '/pt/fator-r-simples-nacional-anexo-iii-vs-v',
  ],

  lastReviewed: '2026-07-28',
};
