/** Alcance orgánico vs pago en redes sociales */
export interface AlcanceOrganicoInputs {
  seguidores: number;
  alcanceOrganico: number;
  inversionPaga?: number;
  cpmPago?: number;
}
export interface AlcanceOrganicoOutputs {
  tasaAlcanceOrganico: number;
  impresionesOrganicas: number;
  impresionespagas: number;
  alcanceTotal: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function alcanceOrganico(inputs: AlcanceOrganicoInputs): AlcanceOrganicoOutputs {
  const seguidores = Number(inputs.seguidores);
  const orgAlcance = Number(inputs.alcanceOrganico);
  const inversion = Number(inputs.inversionPaga || 0);
  const cpm = Number(inputs.cpmPago || 0);

  if (!seguidores || seguidores <= 0) throw new Error('Ingresá la cantidad de seguidores');
  if (orgAlcance < 0) throw new Error('El alcance orgánico no puede ser negativo');

  const tasaOrg = Number(((orgAlcance / seguidores) * 100).toFixed(1));
  const impOrganicas = Math.round(orgAlcance * 1.3); // factor frecuencia
  const impPagas = cpm > 0 && inversion > 0 ? Math.round((inversion / cpm) * 1000) : 0;
  const alcanceTotal = orgAlcance + impPagas;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  let evaluacion = '';
  if (tasaOrg >= 25) evaluacion = 'Excelente alcance orgánico';
  else if (tasaOrg >= 15) evaluacion = 'Buen alcance orgánico';
  else if (tasaOrg >= 8) evaluacion = 'Alcance promedio';
  else if (tasaOrg >= 3) evaluacion = 'Alcance bajo — considerá más inversión paga';
  else evaluacion = 'Alcance muy bajo — revisá contenido y frecuencia';

  const chart = {
    type: 'scale' as const,
    marker: tasaOrg,
    markerLabel: 'Tu tasa: ' + fmt.format(tasaOrg) + '%',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Muy bajo', max: 3, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Bajo', max: 8, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Promedio', max: 15, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 25, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(40, Math.ceil(tasaOrg) + 5), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de tasa de alcance orgánico: muy bajo, bajo, promedio, bueno y excelente.',
  };

  const insightTone: 'good' | 'warn' | 'neutral' = tasaOrg >= 15 ? 'good' : tasaOrg >= 8 ? 'neutral' : 'warn';
  const insight = {
    title: evaluacion.split('—')[0].trim(),
    text: tasaOrg >= 15
      ? `Tu **${fmt.format(tasaOrg)}%** de alcance orgánico está sobre el promedio: el algoritmo está mostrando tus posts. Capitalizalo con frecuencia y formatos que ya funcionan antes de meter inversión paga.`
      : `Tu **${fmt.format(tasaOrg)}%** de alcance orgánico queda en zona **${evaluacion.split('—')[0].trim().toLowerCase()}**: de cada 100 seguidores te ven ~${Math.round(tasaOrg)}. Mejorá gancho y frecuencia, y considerá inversión paga para ampliar alcance.`,
    tone: insightTone,
    icon: '📣',
  };

  return {
    tasaAlcanceOrganico: tasaOrg,
    impresionesOrganicas: impOrganicas,
    impresionespagas: impPagas,
    alcanceTotal,
    detalle: `Tasa de alcance orgánico: ${fmt.format(tasaOrg)}% (${evaluacion}). ~${fmt.format(impOrganicas)} impresiones orgánicas + ${fmt.format(impPagas)} impresiones pagas = alcance total ~${fmt.format(alcanceTotal)}.`,
    _chart: chart,
    _insight: insight,
  };
}
