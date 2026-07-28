import type { HubData } from '../types';
import { FGTS_TETO_IMOVEL_SFH } from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Comprar um imóvel: quanto preciso ter na mão e quanto pago por mês?"
 *
 * Absorve 8 calculadoras soltas de compra e financiamento. Base legal: Lei 8.036/1990
 * (FGTS), Lei 4.380/1964 e Resolução CMN 5.255/2025 (SFH), Lei 13.932/2019
 * (saque-aniversário), CTN art. 35 e leis municipais (ITBI/IPTU), Lei 6.015/1973
 * (registro).
 *
 * ⚠️ O teto do imóvel no SFH vem de `FGTS_TETO_IMOVEL_SFH` em brasil-2026.ts.
 * A taxa de juros do financiamento, os emolumentos de cartório e as alíquotas de
 * ITBI/IPTU são MUNICIPAIS/ESTADUAIS ou negociadas com o banco: ficam como campos
 * editáveis, com o padrão indicado no `help` de cada um.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. Taxas de juros, emolumentos de cartório e alíquotas municipais mudam e variam por banco, estado e município; peça a simulação oficial ao banco e a guia do ITBI à prefeitura antes de fechar negócio.';

/** Teto do valor do imóvel para usar FGTS dentro do SFH (Resolução CMN 5.255/2025). */
export const TETO_SFH = FGTS_TETO_IMOVEL_SFH;

/** Lei 8.036/1990, art. 20, VII: mínimo de 3 anos de FGTS (somados) para usar na moradia. */
export const FGTS_ANOS_MINIMOS = 3;

/** Lei 8.036/1990, art. 13: o FGTS é remunerado por TR + 3% ao ano. */
export const FGTS_JUROS_ANUAL = 0.03;

