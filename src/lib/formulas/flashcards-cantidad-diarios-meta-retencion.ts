export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function flashcardsCantidadDiariosMetaRetencion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const rStr = r.toFixed(2);
  const _insight = __lang === 'en'
    ? {
        title: "Result",
        text: `Dividing **${v1}** by **${v2}** gives **${rStr}** — the daily flashcard count you need to hit your retention goal on time.`,
        tone: "neutral",
        icon: "🗂️",
      }
    : {
        title: "Resultado",
        text: `Dividir **${v1}** entre **${v2}** da **${rStr}** — la cantidad de flashcards por día que necesitás para alcanzar tu meta de retención a tiempo.`,
        tone: "neutral",
        icon: "🗂️",
      };
  return { resultado:rStr, resumen, _insight };
}
