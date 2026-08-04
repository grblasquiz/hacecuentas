import type { HubData } from './types';

/**
 * Hub de decisión — "Pasar números a letras, romanos y binario"
 * Arquetipo: RAMIFICADO (4 ramas). Absorbe 4 conversores sueltos (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - FORMATO: acá NADA es plata. El runtime hace `Object.assign` sobre el
 *    formato base y una fila SIN `format` propio cae en 'ars' (te pone "$"
 *    delante de un dígito binario). Por eso el resultado declara
 *    `format: 'plain'` y ADEMÁS cada fila del desglose declara el suyo.
 *  - GRÁFICO: `bars`. Este hub no tiene magnitudes que graficar, así que las
 *    barras muestran la DESCOMPOSICIÓN por escala del número (millones, miles,
 *    unidades, centavos) — que es exactamente el orden en que se lee en voz
 *    alta y se escribe en un cheque. En la rama de bases, las barras son las
 *    potencias de 2 activas. Aporta poco en la rama de romanos (ahí el desglose
 *    de la tabla es más claro que la barra), pero no molesta.
 *  - El `total` del panel es TEXTO (la frase legal del cheque, el romano, el
 *    binario), no un número: el runtime lo pinta tal cual y el CSS lo achica
 *    con `--amount-len`.
 */
