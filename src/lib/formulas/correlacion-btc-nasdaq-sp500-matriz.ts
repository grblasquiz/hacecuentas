export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function correlacionBtcNasdaqSp500Matriz(i: Inputs): Outputs {
  const m=Number(i.periodoMeses)||12;
  const cNas=m<=6?0.75:m<=12?0.65:m<=24?0.55:0.45;
  const cSp=cNas*0.85;
  const interp=cNas>0.6?'Alta correlación: BTC se mueve con tech':cNas>0.3?'Correlación media':'Baja correlación, diversifica bien';
  return { correlacionNasdaq:cNas.toFixed(2), correlacionSp500:cSp.toFixed(2), interpretacion:interp };
}
