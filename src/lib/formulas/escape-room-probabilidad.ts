/** Calculadora de Probabilidad de Resolver Escape Room */
export interface Inputs { dificultad: string; personas: number; experiencia: string; tiempoMin: number; }
export interface Outputs { probabilidad: number; tiempoEstimado: number; consejos: string; tamanoIdeal: string; _insight?: any; _chart?: any; }

export function escapeRoomProbabilidad(i: Inputs): Outputs {
  const pers = Number(i.personas);
  const tiempo = Number(i.tiempoMin);
  if (!pers || pers < 2) throw new Error('Ingresá al menos 2 personas');
  if (!tiempo || tiempo <= 0) throw new Error('Ingresá el tiempo disponible');

  const baseDif: Record<string, number> = { facil: 70, medio: 50, dificil: 30, extremo: 15 };
  const baseExp: Record<string, number> = { primera: 0.6, novato: 0.8, intermedio: 1.1, experto: 1.4 };

  const base = baseDif[i.dificultad] || 50;
  const expMult = baseExp[i.experiencia] || 1;

  // Team size: optimal is 4-5, too many or too few hurts
  let teamMult = 1;
  if (pers < 3) teamMult = 0.7;
  else if (pers <= 5) teamMult = 1.1;
  else if (pers <= 7) teamMult = 1.0;
  else teamMult = 0.85; // too many people, coordination issues

  // Time bonus
  const timeMult = tiempo >= 75 ? 1.15 : tiempo >= 60 ? 1.0 : 0.85;

  let prob = Math.min(base * expMult * teamMult * timeMult, 95);
  prob = Math.max(prob, 5);

  const tiempoEstimado = Math.round(tiempo * (1 - prob / 200));

  let consejos: string;
  if (i.experiencia === 'primera') consejos = 'Comunicación es clave. Compartan todo lo que encuentren en voz alta. No se queden estancados más de 3 min en un puzzle — pidan pista.';
  else if (i.dificultad === 'extremo') consejos = 'Divídanse en subequipos. Documenten patrones. No asuman nada — verifiquen cada teoría.';
  else consejos = 'Organicen los objetos encontrados en un lugar central. Divídanse los puzzles. Usen pistas si se estancan más de 5 min.';

  const tamanoIdeal = '4-5 personas es el tamaño ideal. Suficientes para dividir tareas, pocos para evitar caos.';

  const probPct = Number(prob.toFixed(0));
  const teamNota = pers < 3 ? 'el grupo chico les juega en contra' : pers > 7 ? 'son demasiados y la coordinación cuesta' : 'el tamaño del grupo ayuda';
  const timeNota = tiempo < 60 ? ' con poco tiempo encima' : tiempo >= 75 ? ' y el tiempo holgado suma' : '';
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (probPct >= 65) {
    insightTone = 'good';
    insightText = `Tienen **${probPct}% de chances** de escapar: muy buenas. Con ${pers} personas ${teamNota}${timeNota}. Apunten a salir en ~**${tiempoEstimado} min** y vayan tranquilos.`;
  } else if (probPct >= 40) {
    insightTone = 'neutral';
    insightText = `Probabilidad de escape: **${probPct}%**, parejo. Con ${pers} personas ${teamNota}${timeNota}. Estiman cerrarlo en ~**${tiempoEstimado} min**: no se duerman con las pistas para inclinar la balanza.`;
  } else {
    insightTone = 'warn';
    insightText = `Solo **${probPct}% de chances** de escapar: la tienen cuesta arriba${timeNota}. Con ${pers} personas ${teamNota}. Pidan pistas sin culpa y dividan los puzzles para no quemar los ~**${tiempoEstimado} min** estimados.`;
  }

  return {
    probabilidad: probPct,
    tiempoEstimado,
    consejos,
    tamanoIdeal,
    _insight: {
      title: 'Tus chances de escapar',
      text: insightText,
      tone: insightTone,
      icon: '🔓',
    },
    _chart: {
      type: 'scale',
      marker: probPct,
      markerLabel: `${probPct}%`,
      min: 0,
      segments: [
        { nombre: 'Difícil', max: 40, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Parejo', max: 65, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Favorable', max: 100, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Probabilidad de escapar del escape room: ${probPct}% sobre 100`,
    },
  };
}
