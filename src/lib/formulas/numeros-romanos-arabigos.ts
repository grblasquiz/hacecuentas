/**
 * "Números romanos ⇄ arábigos" — conversor bidireccional.
 *
 * El usuario ingresa un valor (dígitos o números romanos) y elige la dirección:
 *   - "auto"     → detecta: si son dígitos → a romano; si son letras romanas → a número.
 *   - "a-romano" → fuerza número → romano.
 *   - "a-numero" → fuerza romano → número.
 *
 * Rango estándar del sistema romano clásico: 1 a 3999 (sin notación de barras
 * para miles). Validamos rango y romanos mal formados ("IIII", "VV", "IC").
 *
 * No hay datos que caduquen → dataUpdate.frequency = never. TS puro, sin imports.
 * Input inválido → throw new Error('...').
 *
 * Devuelve outputs + _insight (resumen) + _table (desglose de la conversión).
 */

export interface RomanoInputs {
  valor: string | number;
  direccion?: string;
  __lang?: string;
}

export interface RomanoOutputs {
  resultado: string;
  tipoEntrada: string;
  valorArabigo: string;
  _insight?: any;
  _table?: any;
}

// Mapa de valores romanos, de mayor a menor, incluyendo las formas sustractivas
// (CM, CD, XC, XL, IX, IV). El algoritmo greedy recorre esta tabla en orden.
const MAPA: Array<[number, string]> = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

const VALOR_SIMBOLO: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const MIN = 1;
const MAX = 3999;

// Número → romano por resta sucesiva del mayor valor que entra (algoritmo greedy).
function aRomano(n: number): string {
  let resto = n;
  let out = '';
  for (const [valor, simbolo] of MAPA) {
    while (resto >= valor) {
      out += simbolo;
      resto -= valor;
    }
  }
  return out;
}

// Romano → número: suma los símbolos, restando cuando uno menor precede a uno
// mayor (IV = 4). Luego revalida re-generando el romano canónico: así rechazamos
// entradas mal formadas como "IIII", "VV", "IC" o "IL" (que producen el mismo
// número pero no son la escritura canónica).
function aNumero(romano: string): number {
  const s = romano.toUpperCase();
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const actual = VALOR_SIMBOLO[s[i]];
    if (actual === undefined) {
      throw new Error(`El carácter "${s[i]}" no es un número romano. Usá solo I, V, X, L, C, D, M.`);
    }
    const siguiente = i + 1 < s.length ? VALOR_SIMBOLO[s[i + 1]] : 0;
    if (actual < siguiente) {
      total -= actual;
    } else {
      total += actual;
    }
  }
  if (total < MIN || total > MAX) {
    throw new Error(`El número romano representa ${total}, fuera del rango estándar (1 a 3999).`);
  }
  // Revalidación canónica: si al regenerar no coincide, la escritura es inválida.
  if (aRomano(total) !== s) {
    throw new Error(`"${romano}" no es un número romano válido. La forma correcta de ${total} es ${aRomano(total)}.`);
  }
  return total;
}

export function numerosRomanosArabigos(inputs: RomanoInputs): RomanoOutputs {
  const raw = inputs.valor == null ? '' : String(inputs.valor).trim();
  if (raw === '') {
    throw new Error('Ingresá un número (por ejemplo 2026) o un número romano (por ejemplo MMXXVI).');
  }

  const direccion = inputs.direccion || 'auto';
  const soloDigitos = /^-?\d+$/.test(raw);
  const soloRomano = /^[IVXLCDMivxlcdm]+$/.test(raw);

  // Resolver la dirección efectiva.
  let modo: 'a-romano' | 'a-numero';
  if (direccion === 'a-romano') {
    modo = 'a-romano';
  } else if (direccion === 'a-numero') {
    modo = 'a-numero';
  } else {
    // auto: detectar por el contenido.
    if (soloDigitos) {
      modo = 'a-romano';
    } else if (soloRomano) {
      modo = 'a-numero';
    } else {
      throw new Error('No reconozco la entrada. Escribí solo dígitos (ej. 49) o solo letras romanas I V X L C D M (ej. XLIX).');
    }
  }

  let resultado: string;
  let tipoEntrada: string;
  let valorArabigo: number;
  let entradaMostrada: string;

  if (modo === 'a-romano') {
    if (!soloDigitos) {
      throw new Error(`"${raw}" no es un número entero. Para convertir a romano, ingresá dígitos (ej. 2026).`);
    }
    const n = parseInt(raw, 10);
    if (n < MIN || n > MAX) {
      throw new Error(`El sistema romano clásico va del 1 al 3999. ${n} está fuera de ese rango.`);
    }
    resultado = aRomano(n);
    tipoEntrada = 'Número arábigo → romano';
    valorArabigo = n;
    entradaMostrada = String(n);
  } else {
    if (!soloRomano) {
      throw new Error(`"${raw}" tiene caracteres que no son romanos. Usá solo I, V, X, L, C, D, M.`);
    }
    valorArabigo = aNumero(raw);
    resultado = String(valorArabigo);
    tipoEntrada = 'Número romano → arábigo';
    entradaMostrada = raw.toUpperCase();
  }

  const nf = (x: number) => x.toLocaleString('es-AR');

  // Insight: resumen humano de la conversión.
  let narrativa: string;
  if (modo === 'a-romano') {
    narrativa = `El número ${nf(valorArabigo)} se escribe ${resultado} en números romanos.`;
  } else {
    narrativa = `El número romano ${entradaMostrada} equivale a ${nf(valorArabigo)} en el sistema arábigo (el que usamos a diario).`;
  }
  if (valorArabigo >= 1000) {
    const miles = Math.floor(valorArabigo / 1000);
    narrativa += ` Recordá que cada M vale 1000; acá hay ${miles} ${miles === 1 ? 'unidad' : 'unidades'} de mil.`;
  }

  // Tabla: desglose de cómo se arma el resultado (símbolo a símbolo).
  const romanoCanonico = aRomano(valorArabigo);
  const desglose: string[][] = [];
  let resto = valorArabigo;
  for (const [valor, simbolo] of MAPA) {
    let cuenta = 0;
    while (resto >= valor) {
      cuenta++;
      resto -= valor;
    }
    if (cuenta > 0) {
      desglose.push([simbolo.repeat(cuenta), nf(valor * cuenta), `${cuenta} × ${nf(valor)}`]);
    }
  }

  return {
    resultado,
    tipoEntrada,
    valorArabigo: nf(valorArabigo),
    _insight: { type: 'highlight', icon: '🏛️', text: narrativa },
    _table: {
      title: `Cómo se arma ${romanoCanonico}`,
      headers: ['Símbolos', 'Valor', 'Cálculo'],
      rows: desglose,
      note: 'Los números romanos se leen sumando los símbolos de izquierda a derecha; cuando un símbolo menor va antes de uno mayor, se resta (IV = 5 − 1 = 4). El sistema clásico llega hasta 3999 (MMMCMXCIX).',
    },
  };
}
