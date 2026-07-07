/** Estimación de producción de leche materna */
export interface Inputs { edadBebeSacaleches: number; mlPorSesion: number; sesionesDia: number; __lang?: string; }
export interface Outputs { produccionDiaria: string; evaluacion: string; tips: string; nota: string; _insight?: any; _chart?: any; }

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

  // Insight dinámico según dónde cae la producción frente al rango esperado
  let _insight: any;
  if (totalDiario >= esperadoMin) {
    _insight = {
      title: __lang === 'en' ? 'Output within range' : 'Producción en rango',
      text: __lang === 'en'
        ? `**${totalDiario} ml/day** across ${sesiones} sessions sits in (or above) the **${esperadoMin}–${esperadoMax} ml** expected at ${semanas} weeks. If you also nurse directly, real intake is even higher.`
        : `**${totalDiario} ml/día** en ${sesiones} sesiones está dentro (o por encima) de los **${esperadoMin}–${esperadoMax} ml** esperados a las ${semanas} semanas. Si además amamantás directo, la ingesta real es aún mayor.`,
      tone: 'good',
      icon: '🍼',
    };
  } else if (totalDiario >= esperadoMin * 0.7) {
    _insight = {
      title: __lang === 'en' ? 'Slightly below average' : 'Algo por debajo',
      text: __lang === 'en'
        ? `**${totalDiario} ml/day** is a bit under the **${esperadoMin} ml** floor for ${semanas} weeks. Adding sessions or emptying both breasts fully usually closes the gap.`
        : `**${totalDiario} ml/día** queda un poco por debajo del piso de **${esperadoMin} ml** para ${semanas} semanas. Sumar sesiones o vaciar bien ambos pechos suele cerrar la brecha.`,
      tone: 'neutral',
      icon: '🍼',
    };
  } else {
    _insight = {
      title: __lang === 'en' ? 'Output looks low' : 'Producción baja',
      text: __lang === 'en'
        ? `**${totalDiario} ml/day** is well below the **${esperadoMin} ml** expected at ${semanas} weeks. Check flange size and frequency, and consider a lactation consultant.`
        : `**${totalDiario} ml/día** está bastante por debajo de los **${esperadoMin} ml** esperados a las ${semanas} semanas. Revisá el tamaño de la copa y la frecuencia, y considerá una asesora de lactancia.`,
      tone: 'warn',
      icon: '⚠️',
    };
  }

  // Gauge: dónde cae la producción diaria en las zonas baja / algo baja / esperada
  const segMax = Math.max(esperadoMax, Math.ceil(totalDiario + 1));
  const _chart = {
    type: 'scale' as const,
    marker: totalDiario,
    markerLabel: __lang === 'en' ? `${totalDiario} ml/day` : `${totalDiario} ml/día`,
    min: 0,
    segments: [
      { nombre: __lang === 'en' ? 'Low' : 'Baja', max: Math.round(esperadoMin * 0.7), color: '#fecaca', colorDark: '#7f1d1d' },
      { nombre: __lang === 'en' ? 'Below avg' : 'Algo baja', max: esperadoMin, color: '#fde68a', colorDark: '#78350f' },
      { nombre: __lang === 'en' ? 'Expected' : 'Esperada', max: segMax, color: '#bbf7d0', colorDark: '#14532d' },
    ],
    ariaLabel: __lang === 'en'
      ? `Daily output of ${totalDiario} ml against the expected range at ${semanas} weeks.`
      : `Producción diaria de ${totalDiario} ml frente al rango esperado a las ${semanas} semanas.`,
  };

  return {
    produccionDiaria: __lang === 'en'
      ? `${totalDiario} ml/day (${sesiones} sessions × ${ml} ml)`
      : `${totalDiario} ml/día (${sesiones} sesiones × ${ml} ml)`,
    evaluacion,
    tips,
    nota: __lang === 'en'
      ? `Expected output at ${semanas} weeks: ${esperadoMin}–${esperadoMax} ml/day. Remember: babies extract ~30–50% more than a pump.`
      : `Producción esperada para ${semanas} semanas: ${esperadoMin}-${esperadoMax} ml/día. Recordá que el bebé extrae ~30-50% más que el sacaleches.`,
    _insight,
    _chart,
  };
}
