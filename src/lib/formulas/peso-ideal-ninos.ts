/** Peso ideal para niños por edad y sexo — OMS */
export interface Inputs { edadNinoAnios: number; sexoNino: string; __lang?: string; }
export interface Outputs { pesoPromedio: string; rangoSaludable: string; evaluacion: string; _insight?: any; _chart?: any; }

const datosVaron: Record<number, [number, number, number]> = { // [P15, P50, P85]
  0: [2.9, 3.3, 3.9], 0.5: [6.7, 7.9, 9.2], 1: [8.6, 9.6, 10.8],
  1.5: [9.5, 10.9, 12.2], 2: [10.8, 12.2, 13.6], 3: [12.7, 14.3, 16.2],
  4: [14.4, 16.3, 18.6], 5: [16.0, 18.3, 21.0], 6: [17.8, 20.5, 23.5],
  7: [19.9, 22.9, 26.4], 8: [22.0, 25.4, 29.7], 9: [24.3, 28.1, 33.3],
  10: [26.7, 31.2, 37.5],
};
const datosMujer: Record<number, [number, number, number]> = {
  0: [2.8, 3.2, 3.7], 0.5: [6.2, 7.3, 8.6], 1: [7.9, 8.9, 10.1],
  1.5: [9.1, 10.2, 11.6], 2: [10.2, 11.5, 13.0], 3: [12.2, 13.9, 15.9],
  4: [14.0, 16.1, 18.5], 5: [15.8, 18.2, 21.2], 6: [17.5, 20.2, 23.5],
  7: [19.5, 22.4, 26.3], 8: [21.7, 25.0, 29.7], 9: [24.3, 28.2, 33.7],
  10: [27.0, 31.9, 38.5],
};

export function pesoIdealNinos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const edad = Number(i.edadNinoAnios);
  const sexo = String(i.sexoNino);
  if (edad < 0 || edad > 10) throw new Error(
    __lang === 'en' ? 'Enter an age between 0 and 10 years' : 'Ingresá una edad entre 0 y 10 años'
  );

  const tabla = sexo === 'f' ? datosMujer : datosVaron;
  const edades = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  let closest = edades[0];
  for (const e of edades) { if (e <= edad) closest = e; }
  const [p15, p50, p85] = tabla[closest];

  const T = ({
    es: {
      percentil50: 'percentil 50',
      percentil15a85: 'percentil 15 a 85',
      nina: 'una niña',
      nino: 'un niño',
      rango: (child: string) => `El rango saludable para ${child} de ${edad} años es de ${p15} a ${p85} kg. El promedio es ${p50} kg.`,
      insightTitle: 'Cómo leer estos valores',
      insightText: (child: string) => `Para ${child} de ${edad} años, un peso de **${p15} a ${p85} kg** se considera saludable según la OMS, con **${p50} kg** como mediana. Estos percentiles son orientativos: lo que importa es que el peso siga su propia curva de crecimiento de forma estable.`,
      bajoPercentil: 'Bajo P15',
      mediana: 'Mediana (P50)',
      altoPercentil: 'Alto P85',
      chartAria: `Escala de peso saludable: de ${p15} a ${p85} kg, con la mediana en ${p50} kg`,
    },
    en: {
      percentil50: 'percentile 50',
      percentil15a85: 'percentile 15 to 85',
      nina: 'a girl',
      nino: 'a boy',
      rango: (child: string) => `The healthy range for ${child} aged ${edad} is ${p15} to ${p85} kg. The average is ${p50} kg.`,
      insightTitle: 'How to read these values',
      insightText: (child: string) => `For ${child} aged ${edad}, a weight of **${p15} to ${p85} kg** is considered healthy per the WHO, with **${p50} kg** as the median. These percentiles are indicative: what matters is that the weight follows its own growth curve steadily.`,
      bajoPercentil: 'Below P15',
      mediana: 'Median (P50)',
      altoPercentil: 'Above P85',
      chartAria: `Healthy weight scale: from ${p15} to ${p85} kg, with the median at ${p50} kg`,
    },
  } as const)[__lang];

  const _insight = {
    title: T.insightTitle,
    text: T.insightText(sexo === 'f' ? T.nina : T.nino),
    tone: 'neutral',
    icon: '🧒',
  };

  const _chart = {
    type: 'scale',
    marker: p50,
    markerLabel: T.mediana,
    min: 0,
    segments: [
      { nombre: T.bajoPercentil, max: p15, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: T.percentil15a85, max: p85, color: '#22c55e', colorDark: '#4ade80' },
      { nombre: T.altoPercentil, max: Number((p85 * 1.3).toFixed(1)), color: '#f59e0b', colorDark: '#fbbf24' },
    ],
    ariaLabel: T.chartAria,
  };

  return {
    pesoPromedio: `${p50} kg (${T.percentil50})`,
    rangoSaludable: `${p15} kg a ${p85} kg (${T.percentil15a85})`,
    evaluacion: T.rango(sexo === 'f' ? T.nina : T.nino),
    _insight,
    _chart,
  };
}
