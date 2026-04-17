/**
 * Costo mensual de perro por raza (ARG, abril 2026).
 */
export interface Inputs { raza: string; calidadAlimento: string; paseador: string; }
export interface Outputs {
  costoMensual: number; alimentoMensual: number; vetMensual: number;
  accesoriosMensual: number; paseadorMensual: number; costoAnual: number;
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

export function costoMensualRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const calidad = String(inputs.calidadAlimento || 'premium');
  const usaPaseador = String(inputs.paseador || 'no') === 'si';
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  const precioKg = calidad === 'super_premium' ? 25000 : calidad === 'premium' ? 15000 : 9000;
  const gramosDia = (r.comidaMin + r.comidaMax) / 2;
  const alimentoMes = (gramosDia / 1000) * 30 * precioKg;

  const vetMes = r.tamano === 'grande' ? 30000 : r.tamano === 'mediano' ? 22000 : 18000;
  const accesoriosMes = r.tamano === 'grande' ? 15000 : 10000;
  const paseadorMes = usaPaseador ? 130000 : 0;

  const total = alimentoMes + vetMes + accesoriosMes + paseadorMes;

  return {
    costoMensual: Math.round(total),
    alimentoMensual: Math.round(alimentoMes),
    vetMensual: vetMes,
    accesoriosMensual: accesoriosMes,
    paseadorMensual: paseadorMes,
    costoAnual: Math.round(total * 12),
  };
}
