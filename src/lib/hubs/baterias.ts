import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto dura la batería?"
 *
 * Arquetipo RAMIFICADO: la misma pregunta cambia por completo según qué tenga
 * la persona adelante — un dispositivo con una batería en mAh, un banco de
 * 12 V en Ah, un UPS con un servidor colgado, un cargador enchufado o un pack
 * LiPo de dron. Por eso usa `cases` y NO `answer`.
 *
 * Absorbe 9 URLs de calculadora suelta (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` y CADA fila del
 *    desglose declara el suyo (h, min, Wh, mAh, mA, A, V, W, %, C). Una fila
 *    sin `format` cae a "$" y la página miente.
 *  - Los dos números que separan la cuenta ingenua de la real son la
 *    EFICIENCIA (típico 85%) y la PROFUNDIDAD DE DESCARGA (DoD). Las dos
 *    aparecen como fila propia en todas las ramas donde aplican, y el gráfico
 *    de barras muestra siempre energía aprovechable contra energía que no vas
 *    a poder usar.
 */
export const hub: HubData = {
  slug: 'tecnologia/baterias',
  title: '¿Cuánto dura la batería? Autonomía en mAh, Ah, UPS, tiempo de carga y LiPo',
  description:
    'Calculá cuántas horas dura una batería según su capacidad en mAh o Ah y el consumo real, la autonomía de un UPS con tu carga en watts, el tiempo de carga según el cargador y el tipo de celda, y el tiempo de vuelo de un pack LiPo. Con eficiencia y profundidad de descarga, que es lo que separa la cuenta ingenua de la real.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y cálculo de autonomía',
  h1: '¿Cuánto dura la batería?',
  lede:
    'La cuenta de servilleta —capacidad dividido consumo— siempre da de más. La batería nunca entrega el 100% de lo que dice la etiqueta y casi nunca conviene vaciarla del todo. Partimos del caso más buscado, un dispositivo con su batería en mAh, y lo cambiás si el tuyo es otro.',
  stamps: [
    'Actualizado 27-07-2026',
    'Eficiencia y profundidad de descarga incluidas',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu autonomía',

  cases: {
    title: '¿Qué batería estás midiendo?',
    intro:
      'Partimos del caso más frecuente: un dispositivo con la capacidad escrita en mAh. Si el tuyo es un banco de 12 V, un UPS, una carga en curso o un pack de dron, cambialo.',
    items: [
      {
        id: 'dispositivo',
        label: 'Un dispositivo con batería en mAh',
        hint: 'El caso más común',
        answer:
          'Horas = capacidad en mAh × eficiencia ÷ consumo en mA. Con 85% de eficiencia, una de 5.000 mAh que consume 200 mA dura unas 21 horas.',
        yes: [
          'La capacidad en mAh es carga, no energía: para pasar a watt-hora hay que multiplicar por la tensión (3,7 V nominal en una celda de litio)',
          'La eficiencia descuenta lo que se pierde en la conversión, el autoconsumo del circuito y la caída de tensión al final de la descarga: 85% es el valor típico de un dispositivo con electrónica de gestión',
          'Un powerbank de 10.000 mAh no carga tres veces un celular de 3.000 mAh: la conversión de 3,7 V a 5 V se lleva cerca del 30% del camino',
          'El consumo real varía según lo que esté haciendo el aparato: el número que cargues es un promedio, no un máximo',
          'La duración escala lineal con la capacidad e inversa con el consumo: el doble de mAh es el doble de horas, el doble de consumo es la mitad',
        ],
        warn: [
          'Con el frío la capacidad útil cae: por debajo de 0 °C una celda de litio puede perder entre 20% y 30% de autonomía',
          'La batería envejece: después de unos 500 ciclos completos, una celda de litio suele quedar cerca del 80% de su capacidad original',
          'Los mAh de bazar mienten mucho: es común que un powerbank barato entregue la mitad de lo que dice la etiqueta',
          'Nunca cargues la capacidad de un powerbank contra el consumo de un aparato de 5 V sin corregir por tensión: te va a dar de más',
        ],
        plazo:
          'para uso diario, dimensioná con un 20% de margen sobre el resultado: entre envejecimiento y temperatura, la autonomía real del segundo año es bastante menor que la del primer día.',
      },
      {
        id: 'banco',
        label: 'Un banco de 12 V medido en Ah',
        hint: 'Solar, náutica, motorhome',
        answer:
          'Horas = Ah × V × profundidad de descarga × eficiencia ÷ consumo en watts. Una de 100 Ah a 12 V al 50% de DoD alimenta 100 W unas 5,7 horas.',
        yes: [
          'La energía nominal es Ah × V: una batería de 100 Ah a 12 V guarda 1.200 Wh en el papel',
          'La profundidad de descarga (DoD) es cuánto de esa energía podés sacar sin arruinar la batería: 50% en plomo-ácido, 80% en AGM de ciclo profundo y hasta 90% en LiFePO4',
          'La eficiencia de descarga descuenta las pérdidas del inversor y el cableado: 95% es realista con corriente continua, y baja al 85-90% si hay un inversor a 220 V en el medio',
          'De los 1.200 Wh nominales de una batería de plomo de 100 Ah, sólo unos 570 Wh son realmente aprovechables',
          'Para duplicar la autonomía conviene sumar batería en paralelo (más Ah) o subir la tensión del banco a 24 V y bajar la corriente',
        ],
        warn: [
          'Bajar del 50% de DoD en una batería de plomo-ácido le corta la vida a la mitad o menos: no es una recomendación conservadora, es la curva de ciclos del fabricante',
          'La capacidad en Ah se declara a un régimen de descarga determinado (habitualmente C20, o sea 20 horas): si descargás mucho más rápido, la batería entrega menos Ah reales — es el efecto Peukert',
          'Una batería de arranque de auto NO es de ciclo profundo: descargarla al 50% repetidas veces la destruye en pocos meses',
          'El inversor consume aunque no haya nada enchufado: sumá su autoconsumo al cálculo si va a quedar prendido toda la noche',
        ],
        plazo:
          'dimensioná el banco por la energía de la noche más larga del año, no por la del promedio: es el día que te vas a quedar sin luz.',
      },
      {
        id: 'ups',
        label: 'Un UPS con equipos enchufados',
        hint: 'Respaldo de servidor o PC',
        answer:
          'Si sabés los Ah y los volts de la batería: minutos = Ah × V × eficiencia × 60 ÷ watts. Si no, se estima desde los VA del equipo.',
        yes: [
          'Los VA del UPS no son watts: la potencia útil real ronda el 60% de los VA declarados, así que un UPS de 1.000 VA sostiene unos 600 W',
          'Con la batería a la vista (Ah y V) el cálculo es exacto: energía útil = Ah × V × eficiencia, y los minutos salen de dividirla por la carga en watts',
          'Sin el dato de la batería se estima con la energía típica de un UPS de esa capacidad y una corrección tipo Peukert, que premia las cargas bajas: la misma batería rinde proporcionalmente más cuanto menos le pidas',
          'La utilización es la carga dividida por la potencia útil: por debajo del 50% estás holgado, del 80% para arriba estás al límite',
          'El UPS no es un generador: está pensado para guardar y apagar de forma ordenada, o para cubrir un corte de minutos',
        ],
        warn: [
          'Por encima del 100% de utilización el equipo está sobrecargado y puede cortar de golpe, que es exactamente lo que venías a evitar',
          'Las baterías de un UPS son SLA y duran entre 3 y 5 años: pasado ese tiempo la autonomía real puede ser una fracción de la calculada, aunque el equipo no avise nada',
          'Nunca enchufes una impresora láser ni un equipo con motor a un UPS: el pico de arranque supera varias veces el consumo nominal',
          'La autonomía cae de forma no lineal con la carga: duplicar los watts reduce el respaldo a bastante menos de la mitad',
        ],
        plazo:
          'probá un corte real una vez por año con la carga puesta: es la única forma de saber si las baterías todavía dan lo que dice la tabla.',
      },
      {
        id: 'carga',
        label: 'Cuánto tarda en cargarse',
        hint: 'Tiempo de carga y tasa C',
        answer:
          'Horas = Ah a reponer ÷ amperios del cargador × un factor de pérdida que depende de la química.',
        yes: [
          'Los Ah a reponer son la capacidad por lo que le falta: una de 100 Ah al 40% necesita 60 Ah',
          'Ninguna carga es 100% eficiente: el plomo-ácido pide cerca de un 18% extra, el litio apenas un 5% y el NiMH hasta un 40%',
          'La tasa C es la corriente del cargador dividida por la capacidad: 10 A sobre 100 Ah es 0,1C',
          'Máximos seguros por química: plomo-ácido 0,25C, Li-Ion 0,5C, NiMH 0,5C, LiPo 1C y LiFePO4 hasta 1,5C',
          'La última etapa de carga siempre es lenta: el tramo del 80% al 100% en litio tarda casi lo mismo que todo el tramo anterior',
        ],
        warn: [
          'Cargar por encima de la tasa C máxima de la química calienta la celda, la degrada y en litio puede terminar en fuga térmica',
          'Un pack LiPo se carga siempre con cargador balanceador: sin balanceo, una celda desfasada se sobrecarga aunque el pack marque bien',
          'Para almacenar un LiPo mucho tiempo se lo deja a 3,8 V por celda, no cargado al 100%',
          'En Li-Ion, quedarse en el rango 20%-80% en el uso diario alarga la vida bastante más que cargar siempre a tope',
        ],
        plazo:
          'si el cargador te da una tasa por encima del máximo de tu química, bajá la corriente aunque tarde más: la batería es más cara que el tiempo.',
      },
      {
        id: 'lipo',
        label: 'Un pack LiPo de dron o RC',
        hint: 'Tiempo de vuelo',
        answer:
          'Minutos = Ah × porcentaje de descarga segura ÷ consumo promedio en amperios × 60. Un 1.500 mAh 4S al 80% con 15 A promedio vuela unos 4,8 minutos.',
        yes: [
          'La tensión nominal del pack son 3,7 V por celda: un 4S da 14,8 V nominales y un 6S, 22,2 V',
          'La corriente máxima que entrega es capacidad en Ah × tasa C: un 1.500 mAh 45C soporta 67,5 A de pico',
          'La descarga segura recomendada es 80%: un LiPo vaciado del todo pierde celdas de forma permanente',
          'La energía almacenada en Wh es Ah × tensión nominal, que es el número que miran las aerolíneas: hasta 100 Wh por pack se lleva sin trámite en cabina',
          'Subir la cantidad de celdas (S) da más potencia a la misma corriente; subir los mAh da más tiempo pero también más peso',
        ],
        warn: [
          'Descargar un LiPo por debajo de 3,0 V por celda lo daña de forma irreversible: por eso el cálculo va sobre el 80% y no sobre el 100%',
          'La tasa C declarada de los packs baratos suele estar inflada: si el consumo pico se acerca al máximo teórico, el pack se hincha',
          'Un pack hinchado no se usa ni se carga más: se descarga y se descarta según la normativa local de residuos',
          'El consumo promedio de un vuelo agresivo puede duplicar el de un vuelo tranquilo: el tiempo calculado es el techo optimista',
        ],
        plazo:
          'aterrizá con el 20% en el pack: el margen no es un lujo, es lo que evita que se te caiga por corte de potencia.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos de tu batería',
  inputsIntro:
    'Cada caso usa sólo los campos que le corresponden: mAh y consumo en mA para un dispositivo, Ah y volts para un banco o un UPS, la corriente del cargador para el tiempo de carga y las celdas del pack para el LiPo.',
  fields: [
    {
      id: 'capacidadMah',
      label: 'Capacidad de la batería',
      type: 'number',
      suffix: 'mAh',
      min: 1,
      max: 500000,
      step: 1,
      value: 5000,
      thousands: true,
      help: 'El número que viene impreso en la batería o en la ficha del equipo. Celular típico 3.000-5.000 mAh, powerbank 10.000-20.000 mAh.',
    },
    {
      id: 'consumoMa',
      label: 'Consumo del dispositivo',
      type: 'number',
      suffix: 'mA',
      min: 0.1,
      max: 100000,
      step: 0.1,
      value: 200,
      help: 'Promedio, no pico. Un sensor con radio ronda 10-50 mA, una tira LED chica 200-500 mA.',
    },
    {
      id: 'eficiencia',
      label: 'Eficiencia de la batería',
      type: 'number',
      suffix: '%',
      min: 1,
      max: 100,
      step: 1,
      value: 85,
      help: 'Cuánto de la capacidad nominal llega realmente a la carga. 85% es el valor típico; con conversión a 5 V bajá a 70-75%.',
    },
    {
      id: 'ah',
      label: 'Capacidad del banco o de la batería que cargás',
      type: 'number',
      suffix: 'Ah',
      min: 0,
      max: 5000,
      step: 0.1,
      value: 100,
      help: 'Los amperios-hora del banco solar, náutico o de la batería que estás cargando.',
    },
    {
      id: 'ahUps',
      label: 'Batería interna del UPS',
      type: 'number',
      suffix: 'Ah',
      min: 0,
      max: 1000,
      step: 0.1,
      value: 0,
      help: 'Dejalo en 0 si no sabés los Ah: se estima desde los VA del equipo. Un UPS chico suele traer 7 o 9 Ah a 12 V.',
    },
    {
      id: 'vBateria',
      label: 'Tensión de la batería',
      type: 'number',
      suffix: 'V',
      min: 1,
      max: 800,
      step: 0.1,
      value: 12,
      help: 'Banco solar o náutico: 12, 24 o 48 V. UPS chico: 12 o 24 V.',
    },
    {
      id: 'dod',
      label: 'Profundidad de descarga (DoD)',
      type: 'number',
      suffix: '%',
      min: 1,
      max: 100,
      step: 1,
      value: 50,
      help: 'Cuánto podés vaciarla sin dañarla: 50% plomo-ácido, 80% AGM de ciclo profundo, 90% LiFePO4.',
    },
    {
      id: 'consumoW',
      label: 'Consumo de la carga',
      type: 'number',
      suffix: 'W',
      min: 0.1,
      max: 100000,
      step: 1,
      value: 100,
      help: 'Los watts que le colgás al banco o al UPS. Una PC de escritorio con monitor ronda 150-250 W.',
    },
    {
      id: 'vaUps',
      label: 'Capacidad del UPS',
      type: 'number',
      suffix: 'VA',
      min: 0,
      max: 100000,
      step: 1,
      value: 1000,
      thousands: true,
      help: 'El número grande de la caja. La potencia útil real ronda el 60% de ese valor.',
    },
    {
      id: 'cargaActual',
      label: 'Carga actual de la batería',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 40,
      help: 'Cuánto tiene ahora, para calcular sólo lo que falta reponer.',
    },
    {
      id: 'cargadorA',
      label: 'Corriente del cargador',
      type: 'number',
      suffix: 'A',
      min: 0.01,
      max: 500,
      step: 0.1,
      value: 10,
      help: 'Los amperios que entrega el cargador. Está impreso en la fuente.',
    },
    {
      id: 'quimica',
      label: 'Química de la batería',
      type: 'select',
      value: '1',
      options: [
        { value: '1', label: 'Plomo-ácido (auto, UPS, solar económico)' },
        { value: '2', label: 'LiPo (dron, RC, modelismo)' },
        { value: '3', label: 'Li-Ion (celular, notebook, 18650)' },
        { value: '4', label: 'LiFePO4 (solar y náutica de ciclo profundo)' },
        { value: '5', label: 'NiMH (pilas recargables AA/AAA)' },
      ],
      help: 'Define el factor de pérdida en la carga y la tasa C máxima segura.',
    },
    {
      id: 'celdas',
      label: 'Celdas del pack LiPo (S)',
      type: 'number',
      suffix: 'S',
      min: 1,
      max: 14,
      step: 1,
      value: 4,
      help: 'Cada celda aporta 3,7 V nominales: 4S son 14,8 V, 6S son 22,2 V.',
    },
    {
      id: 'tasaC',
      label: 'Tasa C de descarga del pack',
      type: 'number',
      suffix: 'C',
      min: 1,
      max: 200,
      step: 1,
      value: 45,
      help: 'La que viene impresa en el pack: 25C, 45C, 100C. Define la corriente máxima de pico.',
    },
    {
      id: 'consumoA',
      label: 'Consumo promedio en vuelo',
      type: 'number',
      suffix: 'A',
      min: 0.1,
      max: 500,
      step: 0.1,
      value: 15,
      help: 'Promedio de todo el vuelo, no el pico del acelerador a fondo.',
    },
    {
      id: 'descargaSegura',
      label: 'Descarga segura del pack',
      type: 'number',
      suffix: '%',
      min: 10,
      max: 100,
      step: 1,
      value: 80,
      help: 'El estándar en LiPo es 80%: pasado eso las celdas se dañan de forma permanente.',
    },
  ],
  fineprint:
    'Todas las cifras son estimaciones sobre capacidad nominal. La autonomía real cambia con la temperatura, la antigüedad de las celdas, el régimen de descarga y el consumo instantáneo, que casi nunca es constante. Nunca superes la tasa de carga o descarga máxima que indica el fabricante de tu batería, y no cargues packs de litio sin supervisión ni sin balanceador.',

  chart: {
    type: 'bars',
    title: 'Energía que vas a poder usar',
    caption:
      'Las barras separan la energía que realmente llega a tu carga de la que se pierde por eficiencia y por la profundidad de descarga que no conviene traspasar. Cuanto más alta la segunda barra, más lejos está la etiqueta de la realidad: esa diferencia es exactamente lo que se come la cuenta de servilleta.',
  },
  breakdownTitle: 'Los números de tu batería',
  breakdownIntro:
    'Cada fila viene con su unidad: horas, minutos, watt-hora, mAh, amperios, volts, watts, porcentaje o tasa C. Las barras comparan cada cifra con la mayor de la lista.',

  faq: [
    {
      q: '¿Cómo se calcula cuánto dura una batería en mAh?',
      a: 'Se divide la capacidad por el consumo, pero corrigiendo por eficiencia: horas = mAh × eficiencia ÷ mA. Una batería de 5.000 mAh con un consumo de 200 mA y 85% de eficiencia dura unas 21,3 horas, no las 25 que da la cuenta directa. La eficiencia cubre lo que se pierde en la conversión, el autoconsumo del circuito de gestión y la caída de tensión al final de la descarga. Si el cálculo es para dimensionar algo que importa, agregá además un 20% de margen por envejecimiento y temperatura.',
    },
    {
      q: '¿Por qué un powerbank de 10.000 mAh no carga tres veces un celular de 3.000 mAh?',
      a: 'Porque los mAh están medidos a tensiones distintas. La celda del powerbank guarda su carga a 3,7 V, pero entrega a 5 V por el puerto USB, y esa conversión pierde energía. Los 10.000 mAh a 3,7 V son 37 Wh; convertidos a 5 V con un 85-90% de rendimiento quedan alrededor de 6.300-6.700 mAh útiles a 5 V. A eso se le suma la pérdida del circuito de carga del propio celular. En la práctica, un powerbank de 10.000 mAh da un poco menos de dos cargas completas a un celular de 3.000 mAh.',
    },
    {
      q: '¿Qué es la profundidad de descarga y por qué me baja la autonomía?',
      a: 'La profundidad de descarga, o DoD, es qué porcentaje de la energía de la batería podés usar sin acortarle la vida. No es una limitación del cálculo sino de la química: una batería de plomo-ácido que se vacía al 100% de forma habitual dura una fracción de los ciclos que daría si la dejás siempre por encima del 50%. Los valores de referencia son 50% para plomo-ácido común, 80% para AGM de ciclo profundo y hasta 90% para LiFePO4. De los 1.200 Wh nominales de una batería de 100 Ah a 12 V, con DoD del 50% y 95% de eficiencia quedan unos 570 Wh reales.',
    },
    {
      q: '¿Cuánto respaldo me da un UPS de 1.000 VA?',
      a: 'Depende de la carga que le cuelgues, y los VA no son watts: la potencia útil real ronda el 60% de los VA, así que un UPS de 1.000 VA sostiene unos 600 W. Con una carga de 300 W, es decir la mitad de su capacidad útil, un equipo de esa categoría suele dar entre 8 y 15 minutos. Con 600 W, cerca del límite, baja a 3 o 4 minutos. Si conocés los Ah y los volts de la batería el cálculo deja de ser una estimación: minutos = Ah × V × eficiencia × 60 ÷ watts.',
    },
    {
      q: '¿Por qué la autonomía no se reduce a la mitad cuando duplico la carga?',
      a: 'Porque las baterías de plomo entregan proporcionalmente menos capacidad cuanto más rápido se las descarga, un efecto conocido como ley de Peukert. La capacidad en Ah se declara a un régimen determinado, normalmente C20, o sea vaciarla en 20 horas. Si le pedís el doble de corriente, la batería no sólo dura la mitad de tiempo: entrega además menos Ah totales. Por eso duplicar la carga de un UPS recorta el respaldo a bastante menos de la mitad, y por eso conviene siempre dejar margen.',
    },
    {
      q: '¿Cuánto tarda en cargarse una batería?',
      a: 'Se divide lo que hay que reponer por la corriente del cargador y se multiplica por un factor de pérdida propio de la química: cerca de 1,18 en plomo-ácido, 1,05 en litio y hasta 1,40 en NiMH. Una batería de 100 Ah que está al 40% necesita reponer 60 Ah; con un cargador de 10 A y factor de plomo son unas 7,1 horas. El resultado es orientativo porque la última etapa de carga siempre es más lenta: el tramo final se hace a tensión constante y con corriente cada vez menor.',
    },
    {
      q: '¿Qué es la tasa C y cuál es el máximo seguro?',
      a: 'La tasa C es la corriente expresada en múltiplos de la capacidad: cargar una batería de 100 Ah con 10 A es 0,1C, y con 100 A sería 1C. Los máximos seguros de carga habituales son 0,25C para plomo-ácido, 0,5C para Li-Ion y NiMH, 1C para LiPo y hasta 1,5C para LiFePO4. Pasarse de ahí calienta la celda, le acorta la vida y, en química de litio, puede derivar en fuga térmica. En descarga los máximos son mucho más altos y vienen impresos en el pack, sobre todo en LiPo de modelismo.',
    },
    {
      q: '¿Cuánto vuela un dron con un pack LiPo?',
      a: 'Minutos = capacidad en Ah × porcentaje de descarga segura ÷ consumo promedio en amperios × 60. Un pack de 1.500 mAh usado hasta el 80% con un consumo promedio de 15 A da unos 4,8 minutos de vuelo. El consumo promedio es lo más difícil de estimar: un vuelo agresivo puede duplicar el de uno tranquilo, así que el número calculado es el techo optimista. Aterrizá siempre con alrededor del 20% en el pack.',
    },
    {
      q: '¿Cómo paso de mAh a Wh?',
      a: 'Wh = mAh × volts ÷ 1.000. Una celda de litio de 5.000 mAh a 3,7 V nominales guarda 18,5 Wh. La conversión importa porque los mAh sólo se pueden comparar entre baterías de la misma tensión: 5.000 mAh a 3,7 V y 5.000 mAh a 11,1 V no tienen nada que ver en energía. También es el número que piden las aerolíneas, que limitan los packs de litio en cabina a 100 Wh sin autorización previa.',
    },
    {
      q: '¿Cuánto le baja la autonomía a una batería con el frío?',
      a: 'Bastante. En una celda de litio, por debajo de 0 °C la capacidad útil puede caer entre 20% y 30%, y la caída se agrava a mayor corriente de descarga porque la resistencia interna sube. En plomo-ácido el efecto es similar. La buena noticia es que la pérdida por frío es reversible: al volver a temperatura ambiente la capacidad se recupera. Lo que sí es permanente es cargar una batería de litio por debajo de 0 °C, que deposita litio metálico en el ánodo y la daña para siempre.',
    },
    {
      q: '¿Cuántos ciclos dura una batería antes de perder capacidad?',
      a: 'Depende de la química y del uso. Una celda de Li-Ion suele quedar cerca del 80% de su capacidad original después de unos 500 ciclos completos, aunque cargándola en el rango 20%-80% se estiran bastante. Una LiFePO4 supera los 2.000 ciclos con una degradación mucho menor. Una plomo-ácido de ciclo profundo puede dar 1.200 ciclos al 50% de DoD, pero apenas 300 si la vaciás al 100%. Las baterías de un UPS, que son SLA, se cambian cada 3 a 5 años aunque el equipo no acuse nada.',
    },
    {
      q: '¿Sirve el mismo cálculo para una batería vieja?',
      a: 'No directamente: hay que corregir la capacidad. Si la batería tiene un par de años de uso intenso, cargá en el cálculo entre un 80% y un 85% de la capacidad de etiqueta en lugar del valor nominal. La única forma de saber el número real es un test de descarga controlada: se carga a tope, se descarga a corriente constante conocida midiendo el tiempo hasta la tensión de corte, y se multiplica corriente por horas. Eso te da los Ah que la batería realmente tiene hoy.',
    },
  ],

  sources: [
    {
      name: 'Battery University BU-503 — How to calculate battery runtime',
      url: 'https://batteryuniversity.com/article/bu-503-how-to-calculate-battery-runtime',
      publisher: 'Cadex Electronics',
    },
    {
      name: 'Battery University BU-402 — What is C-rate?',
      url: 'https://batteryuniversity.com/article/bu-402-what-is-c-rate',
      publisher: 'Cadex Electronics',
    },
    {
      name: 'Battery University BU-501 — Basics about discharging (efecto Peukert y profundidad de descarga)',
      url: 'https://batteryuniversity.com/article/bu-501-basics-about-discharging',
      publisher: 'Cadex Electronics',
    },
    {
      name: 'APC — UPS runtime and VA vs watts (application note)',
      url: 'https://www.apc.com/us/en/faqs/FA158939/',
      publisher: 'Schneider Electric / APC',
    },
    {
      name: 'Victron Energy — Wiring Unlimited (dimensionamiento de bancos y profundidad de descarga)',
      url: 'https://www.victronenergy.com/upload/documents/Wiring-Unlimited-EN.pdf',
      publisher: 'Victron Energy',
    },
    {
      name: 'IEC 62133 — Secondary cells and batteries containing alkaline or other non-acid electrolytes (seguridad)',
      url: 'https://webstore.iec.ch/publication/32662',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'IATA — Lithium battery guidance document (límite de 100 Wh en cabina)',
      url: 'https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/',
      publisher: 'International Air Transport Association',
    },
  ],

  replaces: [
    '/calculadora-duracion-bateria-mah-consumo',
    '/calculadora-autonomia-ups-tiempo-respaldo-servidor',
    '/calculadora-carga-bateria-tiempo-amp',
    '/calculadora-ups-autonomia-potencia-carga',
    '/calculadora-bateria-capacidad-runtime-ah',
    '/calculadora-autonomia-bateria-dispositivo-mah',
    '/calculadora-bateria-lipo-capacidad-descarga',
    '/calculadora-carga-capacitor-constante-rc',
    '/calculadora-capacitor-carga-descarga-rc',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factor de pérdida en la carga por química, calcado de
 * `carga-bateria-tiempo-amp.ts`. Clave = valor del select `quimica`.
 */
export const FACTOR_CARGA: Record<string, number> = {
  '1': 1.18, // plomo-ácido
  '2': 1.05, // LiPo
  '3': 1.05, // Li-Ion
  '4': 1.05, // LiFePO4
  '5': 1.4, // NiMH
};

/** Tasa C máxima segura de CARGA por química (misma fuente). */
export const MAX_C: Record<string, number> = {
  '1': 0.25,
  '2': 1.0,
  '3': 0.5,
  '4': 1.5,
  '5': 0.5,
};

/** Nombre legible de cada química. */
export const QUIMICA_LABEL: Record<string, string> = {
  '1': 'plomo-ácido',
  '2': 'LiPo',
  '3': 'Li-Ion',
  '4': 'LiFePO4',
  '5': 'NiMH',
};

/** Consejo de manejo por química (calcado de la calc de tiempo de carga). */
export const QUIMICA_TIP: Record<string, string> = {
  '1': 'Plomo: carga lenta en tres etapas. Dejarla al 100% es lo ideal.',
  '2': 'LiPo: cargador balanceador obligatorio. Para guardar, 3,8 V por celda.',
  '3': 'Li-Ion: para que dure, cargá hasta el 80% y descargá hasta el 20%.',
  '4': 'LiFePO4: robusta, acepta tasas de carga altas (1C a 1,5C).',
  '5': 'NiMH: eficiencia baja y carga lenta, pero admite trickle charge indefinido.',
};

/** Tensión nominal de una celda de litio, en volts. */
export const V_CELDA_LITIO = 3.7;

/**
 * Factor VA → watts útiles de un UPS (factor de potencia de referencia).
 * Calcado de `autonomia-ups-tiempo-respaldo-servidor.ts` y `ups-autonomia-potencia-carga.ts`.
 */
export const UPS_FP = 0.6;

/**
 * Energía útil típica por VA de UPS, en Wh. Modelo calibrado contra las tablas
 * de runtime publicadas por APC / CyberPower / Eaton. Sólo se usa cuando el
 * usuario NO conoce los Ah de la batería.
 */
export const UPS_WH_POR_VA = 0.028;

/** Exponente del premio a la carga baja (modelo tipo Peukert del UPS). */
export const UPS_PEUKERT_EXP = 0.5;
