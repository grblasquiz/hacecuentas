/** Calculadora de Tarifa Estimada de Influencer */
export interface Inputs { seguidores: number; engagement: number; plataforma: string; tipoContenido: string; }
export interface Outputs { tarifaEstimada: number; tarifaMinima: number; tarifaMaxima: number; cpe: number; }

const BASE_RATE_PER_1K: Record<string, Record<string, number>> = {
  instagram: { post: 60, reel: 80, video: 100, story: 25 },
  tiktok: { post: 50, reel: 70, video: 90, story: 20 },
  youtube: { post: 50, reel: 60, video: 150, story: 25 },
};

export function influencerTarifaEstimada(i: Inputs): Outputs {
  const seg = Number(i.seguidores);
  const er = Number(i.engagement);
  if (!seg || seg <= 0) throw new Error('Ingresá los seguidores');
  if (!er || er <= 0) throw new Error('Ingresá el engagement rate');

  const rates = BASE_RATE_PER_1K[i.plataforma];
  if (!rates) throw new Error('Seleccioná una plataforma');
  const baseRate = rates[i.tipoContenido] || rates.post;

  // Base tariff: rate per 1K followers
  let tarifa = (seg / 1000) * baseRate;

  // Engagement multiplier: higher ER = higher value
  const erMultiplier = er > 5 ? 1.5 : er > 3 ? 1.2 : er > 1.5 ? 1.0 : 0.7;
  tarifa *= erMultiplier;

  // Size tier adjustment
  if (seg > 1000000) tarifa *= 0.7; // Mega-influencers have lower per-follower rates
  else if (seg > 100000) tarifa *= 0.85;
  else if (seg < 10000) tarifa *= 1.3; // Nano/micro premium

  const tarifaMinima = Math.round(tarifa * 0.6);
  const tarifaMaxima = Math.round(tarifa * 1.5);
  const tarifaEstimada = Math.round(tarifa);

  const engagements = Math.round(seg * er / 100);
  const cpe = engagements > 0 ? tarifaEstimada / engagements : 0;

  return {
    tarifaEstimada,
    tarifaMinima,
    tarifaMaxima,
    cpe: Number(cpe.toFixed(0)),
  };
}
