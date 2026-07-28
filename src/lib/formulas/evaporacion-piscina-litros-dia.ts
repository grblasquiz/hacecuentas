/** Evaporación de piscina al aire libre, en mm/día y litros/día.
 *
 *  ══ QUÉ ESTABA MAL ══════════════════════════════════════════════════════════
 *  La versión anterior calculaba  mmDia = (2,2 + 1,5·v) · (es − ea)  con v en
 *  m/s y (es − ea) en kPa. Esa expresión no corresponde a ninguna correlación
 *  publicada (el comentario del propio archivo describía DOS ecuaciones más,
 *  distintas entre sí y distintas de la implementada) y el término de viento
 *  dominaba al término base ya a 6 km/h. Daba números físicamente imposibles:
 *
 *      28 °C / 60% HR / 6 km/h   →  7,1 mm/día
 *      32 °C / 40% HR / 15 km/h  →  24,1 mm/día
 *      35 °C / 30% HR / 25 km/h  →  49,7 mm/día  ← casi 5 cm de bajada por día
 *
 *  El rango real de una pileta descubierta en verano es de 4 a 8 mm/día.
 *
 *  ══ QUÉ SE USA AHORA ════════════════════════════════════════════════════════
 *  Correlación de SHAH (2014), "Methods for Calculation of Evaporation from
 *  Swimming Pools and Other Water Surfaces", ASHRAE Transactions vol. 120 (2),
 *  paper SE-14-001. Tabla 14: para PILETA EXTERIOR DESOCUPADA se toma el MAYOR
 *  de las ecuaciones 1, 2 y 7. Es el método con menor desvío contra datos
 *  medidos (14,5% de desviación media absoluta sobre 113 puntos de 11 fuentes,
 *  contra desvíos muy superiores de Carrier/ASHRAE 2011, Rohwer, VDI, etc.).
 *
 *    Ec.1  (convección natural, empuje por diferencia de densidad):
 *          E₀ = C · (ρ_a − ρ_w)^(1/3) · (W_w − W_a),  C = 35 en SI
 *    Ec.2  (convección forzada, aire casi quieto, u ≤ 0,15 m/s):
 *          E₀ = b · (p_w − p_a),  b = 0,00005 en SI, p en Pa
 *    Ec.7  (convección forzada con viento, u > 0,15 m/s):
 *          E₀ = a · (u / b)^0,7 · (p_w − p_a),  a = 0,00005, b = 0,15 m/s
 *
 *  E₀ sale en kg/(m²·h), que sobre agua es directamente mm/h. × 24 → mm/día.
 *  Shah valida la Ec.7 contra Smith et al. (1999, mediciones sobre una pileta
 *  exterior real) y contra Meyer (1942, embalses) a velocidades mayores.
 *
 *  ══ VIENTO: DE LA ESTACIÓN METEOROLÓGICA A LA SUPERFICIE DEL AGUA ═══════════
 *  Éste es el punto que hacía explotar la fórmula vieja. El viento que informa
 *  el servicio meteorológico se mide a 10 m de altura y en terreno abierto; la
 *  velocidad que piden estas correlaciones es la del aire SOBRE EL AGUA (Smith
 *  et al. midieron a 0,30 m de la superficie, con máximo de 1,3 m/s). Una
 *  pileta de patio está rodeada de cerco, casa y árboles. Se aplica entonces un
 *  factor de abrigo sobre el viento informado, según el perfil logarítmico de
 *  capa límite y la rugosidad del entorno.
 */

/** Factor de abrigo: viento sobre el agua ÷ viento informado a 10 m. */
export const ABRIGO: Record<string, { label: string; factor: number }> = {
  expuesta: { label: 'Sin reparo (campo abierto, costa, azotea)', factor: 0.50 },
  normal: { label: 'Patio con cerco y casa alrededor', factor: 0.30 },
  protegida: { label: 'Muy protegida (muros altos, seto, galería)', factor: 0.15 },
};

/** Constantes de Shah (2014), SI. */
const SHAH_C = 35;        // Ec.1, convección natural
const SHAH_B = 0.00005;   // Ec.2 y Ec.7, coeficiente de convección forzada
const SHAH_U0 = 0.15;     // Ec.7, velocidad de referencia (m/s)

const P_ATM = 101325;     // Pa
const R_AIRE_SECO = 287.055; // J/(kg·K)

/** Presión de vapor de saturación, Pa. Tetens / Magnus sobre agua líquida. */
function presionSaturacion(tC: number): number {
  return 610.8 * Math.exp((17.27 * tC) / (tC + 237.3));
}
/** Humedad específica (kg vapor / kg aire seco). */
function humedadEspecifica(pVapor: number): number {
  return 0.62198 * pVapor / (P_ATM - pVapor);
}
/** Densidad de aire seco por unidad de volumen de aire húmedo, kg/m³ (la de las
 *  tablas psicrométricas, que es la que pide Shah). */
function densidadAire(tC: number, pVapor: number): number {
  return (P_ATM - pVapor) / (R_AIRE_SECO * (tC + 273.15));
}

export interface Inputs {
  temperatura: number;      // °C aire (promedio de 24 h)
  humedad: number;          // % HR (promedio de 24 h)
  vientoKmh: number;        // km/h informado a 10 m (promedio de 24 h)
  superficie: number;       // m²
  temperaturaAgua?: number; // °C del agua. Default: igual a la del aire.
  abrigo?: string;          // 'expuesta' | 'normal' (default) | 'protegida'
}
export interface Outputs {
  litrosDia: string;
  litrosDiaNumero: number;
  mmDia: string;
  litrosSemana: string;
  litrosMes: string;
  mecanismo: string;
  mensaje: string;
  _insight?: any;
}

