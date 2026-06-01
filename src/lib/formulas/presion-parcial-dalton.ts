export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function presionParcialDalton(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const x = Number(i.fraccion); const p = Number(i.pTotal);
  if (x === undefined || !p) throw new Error(__lang === 'en' ? 'Complete all fields' : 'Completá');
  const pp = x * p;
  return {
    presionParcial: pp.toFixed(3) + ' atm',
    resumen: __lang === 'en'
      ? `Partial pressure: ${pp.toFixed(3)} atm (fraction ${x} of ${p} atm total).`
      : `Presión parcial: ${pp.toFixed(3)} atm (fracción ${x} de ${p} atm total).`,
  };
}
