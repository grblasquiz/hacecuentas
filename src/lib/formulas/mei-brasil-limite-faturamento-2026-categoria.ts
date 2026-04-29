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
}

export function compute(i: Inputs): Outputs {
  const LIMITE_MEI_2026 = 81000; // Lei Complementar 128/2008, em vigor desde 2018
  const DAS_COMERCIO = 70;
  const DAS_SERVICOS = 75;
  const DAS_INDUSTRIA = 75;

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

  return {
    limite_anual: LIMITE_MEI_2026,
    faturamento_anual_estimado: Math.round(faturamento_anual * 100) / 100,
    percentual_consumido: Math.round(percentual_consumido * 100) / 100,
    margem_restante: Math.round(margem_restante * 100) / 100,
    das_mensal: das_mensal,
    status_enquadramento: status_enquadramento,
    alerta_risco: alerta_risco
  };
}
