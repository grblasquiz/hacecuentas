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
  _insight?: any;
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
      excedente: 0,
      _insight: {
        title: 'Fuera del rango de edad',
        text: `La pensión por invalidez no contributiva cubre de **18 a 64 años**. Con **${edad} años** ${edad > 64 ? 'correspondería evaluar la jubilación o PUAM' : 'aún no aplica'}.`,
        tone: 'warn',
        icon: '🎂',
      }
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
      excedente: 0,
      _insight: {
        title: 'No alcanza el grado de invalidez',
        text: `Se exige una invalidez **≥66%** y tu grado es del **${porcentaje_invalidez}%**. Sin ese mínimo certificado por junta médica, ANSES no otorga la pensión.`,
        tone: 'warn',
        icon: '🩺',
      }
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
      excedente: 0,
      _insight: {
        title: 'Ya tenés cobertura de salud',
        text: 'La pensión no contributiva exige **no tener obra social ni prepaga**. Al contar con cobertura propia, no se cumple este requisito de vulnerabilidad.',
        tone: 'warn',
        icon: '🏥',
      }
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
      excedente,
      _insight: {
        title: 'Ingresos por encima del tope',
        text: `Los ingresos del grupo familiar (**${ingresos_totales.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}**) superan el tope de **${TOPE_FAMILIAR.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}** en **${excedente.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}**, lo que excede el margen de vulnerabilidad y deniega la pensión.`,
        tone: 'warn',
        icon: '💸',
      }
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

  const fmtARS = (v: number) =>
    v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  const insight: any = excedente > 0
    ? {
        title: 'Elegible, pero con reducción por ingresos',
        text: `Cumplís los requisitos, pero los ingresos superan el tope en **${fmtARS(excedente)}**, así que la cuantía baja de ${fmtARS(CUANTIA_INTEGRAL)} a **${fmtARS(monto_mensual)}/mes**. Incluye **PAMI** automáticamente.`,
        tone: 'warn',
        icon: '⚖️',
      }
    : {
        title: 'Cumplís todos los requisitos',
        text: `Accedés a la **cuantía íntegra de ${fmtARS(monto_mensual)}/mes** (70% del haber mínimo) con cobertura de **PAMI** incluida automáticamente.`,
        tone: 'good',
        icon: '✅',
      };

  return {
    monto_mensual: Math.round(monto_mensual),
    elegibilidad,
    incluye_pami,
    tope_recursos: TOPE_FAMILIAR,
    excedente: Math.round(Math.max(0, excedente)),
    _insight: insight
  };
}
