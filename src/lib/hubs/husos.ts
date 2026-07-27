import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué hora es allá?"
 *
 * Absorbe 5 calculadoras de husos horarios: hora en el mundo, diferencia entre
 * ciudades, conversión de zona horaria, hora de llegada de un vuelo y horario
 * de verano por país.
 *
 * DECISIÓN TÉCNICA CENTRAL: **cero tablas de offsets hardcodeadas.** Las cinco
 * calculadoras viejas guardaban el offset estándar de cada ciudad en un objeto
 * literal (`CITY_OFFSETS`, `OFFSETS`) y aclaraban en un comentario "using
 * standard", así que durante medio año daban la hora mal en todo el hemisferio
 * norte y en Chile, Paraguay y Nueva Zelanda. Acá cada ciudad viaja sólo con su
 * **zona IANA** (`Europe/Madrid`, `America/Santiago`) y el cálculo lo hace
 * `Intl.DateTimeFormat` en el navegador contra la base tzdata del sistema: el
 * horario de verano sale bien solo, y cuando un país cambia sus reglas el
 * resultado se corrige sin tocar una línea de este repo.
 *
 * Arquetipo: CÁLCULO DOMINANTE (la consulta "qué hora es en X" se lleva el
 * cluster), así que no usa `cases`: la respuesta va en `answer`.
 */

