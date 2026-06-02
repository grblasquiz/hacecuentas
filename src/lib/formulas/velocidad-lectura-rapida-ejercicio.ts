/** Calculá tu Velocidad de Lectura Real */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpm: number;
  wpmEfectivo: number;
  categoria: string;
  objetivo: string;
  _insight?: any;
  _chart?: any;
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

  const wpmR = Math.round(wpm);
  const wpmEfR = Math.round(wpmEf);
  const tone: 'good' | 'warn' | 'neutral' = wpmEf < 150 ? 'warn' : wpmEf < 300 ? 'neutral' : 'good';

  return {
    wpm: wpmR,
    wpmEfectivo: wpmEfR,
    categoria: cat,
    objetivo: obj,
    _insight: {
      title: 'Tu velocidad de lectura efectiva',
      text: `Leíste a **${wpmR} WPM** brutos, pero con **${comp}%** de comprensión tu velocidad efectiva es **${wpmEfR} WPM** (${cat.toLowerCase()}). La comprensión es la que cuenta: leer rápido sin retener no suma.`,
      tone,
      icon: '⚡',
    },
    _chart: {
      type: 'scale',
      marker: wpmEfR,
      markerLabel: `${wpmEfR} WPM ef.`,
      min: 0,
      segments: [
        { nombre: 'Lento', max: 150, color: '#fca5a5', colorDark: '#ef4444' },
        { nombre: 'Promedio bajo', max: 220, color: '#fdba74', colorDark: '#f97316' },
        { nombre: 'Normal', max: 300, color: '#fde047', colorDark: '#eab308' },
        { nombre: 'Rápido', max: 400, color: '#86efac', colorDark: '#22c55e' },
        { nombre: 'Muy rápido', max: Math.max(550, Math.ceil(wpmEfR + 50)), color: '#7dd3fc', colorDark: '#0ea5e9' },
      ],
      ariaLabel: `Velocidad de lectura efectiva de ${wpmEfR} palabras por minuto: ${cat}`,
    },
  };

}
