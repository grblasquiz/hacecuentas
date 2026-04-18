export interface FactorPotenciaCorregirInputs { p: number; cosFi1: number; cosFi2: number; v: number; f: number; }
export interface FactorPotenciaCorregirOutputs { qc: string; capacitor: string; s1: string; s2: string; resumen: string; }
export function factorPotenciaCorregir(i: FactorPotenciaCorregirInputs): FactorPotenciaCorregirOutputs {
  const p = Number(i.p); const c1 = Number(i.cosFi1); const c2 = Number(i.cosFi2);
  const v = Number(i.v); const f = Number(i.f);
  if (c1 >= c2) throw new Error('cos(φ) objetivo debe ser mayor que actual');
  const tan1 = Math.tan(Math.acos(c1)); const tan2 = Math.tan(Math.acos(c2));
  const qc = p * (tan1 - tan2);
  const cFarads = qc / (2 * Math.PI * f * v * v);
  const s1 = p / c1; const s2 = p / c2;
  return {
    qc: (qc / 1000).toFixed(3) + ' kVAR',
    capacitor: (cFarads * 1e6).toFixed(1) + ' µF',
    s1: (s1 / 1000).toFixed(2) + ' kVA',
    s2: (s2 / 1000).toFixed(2) + ' kVA',
    resumen: `Capacitor de ${(cFarads * 1e6).toFixed(0)} µF corrige cos(φ) de ${c1} a ${c2}. Reducción de carga aparente: ${((s1-s2)/1000).toFixed(2)} kVA.`
  };
}
