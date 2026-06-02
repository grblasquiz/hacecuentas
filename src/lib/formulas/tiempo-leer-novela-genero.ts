/** ¿Cuánto tarda una novela según género? */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  horasTotales: number;
  minTotales: number;
  dias30min: number;
  dias60min: number;
  _insight?: any;
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
  const horasR = Math.round(horas * 10) / 10;
  const d30 = Math.ceil(minTot / 30);
  const d60 = Math.ceil(minTot / 60);

  const GEN_LABEL: Record<string, string> = {
    thriller: 'thriller', romance: 'romance', 'young-adult': 'young adult',
    scifi: 'ciencia ficción', fantasia: 'fantasía', ficcion: 'ficción', clasico: 'clásico',
  };
  const genLabel = GEN_LABEL[gen] || 'ficción';
  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (horasR >= 15) {
    insightText = `Un **${genLabel}** de **${pag} páginas** son unas **${horasR} h** de lectura: **${d30} días** a media hora diaria. Es un tomo largo, armate una rutina fija.`;
    insightTone = 'neutral';
  } else if (horasR <= 5) {
    insightText = `Esta novela de **${genLabel}** es liviana: **${horasR} h** en total, la liquidás en **${d60} días** leyendo una hora por día.`;
    insightTone = 'good';
  } else {
    insightText = `Leer **${pag} páginas** de **${genLabel}** lleva unas **${horasR} h**: **${d30} días** a 30 min o **${d60} días** a 1 h diaria. Ritmo cómodo.`;
    insightTone = 'good';
  }

  return {
    horasTotales: horasR,
    minTotales: Math.round(minTot),
    dias30min: d30,
    dias60min: d60,
    _insight: { title: 'Cuánto te va a llevar', text: insightText, tone: insightTone, icon: '📕' },
  };

}
