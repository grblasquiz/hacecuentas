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
  _insight?: any;
  _chart?: any;
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

  const pct = Number(porcentajeCompletado.toFixed(1));
  const aniosAprox = Number((cuatrimestresEstimados / 2).toFixed(1));
  const tone = materiasFaltantes === 0 ? 'good' : pct >= 75 ? 'good' : pct >= 40 ? 'neutral' : 'warn';
  const insightTitle = materiasFaltantes === 0
    ? '¡Ya estás!'
    : pct >= 75
      ? 'Recta final'
      : pct >= 40
        ? 'Mitad de camino'
        : 'Arrancando la carrera';
  const insightText = materiasFaltantes === 0
    ? `Sumando aprobadas y en curso completás **las ${total} materias** de la carrera. Solo falta cerrar las cursadas y trámites de egreso.`
    : `Te faltan **${materiasFaltantes} de ${total} materias** y ya tenés **${pct}% avanzado**. A ${porCuatrimestre} materias por cuatrimestre, te recibís en ~**${cuatrimestresEstimados} cuatrimestres** (${aniosAprox} años, aprox. ${fechaEstimada}).`;

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone,
    icon: '🎓',
  };

  const slices = [
    { label: 'Aprobadas', value: aprobadas },
    { label: 'En curso', value: enCurso },
    { label: 'Faltantes', value: materiasFaltantes },
  ].filter((s) => s.value > 0);

  const _chart = {
    type: 'doughnut',
    slices,
    prefix: '',
    centerValue: String(total),
    centerLabel: 'materias',
    ariaLabel: `De ${total} materias: ${aprobadas} aprobadas, ${enCurso} en curso y ${materiasFaltantes} faltantes.`,
  };

  return {
    materiasFaltantes,
    porcentajeCompletado: pct,
    cuatrimestresEstimados,
    fechaEstimada,
    mensaje: `Te faltan ${materiasFaltantes} materias (${porcentajeCompletado.toFixed(1)}% completado). A ${porCuatrimestre} materias/cuatrimestre, te recibís en ~${cuatrimestresEstimados} cuatrimestres (${fechaEstimada}).`,
    _insight,
    _chart,
  };
}
