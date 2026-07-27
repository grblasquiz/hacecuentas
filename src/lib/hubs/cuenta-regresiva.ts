import type { HubData } from './types';
import { FERIADOS_AR_2026 } from '../data/feriados-ar-2026';

/**
 * Hub de decisión — "¿Cuánto falta para…?"
 * Arquetipo RAMIFICADO: una fecha que elijo (default), Navidad y fin de año,
 * el próximo feriado, y las fechas que se mueven cada año.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HUB QUE CADUCA. Regla dura: acá NO se hardcodea ningún año ni en el copy ni
 * en el cálculo. Todo se deriva de la fecha del dispositivo en tiempo de
 * ejecución. Una fecha ya pasada NO devuelve un número negativo: devuelve la
 * próxima ocurrencia ("ya pasó, faltan X para la siguiente"). Si alguien lee
 * esta página en 2029 tiene que seguir siendo correcta.
 *
 * FORMATO: acá NO hay plata. Todas las filas viajan con `format: 'unit'` y su
 * `unit`, y el resultado declara `format: 'unit'`. El runtime hace
 * Object.assign sobre el formato base, así que una fila sin `format` propio
 * saldría con "$" adelante.
 *
 * TABLA DE FERIADOS: `feriados-ar-2026.ts` cubre UN solo año. Si la fecha de
 * hoy cae fuera de ese año, la rama del feriado avisa en pantalla en vez de
 * devolver 0.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Próxima Navidad respecto del momento del build. Sólo para precargar el campo. */
function proximaNavidadISO(): string {
  const hoy = new Date();
  const anio = hoy.getMonth() === 11 && hoy.getDate() > 25 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  return `${anio}-12-25`;
}

