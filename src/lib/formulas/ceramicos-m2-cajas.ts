export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ceramicosM2Cajas(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const cpc = Number(i.m2PorCaja) || 1.5;
  const total_m2 = m * 1.10;
  const cajas = Math.ceil(total_m2 / cpc);
  return { cajas: cajas.toString(), m2Comprar: (cajas * cpc).toFixed(1),
    resumen: `${cajas} cajas = ${(cajas*cpc).toFixed(1)} m² (${m} m² + 10% descarte).` };
}
