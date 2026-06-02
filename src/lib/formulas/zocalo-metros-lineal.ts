export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function zocaloMetrosLineal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const L = Number(i.largo) || 0; const A = Number(i.ancho) || 0; const p = Number(i.puertas) || 0;
  const m = 2 * (L + A) - p;
  const total = m * 1.08;
  const var_ = Math.ceil(total / 2.4);
  const merma = total - m;
  const resumen = __lang === 'en'
    ? `${m.toFixed(1)} linear m of baseboard = ${var_} bars of 2.4 m.`
    : `${m.toFixed(1)} m lineales de zócalo = ${var_} varillas de 2.4 m.`;
  const insight = __lang === 'en'
    ? { title: 'Buy with margin', text: `You need **${m.toFixed(1)} linear m** of baseboard; with the standard 8% waste that's **${total.toFixed(1)} m** → buy **${var_} bars** of 2.4 m. Round up: cuts and corners always waste material.`, tone: 'neutral' as const, icon: '📏' }
    : { title: 'Comprá con margen', text: `Necesitás **${m.toFixed(1)} m lineales** de zócalo; con el 8% de merma estándar son **${total.toFixed(1)} m** → comprá **${var_} varillas** de 2.4 m. Redondeá para arriba: los cortes y esquinas siempre desperdician material.`, tone: 'neutral' as const, icon: '📏' };
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: __lang === 'en' ? 'Useful baseboard' : 'Zócalo útil', value: Number(m.toFixed(1)) },
      { label: __lang === 'en' ? 'Waste (8%)' : 'Merma (8%)', value: Number(merma.toFixed(1)) },
    ],
    suffix: ' m',
    centerValue: total.toFixed(1) + ' m',
    centerLabel: __lang === 'en' ? 'To buy' : 'A comprar',
    ariaLabel: __lang === 'en'
      ? `Of ${total.toFixed(1)} m to buy, ${m.toFixed(1)} m is useful baseboard and ${merma.toFixed(1)} m is waste.`
      : `De ${total.toFixed(1)} m a comprar, ${m.toFixed(1)} m es zócalo útil y ${merma.toFixed(1)} m es merma.`,
  };
  return { metrosLineales: m.toFixed(1) + ' m', varillas: var_.toString(), resumen, _insight: insight, _chart: chart };
}
