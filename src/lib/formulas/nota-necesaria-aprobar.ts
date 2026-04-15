/** Calculadora de nota necesaria para aprobar una materia */

export interface Inputs {
  notasActuales: string;
  totalEvaluaciones: number;
  promedioDeseado: number;
}

export interface Outputs {
  notaNecesaria: number;
  promedioActual: number;
  esPosible: string;
  detalle: string;
}

export function notaNecesariaAprobar(i: Inputs): Outputs {
  if (!i.notasActuales || i.notasActuales.trim() === '') {
    throw new Error('Ingresá al menos una nota actual');
  }

  const totalEvaluaciones = Number(i.totalEvaluaciones);
  const promedioDeseado = Number(i.promedioDeseado);

  if (!totalEvaluaciones || totalEvaluaciones < 1) {
    throw new Error('El total de evaluaciones debe ser al menos 1');
  }
  if (!promedioDeseado || promedioDeseado < 1 || promedioDeseado > 10) {
    throw new Error('El promedio deseado debe estar entre 1 y 10');
  }

  const notasArray = i.notasActuales
    .split(',')
    .map((n) => parseFloat(n.trim()))
    .filter((n) => !isNaN(n));

  if (notasArray.length === 0) {
    throw new Error('No se encontraron notas válidas.');
  }
  if (notasArray.length >= totalEvaluaciones) {
    throw new Error('Ya tenés todas las evaluaciones rendidas. No hay nota pendiente que calcular.');
  }

  const sumaActual = notasArray.reduce((acc, n) => acc + n, 0);
  const promedioActual = sumaActual / notasArray.length;
  const evaluacionesPendientes = totalEvaluaciones - notasArray.length;
  const sumaFaltante = promedioDeseado * totalEvaluaciones - sumaActual;
  const notaNecesaria = sumaFaltante / evaluacionesPendientes;

  let esPosible: string;
  if (notaNecesaria > 10) {
    esPosible = 'No, necesitás más de 10. Considerá recuperar un parcial.';
  } else if (notaNecesaria <= 0) {
    esPosible = 'Sí, ya tenés asegurado ese promedio con cualquier nota.';
  } else {
    esPosible = `Sí, necesitás ${notaNecesaria.toFixed(2)} o más.`;
  }

  return {
    notaNecesaria: Math.round(Math.max(0, notaNecesaria) * 100) / 100,
    promedioActual: Math.round(promedioActual * 100) / 100,
    esPosible,
    detalle: evaluacionesPendientes === 1
      ? `Con ${notasArray.length} nota(s) rendida(s), necesitás un ${Math.max(0, notaNecesaria).toFixed(2)} en la evaluación restante`
      : `Con ${notasArray.length} nota(s) rendida(s), necesitás promediar ${Math.max(0, notaNecesaria).toFixed(2)} en las ${evaluacionesPendientes} evaluaciones restantes`,
  };
}
