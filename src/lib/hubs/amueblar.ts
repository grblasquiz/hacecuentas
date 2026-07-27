import type { HubData } from './types';

/**
 * Hub de decisión — "¿Qué medida de mueble entra en mi ambiente?"
 *
 * Arquetipo: RAMIFICADO (`cases`). Cinco ramas, una por ambiente:
 * living/TV, comedor, dormitorio/placard, escritorio y paredes/ventanas.
 *
 * SILO: va en /hogar, no en un silo /casa nuevo. /construccion es obra
 * (ladrillos, pintura, costo por m²) y /hogar es la casa andando. Amoblar y
 * medir muebles pertenece a /hogar, que además ya existe con index propio:
 * crear /casa habría abierto un silo de un solo hub compitiendo con los otros
 * dos por las mismas queries.
 *
 * DE DÓNDE SALEN LOS NÚMEROS (todos espejados de las fórmulas reales, ver
 * constantes de abajo — ninguna constante inventada):
 *  · TV:          src/lib/formulas/tamano-tv-distancia.ts       (ángulos THX/SMPTE)
 *  · m² y reparto src/lib/formulas/metros-cuadrados-habitacion.ts
 *                 src/lib/formulas/distribucion-muebles-m2.ts   (% libre por ambiente)
 *  · almohadones  src/lib/formulas/cantidad-almohadones-sofa.ts
 *  · mesa         src/lib/formulas/mesa-comedor-personas.ts
 *  · colchón      src/lib/formulas/tamano-colchon.ts
 *  · placard      src/lib/formulas/organizador-placard-espacios.ts
 *  · escritorio   src/lib/formulas/ergonomia-escritorio-medidas.ts
 *  · espejo       src/lib/formulas/espejo-tamano-pared.ts
 *  · cuadro       src/lib/formulas/cuadro-altura-colgar.ts
 *  · cortinas     src/lib/formulas/cortinas-medir-tela-ventana-anchotelaje.ts
 *  · empapelado   src/lib/formulas/calculadora-rollos-empapelado-papel-pared.ts
 */

/** Constantes espejadas de las fórmulas reales. No tocar sin tocar la fórmula. */
export const MEDIDAS = {
  /** tamano-tv-distancia.ts: ángulos de visión THX (40°) y SMPTE (30°). */
  tv: { min: 10.6, ideal: 17, max: 22, alturaCentro: 105 },
  /** distribucion-muebles-m2.ts — % del ambiente que conviene dejar LIBRE. */
  pctLibre: { living: 60, dormitorio: 55, comedor: 50, escritorio: 55 } as Record<string, number>,
  /** mesa-comedor-personas.ts — mesa rectangular. */
  mesa: { ancho: 90, cmPorComensal: 60, largoMin: 120, circulacion: 90 },
  /** organizador-placard-espacios.ts — reparto "mixto". */
  placard: { colgar: 0.45, estantes: 0.3, alturaBarra: 100, profundidad: 60 },
  /** ergonomia-escritorio-medidas.ts — factores sobre la estatura. */
  ergonomia: { silla: 0.25, escritorio: 0.16, monitor: 0.36, distMin: 0.32, distMax: 0.38 },
  /** espejo-tamano-pared.ts — uso decorativo. */
  espejo: { anchoPct: 0.5, altoRatio: 0.75, centroPct: 0.55 },
  /** cuadro-altura-colgar.ts — regla del museo, pared sola. */
  cuadro: { centro: 150, offsetClavo: 0.4 },
  /** cortinas-medir-tela-ventana-anchotelaje.ts — telaje 2×, cabecilla estándar. */
  cortina: { telaje: 2, sideSeam: 20, cabecilla: 8, dobladillo: 20, rollo: 140 },
  /** calculadora-rollos-empapelado-papel-pared.ts — rollo europeo estándar. */
  empapelado: { anchoRollo: 0.53, largoRollo: 10, descuentoAberturas: 10 },
};

