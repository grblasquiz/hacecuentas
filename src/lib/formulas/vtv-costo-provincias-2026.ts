export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vtvCostoProvincias2026(i: Inputs): Outputs {
  const p=String(i.provincia||'pba'); const t=String(i.tipo||'auto');
  const base={'caba':45000,'pba':40000,'cordoba':38000,'santa_fe':35000,'mendoza':32000,'otras':40000}[p];
  const mult={'auto':1,'camioneta':1.3,'moto':0.5,'taxi':1.2}[t];
  const total=base*mult;
  return { costo:`$${Math.round(total).toLocaleString('es-AR')}`, frecuencia:t==='taxi'?'Anual':'Cada 2 años (autos <10 años)', penalizacion:'Multa + impedimento circular' };
}
