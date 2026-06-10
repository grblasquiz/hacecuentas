import { MEI_LIMITE_FATURAMENTO, DAS_MEI } from '../data/brasil-2026';

export interface Inputs {
  faturamento_mensal: number;
  categoria: string;
}

export interface Outputs {
  limite_anual: number;
  faturamento_anual_estimado: number;
  percentual_consumido: number;
  margem_restante: number;
  das_mensal: number;
  status_enquadramento: string;
  alerta_risco: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Fonte única src/lib/data/brasil-2026.ts (LC 128/2008; DAS sobre SM 2026 R$ 1.621).
  const LIMITE_MEI_2026 = MEI_LIMITE_FATURAMENTO;
  const DAS_COMERCIO = DAS_MEI.comercio;   // INSS 5% + ICMS
  const DAS_SERVICOS = DAS_MEI.servicos;   // INSS 5% + ISS
  const DAS_INDUSTRIA = DAS_MEI.comercio;  // indústria recolhe ICMS, igual ao comércio

  const faturamento_mensal = Number(i.faturamento_mensal) || 0;
  const categoria = String(i.categoria) || "servicos";

  if (faturamento_mensal < 0) {
    return {
      limite_anual: LIMITE_MEI_2026,
      faturamento_anual_estimado: 0,
      percentual_consumido: 0,
      margem_restante: LIMITE_MEI_2026,
      das_mensal: 0,
      status_enquadramento: "Entrada inválida",
      alerta_risco: "Insira faturamento mensal positivo"
    };
  }

  const faturamento_anual = faturamento_mensal * 12;
  const percentual_consumido = (faturamento_anual / LIMITE_MEI_2026) * 100;
  const margem_restante = Math.max(0, LIMITE_MEI_2026 - faturamento_anual);

  let das_mensal = 0;
  if (categoria === "comercio") {
    das_mensal = DAS_COMERCIO;
  } else if (categoria === "servicos") {
    das_mensal = DAS_SERVICOS;
  } else if (categoria === "industria") {
    das_mensal = DAS_INDUSTRIA;
  }

  let status_enquadramento = "";
  let alerta_risco = "";

  if (percentual_consumido <= 60) {
    status_enquadramento = "✅ Seguro – Dentro do limite MEI";
    alerta_risco = "Nenhum risco. Continue monitorando.";
  } else if (percentual_consumido <= 80) {
    status_enquadramento = "⚠️ Atenção – Aproximando-se do limite";
    alerta_risco = "Você está consumindo mais de 60% do limite. Planeje crescimento cuidadosamente para não ultrapassar R$81.000.";
  } else if (percentual_consumido < 100) {
    status_enquadramento = "🔴 Crítico – Risco iminente de desenquadramento";
    alerta_risco = `Faturamento anual estimado (R$${faturamento_anual.toFixed(2)}) está acima de 80% do limite (R$81.000). Risco muito alto de desenquadramento automático e migração forçada para Simples Nacional.`;
  } else {
    status_enquadramento = "❌ Desenquadrado – Limite MEI ultrapassado";
    alerta_risco = `Faturamento anual (R$${faturamento_anual.toFixed(2)}) ultrapassou o limite MEI de R$81.000 em R$${(faturamento_anual - LIMITE_MEI_2026).toFixed(2)}. Desenquadramento automático. Migração obrigatória para Simples Nacional (alíquota 6–17,42%). Procure contador imediatamente.`;
  }

  const pct = Math.round(percentual_consumido * 100) / 100;
  const margem = Math.round(margem_restante * 100) / 100;
  const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Insight dinâmico conforme a faixa de consumo do limite
  let insight_tone: "good" | "warn" | "neutral";
  let insight_text: string;
  if (percentual_consumido <= 60) {
    insight_tone = "good";
    insight_text = `Projetando R$${fmtBRL(faturamento_anual)} no ano, você usa **${pct}%** do limite MEI e ainda tem **R$${fmtBRL(margem)}** de margem. Folga confortável para crescer.`;
  } else if (percentual_consumido <= 80) {
    insight_tone = "warn";
    insight_text = `Sua projeção anual (R$${fmtBRL(faturamento_anual)}) já consome **${pct}%** do teto. Restam só **R$${fmtBRL(margem)}** — planeje o crescimento para não estourar os R$81.000.`;
  } else if (percentual_consumido < 100) {
    insight_tone = "warn";
    insight_text = `Atenção: **${pct}%** do limite consumido (R$${fmtBRL(faturamento_anual)} projetados). Com apenas **R$${fmtBRL(margem)}** de margem, o risco de desenquadramento é alto.`;
  } else {
    insight_tone = "warn";
    insight_text = `Sua projeção (R$${fmtBRL(faturamento_anual)}) ultrapassa o teto MEI em **R$${fmtBRL(faturamento_anual - LIMITE_MEI_2026)}** (**${pct}%**). Desenquadramento automático: procure um contador.`;
  }
  const _insight = {
    title: "Sua situação no MEI",
    text: insight_text,
    tone: insight_tone,
    icon: "🇧🇷",
  };

  // Gauge: % do limite consumido, com faixas oficiais (60% / 80% / 100%)
  const ultimoMax = Math.max(120, Math.ceil(pct) + 10);
  const _chart = {
    type: "scale" as const,
    marker: pct,
    markerLabel: `${pct}% do limite`,
    min: 0,
    unit: "%",
    segments: [
      { nombre: "Seguro", max: 60, color: "#bbf7d0", colorDark: "#166534" },
      { nombre: "Atenção", max: 80, color: "#fef08a", colorDark: "#854d0e" },
      { nombre: "Crítico", max: 100, color: "#fed7aa", colorDark: "#9a3412" },
      { nombre: "Desenquadrado", max: ultimoMax, color: "#fecaca", colorDark: "#991b1b" },
    ],
    ariaLabel: "Medidor do percentual do limite MEI consumido: seguro, atenção, crítico e desenquadrado.",
  };

  return {
    limite_anual: LIMITE_MEI_2026,
    faturamento_anual_estimado: Math.round(faturamento_anual * 100) / 100,
    percentual_consumido: pct,
    margem_restante: margem,
    das_mensal: das_mensal,
    status_enquadramento: status_enquadramento,
    alerta_risco: alerta_risco,
    _insight,
    _chart
  };
}
