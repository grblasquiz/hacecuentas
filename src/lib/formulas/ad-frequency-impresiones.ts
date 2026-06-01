/** Frecuencia publicitaria = impresiones / alcance (reach) */
export interface Inputs {
  impresiones: number;
  alcance: number;
  presupuesto?: number;
  diasCampana?: number;
}
export interface Outputs {
  frecuencia: number;
  frecuenciaTotal: number;
  frecuenciaSemanal: number;
  frecuenciaDiaria: number;
  clasificacion: string;
  diagnostico: string;
  costoPorImpresion: number;
  costoPorPersona: number;
  recomendacion: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function adFrequencyImpresiones(i: Inputs): Outputs {
  const imp = Number(i.impresiones);
  const reach = Number(i.alcance);
  const pres = Number(i.presupuesto) || 0;
  const dias = Number(i.diasCampana) || 7;

  if (!imp || imp <= 0) throw new Error('Ingresá las impresiones');
  if (!reach || reach <= 0) throw new Error('Ingresá el alcance (reach)');
  if (reach > imp) throw new Error('El alcance no puede superar a las impresiones');

  const frecuencia = imp / reach;
  const frecuenciaTotal = frecuencia;
  const diasEfectivos = dias > 0 ? dias : 7;
  const frecuenciaDiaria = frecuencia / diasEfectivos;
  const frecuenciaSemanal = frecuenciaDiaria * 7;
  const cpi = pres > 0 ? (pres / imp) * 1000 : 0; // CPM
  const cpp = pres > 0 ? pres / reach : 0;

  let diagnostico = '';
  let recomendacion = '';
  let clasificacion = '';
  if (frecuencia < 1.5) {
    clasificacion = 'Muy baja';
    diagnostico = 'Frecuencia muy baja: riesgo de no recordación.';
    recomendacion = 'Subí la inversión o reducí la audiencia para impactar más veces a cada persona.';
  } else if (frecuencia <= 3) {
    clasificacion = 'Óptima';
    diagnostico = 'Zona óptima: balance entre recordación y ahorro (regla de Krugman: 3 impactos efectivos).';
    recomendacion = 'Mantené esta frecuencia para campañas de awareness.';
  } else if (frecuencia <= 7) {
    clasificacion = 'Alta (óptima en performance)';
    diagnostico = 'Frecuencia alta: útil en performance pero cuidado con la fatiga publicitaria.';
    recomendacion = 'Rotá creatividades cada 7-10 días para evitar banner blindness.';
  } else if (frecuencia <= 15) {
    clasificacion = 'Muy alta (riesgo de fatiga)';
    diagnostico = 'Frecuencia muy alta: probable fatiga y CTR decreciente.';
    recomendacion = 'Ampliá la audiencia o pausá el segmento saturado.';
  } else {
    clasificacion = 'Saturación';
    diagnostico = 'Saturación total: desperdicio de presupuesto.';
    recomendacion = 'Cambiá creatividades, ampliá targeting, o bajá el bid.';
  }

  const resumen = `Cada persona vio tu anuncio ${frecuencia.toFixed(2)} veces en promedio.`;

  const frecRed = Number(frecuencia.toFixed(2));
  const chart = {
    type: 'scale' as const,
    marker: frecRed,
    markerLabel: 'Tu frecuencia: ' + frecRed,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Muy baja', max: 1.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Óptima', max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Alta', max: 7, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy alta', max: 15, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Saturación', max: Math.max(20, Math.ceil(frecRed) + 2), color: '#fca5a5', colorDark: '#7f1d1d' },
    ],
    ariaLabel: 'Escala de frecuencia publicitaria: muy baja, óptima, alta, muy alta y saturación.',
  };

  // Insight narrativo: ubica la frecuencia en su zona e interpreta qué significa.
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightTitle: string;
  let insightIcon: string;
  if (frecuencia < 1.5) {
    insightTone = 'warn'; insightTitle = 'Frecuencia muy baja'; insightIcon = '📉';
  } else if (frecuencia <= 3) {
    insightTone = 'good'; insightTitle = 'Zona óptima'; insightIcon = '🎯';
  } else if (frecuencia <= 7) {
    insightTone = 'neutral'; insightTitle = 'Frecuencia alta'; insightIcon = '📊';
  } else if (frecuencia <= 15) {
    insightTone = 'warn'; insightTitle = 'Riesgo de fatiga'; insightIcon = '⚠️';
  } else {
    insightTone = 'warn'; insightTitle = 'Saturación'; insightIcon = '🛑';
  }
  const cppFrase = cpp > 0 ? ` Cada persona te costó **$${cpp.toFixed(2)}** alcanzarla.` : '';
  const insight = {
    title: insightTitle,
    text: `Cada persona vio tu anuncio **${frecuencia.toFixed(2)} veces** en promedio: zona "${clasificacion}".${cppFrase} ${recomendacion}`,
    tone: insightTone,
    icon: insightIcon,
  };

  return {
    frecuencia: Number(frecuencia.toFixed(2)),
    frecuenciaTotal: Number(frecuenciaTotal.toFixed(2)),
    frecuenciaSemanal: Number(frecuenciaSemanal.toFixed(2)),
    frecuenciaDiaria: Number(frecuenciaDiaria.toFixed(2)),
    clasificacion,
    diagnostico,
    costoPorImpresion: Number(cpi.toFixed(2)),
    costoPorPersona: Number(cpp.toFixed(2)),
    recomendacion,
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
