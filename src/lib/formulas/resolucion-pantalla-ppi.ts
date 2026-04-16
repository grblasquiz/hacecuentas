/** Calculadora de PPI — Píxeles por Pulgada */
export interface Inputs {
  anchoPixeles: number;
  altoPixeles: number;
  diagonal: number;
}
export interface Outputs {
  ppi: number;
  totalPixeles: number;
  distanciaIdeal: number;
  calidad: string;
}

export function resolucionPantallaPpi(i: Inputs): Outputs {
  const w = Number(i.anchoPixeles);
  const h = Number(i.altoPixeles);
  const d = Number(i.diagonal);
  if (!w || w <= 0) throw new Error('Ingresá la resolución horizontal');
  if (!h || h <= 0) throw new Error('Ingresá la resolución vertical');
  if (!d || d <= 0) throw new Error('Ingresá la diagonal de la pantalla');

  const diagonalPixeles = Math.sqrt(w * w + h * h);
  const ppi = diagonalPixeles / d;
  const totalPixeles = w * h;

  // Distancia ideal: donde el ojo no distingue píxeles (~1 arcmin)
  // distancia (cm) = (1 / (2 * tan(0.5 arcmin))) / ppi * 2.54
  // Simplified: ~3438 / ppi inches, * 2.54 for cm
  const distanciaIdeal = (3438 / ppi) * 2.54;

  let calidad: string;
  if (ppi >= 300) calidad = 'Excelente — calidad Retina, no se distinguen píxeles a ninguna distancia normal.';
  else if (ppi >= 200) calidad = 'Muy buena — ideal para trabajo de diseño y lectura prolongada.';
  else if (ppi >= 110) calidad = 'Buena — suficiente para uso de escritorio a 60+ cm de distancia.';
  else if (ppi >= 90) calidad = 'Aceptable — se notan píxeles en texto pequeño de cerca.';
  else calidad = 'Baja — los píxeles son visibles. Considerá mayor resolución o menor tamaño.';

  return {
    ppi: Number(ppi.toFixed(1)),
    totalPixeles,
    distanciaIdeal: Number(distanciaIdeal.toFixed(0)),
    calidad,
  };
}
