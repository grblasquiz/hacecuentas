/**
 * Calculadora de ratio expensas vs alquiler
 * Ratio = expensas / alquiler × 100
 */

export interface ExpensasVsAlquilerRatioInputs {
  alquilerMensual: number;
  expensasMensuales: number;
  serviciosMensuales?: number;
}

export interface ExpensasVsAlquilerRatioOutputs {
  ratioExpensas: string;
  costoTotalVivienda: number;
  costoAnual: number;
  detalle: string;
}

export function expensasVsAlquilerRatio(
  inputs: ExpensasVsAlquilerRatioInputs
): ExpensasVsAlquilerRatioOutputs {
  const alquiler = Number(inputs.alquilerMensual);
  const expensas = Number(inputs.expensasMensuales);
  const servicios = Number(inputs.serviciosMensuales) || 0;

  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');
  if (isNaN(expensas) || expensas < 0) throw new Error('Ingresá las expensas mensuales');

  const ratio = (expensas / alquiler) * 100;
  const costoTotal = alquiler + expensas + servicios;
  const costoAnual = costoTotal * 12;

  let evaluacion = '';
  if (ratio < 15) evaluacion = 'Ratio bajo — edificio sin amenities o expensas muy contenidas.';
  else if (ratio < 25) evaluacion = 'Ratio normal — buen equilibrio entre alquiler y expensas.';
  else if (ratio < 35) evaluacion = 'Ratio medio-alto — edificio con buenos servicios/amenities.';
  else if (ratio < 50) evaluacion = 'Ratio alto — considerar si los amenities justifican el costo.';
  else evaluacion = 'Ratio muy alto — las expensas pesan demasiado sobre el alquiler.';

  let serviciosStr = '';
  if (servicios > 0) {
    serviciosStr = ` + servicios $${Math.round(servicios).toLocaleString('es-AR')}`;
  }

  return {
    ratioExpensas: `${ratio.toFixed(1)}%`,
    costoTotalVivienda: Math.round(costoTotal),
    costoAnual: Math.round(costoAnual),
    detalle: `Las expensas ($${Math.round(expensas).toLocaleString('es-AR')}) representan el ${ratio.toFixed(1)}% del alquiler ($${Math.round(alquiler).toLocaleString('es-AR')}). ${evaluacion} Costo total de vivienda: $${Math.round(costoTotal).toLocaleString('es-AR')}/mes (alquiler + expensas${serviciosStr}). Anual: $${Math.round(costoAnual).toLocaleString('es-AR')}.`,
  };
}
