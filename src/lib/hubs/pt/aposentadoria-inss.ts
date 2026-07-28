import type { HubData } from '../types';
import { INSS_TETO, SALARIO_MINIMO } from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Quando posso me aposentar pelo INSS e quanto vou receber?"
 *
 * Absorve 8 calculadoras soltas de aposentadoria/incapacidade. Todas as regras
 * vêm da EC 103/2019 (arts. 15 a 21 e 26) e da Lei 8.213/1991. Teto e piso saem
 * de src/lib/data/brasil-2026.ts. Nada de memória.
 *
 * Correções em relação às fórmulas antigas (ver relatório):
 *  - pontos de 2026 = 103 (H) / 93 (M): a fórmula velha usava 97/87, que é a
 *    tabela de 2020 (EC 103 art. 15 §1º: +1 ponto por ano a partir de 2020).
 *  - coeficiente da mulher usa o limiar de 15 anos, não 20 (EC 103 art. 26 §5º).
 *  - piso de 1 salário mínimo (CF art. 201 §2º) e teto do INSS aplicados sempre.
 *  - professor: regra permanente é 60 (H) / 57 (M), não 57/55.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As regras da previdência e os valores de referência mudam; confira o seu extrato CNIS no Meu INSS e consulte o INSS ou um advogado previdenciário antes de dar entrada no pedido.';

export const TETO = INSS_TETO;
export const PISO = SALARIO_MINIMO;

/** EC 103/2019 — art. 19 (regra permanente por idade). */
export const REGRA_IDADE = { homem: { idade: 65, contrib: 20 }, mulher: { idade: 62, contrib: 15 } };

/** EC 103/2019 — art. 15: pontos de 2019 + 1 ponto por ano a partir de 2020, com teto. */
export const REGRA_PONTOS = {
  homem: { base2019: 96, teto: 105, contribMin: 35 },
  mulher: { base2019: 86, teto: 100, contribMin: 30 },
};

/** EC 103/2019 — art. 16: idade mínima de 2019 + 6 meses por ano a partir de 2020. */
export const REGRA_IDADE_PROGRESSIVA = {
  homem: { base2019: 61, teto: 65, contribMin: 35 },
  mulher: { base2019: 56, teto: 62, contribMin: 30 },
};

/** EC 103/2019 — art. 17 (pedágio de 50%) e art. 20 (pedágio de 100%). */
export const REGRA_PEDAGIO = {
  p50: { homem: 35, mulher: 30, pedagio: 0.5 },
  p100: { homem: { idade: 60, contrib: 35 }, mulher: { idade: 57, contrib: 30 }, pedagio: 1.0 },
};

/** EC 103/2019 — art. 19 §1º I: aposentadoria especial por exposição a agentes nocivos. */
export const REGRA_ESPECIAL: Record<string, { idade: number; tempo: number; desc: string }> = {
  '15': { idade: 55, tempo: 15, desc: 'Exposição mais grave — mineração subterrânea em frente de trabalho' },
  '20': { idade: 58, tempo: 20, desc: 'Mineração subterrânea fora da frente e amianto' },
  '25': { idade: 60, tempo: 25, desc: 'Demais agentes nocivos — ruído acima de 85 dB, químicos, biológicos, calor' },
};

/** EC 103/2019 — art. 19 §1º III (regra permanente do professor) e art. 26 §5º (limiar de 25 anos). */
export const REGRA_PROFESSOR = { homem: { idade: 60, contrib: 25 }, mulher: { idade: 57, contrib: 25 } };

/** EC 103/2019 — art. 26 §2º e §5º: 60% da média + 2 p.p. por ano acima do limiar. */
export const COEFICIENTE = { base: 60, porAno: 2, maximo: 100 };