/** Tabela do saque-aniversário — Anexo da Lei 13.932/2019 (alíquota + parcela adicional). */
export const SAQUE_ANIVERSARIO = [
  { ate: 500, aliquota: 0.5, adicional: 0 },
  { ate: 1000, aliquota: 0.4, adicional: 50 },
  { ate: 5000, aliquota: 0.3, adicional: 150 },
  { ate: 10000, aliquota: 0.2, adicional: 650 },
  { ate: 15000, aliquota: 0.15, adicional: 1150 },
  { ate: 20000, aliquota: 0.1, adicional: 1900 },
  // `Infinity` não sobrevive a define:vars: a última faixa vai com `ate: null`.
  { ate: null, aliquota: 0.05, adicional: 2900 },
];

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/dinheiro/comprar-um-imovel',
  title: 'Comprar imóvel: quanto preciso ter e quanto pago por mês?',
  description:
    'Simule a compra do imóvel de ponta a ponta: entrada, uso do FGTS pelo SFH e MCMV, parcela pelo SAC ou pela Tabela Price, ITBI, escritura e registro em cartório, IPTU anual e o rendimento do FGTS parado.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · SFH · FGTS · ITBI e cartório',
  h1: 'Comprar um imóvel: quanto preciso ter na mão e quanto pago por mês?',
  lede:
    'A conta da compra tem duas metades que quase nunca aparecem juntas: o dinheiro que precisa estar na conta no dia da assinatura (entrada + ITBI + cartório) e a parcela que vai te acompanhar por 20 ou 30 anos. Informe valor, entrada e saldo do FGTS: a conta verifica se você pode usar o fundo pelo SFH, compara SAC com Tabela Price e soma os custos de fechamento e de manutenção.',
  stamps: [
    `Teto do imóvel para usar FGTS no SFH: ${brl(TETO_SFH)}`,
    'Lei 8.036/1990 · Resolução CMN 5.255/2025 · Lei 13.932/2019',
    '8 calculadoras dentro',
  ],

  resultLabel: 'Valor da sua situação',

  cases: {
    title: 'O que você quer saber agora?',
    intro:
      'Comprar imóvel são cinco contas diferentes, e a maioria das pessoas só faz uma. Escolha por onde começar — os campos são os mesmos em todas.',
    items: [
      {
        id: 'sac',
        label: 'Financiar pelo SAC (parcela decrescente)',
        hint: 'Sistema padrão da Caixa · parcela cai todo mês',
        answer:
          'No SAC a amortização é fixa e os juros caem junto com o saldo: a primeira parcela é a mais cara e a última, a mais barata. É o sistema que paga menos juros no total.',
        yes: [
          'Valor financiado: preço do imóvel menos a entrada e menos o FGTS aplicado',
          'Primeira e última parcela, com a amortização constante',
          'Total pago ao longo de todo o contrato e quanto disso é juro puro',
          'Renda mínima aproximada, considerando o limite de 30% do orçamento comprometido',
        ],
        warn: [
          AVISO_LEGAL,
          'A taxa deste simulador é editável porque muda por banco, por relacionamento e por linha (SFH, SFI, poupança, IPCA): use a taxa efetiva que o banco te ofereceu, não uma taxa de tabela',
          'A parcela do SAC começa alta: é ela que o banco usa para checar se cabe nos seus 30% de renda, não a parcela média',
          'Além dos juros existem seguros obrigatórios (MIP e DFI) e a taxa de administração, que entram na parcela real e não aparecem na taxa nominal',
        ],
        plazo:
          'a simulação oficial e o laudo de avaliação do imóvel costumam valer 30 dias; depois disso o banco refaz a análise.',
      },
      {
        id: 'price',
        label: 'Financiar pela Tabela Price (parcela fixa)',
        hint: 'Mesma parcela do começo ao fim',
        answer:
          'Na Price a parcela é sempre a mesma, o que facilita o orçamento — mas você amortiza pouco no começo e paga mais juros no total do que no SAC.',
        yes: [
          'Parcela fixa pelo prazo inteiro',
          'Total pago e total de juros, para comparar direto com o SAC',
          'Quanto da primeira parcela é juro e quanto é amortização',
        ],
        warn: [
          AVISO_LEGAL,
          'A Price paga mais juros no total que o SAC no mesmo prazo e na mesma taxa: a vantagem é a previsibilidade da parcela, não o custo',
          'Nos primeiros anos da Price quase tudo é juro: quem pretende vender ou quitar cedo amortiza muito pouco do saldo',
          'Amortização extraordinária deve ser sempre abatida do SALDO DEVEDOR (reduzindo prazo), não das últimas parcelas — peça isso por escrito ao banco',
        ],
        plazo:
          'você pode pedir amortização extraordinária a qualquer momento; o art. 52 §2º do Código de Defesa do Consumidor garante a redução proporcional dos juros na liquidação antecipada.',
      },
      {
        id: 'fgts',
        label: 'Usar o FGTS na entrada (SFH / Minha Casa Minha Vida)',
        hint: 'Requisitos, teto do imóvel e quanto sobra financiar',
        answer:
          `Dá para usar o FGTS se você tem ao menos ${FGTS_ANOS_MINIMOS} anos de fundo somados, não tem imóvel residencial no mesmo município e o imóvel fica dentro do teto do SFH.`,
        yes: [
          'Verificação dos três requisitos legais do art. 20, VII da Lei 8.036/1990',
          'Quanto do saldo pode entrar de fato na compra',
          'Entrada total resultante (recursos próprios + FGTS) e o percentual do imóvel que ela cobre',
          'Quanto sobra para financiar depois de aplicar o fundo',
        ],
        warn: [
          AVISO_LEGAL,
          `O imóvel tem de estar dentro do teto do SFH (${brl(TETO_SFH)}); acima disso a operação vira SFI e o FGTS não pode ser usado`,
          'Quem aderiu ao saque-aniversário fica com o saldo comprometido e, na prática, não consegue usá-lo na compra até sair do modelo — e o retorno ao saque-rescisão só vale depois de 25 meses',
          'O imóvel precisa ser residencial, urbano e destinado à sua moradia; imóvel para alugar ou terreno sem construção não entram',
          'Você não pode ter financiamento habitacional ativo no SFH em nenhum lugar do país, nem outro imóvel residencial no município onde mora ou trabalha',
        ],
        plazo:
          'o FGTS só pode ser usado de novo para moradia depois de 3 anos da operação anterior — programe as compras com essa carência em mente.',
      },
      {
        id: 'fechamento',
        label: 'Custos de fechamento: ITBI, escritura e registro',
        hint: 'O dinheiro que ninguém coloca na planilha',
        answer:
          'Além da entrada, o dia da assinatura costuma consumir de 4% a 6% do valor do imóvel entre ITBI, escritura e registro.',
        yes: [
          'ITBI sobre a base de cálculo do município (a maior entre o preço e o valor venal de referência)',
          'Emolumentos de escritura pública e de registro na matrícula',
          'Total de custos de fechamento e o percentual que representam sobre o preço',
          'Caixa total necessário no dia: entrada + custos',
        ],
        warn: [
          AVISO_LEGAL,
          'A alíquota do ITBI é MUNICIPAL e varia (São Paulo e Belo Horizonte cobram 3%; muitos municípios cobram 2%): confirme na prefeitura antes de orçar',
          'O STF decidiu no Tema 1.113 que a base do ITBI é o valor da transação declarado, presumido verdadeiro — a prefeitura só pode arbitrar valor maior em processo administrativo próprio',
          'Financiamento com alienação fiduciária dispensa a escritura pública: o próprio contrato do banco tem força de escritura (art. 61 §5º da Lei 4.380/1964), o que corta boa parte do custo de cartório',
          'Os emolumentos de cartório são fixados por LEI ESTADUAL (tabela da corregedoria de cada estado). Não existe tabela nacional: o valor deste simulador é uma estimativa editável, consulte a tabela do seu estado',
        ],
        plazo:
          'o ITBI é pago antes do registro e costuma ter prazo de 30 dias a contar da lavratura da escritura; sem a guia paga, o cartório não registra.',
      },
      {
        id: 'manter',
        label: 'Quanto custa MANTER o imóvel',
        hint: 'IPTU anual, condomínio e o FGTS que fica parado',
        answer:
          'Depois de comprar, o custo fixo continua: IPTU, condomínio e o custo de oportunidade do FGTS que você não sacou.',
        yes: [
          'IPTU anual sobre o valor venal, com a alíquota do município',
          'Quanto isso representa por mês e por cota',
          'Rendimento anual do saldo de FGTS que ficou parado (TR + 3% ao ano, art. 13 da Lei 8.036/1990)',
          'Quanto o saque-aniversário liberaria por ano sobre esse mesmo saldo',
        ],
        warn: [
          AVISO_LEGAL,
          'A alíquota e a estrutura de descontos do IPTU são municipais e mudam todo ano: em São Paulo, a Lei 15.889/2013 fixa 1,0% para residencial e 1,5% para não residencial, com descontos e acréscimos escalonados por faixa de valor venal. Use a alíquota que consta no seu carnê',
          'O rendimento do FGTS (TR + 3% a.a.) costuma ficar abaixo da inflação: saldo parado perde poder de compra ano a ano',
          'Aderir ao saque-aniversário bloqueia o saque integral numa demissão sem justa causa — você continua recebendo a multa de 40%, mas não o saldo',
        ],
        plazo:
          'o IPTU costuma vencer em cota única com desconto em janeiro ou fevereiro, ou em até 10 parcelas; o calendário é definido por decreto municipal a cada ano.',
      },
    ],
  },

  inputsTitle: 'Os números da sua compra',
  inputsIntro:
    'Preencha com os seus dados reais. Os campos de taxa, alíquota e cartório são editáveis de propósito: variam por banco, município e estado, e nenhuma tabela nacional os define.',
  fields: [
    {
      id: 'valorImovel',
      label: 'Valor do imóvel (R$)',
      prefix: 'R$',
      value: '400.000',
      thousands: true,
      help: 'Preço de compra fechado com o vendedor. É também a base do financiamento e, em regra, do ITBI.',
    },
    {
      id: 'entrada',
      label: 'Entrada com recursos próprios (R$)',
      prefix: 'R$',
      value: '80.000',
      thousands: true,
      help: 'Dinheiro seu, fora o FGTS. Bancos costumam exigir no mínimo 20% do valor do imóvel entre entrada própria e FGTS.',
    },
    {
      id: 'saldoFgts',
      label: 'Saldo do FGTS (R$)',
      prefix: 'R$',
      value: '30.000',
      thousands: true,
      help: 'Some todas as contas vinculadas, ativas e inativas. É o número que aparece no aplicativo FGTS da Caixa.',
    },
    {
      id: 'anosFgts',
      label: 'Anos de trabalho sob o regime do FGTS',
      type: 'number',
      value: 5,
      min: 0,
      max: 50,
      step: 1,
      help: 'Somados, mesmo em empresas diferentes e mesmo não consecutivos. O mínimo legal para usar o fundo na moradia é 3 anos.',
    },
    {
      id: 'temImovel',
      label: 'Já tem imóvel residencial no município onde mora ou trabalha?',
      type: 'select',
      value: 'nao',
      options: [
        { value: 'nao', label: 'Não' },
        { value: 'sim', label: 'Sim' },
      ],
      help: 'Ter imóvel residencial no mesmo município (ou financiamento ativo no SFH em qualquer lugar do país) impede o uso do FGTS.',
    },
    {
      id: 'prazoMeses',
      label: 'Prazo do financiamento (meses)',
      type: 'number',
      value: 360,
      min: 12,
      max: 420,
      step: 12,
      help: 'Trezentos e sessenta meses (30 anos) é o prazo máximo usual do SFH. Prazo maior significa parcela menor e muito mais juro no total.',
    },
    {
      id: 'taxaAnual',
      label: 'Taxa de juros efetiva do financiamento (% ao ano)',
      type: 'number',
      value: 11.5,
      min: 0,
      max: 30,
      step: 0.1,
      suffix: '% a.a.',
      help: 'Coloque a taxa efetiva que o banco te ofereceu na simulação, já incluindo o indexador. Não use "TR + 3%": esse é o rendimento do FGTS, não taxa de financiamento imobiliário.',
    },
    {
      id: 'itbiAliquota',
      label: 'Alíquota do ITBI do seu município (%)',
      type: 'number',
      value: 3,
      min: 0,
      max: 6,
      step: 0.1,
      suffix: '%',
      help: 'É municipal. São Paulo e Belo Horizonte cobram 3%; muitas cidades cobram 2%. Confirme na secretaria de finanças da prefeitura.',
    },
    {
      id: 'custoCartorio',
      label: 'Escritura + registro em cartório (R$)',
      prefix: 'R$',
      value: '9.000',
      thousands: true,
      help: 'Estimativa editável: os emolumentos são fixados por lei estadual, na tabela da corregedoria de cada estado. Consulte a tabela do seu estado para o valor exato da sua faixa. Financiamento com alienação fiduciária dispensa a escritura pública e reduz bastante esse custo.',
    },
    {
      id: 'valorVenal',
      label: 'Valor venal do imóvel para o IPTU (R$)',
      prefix: 'R$',
      value: '300.000',
      thousands: true,
      help: 'Está no carnê do IPTU. Costuma ser menor que o preço de mercado — não confunda com o valor venal de referência do ITBI, que é outro cadastro.',
    },
    {
      id: 'iptuAliquota',
      label: 'Alíquota do IPTU (%)',
      type: 'number',
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      suffix: '%',
      help: 'Municipal. Em São Paulo a Lei 15.889/2013 fixa 1,0% para imóvel residencial e 1,5% para não residencial, antes dos descontos e acréscimos por faixa. Confira o seu carnê.',
    },
    {
      id: 'trAnual',
      label: 'TR estimada para o ano (%)',
      type: 'number',
      value: 1.2,
      min: 0,
      max: 10,
      step: 0.1,
      suffix: '%',
      help: 'Taxa Referencial acumulada no ano, divulgada pelo Banco Central. Entra no rendimento do FGTS: TR + 3% ao ano (art. 13 da Lei 8.036/1990).',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Para onde vai o seu dinheiro',
    caption:
      'Mostra a proporção entre o que é principal (o imóvel de fato) e o que é juro, imposto ou custo de cartório. Quanto maior a fatia de juros, mais peso tem negociar a taxa ou encurtar o prazo.',
  },
  breakdownTitle: 'A compra, linha por linha',
  breakdownIntro:
    'Cada linha traz a norma ou a origem do número. Os campos editáveis (taxa, ITBI, cartório, IPTU) estão sinalizados: substitua pelos valores do seu banco e do seu município.',

  faq: [
    {
      q: 'Quanto preciso ter guardado para comprar um imóvel?',
      a: 'Some três coisas: a entrada mínima exigida pelo banco (em regra 20% do valor, podendo o FGTS entrar nessa conta), o ITBI (2% a 3% na maioria dos municípios) e os custos de cartório (escritura, quando houver, e registro). Na prática, quem compra um imóvel de R$ 400 mil precisa ter de R$ 100 mil a R$ 110 mil disponíveis no dia, contando FGTS. Comprar com entrada mínima e zero reserva é o erro mais comum: os custos de fechamento chegam depois que o dinheiro já acabou.',
    },
    {
      q: 'SAC ou Tabela Price: qual compensa mais?',
      a: 'Na mesma taxa e no mesmo prazo, o SAC paga menos juros no total, porque amortiza mais rápido — em compensação, começa com a parcela mais alta, o que exige mais renda para aprovar. A Price tem parcela fixa, mais fácil de encaixar no orçamento e de aprovar com renda menor, mas custa mais caro no total e amortiza pouquíssimo nos primeiros anos. Se a renda comporta, o SAC costuma ser a escolha melhor; se o aperto é agora, a Price compra fôlego.',
    },
    {
      q: 'Quais são os requisitos para usar o FGTS na compra?',
      a: `São três, do art. 20, VII da Lei 8.036/1990 e das resoluções do Conselho Curador: ao menos ${FGTS_ANOS_MINIMOS} anos de trabalho sob o regime do FGTS, somados (não precisam ser consecutivos nem na mesma empresa); não ter outro imóvel residencial no município onde mora ou trabalha, nem financiamento habitacional ativo no SFH em qualquer lugar do país; e o imóvel ser residencial, urbano e destinado à sua moradia, dentro do teto do SFH — hoje ${brl(TETO_SFH)}.`,
    },
    {
      q: 'Posso usar o FGTS se aderi ao saque-aniversário?',
      a: 'Na prática, não sem antes voltar atrás. Quem está no saque-aniversário tem o saldo comprometido com os saques anuais e não consegue usá-lo na compra do imóvel. Dá para cancelar a adesão e voltar ao saque-rescisão, mas a mudança só produz efeito depois de 25 meses (dois aniversários). Quem planeja comprar imóvel nos próximos dois anos deve pensar duas vezes antes de aderir.',
    },
    {
      q: 'Qual é a alíquota do ITBI e sobre o que ela incide?',
      a: 'A alíquota é definida por lei municipal: São Paulo e Belo Horizonte cobram 3%, e boa parte dos municípios cobra 2%. A base é o valor da transmissão. No Tema 1.113, julgado em 2022, o STJ fixou que o valor declarado pelo contribuinte goza de presunção de veracidade e que o município não pode simplesmente adotar um "valor venal de referência" unilateral — precisa instaurar processo administrativo para arbitrar valor maior. Se a prefeitura cobrar sobre um valor de referência sem esse processo, há base jurídica para discutir.',
    },
    {
      q: 'Financiamento dispensa escritura pública?',
      a: 'Sim, quando é feito com alienação fiduciária. O art. 61 §5º da Lei 4.380/1964 dá ao contrato de financiamento habitacional força de escritura pública, e ele vai direto para registro na matrícula. Isso corta uma das duas pontas do custo de cartório: sobra o registro, que é obrigatório sempre — "quem não registra não é dono" (art. 1.245 do Código Civil). Na compra à vista, escritura pública em tabelionato é obrigatória para imóveis acima de 30 salários mínimos (art. 108 do Código Civil).',
    },
    {
      q: 'Quanto rende o FGTS parado?',
      a: `TR + ${Math.round(FGTS_JUROS_ANUAL * 100)}% ao ano, remuneração fixada no art. 13 da Lei 8.036/1990, mais a eventual distribuição de resultados que o Conselho Curador aprova em alguns anos. Com a TR baixa, esse rendimento fica bem abaixo da inflação e de qualquer aplicação de renda fixa pós-fixada: cada ano de saldo parado é perda de poder de compra. É exatamente por isso que usar o FGTS na entrada do imóvel, quando você preenche os requisitos, costuma ser a melhor destinação possível desse dinheiro.`,
    },
    {
      q: 'Como funciona a tabela do saque-aniversário?',
      a: 'É uma tabela regressiva do Anexo da Lei 13.932/2019: até R$ 500 de saldo você saca 50%; de R$ 500 a R$ 1.000, 40% + R$ 50; de R$ 1.000 a R$ 5.000, 30% + R$ 150; de R$ 5.000 a R$ 10.000, 20% + R$ 650; de R$ 10.000 a R$ 15.000, 15% + R$ 1.150; de R$ 15.000 a R$ 20.000, 10% + R$ 1.900; e acima de R$ 20.000, 5% + R$ 2.900. Quanto maior o saldo, menor a fração liberada — num saldo de R$ 50 mil o saque anual é de R$ 5.400, pouco mais de 10%.',
    },
    {
      q: 'Vale a pena antecipar o saque-aniversário no banco?',
      a: 'Quase nunca, a não ser que você precise do dinheiro agora e não tenha crédito mais barato. O banco adianta o valor presente de vários saques futuros descontando juros mensais; a diferença entre o que você recebe hoje e a soma dos saques que entrega é o custo da operação, e ele costuma superar com folga o rendimento do próprio fundo. Compare sempre a taxa oferecida com a de um crédito consignado antes de assinar.',
    },
    {
      q: 'Qual é o teto do imóvel para usar FGTS e financiamento SFH?',
      a: `${brl(TETO_SFH)}, valor elevado pela Resolução CMN 5.255/2025 (antes eram R$ 1,5 milhão). Acima desse teto a operação sai do Sistema Financeiro da Habitação e vai para o SFI, onde as taxas são livres, o FGTS não pode ser usado e as regras de proteção do mutuário são menores. É por isso que muita negociação de preço trava exatamente nesse número.`,
    },
    {
      q: 'Como se calcula o IPTU?',
      a: 'Valor venal do imóvel multiplicado pela alíquota do município. O valor venal está no seu carnê e é atualizado pela prefeitura — costuma ser menor que o preço de mercado. Em São Paulo, a Lei 15.889/2013 fixa 1,0% para imóveis residenciais e 1,5% para não residenciais, e depois aplica descontos e acréscimos escalonados conforme a faixa de valor venal, além de limitar o aumento anual. Outros municípios usam alíquotas progressivas próprias. Use sempre a alíquota impressa no seu carnê.',
    },
    {
      q: 'Posso quitar o financiamento antes e economizar juros?',
      a: 'Sim, e a lei está do seu lado: o art. 52 §2º do Código de Defesa do Consumidor garante ao consumidor a liquidação antecipada, total ou parcial, com redução proporcional dos juros. Na amortização parcial, exija por escrito que o valor seja abatido do saldo devedor com redução de PRAZO (e não das últimas parcelas): é isso que corta juros de verdade. Vale mais amortizar cedo, quando o saldo — e portanto o juro mensal — ainda é alto.',
    },
  ],

  sources: [
    {
      name: 'Lei 8.036/1990 — FGTS (arts. 13 e 20, uso na moradia própria)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 4.380/1964 — Sistema Financeiro da Habitação (art. 61 §5º)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l4380.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 13.932/2019 — saque-aniversário do FGTS e sua tabela',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2019/lei/l13932.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Código Civil — arts. 108 (escritura pública) e 1.245 (registro)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Código Tributário Nacional — art. 35 (ITBI)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'FGTS — uso na compra do imóvel, saque-aniversário e simuladores',
      url: 'https://www.fgts.gov.br/',
      publisher: 'Caixa Econômica Federal',
    },
    {
      name: 'Habitação — Minha Casa Minha Vida e financiamento habitacional',
      url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao',
      publisher: 'Ministério das Cidades',
    },
    {
      name: 'Taxa Referencial (TR) — série histórica',
      url: 'https://www.bcb.gov.br/estatisticas/txjuros',
      publisher: 'Banco Central do Brasil',
    },
  ],

  replaces: [
    '/pt/financiamento-caixa-tr-poupanca-taxa',
    '/pt/fgts-aplicacao-compra-imovel-mcmv',
    '/pt/escritura-registro-cartorio-custos-compra',
    '/pt/itbi-belo-horizonte-3-porcento',
    '/pt/fgts-saldo-rendimento-anual-tr',
    '/pt/antecipacao-saque-aniversario-fgts',
    '/pt/iptu-sao-paulo-valor-venal-aliquota',
    // Entra SÓ por URL (301): calculava o aporte em cotas de um fideicomisso de
    // construção com fórmula e moeda argentinas. Não é uma pergunta do comprador
    // brasileiro e não tem equivalente no cálculo deste hub.
    '/pt/fideicomisso-construcao-aporte-cotas',
  ],

  lastReviewed: '2026-07-28',
};
