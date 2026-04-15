/** VO2max estimado con test de Cooper (12 minutos) */
export interface Inputs { distanciaMetros: number; edad: number; sexo: string; }
export interface Outputs {
  vo2max: number;
  categoria: string;
  detalle: string;
}

// Tablas ACSM de clasificación VO2max por sexo y edad
// [muy pobre, pobre, regular, buena, excelente, superior]
const TABLAS_HOMBRE: Record<string, number[]> = {
  '20': [33, 37, 42, 46, 52],
  '30': [31, 35, 39, 45, 49],
  '40': [28, 32, 36, 42, 46],
  '50': [25, 29, 33, 39, 43],
  '60': [22, 26, 30, 36, 40],
};

const TABLAS_MUJER: Record<string, number[]> = {
  '20': [28, 32, 36, 41, 46],
  '30': [26, 30, 34, 39, 44],
  '40': [24, 28, 32, 37, 41],
  '50': [21, 25, 29, 34, 38],
  '60': [18, 22, 26, 31, 35],
};

function getCategoria(vo2: number, edad: number, sexo: string): string {
  const tabla = sexo === 'mujer' ? TABLAS_MUJER : TABLAS_HOMBRE;
  let decada = '20';
  if (edad >= 60) decada = '60';
  else if (edad >= 50) decada = '50';
  else if (edad >= 40) decada = '40';
  else if (edad >= 30) decada = '30';
  else decada = '20';

  const umbrales = tabla[decada];
  if (vo2 < umbrales[0]) return 'Muy pobre';
  if (vo2 < umbrales[1]) return 'Pobre';
  if (vo2 < umbrales[2]) return 'Regular';
  if (vo2 < umbrales[3]) return 'Buena';
  if (vo2 < umbrales[4]) return 'Excelente';
  return 'Superior';
}

export function vo2maxCooper(i: Inputs): Outputs {
  const dist = Number(i.distanciaMetros);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'hombre');
  if (!dist || dist <= 0) throw new Error('Ingresá la distancia en metros');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Fórmula de Cooper: VO2max = (distancia - 504.9) / 44.73
  const vo2 = (dist - 504.9) / 44.73;
  const cat = getCategoria(vo2, edad, sexo);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    vo2max: Number(vo2.toFixed(1)),
    categoria: cat,
    detalle: `Test de Cooper: ${fmt.format(dist)} m en 12 min → VO2max = ${fmt.format(vo2)} ml/kg/min. Categoría: ${cat} para ${sexo} de ${edad} años.`,
  };
}
