/**
 * Calculadora de nota final necesaria en la universidad
 * Formula: notaNecesaria = (notaDeseada - notaActual × pesoActual/100) / (pesoFinal/100)
 */

export interface NotaFinalUniversidadInputs {
  notaActual: number;
  pesoNotaActual: number;
  notaDeseada: number;
  pesoExamenFinal: number;
}

export interface NotaFinalUniversidadOutputs {
  notaNecesaria: number;
  esPosible: string;
  formula: string;
  explicacion: string;
  consejo: string;
}

export function notaFinalUniversidad(inputs: NotaFinalUniversidadInputs): NotaFinalUniversidadOutputs {
  const notaActual = Number(inputs.notaActual);
  const pesoActual = Number(inputs.pesoNotaActual);
  const notaDeseada = Number(inputs.notaDeseada);
  const pesoFinal = Number(inputs.pesoExamenFinal);

  if (isNaN(notaActual) || notaActual < 0) throw new Error('Ingresá tu nota actual (0-10)');
  if (isNaN(pesoActual) || pesoActual <= 0 || pesoActual >= 100) throw new Error('El peso de la nota actual debe ser entre 1 y 99%');
  if (isNaN(notaDeseada) || notaDeseada < 1 || notaDeseada > 10) throw new Error('La nota deseada debe ser entre 1 y 10');
  if (isNaN(pesoFinal) || pesoFinal <= 0 || pesoFinal >= 100) throw new Error('El peso del final debe ser entre 1 y 99%');

  // Validar que los pesos sumen ~100
  const sumaPesos = pesoActual + pesoFinal;
  if (sumaPesos < 95 || sumaPesos > 105) {
    throw new Error(`Los pesos suman ${sumaPesos}%. Deberían sumar 100% (actual ${pesoActual}% + final ${pesoFinal}%)`);
  }

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(n);

  // Formula: notaNecesaria = (notaDeseada - notaActual × pesoActual/100) / (pesoFinal/100)
  const aporteParciales = notaActual * (pesoActual / 100);
  const notaNecesaria = (notaDeseada - aporteParciales) / (pesoFinal / 100);

  const formula = `Nota necesaria = (${fmt(notaDeseada)} − ${fmt(notaActual)} × ${pesoActual}%) / ${pesoFinal}% = (${fmt(notaDeseada)} − ${fmt(aporteParciales)}) / ${fmt(pesoFinal / 100)} = ${fmt(notaNecesaria)}`;

  let esPosible: string;
  let consejo: string;

  if (notaNecesaria > 10) {
    esPosible = `No es posible. Necesitarías un ${fmt(notaNecesaria)}, que supera el máximo de 10.`;
    consejo = 'Tus opciones: recuperar un parcial para subir la nota actual, pedir trabajos prácticos extra a la cátedra, o considerar recursar la materia.';
  } else if (notaNecesaria <= 0) {
    esPosible = `¡Ya la tenés asegurada! Incluso con 0 en el final, alcanzás un ${fmt(notaDeseada)}.`;
    consejo = 'Podés ir tranquilo al final. Igual te conviene estudiar para reforzar el conocimiento y mejorar tu promedio general.';
  } else if (notaNecesaria <= 4) {
    esPosible = `Sí, necesitás un ${fmt(notaNecesaria)}. Muy alcanzable.`;
    consejo = 'Estás en muy buena posición. Con una preparación básica deberías lograrlo sin problemas.';
  } else if (notaNecesaria <= 7) {
    esPosible = `Sí, necesitás un ${fmt(notaNecesaria)}. Es alcanzable con buena preparación.`;
    consejo = 'Dedicale tiempo de estudio a esta materia. Repasá los temas que más pesan en el final y hacé ejercicios prácticos.';
  } else {
    esPosible = `Sí, pero es exigente: necesitás un ${fmt(notaNecesaria)}.`;
    consejo = 'Vas a necesitar una preparación intensa. Priorizá esta materia sobre las demás y considerá buscar material extra o grupo de estudio.';
  }

  const explicacion = `Con tu nota actual de ${fmt(notaActual)} (que vale el ${pesoActual}% de la nota final), necesitás sacar ${fmt(Math.max(0, notaNecesaria))} en el examen final (que vale el ${pesoFinal}%) para obtener un promedio de ${fmt(notaDeseada)}. Tus parciales aportan ${fmt(aporteParciales)} puntos al promedio, y el final debe aportar los ${fmt(notaDeseada - aporteParciales)} restantes.`;

  return {
    notaNecesaria: Number(Math.max(0, notaNecesaria).toFixed(2)),
    esPosible,
    formula,
    explicacion,
    consejo,
  };
}
