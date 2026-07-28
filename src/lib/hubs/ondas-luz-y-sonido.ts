import type { HubData } from './types';

/**
 * Hub de decisión — "Ondas, luz y sonido"
 * Arquetipo RAMIFICADO (5 casos): relación v = λ·f (default), velocidad del
 * sonido según la temperatura, efecto Doppler, lentes 1/f = 1/do + 1/di y
 * energía de un sismo en la escala de Richter.
 *
 * Absorbe 5 calculadoras sueltas (ver `replaces`).
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - NADA acá es plata: TODAS las filas declaran `format` propio.
 *  - `chart.type: 'scale'`: la regla es de FRECUENCIA, de 1 Hz a 10¹⁵ Hz, en
 *    escala logarítmica: cubre infrasonido, audible, ultrasonido, radio,
 *    microondas, infrarrojo y luz visible en una sola línea. Tres de las cinco
 *    ramas devuelven una frecuencia natural. Las dos que no —lentes y sismos—
 *    lo aclaran en el `positionLabel` en vez de fingir un número.
 *
 * EXACTITUD (regla dura):
 *   c (luz en vacío) = 299 792 458 m/s   (EXACTO: define el metro desde 1983)
 *   c (sonido, aire seco 0 °C) = 331,3 m/s, con +0,606 m/s por °C
 *   Escala de Richter: log E = 4,8 + 1,5·M   (Gutenberg-Richter, energía en J)
 *   1 kg de TNT = 4,184 × 10⁶ J             (exacto, por la caloría termoquímica)
 * La calculadora vieja de Richter usaba 4,18 × 10⁶ J/kg para el TNT, un 0,1%
 * por debajo del valor convencional exacto. Acá se usa 4,184 × 10⁶.
 */
