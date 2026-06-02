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
  _insight?: any;
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

  const distR = Number(distanciaBreakEven.toFixed(2));
  const pnlR = Number(pnlActual.toFixed(2));
  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (precioActual > 0) {
    const dir = tipo === 'call' ? 'subir' : 'bajar';
    const mov = `${Math.abs(distR).toFixed(1)}%`;
    tone = pnlR > 0 ? 'good' : 'warn';
    insightText = pnlR > 0
      ? `Tu break-even es **$${breakEven.toFixed(2)}** y el subyacente ya lo superó: ejercida hoy la posición vale **+$${pnlR.toLocaleString()}**. Recordá que la pérdida está acotada a la prima (**$${costoTotal.toLocaleString()}**).`
      : `El subyacente debe ${dir} **${mov}** hasta **$${breakEven.toFixed(2)}** para que empieces a ganar. Ejercida hoy perderías **$${Math.abs(pnlR).toLocaleString()}**; el máximo en riesgo es la prima de **$${costoTotal.toLocaleString()}**.`;
  } else {
    tone = 'warn';
    insightText = `Tu break-even es **$${breakEven.toFixed(2)}**: la ${tipoStr.toLowerCase()} solo da ganancia si el subyacente cruza ese precio antes del vencimiento. El máximo que podés perder es la prima pagada, **$${costoTotal.toLocaleString()}**.`;
  }

  return {
    breakEven: Number(breakEven.toFixed(2)),
    costoTotal,
    gananciaMaxima,
    perdidaMaxima,
    distanciaBreakEven: distR,
    pnlActual: pnlR,
    formula,
    explicacion,
    _insight: { title: `Break-even de tu ${tipoStr.toLowerCase()}`, text: insightText, tone, icon: '📈' },
  };
}
