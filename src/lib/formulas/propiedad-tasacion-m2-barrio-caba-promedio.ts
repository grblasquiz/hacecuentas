export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function propiedadTasacionM2BarrioCabaPromedio(i: Inputs): Outputs {
  const b=String(i.barrio||'palermo'); const t=String(i.tipoProp||'departamento');
  const base={'puerto_madero':5000,'recoleta':3200,'palermo':2900,'belgrano':2800,'caballito':2000,'villa_crespo':2100,'flores':1700,'liniers':1400,'boedo':1600,'pompeya':1100}[b];
  const mult=t==='casa'?0.9:1;
  const val=base*mult;
  const rango=`USD ${Math.round(val*0.8).toLocaleString('en-US')}-${Math.round(val*1.2).toLocaleString('en-US')}`;
  return { valorM2Usd:`USD ${val.toLocaleString('en-US')}/m²`, rango:rango, observacion:'Promedio 2026. Varía según amenities, antigüedad, orientación, ubicación exacta.' };
}
