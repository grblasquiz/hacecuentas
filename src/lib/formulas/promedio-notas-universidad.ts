/** Calculadora de promedio simple de notas universitarias */

export interface Inputs {
  notas: string;
}

export interface Outputs {
  promedio: number;
  cantidadMaterias: number;
  notaMasAlta: number;
  notaMasBaja: number;
  detalle: string;
}

export function promedioNotasUniversidad(i: Inputs): Outputs {
  if (!i.notas || i.notas.trim() === '') {
    throw new Error('Ingresá al menos una nota para calcular el promedio');
  }

  // Separador: ; o espacio (coma se reserva como decimal AR: "7,5" -> 7.5)
  const notasArray = i.notas
    .split(/[;\s]+/)
    .filter((s) => s)
    .map((n) => parseFloat(n.trim().replace(',', '.')))
    .filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas. Ingresá números separados por punto y coma o espacio (ej: 7,5; 8; 9,2).');
  }

  for (const nota of notasArray) {
    if (nota < 0 || nota > 10) {
      throw new Error(`La nota ${nota} está fuera del rango válido (0-10).`);
    }
  }

  const suma = notasArray.reduce((acc, n) => acc + n, 0);
  const promedio = suma / notasArray.length;
  const notaMasAlta = Math.max(...notasArray);
  const notaMasBaja = Math.min(...notasArray);

  return {
    promedio: Math.round(promedio * 100) / 100,
    cantidadMaterias: notasArray.length,
    notaMasAlta,
    notaMasBaja,
    detalle: `Promedio de ${notasArray.length} materia(s): ${promedio.toFixed(2)} sobre 10`,
  };
}
