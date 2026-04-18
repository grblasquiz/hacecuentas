export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cognadosIdiomaPorcentajeEspanolAyuda(i: Inputs): Outputs {
  const id=String(i.idioma||'italiano');
  const c:Record<string,[string,string]>={italiano:['~82%','Altísima'],portugues:['~89%','Altísima'],frances:['~75%','Alta'],ingles:['~30-40%','Media'],aleman:['~25%','Baja'],japones:['~0%','Nula']};
  const [pct,vn]=c[id]||c.italiano;
  return { pct, ventaja:vn, resumen:`${id}: ${pct} cognados con ES. Ventaja ${vn}.` };
}
