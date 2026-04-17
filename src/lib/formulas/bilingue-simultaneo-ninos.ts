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
  const hp = Number(i.horasPadre) || 0;
  const he = Number(i.horasEscuela) || 0;
  const hm = Number(i.horasMedios) || 0;
  const edad = String(i.edadNino || '0-3');

  const horasMin = hp + he + (hm * 0.5);
  const totalDespierto = 84;
  const pct = (horasMin / totalDespierto) * 100;

  let tipo = '';
  if (pct < 15) tipo = 'Receptivo débil';
  else if (pct < 30) tipo = 'Bilingüe pasivo (entiende, habla poco)';
  else if (pct < 50) tipo = 'Bilingüe activo equilibrado ✅';
  else tipo = 'Dominante en minoritario';

  let rec = '';
  if (edad === '10+') rec = 'Fuera de ventana simultánea — considerá programa L2 estructurado.';
  else if (pct < 30) rec = 'Sumá grupos de juego, abuelos por video o niñera para cruzar el 30%.';
  else rec = 'Plan sólido. Mantené OPOL y leele libros a diario.';

  return {
    porcentaje: Math.round(pct),
    tipoBilinguismo: tipo,
    horasTotales: Math.round(horasMin),
    recomendacion: rec,
  };

}
