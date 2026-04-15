/** GRP (Gross Rating Points), Reach y Frequency para media planning */

export interface Inputs {
  impresiones: number;
  universo: number;
  alcancePersonas: number;
}

export interface Outputs {
  grp: number;
  reachPct: number;
  frequency: number;
  detalle: string;
}

export function reachFrequencyGrpMedios(i: Inputs): Outputs {
  const imp = Number(i.impresiones);
  const universo = Number(i.universo);
  const reach = Number(i.alcancePersonas);

  if (isNaN(imp) || imp <= 0) throw new Error('Ingresá las impresiones totales');
  if (isNaN(universo) || universo <= 0) throw new Error('Ingresá el tamaño del universo');
  if (isNaN(reach) || reach <= 0) throw new Error('Ingresá las personas alcanzadas');
  if (reach > universo) throw new Error('El reach no puede superar al universo');
  if (reach > imp) throw new Error('El reach no puede superar las impresiones');

  const reachPct = (reach / universo) * 100;
  const frequency = imp / reach;
  const grp = reachPct * frequency;

  let nivelPresion: string;
  if (grp < 100) {
    nivelPresion = 'Presión baja — adecuada para mantenimiento de marca.';
  } else if (grp < 200) {
    nivelPresion = 'Presión media — buena para awareness sostenido.';
  } else if (grp < 400) {
    nivelPresion = 'Presión alta — ideal para lanzamientos y campañas agresivas.';
  } else {
    nivelPresion = 'Presión muy alta — cuidado con la saturación.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `${fmt.format(imp)} impresiones sobre un universo de ${fmt.format(universo)} personas. ` +
    `Reach: ${fmt.format(reach)} personas (${reachPct.toFixed(1)}%). ` +
    `Frecuencia promedio: ${frequency.toFixed(1)} impactos/persona. ` +
    `GRP: ${grp.toFixed(0)}. ${nivelPresion}`;

  return {
    grp: Number(grp.toFixed(0)),
    reachPct: Number(reachPct.toFixed(1)),
    frequency: Number(frequency.toFixed(1)),
    detalle,
  };
}
