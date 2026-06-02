/** ROI de campañas de email marketing */
export interface RoiEmailMarketingInputs {
  costoTotal: number;
  ingresoGenerado: number;
  suscriptores: number;
  tasaApertura?: number;
  tasaClick?: number;
}
export interface RoiEmailMarketingOutputs {
  roi: number;
  ingresoPorSuscriptor: number;
  ingresoPorEmail: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function roiEmailMarketing(inputs: RoiEmailMarketingInputs): RoiEmailMarketingOutputs {
  const costo = Number(inputs.costoTotal);
  const ingreso = Number(inputs.ingresoGenerado);
  const suscriptores = Number(inputs.suscriptores);
  const tasaApertura = Number(inputs.tasaApertura || 0);
  const tasaClick = Number(inputs.tasaClick || 0);

  if (costo < 0) throw new Error('El costo no puede ser negativo');
  if (ingreso < 0) throw new Error('El ingreso no puede ser negativo');
  if (!suscriptores || suscriptores <= 0) throw new Error('Ingresá la cantidad de suscriptores');

  const roi = costo > 0 ? Number((((ingreso - costo) / costo) * 100).toFixed(1)) : 0;
  const ingresoPorSusc = Number((ingreso / suscriptores).toFixed(2));

  const emailsAbiertos = tasaApertura > 0 ? suscriptores * (tasaApertura / 100) : suscriptores;
  const ingresoPorEmail = Number((ingreso / emailsAbiertos).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let evaluacion = '';
  if (roi >= 3000) evaluacion = 'Excelente';
  else if (roi >= 2000) evaluacion = 'Muy bueno';
  else if (roi >= 1000) evaluacion = 'Bueno';
  else if (roi >= 0) evaluacion = 'Mejorable';
  else evaluacion = 'Negativo — la campaña costó más de lo que generó';

  // Insight: el ROI dice cuántos pesos vuelven por cada peso invertido en email
  let insTone: 'good' | 'warn' | 'neutral';
  let insText: string;
  if (costo <= 0) {
    insTone = 'neutral';
    insText = `Sin costo cargado no hay ROI, pero la campaña genera **$${fmt.format(ingresoPorSusc)}** por suscriptor sobre tu lista de **${fmt.format(suscriptores)}**.`;
  } else if (roi < 0) {
    insTone = 'warn';
    insText = `ROI negativo (**${fmt.format(roi)}%**): la campaña costó **$${fmt.format(costo)}** y generó sólo **$${fmt.format(ingreso)}**. Revisá la segmentación y la oferta antes de reinvertir.`;
  } else if (roi >= 2000) {
    insTone = 'good';
    insText = `Resultado de primer nivel: con **${fmt.format(roi)}%** de ROI, cada $1 invertido devolvió **$${fmt.format(roi / 100 + 1)}**. El email rinde **$${fmt.format(ingresoPorSusc)}** por suscriptor.`;
  } else if (roi >= 1000) {
    insTone = 'good';
    insText = `Buen retorno: **${fmt.format(roi)}%** de ROI deja **$${fmt.format(ingresoPorSusc)}** por suscriptor. Estás dentro del rango sano del email marketing; optimizá asunto y segmentos para escalar.`;
  } else {
    insTone = 'warn';
    insText = `ROI de **${fmt.format(roi)}%**: la campaña es rentable pero rinde por debajo del promedio del canal. Mejorá apertura${tasaApertura > 0 ? ` (hoy ${fmt.format(tasaApertura)}%)` : ''} y la oferta para subir los **$${fmt.format(ingresoPorSusc)}** por suscriptor.`;
  }

  // Gauge: ROI% contra benchmarks del email marketing (sólo con ROI positivo)
  let _chart: any = undefined;
  if (costo > 0 && roi >= 0) {
    const segMax = Math.max(3000, Number((roi * 1.1).toFixed(0)));
    _chart = {
      type: 'scale',
      marker: roi,
      markerLabel: `ROI ${fmt.format(roi)}%`,
      min: 0,
      segments: [
        { nombre: 'Mejorable', max: 1000, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Bueno', max: 2000, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Excelente', max: segMax, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `ROI de la campaña de email de ${fmt.format(roi)}%.`,
    };
  }

  return {
    roi,
    ingresoPorSuscriptor: ingresoPorSusc,
    ingresoPorEmail: ingresoPorEmail,
    detalle: `ROI ${fmt.format(roi)}% (${evaluacion}). Ingreso $${fmt.format(ingreso)} sobre costo $${fmt.format(costo)} → $${fmt.format(ingresoPorSusc)}/suscriptor, $${fmt.format(ingresoPorEmail)}/email abierto.${tasaApertura > 0 ? ` Apertura ${fmt.format(tasaApertura)}%.` : ''}${tasaClick > 0 ? ` Click ${fmt.format(tasaClick)}%.` : ''}`,
    _insight: {
      title: 'Retorno de tu campaña de email',
      text: insText,
      tone: insTone,
      icon: '📧',
    },
    _chart,
  };
}
