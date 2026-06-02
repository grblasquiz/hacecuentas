/**
 * Calculadora "Tu sueldo vs promedio argentino".
 *
 * Compara el sueldo bruto del usuario contra:
 *   - RIPTE último mes (Subsec. Seguridad Social — Min. Trabajo)
 *   - Equivalente en USD blue
 *   - Histórico anual del salario promedio (cuándo el promedio AR cobraba lo mismo)
 *
 * Fuente RIPTE: datos.gob.ar (cron diario en .github/workflows/).
 * Dataset completo descargable: /datasets/sueldo-real-argentino-2026-02.json
 */

// Última actualización: refresco mensual cuando se publique nuevo RIPTE.
// Cuando se actualice, bumpear lastReviewed en el .json del calc.
const RIPTE_BASE_MONTH = '2026-02';
const RIPTE_NOMINAL = 1734357.18; // ARS promedio mensual feb 2026
const USD_BLUE_PROMEDIO_MES = 1437.06; // Cotización blue promedio feb 2026 (RIPTE/USD)
const RIPTE_USD_BLUE = 1207.21; // RIPTE expresado en USD blue feb 2026
const RIPTE_USD_OFICIAL = 1216.62;

// Serie histórica anual (último mes diciembre, o último disponible) para lookup
// "tu sueldo equivale al promedio AR de qué año". Pesos NOMINALES de cada mes —
// el cálculo deflactará al usuario contra estos valores ajustados por IPC.
// Mantener ordenado de más viejo a más nuevo.
const RIPTE_HISTORIA_ANUAL: Array<{ year: number; nominal: number; real_pesos_actuales: number }> = [
  { year: 1994, nominal: 1019, real_pesos_actuales: 642000 },
  { year: 2001, nominal: 1219, real_pesos_actuales: 637000 },
  { year: 2007, nominal: 2398, real_pesos_actuales: 1280000 },
  { year: 2011, nominal: 5042, real_pesos_actuales: 1690000 },
  { year: 2015, nominal: 16077, real_pesos_actuales: 2247000 },
  { year: 2017, nominal: 27326, real_pesos_actuales: 2253000 },
  { year: 2019, nominal: 58000, real_pesos_actuales: 1867000 },
  { year: 2021, nominal: 105000, real_pesos_actuales: 1786000 },
  { year: 2023, nominal: 510000, real_pesos_actuales: 1700000 },
  { year: 2025, nominal: 1633547, real_pesos_actuales: 1633547 },
  { year: 2026, nominal: RIPTE_NOMINAL, real_pesos_actuales: RIPTE_NOMINAL },
];

export interface SueldoVsPromedioInputs {
  sueldoBruto: number;
}

export interface SueldoVsPromedioOutputs {
  vsPromedioPct: number;
  tuUsdBlue: number;
  diferenciaArs: number;
  equivalenteHistorico: string;
  posicionamiento: string;
  fuenteFecha: string;
  _insight?: any;
  _chart?: any;
}

