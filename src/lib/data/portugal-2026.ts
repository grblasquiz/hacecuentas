/**
 * Datos fiscais e laborais de PORTUGAL 2026 (continente) — tabela mestra única.
 * Fontes oficiais (verificado 2026-06-23):
 * - RMMG (salário mínimo): Decreto-Lei n.º 139/2025 (DR 29-dez-2025) → 920 €/mês × 14 meses.
 * - IRS escalões 2026: Lei n.º 73-A/2025 (OE 2026). Taxas marginais reais (12,5 % … 48 %).
 * - IAS 2026: Portaria n.º 480-A/2025/1 (30-dez-2025) → 537,13 € (sobe 2,8 % vs 522,50 €).
 * - Segurança Social: Código Contributivo (TCO 11 % + 23,75 %; independentes 21,4 %).
 * - IMT 2026: Ofício Circulado AT n.º 40129/2026 (06-jan-2026) + Lei 73-A/2025 (escalões +2 %).
 * - IVA continente: art. 18.º CIVA + Listas I/II (6 % / 13 % / 23 %).
 * Moeda: Euro (EUR, "€"). NOTA: Açores e Madeira têm RMMG e IVA próprios — este ficheiro é CONTINENTE.
 */

/** Vigência do dado (YYYY-MM-DD) — usada pelo selo de frescura a nível de dado (src/lib/data-freshness.ts). */
export const DATA_AS_OF = '2026-06-23';

