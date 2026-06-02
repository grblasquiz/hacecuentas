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
  _insight?: any;
  _chart?: any;
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
  let insightText: string;
  let insightTone: string;

  if (pesoActual < min) {
    const falta = min - pesoActual;
    resultado = 'Bajo peso';
    diferencia = `-${falta.toFixed(1)} kg (bajo el mínimo)`;
    insightText = `Con **${pesoActual.toFixed(1)} kg** está **${falta.toFixed(1)} kg por debajo** del mínimo de la raza (${min} kg). Si no es un cachorro en crecimiento, una pérdida así conviene revisarla con el veterinario para descartar parásitos, mala absorción u otra causa.`;
    insightTone = 'warn';
  } else if (pesoActual > max) {
    const exceso = pesoActual - max;
    const porcExceso = ((exceso / max) * 100).toFixed(0);
    resultado = exceso > max * 0.15 ? 'Obesidad' : 'Sobrepeso leve';
    diferencia = `+${exceso.toFixed(1)} kg (${porcExceso}% sobre el máximo)`;
    insightText = resultado === 'Obesidad'
      ? `Con **${pesoActual.toFixed(1)} kg** está **${exceso.toFixed(1)} kg (${porcExceso}%) por encima** del máximo (${max} kg): ya es obesidad. El exceso recorta años de vida y castiga articulaciones y corazón; un plan de descenso con el veterinario es lo más recomendable.`
      : `Con **${pesoActual.toFixed(1)} kg** está **${exceso.toFixed(1)} kg (${porcExceso}%) sobre** el máximo (${max} kg): sobrepeso leve. Ajustando la ración y sumando actividad suele volver al rango ideal sin drama.`;
    insightTone = 'warn';
  } else {
    resultado = 'Peso ideal';
    diferencia = 'Dentro del rango';
    insightText = `Con **${pesoActual.toFixed(1)} kg** está **dentro del rango ideal** (${min}–${max} kg) para la raza y el sexo elegidos. Vas bien: mantené la ración y la actividad actuales y controlá el peso cada tanto.`;
    insightTone = 'good';
  }

  // Gauge: zonas de peso. Bajo peso → ideal → sobrepeso → obesidad.
  const obesidadDesde = max * 1.15;
  const ejeMax = Math.max(obesidadDesde * 1.25, pesoActual * 1.05);

  return {
    resultado,
    pesoMinimo: `${min} kg`,
    pesoMaximo: `${max} kg`,
    diferencia,
    _insight: {
      title: 'Lectura del resultado',
      text: insightText,
      tone: insightTone,
      icon: '🐕',
    },
    _chart: {
      type: 'scale',
      marker: Number(pesoActual.toFixed(1)),
      markerLabel: `${pesoActual.toFixed(1)} kg`,
      min: 0,
      segments: [
        { nombre: 'Bajo peso', max: min, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Ideal', max: max, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Sobrepeso', max: Number(obesidadDesde.toFixed(1)), color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Obesidad', max: Number(ejeMax.toFixed(1)), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `El peso actual de ${pesoActual.toFixed(1)} kg cae en la zona "${resultado}". Rango ideal de la raza: ${min} a ${max} kg.`,
    },
  };
}
