export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tanqueAguaLitrosPersonas(i: Inputs): Outputs {
  const p = Number(i.personas) || 1; const r = Number(i.reserva) || 1;
  const L = p * 200 * r;
  const comerciales = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000, 5000];
  const next = comerciales.find(x => x >= L) || L;
  return { litrosTotal: L.toFixed(0) + ' L', tanqueComercial: next.toString() + ' L',
    resumen: `${L.toFixed(0)} L necesarios (${p} personas × 200 L × ${r} días reserva). Tanque comercial ${next} L.` };
}
