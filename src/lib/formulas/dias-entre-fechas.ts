/**
 * Calculadora de días entre dos fechas
 */

export interface DiasInputs {
  desde: string;
  hasta: string;
  __lang?: string;
}

export interface DiasOutputs {
  dias: number;
  semanas: string;
  meses: string;
  anios: string;
  habiles: number;
  _insight?: any;
}

export function diasEntreFechas(inputs: DiasInputs): DiasOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      bothDates: 'Ingresá ambas fechas',
      invalidDate: 'Fecha inválida',
      weeks: (v: string) => `${v} semanas`,
      months: (v: string) => `${v} meses`,
      years: (v: string) => `${v} años`,
      insightTitle: 'Lo que separa a esas fechas',
      sameDay: 'Las dos fechas son **el mismo día**: 0 días de diferencia.',
      insightText: (d: string, w: string, h: string) =>
        `Entre ambas fechas hay **${d} días** (≈ ${w} semanas). De esos, **${h} son días hábiles** de lunes a viernes; el resto son fines de semana.`,
    },
    en: {
      bothDates: 'Enter both dates',
      invalidDate: 'Invalid date',
      weeks: (v: string) => `${v} weeks`,
      months: (v: string) => `${v} months`,
      years: (v: string) => `${v} years`,
      insightTitle: 'What separates those dates',
      sameDay: 'Both dates are **the same day**: 0 days apart.',
      insightText: (d: string, w: string, h: string) =>
        `There are **${d} days** between the two dates (≈ ${w} weeks). Of those, **${h} are working days** Monday to Friday; the rest are weekends.`,
    },
  } as const)[__lang];

  if (!inputs.desde || !inputs.hasta) {
    throw new Error(T.bothDates);
  }

  const partsD = String(inputs.desde || '').split('-').map(Number);
  const partsH = String(inputs.hasta || '').split('-').map(Number);
  if (partsD.length !== 3 || partsD.some(isNaN) || partsH.length !== 3 || partsH.some(isNaN)) {
    throw new Error(T.invalidDate);
  }
  const [yD, mD, dD] = partsD;
  const [yH, mH, dH] = partsH;
  const desde = new Date(yD, mD - 1, dD);
  const hasta = new Date(yH, mH - 1, dH);

  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    throw new Error(T.invalidDate);
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

  const insightText = dias === 0
    ? T.sameDay
    : T.insightText(String(dias), semanas, String(habiles));

  return {
    dias,
    semanas: T.weeks(semanas),
    meses: T.months(meses),
    anios: T.years(anios),
    habiles,
    _insight: {
      title: T.insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '📅',
    },
  };
}
