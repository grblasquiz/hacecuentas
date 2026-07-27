import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué edad tengo exactamente?"
 * Arquetipo CÁLCULO DOMINANTE: una sola cuenta manda, no hay ramas (`answer`, sin `cases`).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FORMATO: este hub NO es plata. El desglose son cantidades (años, meses,
 * semanas, días, horas), así que cada fila viaja con `format: 'unit'` + `unit`,
 * y el resultado declara `format: 'unit'` / `unit: 'días'` para la leyenda del
 * gráfico (ambos segmentos son días). `ref` queda reservado a referencias
 * reales (norma o fuente), no a la unidad. Ver `HubRow` en types.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const hub: HubData = {
  slug: 'fechas/edad-exacta',
  title: '¿Qué edad tengo exactamente? Años, meses, días, semanas y horas',
  description:
    'Tu edad exacta al día: años, meses y días cumplidos, más el total en meses, semanas, días y horas. Incluye el día de la semana en que naciste y cuánto falta para tu próximo cumpleaños.',
  silo: 'Fechas',
  siloHref: '/fechas',

  eyebrow: 'Fechas y calendario',
  h1: '¿Qué edad tengo exactamente?',
  lede:
    'No sólo los años cumplidos: la cuenta completa en meses, semanas, días y horas, el día de la semana en que naciste y cuántos días faltan para tu próximo cumpleaños. Todo en una sola pantalla.',
  stamps: ['Actualizado 27-07-2026', 'Calendario gregoriano · años bisiestos', '6 calculadoras adentro'],

  resultLabel: 'Tu edad exacta',

  inputsTitle: 'Poné tu fecha de nacimiento',
  inputsIntro: 'La hora es opcional: sirve para que el total en horas sea exacto y no una estimación.',
  fields: [
    { id: 'nacimiento', label: 'Fecha de nacimiento', type: 'date', value: '1992-03-15' },
    { id: 'hora', label: 'Hora de nacimiento (0 a 23)', type: 'number', min: 0, max: 23, value: 8, help: 'Si no la sabés, dejá 0.' },
  ],
  fineprint:
    'El cálculo corre en tu navegador con la fecha de hoy de tu dispositivo. Nada se envía a ningún servidor.',

  chart: {
    type: 'progress',
    title: 'Tu año en curso',
    caption:
      'La barra muestra cuánto llevás recorrido del año que empezó en tu último cumpleaños. Lo que queda es lo que falta para el próximo.',
  },
  breakdownTitle: 'Tu edad en todas las unidades',
  breakdownIntro:
    'La misma edad expresada de seis maneras. Cada fila muestra su propia unidad junto al número.',

  answer: {
    title: 'Cómo se cuenta la edad',
    copy:
      'La edad exacta se cuenta por fecha de calendario, no por promedios: se restan años, después meses y después días, tomando prestado del mes anterior cuando el día todavía no llegó. Por eso "34 años y 11 meses" sigue siendo 34 años cumplidos para cualquier trámite.',
    yes: [
      'Años, meses y días cumplidos: es la forma legal de expresar la edad',
      'Total en meses, semanas y días corridos: sirve para bebés, aniversarios y plazos',
      'Total en horas: útil para efemérides personales y curiosidades',
      'Día de la semana en que naciste, calculado sobre el calendario gregoriano',
      'Días que faltan para tu próximo cumpleaños',
    ],
    warn: [
      'Los años bisiestos ya están contemplados: por eso el total de días no es "años × 365".',
      'Si naciste un 29 de febrero, en los años no bisiestos el cumpleaños se toma el 28 de febrero a efectos del cálculo.',
      'El total en horas usa la hora de nacimiento que cargues. Sin ella, la cuenta arranca a las 00:00.',
      'No se aplican husos horarios ni cambios de hora históricos: se usa la hora local de tu dispositivo.',
    ],
    plazo:
      'en Argentina la mayoría de edad se alcanza a los 18 años cumplidos (ley 26.579), el mismo día del cumpleaños, no al año calendario.',
  },

  faq: [
    {
      q: '¿Cómo se calcula la edad exacta en años, meses y días?',
      a: 'Se restan los años entre las dos fechas, después los meses y después los días. Si el día de hoy es menor que el día de nacimiento, se descuenta un mes y se suman los días que tenía el mes anterior. Si el mes resultante queda negativo, se descuenta un año y se suman 12 meses. Es el método de calendario, el mismo que usan los registros civiles.',
    },
    {
      q: '¿Cuántos días tengo de vida exactamente?',
      a: 'Es la diferencia en días corridos entre tu fecha de nacimiento y hoy, contando los 29 de febrero de cada año bisiesto. Por eso nunca coincide con multiplicar los años por 365: cada cuatro años se suma un día extra.',
    },
    {
      q: '¿Cuántas semanas tengo?',
      a: 'Se dividen los días totales de vida por 7. La parte entera son las semanas cumplidas y el resto son los días sueltos. Es la unidad que usan pediatras y neonatólogos durante el primer año de vida.',
    },
    {
      q: '¿Qué día de la semana nací?',
      a: 'Se obtiene del calendario gregoriano, que se repite en un ciclo de 400 años. Para fechas anteriores a la reforma gregoriana (octubre de 1582 en los países católicos) el resultado es una proyección, no el día que figuraba en los registros de la época.',
    },
    {
      q: '¿Cuántos días faltan para mi próximo cumpleaños?',
      a: 'Se toma tu día y mes de nacimiento en el año en curso. Si esa fecha ya pasó, se usa la del año que viene. La diferencia en días corridos hasta hoy es lo que falta. Si el cumpleaños es hoy, el resultado es 0 días.',
    },
    {
      q: '¿Cómo cuenta la edad alguien que nació un 29 de febrero?',
      a: 'Legalmente cumple años el 1 de marzo en los años no bisiestos según el criterio más extendido, aunque muchos lo festejan el 28 de febrero. Para el cálculo de días de vida no cambia nada: los días corridos se cuentan igual.',
    },
    {
      q: '¿Por qué el total de meses no coincide con los años multiplicados por 12?',
      a: 'Sí coincide en los años cumplidos, pero el total de meses incluye además los meses sueltos del año en curso. Con 34 años y 4 meses el total es 412 meses, no 408.',
    },
    {
      q: '¿A qué edad se es mayor de edad y a qué edad se puede jubilar en Argentina?',
      a: 'La mayoría de edad es a los 18 años cumplidos desde la ley 26.579 (antes eran 21). La jubilación ordinaria del régimen general de ANSES requiere 60 años para mujeres y 65 para varones, más 30 años de aportes.',
    },
    {
      q: '¿El cálculo tiene en cuenta mi zona horaria?',
      a: 'Usa la fecha y hora local de tu dispositivo. Si viajaste o naciste en otro huso horario, el total en horas puede diferir en unas pocas unidades. Los años, meses y días no se ven afectados.',
    },
  ],

  sources: [
    {
      name: 'Ley 26.579 — mayoría de edad a los 18 años',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/160000-164999/161874/norma.htm',
      publisher: 'InfoLeg — Ministerio de Justicia',
      date: '31-12-2009',
    },
    {
      name: 'Código Civil y Comercial de la Nación — cómputo de plazos (arts. 6 y 25)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Requisitos de edad para la jubilación del régimen general',
      url: 'https://www.anses.gob.ar/jubilaciones-y-pensiones',
      publisher: 'ANSES',
    },
    {
      name: 'ISO 8601 — representación de fechas y horas',
      url: 'https://www.iso.org/iso-8601-date-and-time-format.html',
      publisher: 'International Organization for Standardization',
    },
    {
      name: 'Tablas abreviadas de mortalidad y esperanza de vida por edad',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-2-24-119',
      publisher: 'INDEC',
    },
  ],

  replaces: [
    '/calculadora-edad-exacta',
    '/calculadora-edad-en-semanas',
    '/calculadora-edad-exacta-anos-meses-dias-segundos',
    '/calculadora-edad-en-dias',
    '/calculadora-dia-nacimiento-semana',
    '/calculadora-proximo-cumpleanos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Días de la semana, índice 0 = domingo (getDay()). */
export const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
