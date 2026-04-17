/** ¿Cuánto tarda una novela según género? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  minTotales: number;
  dias30min: number;
  dias60min: number;
}

export function tiempoLeerNovelaGenero(i: Inputs): Outputs {
  const pag = Number(i.paginas) || 400;
  const gen = String(i.genero || 'ficcion');
  if (pag <= 0) throw new Error('Páginas inválidas');

  const WPM: Record<string, number> = {
    thriller: 300, romance: 290, 'young-adult': 285, scifi: 230,
    fantasia: 220, ficcion: 250, clasico: 180,
  };
  const PP: Record<string, number> = {
    thriller: 260, romance: 270, 'young-adult': 255, scifi: 285,
    fantasia: 295, ficcion: 275, clasico: 300,
  };

  const wpm = WPM[gen] || 250;
  const pp = PP[gen] || 275;

  const palabras = pag * pp;
  const minTot = palabras / wpm;
  const horas = minTot / 60;

  return {
    horasTotales: Math.round(horas * 10) / 10,
    minTotales: Math.round(minTot),
    dias30min: Math.ceil(minTot / 30),
    dias60min: Math.ceil(minTot / 60),
  };

}
