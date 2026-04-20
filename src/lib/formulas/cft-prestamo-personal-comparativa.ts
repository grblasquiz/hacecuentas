export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cftPrestamoPersonalComparativa(i: Inputs): Outputs {
  const m=Number(i.montoPrestamo)||0; const t=Number(i.tnaPorcentaje)||0; const n=Number(i.plazoMeses)||1; const com=Number(i.comisionesYSeguros)||0;
  const iMen=t/100/12; const cuotaBase=m*iMen*((1+iMen)**n)/((1+iMen)**n-1);
  const cuota=cuotaBase+com; const total=cuota*n;
  const cft=((total/m)**(12/n)-1)*100;
  return { cft:`${cft.toFixed(0)}% aprox`, cuotaMensual:`$${Math.round(cuota).toLocaleString('es-AR')}`, totalPagado:`$${Math.round(total).toLocaleString('es-AR')}` };
}
