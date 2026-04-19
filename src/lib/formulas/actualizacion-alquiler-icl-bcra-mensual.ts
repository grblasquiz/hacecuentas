export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function actualizacionAlquilerIclBcraMensual(i: Inputs): Outputs {
  const a=Number(i.alquilerInicial)||0; const i1=Number(i.iclInicial)||0; const i2=Number(i.iclActual)||0;
  if (i1===0) return { alquilerActual:'—', aumento:'—', resumen:'ICL inicial inválido.' };
  const nuevo=a*(i2/i1);
  const aum=((i2/i1)-1)*100;
  return { alquilerActual:'$'+nuevo.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), aumento:aum.toFixed(1)+'%', resumen:`Alquiler $${a.toLocaleString('es-AR')} → $${nuevo.toFixed(0)} (+${aum.toFixed(1)}%).` };
}
