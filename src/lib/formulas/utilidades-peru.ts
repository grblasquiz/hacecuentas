/** Utilidades Perú — reparto a trabajadores: 50% por días laborados + 50% por remuneración. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  utilidadDistribuible: number;        // monto total que la empresa reparte entre trabajadores
  diasTrabajados: number;              // días efectivamente laborados por el trabajador en el año
  remuneracionAnual: number;           // remuneración anual del trabajador
  totalDiasEmpresa: number;            // suma de días laborados por todos los trabajadores
  totalRemuneracionesEmpresa: number;  // suma de remuneraciones anuales de todos los trabajadores
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const pool = Number(i.utilidadDistribuible) || 0;
  const diasTrab = Number(i.diasTrabajados) || 0;
  const remTrab = Number(i.remuneracionAnual) || 0;
  const totalDias = Number(i.totalDiasEmpresa) || 0;
  const totalRem = Number(i.totalRemuneracionesEmpresa) || 0;
  if (pool <= 0) throw new Error('Ingresá la utilidad distribuible de la empresa');
  if (totalDias <= 0 || totalRem <= 0) throw new Error('Ingresá los totales de días y remuneraciones de la empresa');

  // 50% del pool se reparte por días laborados, 50% por remuneración percibida.
  const mitad = pool / 2;
  const porDias = mitad * (diasTrab / totalDias);
  const porRemuneracion = mitad * (remTrab / totalRem);
  let total = porDias + porRemuneracion;

  // Tope legal: la utilidad por trabajador no puede superar 18 sueldos (remuneraciones mensuales).
  const sueldoMensualAprox = remTrab / 12;
  const tope = sueldoMensualAprox * 18;
  const topeAplicado = total > tope && tope > 0;
  if (topeAplicado) total = tope;

  const _insight = {
    title: 'Tus utilidades',
    text: `Del pool de **${fmtPEN(pool)}**, por el reparto **50% por días** (${fmtPEN(porDias)}) + **50% por remuneración** (${fmtPEN(porRemuneracion)}) te corresponden **${fmtPEN(total)}**${topeAplicado ? ' (limitado al tope de 18 sueldos)' : ''}. El reparto depende del rubro de la empresa (8% comercio, 10% industria, 5% otros sobre la renta neta).`,
    tone: 'good',
    icon: '💰',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: '50% por días', value: Math.round(porDias) },
      { label: '50% por remuneración', value: Math.round(porRemuneracion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Utilidades',
    ariaLabel: `Utilidades de ${fmtPEN(total)}: ${fmtPEN(porDias)} por días laborados y ${fmtPEN(porRemuneracion)} por remuneración.`,
  };

  return {
    total: fmtPEN(total),
    porDias: fmtPEN(porDias),
    porRemuneracion: fmtPEN(porRemuneracion),
    detalle: `50% días ${fmtPEN(porDias)} + 50% remuneración ${fmtPEN(porRemuneracion)} = ${fmtPEN(total)}${topeAplicado ? ` (tope 18 sueldos: ${fmtPEN(tope)})` : ''}.`,
    _insight,
    _chart,
  };
}
