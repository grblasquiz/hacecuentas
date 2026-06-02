export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function duolingoTiempoDiaNivelMcerProgreso(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumenStr = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;

  const rTxt = r.toFixed(2);
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Dividing **${v1}** by **${v2}** gives **${rTxt}**.`
      : `Al dividir **${v1}** entre **${v2}** obtenés **${rTxt}**.`,
    tone: 'neutral' as const,
    icon: '🦉',
  };

  return { resultado:r.toFixed(2), resumen:resumenStr, _insight };
}
