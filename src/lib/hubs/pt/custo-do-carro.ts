import type { HubData } from '../types';
import { IPVA_PR_ALIQUOTAS, IPVA_SC_ALIQUOTAS } from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Quanto me custa o carro por mês, de verdade?"
 *
 * Absorve 10 calculadoras soltas de veículos (abastecimento, viagem, IPVA de
 * três estados, CDC, consórcio e leasing). As alíquotas de PR e SC saem de
 * src/lib/data/brasil-2026.ts. As de SP NÃO estão nesse arquivo: vêm da fórmula
 * antiga (Lei estadual 13.296/2008) e ficam editáveis pelo campo "alíquota
 * manual", porque o IPVA é estadual e cada UF publica a sua.
 *
 * Preços de combustível e custos de seguro/manutenção são campos editáveis: não
 * há série oficial embutida no projeto e inventar média nacional seria mentira.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. Preços de combustível, tabela FIPE, alíquotas estaduais e taxas de financiamento mudam o tempo todo; confirme na ANP, na SEFAZ do seu estado e no contrato antes de decidir.';

/**
 * Alíquotas do IPVA de São Paulo — Lei estadual 13.296/2008, art. 9º.
 * ATENÇÃO: a lei prevê 3% para veículos destinados a locação e aluguel, não
 * para "utilitário" (a fórmula antiga rotulava essa faixa de forma incorreta).
 */
export const IPVA_SP_ALIQUOTAS: Record<string, number> = {
  auto: 4,
  moto: 2,
  caminhao: 1.5,
  onibus: 1,
  locadora: 3,
};

export const IPVA_PR = IPVA_PR_ALIQUOTAS;
export const IPVA_SC = IPVA_SC_ALIQUOTAS;

/** Número de cotas do IPVA aceito por estado (calendário anual da SEFAZ). */
export const IPVA_PARCELAS: Record<string, number> = { sp: 3, pr: 6, sc: 3, outro: 3 };

/**
 * IOF do crédito a pessoa física — Decreto 6.306/2007, art. 7º:
 * 0,0082% ao dia sobre o principal (limitado a 365 dias) + adicional de 0,38%.
 */
export const IOF = { diario: 0.000082, adicional: 0.0038, diasMax: 365 };

/**
 * Regra dos 70%: o etanol rende cerca de 70% do que rende a gasolina no mesmo
 * motor flex. É uma referência de engenharia, não uma norma — por isso o hub
 * aceita o consumo real de cada combustível e ignora a regra quando você informa.
 */
export const RENDIMENTO_ETANOL = 0.7;

