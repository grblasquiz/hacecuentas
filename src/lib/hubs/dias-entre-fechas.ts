import type { HubData } from './types';
import { FERIADOS_AR_2026 } from '../data/feriados-ar-2026';

/**
 * Hub de decisión — "¿Cuántos días hay entre dos fechas?"
 * Arquetipo: CÁLCULO DOMINANTE (sin `cases`, con `answer`).
 *
 * Absorbe 4 calculadoras sueltas de fechas y horas (ver `replaces`).
 */
export const hub: HubData = {
  slug: 'fechas/dias-entre-fechas',
  title: '¿Cuántos días hay entre dos fechas? Corridos, hábiles y feriados 2026',
  description:
    'Calculá cuántos días, semanas y horas hay entre dos fechas: días corridos, hábiles reales descontando fines de semana y feriados argentinos 2026, y el día de la semana de cada fecha.',
  silo: 'Fechas',
  siloHref: '/fechas',

  eyebrow: 'Calendario y tiempo',
  h1: '¿Cuántos días hay entre dos fechas?',
  lede:
    'Poné la fecha de inicio y la de fin y te devolvemos el período completo: días corridos, cuántos son hábiles de verdad (sin sábados, domingos ni feriados), cuántas semanas y cuántas horas. Si además cargás horarios, sumamos la diferencia exacta de horas y minutos.',
  stamps: ['Actualizado 27-07-2026', 'Feriados AR 2026 (Ley 27.399)', '4 calculadoras adentro'],

  resultLabel: 'Días entre las dos fechas',

  inputsTitle: 'Cargá el período',
  inputsIntro:
    'Las fechas van en formato día/mes/año. Los horarios son opcionales: dejalos como están si sólo querés contar días.',
  fields: [
    { id: 'desde', label: 'Fecha de inicio', type: 'date', value: '2026-07-27' },
    { id: 'hasta', label: 'Fecha de fin', type: 'date', value: '2026-12-25' },
    { id: 'horaDesde', label: 'Hora de inicio (opcional)', type: 'text', value: '09:00', help: 'Formato 24 h, por ejemplo 09:00' },
    { id: 'horaHasta', label: 'Hora de fin (opcional)', type: 'text', value: '18:30', help: 'Formato 24 h, por ejemplo 18:30' },
    {
      id: 'modo',
      label: '¿Contamos el día de fin?',
      type: 'select',
      value: 'excluir',
      options: [
        { value: 'excluir', label: 'No — diferencia entre fechas (lo habitual)' },
        { value: 'incluir', label: 'Sí — contar ambos extremos (días de licencia)' },
      ],
    },
  ],
  fineprint:
    'Los feriados se descuentan con el calendario nacional argentino 2026. Para fechas de otros años el conteo de feriados queda en cero y sólo se descuentan sábados y domingos.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte el período',
    caption:
      'La barra parte los días corridos en tres: los hábiles netos, los sábados y domingos, y los feriados o días no laborables que caen en día de semana. Los feriados salen del calendario nacional argentino 2026: si tus fechas caen fuera de ese año, ese tramo aparece en cero y el corte es sólo hábiles contra fin de semana.',
  },
  breakdownTitle: 'El período, medido de todas las formas',
  breakdownIntro: 'Cada fila es el mismo período expresado en otra unidad. Las barras comparan cada valor con el mayor.',

  answer: {
    title: 'Días corridos y días hábiles no son lo mismo.',
    copy:
      'Los días corridos cuentan todo; los hábiles descuentan sábados, domingos y feriados. Fijate cuál te pide el trámite antes de contar.',
    yes: [
      'Días corridos: todos los días del calendario, incluidos fines de semana y feriados',
      'Días hábiles: sólo lunes a viernes, descontando feriados nacionales y días no laborables',
      'Semanas, meses y años aproximados del período (mes = 30,44 días, año = 365,25)',
      'Horas y minutos totales, y la diferencia entre los dos horarios si los cargaste',
      'El día de la semana en el que cae cada una de las dos fechas',
    ],
    warn: [
      'Los plazos judiciales y administrativos suelen contarse en días hábiles y arrancan el día siguiente a la notificación: no cuentes el día cero',
      'Los feriados provinciales, los días no laborables por credo y las ferias judiciales no están en el calendario nacional y pueden correr el vencimiento',
      'Las vacaciones de la LCT se cuentan en días corridos, no hábiles: no las calcules con la columna de hábiles',
      'Los años bisiestos suman un 29 de febrero: usar “meses × 30” para períodos largos te desvía varios días',
    ],
    plazo:
      'si el vencimiento cae en un día inhábil, se corre al primer día hábil siguiente (art. 25 del Código Civil y Comercial y art. 1 de la Ley 19.549).',
  },

  faq: [
    {
      q: '¿Cuántos días hay entre dos fechas exactamente?',
      a: 'Se restan las dos fechas y se cuenta la cantidad de medianoches que hay en el medio. Por eso, entre el 1 y el 10 de un mes hay 9 días de diferencia, no 10: el resultado con 10 aparece cuando contás los dos extremos, algo que se usa para licencias y estadías. En la calculadora elegís cuál de los dos criterios querés con el selector “¿Contamos el día de fin?”.',
    },
    {
      q: '¿Qué diferencia hay entre días corridos y días hábiles?',
      a: 'Los días corridos son todos los del calendario, incluidos sábados, domingos y feriados. Los días hábiles cuentan sólo de lunes a viernes y descuentan feriados nacionales y días no laborables. Casi todos los plazos administrativos y judiciales se cuentan en días hábiles; los plazos del Código Civil y Comercial, en cambio, corren en días corridos salvo que la norma diga lo contrario.',
    },
    {
      q: '¿Los feriados se descuentan de los días hábiles?',
      a: 'Sí. Los feriados nacionales, los puentes turísticos y los días no laborables de la Ley 27.399 que caen de lunes a viernes se restan de los hábiles. En este hub usamos el calendario nacional argentino 2026 completo: 15 feriados nacionales, 3 puentes turísticos y el 8 de diciembre como día no laborable.',
    },
    {
      q: '¿Cuántos días hábiles tiene 2026 en Argentina?',
      a: 'El año tiene 365 días: 261 caen de lunes a viernes y 104 son sábados o domingos. Descontando los feriados y días no laborables del calendario nacional que caen en día de semana, quedan alrededor de 245 días hábiles. El número exacto de tu período lo ves en el desglose de arriba.',
    },
    {
      q: '¿Cómo cuento cuántas semanas hay entre dos fechas?',
      a: 'Se dividen los días corridos por 7. El resultado con decimales te dice las semanas completas y la fracción: 100 días son 14,3 semanas, es decir 14 semanas y 2 días. Para embarazo, obra o cronogramas de proyecto conviene mirar las semanas completas y aparte los días sueltos.',
    },
    {
      q: '¿Por qué “meses” me da un número con coma?',
      a: 'Porque los meses no duran todos lo mismo. Para poder expresar cualquier período en meses usamos el mes promedio del calendario gregoriano, 30,44 días, y el año promedio de 365,25 días. Si necesitás meses calendario exactos (del 15 de marzo al 15 de junio son 3 meses justos), contá de fecha a fecha en vez de dividir.',
    },
    {
      q: '¿Qué día de la semana cae una fecha?',
      a: 'El resultado te muestra el día de la semana de la fecha de inicio y de la de fin, y el desglose te dice cuántos sábados y domingos hay en el medio. Sirve para saber si un vencimiento cae en fin de semana y se corre al lunes.',
    },
    {
      q: '¿Cómo sumo o resto horas y minutos entre dos horarios?',
      a: 'Cargá la hora de inicio y la de fin en formato de 24 horas. La calculadora devuelve la diferencia en horas y minutos y, si la hora de fin es menor que la de inicio, asume que el turno cruza la medianoche y suma las horas del día siguiente. También te da las horas totales de todo el período, útil para presupuestar horas de trabajo.',
    },
    {
      q: '¿Cómo se cuenta un plazo que vence en un día inhábil?',
      a: 'Si el último día del plazo cae sábado, domingo o feriado, el vencimiento se traslada al primer día hábil siguiente. Además, en el procedimiento administrativo nacional existe el “plazo de gracia”: se puede presentar el escrito dentro de las dos primeras horas hábiles del día siguiente al vencimiento.',
    },
    {
      q: '¿Cuenta el día de inicio dentro del plazo?',
      a: 'Por regla general no. Los plazos se cuentan a partir del día siguiente al de la notificación o del hecho que los dispara, y vencen al terminar el último día. Por eso el modo por defecto de esta calculadora es la diferencia entre fechas, sin contar el día de fin.',
    },
  ],

  sources: [
    {
      name: 'Ley 27.399 — Régimen de feriados nacionales y días no laborables',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/300000-304999/303581/norma.htm',
      publisher: 'InfoLeg',
      date: 'texto vigente',
    },
    {
      name: 'Feriados y días no laborables 2026',
      url: 'https://www.argentina.gob.ar/interior/feriados-nacionales-2026',
      publisher: 'Ministerio del Interior — Argentina.gob.ar',
      date: 'calendario oficial 2026',
    },
    {
      name: 'Decreto 1584/2010 — feriados trasladables (regla del lunes)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/175000-179999/175020/norma.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Ley 19.549 de Procedimientos Administrativos — cómputo de plazos en días hábiles y plazo de gracia',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/20000-24999/22363/texact.htm',
      publisher: 'InfoLeg',
    },
    {
      name: 'Código Civil y Comercial, arts. 6 y 25 — cómputo de plazos en días corridos',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
    },
  ],

  replaces: [
    '/dias-entre-dos-fechas',
    '/calculadora-de-horas',
    '/calculadora-que-dia-de-la-semana',
    '/sumar-restar-horas-minutos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Fechas ISO no laborables (feriados + puentes + no laborables) del calendario
 * nacional argentino 2026. Se serializa al cliente para el compute() del hub.
 */
export const FERIADOS_ISO: string[] = FERIADOS_AR_2026.map((f) => f.fecha);
