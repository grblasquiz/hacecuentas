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

  return {
    expectativaAnios: expectativa,
    aniosRestantes: Math.round(restantes * 10) / 10,
    rangoMin: Math.round(b.tipica * 0.6),
    rangoMax: b.max,
    recomendacion: rec,
  };
}
