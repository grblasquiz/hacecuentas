export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function cerramientoPerimetroCasaLadrillosCosto(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const rFmt = r.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR', { maximumFractionDigits: 2 });
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Your result' : 'Tu resultado',
    text: __lang === 'en'
      ? `Multiplying **${v1.toLocaleString('en-US')}** by **${v2.toLocaleString('en-US')}** gives **${rFmt}**. Adjust either value to see how the result scales proportionally.`
      : `Multiplicando **${v1.toLocaleString('es-AR')}** por **${v2.toLocaleString('es-AR')}** obtenés **${rFmt}**. Cambiá cualquiera de los dos valores para ver cómo escala el resultado en forma proporcional.`,
    tone: 'neutral',
    icon: '🧱',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
