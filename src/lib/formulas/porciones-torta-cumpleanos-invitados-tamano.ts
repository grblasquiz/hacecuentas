export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function porcionesTortaCumpleanosInvitadosTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const rFmt = r.toFixed(2);
  const _insight = {
    title: __lang === 'en' ? 'Result' : 'Resultado',
    text: __lang === 'en'
      ? `The calculation gives **${rFmt}**. Round up so no guest is left without a slice.`
      : `El cálculo da **${rFmt}**. Redondeá para arriba así ningún invitado se queda sin porción.`,
    tone: 'neutral',
    icon: '🎂',
  };
  return { resultado:rFmt, resumen, _insight };
}
