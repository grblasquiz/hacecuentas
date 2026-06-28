export interface Inputs {
  deuda_inicial: number;
  cae_anual: number;
  pago_mensual: number;
  tipo_pago: 'minimo' | 'fijo';
  comparar_prestamo: boolean;
}

export interface Outputs {
  meses_pago: number;
  tasa_mensual: number;
  intereses_totales: number;
  costo_total: number;
  tasa_minimo_inicial: number;
  comparacion_prestamo: number;
  ahorro_potencial: number;
  tabla_flujo: Array<{ mes: number; saldo_inicio: number; interes: number; pago: number; saldo_final: number }>;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).comparar_prestamo = (i as any).comparar_prestamo === true || (i as any).comparar_prestamo === 'true';
  const deuda = Math.max(i.deuda_inicial, 10000);
  const cae = Math.min(Math.max(i.cae_anual, 20), 55); // Tope CMF 2026 ~51%
  const tasaMensual = cae / 12 / 100;
  const pagoMensualInput = Math.max(i.pago_mensual, 5000);
  
  // Determinar pago inicial según tipo
  let pagoMensualActual = pagoMensualInput;
  const pagoMinimoInicial = deuda * 0.025; // 2.5% de deuda inicial
  
  if (i.tipo_pago === 'minimo') {
    pagoMensualActual = pagoMinimoInicial;
  }
  
  // Simulación de amortización
  let saldo = deuda;
  let interesesAcumulados = 0;
  let mes = 0;
  const maxMeses = 600; // Tope seguridad para evitar bucle infinito
  const tablaFlujoPrimeros12: Array<any> = [];
  
  while (saldo > 0.01 && mes < maxMeses) {
    mes += 1;
    const saldoInicio = saldo;
    const interesMes = saldoInicio * tasaMensual;
    interesesAcumulados += interesMes;
    
    // Pago: si es mínimo, recalcula cada mes como 2.5% del saldo
    let pagoEfectivo = pagoMensualActual;
    if (i.tipo_pago === 'minimo') {
      pagoEfectivo = Math.max(saldoInicio * 0.025, 5000);
    }
    
    saldo = saldoInicio + interesMes - pagoEfectivo;
    
    // Si saldo es negativo, el último pago fue menor
    if (saldo < 0) {
      pagoEfectivo = saldoInicio + interesMes;
      saldo = 0;
    }
    
    if (mes <= 12) {
      tablaFlujoPrimeros12.push({
        mes,
        saldo_inicio: Math.round(saldoInicio),
        interes: Math.round(interesMes),
        pago: Math.round(pagoEfectivo),
        saldo_final: Math.round(Math.max(saldo, 0))
      });
    }
    
    // Seguridad contra deuda infinita (pago menor que interés)
    if (mes > 360 && saldo > deuda * 1.5) {
      break; // Deuda explota, salir
    }
  }
  
  const mesesPago = mes >= maxMeses ? maxMeses : mes;
  const costTotal = deuda + interesesAcumulados;
  
  // Simulación préstamo consumo (tasa 20% CAE, 60 meses típico)
  let comparacionPrestamo = 0;
  if (i.comparar_prestamo) {
    const caePrestamo = 20; // Típica para préstamo consumo Chile
    const tasaMensualPrestamo = caePrestamo / 12 / 100;
    const mesesPrestamo = 60; // Cuota fija típica
    const cuotaMensual = (deuda * tasaMensualPrestamo * Math.pow(1 + tasaMensualPrestamo, mesesPrestamo)) /
      (Math.pow(1 + tasaMensualPrestamo, mesesPrestamo) - 1);
    const interesesPrestamo = (cuotaMensual * mesesPrestamo) - deuda;
    comparacionPrestamo = Math.max(interesesPrestamo, 0);
  }
  
  const ahorrosPotencial = Math.max(interesesAcumulados - comparacionPrestamo, 0);
  
  const interesesR = Math.round(interesesAcumulados);
  const costoR = Math.round(costTotal);
  const multiplicador = deuda > 0 ? costTotal / deuda : 0;
  const noTermina = mesesPago >= maxMeses && saldo > 0.01;
  const anios = (mesesPago / 12);

  const _insight = {
    title: i.tipo_pago === 'minimo' ? 'El pago mínimo casi no baja la deuda' : 'Cuánto te cuesta financiarte con la rotativa',
    text: noTermina
      ? `Con la CAE de **${cae.toFixed(1)}%** y este pago, en **${maxMeses} meses no terminás de pagar**: el abono apenas cubre el interés. Necesitás subir la cuota o pasar la deuda a un crédito de consumo más barato.`
      : `Por una deuda de **$${Math.round(deuda).toLocaleString('es-CL')}** a **${cae.toFixed(1)}% CAE** tardás **${mesesPago} meses** (${anios.toFixed(1)} años) y pagás **$${interesesR.toLocaleString('es-CL')}** de intereses: el total trepa a **$${costoR.toLocaleString('es-CL')}**, ${multiplicador.toFixed(1)}x lo que debías.`,
    tone: 'warn',
    icon: '💳',
  };

  // Gauge: meses hasta saldar la deuda (zonas de gravedad)
  const markerMeses = Math.min(mesesPago, 600);
  const _chart = {
    type: 'scale',
    marker: markerMeses,
    markerLabel: `${mesesPago} meses`,
    min: 0,
    segments: [
      { nombre: 'Manejable', max: 24, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Costoso', max: 60, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Trampa', max: 600, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Con este pago tardarías ${mesesPago} meses en saldar la deuda de la línea rotativa`,
  };

  return {
    meses_pago: mesesPago,
    tasa_mensual: parseFloat(tasaMensual.toFixed(5)),
    intereses_totales: interesesR,
    costo_total: costoR,
    tasa_minimo_inicial: Math.round(pagoMinimoInicial),
    comparacion_prestamo: Math.round(comparacionPrestamo),
    ahorro_potencial: Math.round(ahorrosPotencial),
    tabla_flujo: tablaFlujoPrimeros12,
    _insight,
    _chart
  };
}
