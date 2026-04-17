/**
 * Cachorros por camada según raza.
 */
export interface Inputs { raza: string; primeraCamada: string; edadPerra: string; }
export interface Outputs { cachorrosEstimados: number; minimo: number; maximo: number; comentario: string; }

const RAZAS: Record<string, { min: number; max: number }> = {
  'labrador-retriever': { min: 6, max: 8 },
  'golden-retriever': { min: 6, max: 10 },
  'bulldog-frances': { min: 3, max: 5 },
  'bulldog-ingles': { min: 4, max: 5 },
  'pastor-aleman': { min: 6, max: 9 },
  'beagle': { min: 4, max: 7 },
  'caniche-poodle': { min: 3, max: 6 },
  'chihuahua': { min: 2, max: 4 },
  'rottweiler': { min: 8, max: 12 },
  'yorkshire-terrier': { min: 2, max: 4 },
  'boxer': { min: 5, max: 8 },
  'dachshund-salchicha': { min: 3, max: 6 },
  'husky-siberiano': { min: 4, max: 8 },
  'shih-tzu': { min: 3, max: 5 },
  'pitbull': { min: 5, max: 10 },
};

export function cachorrosCamadaRaza(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'labrador-retriever');
  const primera = String(inputs.primeraCamada || 'no') === 'si';
  const edad = String(inputs.edadPerra || 'joven');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let min = r.min;
  let max = r.max;

  if (primera) { min *= 0.75; max *= 0.75; }
  if (edad === 'mayor') { min *= 0.7; max *= 0.8; }

  const estimados = Math.round((min + max) / 2);
  let comentario = 'Rango típico según raza.';
  if (primera) comentario = 'Primera camada suele ser 20-30% más chica.';
  if (edad === 'mayor') comentario = 'Perra mayor: camadas más chicas y mayor riesgo. Consultá al vet.';

  return { cachorrosEstimados: estimados, minimo: Math.round(min), maximo: Math.round(max), comentario };
}
