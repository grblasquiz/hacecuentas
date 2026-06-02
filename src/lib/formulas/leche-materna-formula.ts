/** Cantidad de leche materna o fórmula por edad y peso */
export interface Inputs { edadBebeSemanas: string; pesoBebe: number; tipoAlimentacion?: string; __lang?: string; }
export interface Outputs { mlPorToma: string; tomasPorDia: string; totalDiario: string; nota: string; _insight?: any; }

export function lecheMaterna(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorPeso: 'Ingresá el peso del bebé',
      nota6meses: 'A partir de los 6 meses se complementa con alimentos sólidos.',
      notaComplementa: 'La leche complementa los sólidos, ya no es el alimento principal.',
      notaMaterna: 'Con lactancia materna exclusiva, el bebé regula la cantidad. Estos valores son orientativos.',
      notaFallback: 'Consultá con tu pediatra para ajustar según tu bebé.',
      insightTitle: 'Cuánta leche por día',
    },
    en: {
      errorPeso: 'Enter the baby\'s weight',
      nota6meses: 'From 6 months onward, breast milk is complemented with solid foods.',
      notaComplementa: 'Milk complements solids and is no longer the main food source.',
      notaMaterna: 'With exclusive breastfeeding, the baby self-regulates intake. These values are guidelines only.',
      notaFallback: 'Consult your pediatrician to adjust amounts for your baby.',
      insightTitle: 'How much milk per day',
    },
  } as const)[__lang];

  const edadSem = Number(i.edadBebeSemanas) || 0;
  const peso = Number(i.pesoBebe);
  const tipo = String(i.tipoAlimentacion || 'formula');
  if (!peso || peso < 2) throw new Error(T.errorPeso);

  let mlToma = 0, tomas = 0, nota = '';
  if (edadSem <= 1) { mlToma = 45; tomas = 10; }
  else if (edadSem <= 3) { mlToma = 75; tomas = 9; }
  else if (edadSem <= 7) { mlToma = 105; tomas = 8; }
  else if (edadSem <= 11) { mlToma = 135; tomas = 7; }
  else if (edadSem <= 15) { mlToma = 165; tomas = 6; }
  else if (edadSem <= 23) { mlToma = 180; tomas = 5; }
  else if (edadSem <= 35) { mlToma = 210; tomas = 4; nota = T.nota6meses; }
  else { mlToma = 210; tomas = 3; nota = T.notaComplementa; }

  // Ajustar por peso si usa fórmula
  if (tipo === 'formula') {
    const totalPorPeso = peso * 150;
    const mlPorPeso = Math.round(totalPorPeso / tomas);
    mlToma = Math.round((mlToma + mlPorPeso) / 2); // promedio de ambos métodos
  }

  const totalDiario = mlToma * tomas;

  if (tipo === 'materna') {
    nota = (nota ? nota + ' ' : '') + T.notaMaterna;
  }

  const insightText = __lang === 'en'
    ? `Around this age, expect roughly **${mlToma} ml per feeding** across **${tomas} feedings**, adding up to **${totalDiario} ml/day** (about ${Math.round(totalDiario / 30)} oz). Use it as a reference, not a fixed target — every baby varies.`
    : `A esta edad, calculá unos **${mlToma} ml por toma** en **${tomas} tomas**, lo que suma **${totalDiario} ml por día** (unas ${Math.round(totalDiario / 30)} onzas). Tomalo como referencia, no como meta fija — cada bebé es distinto.`;
  return {
    mlPorToma: __lang === 'en' ? `${mlToma} ml per feeding (approx.)` : `${mlToma} ml por toma (aproximado)`,
    tomasPorDia: __lang === 'en' ? `${tomas} feedings per day` : `${tomas} tomas por día`,
    totalDiario: __lang === 'en' ? `${totalDiario} ml/day (${Math.round(totalDiario / 30)} oz)` : `${totalDiario} ml/día (${Math.round(totalDiario / 30)} onzas)`,
    nota: nota || T.notaFallback,
    _insight: {
      title: T.insightTitle,
      text: insightText,
      tone: 'neutral',
      icon: '🍼',
    },
  };
}
