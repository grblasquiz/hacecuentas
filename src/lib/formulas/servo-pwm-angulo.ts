export interface ServoPwmAnguloInputs { pulso: number; rango?: number; __lang?: string; }
export interface ServoPwmAnguloOutputs { angulo: string; porcentaje: string; resumen: string; }
export function servoPwmAngulo(i: ServoPwmAnguloInputs): ServoPwmAnguloOutputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const p = Number(i.pulso); const r = Number(i.rango ?? 180);
  if (!p || p < 0.5 || p > 2.5) throw new Error(__lang === 'en' ? 'Pulse between 0.5 and 2.5 ms' : __lang === 'pt' ? 'Pulso entre 0,5 e 2,5 ms' : 'Pulso entre 0.5 y 2.5 ms');
  const angulo = (p - 1) * r;
  const pct = ((p - 1) / 1) * 100;
  return { angulo: angulo.toFixed(1) + '°', porcentaje: pct.toFixed(0) + '%',
    resumen: __lang === 'en'
      ? `Pulse ${p} ms → angle ${angulo.toFixed(0)}° (${pct.toFixed(0)}% of the ${r}° range).`
      : __lang === 'pt'
      ? `Pulso ${p} ms → ângulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% do intervalo de ${r}°).`
      : `Pulso ${p} ms → ángulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% del rango de ${r}°).` };
}
