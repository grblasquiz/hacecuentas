/** Cuánto tardás en terminar la carrera */
export interface Inputs {
  totalMaterias: number;
  materiasAprobadas: number;
  materiasPorCuatri: number;
  porcentajeAprobacion: number;
}
export interface Outputs {
  cuatrimestresRestantes: number;
  aniosRestantes: number;
  materiasRestantes: number;
  fechaEstimada: string;
  mensaje: string;
}

export function duracionCarreraUniversidad(i: Inputs): Outputs {
  const total = Number(i.totalMaterias);
  const aprobadas = Number(i.materiasAprobadas) || 0;
  const porCuatri = Number(i.materiasPorCuatri) || 4;
  const tasaAprobacion = Number(i.porcentajeAprobacion) || 70;

  if (!total || total <= 0) throw new Error('Ingresá el total de materias');
  if (porCuatri <= 0) throw new Error('Ingresá al menos 1 materia por cuatrimestre');

  const materiasRestantes = Math.max(0, total - aprobadas);

  // Ajustar por tasa de aprobación
  const materiasEfectivasPorCuatri = porCuatri * (tasaAprobacion / 100);
  const cuatrimestresRestantes = Math.ceil(materiasRestantes / materiasEfectivasPorCuatri);
  const aniosRestantes = cuatrimestresRestantes / 2;

  const fechaMeta = new Date();
  fechaMeta.setMonth(fechaMeta.getMonth() + cuatrimestresRestantes * 6);
  const fechaEstimada = fechaMeta.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return {
    cuatrimestresRestantes,
    aniosRestantes: Number(aniosRestantes.toFixed(1)),
    materiasRestantes,
    fechaEstimada,
    mensaje: `Te faltan ${materiasRestantes} materias. A ${porCuatri}/cuatrimestre (${tasaAprobacion}% aprobación), terminás en ~${cuatrimestresRestantes} cuatrimestres (${aniosRestantes.toFixed(1)} años, ~${fechaEstimada}).`,
  };
}
