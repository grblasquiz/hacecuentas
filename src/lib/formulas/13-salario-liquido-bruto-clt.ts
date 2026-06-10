// Calculadora 13° Salário Líquido CLT — Hacé Cuentas
// Fontes: Lei 4.090/1962; INSS/IRRF 2026 importados da fonte única
// src/lib/data/brasil-2026.ts (teto INSS R$ 8.475,55; IRRF tabela mai/2025 +
// redutor 2026 da reforma — isenção efetiva até R$ 5.000 de base).

import {
  calcINSS,
  calcIRRF2026,
  IRRF_DEDUCAO_DEPENDENTE,
  IRRF_FAIXAS,
} from "../data/brasil-2026";

export interface Inputs {
  salario_bruto: number;
  meses_trabalhados: string; // "1" a "12"
  dependentes: string; // "0" a "5"
}

export interface Outputs {
  decimo_terceiro_bruto: number;
  primeira_parcela: number;
  inss_desconto: number;
  base_irrf: number;
  irrf_desconto: number;
  segunda_parcela: number;
  liquido_total: number;
  aliquota_efetiva_irrf: number;
  detalhamento: string;
  _insight?: any;
  _chart?: any;
}

// INSS progressivo e IRRF (tabela cheia + redutor 2026): implementação única
// em src/lib/data/brasil-2026.ts, compartilhada com o simulador de holerite.

/** IRRF 2026 (com redutor da reforma) + alíquota nominal da faixa da base. */
function calcularIRRF(baseCalculo: number): { irrf: number; aliquotaNominal: number } {
  if (baseCalculo <= 0) return { irrf: 0, aliquotaNominal: 0 };
  const irrf = Math.round(calcIRRF2026(baseCalculo) * 100) / 100;
  const faixa = IRRF_FAIXAS.find((f) => baseCalculo <= f.ate) ?? IRRF_FAIXAS[IRRF_FAIXAS.length - 1];
  return { irrf, aliquotaNominal: faixa.aliquota };
}

