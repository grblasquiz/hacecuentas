/** Calculadora de proteína por comida — absorción óptima */
export interface Inputs {
  peso: number;
  proteinaDiaria: number;
  comidas: number;
  __lang?: string;
}
export interface Outputs {
  proteinaPorComida: number;
  optimo: string;
  horasEntre: number;
  aprovechamiento: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function proteinaPorComidaAbsorcion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errPeso: 'Ingresá tu peso',
      errProteina: 'Ingresá la proteína diaria',
      aprovOk: '✅ Distribución óptima: cada comida está en el rango ideal para síntesis muscular.',
      aprovPoco: '⚠️ Poca proteína por comida. Considerá reducir el número de comidas o aumentar la proteína total.',
      aprovExceso: '⚠️ Exceso por comida. Podrías distribuir mejor sumando 1-2 comidas más.',
      insTitle: 'Tu proteína por comida',
      insOk: (pc: number, mn: number, mx: number, cm: number) => `Te quedan **${pc} g por comida** en ${cm} comidas, justo dentro del rango óptimo de **${mn}-${mx} g** para activar la síntesis muscular en cada toma. Vas perfecto.`,
      insPoco: (pc: number, mn: number, mx: number, cm: number) => `Te quedan solo **${pc} g por comida**, por debajo del piso óptimo de **${mn} g**. Repartir en menos comidas o subir la proteína total te ayuda a superar el umbral de cada toma.`,
      insExceso: (pc: number, mn: number, mx: number, cm: number) => `Te quedan **${pc} g por comida**, por encima de **${mx} g**: parte de ese excedente no suma a la síntesis muscular. Sumar 1-2 comidas más reparte mejor el total.`,
      segPoco: 'Poco',
      segOpt: 'Óptimo',
      segExceso: 'Exceso',
      mkLabel: (pc: number) => `${pc} g/comida`,
      chartAria: (pc: number, mn: number, mx: number) => `Proteína por comida de ${pc} g frente al rango óptimo de ${mn} a ${mx} g`,
    },
    en: {
      errPeso: 'Enter your weight',
      errProteina: 'Enter your daily protein',
      aprovOk: '✅ Optimal distribution: each meal is in the ideal range for muscle protein synthesis.',
      aprovPoco: '⚠️ Too little protein per meal. Consider reducing the number of meals or increasing total protein.',
      aprovExceso: '⚠️ Too much protein per meal. You could spread it better by adding 1-2 more meals.',
      insTitle: 'Your protein per meal',
      insOk: (pc: number, mn: number, mx: number, cm: number) => `You get **${pc} g per meal** across ${cm} meals, right inside the optimal **${mn}-${mx} g** range to trigger muscle protein synthesis at each meal. You're spot on.`,
      insPoco: (pc: number, mn: number, mx: number, cm: number) => `You only get **${pc} g per meal**, below the optimal floor of **${mn} g**. Splitting into fewer meals or raising total protein helps you clear the threshold at each meal.`,
      insExceso: (pc: number, mn: number, mx: number, cm: number) => `You get **${pc} g per meal**, above **${mx} g**: part of that surplus doesn't add to muscle synthesis. Adding 1-2 more meals spreads the total better.`,
      segPoco: 'Low',
      segOpt: 'Optimal',
      segExceso: 'Excess',
      mkLabel: (pc: number) => `${pc} g/meal`,
      chartAria: (pc: number, mn: number, mx: number) => `Protein per meal of ${pc} g versus the optimal range of ${mn} to ${mx} g`,
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const proteinaDiaria = Number(i.proteinaDiaria);
  const comidas = Number(i.comidas) || 4;
  if (!peso || peso <= 0) throw new Error(T.errPeso);
  if (!proteinaDiaria || proteinaDiaria <= 0) throw new Error(T.errProteina);

  const proteinaPorComida = Math.round(proteinaDiaria / comidas);
  const optimoMin = Math.round(peso * 0.4);
  const optimoMax = Math.round(peso * 0.55);
  const horasEntre = Math.round((16 / comidas) * 10) / 10; // horas activas

  let aprovechamiento: string;
  let insText: string;
  let tone: 'good' | 'warn';
  if (proteinaPorComida >= optimoMin && proteinaPorComida <= optimoMax) {
    aprovechamiento = T.aprovOk;
    insText = T.insOk(proteinaPorComida, optimoMin, optimoMax, comidas);
    tone = 'good';
  } else if (proteinaPorComida < optimoMin) {
    aprovechamiento = T.aprovPoco;
    insText = T.insPoco(proteinaPorComida, optimoMin, optimoMax, comidas);
    tone = 'warn';
  } else {
    aprovechamiento = T.aprovExceso;
    insText = T.insExceso(proteinaPorComida, optimoMin, optimoMax, comidas);
    tone = 'warn';
  }

  const _insight = {
    title: T.insTitle,
    text: insText,
    tone,
    icon: '🍽️',
  };

  // Tope del gráfico: garantiza que el último segmento supere al marker
  const chartMax = Math.max(optimoMax + Math.round(optimoMax * 0.6), proteinaPorComida + 5);
  const _chart = {
    type: 'scale',
    marker: proteinaPorComida,
    markerLabel: T.mkLabel(proteinaPorComida),
    min: 0,
    segments: [
      { nombre: T.segPoco, max: optimoMin, color: '#f59e0b', colorDark: '#b45309' },
      { nombre: T.segOpt, max: optimoMax, color: '#22c55e', colorDark: '#15803d' },
      { nombre: T.segExceso, max: chartMax, color: '#ef4444', colorDark: '#b91c1c' },
    ],
    ariaLabel: T.chartAria(proteinaPorComida, optimoMin, optimoMax),
  };

  return {
    proteinaPorComida,
    optimo: __lang === 'en'
      ? `${optimoMin}-${optimoMax} g per meal`
      : `${optimoMin}-${optimoMax} g por comida`,
    horasEntre,
    aprovechamiento,
    mensaje: __lang === 'en'
      ? `${proteinaPorComida}g per meal across ${comidas} meals. Optimal range: ${optimoMin}-${optimoMax}g. Space each meal ~${horasEntre}h apart.`
      : `${proteinaPorComida}g por comida en ${comidas} comidas. Rango óptimo: ${optimoMin}-${optimoMax}g. Separá cada comida ~${horasEntre}h.`,
    _insight,
    _chart,
  };
}