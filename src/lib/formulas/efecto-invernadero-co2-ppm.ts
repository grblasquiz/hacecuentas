export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function efectoInvernaderoCo2Ppm(i: Inputs): Outputs {
  const c = Number(i.c); const c0 = Number(i.c0) || 280;
  if (!c) throw new Error('Ingresá concentración');
  const dF = 5.35 * Math.log(c / c0);
  return { forzamiento: dF.toFixed(2) + ' W/m²', resumen: `Forzamiento radiativo ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).` };
}
