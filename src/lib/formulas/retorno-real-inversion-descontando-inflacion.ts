/**
 * Calculadora de retorno real de inversión descontando inflación
 * Fórmula de Fisher: tasa_real = (1 + nominal) / (1 + inflación) − 1
 */

export interface RetornoRealInversionDescontandoInflacionInputs {
  rendimientoNominal: number;
  inflacionPeriodo: number;
  montoInvertido?: number;
}

export interface RetornoRealInversionDescontandoInflacionOutputs {
  tasaReal: string;
  gananciaReal: number;
  veredicto: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function retornoRealInversionDescontandoInflacion(
  inputs: RetornoRealInversionDescontandoInflacionInputs
): RetornoRealInversionDescontandoInflacionOutputs {
  const nominal = Number(inputs.rendimientoNominal);
  const inflacion = Number(inputs.inflacionPeriodo);
  const monto = Number(inputs.montoInvertido) || 0;

  if (isNaN(nominal)) throw new Error('Ingresá el rendimiento nominal');
  if (isNaN(inflacion)) throw new Error('Ingresá la inflación del período');
  if (inflacion <= -100) throw new Error('La inflación no puede ser −100% o menor');

  const factorNominal = 1 + nominal / 100;
  const factorInflacion = 1 + inflacion / 100;
  const tasaReal = (factorNominal / factorInflacion - 1) * 100;
  const restaSimple = nominal - inflacion;

  let gananciaReal = 0;
  if (monto > 0) {
    const valorFinalNominal = monto * factorNominal;
    const valorFinalReal = valorFinalNominal / factorInflacion;
    gananciaReal = valorFinalReal - monto;
  }

  let veredicto = '';
  if (tasaReal > 10) veredicto = 'Excelente rendimiento real: le ganaste ampliamente a la inflación.';
  else if (tasaReal > 3) veredicto = 'Buen rendimiento real: tu inversión creció en poder de compra.';
  else if (tasaReal > 0) veredicto = 'Rendimiento real positivo pero modesto.';
  else if (tasaReal > -3) veredicto = 'Casi neutro: prácticamente empataste con la inflación.';
  else veredicto = 'Rendimiento real negativo: perdiste poder adquisitivo.';

  let detalleExtra = '';
  if (monto > 0) {
    detalleExtra = ` Sobre $${monto.toLocaleString('es-AR')} invertidos, la ganancia real es de $${Math.round(gananciaReal).toLocaleString('es-AR')} en pesos constantes.`;
  }

  const tasaRealFmt = `${tasaReal >= 0 ? '+' : ''}${tasaReal.toFixed(2)}%`;
  const insightTone = tasaReal > 3 ? 'good' : tasaReal > 0 ? 'neutral' : 'warn';
  const insightIcon = tasaReal > 3 ? '📈' : tasaReal > 0 ? '⚖️' : '📉';
  let insightText: string;
  if (tasaReal > 0) {
    insightText = `Tu inversión rindió **${tasaRealFmt}** real: descontada la inflación del ${inflacion}%, ganaste poder de compra.${monto > 0 ? ` En pesos de hoy, eso son **$${Math.round(gananciaReal).toLocaleString('es-AR')}** de ganancia real sobre $${monto.toLocaleString('es-AR')}.` : ''} La resta simple (${restaSimple.toFixed(1)}%) sobreestima el resultado en ${Math.abs(tasaReal - restaSimple).toFixed(2)} puntos.`;
  } else {
    insightText = `Cuidado: el rendimiento real es **${tasaRealFmt}**. El ${nominal}% nominal no le ganó al ${inflacion}% de inflación, así que perdiste poder adquisitivo.${monto > 0 ? ` Sobre $${monto.toLocaleString('es-AR')}, la pérdida real es de **$${Math.abs(Math.round(gananciaReal)).toLocaleString('es-AR')}** en pesos constantes.` : ''}`;
  }

  // Gauge: zonas de rendimiento real según veredicto
  const segMax = Math.max(15, Math.ceil(tasaReal) + 1);
  const segMin = Math.min(-10, Math.floor(tasaReal) - 1);
  return {
    tasaReal: tasaRealFmt,
    gananciaReal: Math.round(gananciaReal),
    veredicto,
    detalle: `Rendimiento nominal: ${nominal}%. Inflación: ${inflacion}%. Tasa real (Fisher): ${tasaReal >= 0 ? '+' : ''}${tasaReal.toFixed(2)}% (resta simple daría ${restaSimple.toFixed(1)}%, diferencia de ${Math.abs(tasaReal - restaSimple).toFixed(2)} puntos). ${veredicto}${detalleExtra}`,
    _insight: {
      title: 'Tu rendimiento real',
      text: insightText,
      tone: insightTone,
      icon: insightIcon
    },
    _chart: {
      type: 'scale',
      marker: Math.round(tasaReal * 100) / 100,
      markerLabel: tasaRealFmt,
      min: segMin,
      segments: [
        { nombre: 'Pérdida real', max: 0, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Empate', max: 3, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Le ganás a la inflación', max: 10, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Excelente', max: segMax, color: '#22c55e', colorDark: '#16a34a' }
      ],
      ariaLabel: `Tasa real de ${tasaRealFmt} sobre una escala que va de pérdida real (negativa) a excelente (>10%).`
    }
  };
}
