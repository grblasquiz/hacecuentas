import type { HubData } from './types';
import { FERIADOS_AR_2026, META } from '../data/feriados-ar-2026';

/**
 * Hub de decisión — "¿Cuándo es el próximo feriado?"
 * Arquetipo RAMIFICADO: próximo feriado (default), cuántos quedan en el año,
 * días hábiles que quedan y fines de semana largos.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HUB QUE CADUCA — cómo se maneja
 *
 * La tabla `src/lib/data/feriados-ar-2026.ts` es la fuente única del repo y
 * cubre UN año calendario. Regla dura acá:
 *
 *  1. Ningún año literal en el copy ni en el cálculo. El año se deriva de la
 *     propia tabla (`ANIO_TABLA`, calculado en el compute a partir de la primera
 *     fecha) y la fecha de referencia sale de `new Date()` en el navegador.
 *  2. Si el usuario abre la página con una fecha fuera del año que cubre la
 *     tabla, el hub NO devuelve 0 ni inventa fechas: avisa en pantalla que el
 *     calendario cargado es el de otro año y que el decreto del año siguiente se
 *     publica entre septiembre y noviembre.
 *  3. No se duplica la tabla. Es el mismo import que usan
 *     `cuenta-regresiva.ts` y `dias-entre-fechas.ts`: cuando se cargue el año
 *     nuevo se cambia un solo archivo y los tres hubs se actualizan juntos.
 *
 * NO hay plata en este hub. El formato base del runtime es 'ars' y
 * `Object.assign` copia el default, así que TODAS las filas viajan con
 * `format: 'unit'` (o 'plain') y su unidad propia.
 *
 * Diferenciación: `/fechas/cuenta-regresiva` responde "cuánto falta para una
 * fecha" (el próximo feriado es una de sus cuatro ramas, en segundos) y
 * `/fechas/dias-entre-fechas` responde "cuántos días hay entre dos fechas
 * concretas". Este hub responde otra cosa: cuál es el feriado, cuántos quedan,
 * cuántos días hábiles te quedan por delante y qué fines de semana largos
 * vienen. La tabla es compartida; la pregunta no.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Se serializa al cliente para el compute(). El año se deriva de acá, no se escribe. */
export const FERIADOS = FERIADOS_AR_2026.map((f) => ({
  fecha: f.fecha,
  nombre: f.nombre,
  tipo: f.tipo,
  trasladadoDe: f.trasladadoDe || '',
}));

/** Vigencia y norma del calendario cargado, para los sellos y el aviso de caducidad. */
export const CALENDARIO_META = {
  dataAsOf: META.dataAsOf,
  fuente: META.fuente,
  fuenteUrl: META.fuenteUrl,
};

