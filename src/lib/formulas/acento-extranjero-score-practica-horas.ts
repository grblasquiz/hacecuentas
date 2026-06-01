export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function acentoExtranjeroScorePracticaHoras(i: Inputs): Outputs {
  const a=Number(i.nivelActual)||5; const h=Number(i.horasSem)||0;
  const meses=h===0?'—':Math.max(3, (10-a)*2/(h/2));

  let _insight;
  if (h === 0) {
    _insight = {
      title: 'Falta práctica',
      text: `Con **0 horas** por semana no hay avance posible: la reducción de acento depende de la repetición. Aunque sean **15 minutos diarios**, empezá a sumar horas para mover la aguja.`,
      tone: 'warn',
      icon: '🗣️',
    };
  } else {
    const m = Math.round(Number(meses));
    const tone: 'good' | 'neutral' = m <= 6 ? 'good' : 'neutral';
    const cierre = m <= 6
      ? 'Es un horizonte muy alcanzable: sostené el ritmo.'
      : 'Subir las horas semanales te acorta bastante ese plazo.';
    _insight = {
      title: 'Tu plazo estimado',
      text: `Partiendo de **${a}/10** y practicando **${h} h/semana**, vas a notar una reducción perceptible en unos **${m} meses**. ${cierre}`,
      tone,
      icon: '🗣️',
    };
  }

  return { meses:typeof meses==='string'?meses:`${Number(meses).toFixed(0)} meses`, resumen:`Acento ${a}/10 con ${h}h/sem: ${typeof meses==='string'?meses:`~${Number(meses).toFixed(0)} meses`} para notar reducción.`, _insight };
}
