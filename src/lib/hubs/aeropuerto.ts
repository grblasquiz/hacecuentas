import type { HubData } from './types';

/**
 * Hub de decisión — "¿Con cuánto tiempo tengo que llegar al aeropuerto?"
 *
 * Absorbe 8 calculadoras sueltas de logística de vuelo. La pregunta real que
 * trae a la gente son DOS momentos distintos del mismo viaje:
 *
 *   a) Salgo de casa: ¿a qué hora? → anticipo en terminal + traslado.
 *   b) Tengo una escala de X minutos: ¿me da? → MCT (minimum connecting time).
 *
 * La segunda es la que angustia, porque el MCT no es un número universal:
 * cambia según si cada tramo es doméstico o internacional, si hay que cambiar
 * de terminal, si cambiás de aerolínea (la valija no viaja sola) y si el
 * aeropuerto es un hub grande.
 *
 * LÍMITE CON EL HUB DE HUSOS (`viajes/hora-mundial`): acá NO se calcula hora de
 * llegada ni diferencia horaria. Ese hub ya resuelve el cruce de husos con
 * `Intl.DateTimeFormat` sobre 64 ciudades IANA y sería un disparate duplicar su
 * tabla o pelearle la consulta. Todo lo de acá pasa dentro de un mismo huso:
 * el reloj del aeropuerto de salida. Cuando el usuario necesita la hora de
 * aterrizaje, la FAQ lo manda a /viajes/hora-mundial.
 *
 * Arquetipo: RAMIFICADO. Los dos momentos comparten formulario pero no cuenta.
 */

/**
 * Tiempo base de conexión por combinación de tramos, en minutos.
 * Espejo exacto de `src/lib/formulas/tiempo-conexion-aeropuerto.ts`, que es la
 * más granular de las tres calculadoras de conexión que absorbe este hub.
 *
 * La lógica física detrás de los números: lo que come tiempo no es caminar,
 * es migraciones y el reingreso del equipaje. Por eso internacional → doméstico
 * (90) es la peor combinación de todas: bajás, hacés migraciones del país de
 * escala, retirás la valija, la volvés a despachar y volvés a pasar seguridad.
 */
export const CONEXION_BASE: Record<string, { min: number; label: string }> = {
  'dom-dom': { min: 45, label: 'doméstico → doméstico' },
  'dom-intl': { min: 60, label: 'doméstico → internacional' },
  'intl-intl': { min: 75, label: 'internacional → internacional' },
  'intl-dom': { min: 90, label: 'internacional → doméstico' },
};

/** Recargos sobre el tiempo base, en minutos. Mismos valores que la fórmula. */
export const CONEXION_RECARGOS = {
  otraTerminal: 30,
  otraAerolinea: 15,
  aeropuertoGrande: 30,
} as const;

/**
 * Anticipo recomendado en la terminal, en horas.
 * Espejo de `src/lib/formulas/check-in-anticipo-horas-aeropuerto.ts`.
 * base = 3 h internacional / 2 h doméstico; con sólo equipaje de mano baja a
 * 2,5 h y 1,5 h; el tamaño del aeropuerto suma media hora o resta un cuarto.
 */
export const ANTICIPO = {
  internacional: { bodega: 3, mano: 2.5 },
  domestico: { bodega: 2, mano: 1.5 },
  size: { grande: 0.5, mediano: 0, pequeno: -0.25 },
} as const;

/**
 * Velocidad media del traslado a la ciudad, en km/h: [tráfico normal, hora pico].
 * Espejo de `src/lib/formulas/traslado-aeropuerto-ciudad-tiempo.ts`.
 * El tren casi no se entera de la hora pico; el taxi pierde 40% de velocidad.
 */
export const TRASLADO_VEL: Record<string, [number, number]> = {
  taxi: [50, 30],
  tren: [80, 80],
  bus: [40, 25],
  metro: [35, 30],
};

