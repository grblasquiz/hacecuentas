import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas palabras tiene mi trabajo?"
 * Arquetipo: CÁLCULO DOMINANTE (sin `cases`, con `answer`).
 * Absorbe 9 calculadoras de texto/estudio (ver `replaces`).
 *
 * ── ESTADO DE LOS LÍMITES DEL CONTRATO ─────────────────────────────────────
 *
 * 1) FORMATO — RESUELTO. El contrato ya expone `format: 'ars'|'plain'|'unit'`,
 *    `unit` y `decimals` (en HubResult y por fila en HubRow). Acá ningún valor
 *    es plata: cada fila declara `format: 'unit'` con su unidad, y las páginas
 *    y los minutos van con 1 decimal para no perder el "4,9".
 *
 * 2) FALTA `type: 'textarea'` en HubField — PARCHEADO EN LA PÁGINA.
 *    El input principal es texto pegado, y un <input type="text"> aplana los
 *    saltos de línea → el conteo de párrafos daba siempre 1. Mientras el
 *    contrato no lo soporte, el <script> de la página reemplaza el <input> por
 *    un <textarea> con el mismo id/data-field. Lo que haría falta en el
 *    contrato: `type?: ... | 'textarea'` + un `rows?` opcional, y un branch en
 *    DecisionHub.astro que emita <textarea data-field>.
 */
