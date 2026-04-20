export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rentaFinancieraCedularPersonas(i: Inputs): Outputs {
  const g=Number(i.gananciaRealizada)||0; const a=Number(i.alicuota)||15;
  const imp=g*a/100; const neto=g-imp;
  return { impuesto:`USD ${imp.toFixed(2)}`, gananciaNeta:`USD ${neto.toFixed(2)}`, interpretacion:`Sobre ganancia USD ${g}: impuesto ${a}% = USD ${imp.toFixed(2)}. Neto USD ${neto.toFixed(2)}.` };
}
