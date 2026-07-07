export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function presionParcialDalton(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const x = Number(i.fraccion); const p = Number(i.pTotal);
  if (x === undefined || !p) throw new Error(__lang === 'en' ? 'Complete all fields' : 'Completá');
  const pp = x * p;
  const pctMol = x * 100;
  const insight = {
    title: __lang === 'en' ? 'What your result means' : 'Qué significa tu resultado',
    text: __lang === 'en'
      ? `This gas makes up **${pctMol.toFixed(1)}%** of the mixture (mole fraction ${x}), so it contributes **${pp.toFixed(3)} atm** of the **${p} atm** total pressure (Dalton's law).`
      : `Este gas representa el **${pctMol.toFixed(1)}%** de la mezcla (fracción molar ${x}), por lo que aporta **${pp.toFixed(3)} atm** de la presión total de **${p} atm** (ley de Dalton).`,
    tone: 'neutral',
    icon: '🧪',
  };
  return {
    presionParcial: pp.toFixed(3) + ' atm',
    resumen: __lang === 'en'
      ? `Partial pressure: ${pp.toFixed(3)} atm (fraction ${x} of ${p} atm total).`
      : `Presión parcial: ${pp.toFixed(3)} atm (fracción ${x} de ${p} atm total).`,
    _insight: insight,
  };
}
