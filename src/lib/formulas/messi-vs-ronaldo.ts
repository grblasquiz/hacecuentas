/** Comparador Messi vs Cristiano Ronaldo — goles, asistencias y títulos oficiales de carrera. */
export interface Inputs {
  metrica: 'goles' | 'asistencias' | 'titulos' | 'balones-oro' | 'ratio-goles-partido' | 'mundiales' | 'goles-seleccion';
}
export interface Outputs {
  metricaLabel: string;
  messi: number;
  cristiano: number;
  lider: 'Messi' | 'Cristiano' | 'Empate';
  diferencia: number;
  mensaje: string;
}

// Datos a marzo 2026 (carrera oficial). Fuentes cruzadas: FBref, Transfermarkt, RSSSF.
const DATOS = {
  goles:               { messi: 870, cristiano: 924, label: 'Goles oficiales (club + selección)' },
  asistencias:         { messi: 376, cristiano: 270, label: 'Asistencias oficiales' },
  titulos:             { messi: 46,  cristiano: 36,  label: 'Títulos oficiales colectivos' },
  'balones-oro':       { messi: 8,   cristiano: 5,   label: 'Balones de Oro (France Football)' },
  'ratio-goles-partido': { messi: 0.79, cristiano: 0.73, label: 'Goles por partido (carrera)' },
  mundiales:           { messi: 1,   cristiano: 0,   label: 'Copas del Mundo FIFA ganadas' },
  'goles-seleccion':   { messi: 112, cristiano: 135, label: 'Goles con la selección nacional' },
};

export function messiVsRonaldo(i: Inputs): Outputs {
  const d = (DATOS as Record<string, { messi: number; cristiano: number; label: string }>)[i.metrica];
  if (!d) throw new Error('Métrica inválida.');
  let lider: 'Messi' | 'Cristiano' | 'Empate';
  if (d.messi > d.cristiano) lider = 'Messi';
  else if (d.cristiano > d.messi) lider = 'Cristiano';
  else lider = 'Empate';
  const diff = Math.abs(d.messi - d.cristiano);
  return {
    metricaLabel: d.label,
    messi: d.messi,
    cristiano: d.cristiano,
    lider,
    diferencia: Math.round(diff * 1000) / 1000,
    mensaje: `${d.label}: Messi ${d.messi} vs Cristiano ${d.cristiano}. Lidera ${lider} por ${diff}.`,
  };
}
