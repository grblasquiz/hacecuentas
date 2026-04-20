export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function arbaSellosInmobiliariosPbaCompraventa(i: Inputs): Outputs {
  const v=Number(i.valorPropiedad)||0; const u=String(i.unicaVivienda||'no');
  const aliq=u==='si'&&v<50000000?0.018:0.036;
  const total=v*aliq; const porParte=total/2;
  return { sellos:`$${Math.round(total).toLocaleString('es-AR')}`, porParte:`$${Math.round(porParte).toLocaleString('es-AR')}`, interpretacion:`Sellos ${(aliq*100).toFixed(1)}% = $${Math.round(total).toLocaleString('es-AR')}. Paga mitad cada parte.` };
}
