export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function horasPractica10000MaestriaGladwell(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} / ${v2} = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} / ${v2} = ${r.toFixed(2)}.`;
  const _insight = __lang === 'en'
    ? {
        title: 'Your result',
        text: `The calculation gives **${r.toFixed(2)}** (${v1} ÷ ${v2}). Remember the "10,000-hour rule" is a popularized rule of thumb: what really moves the needle is **deliberate practice** (focused, with feedback), not just clocking hours.`,
        tone: 'neutral' as const,
        icon: '🎯',
      }
    : {
        title: 'Tu resultado',
        text: `El cálculo da **${r.toFixed(2)}** (${v1} ÷ ${v2}). Acordate que la "regla de las 10.000 horas" es una aproximación divulgativa: lo que mueve la aguja es la **práctica deliberada** (enfocada y con feedback), no sólo acumular horas.`,
        tone: 'neutral' as const,
        icon: '🎯',
      };
  return { resultado:r.toFixed(2), resumen, _insight };
}
