/**
 * Compras en el Exterior / Courier — Uruguay 2026.
 *
 * Nuevo régimen de franquicias de envíos postales, vigente desde el 1º de mayo de
 * 2026 (Ministerio de Economía y Finanzas / Aduanas):
 *
 *   RÉGIMEN DE FRANQUICIA:
 *     - Hasta 3 envíos por año con un tope ACUMULADO de USD 800 al año.
 *     - Paga IVA (22%) sobre el valor de la compra, EXCEPTO:
 *         · Envíos desde EEUU de hasta USD 200 c/u (acuerdo TIFA): 0% de IVA.
 *
 *   RÉGIMEN SIMPLIFICADO (si superás los 3 envíos o no cumplís los requisitos):
 *     - Tasa única del 60% sobre el valor del envío.
 *     - Mínimo USD 20; tope de USD 800 por envío.
 *
 * IVA (22%) importado de src/lib/data/uruguay-2026.ts. El tipo de cambio es un
 * insumo del usuario (por defecto, pizarra BROU venta del snapshot del módulo).
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026.ts';

export interface Inputs {
  /** Valor de la compra en dólares (USD). */
  valorUsd: number;
  /** Régimen: 'franquicia' (IVA) o 'simplificado' (60%). */
  regimen?: string;
  /** Origen del envío: 'eeuu' u 'otro'. */
  origen?: string;
  /** Tipo de cambio USD → UYU. */
  tipoCambio?: number;
}

export interface Outputs {
  impuestoUsd: string;
  impuestoUyu: string;
  totalUsd: string;
  totalUyu: string;
  detalle: string;
  _insight?: any;
}

const IVA = URUGUAY_2026.iva.basica; // 22%
const TASA_SIMPLIFICADO = 0.6; // 60% tasa única
const MIN_SIMPLIFICADO_USD = 20;

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valorUsd) || 0);
  const regimen = String(i.regimen || 'franquicia') === 'simplificado' ? 'simplificado' : 'franquicia';
  const origen = String(i.origen || 'otro') === 'eeuu' ? 'eeuu' : 'otro';
  const tc = Number(i.tipoCambio) > 0 ? Number(i.tipoCambio) : URUGUAY_2026.usd.brouVenta;

  let impuestoUsd = 0;
  let motivo = '';

  if (regimen === 'simplificado') {
    impuestoUsd = Math.max(valor * TASA_SIMPLIFICADO, valor > 0 ? MIN_SIMPLIFICADO_USD : 0);
    motivo = `Régimen simplificado: 60% sobre ${fmtDolar(valor)} (mínimo USD 20).`;
  } else {
    // Franquicia
    const exentoEeuu = origen === 'eeuu' && valor <= 200;
    if (exentoEeuu) {
      impuestoUsd = 0;
      motivo = `Franquicia desde EEUU hasta USD 200: exento de IVA (acuerdo TIFA).`;
    } else {
      impuestoUsd = valor * IVA;
      motivo = `Franquicia: IVA ${(IVA * 100).toFixed(0)}% sobre ${fmtDolar(valor)}.`;
    }
  }

  const totalUsd = valor + impuestoUsd;
  const impuestoPesos = impuestoUsd * tc;
  const totalPesos = totalUsd * tc;

  const detalle =
    `${motivo} Impuesto: ${fmtDolar(impuestoUsd)} (${fmtUYU(impuestoPesos)} a $U ${tc.toFixed(2)}/USD). ` +
    `Total con impuesto: ${fmtDolar(totalUsd)} (${fmtUYU(totalPesos)}).`;

  return {
    impuestoUsd: fmtDolar(impuestoUsd),
    impuestoUyu: fmtUYU(impuestoPesos),
    totalUsd: fmtDolar(totalUsd),
    totalUyu: fmtUYU(totalPesos),
    detalle,
    _insight: {
      type: 'highlight',
      icon: '📦',
      text:
        impuestoUsd <= 0
          ? `Tu compra de **${fmtDolar(valor)}** entra **sin impuestos** por la franquicia desde EEUU (hasta USD 200). Pagás solo ${fmtDolar(valor)} (${fmtUYU(totalPesos)}).`
          : `Sobre una compra de **${fmtDolar(valor)}**, el impuesto es **${fmtDolar(impuestoUsd)}** y el total queda en **${fmtDolar(totalUsd)}** (${fmtUYU(totalPesos)} a $U ${tc.toFixed(2)}/USD).`,
      tone: impuestoUsd <= 0 ? 'good' : 'info',
    },
  };
}

/** Formatea un monto en dólares: "USD 1.234,50". */
function fmtDolar(n: number): string {
  return 'USD ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);
}
