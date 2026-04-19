export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tdeeCalculadoraMifflinStJeor(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  return { resultado:r.toFixed(1), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.` };
}
