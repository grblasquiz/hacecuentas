/** Simulador de crédito de consumo BCI (Chile) 2026 — cuota, CAE y costo total.
 *  Amortización francesa: cuota = monto × i / (1 − (1+i)^−n).
 *  Orientativo y referencial: NO es una cotización oficial de BCI.
 *  Rango de mercado 2026 (CAE crédito de consumo): ~26%–30% (Banco Central de Chile).
 *  Tope legal: tasa máxima convencional CMF. */
import { fmtCLP } from '../data/chile-2026.ts';

const TOPE_CMF_PCT = 37.78; // TMC vigente créditos hasta UF 50 (CMF, nov-2026, referencial)

export interface Inputs {
  monto: number;        // capital solicitado en CLP
  plazoMeses: number;   // número de cuotas
  caeAnual: number;     // Carga Anual Equivalente (%) — incluye interés, comisiones y seguros
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const n = Math.round(Number(i.plazoMeses) || 0);
  const cae = Number(i.caeAnual) || 0;

  if (monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (n <= 0) throw new Error('Ingresá el plazo en meses');
  if (cae <= 0) throw new Error('Ingresá la CAE anual estimada (%)');

  const tasaMensual = cae / 100 / 12;

  // Cuota francesa. Si la tasa fuera 0, la cuota es monto/n (borde defensivo).
  const cuotaMensual = tasaMensual === 0
    ? monto / n
    : monto * tasaMensual / (1 - Math.pow(1 + tasaMensual, -n));

  const totalPagar = cuotaMensual * n;
  const interesesTotales = totalPagar - monto;
  const excedeCmf = cae > TOPE_CMF_PCT;

  const _insight = {
    title: 'Tu cuota y el costo del crédito',
    text: `Un crédito de consumo de **${fmtCLP(monto)}** a **${n} meses** con una CAE de **${cae.toString().replace('.', ',')}%** deja una cuota de **${fmtCLP(cuotaMensual)}** al mes. Vas a pagar **${fmtCLP(totalPagar)}** en total, de los cuales **${fmtCLP(interesesTotales)}** son intereses y gastos. ${excedeCmf ? '⚠️ La CAE supera el tope legal (tasa máxima convencional CMF).' : 'La CAE está dentro del tope legal CMF.'}`,
    tone: excedeCmf ? 'warning' : 'neutral',
    icon: '💳',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses y gastos', value: Math.round(interesesTotales) },
    ],
    ariaLabel: `Capital ${fmtCLP(monto)}, intereses y gastos ${fmtCLP(interesesTotales)}, total a pagar ${fmtCLP(totalPagar)}.`,
  };

  return {
    cuotaMensual: fmtCLP(cuotaMensual),
    cae: cae.toString().replace('.', ',') + '%',
    totalPagar: fmtCLP(totalPagar),
    interesesTotales: fmtCLP(interesesTotales),
    excedeTopeCmf: excedeCmf ? 'Sí — revisá la oferta' : 'No, dentro del tope',
    detalle: `Tasa mensual = ${cae.toString().replace('.', ',')}% ÷ 12 = ${(tasaMensual * 100).toFixed(4).replace('.', ',')}%. Cuota = ${fmtCLP(monto)} × i ÷ (1 − (1+i)^−${n}) = ${fmtCLP(cuotaMensual)}. Total = ${fmtCLP(cuotaMensual)} × ${n} = ${fmtCLP(totalPagar)}. Intereses y gastos = ${fmtCLP(interesesTotales)}.`,
    _insight,
    _chart,
  };
}
