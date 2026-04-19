export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function alquilerTemporalAirbnbGananciaNeta(i: Inputs): Outputs {
  const p=Number(i.precioNoche)||0; const n=Number(i.nochesMes)||0; const e=Number(i.expensas)||0;
  const bruto=p*n;
  const com=bruto*0.03;
  const imp=bruto*0.08;
  const neto=bruto-com-imp-e;
  return { bruto:'$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), comisiones:'$'+com.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), roiBruto:'~2.5x', resumen:`$${p}/noche × ${n}: bruto $${bruto.toFixed(0)}, neto ~$${neto.toFixed(0)}.` };
}
