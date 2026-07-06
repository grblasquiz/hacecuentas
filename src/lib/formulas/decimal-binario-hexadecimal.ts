/**
 * "Conversor decimal / binario / hexadecimal / octal" — herramienta de bases.
 *
 * El usuario ingresa un valor, elige la base de origen y la base de destino, y
 * devolvemos el valor convertido más una tabla con las cuatro bases a la vez.
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source/sourceUrl).
 *
 * Algoritmo (dos líneas): parseInt(valor, baseOrigen) → number entero →
 * number.toString(baseDestino), en MAYÚSCULAS para hexadecimal.
 *
 * El input `valor` llega como string desde el formulario (FormData). Como el
 * runtime de Calculator convierte a número cualquier valor que parsee como número
 * (ej. "101"), coercionamos a String defensivamente antes de validar.
 *
 * Devuelve outputs + _insight (resumen) + _table (las 4 bases).
 */

export interface BaseInputs {
  valor: string | number;
  base_origen: string;
  base_destino: string;
  __lang?: string;
}

export interface BaseOutputs {
  resultado: string;
  decimal: number;
  binario: string;
  octal: string;
  hexadecimal: string;
  _insight?: any;
  _table?: any;
}

// Mapa de nombre de base → radix numérico.
const BASES: Record<string, number> = {
  decimal: 10,
  binario: 2,
  octal: 8,
  hexadecimal: 16,
};

// Nombre "lindo" para mostrar en textos y tablas.
const NOMBRE: Record<string, string> = {
  decimal: 'decimal',
  binario: 'binario',
  octal: 'octal',
  hexadecimal: 'hexadecimal',
};

// Caracteres válidos por base, para validar el valor de entrada antes de parsear.
const VALIDOS: Record<string, RegExp> = {
  decimal: /^[0-9]+$/,
  binario: /^[01]+$/,
  octal: /^[0-7]+$/,
  hexadecimal: /^[0-9a-f]+$/,
};

export function decimalBinarioHexadecimal(inputs: BaseInputs): BaseOutputs {
  // Coerción defensiva: el valor puede llegar como number si el usuario tipeó
  // sólo dígitos. Normalizamos a string, quitamos espacios y prefijos comunes.
  let bruto = inputs.valor == null ? '' : String(inputs.valor).trim();

  const baseOrigen = String(inputs.base_origen || 'decimal').toLowerCase();
  const baseDestino = String(inputs.base_destino || 'binario').toLowerCase();

  if (!(baseOrigen in BASES)) {
    throw new Error(`Base de origen no reconocida: "${baseOrigen}". Usá decimal, binario, hexadecimal u octal.`);
  }
  if (!(baseDestino in BASES)) {
    throw new Error(`Base de destino no reconocida: "${baseDestino}". Usá decimal, binario, hexadecimal u octal.`);
  }

  if (bruto === '') {
    throw new Error('Ingresá un número para convertir.');
  }

  // Manejar signo negativo aparte (parseInt lo soporta, pero validamos los dígitos).
  let negativo = false;
  if (bruto.startsWith('-')) {
    negativo = true;
    bruto = bruto.slice(1);
  } else if (bruto.startsWith('+')) {
    bruto = bruto.slice(1);
  }

  // Sacar prefijos habituales (0x para hex, 0b para binario, 0o para octal).
  const sinPrefijo = bruto.replace(/^0x/i, '').replace(/^0b/i, '').replace(/^0o/i, '');
  const normal = sinPrefijo.toLowerCase();

  if (normal === '') {
    throw new Error('Ingresá un número para convertir.');
  }

  // Validar que cada carácter sea válido para la base de origen.
  if (!VALIDOS[baseOrigen].test(normal)) {
    const permitidos: Record<string, string> = {
      decimal: 'dígitos del 0 al 9',
      binario: 'sólo 0 y 1',
      octal: 'dígitos del 0 al 7',
      hexadecimal: 'dígitos del 0 al 9 y letras de la A a la F',
    };
    throw new Error(`"${bruto}" no es un número ${NOMBRE[baseOrigen]} válido: se permiten ${permitidos[baseOrigen]}.`);
  }

  const radixOrigen = BASES[baseOrigen];
  const radixDestino = BASES[baseDestino];

  // parseInt del valor en su base de origen → entero decimal (number).
  const decimalValor = parseInt(normal, radixOrigen);

  if (!Number.isFinite(decimalValor)) {
    throw new Error('No se pudo interpretar el número. Revisá el valor y la base de origen.');
  }

  // Aviso de precisión: por encima de 2^53 JavaScript pierde exactitud.
  if (decimalValor > Number.MAX_SAFE_INTEGER) {
    throw new Error('El número es demasiado grande para convertirlo con exactitud (máximo 9.007.199.254.740.991 en decimal).');
  }

  const signo = negativo ? '-' : '';

  // toString(base) del entero → representación en la base de destino.
  const enBase = (radix: number): string => {
    const s = decimalValor.toString(radix);
    // Hexadecimal en MAYÚSCULAS (convención); el resto queda igual.
    return radix === 16 ? s.toUpperCase() : s;
  };

  const decimalStr = signo + decimalValor.toString(10);
  const binarioStr = signo + enBase(2);
  const octalStr = signo + enBase(8);
  const hexStr = signo + enBase(16);

  const resultado = signo + enBase(radixDestino);

  // Insight: frase humana con origen → destino y el valor decimal de referencia.
  const nfDec = (negativo ? -decimalValor : decimalValor).toLocaleString('es-AR');
  const narrativa =
    `El número ${NOMBRE[baseOrigen]} ${bruto.toUpperCase()} equivale a ${resultado} en ${NOMBRE[baseDestino]}` +
    (baseOrigen === 'decimal' || baseDestino === 'decimal'
      ? '.'
      : ` (su valor decimal es ${nfDec}).`);

  return {
    resultado,
    decimal: negativo ? -decimalValor : decimalValor,
    binario: binarioStr,
    octal: octalStr,
    hexadecimal: hexStr,
    _insight: {
      type: 'highlight',
      icon: '🔢',
      text: narrativa,
    },
    _table: {
      title: 'El mismo número en las cuatro bases',
      headers: ['Base', 'Representación'],
      rows: [
        [`Decimal (base 10)`, decimalStr],
        [`Binario (base 2)`, binarioStr],
        [`Octal (base 8)`, octalStr],
        [`Hexadecimal (base 16)`, hexStr],
      ],
      note: 'El hexadecimal se muestra en mayúsculas (A-F) por convención. El valor decimal es el "puente": todas las bases representan la misma cantidad.',
    },
  };
}
