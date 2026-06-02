/** Expectativa de vida de reptiles por especie. */
export interface Inputs {
  especie?: string;
  edadActual?: number;
  terrario?: string;
  dieta?: string;
}
export interface Outputs {
  expectativaAnios: number;
  aniosRestantes: number;
  rangoMin: number;
  rangoMax: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function expectativaVidaReptilesEspecie(i: Inputs): Outputs {
  const especie = String(i.especie || 'gecko-leopardo');
  const edad = Math.max(0, Number(i.edadActual ?? 0));
  const terr = String(i.terrario || 'bueno');
  const dieta = String(i.dieta || 'variada');

  const base: Record<string, { tipica: number; max: number }> = {
    'gecko-leopardo': { tipica: 18, max: 27 },
    'gecko-crestado': { tipica: 17, max: 25 },
    'pogona': { tipica: 13, max: 18 },
    'iguana-verde': { tipica: 17, max: 30 },
    'camaleon': { tipica: 6, max: 10 },
    'corn-snake': { tipica: 18, max: 30 },
    'ball-python': { tipica: 28, max: 40 },
    'boa': { tipica: 28, max: 40 },
    'tortuga-acuatica': { tipica: 25, max: 40 },
    'eslizon': { tipica: 17, max: 25 },
  };
  const b = base[especie] ?? { tipica: 15, max: 25 };

  const fTerr = terr === 'malo' ? 0.4 : terr === 'regular' ? 0.8 : 1.0;
  const fDieta = dieta === 'pobre' ? 0.5 : dieta === 'media' ? 0.85 : 1.0;

  const expectativa = Math.round(b.tipica * fTerr * fDieta);
  const restantes = Math.max(0, expectativa - edad);

  let rec = '';
  if (terr === 'malo') rec = 'Revisá tamaño del terrario, UVB (reemplazar cada 6-12 meses), gradiente térmico y humedad. Es el factor que más acorta vida.';
  else if (dieta === 'pobre') rec = 'Diversificá la dieta y suplementá con calcio+D3 y multivitamínico. La MBD por deficiencia de calcio es la causa más común de muerte temprana.';
  else rec = 'Seguí manteniendo UVB al día, gradiente térmico, humedad y dieta variada. Control veterinario exótico al menos anual.';

  const rangoMin = Math.round(b.tipica * 0.6);
  const rangoMax = b.max;

  // --- Insight dinámico según factores de cuidado ---
  let toneIns: 'good' | 'warn' | 'neutral';
  let textIns: string;
  if (terr === 'malo' || dieta === 'pobre') {
    toneIns = 'warn';
    const culpable = terr === 'malo' ? 'el terrario inadecuado' : 'la dieta pobre';
    textIns =
      `La expectativa cae a **${expectativa} años** por ${culpable}: bien cuidado, esta especie alcanza hasta **${rangoMax} años**. ` +
      `Es la brecha entre una vida media y una larga.`;
  } else if (fTerr === 1 && fDieta === 1) {
    toneIns = 'good';
    textIns =
      `Con terrario y dieta óptimos, tu reptil apunta a **${expectativa} años**, dentro del techo de la especie (**${rangoMax} años**). ` +
      `Le quedan unos **${Math.round(restantes)} años** desde los ${edad} actuales.`;
  } else {
    toneIns = 'neutral';
    textIns =
      `Expectativa estimada de **${expectativa} años** (rango típico **${rangoMin}–${rangoMax}**). ` +
      `Desde los ${edad} años, le quedan aproximadamente **${Math.round(restantes)} años**.`;
  }
  const _insight = {
    title: 'Qué significa esta expectativa',
    text: textIns,
    tone: toneIns,
    icon: '🦎',
  };

  // --- Gauge: expectativa dentro del rango de la especie ---
  const segMedia = Math.max(rangoMin, Math.round(rangoMax * 0.45));
  const segBuena = Math.max(segMedia + 1, Math.round(rangoMax * 0.75));
  const _chart = {
    type: 'scale',
    marker: expectativa,
    markerLabel: `${expectativa} años`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: segMedia, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Media', max: segBuena, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Buena', max: rangoMax, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Máxima', max: Math.round(rangoMax * 1.15), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Expectativa de ${expectativa} años en una escala de longevidad de la especie de 0 a ${Math.round(rangoMax * 1.15)} años.`,
  };

  return {
    expectativaAnios: expectativa,
    aniosRestantes: Math.round(restantes * 10) / 10,
    rangoMin,
    rangoMax,
    recomendacion: rec,
    _insight,
    _chart,
  };
}
