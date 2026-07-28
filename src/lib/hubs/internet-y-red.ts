import type { HubData } from './types';

/**
 * Hub de decisión — "¿Me alcanzan los megas? ¿Cuánto tarda esta descarga?"
 *
 * Arquetipo CÁLCULO DOMINANTE (sin `cases`): la respuesta fija va en `answer` y
 * el medio (fibra por cable, wifi 2,4 / 5 / 6, ethernet, datos móviles) se elige
 * en un `select` que cambia el techo de velocidad y el overhead.
 *
 * Absorbe 7 calculadoras (ver hub.replaces): tiempo de descarga por ancho de
 * banda, conversor Mbps↔MB/s, transferencia por LAN, velocidad real vs
 * contratada, consumo de datos móviles por streaming, categoría de cable
 * ethernet y canal wifi óptimo.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NADA es plata salvo dos filas ($/mes y $/Mbps real). El resultado
 *    declara `format: 'unit'` y CADA fila lleva su propio `format` — el runtime
 *    hace Object.assign y una fila sin formato propio se imprime en pesos.
 *  - No es YMYL: no lleva disclaimer de salud ni financiero.
 */
export const hub: HubData = {
  slug: 'tecnologia/internet-y-red',
  title: '¿Me alcanzan los megas? Cuánto tarda una descarga — Calculadora de velocidad e internet',
  description:
    'Calculá cuánto tarda una descarga con tu velocidad real, cuántos MB/s son tus Mbps, qué porcentaje de lo contratado te está dando el ISP, cuánto pierde el wifi contra el cable, qué categoría de cable ethernet necesitás y cuántos GB de datos móviles te come el streaming.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Velocidad, descargas y red doméstica',
  h1: '¿Me alcanzan los megas? ¿Cuánto tarda esta descarga?',
  lede:
    'Los megas del plan son megabits; lo que baja el archivo son megabytes. Entre medio están el overhead del protocolo, el techo del wifi y el cable que llega a la compu. Con tu velocidad medida y el tamaño del archivo sale el tiempo real, cuánto te está cumpliendo el ISP y cuánto ganarías enchufando un cable.',
  stamps: ['Actualizado 27-07-2026', 'Fibra, wifi 2,4 / 5 / 6, ethernet y datos móviles', '7 calculadoras adentro'],

  resultLabel: 'Tiempo que tarda la descarga',

  inputsTitle: 'Poné tu velocidad medida y el archivo que querés bajar',
  inputsIntro:
    'Con el medio, la velocidad real del speedtest y el tamaño del archivo ya tenés el tiempo. El resto afina el cumplimiento del ISP, el cable y los datos móviles.',
  fields: [
    {
      id: 'medio',
      label: 'Por dónde va la descarga',
      type: 'select',
      value: 'fibra',
      options: [
        { value: 'fibra', label: 'Fibra o cablemódem, PC enchufada al router' },
        { value: 'wifi24', label: 'Wifi 2,4 GHz (el que atraviesa paredes)' },
        { value: 'wifi5', label: 'Wifi 5 (AC, 5 GHz)' },
        { value: 'wifi6', label: 'Wifi 6 (AX)' },
        { value: 'fast_ethernet', label: 'Cable ethernet 100 Mbps (Fast Ethernet)' },
        { value: 'gigabit', label: 'Cable ethernet Gigabit (1 Gbps)' },
        { value: '2.5g', label: 'Cable ethernet 2,5G' },
        { value: '10g', label: 'Cable ethernet 10G' },
        { value: 'movil', label: 'Datos móviles (4G / 5G)' },
      ],
      help: 'Cada medio tiene un techo de velocidad y un overhead propio: el wifi 2,4 GHz aprovecha menos de la mitad de lo que anuncia.',
    },
    {
      id: 'velocidadContratada',
      label: 'Velocidad que contrataste',
      type: 'number',
      suffix: 'Mbps',
      min: 1,
      max: 100000,
      step: 1,
      value: 300,
      help: 'La del plan: 100, 300, 500, 1000 Mbps…',
    },
    {
      id: 'velocidadReal',
      label: 'Velocidad real que medís (speedtest)',
      type: 'number',
      suffix: 'Mbps',
      min: 0.1,
      max: 100000,
      step: 1,
      value: 240,
      help: 'Medila con la PC enchufada al router y sin nadie más usando la red.',
    },
    {
      id: 'tamano',
      label: 'Tamaño del archivo o la descarga',
      type: 'number',
      suffix: 'GB',
      min: 0.001,
      max: 100000,
      step: 0.1,
      value: 8,
      help: 'Una peli en 1080p ronda los 4 GB; un juego actual, entre 50 y 150 GB.',
    },
    {
      id: 'catCable',
      label: 'Categoría del cable ethernet',
      type: 'select',
      value: 'cat5e',
      options: [
        { value: 'cat5e', label: 'Cat 5e — 1 Gbps hasta 100 m' },
        { value: 'cat6', label: 'Cat 6 — 1 Gbps (10 Gbps hasta 37 m)' },
        { value: 'cat6a', label: 'Cat 6a — 10 Gbps hasta 100 m' },
        { value: 'cat7', label: 'Cat 7 — 10 Gbps hasta 100 m' },
        { value: 'cat8', label: 'Cat 8 — 40 Gbps hasta 30 m' },
      ],
      help: 'Si vas por wifi o datos, esta fila te sirve igual para saber qué cable comprar.',
    },
    {
      id: 'metrosCable',
      label: 'Metros de cable que tenés que tirar',
      type: 'number',
      suffix: 'm',
      min: 1,
      max: 500,
      step: 1,
      value: 25,
      help: 'De punta a punta, incluyendo lo que sube por la pared y da la vuelta al mueble.',
    },
    {
      id: 'abono',
      label: 'Lo que pagás de abono por mes',
      prefix: '$',
      value: '35.000',
      thousands: true,
      help: 'Sirve para saber cuánto te sale cada Mbps que realmente recibís.',
    },
    {
      id: 'horasVideoHd',
      label: 'Video en HD por día (Netflix, YouTube)',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 1,
      help: 'Consume unos 3 GB por hora.',
    },
    {
      id: 'horasVideoSd',
      label: 'Video en calidad estándar por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 0.5,
      help: 'Unos 0,7 GB por hora.',
    },
    {
      id: 'horasMusica',
      label: 'Música en streaming por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 2,
    },
    {
      id: 'horasVideollamadas',
      label: 'Videollamadas por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 0.5,
      help: 'Cerca de 1,5 GB por hora en calidad alta.',
    },
    {
      id: 'horasRedesSociales',
      label: 'Redes sociales con video por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 24,
      step: 0.5,
      value: 1,
      help: 'El scroll infinito de reels se lleva unos 0,8 GB por hora.',
    },
  ],
  fineprint:
    'Es una estimación. El tiempo real también depende del servidor que te sirve el archivo, de cuánta gente esté usando la red al mismo tiempo y de la distancia al router. Medí siempre con la computadora enchufada por cable para saber qué te está dando el ISP.',

  chart: {
    type: 'progress',
    title: 'Cuánto de lo contratado estás recibiendo',
    caption:
      'La barra muestra qué porcentaje de la velocidad contratada te está llegando de verdad. En la Argentina el piso regulado es el 80%: por debajo de eso tenés motivo de reclamo ante el ISP y ante el ENACOM.',
    bands: [
      { label: 'Inaceptable', from: 0, to: 70, tone: 'bad' },
      { label: 'Bajo', from: 70, to: 80, tone: 'warn' },
      { label: 'Aceptable', from: 80, to: 90, tone: 'neutral' },
      { label: 'Excelente', from: 90, to: 110, tone: 'good' },
    ],
  },
  breakdownTitle: 'Velocidad, tiempo, cable y datos',
  breakdownIntro:
    'Casi ninguna fila es plata: los Mbps, los MB/s, los GB, los minutos, los metros y los canales llevan su unidad. Sólo el abono y el costo por Mbps van en pesos.',

  answer: {
    title: 'Por qué la descarga tarda más de lo que dice el plan',
    copy:
      'Un plan de 300 Mbps no baja a 300 MB por segundo: baja a 37,5 MB/s como máximo teórico, porque un byte son 8 bits. De ahí todavía se descuenta el overhead del protocolo y, si vas por wifi, el techo real de la banda. El tiempo de descarga sale de dividir el tamaño del archivo por esa velocidad efectiva, no por la del plan.',
    yes: [
      'Dividí los Mbps por 8 para tener MB/s: 300 Mbps son 37,5 MB/s teóricos',
      'Descontá el overhead: en fibra por cable se aprovecha cerca del 85%, en wifi 5 apenas el 60%',
      'El medio pone un techo: por wifi 2,4 GHz no vas a bajar a 500 Mbps aunque los tengas contratados',
      'Compará la velocidad medida con la contratada: el piso razonable es el 80%',
      'Un archivo de 1 GB son 1024 MB, no 1000: por eso el tiempo da un poco más de lo esperado',
      'Para transferencias entre computadoras de tu casa manda la LAN, no el plan de internet',
    ],
    warn: [
      'Medí siempre por cable: un speedtest por wifi mide el wifi, no lo que te vende el ISP',
      'El wifi 2,4 GHz sólo tiene tres canales que no se solapan —1, 6 y 11— y los comparte todo el barrio',
      'En 5 GHz evitá los canales DFS (52 a 144) si notás cortes: el router los libera al detectar radar',
      'Cat 8 promete 40 Gbps pero sólo hasta 30 metros: para cablear una casa no aporta nada sobre Cat 6a',
      'Si el enlace del router al equipo es Fast Ethernet de 100 Mbps, ese es tu techo aunque tengas 1 Gbps contratados',
      'Bajar un juego pesado con datos móviles se come un plan entero: dejalo para el wifi',
    ],
    plazo:
      'antes de reclamar, medí tres veces en horarios distintos y con la PC enchufada por cable: es lo primero que te va a pedir el ISP.',
  },

  faq: [
    {
      q: '¿Cuánto tarda en bajar un archivo con mi velocidad de internet?',
      a: 'Dividí el tamaño en megabytes por la velocidad efectiva en MB/s. La velocidad efectiva son los Mbps medidos divididos por 8 y multiplicados por la eficiencia del medio: alrededor del 85% con la computadora enchufada al router. Con 300 Mbps medidos, la velocidad efectiva ronda los 31,9 MB/s, así que un archivo de 8 GB (8192 MB) tarda cerca de 4 minutos y medio.',
    },
    {
      q: '¿Cuántos MB/s son 100 Mbps?',
      a: 'Son 12,5 MB/s teóricos: un byte son 8 bits, así que se divide por 8. Los planes se venden en megabits por segundo y los programas de descarga muestran megabytes por segundo, y de ahí viene la sensación de que el plan rinde ocho veces menos de lo prometido. A 12,5 MB/s, 1 GB tarda alrededor de 1 minuto y 22 segundos.',
    },
    {
      q: '¿Qué porcentaje de la velocidad contratada me tiene que dar el ISP?',
      a: 'Como referencia práctica, recibir el 90% o más de lo contratado es excelente y el 80% es aceptable. Entre el 70% y el 80% ya conviene reclamar al proveedor, y por debajo del 70% el servicio está claramente incumplido. En la Argentina el reclamo se hace primero al ISP y, si no lo resuelve, ante el ENACOM.',
    },
    {
      q: '¿Por qué el wifi anda más lento que el cable?',
      a: 'Por dos motivos que se suman. Primero, la banda tiene un techo: el wifi 2,4 GHz difícilmente pase de unos 150 Mbps nominales y el wifi 5 de unos 300 a 400 por dispositivo. Segundo, el aire es un medio compartido con retransmisiones y colisiones, así que la eficiencia baja a un 45% en 2,4 GHz y a un 60% en wifi 5, contra un 88% de un cable Gigabit.',
    },
    {
      q: '¿Qué canal de wifi conviene usar?',
      a: 'En 2,4 GHz sólo los canales 1, 6 y 11 no se solapan entre sí: elegí el menos congestionado de esos tres con un escáner wifi y dejá el ancho en 20 MHz. En 5 GHz los canales 36 a 48 y 149 a 165 son seguros y no dependen de DFS; los canales 52 a 144 sí lo requieren y el router los abandona si detecta radar, lo que se siente como un corte.',
    },
    {
      q: '¿Qué categoría de cable ethernet necesito?',
      a: 'Para una casa con internet de hasta 1 Gbps alcanza y sobra Cat 5e, que llega a 1 Gbps en tiradas de hasta 100 metros. Si querés dejar la instalación lista para 10 Gbps, el cable correcto es Cat 6a: mantiene 10 Gbps en los 100 metros completos. Cat 6 llega a 10 Gbps sólo en tiradas cortas de hasta 37 metros, y Cat 8 alcanza 40 Gbps pero apenas 30 metros, así que es un cable de datacenter.',
    },
    {
      q: '¿Hasta cuántos metros puedo tirar un cable de red?',
      a: 'El límite de un tramo de cobre es de 100 metros para Cat 5e, Cat 6, Cat 6a y Cat 7, y de 30 metros para Cat 8. Si necesitás más distancia hay que meter un switch en el medio o pasar a fibra. Y ojo con el cable de mala calidad con conductor de aluminio: en tiradas largas no llega ni a la mitad de lo que promete.',
    },
    {
      q: '¿Cuánto tarda pasar un archivo entre dos computadoras de mi casa?',
      a: 'Esa transferencia no usa internet: usa la red local, así que manda el enlace más lento del camino. Por Gigabit con un 88% de eficiencia la velocidad real ronda los 110 MB/s, y 50 GB tardan cerca de 8 minutos. Por wifi 5 al 60% baja a unos 22 MB/s y esos mismos 50 GB se van a más de 38 minutos. Si el archivo es grande, enchufá el cable.',
    },
    {
      q: '¿Cuántos GB de datos móviles consume el streaming?',
      a: 'Como referencia por hora: video en HD unos 3 GB, video en calidad estándar 0,7 GB, videollamadas 1,5 GB, redes sociales con video 0,8 GB y música 0,07 GB. A eso se le suma cerca de 0,3 GB por día de navegación, mensajería y mail. Una hora diaria de video HD ya son unos 90 GB al mes: el video es casi siempre el que se come el plan.',
    },
    {
      q: '¿Cuántos GB necesito en mi plan de celular?',
      a: 'Con menos de 5 GB al mes alcanza un plan básico; hasta 10 GB conviene uno de 8 a 10 GB; hasta 20 GB uno de 15 a 20 GB; y por encima de eso ya se justifica un ilimitado o un plan de 30 GB o más. La palanca más grande es pasar el video a wifi: bajar el video HD a estándar recorta más de tres cuartas partes de ese consumo.',
    },
    {
      q: '¿Por qué 1 GB tarda más de lo que da la cuenta redonda?',
      a: 'Porque un gigabyte de archivo son 1024 megabytes, no 1000, y porque los Mbps del plan son la velocidad del enlace, no la de los datos útiles. Entre las cabeceras de TCP/IP, las retransmisiones y el control de flujo se va entre un 10% y un 15% en cable, y bastante más en wifi. Por eso la eficiencia se aplica antes de dividir por 8.',
    },
    {
      q: '¿Cuánto me sale cada mega que realmente recibo?',
      a: 'Dividí el abono mensual por la velocidad real medida, no por la contratada. Si pagás un abono por 300 Mbps pero medís 210, el costo por Mbps real es un 43% más alto que el del folleto. Es la forma más honesta de comparar dos planes de proveedores distintos, y también el mejor argumento cuando vas a reclamar.',
    },
  ],

  sources: [
    {
      name: 'Reglamento de Calidad de los Servicios de TIC — parámetros de velocidad',
      url: 'https://www.enacom.gob.ar/calidad-de-servicio',
      publisher: 'ENACOM',
    },
    {
      name: 'IEEE 802.3 — Ethernet Standard (distancias y velocidades por tramo de cobre)',
      url: 'https://standards.ieee.org/ieee/802.3/7071/',
      publisher: 'IEEE',
    },
    {
      name: 'ANSI/TIA-568 — Cabling standards: categorías Cat 5e a Cat 8',
      url: 'https://tiaonline.org/products-and-services/tia-568-standards/',
      publisher: 'TIA',
    },
    {
      name: 'IEEE 802.11 — Wireless LAN (bandas, canales y DFS)',
      url: 'https://standards.ieee.org/ieee/802.11/7028/',
      publisher: 'IEEE',
    },
    {
      name: 'Internet connection speed recommendations — consumo de datos por calidad de video',
      url: 'https://help.netflix.com/en/node/306',
      publisher: 'Netflix',
    },
    {
      name: 'System requirements for Windows, macOS and Linux — ancho de banda de videollamadas',
      url: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060748',
      publisher: 'Zoom',
    },
  ],

  replaces: [
    '/calculadora-ancho-banda-descarga-tiempo',
    '/calculadora-conversor-mbps-a-mb-s',
    '/calculadora-transferencia-archivo-red-lan-tiempo',
    '/calculadora-velocidad-internet-mbps-real',
    '/calculadora-consumo-datos-moviles-streaming',
    '/calculadora-categoria-cable-ethernet-velocidad-distancia',
    '/calculadora-wifi-canal-optimo-24-5-ghz',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-subnetting-mascara-red-cidr',
    '/calculadora-uptime-servidor-nueve-nueves-minutos',
    '/calculadora-tiempo-descarga-archivo-internet',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Medios de conexión.
 *  - cap: techo de velocidad del enlace, en Mbps (0 = sin techo propio, manda
 *    lo que mida el speedtest).
 *  - ef: eficiencia en % (overhead del protocolo).
 *
 * Los valores de fast_ethernet, gigabit, 2.5g, 10g, wifi5 y wifi6 salen tal cual
 * de `transferencia-archivo-red-lan-tiempo.ts`. 'fibra' usa el 85% por defecto
 * de `ancho-banda-descarga-tiempo.ts`. 'wifi24' y 'movil' no existían en las
 * fórmulas viejas y se agregan acá para cerrar la pregunta del hub.
 */
export const MEDIOS: Record<string, { nombre: string; cap: number; ef: number; banda: string; tip: string }> = {
  fibra: {
    nombre: 'Fibra o cablemódem por cable',
    cap: 0,
    ef: 85,
    banda: '',
    tip: 'Enchufada al router medís lo que realmente te vende el ISP.',
  },
  wifi24: {
    nombre: 'Wifi 2,4 GHz',
    cap: 150,
    ef: 45,
    banda: '24',
    tip: 'En 2,4 GHz usá canal 1, 6 u 11 con ancho de 20 MHz.',
  },
  wifi5: {
    nombre: 'Wifi 5 (AC)',
    cap: 300,
    ef: 60,
    banda: '5',
    tip: 'En 5 GHz quedate en 36-48 o 149-165 y evitá los canales DFS.',
  },
  wifi6: {
    nombre: 'Wifi 6 (AX)',
    cap: 600,
    ef: 65,
    banda: '5',
    tip: 'Wifi 6 rinde de verdad cuando hay muchos dispositivos a la vez.',
  },
  fast_ethernet: {
    nombre: 'Fast Ethernet (100 Mbps)',
    cap: 100,
    ef: 88,
    banda: '',
    tip: 'Un puerto de 100 Mbps te tapa cualquier plan más rápido: cambiá el switch.',
  },
  gigabit: {
    nombre: 'Gigabit Ethernet (1 Gbps)',
    cap: 1000,
    ef: 88,
    banda: '',
    tip: 'Gigabit es el estándar sano para una casa: 110 MB/s reales.',
  },
  '2.5g': {
    nombre: '2.5G Ethernet',
    cap: 2500,
    ef: 88,
    banda: '',
    tip: '2,5G aprovecha el cable Cat 5e que ya tenés puesto.',
  },
  '10g': {
    nombre: '10G Ethernet',
    cap: 10000,
    ef: 90,
    banda: '',
    tip: '10G pide Cat 6a en tiradas largas, no Cat 5e.',
  },
  movil: {
    nombre: 'Datos móviles (4G / 5G)',
    cap: 150,
    ef: 70,
    banda: '',
    tip: 'Con datos, el límite no es la velocidad sino los GB del plan.',
  },
};

/**
 * Categorías de cable de cobre. `max` en Mbps y `metros` de tramo máximo,
 * con la frecuencia en MHz. Salen de `categoria-cable-ethernet-velocidad-distancia.ts`.
 * `maxCorto` es la velocidad que Cat 6 sostiene sólo hasta `metrosCorto`.
 */
export const CABLES: Record<
  string,
  { nombre: string; max: number; metros: number; mhz: number; maxCorto?: number; metrosCorto?: number; nota: string }
> = {
  cat5e: { nombre: 'Cat 5e', max: 1000, metros: 100, mhz: 100, nota: '1 Gbps hasta 100 m. Alcanza para cualquier plan doméstico.' },
  cat6: {
    nombre: 'Cat 6',
    max: 1000,
    metros: 100,
    mhz: 250,
    maxCorto: 10000,
    metrosCorto: 37,
    nota: '1 Gbps hasta 100 m y 10 Gbps sólo hasta 37 m.',
  },
  cat6a: { nombre: 'Cat 6a', max: 10000, metros: 100, mhz: 500, nota: '10 Gbps en los 100 m completos: el cable correcto para dejar listo.' },
  cat7: { nombre: 'Cat 7', max: 10000, metros: 100, mhz: 600, nota: '10 Gbps hasta 100 m, con blindaje por par.' },
  cat8: { nombre: 'Cat 8', max: 40000, metros: 30, mhz: 2000, nota: '40 Gbps pero sólo 30 m: es cable de datacenter, no de casa.' },
};

/**
 * Consumo de datos móviles en GB por hora, más la base diaria de navegación.
 * Valores tal cual de `consumo-datos-moviles-streaming.ts`.
 */
export const DATOS = {
  VIDEO_HD: 3.0,
  VIDEO_SD: 0.7,
  MUSICA: 0.07,
  VIDEOLLAMADAS: 1.5,
  REDES: 0.8,
  /** Navegación, WhatsApp y mail: GB por día. */
  BASE: 0.3,
  /** Megabytes en un gigabyte, como los cuenta la fórmula de LAN. */
  MB_POR_GB: 1024,
};

/** Canales recomendados por banda (de `wifi-canal-optimo-24-5-ghz.ts`). */
export const WIFI: Record<string, { canales: string; sugerido: number; ancho: number; consejo: string }> = {
  '24': { canales: '1, 6 y 11', sugerido: 6, ancho: 20, consejo: 'Sólo 1, 6 y 11 no se solapan. Mantené el ancho en 20 MHz.' },
  '5': { canales: '36-48 y 149-165', sugerido: 36, ancho: 80, consejo: 'Los canales 36-48 y 149-165 no requieren DFS. Evitá 52-144 si tenés cortes.' },
};
