/** Calculá tu Velocidad de Lectura Real */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpm: number;
  wpmEfectivo: number;
  categoria: string;
  objetivo: string;
}

export function velocidadLecturaRapidaEjercicio(i: Inputs): Outputs {
  const pal = Number(i.palabrasLeidas) || 0;
  const min = Number(i.minutos) || 1;
  const comp = Number(i.comprensionPct) || 80;
  if (pal <= 0 || min <= 0) throw new Error('Datos inválidos');

  const wpm = pal / min;
  const wpmEf = wpm * (comp / 100);

  let cat = '';
  if (wpmEf < 150) cat = 'Lento';
  else if (wpmEf < 220) cat = 'Promedio bajo';
  else if (wpmEf < 300) cat = 'Normal';
  else if (wpmEf < 400) cat = 'Rápido';
  else cat = 'Muy rápido';

  let obj = '';
  if (wpmEf < 200) obj = 'Objetivo próximo: 220 WPM efectivo con 80% comprensión';
  else if (wpmEf < 280) obj = 'Objetivo próximo: 300 WPM efectivo';
  else if (wpmEf < 400) obj = 'Objetivo próximo: 400 WPM efectivo (profesional)';
  else obj = 'Mantené consistencia y comprensión sobre 80%';

  return {
    wpm: Math.round(wpm),
    wpmEfectivo: Math.round(wpmEf),
    categoria: cat,
    objetivo: obj,
  };

}
