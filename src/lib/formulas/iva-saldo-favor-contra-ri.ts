export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ivaSaldoFavorContraRi(i: Inputs): Outputs {
  const v=Number(i.ventasBrutas)||0; const c=Number(i.comprasBrutas)||0; const a=Number(i.alicuota)||21;
  const f=a/(100+a);
  const deb=v*f; const cre=c*f;
  const saldo=deb-cre;
  return { debito:'$'+deb.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), credito:'$'+cre.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), saldo:(saldo>=0?'$':'-$')+Math.abs(saldo).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:saldo>=0?`A pagar: $${saldo.toFixed(0)}.`:`A favor próximo mes: $${Math.abs(saldo).toFixed(0)}.` };
}
