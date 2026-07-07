export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento10kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      resumen: (nivel: string, total: number, kmPico: number, startKm: number) =>
        `Plan ${nivel} 10K: ${total} semanas, partís en ~${startKm} km/sem y pico en ~${kmPico} km/sem antes del taper.`,
      title: 'Tu plan de 10K',
      insight: (total: number, kmPico: number, startKm: number) =>
        `Necesitás **${total} semanas** de preparación. Empezás en ~${startKm} km/semana y llegás a un pico de **~${kmPico} km/sem** las últimas semanas antes del taper. Sumá un día de fondo largo por semana y respetá los descansos para llegar entero al 10K.`,
    },
    en: {
      resumen: (nivel: string, total: number, kmPico: number, startKm: number) =>
        `${nivel} 10K plan: ${total} weeks, starting at ~${startKm} km/week and peaking at ~${kmPico} km/week before the taper.`,
      title: 'Your 10K plan',
      insight: (total: number, kmPico: number, startKm: number) =>
        `You need **${total} weeks** of training. You start at ~${startKm} km/week and build to a peak of **~${kmPico} km/week** before the taper. Add one long run per week and respect your rest days to reach the 10K in one piece.`,
    },
  } as const)[__lang];

  // Evidence-based plan parameters per fitness level
  // Source: ACSM guidelines + standard 10K coaching practice
  // Beginner:     12 weeks, starts 15 km/wk, 10% weekly increase → peak ~39 km
  // Intermediate: 10 weeks, starts 30 km/wk, 8%  weekly increase → peak ~52 km
  // Advanced:      8 weeks, starts 50 km/wk, 6%  weekly increase → peak ~67 km
  const config: Record<string, { weeks: number; startKm: number; buildWeeks: number; increaseRate: number }> = {
    principiante: { weeks: 12, startKm: 15, buildWeeks: 10, increaseRate: 0.10 },
    intermedio:   { weeks: 10, startKm: 30, buildWeeks: 8,  increaseRate: 0.08 },
    avanzado:     { weeks: 8,  startKm: 50, buildWeeks: 6,  increaseRate: 0.06 },
  };

  const nivel = String(i.nivel) in config ? String(i.nivel) : 'principiante';
  const { weeks, startKm, buildWeeks, increaseRate } = config[nivel];

  // Peak km = startKm × (1 + increaseRate)^buildWeeks, rounded to nearest integer
  const kmPico = Math.round(startKm * Math.pow(1 + increaseRate, buildWeeks));

  const _insight = { title: T.title, text: T.insight(weeks, kmPico, startKm), tone: 'good', icon: '🏃' };
  return {
    semanas: weeks.toString(),
    kmSemanaFinal: kmPico.toFixed(0) + ' km',
    resumen: T.resumen(nivel, weeks, kmPico, startKm),
    _insight,
  };
}
