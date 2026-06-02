/** Calculadora de ratio alumno-profesor por curso */

export interface Inputs {
  cantidadAlumnos: number;
  cantidadProfesores: number;
}

export interface Outputs {
  ratio: number;
  calidadEstimada: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function ratioAlumnoProfesorCurso(i: Inputs): Outputs {
  const alumnos = Number(i.cantidadAlumnos);
  const profesores = Number(i.cantidadProfesores);

  if (isNaN(alumnos) || alumnos < 1) {
    throw new Error('Ingresá la cantidad de alumnos (mínimo 1)');
  }
  if (isNaN(profesores) || profesores < 1) {
    throw new Error('Ingresá la cantidad de profesores (mínimo 1)');
  }

  const ratio = alumnos / profesores;

  let calidad: string;
  if (ratio <= 10) calidad = 'Excelente: atención altamente personalizada';
  else if (ratio <= 20) calidad = 'Muy buena: buena interacción con el docente';
  else if (ratio <= 30) calidad = 'Buena: atención adecuada';
  else if (ratio <= 50) calidad = 'Aceptable: atención limitada';
  else if (ratio <= 100) calidad = 'Deficiente: poca atención personalizada';
  else calidad = 'Clase masiva: atención personalizada mínima';

  const ratioR = Math.round(ratio * 10) / 10;

  const tone: 'good' | 'warn' | 'neutral' = ratio <= 20 ? 'good' : ratio <= 30 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Qué dice este ratio',
    text: `Hay **${ratioR} alumno(s) por docente** en el curso. ${calidad}.`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale',
    marker: ratioR,
    markerLabel: `${ratioR}:1`,
    min: 0,
    segments: [
      { nombre: 'Excelente', max: 10, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Muy buena', max: 20, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Buena', max: 30, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Aceptable', max: 50, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Masiva', max: Math.max(100, Math.ceil(ratioR) + 10), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Ratio de ${ratioR} alumnos por docente sobre escala de calidad de atención`,
  };

  return {
    ratio: ratioR,
    calidadEstimada: calidad,
    detalle: `${alumnos} alumnos ÷ ${profesores} docente(s) = ratio ${ratio.toFixed(1)}:1. ${calidad}.`,
    _insight,
    _chart,
  };
}
