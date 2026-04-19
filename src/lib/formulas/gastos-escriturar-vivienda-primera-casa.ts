export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gastosEscriturarViviendaPrimeraCasa(i: Inputs): Outputs {
  const v=Number(i.valorCasa)||0;
  const sen=v*0.15;
  const escr=v*0.07;
  const mue=Math.min(v*0.05,5000000);
  const tot=sen+escr+mue;
  return { senia:'$'+sen.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), gastosEscritura:'$'+escr.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), muebles:'$'+mue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), totalInicial:'$'+tot.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Casa $${v.toLocaleString('es-AR')}: desembolso inicial ~$${tot.toFixed(0)}.` };
}
