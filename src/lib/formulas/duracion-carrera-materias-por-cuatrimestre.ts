/** Calculadora de duración de carrera según materias por cuatrimestre */

export interface Inputs {
  materiasFaltantes: number;
  materiasPorCuatri: number;
  cuatrisPorAnio: number;
}

export interface Outputs {
  aniosRestantes: number;
  cuatrimestresRestantes: number;
  fechaEstimada: string;
  detalle: string;
}

export function duracionCarreraMateriasPorCuatrimestre(i: Inputs): Outputs {
  const materiasFaltantes = Number(i.materiasFaltantes);
  const materiasPorCuatri = Number(i.materiasPorCuatri);
  const cuatrisPorAnio = Number(i.cuatrisPorAnio);

  if (!materiasFaltantes || materiasFaltantes < 1) {
    throw new Error('Ingresá la cantidad de materias que te faltan (mínimo 1)');
  }
  if (!materiasPorCuatri || materiasPorCuatri < 1) {
    throw new Error('Ingresá cuántas materias pensás cursar por cuatrimestre (mínimo 1)');
  }
  if (!cuatrisPorAnio || cuatrisPorAnio < 1 || cuatrisPorAnio > 3) {
    throw new Error('Los cuatrimestres por año deben ser 1, 2 o 3');
  }

  const cuatrimestresRestantes = Math.ceil(materiasFaltantes / materiasPorCuatri);
  const aniosRestantes = cuatrimestresRestantes / cuatrisPorAnio;

  const hoy = new Date();
  const mesesAdicionales = Math.round(aniosRestantes * 12);
  const fechaGraduacion = new Date(hoy.getFullYear(), hoy.getMonth() + mesesAdicionales, 1);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaEstimada = `${meses[fechaGraduacion.getMonth()]} ${fechaGraduacion.getFullYear()}`;

  return {
    aniosRestantes: Math.round(aniosRestantes * 10) / 10,
    cuatrimestresRestantes,
    fechaEstimada: `Graduación estimada: ${fechaEstimada}`,
    detalle: `Con ${materiasPorCuatri} materia(s) por cuatrimestre y ${cuatrisPorAnio} cuatrimestre(s) por año, te faltan ${cuatrimestresRestantes} cuatrimestres (${aniosRestantes.toFixed(1)} años)`,
  };
}
