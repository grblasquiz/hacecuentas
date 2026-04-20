export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function salarioMinimo2026Comparativa(i: Inputs): Outputs {
  const s=Number(i.tuSueldo)||0; const smvm=Number(i.smvm)||1;
  const m=s/smvm; const d=s-smvm; const pct=smvm>0?((s/smvm-1)*100):0;
  return { multiplo:`${m.toFixed(2)}x`, diferencia:Math.round(d), percentil:d>=0?`+${pct.toFixed(0)}% sobre el mínimo`:`${pct.toFixed(0)}% bajo el mínimo` };
}
