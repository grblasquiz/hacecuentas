export interface TemperaturaDisipadorResistenciaTermicaInputs { potenciaDisipada: number; ambiente: number; thetaJC: number; thetaCS: number; thetaSA: number; tjMax?: number; }
export interface TemperaturaDisipadorResistenciaTermicaOutputs { tj: string; margenSeguridad: string; resumen: string; }
export function temperaturaDisipadorResistenciaTermica(i: TemperaturaDisipadorResistenciaTermicaInputs): TemperaturaDisipadorResistenciaTermicaOutputs {
  const p = Number(i.potenciaDisipada); const ta = Number(i.ambiente);
  const jc = Number(i.thetaJC); const cs = Number(i.thetaCS); const sa = Number(i.thetaSA);
  const tjMax = Number(i.tjMax ?? 125);
  if (!p || ta === null) throw new Error('Completá campos');
  const theta = jc + cs + sa;
  const tj = ta + p * theta;
  const margen = tjMax - tj;
  return { tj: tj.toFixed(1) + '°C', margenSeguridad: margen.toFixed(1) + '°C',
    resumen: `Tj = ${tj.toFixed(1)}°C (ambiente ${ta}°C + P×θ). Margen ${margen.toFixed(0)}°C vs Tj máx ${tjMax}°C. ${margen > 30 ? '✅ Seguro' : margen > 10 ? '⚠️ Ajustado' : '❌ Peligroso — mejorar disipador'}.` };
}
