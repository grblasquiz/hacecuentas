export interface Inputs {
  pomodoros: number;
  duracionPomodoro: number;
  efectividad: number;
  interrupcionesPorPomodoro: number;
  costoInterrupcion: string;
}

export interface Outputs {
  focusRealMin: number;
  focusRealHoras: number;
  tiempoNominalMin: number;
  perdidaPorDistracciones: number;
  perdidaPorIneficiencia: number;
  porcentajeOutputReal: number;
  bloquesOptimos: number;
  sugerencia: string;
}

export function compute(i: Inputs): Outputs {
  const pomodoros = Math.max(0, Math.round(Number(i.pomodoros) || 0));
  const duracionPomodoro = Math.max(1, Number(i.duracionPomodoro) || 25);
  const efectividad = Math.min(100, Math.max(0, Number(i.efectividad) || 75));
  const interrupcionesPorPomodoro = Math.max(0, Number(i.interrupcionesPorPomodoro) || 0);
  const costoInterrupcion = Math.max(0, Number(i.costoInterrupcion) || 10);

  if (pomodoros === 0) {
    return {
      focusRealMin: 0,
      focusRealHoras: 0,
      tiempoNominalMin: 0,
      perdidaPorDistracciones: 0,
      perdidaPorIneficiencia: 0,
      porcentajeOutputReal: 0,
      bloquesOptimos: 0,
      sugerencia: "Ingresá al menos 1 pomodoro para calcular.",
    };
  }

  // Tiempo nominal total (minutos)
  const tiempoNominalMin = pomodoros * duracionPomodoro;

  // Pérdida total por distracciones (minutos)
  // Fuente: Mark et al. 2008 — reenfoque cognitivo post-interrupción
  const perdidaPorDistracciones = pomodoros * interrupcionesPorPomodoro * costoInterrupcion;

  // Tiempo base disponible tras descontar distracciones
  const baseDisponible = Math.max(0, tiempoNominalMin - perdidaPorDistracciones);

  // Foco real aplicando efectividad
  const focusRealMin = Math.round(baseDisponible * (efectividad / 100));

  // Pérdida por ineficiencia (parte de la base disponible no aprovechada)
  const perdidaPorIneficiencia = Math.round(baseDisponible * (1 - efectividad / 100));

  // Porcentaje de output real respecto al nominal
  const porcentajeOutputReal =
    tiempoNominalMin > 0 ? (focusRealMin / tiempoNominalMin) * 100 : 0;

  // Horas de foco real
  const focusRealHoras = Math.round((focusRealMin / 60) * 100) / 100;

  // Bloques óptimos recomendados:
  // Límite cognitivo ~240 min foco real/día (Ericsson, 1993).
  // Calculamos cuántos pomodoros producen ese tope dado el output real por pomodoro.
  const MAX_FOCUS_MIN = 240; // 4 horas de foco profundo sostenido
  const focusRealPorPomodoro = pomodoros > 0 ? focusRealMin / pomodoros : 0;
  let bloquesOptimos: number;
  if (focusRealPorPomodoro <= 0) {
    bloquesOptimos = 0;
  } else {
    bloquesOptimos = Math.min(
      pomodoros,
      Math.floor(MAX_FOCUS_MIN / focusRealPorPomodoro)
    );
  }

  // Sugerencia basada en porcentaje de output real
  let sugerencia: string;
  if (porcentajeOutputReal >= 80) {
    sugerencia =
      "Excelente eficiencia. Mantené las condiciones actuales y protegé estos bloques de foco.";
  } else if (porcentajeOutputReal >= 60) {
    sugerencia =
      `Tu output real es ${porcentajeOutputReal.toFixed(0)}% del nominal. Reducir 1 interrupción por pomodoro puede recuperar ${Math.round(costoInterrupcion * pomodoros)} min adicionales.`;
  } else if (porcentajeOutputReal >= 40) {
    sugerencia =
      `Output bajo (${porcentajeOutputReal.toFixed(0)}%). Prioridad: proteger bloques con modo no-molestar y negociar ventanas de disponibilidad con tu equipo.`;
  } else if (porcentajeOutputReal > 0) {
    sugerencia =
      `Output muy bajo (${porcentajeOutputReal.toFixed(0)}%). Las interrupciones consumen más tiempo que el foco real. Considerá reducir drásticamente las interrupciones antes de agregar más pomodoros.`;
  } else {
    sugerencia =
      "Las interrupciones eliminan todo el tiempo de foco disponible. Revisá el costo por interrupción o la cantidad de interrupciones por bloque.";
  }

  return {
    focusRealMin,
    focusRealHoras,
    tiempoNominalMin,
    perdidaPorDistracciones: Math.round(perdidaPorDistracciones),
    perdidaPorIneficiencia,
    porcentajeOutputReal: Math.round(porcentajeOutputReal * 10) / 10,
    bloquesOptimos,
    sugerencia,
  };
}