export const hub: HubData = {
  slug: 'ciencia/ondas-luz-y-sonido',
  title: 'Ondas, luz y sonido: longitud de onda, Doppler, lentes y Richter',
  description:
    'Relacioná velocidad, longitud de onda y frecuencia con v = λ·f; calculá la velocidad del sonido según la temperatura del aire; sacá la frecuencia que se percibe por efecto Doppler; resolvé la ecuación de las lentes delgadas; y convertí la magnitud de un sismo en energía liberada.',
  silo: 'Ciencia',
  siloHref: '/ciencia',

  eyebrow: 'Física',
  h1: '¿Cómo se comporta esta onda?',
  lede:
    'Todo lo que vibra —el sonido, la luz, la radio, el temblor de un sismo— obedece a las mismas dos o tres relaciones. Acá están las cinco preguntas que aparecen en la práctica: cuánto mide esa onda, a qué velocidad viaja el sonido hoy, por qué la sirena cambia de tono, dónde se forma la imagen de una lente y cuánta energía suelta un terremoto.',
  stamps: [
    'Actualizado 27-07-2026',
    'c = 299.792.458 m/s exactos',
    'Gutenberg-Richter para la energía sísmica',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Resultado del cálculo',

  cases: {
    title: '¿Qué necesitás resolver?',
    intro:
      'Las cinco ramas comparten el mismo panel de datos: completá sólo los campos de la que elegiste. Las tres primeras trabajan con frecuencias y devuelven además la banda del espectro donde cae el resultado.',
    items: [
      {
        id: 'onda',
        label: 'Longitud de onda, frecuencia y velocidad',
        hint: 'v = λ · f: cargá dos y sale la tercera',
        answer:
          'v = λ·f. Con dos de las tres sale la que falta, y el resultado viene con la banda del espectro donde cae.',
        yes: [
          'La incógnita despejada: velocidad, longitud de onda o frecuencia',
          'La longitud de onda con la unidad que corresponda —metros, centímetros, micrones o nanómetros— sin notación críptica',
          'La banda del espectro electromagnético en la que cae esa frecuencia, si la onda es electromagnética',
          'El período de la onda, que es simplemente el inverso de la frecuencia',
        ],
        warn: [
          'Cada medio tiene su velocidad: la luz va a 299.792.458 m/s en el vacío pero a 225.000 km/s en el agua, y el sonido a 343 m/s en el aire pero a 1.480 m/s en el agua',
          'Si la onda cambia de medio, lo que se conserva es la FRECUENCIA, no la longitud de onda: por eso la luz se refracta',
          'La clasificación por bandas del espectro sólo aplica a ondas electromagnéticas: una onda de sonido de 500 Hz no es "radio"',
          'A velocidad constante, longitud de onda y frecuencia son inversamente proporcionales: al doble de frecuencia, la mitad de longitud',
        ],
        plazo:
          'la velocidad de la luz en el vacío no es un valor medido sino una definición desde 1983: es lo que define cuánto mide un metro.',
      },
      {
        id: 'sonido',
        label: 'Velocidad del sonido según la temperatura',
        hint: 'A cuánto viaja hoy, y a qué distancia está la tormenta',
        answer:
          'c ≈ 331,3 + 0,606·T m/s con T en grados Celsius. A 20 °C da 343 m/s, y por eso el trueno tarda unos 3 segundos por kilómetro.',
        yes: [
          'La velocidad del sonido a la temperatura y la humedad que cargues, en m/s y en km/h',
          'Cuántos segundos tarda en recorrer un kilómetro, que es el truco del relámpago',
          'El eco: cuánto tarda en ir y volver de una pared a una distancia dada',
          'La velocidad de referencia para calcular Mach 1 a esa temperatura, que es lo que usa la aviación',
        ],
        warn: [
          'La velocidad del sonido depende de la TEMPERATURA, no de la presión ni de la altitud por sí solas: en altura baja porque hace más frío, no porque haya menos aire',
          'La humedad la sube un poquito —menos de medio metro por segundo entre aire seco y saturado— porque el vapor de agua es menos denso que el aire',
          'La aproximación lineal 331,3 + 0,606·T es excelente entre −20 y 40 °C; fuera de ese rango conviene la fórmula completa con la raíz',
          'El truco del trueno da la distancia al RAYO, no al centro de la tormenta, que puede estar bastante más lejos',
        ],
        plazo:
          'contá los segundos entre el relámpago y el trueno y dividí por tres: eso te da la distancia en kilómetros con buena aproximación.',
      },
      {
        id: 'doppler',
        label: 'Efecto Doppler',
        hint: 'Por qué la sirena cambia de tono al pasar',
        answer:
          "f' = f · (v ± vo) / (v ∓ vs). Al acercarse las ondas se comprimen y el tono sube; al alejarse se estiran y baja.",
        yes: [
          'La frecuencia que percibe el observador, en hertz y como variación porcentual',
          'El salto de tono en semitonos musicales, que es como el oído lo percibe de verdad',
          'El caso de acercamiento y el de alejamiento, para ver el salto completo al pasar de largo',
          'Cuánto se corre la frecuencia por cada 10 km/h de velocidad relativa',
        ],
        warn: [
          'Que se mueva la fuente o el observador NO da el mismo resultado, aunque la velocidad relativa sea igual: las fórmulas son distintas',
          'Si la fuente alcanza la velocidad del sonido, el denominador se anula: eso es el boom sónico y la fórmula deja de valer',
          'El cambio de tono que uno escucha al pasar una sirena es el SALTO entre la frecuencia de acercamiento y la de alejamiento, que es casi el doble del corrimiento individual',
          'Para la luz hay que usar la versión relativista, que da un resultado distinto: la de acá es la clásica, para sonido',
        ],
        plazo:
          'una ambulancia a 90 km/h que pasa a tu lado produce un salto de unos 2,5 semitonos entre el "antes" y el "después": es media nota y pico.',
      },
      {
        id: 'lente',
        label: 'Lentes: dónde se forma la imagen',
        hint: '1/f = 1/do + 1/di',
        answer:
          '1/f = 1/do + 1/di. Con dos de las tres distancias sale la tercera, y el signo dice si la imagen es real o virtual.',
        yes: [
          'La distancia focal, la del objeto o la de la imagen, según cuál dejes en cero',
          'La magnificación con su signo: negativa significa imagen invertida',
          'Si la imagen es real (proyectable sobre una pantalla) o virtual (sólo visible mirando a través de la lente)',
          'La potencia de la lente en dioptrías, que es como se rotula un anteojo',
        ],
        warn: [
          'Convención de signos: la distancia focal es positiva en lentes convergentes y negativa en divergentes; la distancia imagen es positiva del lado opuesto al objeto',
          'Si el objeto está exactamente en el foco, la imagen se forma en el infinito y el cálculo no da un número finito',
          'Es la aproximación de LENTE DELGADA y de rayos paraxiales: no modela aberraciones ni lentes gruesas',
          'La magnificación es de tamaño lineal, no de área: una imagen 2× de aumento tiene cuatro veces la superficie',
        ],
        plazo:
          'la potencia en dioptrías es simplemente 1 dividido la distancia focal en metros: una lente de 50 mm tiene 20 dioptrías.',
      },
      {
        id: 'sismo',
        label: 'Energía de un sismo (escala de Richter)',
        hint: 'Cuánta energía libera una magnitud dada',
        answer:
          'log E = 4,8 + 1,5·M, con E en joules. Cada punto entero de magnitud son unas 32 veces más energía liberada.',
        yes: [
          'La energía liberada en joules y su equivalente en toneladas de TNT',
          'La comparación con otro sismo: cuántas veces más energía tiene el tuyo',
          'La clasificación según la escala del USGS: menor, moderado, fuerte o devastador',
          'La equivalencia en energía cotidiana, como el consumo eléctrico de una casa',
        ],
        warn: [
          'La escala es LOGARÍTMICA: un M7 no es "un poco peor" que un M6, libera 32 veces más energía',
          'Richter mide energía liberada en la falla, no daño: la profundidad, el tipo de suelo y la construcción cambian por completo el resultado en superficie',
          'Los organismos modernos informan magnitud de momento (Mw), no Richter local (ML): coinciden bien hasta M7 y se separan arriba',
          'La escala no tiene tope teórico, pero sí físico: la falla más larga posible del planeta limita la magnitud a algo por debajo de M10',
        ],
        plazo:
          'la magnitud definitiva de un sismo se revisa en las horas siguientes al evento: el primer número que se publica suele corregirse una o dos décimas.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu caso',
  inputsIntro:
    'Sólo hacen falta los campos de la rama que elegiste arriba: los demás se ignoran. En las ramas donde hay que despejar, el campo que dejes en cero es el que se calcula.',
  fields: [
    {
      id: 'velOnda',
      label: 'Velocidad de propagación de la onda',
      type: 'number',
      suffix: 'm/s',
      value: 343,
      min: 0,
      step: 0.0001,
      help: 'Sonido en aire 343 · en agua 1.480 · en acero 5.960 · luz en vacío 299.792.458. Dejala en 0 para calcularla.',
    },
    {
      id: 'lambda',
      label: 'Longitud de onda',
      type: 'number',
      suffix: 'm',
      value: 0,
      min: 0,
      step: 0.0000000001,
      help: 'Dejala en 0 para que la calcule. La luz visible va de 0,00000038 a 0,00000075 m (380 a 750 nm).',
    },
    {
      id: 'frecuencia',
      label: 'Frecuencia',
      type: 'number',
      suffix: 'Hz',
      value: 440,
      min: 0,
      step: 0.0001,
      help: 'La 440 Hz es el la de afinación. Audible: 20 a 20.000 Hz. FM: 88 a 108 millones de Hz.',
    },
    {
      id: 'tempAire',
      label: 'Sonido — temperatura del aire',
      type: 'number',
      suffix: '°C',
      value: 20,
      min: -80,
      max: 80,
      step: 0.1,
      help: 'A 20 °C el sonido viaja a 343 m/s; a 0 °C a 331,3 y a 35 °C a 352.',
    },
    {
      id: 'humedad',
      label: 'Sonido — humedad relativa',
      type: 'number',
      suffix: '%',
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      help: 'Sube la velocidad muy poco: menos de medio metro por segundo entre aire seco y saturado.',
    },
    {
      id: 'distanciaEco',
      label: 'Sonido — distancia a la pared o al obstáculo',
      type: 'number',
      suffix: 'm',
      value: 100,
      min: 0,
      step: 0.1,
      help: 'Para calcular el tiempo de eco de ida y vuelta.',
    },
    { id: 'f0', label: 'Doppler — frecuencia que emite la fuente', type: 'number', suffix: 'Hz', value: 700, min: 0, step: 0.01 },
    {
      id: 'vFuente',
      label: 'Doppler — velocidad de la fuente',
      type: 'number',
      suffix: 'm/s',
      value: 25,
      min: 0,
      step: 0.01,
      help: '25 m/s son 90 km/h. Tiene que ser menor que la velocidad del sonido.',
    },
    { id: 'vObservador', label: 'Doppler — velocidad del observador', type: 'number', suffix: 'm/s', value: 0, min: 0, step: 0.01 },
    {
      id: 'sentido',
      label: 'Doppler — se están',
      type: 'select',
      value: 'acercando',
      options: [
        { value: 'acercando', label: 'Acercando (el tono sube)' },
        { value: 'alejando', label: 'Alejando (el tono baja)' },
      ],
    },
    {
      id: 'focal',
      label: 'Lente — distancia focal',
      type: 'number',
      suffix: 'cm',
      value: 10,
      step: 0.01,
      help: 'Positiva en lentes convergentes, negativa en divergentes. Dejala en 0 para calcularla.',
    },
    { id: 'distObjeto', label: 'Lente — distancia al objeto', type: 'number', suffix: 'cm', value: 30, step: 0.01 },
    {
      id: 'distImagen',
      label: 'Lente — distancia a la imagen',
      type: 'number',
      suffix: 'cm',
      value: 0,
      step: 0.01,
      help: 'Dejala en 0 para que la calcule con las otras dos.',
    },
    {
      id: 'magnitud',
      label: 'Sismo — magnitud',
      type: 'number',
      value: 6.5,
      min: 0,
      max: 10,
      step: 0.1,
      help: 'San Juan 1944: 7,4 · Chile 1960 (el mayor registrado): 9,5 · Japón 2011: 9,1.',
    },
    {
      id: 'magnitudComp',
      label: 'Sismo — magnitud con la que comparar',
      type: 'number',
      value: 5,
      min: 0,
      max: 10,
      step: 0.1,
      help: 'Para ver cuántas veces más energía libera uno que el otro.',
    },
  ],
  fineprint:
    'Las fórmulas son las del modelo clásico ideal: onda armónica en medio homogéneo, lente delgada con rayos paraxiales y efecto Doppler no relativista (para luz hay que usar la versión relativista). La velocidad del sonido usa la aproximación lineal, excelente entre −20 y 40 °C. La relación de Gutenberg-Richter entre magnitud y energía es una correlación empírica: los organismos sismológicos publican valores que pueden diferir. Nada de esto reemplaza a la información oficial del servicio sismológico ante un evento real.',

  chart: {
    type: 'scale',
    title: 'Dónde cae esa frecuencia en el espectro',
    caption:
      'La regla va de 1 hertz a mil billones de hertz en escala logarítmica, y en esa única línea entran el infrasonido, todo el rango audible, el ultrasonido, la radio AM y FM, las microondas del wifi y del horno, el infrarrojo y la luz visible. Tu resultado queda marcado sobre esa regla.',
    bands: [
      { label: '1 a 20 Hz — infrasonido: sismos, motores grandes', from: 1, to: 20, tone: 'neutral' },
      { label: '20 Hz a 20 kHz — todo el rango audible humano', from: 20, to: 20000, tone: 'good' },
      { label: '20 kHz a 30 MHz — ultrasonido, radio AM y onda corta', from: 20000, to: 30000000, tone: 'good' },
      { label: '30 MHz a 3 GHz — FM (88-108 MHz), TV, celular', from: 30000000, to: 3000000000, tone: 'warn' },
      { label: '3 a 300 GHz — microondas: wifi 2,4 y 5 GHz, horno', from: 3000000000, to: 300000000000, tone: 'warn' },
      { label: '300 GHz a 400 THz — infrarrojo: control remoto, calor', from: 300000000000, to: 400000000000000, tone: 'bad' },
      { label: '400 a 1.000 THz — luz visible y ultravioleta', from: 400000000000000, to: 1000000000000000, tone: 'bad' },
    ],
  },
  breakdownTitle: 'El desglose completo del cálculo',
  breakdownIntro:
    'Cada fila trae su propia unidad: hay hertz, metros, segundos, centímetros, joules y grados. Las barras comparan el número de cada fila entre sí, así que una frecuencia en hertz siempre va a aplastar a todo lo demás: mirá el valor, no la barra.',

  faq: [
    {
      q: '¿Cómo se relacionan longitud de onda, frecuencia y velocidad?',
      a: 'Con v = λ·f: la velocidad de propagación es el producto de la longitud de onda por la frecuencia. Para una emisora de FM a 100 MHz, la longitud de onda es 299.792.458 / 100.000.000 = 3 metros, que es exactamente por qué las antenas de FM miden lo que miden. Para el la de 440 Hz en el aire, λ = 343 / 440 = 78 cm. A velocidad constante, longitud de onda y frecuencia son inversamente proporcionales.',
    },
    {
      q: '¿Qué pasa con una onda cuando cambia de medio?',
      a: 'Cambia su velocidad y, con ella, su longitud de onda. Lo que NO cambia es la frecuencia, porque la fija la fuente que la emitió. Por eso la luz que entra al agua se dobla —se refracta— sin cambiar de color: baja de 299.792 a unos 225.000 km/s y su longitud de onda se acorta en la misma proporción, pero sigue siendo la misma frecuencia y por lo tanto el mismo color.',
    },
    {
      q: '¿A qué velocidad viaja el sonido y de qué depende?',
      a: 'En aire a 20 °C viaja a unos 343 m/s (1.235 km/h). La variable que manda es la TEMPERATURA: c ≈ 331,3 + 0,606·T con T en grados Celsius, así que a 0 °C baja a 331,3 m/s y a 35 °C sube a 352 m/s. Ni la presión ni la altitud influyen por sí solas —en altura el sonido va más lento simplemente porque hace más frío—. La humedad sube la velocidad menos de medio metro por segundo entre aire seco y saturado.',
    },
    {
      q: '¿Cómo calculo a qué distancia está una tormenta?',
      a: 'Contás los segundos entre que ves el relámpago y escuchás el trueno, y dividís por tres. La luz llega instantáneamente y el sonido tarda unos 2,9 segundos por kilómetro a 20 °C, así que nueve segundos son unos tres kilómetros. Es una regla notablemente buena: el error de usar "3" en vez de "2,9" es menor al 4%. Ojo con lo que estás midiendo: te da la distancia al RAYO, no al centro de la tormenta.',
    },
    {
      q: '¿Por qué la sirena cambia de tono cuando pasa?',
      a: "Por el efecto Doppler: cuando la ambulancia se acerca, cada frente de onda sale desde un punto un poco más cerca tuyo que el anterior, así que las ondas llegan comprimidas y la frecuencia percibida sube; cuando se aleja, se estiran y baja. La fórmula es f' = f·(v ± vo)/(v ∓ vs). Una sirena de 700 Hz en un vehículo a 90 km/h se escucha a 755 Hz mientras viene y a 653 Hz una vez que pasó: un salto de más de 100 Hz, unos 2,5 semitonos musicales.",
    },
    {
      q: '¿Es lo mismo que se mueva la fuente o que me mueva yo?',
      a: 'No, y esa es la sutileza del efecto Doppler clásico. Si se mueve la fuente, lo que cambia es la separación entre los frentes de onda ya emitidos, y la frecuencia entra en el DENOMINADOR de la fórmula. Si te movés vos, lo que cambia es la velocidad con la que los cruzás, y entra en el numerador. Para velocidades chicas frente a la del sonido los dos resultados son casi iguales, pero cerca de la velocidad del sonido se separan mucho: sólo la fuente puede provocar el boom sónico.',
    },
    {
      q: '¿Cómo se usa la ecuación de las lentes?',
      a: 'Con 1/f = 1/do + 1/di, donde f es la distancia focal, do la del objeto y di la de la imagen. Con dos de las tres, la tercera sale despejando. Para una lente convergente de 10 cm de foco con el objeto a 30 cm, la imagen se forma a 15 cm del otro lado, real e invertida, con una magnificación de −0,5: mide la mitad y está dada vuelta. Si el objeto se acerca dentro del foco, la imagen pasa a ser virtual y derecha, que es lo que hace una lupa.',
    },
    {
      q: '¿Qué diferencia hay entre imagen real y virtual?',
      a: 'La real se forma donde los rayos de luz efectivamente convergen, así que se puede proyectar sobre una pantalla: es lo que hace un proyector o lo que se forma en la retina. La virtual es donde los rayos PARECEN venir cuando uno los prolonga hacia atrás: no se puede proyectar, sólo verla mirando a través de la lente. La lupa y el espejo del baño dan imágenes virtuales; la cámara de fotos, reales.',
    },
    {
      q: '¿Qué son las dioptrías de un anteojo?',
      a: 'Son el inverso de la distancia focal expresada en metros: P = 1/f. Una lente de 50 cm de foco tiene 2 dioptrías; una de 10 cm, 10 dioptrías. El signo indica el tipo: positivo para convergentes, que corrigen la hipermetropía, y negativo para divergentes, que corrigen la miopía. Cuando la receta dice "−2,5", significa una lente divergente de 40 cm de distancia focal.',
    },
    {
      q: '¿Cuánta energía libera un terremoto de magnitud 7?',
      a: 'Con log E = 4,8 + 1,5·M, un sismo M7 libera 2 × 10¹⁵ joules, equivalentes a unas 478 kilotoneladas de TNT: unas treinta veces la bomba de Hiroshima. Y el punto clave es la escala logarítmica: cada punto entero de magnitud multiplica la energía por unas 32 veces. Un M8 libera 32 veces más que un M7 y unas 1.000 veces más que un M6. Por eso los saltos de una décima en el número que informan los sismólogos importan tanto.',
    },
    {
      q: '¿Richter y magnitud de momento son lo mismo?',
      a: 'No, aunque en la práctica los números se parecen. La escala de Richter original (ML) se definió en 1935 para sismos locales de California medidos con un sismógrafo específico, y se satura por encima de M7: no distingue bien entre un M8 y un M9. La magnitud de momento (Mw), que es la que usan hoy los organismos, se calcula desde las propiedades físicas de la ruptura y no se satura. Los medios siguen diciendo "escala de Richter" por costumbre.',
    },
    {
      q: '¿La magnitud dice cuánto daño va a hacer un sismo?',
      a: 'No directamente. La magnitud mide la energía liberada en la falla, y el daño depende además de la profundidad del foco, de la distancia a las ciudades, del tipo de suelo —los suelos blandos amplifican— y sobre todo de cómo esté construido lo que hay arriba. Para el daño existe otra escala, la de Mercalli modificada, que va de I a XII y describe efectos observados en vez de energía liberada. Un M6 superficial bajo una ciudad mal construida hace más daño que un M8 profundo en el océano.',
    },
  ],

  sources: [
    {
      name: 'El Sistema Internacional de Unidades (SI), 9.ª edición — definición del metro y valor exacto de la velocidad de la luz',
      url: 'https://www.bipm.org/en/publications/si-brochure',
      publisher: 'Bureau International des Poids et Mesures (BIPM)',
    },
    {
      name: 'Earthquake Magnitude, Energy Release, and Shaking Intensity — relación entre magnitud y energía',
      url: 'https://www.usgs.gov/programs/earthquake-hazards/earthquake-magnitude-energy-release-and-shaking-intensity',
      publisher: 'United States Geological Survey (USGS)',
    },
    {
      name: 'Speed of Sound in Air — dependencia con la temperatura y la humedad',
      url: 'https://www.engineeringtoolbox.com/air-speed-sound-d_603.html',
      publisher: 'Engineering ToolBox',
    },
    {
      name: 'CODATA Internationally Recommended Values of the Fundamental Physical Constants',
      url: 'https://physics.nist.gov/cuu/Constants/',
      publisher: 'NIST / CODATA',
    },
    {
      name: 'INPRES — Instituto Nacional de Prevención Sísmica de la República Argentina',
      url: 'https://www.inpres.gob.ar/',
      publisher: 'INPRES',
    },
  ],

  replaces: [
    '/calculadora-onda-longitud-frecuencia-velocidad',
    '/calculadora-velocidad-sonido-segun-temperatura-aire',
    '/calculadora-efecto-doppler-frecuencia',
    '/calculadora-lente-distancia-focal',
    '/calculadora-escala-richter-magnitud-energia',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Constantes exactas y coeficientes empíricos. */
export const CONST = {
  /** Velocidad de la luz en el vacío, EXACTA: define el metro desde 1983. */
  C_LUZ: 299792458,
  /** Velocidad del sonido en aire seco a 0 °C, m/s. */
  C_SONIDO_0: 331.3,
  /** Incremento de la velocidad del sonido por grado Celsius, m/s·°C. */
  C_SONIDO_T: 0.606,
  /** Gutenberg-Richter: log10(E en joules) = A + B·M. */
  RICHTER_A: 4.8,
  RICHTER_B: 1.5,
  /** Energía de 1 kg de TNT, J. Exacta por la caloría termoquímica. */
  TNT_KG: 4.184e6,
  /** Consumo eléctrico anual típico de un hogar argentino, en joules (≈3.000 kWh). */
  HOGAR_ANUAL_J: 3000 * 3.6e6,
};

/** Regla logarítmica de frecuencia, de 1 Hz a 10¹⁵ Hz. */
export const SCALE = {
  minHz: 1,
  maxHz: 1e15,
  refs: [
    { hz: 5, label: 'la vibración de un sismo' },
    { hz: 100, label: 'una voz grave' },
    { hz: 440, label: 'el la de afinación' },
    { hz: 4000, label: 'la zona más sensible del oído' },
    { hz: 20000, label: 'el límite audible del oído humano' },
    { hz: 1000000, label: 'la radio AM' },
    { hz: 100000000, label: 'la radio FM' },
    { hz: 2400000000, label: 'el wifi de 2,4 GHz' },
    { hz: 540000000000000, label: 'la luz verde' },
  ],
};
