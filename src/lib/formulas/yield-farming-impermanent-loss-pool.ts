export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function yieldFarmingImpermanentLossPool(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const p=Number(i.cambioPrecio)||0; const r=1+p/100;
  const il=(2*Math.sqrt(r)/(1+r)-1)*100;
  const ilAbs = Math.abs(il);
  const interpretacion = __lang === 'en'
    ? `If a token changes ${p>0?'+':''}${p}%: IL of ${il.toFixed(2)}% vs HODL. Compare it with fees earned.`
    : `Si un token cambia ${p>0?'+':''}${p}%: IL de ${il.toFixed(2)}% vs HODL. Comparalo con fees ganados.`;
  const tone = ilAbs >= 2 ? 'warn' : 'neutral';
  const text = __lang === 'en'
    ? (ilAbs >= 2
        ? `A **${p>0?'+':''}${p}%** move triggers **${ilAbs.toFixed(2)}% impermanent loss** vs just holding. The fees you earn must beat this to come out ahead.`
        : `With a **${p>0?'+':''}${p}%** move, IL is only **${ilAbs.toFixed(2)}%** — minor. The pool fees should easily cover it.`)
    : (ilAbs >= 2
        ? `Un movimiento de **${p>0?'+':''}${p}%** genera **${ilAbs.toFixed(2)}% de pérdida impermanente** frente a solo holdear. Los fees que ganás tienen que superar esto para que te convenga.`
        : `Con un movimiento de **${p>0?'+':''}${p}%**, el IL es de apenas **${ilAbs.toFixed(2)}%** — bajo. Los fees del pool deberían cubrirlo de sobra.`);
  return {
    impermanentLoss:`${il.toFixed(2)}%`,
    interpretacion,
    _insight: {
      title: __lang === 'en' ? 'Your impermanent loss' : 'Tu pérdida impermanente',
      text,
      tone,
      icon: '💧',
    },
  };
}
