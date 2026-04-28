// Calculadora DPP – Regra de Naegele
// Referência: FEBRASGO / Ministério da Saúde BR
// DPP = DUM + 280 dias + (ciclo - 28 dias)

export interface Inputs {
  dum: string;        // data no formato YYYY-MM-DD
  cycle_days: number; // duração do ciclo menstrual em dias (padrão 28)
}

export interface Outputs {
  dpp: string;              // Data Provável do Parto (YYYY-MM-DD)
  gestational_age: string;  // ex: "13 semanas e 2 dias"
  milestone_t1: string;     // fim 1° trimestre – 12 semanas
  milestone_morpho: string; // ultrassom morfológico – 20 semanas
  milestone_t3: string;     // início 3° trimestre – 28 semanas
  milestone_preterm: string;// termo precoce – 37 semanas
  trimester_label: string;  // "1° Trimestre", "2° Trimestre", "3° Trimestre" ou mensagem
}

// Duração padrão de uma gestação a termo em dias (Regra de Naegele)
const GESTACAO_DIAS = 280;

// Dias do ciclo de referência
const CICLO_REFERENCIA = 28;

// Marcos gestacionais em semanas (FEBRASGO)
const MARCO_FIM_T1_SEM = 12;
const MARCO_MORPHO_SEM = 20;
const MARCO_INICIO_T3_SEM = 28;
const MARCO_TERMO_PRECOCE_SEM = 37;

function addDias(data: Date, dias: number): Date {
  const result = new Date(data.getTime());
  result.setDate(result.getDate() + dias);
  return result;
}

function toISO(data: Date): string {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function semanasMarcoDias(semanas: number, ajuste: number): number {
  return semanas * 7 + ajuste;
}

export function compute(i: Inputs): Outputs {
  const dumStr = i.dum ? String(i.dum).trim() : "";
  const ciclo = Number(i.cycle_days) || CICLO_REFERENCIA;

  const vazio: Outputs = {
    dpp: "",
    gestational_age: "Informe a DUM para calcular.",
    milestone_t1: "",
    milestone_morpho: "",
    milestone_t3: "",
    milestone_preterm: "",
    trimester_label: "–"
  };

  if (!dumStr) return vazio;

  // Parse da data; aceita YYYY-MM-DD
  const dumDate = new Date(dumStr + "T00:00:00");
  if (isNaN(dumDate.getTime())) return { ...vazio, gestational_age: "Data inválida. Use o formato correto." };

  // Sanidade: DUM não pode ser no futuro (além de 1 dia de tolerância)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (dumDate > hoje) {
    return { ...vazio, gestational_age: "A DUM não pode ser uma data futura." };
  }

  // Sanidade: DUM não pode ser há mais de ~11 meses (gestação já teria terminado)
  const limitePassado = addDias(hoje, -(GESTACAO_DIAS + 14));
  if (dumDate < limitePassado) {
    return { ...vazio, gestational_age: "A DUM informada indica que a gestação já ultrapassou 42 semanas. Verifique a data." };
  }

  // Ajuste por ciclo diferente de 28 dias
  const ajusteCiclo = ciclo - CICLO_REFERENCIA;

  // DPP = DUM + 280 + ajuste
  const totalDias = GESTACAO_DIAS + ajusteCiclo;
  const dppDate = addDias(dumDate, totalDias);

  // DUM ajustada (ponto de partida para cálculo de IG)
  const dumAjustada = addDias(dumDate, ajusteCiclo);

  // Idade gestacional hoje
  const diffMs = hoje.getTime() - dumAjustada.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(diffDias / 7);
  const diasRestantes = diffDias % 7;

  let gestacionalStr: string;
  if (diffDias < 0) {
    gestacionalStr = "Gestação ainda não iniciada conforme a DUM informada.";
  } else if (semanas === 0) {
    gestacionalStr = `${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} de gestação`;
  } else if (diasRestantes === 0) {
    gestacionalStr = `${semanas} semana${semanas !== 1 ? "s" : ""} exatas`;
  } else {
    gestacionalStr = `${semanas} semana${semanas !== 1 ? "s" : ""} e ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}`;
  }

  // Trimestre atual
  let trimesterLabel: string;
  if (diffDias < 0) {
    trimesterLabel = "–";
  } else if (semanas < 12) {
    trimesterLabel = "1° Trimestre (até 12 semanas)";
  } else if (semanas < 28) {
    trimesterLabel = "2° Trimestre (12–28 semanas)";
  } else if (semanas < 42) {
    trimesterLabel = "3° Trimestre (28–42 semanas)";
  } else {
    trimesterLabel = "Gestação a termo ou além de 42 semanas";
  }

  // Marcos: calculados a partir da DUM ajustada
  const milestoneT1 = addDias(dumAjustada, semanasMarcoDias(MARCO_FIM_T1_SEM, 0));
  const milestoneMorpho = addDias(dumAjustada, semanasMarcoDias(MARCO_MORPHO_SEM, 0));
  const milestoneT3 = addDias(dumAjustada, semanasMarcoDias(MARCO_INICIO_T3_SEM, 0));
  const milestonePreterm = addDias(dumAjustada, semanasMarcoDias(MARCO_TERMO_PRECOCE_SEM, 0));

  return {
    dpp: toISO(dppDate),
    gestational_age: gestacionalStr,
    milestone_t1: toISO(milestoneT1),
    milestone_morpho: toISO(milestoneMorpho),
    milestone_t3: toISO(milestoneT3),
    milestone_preterm: toISO(milestonePreterm),
    trimester_label: trimesterLabel
  };
}