export const hub: HubData = {
  slug: 'hogar/amueblar',
  title: '¿Qué medida de mueble entra en mi ambiente? — Calculadora de medidas',
  description:
    'Qué TV, mesa, colchón, placard, escritorio, cortina o espejo entra en tu ambiente sin que quede apretado. Medidas y altura de colgado a partir de los metros reales de tu casa.',
  silo: 'Hogar',
  siloHref: '/hogar',

  eyebrow: 'Guía de medidas para amueblar',
  h1: 'Antes de comprar el mueble: ¿entra?',
  lede:
    'Partimos del living, que es donde más se falla la medida. Cargá los metros de tu ambiente y te decimos qué tamaño de mueble corresponde y cuánto espacio te queda libre para circular. Si estás amoblando otro ambiente, cambialo abajo.',
  stamps: ['Medidas en cm y m²', 'Reglas THX/SMPTE y ergonomía', '14 calculadoras adentro'],

  resultLabel: 'Medida recomendada',

  cases: {
    title: '¿Qué ambiente estás amoblando?',
    intro: 'Partimos del living. Si estás midiendo otra cosa, cambialo: cambian las medidas y el porcentaje que conviene dejar libre.',
    items: [
      {
        id: 'living',
        label: 'Living: TV y sillón',
        hint: 'Pulgadas por distancia',
        answer: 'La TV se elige por la distancia al sillón, no por el precio.',
        yes: [
          'Pulgadas mínimas, ideales y máximas según la distancia del sillón (ángulos THX y SMPTE)',
          'Ancho y alto reales del televisor: la diagonal en pulgadas no te dice si entra en el mueble',
          'Cuántos m² podés ocupar con muebles y cuántos tenés que dejar libres para circular',
          'Cuántos almohadones pide tu sofá según su largo',
        ],
        warn: [
          'Resultado orientativo a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Medí la distancia desde el respaldo del sillón hasta la pared de la TV, no hasta el mueble',
          'El centro de la pantalla va a la altura de los ojos sentado (unos 105 cm del piso), no más arriba',
        ],
        plazo: 'dejá 90 cm de paso principal y 45 cm entre el sofá y la mesa ratona.',
      },
      {
        id: 'comedor',
        label: 'Comedor: la mesa',
        hint: '60 cm por comensal',
        answer: 'Cada comensal necesita 60 cm de mesa y 90 cm libres detrás.',
        yes: [
          'Largo y ancho de la mesa rectangular para la cantidad de comensales',
          'El espacio total que ocupa la mesa CON las sillas corridas',
          'Cuántos m² te quedan libres después de poner la mesa',
        ],
        warn: [
          'Resultado orientativo a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'El ancho estándar de 90 cm es el mínimo cómodo: con menos, los platos de enfrente se tocan',
          'Si esperás invitados seguido, sumá 3 comensales al número que cargás',
        ],
        plazo: 'dejá 75–90 cm libres entre la mesa y la pared para poder sentarse y levantarse.',
      },
      {
        id: 'dormitorio',
        label: 'Dormitorio: colchón y placard',
        hint: 'Estatura + 20 cm',
        answer: 'El colchón se elige por tu estatura más 20 cm, no por costumbre.',
        yes: [
          'Medida de colchón que te corresponde según la estatura del que duerme más alto',
          'Reparto del ancho del placard entre barra para colgar, estantes y cajones',
          'A qué altura va la barra de colgar',
          'Cuánto ocupa todo eso sobre los m² del cuarto',
        ],
        warn: [
          'Resultado orientativo a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si el largo estándar te deja menos de 5 cm de margen, buscá medida especial: vas a tocar la baranda con los pies',
          'El sommier suma unos centímetros al largo del colchón: medí el hueco con el sommier puesto',
        ],
        plazo: 'dejá 60 cm de paso alrededor de la cama y 90 cm frente al placard.',
      },
      {
        id: 'escritorio',
        label: 'Escritorio y silla',
        hint: 'Medidas por estatura',
        answer: 'La altura del escritorio sale de tu estatura, no del catálogo.',
        yes: [
          'Altura de la silla, del escritorio y del borde superior del monitor para tu estatura',
          'A qué distancia poner el monitor',
          'Cuántos m² podés ocupar en el ambiente sin trabar la circulación',
        ],
        warn: [
          'Resultado orientativo a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si el escritorio es fijo y queda alto, subí la silla y usá apoyapiés antes que trabajar con los hombros levantados',
          'Las medidas son antropométricas promedio: ajustá hasta tener los codos a 90° y los pies apoyados',
        ],
        plazo: 'dejá 120 cm de profundidad frente al escritorio para la silla más el paso.',
      },
      {
        id: 'paredes',
        label: 'Paredes y ventanas',
        hint: 'Cortina, espejo, cuadro, empapelado',
        answer: 'La cortina se calcula sobre el ancho por el telaje, no sobre la ventana.',
        yes: [
          'Metros de tela a comprar para la cortina, con telaje 2× y márgenes de costura',
          'Ancho y alto del espejo decorativo proporcional a tu pared, y a qué altura colgarlo',
          'Cuántos rollos de empapelado cubren el perímetro del ambiente',
          'A qué altura va el centro de un cuadro',
        ],
        warn: [
          'Resultado orientativo a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante.',
          'Si el papel tiene un patrón que repite, sumá 5–10% extra de rollos por el calce del dibujo',
          'El ancho de tela se mide sobre el barral, que va más ancho que la ventana: 20 cm de cada lado',
        ],
        plazo: 'el clavo del cuadro va a 150 cm más el 40% del alto del cuadro.',
      },
    ],
  },

  inputsTitle: 'Medí tu ambiente',
  inputsIntro: 'Con el largo, el ancho y el alto ya sale casi todo. Los demás campos se usan sólo en algunas ramas.',
  fields: [
    { id: 'largo', label: 'Largo del ambiente', type: 'number', suffix: 'm', min: 1, step: 0.1, value: 4.5 },
    { id: 'ancho', label: 'Ancho del ambiente', type: 'number', suffix: 'm', min: 1, step: 0.1, value: 3.2 },
    {
      id: 'alto',
      label: 'Alto de la pared (o caída de la cortina)',
      type: 'number',
      suffix: 'm',
      min: 1.5,
      step: 0.05,
      value: 2.6,
      help: 'Para el empapelado es el alto de pared. Para la cortina, medí desde el barral hasta donde querés que termine la tela.',
    },
    {
      id: 'distancia',
      label: 'Distancia del sillón a la TV',
      type: 'number',
      suffix: 'm',
      min: 0.5,
      step: 0.1,
      value: 2.8,
      help: 'Del respaldo del sillón a la pared donde va la pantalla.',
    },
    { id: 'personas', label: 'Comensales en la mesa', type: 'number', min: 2, max: 20, value: 6 },
    {
      id: 'estatura',
      label: 'Estatura de referencia',
      type: 'number',
      suffix: 'cm',
      min: 140,
      max: 220,
      value: 172,
      help: 'La del que duerme más alto (colchón) o la de quien usa el escritorio.',
    },
    {
      id: 'medida',
      label: 'Ancho del mueble o la ventana',
      type: 'number',
      suffix: 'cm',
      min: 40,
      value: 200,
      help: 'Largo del sofá en el living, ancho del placard en el dormitorio, ancho de la ventana en la rama de paredes.',
    },
  ],
  fineprint:
    'Resultado estimado a partir de los datos ingresados. Verificá los supuestos y la fuente indicada si lo usás para una decisión importante. Las medidas son estándares de mercado y reglas ergonómicas: antes de comprar, medí el hueco real con el mueble embalado.',

  chart: {
    type: 'donut',
    title: '¿Entra o queda apretado?',
    caption:
      'Cuántos m² del ambiente ocupa lo que estás por comprar y cuántos te quedan libres para circular. En la rama de paredes el reparto es sobre la superficie de pared, no sobre el piso.',
  },
  breakdownTitle: 'Las medidas, una por una',
  breakdownIntro: 'Las barras comparan cada medida con la mayor del listado. Fijate la unidad de cada fila.',

  faq: [
    {
      q: '¿De cuántas pulgadas tiene que ser la TV según la distancia?',
      a: 'La regla práctica es multiplicar la distancia en metros por 17 para el tamaño ideal. A 2,8 m del sillón, el punto dulce está en unas 48". Por debajo de la distancia × 10,6 la imagen se siente chica y por encima de la distancia × 22 vas a tener que mover la cabeza para abarcar la pantalla. Los factores salen de los ángulos de visión recomendados por THX (40°) y SMPTE (30°).',
    },
    {
      q: '¿Cuántos m² de muebles puedo poner sin que el ambiente quede cargado?',
      a: 'Depende del ambiente: en un living conviene dejar libre el 60% de la superficie, en un dormitorio o un escritorio el 55% y en un comedor el 50%. Ese porcentaje libre no es decoración: es la circulación. El paso principal pide 75–90 cm de ancho y los secundarios 60 cm.',
    },
    {
      q: '¿Qué medida de mesa necesito para 6, 8 o 10 personas?',
      a: 'Se cuentan 60 cm de borde por comensal y se reparten dos por lado en una mesa rectangular de 90 cm de ancho. Para 6 dan 180 cm de largo, para 8 dan 240 cm y para 10 dan 300 cm. Si esperás invitados seguido, sumá 3 comensales al cálculo antes de decidir.',
    },
    {
      q: '¿Qué colchón me corresponde según mi altura?',
      a: 'El largo mínimo es tu estatura más 20 cm. Hasta 190 cm de largo mínimo entrás en los colchones de 190; por encima necesitás los de 200. Si el estándar te deja menos de 5 cm de margen, conviene una medida especial extra-larga: con menos margen vas a tocar la baranda con los pies.',
    },
    {
      q: '¿Cómo se reparte el interior de un placard?',
      a: 'Para un uso mixto, un reparto que funciona es 45% del ancho para barra de colgar, 30% para estantes y el 25% restante para cajones. La barra va a unos 100 cm del piso en uso mixto, a 120 cm si colgás mucho traje o vestido largo y a 80 cm en un placard infantil. Los estantes cada 30 cm y los cajones de 15 a 20 cm de alto.',
    },
    {
      q: '¿A qué altura va el escritorio y el monitor?',
      a: 'Las medidas se derivan de tu estatura: la silla a un 25% de la estatura, el escritorio a la altura de la silla más un 16% de la estatura, y el borde superior del monitor a la altura de la silla más un 36%. La distancia al monitor es de un brazo, entre el 32% y el 38% de tu estatura. El chequeo final es siempre el mismo: codos a 90° y pies apoyados.',
    },
    {
      q: '¿A qué altura se cuelga un cuadro?',
      a: 'La regla del museo pone el centro del cuadro a 150 cm del piso, que es la altura de los ojos de pie. El clavo no va ahí: va a 150 cm más el 40% del alto del cuadro, porque el alambre se tensa cerca de la parte alta. Sobre un sofá el centro baja a unos 140 cm, sobre una cama a 135 y en un comedor a 130, porque ahí el cuadro se mira sentado.',
    },
    {
      q: '¿Qué tamaño de espejo va en mi pared?',
      a: 'Un espejo decorativo ocupa alrededor de la mitad del ancho de la pared o del mueble que tiene debajo, con un alto de tres cuartos de su ancho, y se cuelga con el centro a un 55% del alto de la pared. Un espejo de cuerpo entero es otra cosa: hasta 70 cm de ancho y 180 cm de alto, con el borde superior unos 15 cm por encima de tu cabeza.',
    },
    {
      q: '¿Cuánta tela necesito para una cortina?',
      a: 'El ancho de tela es el ancho de la ventana multiplicado por el telaje (2× para un fruncido normal, 2,5× o 3× para uno más generoso) más 20 cm de costuras laterales. El largo es la caída deseada más el margen de la cabecilla (8 cm en bolsillo estándar, 10 en cinta fruncidora, 12 en pliegues, 5 en ojalillos) más 20 cm de dobladillo doble. Con eso ya sabés cuántos paños cortar de un rollo de 140 cm.',
    },
    {
      q: '¿Cuántos rollos de empapelado entran en una habitación?',
      a: 'Se multiplica el perímetro por el alto de pared y se descuenta un 10% por puertas y ventanas. Cada rollo europeo estándar mide 0,53 m de ancho por 10 m de largo, o sea 5,3 m². La cantidad de rollos es esa superficie dividida 5,3, redondeada para arriba. Si el papel tiene un patrón que repite, sumá 5–10% más por el calce.',
    },
    {
      q: '¿Cuántos almohadones van en el sofá?',
      a: 'Primero contá los cuerpos: hasta 160 cm son 2, hasta 230 cm son 3 y más allá 4. En estilo minimalista va uno por cuerpo, en moderno los cuerpos más 2, en clásico los cuerpos más 3 y en ecléctico los cuerpos más 4. Los números impares quedan mejor a la vista y mezclar dos tamaños evita el efecto vidriera.',
    },
    {
      q: '¿Los metros cuadrados de un ambiente en L cómo se calculan?',
      a: 'Se parte la planta en rectángulos, se calcula largo por ancho de cada uno y se suman. Ese total es el que usás para cotizar piso, pintura o calefacción, y el que te dice cuántos m² podés ocupar con muebles. Para materiales, comprá siempre un 10% extra por cortes y desperdicio.',
    },
  ],

  sources: [
    {
      name: 'Recommended viewing distance and screen size (ángulo de visión 40°)',
      url: 'https://www.thx.com/',
      publisher: 'THX Ltd.',
    },
    {
      name: 'ST 2080-3 — Reference viewing environment and viewing distance',
      url: 'https://www.smpte.org/standards',
      publisher: 'SMPTE',
    },
    {
      name: 'Anthropometry and Biomechanics — Man-Systems Integration Standards (medidas de puesto sentado)',
      url: 'https://msis.jsc.nasa.gov/sections/section03.htm',
      publisher: 'NASA',
    },
    {
      name: 'Computer Workstations eTool — Monitores, silla y escritorio',
      url: 'https://www.osha.gov/etools/computer-workstations',
      publisher: 'OSHA — U.S. Department of Labor',
    },
    {
      name: 'Calculating fabric for curtains (telaje, cabecilla y dobladillos)',
      url: 'https://www.cotswoldsewingschool.co.uk/',
      publisher: 'Cotswold Sewing School',
    },
  ],

  replaces: [
    '/calculadora-tamano-tv-distancia-ideal-pulgadas',
    '/calculadora-metros-cuadrados-habitacion',
    '/calculadora-mesa-comedor-tamano-personas',
    '/calculadora-cortina-medida-ventana-tamano',
    '/calculadora-cuadro-altura-colgar-pared',
    '/calculadora-distribucion-muebles-porcentaje-libre',
    '/calculadora-ergonomia-escritorio-medidas',
    '/calculadora-espejo-tamano-pared-ideal',
    '/calculadora-organizador-placard-distribucion',
    '/calculadora-color-pared-combinacion-complementario',
    '/calculadora-cortinas-medir-tela-ventana-anchotelaje',
    '/calculadora-tamano-colchon-ideal-medidas',
    '/calculadora-rollos-empapelado-papel-pared',
    '/calculadora-almohadones-sofa-cantidad-decorativos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
