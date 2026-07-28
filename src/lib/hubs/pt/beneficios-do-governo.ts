import type { HubData } from '../types';
import {
  SALARIO_MINIMO,
  BOLSA_FAMILIA_LIMITE_PER_CAPITA,
  BOLSA_FAMILIA_POR_PESSOA,
  BOLSA_FAMILIA_PISO_FAMILIA,
  BOLSA_FAMILIA_PRIMEIRA_INFANCIA,
  BOLSA_FAMILIA_VARIAVEL_FAMILIAR,
  BOLSA_FAMILIA_REGRA_PROTECAO,
  BOLSA_FAMILIA_TETO_PROTECAO,
} from '../../data/brasil-2026';

/**
 * Hub de decisão BR — "Tenho direito a algum benefício e de quanto é?"
 *
 * Absorve 3 calculadoras soltas (Bolsa Família, "Auxílio Brasil" e abono
 * salarial PIS/PASEP). Constantes: Lei 14.601/2023 (Bolsa Família) e
 * Lei 7.998/1990 art. 9º (abono salarial). O salário mínimo sai de
 * src/lib/data/brasil-2026.ts.
 *
 * Correção em relação às fórmulas antigas (ver relatório): o Bolsa Família não é
 * "R$ 600 fixos por família". A lei manda pagar R$ 142 por PESSOA (Benefício de
 * Renda de Cidadania) e só complementa até R$ 600 quando a soma fica abaixo
 * disso. Para famílias com 5 integrantes ou mais, a conta antiga pagava a menos.
 */

/** Disclaimer YMYL — tradução do texto de src/lib/disclaimers.ts (domínio 'money'). */
export const AVISO_LEGAL =
  'Estimativa informativa com base nos dados informados. Os valores e os critérios dos programas sociais mudam por lei e por decreto; a concessão depende do CadÚnico e da análise do órgão gestor. Confira no aplicativo oficial ou no CRAS do seu município antes de contar com o dinheiro.';

export const MINIMO = SALARIO_MINIMO;

/**
 * Bolsa Família — Lei 14.601/2023.
 * Os valores vivem em src/lib/data/brasil-2026.ts (fonte única): estavam
 * duplicados nas duas fórmulas antigas e as duas erravam do mesmo jeito.
 */
export const BOLSA_FAMILIA = {
  limitePerCapita: BOLSA_FAMILIA_LIMITE_PER_CAPITA,
  porPessoa: BOLSA_FAMILIA_POR_PESSOA,
  pisoFamilia: BOLSA_FAMILIA_PISO_FAMILIA,
  primeiraInfancia: BOLSA_FAMILIA_PRIMEIRA_INFANCIA,
  variavelFamiliar: BOLSA_FAMILIA_VARIAVEL_FAMILIAR,
  regraProtecao: BOLSA_FAMILIA_REGRA_PROTECAO,
  tetoProtecao: BOLSA_FAMILIA_TETO_PROTECAO,
};

/** Abono salarial PIS/PASEP — Lei 7.998/1990, art. 9º. */
export const ABONO = {
  anosCadastroMinimo: 5,
  /** Remuneração média mensal máxima no ano-base: 2 salários mínimos. */
  limiteSalarios: 2,
  /** Dias mínimos trabalhados com carteira assinada no ano-base. */
  diasMinimos: 30,
  get limiteRemuneracao() {
    return MINIMO * 2;
  },
  get valorMensal() {
    return Math.round((MINIMO / 12) * 100) / 100;
  },
};

