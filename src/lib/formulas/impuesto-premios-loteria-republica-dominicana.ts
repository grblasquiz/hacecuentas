/**
 * Impuesto (retención de ISR) sobre PREMIOS de lotería, bancas y juegos de azar
 * — República Dominicana. Es un impuesto AL PREMIO: la retención es pago único y
 * definitivo del ISR y la hace el pagador del premio (Art. 309, Cód. Trib. Ley
 * 11-92, mod. Ley 253-12). NO es una calculadora de apuestas ni promueve el juego.
 *
 * Dos regímenes (DGII, Guía 11):
 *   - Bancas de lotería y apuestas deportivas: escala por tramos sobre el premio
 *     total (no marginal). Exento hasta RD$100.000; 10% (100.001–500.000),
 *     15% (500.001–1.000.000), 25% (más de 1.000.000).
 *   - Loterías nacionales, lotos, fracatanes, premios electrónicos y de campañas
 *     promocionales: 25% fijo sobre el premio.
 */
import { PREMIOS_LOTERIA_DO, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  premio: number;   // monto bruto del premio (RD$)
  tipo?: string;    // 'banca' (escala) | 'loteria' (25% fijo)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/** Tasa aplicable a un premio de banca de apuestas según el tramo. */
function tasaBanca(premio: number): number {
  if (premio <= PREMIOS_LOTERIA_DO.exentoHasta) return 0;
  for (const t of PREMIOS_LOTERIA_DO.bancas) {
    if (premio >= t.desde && premio <= t.hasta) return t.tasa;
  }
  return PREMIOS_LOTERIA_DO.bancas[PREMIOS_LOTERIA_DO.bancas.length - 1].tasa;
}

export function compute(i: Inputs): Outputs {
  const premio = num(i.premio, 0);
  if (!(premio > 0)) throw new Error('Ingresá el monto del premio en RD$');
  const tipo = String(i.tipo || 'banca') === 'loteria' ? 'loteria' : 'banca';

  const tasa = tipo === 'loteria' ? PREMIOS_LOTERIA_DO.tasaFijaLoteria : tasaBanca(premio);
  const impuesto = premio * tasa;
  const neto = premio - impuesto;
  const tasaPct = (tasa * 100).toFixed(0);

  const exento = tipo === 'banca' && premio <= PREMIOS_LOTERIA_DO.exentoHasta;

  const detalle = tipo === 'loteria'
    ? `Lotería / premio promocional: retención fija del 25%. ${fmtDOP(premio)} × 25% = ${fmtDOP(impuesto)} de impuesto; recibís ${fmtDOP(neto)}.`
    : exento
      ? `Banca de apuestas: los premios de hasta ${fmtDOP(PREMIOS_LOTERIA_DO.exentoHasta)} están exentos. Recibís los ${fmtDOP(premio)} completos.`
      : `Banca de apuestas: el premio de ${fmtDOP(premio)} cae en el tramo del ${tasaPct}%. ${fmtDOP(premio)} × ${tasaPct}% = ${fmtDOP(impuesto)}; recibís ${fmtDOP(neto)}.`;

  const _insight = {
    title: exento ? `Premio exento: cobrás ${fmtDOP(neto)}` : `Te retienen ${fmtDOP(impuesto)} de ISR`,
    text: exento
      ? `Los premios de banca de hasta **${fmtDOP(PREMIOS_LOTERIA_DO.exentoHasta)}** no pagan retención de ISR: cobrás el premio completo de **${fmtDOP(premio)}**.`
      : `Sobre un premio de **${fmtDOP(premio)}** te retienen **${fmtDOP(impuesto)}** (**${tasaPct}%** de ISR, pago único y definitivo${tipo === 'loteria' ? '' : ' según el tramo'}). Cobrás **${fmtDOP(neto)}** libres. La retención la aplica quien paga el premio: no tenés que declararla aparte.`,
    tone: exento ? 'good' as const : 'neutral' as const,
    icon: '🎟️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Recibís (neto)', value: Math.round(neto) },
      ...(impuesto > 0 ? [{ label: `Impuesto (${tasaPct}%)`, value: Math.round(impuesto) }] : []),
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(premio),
    centerLabel: 'Premio bruto',
    ariaLabel: 'Reparto del premio entre el neto que recibís y el impuesto retenido',
  };

  return {
    impuesto: fmtDOP(impuesto),
    neto: fmtDOP(neto),
    tasaAplicada: exento ? 'Exento (0%)' : `${tasaPct}%`,
    detalle,
    _insight,
    _chart,
  };
}
