/** Tiempo de pantalla ideal por edad */
export interface Inputs { edad: number; tiempoActual: number; }
export interface Outputs { recomendado: string; exceso: string; grupo: string; mensaje: string; _insight?: any; _chart?: any; }

export function tiempoPantallaIdealEdad(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const actual = Number(i.tiempoActual) || 0;
  if (edad < 0) throw new Error('Ingresá una edad válida');

  let recomendado: string;
  let maxHoras: number;
  let grupo: string;

  if (edad < 2) { recomendado = '0 horas (evitar pantallas)'; maxHoras = 0; grupo = 'Bebé (0-2 años)'; }
  else if (edad <= 5) { recomendado = 'Máximo 1 hora/día (contenido de calidad)'; maxHoras = 1; grupo = 'Preescolar (2-5 años)'; }
  else if (edad <= 12) { recomendado = '1-2 horas/día de ocio'; maxHoras = 2; grupo = 'Niñez (6-12 años)'; }
  else if (edad <= 17) { recomendado = '2-3 horas/día de ocio'; maxHoras = 3; grupo = 'Adolescencia (13-17 años)'; }
  else { recomendado = '2-4 horas/día de ocio (evitar antes de dormir)'; maxHoras = 4; grupo = 'Adulto (18+ años)'; }

  const diff = actual - maxHoras;
  let exceso: string;
  if (diff <= 0) exceso = '✅ Dentro de lo recomendado';
  else exceso = `⚠️ ${diff.toFixed(1)} horas por encima de lo recomendado`;

  // Insight dinámico según el desvío respecto del máximo recomendado para el grupo etario.
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (maxHoras === 0) {
    insightTone = actual > 0 ? 'warn' : 'good';
    insightText = actual > 0
      ? `A esta edad (**${grupo}**) la recomendación es **0 pantallas**, pero registrás **${actual}h/día**. Conviene reemplazar ese tiempo por juego, lectura compartida o interacción cara a cara.`
      : `A esta edad (**${grupo}**) la recomendación es **0 pantallas** y estás dentro. El estímulo real y el vínculo cara a cara son lo que más suma en esta etapa.`;
  } else if (diff <= 0) {
    insightTone = 'good';
    insightText = `Con **${actual}h/día** estás **dentro** del máximo de **${maxHoras}h** para ${grupo}. Tenés margen de **${Math.abs(diff).toFixed(1)}h** antes del límite recomendado.`;
  } else {
    insightTone = 'warn';
    const veces = (actual / maxHoras);
    insightText = `Estás **${diff.toFixed(1)}h por encima** del máximo de **${maxHoras}h/día** para ${grupo}${veces >= 2 ? ` (más del **doble** de lo recomendado)` : ''}. Recortar pantalla, sobre todo antes de dormir, mejora sueño y atención.`;
  }

  // Gauge: horas actuales sobre una escala con zona OK (hasta el máximo) y zonas de exceso.
  // Solo aplica cuando hay un rango recomendado >0 (en bebés el máximo es 0 y no hay zona segura que graficar).
  let chart: any = undefined;
  if (maxHoras > 0) {
    const topEscala = Math.max(maxHoras * 2 + 1, Math.ceil(actual) + 1);
    chart = {
      type: 'scale' as const,
      marker: Number(actual.toFixed(1)),
      markerLabel: `Tu uso: ${actual}h/día`,
      min: 0,
      unit: 'h',
      segments: [
        { nombre: 'Recomendado', max: maxHoras, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: 'Leve exceso', max: maxHoras * 2, color: '#fde68a', colorDark: '#b45309' },
        { nombre: 'Exceso alto', max: topEscala, color: '#fecaca', colorDark: '#b91c1c' },
      ],
      ariaLabel: `Escala de horas de pantalla por día para ${grupo}: zona recomendada hasta ${maxHoras}h y zonas de exceso. Marcador en tu uso actual de ${actual}h.`,
    };
  }

  return {
    recomendado, exceso, grupo,
    mensaje: `${grupo}: ${recomendado}. Tu tiempo actual: ${actual}h/día. ${diff > 0 ? 'Recomendamos reducir.' : 'Bien!'}`,
    _insight: {
      title: 'Tu uso vs. lo recomendado',
      text: insightText,
      tone: insightTone,
      icon: '📱',
    },
    ...(chart ? { _chart: chart } : {}),
  };
}