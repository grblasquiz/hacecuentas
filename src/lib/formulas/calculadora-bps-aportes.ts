/**
 * Calculadora de aportes BPS 2026 (montepío + FONASA + FRL) — aportes personales del trabajador.
 * Desglose de cada componente, total y % efectivo sobre el nominal.
 * Tasas desde uruguay-2026.ts (no hardcodea).
 */
import {
  URUGUAY_2026,
  fmtUYU,
  aportesBpsPersonales,
} from '../data/uruguay-2026.ts';

export interface Inputs {
  nominal: number;
  conyuge?: string; // 'si' | 'no'
  hijos?: string;   // 'si' | 'no'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraBpsAportes(i: Inputs): Outputs {
  const nominal = Number(i.nominal) || 0;
  if (nominal <= 0) throw new Error('Ingresá tu sueldo nominal mensual');

  const conConyuge = String(i.conyuge || 'no') === 'si';
  const conHijos = String(i.hijos || 'no') === 'si';

  const ap = aportesBpsPersonales(nominal, conConyuge, conHijos);
  const efectivoPct = (ap.total / nominal) * 100;
  const efectivoStr = efectivoPct.toLocaleString('es-UY', { maximumFractionDigits: 2 });
  const tasaFonasaPct = (ap.tasaFonasa * 100).toLocaleString('es-UY', { maximumFractionDigits: 1 });
  const umbral = URUGUAY_2026.bps.fonasa.umbralBpc * URUGUAY_2026.bpc;

  const _insight = {
    title: 'Tus aportes a BPS',
    text:
      `Sobre un nominal de **${fmtUYU(nominal)}** aportás **${fmtUYU(ap.total)}** a BPS (**${efectivoStr}%** del sueldo): ` +
      `**${fmtUYU(ap.montepio)}** de montepío (15%), **${fmtUYU(ap.fonasa)}** de FONASA (${tasaFonasaPct}%) y **${fmtUYU(ap.frl)}** de FRL (0,1%). ` +
      `Tu FONASA es del ${tasaFonasaPct}% porque ${nominal > umbral ? `tu sueldo supera 2,5 BPC (${fmtUYU(umbral)})` : `tu sueldo no supera 2,5 BPC (${fmtUYU(umbral)})`}` +
      `${conConyuge && conHijos ? ' y tenés cónyuge e hijos a cargo' : conConyuge ? ' y tenés cónyuge a cargo' : conHijos ? ' y tenés hijos a cargo' : ' y no declarás familiares a cargo'}.`,
    tone: 'info',
    icon: '🏛️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Montepío 15%', value: Math.round(ap.montepio) },
      { label: `FONASA ${tasaFonasaPct}%`, value: Math.round(ap.fonasa) },
      { label: 'FRL 0,1%', value: Math.round(ap.frl) },
    ].filter((s) => s.value > 0),
    prefix: '$U ',
    centerValue: fmtUYU(ap.total),
    centerLabel: 'Total BPS',
    ariaLabel: `Total BPS ${fmtUYU(ap.total)}: montepío ${fmtUYU(ap.montepio)}, FONASA ${fmtUYU(ap.fonasa)}, FRL ${fmtUYU(ap.frl)}.`,
  };

  return {
    totalAportes: `${fmtUYU(ap.total)} (${efectivoStr}%)`,
    montepio: fmtUYU(ap.montepio),
    fonasa: `${fmtUYU(ap.fonasa)} (${tasaFonasaPct}%)`,
    frl: fmtUYU(ap.frl),
    nominal: fmtUYU(nominal),
    detalle:
      `Montepío ${fmtUYU(ap.montepio)} + FONASA ${fmtUYU(ap.fonasa)} + FRL ${fmtUYU(ap.frl)} = ${fmtUYU(ap.total)} (${efectivoStr}% del nominal).`,
    _insight,
    _chart,
  };
}
