/** Tiempo Apuntes Método Cornell */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  duranteClase: number;
  revision24h: number;
  repasoSemanal: number;
  totalMin: number;
}

export function cornellApuntesTiempo(i: Inputs): Outputs {
  const dur = Number(i.duracionClase) || 90;
  const dens = String(i.densidad || 'media');

  const FACTOR: Record<string, number> = { baja: 0.15, media: 0.2, alta: 0.28 };
  const f = FACTOR[dens] || 0.2;

  const durante = dur;
  const revision = Math.round(dur * f);
  const semanal = Math.round(dur * f / 2);
  const total = durante + revision + semanal;

  return {
    duranteClase: durante,
    revision24h: revision,
    repasoSemanal: semanal,
    totalMin: total,
  };

}
