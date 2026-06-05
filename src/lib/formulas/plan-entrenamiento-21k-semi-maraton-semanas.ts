export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamiento21kSemiMaratonSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // Weeks and km/week peak per level (ACSM guidelines)
  // principiante: 14 weeks, 50 km/week peak (midpoint of 45-55)
  // intermedio:   12 weeks, 60 km/week peak (midpoint of 55-65)
  // avanzado:     10 weeks, 72 km/week peak (midpoint of 65-80)
  const planData: Record<string, { weeks: number; kmPico: number }> = {
    principiante: { weeks: 14, kmPico: 50 },
    intermedio:   { weeks: 12, kmPico: 60 },
    avanzado:     { weeks: 10, kmPico: 72 },
  };
  const nivel = String(i.nivel);
  const data = planData[nivel] || planData['principiante'];
  const total = data.weeks;
  const kmPico = data.kmPico;

  const resumen = __lang === 'en'
    ? `${nivel} 21k half-marathon plan: ${total} weeks, peak ${kmPico} km/week.`
    : `Plan ${nivel} 21k-semi-maraton: ${total} semanas, pico ${kmPico} km/sem.`;
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
