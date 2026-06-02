/** Palabras por Día para Llegar al Nivel */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  palabrasPorDia: number;
  tarjetasRepasosDia: number;
  minutosDia: number;
  viabilidad: string;
  _insight?: any;
  _chart?: any;
}

export function palabrasDiaParaNivel(i: Inputs): Outputs {
  const act = Number(i.vocabActual) || 0;
  const nivel = String(i.nivelMeta || 'b2');
  const meses = Number(i.plazoMeses) || 12;
  if (meses <= 0) throw new Error('Plazo inválido');

  const META: Record<string, number> = { a2: 1200, b1: 2500, b2: 5000, c1: 8000, c2: 15000 };
  const meta = META[nivel] || 5000;
  const faltan = Math.max(0, meta - act);

  const dias = meses * 30.42;
  const palDia = Math.ceil(faltan / dias);
  const repasosDia = palDia * 10;
  const minDia = Math.round((repasosDia * 12) / 60);

  let viab = '';
  if (faltan === 0) viab = 'Ya alcanzaste la meta.';
  else if (palDia > 30) viab = '❌ Insostenible. Extendé plazo o bajá meta.';
  else if (palDia > 20) viab = '⚠️ Agresivo. Viable con disciplina total.';
  else if (palDia > 10) viab = '✅ Normal — sostenible.';
  else viab = '✅ Muy cómodo. Podrías acelerar.';

  const nivelTxt = nivel.toUpperCase();
  const tone = faltan === 0 ? 'good' : palDia > 30 ? 'warn' : palDia > 20 ? 'warn' : 'good';
  const _insight = {
    title: faltan === 0 ? 'Meta ya alcanzada' : 'Tu ritmo diario',
    text: faltan === 0
      ? `Con **${act} palabras** ya superás el nivel **${nivelTxt}**. Podés apuntar a un nivel más alto.`
      : `Para sumar **${faltan} palabras** y llegar a **${nivelTxt}** en **${meses} meses** necesitás aprender **${palDia} palabras/día** (~**${minDia} min** de repaso diario).`,
    tone: tone as 'good' | 'warn' | 'neutral',
    icon: '📚',
  };

  let _chart: any = undefined;
  if (faltan > 0) {
    _chart = {
      type: 'scale',
      marker: palDia,
      markerLabel: palDia + ' pal/día',
      min: 0,
      segments: [
        { nombre: 'Cómodo', max: 10, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Sostenible', max: 20, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Agresivo', max: 30, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Insostenible', max: Math.max(40, palDia + 5), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Ritmo de ${palDia} palabras por día sobre una escala de viabilidad: hasta 10 cómodo, 10-20 sostenible, 20-30 agresivo, más de 30 insostenible.`,
    };
  }

  return {
    palabrasPorDia: palDia,
    tarjetasRepasosDia: repasosDia,
    minutosDia: minDia,
    viabilidad: viab,
    _insight: _insight,
    ...(_chart ? { _chart } : {}),
  };

}
