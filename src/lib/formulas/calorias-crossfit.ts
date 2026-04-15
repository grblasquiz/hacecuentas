/** Calorías en CrossFit / HIIT — WOD */
export interface Inputs { peso: number; duracion: number; tipoWod: string; }
export interface Outputs {
  caloriasQuemadas: number;
  caloriasPostEjercicio: number;
  totalCalorias: number;
  detalle: string;
}

const WOD_DATA: Record<string, { met: number; epoc: number; nombre: string }> = {
  amrap: { met: 8.0, epoc: 0.15, nombre: 'AMRAP' },
  emom: { met: 7.0, epoc: 0.12, nombre: 'EMOM' },
  fortime: { met: 9.5, epoc: 0.20, nombre: 'For Time' },
  chipper: { met: 7.5, epoc: 0.13, nombre: 'Chipper' },
};

export function caloriasCrossfit(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.duracion);
  const tipo = String(i.tipoWod || 'amrap');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (!min || min <= 0) throw new Error('Ingresá la duración en minutos');

  const info = WOD_DATA[tipo] || WOD_DATA['amrap'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const durante = kcalMin * min;
  const epoc = durante * info.epoc;
  const total = durante + epoc;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasQuemadas: Math.round(durante),
    caloriasPostEjercicio: Math.round(epoc),
    totalCalorias: Math.round(total),
    detalle: `WOD ${info.nombre} de ${min} min (MET ${info.met}): ~${fmt.format(Math.round(durante))} kcal durante + ~${fmt.format(Math.round(epoc))} kcal afterburn (EPOC ${Math.round(info.epoc * 100)}%) = ~${fmt.format(Math.round(total))} kcal totales.`,
  };
}
