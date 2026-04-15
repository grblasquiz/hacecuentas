/** IMC pediátrico con percentil aproximado (2-18 años) */
export interface Inputs {
  peso: number;
  altura: number;
  edadAnios: number;
  sexo: string;
}
export interface Outputs {
  imc: number;
  percentilAprox: string;
  clasificacion: string;
  detalle: string;
}

export function indiceMasaCorporalPediatrico(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edadAnios = Number(i.edadAnios);
  const sexo = String(i.sexo || 'm');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del niño/a');
  if (!altura || altura <= 0) throw new Error('Ingresá la altura en cm');
  if (edadAnios < 2 || edadAnios > 18) throw new Error('La edad debe estar entre 2 y 18 años');

  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);

  // Valores medianos aproximados de IMC por edad (CDC/OMS)
  // Formato: [p5, p10, p25, p50, p75, p85, p95]
  const tablaM: Record<number, number[]> = {
    2: [14.5, 15.0, 15.6, 16.5, 17.3, 17.8, 18.5],
    3: [14.0, 14.5, 15.0, 15.8, 16.5, 17.0, 17.8],
    4: [13.8, 14.2, 14.8, 15.5, 16.3, 16.8, 17.6],
    5: [13.6, 14.0, 14.5, 15.3, 16.1, 16.6, 17.5],
    6: [13.5, 13.9, 14.5, 15.3, 16.2, 16.8, 18.0],
    7: [13.6, 14.0, 14.6, 15.5, 16.5, 17.2, 18.6],
    8: [13.8, 14.2, 14.9, 15.8, 17.0, 17.8, 19.5],
    9: [14.0, 14.5, 15.2, 16.2, 17.5, 18.4, 20.4],
    10: [14.3, 14.8, 15.6, 16.6, 18.0, 19.0, 21.4],
    11: [14.7, 15.2, 16.0, 17.1, 18.6, 19.7, 22.2],
    12: [15.2, 15.7, 16.5, 17.6, 19.2, 20.4, 23.0],
    13: [15.7, 16.2, 17.0, 18.2, 19.8, 21.0, 23.6],
    14: [16.2, 16.8, 17.6, 18.8, 20.4, 21.7, 24.2],
    15: [16.8, 17.3, 18.1, 19.4, 21.0, 22.3, 24.7],
    16: [17.3, 17.8, 18.7, 20.0, 21.5, 22.8, 25.1],
    17: [17.7, 18.3, 19.2, 20.5, 22.0, 23.3, 25.5],
    18: [18.0, 18.6, 19.5, 21.0, 22.5, 23.8, 26.0],
  };
  const tablaF: Record<number, number[]> = {
    2: [14.2, 14.7, 15.3, 16.3, 17.1, 17.6, 18.3],
    3: [13.8, 14.2, 14.8, 15.6, 16.4, 16.9, 17.7],
    4: [13.5, 13.9, 14.5, 15.3, 16.2, 16.7, 17.6],
    5: [13.3, 13.7, 14.3, 15.1, 16.0, 16.6, 17.7],
    6: [13.2, 13.6, 14.3, 15.2, 16.2, 16.9, 18.2],
    7: [13.3, 13.8, 14.5, 15.4, 16.5, 17.3, 18.8],
    8: [13.5, 14.0, 14.7, 15.7, 17.0, 17.9, 19.6],
    9: [13.8, 14.3, 15.1, 16.2, 17.5, 18.5, 20.5],
    10: [14.2, 14.7, 15.5, 16.6, 18.1, 19.2, 21.3],
    11: [14.6, 15.2, 16.0, 17.2, 18.8, 19.9, 22.1],
    12: [15.1, 15.7, 16.6, 17.8, 19.4, 20.6, 22.8],
    13: [15.6, 16.2, 17.1, 18.4, 20.0, 21.3, 23.4],
    14: [16.1, 16.7, 17.6, 19.0, 20.5, 21.8, 24.0],
    15: [16.5, 17.1, 18.0, 19.4, 20.9, 22.2, 24.4],
    16: [16.8, 17.4, 18.4, 19.8, 21.3, 22.6, 24.7],
    17: [17.0, 17.7, 18.6, 20.1, 21.6, 22.9, 25.0],
    18: [17.2, 17.9, 18.8, 20.3, 21.8, 23.2, 25.2],
  };

  const tabla = sexo === 'f' ? tablaF : tablaM;
  const edadRedondeada = Math.min(18, Math.max(2, Math.round(edadAnios)));
  const percentiles = tabla[edadRedondeada] || tabla[8];
  // [p5, p10, p25, p50, p75, p85, p95]

  let percentilAprox: string;
  let clasificacion: string;

  if (imc < percentiles[0]) {
    percentilAprox = '< percentil 5';
    clasificacion = 'Bajo peso';
  } else if (imc < percentiles[1]) {
    percentilAprox = 'percentil 5-10';
    clasificacion = 'Peso normal (rango bajo)';
  } else if (imc < percentiles[2]) {
    percentilAprox = 'percentil 10-25';
    clasificacion = 'Peso normal';
  } else if (imc < percentiles[3]) {
    percentilAprox = 'percentil 25-50';
    clasificacion = 'Peso normal';
  } else if (imc < percentiles[4]) {
    percentilAprox = 'percentil 50-75';
    clasificacion = 'Peso normal';
  } else if (imc < percentiles[5]) {
    percentilAprox = 'percentil 75-85';
    clasificacion = 'Peso normal (rango alto)';
  } else if (imc < percentiles[6]) {
    percentilAprox = 'percentil 85-95';
    clasificacion = 'Sobrepeso';
  } else {
    percentilAprox = '≥ percentil 95';
    clasificacion = 'Obesidad';
  }

  const detalle =
    `IMC: ${imc.toFixed(1)} kg/m² | Edad: ${edadAnios} años | Sexo: ${sexo === 'f' ? 'Femenino' : 'Masculino'} | ` +
    `${percentilAprox} | Clasificación: ${clasificacion}. ` +
    `Valores de referencia CDC/OMS para ${edadRedondeada} años.`;

  return {
    imc: Number(imc.toFixed(1)),
    percentilAprox,
    clasificacion,
    detalle,
  };
}
