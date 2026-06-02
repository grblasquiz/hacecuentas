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
  _insight?: any;
  _chart?: any;
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

  const multR = Math.round(multiplicadorDeuda * 100) / 100;
  const interesesR = Math.round(interesesTotales);
  const noTermina = deudaRestante > deuda * 0.05;
  const extraPct = (multR * 100 - 100);

  const _insight = {
    title: noTermina ? 'Con este pago la deuda no se cancela' : 'Cuánto terminás pagando de más',
    text: noTermina
      ? `Después de **${mesesMax} meses** todavía debés **$${Math.round(deudaRestante).toLocaleString('es-CO')}**: el pago elegido no alcanza ni para amortizar capital. En la práctica es una deuda perpetua hasta que subas la cuota.`
      : `Pagás **$${Math.round(totalPagado).toLocaleString('es-CO')}** por una deuda de **$${Math.round(deuda).toLocaleString('es-CO')}**: **$${interesesR.toLocaleString('es-CO')}** son intereses, o sea **${extraPct.toFixed(0)}% de más** sobre lo que debías (${multR.toFixed(2)}x). ${multR > 2.5 ? 'Eso es nivel usura: priorizá cancelar esta deuda.' : 'Aumentar la cuota recorta fuerte ese sobrecosto.'}`,
    tone: (multR > 1.5 || noTermina) ? 'warn' : 'good',
    icon: '💳',
  };

  // Gauge: cuántas veces tu deuda original terminás pagando (zonas)
  const markerMult = Math.max(1, Math.min(multR, 5));
  const _chart = {
    type: 'scale',
    marker: markerMult,
    markerLabel: `${multR.toFixed(2)}x`,
    min: 1,
    segments: [
      { nombre: 'Razonable', max: 1.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Caro', max: 2.5, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Usura', max: 5, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Terminás pagando ${multR.toFixed(2)} veces tu deuda original`,
  };

  return {
    meses_pago: meses,
    intereses_totales: interesesR,
    total_pagado: Math.round(totalPagado),
    multiplicador_deuda: multR,
    costo_efectivo_mensual: Math.round(costoEfectivoMensual),
    aviso_trampa: avisoTrampa,
    comparacion_cdt: Math.round(comparacionCDT),
    _insight,
    _chart
  };
}
