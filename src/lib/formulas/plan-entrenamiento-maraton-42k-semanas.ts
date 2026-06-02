export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamientoMaraton42kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const niveles: Record<string, number> = { principiante: 2, intermedio: 0, avanzado: -2 };
  const base = 16; const extra = niveles[String(i.nivel)] || 0;
  const total = base + extra;
  const kmPico = total * 3 + 168;
  const resumen = __lang === 'en'
    ? `${String(i.nivel)} marathon-42k plan: ${total} weeks, peak ${kmPico} km/week.`
    : `Plan ${String(i.nivel)} maraton-42k: ${total} semanas, pico ${kmPico} km/sem.`;
  const _insight = {
    title: __lang === 'en' ? 'Your marathon plan' : 'Tu plan de maratón',
    text: __lang === 'en'
      ? `The marathon demands **${total} weeks** of structured training, peaking at **${kmPico} km in your biggest week**. The long run is non-negotiable: build it toward 30–32 km, and never skip the final taper.`
      : `El maratón exige **${total} semanas** de entrenamiento estructurado, con un pico de **${kmPico} km en la semana más fuerte**. El fondo largo es innegociable: llevalo hasta 30–32 km y nunca te saltees el afloje final.`,
    tone: 'warn',
    icon: '🏅',
  };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen, _insight };
}
