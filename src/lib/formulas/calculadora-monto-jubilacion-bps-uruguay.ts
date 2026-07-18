/**
 * Monto de jubilación BPS — Uruguay (régimen anterior/transición, causal
 * posterior al 1/7/2009). Estima el TRAMO BPS: SBJ × tasa de reemplazo.
 *
 * Tasa de reemplazo (sobre el Sueldo Básico Jubilatorio):
 *   - 45% base por 30 años de servicio.
 *   - +1% por cada año de servicio entre 30 y 35 (máx +5%).
 *   - +0,5% por cada año de servicio entre 35 y 40 (máx +2,5%).
 *   - +2% por cada año trabajado luego de los 60 (edadRetiro − 60), con tope
 *     combinado de 30%.
 *   - Tope global de 82,5%.
 * Con menos de 30 años de servicio NO se configura la causal común (la tasa base
 * no aplica): se orienta a la causal de edad avanzada.
 *
 * ⚠️ ESTIMACIÓN del tramo BPS. En el sistema MIXTO, quien supera el tope de
 * aportación (unos $260.000 nominales mensuales en 2026) divide aportes con una
 * AFAP y suma un tramo de ahorro individual (renta vitalicia) que NO se calcula
 * acá. El SBJ real lo fija el BPS (promedio de los mejores años). La causal común
 * del NUEVO sistema (Ley 20.130) recién se otorga desde 2033. Orientativo, no
 * vinculante.
 *
 * Fuente: BPS — Jubilación común (régimen jubilatorio anterior).
 */
import { JUBILACION_UY, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Sueldo Básico Jubilatorio: promedio de tus mejores años, en pesos. */
  sueldoBasicoJubilatorio: number;
  /** Años de servicio reconocidos con aportes. */
  aniosServicio: number;
  /** Edad a la que te retirás. */
  edadRetiro: number;
}

export interface Outputs {
  jubilacionEstimada: string;
  tasaReemplazo: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const TR = JUBILACION_UY.tasaReemplazo;
const REQ = JUBILACION_UY.aniosServicioComun; // 30

/** Formatea una fracción como porcentaje rioplatense: 0,60 → "60%", 0,625 → "62,5%". */
function fmtPct(x: number): string {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(x * 100) + '%';
}

/** Tasa de reemplazo (régimen anterior/transición, BPS) según años de servicio y edad de retiro. */
function tasaReemplazo(anios: number, edad: number): number {
  if (anios < REQ) return 0;
  const adicServ =
    TR.adicServicio30a35 * Math.min(Math.max(anios - 30, 0), 5) +
    TR.adicServicio35a40 * Math.min(Math.max(anios - 35, 0), 5);
  const edadBonus = Math.min(TR.adicEdadPorAnio * Math.max(edad - 60, 0), TR.topeAdicEdad);
  return Math.min(TR.base + adicServ + edadBonus, TR.maxTasa);
}

/** Tabla de referencia: tasa de reemplazo para combinaciones típicas de servicio y edad. */
function tablaTasas() {
  const combos: Array<[number, number]> = [
    [30, 60],
    [30, 65],
    [35, 60],
    [35, 65],
    [40, 65],
    [40, 70],
    [40, 75],
  ];
  return {
    title: 'Tasa de reemplazo según años de servicio y edad de retiro (tramo BPS)',
    headers: ['Años de servicio', 'Edad de retiro', 'Tasa de reemplazo'],
    rows: combos.map(([a, e]) => [`${a} años`, `${e} años`, fmtPct(tasaReemplazo(a, e))]),
    note:
      'Régimen anterior/transición (BPS): 45% base por 30 años + 1%/año entre 30 y 35 + 0,5%/año entre 35 y 40 ' +
      '+ 2%/año trabajado luego de los 60 (tope combinado 30%), con tope global de 82,5%. La tasa se aplica sobre ' +
      'el Sueldo Básico Jubilatorio (SBJ). No incluye el tramo de ahorro individual (AFAP) del sistema mixto.',
  };
}

export function compute(i: Inputs): Outputs {
  const sbj = Math.max(0, Number(i.sueldoBasicoJubilatorio) || 0);
  const anios = Math.max(0, Number(i.aniosServicio) || 0);
  const edad = Math.max(0, Number(i.edadRetiro) || 0);

  // Menos de 30 años → no configura causal común: la tasa base no aplica.
  if (anios < REQ) {
    const detalle =
      `Con ${anios} años de servicio no configurás la causal común, que exige ${REQ} años, ` +
      `así que la tasa de reemplazo base del ${fmtPct(TR.base)} no aplica. ` +
      `Podrías acceder por la causal de edad avanzada (65 años con 25 de servicio, hasta 70 con 15). ` +
      `Fijate a qué edad te podés jubilar en la calculadora de edad de jubilación.`;
    return {
      jubilacionEstimada: 'No configura causal común',
      tasaReemplazo: '0% (sin causal común)',
      detalle,
      _insight: {
        type: 'highlight',
        icon: '⚠️',
        tone: 'info' as const,
        text:
          `Con **${anios} años** de servicio todavía no llegás a los **${REQ} años** que exige la causal común. ` +
          `El monto depende de la tasa de reemplazo, que arranca en **45%** recién con 30 años de servicio. ` +
          `Sumá años de aportes o revisá la **causal de edad avanzada** (desde 65/25 hasta 70/15).`,
      },
      _table: tablaTasas(),
    };
  }

  const adicServ =
    TR.adicServicio30a35 * Math.min(Math.max(anios - 30, 0), 5) +
    TR.adicServicio35a40 * Math.min(Math.max(anios - 35, 0), 5);
  const edadBonus = Math.min(TR.adicEdadPorAnio * Math.max(edad - 60, 0), TR.topeAdicEdad);
  const tasa = Math.min(TR.base + adicServ + edadBonus, TR.maxTasa);
  const jubilacion = sbj * tasa;
  const enTope = TR.base + adicServ + edadBonus > TR.maxTasa;

  const detalle =
    `SBJ ${fmtUYU(sbj)} × tasa de reemplazo ${fmtPct(tasa)} = ${fmtUYU(jubilacion)} nominales por mes (tramo BPS). ` +
    `Tasa = ${fmtPct(TR.base)} base (30 años de servicio) + ${fmtPct(adicServ)} por tus ${anios} años de servicio ` +
    `+ ${fmtPct(edadBonus)} por retirarte a los ${edad}${enTope ? ' (limitada al tope global de 82,5%)' : ''}. ` +
    `Es una estimación del tramo BPS: el SBJ definitivo lo determina el BPS y no incluye el tramo de ahorro AFAP del sistema mixto.`;

  return {
    jubilacionEstimada: fmtUYU(jubilacion),
    tasaReemplazo: fmtPct(tasa),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '👴',
      tone: 'info' as const,
      text:
        `Con un SBJ de **${fmtUYU(sbj)}**, ${anios} años de servicio y retiro a los ${edad}, la jubilación estimada del ` +
        `tramo BPS ronda **${fmtUYU(jubilacion)}** por mes (tasa de reemplazo **${fmtPct(tasa)}**). ` +
        `Es orientativo: si superás el tope de aportación (~$260.000 nominales), parte de tus aportes va a una **AFAP** ` +
        `y sumás un tramo de ahorro individual que no se calcula acá.`,
    },
    _table: tablaTasas(),
  };
}
