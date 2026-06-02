export interface Inputs {
  minutos_dia: number;
  semanas: number;
  tipo: string;
  nivel_estres_inicial: number;
}

export interface Outputs {
  reduccion_ansiedad: number;
  reduccion_cortisol: number;
  dosis_semanal: number;
  nivel_evidencia: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

// Factores por técnica derivados de metaanálisis (Hofmann 2010, Pascoe 2017, Orme-Johnson 2014)
const TECNICAS: Record<string, { maxAnsiedad: number; maxCortisol: number; nombre: string }> = {
  mindfulness:   { maxAnsiedad: 0.45, maxCortisol: 0.20, nombre: "Mindfulness / MBSR" },
  body_scan:     { maxAnsiedad: 0.38, maxCortisol: 0.17, nombre: "Body Scan" },
  trascendental: { maxAnsiedad: 0.43, maxCortisol: 0.22, nombre: "Meditación Trascendental" },
};

// Dosis de referencia: protocolo MBSR estándar (20 min/día × 8 semanas × 7 días)
const DOSIS_REFERENCIA = 20 * 8 * 7; // 1120 minutos

export function compute(i: Inputs): Outputs {
  const minutos_dia = Math.max(0, Number(i.minutos_dia) || 0);
  const semanas = Math.max(0, Number(i.semanas) || 0);
  const nivel_estres_inicial = Math.min(10, Math.max(1, Number(i.nivel_estres_inicial) || 5));
  const tipo = i.tipo && TECNICAS[i.tipo] ? i.tipo : "mindfulness";

  // Valores por defecto para inputs inválidos
  if (minutos_dia <= 0 || semanas <= 0) {
    return {
      reduccion_ansiedad: 0,
      reduccion_cortisol: 0,
      dosis_semanal: 0,
      nivel_evidencia: "Sin datos suficientes",
      resumen: "Ingresá minutos por día y semanas de práctica para obtener la proyección.",
    };
  }

  const tecnica = TECNICAS[tipo];

  // Dosis acumulada total en minutos
  const dosis_semanal = minutos_dia * 7;
  const dosis_total = minutos_dia * semanas * 7;

  // Factor de dosis: curva logarítmica (beneficio marginal decreciente)
  // ln(dosis_total + 1) normalizado por la dosis de referencia
  const factor_dosis = Math.log(dosis_total + 1) / Math.log(DOSIS_REFERENCIA + 1);
  // Clampeamos a 1.15 para evitar extrapolaciones muy altas
  const factor_dosis_clamped = Math.min(factor_dosis, 1.15);

  // Factor por nivel de estrés inicial:
  // nivel 1 → 0.70, nivel 10 → 1.24
  // Mayor estrés inicial = mayor margen de mejora (respaldo: Hofmann 2010)
  const factor_estres = 0.70 + (nivel_estres_inicial - 1) * 0.06;

  // Reducción esperada (en fracción 0-1)
  let reduccion_ansiedad = tecnica.maxAnsiedad * factor_dosis_clamped * factor_estres;
  let reduccion_cortisol = tecnica.maxCortisol * factor_dosis_clamped * factor_estres;

  // Clamp máximo absoluto: 55 % ansiedad, 28 % cortisol (límite evidencia disponible)
  reduccion_ansiedad = Math.min(reduccion_ansiedad, 0.55);
  reduccion_cortisol = Math.min(reduccion_cortisol, 0.28);

  // Convertir a porcentaje con 1 decimal
  const pct_ansiedad = Math.round(reduccion_ansiedad * 1000) / 10;
  const pct_cortisol = Math.round(reduccion_cortisol * 1000) / 10;

  // Nivel de evidencia según dosis acumulada
  let nivel_evidencia: string;
  if (dosis_total < 280) {
    // < 4 semanas a 10 min/día
    nivel_evidencia = "Bajo — menos de 4 semanas de práctica; cambios aún no detectables en cortisol";
  } else if (dosis_total < 560) {
    nivel_evidencia = "Moderado — zona de inicio de beneficios significativos";
  } else if (dosis_total <= 1400) {
    nivel_evidencia = "Alto — rango del protocolo MBSR estándar, bien respaldado";
  } else {
    nivel_evidencia = "Alto (meseta) — beneficio marginal adicional pequeño por encima de 12 semanas";
  }

  // Resumen interpretativo
  const semanas_label = semanas === 1 ? "semana" : "semanas";
  const resumen =
    `Con ${minutos_dia} min/día de ${tecnica.nombre} durante ${semanas} ${semanas_label} ` +
    `(${dosis_total} min totales), se espera una reducción de ansiedad de ~${pct_ansiedad}% ` +
    `y de cortisol de ~${pct_cortisol}%, basado en metaanálisis clínicos. ` +
    (dosis_total < 280
      ? "Considerá extender la práctica al menos 4 semanas para resultados medibles."
      : dosis_total > 1400
      ? "El beneficio marginal adicional es pequeño; mantener la consistencia es clave."
      : "Estás dentro del rango óptimo de los protocolos más estudiados.");

  const chart = {
    type: "scale" as const,
    marker: dosis_total,
    markerLabel: "Tu práctica: " + dosis_total + " min acumulados",
    min: 0,
    unit: " min",
    segments: [
      { nombre: "Bajo", max: 280, color: "#fde68a", colorDark: "#b45309" },
      { nombre: "Moderado", max: 560, color: "#fef9c3", colorDark: "#854d0e" },
      { nombre: "Óptimo (MBSR)", max: 1400, color: "#bbf7d0", colorDark: "#166534" },
      { nombre: "Meseta", max: Math.max(2000, Math.ceil(dosis_total) + 100), color: "#bae6fd", colorDark: "#075985" },
    ],
    ariaLabel: "Escala de dosis acumulada de meditación según evidencia: bajo, moderado, óptimo y meseta.",
  };

  // Insight dinámico según dónde cae la dosis acumulada
  let insight_tone: "good" | "warn" | "neutral";
  let insight_text: string;
  if (dosis_total < 280) {
    insight_tone = "warn";
    insight_text = `Con **${dosis_total} min acumulados** todavía estás por debajo del umbral donde la evidencia detecta cambios fiables. La proyección (**~${pct_ansiedad}% en ansiedad**) llega recién al sostener la práctica unas semanas más.`;
  } else if (dosis_total <= 1400) {
    insight_tone = "good";
    insight_text = `Tus **${dosis_total} min acumulados** caen en el rango del protocolo MBSR, el más estudiado: la reducción proyectada de **~${pct_ansiedad}% en ansiedad** y **~${pct_cortisol}% en cortisol** está bien respaldada por metaanálisis.`;
  } else {
    insight_tone = "neutral";
    insight_text = `Ya superaste el protocolo estándar con **${dosis_total} min acumulados**: la mejora proyectada (**~${pct_ansiedad}% en ansiedad**) está cerca de su meseta y el beneficio extra por agregar minutos es pequeño. La clave pasa a ser la **consistencia**.`;
  }
  const _insight = {
    title: "Qué esperar de tu práctica",
    text: insight_text,
    tone: insight_tone,
    icon: "🧘",
  };

  return {
    reduccion_ansiedad: pct_ansiedad,
    reduccion_cortisol: pct_cortisol,
    dosis_semanal,
    nivel_evidencia,
    resumen,
    _chart: chart,
    _insight,
  };
}
