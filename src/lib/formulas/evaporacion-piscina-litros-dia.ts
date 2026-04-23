/** Evaporación de piscina en litros/día — Penman simplificada.
 *  E (mm/día) ≈ (25 + 19·v) · (es - ea) / λ (aproximación clima-piscina).
 *  Usamos una fórmula robusta y didáctica:
 *  E_mm_dia = (0.0315 + 0.0314·v) · (es - ea) · 24,
 *  donde v = m/s, es y ea en kPa; luego litros = mm × m² × 1. */
export interface Inputs {
  temperatura: number;   // °C aire
  humedad: number;       // % HR
  vientoKmh: number;     // km/h
  superficie: number;    // m²
}
export interface Outputs {
  litrosDia: string;
  litrosDiaNumero: number;
  mmDia: string;
  litrosSemana: string;
  litrosMes: string;
  mensaje: string;
}

export function evaporacionPiscinaLitrosDia(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const H = Number(i.humedad);
  const vkmh = Number(i.vientoKmh);
  const S = Number(i.superficie);
  if (!Number.isFinite(T) || T < -10 || T > 50) throw new Error('Temperatura fuera de rango.');
  if (!Number.isFinite(H) || H <= 0 || H > 100) throw new Error('Humedad fuera de rango (1-100).');
  if (!Number.isFinite(vkmh) || vkmh < 0 || vkmh > 150) throw new Error('Viento fuera de rango (0-150 km/h).');
  if (!Number.isFinite(S) || S <= 0 || S > 5000) throw new Error('Superficie fuera de rango (1-5000 m²).');

  const v = vkmh / 3.6; // m/s
  // Presión de vapor de saturación (kPa) — Tetens
  const es = 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
  const ea = es * (H / 100);
  // Fórmula estilo Rohwer / Penman simplificada (mm/día)
  let mmDia = (2.2 + 1.5 * v) * (es - ea); // coeficientes empíricos para piscinas
  if (mmDia < 0) mmDia = 0;
  const litrosDia = mmDia * S;

  return {
    litrosDia: `${litrosDia.toFixed(0)} L/día`,
    litrosDiaNumero: Number(litrosDia.toFixed(1)),
    mmDia: `${mmDia.toFixed(1)} mm/día`,
    litrosSemana: `${(litrosDia * 7).toFixed(0)} L/semana`,
    litrosMes: `${(litrosDia * 30).toFixed(0)} L/mes`,
    mensaje: `Evaporación estimada: ${mmDia.toFixed(1)} mm/día → ${litrosDia.toFixed(0)} L/día sobre ${S} m².`,
  };
}
