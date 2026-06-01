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
  _insight?: any;
  _chart?: any;
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

  const ajustadoR = Math.round(sueldoAjustadoInflacion);
  const aumentoR = Math.round(aumentoNecesario);
  const fmt = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 0 });
  const ganaTone = ofrecido > inflacion ? 'good' : ofrecido < inflacion ? 'warn' : 'neutral';
  const insightText = ofrecido > inflacion
    ? `El aumento del **${ofrecido}%** supera la inflación (${inflacion}%): ganás **+${gananciaRealOfrecida.toFixed(2)}%** de poder adquisitivo real. Tu sueldo queda en $${fmt(Math.round(sueldoConOfrecido))}.`
    : ofrecido < inflacion
      ? `Con **${ofrecido}%** quedás por debajo de la inflación (${inflacion}%): perdés **${gananciaRealOfrecida.toFixed(2)}%** real. Para no perder necesitás llegar a **$${fmt(ajustadoR)}** (subir $${fmt(aumentoR)}).`
      : `Tu aumento del ${ofrecido}% empata exacto con la inflación: tu poder adquisitivo queda igual, en **$${fmt(ajustadoR)}**.`;

  return {
    sueldoAjustadoInflacion: ajustadoR,
    aumentoNecesario: aumentoR,
    gananciaRealOfrecida: Number(gananciaRealOfrecida.toFixed(2)),
    sueldoConOfrecido: Math.round(sueldoConOfrecido),
    mensaje,
    _insight: {
      title: '¿Le ganás a la inflación?',
      text: insightText,
      tone: ganaTone,
      icon: ofrecido >= inflacion ? '📈' : '📉',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Sueldo actual', value: Math.round(sueldoActual) },
        { label: 'Ajuste para empatar inflación', value: aumentoR },
      ],
      prefix: '$',
      centerValue: `$${fmt(ajustadoR)}`,
      centerLabel: 'Sueldo ajustado',
      ariaLabel: `Sueldo ajustado por inflación ${fmt(ajustadoR)} pesos, compuesto por el sueldo actual y el ajuste necesario`,
    },
  };
}
