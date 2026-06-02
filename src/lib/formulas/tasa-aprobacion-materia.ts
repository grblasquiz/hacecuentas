/** Calculadora de tasa de aprobación de materia */

export interface Inputs {
  inscriptos: number;
  aprobados: number;
}

export interface Outputs {
  tasaAprobacion: number;
  desaprobados: number;
  dificultad: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function tasaAprobacionMateria(i: Inputs): Outputs {
  const inscriptos = Number(i.inscriptos);
  const aprobados = Number(i.aprobados);

  if (isNaN(inscriptos) || inscriptos < 1) {
    throw new Error('Ingresá la cantidad de inscriptos (mínimo 1)');
  }
  if (isNaN(aprobados) || aprobados < 0) {
    throw new Error('La cantidad de aprobados no puede ser negativa');
  }
  if (aprobados > inscriptos) {
    throw new Error('Los aprobados no pueden superar a los inscriptos');
  }

  const tasa = (aprobados / inscriptos) * 100;
  const desaprobados = inscriptos - aprobados;

  let dificultad: string;
  if (tasa >= 80) dificultad = 'Baja';
  else if (tasa >= 60) dificultad = 'Moderada';
  else if (tasa >= 40) dificultad = 'Alta';
  else if (tasa >= 20) dificultad = 'Muy alta';
  else dificultad = 'Extrema';

  const _insight = {
    title: `Dificultad: ${dificultad.toLowerCase()}`,
    text: `Aprobaron **${aprobados} de ${inscriptos}** inscriptos: una tasa del **${tasa.toFixed(1)}%**, lo que ubica a la materia en dificultad **${dificultad.toLowerCase()}**. ${desaprobados} persona${desaprobados === 1 ? '' : 's'} no aprobó.`,
    tone: tasa >= 60 ? 'good' : tasa >= 40 ? 'neutral' : 'warn',
    icon: '🎓',
  };

  const _chart = {
    type: 'scale',
    marker: Math.round(tasa * 10) / 10,
    markerLabel: `${tasa.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Extrema', max: 20, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Muy alta', max: 40, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Alta', max: 60, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Moderada', max: 80, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Baja', max: 100, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Tasa de aprobación del ${tasa.toFixed(1)}% sobre una escala de dificultad de 0 a 100`,
  };

  return {
    tasaAprobacion: Math.round(tasa * 100) / 100,
    desaprobados,
    dificultad: `Dificultad: ${dificultad} (${tasa.toFixed(1)}% de aprobación)`,
    detalle: `${aprobados} aprobados de ${inscriptos} inscriptos = ${tasa.toFixed(1)}% de aprobación. ${desaprobados} no aprobaron.`,
    _insight,
    _chart,
  };
}
