export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoBodaEvento(i: Inputs): Outputs {
  const i_ = Number(i.invitados) || 0;
  const co2 = i_ * 150;
  const arb = Math.ceil(co2 / 22);
  return { kgCo2: (co2/1000).toFixed(1) + ' t', arbolesCompensar: arb.toString(), resumen: `Boda con ${i_} invitados: ${(co2/1000).toFixed(1)} t CO₂. Plantar ${arb} árboles para compensar.` };
}
