export interface FactorPotenciaCorregirInputs { p: number; cosFi1: number; cosFi2: number; v: number; f: number; __lang?: string; }
export interface FactorPotenciaCorregirOutputs { qc: string; capacitor: string; s1: string; s2: string; resumen: string; _insight?: any; }
export function factorPotenciaCorregir(i: FactorPotenciaCorregirInputs): FactorPotenciaCorregirOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p = Number(i.p); const c1 = Number(i.cosFi1); const c2 = Number(i.cosFi2);
  const v = Number(i.v); const f = Number(i.f);
  if (c1 >= c2) throw new Error(__lang === 'en' ? 'Target cos(φ) must be greater than current' : 'cos(φ) objetivo debe ser mayor que actual');
  const tan1 = Math.tan(Math.acos(c1)); const tan2 = Math.tan(Math.acos(c2));
  const qc = p * (tan1 - tan2);
  const cFarads = qc / (2 * Math.PI * f * v * v);
  const s1 = p / c1; const s2 = p / c2;
  const reduccionKva = (s1 - s2) / 1000;
  const reduccionPct = s1 > 0 ? ((s1 - s2) / s1) * 100 : 0;
  const ufStr = (cFarads * 1e6).toFixed(0);
  return {
    qc: (qc / 1000).toFixed(3) + ' kVAR',
    capacitor: (cFarads * 1e6).toFixed(1) + ' µF',
    s1: (s1 / 1000).toFixed(2) + ' kVA',
    s2: (s2 / 1000).toFixed(2) + ' kVA',
    resumen: __lang === 'en'
      ? `Capacitor of ${ufStr} µF corrects cos(φ) from ${c1} to ${c2}. Apparent load reduction: ${reduccionKva.toFixed(2)} kVA.`
      : `Capacitor de ${ufStr} µF corrige cos(φ) de ${c1} a ${c2}. Reducción de carga aparente: ${reduccionKva.toFixed(2)} kVA.`,
    _insight: {
      title: __lang === 'en' ? 'Correction impact' : 'Impacto de la corrección',
      text: __lang === 'en'
        ? `Adding **${(qc / 1000).toFixed(2)} kVAR** (a ${ufStr} µF capacitor) lifts cos(φ) to **${c2}** and trims the apparent load by **${reduccionKva.toFixed(2)} kVA** (${reduccionPct.toFixed(0)}%), freeing transformer and cable capacity and dodging utility penalties.`
        : `Sumar **${(qc / 1000).toFixed(2)} kVAR** (un capacitor de ${ufStr} µF) lleva el cos(φ) a **${c2}** y recorta la carga aparente en **${reduccionKva.toFixed(2)} kVA** (${reduccionPct.toFixed(0)}%), liberando capacidad de transformador y cables y evitando multas de la distribuidora.`,
      tone: 'good',
      icon: '⚡',
    },
  };
}
