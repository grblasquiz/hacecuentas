export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function pelajeCaidaPerroTemporadaCepillar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const rFmt = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Calculation: ${v1} × ${v2} / 10 = ${rFmt}.`
    : `Cálculo: ${v1} × ${v2} / 10 = ${rFmt}.`;
  const _insight = {
    title: __lang === 'en' ? 'Brushing during shedding' : 'Cepillado en la muda',
    text: __lang === 'en'
      ? `The estimate suggests around **${rFmt}** brushing sessions a week during the shedding season. Staying consistent removes loose hair before it ends up all over the house.`
      : `La estimación sugiere unas **${rFmt}** sesiones de cepillado por semana durante la temporada de muda. Mantener la constancia saca el pelo suelto antes de que termine por toda la casa.`,
    tone: 'neutral',
    icon: '🐕',
  };
  return { resultado:rFmt, resumen, _insight };
}
