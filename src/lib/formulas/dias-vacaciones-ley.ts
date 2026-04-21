/**
 * Calculadora de Días de Vacaciones según Antigüedad - Argentina
 * LCT Art. 150: tramos de 14, 21, 28 y 35 días
 */

export interface DiasVacacionesLeyInputs {
  fechaIngreso: string;
  trabajoMasMitadAnio: string;
}

export interface DiasVacacionesLeyOutputs {
  diasVacaciones: number;
  tramo: string;
  antiguedad: string;
  tipo: string;
}

export function diasVacacionesLey(inputs: DiasVacacionesLeyInputs): DiasVacacionesLeyOutputs {
  const parts = String(inputs.fechaIngreso || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error('Ingresá una fecha de ingreso válida');
  }
  const [yy, mm, dd] = parts;
  const fechaIngreso = new Date(yy, mm - 1, dd);
  if (isNaN(fechaIngreso.getTime())) {
    throw new Error('Ingresá una fecha de ingreso válida');
  }

  const hoy = new Date();
  // La antigüedad para vacaciones se calcula al 31/12 del año en curso
  const finAnio = new Date(hoy.getFullYear(), 11, 31);
  const diffMs = finAnio.getTime() - fechaIngreso.getTime();
  const anios = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  const aniosCompletos = Math.floor(anios);

  let diasBase: number;
  let tramo: string;

  if (aniosCompletos >= 20) {
    diasBase = 35;
    tramo = 'Más de 20 años';
  } else if (aniosCompletos >= 10) {
    diasBase = 28;
    tramo = 'De 10 a 20 años';
  } else if (aniosCompletos >= 5) {
    diasBase = 21;
    tramo = 'De 5 a 10 años';
  } else {
    diasBase = 14;
    tramo = 'Hasta 5 años';
  }

  const completas = inputs.trabajoMasMitadAnio === 'si';
  let diasVacaciones: number;
  let tipo: string;

  if (completas) {
    diasVacaciones = diasBase;
    tipo = 'Vacaciones completas';
  } else {
    // Proporcional: 1 día por cada 20 días hábiles trabajados
    // Estimamos días hábiles trabajados desde ingreso
    const diffDias = Math.floor((hoy.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
    const diasHabiles = Math.floor(diffDias * 5 / 7); // aprox
    diasVacaciones = Math.max(1, Math.floor(diasHabiles / 20));
    tipo = 'Vacaciones proporcionales (1 día cada 20 días hábiles)';
  }

  const antiguedadStr = `${aniosCompletos} año${aniosCompletos !== 1 ? 's' : ''} al 31/12/${hoy.getFullYear()}`;

  return {
    diasVacaciones,
    tramo,
    antiguedad: antiguedadStr,
    tipo,
  };
}
