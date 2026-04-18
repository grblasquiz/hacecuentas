export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impermeabilizanteTechoKgM2(i: Inputs): Outputs {
  const m = Number(i.m2) || 0;
  const kg_m2 = i.tipo === 'membrana' ? 8 : 2.5;
  const total = m * kg_m2;
  return { cantidad: total.toFixed(0) + ' kg', resumen: `${total.toFixed(0)} kg de ${i.tipo} para ${m} m² de techo.` };
}
