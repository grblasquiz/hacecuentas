/** Costo anual abono temporada Bundesliga vs Premier League */
export interface Inputs {
  liga: string; // 'bundesliga' | 'premier' | 'laliga' | 'serie-a' | 'ligue1'
  categoriaClub: string; // 'top' | 'medio' | 'chico'
  ubicacionAsiento: string; // 'popular' | 'tribuna' | 'platea' | 'vip'
  partidosLocal: number;
  viajesAway: number; // cuántos partidos away agregar
}

export interface Outputs {
  costoAbono: number;
  costoPorPartido: number;
  monedaLiga: string;
  costoAbonoARS: number;
  costoViajes: number;
  costoTotal: number;
  resumen: string;
}

// Rangos estimados 2025-2026 por liga y categoría (precio medio tribuna central)
// Valores base en moneda local anual
const ABONOS: Record<string, { moneda: string; cotizARS: number; top: [number, number]; medio: [number, number]; chico: [number, number] }> = {
  bundesliga: { moneda: 'EUR', cotizARS: 1300, top: [450, 700], medio: [320, 500], chico: [200, 350] },
  premier: { moneda: 'GBP', cotizARS: 1520, top: [900, 2000], medio: [650, 1100], chico: [400, 700] },
  laliga: { moneda: 'EUR', cotizARS: 1300, top: [600, 1200], medio: [400, 750], chico: [250, 500] },
  'serie-a': { moneda: 'EUR', cotizARS: 1300, top: [500, 900], medio: [350, 600], chico: [220, 400] },
  ligue1: { moneda: 'EUR', cotizARS: 1300, top: [550, 1000], medio: [380, 650], chico: [230, 450] },
};

const MULT_UBIC: Record<string, number> = {
  popular: 0.7,
  tribuna: 1.0,
  platea: 1.35,
  vip: 2.6,
};

export function costoAbonoBundesligaPremier(i: Inputs): Outputs {
  const liga = String(i.liga || 'bundesliga');
  const cat = String(i.categoriaClub || 'medio');
  const ubic = String(i.ubicacionAsiento || 'tribuna');
  const partidos = Math.max(1, Number(i.partidosLocal) || 17);
  const away = Math.max(0, Number(i.viajesAway) || 0);

  const info = ABONOS[liga] || ABONOS.bundesliga;
  const rango = (info as any)[cat] || info.medio;
  const base = (rango[0] + rango[1]) / 2;
  const costoAbono = base * (MULT_UBIC[ubic] || 1);
  const costoPorPartido = costoAbono / partidos;
  const costoViajes = away * costoPorPartido * 1.8; // away sale ~80% más caro promedio
  const costoTotal = costoAbono + costoViajes;
  const costoAbonoARS = costoAbono * info.cotizARS;

  return {
    costoAbono: Math.round(costoAbono),
    costoPorPartido: Math.round(costoPorPartido),
    monedaLiga: info.moneda,
    costoAbonoARS: Math.round(costoAbonoARS),
    costoViajes: Math.round(costoViajes),
    costoTotal: Math.round(costoTotal),
    resumen: `Abono temporada en ${liga} club ${cat}, sector ${ubic}: **${Math.round(costoAbono)} ${info.moneda}** (~${Math.round(costoPorPartido)} ${info.moneda}/partido). Con ${away} viajes away: **${Math.round(costoTotal)} ${info.moneda}**.`,
  };
}
