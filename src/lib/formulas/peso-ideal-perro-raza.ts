/**
 * Calculadora de Peso Ideal del Perro según Raza
 * Datos de estándares FCI/AKC
 */

export interface PesoIdealPerroInputs {
  raza: string;
  sexo: string;
  pesoActual: number;
}

export interface PesoIdealPerroOutputs {
  resultado: string;
  pesoMinimo: string;
  pesoMaximo: string;
  diferencia: string;
}

interface RangosPeso { macho: [number, number]; hembra: [number, number]; }

const RAZAS: Record<string, RangosPeso> = {
  'chihuahua': { macho: [1.5, 3], hembra: [1.5, 3] },
  'yorkshire': { macho: [2, 3.5], hembra: [2, 3.5] },
  'caniche-toy': { macho: [3, 5], hembra: [3, 5] },
  'pomerania': { macho: [1.8, 3.5], hembra: [1.8, 3.5] },
  'shih-tzu': { macho: [4.5, 8], hembra: [4, 7.5] },
  'beagle': { macho: [10, 11], hembra: [9, 10] },
  'bulldog-frances': { macho: [9, 14], hembra: [8, 13] },
  'cocker': { macho: [12, 16], hembra: [11, 15] },
  'border-collie': { macho: [14, 20], hembra: [12, 19] },
  'labrador': { macho: [29, 36], hembra: [25, 32] },
  'golden': { macho: [30, 34], hembra: [25, 32] },
  'pastor-aleman': { macho: [30, 40], hembra: [22, 32] },
  'husky': { macho: [20, 27], hembra: [16, 23] },
  'rottweiler': { macho: [50, 60], hembra: [35, 48] },
  'dogo-argentino': { macho: [40, 45], hembra: [35, 40] },
  'gran-danes': { macho: [54, 90], hembra: [45, 59] },
  'mestizo-chico': { macho: [4, 10], hembra: [3, 9] },
  'mestizo-mediano': { macho: [10, 25], hembra: [9, 23] },
  'mestizo-grande': { macho: [25, 45], hembra: [22, 40] },
};

export function pesoIdealPerroRaza(inputs: PesoIdealPerroInputs): PesoIdealPerroOutputs {
  const raza = inputs.raza || 'labrador';
  const sexo = inputs.sexo || 'macho';
  const pesoActual = Number(inputs.pesoActual);

  if (!pesoActual || pesoActual <= 0) throw new Error('Ingresá el peso actual del perro');

  const rangos = RAZAS[raza] || RAZAS['mestizo-mediano'];
  const [min, max] = sexo === 'hembra' ? rangos.hembra : rangos.macho;

  let resultado: string;
  let diferencia: string;

  if (pesoActual < min) {
    const falta = min - pesoActual;
    resultado = `Bajo peso: le faltan ${falta.toFixed(1)} kg para llegar al mínimo ideal`;
    diferencia = `-${falta.toFixed(1)} kg (bajo el mínimo)`;
  } else if (pesoActual > max) {
    const exceso = pesoActual - max;
    const porcExceso = ((exceso / max) * 100).toFixed(0);
    resultado = exceso > max * 0.15
      ? `Obesidad: ${exceso.toFixed(1)} kg por encima del máximo (${porcExceso}% excedido)`
      : `Sobrepeso leve: ${exceso.toFixed(1)} kg por encima del máximo`;
    diferencia = `+${exceso.toFixed(1)} kg (${porcExceso}% sobre el máximo)`;
  } else {
    resultado = '¡Peso ideal! Tu perro está dentro del rango saludable';
    diferencia = 'Dentro del rango';
  }

  return {
    resultado,
    pesoMinimo: `${min} kg`,
    pesoMaximo: `${max} kg`,
    diferencia,
  };
}
