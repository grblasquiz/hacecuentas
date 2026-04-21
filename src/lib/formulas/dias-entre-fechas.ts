/**
 * Calculadora de días entre dos fechas
 */

export interface DiasInputs {
  desde: string;
  hasta: string;
}

export interface DiasOutputs {
  dias: number;
  semanas: string;
  meses: string;
  anios: string;
  habiles: number;
}

export function diasEntreFechas(inputs: DiasInputs): DiasOutputs {
  if (!inputs.desde || !inputs.hasta) {
    throw new Error('Ingresá ambas fechas');
  }

  const partsD = String(inputs.desde || '').split('-').map(Number);
  const partsH = String(inputs.hasta || '').split('-').map(Number);
  if (partsD.length !== 3 || partsD.some(isNaN) || partsH.length !== 3 || partsH.some(isNaN)) {
    throw new Error('Fecha inválida');
  }
  const [yD, mD, dD] = partsD;
  const [yH, mH, dH] = partsH;
  const desde = new Date(yD, mD - 1, dD);
  const hasta = new Date(yH, mH - 1, dH);

  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    throw new Error('Fecha inválida');
  }

  desde.setHours(0, 0, 0, 0);
  hasta.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diasRaw = Math.round((hasta.getTime() - desde.getTime()) / msPerDay);
  const dias = Math.abs(diasRaw);

  // Días hábiles (excluye sábados y domingos)
  let habiles = 0;
  const start = diasRaw >= 0 ? desde : hasta;
  const end = diasRaw >= 0 ? hasta : desde;
  const current = new Date(start.getTime());
  while (current < end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) habiles++;
    current.setDate(current.getDate() + 1);
  }

  const semanas = (dias / 7).toFixed(1);
  const meses = (dias / 30.44).toFixed(1);
  const anios = (dias / 365.25).toFixed(2);

  return {
    dias,
    semanas: `${semanas} semanas`,
    meses: `${meses} meses`,
    anios: `${anios} años`,
    habiles,
  };
}
