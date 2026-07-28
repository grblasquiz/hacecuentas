import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Quanto pago comprando em dólar, euro ou site gringo?"
 *
 * Absorve 4 calculadoras soltas de câmbio e importação.
 *
 * 🔴 As alíquotas de IOF de câmbio mudaram várias vezes por decreto nos últimos
 * anos (o cronograma de redução gradual do Decreto 10.997/2022 chegou a prever
 * 0% e foi revisto por decreto posterior). Por isso a alíquota NÃO fica travada
 * aqui: entra como campo editável, com o valor de referência de cada operação
 * escrito no texto da rama e a fonte oficial linkada. Mesma decisão para o ICMS
 * da importação, que é estadual e vai de 17% a 20% conforme a UF.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As alíquotas de IOF do câmbio são alteradas por decreto e o ICMS da importação é definido por cada estado; confira a alíquota vigente no site da Receita Federal e na Sefaz do seu estado antes de fechar a operação.';

/** Alíquotas de referência, editáveis na tela. Fonte: Decreto 6.306/2007 e alterações. */
export const IOF_REFERENCIA = {
  /** Compra no cartão de crédito ou débito internacional. */
  cartao: 3.5,
  /** Remessa para conta de mesma titularidade no exterior. */
  remessa: 3.5,
  /** Compra de moeda em espécie ou carga de cartão pré-pago. */
  especie: 3.5,
};

/** Programa Remessa Conforme — Lei 14.902/2024 e regulamentação da Receita Federal. */
export const IMPORTACAO = {
  /** Até este valor, em dólares, a alíquota do II é a reduzida. */
  limiteUsd: 50,
  iiAte50: 0.2,
  iiAcima50: 0.6,
  /** Abatimento em dólares aplicado ao II na faixa de 60%. */
  abatimentoUsd: 20,
  /** Teto de valor da remessa que pode entrar pelo regime simplificado. */
  tetoUsd: 3_000,
  /** ICMS de referência: a maioria dos estados usa 17%, mas há UFs em 18% a 20%. */
  icmsPadrao: 17,
};

