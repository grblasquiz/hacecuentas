/** CTS (Compensación por Tiempo de Servicios) Perú
 *  D.S. 001-97-TR: depósito semestral (mayo y noviembre)
 *  CTS = (remuneración computable / 12) × meses + (rem / 12 / 30) × días
 */

export interface Inputs {
  remuneracionMensual: number;
  asignacionFamiliar: string;
  gratificacionUltima: number;
  mesesCompletos: number;
  diasAdicionales: number;
}

export interface Outputs {
  remuneracionComputable: number;
  sextoGratificacion: number;
  baseCalculo: number;
  ctsSemestral: number;
  ctsAnual: number;
  formula: string;
  explicacion: string;
}

export function ctsPeru(i: Inputs): Outputs {
  const rem = Number(i.remuneracionMensual);
  const tieneAsignacion = i.asignacionFamiliar === 'si' || i.asignacionFamiliar === 'true';
  const gratificacion = Number(i.gratificacionUltima) || 0;
  const meses = Math.min(6, Math.max(0, Number(i.mesesCompletos) || 6));
  const dias = Math.min(30, Math.max(0, Number(i.diasAdicionales) || 0));

  if (!rem || rem <= 0) throw new Error('Ingresá tu remuneración mensual');

  // RMV 2026 estimada
  const RMV = 1_130;

  // Asignación familiar: 10% de la RMV
  const asignacion = tieneAsignacion ? RMV * 0.10 : 0;
  const remuneracionComputable = rem + asignacion;

  // 1/6 de la última gratificación (jul o dic)
  const sextoGratificacion = gratificacion > 0 ? gratificacion / 6 : remuneracionComputable / 6;

  // Base de cálculo = remuneración computable + 1/6 gratificación
  const baseCalculo = remuneracionComputable + sextoGratificacion;

  // CTS semestral = (base / 12) × meses + (base / 12 / 30) × días
  const ctsSemestral = (baseCalculo / 12) * meses + (baseCalculo / 12 / 30) * dias;
  const ctsAnual = ctsSemestral * 2; // Estimado anual (2 semestres)

  const formula = `CTS = (S/${baseCalculo.toFixed(2)} / 12) × ${meses} meses + (S/${baseCalculo.toFixed(2)} / 360) × ${dias} días = S/${ctsSemestral.toFixed(2)}`;
  const explicacion = `Remuneración computable: S/${remuneracionComputable.toFixed(2)}${tieneAsignacion ? ` (incluye asignación familiar S/${asignacion.toFixed(2)})` : ''}. 1/6 gratificación: S/${sextoGratificacion.toFixed(2)}. Base CTS: S/${baseCalculo.toFixed(2)}. CTS del semestre (${meses} meses, ${dias} días): S/${ctsSemestral.toFixed(2)}. Estimado anual (2 depósitos): S/${ctsAnual.toFixed(2)}. Se deposita hasta el 15 de mayo y 15 de noviembre.`;

  return {
    remuneracionComputable: Number(remuneracionComputable.toFixed(2)),
    sextoGratificacion: Number(sextoGratificacion.toFixed(2)),
    baseCalculo: Number(baseCalculo.toFixed(2)),
    ctsSemestral: Number(ctsSemestral.toFixed(2)),
    ctsAnual: Number(ctsAnual.toFixed(2)),
    formula,
    explicacion,
  };
}
