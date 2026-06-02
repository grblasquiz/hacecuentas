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
  _insight?: any;
  _chart?: any;
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

  const rAbono = Math.round(costoAbono);
  const rPartido = Math.round(costoPorPartido);
  const rViajes = Math.round(costoViajes);
  const rTotal = Math.round(costoTotal);

  // El abono medio europeo de tribuna ronda 20-35 €/partido; arriba de eso es caro.
  const tone = rPartido >= 35 ? 'warn' : rPartido <= 18 ? 'good' : 'neutral';
  const _insight = {
    title: 'Cuánto pagás por entrar a cada partido',
    text:
      `Sale a **${rPartido} ${info.moneda}/partido** repartiendo el abono entre ${partidos} encuentros de local. ` +
      (rPartido >= 35
        ? `Es un precio premium: a ese ritmo, abonarse sólo conviene si vas a la mayoría de los partidos.`
        : rPartido <= 18
          ? `Es una relación muy buena frente a comprar entradas sueltas, que casi siempre salen más caras.`
          : `Es un valor de mercado típico para tribuna; comprar suelto cada fecha saldría bastante más.`) +
      (away > 0 ? ` Los **${away}** viajes away suman **${rViajes} ${info.moneda}** extra.` : ''),
    tone,
    icon: '⚽',
  };

  const _chart = away > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Abono (de local)', value: rAbono },
          { label: `Viajes away (${away})`, value: rViajes },
        ],
        prefix: info.moneda === 'GBP' ? '£' : '€',
        centerValue: `${rAbono + rViajes} ${info.moneda}`,
        centerLabel: 'Total temporada',
        ariaLabel: `Reparto del costo de temporada de ${rAbono + rViajes} ${info.moneda} entre abono de local y ${away} viajes away`,
      }
    : undefined;

  return {
    costoAbono: rAbono,
    costoPorPartido: rPartido,
    monedaLiga: info.moneda,
    costoAbonoARS: Math.round(costoAbonoARS),
    costoViajes: rViajes,
    costoTotal: rTotal,
    resumen: `Abono temporada en ${liga} club ${cat}, sector ${ubic}: **${rAbono} ${info.moneda}** (~${rPartido} ${info.moneda}/partido). Con ${away} viajes away: **${rTotal} ${info.moneda}**.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
