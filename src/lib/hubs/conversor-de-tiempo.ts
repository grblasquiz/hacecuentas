import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto es esto en otra unidad de tiempo?"
 * Arquetipo RAMIFICADO: 5 ramas = los 5 saltos de unidad que la gente
 * realmente busca. Absorbe 5 URLs (ver `replaces`).
 *
 * El problema real que resuelve NO es multiplicar: es que dos de esas cinco
 * conversiones NO TIENEN UN FACTOR EXACTO. El año no tiene 365 días (tiene
 * 365,2425 en el calendario gregoriano) y el mes no tiene 4 semanas (tiene
 * 4,348). Por eso el hub expone la CONVENCIÓN como un campo de entrada y
 * muestra en el desglose cuánto cambia el resultado con cada una: es la única
 * forma honesta de dar un número.
 *
 * Las otras tres —semana↔día, día↔hora, hora↔minuto— son exactas por
 * definición (7, 24 y 60) y no dependen de ninguna convención. El desglose lo
 * dice explícitamente en vez de dejar que el usuario lo suponga.
 *
 * FORMATO: acá no hay plata. El default de HubRow es 'ars', así que TODA fila
 * declara `format` explícito, casi siempre 'unit' con su unidad.
 */

/** Días por año según cada convención. La fuente de todos los factores. */
export const DIAS_POR_ANO: Record<string, { dias: number; label: string; nota: string }> = {
  // 365 + 1/4 − 1/100 + 1/400 = 365,2425: el año medio del calendario que usamos.
  gregoriano: {
    dias: 365.2425,
    label: 'Calendario gregoriano (365,2425 días)',
    nota: 'el año medio del calendario civil, con la regla completa de bisiestos',
  },
  comun: {
    dias: 365,
    label: 'Año común (365 días)',
    nota: 'el año de calendario sin bisiesto: lo que la mayoría tiene en la cabeza',
  },
  juliano: {
    dias: 365.25,
    label: 'Año juliano (365,25 días)',
    nota: 'promedio con un bisiesto cada 4 años; se sigue usando en astronomía',
  },
  comercial: {
    dias: 360,
    label: 'Año comercial 30/360 (360 días)',
    nota: 'la convención financiera: 12 meses de 30 días para calcular intereses',
  },
};

