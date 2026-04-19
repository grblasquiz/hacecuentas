export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function percepcionDolarTarjetaImpuestoPais(i: Inputs): Outputs {
  const u=Number(i.montoUsd)||0; const d=Number(i.dolarOficial)||1400;
  const sub=u*d;
  const pais=sub*0.30;
  const gan=sub*0.30;
  const total=sub+pais+gan;
  return { subtotalArs:'$'+sub.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), perceptPais:'$'+pais.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), perceptGan:'$'+gan.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), totalPagar:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`USD ${u} × $${d} + PAIS + Gan = $${total.toFixed(0)}.` };
}
