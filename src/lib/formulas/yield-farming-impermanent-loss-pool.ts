export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function yieldFarmingImpermanentLossPool(i: Inputs): Outputs {
  const p=Number(i.cambioPrecio)||0; const r=1+p/100;
  const il=(2*Math.sqrt(r)/(1+r)-1)*100;
  return { impermanentLoss:`${il.toFixed(2)}%`, interpretacion:`Si un token cambia ${p>0?'+':''}${p}%: IL de ${il.toFixed(2)}% vs HODL. Comparalo con fees ganados.` };
}
