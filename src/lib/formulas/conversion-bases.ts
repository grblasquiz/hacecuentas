/** Conversión entre bases numéricas */
export interface Inputs { numero: string; baseOrigen: string; }
export interface Outputs {
  decimal: string;
  binario: string;
  octal: string;
  hexadecimal: string;
  detalle: string;
}

export function conversionBases(i: Inputs): Outputs {
  const num = String(i.numero || '').trim().toUpperCase();
  const base = Number(i.baseOrigen || 10);
  if (!num) throw new Error('Ingresá un número');
  if (![2, 8, 10, 16].includes(base)) throw new Error('Base no soportada');

  // Validar dígitos según la base
  const validChars: Record<number, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9A-F]+$/,
  };

  if (!validChars[base].test(num)) {
    throw new Error(`El número contiene dígitos inválidos para base ${base}`);
  }

  const decimalValue = parseInt(num, base);
  if (isNaN(decimalValue) || decimalValue < 0) throw new Error('Número inválido');

  const decimal = decimalValue.toString(10);
  const binario = decimalValue.toString(2);
  const octal = decimalValue.toString(8);
  const hexadecimal = decimalValue.toString(16).toUpperCase();

  const baseNombres: Record<number, string> = {
    2: 'binario',
    8: 'octal',
    10: 'decimal',
    16: 'hexadecimal',
  };

  return {
    decimal,
    binario,
    octal,
    hexadecimal,
    detalle: `${num} en ${baseNombres[base]} (base ${base}) = ${decimal} decimal = ${binario} binario = ${octal} octal = ${hexadecimal} hexadecimal.`,
  };
}
