export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function depositosAlquilerCuantosMesesDevolucion(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const c=String(i.contrato||'actual');
  const max=c==='actual'?a*3:a;
  return { deposito:'$'+a.toLocaleString('es-AR')+' - $'+max.toLocaleString('es-AR'), maximo:'$'+max.toLocaleString('es-AR'), devolucion:'30 días post egreso - daños', resumen:`Alquiler $${a.toLocaleString('es-AR')}: depósito ${c==='actual'?'1-3 meses':'máx 1 mes'} = hasta $${max.toLocaleString('es-AR')}.` };
}
