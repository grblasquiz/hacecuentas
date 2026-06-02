/** Cuánto cobrar por hora freelance */

export interface Inputs {
  gastosMensuales: number;
  horasDisponibles: number;
  margenDeseado: number;
  impuestos: number;
}

export interface Outputs {
  tarifaRecomendada: number;
  tarifaMinima: number;
  tarifaPremium: number;
  ingresoMensualRecomendado: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function cuantoCobroPorHoraFreelance(i: Inputs): Outputs {
  const gastos = Number(i.gastosMensuales);
  const horas = Number(i.horasDisponibles);
  const margen = Number(i.margenDeseado);
  const impuestos = Number(i.impuestos);

  if (isNaN(gastos) || gastos <= 0) throw new Error('Ingresá tus gastos mensuales');
  if (isNaN(horas) || horas <= 0) throw new Error('Ingresá las horas facturables por mes');
  if (isNaN(margen) || margen < 0) throw new Error('El margen no puede ser negativo');
  if (isNaN(impuestos) || impuestos < 0 || impuestos >= 100) throw new Error('Los impuestos deben estar entre 0 y 99%');

  // Tarifa mínima: cubrir gastos + impuestos (sin margen)
  const costoBaseHora = gastos / horas;
  const factorImpuestos = 1 - impuestos / 100;
  const tarifaMinima = Math.round(costoBaseHora / factorImpuestos);

  // Tarifa recomendada: gastos + margen + impuestos
  const factorMargen = 1 + margen / 100;
  const tarifaRecomendada = Math.round((costoBaseHora * factorMargen) / factorImpuestos);

  // Tarifa premium: recomendada + 50% adicional
  const tarifaPremium = Math.round(tarifaRecomendada * 1.5);

  const ingresoMensualRecomendado = Math.round(tarifaRecomendada * horas);

  const netoMensual = Math.round(ingresoMensualRecomendado * factorImpuestos);
  const gananciaReal = netoMensual - gastos;

  const detalle = `Gastos: $${gastos.toLocaleString()}/mes. Horas facturables: ${horas}h/mes. Impuestos: ${impuestos}%. Con tarifa recomendada facturás $${ingresoMensualRecomendado.toLocaleString()}/mes bruto, te quedan $${netoMensual.toLocaleString()} neto, ganancia: $${gananciaReal.toLocaleString()}/mes.`;

  const impuestoMonto = ingresoMensualRecomendado - netoMensual;
  const tone = gananciaReal <= 0 ? 'warn' : gananciaReal < gastos ? 'neutral' : 'good';
  const _insight = {
    title: gananciaReal <= 0
      ? 'La tarifa no deja ganancia'
      : gananciaReal < gastos
        ? 'Cubrís costos con margen ajustado'
        : 'Tarifa con buen colchón',
    text: gananciaReal <= 0
      ? `A **$${tarifaRecomendada.toLocaleString()}/h** apenas cubrís gastos e impuestos: la ganancia real queda en **$${gananciaReal.toLocaleString()}/mes**. Subí la tarifa o recortá gastos fijos.`
      : `Cobrando **$${tarifaRecomendada.toLocaleString()}/h** facturás **$${ingresoMensualRecomendado.toLocaleString()}/mes** bruto; tras **${impuestos}% de impuestos** te quedan $${netoMensual.toLocaleString()} neto y una ganancia de **$${gananciaReal.toLocaleString()}/mes** sobre tus gastos.`,
    tone,
    icon: '💻',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Gastos', value: gastos },
      { label: 'Impuestos', value: impuestoMonto },
      { label: 'Ganancia', value: Math.max(0, gananciaReal) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + ingresoMensualRecomendado.toLocaleString(),
    centerLabel: 'bruto/mes',
    ariaLabel: `De $${ingresoMensualRecomendado.toLocaleString()} facturados al mes: $${gastos.toLocaleString()} a gastos, $${impuestoMonto.toLocaleString()} a impuestos y $${Math.max(0, gananciaReal).toLocaleString()} de ganancia.`,
  };

  return { tarifaRecomendada, tarifaMinima, tarifaPremium, ingresoMensualRecomendado, detalle, _insight, _chart };
}
