export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function hidratacionEjercicioElectrolitosIsotonica(i: Inputs): Outputs {
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/100;
  return { resultado:r.toFixed(2), resumen:`Cálculo con ${v1} y ${v2}: ${r.toFixed(2)}.` };
}
