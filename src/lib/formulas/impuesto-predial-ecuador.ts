/**
 * Impuesto predial urbano — ECUADOR 2026 (país dolarizado, montos en USD "$").
 *
 * Estima el impuesto predial urbano municipal sobre el avalúo catastral, aplicando
 * el descuento por pronto pago (quincenal) o el recargo por mora según el mes de pago.
 *
 * Cómo se calcula:
 *   1) Impuesto base = avalúo catastral × tarifa (por mil).
 *      La tarifa la fija cada concejo municipal por ordenanza dentro de la banda
 *      legal de 0,25‰ a 5‰ (COOTAD Art. 504). Para una estimación usamos una
 *      tarifa por defecto editable; el contribuyente puede poner la de su cantón.
 *   2) Ajuste por mes de pago:
 *      - 1ª quincena enero → 10% de descuento; cae 1 punto cada quincena hasta
 *        1% en la 2ª quincena de junio (COOTAD Art. 512).
 *      - Desde julio: recargo del 10% por mora (sin descuento).
 *
 * Fuentes:
 *  - Tarifa 0,25‰–5‰ sobre el avalúo (COOTAD Art. 504): Corte Constitucional /
 *    calendariotributario.org, https://calendariotributario.org/ec/impuesto-predial-y-como-calcularlo/, 2026.
 *  - Descuento por pronto pago 10%→1% quincenal y recargo 10% desde julio
 *    (COOTAD Art. 512): Primicias / Quito Informa,
 *    https://www.primicias.ec/quito/impuesto-predial-descuentos-enero-junio2026-municipio-pagos-113135/, 2026.
 */

