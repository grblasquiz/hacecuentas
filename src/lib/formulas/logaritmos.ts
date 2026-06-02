/** Logaritmos: log base 10, ln, log en cualquier base */
export interface Inputs {
  numero: number;
  base?: number;
  tipo?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  log10: number;
  ln: number;
  log2: number;
  verificacion: string;
  _insight?: any;
}

export function logaritmos(i: Inputs): Outputs {
  const n = Number(i.numero);
  const b = Number(i.base) || 10;
  const tipo = String(i.tipo || 'log10');

  if (n <= 0) throw new Error('El número debe ser mayor que 0 (no existe log de 0 ni de negativos en reales)');
  if ((tipo === 'logBase' || tipo === 'log_base') && (b <= 0 || b === 1)) {
    throw new Error('La base debe ser mayor que 0 y distinta de 1');
  }

  const log10 = Math.log10(n);
  const ln = Math.log(n);
  const log2 = Math.log2(n);

  let resultado = 0;
  let formula = '';
  let base = 10;

  switch (tipo) {
    case 'ln':
      resultado = ln;
      formula = `ln(${n}) = log_e(${n}) = ${ln.toFixed(6)}`;
      base = Math.E;
      break;
    case 'log2':
      resultado = log2;
      formula = `log₂(${n}) = ${log2.toFixed(6)}`;
      base = 2;
      break;
    case 'logBase':
    case 'log_base':
      resultado = Math.log(n) / Math.log(b);
      formula = `log_${b}(${n}) = ln(${n}) / ln(${b}) = ${resultado.toFixed(6)}`;
      base = b;
      break;
    case 'log10':
    default:
      resultado = log10;
      formula = `log(${n}) = log₁₀(${n}) = ${log10.toFixed(6)}`;
      base = 10;
      break;
  }

  const verificacion = `${base.toFixed(4)}^${resultado.toFixed(4)} ≈ ${Math.pow(base, resultado).toFixed(4)} (debería ≈ ${n})`;

  const baseTxt = tipo === 'ln' ? 'e (≈2,718)' : String(Number(base.toFixed(4)));
  const _insight = {
    title: 'Qué dice este logaritmo',
    text: `El logaritmo en base **${baseTxt}** de **${n}** es **${resultado.toFixed(4)}**: ese es el exponente al que hay que elevar **${baseTxt}** para obtener **${n}**.`,
    tone: 'neutral',
    icon: '🔢',
  };

  return {
    resultado: Number(resultado.toFixed(6)),
    formula,
    log10: Number(log10.toFixed(6)),
    ln: Number(ln.toFixed(6)),
    log2: Number(log2.toFixed(6)),
    verificacion,
    _insight,
  };
}
