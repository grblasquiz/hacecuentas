/** Calculadora de ratio alumno-profesor por curso */

export interface Inputs {
  cantidadAlumnos: number;
  cantidadProfesores: number;
}

export interface Outputs {
  ratio: number;
  calidadEstimada: string;
  detalle: string;
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

  return {
    ratio: Math.round(ratio * 10) / 10,
    calidadEstimada: calidad,
    detalle: `${alumnos} alumnos ÷ ${profesores} docente(s) = ratio ${ratio.toFixed(1)}:1. ${calidad}.`,
  };
}