function fmt(valor: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function compute(i: Inputs): Outputs {
  const salarioBruto = Number(i.salario_bruto) || 0;
  const meses = Math.min(12, Math.max(1, parseInt(i.meses_trabalhados, 10) || 12));
  const dependentes = Math.min(10, Math.max(0, parseInt(i.dependentes, 10) || 0));

  // Validação básica
  if (salarioBruto <= 0) {
    return {
      decimo_terceiro_bruto: 0,
      primeira_parcela: 0,
      inss_desconto: 0,
      base_irrf: 0,
      irrf_desconto: 0,
      segunda_parcela: 0,
      liquido_total: 0,
      aliquota_efetiva_irrf: 0,
      detalhamento: "Informe um salário bruto válido para calcular o 13° salário.",
    };
  }

  // 1. 13° Bruto Proporcional
  const decimoTerceiroBruto = Math.round((salarioBruto * meses / 12) * 100) / 100;

  // 2. 1ª Parcela (50% do bruto, sem descontos)
  const primeiraParcela = Math.round(decimoTerceiroBruto * 0.5 * 100) / 100;

  // 3. INSS — calculado sobre o bruto integral do 13°
  const inssDesconto = calcINSS(decimoTerceiroBruto);

  // 4. Base IRRF = 13° Bruto − INSS − (dependentes × dedução)
  const deducaoDependentes = dependentes * IRRF_DEDUCAO_DEPENDENTE;
  const baseIRRF = Math.max(0, Math.round((decimoTerceiroBruto - inssDesconto - deducaoDependentes) * 100) / 100);

  // 5. IRRF sobre base
  const { irrf: irrfDesconto, aliquotaNominal } = calcularIRRF(baseIRRF);

  // 6. 2ª Parcela líquida = metade do bruto − INSS − IRRF (descontos na 2ª)
  const segundaParcelaLiquida = Math.round((primeiraParcela - inssDesconto - irrfDesconto) * 100) / 100;

  // 7. Líquido total
  const liquidoTotal = Math.round((primeiraParcela + segundaParcelaLiquida) * 100) / 100;

  // 8. Alíquota efetiva IRRF
  const aliquotaEfetiva = decimoTerceiroBruto > 0
    ? Math.round((irrfDesconto / decimoTerceiroBruto) * 10000) / 100
    : 0;

  // 9. Detalhamento textual
  const proporcionalStr = meses < 12 ? ` (${meses}/12 — proporcional)` : " (ano completo)";
  const dependentesStr = dependentes > 0
    ? `Dedução dependentes: R$ ${fmt(deducaoDependentes)} (${dependentes} dep. × R$ ${fmt(IRRF_DEDUCAO_DEPENDENTE)}). `
    : "Sem dedução de dependentes. ";
  const inssAliquota = inssDesconto > 0
    ? `Alíquota efetiva INSS: ${fmt((inssDesconto / decimoTerceiroBruto) * 100)}%. `
    : "";
  const irrfStr = irrfDesconto > 0
    ? `IRRF: alíquota nominal ${(aliquotaNominal * 100).toFixed(1)}%, efetiva ${fmt(aliquotaEfetiva)}%. `
    : "IRRF: isento (redutor 2026 — base até R$ 5.000 não paga IR). ";

  const detalhamento =
    `13° bruto${proporcionalStr}: R$ ${fmt(decimoTerceiroBruto)}. ` +
    `1ª parcela (sem descontos): R$ ${fmt(primeiraParcela)}. ` +
    `INSS progressivo: R$ ${fmt(inssDesconto)}. ${inssAliquota}` +
    `Base IRRF: R$ ${fmt(baseIRRF)}. ${dependentesStr}` +
    irrfStr +
    `2ª parcela líquida: R$ ${fmt(segundaParcelaLiquida)}. ` +
    `Líquido total (1ª + 2ª): R$ ${fmt(liquidoTotal)}.`;

  // --- Insight narrativo ---
  const totalDescontos = Math.round((inssDesconto + irrfDesconto) * 100) / 100;
  const pctLiquido = decimoTerceiroBruto > 0
    ? Math.round((liquidoTotal / decimoTerceiroBruto) * 100)
    : 0;
  const pctDescontos = 100 - pctLiquido;

  let insightText: string;
  let insightTone: "good" | "warn" | "neutral";
  if (totalDescontos <= 0) {
    insightText = `Tu 13° de **R$ ${fmt(decimoTerceiroBruto)}** cae na faixa de isenção: sem INSS nem IRRF, você recebe os **R$ ${fmt(liquidoTotal)}** integrais.`;
    insightTone = "good";
  } else if (pctDescontos >= 20) {
    insightText = `Dos **R$ ${fmt(decimoTerceiroBruto)}** brutos, **R$ ${fmt(totalDescontos)}** (${pctDescontos}%) vão pra INSS + IRRF e sobram **R$ ${fmt(liquidoTotal)}** líquidos. O desconto pesa: confira se vale antecipar gastos.`;
    insightTone = "warn";
  } else {
    insightText = `Do 13° bruto de **R$ ${fmt(decimoTerceiroBruto)}**, descontam **R$ ${fmt(totalDescontos)}** (${pctDescontos}%) e você fica com **R$ ${fmt(liquidoTotal)}** líquidos (${pctLiquido}% do bruto).`;
    insightTone = "neutral";
  }

  const insight = {
    title: "Quanto sobra do seu 13°",
    text: insightText,
    tone: insightTone,
    icon: "💸",
  };

  // --- Gráfico: composição do 13° bruto (líquido + INSS + IRRF) ---
  const chart = totalDescontos > 0
    ? {
        type: "doughnut" as const,
        slices: [
          { label: "Líquido", value: liquidoTotal },
          { label: "INSS", value: inssDesconto },
          { label: "IRRF", value: irrfDesconto },
        ],
        prefix: "R$ ",
        centerValue: "R$ " + fmt(decimoTerceiroBruto),
        centerLabel: "13° bruto",
        ariaLabel: "Composição do 13° salário bruto: parte líquida, desconto de INSS e desconto de IRRF.",
      }
    : undefined;

  return {
    decimo_terceiro_bruto: decimoTerceiroBruto,
    primeira_parcela: primeiraParcela,
    inss_desconto: inssDesconto,
    base_irrf: baseIRRF,
    irrf_desconto: irrfDesconto,
    segunda_parcela: segundaParcelaLiquida,
    liquido_total: liquidoTotal,
    aliquota_efetiva_irrf: aliquotaEfetiva,
    detalhamento,
    _insight: insight,
    ...(chart ? { _chart: chart } : {}),
  };
}
