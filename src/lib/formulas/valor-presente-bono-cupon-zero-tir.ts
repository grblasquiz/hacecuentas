export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function valorPresenteBonoCuponZeroTir(i: Inputs): Outputs {
  const vn=Number(i.valorNominal)||0; const tir=Number(i.tir)||0; const a=Number(i.anos)||0;
  const vp=vn/((1+tir/100)**a); const desc=((1-vp/vn)*100);
  return { valorPresente:`$${vp.toFixed(2)}`, descuento:`${desc.toFixed(1)}% del VN`, interpretacion:`Un bono que paga $${vn} en ${a} años al ${tir}% TIR vale hoy $${vp.toFixed(2)}.` };
}
