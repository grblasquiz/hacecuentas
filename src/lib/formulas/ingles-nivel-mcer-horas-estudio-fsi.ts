export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function inglesNivelMcerHorasEstudioFsi(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Dividing **${v1}** by **${v2}** gives **${r.toFixed(2)}**. For context, the FSI estimates roughly **600–750 hours** to reach professional English from scratch.`
      : `Dividir **${v1}** entre **${v2}** da **${r.toFixed(2)}**. Para tener una referencia, el FSI estima unas **600–750 horas** para llegar a un inglés profesional desde cero.`,
    tone: 'neutral',
    icon: '🗣️'
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
