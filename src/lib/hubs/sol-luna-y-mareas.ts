import type { HubData } from './types';

/**
 * Hub de decisión — "Sol, Luna y mareas: qué pasa hoy en el cielo"
 * Arquetipo RAMIFICADO (4 casos): amanecer/atardecer de hoy (default), fase
 * lunar de hoy, retraso diario del amanecer cerca de los solsticios, y mareas
 * en la costa.
 *
 * Absorbe 4 calculadoras sueltas (ver `replaces`).
 *
 * LO QUE LO HACE DISTINTO: todo se resuelve para HOY y para el lugar del
 * usuario. Los campos de fecha y hora arrancan VACÍOS a propósito: compute()
 * los reemplaza por `new Date()`, así que apretar el botón sin cargar nada
 * devuelve el dato de hoy. (El panel arranca en $0 hasta que se aprieta el
 * botón: eso es decisión de producto y no se toca.)
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio.
 *  - `chart.type: 'scale'`: la regla es de HORAS DE LUZ, de 0 a 24 h, lineal.
 *    Es la única magnitud que está definida en las CUATRO ramas (todas parten
 *    de una fecha y un lugar), así que ninguna rama tiene que inventar una
 *    posición ni disculparse por ella.
 *
 * EXACTITUD (regla dura). Las cuatro fórmulas viejas se auditaron una por una:
 *
 *  1. horas-luz-dia-fecha-latitud.ts — usaba la declinación de Cooper (1969),
 *     δ = 23,45°·sin(360/365·(N+284)), y el arco horario GEOMÉTRICO
 *     (centro del Sol exactamente en el horizonte, 0°). Eso ignora la
 *     refracción atmosférica y el radio del disco solar, que es lo que usan
 *     todas las tablas de orto y ocaso: el estándar es −0,833°. Resultado: la
 *     calc vieja SUBESTIMABA la duración del día en ~7-9 minutos en latitudes
 *     medias. Acá se usa el algoritmo solar de la NOAA (serie de Spencer para
 *     la declinación + ecuación del tiempo) con el cenit de 90,833°.
 *
 *  2. retraso-amanecer-atardecer.ts — repartía el cambio de duración del día
 *     en mitades simétricas: −Δ/2 al amanecer y +Δ/2 al atardecer. Eso es
 *     falso, y justamente borra el fenómeno más interesante: como el mediodía
 *     solar se corre por la ECUACIÓN DEL TIEMPO, el amanecer y el atardecer NO
 *     se mueven lo mismo, y por eso el amanecer más tardío del año no cae el
 *     día más corto. Acá cada uno se calcula por separado, de verdad.
 *
 *  3. fase-lunar-proxima-luna-llena.ts — fase media con ciclo sinódico
 *     29,530589 d anclada a la luna nueva del 2000-01-06 18:14 UTC. Es el
 *     método estándar de bolsillo y se conserva, pero la Luna se adelanta o
 *     atrasa hasta ±14 h respecto de la media por la excentricidad de su
 *     órbita: la fecha de la próxima llena puede correrse medio día.
 *
 *  4. mareas-ciclo-lunar-costa.ts — modelo genérico de una sola componente
 *     (M2, 12 h 25 min) con un anclaje de fase ARBITRARIO y amplitudes a ojo
 *     por puerto. Se conserva el mismo cálculo para no romper la continuidad,
 *     pero la advertencia va MUCHO más fuerte: las horas absolutas pueden
 *     errar por horas, no por minutos. En la costa eso es peligroso: las
 *     tablas del Servicio de Hidrografía Naval son las únicas válidas.
 *
 * HEMISFERIO SUR: verificado. La declinación entra con el signo real y la
 * latitud negativa invierte el arco horario sola, así que las estaciones salen
 * bien al sur del ecuador (en julio el día es CORTO en Buenos Aires y LARGO en
 * Madrid). Los nombres de fase lunar tampoco están invertidos; lo que sí se
 * invierte es el DIBUJO: al sur la luna creciente se ilumina por la izquierda.
 */
