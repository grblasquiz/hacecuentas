/** Costo por Lead (CPL) */
export interface CostoPorLeadInputs {
  inversionPublicidad: number;
  leadsGenerados: number;
}
export interface CostoPorLeadOutputs {
  cpl: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  const tone = cpl <= 3000 ? 'good' : cpl <= 8000 ? 'neutral' : 'warn';
  const _insight = {
    title: cpl <= 3000 ? 'CPL eficiente' : cpl <= 8000 ? 'CPL en rango medio' : 'CPL elevado',
    text: tone === 'good'
      ? `Cada lead te sale **$${fmt.format(cpl)}** — muy competitivo. Con $${fmt.format(inversion)} conseguiste **${fmt.format(leads)} leads**. A este costo, podés escalar la inversión manteniendo la rentabilidad.`
      : tone === 'neutral'
        ? `Tu CPL de **$${fmt.format(cpl)}** está en un rango aceptable para la mayoría de las industrias. Para bajarlo, probá afinar la segmentación o mejorar la conversión de la landing page.`
        : `Estás pagando **$${fmt.format(cpl)}** por lead, un valor alto. Revisá la calidad de esos **${fmt.format(leads)} leads**, la segmentación y la landing: si los leads no convierten, el costo real por cliente es mucho mayor.`,
    tone,
    icon: '🎯',
  };

  const _chart = {
    type: 'scale',
    marker: cpl,
    markerLabel: `$${fmt.format(cpl)}`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 1000, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Bajo', max: 3000, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Medio', max: 8000, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Alto', max: 20000, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Muy alto', max: Math.max(25000, Math.ceil(cpl * 1.1)), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Costo por lead de $${fmt.format(cpl)} ubicado en la zona ${cpl <= 1000 ? 'muy baja' : cpl <= 3000 ? 'baja' : cpl <= 8000 ? 'media' : cpl <= 20000 ? 'alta' : 'muy alta'}`,
  };

  return {
    cpl,
    detalle: `Inversión $${fmt.format(inversion)} / ${fmt.format(leads)} leads = CPL $${fmt.format(cpl)}. ${evaluacion}.`,
    _insight,
    _chart,
  };
}
