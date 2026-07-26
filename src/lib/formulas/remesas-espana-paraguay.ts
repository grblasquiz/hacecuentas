/**
 * Remesa de España a Paraguay — cuántos guaraníes llegan (EUR → PYG).
 *
 * Estima los guaraníes que recibe el destinatario tras la comisión del servicio y el
 * "spread" cambiario (margen que la remesadora aplica sobre la cotización de mercado).
 * El costo real de una remesa casi nunca es solo la comisión visible: el margen en el
 * tipo de cambio suele pesar tanto o más.
 *
 * Tipo de cambio de referencia EUR/PYG: snapshot BCP (~Gs. 7.044,31 por euro, derivado
 * de EUR/USD × USD/PYG). Es editable: cada operador ofrece su propia cotización.
 * Moneda destino: guaraníes (PYG).
 */
import { fmtPYG } from '../data/paraguay-2026.ts';

// EUR/PYG de referencia — mismo snapshot que la calc euro-a-guarani (BCP, 19-jun-2026).
const EUR_PYG_REF = 6884.58;

export interface Inputs {
  montoEur?: number;    // monto enviado (EUR)
  comision?: number;    // comisión fija del servicio (EUR)
  spreadPct?: number;   // margen cambiario sobre la cotización de referencia (%)
  tcRef?: number;       // cotización EUR/PYG a usar (opcional; default snapshot BCP)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtEUR(n: number): string {
  return '€ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function compute(i: Inputs): Outputs {
  const montoEur = Number(i.montoEur) || 0;
  if (montoEur <= 0) throw new Error('Ingresá el monto a enviar en euros');
  const comision = Math.max(0, Number(i.comision ?? 3.99));
  const spreadPct = Math.max(0, Number(i.spreadPct ?? 2));
  const tcRef = Number(i.tcRef) > 0 ? Number(i.tcRef) : EUR_PYG_REF;

  const baseEnviada = Math.max(0, montoEur - comision);
  const tcAplicado = tcRef * (1 - spreadPct / 100);
  const recibido = Math.round(baseEnviada * tcAplicado);

  // Referencia sin costos: lo que llegaría a la cotización de mercado sin comisión ni spread.
  const idealPyg = montoEur * tcRef;
  const costoTotalPyg = Math.round(idealPyg - recibido);
  const costoTotalEur = costoTotalPyg / tcRef;
  const costoPct = idealPyg > 0 ? (costoTotalPyg / idealPyg) * 100 : 0;

  const tcRefFmt = tcRef.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tcAplFmt = tcAplicado.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _table = {
    title: 'Guaraníes recibidos por monto enviado (comisión y spread del ejemplo)',
    headers: ['Enviás', 'Recibe (Gs.)', 'Costo total'],
    rows: [100, 300, 500, 1000].map((m) => {
      const base = Math.max(0, m - comision);
      const rec = Math.round(base * tcAplicado);
      const costo = Math.round(m * tcRef - rec);
      return [fmtEUR(m), fmtPYG(rec), fmtPYG(costo)];
    }),
    note: `Ejemplo con comisión ${fmtEUR(comision)} y spread ${spreadPct}% sobre una referencia de ${tcRefFmt} Gs./€. Compará siempre el tipo de cambio final ofrecido, no solo la comisión: el margen cambiario es un costo oculto.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '💸',
    text: `Enviando **${fmtEUR(montoEur)}** con comisión ${fmtEUR(comision)} y spread ${spreadPct}%, en Paraguay reciben **${fmtPYG(recibido)}** (tipo de cambio aplicado ${tcAplFmt} Gs./€). El costo total de la operación es **${fmtPYG(costoTotalPyg)}** (~${costoPct.toFixed(1)}% de lo enviado).`,
  };

  return {
    recibido: fmtPYG(recibido),
    tcAplicado: `${tcAplFmt} Gs./€`,
    costoTotal: `${fmtPYG(costoTotalPyg)} (${fmtEUR(costoTotalEur)})`,
    costoPct: `${costoPct.toFixed(1)}%`,
    detalle: `(${fmtEUR(montoEur)} − ${fmtEUR(comision)} comisión) × ${tcAplFmt} Gs./€ (ref. ${tcRefFmt} − ${spreadPct}% spread) = ${fmtPYG(recibido)}. Costo total: ${fmtPYG(costoTotalPyg)}.`,
    _insight,
    _table,
  };
}
