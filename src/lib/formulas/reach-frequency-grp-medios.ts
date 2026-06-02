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
  _insight?: any;
  _chart?: any;
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

  const grpR = Number(grp.toFixed(0));
  const reachPctR = Number(reachPct.toFixed(1));
  const frequencyR = Number(frequency.toFixed(1));

  const tone: 'good' | 'warn' | 'neutral' = grp >= 400 ? 'warn' : grp >= 100 ? 'good' : 'neutral';
  const _insight = {
    title: 'Presión de tu pauta',
    text: `Tu plan suma **${grpR} GRP**: alcanzás al **${reachPctR}%** del universo con una frecuencia de **${frequencyR} impactos por persona**. ${nivelPresion}`,
    tone,
    icon: '📺',
  };

  const _chart = {
    type: 'scale',
    marker: grpR,
    markerLabel: `${grpR} GRP`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 100, color: '#0284c7', colorDark: '#38bdf8' },
      { nombre: 'Media', max: 200, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Alta', max: 400, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Saturación', max: Math.max(600, Math.ceil(grpR) + 50), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Presión publicitaria de ${grpR} GRP sobre escala de saturación de medios`,
  };

  return {
    grp: grpR,
    reachPct: reachPctR,
    frequency: frequencyR,
    detalle,
    _insight,
    _chart,
  };
}
