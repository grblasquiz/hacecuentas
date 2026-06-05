export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento5kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // Real-world 5K training standards (per ACSM, Hal Higdon, Jeff Galloway):
  // Beginner: 10 weeks; starts 8–15 km/week, peaks 28 km/week
  // Intermediate: 7 weeks; starts 20–30 km/week, peaks 40 km/week
  // Advanced: 5 weeks; starts 40–55 km/week, peaks 58 km/week
  const planos: Record<string, { semanas: number; kmPico: number; goalTime: string; daysPerWeek: number }> = {
    principiante: { semanas: 10, kmPico: 28, goalTime: '35–45 min', daysPerWeek: 3 },
    intermedio:   { semanas: 7,  kmPico: 40, goalTime: '25–34 min', daysPerWeek: 4 },
    avanzado:     { semanas: 5,  kmPico: 58, goalTime: 'sub-25 min', daysPerWeek: 6 },
  };
  const nivel = String(i.nivel);
  const plan = planos[nivel] ?? planos['principiante'];
  const total = plan.semanas;
  const kmPico = plan.kmPico;
  const resumen = __lang === 'en'
    ? `${nivel.charAt(0).toUpperCase() + nivel.slice(1)} 5K plan: ${total} weeks, peak ${kmPico} km/week, goal ${plan.goalTime}.`
    : `Plan ${nivel} 5K: ${total} semanas, pico ${kmPico} km/sem, meta ${plan.goalTime}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your 5K plan' : 'Tu plan de 5K',
    text: __lang === 'en'
      ? `You need **${total} weeks**, peaking at **${kmPico} km/week**, running ${plan.daysPerWeek} days/week. Target finish time: **${plan.goalTime}**. The 5K is the most accessible distance: easy runs, one interval session per week, and a gradual build is all you need to cross the finish line strong.`
      : `Necesitás **${total} semanas**, con un pico de **${kmPico} km/sem**, corriendo ${plan.daysPerWeek} días por semana. Tiempo objetivo: **${plan.goalTime}**. El 5K es la distancia más accesible: salidas tranquilas, una sesión de intervalos por semana y una progresión gradual alcanzan para cruzar la meta entero.`,
    tone: 'good',
    icon: '🏃',
  };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen, _insight };
}
