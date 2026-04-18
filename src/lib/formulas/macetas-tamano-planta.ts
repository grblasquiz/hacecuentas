export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function macetasTamanoPlanta(i: Inputs): Outputs {
  const d = Number(i.diametroRaiz) || 10;
  const mult: Record<string, number> = { hojas: 1.5, frutal: 2, cactus: 1.2 };
  const dMaceta = d * (mult[String(i.tipo)] || 1.5);
  const r = dMaceta / 2;
  const V = Math.PI * r * r * dMaceta * 0.0007;
  return { diametro: dMaceta.toFixed(0) + ' cm', volumen: V.toFixed(1) + ' L', resumen: `Maceta ${dMaceta.toFixed(0)}cm Ø (${V.toFixed(0)}L) para ${i.tipo}.` };
}
