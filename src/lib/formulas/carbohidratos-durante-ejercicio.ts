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
  _insight?: any;
  _chart?: any;
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
      insightTitle: 'Tu plan de avituallamiento',
      insightCorto: `Para **${'${dur}'} min** no hace falta cargar carbs: tus reservas de glucógeno alcanzan. Hidratate con agua y listo.`,
      insightOk: `A **${'${gh}'} g/hora** vas a necesitar **${'${tot}'} g** en toda la sesión, unos **${'${gel}'} geles** o **${'${ban}'} bananas**. Empezá a comer a los 30-45 min, no esperés a tener hambre.`,
      insightAlto: `Apuntás a **${'${gh}'} g/hora** (**${'${tot}'} g** totales). Por encima de 60 g/h necesitás mezcla glucosa+fructosa 2:1 para no saturar el intestino; repartí en **${'${gel}'} geles** a lo largo del esfuerzo.`,
      gaugeLabel: 'g/hora',
      zLow: 'Sin carga',
      zMod: 'Moderada',
      zHigh: 'Alta (glu+fru)',
      gaugeAria: 'Ingesta de carbohidratos por hora ubicada en su zona de absorción recomendada.',
    },
    en: {
      errorPeso: 'Enter your weight',
      tipoCarbCorto: 'You do not need carbs during exercise for this duration.',
      tipoCarbMedio: 'Simple glucose: gels, sports chews, banana, sports drink.',
      tipoCarbLargo: 'Glucose + fructose blend (2:1) for maximum absorption of up to 90g/hour.',
      mensajeCorto: 'You do not need extra carbohydrates for sessions under 60 minutes.',
      insightTitle: 'Your fueling plan',
      insightCorto: `For **${'${dur}'} min** you do not need to load carbs: your glycogen stores are enough. Just hydrate with water.`,
      insightOk: `At **${'${gh}'} g/hour** you'll need **${'${tot}'} g** across the session — about **${'${gel}'} gels** or **${'${ban}'} bananas**. Start eating at 30-45 min, don't wait until you feel hungry.`,
      insightAlto: `You're targeting **${'${gh}'} g/hour** (**${'${tot}'} g** total). Above 60 g/h you need a 2:1 glucose+fructose blend to avoid gut overload; spread it across **${'${gel}'} gels** during the effort.`,
      gaugeLabel: 'g/hour',
      zLow: 'No fueling',
      zMod: 'Moderate',
      zHigh: 'High (glu+fru)',
      gaugeAria: 'Carbohydrate intake per hour placed within its recommended absorption zone.',
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

  const fill = (s: string) => s
    .replace('${dur}', String(duracion))
    .replace('${gh}', String(gramosHora))
    .replace('${tot}', String(totalSesion))
    .replace('${gel}', String(geles))
    .replace('${ban}', String(bananas));

  let _insight: any;
  if (gramosHora === 0) {
    _insight = { title: T.insightTitle, text: fill(T.insightCorto), tone: 'neutral', icon: '🏃' };
  } else if (gramosHora <= 60) {
    _insight = { title: T.insightTitle, text: fill(T.insightOk), tone: 'good', icon: '🍌' };
  } else {
    _insight = { title: T.insightTitle, text: fill(T.insightAlto), tone: 'warn', icon: '⚡' };
  }

  // Gauge: g/hora dentro de las zonas de absorción intestinal recomendadas.
  const _chart = {
    type: 'scale',
    marker: gramosHora,
    markerLabel: `${gramosHora} ${T.gaugeLabel}`,
    min: 0,
    segments: [
      { nombre: T.zLow, max: 30, color: '#cbd5e1', colorDark: '#475569' },
      { nombre: T.zMod, max: 60, color: '#34d399', colorDark: '#059669' },
      { nombre: T.zHigh, max: 100, color: '#f59e0b', colorDark: '#b45309' },
    ],
    ariaLabel: T.gaugeAria,
  };

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
        : `Necesitás ~${gramosHora}g/hora de carbs (${totalSesion}g total ≈ ${geles} geles). Empezá a los 30-45 min de ejercicio.`,
    _insight,
    _chart,
  };
}