export const hub: HubData = {
  slug: 'fechas/feriados',
  title: '¿Cuándo es el próximo feriado? Calendario, findes largos y días hábiles',
  description:
    'El próximo feriado en Argentina y cuántos días faltan, cuántos feriados quedan en el año, qué fines de semana largos vienen y cuántos días hábiles te quedan por delante descontando fines de semana y feriados oficiales.',
  silo: 'Fechas',
  siloHref: '/fechas',

  eyebrow: 'Calendario argentino',
  h1: '¿Cuándo es el próximo feriado?',
  lede:
    'El calendario nacional completo con los traslados ya aplicados: cuál es el próximo día no laborable y cuánto falta, cuántos feriados quedan hasta fin de año, qué fines de semana largos vienen y cuántos días hábiles te quedan por delante una vez descontados sábados, domingos y feriados.',
  stamps: [
    'Ley 27.399 · Decreto 1584/2010 · Resolución 164/2025',
    'Feriados, puentes turísticos y días no laborables',
    'El año sale de la tabla cargada, no del texto',
  ],

  resultLabel: 'Faltan para el próximo feriado',

  cases: {
    title: '¿Qué necesitás saber del calendario?',
    intro:
      'Todas las ramas usan el mismo calendario nacional oficial, con los feriados trasladables ya corridos al día en que efectivamente se toman.',
    items: [
      {
        id: 'proximo',
        label: 'Cuál es el próximo feriado',
        hint: 'El caso más común',
        answer: 'El próximo día no laborable del calendario nacional, con la fecha exacta y los días que faltan.',
        yes: [
          'Feriados inamovibles y trasladables, con el traslado ya aplicado',
          'Puentes turísticos y el día no laborable del 8 de diciembre',
          'El día de la semana en que cae y si arma fin de semana largo',
          'El feriado siguiente al próximo, para planificar con más aire',
        ],
        warn: [
          'La tabla cargada cubre un solo año calendario: si tu fecha queda fuera, la pantalla lo avisa en vez de mostrar un cero engañoso.',
          'Sólo calendario nacional. Los feriados provinciales, municipales y las conmemoraciones de culto no están incluidos.',
          'Los puentes turísticos son días no laborables, no feriados: el trabajo en esos días no siempre se paga doble.',
        ],
        plazo:
          'el calendario del año siguiente, incluidos los puentes turísticos, se publica por decreto y resolución entre septiembre y noviembre.',
      },
      {
        id: 'restan',
        label: 'Cuántos feriados quedan',
        hint: 'Lo que sobra del año',
        answer: 'Cuántos días no laborables quedan hasta el 31 de diciembre, separados por tipo.',
        yes: [
          'Feriados nacionales que quedan: inamovibles más trasladables',
          'Puentes turísticos y días no laborables que quedan aparte',
          'Cuántos de los que quedan caen en día de semana y realmente te dan descanso',
          'Cuántos ya pasaron, para ver en qué parte del año estás',
        ],
        warn: [
          'Un feriado que cae sábado o domingo no suma día libre: se cuenta en el calendario pero no en el descanso.',
          'Los días no laborables (como el 8 de diciembre) quedan a criterio del empleador en varias actividades: no son equivalentes a un feriado.',
          'El conteo "oficial" de feriados nacionales no incluye los puentes turísticos, aunque en la práctica se sientan igual.',
        ],
        plazo: 'los puentes turísticos se fijan por resolución del Ministerio de Turismo, normalmente con un año de anticipación.',
      },
      {
        id: 'habiles',
        label: 'Cuántos días hábiles me quedan',
        hint: 'Plazos legales y laborales',
        answer: 'Días de lunes a viernes que quedan, descontando los feriados oficiales que caen en día de semana.',
        yes: [
          'Días hábiles entre la fecha de inicio y la de fin que cargues (por defecto, hasta el 31 de diciembre)',
          'Descuento de los feriados nacionales que caen de lunes a viernes',
          'Opción de contar el sábado como día laborable, para actividades que trabajan seis días',
          'Días corridos, fines de semana y feriados del período, cada uno por separado',
        ],
        warn: [
          'Los plazos judiciales y administrativos tienen sus propias ferias y asuetos: la feria judicial de enero y la de invierno no están contempladas acá.',
          'No se descuentan feriados provinciales ni asuetos administrativos locales, que sí cuentan como inhábiles ante organismos de esa jurisdicción.',
          'Si el plazo de tu trámite se cuenta en días corridos y no hábiles, este número no es el que te sirve.',
        ],
        plazo:
          'en el procedimiento administrativo nacional los plazos se cuentan en días hábiles administrativos salvo que la norma diga expresamente lo contrario.',
      },
      {
        id: 'findes',
        label: 'Qué fines de semana largos vienen',
        hint: 'Para planificar escapadas',
        answer: 'Los feriados que caen pegados al fin de semana y cuántos días seguidos de descanso arman.',
        yes: [
          'Feriados que caen lunes o viernes: tres días seguidos sin pedir licencia',
          'Combinaciones de feriado más puente turístico, que llegan a cuatro días',
          'Cuántos días de licencia te faltarían para estirar cada fin de semana largo',
          'El total de findes largos que quedan en el año',
        ],
        warn: [
          'Un feriado martes o jueves no es fin de semana largo por sí solo: necesitás pedir el día puente.',
          'Los puentes turísticos ya vienen decretados justamente para armar el fin de semana largo, así que no hace falta pedir licencia esos días.',
          'Turismo, gastronomía, salud y transporte trabajan los findes largos: en esas actividades el feriado se paga distinto, no se descansa.',
        ],
        plazo:
          'la mayoría de los empleadores pide las vacaciones con 45 días de anticipación; para estirar un finde largo conviene avisar con ese margen.',
      },
    ],
  },

  inputsTitle: 'Desde cuándo y hasta cuándo',
  inputsIntro:
    'Si dejás las fechas vacías, contamos desde hoy hasta el 31 de diciembre del año que cubre el calendario cargado. Los dos últimos campos sólo afectan al conteo de días hábiles.',
  fields: [
    {
      id: 'desde',
      label: 'Contar desde',
      type: 'date',
      value: '',
      help: 'Vacío = hoy, con la fecha de tu dispositivo.',
    },
    {
      id: 'hasta',
      label: 'Contar hasta',
      type: 'date',
      value: '',
      help: 'Vacío = 31 de diciembre del año que cubre el calendario cargado.',
    },
    {
      id: 'sabados',
      label: '¿El sábado es día laborable para vos?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No: la semana es de lunes a viernes' },
        { value: 'si', label: 'Sí: trabajo también los sábados' },
      ],
    },
    {
      id: 'puentes',
      label: '¿Contás los puentes turísticos como día libre?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí: son días no laborables' },
        { value: 'no', label: 'No: sólo feriados nacionales' },
      ],
    },
    {
      id: 'licencia',
      label: 'Días de licencia que estás dispuesto a usar',
      type: 'number',
      min: 0,
      max: 30,
      value: 1,
      help: 'Se usa en los fines de semana largos: con cuántos días de licencia se estira cada uno.',
    },
  ],
  fineprint:
    'Todo se calcula en tu navegador con la fecha de tu dispositivo y el calendario nacional oficial cargado en el sitio. No se incluyen feriados provinciales, municipales ni ferias judiciales. Nada se envía a ningún servidor.',

  chart: {
    type: 'progress',
    title: 'Cuánto del calendario de feriados llevás gastado',
    caption:
      'La barra muestra qué proporción de los días no laborables del año ya pasó y cuánta te queda por delante. Si estás sobre el final del año, la barra queda casi llena: no es un error, es que ya no quedan feriados.',
  },
  breakdownTitle: 'El calendario, en números',
  breakdownIntro:
    'Ninguna fila de este hub es plata: cada una lleva su unidad propia, sean días, feriados o fines de semana largos.',

  faq: [
    {
      q: '¿Cuál es el próximo feriado en Argentina?',
      a: 'Sale del calendario nacional vigente, con los traslados ya aplicados: la calculadora de arriba busca la primera fecha posterior a hoy entre feriados inamovibles, trasladables, puentes turísticos y días no laborables, y te dice cuántos días faltan y en qué día de la semana cae. El calendario cargado cubre un año completo; si tu fecha queda fuera de ese año, la pantalla lo avisa en lugar de mostrar un resultado inventado.',
    },
    {
      q: '¿Cuántos feriados tiene Argentina por año?',
      a: 'Quince feriados nacionales: los inamovibles, que se conmemoran siempre en su fecha exacta, más los trasladables, que se corren al lunes para armar fin de semana largo. A eso se suman los puentes turísticos que fija cada año el Ministerio de Turismo por resolución y el día no laborable del 8 de diciembre, Inmaculada Concepción. Contando todo, el calendario llega a diecinueve días no laborables.',
    },
    {
      q: '¿Qué diferencia hay entre un feriado y un día no laborable?',
      a: 'En el feriado nacional rige la ley de descanso dominical: el trabajo es optativo para el empleado y, si trabaja, se le paga el doble. El día no laborable queda a opción del empleador: si decide dar el día, lo paga como día trabajado; si decide trabajar, se paga el jornal simple. Los puentes turísticos son días no laborables para la administración pública y el sector privado según lo que fije el decreto de cada año.',
    },
    {
      q: '¿Qué es un feriado trasladable y cómo se corre?',
      a: 'El Decreto 1584/2010 estableció que los feriados de fecha móvil que caen martes o miércoles se trasladan al lunes anterior, y los que caen jueves o viernes se trasladan al lunes siguiente. La idea es concentrar los descansos en fines de semana largos para el turismo interno. Los feriados inamovibles quedan afuera de esa regla: el 25 de mayo, el 9 de julio o el 25 de diciembre se conmemoran siempre en su fecha.',
    },
    {
      q: '¿Cómo se cuentan los días hábiles?',
      a: 'Se toman los días de lunes a viernes del período y se descuentan los feriados que caen en día de semana. Un feriado que cae sábado o domingo no resta nada, porque ya era no laborable. Si tu actividad trabaja los sábados, el hub te deja contarlos como hábiles. Para contar el período entre dos fechas concretas con más detalle, está <a href="/fechas/dias-entre-fechas">la calculadora de días entre dos fechas</a>.',
    },
    {
      q: '¿Cuántos días hábiles tiene un año en Argentina?',
      a: 'Alrededor de doscientos cuarenta y cinco: de los 365 días del año se van 104 en sábados y domingos y otros diez a quince en feriados que caen de lunes a viernes. El número exacto cambia todos los años según en qué día caiga cada feriado y cuántos puentes turísticos se decreten. En años bisiestos hay un día más que puede caer hábil o no.',
    },
    {
      q: '¿Qué fines de semana largos quedan en el año?',
      a: 'Un fin de semana largo se arma cuando el feriado cae lunes o viernes, o cuando un puente turístico se pega a un feriado. Los feriados trasladables se corren justamente al lunes para generarlos. Si el feriado cae martes o jueves, con un solo día de licencia lo convertís en cuatro días seguidos: la rama de fines de semana largos del hub te dice cuáles son y cuántos días de licencia necesita cada uno.',
    },
    {
      q: '¿Cómo se paga un feriado trabajado?',
      a: 'El artículo 166 de la Ley de Contrato de Trabajo manda pagar el día como si fuera un domingo: al jornal habitual se le suma otro tanto, es decir el doble. Si no trabajás el feriado, cobrás el día igual siempre que hayas trabajado a las órdenes del mismo empleador al menos 48 horas o seis jornadas en los diez días hábiles anteriores. En el día no laborable, en cambio, si trabajás cobrás jornal simple.',
    },
    {
      q: '¿Los feriados descuentan días de vacaciones?',
      a: 'No: las vacaciones anuales se cuentan en días corridos, así que los feriados y los fines de semana que caen dentro del período de licencia están incluidos y no se devuelven. Por eso conviene arrancar las vacaciones un día después de un feriado y no antes: si el feriado cae dentro de la licencia, lo perdés como día extra de descanso.',
    },
    {
      q: '¿Qué pasa con los feriados provinciales?',
      a: 'Cada provincia puede declarar sus propios feriados y asuetos, que rigen sólo dentro de esa jurisdicción y no están en el calendario nacional. Son ejemplos habituales las fiestas patronales, los aniversarios de fundación provincial y algunos asuetos administrativos. Este hub trabaja únicamente con el calendario nacional: si tu plazo o tu liquidación depende de un feriado local, verificalo con el organismo de tu provincia.',
    },
    {
      q: '¿Cuándo se publica el calendario del año que viene?',
      a: 'Los feriados nacionales ya están fijados por la ley 27.399 y no cambian año a año, salvo los trasladables, que se acomodan según el día de la semana en que cae la fecha. Lo que sí se decide cada año son los puentes turísticos, que el Poder Ejecutivo fija por decreto o el Ministerio de Turismo por resolución, normalmente entre septiembre y noviembre del año anterior.',
    },
    {
      q: '¿Por qué el calendario cargado cubre un solo año?',
      a: 'Porque los puentes turísticos y los traslados dependen de una norma que se dicta cada año: proyectar el calendario a futuro sería inventar días libres que todavía nadie decretó. El hub deriva el año directamente de la tabla de datos cargada, y si la fecha de hoy queda fuera de ese año te lo avisa en pantalla en vez de devolver un cero que parece un resultado válido.',
    },
  ],

  sources: [
    {
      name: 'Ley 27.399 — Régimen de feriados nacionales y días no laborables',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27399-283707',
      publisher: 'Boletín Oficial de la República Argentina',
    },
    {
      name: 'Decreto 1584/2010 — feriados trasladables',
      url: 'https://www.argentina.gob.ar/normativa/nacional/decreto-1584-2010-174391',
      publisher: 'Boletín Oficial de la República Argentina',
    },
    {
      name: 'Feriados y días no laborables — calendario oficial',
      url: 'https://www.argentina.gob.ar/interior/feriados',
      publisher: 'Ministerio del Interior',
    },
    {
      name: 'Ley 20.744 de Contrato de Trabajo — arts. 165 a 171 (feriados y días no laborables)',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552/texto',
      publisher: 'Boletín Oficial de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-feriados-argentina-2026-calendario',
    '/calculadora-dias-laborables-habiles-entre-fechas',
    '/calculadora-cuantos-feriados-restan-ano-argentina',
    '/calculadora-cuanto-falta-feriado-proximo-argentina-2026',
    '/calculadora-dias-habiles-restantes-2026',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
