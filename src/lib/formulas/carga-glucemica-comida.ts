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

  return {
    cg: Number(cg.toFixed(1)),
    carbosEnPorcion: `${carbosReales.toFixed(1)} g`,
    clasificacion: clasif,
    recomendacion: rec,
  };
}
