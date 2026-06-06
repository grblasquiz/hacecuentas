export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/**
 * Estima cuánto debería durar TU Weekly Review GTD según el tamaño real de tu
 * sistema, no una división arbitraria. Modelo basado en la guía de David Allen
 * (Getting Things Done, ed. 2015) y en datos de practicantes:
 *
 *  - Base de procesamiento + revisión de calendario: ~20 min fijos.
 *  - Cada proyecto activo necesita ~2 min para confirmar su próxima acción
 *    (Allen: "revisá CADA proyecto activo y verificá que tenga una next action").
 *  - Cada bandeja de entrada suma ~5 min de vaciado (inbox a cero).
 *  - El nivel de experiencia multiplica el total: un principiante tarda ~2x
 *    (todavía no automatizó el flujo) y un practicante avanzado ~0,7x.
 *
 * Devuelve minutos estimados, un rango, y un veredicto contra la banda 60–90 min.
 */
export function weeklyReviewGtdAllenTiempo6090min(i: Inputs): Outputs {
  // Campos reales del formulario
  const proyectos = Math.max(0, Math.min(80, Math.round(Number(i.proyectos) || 0)));
  const bandejas = Math.max(1, Math.min(12, Math.round(Number(i.bandejas) || 3)));
  const nivelRaw = String(i.nivel || 'intermedio');
  const nivel = ['principiante', 'intermedio', 'avanzado'].includes(nivelRaw)
    ? nivelRaw
    : 'intermedio';

  // Multiplicador por experiencia
  const mult = nivel === 'principiante' ? 2.0 : nivel === 'avanzado' ? 0.7 : 1.0;

  // Componentes (en minutos)
  const baseFija = 20;            // procesar lo capturado + calendario ±2 semanas + revisión creativa mínima
  const minPorProyecto = 2;       // confirmar next action por proyecto activo
  const minPorBandeja = 5;        // vaciar cada inbox a cero

  const minutosCrudos =
    (baseFija + proyectos * minPorProyecto + bandejas * minPorBandeja) * mult;

  // Redondeo a múltiplos de 5, mínimo 15 (revisión mínima viable)
  const minutos = Math.max(15, Math.round(minutosCrudos / 5) * 5);

  // Rango ±20%, redondeado a 5
  const r5 = (n: number) => Math.round(n / 5) * 5;
  const minBajo = Math.max(15, r5(minutos * 0.8));
  const minAlto = r5(minutos * 1.2);
  const rango = `${minBajo}–${minAlto} min`;

  // Veredicto contra la banda canónica 60–90 min de Allen
  let veredicto: string;
  let tone: 'good' | 'neutral' | 'warn';
  if (minutos < 45) {
    veredicto = 'Por debajo de la banda recomendada (60–90 min): sistema chico o riesgo de saltear pasos';
    tone = minutos < 30 ? 'warn' : 'neutral';
  } else if (minutos <= 90) {
    veredicto = 'Dentro de la banda recomendada por Allen (60–90 min) ✅';
    tone = 'good';
  } else if (minutos <= 120) {
    veredicto = 'Por encima de 90 min: sistema grande; considerá dividir en 2 bloques';
    tone = 'neutral';
  } else {
    veredicto = 'Muy por encima de 90 min: demasiados proyectos abiertos o bandejas sin consolidar';
    tone = 'warn';
  }

  // Sugerencia de bloques (para no perder el caso de uso original)
  const bloques = minutos > 75 ? 2 : 1;
  const porBloque = Math.round(minutos / bloques / 5) * 5;
  const planBloques =
    bloques === 1
      ? `1 bloque de ~${minutos} min`
      : `2 bloques de ~${porBloque} min`;

  const nivelTxt =
    nivel === 'principiante' ? 'principiante' : nivel === 'avanzado' ? 'avanzado' : 'intermedio';

  const _insight = {
    title: 'Tu Weekly Review estimada',
    text: `Con **${proyectos} proyecto${proyectos !== 1 ? 's' : ''} activo${proyectos !== 1 ? 's' : ''}**, **${bandejas} bandeja${bandejas !== 1 ? 's' : ''}** de entrada y nivel **${nivelTxt}**, tu Weekly Review debería durar **~${minutos} minutos** (rango ${rango}). ${veredicto}.`,
    tone,
    icon: '🗂️',
  };

  const _chart = {
    type: 'scale' as const,
    marker: minutos,
    markerLabel: `${minutos} min`,
    min: 0,
    unit: ' min',
    segments: [
      { nombre: 'Corta', max: 60, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Recomendada (60–90)', max: 90, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Larga', max: 120, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Excesiva', max: Math.max(150, r5(minAlto) + 10), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de duración de la Weekly Review: corta, recomendada (60–90 min), larga y excesiva.',
  };

  return {
    minutos: `${minutos} min`,
    rango,
    plan_bloques: planBloques,
    veredicto,
    resumen: `Base 20 min + ${proyectos}×2 min (proyectos) + ${bandejas}×5 min (bandejas), ajustado ×${mult} por nivel ${nivelTxt} = ~${minutos} min.`,
    _insight,
    _chart,
  };
}
