/** Peso de referencia del bebé por mes y percentil — OMS 2006 */
export interface Inputs {
  edadMeses: number;
  sexo: string;
  pesoActual?: number;
}
export interface Outputs {
  pesoMediana: number;
  rangoNormal: string;
  percentilBebe: string;
  detalle: string;
}

export function pesoIdealBebeMesPercentil(i: Inputs): Outputs {
  const mes = Math.round(Number(i.edadMeses));
  const sexo = String(i.sexo || 'm');
  const pesoActual = Number(i.pesoActual) || 0;

  if (mes < 0 || mes > 24) throw new Error('La edad debe estar entre 0 y 24 meses');

  // Tablas OMS simplificadas: [p3, p15, p50, p85, p97]
  const varones: Record<number, number[]> = {
    0: [2.5, 2.9, 3.3, 3.9, 4.4],
    1: [3.4, 3.9, 4.5, 5.1, 5.8],
    2: [4.3, 4.9, 5.6, 6.3, 7.1],
    3: [5.0, 5.7, 6.4, 7.2, 8.0],
    4: [5.6, 6.2, 7.0, 7.8, 8.7],
    5: [6.0, 6.7, 7.5, 8.4, 9.3],
    6: [6.4, 7.1, 7.9, 8.8, 9.8],
    7: [6.7, 7.4, 8.3, 9.2, 10.3],
    8: [6.9, 7.7, 8.6, 9.6, 10.7],
    9: [7.1, 7.9, 8.9, 9.9, 10.9],
    10: [7.4, 8.2, 9.2, 10.2, 11.4],
    11: [7.6, 8.4, 9.4, 10.5, 11.7],
    12: [7.7, 8.6, 9.6, 10.8, 12.0],
    13: [7.9, 8.8, 9.9, 11.0, 12.3],
    14: [8.1, 9.0, 10.1, 11.3, 12.6],
    15: [8.3, 9.2, 10.3, 11.5, 12.8],
    16: [8.4, 9.4, 10.5, 11.7, 13.1],
    17: [8.6, 9.6, 10.7, 12.0, 13.4],
    18: [8.8, 9.8, 10.9, 12.2, 13.7],
    19: [9.0, 10.0, 11.1, 12.5, 13.9],
    20: [9.1, 10.1, 11.3, 12.7, 14.2],
    21: [9.3, 10.3, 11.5, 12.9, 14.5],
    22: [9.5, 10.5, 11.8, 13.2, 14.7],
    23: [9.7, 10.7, 12.0, 13.4, 15.0],
    24: [9.7, 10.8, 12.2, 13.6, 15.3],
  };

  const mujeres: Record<number, number[]> = {
    0: [2.4, 2.8, 3.2, 3.7, 4.2],
    1: [3.2, 3.6, 4.2, 4.8, 5.5],
    2: [3.9, 4.5, 5.1, 5.8, 6.6],
    3: [4.5, 5.2, 5.8, 6.6, 7.5],
    4: [5.0, 5.7, 6.4, 7.3, 8.2],
    5: [5.4, 6.1, 6.9, 7.8, 8.8],
    6: [5.7, 6.5, 7.3, 8.2, 9.3],
    7: [6.0, 6.8, 7.6, 8.6, 9.8],
    8: [6.3, 7.0, 7.9, 9.0, 10.2],
    9: [6.5, 7.3, 8.2, 9.3, 10.5],
    10: [6.7, 7.5, 8.5, 9.6, 10.9],
    11: [6.9, 7.7, 8.7, 9.9, 11.2],
    12: [7.0, 7.9, 8.9, 10.1, 11.5],
    13: [7.2, 8.1, 9.2, 10.4, 11.8],
    14: [7.4, 8.3, 9.4, 10.6, 12.1],
    15: [7.6, 8.5, 9.6, 10.9, 12.4],
    16: [7.7, 8.7, 9.8, 11.1, 12.6],
    17: [7.9, 8.9, 10.0, 11.4, 12.9],
    18: [8.1, 9.1, 10.2, 11.6, 13.2],
    19: [8.2, 9.2, 10.4, 11.8, 13.5],
    20: [8.4, 9.4, 10.6, 12.1, 13.7],
    21: [8.6, 9.6, 10.9, 12.3, 14.0],
    22: [8.7, 9.8, 11.1, 12.5, 14.3],
    23: [8.9, 10.0, 11.3, 12.8, 14.6],
    24: [9.0, 10.2, 11.5, 13.0, 14.8],
  };

  const tabla = sexo === 'f' ? mujeres : varones;
  const p = tabla[mes];
  if (!p) throw new Error('Edad fuera de rango');

  const pesoMediana = p[2]; // p50
  const rangoNormal = `${p[1].toFixed(1)} – ${p[3].toFixed(1)} kg (p15–p85)`;

  let percentilBebe = 'No ingresaste el peso actual';
  if (pesoActual > 0) {
    if (pesoActual < p[0]) percentilBebe = '< percentil 3 — Consultá al pediatra';
    else if (pesoActual < p[1]) percentilBebe = 'Percentil 3-15 — Rango bajo';
    else if (pesoActual < p[2]) percentilBebe = 'Percentil 15-50 — Normal';
    else if (pesoActual < p[3]) percentilBebe = 'Percentil 50-85 — Normal';
    else if (pesoActual < p[4]) percentilBebe = 'Percentil 85-97 — Rango alto';
    else percentilBebe = '> percentil 97 — Consultá al pediatra';
  }

  const sexoLabel = sexo === 'f' ? 'niña' : 'niño';
  const detalle =
    `${sexoLabel} de ${mes} meses | ` +
    `Mediana (p50): ${pesoMediana} kg | ` +
    `Rango p15-p85: ${rangoNormal} | ` +
    `Rango p3-p97: ${p[0].toFixed(1)} – ${p[4].toFixed(1)} kg` +
    (pesoActual > 0 ? ` | Peso actual: ${pesoActual} kg → ${percentilBebe}` : '') +
    '. Tablas OMS 2006.';

  return {
    pesoMediana,
    rangoNormal,
    percentilBebe,
    detalle,
  };
}
