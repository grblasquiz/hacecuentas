export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function planEntrenamientoMaraton42kSemanas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  // Weeks per level — beginners need more runway, advanced can compress
  const semanasPorNivel: Record<string, number> = { principiante: 20, intermedio: 16, avanzado: 14 };
  // Peak weekly km per level (realistic training ranges)
  // Beginner: ~55 km/wk (~34 mi), Intermediate: ~90 km/wk (~56 mi), Advanced: ~130 km/wk (~81 mi)
  const kmPicoPorNivel: Record<string, number> = { principiante: 55, intermedio: 90, avanzado: 130 };

  const nivel = String(i.nivel) in semanasPorNivel ? String(i.nivel) : 'intermedio';
  const total = semanasPorNivel[nivel];
  const kmPico = kmPicoPorNivel[nivel];

  const resumen = __lang === 'en'
    ? `${nivel} plan: ${total} weeks, peak ~${kmPico} km/week (~${Math.round(kmPico / 1.609)} mi/week).`
    : `Plan ${nivel}: ${total} semanas, pico ~${kmPico} km/sem (~${Math.round(kmPico / 1.609)} mi/sem).`;

  const _insight = {
    title: __lang === 'en' ? 'Your marathon plan' : 'Tu plan de maratón',
    text: __lang === 'en'
      ? `Your **${total}-week** plan peaks at **~${kmPico} km (~${Math.round(kmPico / 1.609)} mi) in your biggest week**. The long run is non-negotiable: build it toward 30–32 km (18–20 mi), and never skip the final 3-week taper.`
      : `Tu plan de **${total} semanas** pica en **~${kmPico} km (~${Math.round(kmPico / 1.609)} mi) en la semana más fuerte**. El fondo largo es innegociable: llevalo hasta 30–32 km y nunca te salteés el afloje final de 3 semanas.`,
    tone: 'warn',
    icon: '🏅',
  };
  return { semanas: total.toString(), kmSemanaFinal: kmPico.toFixed(0) + ' km', resumen, _insight };
}
