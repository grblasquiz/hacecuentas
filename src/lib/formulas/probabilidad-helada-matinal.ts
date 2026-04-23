/** Probabilidad de helada matinal según temperatura mínima pronosticada,
 *  humedad relativa al anochecer, condición del cielo y viento.
 *  Cielo despejado + viento calmo favorece inversión térmica y enfriamiento radiativo.
 */
export interface Inputs {
  tempMin: number; // °C
  humedad: number; // %
  cielo: 'despejado' | 'parcial' | 'cubierto';
  viento: 'calmo' | 'leve' | 'moderado' | 'fuerte';
}
export interface Outputs {
  probabilidad: string;
  nivelRiesgo: string;
  tipoHelada: string;
  recomendacion: string;
}

export function probabilidadHeladaMatinal(i: Inputs): Outputs {
  const T = Number(i.tempMin);
  const H = Number(i.humedad);
  if (isNaN(T) || T < -40 || T > 40) throw new Error('Temperatura mínima fuera de rango (-40 a 40 °C)');
  if (isNaN(H) || H < 0 || H > 100) throw new Error('Humedad debe estar entre 0 y 100 %');
  const cielo = String(i.cielo || 'despejado');
  const viento = String(i.viento || 'calmo');

  // Base por temperatura mínima
  let prob = 0;
  if (T <= -2) prob = 95;
  else if (T <= 0) prob = 85;
  else if (T <= 2) prob = 65;
  else if (T <= 4) prob = 35;
  else if (T <= 6) prob = 15;
  else prob = 3;

  // Cielo despejado aumenta enfriamiento radiativo
  const ajusteCielo: Record<string, number> = {
    'despejado': 12,
    'parcial': 0,
    'cubierto': -22,
  };
  prob += ajusteCielo[cielo] ?? 0;

  // Viento: mezcla aire y reduce inversión térmica
  const ajusteViento: Record<string, number> = {
    'calmo': 8,
    'leve': 0,
    'moderado': -10,
    'fuerte': -18,
  };
  prob += ajusteViento[viento] ?? 0;

  // Humedad alta → rocío/escarcha; humedad baja con T≤3 → helada negra (muy dañina)
  if (H >= 85) prob += 4;
  else if (H < 40 && T <= 3) prob += 2;

  if (prob < 0) prob = 0;
  if (prob > 98) prob = 98;

  let nivelRiesgo = '';
  let tipoHelada = '';
  let recomendacion = '';
  if (prob < 10) {
    nivelRiesgo = 'Muy bajo';
    tipoHelada = 'Sin helada esperada';
    recomendacion = 'No se requieren medidas de protección.';
  } else if (prob < 30) {
    nivelRiesgo = 'Bajo';
    tipoHelada = 'Helada poco probable, posible en zonas bajas';
    recomendacion = 'Cubrí plantas sensibles en fondo de valle o huerta baja.';
  } else if (prob < 60) {
    nivelRiesgo = 'Moderado';
    tipoHelada = H >= 75 ? 'Helada blanca (con escarcha)' : 'Posible helada parcial';
    recomendacion = 'Protegé cultivos sensibles con media sombra o riego por aspersión al amanecer.';
  } else if (prob < 85) {
    nivelRiesgo = 'Alto';
    tipoHelada = H >= 70 ? 'Helada blanca (con escarcha visible)' : 'Helada negra probable';
    recomendacion = 'Cubrí plantas, aplicá riego preventivo, drená agua de cañerías expuestas.';
  } else {
    nivelRiesgo = 'Muy alto';
    tipoHelada = H < 55 ? 'Helada negra intensa (gran daño agrícola)' : 'Helada blanca intensa';
    recomendacion = 'Tomá medidas máximas: cubrir cultivos, calentadores, proteger cañerías, evitar carreteras con hielo.';
  }

  return {
    probabilidad: `${Math.round(prob)} %`,
    nivelRiesgo,
    tipoHelada,
    recomendacion,
  };
}
