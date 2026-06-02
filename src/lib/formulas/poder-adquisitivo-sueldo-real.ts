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
  _insight?: any;
  _chart?: any;
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

  const vr = Number(variacionReal.toFixed(1));
  const _insight = {
    title: 'Tu sueldo en términos reales',
    text: `Tu aumento nominal fue de **${aumentoNominal.toFixed(1)}%**, pero la inflación del período fue **${inflacion}%**. En términos reales tu poder de compra ${variacionReal >= 0 ? 'subió' : 'cayó'} **${variacionReal >= 0 ? '+' : ''}${vr}%**: ${variacionReal >= 0 ? 'ganás' : 'perdés'} **$${Math.abs(Math.round(diferencia)).toLocaleString('es-AR')}/mes** frente a lo que necesitabas. ${veredicto}`,
    tone: variacionReal > 0 ? 'good' : variacionReal > -2 ? 'neutral' : 'warn',
    icon: variacionReal >= 0 ? '📈' : '📉',
  };

  const topMax = Math.max(10, Math.ceil(vr) + 2);
  const _chart = {
    type: 'scale',
    marker: vr,
    markerLabel: `${vr >= 0 ? '+' : ''}${vr}%`,
    min: Math.min(-20, Math.floor(vr) - 2),
    segments: [
      { nombre: 'Pérdida fuerte', max: -10, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Perdiste', max: -2, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Empataste', max: 2, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Le ganaste', max: topMax, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Variación real del sueldo: ${vr >= 0 ? '+' : ''}${vr}%`,
  };

  return {
    variacionReal: `${variacionReal >= 0 ? '+' : ''}${variacionReal.toFixed(1)}%`,
    sueldoEquivalente: Math.round(sueldoEquivalente),
    diferenciaMensual: Math.round(diferencia),
    detalle: `Tu sueldo subió ${aumentoNominal.toFixed(1)}% nominal (de $${anterior.toLocaleString('es-AR')} a $${actual.toLocaleString('es-AR')}), pero con inflación del ${inflacion}% necesitabas $${Math.round(sueldoEquivalente).toLocaleString('es-AR')} para mantener tu poder de compra. ${variacionReal >= 0 ? 'Ganás' : 'Perdés'} $${Math.abs(Math.round(diferencia)).toLocaleString('es-AR')}/mes en términos reales (${variacionReal >= 0 ? '+' : ''}${variacionReal.toFixed(1)}%). ${veredicto}`,
    _insight,
    _chart,
  };
}
