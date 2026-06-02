export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function peceraLitrosPecesCantidadM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const rFmt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${rFmt}.`
    : __lang === 'pt'
    ? `Cálculo: ${v1} × ${v2} / 10 = ${rFmt}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${rFmt}.`;
  const _insight = {
    title: __lang === 'en' ? 'Recommended fish' : __lang === 'pt' ? 'Peixes recomendados' : 'Peces recomendados',
    text: __lang === 'en'
      ? `For your tank the estimate gives **${rFmt}** fish. Going over that load stresses the filter and the oxygen level, so leave a margin.`
      : __lang === 'pt'
      ? `Para o seu aquário a estimativa dá **${rFmt}** peixes. Passar dessa carga estressa o filtro e o oxigênio, então deixe uma margem.`
      : `Para tu pecera la estimación da **${rFmt}** peces. Pasarte de esa carga estresa el filtro y el oxígeno, así que dejá un margen.`,
    tone: 'neutral',
    icon: '🐟',
  };
  return { resultado:rFmt, resumen, _insight };
}