export const hub: HubData = {
  slug: 'pt/dinheiro/comprar-em-dolar-iof',
  title: 'Comprar em dólar: quanto custa de verdade com IOF, spread e imposto?',
  description:
    'Calcule o custo real de gastar no cartão no exterior, mandar dinheiro para fora, comprar moeda em espécie ou pedir de site internacional, com IOF, spread do banco, imposto de importação e ICMS estadual.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · câmbio, IOF e importação',
  h1: 'Quanto o dólar realmente custa quando você paga a conta.',
  lede:
    'A cotação que aparece no telejornal é a comercial, e ninguém compra por ela. Entre a cotação e a sua fatura entram o spread da instituição, o IOF da operação e, quando a compra vem de fora, o imposto de importação e o ICMS do seu estado. Esta conta mostra a cotação efetiva, que é a única que importa.',
  stamps: [
    'IOF do câmbio: Decreto 6.306/2007 e alterações — alíquota editável',
    'Importação: Lei 14.902/2024 (Remessa Conforme) + ICMS estadual',
    '4 calculadoras dentro',
  ],

  resultLabel: 'Custo total em reais',

  cases: {
    title: 'Como você vai pagar?',
    intro:
      'A mesma compra sai por valores diferentes conforme o meio de pagamento, e a diferença raramente é pequena. O que muda é a alíquota do IOF e o tamanho do spread cobrado sobre a cotação.',
    items: [
      {
        id: 'cartao',
        label: 'Cartão de crédito ou débito no exterior',
        hint: 'Compra presencial, assinatura, hotel, site estrangeiro',
        answer:
          'O banco converte pela cotação do dia do fechamento da fatura, com spread próprio, e sobre esse valor incide o IOF de câmbio.',
        yes: [
          'A conversão usa a cotação do dia do fechamento da fatura, não a do dia da compra',
          'O spread da bandeira e do emissor entra antes do IOF, então o imposto incide sobre um valor já inflado',
          'A alíquota de referência para cartão internacional é de 3,5%',
          'Vale para compra em loja física fora do país, em site estrangeiro e em assinatura cobrada em moeda estrangeira',
        ],
        warn: [
          AVISO_LEGAL,
          'Como a conversão é a do fechamento da fatura, uma alta do dólar entre a compra e o fechamento aumenta o que você vai pagar — e uma queda reduz',
          'Compra parcelada no exterior converte cada parcela pela cotação do respectivo fechamento: você não sabe o custo total no ato da compra',
          'Site estrangeiro que cobra em reais costuma embutir spread próprio e sair mais caro do que pagar na moeda de origem',
          'Alguns bancos permitem travar a cotação no ato da compra; a proteção tem custo e nem sempre compensa',
        ],
        plazo:
          'a cotação usada é a do dia do fechamento da fatura, que costuma ser de 7 a 10 dias antes do vencimento.',
      },
      {
        id: 'remessa',
        label: 'Enviar dinheiro para conta própria no exterior',
        hint: 'Transferência internacional, investimento lá fora',
        answer:
          'O IOF incide sobre o valor da operação de câmbio, e o spread da corretora costuma pesar mais que o imposto.',
        yes: [
          'IOF de câmbio sobre o valor remetido, com alíquota que varia conforme a finalidade da operação',
          'Spread da corretora ou do banco sobre a cotação comercial',
          'Taxa fixa de transferência internacional (wire fee), quando houver',
          'A conta mostra a cotação efetiva final, que é o que dá para comparar entre instituições',
        ],
        warn: [
          AVISO_LEGAL,
          'A alíquota de IOF para remessas foi alterada por decreto mais de uma vez nos últimos anos: confirme a vigente antes de fechar o câmbio',
          'Remessa para conta de terceiro, para pagamento de serviço ou para investimento tem enquadramento e alíquota diferentes da remessa para conta própria',
          'Comparar apenas o IOF é enganoso: uma corretora com IOF igual e spread 2 pontos menor entrega mais dólares',
          'Manter conta e investimentos no exterior gera obrigações próprias de declaração à Receita Federal e, acima de certos valores, ao Banco Central',
        ],
        plazo:
          'o contrato de câmbio precisa ser liquidado no prazo pactuado; a maioria das plataformas liquida em D+0 ou D+1.',
      },
      {
        id: 'especie',
        label: 'Comprar moeda em espécie ou pré-pago',
        hint: 'Dinheiro vivo na casa de câmbio, cartão de viagem',
        answer:
          'Aqui quem manda é o spread da casa de câmbio: a diferença entre casas costuma ser maior que o imposto inteiro.',
        yes: [
          'Spread da casa de câmbio aplicado sobre a cotação comercial do dia',
          'IOF de câmbio sobre a operação, na alíquota de referência da modalidade',
          'Cartão pré-pago trava a cotação no momento da carga, o que elimina o risco de alta do dólar',
          'A conta devolve a cotação efetiva por unidade de moeda, que é o número comparável entre casas',
        ],
        warn: [
          AVISO_LEGAL,
          'Casa de câmbio de aeroporto costuma praticar o pior spread do mercado, às vezes acima de 8%',
          'Levar dinheiro vivo acima do limite de declaração exige declaração eletrônica de porte de valores na saída do país',
          'O cartão pré-pago trava a cotação, mas cobra taxa para recarga, para saque em caixa eletrônico e, às vezes, para devolver o saldo não usado',
          'Converter de volta o que sobrou custa spread de novo, no sentido contrário',
        ],
        plazo:
          'a compra de espécie costuma exigir agendamento e apresentação de documento; o câmbio é fechado no dia da retirada, com a cotação daquele momento.',
      },
      {
        id: 'importacao',
        label: 'Comprar em site internacional',
        hint: 'Remessa Conforme: II de 20% ou 60% + ICMS',
        answer:
          'Até US$ 50 em loja certificada, imposto de importação de 20%; acima disso, 60% com abatimento de US$ 20 — e o ICMS do seu estado incide sobre tudo, por dentro.',
        yes: [
          'O valor aduaneiro é a soma do produto, do frete e do seguro, convertida pela cotação do dia do registro',
          'Até US$ 50 em empresa certificada no Remessa Conforme: imposto de importação de 20%',
          'Acima de US$ 50: 60% de imposto de importação, com abatimento de US$ 20',
          'ICMS estadual sobre o valor aduaneiro somado ao imposto de importação, calculado "por dentro"',
        ],
        warn: [
          AVISO_LEGAL,
          'A alíquota de 20% só vale em loja habilitada no Remessa Conforme; a mesma compra em site não habilitado paga 60% desde o primeiro dólar',
          'O ICMS "por dentro" faz a alíquota nominal de 17% custar mais de 20% na prática, porque o próprio imposto entra na sua base de cálculo',
          'O frete entra no valor aduaneiro: um produto de US$ 45 com US$ 10 de frete ultrapassa os US$ 50 e cai na faixa de 60%',
          'Acima do teto do regime simplificado, a compra sai do Remessa Conforme e passa a exigir despacho formal, com custos e burocracia bem maiores',
          'Declarar valor menor que o real na etiqueta é falsidade e sujeita a mercadoria a apreensão e a multa sobre a diferença',
        ],
        plazo:
          'a cobrança aparece no rastreamento dos Correios ou da transportadora e costuma ter prazo curto para pagamento antes de a encomenda voltar à origem.',
      },
    ],
  },

  inputsTitle: 'Sua operação',
  inputsIntro:
    'Preencha a cotação comercial do dia e o spread praticado pela instituição. A alíquota de IOF é editável de propósito: ela muda por decreto e você deve conferir a vigente.',
  fields: [
    {
      id: 'operacao',
      label: 'Tipo de operação',
      type: 'select',
      value: 'cartao',
      options: [
        { value: 'cartao', label: 'Cartão de crédito ou débito no exterior' },
        { value: 'remessa', label: 'Remessa para conta própria no exterior' },
        { value: 'especie', label: 'Moeda em espécie ou cartão pré-pago' },
        { value: 'importacao', label: 'Compra em site internacional (Remessa Conforme)' },
      ],
      help: 'Muda a alíquota de referência e a ordem em que os encargos entram na conta.',
    },
    {
      id: 'valorMoeda',
      label: 'Valor da compra em moeda estrangeira (US$ ou €)',
      value: '100',
      thousands: true,
      help: 'Na remessa, informe aqui quanto você quer que chegue lá fora.',
    },
    {
      id: 'cotacao',
      label: 'Cotação comercial da moeda (R$)',
      prefix: 'R$',
      type: 'number',
      value: 5.4,
      min: 0.01,
      max: 100,
      step: 0.01,
      help: 'A cotação de fechamento publicada pelo Banco Central no PTAX. Serve para dólar, euro ou qualquer moeda.',
    },
    {
      id: 'spread',
      label: 'Spread da instituição (%)',
      type: 'number',
      value: 4,
      min: 0,
      max: 20,
      step: 0.1,
      suffix: '%',
      help: 'Quanto o banco ou a casa de câmbio cobra acima da cotação comercial. Bancos grandes: de 3% a 5%; casas de aeroporto: acima de 8%.',
    },
    {
      id: 'iofPct',
      label: 'Alíquota de IOF da operação (%)',
      type: 'number',
      value: 3.5,
      min: 0,
      max: 25,
      step: 0.01,
      suffix: '%',
      help: 'Editável porque é alterada por decreto. Referência atual: 3,5% no cartão internacional. Confirme no site da Receita Federal.',
    },
    {
      id: 'freteUsd',
      label: 'Frete e seguro da compra internacional (US$)',
      value: '0',
      thousands: true,
      help: 'Entra no valor aduaneiro e conta para o limite de US$ 50 do Remessa Conforme.',
    },
    {
      id: 'icms',
      label: 'ICMS de importação do seu estado (%)',
      type: 'number',
      value: 17,
      min: 0,
      max: 25,
      step: 0.5,
      suffix: '%',
      help: 'A maioria dos estados usa 17%, mas há UFs com 18%, 19% ou 20%. Confira na Sefaz do seu estado.',
    },
    {
      id: 'taxaFixa',
      label: 'Taxa fixa da operação (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Wire fee da remessa, taxa de emissão do pré-pago ou tarifa administrativa cobrada à parte.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'De que é feito o que você paga',
    caption:
      'Mostra quanto do total é o valor da compra pela cotação comercial e quanto é spread, IOF e impostos. É a diferença entre esses dois blocos que define a sua cotação efetiva.',
  },
  breakdownTitle: 'A conta encargo por encargo',
  breakdownIntro:
    'Na ordem em que o dinheiro sai: cotação comercial, spread, IOF, impostos de importação quando houver e, por fim, a cotação efetiva que você pagou.',

  faq: [
    {
      q: 'Por que o dólar da minha fatura é maior que o do noticiário?',
      a: 'Porque o noticiário informa a cotação comercial, que é o preço entre bancos, e nenhum consumidor compra por ela. Entre a cotação comercial e a sua fatura entram o spread do emissor do cartão e o IOF de câmbio. Somados, costumam elevar o custo em 6% a 9% sobre a cotação comercial. A diferença entre o que você pagou e a cotação comercial dividida por ela é o que esta calculadora chama de custo extra, e é o número honesto para comparar meios de pagamento.',
    },
    {
      q: 'Que cotação o banco usa na compra com cartão de crédito?',
      a: 'A do dia do fechamento da fatura, não a do dia da compra. Isso significa que uma compra feita no início do ciclo fica exposta à variação do câmbio por semanas. Se o dólar subir nesse intervalo, você paga mais pela mesma compra; se cair, paga menos. Alguns emissores oferecem travar a cotação no ato ou pagar a fatura em dólar antes do fechamento — as duas alternativas têm custo e só compensam quando o valor é alto ou o câmbio está muito volátil.',
    },
    {
      q: 'O IOF incide antes ou depois do spread?',
      a: 'Depois. O banco primeiro converte pela cotação com o seu spread embutido e só então aplica o IOF sobre o valor em reais resultante. Isso faz o imposto incidir sobre um valor já inflado pelo spread, e é a razão pela qual os encargos somados são maiores que a soma simples dos percentuais. Um spread de 4% com IOF de 3,5% não dá 7,5% de custo extra: dá 7,64%.',
    },
    {
      q: 'É melhor pagar em reais ou na moeda local no exterior?',
      a: 'Quase sempre na moeda local. Quando a maquininha oferece cobrar em reais — a chamada conversão dinâmica de moeda — quem define a taxa é o estabelecimento ou o adquirente local, e o spread costuma ser bem pior que o do seu banco. Além disso, a operação continua sendo internacional para efeito de IOF. Aceitar a cobrança em reais soa mais previsível e, na prática, é a opção mais cara na maioria dos casos.',
    },
    {
      q: 'Como funciona o Programa Remessa Conforme?',
      a: 'É um regime em que sites estrangeiros se habilitam junto à Receita Federal, recolhem os tributos antecipadamente e transmitem os dados da encomenda antes do embarque. Em compras de até US$ 50 nessas lojas, o imposto de importação é de 20%; acima disso, sobe para 60% com abatimento de US$ 20. Fora do programa, a alíquota é de 60% desde o primeiro dólar, sem abatimento, e a encomenda ainda enfrenta fila de tributação na chegada. Por isso vale conferir se a loja é habilitada antes de comprar.',
    },
    {
      q: 'O que significa o ICMS ser calculado "por dentro"?',
      a: 'Significa que o próprio imposto integra a sua base de cálculo. Em vez de multiplicar a base por 17%, divide-se a base por 0,83. Uma base de R$ 1.000 gera R$ 204,82 de ICMS, e não R$ 170 — a alíquota nominal de 17% custa 20,48% na prática. Como o ICMS entra depois do imposto de importação, ele incide também sobre o II, o que faz o total pago superar bastante a soma ingênua dos percentuais.',
    },
    {
      q: 'O frete conta para o limite de US$ 50?',
      a: 'Conta. O valor aduaneiro é a soma do produto, do frete e do seguro. Um item de US$ 45 com US$ 10 de frete totaliza US$ 55 e cai integralmente na faixa de 60%, com o abatimento de US$ 20. Por isso, produto barato com frete caro costuma ser mau negócio: o frete não apenas custa, como muda a faixa de tributação de toda a compra.',
    },
    {
      q: 'Quanto de dinheiro vivo posso levar para fora do país?',
      a: 'Não existe limite para levar, existe limite para levar sem declarar. Acima do valor de corte definido pela Receita Federal, em espécie ou cheques, é obrigatório apresentar a declaração eletrônica de porte de valores antes do embarque. A omissão pode levar à retenção do valor e à aplicação de multa. O limite é atualizado periodicamente e deve ser conferido no site da Receita antes da viagem.',
    },
    {
      q: 'Cartão pré-pago compensa em relação ao cartão de crédito?',
      a: 'Depende de duas coisas: da alíquota de IOF vigente para cada modalidade e do spread cobrado na recarga. A vantagem real do pré-pago é travar a cotação no momento da carga, o que elimina a incerteza da conversão futura, e permitir controlar o orçamento da viagem. As desvantagens são as taxas: recarga, saque em caixa eletrônico no exterior e, em muitos casos, a devolução do saldo não utilizado com spread no sentido inverso.',
    },
    {
      q: 'Que taxas escondidas aparecem nesse tipo de operação?',
      a: 'As mais comuns são a wire fee da transferência internacional, uma taxa fixa por operação que pesa muito em valores pequenos; a taxa da corretora, cobrada além do spread; a taxa de saque em caixa eletrônico no exterior, que costuma ser fixa e cobrada em dobro, pelo seu banco e pelo banco local; e a taxa de conversão de volta do saldo do pré-pago. Sempre compare pela cotação efetiva, que é o total em reais dividido pela moeda estrangeira recebida — ela absorve todas as taxas de uma vez.',
    },
    {
      q: 'Compras internacionais podem ser parceladas sem custo?',
      a: 'O parcelamento existe, mas não é sem custo: cada parcela é convertida pela cotação do fechamento da fatura em que ela aparece. Você assume risco cambial em todas as parcelas e não sabe, no ato da compra, quanto vai pagar no total. Em cenário de real se desvalorizando, uma compra parcelada em doze vezes pode terminar bem acima do valor original em reais.',
    },
    {
      q: 'Existe reembolso do IOF se eu cancelar a compra?',
      a: 'Quando a operação de câmbio é integralmente cancelada e estornada, o IOF correspondente também deve ser estornado, porque não houve fato gerador. Na prática, o estorno costuma aparecer na fatura seguinte e pela cotação da data do estorno, o que pode gerar diferença a mais ou a menos em relação ao valor cobrado originalmente. Vale conferir a fatura seguinte e reclamar formalmente quando o estorno não vier.',
    },
  ],

  sources: [
    {
      name: 'Decreto 6.306/2007 — regulamento do IOF, inclusive das operações de câmbio',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 14.902/2024 — tributação das remessas internacionais',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Programa Remessa Conforme — regras e lojas habilitadas',
      url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/remessas-postal-e-expressa/remessa-conforme',
      publisher: 'Receita Federal',
    },
    {
      name: 'Cotações de fechamento PTAX de todas as moedas',
      url: 'https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes',
      publisher: 'Banco Central do Brasil',
    },
    {
      name: 'Declaração eletrônica de porte de valores (e-DBV)',
      url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/viagens-internacionais',
      publisher: 'Receita Federal',
    },
  ],

  replaces: [
    '/pt/dolar-real-iof-cartao-credito-3-38',
    '/pt/dolar-real-iof-remessa-exterior-1-1',
    '/pt/euro-real-viagem-europa-iof-cambio',
    '/pt/imposto-importacao-compras-internacionais-remessa-conforme-20-60',
  ],

  lastReviewed: '2026-07-28',
};
