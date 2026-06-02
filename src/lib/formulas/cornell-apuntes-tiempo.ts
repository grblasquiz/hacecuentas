/** Tiempo Apuntes Método Cornell */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  duranteClase: number;
  revision24h: number;
  repasoSemanal: number;
  totalMin: number;
  _insight?: any;
  _chart?: any;
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

  const extra = revision + semanal;
  const _insight = {
    title: 'Tu inversión real con Cornell',
    text: `Sobre los **${durante} min** de clase, el método Cornell suma **${extra} min** de procesamiento (**${revision} min** de revisión a las 24 h + **${semanal} min** de repaso semanal): **${total} min** en total para fijar lo visto.`,
    tone: 'neutral',
    icon: '📝',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Durante la clase', value: durante },
      { label: 'Revisión 24 h', value: revision },
      { label: 'Repaso semanal', value: semanal },
    ],
    prefix: '',
    centerValue: total + ' min',
    centerLabel: 'Total',
    ariaLabel: `De ${total} minutos totales, ${durante} son la clase, ${revision} la revisión a las 24 horas y ${semanal} el repaso semanal.`,
  };

  return {
    duranteClase: durante,
    revision24h: revision,
    repasoSemanal: semanal,
    totalMin: total,
    _insight,
    _chart,
  };

}
