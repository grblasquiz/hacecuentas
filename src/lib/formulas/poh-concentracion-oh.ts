export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function pohConcentracionOh(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const oh = Number(i.oh);
  if (!oh || oh <= 0) throw new Error(__lang === 'en' ? 'Enter [OH⁻]' : 'Ingresá [OH⁻]');
  const poh = -Math.log10(oh);
  const ph = 14 - poh;
  const nature = __lang === 'en'
    ? (ph > 7 ? 'alkaline' : 'acidic')
    : (ph > 7 ? 'alcalino' : 'ácido');
  const resumen = __lang === 'en'
    ? `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${nature}).`
    : `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${nature}).`;

  const neutral = Math.abs(ph - 7) < 0.05;
  const _insight = {
    title: __lang === 'en' ? 'Reading the solution' : 'Lectura de la solución',
    text: __lang === 'en'
      ? `From [OH⁻] you get **pOH = ${poh.toFixed(2)}**, so **pH = ${ph.toFixed(2)}** (pOH + pH = 14 at 25 °C). That puts the solution in the **${neutral ? 'neutral' : nature}** range.`
      : `A partir de [OH⁻] sale **pOH = ${poh.toFixed(2)}**, así que **pH = ${ph.toFixed(2)}** (pOH + pH = 14 a 25 °C). Eso ubica a la solución en el rango **${neutral ? 'neutro' : nature}**.`,
    tone: 'neutral',
    icon: '🧪',
  };

  const phMarker = Math.max(0, Math.min(14, ph));
  const _chart = {
    type: 'scale',
    marker: Number(phMarker.toFixed(2)),
    markerLabel: `pH ${ph.toFixed(2)}`,
    min: 0,
    segments: __lang === 'en'
      ? [
          { nombre: 'Acidic', max: 6.5, color: '#dc2626', colorDark: '#ef4444' },
          { nombre: 'Neutral', max: 7.5, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Alkaline', max: 14, color: '#2563eb', colorDark: '#3b82f6' },
        ]
      : [
          { nombre: 'Ácido', max: 6.5, color: '#dc2626', colorDark: '#ef4444' },
          { nombre: 'Neutro', max: 7.5, color: '#16a34a', colorDark: '#22c55e' },
          { nombre: 'Alcalino', max: 14, color: '#2563eb', colorDark: '#3b82f6' },
        ],
    ariaLabel: __lang === 'en' ? `pH ${ph.toFixed(2)} on the 0 to 14 scale (${nature})` : `pH ${ph.toFixed(2)} en la escala de 0 a 14 (${nature})`,
  };

  return { poh: poh.toFixed(2), ph: ph.toFixed(2), resumen, _insight, _chart };
}
