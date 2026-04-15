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

  return {
    tasaAprobacion: Math.round(tasa * 100) / 100,
    desaprobados,
    dificultad: `Dificultad: ${dificultad} (${tasa.toFixed(1)}% de aprobación)`,
    detalle: `${aprobados} aprobados de ${inscriptos} inscriptos = ${tasa.toFixed(1)}% de aprobación. ${desaprobados} no aprobaron.`,
  };
}
