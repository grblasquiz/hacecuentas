/** ROI curso Udemy */
export interface Inputs { horasProduccion: number; precioPublicado: number; alumnosEsperados: number; valorHora: number; }
export interface Outputs { ingresoAnual: number; costoOportunidad: number; roiPct: number; precioEfectivo: number; mesesPayback: number; _insight?: any; _chart?: any; }
export function roiCursoOnlineUdemy(i: Inputs): Outputs {
  const hs = Number(i.horasProduccion);
  const precio = Number(i.precioPublicado);
  const alumnos = Number(i.alumnosEsperados);
  const valorHora = Number(i.valorHora);
  if (hs < 0 || precio < 0 || alumnos < 0) throw new Error('Valores inválidos');
  const precioEfectivo = Math.max(10, precio * 0.15);
  const revenueShare = 0.50;
  const ingreso = alumnos * precioEfectivo * revenueShare;
  const costoOp = hs * valorHora;
  const roi = costoOp > 0 ? ((ingreso - costoOp) / costoOp) * 100 : 0;
  const ingresoMensual = ingreso / 12;
  const payback = ingresoMensual > 0 ? costoOp / ingresoMensual : 999;

  const roiR = Number(roi.toFixed(2));
  const ingresoR = Math.round(ingreso);
  const costoOpR = Math.round(costoOp);
  const paybackR = Number(payback.toFixed(1));
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Insight: el ROI contra el costo de oportunidad de producir el curso
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  if (costoOpR <= 0) {
    insTone = 'neutral';
    insText = `Sin costo de oportunidad cargado el ROI no se puede medir. A precio efectivo de **$${precioEfectivo.toFixed(2)}** por venta, el curso facturaría **$${fmt.format(ingresoR)}** al año.`;
  } else if (roiR > 100) {
    insTone = 'good';
    insText = `Muy rentable: el ROI de **${roiR}%** más que duplica las **${hs} horas** invertidas, con **$${fmt.format(ingresoR)}** de ingreso anual y payback en **${paybackR} meses**.`;
  } else if (roiR >= 0) {
    insTone = 'warn';
    insText = `El curso recupera la inversión con un ROI de **${roiR}%**, pero el margen sobre tu tiempo es ajustado: **$${fmt.format(ingresoR)}** anuales frente a **$${fmt.format(costoOpR)}** de costo de oportunidad. Subí matrícula o precio para que rinda más.`;
  } else {
    insTone = 'warn';
    insText = `ROI negativo (**${roiR}%**): producir el curso cuesta **$${fmt.format(costoOpR)}** de tu tiempo y sólo proyecta **$${fmt.format(ingresoR)}** al año. Necesitás más alumnos o un precio mayor para que valga la pena.`;
  }

  // Gauge: ROI% contra zonas de rentabilidad
  let _chart: any = undefined;
  if (costoOpR > 0) {
    const segMax = Math.max(150, Number((roiR * 1.1).toFixed(2)));
    const gaugeMin = Math.min(-50, Number((roiR - 10).toFixed(2)));
    _chart = {
      type: 'scale',
      marker: roiR,
      markerLabel: `ROI ${roiR}%`,
      min: gaugeMin,
      segments: [
        { nombre: 'Pérdida', max: 0, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Ajustado', max: 100, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Rentable', max: segMax, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `ROI del curso de ${roiR}% sobre el costo de producción.`,
    };
  }

  return {
    ingresoAnual: ingresoR,
    costoOportunidad: costoOpR,
    roiPct: roiR,
    precioEfectivo: Number(precioEfectivo.toFixed(2)),
    mesesPayback: paybackR,
    _insight: {
      title: 'Retorno de tu curso online',
      text: insText,
      tone: insTone,
      icon: '🎬',
    },
    _chart,
  };
}
