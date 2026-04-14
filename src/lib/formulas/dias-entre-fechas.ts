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

  const desde = new Date(inputs.desde);
  const hasta = new Date(inputs.hasta);

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
  const current = new Date(start);
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
