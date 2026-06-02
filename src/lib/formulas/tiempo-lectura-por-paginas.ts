/** ¿Cuánto tarda leer X páginas? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoTotalHoras: number;
  tiempoTotalMin: number;
  minPorPagina: number;
  wpmEfectivo: number;
  _insight?: any;
}

export function tiempoLecturaPorPaginas(i: Inputs): Outputs {
  const pag = Number(i.paginas) || 300;
  const tipo = String(i.tipoTexto || 'ficcion');
  const wpm = Number(i.velocidadWpm) || 250;
  if (pag <= 0 || wpm <= 0) throw new Error('Datos inválidos');

  const PAL_PAG: Record<string, number> = {
    'ficcion-liviana': 250,
    'ficcion': 275,
    'ensayo': 280,
    'academico': 320,
    'tecnico': 300,
  };
  const FACTOR: Record<string, number> = {
    'ficcion-liviana': 1.0,
    'ficcion': 0.9,
    'ensayo': 0.8,
    'academico': 0.6,
    'tecnico': 0.5,
  };

  const pp = PAL_PAG[tipo] || 275;
  const f = FACTOR[tipo] || 0.9;

  const palabras = pag * pp;
  const wpmEf = wpm * f;
  const minutos = palabras / wpmEf;
  const horas = minutos / 60;
  const minPag = Math.round(minutos / pag * 10) / 10;

  const TIPO_LABEL: Record<string, string> = {
    'ficcion-liviana': 'ficción liviana',
    'ficcion': 'ficción',
    'ensayo': 'ensayo',
    'academico': 'texto académico',
    'tecnico': 'texto técnico',
  };
  const tipoLabel = TIPO_LABEL[tipo] || 'ficción';
  const denso = f <= 0.6;
  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (denso) {
    insightText = `Al ser **${tipoLabel}** tu ritmo efectivo baja a **${Math.round(wpmEf)} ppm** (~${minPag} min por página). Esas **${pag} páginas** te llevan unas **${horas.toFixed(1)} h**: leelo con apuntes, no de corrido.`;
    insightTone = 'warn';
  } else if (horas >= 6) {
    insightText = `Leer **${pag} páginas** de **${tipoLabel}** a **${Math.round(wpmEf)} ppm** son unas **${horas.toFixed(1)} h**. Es un libro largo: repartilo en varias jornadas.`;
    insightTone = 'neutral';
  } else {
    insightText = `A **${Math.round(wpmEf)} ppm** efectivas, esas **${pag} páginas** de **${tipoLabel}** fluyen en unas **${horas.toFixed(1)} h** (~${minPag} min por página). Lectura ágil.`;
    insightTone = 'good';
  }

  return {
    tiempoTotalHoras: Math.round(horas * 10) / 10,
    tiempoTotalMin: Math.round(minutos),
    minPorPagina: minPag,
    wpmEfectivo: Math.round(wpmEf),
    _insight: { title: 'Tu ritmo de lectura', text: insightText, tone: insightTone, icon: '📖' },
  };

}
