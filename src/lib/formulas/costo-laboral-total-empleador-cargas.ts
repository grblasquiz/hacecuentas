export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function costoLaboralTotalEmpleadorCargas(i: Inputs): Outputs {
  const s=Number(i.sueldoBruto)||0; const cs=Number(i.cargasSociales)||0; const art=Number(i.art)||0; const seg=Number(i.seguros)||0;
  const total=s*(1+(cs+art+seg)/100); const anual=total*13; const pct=((total/s-1)*100);
  return { costoTotal:`$${Math.round(total).toLocaleString('es-AR')}`, costoAnual:`$${Math.round(anual).toLocaleString('es-AR')}`, porcentajeCargas:`+${pct.toFixed(1)}%` };
}
