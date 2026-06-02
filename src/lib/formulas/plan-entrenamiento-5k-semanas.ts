export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento5kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 6; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 20;
  const resumen = __lang === 'en'
    ? `${String(i.nivel)} 5K plan: ${total} weeks, peak ${kmPico} km/week.`
    : `Plan ${String(i.nivel)} 5k: ${total} semanas, pico ${kmPico} km/sem.`;
  const _insight = {
    title: __lang === 'en' ? 'Your 5K plan' : 'Tu plan de 5K',
    text: __lang === 'en'
      ? `You need **${total} weeks**, peaking at **${kmPico} km in the final week**. The 5K is the most accessible distance: 3 runs a week with one short interval session is plenty to cross the line strong.`
      : `Necesitás **${total} semanas**, con un pico de **${kmPico} km en la última semana**. El 5K es la distancia más accesible: con 3 salidas semanales y una sesión corta de intervalos alcanza para cruzar la meta entero.`,
    tone: 'good',
    icon: '🏃',
  };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen, _insight };
}
