/**
 * "Conversor de letras a número" — herramienta de texto/matemática.
 *
 * El usuario escribe un número EN LETRAS (español) y devolvemos su valor
 * NUMÉRICO. Es el reverso del conversor de número a letras. Ej:
 * "mil doscientos cincuenta" → 1250.
 *
 * No hay datos que caduquen → `dataUpdate.frequency` = never (sin source).
 *
 * El input llega como string desde el formulario (FormData). Normalizamos:
 * minúsculas, sin acentos, sin la conjunción "y" como palabra suelta, y
 * partimos por espacios. Después acumulamos con una máquina de estados que
 * maneja unidades/decenas/centenas y los multiplicadores "mil" y "millón".
 *
 * Soporta 0 hasta miles de millones (escala larga del español). Tolera acentos
 * ausentes ("dieciseis" = "dieciséis") y la "y" opcional.
 *
 * Devuelve outputs + _insight (resumen) + _table (desglose de la suma).
 */

export interface LetrasANumeroInputs {
  texto: string | number;
  __lang?: string;
}

export interface LetrasANumeroOutputs {
  numero: number;
  enPalabras: string;
  _insight?: any;
  _table?: any;
}

// Unidades y palabras irregulares del 0 al 29 (una sola palabra en español).
const UNIDADES: Record<string, number> = {
  cero: 0,
  uno: 1, un: 1, una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiuno: 21, veintiun: 21, veintiuna: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
};

// Decenas a partir de 30 (se unen con "y": treinta y uno).
const DECENAS: Record<string, number> = {
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
};

// Centenas. "cien" (100 exacto) y "ciento" (101-199) valen 100.
const CENTENAS: Record<string, number> = {
  cien: 100,
  ciento: 100,
  doscientos: 200, doscientas: 200,
  trescientos: 300, trescientas: 300,
  cuatrocientos: 400, cuatrocientas: 400,
  quinientos: 500, quinientas: 500,
  seiscientos: 600, seiscientas: 600,
  setecientos: 700, setecientas: 700,
  ochocientos: 800, ochocientas: 800,
  novecientos: 900, novecientas: 900,
};

// Multiplicadores de escala larga del español.
const MILES: Record<string, number> = {
  mil: 1000,
};
const MILLONES: Record<string, number> = {
  millon: 1000000,
  millones: 1000000,
};

// Palabras que ignoramos por sí solas (conectores).
const IGNORAR = new Set(['y', 'con', 'de']);

// Quita acentos/diacríticos y pasa a minúsculas para tolerar "dieciseis" etc.
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca tildes
    .replace(/[^a-zñ\s]/g, ' ') // saca puntuación/dígitos, deja letras y ñ
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte una lista de tokens (sin miles/millones) en un número 0-999.
 * Acumula centenas + decenas + unidades. Lanza error ante token desconocido.
 */
function grupoATres(tokens: string[]): number {
  let total = 0;
  for (const tok of tokens) {
    if (CENTENAS[tok] !== undefined) {
      total += CENTENAS[tok];
    } else if (DECENAS[tok] !== undefined) {
      total += DECENAS[tok];
    } else if (UNIDADES[tok] !== undefined) {
      total += UNIDADES[tok];
    } else {
      throw new Error(`No reconozco la palabra "${tok}". Escribí el número en letras, por ejemplo "mil doscientos cincuenta".`);
    }
  }
  return total;
}

export function letrasANumero(inputs: LetrasANumeroInputs): LetrasANumeroOutputs {
  const crudo = inputs.texto == null ? '' : String(inputs.texto);
  const limpio = normalizar(crudo);

  if (limpio === '') {
    throw new Error('Escribí un número en letras, por ejemplo "mil doscientos cincuenta".');
  }

  // Detectar signo negativo por la palabra "menos" al inicio.
  let negativo = false;
  let cuerpo = limpio;
  if (/^menos\b/.test(cuerpo)) {
    negativo = true;
    cuerpo = cuerpo.replace(/^menos\b/, '').trim();
    if (cuerpo === '') {
      throw new Error('Escribí el número después de "menos", por ejemplo "menos cuarenta y cinco".');
    }
  }

  // Tokenizar y descartar conectores (y, con, de).
  const tokens = cuerpo.split(' ').filter((t) => t && !IGNORAR.has(t));
  if (tokens.length === 0) {
    throw new Error('Escribí un número en letras, por ejemplo "mil doscientos cincuenta".');
  }

  // Caso especial "cero" solo.
  if (tokens.length === 1 && tokens[0] === 'cero') {
    return construirSalida(0, crudo);
  }

  // Máquina de estados de escala larga:
  //   - `resultado` acumula el total final ya multiplicado.
  //   - `bloqueMillones` acumula lo que va antes de "millón/millones".
  //   - `bloqueMiles` acumula lo que va antes de "mil".
  //   - `grupoActual` acumula los tokens 0-999 en curso.
  let resultado = 0;
  let bloqueMillones = 0;
  let grupoActual: string[] = [];

  const flushGrupo = (): number => {
    const v = grupoActual.length ? grupoATres(grupoActual) : 0;
    grupoActual = [];
    return v;
  };

  for (const tok of tokens) {
    if (MILLONES[tok] !== undefined) {
      // "millón/millones": cierra todo lo acumulado hasta acá (incluyendo miles).
      let coef = bloqueMillones + flushGrupo();
      if (coef === 0) coef = 1; // "un millón" cuando venía suelto → 1
      resultado += coef * MILLONES[tok];
      bloqueMillones = 0;
    } else if (MILES[tok] !== undefined) {
      // "mil": cierra el grupo actual como coeficiente de los miles.
      let coef = flushGrupo();
      if (coef === 0) coef = 1; // "mil" solo → 1000
      // Sumamos al bloque de millones porque puede haber "…millones … mil …".
      bloqueMillones += coef * MILES[tok];
    } else {
      grupoActual.push(tok);
    }
  }

  // Cerrar el último grupo pendiente (las centenas/decenas/unidades finales).
  resultado += bloqueMillones + flushGrupo();

  const valor = negativo ? -resultado : resultado;
  return construirSalida(valor, crudo);
}

// Arma outputs + insight + tabla con el desglose por escala.
function construirSalida(valor: number, textoOriginal: string): LetrasANumeroOutputs {
  const nf = (n: number) => n.toLocaleString('es-AR');
  const abs = Math.abs(valor);

  // Desglose por posiciones de escala larga para la tabla.
  const millones = Math.floor(abs / 1000000);
  const miles = Math.floor((abs % 1000000) / 1000);
  const resto = abs % 1000;

  const filas: (string | number)[][] = [];
  if (millones > 0) filas.push(['Millones', nf(millones), nf(millones * 1000000)]);
  if (miles > 0) filas.push(['Miles', nf(miles), nf(miles * 1000)]);
  filas.push(['Unidades', nf(resto), nf(resto)]);
  filas.push(['Total', '', (valor < 0 ? '−' : '') + nf(abs)]);

  const texto = `El número escrito en letras equivale a ${nf(valor)}.`;

  return {
    numero: valor,
    enPalabras: textoOriginal.trim(),
    _insight: { type: 'highlight', icon: '🔢', text: texto },
    _table: {
      title: 'Cómo se arma el número',
      headers: ['Escala', 'Cantidad', 'Aporta'],
      rows: filas,
      note: 'Se suman las centenas, decenas y unidades de cada grupo y se multiplican por su escala (mil, millón). La "y" y los conectores "con"/"de" se ignoran; los acentos son opcionales.',
    },
  };
}
