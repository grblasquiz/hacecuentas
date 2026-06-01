/** Período fértil con ciclos irregulares — Ogino adaptado */
export interface Inputs { cicloMasCorto: number; cicloMasLargo: number; fumIrreg: string; __lang?: string; }
export interface Outputs { ventanaFertil: string; inicioVentana: string; finVentana: string; recomendacion: string; }

export function periodoFertilIrregular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      fechaInvalida: 'Ingresá una fecha válida',
      cicloCortoRango: 'Ciclo más corto: entre 18 y 40 días',
      cicloLargoRango: 'Ciclo más largo: entre 24 y 50 días',
      cicloLargoMenor: 'El ciclo más largo debe ser mayor que el más corto',
    },
    en: {
      fechaInvalida: 'Enter a valid date',
      cicloCortoRango: 'Shortest cycle: between 18 and 40 days',
      cicloLargoRango: 'Longest cycle: between 24 and 50 days',
      cicloLargoMenor: 'The longest cycle must be greater than the shortest',
    },
  } as const)[__lang];

  const corto = Number(i.cicloMasCorto);
  const largo = Number(i.cicloMasLargo);
  const parts = String(i.fumIrreg || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(T.fechaInvalida);
  const [yy, mm, dd] = parts;
  const fum = new Date(yy, mm - 1, dd);
  if (isNaN(fum.getTime())) throw new Error(T.fechaInvalida);
  if (corto < 18 || corto > 40) throw new Error(T.cicloCortoRango);
  if (largo < 24 || largo > 50) throw new Error(T.cicloLargoRango);
  if (largo < corto) throw new Error(T.cicloLargoMenor);

  const diaInicio = corto - 18;
  const diaFin = largo - 11;

  const inicio = new Date(fum.getTime());
  inicio.setDate(inicio.getDate() + diaInicio);
  const fin = new Date(fum.getTime());
  fin.setDate(fin.getDate() + diaFin);

  const amplitud = diaFin - diaInicio + 1;
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  let rec = __lang === 'en'
    ? `Your fertile window spans ${amplitud} days (from day ${diaInicio + 1} to day ${diaFin + 1} of your cycle).`
    : `Tu ventana fértil abarca ${amplitud} días (del día ${diaInicio + 1} al ${diaFin + 1} del ciclo).`;
  if (amplitud > 14) {
    rec += __lang === 'en'
      ? ' This is a wide window because your cycles vary a lot. We recommend complementing with ovulation tests (LH) for greater accuracy.'
      : ' Es una ventana amplia porque tus ciclos varían mucho. Te recomendamos complementar con tests de ovulación (LH) para mayor precisión.';
  } else {
    rec += __lang === 'en'
      ? ' Complement with ovulation tests to confirm the exact day.'
      : ' Complementá con tests de ovulación para confirmar el día exacto.';
  }

  return {
    ventanaFertil: __lang === 'en'
      ? `Day ${diaInicio + 1} to day ${diaFin + 1} of the cycle (${amplitud} days)`
      : `Día ${diaInicio + 1} al día ${diaFin + 1} del ciclo (${amplitud} días)`,
    inicioVentana: fmt(inicio),
    finVentana: fmt(fin),
    recomendacion: rec,
  };
}
