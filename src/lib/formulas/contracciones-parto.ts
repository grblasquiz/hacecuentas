/** Timer de contracciones de parto */
export interface Inputs {
  frecuenciaMinutos: number;
  duracionSegundos: number;
  tiempoHoras: number;
  semanasEmbarazo: number;
}
export interface Outputs {
  evaluacion: string;
  fase: string;
  recomendacion: string;
  contraccionesPorHora: number;
}

export function contraccionesParto(i: Inputs): Outputs {
  const freq = Number(i.frecuenciaMinutos);
  const dur = Number(i.duracionSegundos);
  const horas = Number(i.tiempoHoras);
  const semanas = Number(i.semanasEmbarazo);

  if (!freq || freq < 1) throw new Error('Ingresá la frecuencia de las contracciones');
  if (!dur || dur < 10) throw new Error('Ingresá la duración de las contracciones');
  if (semanas < 20 || semanas > 42) throw new Error('Ingresá las semanas de embarazo (20-42)');

  const contraccionesPorHora = Math.round(60 / freq);
  const esPretermino = semanas < 37;

  let fase = '';
  let evaluacion = '';
  let recomendacion = '';

  // Evaluar fase del trabajo de parto
  if (freq > 10 && dur < 40) {
    fase = 'Pródromos o Braxton Hicks';
    evaluacion = 'Probablemente NO es parto';
    recomendacion = 'Descansá, tomá agua, cambiá de posición. Si se vuelven más frecuentes e intensas, volvé a medir.';
  } else if (freq >= 5 && freq <= 10 && dur >= 30 && dur <= 60) {
    fase = 'Fase latente del trabajo de parto';
    evaluacion = 'Posible inicio de parto';
    recomendacion = 'Seguí midiendo. Si se mantienen o aumentan durante 1-2 horas, llamá a tu obstetra.';
  } else if (freq >= 3 && freq < 5 && dur >= 45 && dur <= 90) {
    fase = 'Fase activa del trabajo de parto';
    evaluacion = 'Parto activo probable';
    recomendacion = '¡Llamá a tu obstetra y dirigite al hospital!';
  } else if (freq <= 5 && dur >= 60 && horas >= 1) {
    // Regla 5-1-1
    fase = 'Fase activa — cumple regla 5-1-1';
    evaluacion = 'Cumple la regla 5-1-1';
    recomendacion = '¡Es momento de ir al hospital! Llamá a tu obstetra en camino.';
  } else if (freq < 3 && dur >= 60) {
    fase = 'Transición / Fase avanzada';
    evaluacion = 'Posible fase de transición';
    recomendacion = '¡Andá al hospital AHORA si no estás ya internada!';
  } else {
    fase = 'Fase temprana';
    evaluacion = 'Sin patrón de parto activo';
    recomendacion = 'Seguí midiendo cada 30-60 minutos. Descansá y mantené la hidratación.';
  }

  // Alerta de pretérmino
  if (esPretermino && freq <= 10 && dur >= 30) {
    evaluacion = 'Alerta: posible parto prematuro';
    recomendacion = '¡Llamá a tu obstetra o andá a la guardia DE INMEDIATO! No esperes. Contracciones regulares antes de la semana 37 pueden indicar amenaza de parto prematuro.';
    fase = 'Posible amenaza de parto prematuro';
  }

  return { evaluacion, fase, recomendacion, contraccionesPorHora };
}