export const hub: HubData = {
  slug: 'estudio/contador-de-palabras',
  title: '¿Cuántas palabras tiene mi trabajo? Contador de palabras, caracteres y páginas',
  description:
    'Pegá tu texto y mirá cuántas palabras, caracteres, párrafos y páginas tenés, cuánto te falta para el mínimo pedido y cuánto tarda en leerse. Con criterios de conteo APA y de universidades.',
  silo: 'Estudio',
  siloHref: '/estudio',

  eyebrow: 'Herramienta de escritura académica',
  h1: '¿Cuántas palabras tiene mi trabajo?',
  lede:
    'Pegá el texto, poné el mínimo que te pidieron y mirá en una sola pantalla cuánto llevás, cuánto te falta y cuántas páginas ocupa con el formato de tu cátedra.',
  stamps: ['Actualizado 27-07-2026', 'Criterio APA 7ª edición', '9 calculadoras adentro'],

  resultLabel: 'Palabras contadas',

  inputsTitle: 'Pegá tu texto y fijá el objetivo',
  inputsIntro:
    'El texto no se envía a ningún lado: la cuenta se hace en tu navegador. El objetivo es el mínimo (o el máximo) que te pidieron.',
  fields: [
    // OJO: esto debería declarar `type: 'textarea'`. Hasta que el contrato lo
    // soporte, la página lo convierte a <textarea> al iniciar (ver nota 2).
    {
      id: 'texto',
      label: 'Tu texto (pegalo acá)',
      type: 'text',
      value:
        'La escritura académica exige precisión. Cada párrafo defiende una idea y la respalda con evidencia.\n\nEl segundo párrafo desarrolla el argumento y lo contrasta con otras posturas de la bibliografía.\n\nPegá tu propio texto para reemplazar este ejemplo: los saltos de línea se respetan y se cuentan como párrafos.',
      help: 'Se cuenta tal cual lo pegás, sin corregir nada.',
    },
    { id: 'objetivo', label: 'Objetivo de palabras que te pidieron', value: '3.000', thousands: true },
    {
      id: 'interlineado',
      label: 'Interlineado',
      type: 'select',
      value: 'doble',
      options: [
        { value: 'doble', label: 'Doble (norma APA)' },
        { value: '1.5', label: '1,5 líneas' },
        { value: 'simple', label: 'Simple' },
      ],
    },
    { id: 'tamano', label: 'Tamaño de fuente (pt)', type: 'number', min: 8, max: 18, step: 1, value: 12 },
    { id: 'wpm', label: 'Tu velocidad de tipeo (palabras por minuto)', type: 'number', min: 5, max: 200, value: 40 },
  ],
  fineprint:
    'Las páginas son una estimación: el conteo real depende de márgenes, tipografía, títulos, tablas y figuras. El número que manda siempre es el del procesador de texto que use quien corrige.',

  chart: {
    type: 'progress',
    title: 'Avance contra tu objetivo',
    caption:
      'La barra muestra qué porción del objetivo ya escribiste y cuánto falta. Si superaste el objetivo, el avance queda en 100% y el excedente aparece en el desglose.',
  },
  breakdownTitle: 'Tu texto, medido',
  breakdownIntro:
    'Cada fila es una cantidad, no un importe: la unidad va indicada al lado del concepto (palabras, caracteres, párrafos, páginas o minutos).',

  answer: {
    title: 'El conteo que vale es el que pide tu cátedra.',
    copy:
      'La norma APA no fija un mínimo de palabras: fija el formato. El mínimo lo pone la consigna, y casi siempre se cuenta el cuerpo del trabajo sin carátula ni bibliografía.',
    yes: [
      'El cuerpo del texto: introducción, desarrollo y conclusión',
      'Las citas textuales incorporadas al párrafo, salvo que la consigna diga lo contrario',
      'Los títulos y subtítulos de las secciones del cuerpo',
      'Las notas al pie sustantivas, cuando la cátedra las cuenta como texto',
    ],
    warn: [
      'Carátula, índice, resumen, referencias y anexos suelen quedar FUERA del conteo: preguntá antes de festejar el número',
      'Los párrafos se cuentan por línea en blanco: si tu documento separa párrafos con sangría y sin línea vacía, el conteo va a diferir',
      'Las páginas estimadas no reemplazan al conteo real del procesador de texto (Word, Docs o LaTeX)',
      'Pasarte del máximo suele penalizarse igual que no llegar al mínimo',
    ],
    plazo:
      'antes de entregar, verificá el conteo en el mismo programa con el que vas a exportar el PDF: Word cuenta distinto que Google Docs con notas al pie.',
  },

  faq: [
    {
      q: '¿Cuántas palabras entran en una página?',
      a: 'Con la referencia habitual de 12 pt en A4, entran unas <b>250 palabras por página a doble espacio</b> (el formato que pide APA), unas 375 a interlineado 1,5 y unas 500 a espacio simple. Bajar a 11 pt sube el conteo, subir a 14 pt lo baja. Por eso el hub recalcula las páginas con el interlineado y el tamaño que elegís.',
    },
    {
      q: '¿Las citas y la bibliografía cuentan dentro del mínimo de palabras?',
      a: 'Depende de la consigna. El criterio más extendido en universidades es contar el <b>cuerpo del trabajo</b> (introducción, desarrollo y conclusión) e excluir carátula, índice, resumen, lista de referencias y anexos. Las citas textuales dentro del párrafo casi siempre cuentan; las referencias del final, casi nunca. Si la consigna no lo aclara, preguntá: es la diferencia entre aprobar y rehacer.',
    },
    {
      q: '¿Qué se considera una "palabra" al contar?',
      a: 'Cualquier bloque de caracteres separado por espacios. Eso significa que "no obstante" son dos palabras, que "ex-alumno" es una sola y que un número como "27.802" también cuenta como una. Es el mismo criterio que usan Word y Google Docs, y es el que aplica este contador.',
    },
    {
      q: '¿Por qué mi procesador de texto me da un número distinto?',
      a: 'Las diferencias típicas vienen de tres lugares: si el programa incluye o no las notas al pie y los cuadros de texto, cómo trata los guiones y las abreviaturas, y si contás el documento entero o solo una selección. Las diferencias suelen ser del 1 al 3%. Si estás al filo del mínimo, escribí un poco de más.',
    },
    {
      q: '¿Cuántos caracteres tiene una palabra en español?',
      a: 'El promedio ronda los <b>5 caracteres por palabra</b>, que con el espacio siguiente da unos 6 caracteres con espacios. Por eso, cuando la consigna viene en caracteres (frecuente en revistas y en resúmenes de congresos), podés dividir por 6 para tener una idea rápida de las palabras equivalentes.',
    },
    {
      q: '¿Cuánto tarda en leerse mi texto?',
      a: 'Un adulto lee en silencio a unas <b>200 palabras por minuto</b> y en voz alta a unas <b>130</b>. Si tenés que exponer el trabajo con un límite de tiempo, usá la cifra de voz alta: 10 minutos de exposición equivalen a unas 1.300 palabras leídas, bastante menos si vas a improvisar o mostrar diapositivas.',
    },
    {
      q: '¿Cuánto voy a tardar en escribir las palabras que me faltan?',
      a: 'El hub lo estima con tu velocidad de tipeo. Una persona promedio tipea unas 40 palabras por minuto copiando, pero <b>escribiendo contenido original el ritmo real baja a entre 15 y 25 palabras por minuto</b> porque pensás, corregís y buscás fuentes. Para una tesis, planificá por semana y no por hora: un ritmo sostenible es de 1.500 a 3.000 palabras semanales.',
    },
    {
      q: '¿Cuántas fuentes bibliográficas necesito para esa cantidad de páginas?',
      a: 'No hay una regla oficial en APA, pero el criterio más usado en cátedras es de <b>alrededor de una fuente por página</b> del cuerpo del trabajo, con un mínimo de 8 a 10 en un trabajo práctico y de 40 en adelante en una tesis. Apuntá a que al menos el 40% sean fuentes primarias (estudios, documentos y datos originales), no interpretaciones de terceros.',
    },
    {
      q: '¿Qué es el índice de legibilidad que aparece en el desglose?',
      a: 'Es el índice <b>Fernández Huerta</b>, la adaptación al español de la fórmula Flesch: combina el promedio de palabras por oración con el de sílabas por palabra. De 60 a 70 es un texto de lectura normal; por debajo de 50 es un texto difícil, típico de escritura académica. No es una nota: un texto de posgrado puede y suele dar bajo. Sirve para detectar oraciones demasiado largas.',
    },
    {
      q: '¿El texto que pego queda guardado en algún lado?',
      a: 'No. El conteo lo hace tu navegador con JavaScript en tu propia computadora: el texto no se envía a ningún servidor ni queda almacenado. Podés cerrar la pestaña y no queda rastro.',
    },
  ],

  sources: [
    {
      name: 'Publication Manual of the American Psychological Association, 7ª ed. — formato de página, interlineado y referencias',
      url: 'https://apastyle.apa.org/style-grammar-guidelines/paper-format',
      publisher: 'American Psychological Association',
      date: '7ª edición',
    },
    {
      name: 'APA Style — Line spacing y Font (interlineado doble y tipografías admitidas)',
      url: 'https://apastyle.apa.org/style-grammar-guidelines/paper-format/line-spacing',
      publisher: 'American Psychological Association',
    },
    {
      name: 'Word and page count — criterios de conteo para trabajos y tesis',
      url: 'https://www.ox.ac.uk/students/academic/guidance/graduate/research',
      publisher: 'University of Oxford',
    },
    {
      name: 'Fernández Huerta, J. (1959) — Medidas sencillas de lecturabilidad (adaptación española de Flesch)',
      url: 'https://legible.es/blog/lecturabilidad-fernandez-huerta/',
      publisher: 'Consigna, 214',
      date: '1959',
    },
  ],

  replaces: [
    '/calculadora-contador-de-palabras-y-caracteres',
    '/calculadora-palabras-paginas-conversor',
    '/calculadora-palabras-por-pagina-trabajo',
    '/calculadora-formula-citacion-apa',
    '/calculadora-citas-bibliograficas-formato-apa',
    '/calculadora-tecla-por-minuto-typing-test',
    '/calculadora-typing-speed',
    '/calculadora-tesis-palabras-tiempo-necesario-elaboracion',
    '/calculadora-legibilidad-texto-flesch',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Palabras por página a 12 pt en A4, por interlineado. Se reescala por tamaño de fuente. */
export const PPG_BASE: Record<string, number> = {
  simple: 500,
  '1.5': 375,
  doble: 250,
};

/** Velocidades de lectura de referencia, en palabras por minuto. */
export const LECTURA = { silencio: 200, vozAlta: 130 };
