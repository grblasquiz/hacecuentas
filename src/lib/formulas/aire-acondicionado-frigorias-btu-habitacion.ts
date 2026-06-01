export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aireAcondicionadoFrigoriasBtuHabitacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} = ${r.toFixed(2)}.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Result',
        text: `Multiplying **${v1} × ${v2}** gives **${r.toFixed(2)}**. As a rule of thumb for room cooling, allow roughly 100 frigorías per m²; in hot climates or top-floor rooms, bump that up.`,
        tone: 'neutral',
        icon: '❄️',
      }
    : {
        title: 'Resultado',
        text: `Multiplicando **${v1} × ${v2}** da **${r.toFixed(2)}**. Como regla práctica para enfriar un ambiente, calculá unas 100 frigorías por m²; en climas calurosos o último piso, subí ese número.`,
        tone: 'neutral',
        icon: '❄️',
      };
  return { resultado:r.toFixed(2), resumen, _insight };
}
