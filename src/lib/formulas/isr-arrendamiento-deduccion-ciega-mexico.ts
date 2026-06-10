/**
 * ISR por arrendamiento (federal) — deducción ciega 35% vs deducciones reales.
 * LISR Arts. 115-116: pago provisional mensual con tarifa del Art. 96 (Anexo 8 RMF 2026).
 * Si el inquilino es persona moral, retiene el 10% del ingreso bruto (acreditable).
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrMensual2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  rentaMensual: number;     // renta mensual cobrada
  predialAnual?: number;    // predial pagado en el año (deducible en ambas opciones)
  gastosReales?: number;    // gastos comprobables del mes SIN predial (mantenimiento, agua, seguros, intereses reales, depreciación 5%)
  tipoInquilino?: string;   // 'fisica' | 'moral' (persona moral retiene 10%)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { arrendamiento } = MEXICO_2026;

  const renta = num(i.rentaMensual, 0);
  if (renta <= 0) throw new Error('Ingresa la renta mensual que cobras');
  const predialAnual = Math.max(0, num(i.predialAnual, 0));
  const gastosReales = Math.max(0, num(i.gastosReales, 0));
  const esMoral = String(i.tipoInquilino || 'fisica') === 'moral';

  const predialMensual = predialAnual / 12;

  // Opción A — deducción ciega (LISR 115): 35% del ingreso + predial pagado.
  const deduccionCiega = renta * arrendamiento.deduccionCiega + predialMensual;
  const baseCiega = Math.max(0, renta - deduccionCiega);
  const isrCiega = isrMensual2026(baseCiega);

  // Opción B — deducciones reales: gastos comprobables + predial.
  const deduccionReal = gastosReales + predialMensual;
  const baseReal = Math.max(0, renta - deduccionReal);
  const isrReal = isrMensual2026(baseReal);

  const convieneCiega = isrCiega <= isrReal;
  const isrMejor = convieneCiega ? isrCiega : isrReal;
  const isrPeor = convieneCiega ? isrReal : isrCiega;
  const ahorroMensual = isrPeor - isrMejor;
  const ahorroAnual = ahorroMensual * 12;

  // Retención del 10% si rentas a persona moral (acreditable contra el provisional).
  const retencion = esMoral ? renta * arrendamiento.retencionPersonaMoral : 0;
  const pagoProvisional = Math.max(0, isrMejor - retencion);
  const saldoAFavorMes = Math.max(0, retencion - isrMejor);

  const tasaEfectiva = (isrMejor / renta) * 100;
  const mejorTxt = convieneCiega ? 'Deducción ciega (35%)' : 'Deducciones reales';

  const r2 = (n: number) => Math.round(n * 100) / 100;

  const _insight = {
    title: convieneCiega ? 'Te conviene la deducción ciega' : 'Te convienen las deducciones reales',
    text: ahorroMensual > 0.5
      ? `Con **${mejorTxt.toLowerCase()}** pagas **${fmtMXN(isrMejor)}** de ISR al mes en lugar de ${fmtMXN(isrPeor)}: ahorras **${fmtMXN(ahorroAnual)} al año**. Tu tasa efectiva queda en **${tasaEfectiva.toFixed(1)}%** de la renta.${esMoral ? ` Tu inquilino (persona moral) ya te retiene ${fmtMXN(retencion)}, así que ${pagoProvisional > 0 ? `solo enteras ${fmtMXN(pagoProvisional)}` : 'la retención cubre todo el pago provisional'}.` : ''}`
      : `Con tus números las dos opciones pagan prácticamente lo mismo (**${fmtMXN(isrMejor)}** al mes). La deducción ciega gana por simplicidad: no necesitas guardar ni comprobar facturas de gastos.`,
    tone: (ahorroMensual > 0.5 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🏠',
  };

  const _chart = {
    type: 'bar',
    ariaLabel: `Comparación del ISR mensual por arrendamiento: deducción ciega ${fmtMXN(isrCiega)} vs deducciones reales ${fmtMXN(isrReal)}.`,
    data: {
      labels: ['Deducción ciega 35%', 'Deducciones reales'],
      datasets: [
        { label: 'ISR mensual', data: [r2(isrCiega), r2(isrReal)], suffix: ' MXN' },
      ],
    },
  };

  return {
    mejorOpcion: mejorTxt,
    isrCiega: fmtMXN(isrCiega),
    isrReal: fmtMXN(isrReal),
    ahorroAnual: fmtMXN(ahorroAnual),
    retencion10: esMoral ? fmtMXN(retencion) : 'No aplica (persona física)',
    pagoProvisional: fmtMXN(pagoProvisional),
    detalle: `Base con ciega: ${fmtMXN(baseCiega)} (renta − 35% − predial/12) → ISR ${fmtMXN(isrCiega)}. Base con reales: ${fmtMXN(baseReal)} (renta − gastos − predial/12) → ISR ${fmtMXN(isrReal)}. Conviene ${mejorTxt.toLowerCase()}${esMoral ? `; retención 10% de ${fmtMXN(retencion)}${saldoAFavorMes > 0 ? ` (saldo a favor de ${fmtMXN(saldoAFavorMes)} en el mes, acreditable en la anual)` : ''}` : ''}.`,
    mensaje: `${mejorTxt}: ISR mensual de ${fmtMXN(isrMejor)} (tasa efectiva ${tasaEfectiva.toFixed(1)}% sobre la renta de ${fmtMXN(renta)}).`,
    _insight,
    _chart,
  };
}
