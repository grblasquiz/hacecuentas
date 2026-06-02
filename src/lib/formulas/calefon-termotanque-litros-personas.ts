export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function calefonTermotanqueLitrosPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2;
  const rTxt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} = ${rTxt}.`
    : `Cálculo: ${v1} × ${v2} = ${rTxt}.`;
  const insTitle = __lang === 'en' ? 'Estimated capacity' : 'Capacidad estimada';
  const insText = __lang === 'en'
    ? `Your estimate gives **${rTxt} L**: cross-check it against the tank or instant-heater spec and your household's peak simultaneous use.`
    : `Tu estimación da **${rTxt} L**: contrastala con la ficha del termotanque o calefón y el pico de uso simultáneo de tu hogar.`;
  return {
    resultado:rTxt,
    resumen,
    _insight: { title: insTitle, text: insText, tone: 'neutral', icon: '🚿' },
  };
}
