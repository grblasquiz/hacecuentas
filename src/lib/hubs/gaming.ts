import type { HubData } from './types';
import { TARIFAS_2026, TARIFA_PARAMS } from './factura-de-luz';

/**
 * Hub de decisión — "¿Qué FPS me da mi PC?"
 * Arquetipo RAMIFICADO (4 casos): cuántos FPS voy a tener (default), qué fuente
 * necesito, cuánto me cuesta jugar por mes y cuánto ping es aceptable.
 *
 * Absorbe 12 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Este hub MEZCLA unidades: FPS, Hz, ms, W, GB y pesos. El resultado declara
 *    su formato por rama y TODAS las filas del desglose declaran el suyo. El
 *    runtime hace Object.assign: una fila sin `format` propio cae a pesos.
 *  - Sólo la rama de costo es plata; FPS, watts, ms y GB van con `format:'unit'`.
 *  - El precio del kWh NO se inventa acá: sale del cuadro tarifario real del
 *    repo (`TARIFAS_2026` / `TARIFA_PARAMS`, que a su vez son copia fiel de
 *    `src/lib/formulas/tarifa-electrica-edenor-edesur-segmentacion-n1-n2-n3.ts`).
 *    Si cambia el cuadro, cambia allá y este hub lo hereda solo.
 *  - `chart.type: 'bars'`: FPS estimados contra los Hz del monitor. El insight
 *    es el desperdicio — 200 FPS en un monitor de 60 Hz son 140 tirados.
 */

/** Precio efectivo del kWh, con la carga impositiva del cuadro real. */
export const KWH_FACTOR_IMPUESTOS =
  (1 + TARIFA_PARAMS.alumbrado) * (1 + TARIFA_PARAMS.iva) * (1 + TARIFA_PARAMS.ley25413);

