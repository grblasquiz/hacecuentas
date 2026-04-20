export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pilatesReformerFrecuenciaIdealSemana(i: Inputs): Outputs {
  const o=String(i.objetivo||'tonificar');
  const f={'mantenimiento':'2x/semana','tonificar':'3-4x/semana','postura':'2-3x/semana','lesion':'2-3x/semana (con profesional)','postparto':'2x/semana (desde semana 6-8)'}[o];
  const s={'mantenimiento':'45-60 min','tonificar':'60 min','postura':'30-45 min','lesion':'30-45 min','postparto':'30-45 min'}[o];
  const r={'mantenimiento':'Conservar','tonificar':'Tono en 8-12 sesiones','postura':'Alineación en 4-6 semanas','lesion':'Recuperación progresiva','postparto':'Recuperación core'}[o];
  return { frecuencia:f, sesionMin:s, resultados:r };
}
