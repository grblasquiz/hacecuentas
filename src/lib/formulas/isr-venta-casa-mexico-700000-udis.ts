/**
 * ISR por venta de casa habitación — exención de 700,000 UDIS (LISR Art. 93 fracc. XIX)
 * y ganancia gravable con tarifa anual dividida entre años de tenencia (LISR Art. 120, máx. 20).
 * Si el precio supera la exención, la ganancia se grava en la proporción
 * excedente/precio (regla del propio Art. 93-XIX).
 * Constantes desde src/lib/data/mexico-2026.ts (UDI con dataAsOf — cambia a diario).
 */
import { MEXICO_2026, isrAnual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  precioVenta: number;
  costoAdquisicion: number;
  gastos?: number;          // notario, comisiones, mejoras con factura
  anios?: number;           // años desde la compra (divide la ganancia, máx. 20)
  aplicaExencion?: string;  // 'si' | 'no' — casa habitación y sin exención usada en 3 años
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { ventaCasaHabitacion } = MEXICO_2026;

  const precio = num(i.precioVenta, 0);
  if (precio <= 0) throw new Error('Ingresa el precio de venta de la casa');
  const costo = num(i.costoAdquisicion, 0);
  if (costo <= 0) throw new Error('Ingresa el costo de adquisición (lo que pagaste, según escritura)');
  const gastos = Math.max(0, num(i.gastos, 0));
  const anios = Math.min(20, Math.max(1, Math.floor(num(i.anios, 1)))); // LISR 120: máx. 20 años
  const exencionAplica = String(i.aplicaExencion || 'si') !== 'no';

  const exencionMXN = ventaCasaHabitacion.exencionUdis * ventaCasaHabitacion.valorUdi; // ~$6,181,560
  const gananciaTotal = Math.max(0, precio - costo - gastos);

  let montoExento = 0;
  let gananciaGravable = 0;
  if (exencionAplica) {
    if (precio <= exencionMXN) {
      montoExento = precio;
      gananciaGravable = 0;
    } else {
      // Excedente gravado en proporción (Art. 93-XIX): ganancia × (excedente / precio).
      montoExento = exencionMXN;
      const proporcion = (precio - exencionMXN) / precio;
      gananciaGravable = gananciaTotal * proporcion;
    }
  } else {
    gananciaGravable = gananciaTotal;
  }

  // ISR estimado (Art. 120, sin otros ingresos): la ganancia se divide entre los años
  // de tenencia, se aplica la tarifa anual y el resultado se multiplica por los años.
  const gananciaAnualizada = gananciaGravable / anios;
  const isrPorAnio = isrAnual2026(gananciaAnualizada);
  const isr = Math.round(isrPorAnio * anios * 100) / 100;
  const gananciaExenta = gananciaTotal - gananciaGravable;
  const tasaEfectiva = gananciaTotal > 0 ? (isr / gananciaTotal) * 100 : 0;

  let resumen: string;
  if (gananciaTotal === 0) {
    resumen = `No hay ganancia: vendes a ${fmtMXN(precio)} con un costo total de ${fmtMXN(costo + gastos)}. Sin ganancia no hay ISR.`;
  } else if (exencionAplica && gananciaGravable === 0) {
    resumen = `Venta totalmente exenta: el precio (${fmtMXN(precio)}) no supera las 700,000 UDIS (${fmtMXN(exencionMXN)} con UDI de ${ventaCasaHabitacion.valorUdi}). ISR: $0.`;
  } else if (exencionAplica) {
    resumen = `El precio supera la exención de ${fmtMXN(exencionMXN)} (700,000 UDIS): se grava la ganancia en proporción al excedente → ISR estimado ${fmtMXN(isr)}.`;
  } else {
    resumen = `Sin exención (no es casa habitación o ya la usaste en los últimos ${ventaCasaHabitacion.aniosEntreExenciones} años): toda la ganancia de ${fmtMXN(gananciaTotal)} paga ISR → ${fmtMXN(isr)}.`;
  }

  const _insight = {
    title: gananciaGravable === 0 ? 'Venta libre de ISR' : 'Tu ISR estimado por la venta',
    text:
      gananciaGravable === 0
        ? `${resumen} Recuerda: la exención exige que sea tu **casa habitación**, que lo acredites ante notario y que no hayas usado la exención en los últimos **3 años**.`
        : `Ganancia total **${fmtMXN(gananciaTotal)}** → exenta **${fmtMXN(gananciaExenta)}**, gravada **${fmtMXN(gananciaGravable)}**. Dividida entre ${anios} año${anios > 1 ? 's' : ''} de tenencia y aplicada la tarifa anual 2026, el ISR estimado es **${fmtMXN(isr)}** (~${tasaEfectiva.toFixed(1)}% de la ganancia). El notario lo retiene al firmar la escritura.`,
    tone: gananciaGravable === 0 ? 'good' : 'info',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Ganancia exenta', value: Math.round(gananciaExenta) },
      { label: 'Ganancia gravada (neta de ISR)', value: Math.round(Math.max(0, gananciaGravable - isr)) },
      { label: 'ISR estimado', value: Math.round(isr) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(isr),
    centerLabel: 'ISR estimado',
    ariaLabel: `De una ganancia de ${fmtMXN(gananciaTotal)}, ${fmtMXN(gananciaExenta)} queda exenta y el ISR estimado es ${fmtMXN(isr)}.`,
  };

  return {
    isr: fmtMXN(isr),
    montoExento: exencionAplica
      ? fmtMXN(montoExento) + ` (tope: 700,000 UDIS = ${fmtMXN(exencionMXN)})`
      : fmtMXN(0) + ' (sin derecho a exención)',
    gananciaGravable: fmtMXN(gananciaGravable),
    detalle: resumen + (gananciaGravable > 0 ? ` Ganancia gravable ${fmtMXN(gananciaGravable)} ÷ ${anios} año${anios > 1 ? 's' : ''} → tarifa anual → × ${anios}.` : ''),
    _insight,
    _chart,
  };
}
