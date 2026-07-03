/** Operaciones con fracciones: suma, resta, multiplicación y división, con resultado simplificado. */
export interface Inputs {
  num1?: number | string;
  den1?: number | string;
  operacion?: string;
  num2?: number | string;
  den2?: number | string;
  __country?: string;
}

export interface Outputs {
  resultado_fraccion: string;
  resultado_simplificado: string;
  resultado_decimal: number;
  resumen: string;
  _insight?: any;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function operacionesConFracciones(i: Inputs): Outputs {
  const n1 = Math.trunc(Number(i.num1) || 0);
  const d1 = Math.trunc(Number(i.den1) || 0);
  const n2 = Math.trunc(Number(i.num2) || 0);
  const d2 = Math.trunc(Number(i.den2) || 0);
  const op = String(i.operacion || 'suma');

  // Denominadores en 0 → no hay fracción válida
  if (d1 === 0 || d2 === 0) {
    return {
      resultado_fraccion: '—',
      resultado_simplificado: '—',
      resultado_decimal: 0,
      resumen: 'Cargá fracciones válidas (los denominadores no pueden ser 0).',
    };
  }

  let rn = 0;
  let rd = 1;
  let opSigno = '+';
  if (op === 'resta') {
    rn = n1 * d2 - n2 * d1;
    rd = d1 * d2;
    opSigno = '−';
  } else if (op === 'multiplicacion') {
    rn = n1 * n2;
    rd = d1 * d2;
    opSigno = '×';
  } else if (op === 'division') {
    rn = n1 * d2;
    rd = d1 * n2;
    opSigno = '÷';
    if (n2 === 0) {
      return {
        resultado_fraccion: '—',
        resultado_simplificado: '—',
        resultado_decimal: 0,
        resumen: 'No se puede dividir por una fracción con numerador 0.',
      };
    }
  } else {
    // suma (default)
    rn = n1 * d2 + n2 * d1;
    rd = d1 * d2;
    opSigno = '+';
  }

  // Normalizar signo al numerador
  if (rd < 0) {
    rn = -rn;
    rd = -rd;
  }
  const g = gcd(rn, rd);
  const sn = rn / g;
  const sd = rd / g;

  const resultado_fraccion = `${rn}/${rd}`;
  const resultado_simplificado = sd === 1 ? `${sn}` : `${sn}/${sd}`;
  const resultado_decimal = Math.round((rn / rd) * 10000) / 10000;

  const resumen = `${n1}/${d1} ${opSigno} ${n2}/${d2} = ${resultado_simplificado} (${resultado_decimal}).`;

  return {
    resultado_fraccion,
    resultado_simplificado,
    resultado_decimal,
    resumen,
    _insight: {
      title: 'Resultado',
      text: `**${n1}/${d1} ${opSigno} ${n2}/${d2}** = **${resultado_simplificado}** = ${resultado_decimal}. La fracción sin simplificar es ${resultado_fraccion}.`,
      tone: 'neutral',
      icon: '➗',
    },
  };
}