export const PORTUGAL_2026 = {
  anio: 2026,
  moeda: 'EUR',
  simbolo: '€',
  regiao: 'continente', // este ficheiro cobre Portugal continental; RA Açores/Madeira diferem

  // ── IAS — Indexante dos Apoios Sociais ──
  // Portaria n.º 480-A/2025/1. Referência para prestações sociais, IRS Jovem, base SS independentes, etc.
  ias: 537.13,

  // ── RMMG — Retribuição Mínima Mensal Garantida (salário mínimo nacional) ──
  // Decreto-Lei n.º 139/2025. 920 €/mês, pago 14 vezes (12 meses + férias + Natal).
  // Trajetória anunciada: 970 € (2027), 1.020 € (2028).
  rmmg: {
    mensal: 920,             // €/mês (14 vezes)
    meses: 14,               // 12 + subsídio de férias + subsídio de Natal
    anual: 12880,            // 920 × 14
    // Valor/hora (art. 271.º CT): RMMG × 12 ÷ (52 × n.º horas semana). Com 40 h/semana:
    horaPara40h: 5.31,       // 920 × 12 ÷ (52 × 40)
    horasSemanaPadrao: 40,
    aumentoVs2025Pct: 0.0575, // 920 vs 870 € de 2025
    // Açores 966 € e Madeira 968 € (regionais) — não usar para continente.
    acores: 966,
    madeira: 968,
  },

  // ── IRS — Imposto sobre o Rendimento das Pessoas Singulares (continente) ──
  // Lei n.º 73-A/2025 (OE 2026). 9 escalões. TAXAS MARGINAIS REAIS (não a tabela de "taxa média"
  // que algumas fontes publicam com parcela a abater). Aplicam-se ao RENDIMENTO COLETÁVEL
  // (= rendimento bruto − dedução específica), não ao salário bruto.
  irs: {
    // Limite superior de cada escalão (€) e taxa marginal. Escalões atualizados +3,51 % vs 2025.
    escaloes: [
      { ateEuros: 8342, taxa: 0.125 },        // 1.º: até 8.342 → 12,5 %
      { ateEuros: 12587, taxa: 0.157 },       // 2.º: 8.342 – 12.587 → 15,7 %
      { ateEuros: 17838, taxa: 0.212 },       // 3.º: 12.587 – 17.838 → 21,2 %
      { ateEuros: 23089, taxa: 0.241 },       // 4.º: 17.838 – 23.089 → 24,1 %
      { ateEuros: 29397, taxa: 0.311 },       // 5.º: 23.089 – 29.397 → 31,1 %
      { ateEuros: 43090, taxa: 0.349 },       // 6.º: 29.397 – 43.090 → 34,9 %
      { ateEuros: 46566, taxa: 0.431 },       // 7.º: 43.090 – 46.566 → 43,1 %
      { ateEuros: 86634, taxa: 0.446 },       // 8.º: 46.566 – 86.634 → 44,6 %
      { ateEuros: Infinity, taxa: 0.48 },     // 9.º: > 86.634 → 48 %
    ],

    // Dedução específica de rendimentos de trabalho dependente (Cat. A) e pensões.
    // = 8,54 × IAS (regra desde 2024). Para rendimentos de 2026: 8,54 × 537,13 = 4.587,09 €.
    // Se as contribuições obrigatórias (SS) excederem este valor, considera-se o maior dos dois.
    deducaoEspecificaTrabalho: 4587.09,
    deducaoEspecificaFatorIas: 8.54,

    // Mínimo de existência (art. 70.º CIRS) — rendimento anual abaixo do qual NÃO se paga IRS.
    // Valor de referência 2026 = max(1,5 × 14 × IAS ; 14 × RMMG) = max(11.279,73 ; 12.880) = 12.880 €.
    // Como o salário mínimo anual é exatamente 14 × 920 = 12.880 €, quem ganha o SMN fica isento de IRS.
    minimoExistenciaAnual: 12880,

    // Taxa autónoma opcional sobre mais-valias / rendimentos prediais e de capitais (Cat. E/F/G).
    taxaAutonomaMaisValias: 0.28,
  },

  // ── IRS Jovem (regime de isenção parcial para jovens) ──
  // Lei 73-A/2025. Até aos 35 anos (inclusive), Cat. A e B, não dependente. Máx. 10 anos.
  // Limite anual de rendimento isento = 55 × IAS = 55 × 537,13 = 29.542,15 € (2026).
  irsJovem: {
    idadeMaxima: 35,
    anosMaximos: 10,
    limiteIsencaoFatorIas: 55,
    limiteIsencaoAnual: 29542.15,   // 55 × IAS 2026
    // % de isenção sobre o rendimento, por ano de obtenção de rendimentos:
    isencaoPorAno: [
      { ano: 1, isencao: 1.00 },              // 1.º ano: 100 %
      { anoDe: 2, anoAte: 4, isencao: 0.75 }, // 2.º–4.º: 75 %
      { anoDe: 5, anoAte: 7, isencao: 0.50 }, // 5.º–7.º: 50 %
      { anoDe: 8, anoAte: 10, isencao: 0.25 },// 8.º–10.º: 25 %
    ],
  },

  // ── Segurança Social ──
  // Código dos Regimes Contributivos. TCO = trabalhador por conta de outrem.
  segSocial: {
    trabalhador: 0.11,        // 11 % descontado ao trabalhador (TCO)
    empregador: 0.2375,       // 23,75 % a cargo da entidade empregadora (NÃO sai do recibo)
    totalTco: 0.3475,         // 34,75 % total sobre a remuneração (TCO)

    // Trabalhadores independentes (recibos verdes).
    independente: {
      taxaGeral: 0.214,             // 21,4 % (prestação de serviços/atividade geral)
      taxaEmpresarioIndividual: 0.252, // 25,2 % (empresário em nome individual / com contabilidade organizada)
      // Base de incidência = rendimento relevante ÷ 3 (média mensal trimestral).
      // Rendimento relevante = 70 % do valor faturado em prestação de serviços
      //                        (ou 20 % na produção/venda de bens).
      percRendimentoRelevanteServicos: 0.70,
      percRendimentoRelevanteBens: 0.20,
      // A base mensal não pode exceder 12 × IAS = 6.445,56 € (2026).
      baseMaximaMensal: 6445.56,    // 12 × IAS
      // Primeiro ano de atividade: isenção de contribuições (12 meses).
    },
  },

  // ── Subsídios (férias + Natal) e subsídio de refeição/alimentação ──
  subsidios: {
    // 14 meses: subsídio de férias (1 mês) + subsídio de Natal (1 mês), além dos 12 ordenados.
    feriasMeses: 1,
    natalMeses: 1,
    totalMesesAno: 14,

    // Subsídio de refeição — limites isentos de IRS+SS (2026, valor da função pública).
    // Acima destes limites, o EXCEDENTE é tributado em IRS e sujeito a contribuições.
    refeicao: {
      isentoDinheiroDia: 6.15,   // pago em dinheiro: isento até 6,15 €/dia
      isentoCartaoDia: 10.46,    // pago em cartão/vale refeição: isento até 10,46 €/dia
    },
  },

  // ── Subsídio de desemprego ──
  // Cálculo: 65 % da remuneração de referência (RR = média dos 12 meses dos últimos 14, c/ férias+Natal).
  desemprego: {
    percRemuneracaoReferencia: 0.65, // 65 % da RR
    // Limite superior = 2,5 × IAS.
    topeSuperiorFatorIas: 2.5,
    topeSuperiorMensal: 1342.83,     // 2,5 × 537,13
    // Limite inferior: nunca abaixo do IAS; se a RR ≥ salário mínimo, mínimo = 1,15 × IAS.
    minimoIas: 537.13,               // 1 × IAS
    minimoComRmmg: 617.70,           // 1,15 × IAS (quando RR ≥ RMMG)
    // Duração: depende da idade e do tempo de descontos (de 5 meses a 26+ meses).
  },

  // ── Compensação por cessação do contrato de trabalho ──
  // Código do Trabalho (regra geral desde 1-out-2013; Lei 13/2023 uniformizou tipos de cessação).
  // Fórmula: (retribuição base mensal + diuturnidades) ÷ 30 × dias/ano × anos completos de antiguidade.
  cessacao: {
    diasPorAno: 12,           // 12 dias de retribuição base+diuturnidades por ano completo (regime atual)
    // Regime transitório para antiguidade ANTERIOR a 1-out-2013: 18 dias/ano nos 3 primeiros anos,
    // depois 12 dias/ano (cálculo por períodos). Aplica-se a contratos celebrados antes dessa data.
    diasPorAnoTransitorioPrimeiros3Anos: 18,
    // Limites legais:
    // - a retribuição base+diuturnidades MENSAL considerada não pode exceder 20 × RMMG = 18.400 €.
    // - a compensação TOTAL não pode exceder 12 × essa retribuição mensal, nem 240 × RMMG = 220.800 €.
    topeRetribuicaoMensalFatorRmmg: 20,
    topeRetribuicaoMensal: 18400,    // 20 × 920
    topeCompensacaoFatorRmmg: 240,
    topeCompensacaoTotal: 220800,    // 240 × 920
    divisorDias: 30,
  },

  // ── IVA — Imposto sobre o Valor Acrescentado (continente) ──
  iva: {
    normal: 0.23,            // taxa normal (geral)
    intermedia: 0.13,        // taxa intermédia (restauração não alcoólica, alguns alimentos, etc.)
    reduzida: 0.06,          // taxa reduzida (bens essenciais: pão, leite, medicamentos, livros, etc.)
    // Açores: 16 % / 9 % / 4 %. Madeira: 22 % / 12 % / 5 %. (não usar para continente)
  },

  // ── IMI — Imposto Municipal sobre Imóveis (sobre o VPT) ──
  // A taxa exata é fixada por cada município dentro do intervalo legal. A maioria aplica 0,30 %.
  imi: {
    urbanoMin: 0.003,        // prédios urbanos: 0,3 % (mínimo, maioria dos concelhos)
    urbanoMax: 0.0045,       // prédios urbanos: 0,45 % (máximo)
    urbanoPadrao: 0.003,     // valor por defeito (199+ municípios aplicam 0,30 %)
    rustico: 0.008,          // prédios rústicos: 0,8 % (uniforme em todo o país)
    // AIMI (Adicional ao IMI): incide sobre o somatório de VPT de imóveis habitacionais > 600.000 €
    // por sujeito passivo (0,7 % até 1 M€, 1 % de 1–2 M€, 1,5 % acima), fora deste helper.
  },

  // ── IMT — Imposto Municipal sobre as Transmissões Onerosas de Imóveis (continente) ──
  // Ofício Circulado AT n.º 40129/2026. Escalões +2 % vs 2025. Cálculo:
  // IMT = valor (max entre preço e VPT) × taxa marginal do escalão − parcela a abater.
  // Duas tabelas: HPP (habitação própria e permanente) vs habitação não permanente (2.ª casa/arrendamento).
  imt: {
    // (A) Prédio urbano destinado EXCLUSIVAMENTE a habitação PRÓPRIA E PERMANENTE.
    hpp: [
      { ateEuros: 106346, taxa: 0.00, abater: 0 },          // até 106.346 → isento
      { ateEuros: 145470, taxa: 0.02, abater: 2126.92 },
      { ateEuros: 198347, taxa: 0.05, abater: 6491.02 },
      { ateEuros: 330539, taxa: 0.07, abater: 10457.96 },
      { ateEuros: 660982, taxa: 0.08, abater: 13763.35 },
      { ateEuros: 1150853, taxa: 0.06, abater: 0 },         // taxa única 6 % (sem parcela a abater)
      { ateEuros: Infinity, taxa: 0.075, abater: 0 },       // taxa única 7,5 %
    ],
    // (B) Prédio urbano destinado a HABITAÇÃO (não própria e permanente: 2.ª habitação / arrendamento).
    // 1.º escalão tributado a 1 % (sem isenção) e 5.º escalão com limite superior mais baixo.
    habitacao: [
      { ateEuros: 106346, taxa: 0.01, abater: 0 },          // até 106.346 → 1 %
      { ateEuros: 145470, taxa: 0.02, abater: 1063.46 },
      { ateEuros: 198347, taxa: 0.05, abater: 5427.56 },
      { ateEuros: 330539, taxa: 0.07, abater: 9394.50 },
      { ateEuros: 633931, taxa: 0.08, abater: 12699.89 },
      { ateEuros: 1150853, taxa: 0.06, abater: 0 },         // taxa única 6 %
      { ateEuros: Infinity, taxa: 0.075, abater: 0 },       // taxa única 7,5 %
    ],
    // IMT Jovem: isenção total para HPP de jovens até 35 anos (independentes p/ IRS) até 330.539 €.
    isencaoJovemAte: 330539,
    isencaoJovemIdadeMax: 35,
  },

  // ── IUC — Imposto Único de Circulação ──
  // Ligeiros de passageiros matriculados desde 1-jul-2007 = Categoria B: soma componente de
  // CILINDRADA + componente de CO2, multiplicada por um coeficiente segundo o ANO da matrícula.
  // (Agravamentos diesel e CO2 > 180 g/km aplicam-se à parte.) As tabelas exatas €/escalão
  // atualizam-se anualmente; aqui fica o MÉTODO + coeficientes de antiguidade.
  iuc: {
    categoriaB: {
      // Coeficiente multiplicador segundo o ano da 1.ª matrícula (sobre cilindrada+CO2):
      coeficienteAntiguidade: [
        { ano: 2007, coef: 1.00 },
        { ano: 2008, coef: 1.05 },
        { ano: 2009, coef: 1.10 },
        { anoDesde: 2010, coef: 1.15 },   // 2010 em diante
      ],
      // Agravamentos adicionais (somados após o coeficiente):
      agravamentoDiesel: true,            // veículos a gasóleo pagam adicional de cilindrada
      agravamentoCo2Acima180: true,       // CO2 > 180 g/km e 1.ª matrícula PT/UE/EEE desde 2017
    },
  },

  // ── Mais-valias imobiliárias (residentes, Cat. G do IRS) ──
  maisValiasImobiliarias: {
    percTributavelResidente: 0.50,   // só 50 % da mais-valia é tributada (englobamento à taxa marginal)
    taxaAutonomaOpcional: 0.28,      // alternativa: 28 % sobre 100 % da mais-valia (sem englobamento)
    // Isenção por reinvestimento da HPP: reinvestir o produto da venda noutra HPP
    // nos 24 meses anteriores ou 36 meses posteriores à venda (proporcional se parcial).
    reinvestimentoMesesAntes: 24,
    reinvestimentoMesesDepois: 36,
    // Aquisições anteriores a 1-jan-1989 estão isentas de mais-valias.
    isencaoAquisicaoAnteriorA: '1989-01-01',
  },

  // ── Trabalho suplementar / horas extraordinárias (Código do Trabalho, art. 268.º) ──
  // Acréscimos sobre o valor da hora normal. Dois regimes consoante o n.º de horas/ano.
  horasExtra: {
    // Primeiras 100 horas suplementares no ano:
    primeiras100: {
      diaUtilPrimeiraHora: 0.25,   // +25 % (1.ª hora em dia útil)
      diaUtilSeguintes: 0.375,     // +37,5 % (horas seguintes em dia útil)
      descansoOuFeriado: 0.50,     // +50 % (descanso semanal/feriado), cada hora
    },
    // A partir da 101.ª hora suplementar no ano:
    apos100: {
      diaUtilPrimeiraHora: 0.50,   // +50 %
      diaUtilSeguintes: 0.75,      // +75 %
      descansoOuFeriado: 1.00,     // +100 %
    },
    // Limites anuais conforme dimensão da empresa:
    limiteAnualMicroPequena: 175,  // micro/pequena empresa
    limiteAnualMediaGrande: 150,   // média/grande empresa
    limiteAnualTempoParcial: 80,
    limiteDiario: 2,               // máx. 2 horas em dia normal de trabalho
  },
} as const;

