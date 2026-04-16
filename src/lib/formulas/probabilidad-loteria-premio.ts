/** Calculadora de Probabilidad de Lotería */
export interface Inputs { numerosElegir: number; numerosDisponibles: number; jugadasSemana: number; }
export interface Outputs { probabilidad: string; unaEn: number; anosParas50: number; comparacion: string; }

function combinaciones(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

export function probabilidadLoteriaPremio(i: Inputs): Outputs {
  const k = Number(i.numerosElegir);
  const n = Number(i.numerosDisponibles);
  const jpw = Number(i.jugadasSemana);
  if (!k || k < 1) throw new Error('Ingresá los números a elegir');
  if (!n || n < 2 || n <= k) throw new Error('Los números disponibles deben ser mayores a los que elegís');
  if (!jpw || jpw < 1) throw new Error('Ingresá las jugadas por semana');

  const total = combinaciones(n, k);
  const prob = 1 / total;
  const probPct = prob * 100;

  // Years for 50% chance: solve 1-(1-p)^n = 0.5
  const jugadasPara50 = Math.ceil(Math.log(0.5) / Math.log(1 - prob));
  const semanasPara50 = jugadasPara50 / jpw;
  const anosParas50 = Math.round(semanasPara50 / 52);

  let probabilidad: string;
  if (probPct < 0.0001) probabilidad = `${probPct.toExponential(2)}% (1 en ${total.toLocaleString()})`;
  else probabilidad = `${probPct.toFixed(6)}% (1 en ${total.toLocaleString()})`;

  let comparacion: string;
  if (total > 10000000) comparacion = 'Más improbable que: ser alcanzado por un rayo 2 veces en tu vida.';
  else if (total > 1000000) comparacion = 'Similar a: encontrar un trébol de 4 hojas en tu primer intento.';
  else if (total > 100000) comparacion = 'Similar a: adivinar un PIN de 5 dígitos al azar.';
  else comparacion = 'Probabilidad baja pero no imposible con suficientes intentos.';

  return {
    probabilidad,
    unaEn: total,
    anosParas50,
    comparacion,
  };
}
