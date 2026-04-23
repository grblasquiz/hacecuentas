/** Presión atmosférica barométrica (ICAO Standard Atmosphere)
 *  P(h) = P0 × (1 − L·h / T0)^(g·M / (R·L))
 *  con L=0.0065 K/m, T0=288.15 K, exponente ≈ 5.255
 */
export interface Inputs {
  altitud: number; // metros sobre el nivel del mar
  presionMar?: number; // hPa (default 1013.25)
}
export interface Outputs {
  presion: string;
  presionMmHg: string;
  porcentajeVsMar: string;
  temperaturaEstandar: string;
  categoria: string;
}

export function presionAtmosfericaAltitud(i: Inputs): Outputs {
  const h = Number(i.altitud);
  if (isNaN(h) || h < -500 || h > 20000) {
    throw new Error('Altitud fuera de rango (-500 a 20000 m)');
  }
  const P0 = Number(i.presionMar ?? 1013.25);
  if (P0 <= 500 || P0 > 1100) throw new Error('Presión a nivel del mar fuera de rango (500–1100 hPa)');

  const L = 0.0065; // K/m
  const T0 = 288.15; // K (15°C)
  const exp = 5.255;

  const ratio = 1 - (L * h) / T0;
  const P = P0 * Math.pow(ratio, exp);
  const T = T0 - L * h; // temperatura estándar a esa altitud en K

  let categoria = '';
  if (h <= 0) categoria = 'Nivel del mar / bajo nivel';
  else if (h < 1000) categoria = 'Baja altura';
  else if (h < 2500) categoria = 'Altitud media (posible fatiga leve)';
  else if (h < 3500) categoria = 'Altura (riesgo de mal de altura leve)';
  else if (h < 5000) categoria = 'Altura muy alta (mal de altura frecuente)';
  else categoria = 'Altura extrema (zona de la muerte en >8000 m)';

  const mmHg = P * 0.750062;
  const pct = (P / P0) * 100;

  return {
    presion: `${P.toFixed(2)} hPa (mbar)`,
    presionMmHg: `${mmHg.toFixed(1)} mmHg`,
    porcentajeVsMar: `${pct.toFixed(1)} % de la presión al nivel del mar`,
    temperaturaEstandar: `${(T - 273.15).toFixed(1)} °C (atmósfera estándar)`,
    categoria,
  };
}
