/**
 * Cuota de un préstamo personal en Uruguay — sistema francés (cuota fija).
 *
 * cuota = P × i / (1 − (1 + i)^(−n))
 *   P = monto, n = plazo en meses, i = tasa mensual efectiva.
 * La TEA (tasa efectiva anual) se pasa a mensual con i = (1 + TEA)^(1/12) − 1.
 *
 * Datos de referencia: BROU publica TEA desde ~28% (préstamo con convenio /
 * cuenta sueldo). El BCU fija topes de usura por trimestre (Ley 18.212). La tasa
 * es EDITABLE. Ojo: los préstamos al consumo suelen llevar IVA sobre los
 * intereses; esta cuenta no lo suma (mostrá el resultado como cuota "pura").
 */
import { fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Monto del préstamo, en pesos. */
  monto: number;
  /** Tasa efectiva anual (TEA), en %. */
  tasaTEA: number;
  /** Plazo en meses. */
  plazoMeses: number;
}

export interface Outputs {
  cuotaMensual: string;
  totalPagar: string;
  totalIntereses: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

function cuotaFrancesa(P: number, teaPct: number, n: number): number {
  if (P <= 0 || n <= 0) return 0;
  const tea = teaPct / 100;
  const i = Math.pow(1 + tea, 1 / 12) - 1;
  if (i <= 0) return P / n;
  return (P * i) / (1 - Math.pow(1 + i, -n));
}

export function compute(inp: Inputs): Outputs {
  const P = Math.max(0, Number(inp.monto) || 0);
  const teaPct = Math.max(0, Number(inp.tasaTEA) || 0);
  const n = Math.max(1, Math.round(Number(inp.plazoMeses) || 1));

  const cuota = cuotaFrancesa(P, teaPct, n);
  const totalPagar = cuota * n;
  const totalIntereses = totalPagar - P;
  const iMensual = (Math.pow(1 + teaPct / 100, 1 / 12) - 1) * 100;

  const detalle =
    `Préstamo de ${fmtUYU(P)} a ${teaPct}% TEA (≈ ${iMensual.toFixed(3)}% mensual) en ${n} cuotas. ` +
    `Cuota fija (sistema francés): ${fmtUYU(cuota)}. ` +
    `Total a pagar: ${fmtUYU(totalPagar)} (intereses: ${fmtUYU(totalIntereses)}).`;

  return {
    cuotaMensual: fmtUYU(cuota),
    totalPagar: fmtUYU(totalPagar),
    totalIntereses: fmtUYU(totalIntereses),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '🏦',
      tone: 'info' as const,
      text:
        `Por ${fmtUYU(P)} a ${teaPct}% TEA en ${n} meses pagás **${fmtUYU(cuota)}** por mes. ` +
        `Al final devolvés **${fmtUYU(totalPagar)}**, de los cuales **${fmtUYU(totalIntereses)}** son intereses. ` +
        `Recordá que muchos préstamos al consumo suman IVA sobre los intereses, y que el BCU fija un tope de usura.`,
    },
    _table: {
      title: 'Cuota según plazo (mismo monto y TEA)',
      headers: ['Plazo', 'Cuota mensual', 'Total a pagar'],
      rows: [12, 24, 36, 48].map((meses) => {
        const c = cuotaFrancesa(P, teaPct, meses);
        return [`${meses} meses`, fmtUYU(c), fmtUYU(c * meses)];
      }),
      note:
        'Sistema francés (cuota fija). La TEA se convierte a mensual con (1+TEA)^(1/12)−1. Tasa editable; BROU publica desde ~28% TEA. No incluye IVA sobre intereses ni gastos. Orientativo.',
    },
  };
}
