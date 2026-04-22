/** Regalías Spotify por país: streams × RPS específico → gross y neto post-distribuidor */
export interface Inputs {
  streams: number;
  pais: string; // 'US' | 'UK' | 'AR' | 'ES' | 'MX' | 'BR' | 'DE' | 'FR' | 'promedio'
  distribuidor: string; // 'distrokid' | 'cdbaby' | 'tunecore' | 'amuse' | 'directo'
  comisionSelloPct: number; // % para sello/manager (0 si no hay)
}

const RPS: Record<string, number> = {
  US: 0.0037,
  UK: 0.005,
  AR: 0.0012,
  ES: 0.0029,
  MX: 0.0015,
  BR: 0.0011,
  DE: 0.0042,
  FR: 0.0034,
  IT: 0.0031,
  CA: 0.0038,
  AU: 0.0041,
  promedio: 0.0028,
};

// Comisión distribuidor modelada como porcentaje o anualidad simplificada
const DIST_PCT: Record<string, number> = {
  distrokid: 0, // cobra flat anual, no %
  cdbaby: 9, // 9% en plan estándar
  tunecore: 0, // 0% pero flat
  amuse: 0, // free plan 0%
  directo: 0,
};

export interface Outputs {
  paisCodigo: string;
  rpsUsado: string;
  ingresoGrossUSD: string;
  comisionDistribuidorUSD: string;
  comisionSelloUSD: string;
  ingresoNetoUSD: string;
  ingresoNeto: number;
  streamsParaUSD1000: number;
}

function fmtUSD(n: number): string {
  return 'USD ' + n.toFixed(2);
}

export function regaliasSpotifyPais(i: Inputs): Outputs {
  const streams = Number(i.streams) || 0;
  const pais = (i.pais || 'promedio').toUpperCase();
  const distribuidor = (i.distribuidor || 'distrokid').toLowerCase();
  const selloPct = Number(i.comisionSelloPct) || 0;

  if (streams < 0) throw new Error('Streams inválidos');

  const rps = RPS[pais] ?? RPS.promedio;
  const gross = streams * rps;
  const comDistPct = DIST_PCT[distribuidor] ?? 0;
  const comDist = gross * (comDistPct / 100);
  const comSello = (gross - comDist) * (selloPct / 100);
  const neto = gross - comDist - comSello;
  const paraMilUSD = rps > 0 ? Math.ceil(1000 / rps) : 0;

  return {
    paisCodigo: pais,
    rpsUsado: 'USD ' + rps.toFixed(4),
    ingresoGrossUSD: fmtUSD(gross),
    comisionDistribuidorUSD: fmtUSD(comDist),
    comisionSelloUSD: fmtUSD(comSello),
    ingresoNetoUSD: fmtUSD(neto),
    ingresoNeto: Number(neto.toFixed(2)),
    streamsParaUSD1000: paraMilUSD,
  };
}
