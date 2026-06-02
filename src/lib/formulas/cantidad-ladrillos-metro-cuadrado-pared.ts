export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cantidadLadrillosMetroCuadradoPared(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const base = Math.round(r);
  const conMerma = Math.ceil(r * 1.1);
  const insight = __lang === 'en'
    ? { title: 'Order with waste margin', text: `Base figure: **${base} bricks**. Always add 5–10% for breakage and corner cuts → buy **${conMerma}**. Running out mid-job means an extra delivery and possibly a batch with a different shade.`, tone: 'warn', icon: '🧱' }
    : { title: 'Comprá con merma', text: `Base: **${base} ladrillos**. Sumá siempre 5–10% por rotura y cortes en esquinas → comprá **${conMerma}**. Quedarte sin material a mitad de obra implica un flete extra y quizás un lote con tono distinto.`, tone: 'warn', icon: '🧱' };
  return { resultado:r.toFixed(2), resumen, _insight: insight };
}
