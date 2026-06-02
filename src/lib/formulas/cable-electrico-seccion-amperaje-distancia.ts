export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cableElectricoSeccionAmperajeDistancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const rFmt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${rFmt}.`
    : `Cálculo: ${v1} × ${v2} = ${rFmt}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `With ${v1} and ${v2} the result is **${rFmt}**. Change either value to recalculate instantly.`
      : `Con ${v1} y ${v2} el resultado es **${rFmt}**. Cambiá cualquiera de los dos valores y recalculá al instante.`,
    tone: 'neutral',
    icon: '🔌',
  };
  return { resultado:rFmt, resumen, _insight };
}
