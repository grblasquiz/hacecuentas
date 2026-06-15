/**
 * Impuesto a la Salida de Divisas (ISD) — Ecuador 2026.
 * Tarifa general 5% (SRI). Exenciones:
 *   - Consumos y retiros con tarjeta de crédito/débito en el exterior: exento hasta
 *     USD 5.188,26 ANUALES (Resol. SRI NAC-DGERCGC24-00000045, vigente 2025-2027).
 *   - Transferencias/envíos al exterior (no por tarjeta) y efectivo al salir del país:
 *     exento hasta 3 SBU = USD 1.446,00 en 2026 (por período quincenal en transferencias).
 * Fuente: SRI, https://www.sri.gob.ec/impuesto-a-la-salida-de-divisas-isd
 * Ecuador está dolarizado → todos los montos en USD ("$").
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export type TipoOperacionISD = 'tarjeta' | 'transferencia' | 'otra';

export interface Inputs {
  /** Monto de la transacción / consumo en USD. */
  monto: number;
  /** Tipo de operación: 'tarjeta' (consumos/retiros con tarjeta en el exterior, exento anual),
   *  'transferencia' (envío/efectivo al exterior, exento 3 SBU) u 'otra' (sin exención: grava todo). */
  tipoOperacion?: TipoOperacionISD;
  /** Solo para 'tarjeta': cuánto del cupo exento anual ya usaste antes de esta transacción (USD). */
  exentoUsado?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto de la transacción o consumo en USD');

  const tipo: TipoOperacionISD = i.tipoOperacion ?? 'tarjeta';
  const tarifa = ECUADOR_2026.isdTarifa;                       // 5%
  const exentoTarjeta = ECUADOR_2026.isdExentoTarjetaAnual;    // 5.188,26 / año
  const exentoTransf = ECUADOR_2026.isdExentoTransfSBU * ECUADOR_2026.sbu; // 3 × 482 = 1.446

  // Determinar el monto exento aplicable y el remanente disponible según el tipo.
  let exentoTotal = 0;
  let exentoUsado = 0;
  let etiquetaExencion = 'Sin exención (toda la operación grava)';

  if (tipo === 'tarjeta') {
    exentoTotal = exentoTarjeta;
    exentoUsado = Math.min(Math.max(Number(i.exentoUsado) || 0, 0), exentoTotal);
    etiquetaExencion = 'Cupo anual con tarjeta (USD 5.188,26)';
  } else if (tipo === 'transferencia') {
    exentoTotal = exentoTransf;
    exentoUsado = 0; // la exención de 3 SBU se aplica por operación/quincena, no acumula campo aparte
    etiquetaExencion = 'Exención de 3 SBU (USD 1.446,00)';
  } else {
    exentoTotal = 0;
    exentoUsado = 0;
  }

  const exentoDisponible = Math.max(0, exentoTotal - exentoUsado);
  const montoExento = Math.min(monto, exentoDisponible);
  const baseGravada = Math.max(0, monto - exentoDisponible);
  const isd = baseGravada * tarifa;
  const totalConIsd = monto + isd;
  const tasaEfectiva = monto > 0 ? (isd / monto) * 100 : 0;

  // Insight legible según el resultado.
  let insightText: string;
  let tone: 'positive' | 'neutral' | 'warning';
  if (isd <= 0) {
    insightText = `Esta operación de **${fmtUSDec(monto)}** NO paga ISD: queda dentro de la exención (${etiquetaExencion}). Te quedan **${fmtUSDec(Math.max(0, exentoDisponible - monto))}** de margen exento.`;
    tone = 'positive';
  } else if (montoExento > 0) {
    insightText = `De los **${fmtUSDec(monto)}**, **${fmtUSDec(montoExento)}** quedan exentos y **${fmtUSDec(baseGravada)}** gravan al 5%. Pagás **${fmtUSDec(isd)}** de ISD (tasa efectiva ${tasaEfectiva.toFixed(2)}%).`;
    tone = 'warning';
  } else {
    insightText = `Toda la operación grava: ISD = ${fmtUSDec(baseGravada)} × 5% = **${fmtUSDec(isd)}**. Costo total con el impuesto: **${fmtUSDec(totalConIsd)}**.`;
    tone = 'warning';
  }

  const _insight = {
    title: 'Tu Impuesto a la Salida de Divisas',
    text: insightText,
    tone,
    icon: '🌍',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Monto exento', value: Math.round(montoExento * 100) / 100 },
      { label: 'Base gravada (5%)', value: Math.round(baseGravada * 100) / 100 },
      { label: 'ISD a pagar', value: Math.round(isd * 100) / 100 },
    ],
    ariaLabel: `Exento ${fmtUSDec(montoExento)}, base gravada ${fmtUSDec(baseGravada)}, ISD ${fmtUSDec(isd)}.`,
  };

  return {
    isd: fmtUSDec(isd),
    baseGravada: fmtUSDec(baseGravada),
    montoExento: fmtUSDec(montoExento),
    exentoDisponible: fmtUSDec(exentoDisponible),
    totalConIsd: fmtUSDec(totalConIsd),
    tasaEfectiva: tasaEfectiva.toFixed(2) + '%',
    detalle: `Operación ${fmtUSDec(monto)} · ${etiquetaExencion} · Exento ${fmtUSDec(montoExento)} · Base gravada ${fmtUSDec(baseGravada)} × 5% = ISD ${fmtUSDec(isd)}.`,
    _insight,
    _chart,
  };
}
