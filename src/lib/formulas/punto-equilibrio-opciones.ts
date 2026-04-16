/** Break-even de opciones (call y put) */

export interface Inputs {
  tipoOpcion: string;
  precioEjercicio: number;
  primaOpcion: number;
  cantidadContratos: number;
  precioSubyacente: number;
}

export interface Outputs {
  breakEven: number;
  costoTotal: number;
  gananciaMaxima: string;
  perdidaMaxima: number;
  distanciaBreakEven: number;
  pnlActual: number;
  formula: string;
  explicacion: string;
}

export function puntoEquilibrioOpciones(i: Inputs): Outputs {
  const tipo = String(i.tipoOpcion || 'call').toLowerCase();
  const strike = Number(i.precioEjercicio);
  const prima = Number(i.primaOpcion);
  const contratos = Number(i.cantidadContratos) || 1;
  const precioActual = Number(i.precioSubyacente) || 0;

  if (!strike || strike <= 0) throw new Error('Ingresá el precio de ejercicio (strike)');
  if (!prima || prima <= 0) throw new Error('Ingresá la prima de la opción');

  // Cada contrato = 100 acciones (estándar USA)
  const multiplicador = 100;
  const costoTotal = prima * multiplicador * contratos;

  let breakEven: number;
  let gananciaMaxima: string;
  let perdidaMaxima: number;
  let pnlActual: number;

  if (tipo === 'call') {
    // Call: BE = Strike + Prima
    breakEven = strike + prima;
    gananciaMaxima = 'Ilimitada';
    perdidaMaxima = costoTotal;

    // P&L si ejercemos hoy
    if (precioActual > 0) {
      const valorIntrínseco = Math.max(0, precioActual - strike);
      pnlActual = (valorIntrínseco - prima) * multiplicador * contratos;
    } else {
      pnlActual = -costoTotal;
    }
  } else {
    // Put: BE = Strike - Prima
    breakEven = strike - prima;
    gananciaMaxima = `$${((strike - prima) * multiplicador * contratos).toLocaleString()} (si llega a $0)`;
    perdidaMaxima = costoTotal;

    if (precioActual > 0) {
      const valorIntrínseco = Math.max(0, strike - precioActual);
      pnlActual = (valorIntrínseco - prima) * multiplicador * contratos;
    } else {
      pnlActual = -costoTotal;
    }
  }

  const distanciaBreakEven = precioActual > 0 ? ((breakEven - precioActual) / precioActual) * 100 : 0;

  const tipoStr = tipo === 'call' ? 'Call' : 'Put';
  const formula = tipo === 'call'
    ? `BE = $${strike} + $${prima} = $${breakEven.toFixed(2)}`
    : `BE = $${strike} - $${prima} = $${breakEven.toFixed(2)}`;

  const explicacion = `${tipoStr} comprada: strike $${strike}, prima $${prima} (${contratos} contrato(s)). Costo total: $${costoTotal.toLocaleString()}. Break-even: $${breakEven.toFixed(2)}${precioActual > 0 ? ` (${Math.abs(distanciaBreakEven).toFixed(1)}% ${distanciaBreakEven > 0 ? 'arriba' : 'abajo'} del precio actual)` : ''}. Pérdida máxima: $${perdidaMaxima.toLocaleString()} (si expira sin valor). Ganancia máxima: ${gananciaMaxima}.${precioActual > 0 ? ` P&L actual: ${pnlActual >= 0 ? '+' : ''}$${pnlActual.toLocaleString()}.` : ''}`;

  return {
    breakEven: Number(breakEven.toFixed(2)),
    costoTotal,
    gananciaMaxima,
    perdidaMaxima,
    distanciaBreakEven: Number(distanciaBreakEven.toFixed(2)),
    pnlActual: Number(pnlActual.toFixed(2)),
    formula,
    explicacion,
  };
}
