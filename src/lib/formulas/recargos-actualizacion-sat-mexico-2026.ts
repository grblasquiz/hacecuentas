/**
 * Calculadora de Recargos y Actualización SAT México 2026 (pago tardío de impuestos)
 *
 * Cuando pagás un impuesto FUERA del plazo legal, el SAT te cobra dos conceptos sobre el adeudo:
 *
 *  1) ACTUALIZACIÓN (Art. 17-A CFF): el impuesto se actualiza por la inflación transcurrida.
 *     Factor de actualización = INPC del mes anterior al más reciente / INPC del mes anterior
 *     al más antiguo (el mes en que debió pagarse). Si el factor resulta < 1, se aplica 1.
 *     impuestoActualizado = impuesto × factor.
 *
 *  2) RECARGOS por mora (Art. 21 CFF): se calculan SOBRE el impuesto YA ACTUALIZADO,
 *     a la tasa mensual de recargos por mora, por cada mes (o fracción) de atraso, hasta 60 meses.
 *     recargos = impuestoActualizado × tasaMensual × mesesDeAtraso.
 *
 * Tasa de recargos por mora 2026 = 2.07% mensual (Art. 11, fracc. I, LIF 2026, DOF 07-nov-2025;
 * regla 2.1.20 RMF 2026). Subió desde 1.47% en 2025 (+40%). Prórroga 2026 = 1.38% mensual.
 *
 * Verificado 2026-06-19 contra LIF 2026 (Art. 11) e Infobae/EKOS/WORTEV; CFF Arts. 17-A y 21.
 */

import { fmtMXN } from '../data/mexico-2026.ts';

/** Tasa mensual de recargos por MORA 2026 — Art. 11 LIF 2026 (DOF 07-nov-2025). */
export const TASA_RECARGOS_MORA_2026 = 0.0207;
/** Tasa mensual de recargos en PRÓRROGA 2026 (pago a plazo autorizado) — Art. 8 LIF 2026. */
export const TASA_RECARGOS_PRORROGA_2026 = 0.0138;
/** Tope legal de causación de recargos (Art. 21 CFF): 5 años = 60 meses. */
export const MAX_MESES_RECARGOS = 60;

