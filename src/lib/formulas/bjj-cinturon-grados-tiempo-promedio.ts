/** Años promedio para llegar a cada cinturón de BJJ según frecuencia de entrenos. */
export interface Inputs { cinturonObjetivo: 'azul' | 'violeta' | 'marron' | 'negro'; entrenosPorSemana: number; }
export interface Outputs { anosTotales: number; anosTotalesTexto: string; horasTotales: number; explicacion: string; }
export function bjjCinturonGradosTiempoPromedio(i: Inputs): Outputs {
  const e = Number(i.entrenosPorSemana);
  if (!e || e <= 0 || e > 14) throw new Error('Entrenos por semana debe ser entre 1 y 14');
  // Horas promedio acumuladas para alcanzar cada cinturón (IBJJF estándar global)
  const horasNecesarias: Record<string, number> = { azul: 400, violeta: 1000, marron: 1800, negro: 2800 };
  const horasObjetivo = horasNecesarias[i.cinturonObjetivo];
  if (!horasObjetivo) throw new Error('Cinturón inválido');
  // 1 entreno = 1.5h promedio
  const horasPorAno = e * 1.5 * 50; // 50 semanas activas
  const anos = horasObjetivo / horasPorAno;
  const anosEnt = Math.floor(anos);
  const meses = Math.round((anos - anosEnt) * 12);
  return {
    anosTotales: Number(anos.toFixed(1)),
    anosTotalesTexto: `${anosEnt} años ${meses} meses`,
    horasTotales: horasObjetivo,
    explicacion: `Entrenando ${e} veces por semana, te tomará aproximadamente ${anosEnt} años y ${meses} meses llegar al cinturón ${i.cinturonObjetivo} (${horasObjetivo} horas acumuladas en el tatami). Los promedios IBJJF asumen progreso constante sin lesiones largas.`,
  };
}
