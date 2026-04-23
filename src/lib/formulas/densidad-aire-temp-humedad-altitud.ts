/** Densidad del aire húmedo (kg/m³).
 *  ρ = (P_d / (R_d·T)) + (P_v / (R_v·T))
 *  donde R_d=287.058 J/(kg·K), R_v=461.495 J/(kg·K)
 *  P_v = RH × P_sat(T), P_sat aproximada con Tetens.
 *  P total a esa altitud se estima con barométrica ICAO.
 */
export interface Inputs {
  temperatura: number; // °C
  humedad: number; // %
  altitud: number; // m
}
export interface Outputs {
  densidad: string;
  densidadRelativa: string;
  presion: string;
  densityAltitude: string;
  comentario: string;
}

function presionSat_hPa(T_C: number): number {
  // Tetens
  return 6.1078 * Math.exp((17.27 * T_C) / (T_C + 237.3));
}

export function densidadAireTempHumedadAltitud(i: Inputs): Outputs {
  const T_C = Number(i.temperatura);
  const H = Number(i.humedad);
  const h = Number(i.altitud);
  if (isNaN(T_C) || T_C < -60 || T_C > 60) throw new Error('Temperatura fuera de rango (-60 a 60 °C)');
  if (isNaN(H) || H < 0 || H > 100) throw new Error('Humedad debe estar entre 0 y 100 %');
  if (isNaN(h) || h < -500 || h > 15000) throw new Error('Altitud fuera de rango (-500 a 15000 m)');

  const T = T_C + 273.15;

  // Presión barométrica ICAO
  const P0 = 1013.25; // hPa
  const P_hPa = P0 * Math.pow(1 - (0.0065 * h) / 288.15, 5.255);
  const P_Pa = P_hPa * 100;

  // Vapor
  const Pv_hPa = (H / 100) * presionSat_hPa(T_C);
  const Pv_Pa = Pv_hPa * 100;
  const Pd_Pa = P_Pa - Pv_Pa;

  const Rd = 287.058;
  const Rv = 461.495;

  const rho = Pd_Pa / (Rd * T) + Pv_Pa / (Rv * T);
  const rho0 = 1.225; // kg/m³ estándar
  const rel = (rho / rho0) * 100;

  // Density altitude (aprox fórmula aviación): la altitud ISA a la cual la atmósfera estándar tendría esa densidad.
  // Se usa fórmula simplificada: DA = h_ISA_equivalente
  // Con ρ conocido: T_ISA_eq = rho0 · T0^? — usamos regla de aviación:
  // DA ≈ altitud_presion + (120 × (T_real − T_ISA))
  const T_ISA = 15 - 0.00198 * h; // °F-free; en °C la pendiente es 6.5°C/km → 0.0065, pero DA rule uses ~2 °C/1000ft
  // Para consistencia usamos directamente la definición: densidad ρ en atmósfera estándar a altitud z:
  // rho(z) = rho0 × (1 − 0.0065z/288.15)^4.2561
  // Despejamos z tal que rho(z) = rho:
  const base = rho / rho0;
  let DA_m = 0;
  if (base > 0 && base < 5) {
    DA_m = (288.15 / 0.0065) * (1 - Math.pow(base, 1 / 4.2561));
  }

  let comentario = '';
  if (rel >= 100) {
    comentario = 'Aire denso: mejor sustentación para aviones, más resistencia para corredores/ciclistas, más potencia para motores atmosféricos.';
  } else if (rel >= 90) {
    comentario = 'Densidad cercana a la estándar. Rendimientos deportivos y motores sin grandes variaciones.';
  } else if (rel >= 75) {
    comentario = 'Aire enrarecido: menos resistencia aerodinámica (ideal para maratones rápidas, mal para motores atmosféricos).';
  } else {
    comentario = 'Aire muy enrarecido (altura extrema o calor extremo): baja eficiencia de motores y de sustentación aérea.';
  }

  return {
    densidad: `${rho.toFixed(4)} kg/m³`,
    densidadRelativa: `${rel.toFixed(1)} % de la densidad estándar (1.225 kg/m³)`,
    presion: `${P_hPa.toFixed(1)} hPa`,
    densityAltitude: `${DA_m.toFixed(0)} m (altitud de densidad)`,
    comentario,
  };
}
