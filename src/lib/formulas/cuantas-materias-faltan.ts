/** Cuántas materias te faltan para recibirse */
export interface Inputs {
  totalMaterias: number;
  materiasAprobadas: number;
  materiasEnCurso: number;
  materiasPromedio: number;
}
export interface Outputs {
  materiasFaltantes: number;
  porcentajeCompletado: number;
  cuatrimestresEstimados: number;
  fechaEstimada: string;
  mensaje: string;
}

export function cuantasMateriassFaltan(i: Inputs): Outputs {
  const total = Number(i.totalMaterias);
  const aprobadas = Number(i.materiasAprobadas);
  const enCurso = Number(i.materiasEnCurso) || 0;
  const porCuatrimestre = Number(i.materiasPromedio) || 4;

  if (!total || total <= 0) throw new Error('Ingresá el total de materias de la carrera');
  if (aprobadas < 0) throw new Error('Materias aprobadas inválidas');

  const materiasFaltantes = Math.max(0, total - aprobadas - enCurso);
  const porcentajeCompletado = ((aprobadas + enCurso) / total) * 100;

  const cuatrimestresEstimados = Math.ceil(materiasFaltantes / porCuatrimestre);

  const fechaMeta = new Date();
  fechaMeta.setMonth(fechaMeta.getMonth() + cuatrimestresEstimados * 6);
  const fechaEstimada = fechaMeta.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  return {
    materiasFaltantes,
    porcentajeCompletado: Number(porcentajeCompletado.toFixed(1)),
    cuatrimestresEstimados,
    fechaEstimada,
    mensaje: `Te faltan ${materiasFaltantes} materias (${porcentajeCompletado.toFixed(1)}% completado). A ${porCuatrimestre} materias/cuatrimestre, te recibís en ~${cuatrimestresEstimados} cuatrimestres (${fechaEstimada}).`,
  };
}
