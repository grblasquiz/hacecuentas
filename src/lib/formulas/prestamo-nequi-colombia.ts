/**
 * Préstamos Nequi (Colombia) — cuota y costo total de los 3 productos vigentes jul-2026:
 *  · Salvavidas: 3,50% EM, $100.000–$500.000, plazo fijo 1 mes.
 *  · Crédito de Bajo Monto: 1,79%–4,13% EM, $100.000–$5.550.000, hasta 48 meses.
 *  · Propulsor (libre inversión): 1,49%–1,85% EM, $100.000–$25.000.000, hasta 60 meses.
 * Amortización francesa con tasa efectiva mensual. Tasas/parámetros importados de la data país.
 * No incluye seguro de vida ni comisión de fianza/FGA (varían por perfil): se informan como aviso.
 */
import { NEQUI_PRESTAMOS_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  producto: 'salvavidas' | 'bajo_monto' | 'propulsor';
  monto: number;
  plazo_meses: number;
  tasa_em?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const N = NEQUI_PRESTAMOS_2026;
  const monto = Number(i.monto);
  if (!Number.isFinite(monto) || monto <= 0) throw new Error('Ingresa el monto del préstamo');

  const producto = i.producto === 'bajo_monto' ? 'bajo_monto' : i.producto === 'propulsor' ? 'propulsor' : 'salvavidas';
  const cfg = producto === 'salvavidas' ? N.salvavidas : producto === 'bajo_monto' ? N.bajoMonto : N.propulsor;
  const nombre = producto === 'salvavidas' ? 'Préstamo Salvavidas' : producto === 'bajo_monto' ? 'Crédito de Bajo Monto' : 'Préstamo Propulsor';

  const emDefault = producto === 'salvavidas' ? N.salvavidas.emPct
    : producto === 'bajo_monto' ? N.bajoMonto.emMaxPct
    : 1.83; // Propulsor: valor típico 2026 según prensa (rango 1,49–1,85)
  const emPct = Number(i.tasa_em) > 0 ? Number(i.tasa_em) : emDefault;
  const im = emPct / 100;
  const eaPct = (Math.pow(1 + im, 12) - 1) * 100;

  const plazoMax = producto === 'salvavidas' ? 1 : producto === 'bajo_monto' ? N.bajoMonto.plazoMesesMax : N.propulsor.plazoMesesMax;
  let n = producto === 'salvavidas' ? 1 : Math.max(1, Math.round(Number(i.plazo_meses) || 1));
  const plazoRecortado = n > plazoMax;
  if (plazoRecortado) n = plazoMax;

  const cuota = im > 0 ? monto * im / (1 - Math.pow(1 + im, -n)) : monto / n;
  const totalPagado = cuota * n;
  const intereses = totalPagado - monto;

  const avisos: string[] = [];
  if (monto < (cfg as any).min) avisos.push(`Nequi presta desde ${fmtCOP((cfg as any).min)} en este producto.`);
  if (monto > (cfg as any).max) avisos.push(`El máximo del ${nombre} es ${fmtCOP((cfg as any).max)}.`);
  if (plazoRecortado) avisos.push(`El plazo máximo es ${plazoMax} ${plazoMax === 1 ? 'mes' : 'meses'}: se calculó con ${plazoMax}.`);
  if (producto === 'salvavidas') avisos.push('El Salvavidas se paga en un único pago a 30 días e incluye un seguro de vida que se suma al total.');
  if (producto === 'bajo_monto') avisos.push('Suma el seguro de vida ($2.000/mes por millón) y la comisión FGA (0–4%) según tu perfil.');
  if (producto === 'propulsor') avisos.push('Suma la comisión de fianza (0–17,8% del total, IVA incluido) y el seguro de vida según tu perfil.');

  const _insight = {
    title: n === 1 ? `Pagas ${fmtCOP(totalPagado)} en 30 días` : `Cuota estimada: ${fmtCOP(cuota)}/mes`,
    text: `${nombre} de **${fmtCOP(monto)}** al **${emPct.toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EM** (≈${eaPct.toLocaleString('es-CO', { maximumFractionDigits: 1 })}% EA)${n > 1 ? ` a **${n} meses**: cuota de **${fmtCOP(cuota)}**` : ''}. Total a pagar **${fmtCOP(totalPagado)}**, de los cuales **${fmtCOP(intereses)}** son intereses. ${avisos.length ? avisos[avisos.length - 1] : ''}`,
    tone: intereses > monto * 0.3 ? 'warn' : 'neutral',
    icon: '📱',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(intereses) },
    ],
    prefix: '$',
    centerValue: fmtCOP(totalPagado),
    ariaLabel: `Del total a pagar ${fmtCOP(totalPagado)}, ${fmtCOP(monto)} son capital y ${fmtCOP(intereses)} intereses.`,
  };

  return {
    cuota_mensual: n === 1 ? `${fmtCOP(totalPagado)} (pago único a 30 días)` : fmtCOP(cuota),
    total_a_pagar: fmtCOP(totalPagado),
    intereses_totales: fmtCOP(intereses),
    tasa_aplicada: `${emPct.toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EM ≈ ${eaPct.toLocaleString('es-CO', { maximumFractionDigits: 1 })}% EA`,
    detalle: `${nombre}: ${fmtCOP(monto)} a ${n} ${n === 1 ? 'mes' : 'meses'} al ${emPct.toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EM → ${n === 1 ? 'pago único' : 'cuota'} ${fmtCOP(n === 1 ? totalPagado : cuota)}. ${avisos.join(' ')}`,
    _insight,
    _chart,
  };
}
