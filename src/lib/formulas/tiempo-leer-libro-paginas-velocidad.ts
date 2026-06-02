export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tiempoLeerLibroPaginasVelocidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const rTxt = r.toFixed(2);
  const insightText = __lang === 'en'
    ? `Reading **${v1} pages** at **${v2} per day** takes about **${rTxt} days**. Round up to a whole day to plan realistically.`
    : `Leer **${v1} páginas** a **${v2} por día** te lleva unos **${rTxt} días**. Redondeá hacia arriba para planificar con margen.`;
  return {
    resultado:rTxt, resumen,
    _insight: {
      title: __lang === 'en' ? 'What this means' : 'Qué significa',
      text: insightText, tone: 'neutral', icon: '📖',
    },
  };
}
