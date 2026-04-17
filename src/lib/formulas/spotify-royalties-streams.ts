/** Spotify Royalties Streams */
export interface Inputs { streamsAnuales: number; tier: string; comisionDistribuidor: number; }
export interface Outputs { rate: string; ingresoBruto: string; comision: string; neto: string; }

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
  return {
    rate: `$${rate.toFixed(4)} USD por stream`,
    ingresoBruto: `$${bruto.toFixed(2)} USD/año`,
    comision: `$${comUSD.toFixed(2)} USD (${com}% del distribuidor)`,
    neto: `$${neto.toFixed(2)} USD/año`,
  };
}
