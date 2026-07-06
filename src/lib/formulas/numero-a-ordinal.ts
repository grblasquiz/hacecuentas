/**
 * "Número a ordinal" — convierte un número cardinal a su ordinal en español.
 *
 * Ej: 1 → primero/primera, 2 → segundo, 21 → vigésimo primero, 100 → centésimo.
 * Devuelve la forma en palabras (según género) y la forma abreviada (1º / 1ª).
 * No hay datos que caduquen → `dataUpdate.frequency` = never.
 *
 * Algoritmo: tablas de unidades (1-9), decenas (10, 20…90) y centenas
 * (100, 200…900) ordinales del español según la RAE, y composición por yuxtaposición
 * (los ordinales compuestos se escriben en palabras separadas: vigésimo primero,
 * ducentésimo trigésimo cuarto). Soporta enteros de 1 a 9999.
 *
 * El input `numero` puede llegar como string desde el formulario; coercionamos a
 * número. `genero` decide la terminación -o/-a (primero/primera). La abreviatura
 * usa el símbolo ordinal º (masculino) o ª (femenino).
 */

export interface NumeroAOrdinalInputs {
  numero: string | number;
  genero?: string;
  __lang?: string;
}

export interface NumeroAOrdinalOutputs {
  ordinal: string;
  abreviado: string;
  _insight?: any;
  _table?: any;
}

// Formas base en masculino, terminadas en -o. Para femenino cambiamos la última
// -o por -a en cada palabra del ordinal compuesto.
const UNIDADES: Record<number, string> = {
  1: 'primero',
  2: 'segundo',
  3: 'tercero',
  4: 'cuarto',
  5: 'quinto',
  6: 'sexto',
  7: 'séptimo',
  8: 'octavo',
  9: 'noveno',
};

const DECENAS: Record<number, string> = {
  10: 'décimo',
  20: 'vigésimo',
  30: 'trigésimo',
  40: 'cuadragésimo',
  50: 'quincuagésimo',
  60: 'sexagésimo',
  70: 'septuagésimo',
  80: 'octogésimo',
  90: 'nonagésimo',
};

const CENTENAS: Record<number, string> = {
  100: 'centésimo',
  200: 'ducentésimo',
  300: 'tricentésimo',
  400: 'cuadringentésimo',
  500: 'quingentésimo',
  600: 'sexcentésimo',
  700: 'septingentésimo',
  800: 'octingentésimo',
  900: 'noningentésimo',
};

const MILESIMO = 'milésimo';

/**
 * Ordinal en masculino (terminado en -o) para un entero de 1 a 9999.
 * Compone centenas + decenas + unidades como palabras separadas.
 */
function ordinalMasculino(n: number): string {
  const partes: string[] = [];

  const miles = Math.floor(n / 1000);
  let resto = n % 1000;

  if (miles > 0) {
    // 1000 = milésimo; 2000 = dos milésimo; 3000 = tres milésimo, etc.
    // (multiplicativo de milésimo). Prefijo el cardinal-multiplicador simple.
    const MULT: Record<number, string> = {
      1: '',
      2: 'dos ',
      3: 'tres ',
      4: 'cuatro ',
      5: 'cinco ',
      6: 'seis ',
      7: 'siete ',
      8: 'ocho ',
      9: 'nueve ',
    };
    partes.push((MULT[miles] ?? '') + MILESIMO);
  }

  const centena = Math.floor(resto / 100) * 100;
  resto = resto % 100;
  if (centena > 0) partes.push(CENTENAS[centena]);

  if (resto >= 10) {
    const decena = Math.floor(resto / 10) * 10;
    const unidad = resto % 10;
    partes.push(DECENAS[decena]);
    if (unidad > 0) partes.push(UNIDADES[unidad]);
  } else if (resto > 0) {
    partes.push(UNIDADES[resto]);
  }

  return partes.join(' ');
}

/** Convierte cada palabra terminada en -o a -a (femenino). */
function aFemenino(texto: string): string {
  return texto.replace(/o(\b)/g, 'a$1');
}

export function numeroAOrdinal(inputs: NumeroAOrdinalInputs): NumeroAOrdinalOutputs {
  const raw = inputs.numero;
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim().replace(/\./g, '').replace(',', '.'));

  if (raw === '' || raw == null || Number.isNaN(num)) {
    throw new Error('Ingresá un número entero para convertirlo a ordinal.');
  }
  if (!Number.isInteger(num)) {
    throw new Error('El ordinal se calcula sobre un número entero (sin decimales).');
  }
  if (num < 1) {
    throw new Error('Los ordinales empiezan en 1 (primero). Ingresá un número entre 1 y 9999.');
  }
  if (num > 9999) {
    throw new Error('Esta calculadora convierte ordinales del 1 al 9999.');
  }

  const genero = inputs.genero === 'femenino' ? 'femenino' : 'masculino';

  const baseMasc = ordinalMasculino(num);
  let ordinal = genero === 'femenino' ? aFemenino(baseMasc) : baseMasc;
  // Mayúscula inicial para presentación.
  ordinal = ordinal.charAt(0).toUpperCase() + ordinal.slice(1);

  const simbolo = genero === 'femenino' ? 'ª' : 'º';
  const abreviado = `${num}${simbolo}`;

  const generoLabel = genero === 'femenino' ? 'femenino' : 'masculino';
  const narrativa = `El ordinal de ${num} en español (${generoLabel}) es "${ordinal.toLowerCase()}", que se abrevia ${abreviado}. Los ordinales compuestos se escriben en palabras separadas: por ejemplo, 21 es "vigésimo primero" (no "veintiunavo", que sería un partitivo).`;

  return {
    ordinal,
    abreviado,
    _insight: { type: 'highlight', icon: '🔢', text: narrativa },
    _table: {
      title: 'Cómo se forma este ordinal',
      headers: ['Componente', 'Valor'],
      rows: [
        ['Número cardinal', String(num)],
        ['Género', generoLabel],
        ['Ordinal en palabras', ordinal],
        ['Forma abreviada', abreviado],
      ],
      note: 'Los ordinales del español se componen por yuxtaposición de centena + decena + unidad como palabras separadas (RAE). No confundir con los partitivos o multiplicativos: "vigésimo primero" (orden) ≠ "un veintiunavo" (fracción).',
    },
  };
}