export const hub: HubData = {
  slug: 'ciencia/sol-luna-y-mareas',
  title: 'Amanecer, atardecer, fase lunar y mareas de hoy',
  description:
    'A qué hora amanece y anochece hoy en tu ciudad, cuántas horas de luz hay, qué fase lunar se ve esta noche y cuándo es la próxima luna llena, cuántos minutos por día se corre el amanecer y cuándo sube la marea en la costa. Todo calculado para la fecha de hoy y tu latitud.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Astronomía de todos los días',
  h1: '¿A qué hora amanece, qué fase lunar hay y cuándo sube la marea?',
  lede:
    'Las cuatro preguntas que uno se hace mirando el cielo, resueltas para hoy y para donde estés parado: a qué hora sale y se pone el sol, cuánta luz queda, qué luna hay esta noche y cómo se mueve el agua en la costa. Dejá la fecha y la hora en blanco y el cálculo sale con el momento actual.',
  stamps: [
    'Se calcula para hoy y tu latitud',
    'Algoritmo solar de la NOAA (ecuación del tiempo + refracción)',
    'Mareas: estimación, no reemplaza al SHN',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Resultado para hoy',

  cases: {
    title: '¿Qué querés saber del cielo de hoy?',
    intro:
      'Las cuatro ramas comparten el mismo panel: elegí tu ciudad y listo. Si dejás la fecha y la hora vacías, el cálculo usa el momento en el que apretás el botón, así que el resultado es literalmente el de hoy.',
    items: [
      {
        id: 'hoy',
        label: 'A qué hora amanece y anochece hoy',
        hint: 'Orto, ocaso, mediodía solar y horas de luz',
        answer:
          'El sol sale y se pone cuando su borde superior toca el horizonte, no cuando su centro lo cruza: contando la refracción atmosférica el día dura entre 7 y 9 minutos más de lo que da la fórmula geométrica.',
        yes: [
          'La hora exacta del amanecer y del atardecer de hoy en tu ciudad, en hora local',
          'Cuántas horas y minutos de luz hay hoy, y cuánto falta para que se haga de noche',
          'La hora del mediodía solar, que casi nunca son las 12:00 del reloj',
          'La duración del crepúsculo civil: cuánta luz útil queda después de que el sol se esconde',
          'La declinación solar del día y la corrección de la ecuación del tiempo',
        ],
        warn: [
          'Todo esto es para horizonte llano y nivel del mar: una sierra al oeste te puede robar veinte minutos de sol',
          'La hora local sale del huso que elegiste; Argentina está en UTC−3 todo el año, sin horario de verano desde 2009',
          'El amanecer no es el momento en que aclara: la luz empieza mucho antes, en el crepúsculo',
          'En latitudes muy altas, cerca de los solsticios, puede no haber amanecer ni atardecer en todo el día',
        ],
        plazo:
          'en Buenos Aires el día más corto del año dura unas 9 h 50 min y el más largo unas 14 h 25 min: entre uno y otro hay cuatro horas y media de diferencia.',
      },
      {
        id: 'luna',
        label: 'Qué fase lunar hay hoy',
        hint: 'Fase, iluminación y próxima luna llena',
        answer:
          'La fase se lee por la edad lunar: el ciclo dura 29 días, 12 horas y 44 minutos, y la iluminación del disco va de 0% en luna nueva a 100% en llena.',
        yes: [
          'Qué fase hay hoy, con el porcentaje del disco iluminado',
          'La edad de la Luna en días dentro del ciclo y si está creciendo o menguando',
          'Las fechas de la próxima luna nueva, llena, cuarto creciente y cuarto menguante',
          'Cuántos días faltan para cada una de esas cuatro',
          'La aclaración que casi nadie hace: cómo se ve la creciente desde el hemisferio sur',
        ],
        warn: [
          'Es la fase MEDIA: la órbita lunar es elíptica y la Luna se adelanta o atrasa hasta unas 14 horas respecto de la media, así que la fecha de la próxima llena puede correrse medio día',
          'Las fechas de las fases se dan en UTC: en Argentina hay que restarles 3 horas, y eso a veces cambia el día del calendario',
          'Desde el hemisferio sur la luna creciente se ilumina del lado IZQUIERDO, al revés de casi todas las ilustraciones, que son del hemisferio norte',
          'La luna llena no dura una noche: el ojo no distingue un 99% de un 100%, así que se ve llena unas tres noches seguidas',
        ],
        plazo:
          'la Luna sale en promedio unos 50 minutos más tarde cada día, y por eso la luna llena siempre aparece más o menos cuando se pone el sol.',
      },
      {
        id: 'retraso',
        label: 'Por qué el amanecer más tardío no cae el día más corto',
        hint: 'Cuántos minutos por día se corre el sol',
        answer:
          'Porque el mediodía solar se mueve: por la ecuación del tiempo el amanecer y el atardecer no se corren lo mismo, así que el amanecer más tardío del año cae unas dos semanas después del día más corto.',
        yes: [
          'Cuántos minutos por día se está corriendo hoy el amanecer y cuántos el atardecer, por separado',
          'Si el día se está alargando o acortando, y a qué ritmo',
          'La fecha del día más corto, la del amanecer más tardío y la del atardecer más temprano del año, que son TRES fechas distintas',
          'Cuántos días de diferencia hay entre esas tres fechas en tu latitud',
          'Por qué a fines de junio ya anochece más tarde aunque todavía amanezca más tarde también',
        ],
        warn: [
          'El desfasaje depende de la latitud: cerca del ecuador son varias semanas, y en latitudes altas se reduce a pocos días',
          'La fórmula vieja repartía el cambio en mitades iguales entre amanecer y atardecer, y con eso el fenómeno directamente desaparecía',
          'Cerca de los equinoccios el cambio es máximo, más de dos minutos por día en latitudes medias; cerca de los solsticios es casi cero',
          'Los cambios de horario oficial no tienen nada que ver con esto: son una decisión política, no astronómica',
        ],
        plazo:
          'la asimetría viene de dos cosas a la vez: la órbita elíptica de la Tierra y la inclinación de su eje. Juntas hacen que el mediodía solar se adelante o atrase hasta 16 minutos a lo largo del año.',
      },
      {
        id: 'mareas',
        label: 'Cuándo sube y baja la marea en la costa',
        hint: 'Pleamar, bajamar y mareas vivas',
        answer:
          'El ciclo de marea dura 12 h 25 min, así que cada día las pleamares se corren unos 50 minutos. Cerca de la luna nueva y de la llena la amplitud es máxima: son las mareas vivas.',
        yes: [
          'Cuántas horas faltan para la próxima pleamar y para la próxima bajamar, estimadas',
          'La altura aproximada de una y otra, y cuánto sube y baja el agua entre las dos',
          'Si estás en marea viva (sicigia) o en marea muerta (cuadratura), que eso sí depende sólo de la Luna y es confiable',
          'La amplitud típica del puerto elegido, que en la costa argentina va de medio metro a más de cuatro',
        ],
        warn: [
          'ATENCIÓN: los horarios son una estimación de un modelo genérico de una sola componente. Pueden errar por HORAS, no por minutos. Para navegar, pescar de orilla, cruzar un banco o caminar una restinga hay que usar la tabla oficial del Servicio de Hidrografía Naval y ninguna otra cosa',
          'Una marea mal calculada en la costa es peligrosa: la Patagonia tiene amplitudes de más de cuatro metros y el agua sube más rápido de lo que se camina',
          'El viento cambia todo: una sudestada puede sumar más de un metro sobre la marea astronómica, y un viento de tierra puede restarlo',
          'Rosario está sobre el Paraná: ahí manda el caudal del río, no la Luna, y el modelo no aplica',
        ],
        plazo:
          'las mareas vivas más grandes del año caen cerca de los equinoccios de marzo y septiembre, cuando la sicigia coincide con el Sol sobre el ecuador.',
      },
    ],
  },

  inputsTitle: 'Tu lugar y tu momento',
  inputsIntro:
    'Dejá la fecha y la hora en blanco para que el cálculo use el momento actual: es la forma de que el resultado sea el de hoy, ahora. Elegí tu ciudad y la latitud, la longitud y el huso se cargan solos; si no está la tuya, elegí "Personalizado" y cargalos a mano.',
  fields: [
    {
      id: 'fecha',
      label: 'Fecha',
      type: 'date',
      value: '',
      help: 'Vacío = hoy. Sólo cargala si querés mirar otro día del año.',
    },
    {
      id: 'hora',
      label: 'Hora local (formato 24 h, por ejemplo 18:30)',
      type: 'text',
      value: '',
      help: 'Vacío = la hora actual. Sólo cambia el resultado de las ramas de Luna y de mareas.',
    },
    {
      id: 'ciudad',
      label: 'Ciudad',
      type: 'select',
      value: 'buenos-aires',
      options: [
        { value: 'buenos-aires', label: 'Buenos Aires' },
        { value: 'cordoba', label: 'Córdoba' },
        { value: 'rosario', label: 'Rosario' },
        { value: 'mendoza', label: 'Mendoza' },
        { value: 'mar-del-plata', label: 'Mar del Plata' },
        { value: 'bahia-blanca', label: 'Bahía Blanca' },
        { value: 'salta', label: 'Salta' },
        { value: 'tucuman', label: 'San Miguel de Tucumán' },
        { value: 'neuquen', label: 'Neuquén' },
        { value: 'bariloche', label: 'San Carlos de Bariloche' },
        { value: 'puerto-madryn', label: 'Puerto Madryn' },
        { value: 'comodoro', label: 'Comodoro Rivadavia' },
        { value: 'rio-gallegos', label: 'Río Gallegos' },
        { value: 'ushuaia', label: 'Ushuaia' },
        { value: 'montevideo', label: 'Montevideo' },
        { value: 'lima', label: 'Lima' },
        { value: 'bogota', label: 'Bogotá' },
        { value: 'cdmx', label: 'Ciudad de México' },
        { value: 'personalizado', label: 'Personalizado (cargo latitud y longitud)' },
      ],
      help: 'Todas las ciudades de la lista están en husos sin horario de verano, así que la hora local no cambia según la época del año.',
    },
    {
      id: 'latitud',
      label: 'Latitud (si elegiste personalizado)',
      type: 'number',
      suffix: '°',
      value: -34.6037,
      min: -90,
      max: 90,
      step: 0.0001,
      help: 'Negativa en el hemisferio sur. Buenos Aires −34,60 · Madrid 40,42 · Ushuaia −54,80.',
    },
    {
      id: 'longitud',
      label: 'Longitud (si elegiste personalizado)',
      type: 'number',
      suffix: '°',
      value: -58.3816,
      min: -180,
      max: 180,
      step: 0.0001,
      help: 'Negativa al oeste de Greenwich. Buenos Aires −58,38.',
    },
    {
      id: 'huso',
      label: 'Huso horario (si elegiste personalizado)',
      type: 'number',
      suffix: 'UTC±',
      value: -3,
      min: -12,
      max: 14,
      step: 0.25,
      help: 'Argentina y Uruguay −3 · Perú y Colombia −5 · México central −6 · España +1 (o +2 con horario de verano).',
    },
    {
      id: 'puerto',
      label: 'Mareas — puerto',
      type: 'select',
      value: 'mar-del-plata',
      options: [
        { value: 'mar-del-plata', label: 'Mar del Plata' },
        { value: 'quequen', label: 'Quequén / Necochea' },
        { value: 'bahia-blanca', label: 'Bahía Blanca' },
        { value: 'puerto-madryn', label: 'Puerto Madryn / Golfo Nuevo' },
        { value: 'ushuaia', label: 'Ushuaia / Canal Beagle' },
        { value: 'rosario', label: 'Rosario (río Paraná)' },
      ],
      help: 'La amplitud típica de cada puerto es muy distinta: Mar del Plata mueve metro y medio, Puerto Madryn cuatro metros.',
    },
  ],
  fineprint:
    'Las horas de amanecer, atardecer y mediodía solar se calculan con el algoritmo solar de la NOAA (serie de Spencer para la declinación, ecuación del tiempo y cenit de 90,833° para incluir la refracción atmosférica estándar y el radio del disco solar). Suponen horizonte llano al nivel del mar: en zona de montaña la hora real difiere. La fase lunar es la fase MEDIA del ciclo sinódico y puede correrse hasta medio día respecto de la real. Las mareas son una estimación de un modelo de una sola componente y NO sirven para navegar ni para planificar una salida a la costa: para eso, y sólo para eso, están las tablas oficiales del Servicio de Hidrografía Naval.',

  chart: {
    type: 'scale',
    title: 'Cuánta luz tiene hoy tu día, sobre las 24 horas',
    caption:
      'La regla va de 0 a 24 horas y es la duración del día en tu latitud, la única magnitud que existe en las cuatro ramas. Las franjas marcan la noche polar, el día corto de invierno, el día moderado de las latitudes medias, el día largo de verano y el día polar. Tu resultado queda marcado ahí: de un vistazo se ve si hoy te sobra o te falta luz.',
    bands: [
      { label: '0 a 1 h — noche polar: el sol directamente no sale', from: 0, to: 1, tone: 'bad' },
      { label: '1 a 9 h — día corto: pleno invierno en latitudes medias y altas', from: 1, to: 9, tone: 'warn' },
      { label: '9 a 15 h — día moderado: casi todo el año en el centro de Argentina', from: 9, to: 15, tone: 'good' },
      { label: '15 a 23 h — día largo: verano en latitudes altas, atardeceres de las 22', from: 15, to: 23, tone: 'warn' },
      { label: '23 a 24 h — día polar: el sol no se esconde', from: 23, to: 24, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del día',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay horas del reloj expresadas en horas decimales, minutos, grados y días. Las barras comparan el número crudo de cada fila entre sí, así que una fila en minutos siempre va a aplastar a una en horas: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿A qué hora amanece hoy en Buenos Aires?',
      a: 'Depende de la época del año: a fines de junio el sol sale cerca de las 8:00 y a fines de diciembre poco antes de las 5:40, en hora local. El cálculo de esta página lo resuelve para la fecha de hoy y para tu latitud y longitud exactas, con el algoritmo de la NOAA. Un detalle que casi todas las fórmulas caseras se saltean: el amanecer se define cuando el BORDE SUPERIOR del sol asoma en el horizonte, con la refracción atmosférica ya considerada, no cuando su centro lo cruza. Esa corrección vale entre 3 y 5 minutos en cada punta del día.',
    },
    {
      q: '¿Por qué el mediodía solar no son las 12:00 del reloj?',
      a: 'Por dos motivos que se suman. Primero, la longitud: cada grado que estás al oeste del meridiano central de tu huso corre el mediodía solar 4 minutos más tarde, y Buenos Aires está a más de 13 grados al oeste del meridiano de UTC−3, o sea casi una hora. Segundo, la ecuación del tiempo: como la órbita terrestre es elíptica y el eje está inclinado, el sol "verdadero" se adelanta o se atrasa hasta 16 minutos respecto de un reloj perfecto, y ese desvío cambia todos los días del año.',
    },
    {
      q: '¿Cuántas horas de luz hay hoy?',
      a: 'La duración del día sale de la declinación solar y de tu latitud: horas = 2·H/15, donde H es el arco horario en grados que resuelve cos(90,833°) = sen(φ)·sen(δ) + cos(φ)·cos(δ)·cos(H). En el ecuador da casi 12 horas todo el año; en Buenos Aires va de 9 h 50 min a 14 h 25 min; en Ushuaia, de 7 h 20 min a más de 17 horas. Cuanto más te alejás del ecuador, más brutal es la diferencia entre invierno y verano.',
    },
    {
      q: '¿Por qué el amanecer más tardío del año no cae el día más corto?',
      a: 'Este es el fenómeno más contraintuitivo del calendario y la respuesta es la ecuación del tiempo. Alrededor del solsticio de invierno el mediodía solar se está corriendo hacia más tarde unos 30 segundos por día, mientras que la duración del día casi no cambia. El resultado es que el amanecer sigue retrasándose una o dos semanas DESPUÉS del día más corto, mientras que el atardecer ya empezó a estirarse una o dos semanas ANTES. Por eso a fines de junio en Buenos Aires ya anochece más tarde y sin embargo todavía amanece más tarde también: son tres fechas distintas, no una.',
    },
    {
      q: '¿Cuánto se corre el amanecer por día?',
      a: 'Cerca de los equinoccios, en marzo y septiembre, es cuando más rápido cambia: en latitudes medias, más de un minuto por día en cada punta, y en latitudes altas puede pasar los dos minutos. Cerca de los solsticios, en junio y diciembre, el cambio es casi cero: el sol se queda "clavado" unos días, y de ahí viene la palabra solsticio, que significa literalmente "sol quieto". En el ecuador el valor es prácticamente nulo todo el año.',
    },
    {
      q: '¿Qué fase lunar hay hoy?',
      a: 'La fase se calcula por la edad de la Luna dentro del ciclo sinódico, que dura 29 días, 12 horas y 44 minutos: 0 días es luna nueva, 7,4 cuarto creciente, 14,8 luna llena y 22,1 cuarto menguante. La iluminación del disco sale de esa edad. Ojo con una limitación real: esta es la fase MEDIA. Como la órbita de la Luna es elíptica, la fase verdadera se adelanta o atrasa hasta unas 14 horas, así que la fecha exacta de la próxima luna llena puede correrse medio día.',
    },
    {
      q: '¿Cada cuánto hay luna llena?',
      a: 'Cada 29,53 días en promedio, que es el ciclo sinódico: el tiempo que tarda la Luna en volver a la misma posición relativa respecto del Sol y de la Tierra. Como es un poco menos que un mes calendario, cada tanto entran dos lunas llenas en el mismo mes, y a la segunda se le dice "luna azul": pasa cada dos años y medio más o menos. El ciclo sinódico no es lo mismo que el sidéreo, de 27,32 días, que es lo que tarda la Luna en dar una vuelta completa contra el fondo de estrellas.',
    },
    {
      q: '¿La luna creciente se ve igual desde Argentina que desde España?',
      a: 'No, y este es el error clásico de todas las ilustraciones que circulan. En el hemisferio norte la luna creciente se ve iluminada del lado DERECHO, con forma de "D". Desde el hemisferio sur se ve iluminada del lado IZQUIERDO, con forma de "C". La regla mnemotécnica española "si parece una D está creciendo" está invertida acá abajo. Lo que no cambia es la fase en sí ni el porcentaje iluminado: es exactamente la misma Luna, vista al revés.',
    },
    {
      q: '¿Cada cuánto sube y baja la marea?',
      a: 'El ciclo semidiurno principal, la componente lunar M2, dura 12 horas y 25 minutos, así que en la mayor parte de la costa hay dos pleamares y dos bajamares por día, y cada día se corren unos 50 minutos respecto del anterior. Ese corrimiento acompaña al retraso diario de la salida de la Luna, que es exactamente el mismo: la marea sigue a la Luna, no al reloj.',
    },
    {
      q: '¿Qué es una marea viva y cuándo ocurre?',
      a: 'Es la marea de máxima amplitud, y ocurre cerca de la luna nueva y de la luna llena: en esos momentos el Sol y la Luna están alineados con la Tierra y sus atracciones se suman. Se llama sicigia. Lo contrario es la marea muerta o de cuadratura, cerca de los cuartos, cuando el Sol y la Luna tiran en ángulo recto y las mareas se atenúan. La diferencia entre una y otra es grande: en la costa argentina puede ser del 30% o más de la amplitud.',
    },
    {
      q: '¿Sirven estos horarios de marea para ir a pescar o a navegar?',
      a: 'No. Y conviene decirlo sin vueltas: el cálculo de esta página usa un modelo genérico de una sola componente armónica, sin la calibración local de cada puerto, así que las horas absolutas pueden errar por horas. Lo que sí es confiable es si estás en marea viva o muerta, porque eso depende sólo de la fase lunar. Para navegar, pescar de orilla, cruzar un banco o caminar una restinga hay que usar la tabla de mareas oficial del Servicio de Hidrografía Naval del puerto correspondiente. En la costa, una marea mal calculada mata: en el golfo San Jorge o en Puerto Madryn el agua sube más de cuatro metros y avanza más rápido de lo que se camina.',
    },
    {
      q: '¿Por qué la marea en Puerto Madryn es tan grande y en Mar del Plata tan chica?',
      a: 'Porque la amplitud de marea no depende sólo de la Luna sino de la forma del fondo y de la costa. En un golfo cerrado y de poca profundidad la onda de marea se comprime y se amplifica; en una costa abierta se dispersa. Por eso el Golfo Nuevo y la zona de Bahía Blanca tienen amplitudes de tres a cinco metros mientras que Mar del Plata, sobre costa abierta, mueve poco más de un metro y medio. El caso extremo del planeta es la bahía de Fundy, en Canadá, con más de dieciséis metros.',
    },
    {
      q: '¿Argentina cambia la hora en verano?',
      a: 'No desde 2009: el país está en UTC−3 los doce meses del año. Por eso, comparada con el sol, la hora oficial argentina va "adelantada": el mediodía solar en Buenos Aires cae cerca de las 12:50 y en Mendoza pasadas las 13:20. Esto no afecta al cálculo astronómico, que trabaja en tiempo universal, pero sí explica por qué en verano en la Patagonia se hace de noche pasadas las 22.',
    },
    {
      q: '¿Qué es el crepúsculo civil y por qué importa?',
      a: 'Es el rato entre el atardecer y el momento en que el sol queda 6 grados por debajo del horizonte: es la franja en la que todavía se distinguen los objetos y se puede andar o trabajar afuera sin luz artificial. En latitudes medias dura entre 20 y 30 minutos, y cerca de los solsticios en latitudes altas puede durar más de una hora. Por eso "se hace de noche" bastante después de la hora del atardecer que da cualquier tabla.',
    },
  ],

  sources: [
    {
      name: 'NOAA Solar Calculator — ecuaciones de posición solar, ecuación del tiempo y horas de orto y ocaso',
      url: 'https://gml.noaa.gov/grad/solcalc/calcdetails.html',
      publisher: 'NOAA Global Monitoring Laboratory',
    },
    {
      name: 'Tabla de mareas oficial de los puertos argentinos',
      url: 'https://www.hidro.gob.ar/oceanografia/tmareas/form_mareas.asp',
      publisher: 'Servicio de Hidrografía Naval (Armada Argentina)',
    },
    {
      name: 'Moon Phases and Eclipses — ciclo sinódico y fases lunares',
      url: 'https://science.nasa.gov/moon/moon-phases/',
      publisher: 'NASA Science',
    },
    {
      name: 'Rise, Set, and Twilight Definitions — definiciones oficiales de orto, ocaso y crepúsculos',
      url: 'https://aa.usno.navy.mil/faq/RST_defs',
      publisher: 'US Naval Observatory, Astronomical Applications Department',
    },
    {
      name: 'Husos horarios oficiales de la República Argentina (Ley 26.350 y decretos posteriores)',
      url: 'https://www.argentina.gob.ar/normativa',
      publisher: 'Boletín Oficial de la República Argentina',
    },
  ],

  replaces: [
    '/calculadora-fase-lunar-actual-proxima-luna-llena',
    '/calculadora-horas-luz-dia-fecha-latitud',
    '/calculadora-mareas-altas-bajas-horario-ciclo-lunar-costa',
    '/calculadora-retraso-amanecer-atardecer-minutos-dia',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Constantes astronómicas usadas por las cuatro ramas. */
export const CONST = {
  /** Ciclo sinódico lunar, en días. */
  CICLO_LUNAR: 29.530589,
  /** Luna nueva de referencia: 2000-01-06 18:14 UTC, en ms desde epoch. */
  REF_LUNA_NUEVA_MS: Date.UTC(2000, 0, 6, 18, 14, 0),
  /** Ciclo semidiurno lunar M2, en horas. */
  CICLO_MAREA: 12.4206,
  /**
   * Cenit del centro solar en el orto y el ocaso, en grados. 90,833° incluye
   * la refracción atmosférica estándar (0,567°) y el semidiámetro del disco
   * solar (0,266°). La calc vieja usaba 90° pelado y por eso perdía minutos.
   */
  CENIT_ORTO: 90.833,
  /** Cenit del crepúsculo civil. */
  CENIT_CIVIL: 96,
};

/** Ciudades con latitud, longitud y huso horario fijo (ninguna usa horario de verano). */
export const CIUDADES: Record<string, { nombre: string; lat: number; lon: number; huso: number }> = {
  'buenos-aires': { nombre: 'Buenos Aires', lat: -34.6037, lon: -58.3816, huso: -3 },
  cordoba: { nombre: 'Córdoba', lat: -31.4201, lon: -64.1888, huso: -3 },
  rosario: { nombre: 'Rosario', lat: -32.9442, lon: -60.6505, huso: -3 },
  mendoza: { nombre: 'Mendoza', lat: -32.8895, lon: -68.8458, huso: -3 },
  'mar-del-plata': { nombre: 'Mar del Plata', lat: -38.0055, lon: -57.5426, huso: -3 },
  'bahia-blanca': { nombre: 'Bahía Blanca', lat: -38.7183, lon: -62.2663, huso: -3 },
  salta: { nombre: 'Salta', lat: -24.7859, lon: -65.4117, huso: -3 },
  tucuman: { nombre: 'San Miguel de Tucumán', lat: -26.8083, lon: -65.2176, huso: -3 },
  neuquen: { nombre: 'Neuquén', lat: -38.9516, lon: -68.0591, huso: -3 },
  bariloche: { nombre: 'San Carlos de Bariloche', lat: -41.1335, lon: -71.3103, huso: -3 },
  'puerto-madryn': { nombre: 'Puerto Madryn', lat: -42.7692, lon: -65.0385, huso: -3 },
  comodoro: { nombre: 'Comodoro Rivadavia', lat: -45.8641, lon: -67.4966, huso: -3 },
  'rio-gallegos': { nombre: 'Río Gallegos', lat: -51.623, lon: -69.2168, huso: -3 },
  ushuaia: { nombre: 'Ushuaia', lat: -54.8019, lon: -68.303, huso: -3 },
  montevideo: { nombre: 'Montevideo', lat: -34.9011, lon: -56.1645, huso: -3 },
  lima: { nombre: 'Lima', lat: -12.0464, lon: -77.0428, huso: -5 },
  bogota: { nombre: 'Bogotá', lat: 4.711, lon: -74.0721, huso: -5 },
  cdmx: { nombre: 'Ciudad de México', lat: 19.4326, lon: -99.1332, huso: -6 },
};

/**
 * Puertos con su amplitud típica y el desfasaje del modelo. Son EXACTAMENTE
 * los valores de la calc vieja (`mareas-ciclo-lunar-costa.ts`): se conservan
 * para no romper la continuidad del resultado, pero son de orden de magnitud,
 * no una constante armónica calibrada.
 */
export const PUERTOS: Record<string, { nombre: string; amplitud: number; offsetHoras: number; nota: string }> = {
  'mar-del-plata': { nombre: 'Mar del Plata', amplitud: 1.5, offsetHoras: 0.5, nota: 'costa atlántica media, amplitud moderada' },
  quequen: { nombre: 'Quequén / Necochea', amplitud: 1.3, offsetHoras: 0.3, nota: 'costa abierta, la amplitud más chica de la lista' },
  'bahia-blanca': { nombre: 'Bahía Blanca', amplitud: 3.5, offsetHoras: 1.5, nota: 'estuario: la onda de marea se amplifica al entrar' },
  'puerto-madryn': { nombre: 'Puerto Madryn / Golfo Nuevo', amplitud: 4.0, offsetHoras: 2.2, nota: 'golfo cerrado: la mayor amplitud de la costa argentina' },
  ushuaia: { nombre: 'Ushuaia / Canal Beagle', amplitud: 2.0, offsetHoras: -1.0, nota: 'canal, régimen mixto' },
  rosario: { nombre: 'Rosario (río Paraná)', amplitud: 0.5, offsetHoras: 0, nota: 'no es marea oceánica: manda el caudal del río y la sudestada' },
};
