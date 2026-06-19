/**
 * Calculadora de retención del SAT en plataformas digitales — México 2026
 * (Uber, Didi, Rappi, Airbnb, Mercado Libre…). Persona física.
 *
 * Las plataformas son agentes retenedores y descuentan, sobre tu ingreso cobrado
 * por la app, dos impuestos como PAGO PROVISIONAL del SAT:
 *
 *  - ISR — Art. 113-A LISR (tasas vigentes 2026, tras el ajuste de la LIF 2026):
 *      Fracc. I  Transporte de pasajeros / entrega de bienes …… 2.1%
 *      Fracc. II Hospedaje …………………………………………………………………………… 4.0%
 *      Fracc. III Enajenación de bienes / prestación de servicios … 2.5% (subió de 1% en 2026)
 *      Sin RFC (último párrafo Art. 113-A) ……………………………………… 20%
 *
 *  - IVA — Art. 18-J LIVA (retención del IVA cobrado, tasa general 16%):
 *      Con RFC: retiene el 50% del IVA = 8% del valor.
 *      Sin RFC (o fondos a cuenta en el extranjero): retiene el 100% del IVA = 16%.
 *
 * Verificado 2026-06-19 contra EY México, IDC, ASCG, gigstack, Mercado Pago y el
 * texto del Art. 113-A / 18-J. Nota: el texto base de la LISR todavía publica el
 * 1% en la fracción III; la LIF 2026 (DOF dic-2025) lo elevó a 2.5% desde el
 * 1-ene-2026 — por eso se usa 2.5% para el ejercicio 2026.
 */

const num = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^0-9.\-]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

// ── Tasas vigentes 2026 ──────────────────────────────────────────────────────
const ISR_SIN_RFC = 0.2; // 20% — Art. 113-A LISR, último párrafo

const ISR_POR_ACTIVIDAD: Record<string, { tasa: number; etiqueta: string; fraccion: string }> = {
  transporte: { tasa: 0.021, etiqueta: 'Transporte de pasajeros y entrega de bienes', fraccion: 'I' },
  hospedaje: { tasa: 0.04, etiqueta: 'Servicios de hospedaje', fraccion: 'II' },
  bienesServicios: { tasa: 0.025, etiqueta: 'Enajenación de bienes y prestación de servicios', fraccion: 'III' },
};

const IVA_GENERAL = 0.16;
const IVA_RET_CON_RFC = 0.08; // 50% del IVA
const IVA_RET_SIN_RFC = 0.16; // 100% del IVA

export interface Inputs {
  ingresoMensual: number | string;
  actividad?: 'transporte' | 'hospedaje' | 'bienesServicios';
  dioRfc?: 'si' | 'no' | boolean;
}

