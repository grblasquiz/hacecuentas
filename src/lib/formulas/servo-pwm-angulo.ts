export interface ServoPwmAnguloInputs { pulso: number; rango?: number; }
export interface ServoPwmAnguloOutputs { angulo: string; porcentaje: string; resumen: string; }
export function servoPwmAngulo(i: ServoPwmAnguloInputs): ServoPwmAnguloOutputs {
  const p = Number(i.pulso); const r = Number(i.rango ?? 180);
  if (!p || p < 0.5 || p > 2.5) throw new Error('Pulso entre 0.5 y 2.5 ms');
  const angulo = (p - 1) * r;
  const pct = ((p - 1) / 1) * 100;
  return { angulo: angulo.toFixed(1) + '°', porcentaje: pct.toFixed(0) + '%',
    resumen: `Pulso ${p} ms → ángulo ${angulo.toFixed(0)}° (${pct.toFixed(0)}% del rango de ${r}°).` };
}
