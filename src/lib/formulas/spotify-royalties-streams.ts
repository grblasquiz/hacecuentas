/** Spotify Royalties Streams */
export interface Inputs { streamsAnuales: number; tier: string; comisionDistribuidor: number; }
export interface Outputs { rate: string; ingresoBruto: string; comision: string; neto: string; _insight?: any; _chart?: any; }

export function spotifyRoyaltiesStreams(i: Inputs): Outputs {
  const s = Number(i.streamsAnuales);
  const t = String(i.tier);
  const com = Number(i.comisionDistribuidor) || 0;
  if (s < 0) throw new Error('Streams inválidos');
  const rates: Record<string, number> = {
    'Tier 1 (EEUU, UK, Alemania)': 0.0045,
    'Tier 2 (España, Italia, Francia)': 0.0035,
    'Tier 3 (LATAM, Brasil)': 0.0022,
    'Tier 4 (India, SEA)': 0.0010,
  };
  const rate = rates[t] || 0.003;
  const bruto = s * rate;
  const comUSD = bruto * (com / 100);
  const neto = bruto - comUSD;
  const chart = (bruto > 0 && comUSD > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto para vos', value: Number(neto.toFixed(2)) },
      { label: 'Comisión distribuidor', value: Number(comUSD.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del ingreso bruto: neto para el artista más comisión del distribuidor',
  } : undefined;
  const streamsParaUnDolar = neto > 0 ? Math.round(s / neto) : 0;
  const insight = s > 0 ? {
    title: 'Lo que dejan tus streams',
    text: com > 0
      ? `Con **${s.toLocaleString('es-AR')} streams/año** te quedan **$${neto.toFixed(2)} USD netos** tras la comisión del ${com}%. A $${rate.toFixed(4)} por reproducción, necesitás unos **${streamsParaUnDolar.toLocaleString('es-AR')} streams para juntar 1 dólar** neto.`
      : `Con **${s.toLocaleString('es-AR')} streams/año** ganás **$${neto.toFixed(2)} USD**. A $${rate.toFixed(4)} por reproducción, hacen falta unos **${streamsParaUnDolar.toLocaleString('es-AR')} streams por cada dólar**.`,
    tone: 'warn' as const,
    icon: '🎧',
  } : undefined;
  return {
    rate: `$${rate.toFixed(4)} USD por stream`,
    ingresoBruto: `$${bruto.toFixed(2)} USD/año`,
    comision: `$${comUSD.toFixed(2)} USD (${com}% del distribuidor)`,
    neto: `$${neto.toFixed(2)} USD/año`,
    _insight: insight,
    _chart: chart,
  };
}
