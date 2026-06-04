export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calcula la sección de cable eléctrico de cobre necesaria para un circuito,
 * evaluando el criterio de caída de tensión (AEA 90364 / IEC 60364).
 *
 * v1 = corriente (amperios)
 * v2 = longitud unidireccional del cable (metros)
 * v3 = tensión nominal: "220" (monofásico) | "380" (trifásico)    — default "220"
 * v4 = caída de tensión máxima admisible en %                      — default 3
 */
export function cableElectricoSeccionAmperajeDistancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const corriente = Math.abs(Number(i.v1) || 0);    // A
  const distancia = Math.abs(Number(i.v2) || 0);    // m unidireccional
  const tension   = Number(i.v3) || 220;             // V nominales
  const maxCaida  = Math.abs(Number(i.v4) || 3);    // %

  // Conductividad del cobre a 20°C en m/(Ω·mm²) — valor IEC 60228 / AEA 90364
  const gamma = 56;

  // Validaciones
  if (corriente <= 0 || distancia <= 0) {
    const msg = __lang === 'en'
      ? 'Enter current (A) and cable length (m).'
      : 'Ingresá corriente (A) y longitud de cable (m).';
    return { resultado: '—', resumen: msg, _insight: { title: __lang === 'en' ? 'Missing data' : 'Datos incompletos', text: msg, tone: 'neutral', icon: '⚡' } };
  }

  // Caída de tensión máxima admisible en voltios
  const deltaU = tension * (maxCaida / 100);

  // Monofásico (220 V): factor 2 (ida + vuelta)
  // Trifásico  (380 V): factor √3
  const factor = tension === 380 ? Math.sqrt(3) : 2;

  // Sección teórica mínima (mm²) por criterio de caída de tensión
  const sTeor = (factor * distancia * corriente) / (gamma * deltaU);

  // Secciones comerciales normalizadas (mm²) — IEC 60228 / IRAM 2178
  const seccionesComerciales = [1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];

  // Capacidad de conducción orientativa para cobre en cañería, 30 °C (AEA 90364 tabla)
  const amperajeMax: Record<number, number> = {
    1.0:  10,
    1.5:  14,
    2.5:  21,
    4:    28,
    6:    36,
    10:   50,
    16:   68,
    25:   89,
    35:  108,
    50:  131,
    70:  162,
    95:  193,
    120: 220,
  };

  // Sección por caída de tensión: la comercial mínima que supera sTeor
  let sCaida = seccionesComerciales.find(s => s >= sTeor) ?? 120;

  // Sección por criterio térmico (ampacidad)
  let sTermica = seccionesComerciales.find(s => amperajeMax[s] >= corriente) ?? 120;

  // Sección final: la mayor entre ambos criterios
  const seccFinal = Math.max(sCaida, sTermica);

  // Calcular caída de tensión real con la sección elegida (V y %)
  const deltaVReal = (factor * distancia * corriente) / (gamma * seccFinal);
  const porcReal   = (deltaVReal / tension) * 100;

  // Térmica recomendada (valor comercial estándar, ~125% de la corriente)
  const termicaOpts = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
  const termicaRec  = termicaOpts.find(t => t >= corriente * 1.0) ?? 125;

  // Estado normativo
  const dentro = porcReal <= maxCaida;

  // ─── Mensajes ──────────────────────────────────────────────────────────────
  const tipoCircuito = tension === 380
    ? (__lang === 'en' ? 'three-phase 380 V' : 'trifásico 380 V')
    : (__lang === 'en' ? 'single-phase 220 V' : 'monofásico 220 V');

  const labelSeccion = __lang === 'en'
    ? `Required cross-section: ${seccFinal} mm²`
    : `Sección recomendada: ${seccFinal} mm²`;

  const resultado = `${seccFinal} mm²`;

  const resumen = __lang === 'en'
    ? `For ${corriente} A over ${distancia} m (${tipoCircuito}): use ${seccFinal} mm² copper cable. Actual voltage drop: ${deltaVReal.toFixed(2)} V (${porcReal.toFixed(1)}% — limit ${maxCaida}%). Recommended breaker: ${termicaRec} A.`
    : `Para ${corriente} A a ${distancia} m (${tipoCircuito}): usá cable de cobre ${seccFinal} mm². Caída real: ${deltaVReal.toFixed(2)} V (${porcReal.toFixed(1)}% — límite ${maxCaida}%). Térmica recomendada: ${termicaRec} A.`;

  // Criterio determinante
  const determinante = seccFinal === sTermica && sTermica > sCaida
    ? (__lang === 'en' ? 'thermal criterion (ampacity)' : 'criterio térmico (ampacidad)')
    : (__lang === 'en' ? 'voltage drop criterion' : 'criterio de caída de tensión');

  const tono = dentro ? 'positive' : 'warning';
  const icon = dentro ? '✅' : '⚠️';

  const insightText = __lang === 'en'
    ? `**${seccFinal} mm²** copper cable is required. The limiting factor is the **${determinante}**. Actual voltage drop: **${deltaVReal.toFixed(2)} V (${porcReal.toFixed(1)}%)** — ${dentro ? 'within' : 'exceeds'} the ${maxCaida}% limit. Theoretical minimum: ${sTeor.toFixed(2)} mm² → next commercial size: ${sCaida} mm². Thermal minimum: ${sTermica} mm². Use a **${termicaRec} A breaker**.`
    : `Se necesita cable de cobre de **${seccFinal} mm²**. El factor limitante es el **${determinante}**. Caída de tensión real: **${deltaVReal.toFixed(2)} V (${porcReal.toFixed(1)}%)** — ${dentro ? 'dentro del' : 'supera el'} límite del ${maxCaida}%. Mínimo teórico: ${sTeor.toFixed(2)} mm² → sección comercial: ${sCaida} mm². Mínimo térmico: ${sTermica} mm². Usá térmica de **${termicaRec} A**.`;

  const _insight = {
    title: labelSeccion,
    text: insightText,
    tone: tono,
    icon,
  };

  return { resultado, resumen, _insight };
}
