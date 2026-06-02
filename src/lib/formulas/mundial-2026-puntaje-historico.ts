/** Mundial 2026 - Puntaje histórico fase de grupos */
export interface Inputs { puntos: number; diferenciaGol: number; }
export interface Outputs { probabilidad: string; posicionEstimada: string; consejo: string; _insight?: any; _chart?: any; }

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

  let insightTone: 'good' | 'warn' | 'neutral';
  if (prob >= 65) insightTone = 'good';
  else if (prob >= 35) insightTone = 'neutral';
  else insightTone = 'warn';

  const insightText = `Con **${p} punto${p === 1 ? '' : 's'}** y diferencia de gol **${dg >= 0 ? '+' : ''}${dg}**, históricamente clasificaron el **${prob.toFixed(0)}%** de los equipos en esa situación. Posición estimada: ${pos}.`;

  return {
    probabilidad: `${prob.toFixed(0)}% histórico (Mundial 2026, con mejores terceros)`,
    posicionEstimada: pos,
    consejo,
    _insight: {
      title: 'Lectura de la clasificación',
      text: insightText,
      tone: insightTone,
      icon: '⚽',
    },
    _chart: {
      type: 'scale',
      marker: Number(prob.toFixed(0)),
      markerLabel: `${prob.toFixed(0)}%`,
      min: 0,
      segments: [
        { nombre: 'Complicado', max: 35, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Al filo', max: 65, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Buenas chances', max: 90, color: '#3b82f6', colorDark: '#2563eb' },
        { nombre: 'Casi seguro', max: 100.5, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Probabilidad histórica de clasificar: ${prob.toFixed(0)}% sobre una escala de 0 a 100`,
    },
  };
}
