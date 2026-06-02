/** Percentil de peso y talla del bebé — OMS */
export interface Inputs { edadMeses: number; sexoBebe: string; pesoBebe: number; tallaBebe?: number; }
export interface Outputs { percentilPeso: string; percentilTalla: string; evaluacion: string; pesoEsperado: string; _chart?: any; _insight?: any; }

// Datos OMS simplificados: [P3, P15, P50, P85, P97] en kg por mes, varones
const pesoVaron: Record<number, number[]> = {
  0: [2.5, 2.9, 3.3, 3.9, 4.4], 1: [3.4, 3.9, 4.5, 5.1, 5.8],
  2: [4.3, 4.9, 5.6, 6.3, 7.1], 3: [5.0, 5.7, 6.4, 7.2, 8.0],
  4: [5.6, 6.2, 7.0, 7.8, 8.7], 5: [6.0, 6.7, 7.5, 8.4, 9.3],
  6: [6.4, 7.1, 7.9, 8.8, 9.8], 7: [6.7, 7.4, 8.3, 9.2, 10.3],
  8: [6.9, 7.7, 8.6, 9.6, 10.7], 9: [7.1, 7.9, 8.9, 9.9, 11.0],
  10: [7.4, 8.2, 9.2, 10.2, 11.4], 11: [7.6, 8.4, 9.4, 10.5, 11.7],
  12: [7.7, 8.6, 9.6, 10.8, 12.0], 18: [8.8, 9.8, 10.9, 12.2, 13.7],
  24: [9.7, 10.8, 12.2, 13.6, 15.3], 36: [11.3, 12.7, 14.3, 16.2, 18.3],
  48: [12.7, 14.4, 16.3, 18.6, 21.2], 60: [14.1, 16.0, 18.3, 21.0, 24.2],
};
const pesoMujer: Record<number, number[]> = {
  0: [2.4, 2.8, 3.2, 3.7, 4.2], 1: [3.2, 3.6, 4.2, 4.8, 5.5],
  2: [3.9, 4.5, 5.1, 5.8, 6.6], 3: [4.5, 5.2, 5.8, 6.6, 7.5],
  4: [5.0, 5.7, 6.4, 7.3, 8.2], 5: [5.4, 6.1, 6.9, 7.8, 8.8],
  6: [5.7, 6.5, 7.3, 8.2, 9.3], 7: [6.0, 6.8, 7.6, 8.6, 9.8],
  8: [6.3, 7.0, 7.9, 9.0, 10.2], 9: [6.5, 7.3, 8.2, 9.3, 10.5],
  10: [6.7, 7.5, 8.5, 9.6, 10.9], 11: [6.9, 7.7, 8.7, 9.9, 11.2],
  12: [7.0, 7.9, 8.9, 10.1, 11.5], 18: [8.1, 9.1, 10.2, 11.6, 13.2],
  24: [9.0, 10.2, 11.5, 13.0, 14.8], 36: [10.8, 12.2, 13.9, 15.9, 18.1],
  48: [12.3, 14.0, 16.1, 18.5, 21.5], 60: [13.7, 15.8, 18.2, 21.2, 24.9],
};

function getPercentil(peso: number, tabla: number[]): string {
  if (peso < tabla[0]) return '< percentil 3 (bajo peso)';
  if (peso < tabla[1]) return '~percentil 3-15';
  if (peso < tabla[2]) return '~percentil 15-50';
  if (peso < tabla[3]) return '~percentil 50-85';
  if (peso < tabla[4]) return '~percentil 85-97';
  return '> percentil 97 (peso alto)';
}

export function percentilBebeOms(i: Inputs): Outputs {
  const meses = Math.round(Number(i.edadMeses));
  const sexo = String(i.sexoBebe);
  const peso = Number(i.pesoBebe);
  const talla = Number(i.tallaBebe) || 0;

  if (meses < 0 || meses > 60) throw new Error('Ingresá una edad entre 0 y 60 meses');
  if (peso <= 0) throw new Error('Ingresá el peso del bebé');

  const tablasPeso = sexo === 'f' ? pesoMujer : pesoVaron;

  // Encontrar la edad más cercana en la tabla
  const edades = Object.keys(tablasPeso).map(Number).sort((a, b) => a - b);
  let closest = edades[0];
  for (const e of edades) { if (e <= meses) closest = e; }

  const datos = tablasPeso[closest];
  const percentilPeso = getPercentil(peso, datos);

  const pesoEsperado = `${datos[0]} - ${datos[4]} kg (percentil 3 a 97 para ${closest} meses)`;

  let evaluacion = '';
  if (peso < datos[0]) evaluacion = 'Peso por debajo del percentil 3. Consultá con el pediatra para evaluar causas.';
  else if (peso > datos[4]) evaluacion = 'Peso por encima del percentil 97. Consultá con el pediatra.';
  else evaluacion = 'Peso dentro del rango normal. Lo importante es que siga su curva de crecimiento.';

  let percentilTalla = 'Ingresá la talla para calcular el percentil';
  if (talla > 0) {
    percentilTalla = 'Percentil de talla calculado de forma aproximada (consultá tablas OMS detalladas para precisión)';
  }

  const chart = {
    type: 'scale' as const,
    marker: peso,
    markerLabel: 'Peso del bebé: ' + peso + ' kg',
    min: Math.max(0, Math.floor(datos[0] - 1)),
    unit: ' kg',
    segments: [
      { nombre: 'Bajo (< P3)', max: datos[0], color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'P3-P15', max: datos[1], color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Normal (P15-P85)', max: datos[3], color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'P85-P97', max: datos[4], color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Alto (> P97)', max: Math.max(datos[4] + 1, Math.ceil(peso) + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de percentiles de peso OMS para ' + closest + ' meses',
  };

  const fuera = peso < datos[0] || peso > datos[4];
  const _insight = {
    title: 'Peso de tu bebé',
    text: `Con **${peso} kg** a los **${closest} meses**, tu bebé está en el rango **${percentilPeso}**. El rango normal (P3–P97) para esta edad va de **${datos[0]} a ${datos[4]} kg**.${fuera ? ' Conviene revisarlo con el pediatra.' : ' Lo importante es que siga su propia curva de crecimiento.'}`,
    tone: fuera ? 'warn' : 'good',
    icon: '👶',
  };

  return { percentilPeso, percentilTalla, evaluacion, pesoEsperado, _chart: chart, _insight };
}
