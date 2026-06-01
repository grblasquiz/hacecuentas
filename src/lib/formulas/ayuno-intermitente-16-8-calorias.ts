export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function ayunoIntermitente168Calorias(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`;
  const insight = __lang === 'en'
    ? { title: 'Your result', text: `From your values ${v1} and ${v2}, the estimate gives **${r.toFixed(1)}**. On 16:8 fasting, concentrate this into your **8-hour eating window** and prioritize protein and fiber to stay satiated.`, tone: 'neutral', icon: '🍽️' }
    : { title: 'Tu resultado', text: `Con tus valores ${v1} y ${v2}, la estimación da **${r.toFixed(1)}**. En ayuno 16:8 concentralo dentro de tu **ventana de 8 horas** y priorizá proteína y fibra para llegar saciado.`, tone: 'neutral', icon: '🍽️' };
  return { resultado:r.toFixed(1), resumen, _insight: insight };
}
