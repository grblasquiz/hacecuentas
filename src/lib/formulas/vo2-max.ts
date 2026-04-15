/** VO2max — estimación por test Cooper (12 min) */
export interface Inputs { metrosEn12Min: number; sexo: 'm' | 'f' | string; edad: number; }
export interface Outputs {
  vo2max: number;
  categoria: string;
  percentilEdad: string;
  _chart?: any;
}

export function vo2Max(i: Inputs): Outputs {
  const metros = Number(i.metrosEn12Min);
  const sexo = String(i.sexo || 'm');
  const edad = Number(i.edad);
  if (!metros || metros <= 0) throw new Error('Ingresá metros corridos en 12 min');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  // Cooper: VO2max = (metros − 504.9) / 44.73
  const vo2 = (metros - 504.9) / 44.73;

  // Categorías por edad y sexo (Heyward)
  const tablaM: Array<[number, number, number, number, number, number]> = [
    // edad, muyBajo, bajo, promedio, bueno, excelente
    [20, 37, 42, 46, 50, 55],
    [30, 36, 40, 44, 48, 54],
    [40, 34, 38, 42, 46, 52],
    [50, 31, 35, 40, 43, 49],
    [60, 28, 32, 36, 39, 45],
  ];
  const tablaF: Array<[number, number, number, number, number, number]> = [
    [20, 30, 34, 38, 42, 46],
    [30, 29, 33, 36, 40, 44],
    [40, 27, 31, 35, 38, 42],
    [50, 25, 28, 32, 35, 39],
    [60, 23, 26, 30, 33, 37],
  ];
  const tabla = sexo === 'f' ? tablaF : tablaM;
  let row = tabla[0];
  for (const r of tabla) if (edad >= r[0]) row = r;

  let cat = '';
  if (vo2 < row[1]) cat = 'Muy bajo';
  else if (vo2 < row[2]) cat = 'Bajo';
  else if (vo2 < row[3]) cat = 'Promedio';
  else if (vo2 < row[4]) cat = 'Bueno';
  else if (vo2 < row[5]) cat = 'Muy bueno';
  else cat = 'Excelente (atlético)';

  // Chart tipo "scale": rangos de categoría + marker con el valor del usuario
  const rangos = [
    { nombre: 'Muy bajo', max: row[1] },
    { nombre: 'Bajo', max: row[2] },
    { nombre: 'Promedio', max: row[3] },
    { nombre: 'Bueno', max: row[4] },
    { nombre: 'Muy bueno', max: row[5] },
    { nombre: 'Excelente', max: Math.max(row[5] + 10, Math.ceil(vo2) + 2) },
  ];
  const chart = {
    type: 'scale' as const,
    ariaLabel: `Escala de VO2max: tu valor ${Math.round(vo2 * 10) / 10} ml/kg/min cae en la categoría "${cat}".`,
    marker: Math.round(vo2 * 10) / 10,
    markerLabel: `Tu VO2max: ${Math.round(vo2 * 10) / 10}`,
    segments: rangos,
    unit: 'ml/kg/min',
    min: 0,
  };

  return {
    vo2max: Math.round(vo2 * 10) / 10,
    categoria: cat,
    percentilEdad: `Referencia para ${sexo === 'f' ? 'mujeres' : 'hombres'} de ~${row[0]} años: promedio ${row[3]} ml/kg/min`,
    _chart: chart,
  };
}
