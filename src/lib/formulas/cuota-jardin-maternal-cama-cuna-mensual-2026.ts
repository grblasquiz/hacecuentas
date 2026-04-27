export interface Inputs {
  ciudad: string;
  tipo: string;
  sala: string;
  turno: string;
  incluye_comida: string;
  meses_año: number;
}

export interface Outputs {
  cuota_mensual: number;
  matricula: number;
  extras_mes: number;
  costo_anual_total: number;
  detalle: string;
}

export function compute(i: Inputs): Outputs {
  const meses = Math.max(1, Math.min(12, Math.round(Number(i.meses_año) || 10)));

  // --- Bases por zona (ARS 2026, privado medio, sala 1 año, jornada completa, sin comida) ---
  // Fuente: relevamiento AFPSA / CAIAF + precios de mercado Q1-2026
  const BASE_ZONA: Record<string, number> = {
    caba: 210000,
    gba_norte: 165000,
    gba_sur_oeste: 130000,
    interior_grande: 115000,
    interior_medio: 95000,
    interior_chico: 72000,
  };

  // --- Factores por tipo de institución ---
  const FACTOR_TIPO: Record<string, number> = {
    estatal: 0,
    cooperativo: 0.35,
    privado_basico: 0.75,
    privado_medio: 1.0,
    privado_premium: 1.65,
  };

  // --- Factores por sala (ratio docente/niño más alto en bebés más chicos) ---
  const FACTOR_SALA: Record<string, number> = {
    lactario: 1.3,
    cuna: 1.15,
    sala1: 1.0,
    sala2: 0.92,
  };

  // --- Factores por turno ---
  const FACTOR_TURNO: Record<string, number> = {
    simple: 0.6,
    extendido: 0.8,
    completo: 1.0,
  };

  // --- Adicional comida (desayuno + almuerzo + merienda) ARS 2026 ---
  const ADICIONAL_COMIDA = 22000;

  // --- Ratio matrícula sobre cuota mensual ---
  // Privado medio/premium: 1.5x; privado básico/cooperativo: 0.8x; estatal: 0
  const RATIO_MATRICULA: Record<string, number> = {
    estatal: 0,
    cooperativo: 0.8,
    privado_basico: 0.8,
    privado_medio: 1.5,
    privado_premium: 1.5,
  };

  // --- Ratio extras mensuales (materiales, seguro, cooperadora) ---
  const RATIO_EXTRAS = 0.04; // ~4% de la cuota base sin comida

  const baseZona = BASE_ZONA[i.ciudad] ?? BASE_ZONA["interior_medio"];
  const factorTipo = FACTOR_TIPO[i.tipo] ?? 1.0;
  const factorSala = FACTOR_SALA[i.sala] ?? 1.0;
  const factorTurno = FACTOR_TURNO[i.turno] ?? 1.0;
  const ratioMatricula = RATIO_MATRICULA[i.tipo] ?? 1.5;

  if (i.tipo === "estatal") {
    return {
      cuota_mensual: 0,
      matricula: 0,
      extras_mes: 0,
      costo_anual_total: 0,
      detalle:
        "Los jardines estatales son gratuitos, pero tienen vacantes muy limitadas. " +
        "Anotate en lista de espera desde el embarazo.",
    };
  }

  const cuota_base = baseZona * factorTipo * factorSala * factorTurno;
  const cuota_mensual =
    cuota_base + (i.incluye_comida === "si" ? ADICIONAL_COMIDA : 0);
  const matricula = cuota_mensual * ratioMatricula;
  const extras_mes = cuota_base * RATIO_EXTRAS;
  const costo_anual_total = (cuota_mensual + extras_mes) * meses + matricula;

  const zonaLabel: Record<string, string> = {
    caba: "CABA",
    gba_norte: "GBA Norte",
    gba_sur_oeste: "GBA Sur/Oeste",
    interior_grande: "Interior ciudad grande",
    interior_medio: "Interior ciudad mediana",
    interior_chico: "Interior ciudad pequeña",
  };
  const tipoLabel: Record<string, string> = {
    cooperativo: "cooperativo/comunitario",
    privado_basico: "privado básico",
    privado_medio: "privado medio",
    privado_premium: "privado premium/bilingüe",
  };
  const salaLabel: Record<string, string> = {
    lactario: "Lactario (45d–3m)",
    cuna: "Sala Cuna (4–11m)",
    sala1: "Sala 1 año",
    sala2: "Sala 2 años",
  };
  const turnoLabel: Record<string, string> = {
    simple: "simple (4 hs)",
    extendido: "extendido (6 hs)",
    completo: "jornada completa (8 hs)",
  };

  const detalle =
    `Zona: ${zonaLabel[i.ciudad] ?? i.ciudad} — ` +
    `${tipoLabel[i.tipo] ?? i.tipo} — ` +
    `${salaLabel[i.sala] ?? i.sala} — ` +
    `Turno ${turnoLabel[i.turno] ?? i.turno}. ` +
    `Comida ${i.incluye_comida === "si" ? "incluida" : "no incluida"}. ` +
    `Base zona: $${baseZona.toLocaleString("es-AR")} × ` +
    `tipo(${factorTipo}) × sala(${factorSala}) × turno(${factorTurno}) = ` +
    `$${Math.round(cuota_base).toLocaleString("es-AR")}. ` +
    `Proyección a ${meses} mes${meses === 1 ? "" : "es"} + matrícula.`;

  return {
    cuota_mensual: Math.round(cuota_mensual),
    matricula: Math.round(matricula),
    extras_mes: Math.round(extras_mes),
    costo_anual_total: Math.round(costo_anual_total),
    detalle,
  };
}
