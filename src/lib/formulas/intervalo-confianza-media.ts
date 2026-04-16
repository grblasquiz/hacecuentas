/** Calculadora Intervalo de Confianza — IC = x̄ ± z × (σ/√n) */
export interface Inputs { media: number; desviacion: number; n: number; confianza: string; }
export interface Outputs { intervalo: string; margenError: number; errorEstandar: number; limiteInf: number; limiteSup: number; }

export function intervaloConfianzaMedia(i: Inputs): Outputs {
  const xbar = Number(i.media);
  const sigma = Number(i.desviacion);
  const n = Number(i.n);
  if (sigma <= 0) throw new Error('La desviación estándar debe ser mayor a 0');
  if (n < 2) throw new Error('El tamaño de muestra debe ser al menos 2');

  const zMap: Record<string, number> = { '90': 1.6449, '95': 1.9600, '99': 2.5758 };
  const z = zMap[i.confianza] || 1.96;
  const se = sigma / Math.sqrt(n);
  const me = z * se;
  const lower = xbar - me;
  const upper = xbar + me;

  return {
    intervalo: `[${lower.toFixed(4)}; ${upper.toFixed(4)}] al ${i.confianza}% de confianza`,
    margenError: Number(me.toFixed(4)),
    errorEstandar: Number(se.toFixed(4)),
    limiteInf: Number(lower.toFixed(4)),
    limiteSup: Number(upper.toFixed(4)),
  };
}
