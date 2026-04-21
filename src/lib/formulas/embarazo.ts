/**
 * Calculadora de embarazo — regla de Naegele
 * FPP (Fecha probable de parto) = FUM + 280 días (40 semanas)
 */

export interface EmbarazoInputs {
  fum: string; // fecha última menstruación YYYY-MM-DD
}

export interface EmbarazoOutputs {
  fpp: string; // fecha probable parto
  semanas: string; // ej "24 semanas y 3 días"
  trimestre: number;
  diasRestantes: number;
  progreso: string; // porcentaje con "%"
}

export function embarazo(inputs: EmbarazoInputs): EmbarazoOutputs {
  if (!inputs.fum) {
    throw new Error('Ingresá la fecha de tu última menstruación');
  }

  const parts = String(inputs.fum || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error('Fecha inválida');
  }
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) {
    throw new Error('Fecha inválida');
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fum.setHours(0, 0, 0, 0);

  if (fum > hoy) {
    throw new Error('La fecha no puede ser futura');
  }

  const diasTranscurridos = Math.floor((hoy.getTime() - fum.getTime()) / (1000 * 60 * 60 * 24));

  if (diasTranscurridos > 300) {
    throw new Error('Fecha demasiado antigua. Revisá la fecha ingresada.');
  }

  const semanasTotales = Math.floor(diasTranscurridos / 7);
  const diasExtra = diasTranscurridos % 7;

  const fpp = new Date(fum.getTime());
  fpp.setDate(fpp.getDate() + 280);

  const diasRestantes = Math.max(0, 280 - diasTranscurridos);

  let trimestre = 1;
  if (semanasTotales >= 27) trimestre = 3;
  else if (semanasTotales >= 13) trimestre = 2;

  const progreso = Math.min(100, (diasTranscurridos / 280) * 100).toFixed(1);

  return {
    fpp: `${fpp.getFullYear()}-${String(fpp.getMonth()+1).padStart(2,'0')}-${String(fpp.getDate()).padStart(2,'0')}`,
    semanas: `${semanasTotales} semanas y ${diasExtra} días`,
    trimestre,
    diasRestantes,
    progreso: `${progreso}%`,
  };
}
