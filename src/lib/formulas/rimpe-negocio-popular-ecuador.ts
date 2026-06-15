/** RIMPE Negocio Popular (Ecuador) — cuota fija anual de impuesto a la renta según ingresos brutos del año anterior.
 *  Aplica SOLO a contribuyentes con ingresos brutos anuales de hasta $20.000.
 *  Sobre $20.000 el contribuyente es recategorizado a RIMPE Emprendedor (tabla por tramos, ver calc aparte).
 *
 *  Tabla cuota fija Negocio Popular (vigente 2024→2026):
 *    $0–$2.500 → $0 · $2.500,01–$5.000 → $5 · $5.000,01–$10.000 → $15 ·
 *    $10.000,01–$15.000 → $35 · $15.000,01–$20.000 → $60.
 *  Fuente: SRI, https://www.sri.gob.ec/web/intersri/rimpe (Ley para el Fortalecimiento de la Economía Familiar,
 *  reemplazó la tarifa fija única de $60 por una tabla progresiva). Confirmado por SRI/Bloomberg Línea/Primicias 2026.
 *  Declaración y pago anual del IR Negocio Popular: mayo de cada año fiscal (boletín SRI NAC-COM 2026).
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Techo del régimen Negocio Popular (ingresos brutos anuales, USD).
// Fuente: SRI, https://www.sri.gob.ec/web/intersri/rimpe
const TECHO_NEGOCIO_POPULAR = 20000;

// Tabla de cuota fija anual de IR — Negocio Popular (USD).
// "hasta" = límite superior inclusive del tramo; "cuota" = impuesto a la renta anual a pagar.
// Fuente: SRI, https://www.sri.gob.ec/web/intersri/rimpe (2024→2026).
const TRAMOS_NEGOCIO_POPULAR: { hasta: number; cuota: number }[] = [
  { hasta: 2500,  cuota: 0 },
  { hasta: 5000,  cuota: 5 },
  { hasta: 10000, cuota: 15 },
  { hasta: 15000, cuota: 35 },
  { hasta: 20000, cuota: 60 },
];

export interface Inputs {
  /** Ingresos brutos anuales del año anterior (USD). */
  ingresosBrutosAnuales: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosBrutosAnuales);
  if (!Number.isFinite(ingresos) || ingresos <= 0) {
    throw new Error('Ingresá tus ingresos brutos anuales del año anterior');
  }

  // ¿Supera el techo del Negocio Popular?
  if (ingresos > TECHO_NEGOCIO_POPULAR) {
    const _insight = {
      title: 'No calificás como Negocio Popular',
      text: `Con ingresos brutos anuales de **${fmtUSDec(ingresos)}** superás el techo del Negocio Popular (${fmtUSDec(TECHO_NEGOCIO_POPULAR)}). El SRI te recategoriza a **RIMPE Emprendedor**, que paga una cuota por tramos (cuota fija + porcentaje sobre el excedente) y sí declara IVA. Usá la calculadora de RIMPE Emprendedor para estimar tu cuota.`,
      tone: 'warning',
      icon: '⚠️',
    };
    return {
      regimen: 'RIMPE Emprendedor (supera $20.000)',
      cuotaAnual: 'No aplica como Negocio Popular',
      cuotaMensual: '—',
      tramo: `Más de ${fmtUSDec(TECHO_NEGOCIO_POPULAR)} → recategorización a RIMPE Emprendedor.`,
      detalle: `Negocio Popular es solo para ingresos brutos anuales de hasta ${fmtUSDec(TECHO_NEGOCIO_POPULAR)}. Por encima de ese monto pasás a RIMPE Emprendedor (otra tabla).`,
      _insight,
    };
  }

  // Tramo de cuota fija.
  const tramo =
    TRAMOS_NEGOCIO_POPULAR.find((t) => ingresos <= t.hasta) ??
    TRAMOS_NEGOCIO_POPULAR[TRAMOS_NEGOCIO_POPULAR.length - 1];

  // Límite inferior del tramo (para el rótulo).
  const idx = TRAMOS_NEGOCIO_POPULAR.indexOf(tramo);
  const desde = idx === 0 ? 0 : TRAMOS_NEGOCIO_POPULAR[idx - 1].hasta;

  const cuotaAnual = tramo.cuota;
  const cuotaMensual = cuotaAnual / 12;
  const tasaEfectiva = ingresos > 0 ? (cuotaAnual / ingresos) * 100 : 0;

  const tramoLabel = `${fmtUSDec(desde)} – ${fmtUSDec(tramo.hasta)}`;
  const exento = cuotaAnual === 0;

  const _insight = {
    title: exento ? 'Estás exento del IR' : 'Tu cuota fija de Negocio Popular',
    text: exento
      ? `Con ingresos brutos anuales de **${fmtUSDec(ingresos)}** (tramo ${tramoLabel}) **no pagás impuesto a la renta** como Negocio Popular: la cuota es $0. Igual debés mantener tu RUC al día y emitir notas de venta.`
      : `Con ingresos brutos anuales de **${fmtUSDec(ingresos)}** (tramo ${tramoLabel}), tu impuesto a la renta como Negocio Popular es una **cuota fija de ${fmtUSDec(cuotaAnual)} al año** (${fmtUSDec(cuotaMensual)} mensuales equivalentes), una tasa efectiva de apenas ${tasaEfectiva.toFixed(2)}%. Es un valor fijo: no cambia con cada venta dentro del tramo. No declarás IVA.`,
    tone: 'neutral' as const,
    icon: '🧾',
  };

  // Gauge: cuota actual sobre el máximo del régimen ($60).
  const maxCuota = TRAMOS_NEGOCIO_POPULAR[TRAMOS_NEGOCIO_POPULAR.length - 1].cuota;
  const _chart = {
    type: 'gauge',
    value: Math.round(cuotaAnual * 100) / 100,
    min: 0,
    max: maxCuota,
    label: fmtUSDec(cuotaAnual),
    ariaLabel: `Cuota fija anual de Negocio Popular ${fmtUSDec(cuotaAnual)} sobre un máximo de ${fmtUSDec(maxCuota)}.`,
  };

  return {
    regimen: 'RIMPE Negocio Popular',
    cuotaAnual: fmtUSDec(cuotaAnual),
    cuotaMensual: fmtUSDec(cuotaMensual),
    tramo: tramoLabel,
    detalle: exento
      ? `Tramo ${tramoLabel}: cuota fija anual de $0 (exento). Tasa efectiva 0%.`
      : `Tramo ${tramoLabel}: cuota fija anual de ${fmtUSDec(cuotaAnual)}. Tasa efectiva ${tasaEfectiva.toFixed(2)}% sobre tus ingresos.`,
    _insight,
    _chart,
  };
}
