export interface Inputs {
  saldo_actual: number;
  tasa_ea: number;
  plazo_meses: number;
  cuota_actual: number;
  pago_anticipado: number;
  estrategia: 'reducir_plazo' | 'reducir_cuota';
  tasa_alternativa?: number;
}

export interface Outputs {
  saldo_nuevo: number;
  meses_ahorrados: number;
  plazo_nuevo: number;
  cuota_nueva: number;
  ahorro_cuota: number;
  intereses_pagados_original: number;
  intereses_pagados_nuevo: number;
  intereses_ahorrados: number;
  roi_hipoteca_vs_alternativa: number;
  recomendacion: string;
  valor_presente_ahorro: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validaciones
  const tasaEA = i.tasa_ea / 100; // Convertir porcentaje a decimal
  const tasaMensual = Math.pow(1 + tasaEA, 1 / 12) - 1; // Tasa efectiva mensual
  const saldoNuevo = i.saldo_actual - i.pago_anticipado;
  
  // Validar que saldo nuevo sea positivo
  if (saldoNuevo <= 0) {
    return {
      saldo_nuevo: 0,
      meses_ahorrados: i.plazo_meses,
      plazo_nuevo: 0,
      cuota_nueva: 0,
      ahorro_cuota: i.cuota_actual,
      intereses_pagados_original: i.cuota_actual * i.plazo_meses - i.saldo_actual,
      intereses_pagados_nuevo: 0,
      intereses_ahorrados: i.cuota_actual * i.plazo_meses - i.saldo_actual,
      roi_hipoteca_vs_alternativa: 100,
      recomendacion: 'Pago anticipado cubre toda la deuda. Hipoteca liquidada.',
      valor_presente_ahorro: (i.cuota_actual * i.plazo_meses - i.saldo_actual)
    };
  }

  // Cálculo de intereses pagados en plan original (sin pago anticipado)
  const interesesPagadosOriginal = i.cuota_actual * i.plazo_meses - i.saldo_actual;
  
  // Rama 1: Reducir plazo (mantener cuota actual)
  let plazoNuevo = 0;
  let interesesPagadosNuevo = 0;
  
  if (i.estrategia === 'reducir_plazo') {
    // Fórmula: n = -ln(1 - S'*i/Cuota) / ln(1+i)
    // Donde S' es saldo nuevo, i es tasa mensual, Cuota es cuota actual
    const numerador = 1 - (saldoNuevo * tasaMensual) / i.cuota_actual;
    
    if (numerador > 0) {
      plazoNuevo = Math.ceil(-Math.log(numerador) / Math.log(1 + tasaMensual));
    } else {
      // Si el denominador es negativo, la cuota no cubre intereses
      plazoNuevo = i.plazo_meses;
    }
    
    // Validar que plazo nuevo sea menor al original
    plazoNuevo = Math.min(plazoNuevo, i.plazo_meses);
    
    // Intereses en el nuevo plan
    interesesPagadosNuevo = i.cuota_actual * plazoNuevo - saldoNuevo;
  } else {
    // Rama 2: Reducir cuota (mantener plazo)
    plazoNuevo = i.plazo_meses;
    
    // Fórmula cuota nueva: C = P * [i*(1+i)^n] / [(1+i)^n - 1]
    const factor = Math.pow(1 + tasaMensual, plazoNuevo);
    const numerador = tasaMensual * factor;
    const denominador = factor - 1;
    const cuotaNueva = saldoNuevo * (numerador / denominador);
    
    // Intereses en el nuevo plan
    interesesPagadosNuevo = cuotaNueva * plazoNuevo - saldoNuevo;
  }

  // Cálculos de cuota nueva
  const factor = Math.pow(1 + tasaMensual, plazoNuevo);
  const numerador = tasaMensual * factor;
  const denominador = factor - 1;
  const cuotaNueva = saldoNuevo * (numerador / denominador);
  const ahorroCuota = i.cuota_actual - cuotaNueva;
  
  // Meses ahorrados
  const mesesAhorrados = i.plazo_meses - plazoNuevo;
  
  // Intereses ahorrados
  const interesesAhorrados = interesesPagadosOriginal - interesesPagadosNuevo;
  
  // ROI: Comparación hipoteca vs alternativa
  let roiHipotecaVsAlternativa = 0;
  let recomendacion = '';
  
  if (i.tasa_alternativa !== undefined && i.tasa_alternativa > 0) {
    const tasaAlt = i.tasa_alternativa / 100;
    // ROI = (Ahorro en intereses / Pago anticipado) / (Años) * 100
    const anosInversion = mesesAhorrados / 12;
    if (anosInversion > 0) {
      roiHipotecaVsAlternativa = ((interesesAhorrados / i.pago_anticipado) / (mesesAhorrados / 12)) * 100;
    } else {
      roiHipotecaVsAlternativa = tasaEA * 100; // Si no hay meses ahorrados, es equivalente a EA
    }
    
    if (tasaEA > tasaAlt) {
      recomendacion = `Pagar anticipado es más rentable (${(tasaEA * 100).toFixed(2)}% vs ${(tasaAlt * 100).toFixed(2)}%). Ahorro: $${interesesAhorrados.toLocaleString('es-CO', { maximumFractionDigits: 0 })}.`;
    } else {
      recomendacion = `Invertir es más rentable (${(tasaAlt * 100).toFixed(2)}% vs ${(tasaEA * 100).toFixed(2)}%). Considera CDT o fondos.`;
    }
  } else {
    roiHipotecaVsAlternativa = tasaEA * 100;
    recomendacion = `Sin tasa alternativa, el pago anticipado ahorra $${interesesAhorrados.toLocaleString('es-CO', { maximumFractionDigits: 0 })} en intereses.`;
  }
  
  // Valor presente del ahorro (descontado a tasa hipotecaria)
  const diasPorMes = 30;
  const vpAhorro = interesesAhorrados / Math.pow(1 + tasaMensual, mesesAhorrados);
  
  return {
    saldo_nuevo: Math.round(saldoNuevo),
    meses_ahorrados: mesesAhorrados,
    plazo_nuevo: plazoNuevo,
    cuota_nueva: Math.round(cuotaNueva),
    ahorro_cuota: Math.round(ahorroCuota),
    intereses_pagados_original: Math.round(interesesPagadosOriginal),
    intereses_pagados_nuevo: Math.round(interesesPagadosNuevo),
    intereses_ahorrados: Math.round(interesesAhorrados),
    roi_hipoteca_vs_alternativa: Math.round(roiHipotecaVsAlternativa * 100) / 100,
    recomendacion: recomendacion,
    valor_presente_ahorro: Math.round(vpAhorro)
  };
}
