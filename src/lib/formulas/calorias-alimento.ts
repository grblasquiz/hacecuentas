/** Calorías de un alimento por porción */
export interface Inputs {
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  porcion: number;
  porciones: number;
}
export interface Outputs {
  caloriasPorcion: number;
  caloriasTotales: number;
  proteinasCal: number;
  carbosCal: number;
  grasasCal: number;
  porcentajeProteinas: number;
  porcentajeCarbos: number;
  porcentajeGrasas: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function caloriasAlimento(i: Inputs): Outputs {
  const proteinas = Number(i.proteinas) || 0;
  const carbohidratos = Number(i.carbohidratos) || 0;
  const grasas = Number(i.grasas) || 0;
  const porcion = Number(i.porcion) || 100;
  const porciones = Number(i.porciones) || 1;

  // 4 kcal/g proteínas, 4 kcal/g carbos, 9 kcal/g grasas
  const proteinasCal = proteinas * 4;
  const carbosCal = carbohidratos * 4;
  const grasasCal = grasas * 9;
  const caloriasPorcion = proteinasCal + carbosCal + grasasCal;
  const caloriasTotales = caloriasPorcion * porciones;
  const total = caloriasPorcion || 1;

  const pPro = Math.round((proteinasCal / total) * 100);
  const pCar = Math.round((carbosCal / total) * 100);
  const pGra = Math.round((grasasCal / total) * 100);

  // Macro dominante (por aporte calórico)
  const macros = [
    { nombre: 'grasas', cal: grasasCal, pct: pGra },
    { nombre: 'carbohidratos', cal: carbosCal, pct: pCar },
    { nombre: 'proteínas', cal: proteinasCal, pct: pPro },
  ].sort((a, b) => b.cal - a.cal);
  const dom = macros[0];
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const grasaAlta = pGra >= 50 && caloriasPorcion > 0;
  const _insight = {
    title: 'Composición de la porción',
    text: caloriasPorcion > 0
      ? `Esta porción de ${fmt.format(porcion)}g aporta **${fmt.format(Math.round(caloriasPorcion))} kcal**, con las **${dom.nombre}** como macro dominante (**${dom.pct}%** de las calorías).${grasaAlta ? ' Más de la mitad viene de grasas: tenelo en cuenta si cuidás el aporte calórico.' : ''}`
      : `Ingresá los gramos de proteínas, carbohidratos y grasas para ver cuántas calorías aporta la porción.`,
    tone: grasaAlta ? 'warn' : 'neutral',
    icon: '🍽️',
  };

  const _chart = caloriasPorcion > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Proteínas', value: Math.round(proteinasCal) },
          { label: 'Carbohidratos', value: Math.round(carbosCal) },
          { label: 'Grasas', value: Math.round(grasasCal) },
        ],
        prefix: '',
        centerValue: `${fmt.format(Math.round(caloriasPorcion))} kcal`,
        centerLabel: 'por porción',
        ariaLabel: `Calorías de la porción por macronutriente: proteínas ${Math.round(proteinasCal)} kcal, carbohidratos ${Math.round(carbosCal)} kcal, grasas ${Math.round(grasasCal)} kcal`,
      }
    : undefined;

  return {
    caloriasPorcion: Math.round(caloriasPorcion),
    caloriasTotales: Math.round(caloriasTotales),
    proteinasCal: Math.round(proteinasCal),
    carbosCal: Math.round(carbosCal),
    grasasCal: Math.round(grasasCal),
    porcentajeProteinas: pPro,
    porcentajeCarbos: pCar,
    porcentajeGrasas: pGra,
    mensaje: `${Math.round(caloriasPorcion)} kcal por porción de ${porcion}g. Total por ${porciones} porciones: ${Math.round(caloriasTotales)} kcal.`,
    _insight,
    _chart,
  };
}
