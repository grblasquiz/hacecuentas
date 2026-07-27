import type { HubData } from './types';

/**
 * Hub de decisión — "Fotos y video: cuánto ocupan y a qué resolución"
 * Arquetipo RAMIFICADO: no hay un cálculo dominante, hay cuatro preguntas que
 * comparten los mismos datos (megapíxeles, formato, tarjeta, bitrate, DPI).
 *
 * Absorbe 16 calculadoras (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay plata. Absolutamente todas las filas declaran `format: 'unit'`
 *    con su `unit` (GB, MB, fotos, minutos, DPI, px, cm, h). Una fila sin
 *    `format` propio caería a pesos y la página mentiría.
 *  - `chart.type: 'progress'` entra por la rama POSITIONAL del runtime: las
 *    franjas viajan con from/to y el marcador con `position` + `positionLabel`.
 *
 * CRITERIO DE MÚLTIPLOS (decidido una vez, usado en todo el hub):
 *  Se trabaja en base DECIMAL — 1 GB = 1000 MB — que es como el fabricante
 *  rotula la tarjeta y como se factura el bitrate (Mbps = 1.000.000 bits/s).
 *  El sistema operativo, en cambio, divide por 1024 y muestra un 7,4% menos:
 *  ese número también se calcula, pero va en su propia fila rotulada "GiB",
 *  nunca mezclado. Los calcs viejos mezclaban criterios (memoria-fotos y
 *  tarjeta-sd dividían por 1000, cuantas-fotos-entran por 1024): acá se
 *  unifica en decimal y la diferencia queda explícita en pantalla.
 */
