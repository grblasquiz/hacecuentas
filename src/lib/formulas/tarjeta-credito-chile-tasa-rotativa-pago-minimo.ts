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
}

export function compute(i: Inputs): Outputs {
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
  
  return {
    meses_pago: mesesPago,
    tasa_mensual: parseFloat(tasaMensual.toFixed(5)),
    intereses_totales: Math.round(interesesAcumulados),
    costo_total: Math.round(costTotal),
    tasa_minimo_inicial: Math.round(pagoMinimoInicial),
    comparacion_prestamo: Math.round(comparacionPrestamo),
    ahorro_potencial: Math.round(ahorrosPotencial),
    tabla_flujo: tablaFlujoPrimeros12
  };
}
