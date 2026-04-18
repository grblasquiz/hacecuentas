export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vigaHormigonHBDimensiones(i: Inputs): Outputs {
  const L = Number(i.luz) || 0;
  const h = L * 100 / 12; const b = h / 2;
  return { altura: h.toFixed(0), ancho: b.toFixed(0), resumen: `Viga ${h.toFixed(0)}×${b.toFixed(0)} cm para luz ${L} m.` };
}
