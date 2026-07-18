/**
 * Préstamo Coppel — abonos quincenales e intereses.
 * Amortización francesa con periodo QUINCENAL (24 quincenas/año). La tasa es un
 * DATO EDITABLE con default referencial: Coppel publica tasas anuales sin IVA de
 * ~45% (12 meses) a ~92% (24 meses) y un CAT promedio de 81%-97%; el interés
 * paga IVA (16%), por eso el default sugiere la tasa con IVA. Sin constantes
 * de ley hardcodeadas: el usuario confirma su tasa en el simulador de Coppel.
 */
import { fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  monto: number;                 // $1,000 a $50,000 aprox.
  plazoQuincenas: number | string; // 24 / 36 / 48 (12 / 18 / 24 meses)
  tasaAnualConIva?: number;      // % anual CON IVA, editable (default 52.2 = 45% + IVA)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const monto = num(i.monto, 0);
  if (!(monto > 0)) throw new Error('Ingresa el monto del préstamo');
  const n = Math.max(1, Math.round(num(i.plazoQuincenas, 24)));
  const tasaAnual = Math.max(0, num(i.tasaAnualConIva, 52.2));

  // Tasa quincenal simple: anual / 24 quincenas (2 por mes), como cotizan las tiendas.
  const iq = tasaAnual / 100 / 24;
  const abono = iq > 0 ? (monto * iq) / (1 - Math.pow(1 + iq, -n)) : monto / n;
  const totalPagado = abono * n;
  const intereses = totalPagado - monto;
  const recargoPct = (intereses / monto) * 100;
  const meses = n / 2;

  const detalle = `${fmtMXN(monto)} a ${n} quincenas (${meses} meses) con tasa ${tasaAnual.toLocaleString('es-MX', { maximumFractionDigits: 2 })}% anual con IVA: abono quincenal ${fmtMXN(round2(abono))} · total pagado ${fmtMXN(round2(totalPagado))} · intereses ${fmtMXN(round2(intereses))} (+${recargoPct.toFixed(1)}% sobre el monto).`;

  const _insight = {
    title: `Pagarías ${fmtMXN(round2(totalPagado))} en total`,
    text: `Un préstamo de **${fmtMXN(monto)}** a **${n} quincenas** implica abonos de **${fmtMXN(round2(abono))} cada quincena**. Al final habrás pagado **${fmtMXN(round2(totalPagado))}**: **${fmtMXN(round2(intereses))}** de intereses, un **+${recargoPct.toFixed(1)}%** sobre lo que te prestaron. ${recargoPct > 50 ? 'A este costo, alarga el plazo solo si de verdad lo necesitas: cada quincena extra suma intereses. Coppel da **descuento por liquidar anticipadamente** — pregunta cuánto antes de firmar.' : 'Si puedes, liquida antes: Coppel aplica descuento por pago anticipado y te ahorras parte de los intereses.'} La tasa exacta depende de tu historial: confirma tu abono en la ficha del préstamo antes de aceptar.`,
    tone: recargoPct > 50 ? 'warn' : 'neutral',
    icon: '🏬',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Lo que te prestan', value: Math.round(monto) },
      { label: 'Intereses (con IVA)', value: Math.round(intereses) },
    ].filter((s) => s.value > 0),
    centerValue: fmtMXN(round2(totalPagado)),
    centerLabel: 'Total a pagar',
    prefix: '$ ',
    ariaLabel: `Del total de ${fmtMXN(round2(totalPagado))}, ${fmtMXN(monto)} es el préstamo y ${fmtMXN(round2(intereses))} son intereses.`,
  };

  return {
    abonoQuincenal: fmtMXN(round2(abono)),
    totalPagado: fmtMXN(round2(totalPagado)),
    interesesTotales: `${fmtMXN(round2(intereses))} (+${recargoPct.toFixed(1)}% sobre el monto)`,
    plazoEnMeses: `${meses} meses (${n} quincenas)`,
    detalle,
    _insight,
    _chart,
  };
}
