/** ¿Cuántas horas de exposición para niño bilingüe? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  porcentaje: number;
  tipoBilinguismo: string;
  horasTotales: number;
  recomendacion: string;
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
    },
    en: {
      receptivo: 'Weak receptive',
      pasivo: 'Passive bilingual (understands, speaks little)',
      activo: 'Active balanced bilingual ✅',
      dominante: 'Dominant in minority language',
      recVentana: 'Outside the simultaneous window — consider a structured L2 program.',
      recSuma: 'Add play groups, video calls with grandparents, or a nanny to cross the 30% mark.',
      recSolido: 'Solid plan. Keep OPOL and read to them every day.',
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

  return {
    porcentaje: Math.round(pct),
    tipoBilinguismo: tipo,
    horasTotales: Math.round(horasMin),
    recomendacion: rec,
  };

}
