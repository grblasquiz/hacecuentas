/** Probabilidad de lluvia en 24 h usando presión, humedad y tendencia barométrica.
 *  Heurística meteorológica clásica (no es un modelo numérico, sí una estimación de bolsillo).
 */
export interface Inputs {
  presion: number; // hPa
  humedad: number; // %
  tendencia: 'bajando-rapido' | 'bajando' | 'estable' | 'subiendo' | 'subiendo-rapido';
}
export interface Outputs {
  probabilidad: string;
  nivelRiesgo: string;
  pronostico: string;
  recomendacion: string;
}

export function probabilidadLluvia24h(i: Inputs): Outputs {
  const P = Number(i.presion);
  const H = Number(i.humedad);
  if (isNaN(P) || P < 850 || P > 1080) throw new Error('Presión fuera de rango (850–1080 hPa)');
  if (isNaN(H) || H < 0 || H > 100) throw new Error('Humedad debe estar entre 0 y 100 %');
  const t = String(i.tendencia || 'estable');

  // Base por presión
  let prob = 0;
  if (P < 995) prob = 65;
  else if (P < 1005) prob = 50;
  else if (P < 1013) prob = 35;
  else if (P < 1020) prob = 20;
  else prob = 10;

  // Ajuste por tendencia
  const ajusteTendencia: Record<string, number> = {
    'bajando-rapido': 25,
    'bajando': 12,
    'estable': 0,
    'subiendo': -10,
    'subiendo-rapido': -18,
  };
  prob += ajusteTendencia[t] ?? 0;

  // Ajuste por humedad
  if (H >= 90) prob += 18;
  else if (H >= 80) prob += 10;
  else if (H >= 70) prob += 4;
  else if (H < 40) prob -= 10;
  else if (H < 55) prob -= 5;

  if (prob < 0) prob = 0;
  if (prob > 95) prob = 95;

  let nivelRiesgo = '';
  let pronostico = '';
  let recomendacion = '';
  if (prob < 20) {
    nivelRiesgo = 'Muy bajo';
    pronostico = 'Tiempo estable, cielo despejado o con nubes altas.';
    recomendacion = 'Podés planificar actividades al aire libre con tranquilidad.';
  } else if (prob < 40) {
    nivelRiesgo = 'Bajo';
    pronostico = 'Posible nubosidad, pero lluvia improbable.';
    recomendacion = 'Tené un paraguas a mano si hay nubes de desarrollo vertical por la tarde.';
  } else if (prob < 60) {
    nivelRiesgo = 'Moderado';
    pronostico = 'Probable que llueva en algún momento del día.';
    recomendacion = 'Llevá paraguas o impermeable, y chequeá radar antes de salir.';
  } else if (prob < 80) {
    nivelRiesgo = 'Alto';
    pronostico = 'Es muy probable que llueva, posiblemente con chaparrones.';
    recomendacion = 'Reprogramá actividades al aire libre si podés. Cuidá ropa/calzado.';
  } else {
    nivelRiesgo = 'Muy alto';
    pronostico = 'Lluvia casi segura, posibilidad de tormenta si la presión baja rápido.';
    recomendacion = 'Evitá actividades al aire libre y revisá alertas oficiales del servicio meteorológico.';
  }

  return {
    probabilidad: `${Math.round(prob)} %`,
    nivelRiesgo,
    pronostico,
    recomendacion,
  };
}
