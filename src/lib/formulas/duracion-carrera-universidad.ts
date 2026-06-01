/** Cuánto tardás en terminar la carrera */
export interface Inputs {
  totalMaterias: number;
  materiasAprobadas: number;
  materiasPorCuatri: number;
  porcentajeAprobacion: number;
  __lang?: string;
}
export interface Outputs {
  cuatrimestresRestantes: number;
  aniosRestantes: number;
  materiasRestantes: number;
  fechaEstimada: string;
  mensaje: string;
}

export function duracionCarreraUniversidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const total = Number(i.totalMaterias);
  const aprobadas = Number(i.materiasAprobadas) || 0;
  const porCuatri = Number(i.materiasPorCuatri) || 4;
  const tasaAprobacion = Number(i.porcentajeAprobacion) || 70;

  if (!total || total <= 0) throw new Error(__lang === 'en' ? 'Enter the total number of subjects' : 'Ingresá el total de materias');
  if (porCuatri <= 0) throw new Error(__lang === 'en' ? 'Enter at least 1 subject per semester' : 'Ingresá al menos 1 materia por cuatrimestre');

  const materiasRestantes = Math.max(0, total - aprobadas);

  // Ajustar por tasa de aprobación
  const materiasEfectivasPorCuatri = porCuatri * (tasaAprobacion / 100);
  const cuatrimestresRestantes = Math.ceil(materiasRestantes / materiasEfectivasPorCuatri);
  const aniosRestantes = cuatrimestresRestantes / 2;

  const fechaMeta = new Date();
  fechaMeta.setMonth(fechaMeta.getMonth() + cuatrimestresRestantes * 6);
  const fechaEstimada = __lang === 'en'
    ? fechaMeta.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : fechaMeta.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const mensaje = __lang === 'en'
    ? `You have ${materiasRestantes} subjects left. At ${porCuatri}/semester (${tasaAprobacion}% pass rate), you'll finish in ~${cuatrimestresRestantes} semesters (${aniosRestantes.toFixed(1)} years, ~${fechaEstimada}).`
    : `Te faltan ${materiasRestantes} materias. A ${porCuatri}/cuatrimestre (${tasaAprobacion}% aprobación), terminás en ~${cuatrimestresRestantes} cuatrimestres (${aniosRestantes.toFixed(1)} años, ~${fechaEstimada}).`;

  return {
    cuatrimestresRestantes,
    aniosRestantes: Number(aniosRestantes.toFixed(1)),
    materiasRestantes,
    fechaEstimada,
    mensaje,
  };
}
