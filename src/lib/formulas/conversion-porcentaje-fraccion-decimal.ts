/** Conversión entre porcentaje, fracción y decimal */
export interface Inputs {
  porcentaje: number;
}

export interface Outputs {
  result: number;
  fraccion: string;
  porcentajeStr: string;
  detalle: string;
  _insight?: any;
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function conversionPorcentajeFraccionDecimal(i: Inputs): Outputs {
  const pct = Number(i.porcentaje);

  if (isNaN(pct)) throw new Error('Ingresá un porcentaje');

  const decimal = pct / 100;

  // Fracción: pct/100 simplificada
  // Handle decimals in pct by multiplying to get integers
  let num = pct;
  let den = 100;

  // If pct has decimals, multiply both to make integer
  const decimals = (pct.toString().split('.')[1] || '').length;
  if (decimals > 0) {
    const factor = Math.pow(10, decimals);
    num = Math.round(pct * factor);
    den = 100 * factor;
  }

  const divisor = gcd(Math.abs(num), den);
  const fracNum = num / divisor;
  const fracDen = den / divisor;

  const fraccion = fracDen === 1 ? `${fracNum}` : `${fracNum}/${fracDen}`;

  const esEntero = fracDen === 1;
  return {
    result: Number(decimal.toFixed(6)),
    fraccion,
    porcentajeStr: `${pct}%`,
    detalle: `**${pct}%** = **${decimal}** (decimal) = **${fraccion}** (fracción)\n\nConversión: ${pct} ÷ 100 = ${decimal}\nFracción: ${pct}/100 → simplificada por MCD(${Math.abs(num)}, ${den}) = ${divisor} → **${fraccion}**`,
    _insight: {
      title: 'Las tres formas del mismo número',
      text: esEntero
        ? `**${pct}%** es el mismo valor escrito de tres maneras: **${decimal}** en decimal y **${fraccion}** como número entero. Para multiplicar por un porcentaje en una cuenta, usá la forma decimal (${decimal}).`
        : `**${pct}%** equivale a **${decimal}** en decimal y a la fracción **${fraccion}** ya simplificada (se dividió por el MCD = **${divisor}**). En cálculos conviene usar el decimal **${decimal}**; la fracción sirve para razonar proporciones exactas.`,
      tone: 'neutral' as const,
      icon: '🔢',
    },
  };
}
