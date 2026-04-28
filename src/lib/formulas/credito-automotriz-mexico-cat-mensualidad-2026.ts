export interface Inputs {
  precio_auto: number;
  porcentaje_enganche: number;
  plazo_meses: number;
  cat_anual: number;
  incluir_seguro: 'no' | 'basico' | 'amplio';
  comparar_con: 'no' | 'leasing' | 'renting';
}

export interface Outputs {
  monto_financiado: number;
  enganche_monto: number;
  mensualidad: number;
  mensualidad_con_seguro: number;
  intereses_totales: number;
  pago_total: number;
  tasa_interes_mes: number;
  deduccion_isr: number;
  ahorro_comparativa: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México (CNBV, SAT)
  const TASA_ISR_MARGINAL = 0.30; // Promedio para deducción, varía 15-35%
  const SEGURO_BASICO_ANUAL = 0.09; // 9% anual del valor auto (promedio)
  const SEGURO_AMPLIO_ANUAL = 0.13; // 13% anual del valor auto
  const CUOTA_LEASING_PROM = 0.012; // ~1.2% mensual del valor auto (promedio)
  const CUOTA_RENTING_PROM = 0.009; // ~0.9% mensual del valor auto (promedio)

  // 1. Cálculo del enganche y monto financiado
  const enganche_monto = i.precio_auto * (i.porcentaje_enganche / 100);
  const monto_financiado = i.precio_auto - enganche_monto;

  // 2. Conversión de CAT anual a tasa mensual equivalente
  // Fórmula: i_mes = (1 + CAT_anual)^(1/12) - 1
  const cat_decimal = i.cat_anual / 100;
  const tasa_interes_mes = Math.pow(1 + cat_decimal, 1 / 12) - 1;
  const tasa_interes_mes_porcentaje = tasa_interes_mes * 100;

  // 3. Cálculo de mensualidad (anualidad ordinaria)
  // M = P * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const n = i.plazo_meses;
  const factor_interes = Math.pow(1 + tasa_interes_mes, n);
  const mensualidad =
    monto_financiado *
    ((tasa_interes_mes * factor_interes) / (factor_interes - 1));

  // 4. Cálculo de intereses totales
  const intereses_totales = mensualidad * n - monto_financiado;

  // 5. Pago total (enganche + todas las mensualidades)
  const pago_total = enganche_monto + mensualidad * n;

  // 6. Cálculo de prima de seguro mensual
  let prima_seguro_mensual = 0;
  if (i.incluir_seguro === 'basico') {
    prima_seguro_mensual = (i.precio_auto * SEGURO_BASICO_ANUAL) / 12;
  } else if (i.incluir_seguro === 'amplio') {
    prima_seguro_mensual = (i.precio_auto * SEGURO_AMPLIO_ANUAL) / 12;
  }
  const mensualidad_con_seguro = mensualidad + prima_seguro_mensual;

  // 7. Deducción ISR (solo intereses, para personas morales e independientes)
  // ISR ahorrado = Intereses totales × Tasa ISR marginal
  const deduccion_isr = intereses_totales * TASA_ISR_MARGINAL;

  // 8. Comparativa con leasing o renting
  let ahorro_comparativa = 0;
  if (i.comparar_con === 'leasing') {
    // Cuota leasing ≈ 1.2% del valor auto mensuales
    const cuota_leasing = i.precio_auto * CUOTA_LEASING_PROM;
    const pago_total_leasing = cuota_leasing * n;
    // Deducción ISR para leasing: 100% de la cuota (para personas morales)
    const deduccion_leasing = pago_total_leasing * TASA_ISR_MARGINAL;
    const costo_neto_crédito = pago_total - deduccion_isr;
    const costo_neto_leasing = pago_total_leasing - deduccion_leasing;
    ahorro_comparativa = costo_neto_crédito - costo_neto_leasing;
  } else if (i.comparar_con === 'renting') {
    // Cuota renting ≈ 0.9% del valor auto mensuales (más económico)
    const cuota_renting = i.precio_auto * CUOTA_RENTING_PROM;
    const pago_total_renting = cuota_renting * n;
    // Deducción ISR para renting: 100% de la cuota
    const deduccion_renting = pago_total_renting * TASA_ISR_MARGINAL;
    const costo_neto_crédito = pago_total - deduccion_isr;
    const costo_neto_renting = pago_total_renting - deduccion_renting;
    ahorro_comparativa = costo_neto_crédito - costo_neto_renting;
  }

  return {
    monto_financiado: Math.round(monto_financiado * 100) / 100,
    enganche_monto: Math.round(enganche_monto * 100) / 100,
    mensualidad: Math.round(mensualidad * 100) / 100,
    mensualidad_con_seguro: Math.round(mensualidad_con_seguro * 100) / 100,
    intereses_totales: Math.round(intereses_totales * 100) / 100,
    pago_total: Math.round(pago_total * 100) / 100,
    tasa_interes_mes: Math.round(tasa_interes_mes_porcentaje * 1000) / 1000,
    deduccion_isr: Math.round(deduccion_isr * 100) / 100,
    ahorro_comparativa: Math.round(ahorro_comparativa * 100) / 100,
  };
}
