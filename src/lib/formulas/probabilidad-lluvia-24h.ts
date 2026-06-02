/** Probabilidad de lluvia en 24 h usando presión, humedad y tendencia barométrica.
 *  Heurística meteorológica clásica (no es un modelo numérico, sí una estimación de bolsillo).
 */
export interface Inputs {
  presion: number; // hPa
  humedad: number; // %
  tendencia: 'bajando-rapido' | 'bajando' | 'estable' | 'subiendo' | 'subiendo-rapido';
}
export interface Outputs {
  probabilidad: string;
  nivelRiesgo: string;
  pronostico: string;
  recomendacion: string;
  _chart?: any;
  _insight?: any;
}

export function probabilidadLluvia24h(i: Inputs): Outputs {
  const P = Number(i.presion);
  const H = Number(i.humedad);
  if (isNaN(P) || P < 850 || P > 1080) throw new Error('Presión fuera de rango (850–1080 hPa)');
  if (isNaN(H) || H < 0 || H > 100) throw new Error('Humedad debe estar entre 0 y 100 %');
  const t = String(i.tendencia || 'estable');

  // Base por presión
  let prob = 0;
  if (P < 995) prob = 65;
  else if (P < 1005) prob = 50;
  else if (P < 1013) prob = 35;
  else if (P < 1020) prob = 20;
  else prob = 10;

  // Ajuste por tendencia
  const ajusteTendencia: Record<string, number> = {
    'bajando-rapido': 25,
    'bajando': 12,
    'estable': 0,
    'subiendo': -10,
    'subiendo-rapido': -18,
  };
  prob += ajusteTendencia[t] ?? 0;

  // Ajuste por humedad
  if (H >= 90) prob += 18;
  else if (H >= 80) prob += 10;
  else if (H >= 70) prob += 4;
  else if (H < 40) prob -= 10;
  else if (H < 55) prob -= 5;

  if (prob < 0) prob = 0;
  if (prob > 95) prob = 95;

  let nivelRiesgo = '';
  let pronostico = '';
  let recomendacion = '';
  if (prob < 20) {
    nivelRiesgo = 'Muy bajo';
    pronostico = 'Tiempo estable, cielo despejado o con nubes altas.';
    recomendacion = 'Podés planificar actividades al aire libre con tranquilidad.';
  } else if (prob < 40) {
    nivelRiesgo = 'Bajo';
    pronostico = 'Posible nubosidad, pero lluvia improbable.';
    recomendacion = 'Tené un paraguas a mano si hay nubes de desarrollo vertical por la tarde.';
  } else if (prob < 60) {
    nivelRiesgo = 'Moderado';
    pronostico = 'Probable que llueva en algún momento del día.';
    recomendacion = 'Llevá paraguas o impermeable, y chequeá radar antes de salir.';
  } else if (prob < 80) {
    nivelRiesgo = 'Alto';
    pronostico = 'Es muy probable que llueva, posiblemente con chaparrones.';
    recomendacion = 'Reprogramá actividades al aire libre si podés. Cuidá ropa/calzado.';
  } else {
    nivelRiesgo = 'Muy alto';
    pronostico = 'Lluvia casi segura, posibilidad de tormenta si la presión baja rápido.';
    recomendacion = 'Evitá actividades al aire libre y revisá alertas oficiales del servicio meteorológico.';
  }

  const probRedondeada = Math.round(prob);
  const chart = {
    type: 'scale' as const,
    marker: probRedondeada,
    markerLabel: 'Probabilidad: ' + probRedondeada + ' %',
    min: 0,
    unit: '%',
    segments: [
      { nombre: 'Muy bajo', max: 20, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Bajo', max: 40, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Moderado', max: 60, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Alto', max: 80, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Muy alto', max: 100, color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: 'Escala de probabilidad de lluvia en 24 horas, de muy bajo a muy alto.',
  };

  const tendLabel: Record<string, string> = {
    'bajando-rapido': 'bajando rápido',
    'bajando': 'bajando',
    'estable': 'estable',
    'subiendo': 'subiendo',
    'subiendo-rapido': 'subiendo rápido',
  };
  const _insight = {
    title: 'Chance de lluvia en las próximas 24 h',
    text: `Con presión de **${P} hPa** ${tendLabel[t] ?? 'estable'} y humedad **${H}%**, la probabilidad de lluvia es **${probRedondeada}%** (riesgo ${nivelRiesgo.toLowerCase()}). ${pronostico}`,
    tone: probRedondeada >= 60 ? 'warn' : probRedondeada >= 40 ? 'neutral' : 'good',
    icon: probRedondeada >= 60 ? '🌧️' : probRedondeada >= 40 ? '🌦️' : '☀️',
  };

  return {
    probabilidad: `${probRedondeada} %`,
    nivelRiesgo,
    pronostico,
    recomendacion,
    _chart: chart,
    _insight,
  };
}
