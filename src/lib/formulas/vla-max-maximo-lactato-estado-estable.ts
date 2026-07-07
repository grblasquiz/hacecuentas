export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function vlaMaxMaximoLactatoEstadoEstable(i: Inputs): Outputs {
  const fc = Number(i.fcUmbral) || 0;
  const pace = fc < 140 ? '5:30-6:00' : fc < 155 ? '5:00-5:30' : fc < 170 ? '4:30-5:00' : '4:00-4:30';
  const insight = {
    title: 'Tu ritmo de umbral',
    text: `Con una **FC umbral de ${fc} ppm**, tu velocidad sostenible en estado estable de lactato (MLSS) ronda los **${pace} min/km**. Es el ritmo más rápido que podés mantener sin que el lactato se acumule sin control: ideal como referencia para tus tiradas de umbral o tempo.`,
    tone: 'neutral' as const,
    icon: '🏃',
  };
  return { velocidad: pace + ' min/km', resumen: `Pace estimado MLSS: ${pace} min/km (FC umbral ${fc}).`, _insight: insight };
}
