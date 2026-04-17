/**
 * Calculadora: Ajuste de sueldo por inflación (México, INPC)
 * Dado sueldoActual, inflacion INPC acumulada y aumento ofrecido,
 * calcula sueldo ajustado, aumento necesario en pesos, ganancia real
 * y sueldo con el aumento ofrecido.
 */

export interface AjusteSueldoInflacionMxInputs {
  sueldoActual: number;
  inflacionAcumulada: number; // %
  aumentoOfrecido?: number; // %
}

export interface AjusteSueldoInflacionMxOutputs {
  sueldoAjustadoInflacion: number;
  aumentoNecesario: number;
  gananciaRealOfrecida: number;
  sueldoConOfrecido: number;
  mensaje: string;
}

export function ajusteSueldoInflacionMx(inputs: AjusteSueldoInflacionMxInputs): AjusteSueldoInflacionMxOutputs {
  const sueldoActual = Number(inputs.sueldoActual);
  const inflacion = Number(inputs.inflacionAcumulada);
  const ofrecido = Number(inputs.aumentoOfrecido ?? 0);

  if (!sueldoActual || sueldoActual <= 0) {
    throw new Error('Ingresá tu sueldo actual');
  }
  if (inflacion < 0) {
    throw new Error('La inflación no puede ser negativa');
  }

  const sueldoAjustadoInflacion = sueldoActual * (1 + inflacion / 100);
  const aumentoNecesario = sueldoAjustadoInflacion - sueldoActual;
  const sueldoConOfrecido = sueldoActual * (1 + ofrecido / 100);
  // Ganancia real en pp: (1+ofrecido)/(1+inflacion) - 1
  const gananciaRealOfrecida = (((1 + ofrecido / 100) / (1 + inflacion / 100)) - 1) * 100;

  const mensaje = ofrecido > inflacion
    ? `Con aumento del ${ofrecido}% le ganás a la inflación (${inflacion}%): +${gananciaRealOfrecida.toFixed(2)}% real.`
    : ofrecido < inflacion
      ? `Con aumento del ${ofrecido}% perdés poder adquisitivo (inflación ${inflacion}%): ${gananciaRealOfrecida.toFixed(2)}% real.`
      : `Tu aumento empata con la inflación.`;

  return {
    sueldoAjustadoInflacion: Math.round(sueldoAjustadoInflacion),
    aumentoNecesario: Math.round(aumentoNecesario),
    gananciaRealOfrecida: Number(gananciaRealOfrecida.toFixed(2)),
    sueldoConOfrecido: Math.round(sueldoConOfrecido),
    mensaje,
  };
}