export const hub: HubData = {
  slug: 'conversores/numeros-a-letras',
  title: 'Números a letras: conversor para cheques y pagarés',
  description:
    'Convertí números a letras para cheques y pagarés, con centavos y formato listo para copiar. También admite letras a número, romanos y binario.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Conversor de números',
  h1: 'Conversor de números a letras',
  lede:
    'Escribí lo que tengas —un número, un texto en letras o un romano— y elegí a qué lo querés pasar. La rama por defecto es la que casi todos buscan: cómo se escribe un importe en un cheque o un pagaré, con los centavos incluidos.',
  stamps: ['Actualizado 27-07-2026', 'Reglas de la RAE · escala larga', '4 conversores adentro'],

  resultLabel: 'Cómo se escribe',

  cases: {
    title: '¿Qué necesitás convertir?',
    intro: 'Arrancamos por el caso más buscado. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'cheque',
        label: 'Un importe para un cheque o pagaré',
        hint: 'El caso más común',
        answer: 'En un cheque el importe va en mayúsculas y los centavos como NN/100.',
        yes: [
          'La línea del cheque se escribe "SON PESOS <importe en letras> CON NN/100"',
          'Los centavos NUNCA van en letras en un cheque: van como fracción sobre 100 (50/100)',
          'Si no hay centavos igual se escribe 00/100, para que nadie pueda agregar cifras después',
          'Si la cifra en números y la cifra en letras no coinciden, el banco paga lo escrito en LETRAS (art. 6 del decreto ley 5965/63)',
          'Delante de "millón/millones" y antes del sustantivo va "de": un millón DE pesos',
        ],
        warn: [
          'Antes del sustantivo, "uno" se apocopa: se escribe "veintiún pesos", no "veintiuno pesos"',
          'No dejes espacios en blanco entre el último número y la palabra "pesos": se completa con una raya',
          'En un pagaré el importe en letras es requisito de validez; sin él el documento se puede impugnar',
          'El cheque se llena en mayúsculas de imprenta: los bancos rechazan la letra cursiva ilegible',
        ],
        plazo:
          'un cheque común se presenta al cobro dentro de los 30 días de la fecha de libramiento; el de pago diferido, 30 días desde la fecha de pago.',
      },
      {
        id: 'letras-a-numero',
        label: 'Tengo el texto en letras y quiero el número',
        hint: 'El camino inverso',
        answer: 'Cada grupo (centenas + decenas + unidades) se multiplica por su escala y se suman.',
        yes: [
          'Escribí el texto tal cual: "mil doscientos cincuenta" → 1.250',
          'La "y" y los conectores "con" y "de" se ignoran: no aportan valor',
          'Los acentos son opcionales: "dieciseis" y "dieciséis" valen lo mismo',
          '"menos" al principio te devuelve un número negativo',
          'Funciona con escala larga: millones, y también miles dentro de los millones',
        ],
        warn: [
          '"mil" solo vale 1.000: no se dice "un mil" en español',
          'Cuidado con "billón": en español son un millón de millones (10¹²), en inglés son mil millones (10⁹)',
          'Una palabra mal escrita corta la cuenta: revisá que no haya erratas',
        ],
        plazo: 'las reglas de escritura de números de la RAE no tienen fecha de vencimiento.',
      },
      {
        id: 'romanos',
        label: 'Números romanos',
        hint: 'De 1 a 3999',
        answer: 'Los símbolos se suman de izquierda a derecha; si uno menor precede a uno mayor, se resta.',
        yes: [
          'Los siete símbolos son I=1, V=5, X=10, L=50, C=100, D=500 y M=1000',
          'Funciona en los dos sentidos: escribí 2026 y te da MMXXVI, o escribí MMXXVI y te da 2026',
          'Las formas sustractivas válidas son sólo seis: IV, IX, XL, XC, CD y CM',
          'El rango del sistema clásico va de 1 a 3999 (MMMCMXCIX)',
        ],
        warn: [
          'I, X, C y M se repiten hasta tres veces; V, L y D no se repiten nunca',
          '"IIII" no es válido: cuatro se escribe IV (aunque muchos relojes usen IIII por tradición)',
          '"IC" tampoco existe: 99 es XCIX, porque sólo se resta el símbolo inmediatamente anterior de la misma familia',
          'No hay símbolo para el cero ni para los decimales',
        ],
        plazo: 'sistema cerrado desde la Antigüedad: no cambia.',
      },
      {
        id: 'bases',
        label: 'Decimal, binario y hexadecimal',
        hint: 'También octal',
        answer: 'Cada posición vale la base elevada a su lugar; el decimal es el puente entre todas.',
        yes: [
          'Elegí la base de origen y la de destino y el resto sale solo',
          'En binario cada posición vale una potencia de 2: 1011 = 8 + 2 + 1 = 11',
          'El hexadecimal usa 0-9 y A-F, donde A=10 y F=15: cada dígito hex son exactamente 4 bits',
          'Podés pegar prefijos: 0b1011, 0o17 y 0xFF se entienden igual',
        ],
        warn: [
          'Sólo enteros: las fracciones binarias no entran acá',
          'Por encima de 9.007.199.254.740.991 (2⁵³−1) la conversión pierde exactitud',
          'Un dígito fuera de la base es un error, no un cero: en binario sólo hay 0 y 1',
        ],
        plazo: 'las bases posicionales son matemática pura: no se actualizan.',
      },
    ],
  },

  inputsTitle: 'Qué querés convertir',
  inputsIntro:
    'Escribí el valor en el primer campo. La moneda sólo se usa para el cheque y las bases sólo para la última rama.',
  fields: [
    // OJO: `text` a propósito. Un `number` no acepta ni "MMXXVI" ni "mil
    // doscientos" ni "0xFF", y el parser del runtime le comería la coma decimal.
    {
      id: 'entrada',
      label: 'Número, texto en letras o número romano',
      value: '1250,50',
      help: 'Ejemplos: 1250,50 · mil doscientos cincuenta · MCCL · 1011',
    },
    {
      id: 'moneda',
      label: 'Moneda del cheque o pagaré',
      type: 'select',
      value: 'ARS',
      options: [
        { value: 'ARS', label: 'Pesos argentinos ($)' },
        { value: 'USD', label: 'Dólares estadounidenses (US$)' },
        { value: 'EUR', label: 'Euros (€)' },
        { value: 'UYU', label: 'Pesos uruguayos ($U)' },
        { value: 'MXN', label: 'Pesos mexicanos ($)' },
        { value: 'COP', label: 'Pesos colombianos ($)' },
        { value: 'CLP', label: 'Pesos chilenos ($)' },
        { value: 'PEN', label: 'Soles (S/)' },
      ],
    },
    {
      id: 'baseOrigen',
      label: 'Base de origen (sólo decimal / binario / hexadecimal)',
      type: 'select',
      value: 'decimal',
      options: [
        { value: 'decimal', label: 'Decimal (base 10)' },
        { value: 'binario', label: 'Binario (base 2)' },
        { value: 'octal', label: 'Octal (base 8)' },
        { value: 'hexadecimal', label: 'Hexadecimal (base 16)' },
      ],
    },
    {
      id: 'baseDestino',
      label: 'Base de destino',
      type: 'select',
      value: 'binario',
      options: [
        { value: 'decimal', label: 'Decimal (base 10)' },
        { value: 'binario', label: 'Binario (base 2)' },
        { value: 'octal', label: 'Octal (base 8)' },
        { value: 'hexadecimal', label: 'Hexadecimal (base 16)' },
      ],
    },
  ],
  fineprint:
    'La escritura en letras sigue las reglas de la RAE (escala larga: un billón son un millón de millones). El formato de cheque es el uso bancario argentino; si tu banco pide otra redacción, respetá la de tu chequera.',

  chart: {
    type: 'bars',
    title: 'Cómo se descompone el número',
    caption:
      'Cada barra es un bloque de la lectura en voz alta: millones, miles, unidades y centavos. Se lee de izquierda a derecha en ese mismo orden, y así es como hay que escribirlo en el cheque. En la rama de bases las barras son las potencias activas (los "1" del binario) y en la de romanos, cuánto aporta cada símbolo.',
  },
  breakdownTitle: 'El desglose, bloque por bloque',
  breakdownIntro:
    'Los valores son cantidades, no importes: acá no hay pesos. Las barras comparan cuánto aporta cada bloque al número final.',

  faq: [
    {
      q: '¿Cómo se escribe un importe en un cheque?',
      a: 'En mayúsculas de imprenta, con la fórmula "SON PESOS <importe en letras> CON NN/100". Por ejemplo, $1.250,50 se escribe SON PESOS MIL DOSCIENTOS CINCUENTA CON 50/100. Los centavos van siempre como fracción sobre cien, nunca en letras, y aunque sean cero se escribe 00/100 para que nadie pueda agregar cifras después. El espacio sobrante se tacha con una raya.',
    },
    {
      q: '¿Qué pasa si el número y las letras del cheque no coinciden?',
      a: 'Manda lo escrito en letras. El decreto ley 5965/63, aplicable al cheque por la ley 24.452, resuelve la discordancia a favor del importe expresado en palabras, y si hay varias cifras en letras que difieren, vale la menor. Por eso la línea en letras no es un adorno: es la que define cuánto se paga.',
    },
    {
      q: '¿Cómo se escriben los centavos en un cheque o un pagaré?',
      a: 'Como fracción sobre cien y en números: 50/100, 05/100, 00/100. Se escriben con dos dígitos siempre. En un pagaré o en un contrato, en cambio, es habitual escribirlos también en letras ("con cincuenta centavos") y repetir la cifra entre paréntesis. Si el importe tiene más de dos decimales, se redondea a centavos antes de escribirlo.',
    },
    {
      q: '¿Se dice "veintiuno pesos" o "veintiún pesos"?',
      a: '"Veintiún pesos". Delante de un sustantivo masculino, "uno" y "veintiuno" se apocopan y pierden la o final: un peso, veintiún pesos, treinta y un pesos. Es el error más frecuente al llenar un cheque a mano. Con sustantivo femenino la forma es "una" y "veintiuna".',
    },
    {
      q: '¿Cuándo se escribe "de" después de millón?',
      a: 'Cuando la cifra termina exactamente en millón o millones y le sigue el sustantivo: "un millón DE pesos", "dos millones DE pesos". Si después del millón hay más cifras, el "de" desaparece: "un millón doscientos mil pesos". Lo mismo vale para billón y trillón.',
    },
    {
      q: '¿Cómo paso un número a números romanos?',
      a: 'Se descompone el número y se reemplaza cada bloque por sus símbolos, de mayor a menor: 2026 = MM (2000) + XX (20) + VI (6) = MMXXVI. Los símbolos I, X, C y M se repiten hasta tres veces; V, L y D no se repiten. Y sólo existen seis restas válidas: IV, IX, XL, XC, CD y CM. El sistema clásico llega hasta 3999 (MMMCMXCIX).',
    },
    {
      q: '¿Por qué "IIII" o "IC" no son números romanos válidos?',
      a: 'Porque el sistema no permite repetir un símbolo más de tres veces —cuatro es IV, no IIII— ni restar cualquier símbolo de cualquier otro. Sólo I se resta de V y X, X se resta de L y C, y C se resta de D y M. Por eso 99 es XCIX (90 + 9) y no IC. Muchos relojes escriben IIII por tradición estética, pero es una licencia, no la forma canónica.',
    },
    {
      q: '¿Cómo convierto un número decimal a binario?',
      a: 'Se divide sucesivamente por 2 y se leen los restos de abajo hacia arriba, o —más rápido de entender— se buscan las potencias de 2 que suman el número: 11 = 8 + 2 + 1, así que en binario es 1011. Cada posición del binario vale el doble que la de su derecha: 1, 2, 4, 8, 16, 32…',
    },
    {
      q: '¿Cuál es la relación entre binario y hexadecimal?',
      a: 'Cada dígito hexadecimal equivale a exactamente cuatro bits, porque 16 = 2⁴. Por eso FF en hexadecimal es 11111111 en binario y 255 en decimal, y por eso los colores web se escriben en hex: #FF0000 son tres bytes. Para pasar de binario a hex se agrupa de a cuatro bits desde la derecha.',
    },
    {
      q: '¿Un billón es lo mismo en español que en inglés?',
      a: 'No, y confundirlos cuesta caro. En español usamos escala larga: un billón es un millón de millones, 10¹². En inglés estadounidense, "billion" son mil millones, 10⁹, que en español se dice justamente "mil millones" o "millardo". Al traducir cifras de balances o de prensa financiera conviene chequear siempre cuál de las dos escalas usa la fuente.',
    },
    {
      q: '¿Se puede escribir cualquier número en letras, por grande que sea?',
      a: 'En la práctica hasta un trillón (10¹⁸), que es donde la escala larga del español todavía tiene nombre corriente: millón, billón, trillón. Más arriba el texto deja de ser legible y para un documento conviene escribir la cifra con separadores de miles y aclarar la unidad. Para importes de cheque el límite real lo pone la chequera, no el idioma.',
    },
  ],

  sources: [
    {
      name: 'Diccionario panhispánico de dudas — "números" (escritura de cifras en letras, apócope y uso de "de" tras millón)',
      url: 'https://www.rae.es/dpd/n%C3%BAmeros',
      publisher: 'Real Academia Española',
    },
    {
      name: 'Ortografía de la lengua española — capítulo sobre la expresión de las cantidades',
      url: 'https://www.rae.es/obras-academicas/ortografia/ortografia-2010',
      publisher: 'Real Academia Española / ASALE',
      date: '2010',
    },
    {
      name: 'Ley 24.452 de Cheques (texto ordenado vigente)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25579/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Decreto ley 5965/63 — Letra de cambio y pagaré (art. 6: prevalece el importe en letras)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/45000-49999/49559/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Cheques — reglamentación y requisitos formales (OPASI)',
      url: 'https://www.bcra.gob.ar/Pdfs/Texord/t-cheque.pdf',
      publisher: 'Banco Central de la República Argentina',
    },
  ],

  replaces: [
    '/conversor-numero-a-letras-cantidad',
    '/conversor-numeros-romanos-arabigos',
    '/conversor-decimal-binario-hexadecimal',
    '/conversor-letras-a-numero',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Nombre de la moneda para el importe en letras y para la línea del cheque. */
export const MONEDAS: Record<
  string,
  { singular: string; plural: string; cheque: string; centSingular: string; centPlural: string; simbolo: string }
> = {
  ARS: { singular: 'peso', plural: 'pesos', cheque: 'PESOS', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  USD: { singular: 'dólar', plural: 'dólares', cheque: 'DÓLARES', centSingular: 'centavo', centPlural: 'centavos', simbolo: 'US$' },
  EUR: { singular: 'euro', plural: 'euros', cheque: 'EUROS', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: '€' },
  UYU: { singular: 'peso uruguayo', plural: 'pesos uruguayos', cheque: 'PESOS URUGUAYOS', centSingular: 'centésimo', centPlural: 'centésimos', simbolo: '$U' },
  MXN: { singular: 'peso', plural: 'pesos', cheque: 'PESOS', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  COP: { singular: 'peso', plural: 'pesos', cheque: 'PESOS', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  CLP: { singular: 'peso', plural: 'pesos', cheque: 'PESOS', centSingular: 'centavo', centPlural: 'centavos', simbolo: '$' },
  PEN: { singular: 'sol', plural: 'soles', cheque: 'SOLES', centSingular: 'céntimo', centPlural: 'céntimos', simbolo: 'S/' },
};

/** Vocabulario de número → letras (RAE, escala larga). */
export const PALABRAS = {
  unidades: [
    'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
    'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
    'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
  ],
  decenas: ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
  centenas: [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
    'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
  ],
  escalas: ['', 'millón', 'billón', 'trillón'],
  escalasPlural: ['', 'millones', 'billones', 'trillones'],
};

/** Vocabulario inverso (letras → número). Sin acentos: normalizamos antes de buscar. */
export const LEXICO = {
  unidades: {
    cero: 0, uno: 1, un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
    siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
    quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20,
    veintiuno: 21, veintiun: 21, veintiuna: 21, veintidos: 22, veintitres: 23,
    veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28,
    veintinueve: 29,
  } as Record<string, number>,
  decenas: {
    treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  } as Record<string, number>,
  centenas: {
    cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300,
    cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500,
    seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700,
    ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900,
  } as Record<string, number>,
  ignorar: ['y', 'con', 'de'],
};

/** Símbolos romanos con sus formas sustractivas, de mayor a menor (algoritmo greedy). */
export const ROMANOS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** Valor de cada símbolo romano suelto. */
export const ROMANO_VALOR: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** Radix y validación de cada base posicional. */
export const BASES: Record<string, { radix: number; nombre: string; validos: string; permitidos: string }> = {
  decimal: { radix: 10, nombre: 'decimal', validos: '^[0-9]+$', permitidos: 'dígitos del 0 al 9' },
  binario: { radix: 2, nombre: 'binario', validos: '^[01]+$', permitidos: 'sólo 0 y 1' },
  octal: { radix: 8, nombre: 'octal', validos: '^[0-7]+$', permitidos: 'dígitos del 0 al 7' },
  hexadecimal: { radix: 16, nombre: 'hexadecimal', validos: '^[0-9a-f]+$', permitidos: 'dígitos del 0 al 9 y letras de la A a la F' },
};
