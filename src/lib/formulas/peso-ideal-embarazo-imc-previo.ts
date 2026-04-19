export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pesoIdealEmbarazoImcPrevio(i: Inputs): Outputs {
  const p=Number(i.pesoPrevio)||0; const h=Number(i.alturaMts)||0; const g=String(i.gemelar||'no')==='si';
  if (h===0) return { imcPrevio:'—', rangoKg:'—', semanal:'—', resumen:'Falta altura.' };
  const imc=p/(h*h);
  let r:[number,number];
  if (imc<18.5) r=[12.5,18]; else if (imc<25) r=[11.5,16]; else if (imc<30) r=[7,11.5]; else r=[5,9];
  if (g) r=[r[0]+5,r[1]+10];
  return { imcPrevio:imc.toFixed(1), rangoKg:`${r[0]}-${r[1]} kg`, semanal:`${(r[0]/26).toFixed(2)}-${(r[1]/26).toFixed(2)} kg/sem`, resumen:`IMC ${imc.toFixed(1)}${g?' gemelar':''}: ganar ${r[0]}-${r[1]} kg total.` };
}
