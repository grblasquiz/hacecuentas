/**
 * Costo del pasaporte y la prórroga (SAIME) en Venezuela.
 *
 * El SAIME fija las tarifas en dólares (USD) pero se pagan en bolívares al
 * equivalente de la tasa BCV del día. Como la tasa BCV cambia a diario, el
 * monto en bolívares se recalcula constantemente aunque la tarifa en USD no
 * cambie.
 *
 *   costoBs = tarifaUsd × tasaBCV
 *
 * Las tarifas en USD son REFERENCIALES (verificá el monto vigente en el SAIME):
 * se pueden sobrescribir con el campo "tarifa manual". La tasa BCV por defecto
 * sale del valor oficial en vivo (venezuela-2026.ts), editable.
 *
 * Fuente: SAIME (tarifas), BCV (tasa de conversión).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  tramite?: string;          // 'pasaporte_adulto' | 'pasaporte_menor' | 'prorroga'
  tarifaUsdManual?: number;  // sobrescribe la tarifa referencial en USD
  tasaBcv?: number;          // Bs. por USD; default BCV en vivo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

// Tarifas referenciales en USD (SAIME) — editables por el usuario. Números
// redondos referenciales, NO valores fiscales stale del catálogo prohibido.
const TARIFAS_USD: Record<string, { label: string; usd: number }> = {
  pasaporte_adulto: { label: 'Pasaporte (adulto)', usd: 200 },
  pasaporte_menor: { label: 'Pasaporte (menor de edad)', usd: 100 },
  prorroga: { label: 'Prórroga de pasaporte', usd: 100 },
};

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

export function compute(i: Inputs): Outputs {
  const tramiteKey = TARIFAS_USD[String(i.tramite ?? 'pasaporte_adulto')] ? String(i.tramite) : 'pasaporte_adulto';
  const tramite = TARIFAS_USD[tramiteKey];

  const tarifaUsd = i.tarifaUsdManual != null && Number(i.tarifaUsdManual) > 0
    ? Number(i.tarifaUsdManual)
    : tramite.usd;

  const tasaBcv = i.tasaBcv != null && Number(i.tasaBcv) > 0 ? Number(i.tasaBcv) : VENEZUELA_2026.fx.bcv;
  const costoBs = tarifaUsd * tasaBcv;

  const narrativa =
    `El ${tramite.label.toLowerCase()} tiene una tarifa referencial de ${fmtUSD(tarifaUsd)}, que a la tasa BCV de ${fmtVES(tasaBcv)} por dólar equivale a ${fmtVES(costoBs)}. ` +
    `Como la tarifa está en dólares y se paga en bolívares al cambio BCV, el monto en Bs. sube o baja cada día con la tasa: verificá la tarifa vigente en el SAIME y la tasa del día antes de pagar.`;

  const rows = Object.values(TARIFAS_USD).map((t) => [t.label, fmtUSD(t.usd), fmtVES(t.usd * tasaBcv)]);

  return {
    costoBs: Number(costoBs.toFixed(2)),
    costoUsd: Number(tarifaUsd.toFixed(2)),
    tasaUsada: `${fmtVES(tasaBcv)} por dólar (BCV)`,
    detalle: `${tramite.label}: ${fmtUSD(tarifaUsd)} = ${fmtVES(costoBs)} a la tasa BCV ${fmtVES(tasaBcv)}`,
    _insight: { type: 'highlight', icon: '🛂', text: narrativa },
    _table: {
      title: `Tarifas SAIME en dólares y su equivalente en bolívares (tasa BCV ${fmtVES(tasaBcv)})`,
      headers: ['Trámite', 'Tarifa (USD)', 'Equivalente (Bs.)'],
      rows,
      note: 'Tarifas en USD referenciales: confirmá los montos vigentes en el portal del SAIME. El pago se hace en bolívares al equivalente de la tasa BCV del día, por eso el monto en Bs. cambia constantemente.',
    },
  };
}
