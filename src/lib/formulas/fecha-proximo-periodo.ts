/** Predictor de próximo período menstrual */
export interface Inputs {
  fechaUltimoPeriodo: string;
  duracionCiclo: number;
  duracionPeriodo: number;
}
export interface Outputs {
  proximoPeriodo: string;
  diasFaltantes: number;
  ovulacionEstimada: string;
  ventanaFertilInicio: string;
  ventanaFertilFin: string;
  fasActual: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function fechaProximoPeriodo(i: Inputs): Outputs {
  const fechaStr = String(i.fechaUltimoPeriodo);
  const duracionCiclo = Number(i.duracionCiclo) || 28;
  const duracionPeriodo = Number(i.duracionPeriodo) || 5;
  if (!fechaStr) throw new Error('Ingresá la fecha del último período');

  const parts = String(fechaStr || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const fechaUltimo = new Date(yy, mm - 1, dd);
  if (isNaN(fechaUltimo.getTime())) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Próximo período
  const proximoPeriodo = new Date(fechaUltimo.getTime());
  proximoPeriodo.setDate(proximoPeriodo.getDate() + duracionCiclo);

  // Si ya pasó, calcular el siguiente
  while (proximoPeriodo < hoy) {
    proximoPeriodo.setDate(proximoPeriodo.getDate() + duracionCiclo);
  }

  const diasFaltantes = Math.ceil((proximoPeriodo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  // Ovulación estimada: ~14 días antes del próximo período
  const ovulacion = new Date(proximoPeriodo);
  ovulacion.setDate(ovulacion.getDate() - 14);

  // Ventana fértil: 5 días antes de ovulación + día de ovulación
  const fertInicio = new Date(ovulacion);
  fertInicio.setDate(fertInicio.getDate() - 5);
  const fertFin = new Date(ovulacion);
  fertFin.setDate(fertFin.getDate() + 1);

  // Fase actual
  const diasDesdePeriodo = Math.floor((hoy.getTime() - fechaUltimo.getTime()) / (1000 * 60 * 60 * 24)) % duracionCiclo;
  let fasActual: string;
  if (diasDesdePeriodo < duracionPeriodo) fasActual = 'Menstrual';
  else if (diasDesdePeriodo < duracionCiclo - 14) fasActual = 'Folicular';
  else if (diasDesdePeriodo < duracionCiclo - 12) fasActual = 'Ovulatoria';
  else fasActual = 'Lútea';

  const fmt = (d: Date) => d.toLocaleDateString('es-AR');

  // Insight dinámico según la fase del ciclo
  const insightByPhase: Record<string, { title: string; text: string; tone: string; icon: string }> = {
    Menstrual: {
      title: 'Estás en fase menstrual',
      text: `Hoy es el **día ${diasDesdePeriodo + 1}** de tu ciclo (fase **menstrual**). Tu próximo período se espera para el **${fmt(proximoPeriodo)}**, en **${diasFaltantes} ${diasFaltantes === 1 ? 'día' : 'días'}**.`,
      tone: 'neutral',
      icon: '🩸',
    },
    Folicular: {
      title: 'Estás en fase folicular',
      text: `Hoy es el **día ${diasDesdePeriodo + 1}** de tu ciclo (fase **folicular**). Tu ventana fértil arranca alrededor del **${fmt(fertInicio)}**, con ovulación estimada el **${fmt(ovulacion)}**.`,
      tone: 'neutral',
      icon: '🌱',
    },
    Ovulatoria: {
      title: 'Estás en fase ovulatoria',
      text: `Hoy es el **día ${diasDesdePeriodo + 1}** de tu ciclo (fase **ovulatoria**), con la ovulación estimada el **${fmt(ovulacion)}**. Es el momento de **mayor probabilidad de embarazo**.`,
      tone: 'good',
      icon: '🔥',
    },
    Lútea: {
      title: 'Estás en fase lútea',
      text: `Hoy es el **día ${diasDesdePeriodo + 1}** de tu ciclo (fase **lútea**). Tu próximo período se espera para el **${fmt(proximoPeriodo)}**, en **${diasFaltantes} ${diasFaltantes === 1 ? 'día' : 'días'}**.`,
      tone: 'neutral',
      icon: '🌙',
    },
  };
  const insight = insightByPhase[fasActual] ?? insightByPhase.Folicular;

  // Gauge del día del ciclo (0–duración) con zonas por fase.
  // Boundaries acotados para mantenerse estrictamente ascendentes.
  const bMenstrual = Math.max(1, Math.min(duracionPeriodo, duracionCiclo - 3));
  const bFolicular = Math.max(bMenstrual + 1, Math.min(duracionCiclo - 14, duracionCiclo - 2));
  const bOvulatoria = Math.max(bFolicular + 1, Math.min(duracionCiclo - 12, duracionCiclo - 1));
  const markerDia = Math.max(0, Math.min(diasDesdePeriodo, duracionCiclo));
  const chart = {
    type: 'scale',
    marker: markerDia,
    markerLabel: `Día ${markerDia}`,
    min: 0,
    segments: [
      { nombre: 'Menstrual', max: bMenstrual, color: '#fecaca', colorDark: '#991b1b' },
      { nombre: 'Folicular', max: bFolicular, color: '#bfdbfe', colorDark: '#1e3a8a' },
      { nombre: 'Ovulatoria', max: bOvulatoria, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: 'Lútea', max: duracionCiclo, color: '#ddd6fe', colorDark: '#5b21b6' },
    ],
    ariaLabel: `Día ${markerDia} del ciclo de ${duracionCiclo} días: fase ${fasActual}.`,
  };

  return {
    proximoPeriodo: fmt(proximoPeriodo),
    diasFaltantes,
    ovulacionEstimada: fmt(ovulacion),
    ventanaFertilInicio: fmt(fertInicio),
    ventanaFertilFin: fmt(fertFin),
    fasActual,
    mensaje: `Próximo período: ${fmt(proximoPeriodo)} (en ${diasFaltantes} días). Ovulación estimada: ${fmt(ovulacion)}. Fase actual: ${fasActual}.`,
    _insight: insight,
    _chart: chart,
  };
}
