export interface Inputs {
  monto_prestamo: number;
  plazo_meses: number;
  cae_anual: number;
  comision_originacion: number;
}

export interface Outputs {
  cuota_mensual: number;
  total_pagado: number;
  total_interes: number;
  costo_financiero_total: number;
  cae_real: number;
  excede_tasa_maxima: string;
  tasa_mensual: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - CMF
  const TASA_MAXIMA_CONVENCIONAL_CMF = 32; // % anual

  // Validaciones básicas
  const monto = Math.max(500000, Math.min(100000000, i.monto_prestamo));
  const meses = Math.max(6, Math.min(120, i.plazo_meses));
  const cae = Math.max(3, Math.min(35, i.cae_anual));
  const comision = Math.max(0, Math.min(10, i.comision_originacion));

  // Cálculo de tasa mensual a partir de CAE anual
  const tasa_mensual = cae / 100 / 12;

  // Fórmula de anualidad ordinaria (préstamo con cuota fija)
  // Cuota = Monto × [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + tasa_mensual, meses);
  const cuota_mensual =
    monto * ((tasa_mensual * factor) / (factor - 1));

  // Total pagado en cuotas
  const total_cuotas = cuota_mensual * meses;

  // Comisión de originación en pesos
  const monto_comision = (comision / 100) * monto;

  // Total pagado = cuotas + comisión
  const total_pagado = total_cuotas + monto_comision;

  // Costo total de intereses (sin incluir comisión)
  const total_interes = total_cuotas - monto;

  // Costo financiero total (intereses + comisión)
  const costo_financiero_total = total_interes + monto_comision;

  // Verificar si excede tasa máxima convencional CMF
  const excede = cae > TASA_MAXIMA_CONVENCIONAL_CMF;
  const excede_tasa_maxima = excede
    ? `Sí (${cae.toFixed(2)}% > ${TASA_MAXIMA_CONVENCIONAL_CMF}%)`
    : `No (${cae.toFixed(2)}% ≤ ${TASA_MAXIMA_CONVENCIONAL_CMF}%)`;

  return {
    cuota_mensual: Math.round(cuota_mensual),
    total_pagado: Math.round(total_pagado),
    total_interes: Math.round(total_interes),
    costo_financiero_total: Math.round(costo_financiero_total),
    cae_real: Math.round(cae * 100) / 100,
    excede_tasa_maxima: excede_tasa_maxima,
    tasa_mensual: Math.round(tasa_mensual * 10000) / 10000,
  };
}
