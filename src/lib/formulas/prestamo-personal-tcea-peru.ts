/**
 * Préstamo personal Perú — cuota mensual y costo total a partir de la TCEA.
 *
 * La TCEA (Tasa de Costo Efectivo Anual) es la tasa OFICIAL que la SBS obliga a
 * publicar a los bancos: incluye intereses + comisiones + seguros + gastos. Es el
 * número correcto para comparar préstamos. Como es una tasa EFECTIVA anual, la cuota
 * se calcula pasando primero a tasa efectiva mensual equivalente:
 *     i_mensual = (1 + TCEA)^(1/12) − 1
 * y luego con la fórmula de amortización francesa (cuota fija / PMT):
 *     cuota = P · i / (1 − (1 + i)^(−n))
 *
 * Datos 2026 (contexto / validación, no entran al cómputo de la cuota):
 * - Tasa máxima convencional de consumo (soles): 114,13% anual, vigente
 *   01-may-2026 a 31-oct-2026. Fuente: BCRP, serie PD38590DD, valor al 12-jun-2026.
 *   https://estadisticas.bcrp.gob.pe/estadisticas/series/diarias/resultados/PD38590DD/html
 * - TCEA real del mercado: bancos desde ~18,5% (BCP) hasta 30-35% en perfiles
 *   estándar; cajas desde ~22%; entidades de consumo/fintech hasta >80-113%.
 *   Fuente: comparadores de mercado y tasas activas SBS, jun-2026.
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Tasa máxima convencional compensatoria para créditos de consumo en soles,
// vigente may-oct 2026. Fuente: BCRP serie PD38590DD, valor al 12-jun-2026.
const TOPE_TCEA_CONSUMO_SOLES = 114.13;

export interface Inputs {
  monto: number;          // capital del préstamo en soles (S/)
  tcea: number;           // TCEA anual en % (ej. 28 = 28%)
  plazoMeses: number;     // número de cuotas mensuales
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const tcea = Number(i.tcea) || 0;
  const n = Math.round(Number(i.plazoMeses) || 0);

  if (monto <= 0) throw new Error('Ingresá el monto del préstamo (S/)');
  if (tcea <= 0) throw new Error('Ingresá la TCEA del préstamo (%)');
  if (n <= 0) throw new Error('Ingresá el plazo en meses (mayor a 0)');

  // Tasa efectiva mensual equivalente a partir de la TCEA (tasa efectiva anual).
  const tasaAnual = tcea / 100;
  const iMensual = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  // Cuota fija (sistema de amortización francés / PMT).
  const factor = Math.pow(1 + iMensual, -n);
  const cuota = (monto * iMensual) / (1 - factor);

  const totalPagado = cuota * n;
  const totalIntereses = totalPagado - monto;
  const sobrecosto = monto > 0 ? (totalIntereses / monto) * 100 : 0;

  const superaTope = tcea > TOPE_TCEA_CONSUMO_SOLES;
  const tone = tcea > 80 ? 'bad' : tcea > 40 ? 'warn' : 'good';

  const _insight = {
    title: 'Lo que realmente vas a pagar',
    text:
      `Por un préstamo de **${fmtPEN(monto)}** a **${n} cuotas** con una TCEA de **${tcea.toLocaleString('es-PE')}%**, ` +
      `pagás una cuota mensual de **${fmtPEN(cuota)}**. Al final habrás devuelto **${fmtPEN(totalPagado)}**, ` +
      `de los cuales **${fmtPEN(totalIntereses)}** son intereses y gastos: un **${sobrecosto.toLocaleString('es-PE', { maximumFractionDigits: 0 })}%** extra sobre lo que te prestaron. ` +
      (superaTope
        ? `⚠️ Esa TCEA supera el tope legal de consumo del BCRP (${TOPE_TCEA_CONSUMO_SOLES}% anual, may-oct 2026): revisá las condiciones.`
        : `Comparalo siempre por **TCEA**, nunca por la cuota: una cuota baja con plazo largo puede costar mucho más.`),
    tone,
    icon: '💵',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital prestado', value: Math.round(monto) },
      { label: 'Intereses y gastos', value: Math.round(totalIntereses) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(cuota),
    centerLabel: 'Cuota mensual',
    ariaLabel: `Cuota mensual de ${fmtPEN(cuota)}; del total pagado, ${fmtPEN(monto)} es capital y ${fmtPEN(totalIntereses)} son intereses y gastos.`,
  };

  return {
    cuota: fmtPEN(cuota),
    totalPagado: fmtPEN(totalPagado),
    totalIntereses: fmtPEN(totalIntereses),
    sobrecosto: sobrecosto.toLocaleString('es-PE', { maximumFractionDigits: 1 }) + '%',
    tasaMensual: (iMensual * 100).toLocaleString('es-PE', { maximumFractionDigits: 3 }) + '%',
    detalle:
      `Cuota ${fmtPEN(cuota)} × ${n} = ${fmtPEN(totalPagado)} · intereses ${fmtPEN(totalIntereses)} · ` +
      `tasa efectiva mensual ${(iMensual * 100).toLocaleString('es-PE', { maximumFractionDigits: 3 })}% (TCEA ${tcea}%).`,
    _insight,
    _chart,
  };
}
