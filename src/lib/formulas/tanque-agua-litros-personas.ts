export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function tanqueAguaLitrosPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p = Number(i.personas) || 1; const r = Number(i.reserva) || 1;
  const L = p * 200 * r;
  const comerciales = [500, 750, 1000, 1100, 1500, 2000, 2500, 3000, 5000];
  const next = comerciales.find(x => x >= L) || L;
  const resumen = __lang === 'en'
    ? `${L.toFixed(0)} L needed (${p} people × 200 L × ${r} days reserve). Commercial tank ${next} L.`
    : `${L.toFixed(0)} L necesarios (${p} personas × 200 L × ${r} días reserva). Tanque comercial ${next} L.`;
  return { litrosTotal: L.toFixed(0) + ' L', tanqueComercial: next.toString() + ' L', resumen };
}