export interface Outputs {
  netoRecibir: number;
  retencionIsr: number;
  retencionIva: number;
  retencionTotal: number;
  tasaIsrAplicada: number;
  tasaIvaAplicada: number;
  ingresoBruto: number;
  detalle: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function retencionPlataformasDigitalesMexico2026(i: Inputs): Outputs {
  const ingreso = num(i.ingresoMensual);
  if (!Number.isFinite(ingreso) || ingreso <= 0) {
    throw new Error('Ingresá tu ingreso mensual cobrado por la app');
  }

  const actividadKey = (i.actividad && ISR_POR_ACTIVIDAD[i.actividad]) ? i.actividad : 'transporte';
  const act = ISR_POR_ACTIVIDAD[actividadKey];

  // dioRfc admite boolean (retro-compat) o 'si'/'no'
  const conRfc =
    typeof i.dioRfc === 'boolean' ? i.dioRfc : i.dioRfc !== 'no';

  // ISR: tasa de la actividad si dio RFC; 20% si no lo dio.
  const tasaIsr = conRfc ? act.tasa : ISR_SIN_RFC;
  const retencionIsr = ingreso * tasaIsr;

  // IVA: se calcula sobre el valor del servicio (el ingreso cobrado ya es la
  // contraprestación gravada). Con RFC se retiene 8%; sin RFC, 16%.
  const tasaIva = conRfc ? IVA_RET_CON_RFC : IVA_RET_SIN_RFC;
  const retencionIva = ingreso * tasaIva;

  const retencionTotal = retencionIsr + retencionIva;
  const netoRecibir = ingreso - retencionTotal;

  const fmtMXN = (n: number) =>
    '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n: number) => (Math.round(n * 1000) / 10).toString().replace('.0', '') + '%';
  const pctNeto = ingreso > 0 ? Math.round((netoRecibir / ingreso) * 1000) / 10 : 0;

  const detalle = conRfc
    ? `Actividad: ${act.etiqueta} (Art. 113-A fracc. ${act.fraccion}). ISR retenido ${pct(tasaIsr)} = ${fmtMXN(retencionIsr)}; IVA retenido ${pct(tasaIva)} (50% del IVA) = ${fmtMXN(retencionIva)}.`
    : `Sin RFC en la app: ISR retenido al 20% = ${fmtMXN(retencionIsr)}; IVA retenido al 16% (100% del IVA) = ${fmtMXN(retencionIva)}.`;

  const _insight = conRfc
    ? {
        title: 'Te retienen y cobrás neto',
        text: `Por **${act.etiqueta.toLowerCase()}**, de tus **${fmtMXN(ingreso)}** mensuales la plataforma te retiene **${fmtMXN(retencionIsr)}** de ISR (**${pct(tasaIsr)}**) y **${fmtMXN(retencionIva)}** de IVA (**${pct(tasaIva)}**): cobrás **${fmtMXN(netoRecibir)}** netos (el **${pctNeto}%**). Esas retenciones NO son un costo perdido: son anticipo de tus impuestos y las acreditás en tu declaración.`,
        tone: 'neutral',
        icon: '🚗',
      }
    : {
        title: 'Sin RFC te retienen el doble (o más)',
        text: `Como no diste RFC, la plataforma aplica las tasas de castigo: **20%** de ISR (${fmtMXN(retencionIsr)}) y **16%** de IVA (${fmtMXN(retencionIva)}). Te quedan **${fmtMXN(netoRecibir)}** netos (el **${pctNeto}%**). Inscribirte en el RFC bajo "Plataformas tecnológicas" baja el ISR a **${pct(act.tasa)}** y el IVA a **8%** — recuperás varios miles de pesos al mes.`,
        tone: 'warn',
        icon: '⚠️',
      };

  const out: Outputs = {
    netoRecibir: Number(netoRecibir.toFixed(2)),
    retencionIsr: Number(retencionIsr.toFixed(2)),
    retencionIva: Number(retencionIva.toFixed(2)),
    retencionTotal: Number(retencionTotal.toFixed(2)),
    tasaIsrAplicada: Number((tasaIsr * 100).toFixed(2)),
    tasaIvaAplicada: Number((tasaIva * 100).toFixed(2)),
    ingresoBruto: Number(ingreso.toFixed(2)),
    detalle,
    mensaje: `De $${ingreso.toFixed(2)} mensuales por la app, el SAT te retiene $${retencionTotal.toFixed(2)} (ISR + IVA) y cobrás $${netoRecibir.toFixed(2)} netos.`,
    _insight,
  };

  // Donut: el ingreso bruto se reparte entre neto, ISR retenido e IVA retenido.
  out._chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto a recibir', value: Number(netoRecibir.toFixed(2)) },
      { label: 'ISR retenido', value: Number(retencionIsr.toFixed(2)) },
      { label: 'IVA retenido', value: Number(retencionIva.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: fmtMXN(ingreso),
    centerLabel: 'Ingreso por la app',
    ariaLabel: 'Reparto del ingreso mensual cobrado por la app entre el neto a recibir y las retenciones de ISR e IVA del SAT',
  };

  return out;
}
