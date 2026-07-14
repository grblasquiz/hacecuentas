/**
 * Número → letras (reglas RAE, escala larga española).
 *
 * JS PURO a propósito: el componente flagship lo inyecta con ?raw dentro de un
 * <script is:inline> (los <script> hoisted de componentes nuevos 404ean en dev y
 * dejan la calc inerte). Si esto vuelve a .ts, el inline deja de compilar.
 *
 * Extraído de src/lib/formulas/conversor-numero-a-letras-cantidad.ts para poder
 * reusar la MISMA lógica desde el componente flagship (SSR + cliente) sin
 * duplicarla. La fórmula sigue siendo la dueña del contrato de la calc; acá
 * viven solo las funciones puras.
 */

export const MONEDAS = {
  ARS: { singular: 'peso argentino', plural: 'pesos argentinos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  MXN: { singular: 'peso mexicano', plural: 'pesos mexicanos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  COP: { singular: 'peso colombiano', plural: 'pesos colombianos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  CLP: { singular: 'peso chileno', plural: 'pesos chilenos', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  USD: { singular: 'dólar estadounidense', plural: 'dólares estadounidenses', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'US$' },
  EUR: { singular: 'euro', plural: 'euros', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: '€' },
  PEN: { singular: 'sol', plural: 'soles', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: 'S/' },
  UYU: { singular: 'peso uruguayo', plural: 'pesos uruguayos', centSingular: 'centésimo', centPlural: 'centésimos', simbolo: '$U' },
  VES: { singular: 'bolívar', plural: 'bolívares', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: 'Bs.' },
  DOP: { singular: 'peso dominicano', plural: 'pesos dominicanos', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'RD$' },
  BRL: { singular: 'real brasileño', plural: 'reales brasileños', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'R$' },
};

const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];

const DECENAS = [
  '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa',
];

const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

/** Convierte 0..999 a letras. apocope = true → "uno" se vuelve "un" al final (un mil, un millón). */
export function tresDigitos(n, apocope) {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  let centena = '';
  const resto = n % 100;
  const c = Math.floor(n / 100);
  if (c > 0) centena = CENTENAS[c];

  let bajo = '';
  if (resto === 0) {
    bajo = '';
  } else if (resto < 30) {
    bajo = UNIDADES[resto];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    bajo = DECENAS[d];
    if (u > 0) bajo += ' y ' + UNIDADES[u];
  }

  // Apócope: "uno" → "un", "veintiuno" → "veintiún"
  if (apocope) {
    bajo = bajo.replace(/\bveintiuno\b/, 'veintiún').replace(/\buno\b/, 'un');
  }

  if (centena && bajo) return centena + ' ' + bajo;
  return centena || bajo;
}

/** Convierte 0..999999 a letras (maneja el "mil" interno). */
export function grupoSeisCifras(n, apocopeFinal) {
  if (n === 0) return '';
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;

  let out = '';

  if (miles > 0) {
    if (miles === 1) {
      out = 'mil';
    } else {
      // "dos mil", "veintiún mil", "ciento un mil" → la parte de miles va apocopada.
      out = tresDigitos(miles, true) + ' mil';
    }
  }

  if (resto > 0) {
    const restoTxt = tresDigitos(resto, apocopeFinal);
    out = out ? out + ' ' + restoTxt : restoTxt;
  }

  return out.trim();
}

/**
 * Convierte un entero no negativo a letras usando escala larga española.
 * Grupos de 6 cifras: unidades, millones, billones, trillones...
 * apocopeFinal = true → un "uno"/"veintiuno" al final se apocopa a "un"/"veintiún"
 * (necesario cuando precede a un sustantivo masculino: "un peso").
 */
export function enteroALetras(num, apocopeFinal = false) {
  if (num === 0) return 'cero';

  // Nombres de los grupos de millón (escala larga): 10^0, 10^6, 10^12, 10^18...
  const ESCALAS = ['', 'millón', 'billón', 'trillón'];
  const ESCALAS_PL = ['', 'millones', 'billones', 'trillones'];

  const grupos = [];
  let n = num;
  while (n > 0) {
    grupos.push(n % 1000000);
    n = Math.floor(n / 1000000);
  }

  const partes = [];

  for (let g = grupos.length - 1; g >= 0; g--) {
    const valor = grupos[g];
    if (valor === 0) continue;

    if (g === 0) {
      partes.push(grupoSeisCifras(valor, apocopeFinal));
    } else {
      // "un millón", "veintiún millones", "dos millones"
      const texto = grupoSeisCifras(valor, true);
      if (valor === 1) {
        partes.push('un ' + ESCALAS[g]);
      } else {
        partes.push(texto + ' ' + ESCALAS_PL[g]);
      }
    }
  }

  return partes.join(' ').replace(/\s+/g, ' ').trim();
}

/** Pasa la primera letra a mayúscula. */
export function capitalizar(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * RAE: cuando la cifra termina en "millón/millones/billón…" y le sigue un
 * sustantivo, se intercala "de" (un millón DE pesos). No aplica si después del
 * millón hay más cifras (un millón doscientos mil pesos).
 */
export function terminaEnEscala(letras) {
  return /\b(mill(?:ón|ones)|bill(?:ón|ones)|trill(?:ón|ones))$/.test(letras);
}

/** Importe completo en letras estilo factura: "mil doscientos pesos … con 50 centavos". */
export function importeEnLetras(entero, centavos, moneda) {
  const letras = enteroALetras(entero, true);
  const conector = terminaEnEscala(letras) ? 'de ' : '';
  const unidad = entero === 1 ? moneda.singular : moneda.plural;
  const centWord = centavos === 1 ? moneda.centSingular : moneda.centPlural;
  return `${letras} ${conector}${unidad} con ${centavos} ${centWord}`;
}

/** Redondeo a centavos y split entero/centavos (con carry si redondea a 100). */
export function splitImporte(valor) {
  const abs = Math.abs(valor);
  let entero = Math.floor(abs);
  let centavos = Math.round((abs - entero) * 100);
  if (centavos === 100) { entero += 1; centavos = 0; }
  return { entero, centavos };
}