export function sueldoVsPromedioArgentino(
  inputs: SueldoVsPromedioInputs
): SueldoVsPromedioOutputs {
  const sueldoBruto = Number(inputs.sueldoBruto);
  if (!sueldoBruto || sueldoBruto <= 0) {
    throw new Error('Ingresá tu sueldo bruto mensual');
  }

  const diferenciaArs = sueldoBruto - RIPTE_NOMINAL;
  const vsPromedioPct = (sueldoBruto / RIPTE_NOMINAL - 1) * 100;
  const tuUsdBlue = sueldoBruto / USD_BLUE_PROMEDIO_MES;

  // Lookup histórico: en qué año el promedio AR (real, en pesos actuales)
  // estaba más cerca del sueldo bruto del usuario.
  let bestYear = RIPTE_HISTORIA_ANUAL[RIPTE_HISTORIA_ANUAL.length - 1];
  let minDiff = Math.abs(bestYear.real_pesos_actuales - sueldoBruto);
  for (const entry of RIPTE_HISTORIA_ANUAL) {
    const diff = Math.abs(entry.real_pesos_actuales - sueldoBruto);
    if (diff < minDiff) {
      minDiff = diff;
      bestYear = entry;
    }
  }

  const equivalenteHistorico =
    bestYear.year === 2026
      ? 'Es similar al promedio actual'
      : `Cobrás lo mismo que el argentino promedio de ${bestYear.year}`;

  let posicionamiento: string;
  if (vsPromedioPct >= 100) {
    posicionamiento = `Tu sueldo es ${vsPromedioPct.toFixed(0)}% mayor al promedio argentino — estás bien arriba`;
  } else if (vsPromedioPct >= 30) {
    posicionamiento = `Estás ${vsPromedioPct.toFixed(0)}% por encima del promedio — buen nivel salarial`;
  } else if (vsPromedioPct >= 5) {
    posicionamiento = `Estás un poco arriba del promedio (${vsPromedioPct.toFixed(0)}% más)`;
  } else if (vsPromedioPct >= -5) {
    posicionamiento = 'Tu sueldo está alineado con el promedio argentino';
  } else if (vsPromedioPct >= -30) {
    posicionamiento = `Tu sueldo está ${Math.abs(vsPromedioPct).toFixed(0)}% por debajo del promedio`;
  } else {
    posicionamiento = `Tu sueldo está bastante por debajo del promedio (-${Math.abs(vsPromedioPct).toFixed(0)}%)`;
  }

  // Tono dinámico según posición vs promedio
  const tone = vsPromedioPct >= 5 ? 'good' : vsPromedioPct >= -5 ? 'neutral' : 'warn';
  const arriba = diferenciaArs >= 0;
  const insight = {
    title: 'Tu lugar en la pirámide salarial',
    text: `Tu bruto está **${Math.abs(Math.round(vsPromedioPct))}% ${arriba ? 'por encima' : 'por debajo'}** del promedio argentino (RIPTE $${Math.round(RIPTE_NOMINAL).toLocaleString('es-AR')}): ${arriba ? 'ganás' : 'te faltan'} **$${Math.abs(Math.round(diferenciaArs)).toLocaleString('es-AR')}** ${arriba ? 'más' : 'para llegar al promedio'}. En dólar blue equivale a **US$${Math.round(tuUsdBlue).toLocaleString('es-AR')}** por mes.`,
    tone,
    icon: arriba ? '📈' : '📉',
  };

  // Gauge: posición relativa al promedio (100% = exactamente el promedio)
  const pctDelProm = (sueldoBruto / RIPTE_NOMINAL) * 100;
  const markerPos = Math.round(pctDelProm);
  const topMax = Math.max(220, markerPos + 20);
  const chart = {
    type: 'scale' as const,
    marker: markerPos,
    markerLabel: 'Tu sueldo',
    min: 0,
    segments: [
      { nombre: 'Por debajo', max: 70, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'En torno al promedio', max: 130, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Por encima', max: 200, color: '#10b981', colorDark: '#059669' },
      { nombre: 'Muy por encima', max: topMax, color: '#059669', colorDark: '#047857' },
    ],
    ariaLabel: `Tu sueldo es el ${markerPos}% del promedio argentino (100% = promedio).`,
  };

  return {
    vsPromedioPct: Math.round(vsPromedioPct * 10) / 10,
    tuUsdBlue: Math.round(tuUsdBlue),
    diferenciaArs: Math.round(diferenciaArs),
    equivalenteHistorico,
    posicionamiento,
    fuenteFecha: `RIPTE ${RIPTE_BASE_MONTH} · ARS ${Math.round(RIPTE_NOMINAL).toLocaleString('es-AR')} · USD blue ${Math.round(RIPTE_USD_BLUE)}`,
    _insight: insight,
    _chart: chart,
  };
}
