import type { HubData } from '../types';

/**
 * Hub de decisão BR — "Alugar um imóvel: quanto custa entrar, ficar e sair antes da hora?"
 *
 * Absorve 6 calculadoras soltas de locação. Base legal: Lei 8.245/1991 (Lei do
 * Inquilinato) — arts. 4º (multa proporcional), 37 e 38 (garantias), 46 e 47
 * (prazo), 62 (purga da mora) — e art. 85 §2º do CPC (honorários).
 *
 * ⚠️ Auditoria das fórmulas antigas: várias eram fórmulas ARGENTINAS reaproveitadas
 * no mercado BR (depósito de 1 mês da Ley de Alquileres, contrato de 2 vs 3 anos com
 * índice ICL, expensas de $1.500–3.500 por m² em pesos). Aqui tudo foi refeito com a
 * Lei 8.245/1991. O valor do condomínio por m² NÃO tem fonte oficial nacional: é
 * campo editável.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. As normas, as tabelas e os valores de mercado podem mudar; leia o seu contrato, confira a convenção do condomínio e consulte um advogado antes de assinar, rescindir ou entrar com uma ação.';

/** Lei 8.245/1991, art. 38 §2º: a caução em dinheiro não pode passar de 3 aluguéis. */
export const CAUCAO_MAX_ALUGUEIS = 3;

/** Lei 8.245/1991, art. 46: contrato escrito de 30 meses ou mais termina no prazo, sem ação. */
export const PRAZO_DENUNCIA_VAZIA_MESES = 30;

/** Lei 8.245/1991, art. 62, II, "d": honorários de 10% para purgar a mora. */
export const HONORARIOS_PURGA = 0.1;

/** Lei 8.245/1991, art. 58, II: o valor da causa do despejo é o de 12 meses de aluguel. */
export const MESES_VALOR_CAUSA = 12;

