export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }
const fmtMiles=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
export function ivaSaldoFavorContraRi(i: Inputs): Outputs {
  const v=Number(i.ventasBrutas)||0; const c=Number(i.comprasBrutas)||0; const a=Number(i.alicuota)||21;
  const f=a/(100+a);
  const deb=v*f; const cre=c*f;
  const saldo=deb-cre;
  const insight = saldo>=0
    ? {
        title:'Saldo a pagar',
        text:`Tu débito fiscal (**$${fmtMiles(deb)}**) supera al crédito (**$${fmtMiles(cre)}**), así que tenés que **ingresar $${fmtMiles(saldo)}** de IVA a la AFIP este período. Cargá todas las facturas de compra con crédito computable para no pagar de más.`,
        tone:'warn',
        icon:'📤',
      }
    : {
        title:'Saldo a favor',
        text:`Tu crédito fiscal (**$${fmtMiles(cre)}**) supera al débito (**$${fmtMiles(deb)}**): no pagás IVA este mes y arrastrás **$${fmtMiles(Math.abs(saldo))} a favor** para el próximo período (saldo técnico, no reintegrable en efectivo).`,
        tone:'good',
        icon:'📥',
      };
  return { debito:'$'+fmtMiles(deb), credito:'$'+fmtMiles(cre), saldo:(saldo>=0?'$':'-$')+fmtMiles(Math.abs(saldo)), resumen:saldo>=0?`A pagar: $${saldo.toFixed(0)}.`:`A favor próximo mes: $${Math.abs(saldo).toFixed(0)}.`, _insight: insight };
}
