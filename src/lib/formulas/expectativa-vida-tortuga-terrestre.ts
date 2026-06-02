/** Expectativa de vida de una tortuga terrestre según especie, alojamiento y dieta. */
export interface Inputs {
  especie?: string;
  edadActual?: number;
  alojamiento?: string;
  dieta?: string;
}
export interface Outputs {
  expectativaAnios: number;
  aniosRestantes: number;
  rangoMin: number;
  rangoMax: number;
  categoria: string;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function expectativaVidaTortugaTerrestre(i: Inputs): Outputs {
  const especie = String(i.especie || 'mediterranea');
  const edad = Math.max(0, Number(i.edadActual ?? 5));
  const aloj = String(i.alojamiento || 'mixto');
  const dieta = String(i.dieta || 'buena');

  const baseEspecie: Record<string, number> = {
    'mediterranea': 65,
    'rusa': 50,
    'sulcata': 80,
    'leopardo': 65,
    'caja': 45,
    'indotestudo': 45,
  };
  const base = baseEspecie[especie] ?? 60;

  const fAloj = aloj === 'terrario' ? 0.75 : aloj === 'patio' ? 1.1 : 0.95;
  const fDieta = dieta === 'mala' ? 0.35 : dieta === 'regular' ? 0.75 : 1.05;

  const expectativa = Math.round(base * fAloj * fDieta);
  const rangoMin = Math.round(expectativa * 0.75);
  const rangoMax = Math.round(base * 1.4); // máximo reportado aprox
  const aniosRestantes = Math.max(0, expectativa - edad);

  let categoria = '';
  if (fDieta >= 1 && fAloj >= 1) categoria = 'Longevidad óptima';
  else if (fDieta >= 0.75 && fAloj >= 0.9) categoria = 'Longevidad buena';
  else if (fDieta >= 0.75) categoria = 'Longevidad media';
  else categoria = 'Longevidad reducida por cuidados';

  let recomendacion = '';
  if (dieta === 'mala') recomendacion = 'Urgente mejorar la dieta: variá hojas verdes, agregá calcio (sepia) y exposición a UVB. La lechuga sola acorta años.';
  else if (aloj === 'terrario') recomendacion = 'Si podés, dale sol directo diario (30-60 min) o UVB 10.0 de buena calidad renovada cada 6-12 meses.';
  else recomendacion = 'Mantené dieta variada, acceso a sol real, agua fresca y refugio seco. Controlá hibernación si aplica a tu especie.';

  // --- Insight dinámico según cuidados ---
  let toneIns: 'good' | 'warn' | 'neutral';
  let textIns: string;
  if (dieta === 'mala') {
    toneIns = 'warn';
    textIns =
      `La dieta inadecuada hunde la expectativa a **${expectativa} años**, muy por debajo del máximo de la especie (**${rangoMax} años**). ` +
      `Las tortugas terrestres son extremadamente longevas: corregir la dieta cambia el resultado por décadas.`;
  } else if (categoria === 'Longevidad óptima') {
    toneIns = 'good';
    textIns =
      `Con dieta variada y buen alojamiento, tu tortuga apunta a **${expectativa} años** y puede acercarse a **${rangoMax} años**. ` +
      `Desde los ${edad} actuales, le quedan unos **${aniosRestantes} años** — probablemente te sobreviva.`;
  } else {
    toneIns = 'neutral';
    textIns =
      `Expectativa de **${expectativa} años** (${categoria.toLowerCase()}), con un rango de **${rangoMin}–${rangoMax} años**. ` +
      `Desde los ${edad} años, le quedan aproximadamente **${aniosRestantes} años**.`;
  }
  const _insight = {
    title: 'Qué significa esta expectativa',
    text: textIns,
    tone: toneIns,
    icon: '🐢',
  };

  // --- Gauge: expectativa dentro del rango de la especie ---
  const segMedia = Math.max(1, Math.round(rangoMax * 0.45));
  const segBuena = Math.max(segMedia + 1, Math.round(rangoMax * 0.75));
  const _chart = {
    type: 'scale',
    marker: expectativa,
    markerLabel: `${expectativa} años`,
    min: 0,
    segments: [
      { nombre: 'Reducida', max: segMedia, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Media', max: segBuena, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Buena', max: rangoMax, color: '#84cc16', colorDark: '#4d7c0f' },
      { nombre: 'Óptima', max: Math.round(rangoMax * 1.12), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Expectativa de ${expectativa} años en una escala de longevidad de la especie de 0 a ${Math.round(rangoMax * 1.12)} años.`,
  };

  return {
    expectativaAnios: expectativa,
    aniosRestantes,
    rangoMin,
    rangoMax,
    categoria,
    recomendacion,
    _insight,
    _chart,
  };
}
