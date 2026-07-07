export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vocabularioPalabrasActivasNivelIdioma(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Your active vocabulary is ${(r*100).toFixed(0)}% of your passive vocabulary (${v1} active vs ${v2} passive words).`
    : `Tu vocabulario activo es el ${(r*100).toFixed(0)}% del pasivo (${v1} palabras activas vs ${v2} pasivas).`;
  const pct = Math.round(r * 100);
  const _insight = {
    title: __lang === 'en' ? 'Active vocabulary ratio' : 'Proporción de vocabulario activo',
    text: __lang === 'en'
      ? `Your active words are **${r.toFixed(2)}×** your passive base (**${pct}%**). A healthy active share sits around **40–60%**: below that you understand more than you can produce.`
      : `Tus palabras activas son **${r.toFixed(2)}×** tu base pasiva (**${pct}%**). Una proporción activa sana ronda el **40–60%**: por debajo, entendés más de lo que podés producir.`,
    tone: r >= 0.4 ? 'good' : 'neutral',
    icon: '🗣️',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
