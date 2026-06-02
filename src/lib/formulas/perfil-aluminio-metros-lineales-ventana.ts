export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function perfilAluminioMetrosLinealesVentana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  return {
    resultado:r.toFixed(2), resumen,
    _insight: {
      title: __lang === 'en' ? 'Your result' : 'Tu resultado',
      text: __lang === 'en'
        ? `With the values entered (**${v1}** and **${v2}**) the result is **${r.toFixed(2)}**. Round up when buying aluminium profile to leave a margin for cuts and waste.`
        : `Con los valores cargados (**${v1}** y **${v2}**) el resultado es **${r.toFixed(2)}**. Al comprar el perfil de aluminio redondeá para arriba: dejá margen para cortes y desperdicio.`,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