const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hub: HubData = {
  slug: 'pt/trabalho/beneficios-do-governo',
  title: 'Bolsa Família e abono PIS/PASEP: tenho direito e de quanto é?',
  description:
    'Calcule o valor do Bolsa Família pela regra da Lei 14.601/2023 (R$ 142 por pessoa, piso de R$ 600 por família e adicionais para crianças, gestantes e jovens) e descubra se você tem direito ao abono salarial PIS/PASEP e quanto vai receber.',
  silo: 'Trabalho',
  siloHref: '/pt/trabalho',
  locale: 'pt',

  eyebrow: 'Brasil · programas sociais · benefícios',
  h1: 'Tenho direito a algum benefício do governo — e de quanto é?',
  lede:
    'São dois programas diferentes, com lógicas opostas: o Bolsa Família olha a renda da família inteira dividida pelo número de integrantes, e o abono salarial olha o seu ano de carteira assinada. Informe seus dados e veja em qual você se encaixa, quanto dá e o que pode te tirar do benefício.',
  stamps: [
    `Salário mínimo vigente: ${brl(MINIMO)}`,
    'Lei 14.601/2023 (Bolsa Família) · Lei 7.998/1990 art. 9º (abono)',
    '3 calculadoras dentro',
  ],

  resultLabel: 'Valor estimado do benefício',

  cases: {
    title: 'Qual benefício você está procurando?',
    intro:
      'O Bolsa Família é transferência de renda para famílias em situação de pobreza, com CadÚnico atualizado. O abono salarial é outra coisa: um pagamento anual para quem trabalhou com carteira assinada ganhando pouco.',
    items: [
      {
        id: 'bolsa_familia',
        label: 'Bolsa Família',
        hint: 'Renda per capita até R$ 218 · CadÚnico ativo',
        answer:
          'O cálculo soma R$ 142 por integrante da família, garante um piso de R$ 600 por família e ainda paga adicionais por criança pequena, gestante, nutriz e jovem.',
        yes: [
          `Benefício de Renda de Cidadania: ${brl(BOLSA_FAMILIA.porPessoa)} por integrante da família`,
          `Benefício Complementar: completa até ${brl(BOLSA_FAMILIA.pisoFamilia)} quando a soma fica abaixo desse piso`,
          `Benefício Primeira Infância: ${brl(BOLSA_FAMILIA.primeiraInfancia)} por criança de 0 a 6 anos`,
          `Benefício Variável Familiar: ${brl(BOLSA_FAMILIA.variavelFamiliar)} por integrante de 7 a 18 anos, por gestante e por nutriz`,
          `Renda familiar mensal per capita de até ${brl(BOLSA_FAMILIA.limitePerCapita)}`,
          'CadÚnico ativo e atualizado nos últimos 24 meses',
        ],
        warn: [
          AVISO_LEGAL,
          'É por PESSOA, não por família: uma família de seis integrantes recebe 6 × R$ 142 = R$ 852 de Renda de Cidadania, bem acima do piso de R$ 600. Muita gente subestima o valor porque acha que os R$ 600 são o limite',
          'Há condicionalidades: frequência escolar das crianças e adolescentes, vacinação em dia e acompanhamento pré-natal. O descumprimento suspende o pagamento',
          'Renda não declarada no CadÚnico configura irregularidade e pode gerar devolução dos valores recebidos',
        ],
        plazo:
          'a atualização do CadÚnico é obrigatória a cada 24 meses, ou sempre que mudar renda, endereço ou composição familiar — faça no CRAS do seu município.',
      },
      {
        id: 'auxilio_brasil',
        label: 'Auxílio Brasil (programa extinto)',
        hint: 'Substituído pelo Bolsa Família em 2023',
        answer:
          'O Auxílio Brasil não existe mais: foi extinto e substituído pelo Bolsa Família em março de 2023, com regras próprias e valores diferentes.',
        yes: [
          'O programa Auxílio Brasil (Lei 14.284/2021) foi extinto pela MP 1.164/2023, convertida na Lei 14.601/2023',
          'Quem recebia foi migrado automaticamente para o Bolsa Família, sem precisar fazer novo cadastro',
          'A conta desta aba é a do Bolsa Família atual, que é o programa que efetivamente paga hoje',
          'Não existe pagamento de "Auxílio Brasil" em 2026 — nem calendário, nem valor, nem cadastro próprio',
        ],
        warn: [
          AVISO_LEGAL,
          'Qualquer site, aplicativo ou mensagem que ofereça "consulta do Auxílio Brasil", "recadastramento" ou "liberação de parcela atrasada" é golpe: o programa não existe mais',
          'A única consulta oficial é pelo aplicativo Bolsa Família, pelo Caixa Tem ou no CRAS do município — nunca por link recebido por WhatsApp ou SMS',
          'A regra de cálculo mudou na transição: o valor que você recebia no Auxílio Brasil não é necessariamente o que recebe hoje',
        ],
        plazo:
          'se você ainda procura pelo nome antigo, use o aplicativo Bolsa Família com o mesmo CPF: o histórico de pagamentos migrou junto.',
      },
      {
        id: 'abono',
        label: 'Abono salarial PIS/PASEP',
        hint: '5 anos de cadastro · até 2 salários mínimos · 30 dias no ano-base',
        answer:
          'Quem tem PIS/PASEP há pelo menos 5 anos, trabalhou 30 dias ou mais no ano-base e ganhou em média até 2 salários mínimos recebe até um salário mínimo, proporcional aos meses trabalhados.',
        yes: [
          `Estar inscrito no PIS/PASEP há pelo menos ${ABONO.anosCadastroMinimo} anos — art. 9º da Lei 7.998/1990`,
          `Ter recebido, em média, até ${ABONO.limiteSalarios} salários mínimos por mês no ano-base (${brl(ABONO.limiteRemuneracao)})`,
          `Ter trabalhado com carteira assinada por pelo menos ${ABONO.diasMinimos} dias no ano-base`,
          'Ter os dados informados corretamente pelo empregador na RAIS ou no eSocial',
          `Valor: um salário mínimo dividido por 12 (${brl(ABONO.valorMensal)}) multiplicado pelos meses trabalhados`,
        ],
        warn: [
          AVISO_LEGAL,
          'O erro mais comum é o empregador não declarar ou declarar errado na RAIS/eSocial — nesse caso o abono não sai, e a correção tem de partir da empresa',
          'Cada mês com 15 dias ou mais de trabalho conta como mês cheio para a proporcionalidade',
          'PIS é pago pela Caixa e PASEP pelo Banco do Brasil, em calendário anual definido pelo Codefat conforme o mês de nascimento (PIS) ou o final da inscrição (PASEP)',
          'O abono não sacado prescreve: o valor volta para o FAT depois do fim do calendário do exercício',
        ],
        plazo:
          'o ano-base é sempre o penúltimo ano — o abono pago em 2026 se refere ao trabalho de 2024. Consulte a data exata pela Carteira de Trabalho Digital.',
      },
    ],
  },

  inputsTitle: 'Seus dados',
  inputsIntro:
    'Os quatro primeiros campos são do Bolsa Família e olham a família inteira. Os três últimos são do abono salarial e olham só você.',
  fields: [
    {
      id: 'rendaFamiliar',
      label: 'Renda mensal de toda a família (R$)',
      prefix: 'R$',
      value: '600',
      thousands: true,
      help: 'Some tudo que entra: salários, pensões, aposentadorias, aluguéis recebidos e trabalho informal. Benefícios do próprio Bolsa Família e o BPC não entram nessa conta.',
    },
    {
      id: 'membros',
      label: 'Quantas pessoas moram na casa',
      type: 'number',
      value: 4,
      min: 1,
      max: 20,
      step: 1,
      help: 'Todos os integrantes da família cadastrados no CadÚnico, inclusive os bebês. É esse número que divide a renda para achar a per capita.',
    },
    {
      id: 'criancas',
      label: 'Crianças de 0 a 6 anos',
      type: 'number',
      value: 1,
      min: 0,
      max: 15,
      step: 1,
      help: `Cada uma soma ${brl(BOLSA_FAMILIA.primeiraInfancia)} pelo Benefício Primeira Infância, além dos ${brl(BOLSA_FAMILIA.porPessoa)} de Renda de Cidadania que já contam como integrante.`,
    },
    {
      id: 'jovens',
      label: 'Integrantes de 7 a 18 anos',
      type: 'number',
      value: 1,
      min: 0,
      max: 15,
      step: 1,
      help: `Cada um soma ${brl(BOLSA_FAMILIA.variavelFamiliar)} pelo Benefício Variável Familiar. A frequência escolar é condicionalidade obrigatória.`,
    },
    {
      id: 'gestantes',
      label: 'Gestantes e nutrizes na família',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada gestante e cada nutriz (mãe de bebê de até 6 meses) soma ${brl(BOLSA_FAMILIA.variavelFamiliar)}. Depende do acompanhamento pré-natal registrado na rede de saúde.`,
    },
    {
      id: 'salarioMedio',
      label: 'Sua remuneração média mensal no ano-base (R$)',
      prefix: 'R$',
      value: '2.400',
      thousands: true,
      help: `Média do que você recebeu por mês com carteira assinada no ano-base. O limite do abono é ${ABONO.limiteSalarios} salários mínimos (${brl(ABONO.limiteRemuneracao)}).`,
    },
    {
      id: 'mesesTrabalhados',
      label: 'Meses trabalhados no ano-base',
      type: 'number',
      value: 12,
      min: 0,
      max: 12,
      step: 1,
      help: 'Cada mês com 15 dias ou mais de vínculo formal conta como mês cheio. Com 12 meses você recebe o abono integral.',
    },
    {
      id: 'anosCadastro',
      label: 'Anos de inscrição no PIS/PASEP',
      type: 'number',
      value: 8,
      min: 0,
      max: 60,
      step: 1,
      help: `Conte desde a primeira carteira assinada. Menos de ${ABONO.anosCadastroMinimo} anos elimina o direito, por mais que você tenha trabalhado o ano inteiro.`,
    },
  ],
  fineprint: AVISO_LEGAL,

  chart: {
    type: 'donut',
    title: 'De onde vem cada real do benefício',
    caption:
      'Mostra o peso de cada parcela no valor final: quanto vem da Renda de Cidadania por pessoa, quanto é complemento até o piso e quanto são os adicionais por criança, gestante e jovem.',
  },
  breakdownTitle: 'O benefício, parcela por parcela',
  breakdownIntro:
    'Primeiro o teste de elegibilidade, depois cada parcela com a sua base legal e, no fim, o valor mensal e o valor no ano.',

  faq: [
    {
      q: 'O Bolsa Família paga R$ 600 fixos por família?',
      a: `Não — e essa é a confusão mais comum do programa. A Lei 14.601/2023 criou o Benefício de Renda de Cidadania, que paga ${brl(BOLSA_FAMILIA.porPessoa)} por integrante da família. Os ${brl(BOLSA_FAMILIA.pisoFamilia)} são um piso: quando a soma por pessoa fica abaixo disso, entra o Benefício Complementar para fechar o valor. Uma família de três pessoas soma R$ 426 e recebe o complemento até R$ 600; uma família de seis soma R$ 852 e recebe os R$ 852, sem complemento. Os adicionais por criança, gestante e jovem entram por cima do que for maior.`,
    },
    {
      q: 'Qual é o limite de renda para receber o Bolsa Família?',
      a: `A renda familiar mensal per capita — o total que entra na casa dividido pelo número de integrantes — não pode passar de ${brl(BOLSA_FAMILIA.limitePerCapita)}. Não entram nessa conta os valores do próprio Bolsa Família, do BPC e de outros programas de transferência de renda. É preciso declarar tudo no CadÚnico: renda não informada, mesmo de trabalho informal, configura irregularidade e pode gerar a obrigação de devolver o que foi recebido.`,
    },
    {
      q: 'O que é a Regra de Proteção do Bolsa Família?',
      a: `É a proteção para quem consegue emprego e teme perder o benefício. Se a renda per capita da família subir acima de ${brl(BOLSA_FAMILIA.limitePerCapita)} mas ficar até meio salário mínimo por pessoa (${brl(BOLSA_FAMILIA.tetoProtecao)}), a família continua recebendo 50% do valor do benefício por até 24 meses. O objetivo é evitar que aceitar um trabalho formal signifique perder renda no primeiro mês. Passados os 24 meses ou ultrapassado o meio salário mínimo per capita, o benefício é encerrado.`,
    },
    {
      q: 'Quais são as condicionalidades do Bolsa Família?',
      a: 'Frequência escolar mínima de 60% para crianças de 4 a 5 anos e de 75% para crianças e adolescentes de 6 a 18 anos; vacinação em dia e acompanhamento nutricional para as crianças de até 7 anos; e pré-natal completo para as gestantes. O descumprimento gera advertência, depois bloqueio e, persistindo, suspensão e cancelamento. As condicionalidades não são burocracia: são a contrapartida em saúde e educação prevista na lei do programa.',
    },
    {
      q: 'O Auxílio Brasil ainda existe?',
      a: 'Não. O Auxílio Brasil foi criado pela Lei 14.284/2021 e extinto pela MP 1.164/2023, convertida na Lei 14.601/2023, que restabeleceu o Bolsa Família em março de 2023. Quem recebia o Auxílio Brasil migrou automaticamente, sem novo cadastro. Se você encontrar sites, aplicativos ou mensagens oferecendo consulta, recadastramento ou liberação de parcelas atrasadas do Auxílio Brasil, é golpe — a única consulta oficial é pelo aplicativo Bolsa Família, pelo Caixa Tem ou no CRAS.',
    },
    {
      q: 'Quem tem direito ao abono salarial PIS/PASEP?',
      a: `São quatro requisitos cumulativos do art. 9º da Lei 7.998/1990: estar inscrito no PIS/PASEP há pelo menos ${ABONO.anosCadastroMinimo} anos; ter trabalhado com carteira assinada por pelo menos ${ABONO.diasMinimos} dias no ano-base; ter recebido, em média, até ${ABONO.limiteSalarios} salários mínimos por mês nesse ano-base; e ter os dados corretamente informados pelo empregador na RAIS ou no eSocial. Falhar em um só requisito elimina o direito daquele exercício — mas não dos seguintes.`,
    },
    {
      q: 'Quanto vou receber de abono salarial?',
      a: `O valor é proporcional aos meses trabalhados no ano-base: um salário mínimo dividido por 12 (${brl(ABONO.valorMensal)} em 2026) multiplicado pelo número de meses. Quem trabalhou o ano inteiro recebe o salário mínimo cheio, ${brl(MINIMO)}; quem trabalhou seis meses recebe metade. Cada mês com 15 dias ou mais de vínculo conta como mês cheio. O valor pago é sempre o do salário mínimo vigente no ano do pagamento, não o do ano-base.`,
    },
    {
      q: 'Qual é o ano-base do abono pago neste ano?',
      a: 'O ano-base é sempre o penúltimo ano em relação ao pagamento, porque a apuração depende da RAIS e do eSocial declarados pelas empresas e processados pelo Ministério do Trabalho. O abono pago em 2026, portanto, se refere ao trabalho realizado em 2024. Por isso não adianta consultar logo depois de trocar de emprego: o dado só entra no cálculo dois anos depois.',
    },
    {
      q: 'Trabalhei o ano todo mas o abono não saiu. O que fazer?',
      a: 'Na maioria dos casos o problema é a declaração do empregador: RAIS não entregue, eSocial com dados divergentes ou remuneração lançada errado. Comece consultando a Carteira de Trabalho Digital e o portal gov.br para ver o que consta. Se houver erro, o próprio empregador precisa retificar a declaração — você não consegue corrigir sozinho. Depois da retificação, o pagamento entra no processamento seguinte. Se a empresa se recusar, o caminho é a Superintendência Regional do Trabalho.',
    },
    {
      q: 'Posso receber Bolsa Família e abono salarial ao mesmo tempo?',
      a: 'Em tese sim, porque são programas independentes, mas na prática é raro: quem trabalhou com carteira assinada o ano inteiro ganhando até dois salários mínimos costuma ter renda per capita acima do limite do Bolsa Família, a menos que a família seja grande. Se for o seu caso, declare tudo no CadÚnico: o abono é renda e precisa ser informado, e omitir gera irregularidade. Pela Regra de Proteção, a família pode continuar com metade do Bolsa Família por até 24 meses.',
    },
    {
      q: 'Recebo BPC. Isso conta como renda da família?',
      a: 'Não para efeito do cálculo da renda per capita do Bolsa Família: o BPC (Benefício de Prestação Continuada) fica de fora, assim como os próprios valores do Bolsa Família e de outros programas de transferência de renda. Mas atenção: BPC e Bolsa Família não podem ser acumulados pela mesma pessoa. A família pode ter um integrante recebendo BPC e continuar no Bolsa Família pelos demais integrantes, desde que o restante da renda respeite o limite per capita.',
    },
    {
      q: 'Quanto tempo tenho para sacar o abono?',
      a: 'Até o fim do calendário do exercício, que costuma se encerrar no fim do ano civil em que os pagamentos começaram. Passado esse prazo, o valor não sacado prescreve e retorna ao FAT (Fundo de Amparo ao Trabalhador). Quem tem conta na Caixa (PIS) ou no Banco do Brasil (PASEP) recebe por crédito automático; quem não tem precisa sacar com o Cartão Cidadão ou em uma agência, com documento de identidade.',
    },
  ],

  sources: [
    {
      name: 'Lei 14.601/2023 — Programa Bolsa Família, benefícios e critérios de renda',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14601.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 14.284/2021 — Programa Auxílio Brasil (revogado pela Lei 14.601/2023)',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14284.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Lei 7.998/1990, art. 9º — abono salarial PIS/PASEP',
      url: 'https://www.planalto.gov.br/ccivil_03/leis/l7998.htm',
      publisher: 'Presidência da República',
    },
    {
      name: 'Bolsa Família — valores, regras e Regra de Proteção',
      url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia',
      publisher: 'Ministério do Desenvolvimento e Assistência Social',
    },
    {
      name: 'Cadastro Único (CadÚnico) — inscrição e atualização',
      url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico',
      publisher: 'Ministério do Desenvolvimento e Assistência Social',
    },
    {
      name: 'Abono salarial — requisitos, calendário e consulta',
      url: 'https://www.gov.br/trabalho-e-emprego/pt-br/servicos/trabalhador/abono-salarial',
      publisher: 'Ministério do Trabalho e Emprego',
    },
    {
      name: 'Decreto 12.797/2025 — salário mínimo nacional vigente',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12797.htm',
      publisher: 'Presidência da República',
    },
  ],

  replaces: [
    '/pt/bolsa-familia-valor-por-familia-2026',
    '/pt/auxilio-brasil-substituto-bolsa-familia-atual',
    '/pt/abono-salarial-pis-pasep-elegibilidade-valor',
  ],

  lastReviewed: '2026-07-28',
};
