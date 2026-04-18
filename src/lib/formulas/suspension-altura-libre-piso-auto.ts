export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function suspensionAlturaLibrePisoAuto(i: Inputs): Outputs {
  const t=String(i.tipo||'sedan');
  const r:Record<string,string>={sedan:'12-15 cm',suv:'18-22 cm',pickup:'20-25 cm',off:'25-30 cm'};
  return { altura:r[t]||'15 cm', categoria:t, resumen:`${t}: altura libre típica ${r[t]||'15 cm'}.` };
}
