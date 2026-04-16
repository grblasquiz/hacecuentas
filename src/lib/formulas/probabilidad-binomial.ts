/** Calculadora Probabilidad Binomial — P(X=k) = C(n,k)·p^k·(1-p)^(n-k) */
export interface Inputs { n: number; k: number; p: number; }
export interface Outputs { probabilidad: string; probAcumulada: string; mediaEsperada: number; desviacion: number; }

function logComb(n: number, k: number): number {
  if (k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  if (k > n - k) k = n - k;
  let result = 0;
  for (let i = 0; i < k; i++) {
    result += Math.log(n - i) - Math.log(i + 1);
  }
  return result;
}

function binomialPMF(n: number, k: number, p: number): number {
  if (k > n || k < 0) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  const logP = logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logP);
}

export function probabilidadBinomial(i: Inputs): Outputs {
  const n = Math.round(Number(i.n));
  const k = Math.round(Number(i.k));
  const p = Number(i.p);
  if (n < 1) throw new Error('n debe ser al menos 1');
  if (k < 0 || k > n) throw new Error('k debe estar entre 0 y n');
  if (p < 0 || p > 1) throw new Error('p debe estar entre 0 y 1');

  const prob = binomialPMF(n, k, p);
  let cumProb = 0;
  for (let j = 0; j <= k; j++) cumProb += binomialPMF(n, j, p);

  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  return {
    probabilidad: `${(prob * 100).toFixed(4)}% (${prob.toFixed(8)})`,
    probAcumulada: `${(cumProb * 100).toFixed(4)}% (${cumProb.toFixed(8)})`,
    mediaEsperada: Number(mu.toFixed(4)),
    desviacion: Number(sigma.toFixed(4)),
  };
}
