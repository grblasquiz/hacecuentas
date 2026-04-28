export interface Inputs {
  salario_integrado: number;
  antiguedad_anos: number;
  subcuenta_vivienda: number;
  edad_anos: number;
  esquema: 'tradicional' | 'vsm' | 'mejoravit';
  tasa_interes_anual?: number;
}

export interface Outputs {
  puntaje_infonavit: number;
  calificacion: string;
  monto_maximo_credito: number;
  poder_adquisitivo: number;
  cuota_mensual: number;
  plazo_maximo_meses: number;
  salario_minimo_referencia: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México - INFONAVIT, CONASAMI
  const PUNTAJE_MINIMO = 1080; // SAT INFONAVIT 2026
  const SALARIO_MINIMO_CDMX_DIARIO_2026 = 312.41; // CONASAMI 2026-01-01
  const SALARIO_MINIMO_MENSUAL_2026 = SALARIO_MINIMO_CDMX_DIARIO_2026 * 30; // ~9,372.30
  const VSM_MAXIMO = 25; // Límite legal CDMX
  const TASA_INTERES_DEFAULT = 0.07; // 7% anual por defecto 2026
  const COEFICIENTE_PODER_ADQUISITIVO = 12.6; // Factor INFONAVIT 2026
  const FACTOR_RIESGO_CREDITICIO = 0.60; // Coeficiente tradicional 2026
  const EDAD_RETIRO = 65; // Edad máxima crédito INFONAVIT
  const PLAZO_MAXIMO_MESES = 360; // 30 años máximo

  // Validaciones básicas
  const salario = Math.max(i.salario_integrado, 0);
  const antiguedad = Math.max(i.antiguedad_anos, 0);
  const subcuenta = Math.max(i.subcuenta_vivienda, 0);
  const edad = Math.max(i.edad_anos, 18);
  const tasa = i.tasa_interes_anual ? i.tasa_interes_anual / 100 : TASA_INTERES_DEFAULT;

  // 1. CÁLCULO DE PUNTAJE INFONAVIT
  // Fórmula: (antigüedad × 10) + (subcuenta ÷ 250) + (edad × 5)
  const puntaje_antiguedad = antiguedad * 10;
  const puntaje_subcuenta = Math.floor(subcuenta / 250);
  const puntaje_edad = edad * 5;
  const puntaje_total = puntaje_antiguedad + puntaje_subcuenta + puntaje_edad;

  // 2. DETERMINACIÓN DE CALIFICACIÓN
  let calificacion = 'NO CALIFICA';
  if (puntaje_total >= PUNTAJE_MINIMO) {
    calificacion = 'CALIFICA';
  } else if (puntaje_total >= PUNTAJE_MINIMO - 200) {
    calificacion = 'MARGINAL (Revisar con INFONAVIT)';
  }

  // 3. CÁLCULO DE PODER ADQUISITIVO
  // Esquema Tradicional: Salario × 12.6 × 0.60 (factor riesgo 2026)
  // Esquema VSM: Salario × (25 VSM × Sal Min) - más conservador
  let poder_adquisitivo = 0;

  if (i.esquema === 'tradicional' || i.esquema === 'mejoravit') {
    // Poder adquisitivo = Salario × coef × factor riesgo
    poder_adquisitivo = salario * COEFICIENTE_PODER_ADQUISITIVO * FACTOR_RIESGO_CREDITICIO;
  } else if (i.esquema === 'vsm') {
    // VSM: capacidad en veces salario mínimo
    // Aproximación: (salario / sal_min) × 25 VSM × sal_min × 0.70 (factor conservador VSM)
    const ratio_salario_minimo = salario / SALARIO_MINIMO_MENSUAL_2026;
    const vsm_disponible = Math.min(ratio_salario_minimo * VSM_MAXIMO, VSM_MAXIMO);
    poder_adquisitivo = vsm_disponible * SALARIO_MINIMO_MENSUAL_2026 * 0.70; // Factor 0.70 VSM
  }

  // 4. MONTO MÁXIMO DE CRÉDITO
  // = Mayor de: (subcuenta + poder_adquisitivo) con techo legal 25 VSM
  const techo_legal_vsm = VSM_MAXIMO * SALARIO_MINIMO_MENSUAL_2026; // ~$234,325
  const monto_base = subcuenta + poder_adquisitivo;
  const monto_maximo_credito = Math.min(monto_base, techo_legal_vsm);

  // 5. PLAZO MÁXIMO EN MESES
  // = (65 - edad) × 12, máximo 360 meses (30 años)
  let plazo_meses = (EDAD_RETIRO - edad) * 12;
  plazo_meses = Math.max(plazo_meses, 0);
  plazo_meses = Math.min(plazo_meses, PLAZO_MAXIMO_MESES);
  plazo_meses = Math.max(plazo_meses, 120); // Mínimo 10 años si califica

  // 6. CÁLCULO DE CUOTA MENSUAL
  // Fórmula de pago: Cuota = C × [r(1+r)^n] / [(1+r)^n - 1]
  // donde r = tasa mensual, n = meses, C = capital
  let cuota_mensual = 0;
  if (monto_maximo_credito > 0 && plazo_meses > 0) {
    const tasa_mensual = tasa / 12;
    if (tasa_mensual > 0) {
      const factor_compuesto = Math.pow(1 + tasa_mensual, plazo_meses);
      const numerador = tasa_mensual * factor_compuesto;
      const denominador = factor_compuesto - 1;
      cuota_mensual = monto_maximo_credito * (numerador / denominador);
    } else {
      // Si tasa = 0 (teórico)
      cuota_mensual = monto_maximo_credito / plazo_meses;
    }
  }

  return {
    puntaje_infonavit: Math.round(puntaje_total),
    calificacion: calificacion,
    monto_maximo_credito: Math.round(monto_maximo_credito),
    poder_adquisitivo: Math.round(poder_adquisitivo),
    cuota_mensual: Math.round(cuota_mensual),
    plazo_maximo_meses: Math.round(plazo_meses),
    salario_minimo_referencia: Math.round(SALARIO_MINIMO_MENSUAL_2026 * 100) / 100
  };
}
