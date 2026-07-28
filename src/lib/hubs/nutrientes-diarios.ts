import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto de este nutriente necesito por día?"
 * Arquetipo RAMIFICADO: la rama es EL NUTRIENTE. Cada uno tiene su tabla de
 * referencia y su unidad, pero la pregunta del usuario es siempre la misma.
 *
 * Absorbe 9 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs del silo /salud — no se pisan:
 *   · /salud/proteina             → gramos de proteína (macronutriente, otro eje)
 *   · /salud/macros               → cómo repartir las CALORÍAS en P/C/G
 *   · /nutricion/calorias-diarias → cuánta energía total comer
 *   · /salud/habitos              → alcohol, minutos de sol, pantallas, pasos
 *   Este responde por micronutrientes y topes: calcio, hierro, magnesio, fibra,
 *   vitamina D, sodio, azúcar y cafeína. Ninguno de los otros los calcula.
 *
 * Hay dos clases de rama y el signo importa:
 *   · META  (calcio, hierro, magnesio, fibra, vitamina D): número a ALCANZAR,
 *     con un límite superior tolerable (UL) que no conviene pasar.
 *   · TOPE  (sodio, azúcar añadido, cafeína): número a NO PASAR.
 *
 * YMYL DE SALUD: como el hub habla de dosis y suplementos, el aviso textual del
 * dominio `medical-dose` de src/lib/disclaimers.ts va en `fineprint` y como
 * PRIMER `warn` de cada rama, más el aviso `health` donde corresponde.
 *
 * NOTAS DE CONTRATO: acá no hay plata. TODA fila lleva `format` explícito.
 */

export const DISCLAIMER_DOSIS =
  'Las dosis son referencias generales, no una indicación médica ni una receta. No te automediques ni modifiques una pauta profesional; consultá con un médico o farmacéutico.';

