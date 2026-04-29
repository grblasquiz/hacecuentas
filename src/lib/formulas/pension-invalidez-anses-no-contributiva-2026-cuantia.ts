export interface Inputs {
  edad: number;
  porcentaje_invalidez: number;
  ingresos_personales: number;
  ingresos_grupo_familiar: number;
  tiene_cobertura_social: string;
}

export interface Outputs {
  monto_mensual: number;
  elegibilidad: string;
  incluye_pami: string;
  tope_recursos: number;
  excedente: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 ANSES
  const HABER_MINIMO_2026 = 264228; // ARS - haber mínimo jubilatorio vigente
  const CUANTIA_INTEGRAL = HABER_MINIMO_2026 * 0.70; // ~185.160 ARS
  const TOPE_PERSONAL_FACTOR = 3.73; // ~986.000 ARS
  const TOPE_PERSONAL = HABER_MINIMO_2026 * TOPE_PERSONAL_FACTOR;
  const TOPE_FAMILIAR_FACTOR = 5.5; // Aproximado para grupo familiar típico
  const TOPE_FAMILIAR = HABER_MINIMO_2026 * TOPE_FAMILIAR_FACTOR;

  // Validaciones
  const edad = Number(i.edad) || 0;
  const porcentaje_invalidez = Number(i.porcentaje_invalidez) || 0;
  const ingresos_personales = Number(i.ingresos_personales) || 0;
  const ingresos_grupo_familiar = Number(i.ingresos_grupo_familiar) || 0;
  const tiene_cobertura = i.tiene_cobertura_social === "si";

  // Inicializar salida
  let elegibilidad = "";
  let monto_mensual = 0;
  let incluye_pami = "Sí, automáticamente";
  let excedente = 0;

  // Criterio 1: Edad
  if (edad < 18 || edad > 64) {
    elegibilidad = `No elegible: la edad debe estar entre 18 y 64 años. Tu edad: ${edad} años.`;
    return {
      monto_mensual: 0,
      elegibilidad,
      incluye_pami: "No aplica",
      tope_recursos: TOPE_FAMILIAR,
      excedente: 0
    };
  }

  // Criterio 2: Porcentaje de invalidez
  if (porcentaje_invalidez < 66) {
    elegibilidad = `No elegible: el porcentaje de invalidez debe ser ≥66%. Tu grado: ${porcentaje_invalidez}%.`;
    return {
      monto_mensual: 0,
      elegibilidad,
      incluye_pami: "No aplica",
      tope_recursos: TOPE_FAMILIAR,
      excedente: 0
    };
  }

  // Criterio 3: No cobertura de seguridad social previa
  if (tiene_cobertura) {
    elegibilidad = "No elegible: posees cobertura de salud (obra social o prepaga). La pensión no contributiva requiere ausencia de cobertura previa.";
    return {
      monto_mensual: 0,
      elegibilidad,
      incluye_pami: "No aplica",
      tope_recursos: TOPE_FAMILIAR,
      excedente: 0
    };
  }

  // Criterio 4: Insuficiencia económica
  // Verificar ingresos totales del grupo familiar contra tope
  const ingresos_totales = ingresos_personales + ingresos_grupo_familiar;
  excedente = ingresos_totales > TOPE_FAMILIAR ? ingresos_totales - TOPE_FAMILIAR : 0;

  if (excedente > CUANTIA_INTEGRAL) {
    // Excedente muy alto, deniega pensión
    elegibilidad = `No elegible: los ingresos totales (${(ingresos_totales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}) superan significativamente el tope permitido (${TOPE_FAMILIAR.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}).`;
    return {
      monto_mensual: 0,
      elegibilidad,
      incluye_pami: "No aplica",
      tope_recursos: TOPE_FAMILIAR,
      excedente
    };
  }

  // Todos los criterios cumplen: calcular monto
  if (excedente > 0) {
    // Reducción por ingresos: fórmula oficial es compleja, aproximación conservadora
    const factor_reduccion = 1 - (excedente / TOPE_FAMILIAR) * 0.8; // Hasta 80% de reducción
    monto_mensual = Math.max(0, CUANTIA_INTEGRAL * factor_reduccion);
    elegibilidad = `Elegible con reducción: ingresos ${(ingresos_totales).toLocaleString("es-AR", { style: "currency", currency: "ARS" })} superan tope ${TOPE_FAMILIAR.toLocaleString("es-AR", { style: "currency", currency: "ARS" })} en ${(excedente).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}.`;
  } else {
    // Sin excedente, cuantía integral
    monto_mensual = CUANTIA_INTEGRAL;
    elegibilidad = `Elegible: cumple todos los requisitos. Cuantía íntegra: ${(CUANTIA_INTEGRAL).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}/mes.`;
  }

  return {
    monto_mensual: Math.round(monto_mensual),
    elegibilidad,
    incluye_pami,
    tope_recursos: TOPE_FAMILIAR,
    excedente: Math.round(Math.max(0, excedente))
  };
}