export function evaporacionPiscinaLitrosDia(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const H = Number(i.humedad);
  const vkmh = Number(i.vientoKmh);
  const S = Number(i.superficie);
  const tAguaRaw = Number(i.temperaturaAgua);
  const Tw = Number.isFinite(tAguaRaw) ? tAguaRaw : T; // 0 °C es un valor legítimo
  const abrigoKey = ABRIGO[String(i.abrigo || 'normal')] ? String(i.abrigo || 'normal') : 'normal';
  const abrigo = ABRIGO[abrigoKey];

  if (!Number.isFinite(T) || T < -10 || T > 50) throw new Error('Temperatura fuera de rango.');
  if (!Number.isFinite(H) || H <= 0 || H > 100) throw new Error('Humedad fuera de rango (1-100).');
  if (!Number.isFinite(vkmh) || vkmh < 0 || vkmh > 150) throw new Error('Viento fuera de rango (0-150 km/h).');
  if (!Number.isFinite(S) || S <= 0 || S > 5000) throw new Error('Superficie fuera de rango (1-5000 m²).');
  if (Tw < 0 || Tw > 45) throw new Error('Temperatura del agua fuera de rango (0-45 °C).');

  // Viento sobre el espejo de agua (m/s)
  const u = (vkmh / 3.6) * abrigo.factor;

  // Presiones de vapor
  const pw = presionSaturacion(Tw);              // aire saturado a la temperatura del agua
  const pa = presionSaturacion(T) * (H / 100);   // vapor en el aire ambiente
  const dp = Math.max(0, pw - pa);               // Pa

  // Ec.1 — convección natural (kg/m²·h)
  const Ww = humedadEspecifica(pw);
  const Wa = humedadEspecifica(pa);
  const rhoW = densidadAire(Tw, pw);
  const rhoA = densidadAire(T, pa);
  const dRho = rhoA - rhoW;
  const e1 = dRho > 0 ? SHAH_C * Math.cbrt(dRho) * Math.max(0, Ww - Wa) : 0;

  // Ec.2 — convección forzada con aire casi quieto (kg/m²·h)
  const e2 = SHAH_B * dp;

  // Ec.7 — convección forzada con viento (kg/m²·h)
  const e7 = u > SHAH_U0 ? SHAH_B * Math.pow(u / SHAH_U0, 0.7) * dp : 0;

  const eHora = Math.max(e1, e2, e7);
  const mecanismo = eHora === e1 && e1 > 0
    ? 'convección natural (aire quieto; manda la diferencia de densidad agua-aire)'
    : eHora === e7
      ? 'convección forzada por viento'
      : 'convección forzada con aire casi quieto';

  const mmDia = eHora * 24;                      // 1 kg/m² de agua = 1 mm
  const litrosDia = mmDia * S;
  const litrosMes = litrosDia * 30;

  const fmtL = (n: number) => Math.round(n).toLocaleString('es-AR');
  const notaPromedio = 'Ojo con los datos que cargás: la cuenta es un promedio de 24 horas. Si ponés la temperatura y el viento del pico de la tarde, el resultado va a salir muy por encima de lo que baja el nivel en un día real, porque de noche refresca, sube la humedad y la evaporación casi se frena.';

  const _insight = (() => {
    if (mmDia >= 12) {
      return {
        title: 'Evaporación muy alta',
        text: `Con ${T}°C, ${H}% de humedad y viento de ${vkmh} km/h sostenidos, la cuenta da **${fmtL(litrosDia)} L/día** (**${mmDia.toFixed(1)} mm**). Es un valor extremo: una pileta descubierta en verano pierde típicamente entre 4 y 8 mm por día. ${notaPromedio}`,
        tone: 'warn',
        icon: '💦',
      };
    }
    if (mmDia >= 6) {
      return {
        title: 'Evaporación alta',
        text: `Con ${T}°C, ${H}% de humedad y viento de ${vkmh} km/h, tu piscina pierde **${fmtL(litrosDia)} L/día** (**${mmDia.toFixed(1)} mm**) — unos **${fmtL(litrosMes)} L/mes**. Una manta o cobertor puede recortar gran parte de esa pérdida. ${notaPromedio}`,
        tone: 'warn',
        icon: '💦',
      };
    }
    return {
      title: 'Evaporación moderada',
      text: `En estas condiciones tu piscina pierde **${fmtL(litrosDia)} L/día** (**${mmDia.toFixed(1)} mm**), unos **${fmtL(litrosMes)} L/mes**. Es la reposición que vas a necesitar para mantener el nivel. ${notaPromedio}`,
      tone: 'neutral',
      icon: '💦',
    };
  })();

  return {
    litrosDia: `${litrosDia.toFixed(0)} L/día`,
    litrosDiaNumero: Number(litrosDia.toFixed(1)),
    mmDia: `${mmDia.toFixed(1)} mm/día`,
    litrosSemana: `${(litrosDia * 7).toFixed(0)} L/semana`,
    litrosMes: `${litrosMes.toFixed(0)} L/mes`,
    mecanismo,
    mensaje: `Evaporación estimada: ${mmDia.toFixed(1)} mm/día → ${litrosDia.toFixed(0)} L/día sobre ${S} m². Método Shah (2014) para pileta exterior desocupada; manda la ${mecanismo}. Viento sobre el agua: ${u.toFixed(2)} m/s (${abrigo.label.toLowerCase()}).`,
    _insight,
  };
}
