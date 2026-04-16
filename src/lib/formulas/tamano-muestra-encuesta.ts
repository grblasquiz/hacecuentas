/** Calculadora Tamaño de Muestra — n = z²p(1-p)/e² */
export interface Inputs { margenError: number; confianza: string; proporcion: number; poblacion?: number; }
export interface Outputs { tamanoMuestra: number; formulaUsada: string; nota: string; }

export function tamanoMuestraEncuesta(i: Inputs): Outputs {
  const e = Number(i.margenError) / 100;
  const p = Number(i.proporcion) / 100;
  if (e <= 0 || e >= 1) throw new Error('El margen de error debe estar entre 0,1% y 50%');
  if (p <= 0 || p >= 1) throw new Error('La proporción debe estar entre 1% y 99%');

  const zMap: Record<string, number> = { '90': 1.6449, '95': 1.9600, '99': 2.5758 };
  const z = zMap[i.confianza] || 1.96;

  let n0 = Math.ceil((z * z * p * (1 - p)) / (e * e));
  const N = i.poblacion ? Number(i.poblacion) : 0;
  let nFinal: number;
  let formulaStr: string;

  if (N > 0) {
    nFinal = Math.ceil(n0 / (1 + (n0 - 1) / N));
    formulaStr = `n₀ = ${z}² × ${p} × ${1 - p} / ${e}² = ${n0}. Corrección: n = ${n0}/(1+(${n0}-1)/${N}) = ${nFinal}`;
  } else {
    nFinal = n0;
    formulaStr = `n = ${z}² × ${p} × ${1 - p} / ${e}² = ${n0}`;
  }

  return {
    tamanoMuestra: nFinal,
    formulaUsada: formulaStr,
    nota: `Necesitás al menos ${nFinal} respuestas válidas. Si la tasa de respuesta es ~60%, enviá a ${Math.ceil(nFinal / 0.6)} personas.`,
  };
}
