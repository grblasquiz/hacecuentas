/** ¿Cuántas flashcards crear por día? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  nuevasPorDia: number;
  repasosPorDia: number;
  tiempoRequerido: number;
  viable: string;
  _insight?: any;
  _chart?: any;
}

export function flashcardsPorDia(i: Inputs): Outputs {
  const min = Number(i.minutosDia) || 30;
  const total = Number(i.totalCards) || 3000;
  const meses = Number(i.plazoMeses) || 12;
  if (min <= 0 || total <= 0 || meses <= 0) throw new Error('Datos inválidos');

  const dias = meses * 30.42;
  const nuevasDia = Math.ceil(total / dias);
  const repasosDia = nuevasDia * 10;
  const tiempoReq = Math.round((repasosDia * 10) / 60);

  let viable = '';
  let tono: 'good' | 'warn' | 'neutral';
  let titulo: string;
  if (tiempoReq > min) { viable = `❌ No viable: necesitás ${tiempoReq} min, tenés ${min}. Extendé plazo o reducí tarjetas.`; tono = 'warn'; titulo = 'No entra en tu tiempo'; }
  else if (tiempoReq > min * 0.8) { viable = '⚠️ Ajustado: casi al límite. Margen de error pequeño.'; tono = 'warn'; titulo = 'Ajustado al límite'; }
  else { viable = '✅ Viable con margen.'; tono = 'good'; titulo = 'Plan viable'; }

  const insight = {
    title: titulo,
    text: `Para cubrir **${total.toLocaleString('es-AR')}** tarjetas en **${meses}** meses tenés que crear **${nuevasDia}** nuevas/día, lo que genera **${repasosDia}** repasos diarios y unos **${tiempoReq} min** de estudio. ` +
      (tiempoReq > min
        ? `Eso supera tus **${min} min** disponibles: alargá el plazo o reducí la meta.`
        : tiempoReq > min * 0.8
        ? `Estás muy cerca de tus **${min} min** disponibles; cualquier día perdido te atrasa.`
        : `Te entra cómodo en tus **${min} min** disponibles, con margen para imprevistos.`),
    tone: tono,
    icon: '🗂️',
  };

  return {
    nuevasPorDia: nuevasDia,
    repasosPorDia: repasosDia,
    tiempoRequerido: tiempoReq,
    viable,
    _insight: insight,
    _chart: {
      type: 'scale',
      marker: tiempoReq,
      markerLabel: `${tiempoReq} min/día`,
      min: 0,
      segments: [
        { nombre: 'Con margen', max: Math.round(min * 0.8), color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Ajustado', max: min, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'No entra', max: Math.max(min + 1, tiempoReq + 1), color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: `Tiempo diario necesario: ${tiempoReq} minutos sobre ${min} disponibles. Plan ${tiempoReq > min ? 'no viable' : tiempoReq > min * 0.8 ? 'ajustado' : 'viable con margen'}.`,
    },
  };

}