/**
 * Aplica uma escala progressiva por escalões (com limite superior em €) sobre uma base anual.
 * Devolve o imposto pela soma marginal tramo a tramo. Reutilizável para IRS.
 */
export function impostoPorEscaloes(
  baseAnual: number,
  escaloes: ReadonlyArray<{ ateEuros: number; taxa: number }>,
): number {
  if (baseAnual <= 0) return 0;
  let imposto = 0;
  let anterior = 0;
  for (const e of escaloes) {
    const limite = e.ateEuros === Infinity ? Infinity : e.ateEuros;
    const noTramo = Math.min(baseAnual, limite) - anterior;
    if (noTramo <= 0) { anterior = limite; continue; }
    imposto += noTramo * e.taxa;
    anterior = limite;
    if (baseAnual <= limite) break;
  }
  return imposto;
}

/**
 * IRS anual a partir do RENDIMENTO COLETÁVEL (já líquido da dedução específica).
 * Usa as taxas marginais reais por escalão. Devolve o imposto anual (€).
 * Para o cálculo a partir do bruto, ver `irsTrabalhoDependenteAnual`.
 */
export function irsAnual(rendimentoColetavel: number): number {
  return impostoPorEscaloes(rendimentoColetavel, PORTUGAL_2026.irs.escaloes);
}

