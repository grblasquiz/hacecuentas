/** Calculadora de Temperatura Segura para Overclock */
export interface Inputs {
  componente: string;
  tempActual: number;
  tempAmbiente: number;
}
export interface Outputs {
  margenTermico: number;
  tempMaxima: number;
  estado: string;
  recomendacion: string;
}

const TEMP_MAX: Record<string, number> = {
  cpu_intel: 100,
  cpu_amd: 95,
  gpu_nvidia: 93,
  gpu_amd: 110,
};

export function overclockTemperaturaSegura(i: Inputs): Outputs {
  const tempActual = Number(i.tempActual);
  const tempAmb = Number(i.tempAmbiente);
  const comp = i.componente;

  if (!tempActual) throw new Error('Ingresá la temperatura bajo carga');
  if (!tempAmb && tempAmb !== 0) throw new Error('Ingresá la temperatura ambiente');
  const tempMaxima = TEMP_MAX[comp];
  if (!tempMaxima) throw new Error('Seleccioná un tipo de componente');

  const margenTermico = tempMaxima - tempActual;
  const deltaT = tempActual - tempAmb;

  let estado: string;
  let recomendacion: string;

  if (margenTermico > 25) {
    estado = 'Excelente — temperaturas bajas con mucho margen';
    recomendacion = `Tenés ${margenTermico}°C de margen. Podés hacer overclock moderado a agresivo. Tu cooler es más que suficiente.`;
  } else if (margenTermico > 15) {
    estado = 'Bueno — margen suficiente para overclock moderado';
    recomendacion = `Con ${margenTermico}°C de margen, podés hacer overclock suave. Subí frecuencia gradualmente y monitoreá temperaturas.`;
  } else if (margenTermico > 5) {
    estado = 'Ajustado — poco margen, overclock muy limitado';
    recomendacion = `Solo ${margenTermico}°C de margen. No recomendable hacer OC sin mejorar la refrigeración primero. Considerá mejor pasta térmica o cooler.`;
  } else {
    estado = 'Crítico — demasiado caliente, riesgo de throttling';
    recomendacion = `Tu componente está a ${tempActual}°C, apenas ${margenTermico}°C del throttling a ${tempMaxima}°C. NO hagas overclock. Mejorá la refrigeración urgente.`;
  }

  if (tempAmb > 30) {
    recomendacion += ` Nota: tu ambiente está a ${tempAmb}°C (caluroso). En invierno tendrías ~${tempAmb - 20}°C menos.`;
  }

  return {
    margenTermico: Number(margenTermico.toFixed(0)),
    tempMaxima,
    estado,
    recomendacion,
  };
}
