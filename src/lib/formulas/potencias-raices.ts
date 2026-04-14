/** Potencias y raíces: x^n, raíz n-ésima */
export interface Inputs {
  base: number;
  exponente: number;
  tipo?: string;
}
export interface Outputs {
  resultado: string;
  resultadoNum: number;
  formula: string;
  notacionCientifica: string;
  cuadrado: number;
  cubo: number;
  raizCuadrada: number | string;
  raizCubica: number;
}

export function potenciasRaices(i: Inputs): Outputs {
  const base = Number(i.base);
  const exp = Number(i.exponente);
  const tipo = String(i.tipo || 'potencia');

  if (isNaN(base) || isNaN(exp)) throw new Error('Ingresá base y exponente válidos');

  let resultado = 0;
  let formula = '';

  if (tipo === 'raiz') {
    if (exp === 0) throw new Error('El índice de la raíz no puede ser 0');
    if (base < 0 && exp % 2 === 0) {
      throw new Error('No existe raíz par de un número negativo (en reales)');
    }
    if (base < 0) {
      // Raíz impar de negativo
      resultado = -Math.pow(-base, 1 / exp);
    } else {
      resultado = Math.pow(base, 1 / exp);
    }
    formula = `${exp}√${base} = ${base}^(1/${exp}) = ${resultado.toFixed(6)}`;
  } else {
    resultado = Math.pow(base, exp);
    formula = `${base}^${exp} = ${resultado}`;
  }

  // Resultado en notación científica si es muy grande/chico
  const abs = Math.abs(resultado);
  let resultadoStr = '';
  if (abs >= 1e15 || (abs > 0 && abs < 1e-4)) {
    resultadoStr = resultado.toExponential(6);
  } else {
    resultadoStr = resultado.toString();
  }
  const notacion = resultado === 0 ? '0' : resultado.toExponential(4);

  const raizCuad = base < 0 ? '∅ (no real)' : Number(Math.sqrt(base).toFixed(6));

  return {
    resultado: resultadoStr,
    resultadoNum: isFinite(resultado) ? Number(resultado.toFixed(6)) : 0,
    formula,
    notacionCientifica: notacion,
    cuadrado: Number((base * base).toFixed(6)),
    cubo: Number((base * base * base).toFixed(6)),
    raizCuadrada: raizCuad,
    raizCubica: Number(Math.cbrt(base).toFixed(6)),
  };
}
