/** Despeje simple v = d/t: calcular velocidad, distancia o tiempo en unidades cotidianas (km, horas y minutos) */
export interface Inputs {
  calcular?: string;
  distancia?: number;
  horas?: number;
  minutos?: number;
  velocidad?: number;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  detalle: string;
  formula: string;
  _insight?: any;
}

function formatoHM(horasDecimales: number): string {
  let hh = Math.floor(horasDecimales);
  let mm = Math.round((horasDecimales - hh) * 60);
  if (mm === 60) {
    hh += 1;
    mm = 0;
  }
  return `${hh} h ${mm} min`;
}

export function velocidadDistanciaTiempoDespeje(i: Inputs): Outputs {
  const calcular = String(i.calcular || 'velocidad');
  const distancia = Number(i.distancia) || 0;
  const horas = Number(i.horas) || 0;
  const minutos = Number(i.minutos) || 0;
  const velocidad = Number(i.velocidad) || 0;

  if (horas < 0 || minutos < 0) throw new Error('El tiempo no puede ser negativo');
  if (minutos >= 60) throw new Error('Los minutos van de 0 a 59; pasá el resto a horas');
  const tiempoHoras = horas + minutos / 60;

  let resultado = 0;
  let detalle = '';
  let formula = '';
  let insightText = '';

  if (calcular === 'velocidad') {
    if (distancia <= 0) throw new Error('Ingresá una distancia mayor a cero');
    if (tiempoHoras <= 0) throw new Error('Ingresá un tiempo mayor a cero (horas y/o minutos)');
    resultado = Number((distancia / tiempoHoras).toFixed(4));
    const ms = Number((resultado / 3.6).toFixed(4));
    detalle = `${resultado} km/h = ${ms} m/s`;
    formula = `v = d ÷ t = ${distancia} km ÷ ${Number(tiempoHoras.toFixed(4))} h = ${resultado} km/h`;
    insightText = `Recorriendo **${distancia} km en ${formatoHM(tiempoHoras)}**, tu velocidad media fue de **${resultado} km/h** (${ms} m/s). Es el promedio de todo el trayecto: incluye semáforos, paradas y tramos lentos.`;
  } else if (calcular === 'distancia') {
    if (velocidad <= 0) throw new Error('Ingresá una velocidad mayor a cero');
    if (tiempoHoras <= 0) throw new Error('Ingresá un tiempo mayor a cero (horas y/o minutos)');
    resultado = Number((velocidad * tiempoHoras).toFixed(4));
    detalle = `${resultado} km en ${formatoHM(tiempoHoras)} a ${velocidad} km/h`;
    formula = `d = v × t = ${velocidad} km/h × ${Number(tiempoHoras.toFixed(4))} h = ${resultado} km`;
    insightText = `A **${velocidad} km/h durante ${formatoHM(tiempoHoras)}** recorrés **${resultado} km**. Si es un viaje real, sumale un margen por paradas y tránsito.`;
  } else if (calcular === 'tiempo') {
    if (distancia <= 0) throw new Error('Ingresá una distancia mayor a cero');
    if (velocidad <= 0) throw new Error('Ingresá una velocidad mayor a cero');
    const t = distancia / velocidad;
    resultado = Number(t.toFixed(4));
    detalle = formatoHM(t);
    formula = `t = d ÷ v = ${distancia} km ÷ ${velocidad} km/h = ${resultado} h = ${detalle}`;
    insightText = `Para cubrir **${distancia} km a ${velocidad} km/h** de promedio necesitás **${detalle}** (${resultado} horas). Para saber a qué hora llegás, sumale ese tiempo a tu hora de salida más las paradas previstas.`;
  } else {
    throw new Error('Elegí qué calcular: velocidad, distancia o tiempo');
  }

  return {
    resultado,
    detalle,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: insightText,
      tone: 'neutral',
      icon: '🚗',
    },
  };
}
