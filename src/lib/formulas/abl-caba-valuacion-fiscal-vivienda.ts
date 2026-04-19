export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ablCabaValuacionFiscalVivienda(i: Inputs): Outputs {
  const v=Number(i.valuacion)||0;
  let alic=0.008; if (v>10000000) alic=0.012; if (v>25000000) alic=0.015; if (v>50000000) alic=0.018; if (v>100000000) alic=0.02;
  const anual=v*alic;
  return { ablAnual:'$'+anual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), ablMensual:'$'+(anual/12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Valuación $${v.toLocaleString('es-AR')}: ABL $${anual.toFixed(0)}/año.` };
}
