export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function combustibleAutoViajeEmisiones(i: Inputs): Outputs {
  const L = Number(i.litros) || 0;
  const f = i.tipo === 'gasoil' ? 2.68 : i.tipo === 'gnc' ? 1.88 : 2.31;
  const co2 = L * f;
  return { kgCo2: co2.toFixed(1) + ' kg', resumen: `${L}L de ${i.tipo} = ${co2.toFixed(0)} kg CO₂ emitido.` };
}
