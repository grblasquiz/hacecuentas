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
  _insight?: any;
  _chart?: any;
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
  const latR = Math.round(lat * 10) / 10;
  const _insight = {
    title: sup === 0 ? 'El sol te alcanza' : 'Conviene suplementar',
    text: sup === 0
      ? `A **${latR}° de latitud** con tu exposición solar la piel sintetiza suficiente vitamina D, así que **no necesitás suplementar**. Igual cuidá no excederte con el sol.`
      : `A **${latR}° de latitud** el UVB no alcanza para cubrir el requerimiento${est === 'invierno' ? ' en invierno' : ''}: se sugieren **${sup} UI/día** de vitamina D3. Cuanto más lejos del ecuador, más meses con síntesis insuficiente.`,
    tone: sup === 0 ? 'good' as const : 'warn' as const,
    icon: sup === 0 ? '☀️' : '🌥️',
  };
  const _chart = {
    type: 'scale' as const,
    marker: latR,
    markerLabel: 'Tu latitud: ' + latR + '°',
    min: 0,
    unit: '°',
    segments: [
      { nombre: 'Síntesis todo el año', max: 30, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Insuficiente en invierno', max: 40, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Insuficiente gran parte del año', max: Math.max(60, Math.ceil(latR) + 5), color: '#fed7aa', colorDark: '#9a3412' },
    ],
    ariaLabel: 'Escala de latitud y síntesis de vitamina D: óptima bajo 30°, limitada en invierno entre 30 y 40°, e insuficiente sobre 40°',
  };
  return {
    suplementoUI: sup,
    sintesisEsperada: sintesis,
    resumen: sup === 0 ? 'No necesitás suplementar; exposición solar cubre requerimiento.' : `Suplementá ${sup} UI/día de vitamina D3.`,
    _insight,
    _chart,
  };
}
