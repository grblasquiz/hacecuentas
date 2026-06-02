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
  _insight?: any;
  _chart?: any;
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

  const roiR = Number(roi.toFixed(1));
  const costoTotalR = Math.round(costoTotal);
  const beneficioNetoR = Math.round(beneficioNeto);

  // Insight: ROI y payback deciden si la capacitación vale la inversión
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  const paybackTxt = paybackMeses === Infinity ? null : paybackMeses.toFixed(1);
  if (roiR > 100) {
    insTone = 'good';
    insText = `Excelente: con un ROI de **${roiR}%** el programa devuelve más del doble de lo invertido y deja **$${fmt.format(beneficioNetoR)}** netos${paybackTxt ? `, recuperándose en **${paybackTxt} meses**` : ''}.`;
  } else if (roiR > 0) {
    insTone = 'good';
    insText = `Inversión rentable: el ROI de **${roiR}%** suma **$${fmt.format(beneficioNetoR)}** sobre un costo total de **$${fmt.format(costoTotalR)}**${paybackTxt ? ` y se paga en **${paybackTxt} meses**` : ''}.`;
  } else if (roiR === 0) {
    insTone = 'neutral';
    insText = `Punto de equilibrio: el beneficio iguala el costo total de **$${fmt.format(costoTotalR)}**. La capacitación no pierde plata, pero el valor está en los intangibles.`;
  } else {
    insTone = 'warn';
    insText = `ROI negativo (**${roiR}%**): el costo de **$${fmt.format(costoTotalR)}** supera el beneficio medible y arroja **$${fmt.format(beneficioNetoR)}**. Revisá si hay retornos intangibles que justifiquen el gasto.`;
  }

  // Donut: el costo total se reparte entre el programa y las horas no productivas
  let _chart: any = undefined;
  if (costoTotalR > 0) {
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Programa', value: Math.round(programa) },
        { label: 'Horas no productivas', value: Math.round(costoHorasNoProd) },
      ],
      prefix: '$',
      centerValue: `$${fmt.format(costoTotalR)}`,
      centerLabel: 'Costo total',
      ariaLabel: `Costo total de $${fmt.format(costoTotalR)}: $${fmt.format(Math.round(programa))} de programa y $${fmt.format(Math.round(costoHorasNoProd))} en horas no productivas.`,
    };
  }

  return {
    roi: roiR,
    costoTotal: costoTotalR,
    beneficioNeto: beneficioNetoR,
    detalle,
    _insight: {
      title: 'Retorno de la capacitación',
      text: insText,
      tone: insTone,
      icon: '🎓',
    },
    _chart,
  };
}