export interface Inputs {
  /** Impuesto original que debió pagarse (histórico, sin recargos ni actualización). */
  impuesto: number;
  /** Meses (o fracciones de mes, redondeadas hacia arriba) de atraso. */
  mesesAtraso: number;
  /** Cómo se determina la actualización: por factor directo o por dos valores de INPC. */
  modoActualizacion?: 'factor' | 'inpc';
  /** Factor de actualización (Art. 17-A). Default 1 = sin inflación / muy corto plazo. */
  factorActualizacion?: number;
  /** INPC del mes anterior al MÁS RECIENTE (numerador del factor). */
  inpcReciente?: number;
  /** INPC del mes anterior al de pago original (denominador del factor). */
  inpcOriginal?: number;
  /** Tipo de adeudo: 'mora' (extemporáneo) o 'prorroga' (plazo autorizado). */
  tipoRecargo?: 'mora' | 'prorroga';
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v.replace(/[^0-9.\-]/g, '')) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function recargosActualizacionSatMexico2026(i: Inputs): Outputs {
  const impuesto = num(i.impuesto);
  if (!impuesto || impuesto <= 0) throw new Error('Ingresá el impuesto original que debió pagarse.');

  // Meses de atraso: el CFF cobra por mes o fracción → redondeo hacia arriba; tope 60 meses.
  let meses = Math.ceil(num(i.mesesAtraso));
  if (meses < 0) meses = 0;
  const mesesTopados = Math.min(meses, MAX_MESES_RECARGOS);
  const topo = meses > MAX_MESES_RECARGOS;

  // ── 1) Factor de actualización (Art. 17-A CFF) ──
  let factor: number;
  if (i.modoActualizacion === 'inpc') {
    const rec = num(i.inpcReciente);
    const orig = num(i.inpcOriginal);
    factor = orig > 0 ? rec / orig : 1;
  } else {
    factor = i.factorActualizacion != null ? num(i.factorActualizacion) : 1;
  }
  // Art. 17-A: si el factor de actualización es menor a 1, se aplica 1 (nunca desactualiza a la baja).
  if (!Number.isFinite(factor) || factor < 1) factor = 1;
  const factorRedondeado = Math.round(factor * 10000) / 10000; // el factor se publica a 4 decimales

  const impuestoActualizado = Math.round(impuesto * factorRedondeado * 100) / 100;
  const actualizacion = Math.round((impuestoActualizado - impuesto) * 100) / 100;

  // ── 2) Recargos (Art. 21 CFF) — sobre el impuesto ACTUALIZADO ──
  const esProrroga = i.tipoRecargo === 'prorroga';
  const tasaMensual = esProrroga ? TASA_RECARGOS_PRORROGA_2026 : TASA_RECARGOS_MORA_2026;
  const tasaAcumulada = tasaMensual * mesesTopados;
  const recargos = Math.round(impuestoActualizado * tasaAcumulada * 100) / 100;

  // ── Total a pagar ──
  const total = Math.round((impuestoActualizado + recargos) * 100) / 100;
  const recargoPorMes = Math.round(impuestoActualizado * tasaMensual * 100) / 100;

  const pct = (n: number, dec = 2) =>
    (Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: dec,
    });

  const tasaPctTxt = pct(tasaMensual * 100, 2);
  const tasaAcumPctTxt = pct(tasaAcumulada * 100, 2);
  const concepto = esProrroga ? 'recargos en prórroga' : 'recargos por mora';

  const _insight = {
    title: total > impuesto ? `Pagás ${fmtMXN(total - impuesto)} de más por el atraso` : 'Sin cargos por atraso',
    text:
      mesesTopados === 0
        ? `Con **0 meses** de atraso no se causan recargos. La actualización del Art. 17-A solo aplica si ya pasó al menos un mes completo desde el vencimiento; mientras tanto, pagás los **${fmtMXN(impuesto)}** originales.`
        : `Un impuesto de **${fmtMXN(impuesto)}** que pagás **${mesesTopados} mes${mesesTopados === 1 ? '' : 'es'}** tarde se convierte en **${fmtMXN(total)}**: primero se actualiza por inflación a **${fmtMXN(impuestoActualizado)}** (factor ${pct(factorRedondeado, 4)}, +${fmtMXN(actualizacion)}), y sobre ese monto corren **${fmtMXN(recargos)}** de ${concepto} (${tasaPctTxt}% mensual × ${mesesTopados} = ${tasaAcumPctTxt}%). Cada mes extra suma **${fmtMXN(recargoPorMes)}**${topo ? '. Ojo: los recargos topan a 60 meses (5 años), pero la actualización sigue corriendo.' : '.'}`,
    tone: 'warn' as const,
    icon: '🧾',
  };

  const out: Outputs = {
    total: fmtMXN(total),
    impuestoActualizado: fmtMXN(impuestoActualizado),
    actualizacion: fmtMXN(actualizacion),
    recargos: fmtMXN(recargos),
    factorAplicado: pct(factorRedondeado, 4),
    recargoPorMes: `${fmtMXN(recargoPorMes)} por mes`,
    detalle:
      `${fmtMXN(impuesto)} × factor ${pct(factorRedondeado, 4)} = ${fmtMXN(impuestoActualizado)} (impuesto actualizado, Art. 17-A) ` +
      `→ recargos ${tasaPctTxt}% × ${mesesTopados} mes${mesesTopados === 1 ? '' : 'es'} = ${fmtMXN(recargos)} (Art. 21) ` +
      `→ total a pagar ${fmtMXN(total)}.`,
    _insight,
  };

  // Donut: el total = impuesto histórico + actualización + recargos (los tres suman el total).
  if (total > 0) {
    const slices = [
      { label: 'Impuesto original', value: impuesto },
      ...(actualizacion > 0 ? [{ label: 'Actualización (inflación)', value: actualizacion }] : []),
      ...(recargos > 0 ? [{ label: 'Recargos por mora', value: recargos }] : []),
    ];
    if (slices.length > 1) {
      out._chart = {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtMXN(total),
        centerLabel: 'Total a pagar',
        ariaLabel: `Total a pagar al SAT: ${fmtMXN(total)}, compuesto por ${fmtMXN(impuesto)} de impuesto original, ${fmtMXN(actualizacion)} de actualización y ${fmtMXN(recargos)} de recargos por ${mesesTopados} meses de atraso.`,
      };
    }
  }

  return out;
}
