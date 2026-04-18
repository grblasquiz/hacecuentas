export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pinturaLitrosM2Manos(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const ma = Number(i.manos) || 1; const r = Number(i.rendimiento) || 10;
  const L = (m * ma) / r;
  const gal = L * 0.264;
  return { litros: L.toFixed(1), galones: gal.toFixed(2), resumen: `${L.toFixed(1)} L (${gal.toFixed(1)} gal) para ${m} m² con ${ma} manos.` };
}
