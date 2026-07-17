/**
 * Impuesto sobre sucesiones (herencia) en República Dominicana. Tasa del 3%
 * sobre la masa hereditaria neta (activos menos deducciones admitidas), Ley 2569
 * modificada por la Ley 288-04. Un recargo del 50% aplica cuando el causante o
 * los bienes están en el exterior (referencial). Lo administra la DGII.
 */
import { fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  masaHereditaria: number;   // valor de los bienes de la herencia (RD$)
  deducciones?: number;      // deudas, gastos funerarios, cargas (RD$)
  recargoAusente?: string;   // 'si' si el causante/bienes están en el exterior
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const TASA = 0.03;           // 3% sobre la masa hereditaria neta
const RECARGO_AUSENTE = 0.50; // +50% del impuesto si el causante/bienes están en el exterior

export function compute(i: Inputs): Outputs {
  const masa = Number(i.masaHereditaria) || 0;
  if (masa <= 0) throw new Error('Ingresá el valor de la masa hereditaria en RD$');
  const deducciones = Math.min(Math.max(0, Number(i.deducciones) || 0), masa);
  const ausente = String(i.recargoAusente || 'no') === 'si';

  const baseImponible = Math.max(0, masa - deducciones);
  const impuestoBase = baseImponible * TASA;
  const recargo = ausente ? impuestoBase * RECARGO_AUSENTE : 0;
  const impuestoTotal = impuestoBase + recargo;
  const herenciaNeta = masa - impuestoTotal;
  const tasaEfectiva = masa > 0 ? (impuestoTotal / masa) * 100 : 0;

  const _insight = {
    title: 'Impuesto sucesoral estimado',
    text: `Sobre una masa hereditaria de **${fmtDOP(masa)}** y **${fmtDOP(deducciones)}** de deducciones, la base imponible es **${fmtDOP(baseImponible)}**. El impuesto (3%) da **${fmtDOP(impuestoBase)}**${ausente ? ` más ${fmtDOP(recargo)} de recargo por bienes/causante en el exterior` : ''}, es decir **${fmtDOP(impuestoTotal)}** (${tasaEfectiva.toFixed(2)}% de la herencia). A los herederos les quedan **${fmtDOP(herenciaNeta)}**.`,
    tone: 'neutral',
    icon: '📜',
  };
  const _chart = {
    type: 'bar',
    labels: ['Herencia neta', 'Impuesto 3%'],
    values: [Math.round(herenciaNeta), Math.round(impuestoTotal)],
    prefix: 'RD$ ',
    ariaLabel: 'Reparto entre herencia neta e impuesto sucesoral.',
  };

  return {
    impuestoTotal: fmtDOP(impuestoTotal),
    impuestoBase: fmtDOP(impuestoBase),
    recargo: fmtDOP(recargo),
    baseImponible: fmtDOP(baseImponible),
    herenciaNeta: fmtDOP(herenciaNeta),
    detalle: `Base ${fmtDOP(baseImponible)} × 3% = ${fmtDOP(impuestoBase)}${ausente ? ` + recargo ${fmtDOP(recargo)}` : ''} = ${fmtDOP(impuestoTotal)}.`,
    _insight,
    _chart,
  };
}
