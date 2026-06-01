export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function presionHidrostaticaProfundidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const rho = Number(i.rho); const h = Number(i.h); const g = Number(i.g) || 9.81;
  if (!rho || h === undefined) throw new Error(__lang === 'en' ? 'Fill in the required fields' : 'Completá');
  const P = rho * g * h;
  const resumen = __lang === 'en'
    ? `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) at ${h}m depth.`
    : `P = ${P.toFixed(0)} Pa (${(P/100000).toFixed(2)} bar) a ${h}m de profundidad.`;
  return { presion: P.toFixed(0) + ' Pa', presionBar: (P/100000).toFixed(3) + ' bar', resumen };
}