/**
 * IRS anual de um trabalhador por conta de outrem a partir do RENDIMENTO BRUTO anual.
 * Aplica a dedução específica (o maior entre 4.587,09 € e as contribuições SS pagas),
 * obtém o rendimento coletável e calcula o IRS pelas taxas marginais.
 * Opcionalmente aplica isenção IRS Jovem (% do rendimento isento, com tope 55×IAS).
 * @param brutoAnual rendimento bruto anual (Cat. A), normalmente 14 × salário mensal
 * @param contribuicoesSsAnuais contribuições obrigatórias para a SS pagas no ano (11 %)
 * @param isencaoJovem fração isenta de IRS Jovem (0–1); 0 = sem benefício
 */
export function irsTrabalhoDependenteAnual(
  brutoAnual: number,
  contribuicoesSsAnuais = 0,
  isencaoJovem = 0,
): number {
  if (brutoAnual <= 0) return 0;
  // IRS Jovem: parte do rendimento fica isenta, com tope no limite anual (55 × IAS).
  const isento = Math.min(brutoAnual * isencaoJovem, PORTUGAL_2026.irsJovem.limiteIsencaoAnual);
  const brutoTributavel = Math.max(0, brutoAnual - isento);
  // Mínimo de existência (art. 70.º CIRS): rendimento bruto tributável até 12.880 € → IRS 0
  // (é por isto que quem ganha o salário mínimo, 14 × 920, não tem retenção de IRS).
  if (brutoTributavel <= PORTUGAL_2026.irs.minimoExistenciaAnual) return 0;
  // Dedução específica = maior entre o valor base e as contribuições obrigatórias.
  const deducao = Math.max(PORTUGAL_2026.irs.deducaoEspecificaTrabalho, contribuicoesSsAnuais);
  const coletavel = Math.max(0, brutoTributavel - deducao);
  return irsAnual(coletavel);
}

