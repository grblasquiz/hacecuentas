export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function empujeArquimedesVolumen(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { error: 'Completá' },
    en: { error: 'Fill in all fields' },
  } as const)[__lang];
  const rho = Number(i.rho); const V = Number(i.vol); const g = Number(i.g) || 9.81;
  if (!rho || !V) throw new Error(T.error);
  const E = rho * V * g;
  const resumen = __lang === 'en'
    ? `Buoyancy = ${E.toFixed(1)} N with V=${V}m³ of fluid ρ=${rho}kg/m³.`
    : `Empuje = ${E.toFixed(1)} N con V=${V}m³ de fluido ρ=${rho}kg/m³.`;
  return { empuje: E.toFixed(2) + ' N', resumen };
}
