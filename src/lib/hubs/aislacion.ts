import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo aíslo la casa del frío y el calor?"
 *
 * Absorbe 8 calculadoras sueltas de envolvente. El eje técnico es la IRAM
 * 11605, que fija la resistencia térmica mínima de muros y techos según la zona
 * bioambiental de la IRAM 11603, y la IRAM 11601, de donde salen las
 * conductividades de cada material.
 *
 * LÍMITE CON EL HUB DE CLIMATIZACIÓN (`hogar/aire-calefaccion`): acá se resuelve
 * la ENVOLVENTE —qué material, qué espesor, cuántas placas, cuántos metros de
 * perfil, cuánta superficie vidriada—. El costo de climatizar el ambiente y la
 * factura de energía son de ese otro hub. Este calcula el costo del MATERIAL de
 * aislación, no el ahorro en la boleta.
 *
 * Arquetipo: RAMIFICADO por elemento de la envolvente: muro, techo y aberturas.
 */

/**
 * Resistencia térmica mínima requerida [m²·K/W] por zona bioambiental.
 * Espejo exacto de `src/lib/formulas/aislante-termico-pared-eps-lana-vidrio-recomendado.ts`
 * (IRAM 11605, tabla de muros). Nivel B = recomendado, Nivel C = mínimo.
 */
export const R_REQUERIDO: Record<string, { B: number; C: number }> = {
  I: { C: 0.55, B: 0.75 },
  II: { C: 0.8, B: 1.0 },
  III: { C: 1.0, B: 1.35 },
  IV: { C: 1.2, B: 1.6 },
  V: { C: 1.6, B: 2.1 },
  VI: { C: 2.0, B: 2.6 },
};

/** Conductividad térmica λ [W/(m·K)]. Valores de diseño de la fórmula original. */
export const LAMBDA: Record<string, number> = {
  eps: 0.038,
  lana_vidrio: 0.04,
  lana_mineral: 0.036,
  poliuretano: 0.026,
  corcho: 0.045,
};

/** Precio orientativo del material por m² y por cm de espesor, en pesos. */
export const PRECIO_POR_CM: Record<string, number> = {
  eps: 1800,
  lana_vidrio: 2100,
  lana_mineral: 2600,
  poliuretano: 4500,
  corcho: 3800,
};

export const NOMBRES_MATERIAL: Record<string, string> = {
  eps: 'EPS (poliestireno expandido)',
  lana_vidrio: 'lana de vidrio',
  lana_mineral: 'lana mineral de roca',
  poliuretano: 'poliuretano proyectado',
  corcho: 'corcho expandido',
};

/** Renovaciones de aire por hora según el ambiente. Espejo de `ventilacion-renovaciones-hora.ts`. */
export const RENOVACIONES: Record<string, number> = {
  cocina: 12,
  bano: 10,
  dormitorio: 3,
  oficina: 6,
  garaje: 8,
  comercio: 10,
};

/** Rendimientos del cielorraso de placa de yeso. Espejo de `yeso-cielorraso-placas-m2.ts`. */
export const CIELORRASO = {
  m2PorPlaca: 2.88, // placa de 1,20 × 2,40 m
  desperdicio: 10, // %
  perfilesMlPorM2: 3,
  tornillosPorM2: 15,
  masillaKgPorM2: 0.3,
  cintaMlPorM2: 1.5,
} as const;

/** Factor de iluminación natural: superficie vidriada mínima sobre superficie de piso. */
export const FACTOR_LUZ = 0.125; // 1/8 del piso, criterio habitual de los códigos de edificación

export const CASE_MATH: Record<string, { modo: 'muro' | 'techo' | 'aberturas' }> = {
  muro: { modo: 'muro' },
  techo: { modo: 'techo' },
  aberturas: { modo: 'aberturas' },
};

const DISCLAIMER =
  'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo.';

