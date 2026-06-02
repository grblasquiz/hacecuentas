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
  _insight?: any;
  _chart?: any;
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

  const aprobadasShown = Math.max(0, total - materiasRestantes);
  const pctDone = total > 0 ? Math.round((aprobadasShown / total) * 100) : 0;
  const aniosR = Number(aniosRestantes.toFixed(1));
  const tone: 'good' | 'warn' | 'neutral' = pctDone >= 75 ? 'good' : pctDone < 25 ? 'warn' : 'neutral';

  const _insight = {
    title: __lang === 'en' ? 'How far along you are' : 'Cuánto llevás de la carrera',
    text: __lang === 'en'
      ? `You've passed **${aprobadasShown} of ${total}** subjects (**${pctDone}%** done). The remaining **${materiasRestantes}** take ~**${cuatrimestresRestantes} semesters** (${aniosR} years) at this pace, finishing around **${fechaEstimada}**.`
      : `Ya aprobaste **${aprobadasShown} de ${total}** materias (**${pctDone}%** de la carrera). Las **${materiasRestantes}** que faltan te llevan ~**${cuatrimestresRestantes} cuatrimestres** (${aniosR} años) a este ritmo, terminando cerca de **${fechaEstimada}**.`,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Passed' : 'Aprobadas', value: aprobadasShown },
      { label: __lang === 'en' ? 'Remaining' : 'Restantes', value: materiasRestantes },
    ],
    centerValue: String(total),
    centerLabel: __lang === 'en' ? 'subjects' : 'materias',
    ariaLabel: __lang === 'en'
      ? `Doughnut chart of degree progress: ${aprobadasShown} passed and ${materiasRestantes} remaining out of ${total} subjects.`
      : `Gráfico de torta del avance de la carrera: ${aprobadasShown} aprobadas y ${materiasRestantes} restantes de ${total} materias.`,
  };

  return {
    cuatrimestresRestantes,
    aniosRestantes: aniosR,
    materiasRestantes,
    fechaEstimada,
    mensaje,
    _insight,
    _chart,
  };
}