/** Contribuição do trabalhador (TCO) para a Segurança Social: 11 % sobre o bruto. */
export function segSocialTrabalhador(salarioBruto: number): number {
  return Math.max(0, salarioBruto) * PORTUGAL_2026.segSocial.trabalhador;
}

/** Contribuição da entidade empregadora: 23,75 % sobre o bruto (não sai do recibo do trabalhador). */
export function segSocialEmpregador(salarioBruto: number): number {
  return Math.max(0, salarioBruto) * PORTUGAL_2026.segSocial.empregador;
}

/**
 * Contribuição mensal de trabalhador independente à Segurança Social.
 * @param rendimentoMensalFaturado valor faturado no mês (média mensal do trimestre)
 * @param prestacaoServicos true = prestação de serviços (70 % relevante); false = venda de bens (20 %)
 * @param empresarioIndividual true = taxa 25,2 %; false = taxa geral 21,4 %
 */
export function segSocialIndependente(
  rendimentoMensalFaturado: number,
  prestacaoServicos = true,
  empresarioIndividual = false,
): number {
  const ind = PORTUGAL_2026.segSocial.independente;
  const perc = prestacaoServicos ? ind.percRendimentoRelevanteServicos : ind.percRendimentoRelevanteBens;
  const baseIncidencia = Math.min(Math.max(0, rendimentoMensalFaturado) * perc, ind.baseMaximaMensal);
  const taxa = empresarioIndividual ? ind.taxaEmpresarioIndividual : ind.taxaGeral;
  return baseIncidencia * taxa;
}

/**
 * Salário líquido mensal (em mão) de um trabalhador por conta de outrem.
 * = bruto mensal − SS trabalhador (11 %) − retenção de IRS mensal.
 * A retenção de IRS aproxima-se anualizando: IRS anual (14 meses) ÷ 14.
 * @param brutoMensal salário base mensal bruto
 * @param meses n.º de meses para anualizar (14 com subsídios; 12 sem)
 * @param isencaoJovem fração isenta de IRS Jovem (0–1)
 */
export function salarioLiquido(
  brutoMensal: number,
  meses = 14,
  isencaoJovem = 0,
): { bruto: number; segSocial: number; irs: number; liquido: number } {
  const ss = segSocialTrabalhador(brutoMensal);
  const brutoAnual = brutoMensal * meses;
  const ssAnual = ss * meses;
  const irsAnualTotal = irsTrabalhoDependenteAnual(brutoAnual, ssAnual, isencaoJovem);
  const irsMensal = irsAnualTotal / meses;
  return {
    bruto: brutoMensal,
    segSocial: ss,
    irs: irsMensal,
    liquido: brutoMensal - ss - irsMensal,
  };
}

/**
 * IMT a pagar na aquisição de imóvel urbano para habitação (continente).
 * Aplica a tabela HPP (habitação própria e permanente) ou habitação (2.ª casa/arrendamento).
 * IMT = valorTributavel × taxa marginal do escalão − parcela a abater.
 * @param valor valor tributável (o maior entre preço de aquisição e VPT)
 * @param habitacaoPropria true = HPP (1.º escalão isento); false = 2.ª habitação (1.º escalão a 1 %)
 */
export function imt(valor: number, habitacaoPropria = true): number {
  if (valor <= 0) return 0;
  const tabela = habitacaoPropria ? PORTUGAL_2026.imt.hpp : PORTUGAL_2026.imt.habitacao;
  for (const escalao of tabela) {
    if (valor <= escalao.ateEuros) {
      return Math.max(0, valor * escalao.taxa - escalao.abater);
    }
  }
  // fallback (não deve ocorrer: último escalão é Infinity)
  const ultimo = tabela[tabela.length - 1];
  return Math.max(0, valor * ultimo.taxa - ultimo.abater);
}

/**
 * IMI anual sobre o Valor Patrimonial Tributário (VPT).
 * @param vpt valor patrimonial tributário do imóvel (€)
 * @param taxa taxa municipal (decimal); por defeito 0,3 % (urbano, maioria dos concelhos)
 */
export function imi(vpt: number, taxa: number = PORTUGAL_2026.imi.urbanoPadrao): number {
  return Math.max(0, vpt) * taxa;
}

/**
 * Parte do subsídio de refeição diário que fica ISENTA de IRS/SS e parte tributada.
 * @param valorDia subsídio de refeição atribuído por dia (€)
 * @param emCartao true = pago em cartão/vale (isento até 10,46 €); false = dinheiro (isento até 6,15 €)
 */
export function subsidioRefeicaoIsento(
  valorDia: number,
  emCartao = true,
): { isento: number; tributado: number; limite: number } {
  const limite = emCartao
    ? PORTUGAL_2026.subsidios.refeicao.isentoCartaoDia
    : PORTUGAL_2026.subsidios.refeicao.isentoDinheiroDia;
  const v = Math.max(0, valorDia);
  const isento = Math.min(v, limite);
  return { isento, tributado: Math.max(0, v - limite), limite };
}

