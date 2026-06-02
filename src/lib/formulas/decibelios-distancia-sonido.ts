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
  _insight?: any;
  _chart?: any;
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

  const db1 = Number(dbObjetivo.toFixed(1));
  const red1 = Number(reduccion.toFixed(1));

  // Tono dinámico según riesgo auditivo (criterio NIOSH, 85 dB = límite seguro 8h)
  const tone = db1 >= 100 ? 'warn' : (db1 >= 85 ? 'warn' : 'good');
  const insightText = db1 < 85
    ? `A **${dObj} m** el nivel baja a **${db1} dB** (−${red1} dB respecto de ${dbF} dB). Por debajo de 85 dB no hay límite de exposición: ${comparacion.toLowerCase()}.`
    : db1 < 100
      ? `A **${dObj} m** todavía hay **${db1} dB**: superás el umbral seguro de 85 dB. ${tiempoExposicion}`
      : `Cuidado: a **${dObj} m** seguís expuesto a **${db1} dB** (${comparacion.toLowerCase()}). ${tiempoExposicion}`;

  // Gauge: dB objetivo sobre zonas de riesgo auditivo
  const gaugeMax = Math.max(140, Math.ceil(db1 + 10));
  return {
    dbObjetivo: db1,
    reduccion: red1,
    tiempoExposicion,
    comparacion,
    _insight: {
      title: 'Riesgo auditivo a esa distancia',
      text: insightText,
      tone,
      icon: '🔊',
    },
    _chart: {
      type: 'scale',
      marker: db1,
      markerLabel: `${db1} dB`,
      min: 0,
      segments: [
        { nombre: 'Seguro', max: 70, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Molesto', max: 85, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Riesgo con exposición', max: 100, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Dañino', max: 115, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Peligro inmediato', max: gaugeMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Nivel de ${db1} decibelios a ${dObj} metros sobre escala de riesgo auditivo`,
    },
  };
}