export const hub: HubData = {
  slug: 'fechas/cuenta-regresiva',
  title: '¿Cuánto falta para…? Cuenta regresiva en días, horas y segundos',
  description:
    'Cuánto falta para la fecha que quieras, para Navidad y fin de año, para el próximo feriado en Argentina y para las fechas que se mueven cada año (Día del Padre, de la Madre y del Niño). En días, horas, minutos y segundos.',
  silo: 'Fechas',
  siloHref: '/fechas',

  eyebrow: 'Fechas y calendario',
  h1: '¿Cuánto falta para…?',
  lede:
    'Elegí una fecha y te decimos cuánto falta en días, horas, minutos y segundos, más cuánto llevás transcurrido del período. Si la fecha ya pasó, la cuenta salta sola a la próxima vez que se repite.',
  stamps: ['Actualizado 27-07-2026', 'Feriados: ley 27.399 · Decreto 1584/2010', '10 calculadoras adentro'],

  resultLabel: 'Cuánto falta',

  cases: {
    title: '¿Para cuándo estás contando?',
    intro: 'Partimos de una fecha elegida por vos. Si querés otra cuenta, cambiala.',
    items: [
      {
        id: 'fecha',
        label: 'Una fecha que elijo yo',
        hint: 'El caso más común',
        answer: 'Contamos desde ahora mismo hasta la fecha y hora que cargues.',
        yes: [
          'La cuenta corre con el reloj de tu dispositivo, hora local, al segundo',
          'Podés fijar la hora del día: sirve para exámenes, vuelos, partidos y vencimientos',
          'Se muestran los días hábiles además de los días corridos',
          'También calculamos cuándo se cumplen 10.000 días desde esa fecha',
        ],
        warn: [
          'Si la fecha ya pasó, la cuenta salta al mismo día del año siguiente en vez de dar un número negativo.',
          'No se aplican husos horarios ni cambios de hora: se usa la hora local de tu dispositivo.',
          'Los días hábiles son una estimación de lunes a viernes: no descuentan feriados de tu provincia.',
        ],
        plazo: 'la cuenta se recalcula sola cada vez que abrís la página: no hay nada que actualizar a mano.',
      },
      {
        id: 'navidad',
        label: 'Navidad y fin de año',
        hint: '25 de diciembre y 1 de enero',
        answer: 'Cuánto falta para la próxima Navidad y para el próximo Año Nuevo.',
        yes: [
          'Navidad: 25 de diciembre a las 00:00, la próxima que venga',
          'Fin de año: el 31 de diciembre a las 23:59, cuando arranca el año siguiente',
          'Nochebuena y Nochevieja se muestran aparte, porque la gente cuenta hasta la noche anterior',
          'El 25 de diciembre y el 1 de enero son feriados inamovibles en Argentina (ley 27.399)',
        ],
        warn: [
          'Después del 25 de diciembre la cuenta pasa automáticamente a la Navidad del año siguiente.',
          'El 24 y el 31 de diciembre no son feriados nacionales: son días laborables salvo acuerdo del convenio.',
        ],
        plazo: 'la segunda cuota del aguinaldo vence el 18 de diciembre, una semana antes de Navidad.',
      },
      {
        id: 'feriado',
        label: 'El próximo feriado',
        hint: 'Calendario nacional argentino',
        answer: 'El próximo día no laborable del calendario nacional y cuántos días faltan.',
        yes: [
          'Feriados inamovibles, trasladables, puentes turísticos y días no laborables',
          'Las fechas ya vienen con los traslados aplicados (Decreto 1584/2010)',
          'Se muestra también el fin de semana largo, cuando el feriado cae pegado al finde',
        ],
        warn: [
          'La tabla cargada cubre un solo año calendario. Si la fecha de hoy queda fuera de ese año, la pantalla lo avisa en vez de dar 0.',
          'No incluye feriados provinciales ni conmemoraciones de culto: sólo el calendario nacional.',
          'Los puentes turísticos son días no laborables, no feriados: el pago no siempre se duplica.',
        ],
        plazo: 'el calendario del año siguiente se publica por decreto entre septiembre y noviembre.',
      },
      {
        id: 'moviles',
        label: 'Fechas que se mueven cada año',
        hint: 'Día del Padre, de la Madre y del Niño',
        answer: 'Estas fechas caen en un domingo distinto cada año: se calculan, no se memorizan.',
        yes: [
          'Día del Padre, Día de la Madre y Día del Niño, según el país que elijas',
          'La regla se aplica sobre el año en curso y, si ya pasó, sobre el siguiente',
          'En Argentina las tres caen en domingo: tercero de junio, tercero de octubre y tercero de agosto',
        ],
        warn: [
          'Ninguna de las tres es feriado: son fechas comerciales, no días no laborables.',
          'Cambian por país: en España el Día del Padre es el 19 de marzo y en México el Día de la Madre es el 10 de mayo, siempre fijos.',
          'El Día del Niño en España no tiene fecha nacional propia: se usa el Día Universal del Niño de la ONU, el 20 de noviembre.',
        ],
        plazo:
          'en Argentina el Día del Niño se movió varias veces de fecha: desde 2013 la Cámara del sector lo fija el tercer domingo de agosto.',
      },
    ],
  },

  inputsTitle: 'Completá lo que necesites',
  inputsIntro:
    'La fecha y la hora se usan en el caso "una fecha que elijo yo". El país sólo importa para las fechas que se mueven cada año.',
  fields: [
    { id: 'objetivo', label: 'La fecha que te interesa', type: 'date', value: proximaNavidadISO() },
    {
      id: 'hora',
      label: 'Hora de ese día (0 a 23)',
      type: 'number',
      min: 0,
      max: 23,
      value: 0,
      help: 'Si no importa, dejá 0: cuenta hasta la medianoche.',
    },
    {
      id: 'pais',
      label: 'País (para Día del Padre, de la Madre y del Niño)',
      type: 'select',
      value: 'ar',
      options: [
        { value: 'ar', label: 'Argentina' },
        { value: 'es', label: 'España' },
        { value: 'mx', label: 'México' },
        { value: 'cl', label: 'Chile' },
        { value: 'uy', label: 'Uruguay' },
        { value: 'co', label: 'Colombia' },
        { value: 'pe', label: 'Perú' },
      ],
    },
    {
      id: 'diaVenc',
      label: 'Día de vencimiento de tu tarjeta',
      type: 'number',
      min: 1,
      max: 31,
      value: 10,
      help: 'Aparece como fila extra en todos los casos.',
    },
  ],
  fineprint:
    'Todo se calcula en tu navegador con la fecha y la hora de tu dispositivo. Si tu reloj está mal, la cuenta también. Nada se envía a ningún servidor.',

  chart: {
    type: 'progress',
    title: 'Cuánto llevás del período',
    caption:
      'La barra muestra qué parte del período ya transcurrió y qué parte falta. El período va desde la vez anterior en que ocurrió el hito hasta la próxima.',
  },
  breakdownTitle: 'La misma espera en todas las unidades',
  breakdownIntro:
    'Días, horas, minutos y segundos son el mismo tiempo contado distinto. Ninguna fila es plata: cada una lleva su unidad.',

  faq: [
    {
      q: '¿Cuántos días faltan para Navidad?',
      a: 'Se cuentan los días corridos entre hoy y el próximo 25 de diciembre a las 00:00. Si estás leyendo esto después del 25, la cuenta salta automáticamente a la Navidad del año siguiente, así que el número nunca es negativo. Arriba lo ves al día, con las horas, los minutos y los segundos incluidos.',
    },
    {
      q: '¿Cuánto falta para fin de año?',
      a: 'Hasta el 31 de diciembre a las 23:59, que es cuando arranca el año nuevo. La cuenta suele mostrarse en días, horas, minutos y segundos porque a medida que se acerca la fecha los días dejan de alcanzar. El 1 de enero es feriado inamovible en Argentina según la ley 27.399.',
    },
    {
      q: '¿Cuál es el próximo feriado en Argentina?',
      a: 'Sale del calendario nacional vigente: feriados inamovibles, trasladables (que se corren al lunes por el Decreto 1584/2010), puentes turísticos fijados por resolución del Ministerio de Turismo y días no laborables. La tabla cargada acá cubre un año calendario completo; si la fecha de hoy queda fuera de ese año, la pantalla lo avisa en vez de mostrar un cero engañoso.',
    },
    {
      q: '¿Cuándo es el Día del Padre?',
      a: 'En Argentina, Chile, México, Colombia y Perú es el tercer domingo de junio, así que cambia de fecha todos los años. En Uruguay es el segundo domingo de julio y en España es fijo: el 19 de marzo, día de San José. Ninguna de esas fechas es feriado.',
    },
    {
      q: '¿Cuándo es el Día de la Madre y el Día del Niño?',
      a: 'El Día de la Madre en Argentina es el tercer domingo de octubre, el único país de la región que lo corre a octubre; en Chile, Colombia, Uruguay y Perú es el segundo domingo de mayo, en España el primer domingo de mayo y en México siempre el 10 de mayo. El Día del Niño en Argentina es el tercer domingo de agosto, en Chile y Uruguay el segundo domingo de agosto, en Perú el tercer domingo de agosto, en México el 30 de abril y en Colombia el último sábado de abril.',
    },
    {
      q: '¿Cómo se cuentan los días entre dos fechas?',
      a: 'Se toma la diferencia en milisegundos entre las dos fechas y se divide por los milisegundos que tiene un día. Ese método contempla solo los años bisiestos, así que el resultado nunca coincide con multiplicar años por 365. Los días hábiles se estiman aparte descontando sábados y domingos.',
    },
    {
      q: '¿Qué pasa si la fecha que puse ya pasó?',
      a: 'No devolvemos un número negativo. Si la fecha quedó atrás, la cuenta salta al mismo día y mes del año siguiente y se avisa en pantalla que la original ya ocurrió, junto con cuántos días pasaron desde entonces. Es lo que espera cualquiera que abra una cuenta regresiva vieja.',
    },
    {
      q: '¿Cuándo se cumplen mis 10.000 días?',
      a: 'Se le suman 10.000 días corridos a la fecha que cargues, sin importar bisiestos ni meses: 10.000 días son unos 27 años y 4 meses. Es una efeméride personal habitual porque cae en una fecha que ninguna otra cuenta redonda marca.',
    },
    {
      q: '¿Cuánto falta para el próximo Mundial de fútbol?',
      a: 'El Mundial 2026 de Estados Unidos, México y Canadá terminó el 19 de julio de 2026, así que la próxima cita es el Mundial 2030, con sede repartida entre España, Portugal y Marruecos y tres partidos inaugurales en Sudamérica. La FIFA todavía no publicó el calendario exacto, así que la cuenta usa junio de 2030 como referencia estimada.',
    },
    {
      q: '¿Cuánto falta para el verano?',
      a: 'En el hemisferio sur el verano arranca con el solsticio del 21 de diciembre y se extiende hasta el 21 de marzo. Enero y febrero son los meses centrales de la temporada alta en la costa argentina, que es cuando la mayoría toma vacaciones.',
    },
    {
      q: '¿Cuánto falta para que venza mi tarjeta de crédito?',
      a: 'Se toma el día de vencimiento que cargues y se busca la próxima vez que cae ese día del mes. Si el mes no tiene ese número (por ejemplo un vencimiento el 31 en un mes de 30 días), el vencimiento se corre al último día del mes. Ojo: si la fecha cae sábado, domingo o feriado, el banco suele correr el vencimiento al primer día hábil siguiente.',
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
      name: 'FIFA World Cup 2030 — sedes confirmadas',
      url: 'https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026',
      publisher: 'FIFA',
    },
  ],

  replaces: [
    '/calculadora-cuando-son-las-proximas-elecciones-por-pais',
    '/calculadora-cuantos-dias-faltan-Navidad-2026',
    '/calculadora-cuenta-regresiva-dias-faltan',
    '/calculadora-cuanto-falta-fin-de-ano-2026-dias-horas-segundos',
    '/calculadora-cuenta-regresiva-dias-hasta-fecha',
    '/calculadora-cuando-es-el-dia-del-padre-madre-nino-por-pais',
    '/calculadora-fecha-10000-dias',
    '/calculadora-cuanto-falta-verano-enero-febrero',
    '/calculadora-cuanto-falta-venc-tarjeta-credito-mes',
    '/calculadora-cuanto-falta-mundial-fifa-2026-2030',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Feriados nacionales cargados. Es la tabla de UN año: el compute() deriva el
 * año de la propia tabla y avisa si hoy queda afuera. No agregar años a mano
 * acá: se agrega el archivo de datos y se importa.
 */
export const FERIADOS = FERIADOS_AR_2026.map((f) => ({ fecha: f.fecha, nombre: f.nombre, tipo: f.tipo }));

/**
 * Reglas de las fechas móviles por país.
 *  - `dom`: n-ésimo domingo del mes (mes 1-12, n 1-5).
 *  - `sab`: n-ésimo sábado; n negativo = contado desde el final ( -1 = último ).
 *  - `fija`: día y mes fijos.
 */
export type ReglaFecha =
  | { tipo: 'dom'; mes: number; n: number }
  | { tipo: 'sab'; mes: number; n: number }
  | { tipo: 'fija'; mes: number; dia: number };

export const FECHAS_MOVILES: Record<string, { pais: string; padre: ReglaFecha; madre: ReglaFecha; nino: ReglaFecha; ninoNota?: string }> = {
  ar: {
    pais: 'Argentina',
    padre: { tipo: 'dom', mes: 6, n: 3 },
    madre: { tipo: 'dom', mes: 10, n: 3 },
    nino: { tipo: 'dom', mes: 8, n: 3 },
  },
  es: {
    pais: 'España',
    padre: { tipo: 'fija', mes: 3, dia: 19 },
    madre: { tipo: 'dom', mes: 5, n: 1 },
    nino: { tipo: 'fija', mes: 11, dia: 20 },
    ninoNota: 'Día Universal del Niño (ONU): España no tiene fecha nacional propia',
  },
  mx: {
    pais: 'México',
    padre: { tipo: 'dom', mes: 6, n: 3 },
    madre: { tipo: 'fija', mes: 5, dia: 10 },
    nino: { tipo: 'fija', mes: 4, dia: 30 },
  },
  cl: {
    pais: 'Chile',
    padre: { tipo: 'dom', mes: 6, n: 3 },
    madre: { tipo: 'dom', mes: 5, n: 2 },
    nino: { tipo: 'dom', mes: 8, n: 2 },
  },
  uy: {
    pais: 'Uruguay',
    padre: { tipo: 'dom', mes: 7, n: 2 },
    madre: { tipo: 'dom', mes: 5, n: 2 },
    nino: { tipo: 'dom', mes: 8, n: 2 },
  },
  co: {
    pais: 'Colombia',
    padre: { tipo: 'dom', mes: 6, n: 3 },
    madre: { tipo: 'dom', mes: 5, n: 2 },
    nino: { tipo: 'sab', mes: 4, n: -1 },
  },
  pe: {
    pais: 'Perú',
    padre: { tipo: 'dom', mes: 6, n: 3 },
    madre: { tipo: 'dom', mes: 5, n: 2 },
    nino: { tipo: 'dom', mes: 8, n: 3 },
  },
};

/** Solsticio de verano en el hemisferio sur (referencia: 21 de diciembre). */
export const VERANO_MES = 12;
export const VERANO_DIA = 21;

/**
 * Arranque estimado del Mundial 2030 (España · Portugal · Marruecos).
 * La FIFA todavía no publicó el calendario: junio es la ventana histórica del
 * torneo en el hemisferio norte. Se informa como estimación, no como dato.
 */
export const MUNDIAL_2030 = { anio: 2030, mes: 6, dia: 1 };

/** Efeméride personal clásica: 10.000 días corridos desde una fecha. */
export const HITO_DIAS = 10000;
