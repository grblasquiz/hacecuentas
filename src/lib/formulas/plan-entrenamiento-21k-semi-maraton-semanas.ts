export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento21kSemiMaratonSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 12; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 84;
  const resumen = __lang === 'en'
    ? `${String(i.nivel)} 21k half-marathon plan: ${total} weeks, peak ${kmPico} km/week.`
    : `Plan ${String(i.nivel)} 21k-semi-maraton: ${total} semanas, pico ${kmPico} km/sem.`;
  const _insight = {
    title: __lang === 'en' ? 'Your half-marathon plan' : 'Tu plan de 21K',
    text: __lang === 'en'
      ? `You need **${total} weeks**, building to a peak of **${kmPico} km in your biggest week**. The long run is the key session: gradually extend it toward ~18 km so race day feels manageable.`
      : `Necesitás **${total} semanas**, llegando a un pico de **${kmPico} km en la semana más fuerte**. El fondo largo es la sesión clave: estiralo progresivamente hasta ~18 km para que el día de la carrera se sienta manejable.`,
    tone: 'good',
    icon: '🏃',
  };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen, _insight };
}
