/** ¿Cuántas horas de exposición para niño bilingüe? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  porcentaje: number;
  tipoBilinguismo: string;
  horasTotales: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function bilingueSimultaneoNinos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const hp = Number(i.horasPadre) || 0;
  const he = Number(i.horasEscuela) || 0;
  const hm = Number(i.horasMedios) || 0;
  const edad = String(i.edadNino || '0-3');

  const horasMin = hp + he + (hm * 0.5);
  const totalDespierto = 84;
  const pct = (horasMin / totalDespierto) * 100;

  const T = ({
    es: {
      receptivo: 'Receptivo débil',
      pasivo: 'Bilingüe pasivo (entiende, habla poco)',
      activo: 'Bilingüe activo equilibrado ✅',
      dominante: 'Dominante en minoritario',
      recVentana: 'Fuera de ventana simultánea — considerá programa L2 estructurado.',
      recSuma: 'Sumá grupos de juego, abuelos por video o niñera para cruzar el 30%.',
      recSolido: 'Plan sólido. Mantené OPOL y leele libros a diario.',
      insTitle: 'Tu nivel de exposición',
      insLow: `Con **{pct}%** de exposición (≈**{h} h** semanales) tu hijo está por debajo del **30%** que la literatura marca como umbral para hablar el idioma de forma activa: hoy va camino a entender más de lo que produce.`,
      insMid: `Con **{pct}%** de exposición (≈**{h} h** semanales) superás el **30%** clave: tu hijo tiene base suficiente para volverse **bilingüe activo equilibrado**.`,
      insHigh: `Con **{pct}%** de exposición (≈**{h} h** semanales) el idioma minoritario domina; cuidá que el mayoritario no quede relegado.`,
      markerLabel: 'Tu exposición',
      segReceptivo: 'Receptivo',
      segPasivo: 'Pasivo',
      segActivo: 'Activo',
      segDominante: 'Dominante',
      gaugeAria: 'Porcentaje de exposición al idioma minoritario y zona de bilingüismo resultante.',
    },
    en: {
      receptivo: 'Weak receptive',
      pasivo: 'Passive bilingual (understands, speaks little)',
      activo: 'Active balanced bilingual ✅',
      dominante: 'Dominant in minority language',
      recVentana: 'Outside the simultaneous window — consider a structured L2 program.',
      recSuma: 'Add play groups, video calls with grandparents, or a nanny to cross the 30% mark.',
      recSolido: 'Solid plan. Keep OPOL and read to them every day.',
      insTitle: 'Your exposure level',
      insLow: `With **{pct}%** exposure (≈**{h} h** per week) your child is below the **30%** that research sets as the threshold to speak the language actively: right now they are heading toward understanding more than they produce.`,
      insMid: `With **{pct}%** exposure (≈**{h} h** per week) you clear the key **30%**: your child has enough of a base to become an **active balanced bilingual**.`,
      insHigh: `With **{pct}%** exposure (≈**{h} h** per week) the minority language dominates; make sure the majority language is not left behind.`,
      markerLabel: 'Your exposure',
      segReceptivo: 'Receptive',
      segPasivo: 'Passive',
      segActivo: 'Active',
      segDominante: 'Dominant',
      gaugeAria: 'Percentage of exposure to the minority language and resulting bilingualism zone.',
    },
  } as const)[__lang];

  let tipo = '';
  if (pct < 15) tipo = T.receptivo;
  else if (pct < 30) tipo = T.pasivo;
  else if (pct < 50) tipo = T.activo;
  else tipo = T.dominante;

  let rec = '';
  if (edad === '10+') rec = T.recVentana;
  else if (pct < 30) rec = T.recSuma;
  else rec = T.recSolido;

  const pctR = Math.round(pct);
  const horasR = Math.round(horasMin);
  const insText = (pct < 30 ? T.insLow : pct < 50 ? T.insMid : T.insHigh)
    .replace('{pct}', String(pctR))
    .replace('{h}', String(horasR));
  const insTone = pct < 30 ? 'warn' : pct < 50 ? 'good' : 'neutral';

  const lastMax = Math.max(60, Math.ceil((pctR + 5) / 10) * 10);
  return {
    porcentaje: pctR,
    tipoBilinguismo: tipo,
    horasTotales: horasR,
    recomendacion: rec,
    _insight: {
      title: T.insTitle,
      text: insText,
      tone: insTone,
      icon: '🗣️',
    },
    _chart: {
      type: 'scale',
      marker: pctR,
      markerLabel: `${T.markerLabel}: ${pctR}%`,
      min: 0,
      segments: [
        { nombre: T.segReceptivo, max: 15, color: '#fca5a5', colorDark: '#7f1d1d' },
        { nombre: T.segPasivo, max: 30, color: '#fcd34d', colorDark: '#78350f' },
        { nombre: T.segActivo, max: 50, color: '#86efac', colorDark: '#14532d' },
        { nombre: T.segDominante, max: lastMax, color: '#93c5fd', colorDark: '#1e3a8a' },
      ],
      ariaLabel: T.gaugeAria,
    },
  };

}
