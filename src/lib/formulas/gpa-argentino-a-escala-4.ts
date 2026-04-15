/** Calculadora de conversión de promedio argentino (1-10) a GPA escala 4.0 */

export interface Inputs {
  promedioArgentino: number;
}

export interface Outputs {
  gpa4: number;
  letraEquivalente: string;
  clasificacion: string;
  detalle: string;
}

export function gpaArgentinoAEscala4(i: Inputs): Outputs {
  const promedio = Number(i.promedioArgentino);

  if (isNaN(promedio) || promedio < 1 || promedio > 10) {
    throw new Error('El promedio argentino debe estar entre 1 y 10');
  }

  // Conversión lineal: GPA = (nota - 1) × 4 / 9
  const gpa = ((promedio - 1) * 4) / 9;

  let letra: string;
  let clasificacion: string;

  if (gpa >= 3.85) { letra = 'A+'; clasificacion = 'Summa cum laude'; }
  else if (gpa >= 3.5) { letra = 'A / A-'; clasificacion = 'Magna cum laude'; }
  else if (gpa >= 3.15) { letra = 'B+'; clasificacion = 'Cum laude'; }
  else if (gpa >= 2.85) { letra = 'B'; clasificacion = 'Good standing'; }
  else if (gpa >= 2.5) { letra = 'B-'; clasificacion = 'Good standing'; }
  else if (gpa >= 2.15) { letra = 'C+'; clasificacion = 'Satisfactory'; }
  else if (gpa >= 1.85) { letra = 'C'; clasificacion = 'Satisfactory'; }
  else if (gpa >= 1.5) { letra = 'C-'; clasificacion = 'Below average'; }
  else if (gpa >= 1.0) { letra = 'D'; clasificacion = 'Minimum passing'; }
  else { letra = 'F'; clasificacion = 'Failing'; }

  return {
    gpa4: Math.round(gpa * 100) / 100,
    letraEquivalente: letra,
    clasificacion,
    detalle: `Promedio argentino ${promedio.toFixed(2)} → GPA ${gpa.toFixed(2)} (${letra}). Clasificación: ${clasificacion}.`,
  };
}
