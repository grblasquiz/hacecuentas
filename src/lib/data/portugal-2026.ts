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
