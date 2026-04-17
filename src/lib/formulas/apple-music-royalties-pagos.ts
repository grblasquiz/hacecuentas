/** Apple Music Royalties */
export interface Inputs { streamsMensuales: number; tier: string; comisionDistribuidor: number; }
export interface Outputs { rate: string; ingresoMensual: string; ingresoAnual: string; netoAnual: string; }

export function appleMusicRoyaltiesPagos(i: Inputs): Outputs {
  const sm = Number(i.streamsMensuales);
  const t = String(i.tier);
  const com = Number(i.comisionDistribuidor) || 0;
  if (sm < 0) throw new Error('Streams inválidos');
  const rates: Record<string, number> = {
    'Tier 1 (EEUU, Canadá, UK)': 0.0085,
    'Tier 2 (Europa occidental)': 0.0065,
    'Tier 3 (LATAM, Brasil)': 0.0040,
    'Tier 4 (Asia emergente)': 0.0018,
  };
  const rate = rates[t] || 0.006;
  const mensual = sm * rate;
  const anualBruto = mensual * 12;
  const netoAnual = anualBruto * (1 - com / 100);
  return {
    rate: `$${rate.toFixed(4)} USD por stream`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anualBruto.toFixed(2)} USD/año`,
    netoAnual: `$${netoAnual.toFixed(2)} USD/año (después de ${com}%)`,
  };
}
