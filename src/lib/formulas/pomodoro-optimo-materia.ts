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

  return {
    pomodorosDia: pomos,
    duracionBloque: bloqueMin,
    duracionDescanso: descansoMin,
    pausaLargaCada: '4 pomodoros (pausa 20-30 min)',
    horasEfectivas: Math.round(horasEfectivas * 10) / 10,
  };

}
