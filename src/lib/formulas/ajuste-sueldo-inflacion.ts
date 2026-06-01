/**
 * Calculadora: ¿Tu sueldo le ganó a la inflación?
 * Compara aumento nominal vs inflación acumulada
 */

export interface AjusteSueldoInflacionInputs {
  sueldoAnterior: number;
  sueldoActual: number;
  inflacionAcumulada: number;
}

export interface AjusteSueldoInflacionOutputs {
  resultado: string;
  sueldoNecesario: number;
  diferenciaReal: number;
  aumentoReal: string;
  _insight?: any;
  _chart?: any;
}

export function ajusteSueldoInflacion(inputs: AjusteSueldoInflacionInputs): AjusteSueldoInflacionOutputs {
  const sueldoAnterior = Number(inputs.sueldoAnterior);
  const sueldoActual = Number(inputs.sueldoActual);
  const inflacion = Number(inputs.inflacionAcumulada);

  if (!sueldoAnterior || sueldoAnterior <= 0) {
    throw new Error('Ingresá tu sueldo anterior');
  }
  if (!sueldoActual || sueldoActual <= 0) {
    throw new Error('Ingresá tu sueldo actual');
  }
  if (inflacion < 0) {
    throw new Error('La inflación no puede ser negativa');
  }

  const sueldoNecesario = sueldoAnterior * (1 + inflacion / 100);
  const diferenciaReal = sueldoActual - sueldoNecesario;
  const aumentoRealPorc = ((sueldoActual / sueldoNecesario) - 1) * 100;

  let resultado: string;
  if (diferenciaReal > 0) {
    resultado = `Subió ${aumentoRealPorc.toFixed(1).replace('.', ',')}% real`;
  } else if (diferenciaReal < 0) {
    resultado = `Cayó ${Math.abs(aumentoRealPorc).toFixed(1).replace('.', ',')}% real`;
  } else {
    resultado = 'Empató la inflación';
  }

  const necesarioR = Math.round(sueldoNecesario);
  const difR = Math.round(diferenciaReal);
  const inflPortion = Math.max(0, Math.round(sueldoNecesario - sueldoAnterior));
  const fmt = (n: number) => Math.abs(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  const tone = difR > 0 ? 'good' : difR < 0 ? 'warn' : 'neutral';
  const insightText = difR > 0
    ? `Tu sueldo le ganó a la inflación: subió **${aumentoRealPorc.toFixed(1).replace('.', ',')}% real**. Cobrás $${fmt(difR)} más de lo que necesitabas ($${fmt(necesarioR)}) para mantener el poder adquisitivo.`
    : difR < 0
      ? `Tu sueldo perdió contra la inflación: cayó **${fmt(aumentoRealPorc).replace('.', ',')}% real**. Te faltan **$${fmt(difR)}** para llegar a los $${fmt(necesarioR)} que necesitabas para no perder.`
      : `Tu sueldo empató exacto con la inflación: cobrás los **$${fmt(necesarioR)}** justos para mantener tu poder adquisitivo.`;

  return {
    resultado,
    sueldoNecesario: necesarioR,
    diferenciaReal: difR,
    aumentoReal: `${aumentoRealPorc >= 0 ? '+' : ''}${aumentoRealPorc.toFixed(1)}%`,
    _insight: {
      title: '¿Le ganaste a la inflación?',
      text: insightText,
      tone,
      icon: difR >= 0 ? '📈' : '📉',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Sueldo anterior', value: Math.round(sueldoAnterior) },
        { label: 'Recupero de inflación', value: inflPortion },
      ],
      prefix: '$',
      centerValue: `$${fmt(necesarioR)}`,
      centerLabel: 'Sueldo necesario',
      ariaLabel: `Sueldo necesario para empatar la inflación ${fmt(necesarioR)} pesos, compuesto por el sueldo anterior y el recupero de inflación`,
    },
  };
}
