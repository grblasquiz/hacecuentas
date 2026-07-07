export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function velocidadCaidaLibreTiempo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const t = Number(i.t); const g = Number(i.g) || 9.81;
  if (!t || t < 0) throw new Error(__lang === 'en' ? 'Enter a time value' : 'Ingresá tiempo');
  const v = g * t;
  const kmh = v * 3.6;
  const resumen = __lang === 'en'
    ? `At ${t}s: velocity ${v.toFixed(1)} m/s (${kmh.toFixed(1)} km/h).`
    : `A ${t}s: velocidad ${v.toFixed(1)} m/s (${kmh.toFixed(1)} km/h).`;
  const insight = __lang === 'en'
    ? {
        title: 'Free-fall velocity',
        text: `After **${t}s** of free fall, the object reaches **${v.toFixed(1)} m/s** (**${kmh.toFixed(1)} km/h**), ignoring air resistance. Velocity grows by **${g} m/s every second** (g).`,
        tone: 'neutral',
        icon: '🪂'
      }
    : {
        title: 'Velocidad en caída libre',
        text: `Tras **${t}s** de caída libre, el objeto alcanza **${v.toFixed(1)} m/s** (**${kmh.toFixed(1)} km/h**), sin contar la resistencia del aire. La velocidad crece **${g} m/s por segundo** (g).`,
        tone: 'neutral',
        icon: '🪂'
      };
  return { velocidad: v.toFixed(2) + ' m/s', resumen, _insight: insight };
}
