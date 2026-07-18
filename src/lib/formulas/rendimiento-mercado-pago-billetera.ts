import { RENDIMIENTOS_JUL_2026 as R, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Rendimiento del dinero en Mercado Pago (FCI money market, acreditación diaria):
 * interés compuesto diario a TNA editable (27,71% al 03-jul-2026) vs plazo fijo a interés
 * simple por el mismo período (BNA 19% TNA a 30 días, jul-2026).
 */
export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0);
  const dias = Math.min(3650, Math.max(1, Math.round(Number(i.dias) || 30)));
  const tna = Math.min(500, Math.max(0, Number(i.tna) || R.mercadoPagoTNA));
  const tnaPf = Math.min(500, Math.max(0, Number(i.tnaPlazoFijo) || R.plazoFijoBnaTNA));

  const tasaDiaria = tna / 100 / 365;
  const saldoFinal = monto * Math.pow(1 + tasaDiaria, dias);
  const rendimiento = saldoFinal - monto;
  const primerDia = monto * tasaDiaria;
  const tea = (Math.pow(1 + tasaDiaria, 365) - 1) * 100;

  // Plazo fijo: interés simple sobre el período (no capitaliza dentro del plazo)
  const interesPf = monto * (tnaPf / 100 / 365) * dias;
  const diferencia = rendimiento - interesPf;

  const fmtPct = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  const out: Outputs = {
    rendimientoGanado: fmtARS(rendimiento),
    saldoFinal: fmtARS(saldoFinal),
    rendimientoPrimerDia: fmtARS(primerDia, primerDia < 100 ? 2 : 0),
    teaEfectiva: fmtPct(tea),
    vsPlazoFijo: (diferencia >= 0 ? '+' : '−') + fmtARS(Math.abs(diferencia)),
  };

  out._insight = {
    title: `Ganás ${fmtARS(rendimiento)} en ${dias} días`,
    text:
      `Con **${fmtARS(monto)}** a TNA **${fmtPct(tna)}** con acreditación diaria, en ${dias} días juntás **${fmtARS(rendimiento)}** (TEA ${fmtPct(tea)}). ` +
      (diferencia >= 0
        ? `Un plazo fijo a ${fmtPct(tnaPf)} TNA por el mismo período rinde **${fmtARS(interesPf)}**: la billetera te deja **${fmtARS(diferencia)}** más y la plata queda disponible en el momento.`
        : `Un plazo fijo a ${fmtPct(tnaPf)} TNA por el mismo período rinde **${fmtARS(interesPf)}**, es decir **${fmtARS(-diferencia)}** más que la billetera, pero inmoviliza la plata hasta el vencimiento.`) +
      ' La TNA de la billetera cambia sin aviso: verificala en la app antes de decidir.',
    tone: diferencia >= 0 ? 'good' : 'neutral',
    icon: '💸',
  };
  return out;
}
