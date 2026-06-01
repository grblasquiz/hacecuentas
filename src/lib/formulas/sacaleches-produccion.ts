/** Estimación de producción de leche materna */
export interface Inputs { edadBebeSacaleches: number; mlPorSesion: number; sesionesDia: number; __lang?: string; }
export interface Outputs { produccionDiaria: string; evaluacion: string; tips: string; nota: string; }

export function sakalechesProduccion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const semanas = Number(i.edadBebeSacaleches);
  const ml = Number(i.mlPorSesion);
  const sesiones = Number(i.sesionesDia);
  if (ml < 0) throw new Error(__lang === 'en' ? 'ml cannot be negative' : 'Los ml no pueden ser negativos');
  if (sesiones < 1) throw new Error(__lang === 'en' ? 'Enter at least 1 session' : 'Ingresá al menos 1 sesión');

  const totalDiario = ml * sesiones;

  // Producción esperada por etapa
  let esperadoMin = 0, esperadoMax = 0;
  if (semanas < 1) { esperadoMin = 30; esperadoMax = 100; }
  else if (semanas < 2) { esperadoMin = 200; esperadoMax = 500; }
  else if (semanas < 4) { esperadoMin = 500; esperadoMax = 750; }
  else if (semanas < 24) { esperadoMin = 750; esperadoMax = 1000; }
  else { esperadoMin = 500; esperadoMax = 800; }

  let evaluacion = '';
  if (totalDiario >= esperadoMin) {
    evaluacion = __lang === 'en'
      ? 'Your output is within or above the expected range. Great!'
      : 'Tu producción está dentro del rango esperado o por encima. ¡Bien!';
  } else if (totalDiario >= esperadoMin * 0.7) {
    evaluacion = __lang === 'en'
      ? 'Your output is a bit below average. If you also nurse directly, add that amount. If not, consider increasing pumping frequency.'
      : 'Tu producción está algo por debajo del promedio. Si también amamantás directo, sumá esa cantidad. Si no, considerá aumentar la frecuencia de extracción.';
  } else {
    evaluacion = __lang === 'en'
      ? 'Output seems low. Consult a lactation consultant or nurse. It may be flange size, stress, or needing more frequent sessions.'
      : 'La producción parece baja. Consultá con una asesora de lactancia o puericultora. Puede ser el tamaño de la copa del sacaleches, estrés o necesitar más frecuencia.';
  }

  const tips = sesiones < 8
    ? (__lang === 'en'
      ? 'Increasing to 8+ sessions/day can boost production. Include a nighttime session (2–5 AM, prolactin peak).'
      : 'Aumentar a 8+ sesiones/día puede incrementar la producción. Incluí una sesión de madrugada (2-5 AM, pico de prolactina).')
    : (__lang === 'en'
      ? 'Good frequency. Make sure to fully empty both breasts. Try breast compression during pumping.'
      : 'Buena frecuencia. Asegurate de vaciar bien ambos pechos. Probá compresión mamaria durante la extracción.');

  return {
    produccionDiaria: __lang === 'en'
      ? `${totalDiario} ml/day (${sesiones} sessions × ${ml} ml)`
      : `${totalDiario} ml/día (${sesiones} sesiones × ${ml} ml)`,
    evaluacion,
    tips,
    nota: __lang === 'en'
      ? `Expected output at ${semanas} weeks: ${esperadoMin}–${esperadoMax} ml/day. Remember: babies extract ~30–50% more than a pump.`
      : `Producción esperada para ${semanas} semanas: ${esperadoMin}-${esperadoMax} ml/día. Recordá que el bebé extrae ~30-50% más que el sacaleches.`,
  };
}
