export interface BancoBateriasSolarDiasAutonomiaInputs { kwhDia: number; dias: number; v: number; dod: number; eficiencia?: number; }
export interface BancoBateriasSolarDiasAutonomiaOutputs { ah: string; whTotal: string; resumen: string; }
export function bancoBateriasSolarDiasAutonomia(i: BancoBateriasSolarDiasAutonomiaInputs): BancoBateriasSolarDiasAutonomiaOutputs {
  const kwhDia = Number(i.kwhDia); const d = Number(i.dias); const v = Number(i.v);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 90) / 100;
  if (!kwhDia || !d || !v) throw new Error('Completá campos');
  const whTotal = kwhDia * 1000 * d;
  const ah = whTotal / (v * dod * eff);
  return {
    ah: ah.toFixed(0) + ' Ah a ' + v + 'V',
    whTotal: (whTotal / 1000).toFixed(1) + ' kWh',
    resumen: `Banco ${ah.toFixed(0)}Ah a ${v}V cubre ${d} día${d>1?'s':''} con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%. Energía total: ${(whTotal/1000).toFixed(1)} kWh.`
  };
}
