export interface Inputs {
  ingresos_brutos_anual: number;
  gastos_hospitales: number;
  gastos_consultas: number;
  gastos_dentista: number;
  gastos_optica: number;
  gastos_psicologia: number;
  gastos_otros_medicos: number;
  tarifa_isr_marginal: number;
}

export interface Outputs {
  gasto_total_reportado: number;
  uma_anual_2026: number;
  limite_15_porciento_ingresos: number;
  deduccion_maxima_permitida: number;
  monto_deducible_real: number;
  ahorro_isr_estimado: number;
  porcentaje_gastos_sobre_ingresos: number;
  gastosno_deducibles: number;
}

export function compute(i: Inputs): Outputs {
  // Parámetro 2026 México - UMA (INEGI ene 2026)
  const UMA_2026 = 9700; // Pesos mexicanos
  const LIMITE_5_UMA = UMA_2026 * 5; // $48,500 MXN
  const PORCENTAJE_LIMITE = 0.15; // 15% ingresos brutos

  // Validación de inputs
  const ingresos = Math.max(0, i.ingresos_brutos_anual || 0);
  const tarifa = Math.max(0, Math.min(100, i.tarifa_isr_marginal || 0)) / 100;

  // Total gastos reportados (suma todos los conceptos)
  const gasto_total_reportado = (
    (i.gastos_hospitales || 0) +
    (i.gastos_consultas || 0) +
    (i.gastos_dentista || 0) +
    (i.gastos_optica || 0) +
    (i.gastos_psicologia || 0) +
    (i.gastos_otros_medicos || 0)
  );

  // Límite alternativo: 15% de ingresos brutos
  const limite_15_porciento_ingresos = ingresos * PORCENTAJE_LIMITE;

  // Deducción máxima permitida = MIN(5 UMA, 15% ingresos)
  // Artículo 176 LISR: aplica el menor de ambos límites
  const deduccion_maxima_permitida = Math.min(
    LIMITE_5_UMA,
    limite_15_porciento_ingresos
  );

  // Monto deducible real = MIN(gastos reportados, deducción máxima permitida)
  const monto_deducible_real = Math.min(
    gasto_total_reportado,
    deduccion_maxima_permitida
  );

  // Ahorro ISR estimado = monto deducible × tarifa marginal ISR
  // Formula: Ahorro = Deducción × Tarifa % (reduce base gravable)
  const ahorro_isr_estimado = monto_deducible_real * tarifa;

  // Gastos como % de ingresos brutos (para análisis)
  const porcentaje_gastos_sobre_ingresos = ingresos > 0
    ? (gasto_total_reportado / ingresos) * 100
    : 0;

  // Gastos excedentes (no deducibles en ese año fiscal)
  const gastosno_deducibles = Math.max(
    0,
    gasto_total_reportado - monto_deducible_real
  );

  return {
    gasto_total_reportado: Math.round(gasto_total_reportado * 100) / 100,
    uma_anual_2026: Math.round(LIMITE_5_UMA * 100) / 100,
    limite_15_porciento_ingresos: Math.round(limite_15_porciento_ingresos * 100) / 100,
    deduccion_maxima_permitida: Math.round(deduccion_maxima_permitida * 100) / 100,
    monto_deducible_real: Math.round(monto_deducible_real * 100) / 100,
    ahorro_isr_estimado: Math.round(ahorro_isr_estimado * 100) / 100,
    porcentaje_gastos_sobre_ingresos: Math.round(porcentaje_gastos_sobre_ingresos * 100) / 100,
    gastosno_deducibles: Math.round(gastosno_deducibles * 100) / 100
  };
}
