/** Pomodoros óptimos según materia */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  pomodorosDia: number;
  duracionBloque: number;
  duracionDescanso: number;
  pausaLargaCada: string;
  horasEfectivas: number;
  _insight?: any;
}

export function pomodoroOptimoMateria(i: Inputs): Outputs {
  const horas = Number(i.horasDisponibles) || 6;
  const materia = String(i.tipoMateria || 'teorica');
  const dif = String(i.dificultad || 'media');
  if (horas <= 0) throw new Error('Horas inválidas');

  const PLAN: Record<string, { bloque: number; descanso: number }> = {
    matematica:   { bloque: 45, descanso: 10 },
    memorizacion: { bloque: 20, descanso: 5 },
    teorica:      { bloque: 30, descanso: 7 },
    lectura:      { bloque: 40, descanso: 10 },
    programacion: { bloque: 50, descanso: 10 },
  };
  const p = PLAN[materia] || PLAN.teorica;

  const bloqueMin = dif === 'alta' ? p.bloque + 5 : dif === 'baja' ? p.bloque - 5 : p.bloque;
  const descansoMin = dif === 'alta' ? p.descanso + 3 : p.descanso;

  const ciclo = bloqueMin + descansoMin;
  const totalMin = horas * 60;
  const pomos = Math.floor(totalMin / ciclo);

  const horasEfectivas = (pomos * bloqueMin) / 60;
  const horasEfRound = Math.round(horasEfectivas * 10) / 10;

  const MATERIA_LABEL: Record<string, string> = {
    matematica: 'matemática',
    memorizacion: 'memorización',
    teorica: 'teórica',
    lectura: 'lectura',
    programacion: 'programación',
  };
  const materiaTxt = MATERIA_LABEL[materia] || 'teórica';
  const horasEfFmt = horasEfRound.toLocaleString('es-AR', { maximumFractionDigits: 1 });
  // Tope de foco profundo sostenible ~4 h/día (Ericsson, 1993)
  const tono = horasEfRound > 4.5 ? 'warn' : 'good';
  const text = tono === 'warn'
    ? `Te entran **${pomos} pomodoros** de **${bloqueMin} min** para ${materiaTxt}, pero eso son **${horasEfFmt} h** de foco real: por encima de las ~4 h que el cerebro sostiene bien por día. Repartí la carga o bajá la exigencia.`
    : `Para ${materiaTxt} te entran **${pomos} pomodoros** de **${bloqueMin} min** con descansos de **${descansoMin} min**: **${horasEfFmt} h** de foco real, un ritmo sostenible.`;
  const _insight = {
    title: 'Tu plan de pomodoros',
    text,
    tone: tono,
    icon: '🍅',
  };

  return {
    pomodorosDia: pomos,
    duracionBloque: bloqueMin,
    duracionDescanso: descansoMin,
    pausaLargaCada: '4 pomodoros (pausa 20-30 min)',
    horasEfectivas: horasEfRound,
    _insight,
  };

}
