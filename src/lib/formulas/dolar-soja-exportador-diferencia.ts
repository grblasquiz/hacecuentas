export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dolarSojaExportadorDiferencia(i: Inputs): Outputs {
  const u=Number(i.usdExportado)||0; const dof=Number(i.dolarOficial)||0; const dex=Number(i.dolarExportador)||0;
  const pof=u*dof; const pex=u*dex; const dif=pex-pof;
  return { pesosOficial:`$${Math.round(pof).toLocaleString('es-AR')}`, pesosExportador:`$${Math.round(pex).toLocaleString('es-AR')}`, diferencial:`+$${Math.round(dif).toLocaleString('es-AR')} (${((dex/dof-1)*100).toFixed(1)}%)` };
}
