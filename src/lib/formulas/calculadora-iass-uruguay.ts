/**
 * Calculadora de IASS Uruguay 2026 — Impuesto de Asistencia a la Seguridad Social.
 *
 * Grava jubilaciones y pensiones. Escala mensual progresiva por franjas en BPC.
 * Mínimo no imponible = 9 BPC. Lo retiene BPS / la caja directamente de la pasividad.
 * Franjas (importadas): 0% (0–9 BPC), 6% (9–15), 24% (15–50), 30% (>50).
 */
import {
  URUGUAY_2026,
  fmtUYU,
  impuestoPorFranjasBpc,
  iassMensual,
} from '../data/uruguay-2026';

export interface Inputs {
  /** Jubilación o pensión nominal mensual (pesos). */
  pasividad: number;
}

export interface Outputs {
  pasividad: number;
  iass_mensual: number;
  iass_anual: number;
  liquido_mensual: number;
  tasa_efectiva: number;
  exento: boolean;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraIassUruguay(i: Inputs): Outputs {
  const bpc = URUGUAY_2026.bpc;
  const pasividad = Math.max(0, Number(i.pasividad) || 0);
  const mni = URUGUAY_2026.iass.minimoNoImponibleBpc * bpc;

  if (pasividad <= 0) {
    return {
      pasividad: 0,
      iass_mensual: 0,
      iass_anual: 0,
      liquido_mensual: 0,
      tasa_efectiva: 0,
      exento: true,
      desglose: '—',
      nota: 'Ingresá tu jubilación o pensión nominal mensual para calcular el IASS.',
    };
  }

  const iass = iassMensual(pasividad);
  const liquido = pasividad - iass;
  const tasaEfectiva = pasividad > 0 ? iass / pasividad : 0;
  const exento = pasividad <= mni;

  const desglose = exento
    ? `${fmtUYU(pasividad)} ≤ 9 BPC (${fmtUYU(mni)}): exento, IASS = $U 0`
    : `Escala progresiva sobre ${fmtUYU(pasividad)} → IASS ${fmtUYU(iass)} (líquido ${fmtUYU(liquido)})`;

  return {
    pasividad: Math.round(pasividad),
    iass_mensual: Math.round(iass),
    iass_anual: Math.round(iass * 12),
    liquido_mensual: Math.round(liquido),
    tasa_efectiva: tasaEfectiva,
    exento,
    desglose,
    nota: exento
      ? `Tu pasividad está por debajo del mínimo no imponible (9 BPC = ${fmtUYU(mni)}/mes): no pagás IASS.`
      : 'El IASS lo retiene BPS o tu caja de pasividad mes a mes. Si cobrás más de una pasividad, se suman para determinar la franja. Es independiente del IRPF (no se pagan ambos sobre la misma renta).',
    _insight: {
      type: 'highlight',
      icon: '💡',
      text: iass > 0
        ? `Una pasividad nominal de ${fmtUYU(pasividad)} paga ${fmtUYU(iass)} de IASS por mes (tasa efectiva ${(tasaEfectiva * 100).toFixed(1)}%): te quedan ${fmtUYU(liquido)} líquidos, ${fmtUYU(iass * 12)} de IASS al año.`
        : `Una pasividad de ${fmtUYU(pasividad)} no paga IASS: está por debajo del mínimo no imponible de 9 BPC (${fmtUYU(mni)}/mes).`,
    },
    _table: {
      title: 'Franjas del IASS 2026 (escala mensual en BPC)',
      headers: ['Franja (BPC)', 'Tramo mensual (pesos)', 'Tasa marginal'],
      rows: URUGUAY_2026.iass.franjas.map((f, idx) => {
        const desde = idx === 0 ? 0 : URUGUAY_2026.iass.franjas[idx - 1].hastaBpc;
        const hastaTxt = f.hastaBpc === Infinity ? 'en adelante' : `${f.hastaBpc} BPC`;
        const desdePesos = fmtUYU(desde * bpc);
        const hastaPesos = f.hastaBpc === Infinity ? '∞' : fmtUYU(f.hastaBpc * bpc);
        return [
          `${desde} – ${hastaTxt}`,
          f.hastaBpc === Infinity ? `desde ${desdePesos}` : `${desdePesos} – ${hastaPesos}`,
          `${(f.tasa * 100).toFixed(0)}%`,
        ];
      }),
      note: `BPC 2026 = ${fmtUYU(bpc)}. Mínimo no imponible = 9 BPC (${fmtUYU(9 * bpc)}/mes). A diferencia del IRPF, el IASS no admite el crédito por deducciones: la escala se aplica directa sobre la pasividad.`,
    },
  };
}
