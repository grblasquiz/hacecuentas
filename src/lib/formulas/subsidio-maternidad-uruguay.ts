/**
 * Subsidio por Maternidad BPS Uruguay 2026.
 *
 * Lógica (BPS):
 *   - Licencia maternal = 14 semanas = 98 días (al menos 6 antes y el resto después del parto).
 *   - El subsidio cubre el 100% del promedio de las remuneraciones de los últimos 6 meses,
 *     incrementado por la cuota parte de aguinaldo (≈ 1/12), licencia y salario vacacional (≈ 1/12)
 *     y un adicional aproximado. Acá se usa una alícuota total aproximada del 21,67%:
 *         alícuota = 1/12 (aguinaldo) + 1/12 (salario vacacional) + 5% (aprox. otros) ≈ 0,2167
 *     → subsidio mensual = promedio × (1 + alícuota).
 *   - Total del período = subsidio mensual × (98 / 30).
 *
 * NOTA: la alícuota exacta la fija BPS y puede diferir; este es un valor APROXIMADO.
 */
import { fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Promedio nominal de los últimos 6 meses de remuneración (pesos). */
  promedio_6_meses: number;
}

export interface Outputs {
  dias_licencia: number;
  subsidio_mensual: number;
  subsidio_total: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

const DIAS_LICENCIA = 98; // 14 semanas
// Alícuota aproximada: aguinaldo (1/12) + salario vacacional (1/12) + adicional (5%).
const ALICUOTA = 1 / 12 + 1 / 12 + 0.05;

export function subsidioMaternidadUruguay(i: Inputs): Outputs {
  const promedio = Math.max(0, Number(i.promedio_6_meses) || 0);

  if (promedio <= 0) {
    return {
      dias_licencia: DIAS_LICENCIA,
      subsidio_mensual: 0,
      subsidio_total: 0,
      desglose: '—',
      nota: 'Ingresá el promedio de tus últimos 6 meses de remuneración para estimar el subsidio.',
    };
  }

  const subsidioMensual = promedio * (1 + ALICUOTA);
  const subsidioTotal = subsidioMensual * (DIAS_LICENCIA / 30);

  const desglose =
    `Subsidio mensual = ${fmtUYU(promedio)} × (1 + ${(ALICUOTA * 100).toFixed(2)}%) = ${fmtUYU(subsidioMensual)}. ` +
    `Total del período = ${fmtUYU(subsidioMensual)} × (98 días / 30) = ${fmtUYU(subsidioTotal)}.`;

  const nota =
    'La licencia maternal es de 14 semanas (98 días). BPS abona el 100% del promedio de los últimos 6 meses, ' +
    'más la cuota parte de aguinaldo y salario vacacional. La alícuota total (≈ 21,67%) es una APROXIMACIÓN: ' +
    'el porcentaje exacto lo fija BPS y puede variar según el caso. Es una estimación, no la liquidación oficial.';

  return {
    dias_licencia: DIAS_LICENCIA,
    subsidio_mensual: Math.round(subsidioMensual),
    subsidio_total: Math.round(subsidioTotal),
    desglose,
    nota,
    _insight: {
      type: 'highlight',
      icon: '🤱',
      text: `Con un promedio de ${fmtUYU(promedio)} mensuales, BPS te pagaría unos ${fmtUYU(subsidioMensual)} por mes durante la licencia (98 días), con un total estimado de ${fmtUYU(subsidioTotal)}.`,
    },
    _table: {
      title: 'Subsidio por maternidad BPS 2026 — estimación según promedio de 6 meses',
      headers: ['Promedio últimos 6 meses', 'Subsidio mensual aprox.', 'Total 98 días aprox.'],
      rows: [30000, 40000, 50000, 70000, 100000].map((p) => {
        const m = p * (1 + ALICUOTA);
        const tot = m * (DIAS_LICENCIA / 30);
        return [fmtUYU(p), fmtUYU(m), fmtUYU(tot)];
      }),
      note: `Estimación con alícuota aproximada del ${(ALICUOTA * 100).toFixed(2)}% (aguinaldo + salario vacacional + adicional) y 98 días de licencia. Los montos reales los liquida BPS. Fuente: BPS.`,
    },
  };
}
