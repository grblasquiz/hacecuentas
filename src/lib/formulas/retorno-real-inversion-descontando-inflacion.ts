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

  return {
    tasaReal: `${tasaReal >= 0 ? '+' : ''}${tasaReal.toFixed(2)}%`,
    gananciaReal: Math.round(gananciaReal),
    veredicto,
    detalle: `Rendimiento nominal: ${nominal}%. Inflación: ${inflacion}%. Tasa real (Fisher): ${tasaReal >= 0 ? '+' : ''}${tasaReal.toFixed(2)}% (resta simple daría ${restaSimple.toFixed(1)}%, diferencia de ${Math.abs(tasaReal - restaSimple).toFixed(2)} puntos). ${veredicto}${detalleExtra}`,
  };
}