/** Minutos antes del despegue en que suele cerrar el embarque. */
export const CIERRE_EMBARQUE_MIN = 30;

export const CASE_MATH: Record<string, { modo: 'casa' | 'escala' }> = {
  casa: { modo: 'casa' },
  escala: { modo: 'escala' },
};

export const hub: HubData = {
  slug: 'viajes/aeropuerto',
  title: '¿Con cuánto tiempo tengo que llegar al aeropuerto? Anticipo, traslado y escalas',
  description:
    'A qué hora salir de casa según el tipo de vuelo, el equipaje y el aeropuerto, y si tu escala alcanza para hacer la conexión. Calcula el anticipo en terminal, el traslado hasta el aeropuerto y el tiempo mínimo de conexión (MCT) con sus recargos por cambio de terminal y de aerolínea.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Anticipo, traslado y conexiones',
  h1: '¿Con cuánto tiempo tengo que llegar al aeropuerto?',
  lede:
    'Dos momentos, la misma angustia. Antes de salir querés saber a qué hora poner el despertador; en el aire querés saber si esa escala de 55 minutos te alcanza o ya perdiste el segundo vuelo. Acá salen los dos números: el anticipo real según tu tipo de vuelo, tu equipaje y el tamaño del aeropuerto, más el traslado hasta la terminal; y el tiempo mínimo de conexión que pide tu combinación de tramos, con los recargos que casi nadie cuenta.',
  stamps: [
    'Anticipo según vuelo, equipaje y aeropuerto',
    'Traslado con y sin hora pico',
    'MCT por combinación de tramos',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu horario',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'El cálculo cambia según en qué momento del viaje estés. Elegí el tuyo: los campos son los mismos, pero la cuenta y las advertencias no.',
    items: [
      {
        id: 'casa',
        label: 'Salgo de casa a tomar el vuelo',
        hint: 'Tenés el horario de despegue y querés saber a qué hora arrancar.',
        yes: [
          'El anticipo que conviene tener en la terminal según si el vuelo es doméstico o internacional',
          'La rebaja de anticipo si viajás sólo con equipaje de mano y no tenés que despachar',
          'El recargo por aeropuerto grande, donde caminar de la puerta de entrada al gate ya son quince minutos',
          'Los minutos de traslado desde tu casa hasta la terminal, con la velocidad real del medio que elijas',
          'La hora en que suele cerrar el embarque, media hora antes del despegue',
        ],
        warn: [
          'Estimación de tiempos a partir de los datos que cargaste. La política de cierre de mostrador y de embarque la fija cada aerolínea: confirmala en tu pasaje antes de fiarte de este número.',
          'El anticipo cuenta desde que pisás la terminal, no desde que salís de casa: el traslado va aparte y por eso se carga como campo propio.',
          'Si la hora de salida de casa cae en madrugada, revisá que el medio de transporte que elegiste funcione a esa hora: muchos trenes y buses al aeropuerto arrancan recién a las 5.',
          'En temporada alta, feriados largos y salidas entre las 6 y las 9 de la mañana los mostradores y el control de seguridad se saturan: sumale entre 30 y 45 minutos extra al resultado.',
          'Si viajás con menores, con silla de ruedas, con mascota en cabina o con equipaje especial (esquís, tabla, instrumento), el trámite en mostrador es más largo y no está contemplado acá.',
          'El horario del pasaje es siempre local del aeropuerto de salida: no le restes ni le sumes diferencia horaria a mano.',
        ],
        plazo:
          'con el resultado en la mano, agendá la alarma media hora antes de la hora de salida de casa: entre vestirse, cargar el auto y cerrar la puerta se van veinte minutos que nadie cuenta.',
        answer:
          'Salí de casa con el anticipo de terminal más el tiempo de traslado: para un internacional con valija despachada desde un aeropuerto mediano son 3 horas de terminal más lo que tardes en llegar.',
      },
      {
        id: 'escala',
        label: 'Tengo una escala y no sé si me da',
        hint: 'Sabés cuántos minutos hay entre el aterrizaje y el próximo despegue.',
        yes: [
          'El tiempo mínimo de conexión que corresponde a tu combinación de tramos, que no es el mismo para todos',
          'El recargo por cambiar de terminal, el clásico que arruina conexiones que en el papel se veían cómodas',
          'El recargo por cambiar de aerolínea, cuando el equipaje no viaja facturado hasta el destino final',
          'El recargo por aeropuerto grande, del tipo Heathrow, Charles de Gaulle o Atlanta',
          'El colchón que te queda: cuántos minutos te sobran o te faltan contra el tiempo recomendado',
          'El semáforo de riesgo, para decidir si comprás ese pasaje o buscás otra combinación',
        ],
        warn: [
          'Estimación a partir de reglas generales de conexión. El tiempo mínimo oficial (MCT) lo publica cada aeropuerto en su propia tabla y una aerolínea puede aceptar conexiones más cortas que las de acá: consultá el dato oficial antes de comprar.',
          'Si los dos tramos están en el mismo billete, la aerolínea es responsable de reubicarte cuando perdés la conexión por una demora suya. Si son dos billetes separados, el riesgo es todo tuyo y no te deben nada.',
          'Cambiar de aerolínea casi siempre significa retirar la valija y volver a despacharla, aunque las dos vuelen de la misma alianza. Preguntá en el mostrador de origen si el equipaje va facturado hasta el destino final.',
          'La escala se cuenta entre horario de aterrizaje y horario de despegue programados. El avión todavía tiene que rodar hasta la posición y abrir puertas: descontá entre 10 y 15 minutos reales antes de empezar a caminar.',
          'Una conexión que pasa por Estados Unidos obliga a hacer inmigración y aduana aunque sólo estés de tránsito: esa combinación necesita bastante más margen del que sugiere cualquier regla general.',
          'Si tu escala es la última del día hacia ese destino, perderla no cuesta unas horas sino una noche de hotel: en ese caso ignorá el semáforo amarillo y buscá margen de sobra.',
        ],
        plazo:
          'si el resultado da rojo o amarillo y todavía no compraste, cambiá de combinación ahora: reprogramar una conexión perdida con el vuelo ya emitido sale mucho más caro que elegir bien al reservar.',
        answer:
          'Tu escala alcanza si supera el tiempo mínimo de conexión de tu combinación de tramos más los recargos por cambio de terminal, cambio de aerolínea y aeropuerto grande.',
      },
    ],
  },

  inputsTitle: 'Contame tu vuelo',
  inputsIntro:
    'Los primeros campos sirven para los dos casos. Los últimos cuatro son propios de la escala: si estás calculando a qué hora salir de casa, dejalos como están y no afectan el resultado.',
  fields: [
    {
      id: 'horaVuelo',
      label: 'Hora de despegue del vuelo',
      type: 'text',
      value: '07:45',
      help: 'En formato 24 horas, HH:MM. Es la hora que figura en el pasaje, siempre local del aeropuerto de salida.',
    },
    {
      id: 'tipoVuelo',
      label: 'Tipo de vuelo',
      type: 'select',
      value: 'internacional',
      options: [
        { value: 'internacional', label: 'Internacional' },
        { value: 'domestico', label: 'Doméstico o de cabotaje' },
      ],
    },
    {
      id: 'equipaje',
      label: 'Equipaje',
      type: 'select',
      value: 'bodega',
      options: [
        { value: 'bodega', label: 'Con valija a despachar' },
        { value: 'mano', label: 'Sólo equipaje de mano' },
      ],
      help: 'Sin valija a despachar te ahorrás la cola del mostrador: media hora menos de anticipo.',
    },
    {
      id: 'aeropuertoSize',
      label: 'Tamaño del aeropuerto',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'pequeno', label: 'Chico o regional' },
        { value: 'mediano', label: 'Mediano' },
        { value: 'grande', label: 'Grande o hub internacional' },
      ],
      help: 'También se usa en el cálculo de la escala: en un hub grande caminar entre puertas se lleva media hora.',
    },
    {
      id: 'distanciaKm',
      label: 'Distancia de tu casa al aeropuerto',
      type: 'number',
      suffix: 'km',
      min: 0,
      max: 400,
      step: 1,
      value: 32,
      help: 'Distancia por ruta, no en línea recta. Poné 0 si ya estás en el aeropuerto.',
    },
    {
      id: 'medio',
      label: 'Cómo vas al aeropuerto',
      type: 'select',
      value: 'taxi',
      options: [
        { value: 'taxi', label: 'Auto, taxi o remise' },
        { value: 'tren', label: 'Tren al aeropuerto' },
        { value: 'bus', label: 'Bus o combi' },
        { value: 'metro', label: 'Subte o metro' },
      ],
    },
    {
      id: 'horaPico',
      label: 'Tráfico esperado en el traslado',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Tráfico normal' },
        { value: 'pico', label: 'Hora pico' },
      ],
    },
    {
      id: 'escalaMin',
      label: 'Duración de tu escala',
      type: 'number',
      suffix: 'minutos',
      min: 0,
      max: 1440,
      step: 5,
      value: 90,
      help: 'Minutos entre el aterrizaje programado del primer vuelo y el despegue programado del segundo.',
    },
    {
      id: 'conexion',
      label: 'Combinación de tramos de la conexión',
      type: 'select',
      value: 'intl-intl',
      options: [
        { value: 'dom-dom', label: 'Doméstico → doméstico' },
        { value: 'dom-intl', label: 'Doméstico → internacional' },
        { value: 'intl-intl', label: 'Internacional → internacional' },
        { value: 'intl-dom', label: 'Internacional → doméstico (con migraciones)' },
      ],
      help: 'Internacional → doméstico es la peor: bajás, hacés migraciones, retirás la valija y la volvés a despachar.',
    },
    {
      id: 'terminal',
      label: '¿Cambiás de terminal entre vuelos?',
      type: 'select',
      value: 'misma',
      options: [
        { value: 'misma', label: 'No, sale de la misma terminal' },
        { value: 'otra', label: 'Sí, tengo que cambiar de terminal' },
      ],
    },
    {
      id: 'aerolinea',
      label: '¿Cambiás de aerolínea?',
      type: 'select',
      value: 'misma',
      options: [
        { value: 'misma', label: 'No, es la misma aerolínea o el mismo billete' },
        { value: 'otra', label: 'Sí, son aerolíneas distintas' },
      ],
      help: 'Con aerolíneas distintas la valija normalmente no viaja facturada hasta el destino final.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Los tiempos de anticipo y de conexión son reglas generales de la industria: la política de cierre de mostrador la fija cada aerolínea y el tiempo mínimo de conexión oficial lo publica cada aeropuerto. Este cálculo trabaja siempre dentro del huso horario del aeropuerto de salida; para pasar horarios entre husos y saber a qué hora local aterrizás, usá el calculador de hora mundial.',

  chart: {
    type: 'scale',
    title: 'Dónde caés en la escala de riesgo',
    caption:
      'La barra muestra las franjas del cálculo y el marcador, tu situación. Si estás calculando a qué hora salir de casa, las franjas son los tramos de tu mañana —traslado, trámites en terminal y espera hasta el cierre de embarque— y el marcador indica en qué momento pisás la terminal. Si estás calculando una escala, las franjas son riesgoso, ajustado y cómodo, y el marcador es tu escala contra el tiempo recomendado.',
  },
  breakdownTitle: 'La cuenta, minuto por minuto',
  breakdownIntro:
    'De dónde sale cada bloque de tiempo: el anticipo en terminal, el traslado y, en el caso de la escala, el mínimo base y cada recargo por separado.',

  faq: [
    {
      q: '¿Con cuánta anticipación hay que llegar al aeropuerto?',
      a: 'La regla general es 3 horas para un vuelo internacional y 2 horas para uno doméstico, contadas desde que pisás la terminal. Si viajás sólo con equipaje de mano podés bajar a 2 horas y media y a hora y media respectivamente, porque te salteás la cola del mostrador. En un aeropuerto grande sumale media hora más, y en uno chico podés restar un cuarto de hora. A todo eso hay que agregarle el viaje desde tu casa: el anticipo no incluye el traslado.',
    },
    {
      q: '¿A qué hora tengo que salir de casa para tomar el vuelo?',
      a: 'Restale al horario de despegue el anticipo en terminal que corresponda a tu vuelo y después restale los minutos de traslado. Con un internacional a las 07:45, valija despachada, aeropuerto mediano y 40 minutos de viaje, tenés que estar en la terminal a las 04:45 y salir de casa a las 04:05. Por eso conviene hacer la cuenta la noche anterior y no a la mañana.',
    },
    {
      q: '¿Cuánto tiempo mínimo necesito entre dos vuelos para hacer la conexión?',
      a: 'Depende de la combinación de tramos. Como referencia general: 45 minutos entre dos vuelos domésticos, 60 de doméstico a internacional, 75 entre dos internacionales y 90 de internacional a doméstico, que es la peor porque implica migraciones y volver a despachar la valija. A eso hay que sumarle 30 minutos si cambiás de terminal, 15 si cambiás de aerolínea y 30 más si es un aeropuerto grande.',
    },
    {
      q: '¿Por qué internacional a doméstico necesita más tiempo que internacional a internacional?',
      a: 'Porque al llegar de un vuelo internacional y seguir en cabotaje entrás formalmente al país de la escala: pasás migraciones, retirás el equipaje de la cinta, lo despachás de nuevo en el mostrador doméstico y volvés a pasar el control de seguridad. Cuando la conexión es internacional a internacional muchas veces se hace en zona de tránsito, sin migraciones ni recogida de equipaje, y por eso el mínimo baja.',
    },
    {
      q: '¿Qué es el MCT o tiempo mínimo de conexión?',
      a: 'Es el margen más corto que un aeropuerto declara como suficiente para pasar de un vuelo a otro. Lo publica cada aeropuerto para cada combinación de terminales y de tipo de vuelo, y los sistemas de reserva lo usan para decidir si te venden una conexión. Que exista un MCT no significa que sea cómodo: es un piso técnico calculado con todo saliendo bien, sin colas ni demoras.',
    },
    {
      q: '¿Es lo mismo perder la conexión con un billete único que con dos billetes separados?',
      a: 'No, y es la diferencia más cara del viaje. Con un solo billete que incluye los dos tramos, si perdés la conexión por una demora del primer vuelo la aerolínea tiene que reubicarte sin costo. Con dos billetes comprados por separado, el segundo vuelo simplemente sale sin vos y no hay nada que reclamar: tenés que comprar otro pasaje. Por eso la escala corta se tolera con billete único y no se tolera con billetes separados.',
    },
    {
      q: '¿Cuánto tardo del aeropuerto a la ciudad?',
      a: 'Dividí la distancia por la velocidad media del medio de transporte. En auto o taxi se calcula a 50 km/h con tráfico normal y 30 km/h en hora pico; el tren al aeropuerto va a unos 80 km/h y casi no se ve afectado por el tráfico; el bus, a 40 km/h normales y 25 en pico; el subte, a 35 y 30. Con 32 km al aeropuerto en taxi y tráfico normal son unos 38 minutos, que en hora pico se convierten en 64.',
    },
    {
      q: '¿A qué hora cierra el embarque?',
      a: 'Como referencia general, la puerta cierra unos 30 minutos antes de la hora de despegue, y el mostrador de check-in bastante antes: en muchos vuelos internacionales, una hora. Cerrada la puerta no hay negociación posible aunque estés en el aeropuerto: si figurás como no presentado, la aerolínea puede cancelar además todos los tramos siguientes del mismo billete.',
    },
    {
      q: '¿Cuánto dura un vuelo según la distancia?',
      a: 'Un avión comercial de fuselaje angosto vuela a unos 880 km/h de crucero, uno regional a 720 y un turbohélice a 550. A eso hay que sumarle alrededor de media hora de rodaje y maniobras entre las dos puntas, y descontarle el viento de proa, que resta velocidad efectiva. Por eso 8.000 km en un comercial dan cerca de 9 horas y media puerta a puerta, y no las 9 exactas que sale de dividir.',
    },
    {
      q: '¿A qué hora local llego si el vuelo cruza husos horarios?',
      a: 'La hora de llegada del pasaje ya viene expresada en hora local del aeropuerto de destino, así que nunca hay que restarle la diferencia horaria a mano. Si querés hacer vos la cuenta —por ejemplo para saber si te conviene dormir en el avión o a qué hora avisar que llegás— usá el calculador de hora mundial, que resuelve el cruce de husos con la base horaria de tu dispositivo y contempla el horario de verano.',
    },
    {
      q: '¿Cuánto margen conviene dejar si viajo en temporada alta?',
      a: 'Sumale entre 30 y 45 minutos al anticipo que da el cálculo. Los fines de semana largos, las vacaciones de invierno y las salidas de madrugada saturan el control de seguridad, que es el único cuello de botella que no podés esquivar sacando el check-in online. En las conexiones, en temporada alta conviene tratar el semáforo amarillo como si fuera rojo.',
    },
    {
      q: '¿El check-in online me permite llegar más tarde?',
      a: 'Te ahorra la cola del mostrador, pero sólo si viajás con equipaje de mano. Si tenés que despachar valija igual vas a hacer fila en el mostrador de entrega de equipaje, que tiene su propio horario de cierre. El control de seguridad y, en internacional, migraciones no se acortan con el check-in online: ese tiempo lo hacés igual.',
    },
  ],

  sources: [
    {
      name: 'Minimum Connecting Time — definición y publicación del tiempo mínimo de conexión por aeropuerto',
      url: 'https://www.iata.org/en/publications/manuals/minimum-connect-time/',
      publisher: 'IATA — Asociación Internacional de Transporte Aéreo',
    },
    {
      name: 'Recomendaciones de anticipación y cierre de embarque en aeropuertos argentinos',
      url: 'https://www.aa2000.com.ar/',
      publisher: 'Aeropuertos Argentina',
    },
    {
      name: 'Derechos del pasajero aéreo: demoras, cancelaciones y conexiones perdidas',
      url: 'https://www.argentina.gob.ar/anac/pasajeros',
      publisher: 'ANAC — Administración Nacional de Aviación Civil',
    },
    {
      name: 'Reglamento (CE) 261/2004 — compensación y asistencia por denegación de embarque y conexiones perdidas',
      url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=celex%3A32004R0261',
      publisher: 'Unión Europea',
    },
    {
      name: 'Tiempos de espera en el control de seguridad y recomendaciones de llegada',
      url: 'https://www.tsa.gov/travel/security-screening',
      publisher: 'TSA — Transportation Security Administration',
    },
    {
      name: 'Tránsito y conexiones que requieren inmigración y aduana en Estados Unidos',
      url: 'https://www.cbp.gov/travel/international-visitors',
      publisher: 'CBP — U.S. Customs and Border Protection',
    },
  ],

  replaces: [
    '/calculadora-llegada-aeropuerto-minutos-vuelo',
    '/calculadora-conexion-vuelo-minimo-minutos',
    '/calculadora-escala-suficiente-tiempo',
    '/calculadora-tiempo-vuelo-estimado-avion',
    '/calculadora-traslado-aeropuerto-ciudad-tiempo',
    '/calculadora-tiempo-conexion-aeropuerto-internacional',
    '/calculadora-check-in-anticipo-horas-aeropuerto',
    '/calculadora-distancia-vuelo-2-ciudades',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};
