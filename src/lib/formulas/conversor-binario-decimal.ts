/**
 * Conversor Binario ↔ Decimal ↔ Hexadecimal ↔ Octal
 */
export interface ConversorBinarioInputs { numero: string; sistemaOrigen: string; }
export interface ConversorBinarioOutputs { decimal: string; binario: string; hexadecimal: string; octal: string; resultado: string; }

function validarBinario(s: string): boolean {
  return /^[01]+$/.test(s);
}

function validarOctal(s: string): boolean {
  return /^[0-7]+$/.test(s);
}

function validarHex(s: string): boolean {
  return /^[0-9a-fA-F]+$/.test(s);
}

function validarDecimal(s: string): boolean {
  return /^\d+$/.test(s);
}

export function conversorBinarioDecimal(inputs: ConversorBinarioInputs): ConversorBinarioOutputs {
  const numero = (inputs.numero || '').trim().replace(/\s/g, '');
  const sistema = (inputs.sistemaOrigen || 'decimal').toLowerCase();

  if (!numero) throw new Error('Ingresá un número para convertir');

  let valorDecimal: number;

  switch (sistema) {
    case 'binario':
      if (!validarBinario(numero)) throw new Error('El número binario solo puede contener 0 y 1');
      valorDecimal = parseInt(numero, 2);
      break;
    case 'octal':
      if (!validarOctal(numero)) throw new Error('El número octal solo puede contener dígitos del 0 al 7');
      valorDecimal = parseInt(numero, 8);
      break;
    case 'hexadecimal':
      if (!validarHex(numero)) throw new Error('El número hexadecimal solo puede contener 0-9 y A-F');
      valorDecimal = parseInt(numero, 16);
      break;
    default: // decimal
      if (!validarDecimal(numero)) throw new Error('El número decimal solo puede contener dígitos 0-9');
      valorDecimal = parseInt(numero, 10);
  }

  if (isNaN(valorDecimal)) throw new Error('Número no válido');
  if (valorDecimal < 0) throw new Error('Solo se aceptan números positivos');
  if (valorDecimal > Number.MAX_SAFE_INTEGER) throw new Error('Número demasiado grande');

  const decimal = valorDecimal.toString(10);
  const binario = valorDecimal.toString(2);
  const hexadecimal = valorDecimal.toString(16).toUpperCase();
  const octal = valorDecimal.toString(8);

  const nombreSistema: Record<string, string> = {
    binario: 'Binario', octal: 'Octal', hexadecimal: 'Hexadecimal', decimal: 'Decimal',
  };

  const resultado = `${numero} (${nombreSistema[sistema] || 'Decimal'}) = ${decimal} (Decimal) = ${binario} (Binario) = ${hexadecimal} (Hex) = ${octal} (Octal)`;

  return { decimal, binario, hexadecimal, octal, resultado };
}
