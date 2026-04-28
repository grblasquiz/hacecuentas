export interface Inputs {
  ingresos_anuales: number;
  gastos_deducibles: number;
  depreciacion_bienes: number;
  modalidad: 'transparente' | 'general';
  tiene_iva: 'si' | 'no';
}

export interface Outputs {
  base_imponible_transparente: number;
  impuesto_transparente: number;
  base_imponible_general: number;
  impuesto_general: number;
  diferencia_impuesto: number;
  iva_anual: number;
  impuesto_total_anual: number;
  tasa_efectiva: number;
  modalidad_recomendada: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII
  const TASA_IMPUESTO_PYME14D = 0.25; // 25% - Régimen Pyme Ley 3500
  const TASA_IVA = 0.19; // 19% - Impuesto Valor Agregado
  const LIMITE_INGRESOS_UF = 75000; // UF máximo permitido
  const VALOR_UF_2026 = 33600; // Pesos - Banco Central 2026 aproximado
  const LIMITE_INGRESOS_PESOS = LIMITE_INGRESOS_UF * VALOR_UF_2026; // ~2.52 millones

  // Validaciones
  const ingresos = Math.max(0, i.ingresos_anuales || 0);
  const gastos = Math.max(0, i.gastos_deducibles || 0);
  const depreciacion = Math.max(0, i.depreciacion_bienes || 0);

  // Verificar límite de ingresos
  const excede_limite = ingresos > LIMITE_INGRESOS_PESOS;

  // MODALIDAD TRANSPARENTE
  // Base = Ingresos - Depreciación Instantánea
  const base_transparente = Math.max(0, ingresos - depreciacion);
  const impuesto_transparente = base_transparente * TASA_IMPUESTO_PYME14D;

  // MODALIDAD GENERAL
  // Base = Ingresos - Gastos Deducibles - Depreciación Instantánea
  const base_general = Math.max(0, ingresos - gastos - depreciacion);
  const impuesto_general = base_general * TASA_IMPUESTO_PYME14D;

  // IVA Anual (19% sobre ingresos si está afecto)
  const iva_anual = i.tiene_iva === 'si' ? ingresos * TASA_IVA : 0;

  // Seleccionar modalidad según input
  const impuesto_seleccionado = i.modalidad === 'transparente' ? impuesto_transparente : impuesto_general;
  const base_seleccionada = i.modalidad === 'transparente' ? base_transparente : base_general;

  // Impuesto total (14D + IVA)
  const impuesto_total_anual = impuesto_seleccionado + iva_anual;

  // Tasa tributaria efectiva (%)
  const tasa_efectiva = ingresos > 0 ? (impuesto_total_anual / ingresos) * 100 : 0;

  // Diferencia de impuesto entre modalidades
  const diferencia = Math.abs(impuesto_transparente - impuesto_general);

  // Recomendación de modalidad
  let modalidad_recomendada = '';
  if (gastos > ingresos * 0.15) {
    // Si gastos > 15% de ingresos, modalidad general es mejor
    modalidad_recomendada = 'General (mejor con gastos altos). Ahorro estimado: $' + Math.round(diferencia).toLocaleString('es-CL');
  } else if (gastos < ingresos * 0.05) {
    // Si gastos < 5%, transparente es mejor
    modalidad_recomendada = 'Transparente (mejor con gastos bajos). Ahorro estimado: $' + Math.round(diferencia).toLocaleString('es-CL');
  } else {
    // Rango intermedio - comparar directamente
    const mejor = impuesto_transparente < impuesto_general ? 'Transparente' : 'General';
    modalidad_recomendada = mejor + '. Ahorro estimado: $' + Math.round(diferencia).toLocaleString('es-CL');
  }

  // Advertencia por límite de ingresos
  if (excede_limite) {
    modalidad_recomendada += ' ⚠️ ADVT: Superas límite 75.000 UF. Consulta SII para cambio de régimen.';
  }

  return {
    base_imponible_transparente: Math.round(base_transparente),
    impuesto_transparente: Math.round(impuesto_transparente),
    base_imponible_general: Math.round(base_general),
    impuesto_general: Math.round(impuesto_general),
    diferencia_impuesto: Math.round(diferencia),
    iva_anual: Math.round(iva_anual),
    impuesto_total_anual: Math.round(impuesto_total_anual),
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    modalidad_recomendada: modalidad_recomendada
  };
}
