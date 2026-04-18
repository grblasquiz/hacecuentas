export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aumentoPesoEmbarazoImcSemana(i: Inputs): Outputs {
  const imc=Number(i.imc)||22; const mul=String(i.multiple||'no')==='si';
  let r:[number,number];
  if (imc<18.5) r=[12.5,18]; else if (imc<25) r=[11.5,16]; else if (imc<30) r=[7,11]; else r=[5,9];
  if (mul) { r=[r[0]+5,r[1]+5]; }
  return { rango:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/25).toFixed(2)}-${(r[1]/25).toFixed(2)} kg/sem`, resumen:`IMC ${imc} ${mul?'gemelar':''}: ${r[0]}-${r[1]}kg total.` };
}
