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

  return {
    caloriasPorcion: Math.round(caloriasPorcion),
    caloriasTotales: Math.round(caloriasTotales),
    proteinasCal: Math.round(proteinasCal),
    carbosCal: Math.round(carbosCal),
    grasasCal: Math.round(grasasCal),
    porcentajeProteinas: Math.round((proteinasCal / total) * 100),
    porcentajeCarbos: Math.round((carbosCal / total) * 100),
    porcentajeGrasas: Math.round((grasasCal / total) * 100),
    mensaje: `${Math.round(caloriasPorcion)} kcal por porción de ${porcion}g. Total por ${porciones} porciones: ${Math.round(caloriasTotales)} kcal.`,
  };
}
