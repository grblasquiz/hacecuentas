export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function inmobiliarioProvincialPbaTramos(i: Inputs): Outputs {
  const v=Number(i.valuacion)||0;
  let alic=0.01; if (v>8000000) alic=0.015; if (v>20000000) alic=0.02; if (v>50000000) alic=0.025;
  const anual=v*alic;
  return { inmob:'$'+anual.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), mensual:'$'+(anual/12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`PBA valuación $${v.toLocaleString('es-AR')}: inmobiliario $${anual.toFixed(0)}/año.` };
}
