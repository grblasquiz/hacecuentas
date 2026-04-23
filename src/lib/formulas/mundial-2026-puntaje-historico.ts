/** Mundial 2026 - Puntaje histórico fase de grupos */
export interface Inputs { puntos: number; diferenciaGol: number; }
export interface Outputs { probabilidad: string; posicionEstimada: string; consejo: string; }

export function mundial2026PuntajeHistorico(i: Inputs): Outputs {
  const p = Number(i.puntos);
  const dg = Number(i.diferenciaGol) || 0;
  if (p < 0 || p > 9 || isNaN(p)) throw new Error('Puntos fuera de rango (0-9)');

  let base: number;
  if (p >= 9) base = 100;
  else if (p >= 7) base = 100;
  else if (p === 6) base = 98;
  else if (p === 5) base = 92;
  else if (p === 4) base = 80;
  else if (p === 3) base = 42;
  else if (p === 2) base = 25;
  else if (p === 1) base = 8;
  else base = 0;

  // Ajuste por diferencia de gol: ±1.5% por cada unidad de DG.
  const ajuste = Math.max(-15, Math.min(15, dg * 1.5));
  const prob = Math.max(0, Math.min(100, base + ajuste));

  let pos: string;
  if (p >= 7) pos = '1° del grupo (casi seguro)';
  else if (p >= 5) pos = '1° o 2° del grupo';
  else if (p === 4) pos = '2° del grupo probablemente';
  else if (p === 3) pos = '3° (mejor tercero posible)';
  else pos = '3° o 4° del grupo';

  let consejo: string;
  if (prob >= 90) consejo = 'Clasificación casi segura. Podés rotar jugadores en el último partido.';
  else if (prob >= 65) consejo = 'Buenas chances. Un punto más asegura el pasaje.';
  else if (prob >= 35) consejo = 'Al filo. Depende de cómo terminen los otros grupos y de tu diferencia de gol.';
  else consejo = 'Complicado. Hay que ganar el próximo partido para tener chances reales.';

  return {
    probabilidad: `${prob.toFixed(0)}% histórico (Mundial 2026, con mejores terceros)`,
    posicionEstimada: pos,
    consejo,
  };
}
