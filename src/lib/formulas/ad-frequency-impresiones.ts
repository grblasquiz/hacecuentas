/** Frecuencia publicitaria = impresiones / alcance (reach) */
export interface Inputs {
  impresiones: number;
  alcance: number;
  presupuesto?: number;
}
export interface Outputs {
  frecuencia: number;
  diagnostico: string;
  costoPorImpresion: number;
  costoPorPersona: number;
  recomendacion: string;
  resumen: string;
}

export function adFrequencyImpresiones(i: Inputs): Outputs {
  const imp = Number(i.impresiones);
  const reach = Number(i.alcance);
  const pres = Number(i.presupuesto) || 0;

  if (!imp || imp <= 0) throw new Error('Ingresá las impresiones');
  if (!reach || reach <= 0) throw new Error('Ingresá el alcance (reach)');
  if (reach > imp) throw new Error('El alcance no puede superar a las impresiones');

  const frecuencia = imp / reach;
  const cpi = pres > 0 ? (pres / imp) * 1000 : 0; // CPM
  const cpp = pres > 0 ? pres / reach : 0;

  let diagnostico = '';
  let recomendacion = '';
  if (frecuencia < 1.5) {
    diagnostico = 'Frecuencia muy baja: riesgo de no recordación.';
    recomendacion = 'Subí la inversión o reducí la audiencia para impactar más veces a cada persona.';
  } else if (frecuencia <= 3) {
    diagnostico = 'Zona óptima: balance entre recordación y ahorro (regla de Krugman: 3 impactos efectivos).';
    recomendacion = 'Mantené esta frecuencia para campañas de awareness.';
  } else if (frecuencia <= 7) {
    diagnostico = 'Frecuencia alta: útil en performance pero cuidado con la fatiga publicitaria.';
    recomendacion = 'Rotá creatividades cada 7-10 días para evitar banner blindness.';
  } else if (frecuencia <= 15) {
    diagnostico = 'Frecuencia muy alta: probable fatiga y CTR decreciente.';
    recomendacion = 'Ampliá la audiencia o pausá el segmento saturado.';
  } else {
    diagnostico = 'Saturación total: desperdicio de presupuesto.';
    recomendacion = 'Cambiá creatividades, ampliá targeting, o bajá el bid.';
  }

  const resumen = `Cada persona vio tu anuncio ${frecuencia.toFixed(2)} veces en promedio.`;

  return {
    frecuencia: Number(frecuencia.toFixed(2)),
    diagnostico,
    costoPorImpresion: Number(cpi.toFixed(2)),
    costoPorPersona: Number(cpp.toFixed(2)),
    recomendacion,
    resumen,
  };
}