/** Ciudad = etiqueta + zona IANA. NINGÚN offset numérico, a propósito. */
export const CIUDADES: Array<{ tz: string; label: string }> = [
  // Argentina y Cono Sur
  { tz: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (Argentina)' },
  { tz: 'America/Argentina/Cordoba', label: 'Córdoba (Argentina)' },
  { tz: 'America/Argentina/Mendoza', label: 'Mendoza (Argentina)' },
  { tz: 'America/Argentina/Ushuaia', label: 'Ushuaia (Argentina)' },
  { tz: 'America/Montevideo', label: 'Montevideo (Uruguay)' },
  { tz: 'America/Santiago', label: 'Santiago (Chile)' },
  { tz: 'America/Asuncion', label: 'Asunción (Paraguay)' },
  { tz: 'America/Sao_Paulo', label: 'San Pablo (Brasil)' },
  { tz: 'America/La_Paz', label: 'La Paz (Bolivia)' },
  { tz: 'America/Lima', label: 'Lima (Perú)' },
  { tz: 'America/Bogota', label: 'Bogotá (Colombia)' },
  { tz: 'America/Guayaquil', label: 'Quito y Guayaquil (Ecuador)' },
  { tz: 'America/Caracas', label: 'Caracas (Venezuela)' },
  // Norte y Centroamérica
  { tz: 'America/Mexico_City', label: 'Ciudad de México (México)' },
  { tz: 'America/Cancun', label: 'Cancún (México)' },
  { tz: 'America/Guatemala', label: 'Guatemala' },
  { tz: 'America/Panama', label: 'Ciudad de Panamá (Panamá)' },
  { tz: 'America/Havana', label: 'La Habana (Cuba)' },
  { tz: 'America/Santo_Domingo', label: 'Santo Domingo (Rep. Dominicana)' },
  { tz: 'America/New_York', label: 'Nueva York y Miami (EE. UU.)' },
  { tz: 'America/Chicago', label: 'Chicago y Houston (EE. UU.)' },
  { tz: 'America/Denver', label: 'Denver (EE. UU.)' },
  { tz: 'America/Phoenix', label: 'Phoenix (EE. UU., sin horario de verano)' },
  { tz: 'America/Los_Angeles', label: 'Los Ángeles y San Francisco (EE. UU.)' },
  { tz: 'America/Toronto', label: 'Toronto (Canadá)' },
  { tz: 'America/Vancouver', label: 'Vancouver (Canadá)' },
  { tz: 'Pacific/Honolulu', label: 'Honolulú (Hawái)' },
  // Europa
  { tz: 'Europe/Madrid', label: 'Madrid y Barcelona (España)' },
  { tz: 'Atlantic/Canary', label: 'Islas Canarias (España)' },
  { tz: 'Europe/Lisbon', label: 'Lisboa (Portugal)' },
  { tz: 'Europe/London', label: 'Londres (Reino Unido)' },
  { tz: 'Europe/Dublin', label: 'Dublín (Irlanda)' },
  { tz: 'Europe/Paris', label: 'París (Francia)' },
  { tz: 'Europe/Rome', label: 'Roma y Milán (Italia)' },
  { tz: 'Europe/Berlin', label: 'Berlín y Múnich (Alemania)' },
  { tz: 'Europe/Amsterdam', label: 'Ámsterdam (Países Bajos)' },
  { tz: 'Europe/Zurich', label: 'Zúrich (Suiza)' },
  { tz: 'Europe/Athens', label: 'Atenas (Grecia)' },
  { tz: 'Europe/Warsaw', label: 'Varsovia (Polonia)' },
  { tz: 'Europe/Stockholm', label: 'Estocolmo (Suecia)' },
  { tz: 'Europe/Moscow', label: 'Moscú (Rusia)' },
  { tz: 'Europe/Istanbul', label: 'Estambul (Turquía)' },
  // África y Medio Oriente
  { tz: 'Africa/Casablanca', label: 'Casablanca (Marruecos)' },
  { tz: 'Africa/Lagos', label: 'Lagos (Nigeria)' },
  { tz: 'Africa/Cairo', label: 'El Cairo (Egipto)' },
  { tz: 'Africa/Johannesburg', label: 'Johannesburgo (Sudáfrica)' },
  { tz: 'Africa/Nairobi', label: 'Nairobi (Kenia)' },
  { tz: 'Asia/Jerusalem', label: 'Tel Aviv y Jerusalén (Israel)' },
  { tz: 'Asia/Dubai', label: 'Dubái (Emiratos Árabes)' },
  { tz: 'Asia/Qatar', label: 'Doha (Qatar)' },
  // Asia y Oceanía
  { tz: 'Asia/Karachi', label: 'Karachi (Pakistán)' },
  { tz: 'Asia/Kolkata', label: 'Nueva Delhi y Bombay (India)' },
  { tz: 'Asia/Bangkok', label: 'Bangkok (Tailandia)' },
  { tz: 'Asia/Jakarta', label: 'Yakarta (Indonesia)' },
  { tz: 'Asia/Singapore', label: 'Singapur' },
  { tz: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { tz: 'Asia/Shanghai', label: 'Shanghái y Pekín (China)' },
  { tz: 'Asia/Seoul', label: 'Seúl (Corea del Sur)' },
  { tz: 'Asia/Tokyo', label: 'Tokio (Japón)' },
  { tz: 'Australia/Perth', label: 'Perth (Australia)' },
  { tz: 'Australia/Brisbane', label: 'Brisbane (Australia)' },
  { tz: 'Australia/Sydney', label: 'Sídney y Melbourne (Australia)' },
  { tz: 'Pacific/Auckland', label: 'Auckland (Nueva Zelanda)' },
];

const opciones = CIUDADES.map((c) => ({ value: c.tz, label: c.label }));

export const hub: HubData = {
  slug: 'viajes/hora-mundial',
  title: '¿Qué hora es allá? Diferencia horaria, hora mundial y llegada de tu vuelo',
  description:
    'Mirá qué hora es ahora mismo en cualquier ciudad del mundo, cuánta diferencia horaria hay con la tuya, a qué hora local llegás si salís a tal hora con tal duración de vuelo y si en el destino rige el horario de verano. Calculado con la base horaria de tu dispositivo: no se desactualiza.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Husos horarios y horario de verano',
  h1: '¿Qué hora es allá?',
  lede:
    'Elegí tu ciudad y la del otro lado: te decimos qué hora es allá en este momento, cuántas horas de diferencia hay, si están en horario de verano y a qué hora local vas a aterrizar si salís a tal hora con un vuelo de tantas horas. Todo se calcula con la base de husos horarios de tu propio dispositivo, así que el cambio de hora estacional entra solo y el resultado nunca queda viejo.',
  stamps: [
    'Hora en vivo, no una tabla vieja',
    'Horario de verano resuelto automáticamente',
    'Más de 60 ciudades y zonas IANA',
    '5 calculadoras adentro',
  ],

  resultLabel: 'La hora en tu destino',

  inputsTitle: 'Decime entre qué ciudades',
  inputsIntro:
    'Con las dos ciudades ya sale la hora y la diferencia. La hora de salida y la duración del vuelo son para saber a qué hora local aterrizás.',
  fields: [
    {
      id: 'origen',
      label: 'Tu ciudad (origen)',
      type: 'select',
      value: 'America/Argentina/Buenos_Aires',
      options: opciones,
      help: 'De acá salen la hora de referencia y la diferencia horaria.',
    },
    {
      id: 'destino',
      label: 'La ciudad del otro lado (destino)',
      type: 'select',
      value: 'Europe/Madrid',
      options: opciones,
    },
    {
      id: 'horaSalida',
      label: 'Hora de salida del vuelo (hora local del origen)',
      type: 'text',
      value: '22:30',
      help: 'En formato 24 horas, HH:MM. Es la hora que figura en el pasaje, siempre local del aeropuerto de salida.',
    },
    {
      id: 'duracion',
      label: 'Duración del vuelo',
      type: 'number',
      suffix: 'horas',
      min: 0,
      max: 40,
      step: 0.25,
      value: 12.5,
      help: 'Se escribe con coma: 12,5 son 12 horas y media. Sumá las escalas si el pasaje es con conexión. Poné 0 si sólo querés la hora actual.',
    },
  ],
  fineprint:
    'La hora se calcula con la base de husos horarios (tzdata) de tu navegador contra el reloj de tu dispositivo, así que el horario de verano entra automáticamente. Si tu equipo tiene la fecha mal, el resultado va a estar mal: revisá la hora del sistema antes de fiarte del número.',

  chart: {
    type: 'timeline',
    title: 'En qué momento del día están allá',
    caption:
      'La barra es el día completo del destino, de 0 a 24 h, y el marcador muestra en qué franja están ahora. Sirve para saber si es buen momento para llamar o si del otro lado es madrugada.',
    bands: [
      { label: 'Madrugada', from: 0, to: 7, tone: 'bad' },
      { label: 'Mañana temprano', from: 7, to: 9, tone: 'warn' },
      { label: 'Horario laboral', from: 9, to: 18, tone: 'good' },
      { label: 'Tarde-noche', from: 18, to: 22, tone: 'warn' },
      { label: 'Noche cerrada', from: 22, to: 24, tone: 'bad' },
    ],
  },
  breakdownTitle: 'La cuenta completa',
  breakdownIntro: 'Diferencia horaria, husos de cada punta, horario de verano y hora de llegada de tu vuelo.',

  answer: {
    title: 'Cómo se saca la diferencia horaria',
    copy:
      'La diferencia entre dos ciudades es la resta de sus desfasajes contra UTC en ese momento: si el destino está en UTC+2 y vos en UTC−3, la diferencia es de 5 horas adelante. La trampa está en el "en ese momento": la mitad del planeta mueve el reloj dos veces al año, así que la diferencia entre Buenos Aires y Madrid es de 4 h en el invierno europeo y de 5 h en su verano.',
    yes: [
      'La hora exacta que es ahora mismo en la ciudad de destino, con su fecha',
      'La diferencia horaria vigente hoy, no la de la tabla del año pasado',
      'Si en el destino rige en este momento el horario de verano y cuánto adelantaron el reloj',
      'A qué hora local aterrizás y si es el mismo día, el día siguiente o el anterior',
      'El desfasaje contra UTC de las dos ciudades, para leer horarios publicados en GMT',
      'En qué franja del día están del otro lado, para no llamar a la madrugada',
    ],
    warn: [
      'La diferencia horaria con Europa y Estados Unidos cambia dos veces al año: cualquier tabla fija de offsets está mal la mitad del tiempo.',
      'Los hemisferios cambian el reloj en meses opuestos, así que hay semanas de marzo, abril, septiembre y octubre en que la diferencia es rara por unos días.',
      'India, Irán, Nepal y parte de Australia tienen husos con media hora o 45 minutos de desfasaje: no todo es en horas redondas.',
      'Argentina no aplica horario de verano desde 2009, pero Chile, Paraguay y Brasil cambiaron su política en años recientes: no asumas el comportamiento del país vecino.',
      'La hora de salida y la de llegada del pasaje siempre son locales de cada aeropuerto: nunca hay que restarles la diferencia horaria a mano.',
      'Si el vuelo tiene escala, la duración a cargar es la total puerta a puerta, incluyendo el tiempo de conexión.',
    ],
    plazo:
      'para coordinar una reunión, apuntá a que la hora local del otro lado caiga entre las 9 y las 18: es la única franja que funciona en las dos puntas sin que nadie madrugue.',
  },

  faq: [
    {
      q: '¿Cuántas horas de diferencia hay entre Argentina y España?',
      a: 'Depende de la época del año. Argentina está fija en UTC−3 y España pasa de UTC+1 en invierno a UTC+2 en verano, así que la diferencia es de 4 horas entre fines de octubre y fines de marzo, y de 5 horas el resto del año. Esta herramienta usa el valor vigente hoy, no un promedio.',
    },
    {
      q: '¿Cómo se calcula la diferencia horaria entre dos ciudades?',
      a: 'Se restan los desfasajes contra UTC de cada una en ese momento: diferencia = UTC del destino − UTC del origen. Un resultado positivo significa que en el destino ya es más tarde, y uno negativo, que van atrasados respecto de vos.',
    },
    {
      q: '¿A qué hora llego si salgo a las 22:30 y el vuelo dura 12 horas y media?',
      a: 'Se suma la duración a la hora de salida y después se pasa el resultado al huso del destino. Con un Buenos Aires–Madrid saliendo 22:30 y 12 h 30 de vuelo llegás cerca de las 16:00 hora de Madrid del día siguiente. El pasaje ya trae ese número, pero la cuenta sirve para planificar traslados y check-in.',
    },
    {
      q: '¿La hora que figura en el pasaje es la local o la de mi ciudad?',
      a: 'Siempre la local de cada aeropuerto: la de salida en hora del origen y la de llegada en hora del destino. Por eso un vuelo de 12 horas puede figurar como si durara 4: la diferencia horaria ya está aplicada en el horario impreso.',
    },
    {
      q: '¿Qué es el horario de verano y qué países lo usan?',
      a: 'Es adelantar el reloj una hora durante los meses de más luz para aprovechar la tarde. Lo usan casi toda Europa, Estados Unidos y Canadá (con excepciones como Arizona y Hawái), Chile, Nueva Zelanda y parte de Australia. Argentina no lo aplica desde 2009, México lo eliminó en 2022 en casi todo su territorio y Paraguay lo abolió en 2024.',
    },
    {
      q: '¿Cuándo cambian la hora en Europa y en Estados Unidos?',
      a: 'En la Unión Europea el reloj se adelanta el último domingo de marzo y se atrasa el último domingo de octubre. En Estados Unidos y Canadá el cambio es el segundo domingo de marzo y el primer domingo de noviembre. Como las fechas no coinciden, hay dos o tres semanas al año en que la diferencia horaria con Europa y con Estados Unidos no es la habitual.',
    },
    {
      q: '¿Cómo sé si en mi destino rige ahora el horario de verano?',
      a: 'El resultado te lo dice: comparamos el desfasaje actual de esa zona con el que tiene en enero y en julio. Si el de hoy es el más adelantado de los dos, están en horario de verano, y te mostramos cuánto adelantaron el reloj.',
    },
    {
      q: '¿Por qué otras calculadoras de husos horarios me dan la hora mal?',
      a: 'Porque guardan una tabla fija con el huso estándar de cada ciudad y no contemplan el horario de verano, así que durante la mitad del año se equivocan por una hora entera en todo el hemisferio norte. Acá no hay tabla: cada ciudad viaja con su zona IANA y el cálculo lo hace la base horaria de tu dispositivo, que se actualiza con el sistema operativo.',
    },
    {
      q: '¿Qué es UTC y en qué se diferencia de GMT?',
      a: 'UTC es el estándar de tiempo coordinado a partir del cual se define el desfasaje de todos los husos del planeta. GMT era el sistema anterior, basado en el meridiano de Greenwich, y para el uso cotidiano son equivalentes: cuando un horario está publicado en GMT podés leerlo como UTC sin problema.',
    },
    {
      q: '¿Hay zonas horarias con media hora de diferencia?',
      a: 'Sí. India y Sri Lanka están en UTC+5:30, Irán en UTC+3:30, Nepal en UTC+5:45 y algunas zonas de Australia en UTC+9:30. Por eso la diferencia con esos destinos no da un número redondo de horas.',
    },
    {
      q: '¿A qué hora conviene coordinar una reunión entre Argentina y Europa?',
      a: 'La franja que funciona en las dos puntas suele ser entre las 9 y las 12 de Buenos Aires, que caen entre el mediodía y la media tarde en Europa continental. Después de las 14 de Argentina, del otro lado ya se está terminando la jornada.',
    },
    {
      q: '¿Cuánto tarda el cuerpo en adaptarse al cambio de huso?',
      a: 'La referencia habitual es cerca de una hora de ajuste por día, y viajar al este cuesta más que al oeste porque hay que adelantar el sueño en vez de estirarlo. Con cinco horas de diferencia, contá unos cuatro o cinco días hasta sentirte del todo en hora.',
    },
  ],

  sources: [
    {
      name: 'Time Zone Database (tzdata) — base de husos horarios y reglas de horario de verano',
      url: 'https://www.iana.org/time-zones',
      publisher: 'IANA — Internet Assigned Numbers Authority',
    },
    {
      name: 'Intl.DateTimeFormat — conversión de husos horarios en el navegador',
      url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
      publisher: 'MDN Web Docs',
    },
    {
      name: 'Directiva 2000/84/CE — fechas del cambio de hora en la Unión Europea',
      url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=celex%3A32000L0084',
      publisher: 'Unión Europea',
    },
    {
      name: 'Daylight Saving Time — fechas y excepciones en Estados Unidos',
      url: 'https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst',
      publisher: 'NIST — National Institute of Standards and Technology',
    },
    {
      name: 'Jet lag: síntomas y adaptación al cambio de huso horario',
      url: 'https://wwwnc.cdc.gov/travel/yellowbook/2024/environmental-hazards-risks/jet-lag',
      publisher: 'CDC — Centers for Disease Control and Prevention',
    },
    {
      name: 'Coordinated Universal Time (UTC) — definición del estándar',
      url: 'https://www.bipm.org/en/time-metrology/utc',
      publisher: 'BIPM — Oficina Internacional de Pesas y Medidas',
    },
  ],

  replaces: [
    '/calculadora-horario-llegada-zona-horaria',
    '/calculadora-diferencia-horaria-ciudades-paises',
    '/calculadora-hora-mundo-zona-horaria',
    '/calculadora-zona-horaria-diferencia-ciudades-convertir',
    '/calculadora-horario-de-verano-cambio-hora-por-pais',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
