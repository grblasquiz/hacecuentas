export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function empujeArquimedesVolumen(i: Inputs): Outputs {
  const rho = Number(i.rho); const V = Number(i.vol); const g = Number(i.g) || 9.81;
  if (!rho || !V) throw new Error('Completá');
  const E = rho * V * g;
  return { empuje: E.toFixed(2) + ' N', resumen: `Empuje = ${E.toFixed(1)} N con V=${V}m³ de fluido ρ=${rho}kg/m³.` };
}
