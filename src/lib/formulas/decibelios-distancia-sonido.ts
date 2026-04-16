/** Calculadora de Decibelios a Distancia */
export interface Inputs {
  dbFuente: number;
  distanciaRef: number;
  distanciaObjetivo: number;
}
export interface Outputs {
  dbObjetivo: number;
  reduccion: number;
  tiempoExposicion: string;
  comparacion: string;
}

export function decibeliosDistanciaSonido(i: Inputs): Outputs {
  const dbF = Number(i.dbFuente);
  const dRef = Number(i.distanciaRef);
  const dObj = Number(i.distanciaObjetivo);

  if (isNaN(dbF) || dbF < 0) throw new Error('Ingresá los dB de la fuente');
  if (!dRef || dRef <= 0) throw new Error('Ingresá la distancia de referencia');
  if (!dObj || dObj <= 0) throw new Error('Ingresá la distancia objetivo');

  // Inverse square law: dB2 = dB1 - 20 * log10(d2/d1)
  const reduccion = 20 * Math.log10(dObj / dRef);
  const dbObjetivo = dbF - reduccion;

  // Safe exposure time (NIOSH criteria, 85dB base for 8 hours)
  let tiempoExposicion: string;
  if (dbObjetivo < 85) {
    tiempoExposicion = 'Seguro — sin límite de exposición.';
  } else {
    const hours = 8 / Math.pow(2, (dbObjetivo - 85) / 3);
    if (hours >= 1) tiempoExposicion = `Máximo ${hours.toFixed(1)} horas sin protección.`;
    else if (hours * 60 >= 1) tiempoExposicion = `Máximo ${(hours * 60).toFixed(0)} minutos sin protección.`;
    else tiempoExposicion = `Máximo ${(hours * 3600).toFixed(0)} segundos — peligroso, usá protección.`;
  }

  // Comparison
  let comparacion: string;
  const db = dbObjetivo;
  if (db < 30) comparacion = 'Silencio casi total (habitación insonorizada)';
  else if (db < 50) comparacion = 'Ambiente tranquilo (biblioteca)';
  else if (db < 65) comparacion = 'Conversación normal';
  else if (db < 80) comparacion = 'Tránsito urbano, restaurant ruidoso';
  else if (db < 90) comparacion = 'Tránsito pesado, aspiradora';
  else if (db < 100) comparacion = 'Moto, herramientas eléctricas';
  else if (db < 115) comparacion = 'Concierto de rock, discoteca';
  else if (db < 130) comparacion = 'Sirena de ambulancia, umbral de dolor';
  else comparacion = 'Despegue de avión — daño auditivo inmediato';

  return {
    dbObjetivo: Number(dbObjetivo.toFixed(1)),
    reduccion: Number(reduccion.toFixed(1)),
    tiempoExposicion,
    comparacion,
  };
}
