/**
 * Costo de criar un cachorro el primer año.
 */
export interface Inputs { raza: string; incluyeCastracion: string; calidadAlimento: string; }
export interface Outputs {
  costoTotal: number; setupInicial: number; vacunasPlan: number;
  castracion: number; alimento12Meses: number; vetExtras: number;
}

const RAZAS: Record<string, { comidaMin: number; comidaMax: number; tamano: string }> = {
  'labrador-retriever': { comidaMin: 300, comidaMax: 450, tamano: 'grande' },
  'golden-retriever': { comidaMin: 280, comidaMax: 420, tamano: 'grande' },
  'bulldog-frances': { comidaMin: 130, comidaMax: 200, tamano: 'pequeno' },
  'bulldog-ingles': { comidaMin: 220, comidaMax: 320, tamano: 'mediano' },
  'pastor-aleman': { comidaMin: 320, comidaMax: 480, tamano: 'grande' },
  'beagle': { comidaMin: 170, comidaMax: 250, tamano: 'mediano' },
  'caniche-poodle': { comidaMin: 200, comidaMax: 350, tamano: 'mediano' },
  'chihuahua': { comidaMin: 30, comidaMax: 70, tamano: 'toy' },
  'rottweiler': { comidaMin: 400, comidaMax: 600, tamano: 'grande' },
  'yorkshire-terrier': { comidaMin: 40, comidaMax: 80, tamano: 'toy' },
  'boxer': { comidaMin: 280, comidaMax: 420, tamano: 'grande' },
  'dachshund-salchicha': { comidaMin: 100, comidaMax: 180, tamano: 'pequeno' },
  'husky-siberiano': { comidaMin: 250, comidaMax: 400, tamano: 'grande' },
  'shih-tzu': { comidaMin: 80, comidaMax: 140, tamano: 'pequeno' },
  'pitbull': { comidaMin: 250, comidaMax: 400, tamano: 'mediano' },
};

export function costoCriarCachorroPrimerAno(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const castra = String(inputs.incluyeCastracion || 'si') === 'si';
  const calidad = String(inputs.calidadAlimento || 'premium');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  const setup = r.tamano === 'grande' ? 90000 : r.tamano === 'mediano' ? 65000 : 50000;
  const vacunas = r.tamano === 'grande' ? 90000 : 70000;
  const castracion = castra ? (r.tamano === 'grande' ? 180000 : r.tamano === 'mediano' ? 120000 : 90000) : 0;

  const precioKg = calidad === 'super_premium' ? 28000 : calidad === 'premium' ? 17000 : 10000;
  const gramosDia = (r.comidaMin + r.comidaMax) / 2 * 1.1;
  const alimento = (gramosDia / 1000) * 365 * precioKg;

  const vetExtras = r.tamano === 'grande' ? 350000 : 250000;

  const total = setup + vacunas + castracion + alimento + vetExtras;

  return {
    costoTotal: Math.round(total),
    setupInicial: setup,
    vacunasPlan: vacunas,
    castracion,
    alimento12Meses: Math.round(alimento),
    vetExtras,
  };
}
