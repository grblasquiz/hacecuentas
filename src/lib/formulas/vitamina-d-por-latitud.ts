/**
 * Vitamina D suplementación según latitud.
 */

export interface VitaminaDPorLatitudInputs {
  latitud: number;
  estacion: string;
  exposicion: string;
}

export interface VitaminaDPorLatitudOutputs {
  suplementoUI: number;
  sintesisEsperada: string;
  resumen: string;
}

export function vitaminaDPorLatitud(inputs: VitaminaDPorLatitudInputs): VitaminaDPorLatitudOutputs {
  const lat = Math.abs(Number(inputs.latitud));
  const est = inputs.estacion || 'invierno';
  const exp = inputs.exposicion || 'baja';
  if (!lat || lat < 0) throw new Error('Ingresá latitud válida');
  let sup: number;
  let sintesis: string;
  if (lat < 30) {
    sup = exp === 'alta' ? 0 : 1000;
    sintesis = 'Síntesis solar disponible todo el año (lat <30°).';
  } else if (lat < 40) {
    if (est === 'verano' && exp === 'alta') { sup = 0; sintesis = 'Síntesis OK verano; insuficiente invierno.'; }
    else { sup = 2000; sintesis = 'UVB insuficiente invierno >30° lat.'; }
  } else {
    sup = 2000;
    sintesis = 'UVB insuficiente buena parte del año (>40° lat).';
  }
  return {
    suplementoUI: sup,
    sintesisEsperada: sintesis,
    resumen: sup === 0 ? 'No necesitás suplementar; exposición solar cubre requerimiento.' : `Suplementá ${sup} UI/día de vitamina D3.`,
  };
}
