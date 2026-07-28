import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuándo siembro cada cosa?"
 * Arquetipo: RAMIFICADO. Cuatro ramas: calendario de siembra por zona (default),
 * heladas, germinación y poda.
 *
 * Absorbe 8 URLs de calculadora suelta (ver `replaces`), todas reimplementadas
 * en el compute() de la página con los mismos números de sus fórmulas.
 *
 * ESTACIONALIDAD SIN FECHA HARDCODEADA: el campo `mes` arranca en la opción
 * 'auto' y compute() la resuelve con `new Date()` en el navegador. Todo el copy
 * que dice "ahora" (estación, qué sembrar este mes, días hasta la próxima
 * helada) sale del resultado, no del HTML estático: así la página no se pudre
 * en cada cambio de estación ni depende de cuándo se hizo el build.
 *
 * NOTAS DE CONTRATO (no toco archivos compartidos, lo dejo anotado):
 *  - Nada es plata: toda fila declara `format` explícito ('unit' con días, cm o
 *    °C, o 'plain' para conteos) y ninguna hereda el default 'ars'.
 *  - `chart.type: 'timeline'` usa el render posicional de DecisionHub: las
 *    franjas salen de `res.chart[].from/to` (los meses del año) y el marcador
 *    de `res.position` (hoy). `positionLabel` lleva la ventana de siembra del
 *    cultivo elegido y la fecha de la última helada de la zona.
 */
