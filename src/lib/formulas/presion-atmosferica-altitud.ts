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
  _insight?: any;
  _chart?: any;
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

  // Insight: a mayor altitud, menos presión y menos oxígeno disponible
  const altoRiesgo = h >= 3500;
  const tone = altoRiesgo ? 'warn' : (h >= 1000 ? 'neutral' : 'good');
  const icon = h >= 5000 ? '⛰️' : (h >= 2500 ? '🏔️' : (h >= 1000 ? '🗻' : '🌊'));
  const insight = {
    title: 'Qué significa tu resultado',
    text: `A **${h.toLocaleString('es-AR')} m** la presión es de **${P.toFixed(0)} hPa**, un **${pct.toFixed(1)}%** de la del nivel del mar: hay menos oxígeno por respiración. Clasificación: **${categoria}**.${altoRiesgo ? ' Aclimatación gradual y atención a síntomas de mal de altura.' : ''}`,
    tone,
    icon,
  };

  // Gauge sobre la altitud con las zonas fisiológicas
  const chart = {
    type: 'scale' as const,
    marker: h,
    markerLabel: `${h.toLocaleString('es-AR')} m`,
    min: Math.min(0, h),
    segments: [
      { nombre: 'Baja', max: 1000, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Media', max: 2500, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Altura', max: 3500, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy alta', max: 5000, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Extrema', max: Math.max(8849, h + 500), color: '#d4a0a8', colorDark: '#7f1d1d' },
    ],
    unit: 'm',
    ariaLabel: `Altitud de ${h} metros sobre el nivel del mar: zona ${categoria}.`,
  };

  return {
    presion: `${P.toFixed(2)} hPa (mbar)`,
    presionMmHg: `${mmHg.toFixed(1)} mmHg`,
    porcentajeVsMar: `${pct.toFixed(1)} % de la presión al nivel del mar`,
    temperaturaEstandar: `${(T - 273.15).toFixed(1)} °C (atmósfera estándar)`,
    categoria,
    _insight: insight,
    _chart: chart,
  };
}
