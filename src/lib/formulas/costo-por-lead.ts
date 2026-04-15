/** Costo por Lead (CPL) */
export interface CostoPorLeadInputs {
  inversionPublicidad: number;
  leadsGenerados: number;
}
export interface CostoPorLeadOutputs {
  cpl: number;
  detalle: string;
}

export function costoPorLead(inputs: CostoPorLeadInputs): CostoPorLeadOutputs {
  const inversion = Number(inputs.inversionPublicidad);
  const leads = Number(inputs.leadsGenerados);

  if (inversion < 0) throw new Error('La inversión no puede ser negativa');
  if (!leads || leads <= 0) throw new Error('Ingresá la cantidad de leads generados');

  const cpl = Number((inversion / leads).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let evaluacion = '';
  if (cpl <= 1000) evaluacion = 'Muy bajo — excelente eficiencia';
  else if (cpl <= 3000) evaluacion = 'Bajo — buena eficiencia';
  else if (cpl <= 8000) evaluacion = 'Medio — aceptable para la mayoría de industrias';
  else if (cpl <= 20000) evaluacion = 'Alto — verificá la calidad de los leads';
  else evaluacion = 'Muy alto — revisá la segmentación y la landing page';

  return {
    cpl,
    detalle: `Inversión $${fmt.format(inversion)} / ${fmt.format(leads)} leads = CPL $${fmt.format(cpl)}. ${evaluacion}.`,
  };
}
