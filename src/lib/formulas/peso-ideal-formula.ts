/** Peso ideal por 4 fórmulas (Devine, Robinson, Miller, Hamwi) */
export interface Inputs {
  altura: number;
  sexo: string;
}
export interface Outputs {
  devine: number;
  robinson: number;
  miller: number;
  hamwi: number;
  promedio: number;
  rangoMin: number;
  rangoMax: number;
  mensaje: string;
}

export function pesoIdealFormula(i: Inputs): Outputs {
  const altura = Number(i.altura); // en cm
  const sexo = String(i.sexo || 'm');
  if (!altura || altura < 100 || altura > 250) throw new Error('Ingresá una altura válida en cm');

  const pulgadasSobre5ft = (altura - 152.4) / 2.54; // pulgadas sobre 5 pies

  let devine: number, robinson: number, miller: number, hamwi: number;

  if (sexo === 'f') {
    // Devine (1974): 45.5 + 2.3 × (pulgadas sobre 60)
    devine = 45.5 + 2.3 * Math.max(0, pulgadasSobre5ft);
    // Robinson (1983): 49 + 1.7 × (pulgadas sobre 60)
    robinson = 49 + 1.7 * Math.max(0, pulgadasSobre5ft);
    // Miller (1983): 53.1 + 1.36 × (pulgadas sobre 60)
    miller = 53.1 + 1.36 * Math.max(0, pulgadasSobre5ft);
    // Hamwi (1964): 45.5 + 2.2 × (pulgadas sobre 60)
    hamwi = 45.5 + 2.2 * Math.max(0, pulgadasSobre5ft);
  } else {
    // Devine: 50 + 2.3 × (pulgadas sobre 60)
    devine = 50 + 2.3 * Math.max(0, pulgadasSobre5ft);
    // Robinson: 52 + 1.9 × (pulgadas sobre 60)
    robinson = 52 + 1.9 * Math.max(0, pulgadasSobre5ft);
    // Miller: 56.2 + 1.41 × (pulgadas sobre 60)
    miller = 56.2 + 1.41 * Math.max(0, pulgadasSobre5ft);
    // Hamwi: 48 + 2.7 × (pulgadas sobre 60)
    hamwi = 48 + 2.7 * Math.max(0, pulgadasSobre5ft);
  }

  const promedio = (devine + robinson + miller + hamwi) / 4;
  const valores = [devine, robinson, miller, hamwi];
  const rangoMin = Math.min(...valores);
  const rangoMax = Math.max(...valores);

  return {
    devine: Number(devine.toFixed(1)),
    robinson: Number(robinson.toFixed(1)),
    miller: Number(miller.toFixed(1)),
    hamwi: Number(hamwi.toFixed(1)),
    promedio: Number(promedio.toFixed(1)),
    rangoMin: Number(rangoMin.toFixed(1)),
    rangoMax: Number(rangoMax.toFixed(1)),
    mensaje: `Tu peso ideal estimado: ${promedio.toFixed(1)} kg (rango ${rangoMin.toFixed(1)}–${rangoMax.toFixed(1)} kg según 4 fórmulas).`,
  };
}
