import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué resistencia necesito?"
 * Arquetipo RAMIFICADO: la misma pregunta se responde distinto según qué esté
 * haciendo la persona (leer una resistencia que ya tiene, proteger un LED,
 * combinar varias o armar un divisor). Por eso usa `cases` y NO `answer`.
 *
 * Absorbe 7 calculadoras sueltas de electrónica (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format: 'unit'` y CADA fila del
 *    desglose declara el suyo (Ω, kΩ, MΩ, V, mA, mW, %, dB). Una fila sin
 *    `format` cae a "$" y la página miente.
 *  - Múltiplos de ohm: 4.700 Ω se lee "4,7 kΩ". El compute() escala el número
 *    y ajusta `unit` fila por fila (ver `escalaOhm()` en la página). Nunca se
 *    imprime "4.700 Ω" crudo.
 *  - La rama del código de colores usa SELECTS de color por banda, no un
 *    número: es la de más tráfico y la persona llega con la resistencia en la
 *    mano, no con el valor.
 */
export const hub: HubData = {
  slug: 'tecnologia/resistencias',
  title: '¿Qué resistencia necesito? Código de colores, LED, serie/paralelo y divisor — 2026',
  description:
    'Leé el código de colores de 4, 5 y 6 bandas, calculá la resistencia para un LED, la equivalente en serie y paralelo y un divisor de tensión. Valor, tolerancia, valor comercial E12/E24 y potencia disipada, según IEC 60062 e IEC 60063.',
  silo: 'Tecnología',
  siloHref: '/tecnologia',

  eyebrow: 'Guía y cálculo de electrónica',
  h1: '¿Qué resistencia necesito?',
  lede:
    'Cuatro preguntas distintas terminan en la misma pieza: qué dice la que tenés en la mano, cuál va en serie con un LED para que no se queme, cuánto da la combinación de varias y cómo bajar una tensión con dos. Partimos de la más buscada —leer el código de colores— y la cambiás si tu caso es otro.',
  stamps: ['Actualizado 27-07-2026', 'IEC 60062 (colores) · IEC 60063 (series E12/E24)', '7 calculadoras adentro'],

  resultLabel: 'Tu resistencia',

  cases: {
    title: '¿Qué estás tratando de resolver?',
    intro: 'Partimos del caso más frecuente: tenés la resistencia y querés saber cuánto vale. Si el tuyo es otro, cambialo.',
    items: [
      {
        id: 'codigo',
        label: 'Quiero leer el código de colores',
        hint: 'El caso más común',
        answer: 'Las primeras bandas son cifras, la anteúltima multiplica y la última es la tolerancia.',
        yes: [
          'En 4 bandas: dos cifras, multiplicador y tolerancia (marrón-negro-rojo-dorado = 10 × 100 = 1 kΩ ±5%)',
          'En 5 y 6 bandas: tres cifras, multiplicador y tolerancia; la sexta banda es el coeficiente de temperatura en ppm/K',
          'Multiplicadores: negro ×1, marrón ×10, rojo ×100, naranja ×1 k, amarillo ×10 k, verde ×100 k, azul ×1 M, violeta ×10 M, dorado ×0,1 y plateado ×0,01',
          'Tolerancias: marrón ±1%, rojo ±2%, verde ±0,5%, azul ±0,25%, violeta ±0,1%, dorado ±5% y plateado ±10%',
          'Se lee desde la banda que está más cerca del borde: la de tolerancia es la que queda separada del resto',
          'El resultado te da el valor nominal y el rango real mínimo-máximo que puede tener la pieza',
        ],
        warn: [
          'Si la leés al revés el valor cambia por completo: marrón-negro-rojo es 1 kΩ, rojo-negro-marrón es 200 Ω',
          'El dorado y el plateado casi siempre son tolerancia, así que si aparecen en un extremo ese es el final',
          'Las resistencias de 4 bandas sin banda de tolerancia visible son ±20% (norma vieja): no sirven para nada sensible',
          'Con la resistencia soldada en el circuito el óhmetro miente: hay que levantar una pata para medirla',
        ],
        plazo:
          'medí siempre con el téster antes de soldar: el código te da el nominal, el téster te da la pieza que tenés.',
      },
      {
        id: 'led',
        label: 'Necesito la resistencia para un LED',
        hint: 'Que no se queme',
        answer: 'R = (tensión de la fuente − caída del LED) ÷ corriente del LED.',
        yes: [
          'La resistencia se lleva la tensión que sobra: lo que la fuente da de más respecto de la caída directa del LED',
          'Caídas típicas: rojo 1,8-2,0 V, amarillo y verde 2,0-2,2 V, azul y blanco 3,0-3,4 V',
          'Corriente típica de un LED indicador de 5 mm: 20 mA (10 mA ya ilumina de sobra y calienta menos)',
          'Se redondea siempre al valor comercial E12 inmediatamente SUPERIOR: de más ohm el LED alumbra un poco menos, de menos ohm se quema',
          'En serie los LED suman su caída y comparten una sola resistencia; en paralelo cada rama necesita la suya',
          'La potencia disipada define el tamaño: hasta 125 mW alcanza 1/8 W, hasta 250 mW la clásica de 1/4 W',
        ],
        warn: [
          'Si la fuente no supera la caída total de los LED en serie el circuito no enciende: bajá la cantidad o subí la fuente',
          'Nunca poner varios LED en paralelo con UNA sola resistencia: el que menos caída tenga se lleva casi toda la corriente y se quema',
          'La caída del LED sube un poco con la corriente y baja con la temperatura: el cálculo es una estimación, no una medición',
          'Si la potencia calculada pasa los 250 mW, elegí una resistencia del doble de potencia o va a quemarse con el uso',
        ],
        plazo:
          'con la resistencia comercial E12 superior el LED queda por debajo de su corriente nominal: es el margen que lo hace durar años.',
      },
      {
        id: 'serie-paralelo',
        label: 'Tengo varias y quiero la equivalente',
        hint: 'Serie o paralelo',
        answer: 'En serie se suman; en paralelo se suman las inversas y el total queda por debajo de la más chica.',
        yes: [
          'Serie: Req = R1 + R2 + R3 + R4, o sea la suma directa',
          'Paralelo: 1/Req = 1/R1 + 1/R2 + …, y el resultado siempre es MENOR que la resistencia más chica del grupo',
          'Dos iguales en paralelo dan la mitad; dos iguales en serie dan el doble',
          'Es la salida cuando no conseguís un valor: dos de 220 Ω en serie dan los 440 Ω que no venden',
          'Dejá en 0 las resistencias que no uses: el cálculo toma sólo las mayores a 0',
        ],
        warn: [
          'En serie la corriente es la misma en todas y la tensión se reparte; en paralelo es al revés',
          'En serie la resistencia que más ohm tiene es la que más potencia disipa: revisá que aguante',
          'Combinar tolerancias no las promedia: dos del ±5% en serie siguen dando un conjunto del ±5%',
          'En paralelo la corriente total se reparte inversamente: la resistencia más chica se lleva la mayor parte y se calienta más',
        ],
        plazo:
          'si necesitás un valor exacto que no existe, la combinación en serie es más predecible que el paralelo.',
      },
      {
        id: 'divisor',
        label: 'Quiero bajar una tensión con dos resistencias',
        hint: 'Divisor resistivo',
        answer: 'Vout = Vin × R2 ÷ (R1 + R2): la salida se toma sobre R2.',
        yes: [
          'La salida depende SÓLO de la relación entre las dos resistencias, no de sus valores absolutos',
          'Escalar las dos por igual mantiene la misma tensión de salida y baja el consumo del divisor',
          'La corriente que circula todo el tiempo es Vin ÷ (R1 + R2), y esa corriente se transforma en calor',
          'Sirve como referencia de tensión, para leer una batería con un ADC o para atenuar una señal',
          'Con 10 kΩ y 10 kΩ se parte la tensión exactamente al medio',
        ],
        warn: [
          'Un divisor NO es una fuente: si le colgás una carga que consuma corriente, la salida se desploma',
          'Para alimentar algo se usa un regulador; el divisor sólo sirve si lo que lee tiene alta impedancia de entrada',
          'Resistencias muy chicas queman corriente permanentemente; muy grandes hacen la salida sensible al ruido y a la impedancia del que mide',
          'La tolerancia de las dos resistencias se acumula en la salida: con ±5% y ±5% la referencia puede errarle bastante',
        ],
        plazo:
          'para leer con un microcontrolador, mantené la resistencia equivalente del divisor por debajo de los 10 kΩ.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos de tu circuito',
  inputsIntro:
    'Cada caso usa sólo los campos que le corresponden: las bandas para el código de colores, la fuente y el LED para la limitadora, y R1 a R4 para las combinaciones y el divisor.',
  fields: [
    {
      id: 'tipoBandas',
      label: 'Cantidad de bandas',
      type: 'select',
      value: '4',
      options: [
        { value: '4', label: '4 bandas (2 cifras + multiplicador + tolerancia)' },
        { value: '5', label: '5 bandas (3 cifras + multiplicador + tolerancia)' },
        { value: '6', label: '6 bandas (5 bandas + coeficiente de temperatura)' },
      ],
      help: 'En 4 bandas la tercera es el multiplicador; en 5 y 6, la cuarta.',
    },
    {
      id: 'banda1',
      label: 'Banda 1 — 1ª cifra',
      type: 'select',
      value: 'marron',
      options: [
        { value: 'negro', label: 'Negro — 0' },
        { value: 'marron', label: 'Marrón — 1' },
        { value: 'rojo', label: 'Rojo — 2' },
        { value: 'naranja', label: 'Naranja — 3' },
        { value: 'amarillo', label: 'Amarillo — 4' },
        { value: 'verde', label: 'Verde — 5' },
        { value: 'azul', label: 'Azul — 6' },
        { value: 'violeta', label: 'Violeta — 7' },
        { value: 'gris', label: 'Gris — 8' },
        { value: 'blanco', label: 'Blanco — 9' },
      ],
      help: 'Empezá por la banda más pegada al borde, del lado opuesto a la de tolerancia.',
    },
    {
      id: 'banda2',
      label: 'Banda 2 — 2ª cifra',
      type: 'select',
      value: 'negro',
      options: [
        { value: 'negro', label: 'Negro — 0' },
        { value: 'marron', label: 'Marrón — 1' },
        { value: 'rojo', label: 'Rojo — 2' },
        { value: 'naranja', label: 'Naranja — 3' },
        { value: 'amarillo', label: 'Amarillo — 4' },
        { value: 'verde', label: 'Verde — 5' },
        { value: 'azul', label: 'Azul — 6' },
        { value: 'violeta', label: 'Violeta — 7' },
        { value: 'gris', label: 'Gris — 8' },
        { value: 'blanco', label: 'Blanco — 9' },
      ],
    },
    {
      id: 'banda3',
      label: 'Banda 3 — 3ª cifra (5 y 6 bandas) o multiplicador (4 bandas)',
      type: 'select',
      value: 'rojo',
      options: [
        { value: 'negro', label: 'Negro — 0 · ×1' },
        { value: 'marron', label: 'Marrón — 1 · ×10' },
        { value: 'rojo', label: 'Rojo — 2 · ×100' },
        { value: 'naranja', label: 'Naranja — 3 · ×1 k' },
        { value: 'amarillo', label: 'Amarillo — 4 · ×10 k' },
        { value: 'verde', label: 'Verde — 5 · ×100 k' },
        { value: 'azul', label: 'Azul — 6 · ×1 M' },
        { value: 'violeta', label: 'Violeta — 7 · ×10 M' },
        { value: 'gris', label: 'Gris — 8' },
        { value: 'blanco', label: 'Blanco — 9' },
        { value: 'dorado', label: 'Dorado — ×0,1' },
        { value: 'plateado', label: 'Plateado — ×0,01' },
      ],
      help: 'Si elegiste 4 bandas, esta banda es el multiplicador.',
    },
    {
      id: 'banda4',
      label: 'Banda 4 — multiplicador (5 y 6 bandas) o tolerancia (4 bandas)',
      type: 'select',
      value: 'dorado',
      options: [
        { value: 'negro', label: 'Negro — ×1' },
        { value: 'marron', label: 'Marrón — ×10 · ±1%' },
        { value: 'rojo', label: 'Rojo — ×100 · ±2%' },
        { value: 'naranja', label: 'Naranja — ×1 k' },
        { value: 'amarillo', label: 'Amarillo — ×10 k' },
        { value: 'verde', label: 'Verde — ×100 k · ±0,5%' },
        { value: 'azul', label: 'Azul — ×1 M · ±0,25%' },
        { value: 'violeta', label: 'Violeta — ×10 M · ±0,1%' },
        { value: 'dorado', label: 'Dorado — ×0,1 · ±5%' },
        { value: 'plateado', label: 'Plateado — ×0,01 · ±10%' },
      ],
    },
    {
      id: 'banda5',
      label: 'Banda 5 — tolerancia (5 y 6 bandas)',
      type: 'select',
      value: 'marron',
      options: [
        { value: 'marron', label: 'Marrón — ±1%' },
        { value: 'rojo', label: 'Rojo — ±2%' },
        { value: 'verde', label: 'Verde — ±0,5%' },
        { value: 'azul', label: 'Azul — ±0,25%' },
        { value: 'violeta', label: 'Violeta — ±0,1%' },
        { value: 'dorado', label: 'Dorado — ±5%' },
        { value: 'plateado', label: 'Plateado — ±10%' },
      ],
      help: 'Es la banda separada del resto, del otro extremo.',
    },
    {
      id: 'banda6',
      label: 'Banda 6 — coeficiente de temperatura (sólo 6 bandas)',
      type: 'select',
      value: 'marron',
      options: [
        { value: 'marron', label: 'Marrón — 100 ppm/K' },
        { value: 'rojo', label: 'Rojo — 50 ppm/K' },
        { value: 'naranja', label: 'Naranja — 15 ppm/K' },
        { value: 'amarillo', label: 'Amarillo — 25 ppm/K' },
        { value: 'verde', label: 'Verde — 20 ppm/K' },
        { value: 'azul', label: 'Azul — 10 ppm/K' },
        { value: 'violeta', label: 'Violeta — 5 ppm/K' },
        { value: 'gris', label: 'Gris — 1 ppm/K' },
      ],
    },
    {
      id: 'vFuente',
      label: 'Tensión de la fuente (Vin)',
      type: 'number',
      suffix: 'V',
      min: 0,
      max: 400,
      step: 0.1,
      value: 5,
      help: 'La entrada del circuito: 5 V de un USB, 3,3 V de un microcontrolador, 12 V de una fuente.',
    },
    {
      id: 'vLed',
      label: 'Caída directa del LED (Vf)',
      type: 'number',
      suffix: 'V',
      min: 0,
      max: 12,
      step: 0.1,
      value: 2,
      help: 'Rojo 1,8-2,0 · amarillo y verde 2,0-2,2 · azul y blanco 3,0-3,4 V.',
    },
    {
      id: 'iLed',
      label: 'Corriente del LED',
      type: 'number',
      suffix: 'mA',
      min: 0.1,
      max: 1000,
      step: 0.1,
      value: 20,
      help: '20 mA es lo típico de un LED indicador de 5 mm.',
    },
    {
      id: 'cantidadLeds',
      label: 'Cantidad de LED',
      type: 'number',
      suffix: 'LED',
      min: 1,
      max: 20,
      step: 1,
      value: 1,
    },
    {
      id: 'conexion',
      label: 'Cómo están conectados los LED',
      type: 'select',
      value: 'serie',
      options: [
        { value: 'serie', label: 'En serie (una sola resistencia para todos)' },
        { value: 'paralelo', label: 'En paralelo (una resistencia por rama)' },
      ],
    },
    {
      id: 'r1',
      label: 'R1',
      type: 'number',
      suffix: 'Ω',
      min: 0,
      step: 1,
      value: 10000,
      help: 'En el divisor, R1 es la de arriba: la que va de la entrada a la salida.',
    },
    {
      id: 'r2',
      label: 'R2',
      type: 'number',
      suffix: 'Ω',
      min: 0,
      step: 1,
      value: 10000,
      help: 'En el divisor, R2 es la de abajo: la salida se toma sobre ella.',
    },
    {
      id: 'r3',
      label: 'R3 (opcional)',
      type: 'number',
      suffix: 'Ω',
      min: 0,
      step: 1,
      value: 0,
      help: 'Dejala en 0 si no la usás.',
    },
    {
      id: 'r4',
      label: 'R4 (opcional)',
      type: 'number',
      suffix: 'Ω',
      min: 0,
      step: 1,
      value: 0,
      help: 'Dejala en 0 si no la usás.',
    },
  ],
  fineprint:
    'Los valores son nominales: la pieza real cae dentro de su tolerancia y la caída del LED varía con la corriente y la temperatura. Para tensiones de red o cargas de potencia, verificá con el téster y respetá la potencia y la tensión máxima de trabajo del componente.',

  chart: {
    type: 'bars',
    title: 'Cómo se reparte',
    caption:
      'Las barras muestran el reparto que importa en cada caso: en el LED, cuánta tensión cae en la resistencia y cuánta en el diodo; en el código de colores, el valor nominal contra el margen que habilita su tolerancia. Cuanto más grande el segundo segmento, más margen de incertidumbre tenés.',
  },
  breakdownTitle: 'Los números de tu circuito',
  breakdownIntro:
    'Cada fila viene con su unidad: ohm (escalado a kΩ o MΩ cuando corresponde), voltios, miliamperios, milivatios o porcentaje. Las barras comparan cada cifra con la mayor.',

  faq: [
    {
      q: '¿Cómo se lee el código de colores de una resistencia?',
      a: 'En una resistencia de 4 bandas, las dos primeras son cifras, la tercera es el multiplicador y la cuarta la tolerancia: marrón-negro-rojo-dorado es 1, 0, ×100 = 1.000 Ω, o sea 1 kΩ ±5%. En las de 5 y 6 bandas hay tres cifras, después el multiplicador y después la tolerancia. Se empieza por el extremo donde las bandas están más juntas: la de tolerancia es la que queda separada del grupo, y casi siempre es dorada o plateada.',
    },
    {
      q: '¿Qué significa cada color en una resistencia?',
      a: 'Como cifra: negro 0, marrón 1, rojo 2, naranja 3, amarillo 4, verde 5, azul 6, violeta 7, gris 8 y blanco 9. Como multiplicador: negro ×1, marrón ×10, rojo ×100, naranja ×1.000, amarillo ×10.000, verde ×100.000, azul ×1.000.000, violeta ×10.000.000, dorado ×0,1 y plateado ×0,01. Como tolerancia: marrón ±1%, rojo ±2%, verde ±0,5%, azul ±0,25%, violeta ±0,1%, dorado ±5% y plateado ±10%. Está normalizado en la IEC 60062.',
    },
    {
      q: '¿Para qué sirve la sexta banda?',
      a: 'Es el coeficiente de temperatura, en partes por millón por kelvin: cuánto se corre el valor cuando la resistencia se calienta. Marrón 100 ppm/K, rojo 50, naranja 15, amarillo 25, verde 20, azul 10, violeta 5 y gris 1. Con 100 ppm/K, una resistencia de 10 kΩ se corre 10 Ω por cada grado. Sólo importa en instrumentación y referencias de precisión; para encender un LED es irrelevante.',
    },
    {
      q: '¿Qué resistencia le pongo a un LED de 5 V?',
      a: 'Se resta la caída del LED a la tensión de la fuente y se divide por la corriente. Para un LED rojo de 2 V a 20 mA con fuente de 5 V: (5 − 2) ÷ 0,02 = 150 Ω, y el valor comercial E12 inmediatamente superior es 180 Ω. Para uno azul o blanco de 3,2 V con la misma fuente y corriente: (5 − 3,2) ÷ 0,02 = 90 Ω, o sea 100 Ω comerciales. Siempre se redondea hacia arriba: de más ohm el LED alumbra apenas menos, de menos ohm se quema.',
    },
    {
      q: '¿Por qué el valor comercial se redondea para arriba y no al más cercano?',
      a: 'Porque el error tiene consecuencias asimétricas. Si ponés una resistencia mayor, circula un poco menos de corriente y el LED alumbra un pelo menos, algo que el ojo casi no nota. Si ponés una menor, la corriente sube por encima de la nominal y el LED se degrada o se quema. Además la propia resistencia tiene su tolerancia: con un ±5%, redondear al más cercano puede dejarte por debajo del valor mínimo seguro.',
    },
    {
      q: '¿Cómo calculo la resistencia equivalente en serie y en paralelo?',
      a: 'En serie se suman: dos de 220 Ω dan 440 Ω. En paralelo se suman las inversas y se invierte el resultado: dos de 220 Ω dan 110 Ω. La regla rápida es que el paralelo siempre queda por debajo de la resistencia más chica del grupo, y dos iguales en paralelo dan exactamente la mitad. Es el truco para conseguir un valor que no existe en la serie comercial.',
    },
    {
      q: '¿Cómo funciona un divisor de tensión?',
      a: 'Dos resistencias en serie entre la entrada y masa, y la salida se toma en el punto del medio: Vout = Vin × R2 ÷ (R1 + R2). Con 12 V, R1 de 10 kΩ y R2 de 10 kΩ salen 6 V. Lo que manda es la relación entre las dos, no sus valores: 1 kΩ y 1 kΩ dan la misma salida que 100 kΩ y 100 kΩ, pero consumen cien veces más corriente.',
    },
    {
      q: '¿Puedo alimentar algo con un divisor de tensión?',
      a: 'No. El divisor sólo mantiene su tensión de salida si lo que conectás no consume corriente apreciable: apenas le colgás una carga, esa carga queda en paralelo con R2, baja la resistencia equivalente y la salida se desploma. Sirve como referencia para un ADC, para atenuar una señal o para leer el nivel de una batería. Para alimentar un módulo va un regulador, lineal o conmutado.',
    },
    {
      q: '¿Qué potencia tiene que aguantar la resistencia?',
      a: 'La potencia es P = I² × R, o lo que es lo mismo, la tensión que cae en ella por la corriente que la atraviesa. Hasta 125 mW alcanza una de 1/8 W, hasta 250 mW la clásica de 1/4 W, hasta 500 mW una de 1/2 W y de ahí para arriba 1 W o 2 W. La recomendación práctica es elegir al menos el doble de la potencia calculada: una resistencia trabajando al límite se calienta, se corre de valor y termina fallando.',
    },
    {
      q: '¿Qué son las series E12 y E24?',
      a: 'Son las escalas de valores comerciales normalizadas por la IEC 60063. La E12 tiene 12 valores por década (10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82) y corresponde a las resistencias del ±10%; la E24 tiene 24 y corresponde a las del ±5%. Los pasos están pensados para que, con la tolerancia de cada valor, la escala cubra todo el rango sin huecos: por eso los números parecen arbitrarios.',
    },
    {
      q: '¿Se puede medir una resistencia soldada en la placa?',
      a: 'No de forma confiable. El resto del circuito queda en paralelo con la resistencia y el óhmetro lee siempre un valor menor al real. Hay que levantar una pata o desoldarla. Además, el circuito tiene que estar sin alimentación y con los capacitores descargados, porque cualquier tensión presente altera la medición o daña el téster.',
    },
    {
      q: '¿Qué pasa si conecto varios LED en paralelo con una sola resistencia?',
      a: 'Es el error más común. Los LED no reparten la corriente en partes iguales: el que tenga la caída directa apenas menor —y siempre hay diferencias de fábrica entre unidades del mismo lote— se lleva la mayor parte, se calienta, baja todavía más su caída y termina llevándose casi todo hasta quemarse. Después la corriente se vuelca al siguiente y caen en cadena. Cada rama en paralelo lleva su propia resistencia.',
    },
  ],

  sources: [
    {
      name: 'IEC 60062 — Marking codes for resistors and capacitors (código de colores)',
      url: 'https://webstore.iec.ch/publication/26120',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'IEC 60063 — Preferred number series for resistors and capacitors (series E12/E24)',
      url: 'https://webstore.iec.ch/publication/28821',
      publisher: 'International Electrotechnical Commission',
    },
    {
      name: 'NIST — Ohm and the SI derived units (definición de la unidad)',
      url: 'https://www.nist.gov/pml/owm/metric-si/si-units',
      publisher: 'National Institute of Standards and Technology',
    },
    {
      name: 'All About Circuits — Series and parallel resistor combinations',
      url: 'https://www.allaboutcircuits.com/textbook/direct-current/chpt-7/simple-series-circuits/',
      publisher: 'All About Circuits',
    },
    {
      name: 'Analog Devices MT-101 — Op-amp gain configurations (inversor y no inversor)',
      url: 'https://www.analog.com/media/en/training-seminars/tutorials/MT-101.pdf',
      publisher: 'Analog Devices',
    },
    {
      name: 'Vishay — Resistor power rating and derating (application note)',
      url: 'https://www.vishay.com/docs/28771/applicationnote.pdf',
      publisher: 'Vishay Intertechnology',
    },
  ],

  replaces: [
    '/calculadora-resistencia-codigo-colores-4-5-bandas',
    '/calculadora-resistencia-paralelo-serie',
    '/calculadora-divisor-tension-resistivo',
    '/calculadora-resistencia-led-voltaje-caida',
    '/calculadora-resistencia-led-serie-paralelo',
    '/calculadora-divisor-tension-formula',
    '/calculadora-amplificador-operacional-ganancia',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Cifra de cada color (IEC 60062). Calcado de `resistencia-codigo-colores-4-5-bandas.ts`. */
export const DIG: Record<string, number> = {
  negro: 0, marron: 1, rojo: 2, naranja: 3, amarillo: 4,
  verde: 5, azul: 6, violeta: 7, gris: 8, blanco: 9,
};

/** Multiplicador de cada color. */
export const MULT: Record<string, number> = {
  negro: 1, marron: 10, rojo: 100, naranja: 1e3, amarillo: 1e4,
  verde: 1e5, azul: 1e6, violeta: 1e7, dorado: 0.1, plateado: 0.01,
};

/** Tolerancia en % de cada color. Sin banda de tolerancia: ±20%. */
export const TOL: Record<string, number> = {
  marron: 1, rojo: 2, verde: 0.5, azul: 0.25, violeta: 0.1, dorado: 5, plateado: 10,
};

/** Coeficiente de temperatura en ppm/K de la sexta banda (IEC 60062). */
export const TEMPCO: Record<string, number> = {
  marron: 100, rojo: 50, naranja: 15, amarillo: 25,
  verde: 20, azul: 10, violeta: 5, gris: 1,
};

/** Nombre lindo de cada color, para armar la frase de lectura. */
export const COLOR_LABEL: Record<string, string> = {
  negro: 'negro', marron: 'marrón', rojo: 'rojo', naranja: 'naranja', amarillo: 'amarillo',
  verde: 'verde', azul: 'azul', violeta: 'violeta', gris: 'gris', blanco: 'blanco',
  dorado: 'dorado', plateado: 'plateado',
};

/** Serie E12 base (IEC 60063), la de las resistencias del ±10%. */
export const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

/** Serie E24 base, la de las resistencias del ±5%. */
export const E24 = [
  10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30,
  33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91,
];

/** Umbrales de potencia comercial en mW (Vishay / práctica de taller). */
export const POTENCIAS = [
  { max: 125, label: '1/8 W' },
  { max: 250, label: '1/4 W' },
  { max: 500, label: '1/2 W' },
  { max: 1000, label: '1 W' },
  // Tope finito a propósito: `Infinity` no sobrevive la serialización a JSON
  // de `define:vars` (se convierte en null) y rompería el compute().
  { max: 1e9, label: '2 W o más' },
];
