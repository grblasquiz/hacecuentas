export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function patenteAutoValorProvinciaAlicuota(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const p=String(i.provincia||'caba');
  const alic: Record<string,number> = { caba:0.045, pba:0.045, cba:0.05, sfe:0.045, mza:0.04 };
  const a=alic[p]||0.045;
  const patente=v*a;
  return { patente:'$'+patente.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), mensual:'$'+(patente/12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`${p.toUpperCase()} auto $${v.toLocaleString('es-AR')}: patente anual $${patente.toFixed(0)}.` };
}
