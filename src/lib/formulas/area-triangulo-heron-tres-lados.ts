export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function areaTrianguloHeronTresLados(i: Inputs): Outputs {
  const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a+b<=c||a+c<=b||b+c<=a) return { area:'—', perimetro:'—', s:'—', resumen:'Los lados no forman triángulo válido.' };
  const s=(a+b+c)/2; const A=Math.sqrt(s*(s-a)*(s-b)*(s-c));
  return { area:`${A.toFixed(2)} cm²`, perimetro:`${(a+b+c).toFixed(2)} cm`, s:s.toFixed(2), resumen:`Triángulo ${a},${b},${c}: área ${A.toFixed(2)} cm².` };
}
