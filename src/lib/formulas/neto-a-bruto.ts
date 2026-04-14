/**
 * Inverso de sueldo-ar: partís del neto y querés saber qué bruto lo genera.
 * Usa el mismo MNI y escala que sueldo-ar para consistencia. Hace búsqueda
 * binaria porque la relación neto→bruto no es lineal (por la escala progresiva).
 */
import { sueldoAR } from './sueldo-ar';

export interface Inputs { neto: number; cargas: number; }
export interface Outputs { bruto: number; aportes: number; ganancias: number; descuentoTotal: number; }

export function netoABruto(i: Inputs): Outputs {
  const netoObjetivo = Number(i.neto);
  const cargas = Number(i.cargas) || 0;
  if (!netoObjetivo || netoObjetivo <= 0) throw new Error('Ingresá el sueldo neto');

  // Búsqueda binaria — bruto está entre neto (si fuera 0% dto) y 2x neto (extremo)
  let lo = netoObjetivo;
  let hi = netoObjetivo * 2.5;
  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    const { neto } = sueldoAR({ bruto: mid, cargas });
    if (Math.abs(neto - netoObjetivo) < 1) break;
    if (neto < netoObjetivo) lo = mid;
    else hi = mid;
  }
  const bruto = Math.round((lo + hi) / 2);
  const res = sueldoAR({ bruto, cargas });
  return {
    bruto,
    aportes: res.aportes,
    ganancias: res.ganancias,
    descuentoTotal: res.descuentoTotal,
  };
}
