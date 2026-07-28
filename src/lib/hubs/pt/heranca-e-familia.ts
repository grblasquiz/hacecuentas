import type { HubData } from '../types';
import { ITCMD_SP, UFESP_2026 } from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Herança, divórcio e pensão: quanto custa acertar isso?"
 *
 * Absorve 4 calculadoras soltas. Base legal: Código Civil (Lei 10.406/2002 —
 * sucessão, regimes de bens, alimentos), CPC (Lei 13.105/2015, art. 610 —
 * inventário extrajudicial), Lei 11.441/2007 e Lei 10.705/2000 (ITCMD-SP).
 *
 * ⚠️ O ITCMD é ESTADUAL: a alíquota é campo editável, com padrão de São Paulo
 * (`ITCMD_SP.aliquota` de brasil-2026.ts). Vai de 2% a 8% conforme o estado, e o
 * teto de 8% é o da Resolução 9/1992 do Senado Federal.
 *
 * ⚠️ Auditoria das fórmulas antigas: a de divórcio tinha um PISO de honorários de
 * 1.500.000 em pesos argentinos aplicado a reais, e a de pensão usava a escala
 * jurisprudencial argentina (22/32/40/45% por número de filhos) — no Brasil não
 * existe percentual legal de pensão. Ambas foram refeitas. Detalhes no relatório.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. Alíquotas de ITCMD, custas judiciais e emolumentos de cartório variam por estado e mudam por lei; percentuais de honorários e de pensão são referências de mercado e de jurisprudência, não regras fixas. Consulte um advogado antes de abrir inventário, formalizar divórcio ou acordar alimentos.';

/** ITCMD-SP: alíquota fixa de 4% (Lei 10.705/2000). Padrão editável do hub. */
export const ITCMD_ALIQUOTA_SP = ITCMD_SP.aliquota;

/** Teto constitucional da alíquota do ITCMD — Resolução 9/1992 do Senado Federal. */
export const ITCMD_TETO_SENADO = 0.08;