export const hub: HubData = {
  slug: 'conversores/tiempo',
  title: '¿Cuánto es esto en otra unidad de tiempo? — Conversor con las dos convenciones',
  description:
    'Convertí años a días, meses a semanas, semanas a días, días a horas y horas a minutos. Con las dos convenciones —calendario gregoriano y año comercial 30/360— y la cuenta paso a paso, porque el año no tiene 365 días exactos ni el mes 4 semanas.',
  silo: 'Conversores',
  siloHref: '/conversores',

  eyebrow: 'Guía y conversor de unidades de tiempo',
  h1: '¿Cuánto es esto en otra unidad de tiempo?',
  lede:
    'Tres de estas conversiones son exactas y no admiten discusión: la semana tiene 7 días, el día 24 horas y la hora 60 minutos. Las otras dos no: el año tiene 365,2425 días y el mes 4,35 semanas, así que el resultado depende de qué convención uses. Elegí abajo qué querés convertir y con qué criterio.',
  stamps: ['Actualizado 27-07-2026', '5 conversiones adentro', 'Con la convención a la vista'],

  resultLabel: 'El resultado de la conversión',

  cases: {
    title: '¿Qué querés convertir?',
    intro:
      'Elegí el par de unidades. Con el campo "sentido" das vuelta la conversión sin cambiar de rama: la misma pantalla te pasa de años a días y de días a años.',
    items: [
      {
        id: 'anos-dias',
        label: 'Años ↔ días',
        hint: 'Ej.: "¿cuántos días tiene 1 año?" o "1.000 días, ¿cuántos años son?"',
        answer:
          'Un año del calendario que usamos tiene 365,2425 días en promedio, así que la conversión depende de qué año estés contando.',
        yes: [
          'Calendario gregoriano: 365,2425 días por año — es el año medio del calendario civil',
          'Año común, sin bisiesto: 365 días — es lo que casi todo el mundo asume',
          'Año juliano: 365,25 días — el promedio con un bisiesto cada 4 años, todavía usado en astronomía',
          'Año comercial 30/360: 360 días — la convención financiera para calcular intereses',
          'Es la conversión que MÁS cambia según la convención: hasta 5 días de diferencia por año',
        ],
        warn: [
          'La regla de bisiestos completa es: cada 4 años sí, salvo los múltiplos de 100, salvo los múltiplos de 400. Por eso 365,2425 y no 365,25',
          'Para una edad o una antigüedad laboral concreta, contá los días reales del calendario: el promedio no te dice si tu tramo incluyó bisiestos',
          'La convención comercial de 360 días NO sirve para calcular fechas: sirve para prorratear intereses',
        ],
        plazo: 'atajo: 1 año ≈ 365 días · 10 años ≈ 3.653 días · 100 años ≈ 36.524 días.',
      },
      {
        id: 'meses-semanas',
        label: 'Meses ↔ semanas',
        hint: 'Ej.: "¿cuántas semanas son 9 meses?" o "40 semanas, ¿cuántos meses son?"',
        answer:
          'Un mes promedio tiene 4,35 semanas, no 4. Contar de a 4 semanas por mes te deja casi medio mes corto por año.',
        yes: [
          'Mes promedio del calendario gregoriano: 30,44 días = 4,3481 semanas',
          'Mes comercial: 30 días exactos = 4,2857 semanas',
          'La regla de bolsillo de "4 semanas = 1 mes" da 48 semanas por año en vez de 52,18',
          'Es la conversión del embarazo: 40 semanas son 9,2 meses, no 10',
        ],
        warn: [
          'Ningún mes real tiene 4,35 semanas: febrero tiene 4 justas y los de 31 días tienen 4 y 3 días',
          'Si tu cuenta es de sueldos, plazos o alquileres, fijate qué dice el contrato: puede definir el mes como 30 días',
          'Para un mes concreto del calendario usá sus días reales (28, 29, 30 o 31), no el promedio',
        ],
        plazo: 'atajo: 1 mes ≈ 4,35 semanas · 3 meses ≈ 13 semanas · 1 año = 52,18 semanas.',
      },
      {
        id: 'semanas-dias',
        label: 'Semanas ↔ días',
        hint: 'Ej.: "¿cuántos días son 6 semanas?"',
        answer: 'Exacto y sin vueltas: 7 días por semana, siempre.',
        yes: [
          'La semana tiene 7 días por definición, sin excepciones ni convenciones',
          'No la afectan los bisiestos ni los meses de distinta duración',
          'Un año gregoriano tiene 52,1775 semanas: por eso tu cumpleaños se corre un día cada año',
          'Es la conversión más segura de las cinco: el resultado no admite discusión',
        ],
        warn: [
          'Cuidado con "semana laboral": si contás días hábiles son 5, no 7 — eso ya no es una conversión de unidades',
          'Pasar de semanas a meses SÍ depende de la convención, porque el mes no es exacto',
        ],
        plazo: 'atajo: 1 semana = 7 días · 4 semanas = 28 días · 52 semanas = 364 días.',
      },
      {
        id: 'dias-horas',
        label: 'Días ↔ horas',
        hint: 'Ej.: "¿cuántas horas tiene un día y medio?"',
        answer: 'Exacto: 24 horas por día. 1 día y medio son 36 horas.',
        yes: [
          'El día civil tiene 24 horas por definición',
          'Media jornada, medio día y fracciones se manejan con decimales: 2,5 días son 60 horas',
          'Sirve para calcular horas de trabajo, tiempos de viaje y plazos de entrega',
        ],
        warn: [
          'Los días de cambio de horario de verano tienen 23 o 25 horas: no es un problema de conversión sino de calendario',
          'Muy de vez en cuando se agrega un segundo intercalar; para cualquier cuenta práctica es irrelevante',
          'Si lo que contás son horas de trabajo y no horas de reloj, el factor es tu jornada (6, 8 o 12), no 24',
        ],
        plazo: 'atajo: 1 día = 24 h · 1 semana = 168 h · 30 días = 720 h.',
      },
      {
        id: 'horas-minutos',
        label: 'Horas ↔ minutos (y minutos ↔ segundos)',
        hint: 'Ej.: "1,5 horas, ¿cuántos minutos son?"',
        answer:
          'Exacto: 60 minutos por hora. Ojo con el decimal: 1,5 h son 90 minutos, no 150.',
        yes: [
          'La hora tiene 60 minutos y el minuto 60 segundos: es el sistema sexagesimal',
          'El desglose te da también el formato reloj (h y min) y el total en segundos',
          '0,5 h = 30 min · 0,25 h = 15 min · 0,1 h = 6 min',
        ],
        warn: [
          'El error más común del mundo: escribir 1,5 h y leerlo como 1 h 50 min. Son 1 h 30 min',
          'Las planillas de cálculo suelen guardar la hora como fracción de día: 0,5 es mediodía, no media hora',
          'Si venís de una liquidación de sueldos, fijate si las horas están en decimal o en formato reloj antes de sumar',
        ],
        plazo: 'atajo: para pasar horas decimales a minutos, multiplicá la parte decimal por 60.',
      },
    ],
  },

  inputsTitle: 'Cargá el valor',
  inputsIntro:
    'Un solo número, el sentido de la conversión y —cuando hace falta— la convención de año o de mes. En las tres conversiones exactas la convención no cambia el resultado principal: sólo las equivalencias de referencia.',
  fields: [
    // Campo de TEXTO a propósito: con type:'number' se pierde la coma decimal
    // rioplatense, que es justamente la forma en que se escribe "1,5 horas".
    { id: 'valor', label: 'Cantidad a convertir', value: '1', help: 'Aceptamos coma decimal: "1,5" se lee como uno y medio.' },
    {
      id: 'sentido', label: 'Sentido de la conversión', type: 'select', value: 'ida',
      options: [
        { value: 'ida', label: 'De la unidad grande a la chica (años → días)' },
        { value: 'vuelta', label: 'De la unidad chica a la grande (días → años)' },
      ],
      help: 'La etiqueta muestra el ejemplo de la primera rama; en cada rama se aplica al par que corresponda.',
    },
    {
      id: 'convencion', label: 'Convención de año y de mes', type: 'select', value: 'gregoriano',
      options: [
        { value: 'gregoriano', label: 'Calendario gregoriano — 365,2425 días por año' },
        { value: 'comun', label: 'Año común sin bisiesto — 365 días' },
        { value: 'juliano', label: 'Año juliano — 365,25 días' },
        { value: 'comercial', label: 'Año comercial 30/360 — 360 días, mes de 30' },
      ],
      help: 'Sólo cambia el resultado en las ramas de años y de meses. En semanas, días, horas y minutos los factores son exactos.',
    },
  ],
  fineprint:
    'El mes de cada convención se calcula como el año dividido 12, y la semana siempre tiene 7 días. La convención gregoriana (365,2425) es la del calendario civil y la más adecuada para promedios largos; la comercial 30/360 es una convención financiera para prorratear intereses y no sirve para calcular fechas. Para una edad, una antigüedad o un plazo concreto, contá los días reales del calendario en vez de usar un promedio.',

  chart: {
    type: 'bars',
    title: 'Cuánto cambia según cómo lo cuentes',
    caption:
      'En las ramas de año y de mes, cada barra es el mismo lapso convertido con una convención distinta: la diferencia entre la más larga y la más corta es exactamente el error que arrastrás si elegís mal. En las ramas exactas —semana, día y hora— no hay convenciones que comparar, así que las barras muestran cómo se parte el resultado en unidades enteras y el resto suelto.',
  },
  breakdownTitle: 'La cuenta, paso a paso',
  breakdownIntro:
    'Primero el dato que cargaste, después el factor exacto que se usó y de dónde sale, después el resultado, y al final las equivalencias y la verificación: si volvés a convertir en sentido contrario tenés que recuperar el número original.',

  faq: [
    {
      q: '¿Cuántos días tiene un año exactamente?',
      a: 'Depende de qué año cuentes. El año del <b>calendario gregoriano</b> —el que usamos— tiene <b>365,2425 días</b> en promedio: 365 más un cuarto, menos los múltiplos de 100 que no son bisiestos, más los múltiplos de 400 que sí lo son. Un año de calendario concreto tiene <b>365 o 366</b>. El <b>año juliano</b> de la astronomía usa 365,25 y el <b>año comercial</b> de las finanzas, 360.',
    },
    {
      q: '¿Por qué el año no tiene 365 días justos?',
      a: 'Porque la Tierra no da una vuelta al Sol en un número entero de rotaciones: tarda unas <b>365 vueltas y cuarto</b>. Si el calendario ignorara ese cuarto, en 100 años las estaciones se correrían casi 25 días. El bisiesto cada 4 años compensa de más, y por eso la regla gregoriana le saca 3 bisiestos cada 400 años: así queda un año medio de <b>365,2425 días</b>, que se desvía menos de un día cada 3.000 años.',
    },
    {
      q: '¿Cuántas semanas tiene un mes?',
      a: '<b>4,35 semanas en promedio</b>, no 4. El mes promedio del calendario tiene 30,44 días, que dividido 7 da 4,3481 semanas. La regla de bolsillo de "4 semanas por mes" da 48 semanas al año cuando en realidad hay <b>52,18</b>: te quedás corto más de 4 semanas, casi un mes entero, cada año.',
    },
    {
      q: '¿Cuál es la diferencia entre la convención de calendario y la comercial?',
      a: 'La de <b>calendario</b> usa la duración real promedio: 365,2425 días por año y 30,44 por mes. La <b>comercial (30/360)</b> asume 12 meses de 30 días exactos, o sea 360 días por año, para que todos los períodos midan lo mismo y los intereses se prorrateen parejo. La primera sirve para medir tiempo; la segunda, para calcular plata. Usarlas al revés mete un error de <b>5,2 días por año</b>.',
    },
    {
      q: '¿Cuántas semanas son 9 meses de embarazo?',
      a: 'Con el mes promedio, 9 meses son <b>39,1 semanas</b>. Por eso el embarazo, que en la práctica clínica se cuenta en <b>40 semanas</b> desde la última menstruación, equivale a unos <b>9,2 meses</b> y no a 10: la diferencia entre contar de a 4 semanas y de a 4,35 explica toda la confusión.',
    },
    {
      q: '¿Cuántos días son 1.000 días en años?',
      a: 'Con el año gregoriano, 1.000 días son <b>2,738 años</b>: unos 2 años, 8 meses y 25 días. Con el año comercial de 360 días darían 2,778 años. La diferencia parece chica, pero sobre 10.000 días ya son más de 40 días de brecha.',
    },
    {
      q: '¿1,5 horas son 90 o 150 minutos?',
      a: '<b>90 minutos</b>. Es el error más frecuente en cualquier planilla: la hora tiene <b>60</b> minutos, no 100, así que la parte decimal se multiplica por 60. 1,5 h = 1 h + 0,5 × 60 = <b>1 h 30 min</b>. Del mismo modo, 2,25 h son 2 h 15 min y 0,1 h son 6 minutos.',
    },
    {
      q: '¿La semana siempre tiene 7 días?',
      a: 'Sí. Es la única de estas conversiones que no depende de nada: <b>7 días exactos</b>, sin bisiestos ni excepciones. Lo que sí cambia es la <b>semana laboral</b>, que son 5 o 6 días según el convenio — pero eso ya no es convertir unidades sino contar días hábiles.',
    },
    {
      q: '¿Un día siempre tiene 24 horas?',
      a: 'Para cualquier cuenta práctica, sí: <b>24 horas</b>. Las excepciones son dos y no afectan a una conversión de unidades: los días en que arranca o termina el <b>horario de verano</b> tienen 23 o 25 horas en los países que lo aplican, y muy de vez en cuando se agrega un <b>segundo intercalar</b> para sincronizar el reloj con la rotación de la Tierra.',
    },
    {
      q: '¿Cuántas semanas tiene un año?',
      a: '<b>52,1775 semanas</b> (365,2425 ÷ 7). Como no es un número entero, cada año sobra un día —dos en los bisiestos— y por eso tu cumpleaños cae un día más adelante de la semana cada año. El calendario ISO 8601, que se usa en logística y en sistemas, resuelve el problema con años de <b>52 o 53 semanas</b> completas.',
    },
    {
      q: '¿Qué convención conviene usar para calcular una antigüedad o una edad?',
      a: 'Ninguna de las dos: para un caso concreto conviene <b>contar los días reales del calendario</b> entre las dos fechas, porque el promedio no sabe si tu tramo incluyó bisiestos ni de cuántos días fueron los meses que atravesaste. Las convenciones sirven para <b>estimar</b> y para comparar períodos largos, no para liquidar un caso puntual.',
    },
    {
      q: '¿Cómo paso horas decimales a formato de reloj?',
      a: 'La parte entera son las horas y la parte decimal se multiplica por 60 para tener los minutos. <b>7,75 h</b> → 7 horas y 0,75 × 60 = 45 minutos, o sea <b>7:45</b>. Al revés, para pasar de reloj a decimal dividís los minutos por 60: 7 h 45 min = 7 + 45/60 = <b>7,75 h</b>. El desglose de esta página te muestra las dos formas a la vez.',
    },
  ],

  sources: [
    {
      name: 'The International System of Units (SI) — unidades de tiempo y unidades aceptadas para su uso',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'BIPM — Oficina Internacional de Pesas y Medidas',
    },
    {
      name: 'SI Units — Time',
      url: 'https://www.nist.gov/pml/owm/si-units-time',
      publisher: 'NIST — National Institute of Standards and Technology',
    },
    {
      name: 'Calendars and their Bases — el año medio gregoriano y la regla de bisiestos',
      url: 'https://aa.usno.navy.mil/faq/calendars',
      publisher: 'US Naval Observatory — Astronomical Applications Department',
    },
    {
      name: 'ISO 8601 — representación de fechas, horas y semanas del calendario',
      url: 'https://www.iso.org/iso-8601-date-and-time-format.html',
      publisher: 'ISO — Organización Internacional de Normalización',
    },
    {
      name: '30/360 Day Count Conventions — la base comercial de 360 días',
      url: 'https://www.isda.org/2008/12/22/30-360-day-count-conventions/',
      publisher: 'ISDA — International Swaps and Derivatives Association',
    },
  ],

  replaces: [
    '/calculadora-conversor-anos-a-dias',
    '/calculadora-conversor-meses-a-semanas',
    '/calculadora-conversor-semanas-a-dias',
    '/calculadora-conversor-dias-a-horas',
    '/calculadora-conversor-horas-a-minutos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
