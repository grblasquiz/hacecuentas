export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function inglesNivelesCambridgeDuolingoTiempoConversion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n=String(i.nivelActual||'b1'); const h=Number(i.horasSemana)||5;
  const niveles=['cero','a1','a2','b1','b2','c1','c2'];
  const horasAcum={'cero':0,'a1':100,'a2':200,'b1':400,'b2':700,'c1':1000,'c2':1500};
  const idx=niveles.indexOf(n);
  const siguiente=niveles[idx+1];
  if(!siguiente) return {
    semanasASiguiente: __lang === 'en' ? 'Already at C2' : 'Ya en C2',
    totalHasta: '—',
    observacion: __lang === 'en' ? 'Maximum level' : 'Nivel máximo',
    _insight: {
      title: __lang === 'en' ? 'Top of the scale' : 'Tope de la escala',
      text: __lang === 'en'
        ? `**C2** is the highest CEFR level: focus now on keeping fluency with real use rather than chasing more levels.`
        : `**C2** es el nivel más alto del MCER: a esta altura conviene mantener la fluidez con uso real, no perseguir más niveles.`,
      tone: 'good',
      icon: '🏆'
    },
  };
  const horasNec=horasAcum[siguiente]-horasAcum[n];
  const semanas=Math.ceil(horasNec/h);
  const hastaC1=horasAcum['c1']-horasAcum[n];
  const meses = Math.round(semanas / 4.345);
  const _insight = {
    title: __lang === 'en' ? `From ${n.toUpperCase()} to ${siguiente.toUpperCase()}` : `De ${n.toUpperCase()} a ${siguiente.toUpperCase()}`,
    text: __lang === 'en'
      ? `Studying **${h} h/week** you reach **${siguiente.toUpperCase()}** in about **${semanas} weeks** (~${meses} months), the **${horasNec} hours** that level needs. Adding more weekly hours shortens it proportionally.`
      : `Estudiando **${h} h/semana** llegás a **${siguiente.toUpperCase()}** en unas **${semanas} semanas** (~${meses} meses), las **${horasNec} horas** que pide ese salto. Sumando más horas por semana lo acortás en proporción.`,
    tone: 'neutral',
    icon: '🗣️'
  };
  return {
    semanasASiguiente: __lang === 'en' ? `${semanas} weeks to ${siguiente.toUpperCase()}` : `${semanas} semanas a ${siguiente.toUpperCase()}`,
    totalHasta: __lang === 'en' ? `${hastaC1} hours to C1` : `${hastaC1} horas a C1`,
    observacion: __lang === 'en' ? `From ${n.toUpperCase()} to next level: ${horasNec} hours.` : `Desde ${n.toUpperCase()} al siguiente: ${horasNec} horas.`,
    _insight,
  };
}
