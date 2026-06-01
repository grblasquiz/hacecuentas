export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function drenajeGravaMaceta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const V = Number(i.volumenMaceta) || 0;
  const min = V * 0.05; const max = V * 0.15;
  const resumen = __lang === 'en'
    ? `Drainage: ${min.toFixed(1)}-${max.toFixed(1)} L of gravel for a ${V} L pot.`
    : `Drenaje: ${min.toFixed(1)}-${max.toFixed(1)} L de grava para maceta de ${V} L.`;
  return { litrosGrava: `${min.toFixed(1)}-${max.toFixed(1)} L`, resumen };
}
