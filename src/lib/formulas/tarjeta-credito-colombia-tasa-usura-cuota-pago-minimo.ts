export interface Inputs {
  deuda_inicial: number;
  tasa_anual_ea: number;
  pago_mensual: number;
  usar_pago_minimo: boolean;
  porcentaje_minimo?: number;
  meses_max?: number;
}

export interface Outputs {
  meses_pago: number;
  intereses_totales: number;
  total_pagado: number;
  multiplicador_deuda: number;
  costo_efectivo_mensual: number;
  aviso_trampa: string;
  comparacion_cdt: number;
}

export function compute(inputs: Inputs): Outputs {
  // Validación de entrada
  const deuda = Math.max(0, inputs.deuda_inicial || 0);
  const tareaEA = Math.max(0, Math.min(100, inputs.tasa_anual_ea || 0)) / 100;
  const pagMensualFijo = Math.max(0, inputs.pago_mensual || 0);
  const usarMinimo = inputs.usar_pago_minimo === true;
  const porcMinimo = Math.max(0.5, Math.min(100, inputs.porcentaje_minimo || 2.5)) / 100;
  const mesesMax = Math.max(1, Math.min(600, inputs.meses_max || 120));

  // Conversión EA a mensual: (1 + EA)^(1/12) - 1
  const tasaMensual = Math.pow(1 + tareaEA, 1 / 12) - 1;

  // Constantes 2026 Colombia Superfinanciera
  // Tasa usura máxima 2026: ~33% EA, aquí usamos la ingresada
  // DTF 2026 estimado: 9-10% EA (referencia)
  const tasaCDTRefAnual = 0.10; // 10% EA CDT referencia
  const mesesCDTComparacion = 36;

  let saldoActual = deuda;
  let interesesTotales = 0;
  let meses = 0;

  // Simulación mes a mes (amortización)
  while (saldoActual > 1 && meses < mesesMax) {
    meses++;

    // Interés del mes
    const interesMes = saldoActual * tasaMensual;
    interesesTotales += interesMes;

    // Pago del mes
    let pagoMes = 0;
    if (usarMinimo) {
      pagoMes = saldoActual * porcMinimo;
    } else {
      pagoMes = pagMensualFijo;
    }

    // Protección: si pago < interés, aumenta deuda (es una trampa)
    if (pagoMes < interesMes && pagoMes > 0) {
      // El usuario paga menos que interés: deuda crece
      // Permitimos máx 10 meses así, luego asumimos que aumenta pago
      if (meses <= 10) {
        saldoActual += interesMes - pagoMes;
      } else {
        // Después de 10 meses, asumimos aumento a al menos interés + 10%
        pagoMes = interesMes * 1.1;
        saldoActual -= pagoMes - interesMes;
      }
    } else {
      // Abono capital normal
      const abonoCapital = pagoMes - interesMes;
      saldoActual -= abonoCapital;
    }

    // Evitar sobrecálculo si saldo es negativo
    if (saldoActual < 0) {
      saldoActual = 0;
    }
  }

  // Si no se pagó en mesesMax, reporta deuda restante
  const deudaRestante = saldoActual > 0 ? saldoActual : 0;
  const totalPagado = deuda + interesesTotales - deudaRestante;
  const multiplicadorDeuda = deuda > 0 ? totalPagado / deuda : 0;
  const costoEfectivoMensual = meses > 0 ? totalPagado / meses : 0;

  // Aviso trampa: si meses > 48 o multiplicador > 2.5 o deuda no se pagó
  let avisoTrampa = "✓ Plan de pago normal";
  if (deudaRestante > deuda * 0.05) {
    avisoTrampa = `⚠️ TRAMPA DETECTADA: deuda aún de $${deudaRestante.toFixed(0)} COP después de ${mesesMax} meses. El pago elegido NO alcanza para amortizar.`;
  } else if (meses > 48 && usarMinimo) {
    avisoTrampa = `⚠️ TRAMPA DETECTADA: ${meses} meses de pago. El pago mínimo es casi todo interés. Aumenta cuota.`;
  } else if (multiplicadorDeuda > 2.5) {
    avisoTrampa = `⚠️ TRAMPA: pagarás ${(multiplicadorDeuda * 100 - 100).toFixed(0)}% más de lo que debías. Es usura.`;
  }

  // Comparación CDT: si hubieras invertido la misma "cuota" mensual en CDT al 10% EA
  const tasaMensualCDT = Math.pow(1 + tasaCDTRefAnual, 1 / 12) - 1;
  let montoInvertidoCDT = 0;
  let saldoCDT = 0;
  let mesesParaPago = Math.min(meses, mesesCDTComparacion);
  for (let m = 0; m < mesesParaPago; m++) {
    saldoCDT = saldoCDT * (1 + tasaMensualCDT) + costoEfectivoMensual;
  }
  const gananciaCDT = saldoCDT - costoEfectivoMensual * mesesParaPago;
  const comparacionCDT = interesesTotales + gananciaCDT; // Costo de no invertir en CDT

  return {
    meses_pago: meses,
    intereses_totales: Math.round(interesesTotales),
    total_pagado: Math.round(totalPagado),
    multiplicador_deuda: Math.round(multiplicadorDeuda * 100) / 100,
    costo_efectivo_mensual: Math.round(costoEfectivoMensual),
    aviso_trampa: avisoTrampa,
    comparacion_cdt: Math.round(comparacionCDT)
  };
}