/**
 * Compensação por cessação do contrato de trabalho (regime geral, contratos pós 1-out-2013).
 * = (retribuição base mensal + diuturnidades) ÷ 30 × 12 dias × anos completos de antiguidade,
 * com os topes legais (retribuição mensal ≤ 20 × RMMG; total ≤ 240 × RMMG).
 * @param retribuicaoMensal retribuição base mensal + diuturnidades (€)
 * @param anosAntiguidade anos COMPLETOS de antiguidade (fração conta proporcionalmente)
 */
export function compensacaoCessacao(retribuicaoMensal: number, anosAntiguidade: number): number {
  const c = PORTUGAL_2026.cessacao;
  const baseMensal = Math.min(Math.max(0, retribuicaoMensal), c.topeRetribuicaoMensal);
  const valorDia = baseMensal / c.divisorDias;
  const bruto = valorDia * c.diasPorAno * Math.max(0, anosAntiguidade);
  return Math.min(bruto, c.topeCompensacaoTotal);
}

/**
 * Subsídio de desemprego mensal a partir da remuneração de referência (RR).
 * = 65 % da RR, com tope superior 2,5 × IAS e piso 1,15 × IAS (se RR ≥ RMMG) ou 1 × IAS.
 * @param remuneracaoReferenciaMensal RR mensal ilíquida (média dos 12 dos últimos 14 meses, c/ férias+Natal)
 */
export function subsidioDesemprego(remuneracaoReferenciaMensal: number): number {
  const d = PORTUGAL_2026.desemprego;
  const calc = Math.max(0, remuneracaoReferenciaMensal) * d.percRemuneracaoReferencia;
  // piso: 1,15 × IAS quando a RR corresponde, pelo menos, ao salário mínimo; senão 1 × IAS.
  const piso = remuneracaoReferenciaMensal >= PORTUGAL_2026.rmmg.mensal ? d.minimoComRmmg : d.minimoIas;
  return Math.min(Math.max(calc, Math.min(piso, calc || piso)), d.topeSuperiorMensal);
}

/**
 * Formata um montante em euros com o formato português: ponto para milhares,
 * vírgula para decimais → "1.234,56 €", "920 €".
 * Usa-se 'de-DE' de propósito (mesmo critério dos restantes data files do projeto:
 * em Node/V8 'pt-PT' pode emitir variações de espaçamento/símbolo inconsistentes com a prosa dos JSONs).
 */
export function fmtEUR(n: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';
}

// ============================================================================
// EXTENSÕES 2026 — tanda de calculadoras PT (jul-2026). Só ACRESCENTA exports;
// não altera o objeto PORTUGAL_2026 nem as funções acima.
// Fontes verificadas 2026-07-18 (deep-links nos JSONs de cada calculadora).
// ============================================================================

// ── Abono de família para crianças e jovens 2026 ──
// Portaria n.º 60/2026/1. Escalões = múltiplos de (IAS × 14). Para PEDIDOS NOVOS feitos
// em 2026 usa-se o IAS de 2025 (522,50 €) → limites 3.657,50 / 7.315 / 12.435,50 / 18.287,50 €.
// (Para quem JÁ recebia, o escalão de 2026 usa o IAS de 2024 = 509,26 €.)
// Rendimento de referência = rendimentos anuais do agregado ÷ (n.º de titulares do abono + 1).
export const ABONO_FAMILIA_2026 = {
  iasBaseNovosPedidos: 522.50,   // IAS 2025 — base dos escalões para pedidos feitos em 2026
  // Limites superiores do rendimento de referência ANUAL por escalão (1.º a 4.º).
  // Acima de 18.287,50 € = 5.º escalão (sem direito a abono).
  escaloesLimite: [3657.50, 7315.00, 12435.50, 18287.50] as const,
  escaloesMultiploIas: [0.5, 1, 1.7, 2.5] as const, // × IAS × 14
  // Montante mensal base por escalão (índices 0..3 = 1.º..4.º) e faixa etária.
  montante: {
    ate36meses: [190.98, 161.65, 132.07, 88.43] as const,  // ≤ 36 meses
    de36a72meses: [75.13, 75.13, 59.33, 44.77] as const,   // 36 a 72 meses
    mais72meses: [75.13, 75.13, 54.35, 0.00] as const,     // > 72 meses (4.º escalão: 0 €)
  },
  majoracaoMonoparentalPct: 0.50,  // +50 % sobre o valor do abono (famílias monoparentais)
} as const;

/**
 * Escalão de abono de família (1..5) a partir do rendimento de referência anual do agregado.
 * 5 = sem direito (rendimento de referência > 18.287,50 €).
 */
export function abonoFamiliaEscalao(rendimentoReferenciaAnual: number): number {
  const lim = ABONO_FAMILIA_2026.escaloesLimite;
  for (let i = 0; i < lim.length; i++) if (rendimentoReferenciaAnual <= lim[i]) return i + 1;
  return 5;
}

/** Rendimento de referência do agregado = rendimentos anuais ÷ (n.º de titulares/filhos com direito + 1). */
export function abonoFamiliaRendimentoReferencia(rendimentoAnualAgregado: number, nTitulares: number): number {
  const n = Math.max(1, Math.floor(nTitulares || 1));
  return Math.max(0, rendimentoAnualAgregado) / (n + 1);
}

