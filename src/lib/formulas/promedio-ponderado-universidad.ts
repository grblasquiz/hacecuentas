/** Calculadora de promedio ponderado universitario con créditos */

export interface Inputs {
  notas: string;
  creditos: string;
}

export interface Outputs {
  promedioPonderado: number;
  totalCreditos: number;
  cantidadMaterias: number;
  detalle: string;
}

export function promedioPonderadoUniversidad(i: Inputs): Outputs {
  if (!i.notas || i.notas.trim() === '') {
    throw new Error('Ingresá al menos una nota');
  }
  if (!i.creditos || i.creditos.trim() === '') {
    throw new Error('Ingresá los créditos de cada materia');
  }

  const notasArray = i.notas.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
  const creditosArray = i.creditos.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas.');
  }
  if (creditosArray.length === 0) {
    throw new Error('No se encontraron créditos válidos.');
  }
  if (notasArray.length !== creditosArray.length) {
    throw new Error(`Cantidad de notas (${notasArray.length}) y créditos (${creditosArray.length}) no coinciden.`);
  }

  for (const nota of notasArray) {
    if (nota < 0 || nota > 10) {
      throw new Error(`La nota ${nota} está fuera del rango válido (0-10).`);
    }
  }
  for (const c of creditosArray) {
    if (c <= 0) {
      throw new Error('Los créditos deben ser mayores a 0.');
    }
  }

  const totalCreditos = creditosArray.reduce((acc, c) => acc + c, 0);
  const sumaPonderada = notasArray.reduce((acc, nota, idx) => acc + nota * creditosArray[idx], 0);
  const promedioPonderado = sumaPonderada / totalCreditos;

  return {
    promedioPonderado: Math.round(promedioPonderado * 100) / 100,
    totalCreditos,
    cantidadMaterias: notasArray.length,
    detalle: `Promedio ponderado de ${notasArray.length} materia(s) con ${totalCreditos} créditos totales: ${promedioPonderado.toFixed(2)}`,
  };
}