export const hub: HubData = {
  slug: 'tecnologia/gaming',
  title: '¿Qué FPS me da mi PC? — Calculadora de FPS, fuente, ping y costo 2026',
  description:
    'Estimá cuántos FPS te da tu PC según GPU, CPU, resolución y calidad gráfica, si tu monitor los aprovecha, cuántos watts necesita tu fuente, cuánto te cuesta jugar por mes con la tarifa eléctrica real y qué ping es aceptable para tu juego.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Gaming y hardware',
  h1: '¿Qué FPS me da mi PC?',
  lede:
    'La placa de video pone el techo, el procesador puede bajarlo y el monitor decide cuántos de esos frames vas a ver de verdad. Acá sale el número estimado, dónde está tu cuello de botella, qué fuente te hace falta y cuánto te sale la luz de jugar.',
  stamps: [
    'Actualizado 27-07-2026',
    'GPUs y CPUs de generación actual',
    'Tarifa eléctrica AMBA real (Decreto 943/2025)',
    '12 calculadoras adentro',
  ],

  resultLabel: 'FPS estimados en tu configuración',

  cases: {
    title: '¿Qué querés saber de tu equipo?',
    intro:
      'Las cuatro ramas comparten el panel de datos: completá los campos de la que elegiste. La estimación de FPS es la más pedida, así que arranca ahí.',
    items: [
      {
        id: 'fps',
        label: 'Cuántos FPS voy a tener',
        hint: 'GPU + CPU + resolución + calidad',
        answer:
          'Los FPS los pone la GPU, pero el CPU puede ponerles un techo y el monitor decide cuántos vas a ver. Si tu placa da 200 FPS y tu monitor es de 60 Hz, 140 se tiran.',
        yes: [
          'Los FPS estimados con tu combinación de placa, procesador, resolución y calidad gráfica',
          'Cuál de los dos componentes es el cuello de botella y por cuánto',
          'Cuántos de esos frames aprovecha tu monitor y cuántos se desperdician',
          'El frametime en milisegundos, que es lo que realmente se siente al mover el mouse',
          'Qué pasaría si activás DLSS o FSR en modo calidad o balanceado',
        ],
        warn: [
          'Es una estimación con juegos AAA modernos: los esports (CS2, Valorant, LoL) dan 2 a 4 veces más FPS y los simuladores pesados, bastante menos',
          'Ningún estimador reemplaza al benchmark del juego que vos jugás: la diferencia entre motores es enorme',
          'Los FPS promedio mienten: lo que se siente son los 1% low. Un promedio de 120 con caídas a 45 se percibe peor que un estable de 90',
          'Con poca RAM (8 GB) o VRAM insuficiente para la textura elegida, los FPS se derrumban sin importar la potencia bruta',
        ],
        plazo: 'medí siempre con el juego corriendo 10 minutos: los primeros 60 segundos están falseados por la compilación de shaders.',
      },
      {
        id: 'fuente',
        label: 'Qué fuente necesito',
        hint: 'Watts, certificación y margen',
        answer:
          'Sumá el consumo real de todos los componentes y multiplicá por 1,35: ese margen del 35% es lo que separa una PC estable de una que se reinicia sola.',
        yes: [
          'El consumo real estimado del equipo, componente por componente',
          'Los watts de fuente recomendados, ya redondeados a un valor comercial',
          'La certificación 80 PLUS que corresponde a ese rango de potencia',
          'Cuánto pesa la placa de video en el total (casi siempre, más de la mitad)',
        ],
        warn: [
          'El margen del 35% no es capricho: cubre los picos transitorios de las GPU modernas, que duran microsegundos pero disparan las protecciones de una fuente justa',
          'Una fuente genérica sin certificación puede entregar bastante menos de lo que dice la etiqueta',
          'Para las RTX 40 y 50 hace falta conector 12VHPWR nativo, no un adaptador de cuatro cabezas',
          'Las fuentes trabajan más eficientes cerca del 50% de su carga: sobredimensionar demasiado tampoco es gratis',
        ],
        plazo: 'una fuente de calidad dura 7 a 10 años y sobrevive a dos o tres cambios de placa.',
      },
      {
        id: 'costo',
        label: 'Cuánto me cuesta jugar por mes',
        hint: 'Luz, juegos y costo por hora',
        answer:
          'Una PC gamer de 400 W jugando 4 horas por día consume unos 55 kWh al mes: con la tarifa AMBA vigente, eso son varios miles de pesos que no aparecen en ningún lado hasta que llega la boleta.',
        yes: [
          'Los kWh que consume tu PC al mes, separando el uso en juego del uso en idle',
          'El costo en pesos con el cuadro tarifario real de Edenor o Edesur, impuestos incluidos',
          'El costo por hora de juego sumando la luz y lo que pagaste por el juego',
          'La comparación contra el cine y contra una suscripción de streaming',
        ],
        warn: [
          'La eficiencia de la fuente (87% en una 80 PLUS Gold típica) hace que de la pared salga más energía de la que consumen los componentes',
          'El cuadro tarifario cambia varias veces al año y la tasa municipal de alumbrado varía por partido: el número que manda es el de tu boleta',
          'Si te pasás del bloque de kWh bonificado, el excedente se paga a precio pleno y el costo marginal se duplica',
          'El monitor, los parlantes y el router no están en la cuenta de la PC pero también suman',
        ],
        plazo: 'la facturación eléctrica es bimestral en buena parte del AMBA: el consumo de este mes lo ves recién en el próximo resumen.',
      },
      {
        id: 'ping',
        label: 'Cuánto ping es aceptable',
        hint: 'Latencia, distancia y tipo de juego',
        answer:
          'Depende del género: en un FPS competitivo por encima de 50 ms ya perdés duelos; en un MMORPG, 150 ms son perfectamente jugables.',
        yes: [
          'El piso teórico de latencia que impone la distancia al servidor: la luz en fibra no va más rápido',
          'El ping realista esperable con el ruteo real, y cuánto overhead está agregando tu conexión',
          'Si tu ping actual es excelente, bueno, aceptable o directamente malo para el género que jugás',
          'Cuántos frames de desventaja significa ese ping a los FPS que tenés',
        ],
        warn: [
          'El ping no es lo único: el jitter (la variación del ping) arruina más partidas que un ping alto pero estable',
          'El WiFi agrega entre 5 y 30 ms y muchísimo jitter. Para competitivo, cable',
          'Un ping muy por encima del esperable para la distancia es problema de ruteo del ISP, no de tu PC',
          'La latencia total percibida suma también el tiempo de render de tu PC y el retardo del monitor, no sólo la red',
        ],
        plazo: 'medí el ping en horario pico (21 a 23 h), que es cuando la red del ISP está más cargada.',
      },
    ],
  },

  inputsTitle: 'Contanos qué equipo tenés',
  inputsIntro:
    'Con la placa de video, el procesador, la resolución y los Hz del monitor ya sale la estimación de FPS. El resto de los campos alimenta las otras tres ramas.',
  fields: [
    {
      id: 'gpu',
      label: 'Placa de video',
      type: 'select',
      value: 'rtx4060',
      options: [
        { value: 'igpu', label: 'Gráficos integrados (sin placa dedicada)' },
        { value: 'gtx1650', label: 'GTX 1650 / RX 6400 — entrada' },
        { value: 'rtx3050', label: 'RTX 3050 / RX 6600 — 1080p básico' },
        { value: 'rtx4060', label: 'RTX 4060 / RX 7600 — 1080p mainstream' },
        { value: 'rtx4060ti', label: 'RTX 4060 Ti / RX 7700 XT — 1080p alto' },
        { value: 'rtx4070s', label: 'RTX 4070 Super — 1440p' },
        { value: 'rtx4070tis', label: 'RTX 4070 Ti Super — 1440p alto' },
        { value: 'rtx4080s', label: 'RTX 4080 Super — 4K' },
        { value: 'rtx4090', label: 'RTX 4090 — 4K sin concesiones' },
      ],
    },
    {
      id: 'cpu',
      label: 'Procesador',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'basico', label: 'Básico (i3, Ryzen 3, o gama media de 6+ años)' },
        { value: 'medio', label: 'Medio (Ryzen 5 5600, i5-12400)' },
        { value: 'alto', label: 'Alto (Ryzen 5 7600, i5-13600K)' },
        { value: 'top', label: 'Top (Ryzen 7 7800X3D, i7-14700K y arriba)' },
      ],
    },
    {
      id: 'resolucion',
      label: 'Resolución a la que jugás',
      type: 'select',
      value: '1080p',
      options: [
        { value: '720p', label: '1280 × 720 (720p)' },
        { value: '1080p', label: '1920 × 1080 (1080p / Full HD)' },
        { value: '1440p', label: '2560 × 1440 (1440p / QHD)' },
        { value: '4k', label: '3840 × 2160 (4K / UHD)' },
      ],
    },
    {
      id: 'calidad',
      label: 'Calidad gráfica',
      type: 'select',
      value: 'alto',
      options: [
        { value: 'bajo', label: 'Baja (competitivo, todo al mínimo)' },
        { value: 'medio', label: 'Media' },
        { value: 'alto', label: 'Alta' },
        { value: 'ultra', label: 'Ultra (con ray tracing si el juego lo tiene)' },
      ],
    },
    {
      id: 'genero',
      label: 'Tipo de juego',
      type: 'select',
      value: 'accion',
      options: [
        { value: 'competitivo', label: 'Competitivo / esports (CS2, Valorant, LoL)' },
        { value: 'accion', label: 'Acción / RPG / mundo abierto AAA' },
        { value: 'simulacion', label: 'Simulación pesada (MSFS, Cities)' },
        { value: 'casual', label: 'Casual / indie' },
      ],
    },
    {
      id: 'upscaling',
      label: 'Escalado por IA (DLSS / FSR / XeSS)',
      type: 'select',
      value: 'off',
      options: [
        { value: 'off', label: 'Desactivado (resolución nativa)' },
        { value: 'calidad', label: 'Modo calidad' },
        { value: 'balanceado', label: 'Modo balanceado' },
        { value: 'rendimiento', label: 'Modo rendimiento' },
      ],
    },
    {
      id: 'hz',
      label: 'Tasa de refresco de tu monitor',
      type: 'number',
      suffix: 'Hz',
      value: 144,
      min: 24,
      max: 540,
      step: 1,
      help: 'El número que figura en la ficha del monitor: 60, 75, 144, 165, 240…',
    },
    {
      id: 'ramGb',
      label: 'Memoria RAM',
      type: 'number',
      suffix: 'GB',
      value: 16,
      min: 4,
      max: 256,
      step: 4,
    },
    {
      id: 'discos',
      label: 'Discos y SSD instalados',
      type: 'number',
      suffix: 'unidades',
      value: 2,
      min: 1,
      max: 12,
      step: 1,
    },
    {
      id: 'refrigeracion',
      label: 'Refrigeración',
      type: 'select',
      value: 'aire',
      options: [
        { value: 'stock', label: 'Cooler stock (5 W)' },
        { value: 'aire', label: 'Torre de aire (8 W)' },
        { value: 'aio240', label: 'Refrigeración líquida AIO 240 (15 W)' },
        { value: 'aio360', label: 'Refrigeración líquida AIO 360 (22 W)' },
      ],
    },
    {
      id: 'horasJuegoDia',
      label: 'Horas que jugás por día',
      type: 'number',
      suffix: 'h',
      value: 4,
      min: 0,
      max: 24,
      step: 0.5,
    },
    {
      id: 'horasIdleDia',
      label: 'Horas por día con la PC prendida sin jugar',
      type: 'number',
      suffix: 'h',
      value: 6,
      min: 0,
      max: 24,
      step: 0.5,
    },
    {
      id: 'distribuidora',
      label: 'Distribuidora eléctrica',
      type: 'select',
      value: 'edenor',
      options: [
        { value: 'edenor', label: 'Edenor' },
        { value: 'edesur', label: 'Edesur' },
      ],
    },
    {
      id: 'condicion',
      label: 'Tu condición de subsidio eléctrico',
      type: 'select',
      value: 'con_subsidio',
      options: [
        { value: 'con_subsidio', label: 'Con subsidio (SEF): 50% sobre el bloque bonificado' },
        { value: 'sin_subsidio', label: 'Sin subsidio (tarifa plena)' },
      ],
      help: 'Si ya te pasás del bloque bonificado, el kWh extra de la PC se paga a precio pleno igual.',
    },
    {
      id: 'precioJuego',
      label: 'Lo que pagaste por el juego (opcional)',
      type: 'number',
      prefix: '$',
      value: 60000,
      min: 0,
      step: 1000,
      thousands: true,
    },
    {
      id: 'horasJugadas',
      label: 'Horas que le metiste a ese juego',
      type: 'number',
      suffix: 'h',
      value: 40,
      min: 0,
      max: 20000,
      step: 1,
    },
    {
      id: 'juegosAAA',
      label: 'Juegos AAA instalados',
      type: 'number',
      suffix: 'juegos',
      value: 5,
      min: 0,
      max: 500,
      step: 1,
      help: 'Un AAA moderno pesa unos 85 GB; un indie, 6 GB; un MMO, 65 GB.',
    },
    {
      id: 'juegosIndie',
      label: 'Juegos indie instalados',
      type: 'number',
      suffix: 'juegos',
      value: 10,
      min: 0,
      max: 1000,
      step: 1,
    },
    {
      id: 'juegosMMO',
      label: 'MMO o shooters con temporadas instalados',
      type: 'number',
      suffix: 'juegos',
      value: 2,
      min: 0,
      max: 100,
      step: 1,
    },
    {
      id: 'distanciaKm',
      label: 'Distancia al servidor del juego',
      type: 'number',
      suffix: 'km',
      value: 900,
      min: 1,
      max: 20000,
      step: 10,
      thousands: true,
      help: 'Buenos Aires–San Pablo 1.680 km · Buenos Aires–Miami 7.100 km · Buenos Aires–Santiago 1.140 km.',
    },
    {
      id: 'pingReal',
      label: 'Ping que te marca el juego',
      type: 'number',
      suffix: 'ms',
      value: 45,
      min: 0,
      max: 2000,
      step: 1,
    },
    {
      id: 'generoPing',
      label: 'Género para evaluar el ping',
      type: 'select',
      value: 'fps',
      options: [
        { value: 'fps', label: 'FPS competitivo (CS2, Valorant)' },
        { value: 'battle_royale', label: 'Battle Royale (Fortnite, Apex)' },
        { value: 'moba', label: 'MOBA (LoL, Dota)' },
        { value: 'mmorpg', label: 'MMORPG' },
        { value: 'casual', label: 'Casual / estrategia' },
      ],
    },
  ],
  fineprint:
    'La estimación de FPS es orientativa: parte de juegos AAA modernos en un equipo sano y se ajusta por género. Cada motor gráfico se comporta distinto y ningún estimador reemplaza al benchmark del juego que jugás. El cuadro tarifario eléctrico cambia varias veces al año: el número que manda siempre es el de tu boleta.',

  chart: {
    type: 'bars',
    title: 'Tus FPS contra los Hz de tu monitor',
    caption:
      'La primera barra son los FPS que estimamos que rinde tu PC; la segunda, los Hz de tu monitor. Si los FPS superan a los Hz, la diferencia es rendimiento que se tira: el monitor no puede mostrar frames que no alcanza a dibujar. Si quedan por debajo, estás desaprovechando el monitor que compraste.',
  },
  breakdownTitle: 'El detalle, número por número',
  breakdownIntro:
    'Cada fila trae su unidad: hay FPS, Hz, milisegundos, watts, gigabytes y pesos. Las barras comparan cada concepto con el mayor de la lista.',

  faq: [
    {
      q: '¿Cuántos FPS necesito realmente para jugar bien?',
      a: 'Depende del género. Para un juego competitivo el piso son 120 FPS y lo recomendable 144, porque cada frame son 7 milisegundos menos de latencia y en un duelo eso decide. Para acción, RPG o mundo abierto, 60 FPS estables ya se sienten fluidos y 120 son un lujo notorio. Para casual o indie alcanza con 60, y hasta 30 es jugable. Más importante que el promedio son los 1% low: un promedio de 120 con caídas a 45 se siente peor que un estable de 90.',
    },
    {
      q: '¿Sirve de algo tener más FPS que Hz tiene mi monitor?',
      a: 'Un poco, pero mucho menos de lo que parece. Un monitor de 60 Hz dibuja 60 imágenes por segundo y punto: si tu placa genera 200, 140 se descartan. Lo que sí ganás con FPS de sobra es latencia de entrada más baja —el frame que ves es más reciente— y por eso los jugadores competitivos apuntan a duplicar los Hz. Pero es un rendimiento decreciente: si te sobra tanto margen, subí calidad gráfica o resolución, o cambiá el monitor, que es donde vas a notar la diferencia.',
    },
    {
      q: '¿Cómo sé si el cuello de botella es el procesador o la placa de video?',
      a: 'La prueba casera es bajar la resolución. Si al pasar de 1440p a 720p los FPS suben poco o nada, el limitante es el CPU, porque la carga que bajaste era de la GPU y los frames no aparecieron. Si en cambio se disparan, la GPU era el freno. Mirando el monitor de recursos es aún más directo: GPU al 99% y CPU al 50% es lo deseable en juegos; CPU al 95% con GPU al 60% significa que la placa está esperando al procesador.',
    },
    {
      q: '¿De cuántos watts tiene que ser mi fuente?',
      a: 'Sumá el consumo real de los componentes —la GPU se lleva entre el 50% y el 65% del total— y multiplicá por 1,35. Ese margen del 35% cubre los picos transitorios de las placas modernas, que duran microsegundos pero disparan la protección de una fuente justa. Para una PC con RTX 4060 y un Ryzen 5, unos 550 W Gold sobran; con una 4080 Super, 850 W; con una 4090, 1.000 W y conector 12VHPWR nativo, no un adaptador.',
    },
    {
      q: '¿Cuánto cuesta tener la PC gamer prendida todo el día?',
      a: 'Una PC gamer promedio consume unos 400 W jugando y 90 W en reposo, y hay que dividir por la eficiencia de la fuente (0,87 en una 80 PLUS Gold) para saber cuánto sale de la pared. Con 4 horas de juego y 6 de idle por día son unos 74 kWh al mes. Al precio pleno del cuadro tarifario AMBA vigente, con impuestos y tasa de alumbrado incluidos, eso ronda los 22.000 pesos mensuales; con subsidio y dentro del bloque bonificado, la mitad. Dejarla prendida las 24 horas sin usarla agrega unos 65 kWh al mes que no rinden nada.',
    },
    {
      q: '¿Qué ping es aceptable para jugar online?',
      a: 'Para FPS competitivo, menos de 15 ms es excelente, hasta 30 ms es bueno y por encima de 50 ms empezás a perder duelos que deberías ganar. En battle royale y MOBA el umbral es más generoso: hasta 50 ms es cómodo y 80 sigue siendo jugable. En un MMORPG podés jugar tranquilo con 150 ms. Y hay algo que importa más que el número: el jitter. Un ping estable de 60 ms se juega mejor que uno que salta entre 20 y 90.',
    },
    {
      q: '¿Por qué tengo ping alto si tengo fibra óptica?',
      a: 'Porque la fibra resuelve el ancho de banda, no la distancia. La luz en fibra viaja a unos 200.000 km/s, así que un servidor a 7.000 km impone un piso físico de 70 ms de ida y vuelta que ninguna conexión puede romper. Si tu ping es mucho más alto que ese piso —más de tres veces— el problema es el ruteo de tu proveedor, que puede estar mandando el tráfico por un camino largo. También suman el WiFi (5 a 30 ms y mucho jitter) y la congestión en horario pico.',
    },
    {
      q: '¿Cuánto espacio en disco necesito para mis juegos?',
      a: 'Un AAA moderno pesa alrededor de 85 GB y los hay de 150 o más; un MMO o shooter con temporadas ronda los 65 GB y crece con cada actualización; un indie, unos 6 GB. Sumá el sistema operativo (unos 100 GB con programas) y dejá un 10% libre, porque un SSD lleno pierde velocidad de escritura. Con una biblioteca típica de cinco AAA, dos MMO y diez indies, 1 TB queda justo y 2 TB es lo cómodo. Los juegos que no jugás siempre pueden vivir en un HDD barato.',
    },
    {
      q: '¿DLSS o FSR dan FPS gratis?',
      a: 'Dan muchos FPS, pero no son gratis. El escalado renderiza el juego a menos resolución y lo reconstruye con IA: en modo calidad se gana entre un 30% y un 40% de rendimiento con una pérdida de nitidez que en movimiento casi no se nota, y en modo rendimiento se puede llegar a duplicar los FPS a costa de artefactos visibles, sobre todo en texturas finas y en los bordes en movimiento. La generación de cuadros es otra cosa: sube el número de FPS pero no baja la latencia, así que en competitivo no conviene.',
    },
    {
      q: '¿Cómo se convierte la sensibilidad del mouse de un juego a otro?',
      a: 'Lo que hay que mantener constante son los centímetros que recorre el mouse para dar un giro de 360°. Cada juego tiene su propio factor de yaw —CS2 y Apex usan 0,022 grados por count, Valorant 0,07, Overwatch 0,0066— así que la sensibilidad equivalente es la del juego origen multiplicada por el cociente entre ambos factores. El eDPI (DPI del mouse por sensibilidad) sirve para comparar dentro del mismo juego, pero no entre juegos distintos. La mayoría de los profesionales de FPS juega entre 35 y 50 cm por giro completo.',
    },
    {
      q: '¿Conviene más subir de placa de video o de procesador?',
      a: 'En la enorme mayoría de los casos, la placa: es la que pone el techo de FPS en 1080p alto, 1440p y 4K. El procesador sólo se vuelve prioritario en tres escenarios: si jugás competitivo a 240 Hz o más con la calidad al mínimo, si tu juego es de simulación o estrategia con mucha unidad en pantalla, o si tu CPU tiene ya varias generaciones encima y la placa nueva se queda esperándolo. La prueba de la resolución que está más arriba en estas preguntas te dice en cuál de los dos grupos estás.',
    },
    {
      q: '¿Un juego caro sale caro por hora?',
      a: 'Casi nunca, y esa es la métrica que conviene mirar. Un juego de 60.000 pesos al que le metés 40 horas sale 1.500 pesos la hora; con 200 horas baja a 300. Comparado con una entrada de cine —unos 2.500 pesos por dos horas— casi cualquier juego que superes las 30 horas ya es entretenimiento barato. Sumale la luz, que en una PC gamer ronda los 75 pesos por hora de juego, y seguís muy por debajo de cualquier salida.',
    },
  ],

  sources: [
    {
      name: 'ENRE — Cuadros tarifarios vigentes de Edenor y Edesur',
      url: 'https://www.argentina.gob.ar/enre/cuadros_tarifarios',
      publisher: 'Ente Nacional Regulador de la Electricidad',
    },
    {
      name: 'Decreto 943/2025 — Subsidio Energético Federal (bloques bonificados de consumo)',
      url: 'https://www.boletinoficial.gob.ar/',
      publisher: 'Boletín Oficial de la República Argentina',
    },
    {
      name: '80 PLUS — Programa de certificación de eficiencia de fuentes de alimentación',
      url: 'https://www.clearesult.com/80plus/',
      publisher: 'CLEAResult',
    },
    {
      name: 'ATX 3.1 Desktop Platform Power Supply Design Guide (picos transitorios y conector 12V-2x6)',
      url: 'https://www.intel.com/content/www/us/en/developer/articles/technical/atx-power-supply-design-guides.html',
      publisher: 'Intel',
    },
    {
      name: 'VESA Adaptive-Sync — especificación de tasa de refresco variable',
      url: 'https://www.displayport.org/faq/#tab-adaptive-sync',
      publisher: 'VESA / DisplayPort',
    },
  ],

  replaces: [
    '/calculadora-watts-fuente-alimentacion-pc',
    '/calculadora-energia-pc-gaming-costo-mes',
    '/calculadora-ping-latencia-distancia',
    '/calculadora-configuracion-pc-bottleneck',
    '/calculadora-sensibilidad-mouse-dpi-juego',
    '/calculadora-gaming-fps-componentes-pc-armar-presupuesto',
    '/calculadora-fps-ideal-monitor-hz',
    '/calculadora-fps-fluidez-video-juego',
    '/calculadora-ping-latencia-gaming-aceptable',
    '/calculadora-almacenamiento-juegos-gb',
    '/calculadora-fps-frames-por-segundo-juego',
    '/calculadora-costo-gaming-por-hora',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Placas de video.
 *  fps    = FPS medios en un AAA moderno a 1080p ULTRA, sin escalado.
 *  watts  = consumo pico de la placa, copia fiel de la tabla `gpuW` de
 *           `src/lib/formulas/watts-fuente-alimentacion-pc.ts`.
 *  psu    = presupuesto de referencia de la build (USD), de la tabla `DATA` de
 *           `src/lib/formulas/gaming-fps-componentes-pc-armar-presupuesto.ts`.
 */
export const GPUS: Record<string, { nombre: string; fps: number; watts: number; usd: number }> = {
  igpu: { nombre: 'Gráficos integrados', fps: 22, watts: 15, usd: 0 },
  gtx1650: { nombre: 'GTX 1650 / RX 6400', fps: 42, watts: 130, usd: 450 },
  rtx3050: { nombre: 'RTX 3050 / RX 6600', fps: 62, watts: 170, usd: 550 },
  rtx4060: { nombre: 'RTX 4060 / RX 7600', fps: 82, watts: 200, usd: 650 },
  rtx4060ti: { nombre: 'RTX 4060 Ti / RX 7700 XT', fps: 104, watts: 200, usd: 960 },
  rtx4070s: { nombre: 'RTX 4070 Super', fps: 132, watts: 320, usd: 1200 },
  rtx4070tis: { nombre: 'RTX 4070 Ti Super', fps: 158, watts: 320, usd: 1540 },
  rtx4080s: { nombre: 'RTX 4080 Super', fps: 196, watts: 355, usd: 2150 },
  rtx4090: { nombre: 'RTX 4090', fps: 246, watts: 450, usd: 2800 },
};

/**
 * Procesadores.
 *  cap   = techo de FPS que el CPU puede alimentar (casi independiente de la
 *          resolución: por eso es el que define el bottleneck).
 *  watts = consumo pico, copia fiel de la tabla `cpuW` del módulo real.
 */
export const CPUS: Record<string, { nombre: string; cap: number; watts: number }> = {
  basico: { nombre: 'Básico (i3 / Ryzen 3)', cap: 72, watts: 65 },
  medio: { nombre: 'Medio (Ryzen 5 5600 / i5-12400)', cap: 158, watts: 125 },
  alto: { nombre: 'Alto (Ryzen 5 7600 / i5-13600K)', cap: 228, watts: 180 },
  top: { nombre: 'Top (Ryzen 7 7800X3D / i7-14700K)', cap: 318, watts: 253 },
};

/** Carga relativa de cada resolución respecto de 1080p (medida, no lineal). */
export const RESOLUCIONES: Record<string, { nombre: string; factor: number; px: number }> = {
  '720p': { nombre: '720p', factor: 1.48, px: 921600 },
  '1080p': { nombre: '1080p', factor: 1, px: 2073600 },
  '1440p': { nombre: '1440p', factor: 0.68, px: 3686400 },
  '4k': { nombre: '4K', factor: 0.42, px: 8294400 },
};

/** Multiplicador de FPS por preset gráfico. La base de la tabla GPUS es ultra. */
export const CALIDADES: Record<string, { nombre: string; factor: number }> = {
  bajo: { nombre: 'Baja', factor: 1.8 },
  medio: { nombre: 'Media', factor: 1.45 },
  alto: { nombre: 'Alta', factor: 1.18 },
  ultra: { nombre: 'Ultra', factor: 1 },
};

/** Multiplicador por género respecto de un AAA moderno. */
export const GENEROS: Record<string, { nombre: string; factor: number; min: number; rec: number; ideal: number }> = {
  competitivo: { nombre: 'Competitivo / esports', factor: 3.1, min: 120, rec: 144, ideal: 240 },
  accion: { nombre: 'Acción / RPG AAA', factor: 1, min: 45, rec: 60, ideal: 120 },
  simulacion: { nombre: 'Simulación pesada', factor: 0.72, min: 30, rec: 60, ideal: 90 },
  casual: { nombre: 'Casual / indie', factor: 2.4, min: 30, rec: 60, ideal: 60 },
};

/** Ganancia de FPS del escalado por IA (DLSS / FSR / XeSS). */
export const UPSCALING: Record<string, { nombre: string; factor: number }> = {
  off: { nombre: 'Sin escalado', factor: 1 },
  calidad: { nombre: 'Calidad', factor: 1.35 },
  balanceado: { nombre: 'Balanceado', factor: 1.55 },
  rendimiento: { nombre: 'Rendimiento', factor: 1.85 },
};

/** Consumo de la refrigeración, copia fiel de la tabla `refrigW` del módulo real. */
export const REFRIGERACION: Record<string, { nombre: string; watts: number }> = {
  stock: { nombre: 'Cooler stock', watts: 5 },
  aire: { nombre: 'Torre de aire', watts: 8 },
  aio240: { nombre: 'AIO 240', watts: 15 },
  aio360: { nombre: 'AIO 360', watts: 22 },
};

/** Parámetros de la fuente y del resto del equipo (módulo real de watts de PSU). */
export const PSU = {
  /** Consumo de placa base, ventiladores y periféricos USB. */
  BASE_W: 40,
  /** Watts por GB de RAM. */
  RAM_W_GB: 0.6,
  /** Watts por unidad de almacenamiento. */
  DISCO_W: 5,
  /** Margen de seguridad sobre el consumo real. */
  MARGEN: 1.35,
  /** Escalón comercial de potencia. */
  ESCALON: 50,
  /** Eficiencia típica de una fuente 80 PLUS Gold. */
  EFICIENCIA: 0.87,
  /** Fracción del pico que consume el equipo en reposo. */
  IDLE_FRAC: 0.22,
};

/** Peso típico de cada tipo de juego, en GB (módulo real de almacenamiento). */
export const PESO_JUEGOS = { aaa: 85, indie: 6, mmo: 65, sistema: 100, margen: 0.1 };

/** Umbrales de ping por género, copia fiel del módulo real. */
export const PING_RANGOS: Record<string, { excelente: number; bueno: number; aceptable: number; nombre: string }> = {
  fps: { excelente: 15, bueno: 30, aceptable: 50, nombre: 'FPS competitivo' },
  moba: { excelente: 30, bueno: 50, aceptable: 80, nombre: 'MOBA' },
  battle_royale: { excelente: 30, bueno: 50, aceptable: 70, nombre: 'Battle Royale' },
  mmorpg: { excelente: 50, bueno: 80, aceptable: 150, nombre: 'MMORPG' },
  casual: { excelente: 100, bueno: 150, aceptable: 250, nombre: 'Casual / Estrategia' },
};

/** Velocidad de la luz en fibra óptica, km/s (≈ 2/3 de c). */
export const VELOCIDAD_FIBRA = 200000;

/** Tarifa eléctrica: NO se hardcodea acá, viene del cuadro real del repo. */
export { TARIFAS_2026, TARIFA_PARAMS };

/** Referencias de entretenimiento para el costo por hora. */
export const REFERENCIAS_OCIO = {
  /** Entrada de cine y duración media de una película, en horas. */
  cinePrecio: 2500,
  cineHoras: 2,
  /** Abono mensual de streaming y horas de uso mensual típicas. */
  streamingPrecio: 5000,
  streamingHoras: 20,
};

/** Días considerados en un mes. */
export const DIAS_MES = 30;
