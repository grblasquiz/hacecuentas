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
  _chart?: any;
  _insight?: any;
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

  const tone = puntaje <= 13 ? 'good' : puntaje <= 20 ? 'neutral' : 'warn';
  const insight = {
    title: `PSS-10: ${nivel}`,
    text: `Sumaste **${puntaje}/40** en la escala de estrés percibido, lo que ubica tu estrés del último mes en nivel **${nivel.toLowerCase()}**. ${puntaje <= 13 ? 'Estás dentro del rango saludable.' : puntaje <= 20 ? 'Es un nivel manejable, pero conviene incorporar hábitos que lo bajen.' : 'Vale la pena tomar medidas activas y considerar apoyo profesional.'}`,
    tone,
    icon: puntaje <= 13 ? '😌' : puntaje <= 20 ? '😐' : '😰',
  };
  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: `${puntaje}/40`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 13, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 20, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Moderado-alto', max: 26, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Alto', max: 40, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Puntaje PSS-10 de ${puntaje} sobre 40 ubicado en la zona de estrés ${nivel.toLowerCase()}`,
  };
  return {
    puntaje,
    nivel,
    recomendacion,
    mensaje: `Puntaje PSS-10: ${puntaje}/40 — ${nivel}. ${puntaje > 20 ? 'Se recomienda buscar ayuda profesional.' : ''}`,
    _chart: chart,
    _insight: insight,
  };
}