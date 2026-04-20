export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mudanzaPrecioKilometrosM3Cuadro(i: Inputs): Outputs {
  const k=Number(i.kilometros)||0; const m=Number(i.m3Carga)||0; const p=String(i.piso||'planta_baja');
  const base=350000; const porKm=2500; const porM3=20000;
  const multPiso={'planta_baja':1,'1_2':1.05,'3_5':1.12,'6_mas':1.2}[p];
  const tot=(base+k*porKm+m*porM3)*multPiso;
  return { costoEstimado:`$${Math.round(tot).toLocaleString('es-AR')}`, desglose:`Base $${base.toLocaleString('es-AR')} + ${k} km × $${porKm.toLocaleString('es-AR')} + ${m} m³ × $${porM3.toLocaleString('es-AR')} ${p!=='planta_baja'?`+ recargo piso ${((multPiso-1)*100).toFixed(0)}%`:''}`, consejos:'Pedí 3 presupuestos. Cotizá con seguro incluido.' };
}
