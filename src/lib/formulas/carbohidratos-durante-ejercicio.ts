/** Calculadora de carbohidratos durante ejercicio */
export interface Inputs {
  duracion: number;
  intensidad: string;
  peso: number;
  __lang?: string;
}
export interface Outputs {
  gramosHora: number;
  totalSesion: number;
  geles: number;
  bananas: number;
  tipoCarb: string;
  mensaje: string;
}

export function carbohidratosDuranteEjercicio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá tu peso',
      tipoCarbCorto: 'No necesitás carbs durante el ejercicio para esta duración.',
      tipoCarbMedio: 'Glucosa simple: geles, gomitas deportivas, banana, bebida deportiva.',
      tipoCarbLargo: 'Mezcla glucosa + fructosa (2:1) para absorción máxima de hasta 90g/hora.',
      mensajeCorto: 'No necesitás carbohidratos extra para sesiones menores a 60 minutos.',
    },
    en: {
      errorPeso: 'Enter your weight',
      tipoCarbCorto: 'You do not need carbs during exercise for this duration.',
      tipoCarbMedio: 'Simple glucose: gels, sports chews, banana, sports drink.',
      tipoCarbLargo: 'Glucose + fructose blend (2:1) for maximum absorption of up to 90g/hour.',
      mensajeCorto: 'You do not need extra carbohydrates for sessions under 60 minutes.',
    },
  } as const)[__lang];

  const duracion = Number(i.duracion) || 60;
  const intensidad = String(i.intensidad || 'moderada');
  const peso = Number(i.peso);
  if (!peso || peso <= 0) throw new Error(T.errorPeso);

  let gramosHora: number;
  let tipoCarb: string;

  if (duracion < 60) {
    gramosHora = 0;
    tipoCarb = T.tipoCarbCorto;
  } else if (duracion <= 150) {
    gramosHora = intensidad === 'alta' ? 60 : intensidad === 'moderada' ? 45 : 30;
    tipoCarb = T.tipoCarbMedio;
  } else {
    gramosHora = intensidad === 'alta' ? 90 : intensidad === 'moderada' ? 70 : 50;
    tipoCarb = T.tipoCarbLargo;
  }

  const horasEjercicio = duracion / 60;
  // Only count fueling time after first 30-45 min
  const horasFueling = Math.max(0, horasEjercicio - 0.5);
  const totalSesion = Math.round(gramosHora * horasFueling);
  const geles = Math.ceil(totalSesion / 25);
  const bananas = Math.ceil(totalSesion / 27);

  return {
    gramosHora,
    totalSesion,
    geles,
    bananas,
    tipoCarb,
    mensaje: duracion < 60
      ? T.mensajeCorto
      : __lang === 'en'
        ? `You need ~${gramosHora}g/hour of carbs (${totalSesion}g total ≈ ${geles} gels). Start fueling at 30-45 min into exercise.`
        : `Necesitás ~${gramosHora}g/hora de carbs (${totalSesion}g total ≈ ${geles} geles). Empezá a los 30-45 min de ejercicio.`
  };
}