/** School arithmetic with decimal strings and BigInt; never binary floats. */
export const ARITHMETIC_LIMITS = { digits: 12, decimalPlaces: 6, precision: 12 } as const;
export function parseDecimal(raw: string) {
  const value = raw.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(value)) throw new Error('Escribí un número no negativo, con coma o punto decimal y sin separadores de miles.');
  const [whole, fraction = ''] = value.replace(',', '.').split('.');
  if (whole.length + fraction.length > ARITHMETIC_LIMITS.digits || fraction.length > ARITHMETIC_LIMITS.decimalPlaces)
    throw new Error('Cada número admite hasta 12 cifras en total y 6 decimales.');
  return { coefficient: BigInt(whole + fraction), scale: fraction.length, digits: BigInt(whole + fraction).toString() };
}
const power = (scale: number) => 10n ** BigInt(scale);
export function decimalString(coefficient: bigint, scale: number): string {
  const digits = coefficient.toString().padStart(scale + 1, '0');
  if (!scale) return digits;
  return (digits.slice(0, -scale) + ',' + digits.slice(-scale)).replace(/0+$/, '').replace(/,$/, '');
}
export interface DivisionStep { position: number; digit: string; partial: string; quotientDigit: string; product: string; remainder: string; decimal: boolean }
export function divideSteps(first: string, second: string, precision = 6) {
  const a = parseDecimal(first), b = parseDecimal(second);
  if (!b.coefficient) throw new Error('No se puede dividir por cero.');
  if (!Number.isInteger(precision) || precision < 0 || precision > ARITHMETIC_LIMITS.precision) throw new Error('La precisión debe ser un entero de 0 a 12.');
  const scale = Math.max(a.scale, b.scale);
  const dividend = a.coefficient * power(scale - a.scale), divisor = b.coefficient * power(scale - b.scale);
  const steps: DivisionStep[] = [];
  let remainder = 0n, quotientDigits = '', decimalDigits = '', usedPrecision = 0;
  const next = (digit: string, decimal: boolean) => {
    const partial = remainder * 10n + BigInt(digit), q = partial / divisor, product = q * divisor;
    remainder = partial - product;
    steps.push({ position: steps.length, digit, partial: partial.toString(), quotientDigit: q.toString(), product: product.toString(), remainder: remainder.toString(), decimal });
    return q.toString();
  };
  for (const digit of dividend.toString()) quotientDigits += next(digit, false);
  const integerRemainder = remainder;
  while (remainder && usedPrecision < precision) { decimalDigits += next('0', true); usedPrecision++; }
  const qCoefficient = BigInt(quotientDigits + decimalDigits);
  const quotient = decimalString(qCoefficient, usedPrecision);
  const residual = decimalString(remainder, scale + usedPrecision);
  const originalDivisor = decimalString(b.coefficient, b.scale);
  const originalDividend = decimalString(a.coefficient, a.scale);
  const multiplied = qCoefficient * b.coefficient;
  const checkScale = Math.max(usedPrecision + b.scale, scale + usedPrecision);
  const checkValue = multiplied * power(checkScale - usedPrecision - b.scale) + remainder * power(checkScale - scale - usedPrecision);
  const verified = checkValue === a.coefficient * power(checkScale - a.scale);
  const visualQuotient = quotientDigits + (decimalDigits ? ',' + decimalDigits : '');
  const visualDividend = dividend.toString() + (decimalDigits ? ',' + '0'.repeat(usedPrecision) : '');
  const board = ['  ' + visualQuotient, '  ' + '─'.repeat(visualDividend.length), divisor + ' ) ' + visualDividend];
  steps.forEach((step, i) => {
    const end = i + 1 + (step.decimal ? 1 : 0);
    board.push(' '.repeat(divisor.toString().length + 3) + step.partial.padStart(end),
      ' '.repeat(divisor.toString().length + 2) + '−' + step.product.padStart(end),
      ' '.repeat(divisor.toString().length + 3) + step.remainder.padStart(end));
  });
  // The quotient starts directly above the dividend, including intermediate zeros.
  board[0] = ' '.repeat(divisor.toString().length + 3) + visualQuotient;
  board[1] = ' '.repeat(divisor.toString().length + 3) + '─'.repeat(visualDividend.length);
  return { quotient, residual, integerRemainder: decimalString(integerRemainder, scale), exact: remainder === 0n,
    normalizedDividend: dividend.toString(), normalizedDivisor: divisor.toString(), scale, steps, board: board.join('\n'), verified,
    check: `${quotient} × ${originalDivisor} + ${residual} = ${originalDividend}`,
    summary: `${originalDividend} ÷ ${originalDivisor} = ${quotient}${remainder ? ' (truncado)' : ''}. Resto después de los decimales mostrados: ${residual}.` };
}
export function multiplySteps(first: string, second: string) {
  const a = parseDecimal(first), b = parseDecimal(second), partials: { digit: string; shift: number; value: string; carries: string[] }[] = [];
  for (const [shift, digit] of [...b.digits].reverse().entries()) {
    let carry = 0n, output = ''; const carries: string[] = [];
    for (const source of [...a.digits].reverse()) {
      const previousCarry = carry, value = BigInt(source) * BigInt(digit) + carry;
      carry = value / 10n; output = (value % 10n).toString() + output;
      carries.push(`${source} × ${digit} + ${previousCarry} = ${value}: escribí ${value % 10n} y llevá ${carry}.`);
    }
    if (carry) output = carry.toString() + output;
    partials.push({ digit, shift, value: (BigInt(output) * power(shift)).toString(), carries });
  }
  const product = a.coefficient * b.coefficient, scale = a.scale + b.scale;
  const result = decimalString(product, scale), width = Math.max(a.digits.length, b.digits.length + 2, product.toString().length);
  const board = [a.digits.padStart(width), ('× ' + b.digits).padStart(width), '─'.repeat(width), ...partials.map(p => p.value.padStart(width))];
  if (partials.length > 1) board.push('─'.repeat(width), product.toString().padStart(width));
  return { result, scale, partials, board: board.join('\n'), verified: partials.reduce((sum, p) => sum + BigInt(p.value), 0n) === product,
    check: `${partials.map(p => p.value).join(' + ')} = ${product}; colocar ${scale} cifras decimales → ${result}`,
    summary: `${decimalString(a.coefficient, a.scale)} × ${decimalString(b.coefficient, b.scale)} = ${result}.` };
}
