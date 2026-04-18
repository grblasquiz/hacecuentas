export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function energiaFotonesFrecuenciaLongitudOnda(i: Inputs): Outputs {
  const h = 6.626e-34; const c = 3e8;
  const modo = String(i.modo); const v = Number(i.valor); const u = String(i.unidad);
  if (!v) throw new Error('Completá valor');
  let freq: number;
  if (modo === 'freq') { freq = u === 'THz' ? v * 1e12 : v; }
  else { const lam = u === 'um' ? v * 1e-6 : v * 1e-9; freq = c / lam; }
  const E = h * freq;
  const eV = E / 1.602e-19;
  return { energia: E.toExponential(3) + ' J', ev: eV.toFixed(3) + ' eV', resumen: `E = ${E.toExponential(2)} J (${eV.toFixed(2)} eV).` };
}
