/**
 * Edad humana del perro por raza (fórmula AVMA 2020 logarítmica).
 */
export interface Inputs { raza: string; edadPerro: number; }
export interface Outputs { edadHumana: number; etapa: string; formula: string; recomendacion: string; }

const RAZAS: Record<string, { tamano: string }> = {
  'labrador-retriever': { tamano: 'grande' },
  'golden-retriever': { tamano: 'grande' },
  'bulldog-frances': { tamano: 'pequeno' },
  'bulldog-ingles': { tamano: 'mediano' },
  'pastor-aleman': { tamano: 'grande' },
  'beagle': { tamano: 'mediano' },
  'caniche-poodle': { tamano: 'mediano' },
  'chihuahua': { tamano: 'toy' },
  'rottweiler': { tamano: 'grande' },
  'yorkshire-terrier': { tamano: 'toy' },
  'boxer': { tamano: 'grande' },
  'dachshund-salchicha': { tamano: 'pequeno' },
  'husky-siberiano': { tamano: 'grande' },
  'shih-tzu': { tamano: 'pequeno' },
  'pitbull': { tamano: 'mediano' },
};

export function edadHumanaPorRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const edad = Number(inputs.edadPerro);
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  // Fórmula AVMA 2020
  let humana = 16 * Math.log(edad) + 31;
  // Ajuste cachorros menores a 1 año: interpolación lineal
  if (edad < 1) humana = 15 * edad;

  const factor = r.tamano === 'toy' ? 0.9 : r.tamano === 'pequeno' ? 0.95 : r.tamano === 'grande' ? 1.1 : 1.0;
  humana = humana * factor;

  let etapa = 'Adulto joven';
  if (humana < 20) etapa = 'Cachorro/juvenil';
  else if (humana < 40) etapa = 'Adulto joven';
  else if (humana < 60) etapa = 'Adulto maduro';
  else if (humana < 75) etapa = 'Senior';
  else etapa = 'Geriátrico';

  let recomendacion = 'Controles anuales y alimentación balanceada.';
  if (etapa === 'Senior' || etapa === 'Geriátrico') {
    recomendacion = 'Controles semestrales, alimento Senior, suplementos articulares.';
  } else if (etapa === 'Cachorro/juvenil') {
    recomendacion = 'Plan de vacunas, socialización temprana, alimento Puppy.';
  }

  return {
    edadHumana: Math.round(humana),
    etapa,
    formula: 'AVMA 2020: 16 × ln(edad) + 31',
    recomendacion,
  };
}
