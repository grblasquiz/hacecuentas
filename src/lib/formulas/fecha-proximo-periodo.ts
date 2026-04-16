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
}

export function fechaProximoPeriodo(i: Inputs): Outputs {
  const fechaStr = String(i.fechaUltimoPeriodo);
  const duracionCiclo = Number(i.duracionCiclo) || 28;
  const duracionPeriodo = Number(i.duracionPeriodo) || 5;
  if (!fechaStr) throw new Error('Ingresá la fecha del último período');

  const fechaUltimo = new Date(fechaStr);
  if (isNaN(fechaUltimo.getTime())) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Próximo período
  const proximoPeriodo = new Date(fechaUltimo);
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

  return {
    proximoPeriodo: fmt(proximoPeriodo),
    diasFaltantes,
    ovulacionEstimada: fmt(ovulacion),
    ventanaFertilInicio: fmt(fertInicio),
    ventanaFertilFin: fmt(fertFin),
    fasActual,
    mensaje: `Próximo período: ${fmt(proximoPeriodo)} (en ${diasFaltantes} días). Ovulación estimada: ${fmt(ovulacion)}. Fase actual: ${fasActual}.`,
  };
}
