export interface Inputs {
  saldo_actual_uf: number;
  plazo_restante_meses: number;
  tasa_real_anual_pct: number;
  monto_anticipado_uf: number;
  opcion_calculo: 'plazo' | 'cuota';
  tasa_alternativa_pct: number;
}

export interface Outputs {
  cuota_actual_uf: number;
  meses_ahorrados: number;
  cuota_nueva_uf: number;
  intereses_totales_antes_uf: number;
  intereses_totales_despues_uf: number;
  ahorro_intereses_uf: number;
  roi_vs_alternativo_pct: number;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validación
  const saldo = Math.max(100, i.saldo_actual_uf);
  const plazo = Math.max(1, i.plazo_restante_meses);
  const tasa_anual = Math.max(0.01, i.tasa_real_anual_pct) / 100;
  const monto_ant = Math.max(10, Math.min(saldo * 0.99, i.monto_anticipado_uf));
  const tasa_alt = Math.max(0, i.tasa_alternativa_pct) / 100;

  // Tasa mensual (sistema francés)
  const r = tasa_anual / 12;

  // Cuota actual antes de pago anticipado
  const cuota_actual = saldo * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);

  // Saldo después de pago anticipado
  const saldo_nuevo = saldo - monto_ant;

  let meses_ahorrados = 0;
  let cuota_nueva = cuota_actual;
  let plazo_nuevo = plazo;

  if (i.opcion_calculo === 'plazo') {
    // Reduce plazo, mantiene cuota
    // Fórmula: n = -ln(1 - (Saldo_nuevo * r) / Cuota) / ln(1 + r)
    const numerador = 1 - (saldo_nuevo * r) / cuota_actual;
    if (numerador > 0.001) {
      plazo_nuevo = -Math.log(numerador) / Math.log(1 + r);
    } else {
      plazo_nuevo = 1;
    }
    meses_ahorrados = Math.max(0, plazo - plazo_nuevo);
  } else {
    // Reduce cuota, mantiene plazo
    cuota_nueva = saldo_nuevo * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
    plazo_nuevo = plazo;
  }

  // Cálculo intereses totales ANTES
  const intereses_antes = (cuota_actual * plazo) - saldo;

  // Cálculo intereses totales DESPUÉS
  const intereses_despues = (cuota_nueva * plazo_nuevo) - saldo_nuevo;

  // Ahorro en intereses (en UF)
  const ahorro_intereses = Math.max(0, intereses_antes - intereses_despues);

  // ROI vs alternativa
  // Si invirtieras el monto anticipado a tasa alternativa durante los meses ahorrados
  const meses_ganancia_alt = i.opcion_calculo === 'plazo' ? meses_ahorrados : 0;
  const ganancia_alternativa = monto_ant * tasa_alt * (meses_ganancia_alt / 12);
  const beneficio_neto = ahorro_intereses - ganancia_alternativa;
  const roi_vs_alternativo = (beneficio_neto / monto_ant) * 100;

  // Recomendación basada en ROI
  let recomendacion = '';
  if (roi_vs_alternativo > 2) {
    recomendacion = '✅ Paga anticipado. Ahorro significativo vs alternativas (hipoteca cara).';
  } else if (roi_vs_alternativo > 0) {
    recomendacion = '✓ Paga anticipado. Ventaja pequeña, pero es deuda garantizada eliminada.';
  } else if (roi_vs_alternativo > -2) {
    recomendacion = '⚠️ Dudoso. ROI similar a inversión. Considera flujo caja personal.';
  } else {
    recomendacion = '❌ Mejor invertir. Fondo/depósito rinden más que la tasa hipotecaria.';
  }

  return {
    cuota_actual_uf: Math.round(cuota_actual * 100) / 100,
    meses_ahorrados: Math.round(meses_ahorrados * 10) / 10,
    cuota_nueva_uf: Math.round(cuota_nueva * 100) / 100,
    intereses_totales_antes_uf: Math.round(intereses_antes * 100) / 100,
    intereses_totales_despues_uf: Math.round(intereses_despues * 100) / 100,
    ahorro_intereses_uf: Math.round(ahorro_intereses * 100) / 100,
    roi_vs_alternativo_pct: Math.round(roi_vs_alternativo * 10) / 10,
    recomendacion: recomendacion
  };
}
