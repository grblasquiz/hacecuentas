export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function fertilizanteNpkDosis(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0; const t = String(i.tipo);
  const dosis: Record<string, number> = { '10-10-10': 30, '15-5-20': 40, '5-10-15': 35 };
  const g = m * (dosis[t] || 30);
  const resumen = __lang === 'en'
    ? `Apply ${g.toFixed(0)} g of NPK ${t} to ${m} m².`
    : `Aplicar ${g.toFixed(0)} g de NPK ${t} en ${m} m².`;
  return { gramos: g.toFixed(0) + ' g', resumen };
}
