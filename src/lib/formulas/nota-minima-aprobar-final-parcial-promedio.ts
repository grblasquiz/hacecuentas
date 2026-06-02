export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function notaMinimaAprobarFinalParcialPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Dividing **${v1}** by **${v2}** gives **${r.toFixed(2)}**. Round it to your school's scale before reporting it.`
      : `Al dividir **${v1}** entre **${v2}** te da **${r.toFixed(2)}**. Redondealo a la escala de tu colegio antes de informarlo.`,
    tone: 'neutral',
    icon: '🧮',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
