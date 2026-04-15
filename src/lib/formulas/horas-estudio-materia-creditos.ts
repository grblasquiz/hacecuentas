/** Calculadora de horas de estudio semanales por materia */

export interface Inputs {
  horasClase: number;
  factorEstudio: number;
  cantidadMaterias: number;
}

export interface Outputs {
  horasSemanalesPorMateria: number;
  horasSemanalesTotal: number;
  horasEstudioExtra: number;
  detalle: string;
}

export function horasEstudioMateriaCreditos(i: Inputs): Outputs {
  const horasClase = Number(i.horasClase);
  const factor = Number(i.factorEstudio);
  const materias = Number(i.cantidadMaterias);

  if (isNaN(horasClase) || horasClase < 1) {
    throw new Error('Ingresá las horas de clase semanales (mínimo 1)');
  }
  if (isNaN(factor) || factor < 1 || factor > 5) {
    throw new Error('El factor de estudio debe estar entre 1 y 5');
  }
  if (isNaN(materias) || materias < 1) {
    throw new Error('Ingresá la cantidad de materias (mínimo 1)');
  }

  const horasPorMateria = horasClase * factor;
  const horasExtra = horasPorMateria - horasClase;
  const horasTotal = horasPorMateria * materias;

  return {
    horasSemanalesPorMateria: Math.round(horasPorMateria * 10) / 10,
    horasSemanalesTotal: Math.round(horasTotal * 10) / 10,
    horasEstudioExtra: Math.round(horasExtra * 10) / 10,
    detalle: `${horasClase}hs clase × ${factor} factor = ${horasPorMateria.toFixed(1)}hs/semana por materia. Con ${materias} materia(s): ${horasTotal.toFixed(1)}hs/semana totales`,
  };
}
