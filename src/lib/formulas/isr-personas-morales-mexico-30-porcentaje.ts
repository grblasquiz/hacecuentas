export interface Inputs {
  ingresos_acumulables: number;
  deducciones_autorizadas: number;
  ptu_pagada: number;
  pérdidas_ejercicios_anteriores?: number;
  utilidades_acumulables_anteriores?: number;
}

export interface Outputs {
  utilidad_fiscal: number;
  utilidad_neta_gravable: number;
  isr_anual_30: number;
  pago_provisional_mensual: number;
  carga_fiscal_efectiva: number;
  comparativa_resico_pm: number;
  ahorro_ordinario_vs_resico: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes SAT 2026 - Tasa ISR personas morales régimen ordinario
  const TASA_ISR_PM = 0.30; // 30% - Artículo 9 LISR
  const TASA_RESICO_PM = 0.35; // 35% - RESICO simplificado
  const LÍMITE_PTU_UTILIDAD = 0.10; // Máx 10% utilidad fiscal bruta
  const LÍMITE_PTU_INGRESOS = 0.30; // Máx 30% ingresos totales

  // Normalizar inputs
  const ingresos = Math.max(0, i.ingresos_acumulables || 0);
  const deducciones = Math.max(0, i.deducciones_autorizadas || 0);
  const ptu = Math.max(0, i.ptu_pagada || 0);
  const pérdidas_anteriores = Math.max(0, i.pérdidas_ejercicios_anteriores || 0);

  // Paso 1: Calcular utilidad fiscal bruta (antes de PTU)
  let utilidad_bruta = ingresos - deducciones;

  // Aplicar compensación de pérdidas (máx 25% anual)
  const límite_compensación = utilidad_bruta * 0.25;
  const pérdidas_a_compensar = Math.min(pérdidas_anteriores, límite_compensación);
  const utilidad_fiscal = Math.max(0, utilidad_bruta - pérdidas_a_compensar);

  // Paso 2: Validar que PTU no exceda límites legales
  const ptu_máxima_utilidad = utilidad_fiscal * LÍMITE_PTU_UTILIDAD;
  const ptu_máxima_ingresos = ingresos * LÍMITE_PTU_INGRESOS;
  const ptu_límite = Math.min(ptu_máxima_utilidad, ptu_máxima_ingresos);
  const ptu_deducible = Math.min(ptu, ptu_límite);

  // Paso 3: Calcular utilidad neta gravable (después de PTU)
  const utilidad_neta_gravable = Math.max(0, utilidad_fiscal - ptu_deducible);

  // Paso 4: Calcular ISR anual (30%)
  const isr_anual_30 = utilidad_neta_gravable * TASA_ISR_PM;

  // Paso 5: Calcular coeficiente de utilidad para pagos provisionales
  const coeficiente_utilidad = ingresos > 0 ? utilidad_neta_gravable / ingresos : 0;
  const ingresos_mensuales = ingresos / 12;
  const pago_provisional_mensual = ingresos_mensuales * coeficiente_utilidad * TASA_ISR_PM;

  // Paso 6: Calcular carga fiscal efectiva
  const carga_fiscal_efectiva = ingresos > 0 ? isr_anual_30 / ingresos : 0;

  // Paso 7: Calcular comparativa RESICO PM
  // RESICO: 35% directo de ingresos, sin deducciones
  const comparativa_resico_pm = ingresos * TASA_RESICO_PM;

  // Paso 8: Calcular ahorro/diferencia
  const ahorro_ordinario_vs_resico = comparativa_resico_pm - isr_anual_30;

  return {
    utilidad_fiscal: Math.round(utilidad_fiscal * 100) / 100,
    utilidad_neta_gravable: Math.round(utilidad_neta_gravable * 100) / 100,
    isr_anual_30: Math.round(isr_anual_30 * 100) / 100,
    pago_provisional_mensual: Math.round(pago_provisional_mensual * 100) / 100,
    carga_fiscal_efectiva: Math.round(carga_fiscal_efectiva * 10000) / 100, // En porcentaje
    comparativa_resico_pm: Math.round(comparativa_resico_pm * 100) / 100,
    ahorro_ordinario_vs_resico: Math.round(ahorro_ordinario_vs_resico * 100) / 100
  };
}
