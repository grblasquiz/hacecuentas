/** Calculadora de Probabilidad de Resolver Escape Room */
export interface Inputs { dificultad: string; personas: number; experiencia: string; tiempoMin: number; }
export interface Outputs { probabilidad: number; tiempoEstimado: number; consejos: string; tamanoIdeal: string; }

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

  return { probabilidad: Number(prob.toFixed(0)), tiempoEstimado, consejos, tamanoIdeal };
}
