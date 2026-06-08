/** Utilidades (Ecuador) — 15% de la utilidad de la empresa repartida entre trabajadores.
 *  Estimación proporcional a los días trabajados sobre el total de días de la nómina. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  utilidadEmpresa: number;   // utilidad líquida anual de la empresa
  diasTrabajados: number;    // días trabajados por el trabajador en el ejercicio
  totalDiasEmpresa: number;  // suma de días trabajados por TODA la nómina (denominador del reparto)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const utilidad = Number(i.utilidadEmpresa) || 0;
  const diasTrab = Math.max(0, Number(i.diasTrabajados) || 0);
  const totalDias = Math.max(0, Number(i.totalDiasEmpresa) || 0);
  if (utilidad <= 0) throw new Error('Ingresá la utilidad de la empresa');
  if (totalDias <= 0) throw new Error('Ingresá el total de días de la nómina');

  // 15% a repartir. Simplificación: se reparte de forma proporcional a los días
  // trabajados sobre el total de días de la nómina (aproxima el 10% por trabajador;
  // el 5% por cargas familiares se omite por falta de datos).
  const masaUtilidades = utilidad * ECUADOR_2026.utilidades; // 15%
  const proporcion = totalDias > 0 ? diasTrab / totalDias : 0;
  const utilidadTrabajador = masaUtilidades * proporcion;

  const _insight = {
    title: 'Tus utilidades estimadas',
    text: `La empresa reparte el **15%** de su utilidad (**${fmtUSDec(masaUtilidades)}**) entre todos los trabajadores. Por tus **${diasTrab} días** trabajados sobre **${totalDias}** de la nómina (${(proporcion * 100).toFixed(1)}%), te corresponderían aproximadamente **${fmtUSDec(utilidadTrabajador)}**.`,
    tone: 'good',
    icon: '📈',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(utilidadTrabajador * 100) / 100,
    min: 0,
    max: Math.max(1, Math.round(masaUtilidades * 100) / 100),
    label: fmtUSDec(utilidadTrabajador),
    ariaLabel: `Utilidades del trabajador ${fmtUSDec(utilidadTrabajador)} de una masa de ${fmtUSDec(masaUtilidades)}.`,
  };

  return {
    utilidadTrabajador: fmtUSDec(utilidadTrabajador),
    masaUtilidades: fmtUSDec(masaUtilidades),
    proporcion: (proporcion * 100).toFixed(1) + '%',
    detalle: `Utilidad empresa ${fmtUSDec(utilidad)} × 15% = ${fmtUSDec(masaUtilidades)} a repartir; tu parte ≈ ${(proporcion * 100).toFixed(1)}% = ${fmtUSDec(utilidadTrabajador)}.`,
    _insight,
    _chart,
  };
}
