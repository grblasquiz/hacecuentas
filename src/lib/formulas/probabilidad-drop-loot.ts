/** Calculadora de Probabilidad de Drop/Loot */
export interface Inputs {
  dropRate: number;
  intentos: number;
}
export interface Outputs {
  probAlMenosUno: number;
  intentos50: number;
  intentos90: number;
  intentos99: number;
  mensaje: string;
}

export function probabilidadDropLoot(i: Inputs): Outputs {
  const dr = Number(i.dropRate) / 100;
  const n = Number(i.intentos);

  if (!dr || dr <= 0 || dr > 1) throw new Error('Ingresá un drop rate válido (0.001% - 100%)');
  if (!n || n < 1) throw new Error('Ingresá al menos 1 intento');

  // P(at least 1) = 1 - (1 - dr)^n
  const probAlMenosUno = (1 - Math.pow(1 - dr, n)) * 100;

  // Intentos para X% = ln(1 - X) / ln(1 - dr)
  const intentos50 = Math.ceil(Math.log(0.5) / Math.log(1 - dr));
  const intentos90 = Math.ceil(Math.log(0.1) / Math.log(1 - dr));
  const intentos99 = Math.ceil(Math.log(0.01) / Math.log(1 - dr));

  return {
    probAlMenosUno: Number(probAlMenosUno.toFixed(2)),
    intentos50,
    intentos90,
    intentos99,
    mensaje: `Con ${(dr * 100).toFixed(3)}% de drop rate y ${n} intentos, tenés ${probAlMenosUno.toFixed(1)}% de chance de haber obtenido al menos 1. Necesitás ${intentos50} intentos para 50% y ${intentos90} para 90%.`,
  };
}
