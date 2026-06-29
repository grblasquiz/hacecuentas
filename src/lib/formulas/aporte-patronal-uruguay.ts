/**
 * Aporte PATRONAL a BPS — Uruguay 2026 (costo de seguridad social del empleador).
 *
 * Son los aportes que paga el EMPLEADOR por fuera del sueldo del trabajador, sobre
 * el nominal mensual (Industria y Comercio, relación de dependencia):
 *
 *   Jubilatorio patronal  7,5%
 *   FONASA patronal       5%
 *   FRL patronal          0,125%
 *   ─────────────────────────────
 *   Total patronal       12,625% sobre el nominal
 *
 *   Costo total = nominal + aporte patronal
 *
 * IMPORTANTE: las tasas patronales son REFERENCIALES de Industria y Comercio y
 * varían por sector, convenio colectivo y régimen (rural, construcción, servicio
 * doméstico tienen tasas propias). No incluye la prima del seguro de accidentes
 * del BSE ni las provisiones de aguinaldo/licencia (eso es el costo total cargado,
 * que cubre la calculadora de costo del empleado).
 *
 * Base: BPS. Tasas en src/lib/data/uruguay-2026.ts (URUGUAY_2026.bps.patronal),
 * salvo el FRL patronal que el spec aplica al 0,125%.
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface AportePatronalInputs {
  /** Sueldo nominal mensual del trabajador, en pesos. */
  nominalMensual?: number | string;
}

export interface AportePatronalOutputs {
  jubilatorioPatronal: number;
  fonasaPatronal: number;
  frlPatronal: number;
  totalPatronal: number;
  costoTotal: number;
  detalle: string;
  _insight?: any;
  _table?: any;
}

export function aportePatronalUruguay(i: AportePatronalInputs): AportePatronalOutputs {
  const nominalMensual = Math.max(0, Number(i.nominalMensual) || 0);
  const p = URUGUAY_2026.bps.patronal;

  const TASA_JUB = p.jubilatorio; // 7,5%
  const TASA_FONASA = p.fonasa;   // 5%
  const TASA_FRL = 0.00125;       // 0,125% (FRL patronal según spec; el data file usa 0,1% genérico)

  const jubilatorioPatronal = nominalMensual * TASA_JUB;
  const fonasaPatronal = nominalMensual * TASA_FONASA;
  const frlPatronal = nominalMensual * TASA_FRL;
  const totalPatronal = jubilatorioPatronal + fonasaPatronal + frlPatronal;
  const costoTotal = nominalMensual + totalPatronal;

  const tasaTotalPct = ((TASA_JUB + TASA_FONASA + TASA_FRL) * 100).toFixed(3).replace('.', ',');

  const detalle =
    `Nominal ${fmtUYU(nominalMensual)} + aportes patronales ${fmtUYU(totalPatronal)} ` +
    `(7,5% + 5% + 0,125% = ${tasaTotalPct}%) = ${fmtUYU(costoTotal)} de costo BPS por mes.`;

  return {
    jubilatorioPatronal: Math.round(jubilatorioPatronal),
    fonasaPatronal: Math.round(fonasaPatronal),
    frlPatronal: Math.round(frlPatronal),
    totalPatronal: Math.round(totalPatronal),
    costoTotal: Math.round(costoTotal),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏢',
      text:
        nominalMensual > 0
          ? `Por un sueldo nominal de **${fmtUYU(nominalMensual)}** el empleador aporta **${fmtUYU(totalPatronal)}** a BPS (${tasaTotalPct}% patronal), llevando el costo a **${fmtUYU(costoTotal)}** por mes solo en seguridad social. No incluye el seguro de accidentes del BSE ni las provisiones de aguinaldo y licencia.`
          : `Ingresá el sueldo nominal para estimar el aporte patronal a BPS del empleador.`,
      tone: 'warn' as const,
    },
    _table: {
      title: 'Aporte patronal a BPS sobre el nominal — Uruguay (Industria y Comercio)',
      headers: ['Concepto', 'Tasa', 'Monto ($U)'],
      rows: [
        ['Sueldo nominal', '100%', fmtUYU(nominalMensual)],
        ['Jubilatorio patronal', '7,5%', fmtUYU(jubilatorioPatronal)],
        ['FONASA patronal', '5%', fmtUYU(fonasaPatronal)],
        ['FRL patronal', '0,125%', fmtUYU(frlPatronal)],
        ['Total aporte patronal', `${tasaTotalPct}%`, fmtUYU(totalPatronal)],
        ['Costo BPS total (nominal + patronal)', '', fmtUYU(costoTotal)],
      ],
      note: 'Tasas patronales REFERENCIALES de Industria y Comercio (BPS): varían por sector, convenio y régimen (rural, construcción y servicio doméstico tienen tasas propias). El FRL patronal se aplica al 0,125%. No incluye la prima del seguro de accidentes del BSE ni las provisiones de aguinaldo/licencia.',
    },
  };
}