export const hub: HubData = {
  slug: 'tecnologia/fotografia',
  title: 'Fotos y video: cuánto ocupan y a qué resolución imprimen — 2026',
  description:
    'Cuántas fotos entran en tu tarjeta SD, cuánto pesa un video según el bitrate, hasta qué tamaño podés imprimir tus megapíxeles a 300 DPI y cuántas fotos necesita un time-lapse o un stop motion. Todo con el mismo criterio de GB.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y estimación de almacenamiento y resolución',
  h1: 'Fotos y video: cuánto ocupan y a qué resolución',
  lede:
    'Los megapíxeles, el formato y el bitrate deciden tres cosas a la vez: cuánto entra en la tarjeta, cuánto pesa el archivo y hasta qué tamaño podés imprimir sin que se vea pixelado. Cargá tus datos una sola vez y elegí qué querés saber.',
  stamps: [
    'Actualizado 27-07-2026',
    'Criterio decimal: 1 GB = 1000 MB (como el fabricante)',
    '16 calculadoras adentro',
  ],

  resultLabel: 'Lo que entra en tu tarjeta',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Las cuatro preguntas usan los mismos datos de arriba. Elegí la tuya y el resultado cambia sin volver a cargar nada.',
    items: [
      {
        id: 'tarjeta',
        label: 'Cuántas fotos entran en mi tarjeta',
        hint: 'La pregunta de siempre antes de salir a disparar: ¿me alcanza esta tarjeta?',
        yes: [
          'Peso medio por foto = megapíxeles × el factor del formato (JPG media 0,3 MB/MP; JPG alta 0,5; RAW comprimido 1,1; RAW 1,5; RAW+JPG 2,0)',
          'Capacidad útil de la tarjeta en base decimal: 1 GB = 1000 MB',
          'Los minutos de video que planeás grabar, convertidos desde el bitrate: MB/min = Mbps × 60 ÷ 8',
          'El audio también ocupa: 192 kbps son 1,44 MB por minuto',
          'Cuántas fotos más entran en el espacio que te queda libre',
        ],
        warn: [
          'La tarjeta nunca da su número rotulado: el formateo y la tabla de archivos se comen entre un 2% y un 5%',
          'RAW+JPG duplica el conteo de archivos y casi cuadruplica el peso frente a un JPG de calidad media',
          'El ráfaga sostenido depende de la velocidad de escritura, no de la capacidad: una tarjeta grande y lenta igual te llena el buffer',
          'Nunca formatees en la computadora: formateá siempre en la cámara para que el sistema de archivos coincida',
        ],
        plazo: 'llevá siempre una segunda tarjeta: en eventos de un solo día no hay reintento posible.',
        answer:
          'Con tus megapíxeles y tu formato, cada foto pesa un valor fijo: la cantidad que entra es la capacidad de la tarjeta en MB dividida por ese peso, descontando lo que ya ocupa el video que pensás grabar.',
      },
      {
        id: 'video',
        label: 'Cuánto pesa un video según el bitrate',
        hint: 'Para saber si el archivo entra en la tarjeta, en el disco o en el límite de subida.',
        yes: [
          'Tamaño = bitrate en Mbps × duración en segundos ÷ 8, que da megabytes',
          'La pista de audio se suma aparte: kbps ÷ 1000 × segundos ÷ 8',
          'Consumo por hora y por minuto, para planificar una jornada de grabación',
          'Cuántos minutos de ese mismo material entran en tu tarjeta',
        ],
        warn: [
          'El bitrate manda sobre la resolución: un 1080p a 100 Mbps pesa más que un 4K a 50 Mbps',
          'Con VBR el número es un promedio: las escenas con movimiento suben el pico y el archivo final puede irse un 10% o 15% arriba',
          'Los códecs intraframe de edición (ProRes, DNxHR) multiplican el peso por cinco o más frente a H.265',
          'El límite de archivo de FAT32 es 4 GB: en tarjetas viejas la cámara corta el clip aunque quede espacio',
        ],
        plazo: 'calculá la jornada completa antes de salir, no clip por clip: el error se acumula.',
        answer:
          'El bitrate es litros por minuto y la duración es el tiempo que dejás la canilla abierta. Multiplicá, dividí por 8 para pasar de bits a bytes y ya tenés los megabytes.',
      },
      {
        id: 'impresion',
        label: 'A qué tamaño puedo imprimir',
        hint: 'Cuántos centímetros aguantan tus megapíxeles antes de que se note el pixelado.',
        yes: [
          'Los píxeles de lado se reparten según la relación de aspecto: ancho = √(píxeles totales × ancho ÷ alto)',
          'Centímetros = píxeles ÷ DPI × 2,54',
          'El tamaño máximo a 300 DPI, que es el estándar de calidad fotográfica',
          'Los DPI reales que te quedan si imprimís al ancho que pediste',
          'Los megapíxeles que necesitarías para ese tamaño a la calidad que elegiste',
        ],
        warn: [
          '300 DPI es para mirar de cerca: un póster que se ve a dos metros queda perfecto con 150 DPI y una gigantografía con 72',
          'Recortar la foto baja los megapíxeles reales: calculá sobre el archivo final, no sobre el de cámara',
          'Interpolar hacia arriba en el editor agrega píxeles pero no detalle: el tamaño sube y la nitidez no',
          'Si la relación de aspecto del papel no coincide con la de la foto, el laboratorio recorta o deja franjas blancas',
        ],
        plazo: 'pedí siempre una prueba de color chica antes de mandar a imprimir un tamaño grande.',
        answer:
          'Dividí los píxeles del lado largo por 300 y multiplicá por 2,54: eso es el máximo en centímetros con calidad fotográfica. Con menos DPI imprimís más grande, a costa de mirarlo desde más lejos.',
      },
      {
        id: 'secuencia',
        label: 'Time-lapse y stop motion',
        hint: 'Cuántas fotos hay que disparar, cuánto tarda la captura y cuánto ocupa.',
        yes: [
          'Fotos necesarias = duración del video final en segundos × fps',
          'Tiempo de captura = fotos × intervalo entre disparos',
          'Espacio = fotos × el peso de tu formato: el RAW en secuencias largas es el que rompe la tarjeta',
          'Cómo cambia la duración final si después llevás la secuencia a 24 fps',
        ],
        warn: [
          'Por debajo de 10 fps la animación se ve entrecortada; el stop motion clásico va a 12 fps y el cine a 24',
          'Una captura de más de dos horas necesita alimentación externa: la batería no llega',
          'En time-lapse conviene disparar en manual completo, o el flicker de exposición te arruina la secuencia',
          'El intervalómetro suma el tiempo de exposición al intervalo: con pose larga el cálculo se estira',
        ],
        plazo:
          'sumá un 10% de fotos extra al plan: siempre se descartan cuadros al principio y al final de la secuencia.',
        answer:
          'La cuenta es una sola multiplicación: segundos de video por fps te da las fotos, y esas fotos por el intervalo te dan cuánto tiempo vas a estar disparando.',
      },
    ],
  },

  inputsTitle: 'Cargá tus datos una sola vez',
  inputsIntro:
    'Las cuatro ramas leen de acá. Los campos que no aplican a la rama elegida simplemente se ignoran.',
  fields: [
    {
      id: 'tarjetaGb',
      label: 'Capacidad de la tarjeta o del disco',
      type: 'number',
      suffix: 'GB',
      min: 1,
      max: 8000,
      step: 1,
      value: 64,
      help: 'El número rotulado por el fabricante. Acá 1 GB = 1000 MB; el sistema operativo va a mostrarte un 7,4% menos.',
    },
    {
      id: 'megapixeles',
      label: 'Megapíxeles de la cámara',
      type: 'number',
      suffix: 'MP',
      min: 0.1,
      max: 500,
      step: 0.1,
      value: 24,
    },
    {
      id: 'formato',
      label: 'Formato de foto',
      type: 'select',
      value: 'raw_comp',
      options: [
        { value: 'jpg_media', label: 'JPG calidad media (0,3 MB por MP)' },
        { value: 'jpg_alta', label: 'JPG calidad alta (0,5 MB por MP)' },
        { value: 'raw_comp', label: 'RAW comprimido (1,1 MB por MP)' },
        { value: 'raw', label: 'RAW sin comprimir (1,5 MB por MP)' },
        { value: 'raw_jpg', label: 'RAW + JPG a la vez (2,0 MB por MP)' },
      ],
      help: 'El factor multiplica los megapíxeles y da el peso medio de cada archivo.',
    },
    {
      id: 'fotosPrevistas',
      label: 'Fotos que pensás disparar',
      type: 'number',
      suffix: 'fotos',
      min: 0,
      max: 200000,
      step: 10,
      value: 800,
      help: 'Solo para saber cuánto te queda libre. Poné 0 si querés ver la tarjeta entera.',
    },
    {
      id: 'minutosVideo',
      label: 'Minutos de video',
      type: 'number',
      suffix: 'min',
      min: 0,
      max: 10000,
      step: 1,
      value: 20,
    },
    {
      id: 'bitrateVideo',
      label: 'Bitrate del video',
      type: 'number',
      suffix: 'Mbps',
      min: 0.1,
      max: 2000,
      step: 0.5,
      value: 100,
      help: 'El 4K de una cámara de foto ronda los 100 Mbps; el 1080p de celular, 20; una grabación de pantalla, 8.',
    },
    {
      id: 'bitrateAudio',
      label: 'Bitrate del audio',
      type: 'number',
      suffix: 'kbps',
      min: 0,
      max: 3000,
      step: 16,
      value: 192,
      help: 'Un MP3 de streaming va a 128–192 kbps; el audio de cámara sin comprimir, a 1536.',
    },
    {
      id: 'aspecto',
      label: 'Relación de aspecto',
      type: 'select',
      value: '3:2',
      options: [
        { value: '3:2', label: '3:2 (réflex y sin espejo)' },
        { value: '4:3', label: '4:3 (micro 4/3 y celular)' },
        { value: '16:9', label: '16:9 (video y pantallas)' },
        { value: '5:4', label: '5:4 (formato medio y copias 20×25)' },
        { value: '1:1', label: '1:1 (cuadrado)' },
      ],
    },
    {
      id: 'anchoImpresionCm',
      label: 'Ancho al que querés imprimir',
      type: 'number',
      suffix: 'cm',
      min: 1,
      max: 2000,
      step: 1,
      value: 30,
    },
    {
      id: 'dpi',
      label: 'DPI de impresión',
      type: 'number',
      suffix: 'DPI',
      min: 30,
      max: 1200,
      step: 10,
      value: 300,
      help: '300 para mirar de cerca, 150 para pósters, 72 para gigantografías.',
    },
    {
      id: 'duracionSeg',
      label: 'Duración del video final (time-lapse o stop motion)',
      type: 'number',
      suffix: 's',
      min: 1,
      max: 7200,
      step: 1,
      value: 30,
    },
    {
      id: 'fps',
      label: 'Cuadros por segundo de la secuencia',
      type: 'number',
      suffix: 'fps',
      min: 1,
      max: 120,
      step: 1,
      value: 12,
      help: '12 fps es el stop motion clásico; 24 fps, cine; 30 fps, video estándar.',
    },
    {
      id: 'intervaloSeg',
      label: 'Intervalo entre disparos',
      type: 'number',
      suffix: 's',
      min: 0.1,
      max: 3600,
      step: 0.5,
      value: 5,
      help: 'En time-lapse, lo que configurás en el intervalómetro. En stop motion, lo que tardás en mover y disparar cada cuadro.',
    },
  ],
  fineprint:
    'Los pesos por foto son promedios: el RAW de tu cámara puede variar hasta un 30% según el detalle de la escena y la compresión del fabricante. Todo el hub trabaja en base decimal (1 GB = 1000 MB); el sistema operativo divide por 1024 y va a mostrarte un 7,4% menos.',

  chart: {
    type: 'progress',
    title: 'Cuánto ocupás y cuánto te queda',
    caption:
      'La barra es lo que tenés disponible: la tarjeta en las ramas de captura y video, y el tamaño máximo nítido a 300 DPI en la rama de impresión. El marcador muestra cuánto de eso te lleva tu plan y la etiqueta te dice qué queda libre.',
    bands: [
      { label: 'Ocupado', from: 0, to: 100, tone: 'warn' },
      { label: 'Libre', from: 0, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'Los números de tu plan',
  breakdownIntro:
    'Ninguna fila es plata: cada una lleva su unidad explícita (GB, MB, fotos, minutos, DPI, píxeles, centímetros u horas). Las barras comparan cada valor con el mayor.',

  faq: [
    {
      q: '¿Cuántas fotos entran en una tarjeta de 64 GB?',
      a: 'Depende de los megapíxeles y del formato. Con una cámara de 24 MP: en JPG de calidad media cada foto pesa unos 7,2 MB y entran cerca de 8.800; en JPG de alta, 12 MB y entran unas 5.300; en RAW comprimido, 26,4 MB y entran unas 2.400; en RAW sin comprimir, 36 MB y entran unas 1.700; y disparando RAW+JPG, 48 MB por toma y entran unas 1.300. La cuenta es capacidad en MB dividida por el peso de cada archivo.',
    },
    {
      q: '¿Un GB son 1000 MB o 1024 MB?',
      a: 'Las dos cosas, según quién cuente. El fabricante de la tarjeta usa base decimal: 1 GB = 1000 MB, y así rotula el envase. El sistema operativo usa base binaria: 1 GiB = 1024 MiB, y por eso una tarjeta de 64 GB aparece como 59,6 GB en la computadora. Es la misma cantidad de bytes con dos varas distintas, no es que falte espacio. Este hub calcula todo en decimal, que es la vara del fabricante y también la del bitrate, y te muestra aparte cuánto va a reportar el sistema.',
    },
    {
      q: '¿Cuánto pesa un minuto de video 4K?',
      a: 'Sale del bitrate, no de la resolución: megabytes por minuto = Mbps × 60 ÷ 8. A 100 Mbps, que es lo típico de una cámara de foto grabando 4K, son 750 MB por minuto, o sea 45 GB por hora. A 50 Mbps son 375 MB por minuto. Un celular grabando 4K a 45 Mbps ronda los 340 MB por minuto y una grabación de pantalla a 8 Mbps, apenas 60 MB por minuto.',
    },
    {
      q: '¿Hasta qué tamaño puedo imprimir una foto de 24 MP?',
      a: 'Una foto de 24 MP en 3:2 mide unos 6.000 × 4.000 píxeles. A 300 DPI, que es calidad fotográfica para mirar de cerca, eso da 50,8 × 33,9 cm. A 150 DPI, que alcanza para un póster que se ve a un metro o más, llegás a 101,6 × 67,7 cm. Y a 72 DPI, para una gigantografía que se mira desde la vereda de enfrente, más de dos metros de ancho.',
    },
    {
      q: '¿Cuántos DPI necesito realmente para imprimir?',
      a: 'Depende de la distancia de visualización. El ojo distingue alrededor de un minuto de arco, así que el mínimo útil es 3438 ÷ distancia en centímetros × 2,54. A 30 cm eso da unos 291 DPI (de ahí sale el estándar de 300), a 60 cm baja a 146 DPI y a 2 metros con 44 DPI ya no ves la diferencia. Imprimir a 600 DPI una foto que vas a colgar en la pared es tirar archivo.',
    },
    {
      q: '¿Cuántas fotos necesito para un time-lapse de 30 segundos?',
      a: 'Multiplicá los segundos por los fps: 30 segundos a 24 fps son 720 fotos, y a 30 fps son 900. Con un intervalo de 5 segundos, esas 720 fotos son una hora de captura continua. Si disparás en RAW de 24 MP, ocupan cerca de 19 GB, así que conviene bajar a JPG o a RAW comprimido para secuencias largas.',
    },
    {
      q: '¿A cuántos fps se hace un stop motion?',
      a: 'El clásico va a 12 fps: es el estándar de la animación en dos, donde cada dibujo o pose se sostiene dos cuadros de los 24 del cine. Por debajo de 10 fps la animación se ve deliberadamente entrecortada; entre 13 y 20 queda moderna y fluida; y a 24 fps es cine, con el doble de trabajo de manipulación por cada segundo de pantalla.',
    },
    {
      q: '¿Por qué mi RAW pesa distinto al que calcula esta página?',
      a: 'Porque el factor de 1,1 a 1,5 MB por megapíxel es un promedio. Un RAW de 14 bits sin comprimir tiene tamaño fijo; uno con compresión sin pérdida se achica según el detalle de la escena, así que un cielo liso puede pesar la mitad que un bosque. Sumale que algunas cámaras incrustan un JPG de vista previa dentro del RAW y ya tenés variaciones de hasta el 30% sobre el promedio.',
    },
    {
      q: '¿Qué bitrate necesito para transmitir en vivo?',
      a: 'Para 1080p a 30 fps se recomiendan 4.500 kbps y a 60 fps, 6.000 kbps, que es además el tope de Twitch. Para 720p a 30 fps alcanzan 2.500 kbps. La regla práctica es no usar más del 67% de tu velocidad de subida real: para transmitir cómodo a 6.000 kbps necesitás unos 9 Mbps de subida estable. Si no llegás, bajá la resolución antes que el bitrate: se ve mejor un 720p limpio que un 1080p con bloques.',
    },
    {
      q: '¿Cuánto pesa una canción o un podcast según el bitrate?',
      a: 'La cuenta es kbps × segundos ÷ 8 ÷ 1000 para llegar a megabytes. Un tema de 4 minutos a 128 kbps pesa 3,84 MB; a 192 kbps, 5,76 MB; y a 320 kbps, 9,6 MB. Un podcast de una hora en mono a 96 kbps ocupa 43 MB. En 1 GB entran unas 260 canciones a 128 kbps o unas 104 a 320 kbps.',
    },
    {
      q: '¿Qué calidad de JPG conviene para la web?',
      a: 'Entre 75 y 85. Ahí la compresión ronda 22:1 a 15:1 y no se ven artefactos en pantalla. Por debajo de 70 aparecen bloques y halos alrededor de los bordes duros; por encima de 95 el archivo se multiplica por tres o cuatro sin que nadie note la diferencia. Si podés servir WebP o AVIF, bajás otro 25% a 35% sobre el mismo JPG al 85%.',
    },
    {
      q: '¿Cuántos PPI tiene que tener una pantalla para verse nítida?',
      a: 'Los PPI salen de la diagonal en píxeles dividida por las pulgadas de pantalla: √(ancho² + alto²) ÷ diagonal. Un monitor de 27" a 1920×1080 da 82 PPI y se le notan los píxeles de cerca; el mismo tamaño a 4K da 163 PPI y se ve muy bien a 60 cm; un celular de 6,1" a 2532×1170 supera los 460 PPI. Por encima de 300 PPI a distancia normal el ojo ya no distingue píxeles.',
    },
  ],

  sources: [
    {
      name: 'SD Card Standards — capacidades y clases de velocidad',
      url: 'https://www.sdcard.org/developers/sd-standard-overview/',
      publisher: 'SD Association',
    },
    {
      name: 'IEC 80000-13 — prefijos binarios (kibi, mebi, gibi) frente a los decimales del SI',
      url: 'https://www.iso.org/standard/31898.html',
      publisher: 'ISO / IEC',
      date: '2008',
    },
    {
      name: 'Recommended upload encoding settings — bitrate por resolución',
      url: 'https://support.google.com/youtube/answer/1722171',
      publisher: 'YouTube Help',
    },
    {
      name: 'Broadcast Guidelines — bitrate y resolución en vivo',
      url: 'https://stream.twitch.tv/encoding/',
      publisher: 'Twitch',
    },
    {
      name: 'Image Size and Resolution — píxeles, DPI y tamaño de impresión',
      url: 'https://helpx.adobe.com/photoshop/using/image-size-resolution.html',
      publisher: 'Adobe',
    },
    {
      name: 'JPEG File Interchange Format — estándar de compresión',
      url: 'https://www.itu.int/rec/T-REC-T.81',
      publisher: 'ITU-T (Rec. T.81)',
      date: '1992',
    },
    {
      name: 'Understanding video bitrate and file size',
      url: 'https://www.blackmagicdesign.com/products/blackmagicpocketcinemacamera/techspecs',
      publisher: 'Blackmagic Design',
    },
  ],

  replaces: [
    '/calculadora-stream-bitrate-calidad',
    '/calculadora-tamano-imagen-pixeles-megapixeles',
    '/calculadora-memoria-fotos-capacidad',
    '/calculadora-video-bitrate-tamano-archivo',
    '/calculadora-cuantas-fotos-videos-entran-gb',
    '/calculadora-dpi-ppp-impresion-resolucion',
    '/calculadora-stop-motion-fps-tiempo',
    '/calculadora-audio-bitrate-tamano-mp3',
    '/calculadora-resolucion-pantalla-ppi',
    '/calculadora-megapixeles-impresion-tamano',
    '/calculadora-impresion-dpi-calidad',
    '/calculadora-almacenamiento-video-bitrate-duracion',
    '/calculadora-jpg-calidad-tamano-web-optimizacion',
    '/calculadora-time-lapse-duracion-fotos',
    '/calculadora-tarjeta-sd-necesaria-sesion',
    '/calculadora-relacion-de-aspecto',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Constantes del cálculo.
 *
 * MB_POR_MP viene de src/lib/formulas/memoria-fotos-capacidad.ts (mismos
 * factores) y se cruza con tarjeta-sd-necesaria-sesion.ts, que usa 1,25 MB/MP
 * para RAW y 0,35 para JPG: quedan dentro del rango de estos factores.
 *
 * BASE_GB = 1000: criterio decimal único de todo el hub. BASE_GIB = 1024 se usa
 * SOLO para la fila que informa cuánto va a mostrar el sistema operativo.
 */
export const PARAMS = {
  BASE_GB: 1000,
  BASE_GIB: 1024,
  /** Merma típica por formateo y tabla de archivos de la tarjeta. */
  MERMA_FORMATEO: 0.03,
  /** Constante del ojo humano: 1 minuto de arco = 1/3438 radianes. */
  ARCMIN: 3438,
  /** DPI de referencia para calidad fotográfica de cerca. */
  DPI_FOTO: 300,
  /** Pulgada en centímetros. */
  CM_POR_PULGADA: 2.54,
};

/** Peso medio de un archivo, en MB por megapíxel, según el formato. */
export const MB_POR_MP: Record<string, { nombre: string; factor: number }> = {
  jpg_media: { nombre: 'JPG calidad media', factor: 0.3 },
  jpg_alta: { nombre: 'JPG calidad alta', factor: 0.5 },
  raw_comp: { nombre: 'RAW comprimido', factor: 1.1 },
  raw: { nombre: 'RAW sin comprimir', factor: 1.5 },
  raw_jpg: { nombre: 'RAW + JPG', factor: 2.0 },
};

/** Relaciones de aspecto disponibles, como [ancho, alto]. */
export const ASPECTOS: Record<string, [number, number]> = {
  '3:2': [3, 2],
  '4:3': [4, 3],
  '16:9': [16, 9],
  '5:4': [5, 4],
  '1:1': [1, 1],
};
