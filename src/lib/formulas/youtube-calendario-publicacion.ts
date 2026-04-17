/** Calendario YouTube */
export interface Inputs { horasDisponibles: number; horasPorVideo: number; }
export interface Outputs { videosPorSemana: string; videosPor3Meses: number; videosPor12Meses: number; recomendacion: string; }

export function youtubeCalendarioPublicacion(i: Inputs): Outputs {
  const horas = Number(i.horasDisponibles);
  const hv = Number(i.horasPorVideo);
  if (horas <= 0 || hv <= 0) throw new Error('Ingresá valores válidos');
  const vpw = horas / hv;
  const v3m = Math.round(vpw * 13);
  const v12m = Math.round(vpw * 52);
  let rec = '';
  if (vpw < 0.25) rec = 'Ritmo muy bajo — el algoritmo te va a olvidar. Considerá Shorts en su lugar.';
  else if (vpw < 1) rec = `Ritmo de ${Math.round(vpw*4)} videos/mes. Recomendable sumar Shorts para compensar.`;
  else if (vpw <= 2) rec = 'Sweet spot — 1-2 videos/semana es el óptimo global.';
  else if (vpw <= 4) rec = 'Alto volumen — cuidá calidad, el algoritmo prefiere consistencia a cantidad.';
  else rec = 'Muy alto — probable caída de calidad. Bajá a 3/semana y subí producción.';
  return {
    videosPorSemana: `${vpw.toFixed(2)} videos/semana (~${Math.round(vpw*4)}/mes)`,
    videosPor3Meses: v3m,
    videosPor12Meses: v12m,
    recomendacion: rec,
  };
}
