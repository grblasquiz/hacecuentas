/** Score IELTS para tu Band Objetivo */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  promedio: number;
}

export function scoreIeltsBandObjetivo(i: Inputs): Outputs {
  const band = Number(i.bandObjetivo) || 7;
  const debil = String(i.seccionDebil || 'ninguna');

  // Si parejo, todas igual al band objetivo
  // Si débil, bajamos 0.5 a esa y subimos 0.5 a las otras dos para mantener promedio
  let L = band, R = band, W = band, S = band;

  if (debil === 'listening') { L = band - 0.5; R = band + 0.5; }
  else if (debil === 'reading') { R = band - 0.5; L = band + 0.5; }
  else if (debil === 'writing') { W = band - 0.5; L = band + 0.5; R = band + 0.5; }
  else if (debil === 'speaking') { S = band - 0.5; L = band + 0.5; R = band + 0.5; }

  const promedio = (L + R + W + S) / 4;

  return {
    listening: L,
    reading: R,
    writing: W,
    speaking: S,
    promedio: Math.round(promedio * 100) / 100,
  };

}