export const hub: HubData = {
  slug: 'pt/veiculos/custo-do-carro',
  title: 'Quanto custa ter um carro por mês: combustível, IPVA e financiamento',
  description:
    'Some tudo o que o carro tira do seu bolso: combustível (álcool ou gasolina pela regra dos 70%), IPVA de SP, PR e SC sobre a tabela FIPE, seguro, manutenção, depreciação e a parcela do CDC, do consórcio ou do leasing.',
  silo: 'Veículos',
  siloHref: '/pt/veiculos',
  locale: 'pt',

  eyebrow: 'Brasil · veículos · custo de propriedade',
  h1: 'Quanto o carro custa por mês, de verdade.',
  lede:
    'A parcela não é o custo do carro. O custo é a parcela mais o combustível, mais o IPVA rateado por doze, mais o seguro, a manutenção e a depreciação — que ninguém vê sair da conta mas some do seu patrimônio todo mês. Esta conta junta as quatro decisões: abastecer, viajar, pagar o IPVA e escolher entre CDC, consórcio, leasing ou dinheiro à vista.',
  stamps: [
    'IPVA: Lei 13.296/2008 (SP) · alíquotas 2026 de PR e SC',
    'IOF do crédito: Decreto 6.306/2007, art. 7º',
    '10 calculadoras dentro',
  ],

  resultLabel: 'Custo do carro no mês',

  cases: {
    title: 'O que você quer resolver agora?',
    intro:
      'O carro tem quatro contas diferentes e quase ninguém faz as quatro. Escolha por onde começar — os campos são os mesmos, muda o que entra na conta.',
    items: [
      {
        id: 'mensal',
        label: 'O custo total por mês',
        hint: 'Combustível + IPVA + seguro + manutenção + depreciação + parcela',
        answer:
          'O custo real do carro é a soma de seis itens, e a parcela costuma ser só o terceiro maior.',
        yes: [
          'Combustível pelo consumo real (km/l) e pelo preço que você paga no posto',
          'IPVA anual dividido por 12, com a alíquota do seu estado sobre o valor FIPE',
          'Seguro e manutenção anuais rateados por mês',
          'Depreciação: a perda de valor do carro, que não sai da conta mas sai do patrimônio',
          'Parcela do financiamento, do consórcio ou do leasing, se houver',
          'Custo por quilômetro rodado, que é o número que permite comparar com aplicativo ou aluguel',
        ],
        warn: [
          AVISO_LEGAL,
          'A depreciação é uma estimativa sua: carros populares perdem menos por ano do que importados e o primeiro ano é sempre o pior',
          'Estacionamento, lavagem, pedágio urbano e multas não entram aqui — some à parte se forem constantes',
        ],
        plazo:
          'o IPVA vence conforme o calendário anual da SEFAZ do seu estado, quase sempre nos três primeiros meses e escalonado pelo final da placa.',
      },
      {
        id: 'abastecer',
        label: 'Álcool ou gasolina?',
        hint: 'Regra dos 70% ou consumo real',
        answer:
          'Se o litro do álcool custa menos de 70% do da gasolina, compensa o álcool — mas o consumo real do seu carro manda mais que a regra.',
        yes: [
          'Comparação do preço do álcool contra 70% do preço da gasolina',
          'Custo por quilômetro de cada combustível quando você informa o consumo real dos dois',
          'Economia percentual medida sobre a opção mais cara (é assim que se mede economia)',
          'Gasto mensal de combustível com a opção escolhida',
        ],
        warn: [
          AVISO_LEGAL,
          'A regra dos 70% é uma média de motores flex, não uma lei: motores turbo e carros com injeção calibrada para etanol chegam a 75%',
          'Ar-condicionado, pneu murcho e trânsito pesado mudam o consumo mais do que a diferença entre os dois combustíveis',
        ],
        plazo:
          'os preços de bomba são pesquisados semanalmente pela ANP; vale conferir antes de encher o tanque, não uma vez por ano.',
      },
      {
        id: 'viagem',
        label: 'Quanto vai custar essa viagem?',
        hint: 'Combustível + pedágio, ida e volta, dividido entre os passageiros',
        answer:
          'Distância dividida pelo consumo dá os litros; litros vezes o preço mais o pedágio dá o custo do trecho.',
        yes: [
          'Litros necessários = distância ÷ consumo em km/l',
          'Pedágios do trecho, dobrados se for ida e volta',
          'Custo por quilômetro e custo por pessoa quando o rateio é dividido',
          'Comparação com o custo total por km do carro (não só o combustível)',
        ],
        warn: [
          AVISO_LEGAL,
          'Na estrada o consumo costuma ser melhor que na cidade: use o km/l de estrada, não a média do computador de bordo',
          'O rateio entre passageiros é caronagem, não transporte remunerado — cobrar acima do custo muda a natureza jurídica da viagem',
        ],
        plazo:
          'as tarifas de pedágio das concessionárias são reajustadas anualmente na data-base de cada contrato.',
      },
      {
        id: 'ipva',
        label: 'Quanto é o meu IPVA?',
        hint: 'SP, PR, SC ou alíquota manual do seu estado',
        answer:
          'IPVA = valor venal do veículo (tabela FIPE) × alíquota do estado onde o carro está emplacado.',
        yes: [
          'Base de cálculo: o valor venal do veículo, que os estados publicam a partir da tabela FIPE',
          'Alíquota por tipo de veículo: SP 4% para autos, PR 1,9% e SC 2%',
          'Parcelamento conforme o calendário do estado e desconto de cota única quando existe',
          'Comparação do que o mesmo carro pagaria nos três estados',
        ],
        warn: [
          AVISO_LEGAL,
          'O IPVA é imposto estadual: cada UF define a sua alíquota, o seu desconto e o seu calendário — para estados fora de SP, PR e SC informe a alíquota na mão',
          'O desconto de cota única não é fixo nem garantido todo ano; confira o calendário da SEFAZ antes de contar com ele',
          'Carro comprado no meio do ano paga IPVA proporcional aos meses restantes, e a dívida acompanha o veículo, não o dono',
        ],
        plazo:
          'os vencimentos são escalonados pelo final da placa, em geral entre janeiro e abril; atraso gera multa e impede o licenciamento.',
      },
      {
        id: 'financiar',
        label: 'Financiar, consórcio, leasing ou à vista?',
        hint: 'CDC com IOF e CET · consórcio com taxa de administração · leasing com VRG',
        answer:
          'O CDC entrega o carro hoje e cobra juros; o consórcio não cobra juros mas cobra administração e faz esperar; à vista custa o preço e o rendimento que o dinheiro deixaria de render.',
        yes: [
          'Parcela do CDC pela Tabela Price sobre o valor financiado mais o IOF',
          'IOF do crédito pessoa física: 0,0082% ao dia até 365 dias + 0,38% (Decreto 6.306/2007)',
          'CET anual efetivo, calculado sobre o dinheiro que você realmente recebeu',
          'Consórcio: valor do bem × (1 + taxa de administração + fundo de reserva), dividido pelo prazo',
          'Leasing: parcelas sobre o valor menos o VRG, com o VRG a pagar no fim',
          'Comparação em valor presente das quatro opções, descontadas pela taxa da sua aplicação — totais nominais de fluxos com prazos diferentes não são comparáveis',
        ],
        warn: [
          AVISO_LEGAL,
          'No consórcio você não tem o carro no dia da assinatura: depende de sorteio ou de lance, e a carta é reajustada pelo valor do bem todo ano',
          'No leasing o bem é do arrendador até a quitação do VRG — o carro não é seu e não entra no seu patrimônio',
          'Compare sempre o custo total somando a entrada, e não só a parcela: prazo maior sempre baixa a parcela e sempre aumenta o total. E compare em valor presente, porque o consórcio empurra o desembolso para a frente',
        ],
        plazo:
          'no crédito consignado ou com garantia do próprio veículo (alienação fiduciária), o atraso permite a busca e apreensão pelo Decreto-Lei 911/1969 após a notificação.',
      },
    ],
  },

  inputsTitle: 'Os números do seu carro',
  inputsIntro:
    'Preencha o que você sabe. Cada caso usa só os campos que precisa — os outros ficam de fora da conta.',

  fields: [
    { id: 'kmMes', label: 'Quilômetros rodados por mês', type: 'number', value: 1000, suffix: 'km', min: 0, step: 50 },
    { id: 'consumo', label: 'Consumo com gasolina', type: 'number', value: 11, suffix: 'km/l', min: 0, step: 0.1, help: 'O do seu uso real, não o do fabricante.' },
    { id: 'consumoAlcool', label: 'Consumo com álcool (0 = usar a regra dos 70%)', type: 'number', value: 0, suffix: 'km/l', min: 0, step: 0.1, help: 'Se você mediu o km/l no etanol, informe: a conta passa a usar o número real em vez da média de 70%.' },
    { id: 'precoGasolina', label: 'Preço do litro da gasolina', type: 'number', value: 6.09, prefix: 'R$', min: 0, step: 0.01, help: 'O do posto onde você abastece. A ANP publica a pesquisa semanal por município.' },
    { id: 'precoAlcool', label: 'Preço do litro do álcool', type: 'number', value: 4.19, prefix: 'R$', min: 0, step: 0.01 },
    {
      id: 'combustivel',
      label: 'Com o que você abastece',
      type: 'select',
      value: 'melhor',
      options: [
        { value: 'melhor', label: 'O que sair mais barato por km' },
        { value: 'gasolina', label: 'Sempre gasolina' },
        { value: 'alcool', label: 'Sempre álcool' },
      ],
    },
    { id: 'valorFipe', label: 'Valor do veículo na tabela FIPE', value: '60.000', prefix: 'R$', thousands: true, help: 'Base de cálculo do IPVA e da depreciação. Consulte em fipe.org.br.' },
    {
      id: 'estado',
      label: 'Estado onde o carro está emplacado',
      type: 'select',
      value: 'sp',
      options: [
        { value: 'sp', label: 'São Paulo' },
        { value: 'pr', label: 'Paraná' },
        { value: 'sc', label: 'Santa Catarina' },
        { value: 'outro', label: 'Outro estado (informe a alíquota)' },
      ],
    },
    {
      id: 'tipoVeiculo',
      label: 'Tipo de veículo',
      type: 'select',
      value: 'auto',
      options: [
        { value: 'auto', label: 'Automóvel de passeio' },
        { value: 'moto', label: 'Motocicleta' },
        { value: 'caminhao', label: 'Caminhão / veículo de carga' },
        { value: 'onibus', label: 'Ônibus / micro-ônibus' },
        { value: 'locadora', label: 'Locação / veículo de aluguel' },
      ],
    },
    { id: 'aliquotaManual', label: 'Alíquota do IPVA na mão (0 = usar a tabela do estado)', type: 'number', value: 0, suffix: '%', min: 0, max: 10, step: 0.1, help: 'Obrigatório para estados fora de SP, PR e SC. A alíquota está na lei estadual do IPVA da sua UF.' },
    { id: 'descontoCota', label: 'Desconto de cota única do seu estado', type: 'number', value: 3, suffix: '%', min: 0, max: 30, step: 0.5, help: 'Não é fixo nem existe todo ano: confira o calendário da SEFAZ antes de contar com ele.' },
    { id: 'seguroAno', label: 'Seguro por ano', value: '3.000', prefix: 'R$', thousands: true },
    { id: 'manutencaoAno', label: 'Manutenção, pneus e revisões por ano', value: '2.400', prefix: 'R$', thousands: true },
    { id: 'depreciacaoPct', label: 'Depreciação estimada por ano', type: 'number', value: 10, suffix: '%', min: 0, max: 40, step: 0.5, help: 'Quanto o carro perde de valor por ano. Estimativa sua: o primeiro ano de um zero-km costuma ser bem pior que 10%.' },
    { id: 'parcelaMes', label: 'Parcela que você já paga por mês', value: '0', prefix: 'R$', thousands: true, help: 'Financiamento, consórcio ou leasing em andamento. Zero se o carro está quitado.' },
    { id: 'distanciaKm', label: 'Distância da viagem (só ida)', type: 'number', value: 400, suffix: 'km', min: 0, step: 10 },
    { id: 'pedagios', label: 'Pedágios do trecho (só ida)', type: 'number', value: 45, prefix: 'R$', min: 0, step: 1 },
    {
      id: 'idaVolta',
      label: 'A viagem é',
      type: 'select',
      value: 'sim',
      options: [
        { value: 'sim', label: 'Ida e volta' },
        { value: 'nao', label: 'Só ida' },
      ],
    },
    { id: 'passageiros', label: 'Pessoas dividindo a viagem', type: 'number', value: 1, min: 1, max: 9, step: 1 },
    { id: 'entrada', label: 'Entrada no financiamento', value: '15.000', prefix: 'R$', thousands: true },
    { id: 'prazoMeses', label: 'Prazo', type: 'number', value: 48, suffix: 'meses', min: 1, max: 120, step: 1 },
    { id: 'jurosMes', label: 'Juros do CDC', type: 'number', value: 1.6, suffix: '% a.m.', min: 0, max: 20, step: 0.01, help: 'A taxa do seu banco, não a da propaganda. O BCB publica as médias por instituição.' },
    { id: 'taxaAdm', label: 'Taxa de administração do consórcio', type: 'number', value: 18, suffix: '% total', min: 0, max: 40, step: 0.5 },
    { id: 'fundoReserva', label: 'Fundo de reserva do consórcio', type: 'number', value: 2, suffix: '% total', min: 0, max: 15, step: 0.5 },
    { id: 'vrgPct', label: 'VRG do leasing (valor residual garantido)', type: 'number', value: 30, suffix: '% do bem', min: 0, max: 90, step: 1, help: 'Parte do valor que fica para o fim do contrato. Quanto maior o VRG, menor a parcela e maior o pagamento final.' },
    { id: 'rendimentoAplicacao', label: 'Rendimento da sua aplicação', type: 'number', value: 0.9, suffix: '% a.m.', min: 0, max: 5, step: 0.01, help: 'Usado só para medir o custo de oportunidade de pagar à vista.' },
  ],

  fineprint:
    'Estimativa informativa. Preços de combustível, valor FIPE, alíquotas estaduais e taxas de crédito mudam com frequência — confirme na ANP, na SEFAZ do seu estado e no contrato antes de assinar qualquer coisa.',

  chart: {
    type: 'bars',
    title: 'Para onde vai o dinheiro',
    caption:
      'No custo mensal e na viagem, cada fatia é um item do gasto e a maior é onde o dinheiro some. Nas comparações (álcool contra gasolina, CDC contra consórcio, leasing e à vista) cada fatia é uma alternativa — aqui a maior é a mais cara.',
  },

  breakdownTitle: 'Conta aberta',
  breakdownIntro:
    'Cada linha mostra de onde saiu o número, com a alíquota, a fórmula ou o artigo que a sustenta.',

  faq: [
    {
      q: 'A regra dos 70% ainda vale?',
      a: 'Vale como primeira aproximação. O etanol tem menor poder calorífico que a gasolina, então o mesmo motor flex roda cerca de 70% da distância com um litro de álcool. Se o preço do álcool for menor que 70% do da gasolina, o custo por quilômetro fica menor. Mas o número exato depende do motor: carros com motor turbo e calibração otimizada para etanol chegam perto de 75%, e alguns modelos antigos ficam em 65%. Se você mediu o seu consumo real nos dois combustíveis (tanque cheio, zerar o computador, encher de novo), informe os dois valores e a conta ignora a regra e usa os seus números.',
    },
    {
      q: 'Como eu meço o consumo real do meu carro?',
      a: 'Encha o tanque até o bico desarmar, anote o hodômetro, rode normalmente até o tanque chegar perto da reserva e encha de novo até o bico desarmar no mesmo posto. Divida os quilômetros rodados pelos litros que couberam. Repita em dois ou três tanques e tire a média. O computador de bordo costuma ser otimista em 5% a 10%, porque estima o consumo em vez de medir o combustível efetivamente queimado.',
    },
    {
      q: 'Por que o IPVA de São Paulo é o dobro do Paraná?',
      a: 'Porque o IPVA é imposto estadual e cada estado define a sua alíquota por lei. São Paulo cobra 4% sobre o valor venal de automóveis pela Lei 13.296/2008; o Paraná reduziu a alíquota de automóveis de 3,5% para 1,9% em 2026, a menor do país; Santa Catarina cobra 2%. Como a base de cálculo é a mesma (o valor venal apurado a partir da tabela FIPE), o mesmo carro paga valores muito diferentes só por causa da placa. O que define é o domicílio do proprietário, não onde o carro roda.',
    },
    {
      q: 'Comprei um carro usado com IPVA atrasado. Quem paga?',
      a: 'Você. O IPVA é um tributo que acompanha o veículo (obrigação propter rem): a dívida está vinculada ao bem, não à pessoa que a gerou. Ao transferir a propriedade você herda o débito, e sem quitá-lo não consegue licenciar. Antes de fechar qualquer compra de usado, consulte a situação do veículo no Detran e na SEFAZ do estado de emplacamento e desconte do preço qualquer débito aberto — IPVA, licenciamento, multas e DPVAT de anos anteriores.',
    },
    {
      q: 'Vale mais a pena consórcio ou financiamento?',
      a: 'Depende de quando você precisa do carro. No total pago, o consórcio quase sempre sai mais barato: não há juros, só a taxa de administração (algo entre 15% e 25% do valor do bem, diluída no prazo) e o fundo de reserva. O financiamento cobra juros compostos, que em 48 ou 60 meses somam muito mais que isso. A contrapartida é que no consórcio você só recebe o carro quando for contemplado por sorteio ou lance — pode ser no primeiro mês ou no último. Se você precisa do carro agora e não tem como esperar, está pagando os juros do CDC pela pressa; se pode esperar, o consórcio funciona como uma poupança forçada com custo menor.',
    },
    {
      q: 'O que é CET e por que ele é maior que a taxa de juros?',
      a: 'CET é o Custo Efetivo Total: a taxa que iguala o dinheiro que você realmente recebeu ao fluxo de todas as parcelas. Ela é maior que a taxa nominal de juros porque incorpora tudo o que o contrato cobra além dos juros — IOF, tarifa de cadastro, registro do contrato, seguro prestamista quando embutido. O Banco Central obriga a informar o CET antes da contratação (Resolução 3.517/2007), e é ele, não a taxa mensal da vitrine, que permite comparar propostas de bancos diferentes.',
    },
    {
      q: 'Quanto de IOF eu pago num financiamento de veículo?',
      a: 'Para pessoa física, o Decreto 6.306/2007 prevê 0,0082% ao dia sobre o valor financiado, limitado a 365 dias, mais um adicional fixo de 0,38%. Na prática, qualquer contrato de um ano ou mais paga o teto: cerca de 3,37% do valor financiado. Contratos curtos pagam proporcionalmente menos — em seis meses o IOF fica perto de 1,86%. O IOF costuma ser financiado junto, o que significa que você paga juros sobre ele também.',
    },
    {
      q: 'Leasing vale a pena para pessoa física?',
      a: 'Raramente. O leasing (arrendamento mercantil) foi desenhado para empresa: a parcela pode ser lançada como despesa operacional e reduz a base do IRPJ e da CSLL no lucro real. Para pessoa física esse benefício não existe, e você acumula um contrato em que o carro pertence ao arrendador até a quitação do valor residual garantido. Some-se a isso que a antecipação do VRG diluída nas parcelas descaracteriza o contrato como leasing puro, tema que já rendeu muita discussão judicial. Para uso pessoal, CDC ou consórcio costumam resolver melhor.',
    },
    {
      q: 'Faz sentido pagar o carro à vista se eu tenho o dinheiro aplicado?',
      a: 'Faz, quase sempre. A comparação correta é entre a taxa do financiamento e o rendimento líquido da sua aplicação, já descontado o imposto de renda. Se o CDC cobra 1,6% ao mês e a sua aplicação rende 0,9% ao mês antes do IR, pagar à vista economiza a diferença todo mês. O financiamento só ganha quando a taxa efetiva é menor que o rendimento líquido — o que acontece em promoções de taxa zero de montadora, e nesses casos vale conferir se o desconto oferecido no pagamento à vista não é maior que os juros que você economizaria.',
    },
    {
      q: 'Por que a depreciação entra num custo que eu não pago?',
      a: 'Porque ela é o maior custo de um carro nos primeiros anos e é invisível. Um veículo de R$ 60.000 que perde 10% ao ano custa R$ 500 por mês de patrimônio, mais que o IPVA e às vezes mais que o combustível. Você só sente quando vai vender. Ignorar a depreciação é o que faz muita gente concluir que "o carro só me custa a gasolina" e comparar errado com aplicativo, aluguel por assinatura ou transporte público.',
    },
    {
      q: 'Como comparo o meu carro com aplicativo ou carro por assinatura?',
      a: 'Pelo custo por quilômetro total, não pelo custo do combustível. Pegue o custo mensal completo desta conta e divida pelos quilômetros que você roda por mês. Se der R$ 2,50 por km e a corrida de aplicativo sai a R$ 3,00 por km, o carro ganha — desde que você continue rodando essa quilometragem. Quem roda pouco quase sempre perde com carro próprio, porque IPVA, seguro e depreciação são custos fixos que não caem quando o carro fica parado na garagem.',
    },
    {
      q: 'Meu carro está no estado A e eu moro no estado B. Onde pago o IPVA?',
      a: 'No estado do domicílio do proprietário, que é onde o veículo deve estar registrado. Emplacar em outro estado só para pagar alíquota menor caracteriza domicílio fiscal simulado e as SEFAZ autuam, cobrando a diferença com multa e juros — a Lei 13.296/2008 de São Paulo, por exemplo, prevê expressamente a cobrança quando o veículo circula habitualmente no estado. Se você mudou de estado de verdade, transfira o registro; o IPVA passa a ser do novo estado a partir do exercício seguinte.',
    },
  ],

  sources: [
    {
      name: 'Lei estadual 13.296/2008 — IPVA de São Paulo (alíquotas do art. 9º)',
      url: 'https://legislacao.fazenda.sp.gov.br/Paginas/lei13296.aspx',
      publisher: 'SEFAZ-SP',
    },
    {
      name: 'IPVA 2026 no Paraná — alíquota de automóveis reduzida para 1,9%',
      url: 'https://www.detran.pr.gov.br/Noticia/Com-reducao-de-45-Parana-tera-menor-aliquota-de-IPVA-do-Brasil-em-2026',
      publisher: 'DETRAN-PR / Governo do Paraná',
    },
    {
      name: 'IPVA — Secretaria de Estado da Fazenda de Santa Catarina',
      url: 'https://www.sef.sc.gov.br/servicos/servico/25/IPVA',
      publisher: 'SEF-SC',
    },
    {
      name: 'Decreto 6.306/2007 — Regulamento do IOF (art. 7º, crédito a pessoa física)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Resolução CMN 3.517/2007 — informação obrigatória do Custo Efetivo Total',
      url: 'https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o&numero=3517',
      publisher: 'Banco Central do Brasil',
    },
    {
      name: 'Levantamento semanal de preços de combustíveis',
      url: 'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos',
      publisher: 'ANP — Agência Nacional do Petróleo',
    },
    {
      name: 'Tabela FIPE — preço médio de veículos',
      url: 'https://veiculos.fipe.org.br/',
      publisher: 'Fundação Instituto de Pesquisas Econômicas',
    },
    {
      name: 'Lei 11.649/2008 e Decreto-Lei 911/1969 — arrendamento mercantil e alienação fiduciária',
      url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del0911.htm',
      publisher: 'Presidência da República',
    },
  ],

  replaces: [
    '/pt/alcool-ou-gasolina-vale-a-pena-regra-70-porcento',
    '/pt/custo-viagem-combustivel-km-litro',
    '/pt/ipva-sao-paulo-tabela-4-porcento-autos',
    '/pt/ipva-parana-1-9-porcento-autos',
    '/pt/ipva-santa-catarina-2-porcento-autos',
    '/pt/calculadora-financiamento-veiculo-cdc-banco',
    '/pt/consorcio-parcela-taxa-administracao-vs-financiamento',
    '/pt/leasing-versus-financiamento-auto',
    // Absorvidas só por URL (301): são consultas de trânsito e de carga, não
    // entram no custo mensal do carro. Ver relatório.
    '/pt/pontos-cnh-suspensao-ctb-limite-12-meses',
    '/pt/capacidade-carga-pickup-peso-util',
  ],

  lastReviewed: '2026-07-28',
};
