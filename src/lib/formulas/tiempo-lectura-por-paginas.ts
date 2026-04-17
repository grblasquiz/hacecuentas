/** ¿Cuánto tarda leer X páginas? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  tiempoTotalHoras: number;
  tiempoTotalMin: number;
  minPorPagina: number;
  wpmEfectivo: number;
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

  return {
    tiempoTotalHoras: Math.round(horas * 10) / 10,
    tiempoTotalMin: Math.round(minutos),
    minPorPagina: Math.round(minutos / pag * 10) / 10,
    wpmEfectivo: Math.round(wpmEf),
  };

}
