/**
 * Calculadora de poder adquisitivo — sueldo real
 * Variación real = (sueldo_actual / sueldo_necesario − 1) × 100
 */

export interface PoderAdquisitivoSueldoRealInputs {
  sueldoAnterior: number;
  sueldoActual: number;
  inflacionPeriodo: number;
}

export interface PoderAdquisitivoSueldoRealOutputs {
  variacionReal: string;
  sueldoEquivalente: number;
  diferenciaMensual: number;
  detalle: string;
}

export function poderAdquisitivoSueldoReal(
  inputs: PoderAdquisitivoSueldoRealInputs
): PoderAdquisitivoSueldoRealOutputs {
  const anterior = Number(inputs.sueldoAnterior);
  const actual = Number(inputs.sueldoActual);
  const inflacion = Number(inputs.inflacionPeriodo);

  if (!anterior || anterior <= 0) throw new Error('Ingresá tu sueldo anterior');
  if (!actual || actual <= 0) throw new Error('Ingresá tu sueldo actual');
  if (isNaN(inflacion)) throw new Error('Ingresá la inflación del período');

  const factorInflacion = 1 + inflacion / 100;
  const sueldoEquivalente = anterior * factorInflacion;
  const variacionReal = (actual / sueldoEquivalente - 1) * 100;
  const diferencia = actual - sueldoEquivalente;
  const aumentoNominal = ((actual - anterior) / anterior) * 100;

  let veredicto = '';
  if (variacionReal > 5) veredicto = 'Le ganaste a la inflación por un buen margen.';
  else if (variacionReal > 0) veredicto = 'Le ganaste a la inflación, pero por poco.';
  else if (variacionReal > -2) veredicto = 'Prácticamente empataste con la inflación.';
  else if (variacionReal > -10) veredicto = 'Perdiste poder adquisitivo.';
  else veredicto = 'Pérdida significativa de poder adquisitivo.';

  return {
    variacionReal: `${variacionReal >= 0 ? '+' : ''}${variacionReal.toFixed(1)}%`,
    sueldoEquivalente: Math.round(sueldoEquivalente),
    diferenciaMensual: Math.round(diferencia),
    detalle: `Tu sueldo subió ${aumentoNominal.toFixed(1)}% nominal (de $${anterior.toLocaleString('es-AR')} a $${actual.toLocaleString('es-AR')}), pero con inflación del ${inflacion}% necesitabas $${Math.round(sueldoEquivalente).toLocaleString('es-AR')} para mantener tu poder de compra. ${variacionReal >= 0 ? 'Ganás' : 'Perdés'} $${Math.abs(Math.round(diferencia)).toLocaleString('es-AR')}/mes en términos reales (${variacionReal >= 0 ? '+' : ''}${variacionReal.toFixed(1)}%). ${veredicto}`,
  };
}
