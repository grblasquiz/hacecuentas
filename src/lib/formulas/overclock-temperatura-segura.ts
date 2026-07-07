/** Calculadora de Temperatura Segura para Overclock */
export interface Inputs {
  componente: string;
  tempActual: number;
  tempAmbiente: number;
  __lang?: string;
}
export interface Outputs {
  margenTermico: number;
  tempMaxima: number;
  estado: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

const TEMP_MAX: Record<string, number> = {
  cpu_intel: 100,
  cpu_amd: 95,
  gpu_nvidia: 93,
  gpu_amd: 110,
};

export function overclockTemperaturaSegura(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tempActual = Number(i.tempActual);
  const tempAmb = Number(i.tempAmbiente);
  const comp = i.componente;

  if (!tempActual) throw new Error(__lang === 'en' ? 'Enter the temperature under load' : 'Ingresá la temperatura bajo carga');
  if (!tempAmb && tempAmb !== 0) throw new Error(__lang === 'en' ? 'Enter the ambient temperature' : 'Ingresá la temperatura ambiente');
  const tempMaxima = TEMP_MAX[comp];
  if (!tempMaxima) throw new Error(__lang === 'en' ? 'Select a component type' : 'Seleccioná un tipo de componente');

  const margenTermico = tempMaxima - tempActual;
  const deltaT = tempActual - tempAmb;

  let estado: string;
  let recomendacion: string;

  if (margenTermico > 25) {
    estado = __lang === 'en' ? 'Excellent — low temperatures with plenty of headroom' : 'Excelente — temperaturas bajas con mucho margen';
    recomendacion = __lang === 'en'
      ? `You have ${margenTermico}°C of headroom. You can do moderate to aggressive overclocking. Your cooler is more than adequate.`
      : `Tenés ${margenTermico}°C de margen. Podés hacer overclock moderado a agresivo. Tu cooler es más que suficiente.`;
  } else if (margenTermico > 15) {
    estado = __lang === 'en' ? 'Good — enough headroom for moderate overclocking' : 'Bueno — margen suficiente para overclock moderado';
    recomendacion = __lang === 'en'
      ? `With ${margenTermico}°C of headroom, you can do light overclocking. Raise frequency gradually and monitor temperatures.`
      : `Con ${margenTermico}°C de margen, podés hacer overclock suave. Subí frecuencia gradualmente y monitoreá temperaturas.`;
  } else if (margenTermico > 5) {
    estado = __lang === 'en' ? 'Tight — little headroom, very limited overclocking' : 'Ajustado — poco margen, overclock muy limitado';
    recomendacion = __lang === 'en'
      ? `Only ${margenTermico}°C of headroom. Not recommended to OC without improving cooling first. Consider better thermal paste or a new cooler.`
      : `Solo ${margenTermico}°C de margen. No recomendable hacer OC sin mejorar la refrigeración primero. Considerá mejor pasta térmica o cooler.`;
  } else {
    estado = __lang === 'en' ? 'Critical — too hot, risk of throttling' : 'Crítico — demasiado caliente, riesgo de throttling';
    recomendacion = __lang === 'en'
      ? `Your component is at ${tempActual}°C, only ${margenTermico}°C away from throttling at ${tempMaxima}°C. DO NOT overclock. Improve cooling urgently.`
      : `Tu componente está a ${tempActual}°C, apenas ${margenTermico}°C del throttling a ${tempMaxima}°C. NO hagas overclock. Mejorá la refrigeración urgente.`;
  }

  if (tempAmb > 30) {
    recomendacion += __lang === 'en'
      ? ` Note: your ambient is ${tempAmb}°C (hot environment). In winter you would have ~${tempAmb - 20}°C less.`
      : ` Nota: tu ambiente está a ${tempAmb}°C (caluroso). En invierno tendrías ~${tempAmb - 20}°C menos.`;
  }

  // Insight: tono dinámico según el margen térmico
  const tone = margenTermico > 25 ? 'good' : margenTermico > 15 ? 'neutral' : 'warn';
  const _insight = {
    title: __lang === 'en' ? 'Thermal headroom' : 'Margen térmico',
    text: __lang === 'en'
      ? `At **${tempActual}°C** under load you have **${margenTermico}°C** of headroom before the ${tempMaxima}°C throttling limit (${deltaT}°C above your ${tempAmb}°C ambient).`
      : `A **${tempActual}°C** bajo carga te quedan **${margenTermico}°C** de margen antes del límite de throttling de ${tempMaxima}°C (${deltaT}°C por encima de tu ambiente de ${tempAmb}°C).`,
    tone,
    icon: '\u{1F321}️',
  };

  // Gauge: dónde cae la temperatura actual respecto del límite
  const topMax = Math.max(tempMaxima, tempActual) + 5;
  const _chart = {
    type: 'scale',
    marker: tempActual,
    markerLabel: `${tempActual}°C`,
    min: Math.min(tempAmb, 30, tempActual - 5),
    segments: [
      { nombre: __lang === 'en' ? 'Excellent' : 'Excelente', max: tempMaxima - 25, color: '#a7f3d0', colorDark: '#065f46' },
      { nombre: __lang === 'en' ? 'Good' : 'Bueno', max: tempMaxima - 15, color: '#86efac', colorDark: '#166534' },
      { nombre: __lang === 'en' ? 'Tight' : 'Ajustado', max: tempMaxima - 5, color: '#fde68a', colorDark: '#92400e' },
      { nombre: __lang === 'en' ? 'Critical' : 'Crítico', max: topMax, color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: __lang === 'en'
      ? `Temperature scale: ${tempActual}°C with a ${tempMaxima}°C limit, ${margenTermico}°C of headroom`
      : `Escala de temperatura: ${tempActual}°C con límite de ${tempMaxima}°C, ${margenTermico}°C de margen`,
  };

  return {
    margenTermico: Number(margenTermico.toFixed(0)),
    tempMaxima,
    estado,
    recomendacion,
    _insight,
    _chart,
  };
}
