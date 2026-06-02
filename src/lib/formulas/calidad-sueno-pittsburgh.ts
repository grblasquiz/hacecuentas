/** Calidad de sueño - PSQI simplificado */
export interface Inputs {
  latencia: number;
  duracion: number;
  horasCama: number;
  perturbaciones: string;
  calidadSubjetiva: string;
  disfuncionDiurna: string;
  __lang?: string;
}
export interface Outputs {
  puntajeGlobal: number;
  resultado: string;
  eficiencia: number;
  recomendacion: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function calidadSuenoPittsburgh(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorDuracion: 'Ingresá las horas de sueño',
      errorCama: 'Ingresá las horas en cama',
      resultadoBuena: 'Buena calidad de sueño',
      recBuena: 'Tu sueño está dentro de parámetros normales. Mantené tus hábitos actuales.',
      resultadoPobre: 'Calidad de sueño pobre',
      recPobre: 'Necesitás mejorar tu higiene del sueño: horario fijo, no pantallas antes de dormir, habitación oscura y fresca.',
      resultadoMala: 'Mala calidad de sueño',
      recMala: 'Se recomienda consultar a un especialista en sueño. Tu calidad es significativamente peor que lo normal.',
      insTitle: 'Tu índice de sueño',
      insGood: (p: number, e: number) => `Tu PSQI es **${p}/21** con una eficiencia del **${e}%**: descansás dentro de los parámetros sanos. Sostené tus horarios.`,
      insPoor: (p: number, e: number) => `Tu PSQI de **${p}/21** y una eficiencia del **${e}%** marcan un sueño deficiente: ajustá horarios y rutina nocturna antes de que se acumule la deuda.`,
      insBad: (p: number, e: number) => `Con **${p}/21** y solo **${e}%** de eficiencia tu sueño es malo: conviene una consulta profesional para descartar un trastorno.`,
      chartMarker: 'Tu PSQI',
      segBuena: 'Buena', segPobre: 'Pobre', segMala: 'Mala',
      chartAria: 'Escala del puntaje PSQI de calidad de sueño',
    },
    en: {
      errorDuracion: 'Enter your sleep hours',
      errorCama: 'Enter your time in bed',
      resultadoBuena: 'Good sleep quality',
      recBuena: 'Your sleep is within normal parameters. Keep up your current habits.',
      resultadoPobre: 'Poor sleep quality',
      recPobre: 'You need to improve your sleep hygiene: fixed schedule, no screens before bed, dark and cool room.',
      resultadoMala: 'Bad sleep quality',
      recMala: 'Consulting a sleep specialist is recommended. Your sleep quality is significantly worse than normal.',
      insTitle: 'Your sleep index',
      insGood: (p: number, e: number) => `Your PSQI is **${p}/21** with **${e}%** efficiency: you rest within healthy parameters. Keep your schedule steady.`,
      insPoor: (p: number, e: number) => `A PSQI of **${p}/21** and **${e}%** efficiency point to poor sleep: fix your schedule and nighttime routine before the debt builds up.`,
      insBad: (p: number, e: number) => `With **${p}/21** and just **${e}%** efficiency your sleep is bad: a professional consult is advisable to rule out a disorder.`,
      chartMarker: 'Your PSQI',
      segBuena: 'Good', segPobre: 'Poor', segMala: 'Bad',
      chartAria: 'PSQI sleep-quality score scale',
    },
  } as const)[__lang];

  const latencia = Number(i.latencia) || 0;
  const duracion = Number(i.duracion);
  const horasCama = Number(i.horasCama);
  const perturbaciones = Number(i.perturbaciones);
  const calidadSubjetiva = Number(i.calidadSubjetiva);
  const disfuncionDiurna = Number(i.disfuncionDiurna);
  if (!duracion) throw new Error(T.errorDuracion);
  if (!horasCama) throw new Error(T.errorCama);

  // Component 1: Subjective quality (0-3)
  const c1 = calidadSubjetiva;

  // Component 2: Latency (0-3)
  let c2: number;
  if (latencia <= 15) c2 = 0;
  else if (latencia <= 30) c2 = 1;
  else if (latencia <= 60) c2 = 2;
  else c2 = 3;

  // Component 3: Duration (0-3)
  let c3: number;
  if (duracion >= 7) c3 = 0;
  else if (duracion >= 6) c3 = 1;
  else if (duracion >= 5) c3 = 2;
  else c3 = 3;

  // Component 4: Efficiency (0-3)
  const eficiencia = Math.round((duracion / horasCama) * 100);
  let c4: number;
  if (eficiencia >= 85) c4 = 0;
  else if (eficiencia >= 75) c4 = 1;
  else if (eficiencia >= 65) c4 = 2;
  else c4 = 3;

  // Component 5: Perturbations (0-3)
  const c5 = perturbaciones;

  // Component 6: Daytime dysfunction (0-3)
  const c6 = disfuncionDiurna;

  const puntajeGlobal = Math.min(21, c1 + c2 + c3 + c4 + c5 + c6);

  let resultado: string;
  let recomendacion: string;
  if (puntajeGlobal <= 5) {
    resultado = T.resultadoBuena;
    recomendacion = T.recBuena;
  } else if (puntajeGlobal <= 10) {
    resultado = T.resultadoPobre;
    recomendacion = T.recPobre;
  } else {
    resultado = T.resultadoMala;
    recomendacion = T.recMala;
  }

  const efClamp = Math.min(100, eficiencia);
  const insText = puntajeGlobal <= 5 ? T.insGood(puntajeGlobal, efClamp)
    : puntajeGlobal <= 10 ? T.insPoor(puntajeGlobal, efClamp)
    : T.insBad(puntajeGlobal, efClamp);
  const insTone = puntajeGlobal <= 5 ? 'good' : puntajeGlobal <= 10 ? 'warn' : 'warn';
  const insIcon = puntajeGlobal <= 5 ? '😴' : '🛌';

  return {
    puntajeGlobal,
    resultado,
    eficiencia: efClamp,
    recomendacion,
    mensaje: `PSQI: ${puntajeGlobal}/21 — ${resultado}. Eficiencia: ${eficiencia}%.`,
    _insight: { title: T.insTitle, text: insText, tone: insTone, icon: insIcon },
    _chart: {
      type: 'scale',
      marker: puntajeGlobal,
      markerLabel: T.chartMarker,
      min: 0,
      segments: [
        { nombre: T.segBuena, max: 5, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: T.segPobre, max: 10, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: T.segMala, max: 21, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: T.chartAria,
    },
  };
}