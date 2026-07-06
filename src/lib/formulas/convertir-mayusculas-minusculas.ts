/**
 * "Convertir mayúsculas / minúsculas" — herramienta de texto.
 *
 * El usuario pega un texto y elige un modo de transformación:
 *  - mayusculas → TODO EN MAYÚSCULAS
 *  - minusculas → todo en minúsculas
 *  - titulo     → Primera Letra De Cada Palabra En Mayúscula (Tipo Título)
 *  - oracion    → Primera letra de cada oración en mayúscula (Tipo oración)
 *
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source/sourceUrl).
 *
 * El input llega como string desde el formulario (FormData). OJO: el runtime de
 * Calculator convierte a número cualquier valor que parsee como número (ej. si
 * el usuario pega sólo "123"), así que coercionamos a String defensivamente.
 *
 * Se usa toLocaleUpperCase/LowerCase('es') para respetar acentos y la ñ.
 *
 * Devuelve el output `resultado` + _insight (resumen) + _table (las 4 versiones).
 */

export interface MayusMinusInputs {
  texto: string | number;
  modo?: string;
  __lang?: string;
}

export interface MayusMinusOutputs {
  resultado: string;
  _insight?: any;
  _table?: any;
}

const LOCALE = 'es';

function aMayusculas(texto: string): string {
  return texto.toLocaleUpperCase(LOCALE);
}

function aMinusculas(texto: string): string {
  return texto.toLocaleLowerCase(LOCALE);
}

// Tipo Título: primera letra de cada palabra en mayúscula, el resto en minúscula.
// Una "palabra" es una secuencia de caracteres separada por espacios en blanco.
// Preservamos el whitespace original (espacios, tabs, saltos de línea) para no
// alterar el formato del texto.
function aTipoTitulo(texto: string): string {
  return texto
    .toLocaleLowerCase(LOCALE)
    .replace(/([^\s]+)/g, (palabra) => {
      const primera = palabra.charAt(0).toLocaleUpperCase(LOCALE);
      return primera + palabra.slice(1);
    });
}

// Tipo oración: primera letra de cada oración en mayúscula, el resto en minúscula.
// Una oración empieza al principio del texto o después de un signo de cierre
// (. ! ? …) seguido de espacios. Primero pasamos todo a minúscula y luego
// capitalizamos la primera letra "de verdad" (letra, no signo) de cada oración.
function aTipoOracion(texto: string): string {
  const base = texto.toLocaleLowerCase(LOCALE);
  let resultado = '';
  let empezarOracion = true;
  for (const ch of base) {
    if (empezarOracion && /[\p{L}\p{N}]/u.test(ch)) {
      resultado += ch.toLocaleUpperCase(LOCALE);
      empezarOracion = false;
    } else {
      resultado += ch;
      if (/[.!?…]/.test(ch)) {
        empezarOracion = true;
      }
    }
  }
  return resultado;
}

export function convertirMayusculasMinusculas(inputs: MayusMinusInputs): MayusMinusOutputs {
  // Coerción defensiva: el input puede llegar como number si el usuario pegó
  // sólo dígitos. Normalizamos a string sin recortar (los espacios importan).
  const texto = inputs.texto == null ? '' : String(inputs.texto);
  const modo = (inputs.modo == null ? 'mayusculas' : String(inputs.modo)).trim().toLowerCase();

  const MODOS: Record<string, { label: string; fn: (t: string) => string }> = {
    mayusculas: { label: 'MAYÚSCULAS', fn: aMayusculas },
    minusculas: { label: 'minúsculas', fn: aMinusculas },
    titulo: { label: 'Tipo Título', fn: aTipoTitulo },
    oracion: { label: 'Tipo oración', fn: aTipoOracion },
  };

  if (!MODOS[modo]) {
    throw new Error(
      `Modo inválido: "${modo}". Usá uno de: mayusculas, minusculas, titulo, oracion.`
    );
  }

  const mayusculas = aMayusculas(texto);
  const minusculas = aMinusculas(texto);
  const titulo = aTipoTitulo(texto);
  const oracion = aTipoOracion(texto);

  const versiones: Record<string, string> = {
    mayusculas,
    minusculas,
    titulo,
    oracion,
  };

  const resultado = versiones[modo];

  // Insight: mensaje de ayuda si está vacío, o resumen de la transformación.
  let narrativa: string;
  if (texto.trim() === '') {
    narrativa =
      'Pegá o escribí un texto arriba y elegí el modo (MAYÚSCULAS, minúsculas, Tipo Título o Tipo oración). Convertimos todo al instante y respetamos los acentos y la ñ.';
  } else {
    narrativa = `Convertimos tu texto a ${MODOS[modo].label}. Respetamos los acentos y la ñ (por ejemplo "ñoño" → "ÑOÑO", "él" → "ÉL"). Podés cambiar el modo arriba para ver las otras versiones, o copiar el resultado con un clic.`;
  }

  return {
    resultado,
    _insight: { type: 'highlight', icon: '🔠', text: narrativa },
    _table: {
      title: 'Tu texto en las 4 transformaciones',
      headers: ['Modo', 'Resultado'],
      rows: [
        ['MAYÚSCULAS', mayusculas],
        ['minúsculas', minusculas],
        ['Tipo Título', titulo],
        ['Tipo oración', oracion],
      ],
      note: 'MAYÚSCULAS: todas las letras en mayúscula. minúsculas: todas en minúscula. Tipo Título: la primera letra de cada palabra en mayúscula. Tipo oración: la primera letra de cada oración (después de . ! ? …) en mayúscula. Se respetan los acentos y la ñ usando las reglas del español.',
    },
  };
}
