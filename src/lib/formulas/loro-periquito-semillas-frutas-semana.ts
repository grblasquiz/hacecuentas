export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function loroPeriquitoSemillasFrutasSemana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`;
  const _insight = {
    title: __lang === 'en' ? 'Weekly ration' : 'Ración semanal',
    text: __lang === 'en'
      ? `The estimated weekly amount is **${r.toFixed(2)}**. Split it into daily portions and keep fresh fruit separate from dry seed so it doesn't spoil.`
      : `La cantidad semanal estimada es **${r.toFixed(2)}**. Dividila en porciones diarias y mantené la fruta fresca separada de la semilla seca para que no se eche a perder.`,
    tone: 'neutral',
    icon: '🦜',
  };
  return { resultado:r.toFixed(2), resumen, _insight };
}
