export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vlaMaxMaximoLactatoEstadoEstable(i: Inputs): Outputs {
  const fc = Number(i.fcUmbral) || 0;
  const pace = fc < 140 ? '5:30-6:00' : fc < 155 ? '5:00-5:30' : fc < 170 ? '4:30-5:00' : '4:00-4:30';
  return { velocidad: pace + ' min/km', resumen: `Pace estimado MLSS: ${pace} min/km (FC umbral ${fc}).` };
}
