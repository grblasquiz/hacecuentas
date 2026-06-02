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
  _insight?: any;
  _chart?: any;
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
  hoy.setHours(0, 0, 0, 0);
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
    const diffDias = Math.round((hoy.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24));
    const diasHabiles = Math.floor(diffDias * 5 / 7); // aprox
    diasVacaciones = Math.max(1, Math.floor(diasHabiles / 20));
    tipo = 'Vacaciones proporcionales (1 día cada 20 días hábiles)';
  }

  const antiguedadStr = `${aniosCompletos} año${aniosCompletos !== 1 ? 's' : ''} al 31/12/${hoy.getFullYear()}`;

  // años hasta el próximo tramo y días que se ganarían
  let faltan = 0;
  let proxDias = diasBase;
  if (aniosCompletos < 5) { faltan = 5 - anios; proxDias = 21; }
  else if (aniosCompletos < 10) { faltan = 10 - anios; proxDias = 28; }
  else if (aniosCompletos < 20) { faltan = 20 - anios; proxDias = 35; }

  const insightText = completas
    ? `Con **${aniosCompletos} año${aniosCompletos !== 1 ? 's' : ''}** de antigüedad (tramo **${tramo}**) te corresponden **${diasVacaciones} días corridos** de vacaciones por la LCT Art. 150.` +
      (faltan > 0 ? ` Cuando llegues a los **${aniosCompletos < 5 ? 5 : aniosCompletos < 10 ? 10 : 20} años** pasás a **${proxDias} días** (faltan **${faltan.toFixed(1)}**).` : ' Estás en el tramo máximo de 35 días.')
    : `Por no haber trabajado más de medio año, te corresponden **vacaciones proporcionales**: **${diasVacaciones} día${diasVacaciones !== 1 ? 's' : ''}** (1 cada 20 días hábiles trabajados). El tramo completo para tu antigüedad sería de **${diasBase} días**.`;

  const _insight = {
    title: 'Tus vacaciones por ley',
    text: insightText,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🏖️',
  };

  const _chart = {
    type: 'scale',
    marker: Math.min(Math.max(anios, 0), 25),
    markerLabel: `${diasVacaciones} días`,
    min: 0,
    segments: [
      { nombre: 'Hasta 5 años', max: 5, color: '#bae6fd', colorDark: '#0369a1' },
      { nombre: '5–10 años', max: 10, color: '#7dd3fc', colorDark: '#0284c7' },
      { nombre: '10–20 años', max: 20, color: '#38bdf8', colorDark: '#0ea5e9' },
      { nombre: '+20 años', max: 25, color: '#0ea5e9', colorDark: '#0369a1' },
    ],
    ariaLabel: `Días de vacaciones por antigüedad: ${diasVacaciones} días, tramo ${tramo}.`,
  };

  return {
    diasVacaciones,
    tramo,
    antiguedad: antiguedadStr,
    tipo,
    _insight,
    _chart,
  };
}
