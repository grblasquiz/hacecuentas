/** Exposición solar para vitamina D */
export interface Inputs { fototipo: string; latitud: number; estacion: string; }
export interface Outputs { minutosSol: string; frecuencia: string; zonaExpuesta: string; suplementar: string; mensaje: string; }

export function exposicionSolVitaminaD(i: Inputs): Outputs {
  const fototipo = Number(i.fototipo) || 3;
  const latitud = Number(i.latitud) || 34;
  const estacion = String(i.estacion || 'verano');

  // Base minutes by skin type (in summer, mid-latitude, midday)
  const baseMin: Record<number, number> = { 1: 8, 2: 12, 3: 18, 4: 25, 5: 35, 6: 45 };
  let minutos = baseMin[fototipo] || 18;

  // Latitude adjustment
  if (latitud > 45) minutos *= 1.5;
  else if (latitud > 35) minutos *= 1.2;
  else if (latitud < 20) minutos *= 0.8;

  // Season adjustment
  let suplementar: string;
  if (estacion === 'invierno') {
    if (latitud > 35) {
      minutos = 0;
      suplementar = 'Sí — suplementá 800-1000 UI/día. La producción de vitamina D es mínima en invierno a tu latitud.';
    } else {
      minutos *= 2;
      suplementar = 'Opcional pero recomendable (400-800 UI/día).';
    }
  } else if (estacion === 'otono') {
    minutos *= 1.4;
    suplementar = latitud > 40 ? 'Recomendable (400-800 UI/día).' : 'No necesario si te exponés regularmente.';
  } else {
    suplementar = 'No necesario si te exponés al sol regularmente.';
  }

  const minutosRedondeados = Math.round(minutos);
  const minutosSol = minutos === 0
    ? 'Insuficiente radiación UVB en invierno a tu latitud'
    : `${minutosRedondeados}-${minutosRedondeados + 10} minutos`;

  return {
    minutosSol,
    frecuencia: '3-4 veces por semana',
    zonaExpuesta: 'Brazos y piernas descubiertos (mínimo 20% de superficie corporal). Sin protector solar durante la exposición.',
    suplementar,
    mensaje: minutos === 0
      ? `En invierno a ${latitud}° de latitud no hay suficiente UVB. Suplementá 800-1000 UI/día de vitamina D.`
      : `Exponete ${minutosRedondeados}-${minutosRedondeados + 10} min al sol, 3-4 veces/semana. ${suplementar}`
  };
}