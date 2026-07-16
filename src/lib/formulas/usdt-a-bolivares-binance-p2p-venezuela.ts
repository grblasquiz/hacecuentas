/**
 * USDT (Binance P2P) → Bolívares — Venezuela.
 *
 * 1 USDT está anclado ~1:1 al dólar, así que el equivalente en bolívares se
 * calcula a la tasa a la que vendés en el P2P (que suele ser la del mercado
 * paralelo, NO la BCV). La comisión del P2P la fija cada operador; el maker de
 * Binance P2P suele ser 0%, pero podés cargar la que te aplique.
 *
 *   bruto    = montoUSDT × tasaP2P
 *   comision = bruto × comisionPct / 100
 *   neto     = bruto − comision
 *
 * La tasa por defecto sale del mercado paralelo en vivo (venezuela-2026.ts,
 * refrescado por el cron); es editable porque cambia a diario y cada anuncio
 * P2P tiene su propio precio.
 *
 * Fuente de la tasa oficial de referencia: BCV. Tasa de mercado: Binance P2P /
 * Monitor Dólar (paralelo).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  montoUSDT?: number;
  tasaP2P?: number;       // Bs. por USDT; si se omite, usa el paralelo en vivo
  comisionPct?: number;   // % de comisión del P2P (default 0)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSDT = (n: number): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' USDT';

export function compute(i: Inputs): Outputs {
  const fx = VENEZUELA_2026.fx;
  const monto = Math.max(0, Number(i.montoUSDT) || 0);
  if (monto <= 0) throw new Error('Ingresá cuántos USDT querés convertir a bolívares');

  // Tasa: la que ingrese el usuario o, por defecto, la paralela en vivo (≈ P2P).
  const tasaP2P = i.tasaP2P != null && Number(i.tasaP2P) > 0 ? Number(i.tasaP2P) : fx.paralelo;
  const comisionPct = Math.max(0, Math.min(100, Number(i.comisionPct) || 0));

  const bruto = monto * tasaP2P;
  const comisionBs = bruto * (comisionPct / 100);
  const neto = bruto - comisionBs;

  // Contexto: cuánto sería a la tasa BCV oficial (la brecha explica por qué el P2P paga más).
  const equivBcv = monto * fx.bcv;
  const brechaPct = fx.bcv > 0 ? (tasaP2P / fx.bcv - 1) * 100 : 0;

  const comunes = [1, 5, 10, 20, 50, 100, 200, 500];
  const rows = comunes.map((u) => {
    const b = u * tasaP2P;
    const n = b - b * (comisionPct / 100);
    return [fmtUSDT(u), fmtVES(n)];
  });

  const narrativa =
    `${fmtUSDT(monto)} a la tasa P2P de ${fmtVES(tasaP2P)} por USDT equivalen a ${fmtVES(bruto)}` +
    (comisionPct > 0 ? `; descontando la comisión del ${comisionPct.toLocaleString('de-DE')}% (${fmtVES(comisionBs)}), recibís ${fmtVES(neto)}.` : `.`) +
    ` A la tasa BCV oficial (${fmtVES(fx.bcv)}) esos mismos USDT serían ${fmtVES(equivBcv)}: el P2P paga ${brechaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })}% más por la brecha cambiaria.`;

  return {
    bolivares: Number(neto.toFixed(2)),
    bolivaresBruto: Number(bruto.toFixed(2)),
    comisionBs: Number(comisionBs.toFixed(2)),
    tasaUsada: `${fmtVES(tasaP2P)} por USDT`,
    detalle: `${fmtUSDT(monto)} = ${fmtVES(neto)} (tasa P2P ${fmtVES(tasaP2P)}${comisionPct > 0 ? `, comisión ${comisionPct}%` : ''})`,
    _insight: { type: 'highlight', icon: '💱', text: narrativa },
    _table: {
      title: `Cuánto son los USDT en bolívares hoy (tasa ${fmtVES(tasaP2P)})`,
      headers: ['USDT', 'Bolívares (Bs.)'],
      rows,
      note: `Calculado a ${fmtVES(tasaP2P)} por USDT${comisionPct > 0 ? ` con ${comisionPct}% de comisión` : ' sin comisión'}. La tasa P2P cambia a diario y varía entre anuncios: verificá el precio del comprador antes de operar.`,
    },
  };
}
