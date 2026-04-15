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

  return {
    roi,
    ingresoPorSuscriptor: ingresoPorSusc,
    ingresoPorEmail: ingresoPorEmail,
    detalle: `ROI ${fmt.format(roi)}% (${evaluacion}). Ingreso $${fmt.format(ingreso)} sobre costo $${fmt.format(costo)} → $${fmt.format(ingresoPorSusc)}/suscriptor, $${fmt.format(ingresoPorEmail)}/email abierto.${tasaApertura > 0 ? ` Apertura ${fmt.format(tasaApertura)}%.` : ''}${tasaClick > 0 ? ` Click ${fmt.format(tasaClick)}%.` : ''}`,
  };
}