/** UFESP 2026 e limites de isenção do ITCMD-SP em UFESP. */
export const UFESP = UFESP_2026;
export const ISENCAO_DOACAO_UFESP = ITCMD_SP.isencaoDoacaoUfesp;
export const ISENCAO_HERANCA_UFESP = ITCMD_SP.isencaoHerancaImovelUnicoUfesp;

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/dinheiro/heranca-e-familia',
  title: 'Herança, divórcio e pensão: quanto custa acertar isso?',
  description:
    'Calcule o custo de um inventário extrajudicial ou judicial, o ITCMD sobre herança e doação, a partilha no divórcio conforme o regime de bens e o valor de referência da pensão alimentícia.',
  silo: 'Dinheiro',
  siloHref: '/pt/dinheiro',
  locale: 'pt',

  eyebrow: 'Brasil · sucessões · família · ITCMD',
  h1: 'Herança, divórcio e pensão: quanto custa acertar isso?',
  lede:
    'Todo mundo descobre tarde que transmitir patrimônio tem preço: o ITCMD do estado, os honorários do advogado, os emolumentos do cartório e as custas do fórum. Informe o valor do patrimônio e o número de herdeiros: a conta separa cada bloco, mostra a diferença entre o inventário no cartório e o no fórum, calcula a meação conforme o regime de bens e dá a referência de pensão alimentícia.',
  stamps: [
    `ITCMD editável — padrão São Paulo ${(ITCMD_ALIQUOTA_SP * 100).toFixed(0)}% (Lei 10.705/2000)`,
    'CPC art. 610 · Código Civil arts. 1.658 a 1.688, 1.694 e 1.829',
    '4 calculadoras dentro',
  ],

  resultLabel: 'Custo da sua situação',

  cases: {
    title: 'O que você precisa resolver?',
    intro:
      'Herança, doação, divórcio e pensão são contas diferentes, mas caem quase sempre na mesma família e no mesmo mês. Escolha a sua situação — os campos são compartilhados.',
    items: [
      {
        id: 'inventario_extra',
        label: 'Inventário no cartório (extrajudicial)',
        hint: 'Herdeiros maiores, capazes e de acordo',
        answer:
          'Se todos os herdeiros são maiores, capazes e estão de acordo, e não há testamento, o inventário sai por escritura pública em cartório — mais rápido e mais barato que o judicial.',
        yes: [
          'ITCMD sobre o patrimônio transmitido, na alíquota do seu estado',
          'Honorários advocatícios sobre o valor do espólio (o advogado é obrigatório mesmo no cartório)',
          'Emolumentos da escritura pública de inventário e partilha',
          'Certidões negativas, registros e averbações nas matrículas',
          'Quanto sobra líquido para cada herdeiro',
        ],
        warn: [
          AVISO_LEGAL,
          'O art. 610 do CPC só permite a via extrajudicial se não houver testamento e se todos os interessados forem maiores, capazes e concordes: um herdeiro menor ou uma discordância já obrigam o inventário judicial',
          'A assistência de advogado é obrigatória também na escritura pública (art. 610 §2º do CPC) — não existe inventário sem advogado',
          'O ITCMD é ESTADUAL e varia de 2% a 8%; alguns estados são progressivos. A alíquota deste simulador é editável e vem por padrão com os 4% de São Paulo',
          'Emolumentos de cartório são fixados por lei estadual, na tabela da corregedoria: o valor aqui é estimativa editável',
        ],
        plazo:
          'o inventário deve ser aberto em até 2 meses do óbito (art. 611 do CPC). Passar do prazo gera multa de ITCMD em vários estados — em São Paulo, de 10% a 20% do imposto.',
      },
      {
        id: 'inventario_judicial',
        label: 'Inventário no fórum (judicial)',
        hint: 'Herdeiro menor, testamento ou briga',
        answer:
          'Com herdeiro menor ou incapaz, testamento ou qualquer discordância, o inventário obrigatoriamente vira processo judicial — e entram custas do fórum sobre o valor do espólio.',
        yes: [
          'ITCMD sobre o patrimônio, igual ao extrajudicial',
          'Honorários advocatícios, em regra mais altos pela duração do processo',
          'Custas judiciais e taxa judiciária, calculadas sobre o valor da causa',
          'Certidões e registros',
          'Total e percentual sobre o patrimônio',
        ],
        warn: [
          AVISO_LEGAL,
          'As custas judiciais são fixadas por LEI ESTADUAL e variam muito (em geral um percentual sobre o valor da causa, com pisos e tetos): o percentual aqui é editável, confirme na tabela do tribunal do seu estado',
          'Havendo herdeiro menor, o Ministério Público participa obrigatoriamente e a partilha desigual dificilmente é homologada',
          'A duração média não é definida por lei nenhuma: depende da vara, do acervo e da existência de litígio',
          'Enquanto o inventário não termina, os bens não podem ser vendidos sem alvará judicial — o custo de esperar costuma superar o custo do processo',
        ],
        plazo:
          'mesmo prazo de abertura: 2 meses do óbito (art. 611 do CPC), sob pena de multa estadual sobre o ITCMD.',
      },
      {
        id: 'doacao',
        label: 'Doação em vida',
        hint: 'ITCMD por donatário e adiantamento de legítima',
        answer:
          'Doar em vida antecipa o ITCMD e evita o inventário, mas a doação a filho é adiantamento de legítima e vai ser conferida na herança.',
        yes: [
          'Valor doado a cada donatário (patrimônio dividido pelo número de beneficiários)',
          'Faixa de isenção anual do ITCMD-SP em UFESP, aplicada por doador e por donatário',
          'ITCMD devido por donatário e no total',
          'Emolumentos da escritura de doação e do registro na matrícula',
        ],
        warn: [
          AVISO_LEGAL,
          'A doação de pai para filho é adiantamento da legítima (art. 544 do Código Civil): na abertura da sucessão ela volta para a conta da partilha, por colação, salvo dispensa expressa feita na escritura ou em testamento',
          'Você não pode doar mais da metade do patrimônio se tiver herdeiros necessários (art. 549 — doação inoficiosa é nula no que exceder a metade disponível)',
          'A doação de todos os bens sem reserva do suficiente para a própria subsistência é nula (art. 548): por isso se costuma reservar usufruto vitalício',
          'Em São Paulo a isenção de doação é ANUAL e por par doador-donatário; ultrapassado o limite, o imposto incide sobre o valor total, não só sobre o excedente',
        ],
        plazo:
          'em São Paulo a declaração e o recolhimento do ITCMD sobre doação devem ser feitos antes da lavratura da escritura; sem a guia paga, o tabelião não lavra o ato.',
      },
      {
        id: 'divorcio',
        label: 'Divórcio e partilha de bens',
        hint: 'Meação conforme o regime',
        answer:
          'O que cada um leva depende inteiramente do regime de bens: na comunhão parcial só se divide o que foi adquirido durante a união; na separação total, nada se divide.',
        yes: [
          'Meação de cada cônjuge conforme o regime informado',
          'Patrimônio excluído da partilha (o que cada um já tinha antes, nos regimes que o preservam)',
          'Honorários advocatícios e emolumentos da escritura de divórcio consensual',
          'Custo total de formalizar a separação patrimonial',
        ],
        warn: [
          AVISO_LEGAL,
          'Divórcio consensual em cartório só é possível se não houver filho menor ou incapaz e se não houver nascituro (art. 733 do CPC); com filho menor, é sempre judicial',
          'Na comunhão parcial (regime legal desde 1977, art. 1.658 do Código Civil) ficam FORA da partilha os bens anteriores à união, as heranças e doações recebidas por um só e os bens sub-rogados nesses',
          'Partilha desigual entre os cônjuges pode ser tratada pelo fisco como doação e atrair ITCMD sobre o excesso de meação — planeje isso com o advogado antes de assinar',
          'A calculadora antiga desta seção aplicava um piso de honorários de 1.500.000 em moeda estrangeira, o que distorcia completamente o resultado em reais. Aqui os honorários saem do percentual que você informar',
        ],
        plazo:
          'não há mais prazo de separação prévia nem exigência de motivo desde a EC 66/2010: o divórcio pode ser pedido a qualquer momento.',
      },
      {
        id: 'pensao',
        label: 'Pensão alimentícia para filho',
        hint: 'Não existe percentual legal: é o binômio necessidade × possibilidade',
        answer:
          'Não há percentual fixado em lei. O juiz aplica o binômio do art. 1.694 §1º do Código Civil: o que o filho precisa contra o que o pagante pode.',
        yes: [
          'Valor mensal de referência sobre a renda líquida informada',
          'Valor por filho e valor total',
          'Quanto sobra da renda depois da pensão',
          'Comparação com a faixa de 20% a 30% da renda líquida, a mais vista na prática forense',
        ],
        warn: [
          AVISO_LEGAL,
          'NÃO existe percentual legal de pensão alimentícia no Brasil. Os 30% que circulam como "regra" são praxe forense, não norma: o art. 1.694 §1º manda fixar na proporção das necessidades de quem pede e dos recursos de quem paga',
          'A escala por número de filhos que aparecia na calculadora antiga (22%, 32%, 40%, 45%) vem da jurisprudência de outro país e não tem qualquer respaldo no direito brasileiro',
          'A base costuma ser a renda LÍQUIDA (descontados INSS e IRRF), e o desconto é feito em folha quando o pagante é empregado',
          'Despesas extraordinárias — escola, plano de saúde, material, remédios — costumam ser divididas à parte, além do percentual',
          'O atraso de até 3 prestações permite prisão civil do devedor (art. 528 §3º do CPC); a dívida mais antiga se cobra por penhora',
        ],
        plazo:
          'os alimentos são devidos desde a citação na ação (art. 13 §2º da Lei 5.478/1968) e podem ser revistos a qualquer tempo se mudarem a necessidade ou a possibilidade.',
      },
    ],
  },

  inputsTitle: 'Os números do seu caso',
  inputsIntro:
    'Alíquotas e percentuais são editáveis de propósito: ITCMD e custas são estaduais, honorários e emolumentos variam por profissional e por cartório. Os padrões que vêm preenchidos são os de São Paulo.',
  fields: [
    {
      id: 'patrimonio',
      label: 'Valor total do patrimônio (R$)',
      prefix: 'R$',
      value: '500.000',
      thousands: true,
      help: 'Soma dos bens a inventariar, doar ou partilhar, pelo valor de mercado. Imóveis costumam ser avaliados pelo valor venal de referência do estado, que pode ser maior que o do IPTU.',
    },
    {
      id: 'numHerdeiros',
      label: 'Número de herdeiros ou donatários',
      type: 'number',
      value: 2,
      min: 1,
      max: 20,
      step: 1,
      help: 'Quantas pessoas dividem o patrimônio. Serve para calcular o quinhão de cada uma e a isenção de doação, que é aplicada por donatário.',
    },
    {
      id: 'itcmdAliquota',
      label: 'Alíquota do ITCMD do seu estado (%)',
      type: 'number',
      value: 4,
      min: 0,
      max: 8,
      step: 0.5,
      suffix: '%',
      help: 'É estadual e vai de 2% a 8% — o teto de 8% é o da Resolução 9/1992 do Senado. São Paulo cobra 4% (Lei 10.705/2000). Vários estados são progressivos por faixa: consulte a Sefaz do seu estado.',
    },
    {
      id: 'honorariosPct',
      label: 'Honorários advocatícios (% do patrimônio)',
      type: 'number',
      value: 6,
      min: 0,
      max: 20,
      step: 0.5,
      suffix: '%',
      help: 'Percentual combinado com o advogado. As tabelas de honorários das seccionais da OAB trazem mínimos de referência para inventário e divórcio; é o item mais negociável da conta.',
    },
    {
      id: 'emolumentos',
      label: 'Emolumentos de cartório (R$)',
      prefix: 'R$',
      value: '4.000',
      thousands: true,
      help: 'Escritura pública de inventário, doação ou divórcio. Fixados por lei estadual, na tabela da corregedoria — variam por faixa de valor. Estimativa editável.',
    },
    {
      id: 'certidoes',
      label: 'Certidões, registros e averbações (R$)',
      prefix: 'R$',
      value: '800',
      thousands: true,
      help: 'Certidões negativas (federal, estadual, municipal, trabalhista), registros nas matrículas e averbações. Sobe com o número de imóveis envolvidos.',
    },
    {
      id: 'custasJudiciaisPct',
      label: 'Custas judiciais (% do valor da causa)',
      type: 'number',
      value: 1,
      min: 0,
      max: 5,
      step: 0.1,
      suffix: '%',
      help: 'Só no inventário judicial. Cada tribunal estadual tem a sua tabela, com piso e teto em UFESP ou equivalente. Confirme no regimento de custas do seu estado.',
    },
    {
      id: 'regimeBens',
      label: 'Regime de bens do casamento ou união',
      type: 'select',
      value: 'parcial',
      options: [
        { value: 'parcial', label: 'Comunhão parcial (regime legal)' },
        { value: 'universal', label: 'Comunhão universal' },
        { value: 'separacao', label: 'Separação total de bens' },
        { value: 'participacao', label: 'Participação final nos aquestos' },
      ],
      help: 'Sem pacto antenupcial, o regime é a comunhão parcial desde a Lei 6.515/1977 (art. 1.640 do Código Civil).',
    },
    {
      id: 'bensAnteriores',
      label: 'Bens que já existiam antes da união (R$)',
      prefix: 'R$',
      value: '0',
      thousands: true,
      help: 'Incluídos no total acima, mas excluídos da partilha na comunhão parcial e na participação final. Entram aqui também heranças e doações recebidas por um só dos cônjuges.',
    },
    {
      id: 'rendaLiquida',
      label: 'Renda líquida mensal do pagante (R$)',
      prefix: 'R$',
      value: '5.000',
      thousands: true,
      help: 'Salário depois de INSS e IRRF. É a base usual do desconto em folha da pensão alimentícia.',
    },
    {
      id: 'numFilhos',
      label: 'Número de filhos beneficiários',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'Quantos filhos recebem a pensão. O total costuma ser fixado em conjunto e dividido, não multiplicado por filho.',
    },
    {
      id: 'pensaoPct',
      label: 'Percentual da pensão sobre a renda líquida (%)',
      type: 'number',
      value: 30,
      min: 0,
      max: 70,
      step: 1,
      suffix: '%',
      help: 'Não existe percentual legal. A faixa mais vista na prática forense é de 20% a 30% da renda líquida para o conjunto dos filhos, sempre ajustada ao binômio necessidade × possibilidade.',
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'Para onde vai o custo',
    caption:
      'Separa o que é imposto (ITCMD, que não se negocia) do que é honorário, emolumento e custa. A fatia negociável costuma ser menor do que as pessoas imaginam — e o imposto, maior.',
  },
  breakdownTitle: 'A conta, bloco por bloco',
  breakdownIntro:
    'Cada linha indica o artigo de lei ou a origem do número, e sinaliza quais valores são estaduais ou negociados. Substitua os padrões de São Paulo pelos do seu estado.',

  faq: [
    {
      q: 'Quando o inventário pode ser feito em cartório?',
      a: 'Pelo art. 610 do CPC, quando não houver testamento e todos os interessados forem maiores, capazes e estiverem de acordo com a partilha. Nesse caso lavra-se escritura pública de inventário e partilha, que já serve de título para o registro dos imóveis e para a transferência de contas e veículos. Um herdeiro menor, um incapaz, um testamento ou qualquer discordância — mesmo sobre um único bem — obrigam o inventário judicial. O advogado é obrigatório nas duas vias (art. 610 §2º).',
    },
    {
      q: 'Qual é a alíquota do ITCMD?',
      a: `Depende do estado: o ITCMD é imposto estadual e cada unidade da federação fixa a sua alíquota, dentro do teto de ${Math.round(ITCMD_TETO_SENADO * 100)}% estabelecido pela Resolução 9/1992 do Senado Federal. São Paulo cobra ${(ITCMD_ALIQUOTA_SP * 100).toFixed(0)}% (Lei 10.705/2000); outros estados usam tabelas progressivas que sobem por faixa de patrimônio, e há estados no piso de 2%. Por isso a alíquota deste simulador é um campo editável: coloque a do seu estado, consultada na Sefaz.`,
    },
    {
      q: 'Existe isenção de ITCMD?',
      a: `Existe, mas é definida por lei estadual e é bem específica. Em São Paulo, a Lei 10.705/2000 isenta a doação até ${ISENCAO_DOACAO_UFESP.toLocaleString('pt-BR')} UFESPs por ano (${brl(ISENCAO_DOACAO_UFESP * UFESP)} com a UFESP de ${brl(UFESP)}), contada por par doador-donatário, e traz hipóteses próprias de isenção na transmissão causa mortis, como a do imóvel único usado como residência da família dentro de um limite em UFESPs. Passado o limite, o imposto incide sobre o valor total, não apenas sobre o excedente — o que faz uma diferença enorme perto do corte. Confirme sempre a hipótese e o limite exato na legislação vigente do seu estado.`,
    },
    {
      q: 'Qual é o prazo para abrir o inventário?',
      a: 'Dois meses contados do falecimento, pelo art. 611 do CPC, com a instrução de que o processo seja ultimado nos doze meses seguintes — prazo que o juiz pode prorrogar. O descumprimento não invalida nada, mas custa caro: vários estados aplicam multa sobre o ITCMD por abertura fora do prazo. Em São Paulo a multa é de 10% e sobe para 20% se o atraso passar de 180 dias. Abrir rápido é a economia mais fácil de toda essa conta.',
    },
    {
      q: 'Quanto custa, no total, um inventário?',
      a: 'A soma tem quatro blocos: ITCMD (2% a 8% do patrimônio, conforme o estado), honorários advocatícios (percentual negociado, com mínimos de referência nas tabelas da OAB), emolumentos de cartório ou custas judiciais e as certidões e registros. Na via extrajudicial em São Paulo, um patrimônio de meio milhão costuma consumir em torno de 10% a 12% do total entre imposto e serviços. O único item realmente negociável é o honorário; o imposto, não.',
    },
    {
      q: 'Doar em vida sai mais barato que deixar de herança?',
      a: 'A alíquota do ITCMD costuma ser a mesma nas duas hipóteses no mesmo estado, então a economia não vem do imposto: vem de evitar o inventário, seus honorários e sua demora. Em compensação, a doação a descendente é adiantamento de legítima (art. 544 do Código Civil) e volta à partilha por colação, salvo dispensa expressa; não se pode doar mais da metade do patrimônio havendo herdeiros necessários (art. 549); e doar tudo sem reservar meios de subsistência é nulo (art. 548). Por isso a fórmula usual é doar com reserva de usufruto vitalício.',
    },
    {
      q: 'Como se divide o patrimônio no divórcio?',
      a: 'Pelo regime de bens. Na comunhão parcial — o regime legal desde 1977 e o mais comum — divide-se apenas o que foi adquirido onerosamente durante a união, ficando de fora os bens anteriores, as heranças e as doações recebidas por um só (art. 1.659 do Código Civil). Na comunhão universal divide-se praticamente tudo, inclusive o anterior. Na separação total, cada um fica com o que está no seu nome. Na participação final nos aquestos, cada um administra os seus bens durante o casamento e, na dissolução, apura-se o que cada um acumulou.',
    },
    {
      q: 'Divórcio pode ser feito em cartório?',
      a: 'Pode, se for consensual e não houver filho menor ou incapaz nem nascituro — é a regra do art. 733 do CPC, na linha da Lei 11.441/2007. Lavra-se escritura pública, com advogado presente (um para os dois ou um para cada), e ela já serve para averbar o divórcio no registro civil e transferir os imóveis. Havendo filho menor, o divórcio é sempre judicial, com participação do Ministério Público, ainda que as partes estejam de pleno acordo.',
    },
    {
      q: 'Qual é o percentual da pensão alimentícia no Brasil?',
      a: 'Não existe percentual definido em lei — e essa é a informação que mais falta na internet. O art. 1.694 §1º do Código Civil manda fixar os alimentos na proporção das necessidades de quem pede e dos recursos de quem paga, o chamado binômio necessidade × possibilidade. Na prática forense a faixa mais vista é de 20% a 30% da renda líquida para o conjunto dos filhos, mas o juiz pode fixar bem acima ou bem abaixo, ou até em valor fixo em salários mínimos quando o pagante não tem renda formal.',
    },
    {
      q: 'A pensão incide sobre o bruto ou sobre o líquido?',
      a: 'Depende do que a decisão ou o acordo disser, e é por isso que a redação da cláusula importa tanto. O mais comum é fixar sobre os rendimentos líquidos, entendidos como o salário menos os descontos obrigatórios (INSS e imposto de renda) — descontos facultativos, como empréstimo consignado e plano odontológico, não reduzem a base. Também é comum estabelecer que a pensão incide sobre 13º salário, férias e verbas rescisórias, o que precisa estar escrito para valer.',
    },
    {
      q: 'O que acontece se a pensão não for paga?',
      a: 'O art. 528 §3º do CPC permite a prisão civil do devedor de alimentos, em regime fechado, de 1 a 3 meses, quando estão em atraso as três prestações anteriores ao ajuizamento mais as que vencerem no curso do processo. As parcelas mais antigas se cobram pelo rito da expropriação: penhora de bens, de salário e de contas, além de protesto do débito e inclusão nos cadastros de inadimplentes. A prisão não quita a dívida — cumprida a pena, o valor continua devido.',
    },
    {
      q: 'A partilha desigual gera imposto?',
      a: 'Pode gerar. Se um dos cônjuges leva mais do que a sua meação sem contrapartida, o fisco estadual tende a enxergar doação naquele excesso e cobrar ITCMD sobre ele; havendo pagamento em dinheiro pelo excedente, aparece ITBI no caso de imóveis. É um dos pontos que mais surpreende em divórcios amigáveis, em que o casal simplesmente combina "você fica com o apartamento, eu fico com a casa" sem olhar os valores. Leve a partilha ao advogado antes de assinar a escritura.',
    },
  ],

  sources: [
    {
      name: 'Código Civil — Lei 10.406/2002 (regimes de bens, doação, alimentos e sucessões)',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Código de Processo Civil — Lei 13.105/2015 (arts. 610, 611, 528 e 733)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 11.441/2007 — inventário, partilha, separação e divórcio por via administrativa',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/lei/l11441.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 10.705/2000 — ITCMD de São Paulo (alíquota, isenções e multas)',
      url: 'https://legislacao.fazenda.sp.gov.br/Paginas/lei10705.aspx',
      publisher: 'Secretaria da Fazenda e Planejamento do Estado de São Paulo',
    },
    {
      name: 'Resolução 9/1992 do Senado Federal — teto de 8% para a alíquota do ITCMD',
      url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/materia_legislativa',
      publisher: 'Senado Federal',
    },
    {
      name: 'Lei 5.478/1968 — ação de alimentos',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l5478.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Central de escrituras e procurações — atos notariais de inventário, doação e divórcio',
      url: 'https://www.censec.org.br/',
      publisher: 'Colégio Notarial do Brasil',
    },
  ],

  replaces: [
    '/pt/custo-inventario-extrajudicial-itcmd-cartorio',
    '/pt/itcmd-sao-paulo-heranca-doacao-4-porcento',
    '/pt/divorcio-liquidacao-bens-custo',
    '/pt/pensao-alimenticia-percentual-salario-filho',
  ],

  lastReviewed: '2026-07-28',
};
