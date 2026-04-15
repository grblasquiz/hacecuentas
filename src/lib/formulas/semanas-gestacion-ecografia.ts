/** Semanas de gestación estimadas por medidas ecográficas (LCC o DBP) */
export interface Inputs {
  tipoMedida: string;
  medidaMm: number;
  fechaEco: string;
}
export interface Outputs {
  semanasEco: string;
  semanasHoy: string;
  detalle: string;
}

export function semanasGestacionEcografia(i: Inputs): Outputs {
  const tipo = String(i.tipoMedida || 'lcc');
  const mm = Number(i.medidaMm);
  const fechaEco = new Date(i.fechaEco);

  if (!mm || mm <= 0) throw new Error('Ingresá la medida en milímetros');
  if (isNaN(fechaEco.getTime())) throw new Error('Ingresá una fecha de ecografía válida');

  let diasGestacion: number;

  if (tipo === 'lcc') {
    if (mm < 1 || mm > 84) throw new Error('El LCC debe estar entre 1 y 84 mm');
    // Aproximación Robinson-Fleming: edad (días) = 8.052 × √(LCC) + 23.73 × LCC + 25.43
    // Simplificación lineal por tramos basada en tablas Hadlock
    if (mm <= 4) diasGestacion = 37 + (mm - 1) * 2;
    else if (mm <= 8) diasGestacion = 43 + (mm - 5) * 1.75;
    else if (mm <= 14) diasGestacion = 49 + (mm - 9) * 1.17;
    else if (mm <= 21) diasGestacion = 56 + (mm - 15) * 1;
    else if (mm <= 29) diasGestacion = 63 + (mm - 22) * 0.88;
    else if (mm <= 39) diasGestacion = 70 + (mm - 30) * 0.7;
    else if (mm <= 55) diasGestacion = 77 + (mm - 40) * 0.47;
    else if (mm <= 65) diasGestacion = 84 + (mm - 56) * 0.7;
    else if (mm <= 75) diasGestacion = 91 + (mm - 66) * 0.5;
    else diasGestacion = 96 + (mm - 76) * 0.5;
  } else {
    // DBP
    if (mm < 25 || mm > 100) throw new Error('El DBP debe estar entre 25 y 100 mm');
    // Aproximación Hadlock por tramos
    if (mm <= 30) diasGestacion = 98 + (mm - 25) * 1.4;
    else if (mm <= 40) diasGestacion = 105 + (mm - 31) * 1.4;
    else if (mm <= 55) diasGestacion = 119 + (mm - 41) * 1.4;
    else if (mm <= 72) diasGestacion = 140 + (mm - 56) * 1.24;
    else if (mm <= 87) diasGestacion = 161 + (mm - 73) * 1.4;
    else if (mm <= 95) diasGestacion = 182 + (mm - 88) * 2.63;
    else diasGestacion = 203 + (mm - 96) * 2.8;
  }

  diasGestacion = Math.round(diasGestacion);
  const semanasEnEco = Math.floor(diasGestacion / 7);
  const diasEnEco = diasGestacion % 7;

  // Semanas hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaEco.setHours(0, 0, 0, 0);
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaEco.getTime()) / 86400000);
  const diasGestacionHoy = diasGestacion + diasTranscurridos;
  const semanasHoyNum = Math.floor(diasGestacionHoy / 7);
  const diasHoyNum = diasGestacionHoy % 7;

  const semanasEco = `${semanasEnEco} semanas y ${diasEnEco} días`;
  const semanasHoy = `${semanasHoyNum} semanas y ${diasHoyNum} días`;
  const medidaLabel = tipo === 'lcc' ? 'LCC' : 'DBP';

  const detalle =
    `${medidaLabel}: ${mm} mm → ${semanasEco} en la fecha de eco | ` +
    `Días transcurridos desde la eco: ${diasTranscurridos} | ` +
    `Edad gestacional hoy: ${semanasHoy}.`;

  return {
    semanasEco,
    semanasHoy,
    detalle,
  };
}
