/** Índice cintura-cadera (RCC) y riesgo según cintura abdominal */
export interface Inputs {
  cintura: number;
  cadera: number;
  sexo?: string;
}
export interface Outputs {
  rcc: number;
  categoriaRcc: string;
  riesgoCintura: string;
  cinturaSaludable: string;
  resumen: string;
}

export function cinturaCadera(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const cadera = Number(i.cadera);
  const sexo = String(i.sexo || 'mujer');

  if (!cintura || cintura < 30 || cintura > 250) throw new Error('Cintura entre 30 y 250 cm');
  if (!cadera || cadera < 40 || cadera > 250) throw new Error('Cadera entre 40 y 250 cm');

  const rcc = cintura / cadera;

  // Categorías OMS de RCC
  let categoriaRcc = '';
  if (sexo === 'hombre') {
    if (rcc < 0.90) categoriaRcc = 'Bajo riesgo (RCC < 0.90)';
    else if (rcc < 1.0) categoriaRcc = 'Riesgo moderado (0.90 – 0.99)';
    else categoriaRcc = 'Riesgo alto (RCC ≥ 1.0)';
  } else {
    if (rcc < 0.80) categoriaRcc = 'Bajo riesgo (RCC < 0.80)';
    else if (rcc < 0.85) categoriaRcc = 'Riesgo moderado (0.80 – 0.84)';
    else categoriaRcc = 'Riesgo alto (RCC ≥ 0.85)';
  }

  // Cintura abdominal sola (criterio OMS / IDF)
  let riesgoCintura = '';
  let cinturaSaludable = '';
  if (sexo === 'hombre') {
    cinturaSaludable = '< 94 cm (saludable), 94–101 cm (riesgo aumentado), ≥ 102 cm (riesgo muy alto)';
    if (cintura < 94) riesgoCintura = 'Bajo riesgo (< 94 cm)';
    else if (cintura < 102) riesgoCintura = 'Riesgo aumentado (94–101 cm)';
    else riesgoCintura = 'Riesgo muy alto (≥ 102 cm)';
  } else {
    cinturaSaludable = '< 80 cm (saludable), 80–87 cm (riesgo aumentado), ≥ 88 cm (riesgo muy alto)';
    if (cintura < 80) riesgoCintura = 'Bajo riesgo (< 80 cm)';
    else if (cintura < 88) riesgoCintura = 'Riesgo aumentado (80–87 cm)';
    else riesgoCintura = 'Riesgo muy alto (≥ 88 cm)';
  }

  return {
    rcc: Number(rcc.toFixed(3)),
    categoriaRcc,
    riesgoCintura,
    cinturaSaludable,
    resumen: `Tu RCC es ${rcc.toFixed(2)} (${categoriaRcc}). Tu cintura abdominal: ${riesgoCintura}.`,
  };
}
