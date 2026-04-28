export interface Inputs {
  saldo_inicial: number;
  tasa_ea_anual: number;
  cuota_manejo_mensual: number;
  seguro_mensual: number;
  porcentaje_cuota_minima: number;
  pago_mensual_fijo: number;
  meses_proyeccion: number;
}

export interface ComposicionPago {
  capital: number;
  interes: number;
  cuota_manejo: number;
  seguro: number;
}

export interface Outputs {
  cuota_minima_primera: number;
  interes_primer_mes: number;
  meses_pago_minimo: number;
  interes_total_minimo: number;
  total_pagado_minimo: number;
  meses_pago_fijo: number;
  interes_total_fijo: number;
  total_pagado_fijo: number;
  ahorro_comparacion: number;
  tiempo_ahorrado: number;
  composicion_minima_primer_mes: ComposicionPago;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const saldo = Math.max(10000, i.saldo_inicial);
  const ea = Math.max(0.08, Math.min(0.45, i.tasa_ea_anual / 100));
  const cuota_manejo = Math.max(0, i.cuota_manejo_mensual);
  const seguro = Math.max(0, i.seguro_mensual);
  const porcentaje_minima = Math.max(0.01, Math.min(0.10, i.porcentaje_cuota_minima / 100));
  const pago_fijo = Math.max(0, i.pago_mensual_fijo);
  const meses_max = Math.max(6, Math.min(360, i.meses_proyeccion));

  // Constantes 2026 Colombia
  // Fuente: Superfinanciera, Banco República
  const tasa_mora = 0.02; // 2% mensual de mora si aplica
  const min_capital = 50000; // Mínimo de capital que exigen bancos

  // Cálculo Mes 1: Composición
  const tasa_mensual = ea / 12; // Aproximación lineal (válida para EA < 35%)
  const interes_mes_1 = saldo * tasa_mensual;
  const capital_mes_1 = Math.max(min_capital, saldo * porcentaje_minima);
  const cuota_minima_mes_1 = capital_mes_1 + interes_mes_1 + cuota_manejo + seguro;

  // Composición para salida
  const composicion_mes_1: ComposicionPago = {
    capital: Math.round(capital_mes_1),
    interes: Math.round(interes_mes_1),
    cuota_manejo: cuota_manejo,
    seguro: seguro,
  };

  // Simulación Escenario 1: Solo Cuota Mínima
  let saldo_minimo = saldo;
  let interes_acum_minimo = 0;
  let comisiones_acum_minimo = 0;
  let meses_minimo = 0;
  const tolerancia = 500; // Saldo residual aceptable

  for (let mes = 1; mes <= meses_max; mes++) {
    if (saldo_minimo < tolerancia) {
      break;
    }

    // Calcular cuota mínima actual
    const tasa_mes = ea / 12;
    const interes_mes = saldo_minimo * tasa_mes;
    const capital_mes = Math.max(min_capital, saldo_minimo * porcentaje_minima);
    const pago_mes = capital_mes + interes_mes + cuota_manejo + seguro;

    // Actualizar saldo
    saldo_minimo = saldo_minimo - capital_mes + interes_mes + cuota_manejo + seguro;
    interes_acum_minimo += interes_mes;
    comisiones_acum_minimo += cuota_manejo + seguro;
    meses_minimo = mes;

    // Si saldo se vuelve negativo o crece sin control, detener
    if (saldo_minimo < 0) {
      saldo_minimo = 0;
      break;
    }
  }

  const total_pagado_minimo = saldo + interes_acum_minimo + comisiones_acum_minimo;

  // Simulación Escenario 2: Cuota Fija
  let saldo_fijo = saldo;
  let interes_acum_fijo = 0;
  let comisiones_acum_fijo = 0;
  let meses_fijo = 0;

  // Si no ingresa cuota fija, usar el mínimo del mes 1 + 50%
  const pago_fijo_efectivo = pago_fijo > 0 ? pago_fijo : cuota_minima_mes_1 * 1.5;

  for (let mes = 1; mes <= meses_max; mes++) {
    if (saldo_fijo < tolerancia) {
      break;
    }

    const tasa_mes = ea / 12;
    const interes_mes = saldo_fijo * tasa_mes;
    const comisiones_mes = cuota_manejo + seguro;
    const nuevo_saldo = saldo_fijo + interes_mes + comisiones_mes - pago_fijo_efectivo;

    interes_acum_fijo += interes_mes;
    comisiones_acum_fijo += comisiones_mes;
    saldo_fijo = nuevo_saldo;
    meses_fijo = mes;

    // Si la cuota fija no cubre ni interés + comisiones, el saldo crece indefinidamente
    if (nuevo_saldo < 0) {
      saldo_fijo = 0;
      break;
    }
  }

  const total_pagado_fijo = saldo + interes_acum_fijo + comisiones_acum_fijo;

  // Cálculos finales
  const ahorro = total_pagado_minimo - total_pagado_fijo;
  const tiempo_ahorrado = meses_minimo - meses_fijo;

  return {
    cuota_minima_primera: Math.round(cuota_minima_mes_1),
    interes_primer_mes: Math.round(interes_mes_1),
    meses_pago_minimo: meses_minimo > 0 ? meses_minimo : 1,
    interes_total_minimo: Math.round(interes_acum_minimo),
    total_pagado_minimo: Math.round(total_pagado_minimo),
    meses_pago_fijo: meses_fijo > 0 ? meses_fijo : 1,
    interes_total_fijo: Math.round(interes_acum_fijo),
    total_pagado_fijo: Math.round(total_pagado_fijo),
    ahorro_comparacion: Math.round(ahorro),
    tiempo_ahorrado: Math.max(0, tiempo_ahorrado),
    composicion_minima_primer_mes: composicion_mes_1,
  };
}