/** Lei 8.213/1991, art. 61: auxílio por incapacidade temporária = 91% do salário de benefício. */
export const AUXILIO_DOENCA_PCT = 0.91;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/aposentadoria-inss',
  title: 'Aposentadoria INSS: quando posso me aposentar e quanto vou receber?',
  description:
    'Simule todas as regras da EC 103/2019 num só lugar: idade, pontos, idade progressiva, pedágio de 50% e de 100%, aposentadoria especial e professor. Veja quanto falta para cada regra e o valor estimado do benefício, com piso de um salário mínimo e teto do INSS.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · INSS · EC 103/2019',
  h1: 'Quando eu posso me aposentar — e quanto vai cair na conta?',
  lede:
    'A reforma de 2019 criou seis caminhos diferentes para a mesma aposentadoria, e cada um pede uma combinação distinta de idade e tempo de contribuição. Informe seus dados uma vez: a conta mostra quanto falta na regra que você escolher, o coeficiente que se aplica à sua média e o valor estimado do benefício, já respeitando o piso de um salário mínimo e o teto do INSS.',
  stamps: [
    `Teto do INSS: ${brl(TETO)} · piso: ${brl(PISO)}`,
    'EC 103/2019 arts. 15 a 21 e 26 · Lei 8.213/1991',
    '8 calculadoras dentro',
  ],

  resultLabel: 'Benefício mensal estimado',

  cases: {
    title: 'Por qual regra você pretende se aposentar?',
    intro:
      'Quem já contribuía antes de 13/11/2019 pode escolher entre as regras de transição e a regra permanente — vale a que você cumprir primeiro, ou a que pagar mais. Quem entrou depois só tem a regra permanente por idade (ou a especial, se houver exposição comprovada).',
    items: [
      {
        id: 'idade',
        label: 'Regra permanente por idade',
        hint: 'Homem 65 + 20 anos · Mulher 62 + 15 anos',
        answer:
          'É a regra que vale para todo mundo, inclusive para quem começou a contribuir depois da reforma: 65 anos e 20 anos de contribuição para o homem, 62 anos e 15 anos para a mulher.',
        yes: [
          'Idade mínima de 65 anos (homem) ou 62 anos (mulher) — art. 19 da EC 103/2019',
          'Tempo mínimo de contribuição de 20 anos (homem) ou 15 anos (mulher)',
          'Coeficiente de 60% da média + 2 pontos percentuais por ano acima de 20 anos (homem) ou 15 anos (mulher)',
          'Média de todos os salários de contribuição desde julho de 1994, corrigidos',
        ],
        warn: [
          AVISO_LEGAL,
          'Quem já contribuía em 13/11/2019 quase sempre se aposenta antes por uma regra de transição — compare as seis abas antes de dar entrada',
          'Nenhum benefício que substitui a renda pode ser menor que um salário mínimo (art. 201 §2º da Constituição), nem maior que o teto do INSS',
        ],
        plazo:
          'o pedido é feito pelo Meu INSS ou pelo 135; a data de entrada do requerimento (DER) fixa o valor, então confira o CNIS antes de pedir.',
      },
      {
        id: 'pontos',
        label: 'Transição por pontos',
        hint: 'Idade + tempo de contribuição, pontuação que sobe todo ano',
        answer:
          'Soma idade e tempo de contribuição: a pontuação exigida era 96 (homem) e 86 (mulher) em 2019 e sobe um ponto por ano até 105 e 100.',
        yes: [
          'Estar filiado ao RGPS antes de 13/11/2019 — art. 15 da EC 103/2019',
          'Somar a pontuação do ano (idade + tempo de contribuição, sem idade mínima própria)',
          'Tempo mínimo de contribuição de 35 anos (homem) ou 30 anos (mulher)',
          'Coeficiente de 60% + 2 p.p. por ano acima de 20 anos (homem) ou 15 anos (mulher)',
        ],
        warn: [
          AVISO_LEGAL,
          'A pontuação sobe um ponto por ano desde 2020 e trava em 105 (homem, em 2028) e 100 (mulher, em 2033): adiar um ano custa dois pontos, porque idade e contribuição andam juntas',
          'Professor tem pontuação reduzida em 5 pontos (81 e 91 em 2019, com o mesmo aumento anual)',
        ],
        plazo:
          'a pontuação usada é a do ano em que você completa os requisitos, e não a do ano em que pede o benefício — cumpriu, o direito fica adquirido.',
      },
      {
        id: 'idade_progressiva',
        label: 'Transição por idade progressiva',
        hint: 'Idade mínima que sobe 6 meses por ano até 65 e 62',
        answer:
          'Exige o tempo cheio de contribuição (35 anos homem, 30 mulher) mais uma idade mínima que partiu de 61 e 56 anos em 2019 e sobe seis meses a cada ano.',
        yes: [
          'Estar filiado ao RGPS antes de 13/11/2019 — art. 16 da EC 103/2019',
          'Idade mínima do ano: 61 (homem) e 56 (mulher) em 2019, mais 6 meses por ano até 65 e 62',
          'Tempo de contribuição de 35 anos (homem) ou 30 anos (mulher)',
          'Coeficiente de 60% + 2 p.p. por ano acima de 20 anos (homem) ou 15 anos (mulher)',
        ],
        warn: [
          AVISO_LEGAL,
          'A idade mínima trava em 65 anos para o homem em 2027 e em 62 anos para a mulher em 2031 — depois disso essa transição se confunde com a regra permanente',
          'Meio ano de idade a mais por ano de espera: quem está perto costuma cumprir esta regra depois da regra de pontos',
        ],
        plazo:
          'confira no CNIS se todos os vínculos antigos estão lançados: meses ausentes atrasam o cumprimento do tempo mínimo, que aqui é rígido.',
      },
      {
        id: 'pedagio50',
        label: 'Pedágio de 50%',
        hint: 'Faltavam menos de 2 anos em 13/11/2019',
        answer:
          'Só para quem estava a menos de dois anos do tempo mínimo quando a reforma passou: cumpre o tempo que faltava mais 50% dele, sem idade mínima.',
        yes: [
          'Em 13/11/2019 faltarem menos de 2 anos para 35 anos (homem) ou 30 anos (mulher) — art. 17 da EC 103/2019',
          'Cumprir o tempo que faltava mais um pedágio de 50% desse tempo',
          'Não há idade mínima nesta regra',
          'Valor = 100% da média × fator previdenciário',
        ],
        warn: [
          AVISO_LEGAL,
          'O fator previdenciário depende da sua idade, do tempo de contribuição e da tábua de expectativa de sobrevida do IBGE, publicada todo ano — esta conta usa o fator que você informar, porque ele não é uma constante',
          'Um fator abaixo de 1 reduz o benefício: é comum ficar entre 0,60 e 0,90 para quem se aposenta cedo',
        ],
        plazo:
          'é a regra de transição mais curta e já está no fim: praticamente só alcança quem cumpriu o pedágio até 2021-2022.',
      },
      {
        id: 'pedagio100',
        label: 'Pedágio de 100%',
        hint: 'Dobra o tempo que faltava, com idade mínima fixa',
        answer:
          'Você cumpre o tempo que faltava em 13/11/2019 em dobro, mas em troca recebe 100% da média, sem o coeficiente de 60%.',
        yes: [
          'Idade mínima de 60 anos (homem) ou 57 anos (mulher) — art. 20 da EC 103/2019',
          'Tempo de contribuição de 35 anos (homem) ou 30 anos (mulher)',
          'Pedágio: cumprir o dobro do tempo que faltava em 13/11/2019',
          'Valor = 100% da média, sem fator previdenciário e sem o coeficiente de 60%',
        ],
        warn: [
          AVISO_LEGAL,
          'É a regra que paga melhor entre as transições, porque não aplica o coeficiente de 60% nem o fator previdenciário — vale a pena comparar antes de escolher',
          'Se em 13/11/2019 faltavam 4 anos, o pedágio são 8 anos de contribuição, e a idade mínima também precisa estar cumprida',
        ],
        plazo:
          'quem está perto dos requisitos costuma ganhar mais esperando esta regra do que entrando pela transição por pontos — faça as duas contas.',
      },
      {
        id: 'especial',
        label: 'Aposentadoria especial (insalubridade)',
        hint: '15, 20 ou 25 anos de exposição comprovada',
        answer:
          'Para quem trabalhou exposto a agentes nocivos: 25 anos e 60 de idade no caso geral, 20 anos e 58, ou 15 anos e 55 nos casos mais graves.',
        yes: [
          'Tempo de exposição de 15, 20 ou 25 anos conforme o agente nocivo — art. 19 §1º I da EC 103/2019',
          'Idade mínima de 55, 58 ou 60 anos, na mesma ordem',
          'Comprovação por PPP (Perfil Profissiográfico Previdenciário) e LTCAT da empresa',
          'Coeficiente de 60% da média + 2 p.p. por ano de contribuição acima de 20 anos',
        ],
        warn: [
          AVISO_LEGAL,
          'A exigência de idade mínima é nova: quem completou o tempo de exposição antes de 13/11/2019 tem direito adquirido à regra antiga, sem idade mínima',
          'O PPP é a peça central do pedido. Empresa fechada, PPP genérico ou EPI declarado como eficaz costumam derrubar o enquadramento — junte também LTCAT, laudos e testemunhas',
          'Os 15 anos não são a categoria "leve": são a exposição mais grave prevista na lei, a mineração subterrânea em frente de trabalho',
        ],
        plazo:
          'se o INSS negar o enquadramento, cabe recurso administrativo em 30 dias contados da ciência da decisão.',
      },
      {
        id: 'professor',
        label: 'Professor (redutor de 5 anos)',
        hint: 'Tempo exclusivo em sala de aula na educação básica',
        answer:
          'O professor da educação básica ganha 5 anos de desconto: 60 anos de idade (homem) ou 57 (mulher), com 25 anos exclusivos de magistério.',
        yes: [
          'Idade mínima de 60 anos (homem) ou 57 anos (mulher) — art. 19 §1º III da EC 103/2019',
          '25 anos de contribuição exclusivamente em funções de magistério na educação infantil, no ensino fundamental ou no médio',
          'Coeficiente de 60% + 2 p.p. por ano acima de 25 anos de contribuição (art. 26 §5º da EC 103/2019)',
          'Direção, coordenação e assessoramento pedagógico contam, desde que exercidos em estabelecimento de ensino',
        ],
        warn: [
          AVISO_LEGAL,
          'O redutor não vale para professor universitário: a EC 103/2019 restringiu o benefício à educação básica',
          'Tempo de secretaria, de biblioteca ou de cargo administrativo fora da escola não entra nos 25 anos de magistério',
          'Nas transições o professor também tem redutor: 5 pontos a menos na regra de pontos e 5 anos a menos na idade progressiva',
        ],
        plazo:
          'peça à escola a declaração de tempo de magistério antes de dar entrada: é o documento que o INSS exige para aplicar o redutor.',
      },
      {
        id: 'auxilio_doenca',
        label: 'Auxílio por incapacidade temporária',
        hint: 'O antigo auxílio-doença, enquanto você não pode trabalhar',
        answer:
          'Não é aposentadoria: paga 91% do salário de benefício enquanto durar a incapacidade, a partir do 16º dia de afastamento.',
        yes: [
          '91% do salário de benefício — art. 61 da Lei 8.213/1991',
          'Os 15 primeiros dias de afastamento são pagos pela empresa; o INSS entra do 16º em diante',
          'Carência de 12 contribuições mensais, dispensada em acidente de qualquer natureza e nas doenças graves listadas em portaria',
          'Piso de um salário mínimo e teto do INSS, como todo benefício previdenciário',
        ],
        warn: [
          AVISO_LEGAL,
          'O valor não pode passar da média dos 12 últimos salários de contribuição (art. 29 §10 da Lei 8.213/1991), mesmo que a média histórica seja maior',
          'É preciso perícia médica; a alta programada (DCB) encerra o benefício na data marcada, e o pedido de prorrogação tem de ser feito nos 15 dias anteriores',
          'Se a incapacidade virar permanente, o caso migra para aposentadoria por incapacidade permanente, que tem cálculo próprio',
        ],
        plazo:
          'peça a perícia pelo Meu INSS assim que completar 15 dias de afastamento: o benefício retroage à data do requerimento, não à do afastamento, se você demorar mais de 30 dias.',
      },
    ],
  },

  inputsTitle: 'Seus dados no INSS',
  inputsIntro:
    'Idade, tempo de contribuição e a média dos salários de contribuição — todos aparecem no extrato do Meu INSS. Os campos extras só entram nas regras que precisam deles.',
  fields: [
    {
      id: 'sexo',
      label: 'Sexo no cadastro do INSS',
      type: 'select',
      value: 'homem',
      options: [
        { value: 'homem', label: 'Homem' },
        { value: 'mulher', label: 'Mulher' },
      ],
      help: 'A mulher tem idade e tempo mínimos menores em todas as regras, e o coeficiente dela parte de 15 anos de contribuição, não de 20.',
    },
    {
      id: 'idade',
      label: 'Sua idade hoje (anos)',
      type: 'number',
      value: 60,
      min: 16,
      max: 100,
      step: 1,
      help: 'Idade completa. Nas regras de transição por pontos e por idade progressiva, cada ano a mais também aproxima o benefício.',
    },
    {
      id: 'anosContribuicao',
      label: 'Tempo de contribuição (anos)',
      type: 'number',
      value: 35,
      min: 0,
      max: 60,
      step: 1,
      help: 'O total que aparece no CNIS. Confira se todos os vínculos antigos e os períodos como autônomo estão lançados — é o erro mais comum.',
    },
    {
      id: 'mediaSalarial',
      label: 'Média dos salários de contribuição (R$)',
      prefix: 'R$',
      value: '5.000',
      thousands: true,
      help: `Média de 100% dos salários desde julho de 1994, corrigidos. A conta limita essa média ao teto do INSS (${brl(TETO)}).`,
    },
    {
      id: 'anoSimulacao',
      label: 'Ano em que você pretende se aposentar',
      type: 'number',
      value: 2026,
      min: 2019,
      max: 2040,
      step: 1,
      help: 'Define a pontuação exigida na regra de pontos e a idade mínima da regra de idade progressiva, que sobem todo ano.',
    },
    {
      id: 'contribAte2019',
      label: 'Tempo de contribuição em 13/11/2019 (anos)',
      type: 'number',
      value: 28,
      min: 0,
      max: 60,
      step: 1,
      help: 'Só usado nas regras de pedágio. É o tempo que você já tinha na data em que a reforma entrou em vigor; o pedágio incide sobre o que faltava naquele dia.',
    },
    {
      id: 'fatorPrevidenciario',
      label: 'Fator previdenciário (só no pedágio de 50%)',
      type: 'number',
      value: 0.8,
      min: 0.3,
      max: 2,
      step: 0.01,
      help: 'Não é uma constante: depende da sua idade, do tempo de contribuição e da tábua de expectativa de sobrevida do IBGE publicada a cada ano. Consulte o valor no Meu INSS ou com um advogado previdenciário. Para quem se aposenta cedo, costuma ficar entre 0,60 e 0,90.',
    },
    {
      id: 'categoriaEspecial',
      label: 'Categoria da aposentadoria especial',
      type: 'select',
      value: '25',
      options: [
        { value: '15', label: '15 anos — mineração subterrânea em frente de trabalho' },
        { value: '20', label: '20 anos — mineração fora da frente e amianto' },
        { value: '25', label: '25 anos — demais agentes nocivos (ruído, químicos, biológicos)' },
      ],
      help: 'Quanto mais grave o agente nocivo, menor o tempo exigido. O enquadramento sai do PPP e do LTCAT da empresa, não da sua percepção do risco.',
    },
    {
      id: 'anosExposicao',
      label: 'Tempo de exposição comprovada (anos)',
      type: 'number',
      value: 25,
      min: 0,
      max: 50,
      step: 1,
      help: 'Só o tempo com PPP e LTCAT que comprovem a exposição habitual e permanente ao agente nocivo.',
    },
    {
      id: 'anosMagisterio',
      label: 'Tempo exclusivo de magistério (anos)',
      type: 'number',
      value: 25,
      min: 0,
      max: 50,
      step: 1,
      help: 'Educação infantil, ensino fundamental ou médio, em sala de aula, direção, coordenação ou assessoramento pedagógico dentro da escola.',
    },
    {
      id: 'media12',
      label: 'Média dos 12 últimos salários (R$) — auxílio-doença',
      prefix: 'R$',
      value: '5.000',
      thousands: true,
      help: 'O auxílio por incapacidade temporária não pode passar dessa média, mesmo que a média histórica seja maior (art. 29 §10 da Lei 8.213/1991).',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'scale',
    title: 'Quanto da sua média o benefício aproveita',
    caption:
      'A barra vai de 60% (o piso do coeficiente para quem cumpre só o tempo mínimo) até 100% da média. O marcador mostra o coeficiente que se aplica ao seu caso: cada ano de contribuição acima do limiar soma 2 pontos percentuais.',
    bands: [
      { label: 'Piso — só o tempo mínimo', from: 60, to: 70, tone: 'bad' },
      { label: 'Parcial', from: 70, to: 85, tone: 'warn' },
      { label: 'Quase integral', from: 85, to: 99, tone: 'good' },
      { label: 'Integral', from: 99, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'Sua aposentadoria, requisito por requisito',
  breakdownIntro:
    'Primeiro o que a regra exige, depois quanto falta em cada requisito e, por último, como o coeficiente transforma a sua média no valor do benefício.',

  faq: [
    {
      q: 'Quantos pontos preciso somar para me aposentar pela regra de transição?',
      a: 'A pontuação exigida era 96 pontos para o homem e 86 para a mulher em 2019 e sobe um ponto a cada ano desde 2020, por força do art. 15 §1º da EC 103/2019. Em 2026, portanto, são 103 pontos para o homem e 93 para a mulher; em 2027, 104 e 94, e assim por diante até travar em 105 (homem, a partir de 2028) e 100 (mulher, a partir de 2033). Além dos pontos, é preciso ter no mínimo 35 anos de contribuição se homem e 30 se mulher — a pontuação sozinha não basta. Professores da educação básica têm 5 pontos a menos em cada ano.',
    },
    {
      q: 'Como se calcula o valor do benefício depois da reforma?',
      a: 'Parte-se da média de 100% dos salários de contribuição desde julho de 1994, corrigidos monetariamente. Sobre essa média aplica-se um coeficiente que começa em 60% e sobe 2 pontos percentuais para cada ano de contribuição acima de 20 anos, no caso do homem, ou acima de 15 anos, no caso da mulher (art. 26 da EC 103/2019). Um homem com 35 anos de contribuição fica com 60% + 2% × 15 = 90% da média. O resultado nunca pode ser menor que um salário mínimo nem maior que o teto do INSS.',
    },
    {
      q: 'O benefício pode ser menor que um salário mínimo?',
      a: `Não, quando ele substitui a renda do trabalho: o art. 201 §2º da Constituição garante o piso de um salário mínimo, hoje ${brl(PISO)}. Isso vale para aposentadorias, auxílio por incapacidade e pensão por morte. Um coeficiente de 60% sobre uma média baixa dá um número abaixo do piso no papel, mas o INSS paga o mínimo. As exceções são benefícios que não substituem renda, como o salário-família e o auxílio-acidente.`,
    },
    {
      q: 'Qual é o teto do INSS e o que acontece se eu contribuo acima dele?',
      a: `O teto é ${brl(TETO)}. Contribuições sobre valores maiores não existem: a alíquota do segurado empregado só incide até esse limite, então quem ganha mais recolhe sobre o teto e o excedente simplesmente não entra na média nem no benefício. Quem quer renda maior na aposentadoria precisa de previdência complementar, PGBL, VGBL ou outro investimento — o RGPS não paga acima do teto em nenhuma hipótese.`,
    },
    {
      q: 'Qual é a diferença entre o pedágio de 50% e o de 100%?',
      a: 'O pedágio de 50% (art. 17 da EC 103/2019) só alcança quem, em 13/11/2019, estava a menos de dois anos do tempo mínimo de contribuição: essa pessoa cumpre o que faltava mais metade disso, sem idade mínima, mas recebe 100% da média multiplicada pelo fator previdenciário, que costuma reduzir bastante o valor. O pedágio de 100% (art. 20) exige idade mínima de 60 anos para o homem e 57 para a mulher e o dobro do tempo que faltava, mas em troca paga 100% da média sem fator e sem o coeficiente de 60%. Por isso o pedágio de 100% costuma ser a regra que paga melhor.',
    },
    {
      q: 'O que é o fator previdenciário e por que ele não está fixo nesta conta?',
      a: 'É um multiplicador que combina a sua idade, o seu tempo de contribuição, a alíquota de 31% e a expectativa de sobrevida publicada anualmente pelo IBGE. Como a tábua muda todo ano e o resultado depende dos seus três dados pessoais, não existe um número único que sirva para todo mundo — por isso ele é um campo editável aqui. Depois da reforma, o fator sobrevive apenas no pedágio de 50%. Quanto mais cedo a aposentadoria, menor o fator: valores entre 0,60 e 0,90 são comuns.',
    },
    {
      q: 'A aposentadoria especial de 15 anos é a mais fácil de conseguir?',
      a: 'É exatamente o contrário, e essa confusão é comum. Os 15 anos correspondem à exposição mais severa prevista em lei — mineração subterrânea em frente de trabalho —, e por isso a lei permite sair mais cedo. Os 25 anos cobrem a maioria dos casos (ruído acima de 85 decibéis, agentes químicos, biológicos, calor). O enquadramento não depende de como você percebe o risco: sai do PPP e do LTCAT emitidos pela empresa, com base em laudo técnico.',
    },
    {
      q: 'Perdi a aposentadoria especial porque a empresa fornecia EPI?',
      a: 'Não necessariamente. O Supremo Tribunal Federal decidiu no ARE 664.335 que o EPI declarado eficaz pode afastar o enquadramento, mas fixou uma exceção importante: para ruído acima do limite de tolerância, o EPI não descaracteriza a atividade especial, porque não elimina a nocividade. Além disso, a mera declaração de eficácia no PPP não basta se houver dúvida real sobre o uso efetivo e a manutenção do equipamento. Vale reunir laudos e recorrer.',
    },
    {
      q: 'O redutor do professor vale para quem dá aula na faculdade?',
      a: 'Não. A EC 103/2019 restringiu o redutor de 5 anos ao magistério na educação básica: educação infantil, ensino fundamental e ensino médio. Professor universitário se aposenta pelas regras gerais. Dentro da educação básica, contam também os períodos em direção de escola, coordenação e assessoramento pedagógico, desde que exercidos em estabelecimento de ensino — a jurisprudência é firme nesse ponto, mas função administrativa em secretaria de educação, fora da escola, não entra.',
    },
    {
      q: 'Quanto tempo o auxílio por incapacidade temporária demora e quanto paga?',
      a: 'Paga 91% do salário de benefício, limitado à média dos 12 últimos salários de contribuição e ao teto do INSS, com piso de um salário mínimo. Os 15 primeiros dias de afastamento são pagos pela empresa; o INSS assume a partir do 16º. É preciso perícia médica e, em regra, 12 contribuições de carência — dispensada em acidente de qualquer natureza e nas doenças graves listadas em portaria conjunta. A perícia costuma marcar uma data de cessação (alta programada); para prorrogar, o pedido tem de ser feito nos 15 dias que antecedem essa data.',
    },
    {
      q: 'Vale a pena continuar contribuindo depois de cumprir os requisitos?',
      a: 'Frequentemente sim, e a conta é simples: cada ano a mais soma 2 pontos percentuais ao coeficiente, até 100% da média. Quem cumpre os requisitos com 80% e trabalha mais cinco anos chega a 90% — 12,5% a mais, para o resto da vida, além de aumentar a própria média se os salários novos forem maiores que os antigos. O contraponto é que você deixa de receber o benefício durante esses anos; a decisão depende de quanto você ainda ganha trabalhando e de quanto tempo espera receber.',
    },
    {
      q: 'Como confiro se o meu tempo de contribuição está certo?',
      a: 'Baixe o extrato do CNIS no aplicativo ou no site Meu INSS e confira vínculo por vínculo: datas de admissão e saída, remunerações lançadas e períodos em aberto. Vínculos antigos, trabalho rural, tempo militar e períodos como contribuinte individual costumam aparecer incompletos. Cada indicador de pendência no extrato pode ser corrigido antes do pedido, com carteira de trabalho, recibos, contratos ou documentos da empresa. Descobrir a falha depois do requerimento custa meses de atraso.',
    },
  ],

  sources: [
    {
      name: 'Emenda Constitucional 103/2019 — reforma da previdência (arts. 15 a 21 e 26)',
      url: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc103.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 8.213/1991 — Planos de Benefícios da Previdência Social (arts. 25, 29 e 61)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8213cons.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Constituição Federal, art. 201 — piso de um salário mínimo e regras do RGPS',
      url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Aposentadoria por idade e regras de transição',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadoria',
      publisher: 'Instituto Nacional do Seguro Social',
    },
    {
      name: 'Aposentadoria especial — exposição a agentes nocivos, PPP e LTCAT',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/aposentadoria/aposentadoria-especial',
      publisher: 'Instituto Nacional do Seguro Social',
    },
    {
      name: 'Benefício por incapacidade temporária (antigo auxílio-doença)',
      url: 'https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficio-por-incapacidade',
      publisher: 'Instituto Nacional do Seguro Social',
    },
    {
      name: 'Meu INSS — extrato CNIS e simulação de tempo de contribuição',
      url: 'https://meu.inss.gov.br/',
      publisher: 'Instituto Nacional do Seguro Social',
    },
  ],

  replaces: [
    '/pt/aposentadoria-inss-idade-65-mulher-62-homem',
    '/pt/aposentadoria-inss-transicao-pontos',
    '/pt/aposentadoria-inss-transicao-idade-progressiva',
    '/pt/aposentadoria-inss-tempo-contribuicao-transicao',
    '/pt/aposentadoria-inss-especial-insalubridade',
    '/pt/aposentadoria-inss-professor-redutor-5-anos',
    '/pt/calculadora-aposentadoria-inss-2026-tempo-contribuicao',
    '/pt/auxilio-doenca-inss-91-porcento-beneficio',
  ],

  lastReviewed: '2026-07-28',
};
