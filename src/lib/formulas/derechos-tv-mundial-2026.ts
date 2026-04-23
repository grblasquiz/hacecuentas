/** Costo estimado de derechos TV Mundial 2026 por país */
export interface Inputs {
  pais: string; // 'ar' | 'es' | 'mx' | 'br' | 'us' | 'uk' | 'de' | 'fr' | 'it'
  plataforma: string; // 'abierta' | 'cable' | 'streaming' | 'combinada'
  anosContrato: number;
}

export interface Outputs {
  costoAnual: number;
  costoTotal: number;
  costoPorPartido: number;
  moneda: string;
  poblacionAproxMillones: number;
  costoPerCapita: number;
  resumen: string;
}

// Estimaciones públicas 2025-2026 (USD o EUR según país) para ciclo mundial
// Contratos Mundial 2026 FIFA · reports Deloitte / Kantar
const DERECHOS: Record<string, { moneda: string; montoAnualUSD: number; poblMill: number; nombrePais: string }> = {
  ar: { moneda: 'USD', montoAnualUSD: 120_000_000, poblMill: 46, nombrePais: 'Argentina (DirecTV + TyC Sports)' },
  es: { moneda: 'EUR', montoAnualUSD: 180_000_000, poblMill: 48, nombrePais: 'España (Mediaset + TVE)' },
  mx: { moneda: 'USD', montoAnualUSD: 250_000_000, poblMill: 130, nombrePais: 'México (Televisa + TUDN)' },
  br: { moneda: 'BRL', montoAnualUSD: 280_000_000, poblMill: 215, nombrePais: 'Brasil (Globo)' },
  us: { moneda: 'USD', montoAnualUSD: 1_000_000_000, poblMill: 335, nombrePais: 'EE.UU. (Fox + Telemundo)' },
  uk: { moneda: 'GBP', montoAnualUSD: 210_000_000, poblMill: 67, nombrePais: 'Reino Unido (BBC + ITV)' },
  de: { moneda: 'EUR', montoAnualUSD: 240_000_000, poblMill: 84, nombrePais: 'Alemania (ARD + ZDF)' },
  fr: { moneda: 'EUR', montoAnualUSD: 220_000_000, poblMill: 68, nombrePais: 'Francia (TF1 + beIN)' },
  it: { moneda: 'EUR', montoAnualUSD: 170_000_000, poblMill: 59, nombrePais: 'Italia (Rai + Mediaset)' },
};

const MULT_PLAT: Record<string, number> = {
  abierta: 0.85,
  cable: 1.0,
  streaming: 1.2,
  combinada: 1.35,
};

export function derechosTvMundial2026(i: Inputs): Outputs {
  const pais = String(i.pais || 'ar');
  const plat = String(i.plataforma || 'combinada');
  const anos = Math.max(1, Number(i.anosContrato) || 1);

  const info = DERECHOS[pais] || DERECHOS.ar;
  const costoAnual = info.montoAnualUSD * (MULT_PLAT[plat] || 1);
  const costoTotal = costoAnual * anos;
  const partidosMundial = 104; // Mundial 2026 tiene 104 partidos (32 → 48 equipos)
  const costoPorPartido = costoAnual / partidosMundial;
  const perCapita = costoAnual / (info.poblMill * 1_000_000);

  return {
    costoAnual: Math.round(costoAnual),
    costoTotal: Math.round(costoTotal),
    costoPorPartido: Math.round(costoPorPartido),
    moneda: info.moneda,
    poblacionAproxMillones: info.poblMill,
    costoPerCapita: Number(perCapita.toFixed(2)),
    resumen: `${info.nombrePais}: derechos Mundial 2026 ~**${(costoAnual / 1e6).toFixed(1)} M ${info.moneda}/año** (${Math.round(costoPorPartido / 1e3)}k por partido · ${perCapita.toFixed(2)} ${info.moneda}/habitante).`,
  };
}
