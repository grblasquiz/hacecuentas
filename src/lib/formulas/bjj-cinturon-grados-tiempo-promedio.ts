/** Años promedio para llegar a cada cinturón de BJJ según frecuencia de entrenos. */
export interface Inputs { cinturonObjetivo: 'azul' | 'violeta' | 'marron' | 'negro'; entrenosPorSemana: number; }
export interface Outputs { anosTotales: number; anosTotalesTexto: string; horasTotales: number; explicacion: string; _insight?: any; _chart?: any; }
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

  // Umbrales de ritmo según el objetivo: comparan el tiempo del usuario contra
  // un entrenamiento rápido (5x/sem), típico (3x/sem) y pausado (1.5x/sem).
  const horasPorAnoRapido = 5 * 1.5 * 50;    // 375 h/año
  const horasPorAnoTipico = 3 * 1.5 * 50;    // 225 h/año
  const horasPorAnoPausado = 1.5 * 1.5 * 50; // 112.5 h/año
  const anosRapido = horasObjetivo / horasPorAnoRapido;
  const anosTipicoMax = (horasObjetivo / horasPorAnoTipico) * 1.1;
  const anosPausado = horasObjetivo / horasPorAnoPausado;
  const maxSeg = Math.max(anosPausado, anos) * 1.1;
  const anos1 = Number(anos.toFixed(1));

  let tone: 'good' | 'warn' | 'neutral';
  let ritmo: string;
  if (anos <= anosRapido * 1.05) { tone = 'good'; ritmo = 'un ritmo acelerado'; }
  else if (anos <= anosTipicoMax) { tone = 'neutral'; ritmo = 'el ritmo promedio'; }
  else { tone = 'warn'; ritmo = 'un camino largo y pausado'; }

  return {
    anosTotales: anos1,
    anosTotalesTexto: `${anosEnt} años ${meses} meses`,
    horasTotales: horasObjetivo,
    explicacion: `Entrenando ${e} veces por semana, te tomará aproximadamente ${anosEnt} años y ${meses} meses llegar al cinturón ${i.cinturonObjetivo} (${horasObjetivo} horas acumuladas en el tatami). Los promedios IBJJF asumen progreso constante sin lesiones largas.`,
    _insight: {
      title: 'Tu ritmo hacia el cinturón',
      text: `A **${e} entrenos/semana** llegás al cinturón **${i.cinturonObjetivo}** en unos **${anosEnt} años y ${meses} meses** (${horasObjetivo} h de tatami): es ${ritmo}. Sumar un entreno semanal recorta meses del total.`,
      tone,
      icon: '🥋',
    },
    _chart: {
      type: 'scale',
      marker: anos1,
      markerLabel: `${anos1} años`,
      min: 0,
      segments: [
        { nombre: 'Acelerado', max: Number((anosRapido * 1.05).toFixed(1)), color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Promedio', max: Number(anosTipicoMax.toFixed(1)), color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Pausado', max: Number(maxSeg.toFixed(1)), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Tiempo estimado de ${anos1} años para el cinturón ${i.cinturonObjetivo}, ubicado en la zona de ritmo correspondiente.`,
    },
  };
}