export const hub: HubData = {
  slug: 'construccion/aislacion',
  title: '¿Cómo aíslo la casa del frío y el calor? Espesor, materiales y norma IRAM',
  description:
    'Qué aislante poner y con cuánto espesor para cumplir la IRAM 11605 en tu zona bioambiental, cuántas placas, perfiles y tornillos lleva el cielorraso, y qué superficie vidriada y qué ventilación necesita cada ambiente. Con la resistencia térmica exigida por zona y el costo del material.',
  silo: 'Construcción',
  siloHref: '/construccion',

  eyebrow: 'Envolvente térmica y norma IRAM',
  h1: '¿Cómo aíslo la casa del frío y el calor?',
  lede:
    'La envolvente es todo lo que separa el adentro del afuera: muros, techo y aberturas. Acá sale el espesor de aislante que pide tu zona bioambiental según la IRAM 11605, con el material que elijas y su costo; los materiales completos de un cielorraso de placa de yeso; y la superficie vidriada y la ventilación mínima que necesita cada ambiente. Todo lo que se decide antes de comprar el equipo de frío-calor, porque una casa mal aislada no la salva ningún aire acondicionado.',
  stamps: [
    'Resistencia térmica por zona bioambiental',
    'Cinco materiales aislantes comparables',
    'Materiales de cielorraso y aberturas',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Tu envolvente',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Cada parte de la envolvente se resuelve distinto. Elegí por dónde estás entrando: los campos son los mismos, pero la cuenta y las advertencias cambian.',
    items: [
      {
        id: 'muro',
        label: 'Paredes que dan al exterior',
        hint: 'Qué aislante poner en el muro y con cuánto espesor.',
        yes: [
          DISCLAIMER,
          'La resistencia térmica mínima que exige tu zona bioambiental, en nivel recomendado y en nivel mínimo',
          'El espesor de aislante que hace falta con el material que elegiste, según su conductividad',
          'La transmitancia máxima admisible equivalente, el famoso valor K de la norma',
          'El costo del material aislante por metro cuadrado y para toda la superficie',
          'Cuánto cambia el espesor si pasás de EPS a lana de vidrio, a lana mineral, a poliuretano o a corcho',
        ],
        warn: [
          DISCLAIMER,
          'El espesor se calcula como si el aislante hiciera todo el trabajo, sin descontar la resistencia que aporta el muro existente ni las películas de aire. Queda del lado seguro, así que el resultado es un techo, no un piso.',
          'La zona bioambiental no es la provincia: la IRAM 11603 divide el país en seis zonas y una misma provincia puede tener dos o tres. Verificá la zona de tu localidad antes de cargar el dato.',
          'El aislante sólo rinde si es continuo. Cada viga, columna o encuentro sin aislar es un puente térmico por donde se escapa el calor y donde después aparece la condensación y el moho.',
          'La lana de vidrio y la lana mineral pierden casi toda su capacidad aislante si se mojan: necesitan barrera de vapor del lado caliente y ventilación de la cámara del lado frío.',
          'El EPS y el poliuretano son combustibles: en cerramientos hay que usar los que vienen con retardante de llama y respetar el revestimiento de protección que indique el fabricante.',
          'Los precios de material son orientativos y sin mano de obra: pedí presupuesto antes de decidir por costo.',
        ],
        plazo:
          'aislar por fuera del muro es siempre mejor que por dentro —no perdés metros y cortás los puentes térmicos—, pero se decide antes de revocar: si la fachada ya está terminada, la ventana de oportunidad es la próxima refacción.',
        answer:
          'El espesor de aislante sale de dividir la resistencia térmica que exige tu zona por la conductividad del material: cuanto más fría la zona y peor el material, más centímetros.',
      },
      {
        id: 'techo',
        label: 'Techo o cielorraso',
        hint: 'Aislante sobre el cielorraso más placas, perfiles y tornillos.',
        yes: [
          DISCLAIMER,
          'El espesor de aislante que corresponde a tu zona bioambiental y su costo',
          'Cuántas placas de yeso de 1,20 × 2,40 m entran en la superficie, con desperdicio incluido',
          'Los metros lineales de perfil de la estructura del cielorraso',
          'La cantidad de tornillos, la masilla y la cinta para tomar las juntas',
          'El costo del material aislante que va apoyado arriba de las placas',
        ],
        warn: [
          DISCLAIMER,
          'El espesor se calcula con la tabla de muros de la norma. La IRAM 11605 exige más al techo que a la pared, porque por arriba se escapa la mayor parte del calor: tomá este número como mínimo y, si podés, subilo.',
          'El aislante del cielorraso se apoya sobre las placas, del lado del entretecho, y nunca se comprime: si lo aplastás con el pie o con una tabla pierde el aire que es justamente lo que aísla.',
          'El entretecho tiene que quedar ventilado por encima del aislante. Un entretecho sellado con lana húmeda adentro es la receta del moho y de las manchas en las placas.',
          'Las cantidades de placas y perfiles suponen un cielorraso plano y regular. Con desniveles, buñas, gargantas de luz o pendientes el desperdicio sube bastante por encima del 10% previsto.',
          'La placa de yeso común no va en baños ni en cocinas expuestas: ahí corresponde la placa resistente a la humedad, y en cielorrasos bajo losa expuesta al fuego, la placa resistente al fuego.',
          'La estructura del cielorraso tiene que estar suspendida de la losa o del tirante, no apoyada en el aislante ni colgada de la instalación eléctrica.',
        ],
        plazo:
          'el aislante del techo es la intervención con mejor relación costo-beneficio de toda la casa y se puede hacer sin obra: si tenés que elegir una sola cosa para hacer este año, hacé el techo.',
        answer:
          'El cielorraso se resuelve en dos capas: la placa de yeso con su estructura, que se calcula por metro cuadrado, y el aislante apoyado encima, cuyo espesor lo fija la zona bioambiental.',
      },
      {
        id: 'aberturas',
        label: 'Ventanas y ventilación',
        hint: 'Cuánto vidrio necesita el ambiente y cuánto aire hay que renovar.',
        yes: [
          DISCLAIMER,
          'La superficie vidriada mínima que le corresponde al ambiente según su superficie de piso',
          'Cuántas ventanas de la medida que elijas hacen falta para llegar a esa superficie',
          'Qué superficie tiene que poder abrirse para ventilar, que es la mitad de la vidriada',
          'El espesor de vidrio recomendado para el paño y el peso que va a tener que soportar el marco',
          'Los metros lineales de perfil de aluminio y las barras de 6 metros que salen por ventana',
          'El caudal de aire que tiene que mover el extractor del ambiente, en metros cúbicos por hora',
        ],
        warn: [
          DISCLAIMER,
          'La superficie vidriada mínima se calcula con el criterio de un octavo del piso, que es el más difundido, pero cada municipio tiene su propio código de edificación: verificá el factor que rige en tu localidad.',
          'Más vidrio ilumina mejor pero aísla peor: la ventana es siempre el punto más débil de la envolvente. Pasado el mínimo, cada metro cuadrado extra de vidrio hay que compensarlo con doble vidriado hermético.',
          'El espesor de vidrio se calcula para una ventana en planta baja o piso bajo y sin exposición especial. En altura, en zona costera o en zona ventosa el espesor sube y el paño pasa a exigir vidrio templado.',
          'El vidrio templado no es opcional en paños grandes ni a baja altura: al romperse se fragmenta en gránulos en lugar de esquirlas y es lo que evita un corte grave.',
          'Los metros de perfil se calculan para una ventana corrediza de dos hojas con 10% de desperdicio. Un paño fijo, una abertura de abrir o un contramarco embutido en la mampostería cambian el total.',
          'La ventilación mecánica no reemplaza la ventilación natural en ambientes con artefactos a gas: ahí la ventilación permanente es obligatoria y la fija la normativa de gas, no este cálculo.',
        ],
        plazo:
          'el vidrio y el perfil se piden a medida y con plazo de fabricación: cerrá las medidas antes de mandar a hacer los vanos, porque corregir un vano ya construido cuesta más que la ventana.',
        answer:
          'El ambiente necesita como mínimo un octavo de su superficie de piso en vidrio y la mitad de eso en superficie que pueda abrirse para ventilar.',
      },
    ],
  },

  inputsTitle: 'Contame de tu obra',
  inputsIntro:
    'La zona, el material y la superficie mandan en los casos de muro y de techo. Las medidas del ambiente y de la ventana se usan en el caso de aberturas.',
  fields: [
    {
      id: 'zona',
      label: 'Zona bioambiental (IRAM 11603)',
      type: 'select',
      value: 'III',
      options: [
        { value: 'I', label: 'I — Muy cálida (norte de Salta, Formosa, Chaco)' },
        { value: 'II', label: 'II — Cálida (Santiago del Estero, norte de Santa Fe)' },
        { value: 'III', label: 'III — Templada cálida (Buenos Aires, Córdoba, Litoral)' },
        { value: 'IV', label: 'IV — Templada fría (Cuyo, sierras, oeste pampeano)' },
        { value: 'V', label: 'V — Fría (cordillera, meseta patagónica norte)' },
        { value: 'VI', label: 'VI — Muy fría (Patagonia sur y alta cordillera)' },
      ],
      help: 'Una misma provincia puede tener dos o tres zonas: fijate la de tu localidad, no la de la capital.',
    },
    {
      id: 'nivel',
      label: 'Nivel de exigencia de la norma',
      type: 'select',
      value: 'B',
      options: [
        { value: 'B', label: 'Nivel B — recomendado' },
        { value: 'C', label: 'Nivel C — mínimo aceptable' },
      ],
      help: 'El nivel C es el piso legal; el B es el que da confort real y factura baja.',
    },
    {
      id: 'material',
      label: 'Material aislante',
      type: 'select',
      value: 'eps',
      options: [
        { value: 'eps', label: 'EPS — poliestireno expandido' },
        { value: 'lana_vidrio', label: 'Lana de vidrio' },
        { value: 'lana_mineral', label: 'Lana mineral de roca' },
        { value: 'poliuretano', label: 'Poliuretano proyectado' },
        { value: 'corcho', label: 'Corcho expandido' },
      ],
    },
    {
      id: 'superficie',
      label: 'Superficie a aislar',
      type: 'number',
      suffix: 'm²',
      min: 0,
      max: 2000,
      step: 1,
      value: 40,
      thousands: false,
      help: 'Metros cuadrados de muro exterior o de cielorraso, según el caso que estés mirando.',
    },
    {
      id: 'largo',
      label: 'Largo del ambiente',
      type: 'number',
      suffix: 'm',
      min: 0,
      max: 60,
      step: 0.1,
      value: 4,
    },
    {
      id: 'ancho',
      label: 'Ancho del ambiente',
      type: 'number',
      suffix: 'm',
      min: 0,
      max: 60,
      step: 0.1,
      value: 3.5,
    },
    {
      id: 'alto',
      label: 'Altura del ambiente',
      type: 'number',
      suffix: 'm',
      min: 0,
      max: 12,
      step: 0.05,
      value: 2.6,
    },
    {
      id: 'ambiente',
      label: 'Qué ambiente es',
      type: 'select',
      value: 'dormitorio',
      options: [
        { value: 'dormitorio', label: 'Dormitorio o living' },
        { value: 'oficina', label: 'Oficina o estudio' },
        { value: 'garaje', label: 'Garaje o depósito' },
        { value: 'bano', label: 'Baño' },
        { value: 'comercio', label: 'Local comercial' },
        { value: 'cocina', label: 'Cocina' },
      ],
      help: 'Define cuántas veces por hora hay que renovar todo el aire del ambiente.',
    },
    {
      id: 'anchoVentana',
      label: 'Ancho de cada ventana',
      type: 'number',
      suffix: 'm',
      min: 0,
      max: 12,
      step: 0.05,
      value: 1.5,
    },
    {
      id: 'altoVentana',
      label: 'Alto de cada ventana',
      type: 'number',
      suffix: 'm',
      min: 0,
      max: 6,
      step: 0.05,
      value: 1.1,
    },
  ],
  fineprint:
    'Estimación de cantidades y materiales. Verificá rendimiento, desperdicio y aplicación con la ficha del fabricante o el profesional a cargo. Los espesores salen de la resistencia térmica exigida por la IRAM 11605 y de la conductividad de diseño de cada material, sin descontar el aporte del muro existente: quedan del lado seguro. Los precios de material son orientativos, no incluyen mano de obra ni fijaciones y varían mucho por región y por marca.',

  chart: {
    type: 'scale',
    title: 'Dónde caés contra la norma',
    caption:
      'La barra muestra las franjas de la norma y el marcador, tu resultado. En muros y techo, las franjas son la resistencia térmica: no cumple, nivel mínimo y nivel recomendado, y el marcador es la que alcanzás con el espesor calculado. En aberturas, las franjas son el porcentaje de superficie vidriada respecto del piso: por debajo del mínimo, en regla y sobrevidriado.',
  },
  breakdownTitle: 'La cuenta completa',
  breakdownIntro:
    'Qué exige la norma, qué espesor sale con el material que elegiste y cuánto material hay que comprar.',

  faq: [
    {
      q: '¿Qué espesor de aislante necesito según mi zona?',
      a: 'Sale de dividir la resistencia térmica que exige la norma por la conductividad del material. En zona III con nivel recomendado la norma pide 1,35 m²·K/W, y con EPS de conductividad 0,038 W/m·K eso da 5,2 cm. La misma zona con lana de vidrio pide 5,4 cm y con poliuretano, 3,6 cm: cuanto mejor aísla el material, menos centímetros hacen falta para el mismo resultado.',
    },
    {
      q: '¿Qué es la zona bioambiental y cómo sé cuál me toca?',
      a: 'Es la clasificación climática de la IRAM 11603, que divide la Argentina en seis zonas numeradas de la I, muy cálida, a la VI, muy fría, según temperatura y amplitud térmica. No coincide con los límites provinciales: Córdoba tiene zonas II, III y IV, y Buenos Aires es casi toda III con una franja IV al sur. Buscá tu localidad en el mapa de la norma, no tu provincia.',
    },
    {
      q: '¿Qué diferencia hay entre el nivel B y el nivel C de la IRAM 11605?',
      a: 'El nivel C es el mínimo aceptable, el piso que muchas normativas municipales toman como obligatorio. El nivel B es el recomendado y exige entre un 30% y un 40% más de resistencia térmica. Existe también un nivel A, de máxima exigencia. La diferencia de costo entre C y B suele ser de unos pocos centímetros de aislante, y la diferencia en confort y en consumo es enorme.',
    },
    {
      q: '¿Qué es el valor K y en qué se diferencia del valor R?',
      a: 'El valor R es la resistencia térmica: cuánto se opone el cerramiento al paso del calor, medida en m²·K/W, y cuanto más alto mejor. El valor K, o transmitancia, es exactamente lo inverso: cuánto calor pasa, en W/m²K, y cuanto más bajo mejor. Un muro con R de 1,35 tiene un K de 0,74. Las tablas de la norma se publican de las dos maneras y por eso conviene saber pasar de una a otra.',
    },
    {
      q: '¿Cuál es el mejor aislante térmico: EPS, lana de vidrio o poliuretano?',
      a: 'Por conductividad, el poliuretano es el mejor, con 0,026 W/m·K, y por eso necesita el menor espesor; le siguen la lana mineral con 0,036, el EPS con 0,038, la lana de vidrio con 0,040 y el corcho con 0,045. Pero el mejor para tu obra no es el de menor conductividad sino el que se pueda instalar bien en tu situación: la lana no tolera humedad, el poliuretano necesita equipo de proyección y el EPS es el más fácil de colocar por cuenta propia.',
    },
    {
      q: '¿Conviene aislar la pared por dentro o por fuera?',
      a: 'Por fuera, siempre que se pueda. Aislar por el exterior corta los puentes térmicos de vigas y columnas, deja la masa del muro del lado de adentro amortiguando las variaciones de temperatura y no te come metros cuadrados útiles. Aislar por dentro es más barato y se puede hacer ambiente por ambiente, pero deja los encuentros sin resolver y ahí aparece la condensación.',
    },
    {
      q: '¿Cuántas placas de yeso lleva un cielorraso?',
      a: 'Cada placa de 1,20 × 2,40 m cubre 2,88 m², así que la cuenta es la superficie dividida 2,88 y redondeada para arriba, más un 10% de desperdicio por cortes. Un cielorraso de 20 m² necesita 8 placas. Sumale unos 3 metros lineales de perfil por metro cuadrado, 15 tornillos por metro cuadrado, 0,3 kg de masilla y 1,5 metros de cinta para tomar las juntas.',
    },
    {
      q: '¿Cuántos tornillos por metro cuadrado lleva una placa de durlock?',
      a: 'En un cielorraso son unos 15 por metro cuadrado, porque la placa se atornilla sólo a los perfiles de la estructura suspendida. En un tabique vertical de una capa con perfiles cada 25 cm la densidad sube a unos 28 por metro cuadrado, y con doble placa se duplica. Comprá siempre una caja de 1.000 de más: entre las roscas que se pasan y las cabezas que perforan el cartón se pierde un porcentaje fijo.',
    },
    {
      q: '¿Qué superficie de ventana necesita una habitación?',
      a: 'El criterio más difundido en los códigos de edificación es un octavo de la superficie del piso en superficie vidriada, y la mitad de eso en superficie que pueda abrirse para ventilar. Un dormitorio de 14 m² necesita entonces 1,75 m² de vidrio y 0,88 m² de abertura practicable, lo que se resuelve con una ventana de 1,50 × 1,10 m.',
    },
    {
      q: '¿Qué espesor de vidrio va en una ventana?',
      a: 'Depende de la superficie del paño. Hasta medio metro cuadrado alcanza con 3 mm; hasta 1 m², 4 mm; hasta 2 m², 5 mm; de 2 a 3 m² se pasa a 6 mm templado; de 3 a 5 m², 8 mm templado, y por encima de 5 m², 10 mm templado. En altura, en zona costera o en zona ventosa el espesor sube y conviene consultar al vidriero. El peso ronda los 2,5 kg por metro cuadrado y por milímetro de espesor.',
    },
    {
      q: '¿Cuántas renovaciones de aire por hora necesita un ambiente?',
      a: 'Depende del uso: una cocina necesita renovar todo su aire 12 veces por hora, un baño 10, un local comercial 10, un garaje 8, una oficina 6 y un dormitorio 3. El caudal del extractor sale de multiplicar el volumen del ambiente por esas renovaciones: una cocina de 12 m³ necesita mover 144 m³ por hora.',
    },
    {
      q: '¿Aislar bien la casa baja la factura de luz y gas?',
      a: 'Sí, y es la única inversión que sigue rindiendo sin hacer nada. Cuanto más baja la transmitancia de la envolvente, menos energía hace falta para sostener la misma temperatura adentro, y el equipo de frío-calor arranca menos veces y trabaja menos tiempo. Cuánto se ahorra en pesos depende del clima, del tamaño de la casa y de la tarifa: eso se estima con un cálculo de consumo, no con este.',
    },
    {
      q: '¿Qué es un puente térmico y por qué importa tanto?',
      a: 'Es un punto de la envolvente donde el aislante se interrumpe: una columna, una viga, el encuentro de un muro con la losa, el marco de una ventana. Por ahí se escapa calor mucho más rápido que por el resto del cerramiento y, como la superficie interior queda más fría, ahí es donde condensa el vapor y aparecen las manchas negras de moho. Un muro perfectamente aislado con las columnas al desnudo puede perder gran parte de la mejora.',
    },
  ],

  sources: [
    {
      name: 'IRAM 11603 — Clasificación bioambiental de la República Argentina',
      url: 'https://catalogo.iram.org.ar/#/normas/detalle/e11f6b98-6f4c-4a4d-b8c1-11603',
      publisher: 'IRAM — Instituto Argentino de Normalización y Certificación',
    },
    {
      name: 'IRAM 11605 — Acondicionamiento térmico de edificios: valores máximos de transmitancia térmica en cerramientos opacos',
      url: 'https://catalogo.iram.org.ar/#/normas/detalle/e11f6b98-6f4c-4a4d-b8c1-11605',
      publisher: 'IRAM — Instituto Argentino de Normalización y Certificación',
    },
    {
      name: 'IRAM 11601 — Métodos de cálculo de propiedades térmicas y conductividad de materiales de construcción',
      url: 'https://catalogo.iram.org.ar/#/normas/detalle/e11f6b98-6f4c-4a4d-b8c1-11601',
      publisher: 'IRAM — Instituto Argentino de Normalización y Certificación',
    },
    {
      name: 'Etiquetado de eficiencia energética de viviendas: envolvente, transmitancia y zonas bioambientales',
      url: 'https://www.argentina.gob.ar/energia/energia-electrica/etiquetado-de-viviendas',
      publisher: 'Secretaría de Energía de la Nación',
    },
    {
      name: 'Guía de construcción en seco: cielorrasos y tabiques de placa de yeso',
      url: 'https://www.knauf.com.ar/soluciones/',
      publisher: 'Knauf Argentina',
    },
    {
      name: 'Vidrio en la construcción: espesores, templado y seguridad de los paños',
      url: 'https://www.vasa.com.ar/',
      publisher: 'VASA — Vidriería Argentina',
    },
  ],

  replaces: [
    '/calculadora-ventilacion-renovaciones-aire-hora',
    '/calculadora-espesor-vidrio-ventana-m2',
    '/calculadora-yeso-cielorraso-placas-m2',
    '/calculadora-tornillos-durlock-placa-yeso-m2',
    '/calculadora-aislacion-termica-k-minimo-zona',
    '/calculadora-aislante-termico-pared-eps-lana-vidrio-recomendado',
    '/calculadora-cantidad-ventanas-luz-natural-m2',
    '/calculadora-perfil-aluminio-metros-lineales-ventana',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
