/** PSS-10: Escala de Estrés Percibido */
export interface Inputs {
  p1: string; p2: string; p3: string; p4: string; p5: string;
  p6: string; p7: string; p8: string; p9: string; p10: string;
}
export interface Outputs {
  puntaje: number;
  nivel: string;
  recomendacion: string;
  mensaje: string;
}

export function nivelEstresPercibido(i: Inputs): Outputs {
  // Items 4, 5, 6, 7 are reverse-scored (positive items)
  const direct = [Number(i.p1), Number(i.p2), Number(i.p3), Number(i.p8), Number(i.p10)];
  const reverse = [Number(i.p4), Number(i.p5), Number(i.p6), Number(i.p7), Number(i.p9)];

  const directSum = direct.reduce((a, b) => a + b, 0);
  const reverseSum = reverse.reduce((a, b) => a + (4 - b), 0); // Reverse: 0→4, 1→3, 2→2, 3→1, 4→0
  const puntaje = directSum + reverseSum;

  let nivel: string;
  let recomendacion: string;
  if (puntaje <= 13) {
    nivel = 'Estrés bajo';
    recomendacion = 'Tu nivel de estrés es normal. Mantené tus hábitos saludables actuales.';
  } else if (puntaje <= 20) {
    nivel = 'Estrés moderado';
    recomendacion = 'Nivel dentro del rango normal-alto. Considerá incorporar técnicas de manejo de estrés (ejercicio, meditación, mejor sueño).';
  } else if (puntaje <= 26) {
    nivel = 'Estrés moderado-alto';
    recomendacion = 'Tu estrés está por encima del promedio. Recomendamos buscar estrategias activas de manejo y considerar apoyo profesional.';
  } else {
    nivel = 'Estrés alto';
    recomendacion = 'Tu nivel de estrés es elevado. Recomendamos consultar con un profesional de salud mental para evaluación y estrategias personalizadas.';
  }

  return {
    puntaje,
    nivel,
    recomendacion,
    mensaje: `Puntaje PSS-10: ${puntaje}/40 — ${nivel}. ${puntaje > 20 ? 'Se recomienda buscar ayuda profesional.' : ''}`
  };
}