export interface Inputs {
  avaluoCatastral: number;      // avalúo catastral municipal del predio (USD)
  // periodo de pago: clave de la quincena (ene1..jun2) o "mora" (jul-dic)
  mesPago?:
    | 'ene1' | 'ene2'
    | 'feb1' | 'feb2'
    | 'mar1' | 'mar2'
    | 'abr1' | 'abr2'
    | 'may1' | 'may2'
    | 'jun1' | 'jun2'
    | 'mora';
  tarifaPorMil?: number;        // tarifa municipal por mil (‰); por defecto 2,0‰
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// ── Datos 2026 ────────────────────────────────────────────────────────────────

const ANIO_FISCAL = 2026;

// Banda legal de la tarifa predial urbana (COOTAD Art. 504), en por mil (‰).
// fuente: COOTAD Art. 504 — calendariotributario.org, 2026
const TARIFA_MIN_POR_MIL = 0.25;
const TARIFA_MAX_POR_MIL = 5.0;
const TARIFA_DEFAULT_POR_MIL = 2.0; // referencial urbano medio (editable por el usuario)

// Descuento por pronto pago / recargo por mora (COOTAD Art. 512).
// El valor es el factor que ajusta el impuesto base: descuento negativo, recargo positivo.
// fuente: COOTAD Art. 512 — Primicias/Quito Informa, 2026
const AJUSTE_POR_PERIODO: Record<string, { label: string; pct: number }> = {
  ene1: { label: '1ª quincena de enero',  pct: -0.10 },
  ene2: { label: '2ª quincena de enero',  pct: -0.09 },
  feb1: { label: '1ª quincena de febrero', pct: -0.08 },
  feb2: { label: '2ª quincena de febrero', pct: -0.07 },
  mar1: { label: '1ª quincena de marzo',  pct: -0.06 },
  mar2: { label: '2ª quincena de marzo',  pct: -0.05 },
  abr1: { label: '1ª quincena de abril',  pct: -0.04 },
  abr2: { label: '2ª quincena de abril',  pct: -0.03 },
  may1: { label: '1ª quincena de mayo',   pct: -0.03 },
  may2: { label: '2ª quincena de mayo',   pct: -0.02 },
  jun1: { label: '1ª quincena de junio',  pct: -0.02 },
  jun2: { label: '2ª quincena de junio',  pct: -0.01 },
  mora: { label: 'Julio en adelante (mora)', pct: 0.10 },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtUSDec(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── compute ────────────────────────────────────────────────────────────────

export function compute(i: Inputs): Outputs {
  const avaluo = Number(i.avaluoCatastral);

  if (!Number.isFinite(avaluo) || avaluo <= 0) {
    throw new Error('Ingresá el avalúo catastral del predio (mayor a 0).');
  }

  // Tarifa: usa la del usuario si está dentro de la banda legal; si no, la default.
  let tarifaPorMil = Number(i.tarifaPorMil);
  if (!Number.isFinite(tarifaPorMil) || tarifaPorMil <= 0) {
    tarifaPorMil = TARIFA_DEFAULT_POR_MIL;
  }
  // La acotamos a la banda legal 0,25‰–5‰ (COOTAD Art. 504).
  tarifaPorMil = Math.min(TARIFA_MAX_POR_MIL, Math.max(TARIFA_MIN_POR_MIL, tarifaPorMil));

  const periodoKey = (i.mesPago && AJUSTE_POR_PERIODO[i.mesPago]) ? i.mesPago : 'ene1';
  const periodo = AJUSTE_POR_PERIODO[periodoKey];

  // Impuesto base = avalúo × tarifa por mil.
  const impuestoBase = round2(avaluo * (tarifaPorMil / 1000));

  // Ajuste (descuento negativo / recargo positivo).
  const ajuste = round2(impuestoBase * periodo.pct);
  const esRecargo = periodo.pct > 0;
  const descuento = esRecargo ? 0 : Math.abs(ajuste);
  const recargo = esRecargo ? ajuste : 0;

  const impuestoAPagar = round2(impuestoBase + ajuste);
  const tasaEfectiva = avaluo > 0 ? (impuestoAPagar / avaluo) * 1000 : 0; // por mil efectivo

  const ajusteTexto = esRecargo
    ? `con un recargo por mora del 10% (**+${fmtUSDec(recargo)}**)`
    : descuento > 0
      ? `con un descuento por pronto pago del ${Math.round(Math.abs(periodo.pct) * 100)}% (**−${fmtUSDec(descuento)}**)`
      : 'sin descuento ni recargo';

  const _insight = {
    title: 'Tu impuesto predial 2026',
    text: `Sobre un avalúo catastral de **${fmtUSDec(avaluo)}** con tarifa de **${tarifaPorMil.toString().replace('.', ',')}‰**, el impuesto base es **${fmtUSDec(impuestoBase)}**. Pagando en la ${periodo.label.toLowerCase()} ${ajusteTexto}, pagás **${fmtUSDec(impuestoAPagar)}**. ${esRecargo ? 'Pagaste tarde: perdiste el descuento y sumaste el recargo.' : descuento > 0 ? `Pagar en enero te ahorra hasta ${fmtUSDec(round2(impuestoBase * 0.10))} respecto al 10% máximo.` : ''}`,
    tone: (esRecargo ? 'warn' : 'positive') as const,
    icon: '🏘️',
  };

  const _chart = {
    type: 'doughnut' as const,
    segments: esRecargo
      ? [
          { label: 'Impuesto base', value: impuestoBase },
          { label: 'Recargo por mora (10%)', value: recargo },
        ]
      : [
          { label: 'Impuesto a pagar', value: impuestoAPagar },
          { label: `Descuento (${Math.round(Math.abs(periodo.pct) * 100)}%)`, value: descuento },
        ],
    ariaLabel: esRecargo
      ? `Impuesto base ${fmtUSDec(impuestoBase)} más recargo ${fmtUSDec(recargo)} = total ${fmtUSDec(impuestoAPagar)}.`
      : `Impuesto a pagar ${fmtUSDec(impuestoAPagar)} con descuento de ${fmtUSDec(descuento)} sobre la base de ${fmtUSDec(impuestoBase)}.`,
  };

  return {
    impuestoAPagar: fmtUSDec(impuestoAPagar),
    impuestoBase: fmtUSDec(impuestoBase),
    descuento: esRecargo ? fmtUSDec(0) : fmtUSDec(descuento),
    recargo: fmtUSDec(recargo),
    tarifaAplicada: `${tarifaPorMil.toString().replace('.', ',')}‰`,
    periodoPago: periodo.label,
    tasaEfectiva: `${tasaEfectiva.toFixed(2).replace('.', ',')}‰`,
    detalle: `Avalúo ${fmtUSDec(avaluo)} × ${tarifaPorMil.toString().replace('.', ',')}‰ = base ${fmtUSDec(impuestoBase)}. ${periodo.label}: ${esRecargo ? `recargo +10% (${fmtUSDec(recargo)})` : descuento > 0 ? `descuento ${Math.round(Math.abs(periodo.pct) * 100)}% (−${fmtUSDec(descuento)})` : 'sin ajuste'} → a pagar ${fmtUSDec(impuestoAPagar)}.`,
    _insight,
    _chart,
  };
}
