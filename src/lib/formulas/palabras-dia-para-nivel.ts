/** Palabras por Día para Llegar al Nivel */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  palabrasPorDia: number;
  tarjetasRepasosDia: number;
  minutosDia: number;
  viabilidad: string;
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

  return {
    palabrasPorDia: palDia,
    tarjetasRepasosDia: repasosDia,
    minutosDia: minDia,
    viabilidad: viab,
  };

}