// ── IMT Jovem (isenção de IMT + Imposto do Selo na 1.ª habitação, ≤ 35 anos) 2026 ──
// Decreto-Lei n.º 48-A/2024. Isenção TOTAL até 330.539 €; PARCIAL entre 330.539 e 660.982 €
// (paga só sobre o excedente, ao escalão dos 8 %); acima de 660.982 € não há benefício.
export const IMT_JOVEM_2026 = {
  isencaoTotalAte: 330539,
  isencaoParcialAte: 660982,
  taxaExcedente: 0.08,       // 8 % de IMT sobre a parte acima de 330.539 € (banda parcial)
  seloAquisicao: 0.008,      // 0,8 % Imposto do Selo (verba 1.1 TGIS)
  idadeMaxima: 35,
} as const;

/**
 * IMT + Imposto do Selo com o benefício IMT Jovem (habitação própria e permanente, ≤ 35 anos).
 * Devolve o imposto pago com benefício, o imposto normal (sem benefício) e a poupança.
 */
export function imtJovem(valor: number): {
  imt: number; selo: number; imtNormal: number; seloNormal: number; poupanca: number; tipoIsencao: 'total' | 'parcial' | 'nenhuma';
} {
  const v = Math.max(0, valor);
  const j = IMT_JOVEM_2026;
  const imtNormal = imt(v, true);            // HPP, tabela do continente
  const seloNormal = v * j.seloAquisicao;
  let imtJ: number, seloJ: number, tipo: 'total' | 'parcial' | 'nenhuma';
  if (v <= j.isencaoTotalAte) {
    imtJ = 0; seloJ = 0; tipo = 'total';
  } else if (v <= j.isencaoParcialAte) {
    const excedente = v - j.isencaoTotalAte;
    imtJ = excedente * j.taxaExcedente;      // 8 % sobre o excedente
    seloJ = excedente * j.seloAquisicao;     // 0,8 % sobre o excedente
    tipo = 'parcial';
  } else {
    imtJ = imtNormal; seloJ = seloNormal; tipo = 'nenhuma';
  }
  return { imt: imtJ, selo: seloJ, imtNormal, seloNormal, poupanca: (imtNormal + seloNormal) - (imtJ + seloJ), tipoIsencao: tipo };
}

// ── AIMI — Adicional ao IMI 2026 (pessoas singulares e heranças indivisas) ──
// Art. 135.º-F CIMI. Dedução 600.000 € (1.200.000 € casal c/ tributação conjunta).
// Bandas marginais sobre o valor tributável: 0,7 % até 1 M€, 1 % de 1–2 M€, 1,5 % acima de 2 M€.
// No casal com tributação conjunta os LIMITES dos escalões duplicam (2 M€ / 4 M€).
export const AIMI_2026 = {
  deducaoSingular: 600000,
  deducaoCasal: 1200000,
  banda1Ate: 1000000, taxa1: 0.007,
  banda2Ate: 2000000, taxa2: 0.010,
  taxa3: 0.015,   // acima de 2 M€ (singular) / 4 M€ (casal)
} as const;

/**
 * AIMI anual de pessoa singular / herança indivisa sobre o somatório do VPT de prédios
 * habitacionais e terrenos para construção. `tributacaoConjunta` duplica dedução e escalões.
 */
export function aimiPessoaSingular(vptTotalHabitacional: number, tributacaoConjunta = false): number {
  const ded = tributacaoConjunta ? AIMI_2026.deducaoCasal : AIMI_2026.deducaoSingular;
  const base = Math.max(0, vptTotalHabitacional - ded);
  if (base <= 0) return 0;
  const f = tributacaoConjunta ? 2 : 1;
  return impostoPorEscaloes(base, [
    { ateEuros: AIMI_2026.banda1Ate * f, taxa: AIMI_2026.taxa1 },
    { ateEuros: AIMI_2026.banda2Ate * f, taxa: AIMI_2026.taxa2 },
    { ateEuros: Infinity, taxa: AIMI_2026.taxa3 },
  ]);
}

// ── RSI — Rendimento Social de Inserção 2026 ──
// Valor de referência atualizado para 247,56 € (46,09 % do IAS). Escala de equivalência:
// 1.º adulto 100 %; cada adulto adicional 70 % (173,29 €); cada criança/jovem < 18 anos 50 % (123,78 €).
// Prestação = valor de referência do agregado − rendimentos mensais do agregado (prestação diferencial).
export const RSI_2026 = {
  titular: 247.56,
  adultoAdicional: 173.29,   // 70 % do titular
  crianca: 123.78,           // 50 % do titular (< 18 anos)
} as const;

/** Valor de referência mensal do agregado para o RSI (soma da escala de equivalência). */
export function rsiValorReferencia(nAdultos: number, nCriancas: number): number {
  const adultos = Math.max(1, Math.floor(nAdultos || 1));
  const criancas = Math.max(0, Math.floor(nCriancas || 0));
  return RSI_2026.titular + RSI_2026.adultoAdicional * (adultos - 1) + RSI_2026.crianca * criancas;
}

