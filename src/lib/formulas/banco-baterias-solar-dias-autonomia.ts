export interface BancoBateriasSolarDiasAutonomiaInputs { kwhDia: number; dias: number; v: number; dod: number; eficiencia?: number; }
export interface BancoBateriasSolarDiasAutonomiaOutputs { ah: string; whTotal: string; resumen: string; _insight?: any; }
export function bancoBateriasSolarDiasAutonomia(i: BancoBateriasSolarDiasAutonomiaInputs): BancoBateriasSolarDiasAutonomiaOutputs {
  const kwhDia = Number(i.kwhDia); const d = Number(i.dias); const v = Number(i.v);
  const dod = Number(i.dod) / 100; const eff = Number(i.eficiencia ?? 90) / 100;
  if (!kwhDia || !d || !v) throw new Error('Completá campos');
  const whTotal = kwhDia * 1000 * d;
  const ah = whTotal / (v * dod * eff);
  const _insight = {
    title: 'Lo que necesita tu banco',
    text:
      `Para cubrir **${kwhDia} kWh/día** durante **${d} día${d>1?'s':''}** sin sol necesitás un banco de **${ah.toFixed(0)} Ah a ${v}V** ` +
      `(${(whTotal/1000).toFixed(1)} kWh almacenados). ` +
      (dod*100 >= 80
        ? `Ojo: el DoD de **${(dod*100).toFixed(0)}%** es exigente y acorta la vida útil si son baterías de plomo — para litio está bien.`
        : `El DoD de **${(dod*100).toFixed(0)}%** preserva la vida útil de las baterías.`),
    tone: (dod*100 >= 80 ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🔋',
  };
  return {
    ah: ah.toFixed(0) + ' Ah a ' + v + 'V',
    whTotal: (whTotal / 1000).toFixed(1) + ' kWh',
    resumen: `Banco ${ah.toFixed(0)}Ah a ${v}V cubre ${d} día${d>1?'s':''} con DoD ${(dod*100).toFixed(0)}% y eficiencia ${(eff*100).toFixed(0)}%. Energía total: ${(whTotal/1000).toFixed(1)} kWh.`,
    _insight
  };
}
