export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function leliqLebacRendimientoBcra(i: Inputs): Outputs {
  const c=Number(i.capital)||0; const t=Number(i.tnaPorcentaje)||0; const d=Number(i.dias)||0;
  const r=c*t/100*d/365; const m=c+r; const tea=((1+t/100*d/365)**(365/d)-1)*100;
  return { rendimiento:`$${Math.round(r).toLocaleString('es-AR')}`, monto:`$${Math.round(m).toLocaleString('es-AR')}`, tea:`${tea.toFixed(2)}%` };
}