export const hub: HubData = {
  slug: 'salud/nutrientes-diarios',
  title: '¿Cuánto necesito por día? Calcio, hierro, magnesio, fibra, vitamina D, sodio, azúcar y cafeína',
  description:
    'Tu cantidad diaria recomendada de calcio, hierro, magnesio, fibra y vitamina D según edad, sexo, embarazo o lactancia — y tus topes de sodio, azúcar añadido y cafeína. Con el límite superior tolerable de cada uno y equivalencias en comida real.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación nutricional',
  h1: '¿Cuánto necesito por día de cada nutriente?',
  lede:
    'No hay un número único: cada nutriente tiene su tabla, y la tabla cambia con la edad, el sexo y la etapa. Partimos por el calcio, que es la consulta más frecuente. Cambiá el nutriente abajo y las referencias se recalculan solas.',
  stamps: [
    'IOM/NASEM · NIH ODS · OMS · FDA',
    'Objetivo y límite superior de cada uno',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Tu referencia diaria',

  cases: {
    title: '¿Qué nutriente querés mirar?',
    intro: 'Los cinco primeros son metas a alcanzar; los tres últimos, topes a no pasar.',
    items: [
      {
        id: 'calcio',
        label: 'Calcio',
        hint: 'Meta · mg/día',
        answer: 'Un adulto de 19 a 50 necesita 1.000 mg de calcio por día.',
        yes: [
          'Cantidad diaria recomendada por edad, sexo y etapa (IOM 2011)',
          'La mujer sube a 1.200 mg desde los 51 y el varón desde los 71',
          'Equivalencia en porciones lácteas de ~300 mg cada una',
        ],
        warn: [
          DISCLAIMER_DOSIS,
          'El límite superior tolerable baja con la edad: 2.500 mg hasta los 50 y 2.000 mg después. Pasarlo de forma sostenida con suplementos se asocia a cálculos renales',
          'El calcio de los suplementos compite con la absorción del hierro: no los tomes en la misma comida',
        ],
        plazo: 'repartilo en 2 o 3 tomas: por encima de 500 mg de una vez la absorción cae.',
      },
      {
        id: 'hierro',
        label: 'Hierro',
        hint: 'Meta · mg/día',
        answer: 'La mujer en edad fértil necesita 18 mg; el varón, 8 mg.',
        yes: [
          'RDA por sexo y etapa, con el salto del embarazo a 27 mg',
          'Ajuste vegetariano: ×1,8, porque el hierro no-hem se absorbe mucho peor',
          'La vitamina C en la misma comida multiplica la absorción del no-hem',
        ],
        warn: [
          DISCLAIMER_DOSIS,
          'El hierro NO se suplementa a ciegas: se suplementa con un análisis (ferritina, hemograma) y con indicación. El exceso se acumula y es tóxico',
          'El límite superior es 45 mg/día en adultos. Los suplementos de hierro son una causa frecuente de intoxicación accidental en chicos: guardalos bajo llave',
          'El té y el café en la comida bloquean la absorción del hierro vegetal',
        ],
        plazo: 'si sospechás anemia, el paso siguiente es un análisis, no un suplemento.',
      },
      {
        id: 'magnesio',
        label: 'Magnesio',
        hint: 'Meta · mg/día',
        answer: 'La RDA es 400-420 mg en el varón y 310-320 mg en la mujer.',
        yes: [
          'RDA por edad y sexo, y la dosis orientativa de suplemento por kilo de peso',
          'El tope de suplemento es 350 mg/día de magnesio elemental (NIH); el de los alimentos no cuenta',
          'Glicinato y citrato se absorben mejor que el óxido; el glicinato es el más amable con el intestino',
        ],
        warn: [
          DISCLAIMER_DOSIS,
          'Ojo con la etiqueta: los miligramos del frasco suelen ser de la SAL, no de magnesio elemental. El bisglicinato tiene ~14% de magnesio elemental y el citrato ~16%',
          'Con función renal disminuida el magnesio se acumula: ahí no se suplementa sin control médico',
          'El efecto laxante del citrato y del óxido es la señal más común de que te pasaste de dosis',
        ],
        plazo: 'la forma que elijas cambia la dosis del frasco, no tu requerimiento diario.',
      },
      {
        id: 'fibra',
        label: 'Fibra',
        hint: 'Meta · g/día',
        answer: 'La ingesta adecuada es 38 g en el varón adulto y 25 g en la mujer.',
        yes: [
          'Ingesta adecuada (AI) por edad y sexo, con 28 g en embarazo y 29 g en lactancia',
          'La regla de fondo es 14 g de fibra por cada 1.000 kcal que comas',
          'Después de los 50 el requerimiento baja porque baja la ingesta calórica',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Subir la fibra de golpe da distensión y gases: subila de a 5 g por semana y acompañala con agua',
          'En colon irritable, diverticulitis aguda o post-operatorio la indicación puede ser la contraria: ahí manda el profesional',
        ],
        plazo: 'sin agua suficiente, más fibra empeora el estreñimiento en vez de mejorarlo.',
      },
      {
        id: 'vitamina-d',
        label: 'Vitamina D',
        hint: 'Meta · UI/día',
        answer: 'La RDA es 600 UI de 1 a 70 años y 800 UI después.',
        yes: [
          'RDA IOM/NASEM 2011 por edad, en unidades internacionales',
          'Los lactantes llevan 400 UI/día de suplemento desde el nacimiento',
          'El sol sintetiza vitamina D, pero en invierno y en latitudes altas prácticamente no alcanza',
        ],
        warn: [
          DISCLAIMER_DOSIS,
          'El límite superior tolerable en adultos es 4.000 UI/día. Las megadosis semanales o mensuales sólo se usan bajo indicación y con dosaje de 25-OH-vitamina D',
          'La vitamina D es liposoluble: se acumula. La intoxicación existe y da hipercalcemia',
        ],
        plazo: 'antes de suplementar en dosis altas corresponde medir el nivel en sangre.',
      },
      {
        id: 'sodio',
        label: 'Sodio y sal',
        hint: 'Tope · mg/día',
        answer: 'El tope general es 2.300 mg de sodio, o sea unos 5,75 g de sal.',
        yes: [
          'Tope diario según tu perfil de salud, y su equivalente en gramos de sal de mesa',
          'Con hipertensión, enfermedad renal o diabetes el tope baja a 1.500 mg',
          'La conversión es 1 g de sal = 400 mg de sodio (la sal es 40% sodio en peso)',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La mayor parte del sodio que comés no viene del salero sino de los alimentos procesados: fiambres, panificados, quesos, caldos y snacks',
          'En embarazo no se restringe el sodio sin indicación médica',
        ],
        plazo: 'mirá los mg de sodio por porción en el rótulo: es donde se define la cuenta.',
      },
      {
        id: 'azucar',
        label: 'Azúcares añadidos',
        hint: 'Tope · g/día',
        answer: 'La OMS marca menos de 50 g por día, y como ideal menos de 25 g.',
        yes: [
          'El máximo OMS es el 10% de la energía diaria: 50 g en una dieta de 2.000 kcal',
          'El objetivo ideal es el 5%: 25 g, unas 6 cucharaditas',
          'Cuenta el azúcar añadido, no el de la fruta entera ni el de la leche',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Una lata de gaseosa de 350 ml tiene unos 37 g: sola se come casi todo el objetivo ideal del día',
          'Los jugos "sin azúcar agregada" concentran azúcares libres igual: la OMS los cuenta adentro',
        ],
        plazo: 'una cucharadita de azúcar son 4 g: es la unidad más fácil para llevar la cuenta.',
      },
      {
        id: 'cafeina',
        label: 'Cafeína',
        hint: 'Tope · mg/día',
        answer: 'La FDA marca 400 mg para un adulto sano; en embarazo, 200 mg.',
        yes: [
          'Tope estimado por peso corporal (~6 mg/kg), con el techo de 400 mg de la FDA',
          'En embarazo el tope baja a 200 mg y lo ideal es quedarse debajo de 100 mg',
          'Una taza de café de filtro tiene unos 95 mg',
        ],
        warn: [
          DISCLAIMER_DOSIS,
          'La cafeína tiene una vida media de 5 a 6 horas: la del café de las 17 h todavía está circulando a la noche y te recorta el sueño profundo',
          'Con arritmias, ansiedad, hipertensión no controlada o insomnio el límite personal es más bajo que el general',
          'Las bebidas energéticas suman cafeína de varias fuentes (guaraná, yerba, té verde) que no siempre figuran como "cafeína" en el rótulo',
        ],
        plazo: 'cortá la cafeína al menos 8 horas antes de acostarte.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'edad', label: 'Edad', type: 'number', min: 0, max: 110, value: 35 },
    {
      id: 'sexo',
      label: 'Sexo y etapa',
      type: 'select',
      value: 'mujer',
      options: [
        { value: 'mujer', label: 'Mujer' },
        { value: 'hombre', label: 'Varón' },
        { value: 'embarazo', label: 'Embarazo' },
        { value: 'lactancia', label: 'Lactancia' },
      ],
    },
    { id: 'peso', label: 'Peso', type: 'number', min: 3, max: 250, value: 70, suffix: 'kg' },
    {
      id: 'dieta',
      label: 'Tu alimentación',
      type: 'select',
      value: 'omnivoro',
      options: [
        { value: 'omnivoro', label: 'Como carne' },
        { value: 'vegetariano', label: 'Vegetariana o vegana' },
      ],
      help: 'Cambia la meta de hierro: la dieta vegetariana lleva un ×1,8 por la menor absorción del hierro no-hem.',
    },
    {
      id: 'perfil',
      label: 'Condición que baja tu tope de sodio',
      type: 'select',
      value: 'sano',
      options: [
        { value: 'sano', label: 'Ninguna en particular' },
        { value: 'hta', label: 'Hipertensión o enfermedad cardiovascular' },
        { value: 'renal', label: 'Enfermedad renal crónica' },
        { value: 'diabetes', label: 'Diabetes' },
        { value: 'deportista', label: 'Deportista con sudoración intensa' },
      ],
    },
  ],
  fineprint: DISCLAIMER_DOSIS,

  chart: {
    type: 'scale',
    title: 'Dónde cae tu número',
    caption:
      'El eje es la cantidad diaria del nutriente elegido. En los nutrientes-meta el marcador señala la cantidad que tenés que alcanzar y la franja roja de la derecha es el límite superior tolerable. En los topes (sodio, azúcar, cafeína) el marcador es el techo: quedarte a la izquierda es lo que buscás.',
  },
  breakdownTitle: 'Tu referencia en números',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Qué diferencia hay entre la CDR y el límite superior?',
      a: 'La cantidad diaria recomendada (RDA o CDR) es la cantidad que cubre el requerimiento del 97-98% de la población sana: es una meta. El límite superior tolerable (UL) es la cantidad diaria máxima que no se asocia a efectos adversos: es un techo. Entre las dos hay una zona amplia y segura; el problema aparece cuando se suplementa por encima del UL de forma sostenida.',
    },
    {
      q: '¿Cuánto calcio necesito por día?',
      a: '1.000 mg de los 19 a los 50 años. La mujer sube a 1.200 mg desde los 51 (posmenopausia) y el varón desde los 71. Los adolescentes de 9 a 18 son el grupo de mayor requerimiento: 1.300 mg, porque es cuando se forma el pico de masa ósea. Una porción láctea aporta unos 300 mg.',
    },
    {
      q: '¿Cuánto hierro necesita una mujer?',
      a: '18 mg por día en edad fértil, por la pérdida menstrual, y 8 mg después de la menopausia. En el embarazo salta a 27 mg. Con dieta vegetariana las referencias se multiplican por 1,8 porque el hierro no-hem de los vegetales se absorbe entre 2 y 20%, contra el 15-35% del hierro hem de las carnes.',
    },
    {
      q: '¿Sirve tomar vitamina C con el hierro?',
      a: 'Sí, y mucho: el ácido ascórbico reduce el hierro férrico a ferroso y puede multiplicar por tres la absorción del no-hem. Lentejas con tomate, tofu con limón o espinaca con pimiento rojo son combinaciones que hacen exactamente eso. El té y el café en la misma comida hacen lo contrario.',
    },
    {
      q: '¿Qué forma de magnesio conviene?',
      a: 'Depende de para qué. El bisglicinato tiene la mejor tolerancia digestiva y aporta glicina; el citrato tiene efecto osmótico suave y ayuda al tránsito; el malato participa del ciclo de Krebs. El óxido es el más barato y el peor absorbido. Lo importante de la etiqueta no es el nombre sino los miligramos de magnesio elemental.',
    },
    {
      q: '¿Por qué el tope de magnesio suplementario es 350 mg si la RDA es 400?',
      a: 'Porque son cosas distintas. La RDA es el total del día contando la comida; el UL de 350 mg del NIH aplica sólo al magnesio de suplementos y sales, que llega al intestino de golpe y produce diarrea. El magnesio de los alimentos no cuenta para ese tope.',
    },
    {
      q: '¿Cuánta fibra hay que comer?',
      a: '38 g/día en el varón de 19 a 50 años y 25 g/día en la mujer; después de los 50 baja a 30 y 21 g. La regla general detrás de la tabla es 14 g de fibra por cada 1.000 kcal. En embarazo la referencia es 28 g y en lactancia 29 g.',
    },
    {
      q: '¿Cuánta vitamina D tengo que tomar?',
      a: '600 UI/día de 1 a 70 años y 800 UI a partir de los 71, según las DRI del IOM/NASEM. Los lactantes llevan 400 UI/día. El límite superior tolerable en adultos es 4.000 UI. Las dosis altas se indican con un dosaje de 25-OH-vitamina D previo, no de rutina.',
    },
    {
      q: '¿Cuánta sal es demasiada?',
      a: 'El tope general de sodio es 2.300 mg/día, que equivale a 5,75 g de sal de mesa (1 g de sal = 400 mg de sodio). Con hipertensión, enfermedad renal crónica o diabetes las guías bajan el objetivo a 1.500 mg, es decir 3,75 g de sal. La mayor parte no viene del salero sino de los productos procesados.',
    },
    {
      q: '¿Cuánto azúcar por día permite la OMS?',
      a: 'Menos del 10% de la energía diaria como máximo, y menos del 5% como objetivo ideal. Sobre una dieta de 2.000 kcal son 50 g y 25 g respectivamente. Una cucharadita de azúcar son 4 g, así que el ideal equivale a unas 6 cucharaditas de todo el día sumado.',
    },
    {
      q: '¿Cuánta cafeína puedo tomar?',
      a: 'La FDA ubica en 400 mg/día el techo para un adulto sano, unas 4 tazas de café de filtro. Por peso corporal la referencia habitual es 6 mg/kg, así que por debajo de unos 67 kg el número propio queda abajo de los 400. En el embarazo el límite es 200 mg.',
    },
    {
      q: '¿A qué hora tengo que cortar el café?',
      a: 'La vida media de la cafeína es de 5 a 6 horas: 8 horas después de tomarla todavía queda circulando alrededor de un cuarto de la dosis. Si te acostás a las 23, el último café razonable es cerca de las 15.',
    },
  ],

  sources: [
    {
      name: 'Dietary Reference Intakes for Calcium and Vitamin D (2011)',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK56070/',
      publisher: 'Institute of Medicine / NASEM',
      date: '2011',
    },
    {
      name: 'Nutrient Recommendations and Databases — tablas DRI de hierro, magnesio y fibra',
      url: 'https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx',
      publisher: 'NIH Office of Dietary Supplements',
    },
    {
      name: 'Guideline: Sodium intake for adults and children',
      url: 'https://www.who.int/publications/i/item/9789241504836',
      publisher: 'Organización Mundial de la Salud',
      date: '2012',
    },
    {
      name: 'Guideline: Sugars intake for adults and children',
      url: 'https://www.who.int/publications/i/item/9789241549028',
      publisher: 'Organización Mundial de la Salud',
      date: '2015',
    },
    {
      name: 'Spilling the Beans: How Much Caffeine is Too Much?',
      url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much',
      publisher: 'U.S. Food and Drug Administration',
    },
  ],

  replaces: [
    '/calculadora-calcio-diario-edad-lactancia-menopausia',
    '/calculadora-hierro-diario-vegetariano',
    '/calculadora-magnesio-dosis-deficiencia-sintomas',
    '/calculadora-magnesio-glicinato-vs-citrato-vs-malato-dosis',
    '/calculadora-fibra-dietetica-recomendada-diaria-edad',
    '/calculadora-vitamina-d-dosis-sol-diaria-edad',
    '/calculadora-ingesta-sodio-diaria-mg-sal-hipertension',
    '/calculadora-azucares-anadidos-diarios-oms-mg-gramos',
    '/calculadora-cafeina-dosis-segura-diaria-peso',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/** Topes de sodio por perfil (mg/día). Espejo de ingesta-sodio-diaria-mg-sal-hipertension.ts. */
export const SODIO_LIMITES: Record<string, number> = {
  sano: 2300,
  hta: 1500,
  renal: 1500,
  diabetes: 1500,
  deportista: 3000,
  embarazo: 2000,
  mayor65: 1800,
  adolescente: 2300,
  nino_9_13: 2200,
  nino_4_8: 1500,
};

/** Umbrales OMS de azúcares libres para una dieta de 2.000 kcal (g/día). */
export const AZUCAR = { ideal: 25, maximo: 50, gPorCucharadita: 4 };

/** Cafeína: mg por kg y techo FDA. */
export const CAFEINA = { mgPorKg: 6, techoFDA: 400, embarazo: 200, mgPorTaza: 95 };

/** Magnesio suplementario: mg elemental por kg, con piso y techo de uso habitual. */
export const MAGNESIO_SUPL = { mgPorKg: 4, min: 200, max: 400, ulSuplemento: 350 };
