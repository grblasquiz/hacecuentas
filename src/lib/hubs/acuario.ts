import type { HubData } from './types';

/**
 * Hub de decisión — "¿De cuántos litros tiene que ser mi acuario?"
 *
 * Arquetipo RAMIFICADO: la cuenta cambia por completo entre un comunitario de
 * peces (litros por centímetro de pez), un betta (mínimos fijos por sexo y
 * convivencia) y una tortuga acuática (litros por el cuadrado del caparazón,
 * más filtro, zona seca y UVB). Absorbe 6 URLs (ver hub.replaces).
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format:'unit'` (litros) y CADA
 *    fila declara el suyo (litros, watts, °C, cm, cm², L/h). Una fila sin
 *    `format` cae a "$" y la página miente.
 *  - `chart.type: 'scale'`: las franjas viajan con `from`/`to` en litros y el
 *    volumen calculado en `position` + `positionLabel`.
 */
export const hub: HubData = {
  slug: 'mascotas/acuario',
  title: '¿De cuántos litros tiene que ser mi acuario? Litros, filtro, temperatura y UVB',
  description:
    'Calculá los litros que necesitás según cantidad y tamaño de peces, el mínimo real de un betta y el acuario de una tortuga acuática con su filtro, su zona seca y su lámpara UVB. Más temperatura ideal y watts de calefactor por especie.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿De cuántos litros tiene que ser mi acuario?',
  lede:
    'El error más caro del acuarismo es comprar la pecera antes que los peces. El volumen no se elige por lo que entra en el mueble: sale de cuántos centímetros de pez adulto vas a tener adentro, y en tortugas del cuadrado del largo del caparazón. Elegí qué vas a poner y salen los litros mínimos, el tamaño que conviene comprar, la temperatura, el calefactor y —si es tortuga— el filtro, la zona seca y el UVB.',
  stamps: ['Actualizado 27-07-2026', 'Regla de 1 L por cm de pez adulto + filtración 4-5× volumen/hora', '6 calculadoras adentro'],

  resultLabel: 'Los litros que necesitás',

  cases: {
    title: 'Peces de comunitario',
    intro: 'Tres cuentas distintas: por centímetros de pez, por mínimos del betta o por caparazón de tortuga.',
    items: [
      {
        id: 'peces',
        label: 'Peces de comunitario',
        hint: 'Un litro por centímetro de pez adulto, más margen.',
        yes: [
          'Litros mínimos: 1 litro por cada centímetro de pez ADULTO, no del que comprás hoy',
          'Un 20% extra si es acuario tropical, por la carga biológica de la temperatura',
          'El tamaño comercial que conviene comprar, siempre uno por encima del mínimo',
          'Temperatura ideal y watts del calefactor según la especie y el ambiente de tu casa',
          'Tomas de comida por día y la regla de lo que se come en dos minutos',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'La regla de 1 L por cm es un PISO, no un objetivo: más volumen diluye mejor el amoníaco y estabiliza la temperatura',
          'Un acuario nuevo necesita ciclado biológico de 3 a 6 semanas antes de meter peces: si no, el amoníaco los mata',
          'Calculá con el tamaño adulto: el pez limpiafondos de 4 cm de la tienda llega a 30 y termina en un balde',
        ],
        plazo: 'cambio parcial de agua del 20 al 25% por semana, con acondicionador de cloro.',
        answer: 'Diez peces pequeños de unos 4 cm necesitan como mínimo 48 litros en agua tropical, y conviene un acuario de 60 a 80.',
      },
      {
        id: 'betta',
        label: 'Betta',
        hint: 'Nada de recipientes chicos: mínimos fijos, con calefactor.',
        yes: [
          'Macho solo: mínimo 10 litros, ideal 20',
          'Hembra sola: mínimo 10 litros, ideal 15',
          'Sorority de hembras: desde 5 hembras, 40 litros de mínimo y 60 de ideal, sumando 5 y 8 litros por cada hembra extra',
          'Con compañeros de otras especies: nunca menos de 40 litros, ideal 70',
          'Temperatura de 25 a 27 °C constante, con calefactor con termostato',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Dos machos no conviven bajo ningún esquema: pelean hasta matarse. Necesitan peceras separadas',
          'El betta sin calefactor enferma: por debajo de 22 °C el sistema inmune se le cae',
          'Necesita tapa: saltan, y el salto suele ser el final',
          'La corriente fuerte los agota: filtro de esponja o cascada suave, nunca un cañón',
        ],
        plazo: 'cambios de agua del 25 al 30% por semana, siempre con acondicionador.',
        answer: 'Un betta macho solo necesita 10 litros como mínimo y 20 como volumen ideal, con calefactor a 25-27 °C, filtro suave y tapa.',
      },
      {
        id: 'tortuga',
        label: 'Tortuga acuática',
        hint: 'Los litros salen del cuadrado del caparazón y crecen mucho.',
        yes: [
          'Litros mínimos: largo del caparazón al cuadrado por el factor de la especie, con un piso absoluto de 80 litros',
          'Cada tortuga adicional suma un 50% del volumen base',
          'Filtración de 4 a 5 veces el volumen por hora: las tortugas ensucian muchísimo más que los peces',
          'Largo mínimo del acuario: 5 veces el caparazón, nunca menos de 60 cm',
          'Zona seca de asoleo: 1,5 veces el área del caparazón, con basking de 32 a 38 °C',
          'Lámpara UVB según el volumen y la altura a la que la colgás',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Comprá pensando en el tamaño adulto: una Trachemys hembra llega a 30 cm de caparazón y necesita cientos de litros',
          'Sin UVB no fija el calcio y aparece enfermedad metabólica ósea: caparazón blando y deformado, irreversible',
          'La lámpara UVB pierde radiación aunque siga encendiendo: se cambia cada 6 a 12 meses según el tipo',
          'La Trachemys scripta está listada como especie exótica invasora en muchos países: nunca se libera en un cuerpo de agua natural',
        ],
        plazo: 'el tubo UVB se reemplaza cada 6 meses si es compacto, cada 9 si es T8 y cada 12 si es T5 o de mercurio.',
        answer: 'Una Trachemys de 12 cm de caparazón necesita al menos 108 litros, filtro de 432 a 540 L/h y una zona seca de unos 162 cm² con UVB de 24 W.',
      },
    ],
  },

  inputsTitle: 'Qué vas a poner adentro',
  inputsIntro:
    'La cantidad y el tamaño mandan. La temperatura ambiente de tu casa define la potencia del calefactor, y en tortugas el largo del caparazón define todo lo demás.',
  fields: [
    {
      id: 'cantidad',
      label: 'Cantidad de animales',
      type: 'number',
      suffix: 'ejemplares',
      min: 1,
      max: 60,
      step: 1,
      value: 10,
      help: 'Peces del comunitario, bettas de la sorority o tortugas, según el caso que elijas.',
    },
    {
      id: 'tamanoPez',
      label: 'Tamaño adulto de los peces',
      type: 'select',
      value: 'pequeno',
      options: [
        { value: 'pequeno', label: 'Pequeños — unos 4 cm (neón, guppy, rasbora)' },
        { value: 'mediano', label: 'Medianos — unos 8 cm (platy, corydora, tetra grande)' },
        { value: 'grande', label: 'Grandes — unos 18 cm (escalar, gourami, cíclido)' },
      ],
      help: 'Es el tamaño de ADULTO, no el que tiene en la tienda. Ahí está el 90% de los errores.',
    },
    {
      id: 'especie',
      label: 'Especie o tipo de agua',
      type: 'select',
      value: 'tropical-comunitario',
      options: [
        { value: 'tropical-comunitario', label: 'Tropical comunitario — 24 a 26 °C' },
        { value: 'betta', label: 'Betta — 25 a 27 °C' },
        { value: 'disco', label: 'Disco — 28 a 30 °C' },
        { value: 'angel', label: 'Escalar / ángel — 25 a 28 °C' },
        { value: 'amazonicos', label: 'Amazónicos — 26 a 29 °C' },
        { value: 'ciclidos-africanos', label: 'Cíclidos africanos — 24 a 28 °C' },
        { value: 'killifish', label: 'Killifish — 22 a 26 °C' },
        { value: 'goldfish', label: 'Goldfish / carassius — 18 a 22 °C' },
        { value: 'agua-fria', label: 'Agua fría en general — 14 a 22 °C' },
      ],
      help: 'Define el rango de temperatura y si hace falta calefactor. En agua fría el problema del verano es enfriar, no calentar.',
    },
    {
      id: 'tempAmbiente',
      label: 'Temperatura de la habitación en invierno',
      type: 'number',
      suffix: '°C',
      min: 5,
      max: 32,
      step: 1,
      value: 18,
      help: 'Cuanto más frío el ambiente, más watts de calefactor por litro: de 1 W/L con 23 °C a 2,5 W/L con 14 °C o menos.',
    },
    {
      id: 'caparazon',
      label: 'Largo del caparazón de la tortuga',
      type: 'number',
      suffix: 'cm',
      min: 2,
      max: 45,
      step: 0.5,
      value: 12,
      help: 'Medido en línea recta de adelante hacia atrás, no siguiendo la curva.',
    },
    {
      id: 'sexo',
      label: 'Sexo de la tortuga',
      type: 'select',
      value: 'desconocido',
      options: [
        { value: 'desconocido', label: 'No lo sé todavía' },
        { value: 'macho', label: 'Macho' },
        { value: 'hembra', label: 'Hembra' },
      ],
      help: 'Las hembras llegan bastante más grandes: en Trachemys scripta, 30 cm contra 20.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. Los mínimos que ves son de bienestar, no de supervivencia: un animal puede sobrevivir en menos volumen y aun así vivir mal y menos. Antes de meter cualquier animal, el acuario tiene que estar ciclado biológicamente, con la colonia de bacterias establecida y amoníaco y nitritos en cero.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu acuario',
    caption:
      'La barra muestra la escala de volumen: en rojo el terreno por debajo del mínimo biológico, en amarillo la zona del mínimo justo y en verde el volumen holgado, que es el que conviene comprar. El marcador es el mínimo que arrojó tu cálculo.',
    bands: [
      { label: 'Por debajo del mínimo', from: 0, to: 33, tone: 'bad' },
      { label: 'Mínimo justo', from: 33, to: 66, tone: 'warn' },
      { label: 'Volumen holgado', from: 66, to: 100, tone: 'good' },
    ],
  },
  breakdownTitle: 'El acuario, número por número',
  breakdownIntro:
    'Litros, watts, grados, centímetros y litros por hora: acá no hay dinero. Las barras comparan cada valor contra el mayor.',

  faq: [
    {
      q: '¿Cuántos litros necesito por pez?',
      a: 'La regla de referencia es un litro por cada centímetro de pez adulto, más un 20% si es acuario tropical. Diez peces pequeños de unos 4 cm dan 40 cm de pez, o sea 48 litros en tropical. Es un piso, no un objetivo: conviene ir al tamaño comercial siguiente, porque más agua diluye mejor el amoníaco y mantiene la temperatura estable. Y siempre se calcula con el tamaño adulto, no con el que tiene el pez el día que lo comprás.',
    },
    {
      q: '¿Cuántos litros necesita un betta?',
      a: 'Un macho solo necesita 10 litros como mínimo y 20 como volumen ideal; una hembra sola, 10 y 15. Un grupo de hembras —sorority, mínimo cinco— arranca en 40 litros de mínimo y 60 de ideal, sumando 5 y 8 litros por cada hembra adicional. Y si va con peces de otras especies, nunca menos de 40 litros, con 70 como ideal. Los recipientes chicos que se venden como "peceras para betta" no alcanzan.',
    },
    {
      q: '¿Dos bettas machos pueden vivir juntos?',
      a: 'No, en ningún volumen ni con ninguna decoración. Los machos son territoriales hasta la muerte: pelean, se destrozan las aletas y el más débil termina muerto o con infecciones. Si tenés dos machos, necesitás dos peceras separadas, y con separador visual si están cerca, porque incluso verse a través del vidrio los mantiene en estrés constante.',
    },
    {
      q: '¿Qué potencia de calefactor necesito?',
      a: 'Depende de la diferencia entre el agua y el ambiente. Con una habitación a 23 °C o más alcanza con 1 W por litro; entre 19 y 22 °C hacen falta 1,5 W/L; entre 15 y 18 °C, 2 W/L; y con 14 °C o menos, 2,5 W/L. Un acuario de 100 litros en una habitación a 18 °C necesita unos 200 W. Siempre con termostato, y controlando con un termómetro aparte, porque los termostatos integrados se desvían con el tiempo.',
    },
    {
      q: '¿Cuál es la temperatura ideal del acuario?',
      a: 'Según la especie: tropical comunitario 24 a 26 °C, betta 25 a 27, escalares 25 a 28, cíclidos africanos 24 a 28, amazónicos 26 a 29, discos 28 a 30, killifish 22 a 26, goldfish 18 a 22 y agua fría en general 14 a 22. Lo que más daña no es estar un grado arriba o abajo sino la oscilación: la estabilidad importa más que el número exacto.',
    },
    {
      q: '¿Qué acuario necesita una tortuga acuática?',
      a: 'Los litros salen del largo del caparazón al cuadrado multiplicado por el factor de la especie —0,75 en Trachemys scripta, 0,65 en dorbignyi, 0,85 en Pseudemys—, con un piso absoluto de 80 litros y un 50% extra por cada tortuga adicional. Una Trachemys de 12 cm necesita unos 108 litros. Además, largo mínimo de acuario de cinco veces el caparazón y nunca menos de 60 cm, y una zona seca de asoleo de una vez y media el área del caparazón.',
    },
    {
      q: '¿Qué filtro necesita una tortuga?',
      a: 'Uno de 4 a 5 veces el volumen del acuario por hora, bastante más de lo que se usa con peces. Las tortugas comen proteína, defecan mucho y ensucian el agua a una velocidad que un filtro dimensionado para peces no aguanta. Para 100 litros hacen falta 400 a 500 L/h. Aun así, el cambio parcial de agua semanal sigue siendo obligatorio, y darles de comer en un recipiente aparte ayuda muchísimo.',
    },
    {
      q: '¿Cuántos watts de UVB necesita mi tortuga?',
      a: 'Por volumen, la referencia es 13 W por debajo de 100 litros, 24 W hasta 200, 36 W hasta 400 y 54 W por encima. Por tamaño del animal y altura de la lámpara: 13 W en caparazones de menos de 8 cm, 26 W hasta 15, 40 W hasta 25 y 55 W por encima, aumentando un 40% si la lámpara está a más de 30 cm de la zona de asoleo. El objetivo es un índice UVI de 2,5 a 4 sobre la zona seca.',
    },
    {
      q: '¿Cada cuánto se cambia la lámpara UVB?',
      a: 'La compacta cada 6 meses, la T8 cada 9, y la T5 o la de vapor de mercurio cada 12. La clave es que la radiación UVB decae mucho antes que la luz visible: la lámpara sigue encendiendo y alumbrando igual, pero ya no emite el UVB necesario. Por eso el reemplazo va por calendario y no por si prende, y anotar la fecha de instalación en el propio tubo es la forma más simple de no olvidarse.',
    },
    {
      q: '¿Cuánto le doy de comer a los peces?',
      a: 'La regla práctica es lo que consuman en dos minutos, una o dos veces por día, retirando lo que sobre. En acuarios sanos conviene además un día de ayuno por semana, que mejora la digestión y baja la carga de nitratos. Sobrealimentar es el error más común y el más caro: la comida en descomposición dispara amoníaco y nitritos, que es lo que en la práctica mata a los peces de un acuario nuevo.',
    },
    {
      q: '¿Qué es el ciclado y por qué tengo que esperar?',
      a: 'Es el proceso por el cual se establecen en el filtro las bacterias que convierten el amoníaco —tóxico— en nitrito —también tóxico— y después en nitrato, que es tolerable y se saca con los cambios de agua. Tarda entre 3 y 6 semanas y se sigue con test de agua hasta que amoníaco y nitritos den cero. Meter peces antes es la causa número uno de mortandad en acuarios recién armados, el famoso "síndrome del acuario nuevo".',
    },
    {
      q: '¿Cada cuánto cambio el agua?',
      a: 'Un cambio parcial del 20 al 25% por semana es la referencia para un comunitario, y del 25 al 30% en volúmenes chicos como el de un betta. Nunca se cambia el agua entera ni se lava el material filtrante con agua de la canilla: ahí vive la colonia bacteriana y el cloro la mata, con lo cual el acuario se descicla y vuelve a cero. El material del filtro se enjuaga en el agua que sacaste del acuario.',
    },
  ],

  sources: [
    {
      name: 'Practical Fishkeeping — Stocking levels and the cm-per-litre rule',
      url: 'https://www.practicalfishkeeping.co.uk/features/how-many-fish-can-i-keep/',
      publisher: 'Practical Fishkeeping',
    },
    {
      name: 'Tortoise Trust — Housing and lighting for aquatic turtles',
      url: 'https://www.tortoisetrust.org/articles/uvb.html',
      publisher: 'The Tortoise Trust',
    },
    {
      name: 'Baines F. et al. — How much UV-B does my reptile need? The UV-Tool y el sistema de zonas de Ferguson',
      url: 'https://www.reptilesandresearch.co.uk/uv-guide',
      publisher: 'Journal of Zoo and Aquarium Research',
    },
    {
      name: 'Melissa Kaplan’s Herp Care Collection — Red-eared slider care',
      url: 'https://www.anapsid.org/reslider.html',
      publisher: 'Herp Care Collection',
    },
    {
      name: 'IUCN Invasive Species Specialist Group — Trachemys scripta elegans',
      url: 'http://www.iucngisd.org/gisd/species.php?sc=71',
      publisher: 'IUCN / GISD',
    },
    {
      name: 'RSPCA — Caring for your fish: tank size, cycling and water changes',
      url: 'https://www.rspca.org.uk/adviceandwelfare/pets/fish',
      publisher: 'RSPCA',
    },
  ],

  replaces: [
    '/calculadora-litros-pecera-acuario-cantidad-peces',
    '/calculadora-agua-pez-betta-litros',
    '/calculadora-temperatura-acuario-especie',
    '/calculadora-tortuga-acuatica-tamano-acuario-filtro-litros',
    '/calculadora-tortuga-acuatica-uvb-watts-pecera',
    '/calculadora-alimento-acuario-por-pez',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Centímetros de adulto por categoría de pez, calcados de `tamano-pecera.ts`. */
export const CM_POR_PEZ: Record<string, number> = { pequeno: 4, mediano: 8, grande: 18 };

/** Tamaños comerciales estándar de acuario, en litros. */
export const ESTANDARES = [10, 20, 30, 40, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];

/**
 * Rango de temperatura por especie, calcado de `temperatura-acuario-especie.ts`.
 */
export const TEMPERATURAS: Record<string, { min: number; max: number }> = {
  'tropical-comunitario': { min: 24, max: 26 },
  betta: { min: 25, max: 27 },
  disco: { min: 28, max: 30 },
  angel: { min: 25, max: 28 },
  goldfish: { min: 18, max: 22 },
  'ciclidos-africanos': { min: 24, max: 28 },
  amazonicos: { min: 26, max: 29 },
  killifish: { min: 22, max: 26 },
  'agua-fria': { min: 14, max: 22 },
};

/**
 * Especies de tortuga acuática con su factor de volumen y su tamaño adulto por
 * sexo, calcados de `tortuga-acuatica-tamano-acuario-filtro-litros.ts`.
 * El compute usa Trachemys scripta como referencia por ser la más común.
 */
export const TORTUGAS = {
  factorVolumen: 0.75,
  adultoHembra: 30,
  adultoMacho: 20,
  /** Piso absoluto de litros por tortuga. */
  minimoLitros: 80,
  /** Cada tortuga adicional suma este porcentaje del volumen base. */
  extraPorTortuga: 0.5,
  /** Filtración: veces el volumen por hora. */
  caudalMin: 4,
  caudalMax: 5,
  /** Largo mínimo del acuario: veces el caparazón, con piso de 60 cm. */
  largoFactor: 5,
  largoMinimo: 60,
  /** Zona seca: 1,5 × área estimada del caparazón (ancho ≈ largo × 0,75). */
  areaSecaFactor: 1.5,
  ratioAncho: 0.75,
};

/** Mínimos del betta, calcados de `agua-pez-betta-litros.ts`. */
export const BETTA = {
  machoMin: 10,
  machoIdeal: 20,
  hembraMin: 10,
  hembraIdeal: 15,
  sororityMin: 40,
  sororityIdeal: 60,
  sororityBase: 5,
  sororityPorExtraMin: 5,
  sororityPorExtraIdeal: 8,
};
