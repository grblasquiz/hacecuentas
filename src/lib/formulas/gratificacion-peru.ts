/** Gratificación Perú — julio y diciembre (Ley 27735)
 *  Equivalente a un sueldo completo por semestre
 *  + bonificación extraordinaria del 9% (Ley 29351)
 */

export interface Inputs {
  remuneracionMensual: number;
  asignacionFamiliar: string;
  mesesCompletos: number;
  diasAdicionales: number;
  periodo: string;
}

export interface Outputs {
  remuneracionComputable: number;
  gratificacionProporcional: number;
  bonificacion9Porc: number;
  gratificacionTotal: number;
  formula: string;
  explicacion: string;
}

export function gratificacionPeru(i: Inputs): Outputs {
  const rem = Number(i.remuneracionMensual);
  const tieneAsignacion = i.asignacionFamiliar === 'si' || i.asignacionFamiliar === 'true';
  const meses = Math.min(6, Math.max(0, Number(i.mesesCompletos) || 6));
  const dias = Math.min(30, Math.max(0, Number(i.diasAdicionales) || 0));
  const periodo = String(i.periodo || 'julio');

  if (!rem || rem <= 0) throw new Error('Ingresá tu remuneración mensual');

  // RMV 2026 estimada
  const RMV = 1_130;
  const asignacion = tieneAsignacion ? RMV * 0.10 : 0;
  const remuneracionComputable = rem + asignacion;

  // Gratificación proporcional: (rem / 6) × meses + (rem / 6 / 30) × días
  const gratificacionProporcional = (remuneracionComputable / 6) * meses + (remuneracionComputable / 6 / 30) * dias;

  // Bonificación extraordinaria: 9% de la gratificación (Ley 29351)
  // Este 9% reemplaza el aporte a EsSalud que no se descuenta
  const bonificacion9Porc = gratificacionProporcional * 0.09;

  const gratificacionTotal = gratificacionProporcional + bonificacion9Porc;

  const periodoStr = periodo === 'julio' ? 'Fiestas Patrias (julio)' : 'Navidad (diciembre)';
  const semestre = periodo === 'julio' ? 'enero-junio' : 'julio-noviembre';

  const formula = `Gratificación = (S/${remuneracionComputable.toFixed(2)} / 6) × ${meses} + 9% = S/${gratificacionTotal.toFixed(2)}`;
  const explicacion = `Gratificación ${periodoStr} (semestre ${semestre}): remuneración computable S/${remuneracionComputable.toFixed(2)}${tieneAsignacion ? ` (incluye asignación familiar)` : ''}. Proporcional: S/${gratificacionProporcional.toFixed(2)} (${meses} meses, ${dias} días). Bonificación extraordinaria 9%: S/${bonificacion9Porc.toFixed(2)}. Total a recibir: S/${gratificacionTotal.toFixed(2)}. La gratificación NO está afecta a descuentos (ONP/AFP, EsSalud). Se paga en la primera quincena de ${periodo === 'julio' ? 'julio' : 'diciembre'}.`;

  return {
    remuneracionComputable: Number(remuneracionComputable.toFixed(2)),
    gratificacionProporcional: Number(gratificacionProporcional.toFixed(2)),
    bonificacion9Porc: Number(bonificacion9Porc.toFixed(2)),
    gratificacionTotal: Number(gratificacionTotal.toFixed(2)),
    formula,
    explicacion,
  };
}
