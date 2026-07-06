/**
 * "Generador de contraseñas seguras" — herramienta de seguridad.
 *
 * El usuario elige una longitud y qué tipos de caracteres usar (mayúsculas,
 * minúsculas, números y símbolos) y devolvemos una contraseña aleatoria más una
 * estimación de fortaleza. No hay datos que caduquen → `dataUpdate.frequency` =
 * never (sin source/sourceUrl).
 *
 * Corre en el browser, así que usamos Math.random(). Los selects llegan como
 * string ("si"/"no"); la longitud puede llegar como string o number desde el
 * formulario, así que la coercionamos defensivamente.
 *
 * Devuelve outputs + _insight (fortaleza + buenas prácticas) + _table (desglose).
 */

export interface GeneradorContrasenasInputs {
  longitud: string | number;
  mayusculas: string;
  minusculas: string;
  numeros: string;
  simbolos: string;
  __lang?: string;
}

export interface GeneradorContrasenasOutputs {
  contrasena: string;
  fortaleza: string;
  _insight?: any;
  _table?: any;
}

const POOL_MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const POOL_MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
const POOL_NUMEROS = '0123456789';
const POOL_SIMBOLOS = '!@#$%&*?-_+=';

const LONGITUD_MIN = 4;
const LONGITUD_MAX = 64;

// "si" (con o sin tilde), "sí", "true", "1", "on" → activado. Cualquier otra
// cosa → desactivado. Defensivo ante variaciones del select.
function esSi(v: string): boolean {
  const s = String(v == null ? '' : v).trim().toLowerCase();
  return s === 'si' || s === 'sí' || s === 'true' || s === '1' || s === 'on';
}

// Índice aleatorio 0..(max-1) usando Math.random (corre en el browser).
function indiceAleatorio(max: number): number {
  return Math.floor(Math.random() * max);
}

// Fisher–Yates para mezclar el array de caracteres y no dejar los caracteres
// obligatorios siempre al principio.
function mezclar(arr: string[]): string[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = indiceAleatorio(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function generadorContrasenas(
  inputs: GeneradorContrasenasInputs
): GeneradorContrasenasOutputs {
  // Coerción y validación de la longitud.
  const longitudNum = Math.trunc(Number(inputs.longitud));
  if (!Number.isFinite(longitudNum)) {
    throw new Error('La longitud tiene que ser un número.');
  }
  if (longitudNum < LONGITUD_MIN || longitudNum > LONGITUD_MAX) {
    throw new Error(`La longitud tiene que estar entre ${LONGITUD_MIN} y ${LONGITUD_MAX} caracteres.`);
  }

  // Qué tipos de caracteres se incluyen.
  const usaMayus = esSi(inputs.mayusculas);
  const usaMinus = esSi(inputs.minusculas);
  const usaNumeros = esSi(inputs.numeros);
  const usaSimbolos = esSi(inputs.simbolos);

  // Al menos un tipo de caracter tiene que estar activo.
  const pools: string[] = [];
  if (usaMayus) pools.push(POOL_MAYUSCULAS);
  if (usaMinus) pools.push(POOL_MINUSCULAS);
  if (usaNumeros) pools.push(POOL_NUMEROS);
  if (usaSimbolos) pools.push(POOL_SIMBOLOS);

  if (pools.length === 0) {
    throw new Error('Elegí al menos un tipo de caracter (mayúsculas, minúsculas, números o símbolos).');
  }

  const poolCompleto = pools.join('');
  const cantidadTipos = pools.length;

  // Construcción: primero garantizamos al menos un caracter de cada tipo elegido
  // (si la longitud lo permite), después completamos con el pool entero y
  // mezclamos para que no queden los obligatorios siempre al principio.
  const caracteres: string[] = [];
  const obligatorios = Math.min(cantidadTipos, longitudNum);
  for (let i = 0; i < obligatorios; i++) {
    const pool = pools[i];
    caracteres.push(pool.charAt(indiceAleatorio(pool.length)));
  }
  for (let i = caracteres.length; i < longitudNum; i++) {
    caracteres.push(poolCompleto.charAt(indiceAleatorio(poolCompleto.length)));
  }
  const contrasena = mezclar(caracteres).join('');

  // Estimación de fortaleza por entropía aproximada: log2(pool^longitud), que es
  // longitud * log2(tamañoDelPool). Es la métrica estándar en bits.
  const bitsEntropia = longitudNum * (Math.log(poolCompleto.length) / Math.log(2));
  const bits = Math.round(bitsEntropia);

  let fortaleza: string;
  if (bits < 40) {
    fortaleza = 'Débil';
  } else if (bits < 60) {
    fortaleza = 'Media';
  } else if (bits < 80) {
    fortaleza = 'Fuerte';
  } else {
    fortaleza = 'Muy fuerte';
  }

  const nf = (n: number) => n.toLocaleString('es-AR');

  // Insight: fortaleza + buenas prácticas.
  const tiposTexto: string[] = [];
  if (usaMayus) tiposTexto.push('mayúsculas');
  if (usaMinus) tiposTexto.push('minúsculas');
  if (usaNumeros) tiposTexto.push('números');
  if (usaSimbolos) tiposTexto.push('símbolos');
  const tiposLista =
    tiposTexto.length === 1
      ? tiposTexto[0]
      : tiposTexto.slice(0, -1).join(', ') + ' y ' + tiposTexto[tiposTexto.length - 1];

  let recomendacion: string;
  if (bits < 40) {
    recomendacion = 'Es poco segura: subí la longitud a 16 o más caracteres y sumá más tipos de caracteres.';
  } else if (bits < 60) {
    recomendacion = 'Aceptable, pero para cuentas importantes conviene llegar a 16+ caracteres con los cuatro tipos activos.';
  } else if (bits < 80) {
    recomendacion = 'Es una buena contraseña, difícil de adivinar por fuerza bruta.';
  } else {
    recomendacion = 'Excelente: prácticamente imposible de romper por fuerza bruta con la tecnología actual.';
  }

  const narrativa = `Contraseña de ${nf(longitudNum)} caracteres con ${tiposLista} (${nf(poolCompleto.length)} caracteres posibles por posición). Fortaleza estimada: ${fortaleza}, ~${nf(bits)} bits de entropía. ${recomendacion} Consejos: no la reutilices entre sitios, guardala en un gestor de contraseñas y activá la verificación en dos pasos (2FA) donde puedas.`;

  return {
    contrasena,
    fortaleza,
    _insight: { type: 'highlight', icon: '🔒', text: narrativa },
    _table: {
      title: 'Cómo se armó la contraseña',
      headers: ['Parámetro', 'Valor'],
      rows: [
        ['Longitud', `${nf(longitudNum)} caracteres`],
        ['Tipos de caracteres', tiposLista],
        ['Caracteres posibles por posición', nf(poolCompleto.length)],
        ['Entropía estimada', `~${nf(bits)} bits`],
        ['Fortaleza', fortaleza],
      ],
      note: 'La entropía se estima como longitud × log₂(tamaño del pool). A más bits, más combinaciones posibles y más difícil de adivinar. La contraseña se genera en tu navegador y no se envía ni se guarda en ningún servidor.',
    },
  };
}
