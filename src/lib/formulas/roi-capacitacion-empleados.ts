/** ROI de capacitación de empleados (modelo Phillips) */

export interface Inputs {
  costoPrograma: number;
  horasCapacitacion: number;
  costoHoraEmpleado: number;
  beneficioAnual: number;
}

export interface Outputs {
  roi: number;
  costoTotal: number;
  beneficioNeto: number;
  detalle: string;
}

export function roiCapacitacionEmpleados(i: Inputs): Outputs {
  const programa = Number(i.costoPrograma);
  const horas = Number(i.horasCapacitacion);
  const costoHora = Number(i.costoHoraEmpleado);
  const beneficio = Number(i.beneficioAnual);

  if (isNaN(programa) || programa < 0) throw new Error('Ingresá el costo del programa');
  if (isNaN(horas) || horas <= 0) throw new Error('Ingresá las horas de capacitación');
  if (isNaN(costoHora) || costoHora < 0) throw new Error('Ingresá el costo hora del empleado');
  if (isNaN(beneficio) || beneficio < 0) throw new Error('Ingresá el beneficio económico estimado');

  const costoHorasNoProd = horas * costoHora;
  const costoTotal = programa + costoHorasNoProd;
  const beneficioNeto = beneficio - costoTotal;
  const roi = costoTotal > 0 ? (beneficioNeto / costoTotal) * 100 : 0;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let evaluacion: string;
  if (roi > 100) {
    evaluacion = 'Excelente retorno — la inversión se duplica. Programa altamente recomendable.';
  } else if (roi > 0) {
    evaluacion = 'ROI positivo — la capacitación se paga y genera valor adicional.';
  } else if (roi === 0) {
    evaluacion = 'Punto de equilibrio — el beneficio apenas cubre el costo.';
  } else {
    evaluacion = 'ROI negativo — el costo supera los beneficios medibles. Revisá si hay beneficios intangibles.';
  }

  const paybackMeses = beneficio > 0 ? (costoTotal / beneficio) * 12 : Infinity;

  const detalle =
    `Costo programa: $${fmt.format(programa)}. ` +
    `Costo horas no productivas (${horas} hs × $${fmt.format(costoHora)}): $${fmt.format(costoHorasNoProd)}. ` +
    `Costo total: $${fmt.format(costoTotal)}. ` +
    `Beneficio anual: $${fmt.format(beneficio)}. ` +
    `Beneficio neto: $${fmt.format(beneficioNeto)}. ` +
    `Payback: ${paybackMeses === Infinity ? 'N/A' : paybackMeses.toFixed(1) + ' meses'}. ` +
    evaluacion;

  return {
    roi: Number(roi.toFixed(1)),
    costoTotal: Math.round(costoTotal),
    beneficioNeto: Math.round(beneficioNeto),
    detalle,
  };
}
