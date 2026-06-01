/**
 * Carga glucémica de una comida.
 * Fórmula Harvard: CG = (IG × carbos_g) / 100
 */

export interface CargaGlucemicaComidaInputs {
  ig: number;
  carbos100g: number;
  porcion: number;
}

export interface CargaGlucemicaComidaOutputs {
  cg: number;
  carbosEnPorcion: string;
  clasificacion: string;
  recomendacion: string;
  _chart?: any;
}

export function cargaGlucemicaComida(inputs: CargaGlucemicaComidaInputs): CargaGlucemicaComidaOutputs {
  const ig = Number(inputs.ig);
  const carbos100 = Number(inputs.carbos100g);
  const porcion = Number(inputs.porcion);
  if (!ig || ig <= 0) throw new Error('Ingresá un IG válido');
  if (carbos100 < 0) throw new Error('Carbos inválidos');
  if (!porcion || porcion <= 0) throw new Error('Porción inválida');

  const carbosReales = (porcion * carbos100) / 100;
  const cg = (ig * carbosReales) / 100;

  let clasif = '', rec = '';
  if (cg < 10) { clasif = 'Baja ✅'; rec = 'Impacto bajo en glucemia. Apto para todas las dietas.'; }
  else if (cg < 20) { clasif = 'Media'; rec = 'Impacto moderado. Combiná con fibra/proteína.'; }
  else { clasif = 'Alta ⚠️'; rec = 'Impacto alto. Reducir porción o combinar con grasas/proteína.'; }

  const cgFinal = Number(cg.toFixed(1));

  const chart = {
    type: 'scale' as const,
    marker: cgFinal,
    markerLabel: 'CG: ' + cgFinal,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Baja', max: 10, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Media', max: 20, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Alta', max: Math.max(30, Math.ceil(cgFinal) + 5), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de carga glucémica (Harvard): baja <10, media 10-20, alta >20',
  };

  return {
    cg: cgFinal,
    carbosEnPorcion: `${carbosReales.toFixed(1)} g`,
    clasificacion: clasif,
    recomendacion: rec,
    _chart: chart,
  };
}