/** Art. 85 §2º do CPC: honorários de sucumbência de 10% a 20% do valor da causa. */
export const HONORARIOS_SUCUMBENCIA = { min: 0.1, max: 0.2 };

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/dinheiro/alugar-um-imovel',
  title: 'Alugar um imóvel: quanto custa entrar, ficar e sair antes?',
  description:
    'Calcule o custo real do aluguel: entrada com caução, fiador ou seguro-fiança, aluguel + condomínio por mês, multa proporcional por sair antes do prazo (art. 4º da Lei 8.245/1991) e quanto custa purgar a mora num despejo.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · Lei do Inquilinato · locação residencial',
  h1: 'Alugar: quanto custa entrar, ficar e sair antes da hora?',
  lede:
    'Alugar tem três contas diferentes e quase ninguém faz as três: o que sai do bolso para entrar, o que sai todo mês e o que custa sair antes do fim do contrato. Informe o aluguel, o prazo e o tempo já cumprido: a conta aplica a multa proporcional do art. 4º da Lei 8.245/1991, mostra o teto legal da caução e estima o custo de um despejo por falta de pagamento.',
  stamps: [
    'Lei 8.245/1991 (Lei do Inquilinato) — arts. 4º, 38, 46, 47, 58 e 62',
    `Caução em dinheiro limitada a ${CAUCAO_MAX_ALUGUEIS} aluguéis (art. 38 §2º)`,
    '6 calculadoras dentro',
  ],

  resultLabel: 'Valor da sua situação',

  cases: {
    title: 'Em que ponto da locação você está?',
    intro:
      'A mesma casa e o mesmo aluguel dão contas bem diferentes conforme o momento: assinar, escolher o prazo, sair antes, brigar por falta de pagamento ou comprar o imóvel que você já aluga.',
    items: [
      {
        id: 'entrar',
        label: 'Vou alugar agora: quanto preciso ter na mão?',
        hint: 'Primeiro aluguel + condomínio + garantia',
        answer:
          'Para entrar você junta o primeiro aluguel, o condomínio do mês e a garantia — que na caução em dinheiro pode chegar a 3 aluguéis, o teto do art. 38 §2º.',
        yes: [
          'Primeiro aluguel do mês de entrada',
          'Taxa de condomínio do mês, estimada pela metragem da unidade',
          'Garantia escolhida: caução em dinheiro (até 3 aluguéis), fiador (sem desembolso) ou seguro-fiança (prêmio anual)',
          'O IPTU, quando o contrato repassa o imposto ao locatário',
        ],
        warn: [
          AVISO_LEGAL,
          'O art. 37, parágrafo único, da Lei 8.245/1991 proíbe exigir MAIS DE UMA modalidade de garantia no mesmo contrato: ou caução, ou fiador, ou seguro-fiança, ou cessão de quotas de fundo — nunca duas juntas',
          'A caução em dinheiro tem que ser depositada em caderneta de poupança e devolvida com o rendimento (art. 38 §2º); "depósito na conta do dono" sem poupança é irregular',
          'Não existe no Brasil o limite de 1 mês de depósito: esse teto é de outro país e aparecia por engano na calculadora antiga',
        ],
        plazo:
          'a vistoria de entrada, com fotos e laudo assinado pelas duas partes, é o que evita cobrança de danos na saída. Faça antes de receber as chaves.',
      },
      {
        id: 'prazo',
        label: 'Que prazo de contrato me convém?',
        hint: '30 meses ou mais (art. 46) vs prazo menor (art. 47)',
        answer:
          'Contrato escrito de 30 meses ou mais acaba no dia marcado e o locador retoma o imóvel sem justificar nada; abaixo de 30 meses a retomada exige um dos motivos do art. 47.',
        yes: [
          'Custo total do contrato: aluguel + condomínio multiplicados pelo prazo escolhido',
          'Comparação do prazo informado com os 30 meses do art. 46',
          'Reajuste anual pelo índice do contrato (IGP-M, IPCA ou outro pactuado) — a lei proíbe reajuste em prazo inferior a 12 meses',
        ],
        warn: [
          AVISO_LEGAL,
          'Ao fim de um contrato de 30 meses ou mais, o locador tem 30 dias para pedir o imóvel; se deixar passar, o contrato prorroga por prazo indeterminado e a retomada volta a exigir aviso de 30 dias',
          'Em contrato abaixo de 30 meses que vira indeterminado, o locador só retoma pelos motivos do art. 47 (uso próprio, obras, venda etc.) ou após 5 anos ininterruptos de locação',
          'A calculadora antiga comparava "2 anos vs 3 anos" com índice de reajuste de outro país — no Brasil o divisor legal é 30 meses, não 2 ou 3 anos',
        ],
        plazo:
          'o reajuste só pode ser anual (Lei 9.069/1995 e Lei 10.192/2001). Cláusula de reajuste semestral é nula.',
      },
      {
        id: 'sair',
        label: 'Quero sair antes do fim do contrato',
        hint: 'Multa proporcional ao que falta — art. 4º',
        answer:
          'A multa não é cheia: ela cai na proporção do tempo que você já cumpriu. Quem já morou 24 dos 30 meses paga só 1/5 da multa contratual.',
        yes: [
          'Multa contratual (geralmente 3 aluguéis) reduzida proporcionalmente aos meses que faltam',
          'Quanto a proporcionalidade economiza em relação à multa cheia',
          'Aluguel e condomínio do mês da saída, que continuam devidos até a entrega das chaves',
        ],
        warn: [
          AVISO_LEGAL,
          'O art. 4º, parágrafo único, DISPENSA a multa quando a saída decorre de transferência do emprego para outra localidade, desde que você avise o locador por escrito com 30 dias de antecedência — leve o documento da empresa',
          'A multa por saída antecipada não se confunde com a multa moratória por atraso: são coisas distintas e podem ser cobradas juntas',
          'Danos apurados na vistoria de saída são descontados da caução; guarde a vistoria de entrada para comparar',
        ],
        plazo:
          'entregue as chaves com recibo datado: a partir da entrega param de correr aluguel e condomínio, mesmo que a rescisão ainda não esteja formalizada.',
      },
      {
        id: 'despejo',
        label: 'Estou atrasado (ou vou cobrar um atraso)',
        hint: 'Purga da mora, valor da causa e honorários',
        answer:
          'Para evitar o despejo, o inquilino pode purgar a mora pagando tudo que deve mais 10% de honorários — mas só uma vez a cada 24 meses (art. 62 da Lei 8.245/1991).',
        yes: [
          'Dívida acumulada: aluguel + condomínio dos meses em atraso',
          'Multa moratória do contrato sobre o débito',
          'Honorários de 10% para purgar a mora (art. 62, II, "d")',
          'Valor da causa da ação de despejo: 12 meses de aluguel (art. 58, II)',
          'Faixa de honorários de sucumbência de 10% a 20% do valor da causa (art. 85 §2º do CPC)',
        ],
        warn: [
          AVISO_LEGAL,
          'A purga da mora só pode ser usada uma vez a cada 24 meses (art. 62, parágrafo único): a segunda vez no período não impede o despejo',
          'No despejo por falta de pagamento cabe liminar de desocupação em 15 dias mediante caução de 3 aluguéis (art. 59 §1º, IX)',
          'O prazo de tramitação varia muito por comarca e não é previsível pela lei: qualquer estimativa de "meses até a desocupação" é referência de mercado, não regra jurídica',
          'A calculadora antiga trazia prazos e honorários de outro sistema judicial — os números aqui saem da Lei 8.245/1991 e do CPC brasileiro',
        ],
        plazo:
          'o inquilino citado tem 15 dias para contestar ou purgar a mora depositando o valor integral em juízo.',
      },
      {
        id: 'opcao_compra',
        label: 'Alugo com opção de compra',
        hint: 'Quanto do aluguel vira entrada',
        answer:
          'Só a fração pactuada do aluguel entra no preço. Com 30% descontáveis, três anos de aluguel viram pouco mais de um décimo de um imóvel médio.',
        yes: [
          'Total pago de aluguel no prazo do contrato',
          'Parte creditada no preço do imóvel, conforme o percentual pactuado',
          'Quanto ainda falta para chegar ao valor do imóvel',
          'Percentual do imóvel já coberto pelos créditos',
        ],
        warn: [
          AVISO_LEGAL,
          'Não existe percentual legal: o "aluguel com opção de compra" é contrato atípico e tudo — percentual, prazo, preço travado, correção — depende do que estiver escrito',
          'Registre a promessa de compra e venda na matrícula do imóvel (art. 1.417 do Código Civil): sem registro, você não tem direito real de aquisição contra terceiros',
          'Peça certidões do vendedor e do imóvel antes de começar a acumular crédito: se o imóvel for penhorado, o crédito acumulado vira briga judicial',
        ],
        plazo:
          'o direito de preferência do inquilino na venda do imóvel (art. 27) é de 30 dias para responder à notificação do locador.',
      },
    ],
  },

  inputsTitle: 'Os números do seu contrato',
  inputsIntro:
    'Preencha o que você tem em mãos. Cada situação usa só os campos que lhe interessam, então não se preocupe se algum não se aplicar ao seu caso.',
  fields: [
    {
      id: 'aluguel',
      label: 'Aluguel mensal (R$)',
      prefix: 'R$',
      value: '2.000',
      thousands: true,
      help: 'O valor do aluguel puro, sem condomínio e sem IPTU. É a base da caução, da multa e do valor da causa.',
    },
    {
      id: 'm2',
      label: 'Área privativa do imóvel (m²)',
      type: 'number',
      value: 70,
      min: 0,
      step: 1,
      help: 'A metragem que consta na matrícula. Serve para estimar a taxa de condomínio quando você ainda não tem o boleto.',
    },
    {
      id: 'condominioM2',
      label: 'Condomínio por m² (R$/m² por mês)',
      prefix: 'R$',
      type: 'number',
      value: 12,
      min: 0,
      step: 0.5,
      help: 'Não existe tabela oficial: varia de prédio para prédio. Pegue o último boleto e divida pela área privativa. Prédios sem elevador e sem lazer costumam ficar abaixo; torres com piscina, academia e portaria 24h, bem acima.',
    },
    {
      id: 'prazoMeses',
      label: 'Prazo total do contrato (meses)',
      type: 'number',
      value: 30,
      min: 1,
      max: 360,
      step: 1,
      help: 'Trinta meses ou mais é o divisor legal do art. 46: acima disso, o contrato termina no prazo sem precisar de ação judicial.',
    },
    {
      id: 'mesesCumpridos',
      label: 'Meses já cumpridos',
      type: 'number',
      value: 12,
      min: 0,
      max: 360,
      step: 1,
      help: 'Quantos meses você já morou. Quanto maior, menor a multa proporcional por sair antes.',
    },
    {
      id: 'multaMeses',
      label: 'Multa contratual (em nº de aluguéis)',
      type: 'number',
      value: 3,
      min: 0,
      max: 12,
      step: 1,
      help: 'Está escrita no contrato. Três aluguéis é a praxe do mercado, mas não é obrigação legal: confira a sua cláusula.',
    },
    {
      id: 'garantia',
      label: 'Garantia exigida no contrato',
      type: 'select',
      value: 'caucao',
      options: [
        { value: 'caucao', label: 'Caução em dinheiro (até 3 aluguéis)' },
        { value: 'fiador', label: 'Fiador' },
        { value: 'seguro', label: 'Seguro-fiança' },
        { value: 'nenhuma', label: 'Sem garantia' },
      ],
      help: 'Art. 37 da Lei 8.245/1991. O locador só pode exigir UMA delas. O seguro-fiança costuma custar de 1 a 2 aluguéis por ano de prêmio.',
    },
    {
      id: 'seguroPremioAlugueis',
      label: 'Prêmio anual do seguro-fiança (em nº de aluguéis)',
      type: 'number',
      value: 1.5,
      min: 0,
      max: 5,
      step: 0.1,
      help: 'Preço de mercado, não regulado: peça a cotação da seguradora. Costuma ficar entre 1 e 2 aluguéis por ano, e não volta para você no fim.',
    },
    {
      id: 'mesesAtraso',
      label: 'Meses em atraso (para o cenário de despejo)',
      type: 'number',
      value: 3,
      min: 0,
      max: 60,
      step: 1,
      help: 'Quantos meses de aluguel + condomínio estão vencidos e não pagos.',
    },
    {
      id: 'multaMoratoriaPct',
      label: 'Multa moratória do contrato (%)',
      type: 'number',
      value: 10,
      min: 0,
      max: 20,
      step: 1,
      suffix: '%',
      help: 'Percentual cobrado sobre a parcela atrasada. Dez por cento é o mais comum em contratos de locação; confira a sua cláusula.',
    },
    {
      id: 'valorImovel',
      label: 'Valor do imóvel (R$) — só para opção de compra',
      prefix: 'R$',
      value: '300.000',
      thousands: true,
      help: 'Preço travado no contrato de opção de compra. Se houver correção pactuada, use o valor já corrigido.',
    },
    {
      id: 'pctDescontavel',
      label: '% do aluguel creditado no preço',
      type: 'number',
      value: 30,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      help: 'Fração de cada aluguel que vira crédito na compra. Negociado livremente — não há mínimo legal.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'De que é feito esse valor',
    caption:
      'Mostra o peso de cada componente do número principal: quanto é aluguel, quanto é condomínio, quanto é garantia, multa ou honorários. Serve para ver o que dá para negociar e o que é fixo.',
  },
  breakdownTitle: 'A conta, linha por linha',
  breakdownIntro:
    'Cada linha traz o artigo da Lei 8.245/1991 ou do CPC que a sustenta. Compare com o seu contrato: cláusula que contraria a lei é nula, mesmo assinada.',

  faq: [
    {
      q: 'Qual é o valor máximo da caução no aluguel?',
      a: `Três aluguéis, quando a caução é em dinheiro — é o teto do art. 38 §2º da Lei 8.245/1991. Além disso, esse dinheiro tem de ser depositado em caderneta de poupança e devolvido ao inquilino no fim do contrato com o rendimento, descontados apenas os danos comprovados. Se a caução for em bens móveis ou imóveis, o art. 38 §1º exige averbação na matrícula. Atenção: a calculadora antiga desta seção mostrava um teto de 1 mês, regra de outro país. No Brasil o limite é ${CAUCAO_MAX_ALUGUEIS} aluguéis.`,
    },
    {
      q: 'Como se calcula a multa por sair antes do fim do contrato?',
      a: 'Pela regra do art. 4º da Lei 8.245/1991, a multa é proporcional ao período que ainda falta cumprir. A conta é: multa contratual × (meses restantes ÷ prazo total). Num contrato de 30 meses com multa de 3 aluguéis, quem sai no mês 12 deve 3 × (18÷30) = 1,8 aluguel; quem sai no mês 24 deve 3 × (6÷30) = 0,6 aluguel. A multa cheia só se aplica a quem sai logo no começo.',
    },
    {
      q: 'Em que caso eu saio sem pagar multa nenhuma?',
      a: 'O parágrafo único do art. 4º dispensa a multa quando a saída decorre de transferência do seu emprego, pelo empregador, para outra localidade. A condição é notificar o locador por escrito com pelo menos 30 dias de antecedência, comprovando a transferência. Fora dessa hipótese legal, só o acordo com o locador afasta a multa — e vale a pena tentar: locador que já tem novo inquilino na fila costuma abrir mão.',
    },
    {
      q: 'Por que 30 meses é o prazo mágico do contrato?',
      a: 'Porque é o divisor do art. 46 da Lei 8.245/1991. Contrato escrito de 30 meses ou mais acaba na data marcada e o locador retoma o imóvel sem precisar justificar (a chamada denúncia vazia). Abaixo de 30 meses, quando o contrato vira por prazo indeterminado, a retomada só é possível pelos motivos do art. 47 — uso próprio, uso de ascendente ou descendente, obras, demolição — ou depois de 5 anos ininterruptos de locação. Por isso quase todo contrato residencial no Brasil é de 30 meses.',
    },
    {
      q: 'O locador pode exigir fiador E caução ao mesmo tempo?',
      a: 'Não. O parágrafo único do art. 37 é expresso: é vedado, sob pena de nulidade, mais de uma modalidade de garantia num mesmo contrato de locação. Ou caução, ou fiança, ou seguro de fiança locatícia, ou cessão fiduciária de quotas de fundo de investimento — uma só. Se o seu contrato exige duas, a segunda é nula e você pode cobrar de volta o que pagou a mais.',
    },
    {
      q: 'Quanto custa purgar a mora e evitar o despejo?',
      a: `Você deposita em juízo o total dos aluguéis e encargos vencidos, com multa e juros do contrato, custas e ${Math.round(HONORARIOS_PURGA * 100)}% de honorários advocatícios — a regra do art. 62, II, "d" da Lei 8.245/1991. Feito isso, a ação de despejo perde o objeto e você fica no imóvel. O limite está no parágrafo único do mesmo artigo: a purga só pode ser usada uma vez a cada 24 meses. Atrasar de novo dentro desse prazo significa despejo sem segunda chance.`,
    },
    {
      q: 'Quanto tempo demora uma ação de despejo?',
      a: 'A lei não fixa prazo de duração, e qualquer número redondo é estimativa de mercado, não regra. O que a lei garante é a liminar: no despejo por falta de pagamento, o art. 59 §1º, IX permite ao locador obter a desocupação em 15 dias prestando caução de três aluguéis. Fora da liminar, o tempo depende inteiramente da comarca, do volume da vara e de eventuais recursos. Pergunte ao seu advogado a média local em vez de confiar num intervalo genérico.',
    },
    {
      q: 'Qual é o valor da causa e os honorários numa ação de despejo?',
      a: `O art. 58, II da Lei 8.245/1991 fixa o valor da causa em ${MESES_VALOR_CAUSA} meses de aluguel. Sobre esse valor incidem os honorários de sucumbência que o juiz arbitra, entre ${Math.round(HONORARIOS_SUCUMBENCIA.min * 100)}% e ${Math.round(HONORARIOS_SUCUMBENCIA.max * 100)}% conforme o art. 85 §2º do CPC, levando em conta o trabalho do advogado, o grau de zelo e a complexidade. Some ainda custas judiciais, que variam por estado, e os honorários contratuais do seu próprio advogado.`,
    },
    {
      q: 'Quanto devo esperar de taxa de condomínio?',
      a: 'Não existe tabela oficial nem índice nacional: a taxa sai do orçamento aprovado em assembleia e é rateada pela fração ideal de cada unidade. Prédios pequenos, sem elevador e sem áreas de lazer, ficam na faixa mais baixa; torres com piscina, academia, salão gourmet e portaria 24 horas, muito acima. Peça ao corretor as três últimas prestações de contas antes de assinar — o valor de hoje diz pouco se o condomínio tiver obra aprovada e cota extra a caminho.',
    },
    {
      q: 'Quem paga IPTU, condomínio e taxa de lixo no aluguel?',
      a: 'Depende do contrato, mas o art. 22 da Lei 8.245/1991 dá o padrão: o locador paga as despesas extraordinárias de condomínio (obras, reformas que aumentem o valor do prédio, fundo de reserva, pintura de fachada) e, salvo cláusula em contrário, os impostos. O art. 23 põe no inquilino as despesas ordinárias (salários da equipe, limpeza, consumo comum, pequenos reparos) e o consumo próprio. Contratos que repassam IPTU ao inquilino são válidos, mas a lista de despesas extraordinárias do art. 22, X não pode ser repassada de jeito nenhum.',
    },
    {
      q: 'Vale a pena aluguel com opção de compra?',
      a: 'Depende quase inteiramente do percentual creditado e do preço travado. Como só a fração pactuada de cada aluguel vira crédito, um contrato de 36 meses com 30% descontáveis sobre um aluguel de R$ 2.500 acumula R$ 27.000 — pouco diante do preço de um imóvel médio. O ponto forte é travar o preço num mercado em alta; o ponto fraco é que o resto do aluguel some. Registre a promessa na matrícula (art. 1.417 do Código Civil) e verifique certidões do vendedor: sem registro, você não é oponível a terceiros.',
    },
    {
      q: 'O inquilino tem preferência se o dono resolver vender?',
      a: 'Sim. O art. 27 da Lei 8.245/1991 obriga o locador a comunicar por escrito ao inquilino as condições da venda, e o inquilino tem 30 dias para aceitar nas mesmas condições. Se o imóvel for vendido sem essa oferta, o inquilino com contrato registrado na matrícula pode, em até 6 meses do registro da venda, depositar o preço e reclamar o imóvel para si (art. 33). Sem registro, resta pedir perdas e danos.',
    },
  ],

  sources: [
    {
      name: 'Lei 8.245/1991 — Lei do Inquilinato (locações de imóveis urbanos)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l8245.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Código de Processo Civil — Lei 13.105/2015, art. 85 (honorários)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Código Civil — Lei 10.406/2002, arts. 1.417 e 1.418 (promessa de compra e venda)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 10.192/2001 — periodicidade mínima anual dos reajustes contratuais',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10192.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Direitos do consumidor em contratos de locação e condomínio',
      url: 'https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor',
      publisher: 'Ministério da Justiça e Segurança Pública',
    },
  ],

  replaces: [
    '/pt/contrato-aluguel-2-anos-vs-3-anos',
    '/pt/depositos-aluguel-quantos-meses-devolucao',
    '/pt/multa-quebra-contrato-aluguel-proporcional',
    '/pt/despejo-causa-prazos-honorarios-processo',
    '/pt/despesas-condominio-m2',
    '/pt/aluguel-com-opcao-de-compra-leasing-imovel',
  ],

  lastReviewed: '2026-07-28',
};
