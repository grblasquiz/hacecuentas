/**
 * Carga glucémica de una comida.
 * Fórmula Harvard: CG = (IG × carbos_g) / 100
 */

export interface CargaGlucemicaComidaInputs {
  ig: number;
  carbos100g: number;
  porcion: number;
  __lang?: string;
}

export interface CargaGlucemicaComidaOutputs {
  cg: number;
  carbosEnPorcion: string;
  clasificacion: string;
  recomendacion: string;
  _chart?: any;
}

export function cargaGlucemicaComida(inputs: CargaGlucemicaComidaInputs): CargaGlucemicaComidaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errIg: 'Ingresá un IG válido',
      errCarbos: 'Carbos inválidos',
      errPorcion: 'Porción inválida',
      clasifBaja: 'Baja ✅',
      clasifMedia: 'Media',
      clasifAlta: 'Alta ⚠️',
      recBaja: 'Impacto bajo en glucemia. Apto para todas las dietas.',
      recMedia: 'Impacto moderado. Combiná con fibra/proteína.',
      recAlta: 'Impacto alto. Reducir porción o combinar con grasas/proteína.',
      segBaja: 'Baja',
      segMedia: 'Media',
      segAlta: 'Alta',
      ariaLabel: 'Escala de carga glucémica (Harvard): baja <10, media 10-20, alta >20',
    },
    en: {
      errIg: 'Enter a valid GI',
      errCarbos: 'Invalid carbs',
      errPorcion: 'Invalid serving size',
      clasifBaja: 'Low ✅',
      clasifMedia: 'Medium',
      clasifAlta: 'High ⚠️',
      recBaja: 'Low glycemic impact. Suitable for all diets.',
      recMedia: 'Moderate impact. Combine with fiber/protein.',
      recAlta: 'High impact. Reduce portion size or pair with fats/protein.',
      segBaja: 'Low',
      segMedia: 'Medium',
      segAlta: 'High',
      ariaLabel: 'Glycemic load scale (Harvard): low <10, medium 10-20, high >20',
    },
  } as const)[__lang];

  const ig = Number(inputs.ig);
  const carbos100 = Number(inputs.carbos100g);
  const porcion = Number(inputs.porcion);
  if (!ig || ig <= 0) throw new Error(T.errIg);
  if (carbos100 < 0) throw new Error(T.errCarbos);
  if (!porcion || porcion <= 0) throw new Error(T.errPorcion);

  const carbosReales = (porcion * carbos100) / 100;
  const cg = (ig * carbosReales) / 100;

  let clasif = '', rec = '';
  if (cg < 10) { clasif = T.clasifBaja; rec = T.recBaja; }
  else if (cg < 20) { clasif = T.clasifMedia; rec = T.recMedia; }
  else { clasif = T.clasifAlta; rec = T.recAlta; }

  const cgFinal = Number(cg.toFixed(1));

  const chart = {
    type: 'scale' as const,
    marker: cgFinal,
    markerLabel: 'CG: ' + cgFinal,
    min: 0,
    unit: '',
    segments: [
      { nombre: T.segBaja, max: 10, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segMedia, max: 20, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segAlta, max: Math.max(30, Math.ceil(cgFinal) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: T.ariaLabel,
  };

  return {
    cg: cgFinal,
    carbosEnPorcion: `${carbosReales.toFixed(1)} g`,
    clasificacion: clasif,
    recomendacion: rec,
    _chart: chart,
  };
}
