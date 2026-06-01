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

  return {
    resultado,
    sueldoNecesario: Math.round(sueldoNecesario),
    diferenciaReal: Math.round(diferenciaReal),
    aumentoReal: `${aumentoRealPorc >= 0 ? '+' : ''}${aumentoRealPorc.toFixed(1)}%`,
  };
}
