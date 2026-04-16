/** Calidad de sueño - PSQI simplificado */
export interface Inputs {
  latencia: number;
  duracion: number;
  horasCama: number;
  perturbaciones: string;
  calidadSubjetiva: string;
  disfuncionDiurna: string;
}
export interface Outputs {
  puntajeGlobal: number;
  resultado: string;
  eficiencia: number;
  recomendacion: string;
  mensaje: string;
}

export function calidadSuenoPittsburgh(i: Inputs): Outputs {
  const latencia = Number(i.latencia) || 0;
  const duracion = Number(i.duracion);
  const horasCama = Number(i.horasCama);
  const perturbaciones = Number(i.perturbaciones);
  const calidadSubjetiva = Number(i.calidadSubjetiva);
  const disfuncionDiurna = Number(i.disfuncionDiurna);
  if (!duracion) throw new Error('Ingresá las horas de sueño');
  if (!horasCama) throw new Error('Ingresá las horas en cama');

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
    resultado = 'Buena calidad de sueño';
    recomendacion = 'Tu sueño está dentro de parámetros normales. Mantené tus hábitos actuales.';
  } else if (puntajeGlobal <= 10) {
    resultado = 'Calidad de sueño pobre';
    recomendacion = 'Necesitás mejorar tu higiene del sueño: horario fijo, no pantallas antes de dormir, habitación oscura y fresca.';
  } else {
    resultado = 'Mala calidad de sueño';
    recomendacion = 'Se recomienda consultar a un especialista en sueño. Tu calidad es significativamente peor que lo normal.';
  }

  return {
    puntajeGlobal,
    resultado,
    eficiencia: Math.min(100, eficiencia),
    recomendacion,
    mensaje: `PSQI: ${puntajeGlobal}/21 — ${resultado}. Eficiencia: ${eficiencia}%.`
  };
}