// ── CSI — Complemento Solidário para Idosos 2026 ──
// Valor de referência 8.040 €/ano (≈ 670 €/mês) — casal 14.070 €/ano.
// Complemento mensal = (valor de referência − rendimentos anuais) ÷ 12 (prestação diferencial).
export const CSI_2026 = {
  referenciaIsoladoAnual: 8040,
  referenciaCasalAnual: 14070,
} as const;

// ── Layoff / suspensão do contrato 2026 (art. 305.º CT) ──
// Compensação retributiva = 2/3 da retribuição normal ilíquida, com piso na RMMG (920 €)
// e teto em 3 × RMMG (2.760 €).
export const LAYOFF_2026 = {
  fracao: 2 / 3,
  piso: 920,          // RMMG 2026
  teto: 2760,         // 3 × RMMG
} as const;

// ── Ajudas de custo e deslocação em viatura própria 2026 (Portaria 1553-D/2008 + atual.) ──
// Limites isentos de IRS/SS. Nacional 62,75 €/dia; estrangeiro 148,91 €/dia; km viatura própria 0,40 €.
export const AJUDAS_CUSTO_2026 = {
  nacionalDia: 62.75,
  estrangeiroDia: 148.91,
  kmViaturaPropria: 0.40,
} as const;

// ── Propinas do ensino superior 2026/2027 ──
// Descongelamento: máximo público (TeSP, licenciatura, mestrado integrado) 710 € (era 697 €).
export const PROPINAS_2026_27 = {
  maxPublicoAnual: 710,
  anteriorAnual: 697,
  prestacoesPadrao: 10,   // pagamento em 10 prestações (regra comum das IES públicas)
} as const;

// ── Imposto do Selo em transmissões gratuitas (heranças / doações) — verba 1.2 TGIS ──
// Taxa 10 % sobre o valor transmitido. ISENTOS: cônjuge/unido de facto, descendentes e ascendentes.
export const SELO_TRANSMISSAO_GRATUITA_2026 = {
  taxa: 0.10,
} as const;

// ── Pré-aviso de denúncia do contrato pelo trabalhador 2026 (art. 400.º CT) ──
// Contrato sem termo: 30 dias (antiguidade ≤ 2 anos) ou 60 dias (> 2 anos). Dias de calendário.
// Contrato a termo: 30 dias (duração ≥ 6 meses) ou 15 dias (< 6 meses).
export const PRE_AVISO_DEMISSAO_2026 = {
  semTermoAte2anos: 30,
  semTermoMais2anos: 60,
  termo6mesesOuMais: 30,
  termoMenos6meses: 15,
} as const;

// ── Feriados nacionais obrigatórios de Portugal em 2026 ──
// (Páscoa 05-abr → Sexta-feira Santa 03-abr; Corpo de Deus 04-jun.)
export const FERIADOS_2026: ReadonlyArray<{ data: string; nome: string }> = [
  { data: '2026-01-01', nome: 'Ano Novo' },
  { data: '2026-04-03', nome: 'Sexta-feira Santa' },
  { data: '2026-04-05', nome: 'Domingo de Páscoa' },
  { data: '2026-04-25', nome: 'Dia da Liberdade' },
  { data: '2026-05-01', nome: 'Dia do Trabalhador' },
  { data: '2026-06-04', nome: 'Corpo de Deus' },
  { data: '2026-06-10', nome: 'Dia de Portugal' },
  { data: '2026-08-15', nome: 'Assunção de Nossa Senhora' },
  { data: '2026-10-05', nome: 'Implantação da República' },
  { data: '2026-11-01', nome: 'Dia de Todos os Santos' },
  { data: '2026-12-01', nome: 'Restauração da Independência' },
  { data: '2026-12-08', nome: 'Imaculada Conceição' },
  { data: '2026-12-25', nome: 'Natal' },
];

/**
 * Conta dias corridos e dias úteis entre duas datas ISO (YYYY-MM-DD), INCLUSIVE ambos os extremos.
 * Dias úteis = segunda a sexta, excluindo os feriados fornecidos. Usa UTC para evitar erros de fuso.
 */
export function diasUteisPortugal(
  inicioISO: string,
  fimISO: string,
  feriados: ReadonlyArray<{ data: string }> = FERIADOS_2026,
): { corridos: number; uteis: number; feriadosNoIntervalo: number; fimDeSemana: number } {
  const p = (s: string) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  let cur = p(inicioISO);
  const end = p(fimISO);
  if (Number.isNaN(cur) || Number.isNaN(end) || end < cur) throw new Error('Datas inválidas: o fim tem de ser igual ou posterior ao início');
  const fset = new Set(feriados.map((f) => f.data));
  const DAY = 86400000;
  let corridos = 0, uteis = 0, feriadosNoIntervalo = 0, fimDeSemana = 0;
  for (; cur <= end; cur += DAY) {
    corridos++;
    const dt = new Date(cur);
    const dow = dt.getUTCDay(); // 0 domingo … 6 sábado
    const iso = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    const wknd = dow === 0 || dow === 6;
    const fer = fset.has(iso);
    if (wknd) fimDeSemana++;
    if (fer && !wknd) feriadosNoIntervalo++;
    if (!wknd && !fer) uteis++;
  }
  return { corridos, uteis, feriadosNoIntervalo, fimDeSemana };
}