export const hub: HubData = {
  slug: 'jardin/huerta',
  title: '¿Cuándo siembro cada cosa? — Calendario de siembra, heladas y poda por zona 2026',
  description:
    'Qué sembrar este mes según tu zona de Argentina, cuándo caen la primera y la última helada, cuántos días tarda en germinar cada semilla a la temperatura que tenés y cuándo podar cada árbol o el rosal.',
  silo: 'Jardín',
  siloHref: '/jardin',

  eyebrow: 'Calendario de huerta y jardín',
  h1: '¿Cuándo siembro cada cosa?',
  lede:
    'La huerta se maneja con dos fechas: la última helada y la primera. Entre esas dos va todo lo sensible al frío; afuera van el ajo, las habas y las hojas de invierno. Elegí tu zona y te decimos qué entra en la tierra este mes, cuántos días tarda en germinar y a qué profundidad va la semilla.',
  stamps: [
    'Actualizado 27-07-2026',
    'Calendario y fechas de helada por región (INTA Pro Huerta)',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Qué corresponde hacer ahora',

  cases: {
    title: '¿Qué necesitás saber?',
    intro:
      'Partimos por el calendario de siembra, que es la pregunta más frecuente. Las otras tres ramas son las que la responden en detalle: la helada te marca los bordes de la temporada, la germinación te dice cuánto esperar y la poda es la otra tarea con fecha fija del año.',
    items: [
      {
        id: 'siembra',
        label: 'Calendario de siembra por zona',
        hint: 'Qué va a la tierra este mes',
        answer: 'Cada mes tiene su lista de siembra directa, almácigo y trasplante, y cambia según la región.',
        yes: [
          'Siembra directa: la semilla va al cantero definitivo, sin trasplante posterior',
          'Almácigo: se siembra en bandeja o maceta protegida y se trasplanta con 4 a 6 hojas verdaderas',
          'Trasplante: el plantín que sembraste hace 6 a 8 semanas pasa al cantero',
          'La profundidad de siembra es de 2 a 3 veces el diámetro de la semilla, y se ajusta según el suelo',
          'En suelo arenoso se siembra un 20% más profundo, y en arcilloso un 20% más al ras',
        ],
        warn: [
          'El calendario es de la región, no de tu patio: un cantero contra una pared al norte adelanta semanas',
          'Nada sensible al frío (tomate, pimiento, berenjena, albahaca, zapallo) va al cantero antes de la última helada',
          'El almácigo se hace 6 a 8 semanas antes de la fecha de trasplante, no el mismo día',
          'Sembrar de más también es un error: media docena de plantas de zapallo tapan una huerta entera',
        ],
        plazo: 'la ventana de cada especie dura unas cuatro semanas; si la perdés, en general hay una segunda vuelta al otro lado del verano.',
      },
      {
        id: 'heladas',
        label: 'Cuándo llegan las heladas',
        hint: 'Primera y última, por zona',
        answer: 'Entre la última helada y la primera está toda la temporada de cultivo sensible al frío.',
        yes: [
          'La última helada de primavera es la que habilita a trasplantar tomate, pimiento y albahaca',
          'La primera helada de otoño es la fecha límite para cosechar todo lo que no tolera el frío',
          'Los días libres de helada son la temporada real de tu zona, y definen qué ciclo de cultivo entra',
          'Las hojas de invierno, el ajo, las habas y las arvejas se siembran fuera de esa ventana, a propósito',
        ],
        warn: [
          'Son fechas promedio: una helada tardía fuera de fecha es lo que arruina los frutales en flor',
          'La helada de radiación cae en noches despejadas, secas y sin viento, aunque el termómetro marque 2 °C',
          'Los bajos y las hondonadas heladan antes que la loma de al lado: el aire frío escurre hacia abajo',
          'Con menos de 180 días libres, el tomate y el pimiento a cielo abierto casi no cierran el ciclo',
        ],
        plazo: 'con pronóstico de helada, regá a la tarde y cubrí con tela antihelada o media sombra antes de que caiga el sol.',
      },
      {
        id: 'germinacion',
        label: 'Cuánto tarda en germinar',
        hint: 'Según especie y temperatura',
        answer: 'La temperatura manda: la misma semilla puede tardar el doble a 15 °C que a 25 °C.',
        yes: [
          'Casi todas las hortalizas germinan más rápido entre 20 y 25 °C de temperatura del sustrato',
          'La que manda es la temperatura del sustrato, no la del aire: una bandeja al sol está más caliente',
          'El sustrato tiene que estar húmedo, no encharcado, durante todo el período de germinación',
          'Las semillas chicas (lechuga, rúcula, perejil) van casi al ras: enterradas de más no emergen',
        ],
        warn: [
          'Por debajo de 15 °C la germinación se enlentece mucho y aumenta el riesgo de que la semilla se pudra',
          'El perejil es el más lento de la huerta: hasta 30 días, y conviene remojarlo 24 horas antes',
          'Si a los días máximos no emergió nada, el problema suele ser profundidad, temperatura o semilla vieja',
          'No remojes el poroto antes de sembrar: se pudre',
        ],
        plazo: 'mantené el sustrato húmedo todos los días del rango; una sola secada a mitad de camino corta la germinación.',
      },
      {
        id: 'poda',
        label: 'Cuándo podar',
        hint: 'Frutales, ornamentales y rosal',
        answer: 'Casi todo lo caduco se poda en pleno reposo invernal; los cítricos y el olivo, después de cosechar.',
        yes: [
          'Los frutales de carozo y pepita (durazno, manzano, peral, higuera, vid) se podan en julio y agosto, sin hojas',
          'El limonero y el olivo se podan después de la cosecha, en febrero y marzo',
          'Hasta los 3 años la poda es de formación: define la estructura que el árbol va a tener toda su vida',
          'Pasados los 20 años conviene la poda de rejuvenecimiento, para renovar ramas productivas',
          'El rosal se poda en el reposo de tu zona: más tarde donde el invierno es más crudo',
        ],
        warn: [
          'Podar un cítrico en pleno invierno lo expone a la helada por los cortes abiertos',
          'No saques más del 20% de la copa de un cítrico en una misma poda',
          'Los ornamentales perennes no toleran podas drásticas: sólo poda ligera de forma',
          'Herramienta desinfectada entre planta y planta: la tijera es el principal vector de enfermedades',
        ],
        plazo: 'la ventana de poda dura unas seis a ocho semanas; fuera de ella el corte cicatriza peor y sangra savia.',
      },
    ],
  },

  inputsTitle: 'Tu huerta',
  inputsIntro:
    'La zona define el calendario y las fechas de helada. El mes arranca en "este mes" y lo resuelve solo con la fecha de hoy: cambialo si estás planificando para más adelante.',
  fields: [
    {
      id: 'zona',
      label: 'Tu zona',
      type: 'select',
      value: 'buenosaires',
      options: [
        { value: 'buenosaires', label: 'Buenos Aires y alrededores' },
        { value: 'rosario', label: 'Rosario y sur de Santa Fe' },
        { value: 'cordoba', label: 'Córdoba' },
        { value: 'mardelplata', label: 'Mar del Plata y la costa' },
        { value: 'mendoza', label: 'Mendoza y Cuyo' },
        { value: 'tucuman', label: 'Tucumán' },
        { value: 'salta', label: 'Salta y valles del NOA' },
        { value: 'misiones', label: 'Misiones y el NEA' },
        { value: 'neuquen', label: 'Neuquén y alto valle' },
        { value: 'bariloche', label: 'Bariloche y cordillera' },
      ],
    },
    {
      id: 'mes',
      label: 'Mes que querés planificar',
      type: 'select',
      value: 'auto',
      options: [
        { value: 'auto', label: 'Este mes (según la fecha de hoy)' },
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
      ],
    },
    {
      id: 'cultivo',
      label: 'Cultivo que te interesa',
      type: 'select',
      value: 'tomate',
      options: [
        { value: 'tomate', label: 'Tomate' },
        { value: 'lechuga', label: 'Lechuga' },
        { value: 'zanahoria', label: 'Zanahoria' },
        { value: 'pimiento', label: 'Pimiento / morrón' },
        { value: 'maiz', label: 'Maíz' },
        { value: 'poroto', label: 'Poroto' },
        { value: 'haba', label: 'Haba' },
        { value: 'arveja', label: 'Arveja' },
        { value: 'calabaza', label: 'Zapallo / calabaza' },
        { value: 'pepino', label: 'Pepino' },
        { value: 'espinaca', label: 'Espinaca' },
        { value: 'acelga', label: 'Acelga' },
        { value: 'rabanito', label: 'Rabanito' },
        { value: 'remolacha', label: 'Remolacha' },
        { value: 'cebolla', label: 'Cebolla' },
        { value: 'ajo', label: 'Ajo' },
        { value: 'perejil', label: 'Perejil' },
        { value: 'albahaca', label: 'Albahaca' },
        { value: 'rucula', label: 'Rúcula' },
        { value: 'berenjena', label: 'Berenjena' },
      ],
    },
    {
      id: 'suelo',
      label: 'Tipo de suelo',
      type: 'select',
      value: 'franco',
      options: [
        { value: 'arenoso', label: 'Arenoso (drena rápido, se seca)' },
        { value: 'franco', label: 'Franco (el equilibrado)' },
        { value: 'arcilloso', label: 'Arcilloso (pesado, retiene agua)' },
      ],
      help: 'Ajusta la profundidad de siembra: +20% en arenoso, −20% en arcilloso.',
    },
    {
      id: 'temperatura',
      label: 'Temperatura del sustrato',
      type: 'number',
      min: 5,
      max: 40,
      step: 1,
      value: 20,
      suffix: '°C',
      help: 'La del sustrato, no la del aire: una bandeja al sol está más caliente.',
    },
    {
      id: 'arbol',
      label: 'Árbol o arbusto a podar',
      type: 'select',
      value: 'limonero',
      options: [
        { value: 'limonero', label: 'Limonero y cítricos' },
        { value: 'durazno', label: 'Durazno' },
        { value: 'manzano', label: 'Manzano' },
        { value: 'peral', label: 'Peral' },
        { value: 'higuera', label: 'Higuera' },
        { value: 'olivo', label: 'Olivo' },
        { value: 'vid', label: 'Vid / parra' },
        { value: 'rosal', label: 'Rosal' },
        { value: 'ornamental_caduco', label: 'Ornamental de hoja caduca' },
        { value: 'ornamental_perenne', label: 'Ornamental de hoja perenne' },
      ],
    },
    { id: 'edadArbol', label: 'Edad del árbol', type: 'number', min: 1, max: 80, step: 1, value: 5, suffix: 'años' },
  ],
  fineprint:
    'Las fechas de helada son promedios históricos por zona, no un pronóstico: una helada tardía fuera de fecha es normal cada varios años. El calendario es regional; un microclima de patio urbano puede adelantar o atrasar todo entre dos y cuatro semanas.',

  chart: {
    type: 'timeline',
    title: 'El año de tu huerta',
    caption:
      'El año completo repartido en las cuatro estaciones del hemisferio sur, con el día de hoy marcado. En la etiqueta va la ventana de siembra del cultivo que elegiste y la fecha de la última helada de tu zona: entre esas dos referencias se decide casi todo lo que entra a la tierra.',
    bands: [
      { label: 'Verano — enero y febrero', from: 1, to: 3, tone: 'warn' },
      { label: 'Otoño — marzo a mayo', from: 3, to: 6, tone: 'good' },
      { label: 'Invierno — junio a agosto', from: 6, to: 9, tone: 'neutral' },
      { label: 'Primavera — septiembre a noviembre', from: 9, to: 12, tone: 'good' },
      { label: 'Verano — diciembre', from: 12, to: 13, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Los números de tu huerta ahora',
  breakdownIntro:
    'Todo en días, centímetros o grados: acá no hay pesos. Las barras sólo ordenan las magnitudes entre sí, el dato es el valor.',

  faq: [
    {
      q: '¿Qué se puede sembrar en invierno en Argentina?',
      a: 'En pleno invierno (junio, julio y agosto) va a la tierra todo lo que tolera el frío: ajo, habas, arvejas, cebolla de bulbo, espinaca, lechuga de invierno, rabanito y rúcula. En agosto arranca además la temporada de almácigos protegidos de tomate, pimiento, berenjena y albahaca, para tener plantines listos cuando pase la última helada. Lo que no va nunca al cantero en invierno es cualquier cosa sensible al frío: zapallo, pepino, maíz, poroto y chaucha.',
    },
    {
      q: '¿Cuándo se siembra el tomate en Argentina?',
      a: 'El tomate se siembra en almácigo protegido desde fines de julio hasta septiembre, y se trasplanta al cantero recién cuando pasó la última helada de tu zona: en Buenos Aires eso es alrededor del 10 de septiembre, así que el trasplante seguro va de mediados de septiembre a octubre. El almácigo se hace 6 a 8 semanas antes del trasplante. La semilla va a 1 cm de profundidad y germina en 7 a 14 días si el sustrato está entre 20 y 25 °C.',
    },
    {
      q: '¿Cuándo es la última helada donde vivo?',
      a: 'Depende de la zona. En promedio: Buenos Aires alrededor del 10 de septiembre, Rosario el 5 de septiembre, Mar del Plata el 15 de septiembre, Córdoba el 15 de septiembre, Mendoza el 20 de septiembre, Tucumán el 20 de agosto, Salta el 15 de agosto, Misiones el 15 de julio, Neuquén el 15 de octubre y Bariloche el 15 de noviembre. Son promedios históricos: cada varios años cae una helada tardía fuera de fecha, que es la que arruina los frutales en flor.',
    },
    {
      q: '¿Cuántos días libres de heladas tiene mi zona?',
      a: 'Misiones ronda los 330 días, Tucumán y Salta unos 270, Buenos Aires, Rosario y Mar del Plata unos 250, Córdoba 235, Mendoza 220, Neuquén 180 y Bariloche apenas 135. Ese número es la temporada real de cultivo sensible al frío: por debajo de 180 días, el tomate y el pimiento a cielo abierto casi no llegan a cerrar el ciclo y conviene invernadero o variedades de ciclo corto.',
    },
    {
      q: '¿A qué profundidad se siembra cada semilla?',
      a: 'La regla es enterrar entre 2 y 3 veces el diámetro de la semilla. En la práctica: lechuga, rúcula, perejil y albahaca a 0,5 cm (casi al ras, porque necesitan algo de luz); tomate, pimiento, berenjena, cebolla y rabanito a 1 cm; espinaca a 1,5 cm; acelga, remolacha y pepino a 2 cm; poroto, arveja y zapallo a 3 cm; maíz y ajo a 4 cm; y haba a 5 cm. En suelo arenoso conviene un 20% más profundo, y en arcilloso un 20% más al ras.',
    },
    {
      q: '¿Cuánto tarda en germinar una semilla?',
      a: 'Depende de la especie y sobre todo de la temperatura del sustrato. El rabanito es el más rápido: 3 a 5 días. La rúcula 4 a 7, la lechuga 5 a 7, el maíz y el poroto 5 a 10, el tomate 7 a 14, la zanahoria 14 a 21 y el perejil hasta 30 días. El mismo tomate que a 25 °C germina en 5 a 7 días, a 15 °C tarda 14 a 21: la temperatura puede triplicar la espera.',
    },
    {
      q: '¿Cuándo se podan los frutales?',
      a: 'Los frutales de hoja caduca (durazno, manzano, peral, higuera, vid) se podan en pleno reposo invernal, en julio y agosto, cuando el árbol está sin hojas y se ve la estructura. Los cítricos y el olivo son la excepción: se podan después de la cosecha, en febrero y marzo, porque un corte abierto en pleno invierno los expone a la helada. El olivo además tolera poda cada dos años, no todos los años.',
    },
    {
      q: '¿Cuándo se poda el rosal?',
      a: 'En el reposo invernal de tu zona, y la fecha se corre según el clima: en zonas frías como Bariloche o Neuquén, entre agosto y septiembre (fin del invierno); en zonas templadas como Buenos Aires, Rosario, Córdoba, Mendoza o Mar del Plata, en junio y julio; y en zonas cálidas como Tucumán, Salta o Misiones, en mayo y junio. La poda es fuerte: se dejan 3 a 5 yemas por rama y se corta 1 cm por encima de una yema orientada hacia afuera.',
    },
    {
      q: '¿Cuál es la diferencia entre siembra directa, almácigo y trasplante?',
      a: 'La siembra directa pone la semilla en el cantero definitivo y es la única opción para todo lo de raíz (zanahoria, rabanito, remolacha) y para lo que no tolera que le muevan la raíz (maíz, poroto, chaucha). El almácigo siembra en bandeja o maceta protegida, y sirve para adelantar la temporada con las especies de ciclo largo o sensibles al frío (tomate, pimiento, berenjena, cebolla, puerro). El trasplante es el paso final: llevar ese plantín al cantero cuando tiene 4 a 6 hojas verdaderas, entre 6 y 8 semanas después de sembrarlo.',
    },
    {
      q: '¿Se puede sembrar todo el año en Argentina?',
      a: 'Sí, siempre hay algo para sembrar, pero cambia qué. El país va de subtropical en Misiones a frío en la cordillera, y eso mueve el calendario varias semanas: en el NOA y el NEA la temporada arranca antes y en Patagonia después. En los meses de menos actividad —pleno invierno en el sur, pleno verano en el norte— lo que corresponde es preparar la tierra, abonar, hacer compost y planificar la siguiente vuelta, que también es trabajo de huerta.',
    },
  ],

  sources: [
    {
      name: 'Pro Huerta — manuales y calendarios de siembra por región',
      url: 'https://www.argentina.gob.ar/inta/prohuerta',
      publisher: 'INTA — Instituto Nacional de Tecnología Agropecuaria',
    },
    {
      name: 'La huerta orgánica (manual del INTA Pro Huerta) — épocas de siembra, almácigo y trasplante',
      url: 'https://inta.gob.ar/documentos/la-huerta-organica',
      publisher: 'INTA Ediciones',
    },
    {
      name: 'Estadísticas climatológicas normales — fechas medias de primera y última helada',
      url: 'https://www.smn.gob.ar/estadisticas',
      publisher: 'Servicio Meteorológico Nacional (SMN)',
    },
    {
      name: 'Poda de frutales: criterios de formación, producción y rejuvenecimiento',
      url: 'https://inta.gob.ar/documentos/poda-de-frutales',
      publisher: 'INTA',
    },
    {
      name: 'Datos abiertos agroindustriales — calendario de siembra y cosecha por cultivo',
      url: 'https://datos.magyp.gob.ar/',
      publisher: 'Ministerio de Economía — Secretaría de Agricultura, Ganadería y Pesca',
    },
  ],

  replaces: [
    '/calculadora-siembra-calendario-argentina-zona',
    '/calculadora-podar-rosal-cuando-fecha',
    '/calculadora-heladas-fecha-primera-ultima-zona',
    '/calculadora-profundidad-siembra-semilla',
    '/calculadora-germinacion-tiempo-temperatura',
    '/calculadora-calendario-siembra-hemisferio-sur',
    '/calculadora-poda-frecuencia-arbol-especie',
    '/calculadora-calendario-siembra-hemisferio-norte',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-arbol-frutal-produccion-kg-anual',
    '/calculadora-cosecha-esperada-huerta-kg',
    '/calculadora-luz-solar-horas-planta',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Calendario base de la región pampeana, mes por mes (INTA Pro Huerta). */
export const PAMPEANA: Record<number, { directa: string[]; almacigo: string[]; trasplante: string[] }> = {
  1: { directa: ['Maíz tardío', 'Zapallito', 'Chaucha', 'Rúcula'], almacigo: ['Brócoli otoñal'], trasplante: ['Tomate', 'Pimiento', 'Berenjena'] },
  2: { directa: ['Rúcula', 'Rabanito', 'Chaucha'], almacigo: ['Repollo', 'Coliflor'], trasplante: ['Apio', 'Frutilla'] },
  3: { directa: ['Lechuga', 'Espinaca', 'Rabanito', 'Rúcula', 'Acelga'], almacigo: ['Cebolla', 'Coliflor', 'Brócoli'], trasplante: ['Repollo'] },
  4: { directa: ['Ajo', 'Arvejas', 'Habas', 'Lechuga', 'Espinaca', 'Rúcula', 'Rabanito', 'Acelga'], almacigo: ['Cebolla', 'Puerro', 'Brócoli', 'Coliflor'], trasplante: ['Lechuga', 'Acelga'] },
  5: { directa: ['Ajo', 'Habas', 'Arvejas', 'Espinaca', 'Lechuga'], almacigo: ['Cebolla', 'Puerro'], trasplante: ['Brócoli', 'Coliflor'] },
  6: { directa: ['Ajo', 'Habas', 'Arvejas'], almacigo: ['Lechuga', 'Cebolla'], trasplante: ['Puerro'] },
  7: { directa: ['Habas', 'Arvejas'], almacigo: ['Lechuga', 'Tomate (fin de mes)', 'Pimiento'], trasplante: ['Cebolla'] },
  8: { directa: ['Rabanito', 'Rúcula', 'Zanahoria'], almacigo: ['Tomate', 'Pimiento', 'Berenjena', 'Albahaca'], trasplante: ['Lechuga', 'Cebolla'] },
  9: { directa: ['Remolacha', 'Rabanito', 'Zanahoria', 'Lechuga', 'Acelga', 'Perejil'], almacigo: ['Zapallo', 'Zapallito', 'Pepino', 'Melón', 'Sandía'], trasplante: ['Tomate', 'Pimiento'] },
  10: { directa: ['Maíz', 'Chaucha', 'Zapallito', 'Pepino'], almacigo: ['Albahaca'], trasplante: ['Tomate', 'Pimiento', 'Berenjena', 'Zapallo'] },
  11: { directa: ['Maíz', 'Poroto', 'Zapallito', 'Pepino', 'Chaucha'], almacigo: [], trasplante: ['Zapallo', 'Sandía', 'Melón'] },
  12: { directa: ['Maíz tardío', 'Poroto', 'Chaucha'], almacigo: ['Brócoli otoñal'], trasplante: ['Albahaca'] },
};

/**
 * Zonas: región agroecológica (para el calendario) + fechas medias de helada.
 *
 * `offset` corre el calendario en meses respecto de la pampeana: las regiones
 * más cálidas (NOA, NEA) adelantan la temporada un mes y la Patagonia la
 * atrasa un mes. OJO: la calculadora original invertía el signo (adelantaba la
 * Patagonia y atrasaba el NOA) y dejaba el NEA idéntico a la pampeana por un
 * off-by-one en el módulo; acá va con la dirección correcta.
 */
export interface Zona {
  label: string;
  region: string;
  offset: number;
  clima: 'frio' | 'templado' | 'calido';
  /** Primera helada de otoño (mes, día) y última de primavera. */
  primera: [number, number];
  ultima: [number, number];
  /** Días libres de helada declarados para la zona. */
  libres: number;
  consejo: string;
}

export const ZONAS: Record<string, Zona> = {
  buenosaires: { label: 'Buenos Aires', region: 'Pampeana', offset: 0, clima: 'templado', primera: [5, 20], ultima: [9, 10], libres: 250, consejo: 'Trasplantá tomates y pimientos recién desde mediados de septiembre y con seguridad en octubre.' },
  rosario: { label: 'Rosario', region: 'Litoral', offset: 0, clima: 'templado', primera: [5, 15], ultima: [9, 5], libres: 250, consejo: 'Zona templada-cálida: heladas moderadas, rara vez por debajo de −5 °C.' },
  cordoba: { label: 'Córdoba', region: 'Pampeana', offset: 0, clima: 'templado', primera: [5, 10], ultima: [9, 15], libres: 235, consejo: 'Heladas más frecuentes que en Buenos Aires: usá tela antihelada en los frutales.' },
  mardelplata: { label: 'Mar del Plata', region: 'Pampeana', offset: 0, clima: 'templado', primera: [5, 25], ultima: [9, 15], libres: 250, consejo: 'Clima oceánico: heladas menos intensas pero viento fuerte, protegé del viento.' },
  mendoza: { label: 'Mendoza', region: 'Cuyana', offset: 0, clima: 'templado', primera: [5, 1], ultima: [9, 20], libres: 220, consejo: 'Heladas tardías peligrosas para frutales en flor y gran amplitud térmica diaria.' },
  tucuman: { label: 'Tucumán', region: 'NOA', offset: 1, clima: 'calido', primera: [5, 20], ultima: [8, 20], libres: 270, consejo: 'Inviernos suaves en el valle: heladas sólo en noches despejadas y secas.' },
  salta: { label: 'Salta', region: 'NOA', offset: 1, clima: 'calido', primera: [5, 15], ultima: [8, 15], libres: 270, consejo: 'Valles templados con heladas leves; cuidado con las tardías de agosto.' },
  misiones: { label: 'Misiones', region: 'NEA', offset: 1, clima: 'calido', primera: [6, 15], ultima: [7, 15], libres: 330, consejo: 'Heladas muy raras (de 0 a 5 por año): prácticamente tropical para la huerta.' },
  neuquen: { label: 'Neuquén', region: 'Patagonia', offset: -1, clima: 'frio', primera: [4, 15], ultima: [10, 15], libres: 180, consejo: 'Temporada corta: priorizá cultivos de ciclo corto o usá invernadero.' },
  bariloche: { label: 'Bariloche', region: 'Patagonia', offset: -1, clima: 'frio', primera: [4, 1], ultima: [11, 15], libres: 135, consejo: 'Temporada muy corta: invernadero casi obligatorio para tomate y pimiento.' },
};

/**
 * Semillas: profundidad base en cm, método, rango de germinación de referencia
 * y el nombre con el que la especie aparece en el calendario.
 */
export interface Semilla {
  nombre: string;
  profBase: number;
  metodo: string;
  diasMin: number;
  diasMax: number;
  consejo: string;
}

export const SEMILLAS: Record<string, Semilla> = {
  tomate: { nombre: 'Tomate', profBase: 1.0, metodo: 'Almácigo', diasMin: 7, diasMax: 14, consejo: 'Sembrá en almácigo a 20-25 °C y trasplantá con 4 a 6 hojas verdaderas.' },
  lechuga: { nombre: 'Lechuga', profBase: 0.5, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 7, consejo: 'Necesita algo de luz: cubrí apenas con sustrato fino, no la entierres.' },
  zanahoria: { nombre: 'Zanahoria', profBase: 0.5, metodo: 'Siembra directa', diasMin: 14, diasMax: 21, consejo: 'Sembrá en hilera y mantené húmedo; raleá cuando tengan 5 cm.' },
  pimiento: { nombre: 'Pimiento', profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 20, consejo: 'Necesita calor para germinar (25 °C): almácigo cubierto.' },
  maiz: { nombre: 'Maíz', profBase: 4.0, metodo: 'Siembra directa', diasMin: 5, diasMax: 10, consejo: 'Sembrá 2 o 3 semillas por hoyo y raleá dejando la más fuerte.' },
  poroto: { nombre: 'Poroto', profBase: 3.0, metodo: 'Siembra directa', diasMin: 5, diasMax: 8, consejo: 'No lo remojes antes: se pudre. Directo en suelo húmedo.' },
  haba: { nombre: 'Habas', profBase: 5.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Se siembra en otoño; resiste el frío pero no el encharcamiento.' },
  arveja: { nombre: 'Arvejas', profBase: 3.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Poné tutor desde el inicio; se siembra en otoño e invierno.' },
  calabaza: { nombre: 'Zapallo', profBase: 3.0, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 10, consejo: 'Necesita mucho espacio: una planta cada 1 o 2 metros.' },
  pepino: { nombre: 'Pepino', profBase: 2.0, metodo: 'Directa o almácigo', diasMin: 5, diasMax: 8, consejo: 'Sensible al frío: no sembrar hasta que pase el riesgo de heladas.' },
  espinaca: { nombre: 'Espinaca', profBase: 1.5, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Prefiere el fresco: con calor se espiga rápido.' },
  acelga: { nombre: 'Acelga', profBase: 2.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Cada semilla da 2 o 3 plantines: raleá dejando 15 cm entre plantas.' },
  rabanito: { nombre: 'Rabanito', profBase: 1.0, metodo: 'Siembra directa', diasMin: 3, diasMax: 5, consejo: 'El más rápido de la huerta: se cosecha a los 30 días.' },
  remolacha: { nombre: 'Remolacha', profBase: 2.0, metodo: 'Siembra directa', diasMin: 7, diasMax: 14, consejo: 'Cada fruto tiene varias semillas: raleá a los 10 días.' },
  cebolla: { nombre: 'Cebolla', profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 15, consejo: 'Trasplantá a los 60 días, cuando el tallo tenga grosor de lápiz.' },
  ajo: { nombre: 'Ajo', profBase: 4.0, metodo: 'Siembra directa (diente)', diasMin: 10, diasMax: 20, consejo: 'Enterrá el diente con la punta hacia arriba, en abril o mayo.' },
  perejil: { nombre: 'Perejil', profBase: 0.5, metodo: 'Siembra directa', diasMin: 15, diasMax: 30, consejo: 'El más lento: remojá las semillas 24 horas antes para acelerarlo.' },
  albahaca: { nombre: 'Albahaca', profBase: 0.5, metodo: 'Almácigo', diasMin: 7, diasMax: 14, consejo: 'Muy sensible al frío: no sembrar hasta que haya 15 °C sostenidos.' },
  rucula: { nombre: 'Rúcula', profBase: 0.5, metodo: 'Siembra directa', diasMin: 4, diasMax: 7, consejo: 'Germina rápido; cosechá las hojas externas y sigue produciendo.' },
  berenjena: { nombre: 'Berenjena', profBase: 1.0, metodo: 'Almácigo', diasMin: 10, diasMax: 20, consejo: 'Necesita mucho calor (25 a 30 °C): almácigo protegido.' },
};

/** Ajuste de la profundidad de siembra según el suelo. */
export const FACTOR_SUELO: Record<string, number> = { arenoso: 1.2, franco: 1.0, arcilloso: 0.8 };

/**
 * Germinación por temperatura del sustrato, en días [min, max].
 * Tres bandas: fría (menos de 18 °C), media (18 a 22 °C) y cálida (23 °C o más).
 */
export const GERMINACION: Record<string, { 15: [number, number]; 20: [number, number]; 25: [number, number] }> = {
  lechuga: { 15: [7, 10], 20: [5, 7], 25: [3, 5] },
  tomate: { 15: [14, 21], 20: [7, 10], 25: [5, 7] },
  zanahoria: { 15: [14, 21], 20: [10, 14], 25: [7, 10] },
  pimiento: { 15: [21, 30], 20: [14, 21], 25: [10, 14] },
  pepino: { 15: [10, 14], 20: [7, 10], 25: [4, 6] },
};

/**
 * Poda: ventana de meses (inclusive), cadencia en años y consejo por especie.
 * El rosal no lleva ventana fija: la define el clima de la zona (ver ROSAL).
 */
export interface Poda {
  nombre: string;
  desde: number;
  hasta: number;
  cadaAnios: number;
  cadencia: string;
  consejo: string;
}

export const PODA: Record<string, Poda> = {
  limonero: { nombre: 'Limonero y cítricos', desde: 2, hasta: 3, cadaAnios: 1, cadencia: 'Anual (poda ligera)', consejo: 'Sacá chupones, ramas secas y aclará el interior; no podes más del 20% de la copa.' },
  durazno: { nombre: 'Durazno', desde: 7, hasta: 8, cadaAnios: 1, cadencia: 'Anual', consejo: 'Poda en vaso abierto: eliminá las ramas que crecen hacia adentro.' },
  manzano: { nombre: 'Manzano', desde: 7, hasta: 8, cadaAnios: 1, cadencia: 'Anual', consejo: 'Poda de fructificación: acortá ramas del año dejando 4 o 5 yemas.' },
  peral: { nombre: 'Peral', desde: 7, hasta: 8, cadaAnios: 1, cadencia: 'Anual', consejo: 'Similar al manzano, pero el peral tolera menos poda.' },
  higuera: { nombre: 'Higuera', desde: 7, hasta: 8, cadaAnios: 1, cadencia: 'Anual', consejo: 'Aclará ramas viejas y chupones: la higuera rebrota muy fuerte.' },
  olivo: { nombre: 'Olivo', desde: 2, hasta: 3, cadaAnios: 2, cadencia: 'Cada 2 años', consejo: 'Aclareo interior, nunca poda drástica: fructifica en ramas de 2 años.' },
  vid: { nombre: 'Vid', desde: 7, hasta: 7, cadaAnios: 1, cadencia: 'Anual', consejo: 'Poda de producción: dejá 2 sarmientos de 6 a 8 yemas por brazo.' },
  rosal: { nombre: 'Rosal', desde: 6, hasta: 7, cadaAnios: 1, cadencia: 'Anual, más limpieza en temporada', consejo: 'Dejá 3 a 5 yemas por rama y cortá 1 cm arriba de una yema orientada hacia afuera.' },
  ornamental_caduco: { nombre: 'Ornamental de hoja caduca', desde: 6, hasta: 8, cadaAnios: 2.5, cadencia: 'Cada 2 o 3 años', consejo: 'Sólo mantenimiento: ramas secas, cruzadas y chupones.' },
  ornamental_perenne: { nombre: 'Ornamental de hoja perenne', desde: 3, hasta: 4, cadaAnios: 2.5, cadencia: 'Cada 2 o 3 años', consejo: 'Poda ligera de forma: los perennes no toleran podas drásticas.' },
};

/** Ventana de poda del rosal según el clima de la zona. */
export const ROSAL: Record<string, { desde: number; hasta: number; texto: string }> = {
  frio: { desde: 8, hasta: 9, texto: 'agosto y septiembre (fin del invierno)' },
  templado: { desde: 6, hasta: 7, texto: 'junio y julio (pleno invierno)' },
  calido: { desde: 5, hasta: 6, texto: 'mayo y junio (transición)' },
};

export const MESES = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Estación del hemisferio sur por mes. */
export const ESTACIONES = ['', 'verano', 'verano', 'otoño', 'otoño', 'otoño', 'invierno', 'invierno', 'invierno', 'primavera', 'primavera', 'primavera', 'verano'];
