/** Calculadora de conversión de promedio argentino (1-10) a GPA escala 4.0 */

export interface Inputs {
  promedioArgentino: number;
}

export interface Outputs {
  gpa4: number;
  letraEquivalente: string;
  clasificacion: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  const gpaR = Math.round(gpa * 100) / 100;
  const tone = gpa >= 2.85 ? 'good' : gpa >= 2.0 ? 'neutral' : 'warn';
  return {
    gpa4: gpaR,
    letraEquivalente: letra,
    clasificacion,
    detalle: `Promedio argentino ${promedio.toFixed(2)} → GPA ${gpa.toFixed(2)} (${letra}). Clasificación: ${clasificacion}.`,
    _insight: {
      title: `GPA ${gpaR.toFixed(2)} — ${letra}`,
      text: `Tu promedio **${promedio.toFixed(2)}/10** equivale a un **GPA ${gpaR.toFixed(2)}/4.0** (nota **${letra}**, ${clasificacion}). La mayoría de las universidades de EE.UU. piden un mínimo de **2.0-3.0** para admisión.`,
      tone,
      icon: '🎓',
    },
    _chart: {
      type: 'scale',
      marker: Math.min(gpaR, 3.99),
      markerLabel: `${gpaR.toFixed(2)} (${letra})`,
      min: 0,
      segments: [
        { nombre: 'Reprobado', max: 1, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Bajo', max: 2, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Aceptable', max: 2.85, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Bueno', max: 3.5, color: '#65a30d', colorDark: '#84cc16' },
        { nombre: 'Excelente', max: 4, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `GPA ${gpaR.toFixed(2)} de 4.0, equivalente a la nota ${letra}`,
    },
  };
}
