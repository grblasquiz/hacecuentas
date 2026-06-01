export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function salarioMinimo2026Comparativa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const s=Number(i.tuSueldo)||0; const smvm=Number(i.smvm)||1;
  const m=s/smvm; const d=s-smvm; const pct=smvm>0?((s/smvm-1)*100):0;
  const percentil = d>=0
    ? (__lang==='en' ? `+${pct.toFixed(0)}% above minimum` : `+${pct.toFixed(0)}% sobre el mínimo`)
    : (__lang==='en' ? `${pct.toFixed(0)}% below minimum` : `${pct.toFixed(0)}% bajo el mínimo`);
  return { multiplo:`${m.toFixed(2)}x`, diferencia:Math.round(d), percentil };
}
