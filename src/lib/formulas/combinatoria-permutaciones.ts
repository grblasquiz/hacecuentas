/** Combinaciones y permutaciones — cálculo entero EXACTO con BigInt.
 *  Number pierde precisión entera a partir de 2^53 (≈ 9,007×10^15): 19! ya la supera.
 *  Por eso el conteo se hace con BigInt (algoritmo multiplicativo) y el string exacto
 *  es la fuente de verdad para mostrar. `resultado` (number) se conserva por compat,
 *  pero puede ser aproximado para valores enormes: NO se usa para el display principal. */
export interface Inputs { n: number; r: number; tipo: string; }
export interface Outputs {
  resultado: number;        // numérico (aprox. si supera 2^53) — no se muestra como principal
  resultadoExacto: string;  // entero EXACTO formateado es-AR — display principal
  formula: string;
  detalle: string;
  _insight?: any;
}

// Separador de miles es-AR sobre el string decimal de un BigInt.
function fmtBig(b: bigint): string {
  const neg = b < 0n;
  const s = (neg ? -b : b).toString();
  const sep = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '-' : '') + sep;
}

// C(n,r) exacto (algoritmo multiplicativo con BigInt).
function combBig(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  r = Math.min(r, n - r);
  let num = 1n;
  let den = 1n;
  for (let k = 0; k < r; k++) {
    num *= BigInt(n - k);
    den *= BigInt(k + 1);
  }
  return num / den; // exacto: num siempre es múltiplo de den
}

// P(n,r) = n·(n−1)···(n−r+1) exacto.
function permBig(n: number, r: number): bigint {
  if (r < 0 || r > n) return 0n;
  let p = 1n;
  for (let k = 0; k < r; k++) p *= BigInt(n - k);
  return p;
}

export function combinatoriaPermutaciones(i: Inputs): Outputs {
  const n = Math.floor(Number(i.n));
  const r = Math.floor(Number(i.r));
  const tipo = String(i.tipo || 'combinacion');
  if (isNaN(n) || n < 0) throw new Error('Ingresá un valor válido para n');
  if (isNaN(r) || r < 0) throw new Error('Ingresá un valor válido para r');
  if (n > 170) throw new Error('n no puede ser mayor a 170 en esta calculadora');

  let big: bigint;
  let formulaBase: string;

  switch (tipo) {
    case 'combinacion':
      if (r > n) throw new Error('r no puede ser mayor que n en combinaciones sin repetición');
      big = combBig(n, r);
      formulaBase = `C(${n},${r}) = ${n}! / (${r}! × ${n - r}!)`;
      break;
    case 'permutacion':
      if (r > n) throw new Error('r no puede ser mayor que n en permutaciones sin repetición');
      big = permBig(n, r);
      formulaBase = `P(${n},${r}) = ${n}! / ${n - r}!`;
      break;
    case 'combinacion-repeticion':
      big = combBig(n + r - 1, r);
      formulaBase = `CR(${n},${r}) = C(${n + r - 1},${r}) = ${n + r - 1}! / (${r}! × ${n - 1}!)`;
      break;
    case 'permutacion-repeticion': {
      // n^r puede ser gigante: acotamos la cantidad de dígitos para no colgar el render.
      const digitos = r * Math.log10(Math.max(n, 1));
      if (digitos > 1000) throw new Error('El resultado supera el límite de dígitos de esta calculadora');
      big = BigInt(n) ** BigInt(r);
      formulaBase = `${n}^${r}`;
      break;
    }
    default:
      throw new Error('Tipo de cálculo no reconocido');
  }

  const exacto = fmtBig(big);
  const formula = `${formulaBase} = ${exacto}`;
  // Conservado por compatibilidad; para |big| > 2^53 es aproximado (no se muestra como principal).
  const resultado = Number(big);

  const tipoNombres: Record<string, string> = {
    combinacion: 'Combinación sin repetición',
    permutacion: 'Permutación sin repetición',
    'combinacion-repeticion': 'Combinación con repetición',
    'permutacion-repeticion': 'Permutación con repetición',
  };

  const importaOrden = tipo === 'permutacion' || tipo === 'permutacion-repeticion';
  const _insight = {
    title: 'Lo que dice este número',
    text: `Hay **${exacto}** formas distintas de ${importaOrden ? 'ordenar' : 'elegir'} **${r}** elemento${r === 1 ? '' : 's'} ${tipo.includes('repeticion') ? 'pudiendo repetir' : 'sin repetir'} a partir de un conjunto de **${n}**. ${importaOrden ? 'Como es una permutación, el orden importa: cambiar la secuencia cuenta como un caso nuevo.' : 'Como es una combinación, el orden no importa: solo cuenta qué elementos entran, no en qué posición.'}`,
    tone: 'neutral',
    icon: '🔢',
  };

  return {
    resultado,
    resultadoExacto: exacto,
    formula,
    detalle: `${tipoNombres[tipo]}: n=${n}, r=${r}. ${formula}. Resultado exacto: ${exacto}.`,
    _insight,
  };
}
