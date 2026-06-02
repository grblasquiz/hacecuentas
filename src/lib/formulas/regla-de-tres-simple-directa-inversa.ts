export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function reglaDeTresSimpleDirectaInversa(i: Inputs): Outputs {
  const modo=String(i.modo||'dir'); const a=Number(i.a)||0; const b=Number(i.b)||0; const c=Number(i.c)||0;
  if (a===0) return { x:'—', resumen:'División por cero.' };
  const x=modo==='dir'?(b*c/a):(a*b/c);
  const fmt=(n:number)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(Number(n.toFixed(2)));
  const directa = modo==='dir';
  const _insight = {
    title: directa ? 'Proporción directa' : 'Proporción inversa',
    text: directa
      ? `Manteniendo la proporción **${fmt(a)} → ${fmt(b)}**, a **${fmt(c)}** le corresponde **${fmt(x)}**. Las dos magnitudes crecen y decrecen juntas.`
      : `En proporción inversa, cuando una pasa de **${fmt(a)}** a **${fmt(c)}**, la otra va de **${fmt(b)}** a **${fmt(x)}**: el producto se mantiene constante (${fmt(a*b)}).`,
    tone: 'neutral',
    icon: directa ? '📈' : '🔁',
  };
  return { x:x.toFixed(2), resumen:`Resultado: ${x.toFixed(2)}.`, _insight };
}
