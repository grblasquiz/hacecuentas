export interface ServoPwmAnguloInputs { pulso: number; rango?: number; __lang?: string; }
export interface ServoPwmAnguloOutputs { angulo: string; porcentaje: string; resumen: string; _insight?: any; _chart?: any; }
export function servoPwmAngulo(i: ServoPwmAnguloInputs): ServoPwmAnguloOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p = Number(i.pulso); const r = Number(i.rango ?? 180);
  if (!p || p < 0.5 || p > 2.5) throw new Error(__lang === 'en' ? 'Pulse between 0.5 and 2.5 ms' : __lang === 'pt' ? 'Pulso entre 0,5 e 2,5 ms' : 'Pulso entre 0.5 y 2.5 ms');
  const angulo = (p - 1) * r;
  const pct = ((p - 1) / 1) * 100;
  const anguloClamp = Math.max(0, Math.min(r, angulo));
  const scaleMax = r * 1.05;
  const posTxt = __lang === 'en'
    ? (pct <= 5 ? 'near minimum' : pct >= 95 ? 'near maximum' : Math.abs(pct - 50) <= 5 ? 'centered' : pct < 50 ? 'in the lower half' : 'in the upper half')
    : __lang === 'pt'
    ? (pct <= 5 ? 'perto do mínimo' : pct >= 95 ? 'perto do máximo' : Math.abs(pct - 50) <= 5 ? 'centralizado' : pct < 50 ? 'na metade inferior' : 'na metade superior')
    : (pct <= 5 ? 'cerca del mínimo' : pct >= 95 ? 'cerca del máximo' : Math.abs(pct - 50) <= 5 ? 'centrado' : pct < 50 ? 'en la mitad inferior' : 'en la mitad superior');
  const _insight = {
    title: __lang === 'en' ? 'Servo position' : __lang === 'pt' ? 'Posição do servo' : 'Posición del servo',
    text: __lang === 'en'
      ? `A **${p} ms** pulse drives the servo to **${angulo.toFixed(0)}°**, **${pct.toFixed(0)}%** of its ${r}° travel — that is **${posTxt}**. The neutral position (1.5 ms) sits at the center.`
      : __lang === 'pt'
      ? `Um pulso de **${p} ms** leva o servo a **${angulo.toFixed(0)}°**, **${pct.toFixed(0)}%** do seu curso de ${r}° — ou seja, **${posTxt}**. A posição neutra (1,5 ms) fica no centro.`
      : `Un pulso de **${p} ms** lleva el servo a **${angulo.toFixed(0)}°**, **${pct.toFixed(0)}%** de su recorrido de ${r}° — es decir, **${posTxt}**. La posición neutra (1,5 ms) queda en el centro.`,
    tone: 'neutral',
    icon: '⚙️',
  };
  const _chart = {
    type: 'scale',
    marker: Number(anguloClamp.toFixed(1)),
    markerLabel: angulo.toFixed(0) + '°',
    min: 0,
    segments: __lang === 'en'
      ? [{ nombre: 'Lower', max: r / 3, color: '#93c5fd', colorDark: '#1e3a8a' }, { nombre: 'Center', max: (r * 2) / 3, color: '#86efac', colorDark: '#14532d' }, { nombre: 'Upper', max: scaleMax, color: '#fdba74', colorDark: '#7c2d12' }]
      : __lang === 'pt'
      ? [{ nombre: 'Inferior', max: r / 3, color: '#93c5fd', colorDark: '#1e3a8a' }, { nombre: 'Centro', max: (r * 2) / 3, color: '#86efac', colorDark: '#14532d' }, { nombre: 'Superior', max: scaleMax, color: '#fdba74', colorDark: '#7c2d12' }]
      : [{ nombre: 'Inferior', max: r / 3, color: '#93c5fd', colorDark: '#1e3a8a' }, { nombre: 'Centro', max: (r * 2) / 3, color: '#86efac', colorDark: '#14532d' }, { nombre: 'Superior', max: scaleMax, color: '#fdba74', colorDark: '#7c2d12' }],
    ariaLabel: __lang === 'en' ? `Servo angle ${angulo.toFixed(0)}° within its ${r}° range` : __lang === 'pt' ? `Ângulo do servo ${angulo.toFixed(0)}° dentro do intervalo de ${r}°` : `Ángulo del servo ${angulo.toFixed(0)}° dentro de su rango de ${r}°`,
  };
  return { angulo: angulo.toFixed(1) + '°', porcentaje: pct.toFixed(0) + '%',
    resumen: __lang === 'en'
      ? `Pulse ${p} ms → angle ${angulo.toFixed(0)}° (${pct.toFixed(0)}% of the ${r}° range).`
      : __lang === 'pt'
      ? `Pulso ${p} ms → ângulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% do intervalo de ${r}°).`
      : `Pulso ${p} ms → ángulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% del rango de ${r}°).`,
    _insight, _chart };
}
