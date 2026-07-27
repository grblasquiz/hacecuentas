import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántas calorías tiene lo que como?"
 * Absorbe 16 URLs de calculadora suelta (ver hub.replaces).
 *
 * EL HALLAZGO: las 16 calculadoras absorbidas son, en el fondo, tres cosas:
 *   1. una tabla de composición por alimento (kcal y macros cada 100 g),
 *   2. la regla de Atwater (4 kcal/g de proteína y de carbohidrato,
 *      9 kcal/g de grasa, 7 kcal/g de alcohol),
 *   3. índices que se leen SOBRE esa misma tabla: índice glucémico, carga
 *      glucémica, índice de saciedad de Holt y grupo NOVA.
 * Por eso el corazón del hub es un catálogo unificado: cada alimento trae sus
 * calorías, sus macros, su IG, su índice de saciedad y su grupo NOVA juntos.
 * Elegir un alimento contesta las cuatro preguntas de una.
 *
 * DIFERENCIA con los otros hubs del silo /salud — no se pisan:
 *   · /salud/calorias-quemadas   → cuánta energía GASTÉ moviéndome
 *   · /salud/proteina            → cuánta proteína NECESITO por día
 *   · /salud/peso-ideal-imc      → cuánto debería pesar
 *   · /salud/grasa-corporal      → de ese peso, cuánto es grasa
 *   · /salud/habitos             → alcohol, sol, pantallas, pasos
 *   · /salud/frecuencia-cardiaca → a qué pulso entrenar
 *   · /nutricion/calorias-diarias → cuánta energía total necesito comer (TDEE)
 *   Este responde la otra punta: qué tiene ADENTRO el alimento que tengo en el
 *   plato. Ninguno de los otros mira la composición del alimento.
 *
 * YMYL SALUD: el aviso del dominio `health` de src/lib/disclaimers.ts viaja
 * textual en hub.fineprint y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO:
 *  - Acá no hay plata: TODA fila lleva `format` explícito ('unit' o 'plain').
 *  - `chart.type: 'donut'`: composición calórica de la porción por
 *    macronutriente (más el alcohol cuando corresponde), que es literalmente
 *    de dónde salen las calorías que se están contando.
 */
export const hub: HubData = {
  slug: 'salud/calorias-de-los-alimentos',
  title: '¿Cuántas calorías tiene lo que como? Calorías, macros, índice glucémico y NOVA',
  description:
    'Buscá un alimento y mirá cuántas calorías aporta tu porción, cómo se reparten entre proteínas, carbohidratos y grasas, qué índice y carga glucémica tiene, cuánto sacia y en qué grupo NOVA cae. También platos enteros, hamburguesas, huevos, bebidas con alcohol y recetas caseras.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación nutricional',
  h1: '¿Cuántas calorías tiene lo que como?',
  lede:
    'Una sola cuenta explica todo: las calorías salen de los gramos de proteína, carbohidrato y grasa que tiene el alimento. Partimos del caso más común —elegís un alimento del catálogo y la porción— y de ahí salen también su índice glucémico, cuánto sacia y qué tan procesado está. Si tenés la etiqueta, una receta o una copa de vino, lo cambiás abajo.',
  stamps: [
    'Actualizado 27-07-2026',
    'USDA FoodData Central · tablas internacionales de IG · índice de saciedad de Holt',
    '16 calculadoras adentro',
  ],

  resultLabel: 'Calorías de la porción',

  cases: {
    title: 'Mi caso es otro',
    intro:
      'Todas las ramas terminan en la misma cuenta de Atwater. Lo que cambia es de dónde salen los gramos: del catálogo, de la etiqueta, de la receta o del vaso.',
    items: [
      {
        id: 'catalogo',
        label: 'Elijo un alimento y una porción',
        hint: 'El caso más común',
        answer: 'Con el alimento y los gramos salen calorías, macros, IG, carga glucémica y NOVA.',
        yes: [
          'Calorías de tu porción y cómo se reparten entre proteína, carbohidratos y grasa',
          'Índice glucémico del alimento y carga glucémica de esa porción concreta',
          'Índice de saciedad de Holt (pan blanco = 100) y grupo NOVA de procesamiento',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Las tablas son valores medios de referencia: la variedad, el punto de maduración y la cocción mueven los números',
        ],
        plazo: 'para etiquetas reales, usá siempre los valores del envase antes que la tabla.',
      },
      {
        id: 'glucemia',
        label: 'Me importa el impacto en la glucemia',
        hint: 'Índice y carga glucémica',
        answer: 'El índice glucémico se lee por alimento; la carga glucémica, por porción.',
        yes: [
          'Índice glucémico del alimento con su clasificación (bajo ≤55, medio 56-69, alto ≥70)',
          'Carga glucémica de TU porción: IG × carbohidratos disponibles ÷ 100',
          'Los carbohidratos disponibles ya descuentan la fibra, que no llega a glucosa',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Si tenés diabetes o resistencia a la insulina, ninguna tabla reemplaza el medidor y a tu médico o nutricionista',
        ],
        plazo: 'la carga glucémica baja se ubica por debajo de 10; alta, por encima de 20.',
      },
      {
        id: 'plato',
        label: 'Es un plato o una unidad entera',
        hint: 'Milanesa, empanada, hamburguesa, huevo',
        answer: 'Los platos se cuentan por unidad, no por 100 gramos.',
        yes: [
          'Calorías por unidad de platos argentinos típicos, hamburguesas caseras y de cadena, y huevos según la cocción',
          'El total según cuántas unidades comiste',
          'Qué porcentaje representa sobre una dieta de referencia de 2.000 kcal',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Los platos caseros varían muchísimo según la receta y el aceite: tomalos como orden de magnitud, no como dato exacto',
        ],
        plazo: 'la diferencia entre un huevo cocido y uno revuelto con manteca es la grasa de cocción, no el huevo.',
      },
      {
        id: 'bebida',
        label: 'Es una bebida con alcohol',
        hint: 'Cerveza, vino, destilados',
        answer: 'El alcohol aporta 7 kcal por gramo y no aporta nutrientes.',
        yes: [
          'Calorías del vaso o la copa según los mililitros que pongas',
          'Gramos de alcohol puro y qué porcentaje de esas calorías vienen del etanol',
          'El equivalente en minutos de caminata',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'No existe un nivel de consumo de alcohol libre de riesgo para la salud: la cuenta calórica es sólo una parte del problema',
        ],
        plazo: 'usá el campo de porción en mililitros: una copa de vino son 150 ml y un vaso de cerveza, 330.',
      },
      {
        id: 'etiqueta',
        label: 'Tengo la etiqueta o los macros',
        hint: 'Información nutricional del envase',
        answer: 'Con proteínas, carbohidratos y grasas ya salen las calorías.',
        yes: [
          'Calorías por Atwater: proteínas × 4, carbohidratos × 4, grasas × 9',
          'Score de densidad nutricional: cuánta proteína y fibra aporta cada 100 kcal, menos lo que conviene limitar',
          'Qué componente es el que más penaliza el score',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Cargá los valores POR PORCIÓN del envase, no los de cada 100 g, si querés el número de lo que comiste',
        ],
        plazo: 'en Argentina el rótulo declara los valores cada 100 g y por porción: mirá cuál estás copiando.',
      },
      {
        id: 'receta',
        label: 'Cociné una receta entera',
        hint: 'Total de la olla ÷ porciones',
        answer: 'Se suman los macros de toda la receta y se divide por las porciones.',
        yes: [
          'Calorías totales de la preparación y calorías por porción',
          'El reparto porcentual entre los tres macronutrientes',
          'Sirve para batch cooking: cargás la olla entera una vez y ya sabés qué come cada uno',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'No te olvides del aceite de cocción: son 9 kcal por gramo y es lo que más se subestima al contar una receta',
        ],
        plazo: 'pesá la preparación terminada y dividí por porciones reales, no por las que pensabas hacer.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Cada rama usa sólo algunos de estos campos; el resto podés dejarlos como están. Los valores de ejemplo son los de 100 g de pan blanco.',
  fields: [
    {
      id: 'alimento',
      label: 'Alimento del catálogo',
      type: 'select',
      value: 'pan_blanco',
      options: [
        { value: 'arroz_blanco', label: 'Arroz blanco cocido' },
        { value: 'arroz_integral', label: 'Arroz integral cocido' },
        { value: 'arroz_basmati', label: 'Arroz basmati cocido' },
        { value: 'arroz_parboil', label: 'Arroz parboilizado cocido' },
        { value: 'pan_blanco', label: 'Pan blanco' },
        { value: 'pan_integral', label: 'Pan integral' },
        { value: 'pasta', label: 'Pasta al dente' },
        { value: 'pasta_integral', label: 'Pasta integral cocida' },
        { value: 'avena', label: 'Avena (cruda)' },
        { value: 'quinoa', label: 'Quinoa cocida' },
        { value: 'papa_hervida', label: 'Papa hervida' },
        { value: 'batata', label: 'Batata' },
        { value: 'zanahoria', label: 'Zanahoria cruda' },
        { value: 'lenteja', label: 'Lentejas cocidas' },
        { value: 'garbanzo', label: 'Garbanzos cocidos' },
        { value: 'palta', label: 'Palta o aguacate (pulpa)' },
        { value: 'manzana', label: 'Manzana' },
        { value: 'banana', label: 'Banana' },
        { value: 'naranja', label: 'Naranja' },
        { value: 'uva', label: 'Uva' },
        { value: 'sandia', label: 'Sandía' },
        { value: 'leche', label: 'Leche entera' },
        { value: 'yogur_natural', label: 'Yogur natural sin azúcar' },
        { value: 'huevo', label: 'Huevo cocido (pulpa, cada 100 g)' },
        { value: 'pescado', label: 'Pescado blanco (merluza)' },
        { value: 'carne_magra', label: 'Carne vacuna magra cocida' },
        { value: 'queso', label: 'Queso semiduro' },
        { value: 'mani', label: 'Maní tostado' },
        { value: 'miel', label: 'Miel' },
        { value: 'azucar', label: 'Azúcar de mesa' },
        { value: 'chocolate_negro', label: 'Chocolate 70%' },
        { value: 'chocolate_leche', label: 'Chocolate con leche' },
        { value: 'galletita', label: 'Galletitas dulces' },
        { value: 'cereal_azucarado', label: 'Cereal de desayuno azucarado' },
        { value: 'papa_frita', label: 'Papas fritas' },
        { value: 'helado', label: 'Helado de crema' },
        { value: 'cerveza', label: 'Cerveza (por 100 ml)' },
        { value: 'vino_tinto', label: 'Vino tinto (por 100 ml)' },
        { value: 'vino_blanco', label: 'Vino blanco (por 100 ml)' },
        { value: 'champagne', label: 'Champagne o espumante (por 100 ml)' },
        { value: 'whisky', label: 'Whisky (por 100 ml)' },
        { value: 'gin', label: 'Gin (por 100 ml)' },
        { value: 'vodka', label: 'Vodka (por 100 ml)' },
        { value: 'fernet', label: 'Fernet con cola (por 100 ml)' },
      ],
      help: 'Lo usan las ramas de catálogo, glucemia y bebida. Los valores son cada 100 g, o cada 100 ml en las bebidas.',
    },
    {
      id: 'gramos',
      label: 'Porción',
      type: 'number',
      suffix: 'g o ml',
      min: 1,
      max: 3000,
      value: 100,
      help: 'Una copa de vino son 150 ml, un vaso de cerveza 330 ml, una rodaja de pan 30 g y un plato de arroz cocido unos 200 g.',
    },
    {
      id: 'plato',
      label: 'Plato o unidad entera',
      type: 'select',
      value: 'empanada_carne',
      options: [
        { value: 'asado_completo', label: 'Asado completo (400 g de carne + achuras + chorizo)' },
        { value: 'milanesa_napolitana', label: 'Milanesa napolitana' },
        { value: 'milanesa_simple', label: 'Milanesa con puré' },
        { value: 'empanada_carne', label: 'Empanada de carne al horno' },
        { value: 'empanada_jyq', label: 'Empanada de jamón y queso al horno' },
        { value: 'choripan', label: 'Choripán' },
        { value: 'pizza_muzzarella', label: 'Pizza de muzzarella (1 porción)' },
        { value: 'locro', label: 'Locro (1 plato hondo)' },
        { value: 'ravioles_tuco', label: 'Ravioles con tuco (1 plato)' },
        { value: 'bife_ensalada', label: 'Bife de chorizo con ensalada' },
        { value: 'matambre_rusa', label: 'Matambre con ensalada rusa' },
        { value: 'flan_ddl', label: 'Flan con dulce de leche y crema' },
        { value: 'medialunas', label: 'Medialunas de manteca (3)' },
        { value: 'alfajor_maicena', label: 'Alfajor de maicena' },
        { value: 'mate_facturas', label: 'Mate con 3 facturas' },
        { value: 'burger_casera_simple', label: 'Hamburguesa casera simple' },
        { value: 'burger_casera_queso', label: 'Hamburguesa casera con queso' },
        { value: 'burger_casera_doble', label: 'Hamburguesa casera doble' },
        { value: 'burger_mc_simple', label: "Hamburguesa simple de McDonald's" },
        { value: 'burger_cuarto', label: 'Cuarto de Libra con queso' },
        { value: 'burger_bigmac', label: 'Big Mac' },
        { value: 'burger_whopper', label: 'Whopper' },
        { value: 'burger_whopper_doble', label: 'Whopper doble' },
        { value: 'huevo_cocido', label: 'Huevo duro o pasado por agua' },
        { value: 'huevo_revuelto_sin', label: 'Huevo revuelto sin grasa' },
        { value: 'huevo_frito', label: 'Huevo frito en aceite' },
        { value: 'huevo_revuelto', label: 'Huevo revuelto con manteca' },
        { value: 'huevo_omelette', label: 'Omelette (por huevo)' },
      ],
      help: 'Sólo lo usa la rama de plato. Se cuenta por unidad o porción entera, no por 100 g.',
    },
    {
      id: 'unidades',
      label: 'Unidades o porciones',
      type: 'number',
      min: 1,
      max: 50,
      value: 2,
      help: 'En la rama de plato son cuántas unidades comiste; en la de receta, en cuántas porciones rinde la olla.',
    },
    {
      id: 'proteinas',
      label: 'Proteínas',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 9,
      help: 'Ramas de etiqueta y receta. Aporta 4 kcal por gramo.',
    },
    {
      id: 'carbohidratos',
      label: 'Carbohidratos totales',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 49,
      help: 'Ramas de etiqueta y receta. Aporta 4 kcal por gramo.',
    },
    {
      id: 'grasas',
      label: 'Grasas totales',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 3.2,
      help: 'Ramas de etiqueta y receta. Aporta 9 kcal por gramo: es el macro que más pesa.',
    },
    {
      id: 'fibra',
      label: 'Fibra alimentaria',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 2.7,
      help: 'Rama de etiqueta. Suma al score de densidad nutricional y se descuenta de los carbohidratos disponibles.',
    },
    {
      id: 'azucar',
      label: 'Azúcares añadidos',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 4,
      help: 'Rama de etiqueta. Es uno de los tres componentes que restan puntos al score.',
    },
    {
      id: 'sodio',
      label: 'Sodio',
      type: 'number',
      suffix: 'mg',
      min: 0,
      value: 490,
      help: 'Rama de etiqueta. Si el rótulo declara sal en gramos, multiplicá por 400 para pasar a mg de sodio.',
    },
    {
      id: 'grasaSat',
      label: 'Grasas saturadas',
      type: 'number',
      suffix: 'g',
      min: 0,
      step: 0.1,
      value: 0.7,
      help: 'Rama de etiqueta. Es el componente que más pesa en la penalización del score.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',

  chart: {
    type: 'donut',
    title: 'De dónde salen esas calorías',
    caption:
      'Cada porción del gráfico son las calorías que aporta cada macronutriente, no sus gramos: la grasa rinde 9 kcal por gramo y el alcohol 7, así que ocupan mucho más espacio del que sugiere la balanza.',
  },
  breakdownTitle: 'Qué tiene adentro tu porción',
  breakdownIntro: 'Las barras comparan cada valor con el más grande de la lista.',

  faq: [
    {
      q: '¿Cómo se calculan las calorías de un alimento?',
      a: 'Con los factores de Atwater: cada gramo de proteína aporta 4 kcal, cada gramo de carbohidrato 4 kcal, cada gramo de grasa 9 kcal y cada gramo de alcohol 7 kcal. Se multiplican los gramos de cada macronutriente por su factor y se suman. No hay nada más: las calorías de una etiqueta salen exactamente de esa cuenta.',
    },
    {
      q: '¿Qué diferencia hay entre índice glucémico y carga glucémica?',
      a: 'El índice glucémico es una propiedad del alimento: mide qué tan rápido sube la glucosa comparado con la glucosa pura, siempre sobre una cantidad fija de 50 g de carbohidratos. La carga glucémica ajusta ese índice a la porción real: CG = IG × carbohidratos disponibles ÷ 100. Por eso la sandía tiene IG alto (76) pero carga baja: una porción tiene muy pocos carbohidratos.',
    },
    {
      q: '¿Qué se considera índice glucémico bajo, medio y alto?',
      a: 'Bajo hasta 55, medio entre 56 y 69, alto de 70 para arriba, según la clasificación de la OMS/FAO y las tablas internacionales de la Universidad de Sídney. Para la carga glucémica de una porción, la escala de Harvard es: baja hasta 10, media entre 11 y 19, alta de 20 en adelante.',
    },
    {
      q: '¿La fibra cuenta como carbohidrato para la glucemia?',
      a: 'No. La fibra es un carbohidrato que no se digiere ni llega a glucosa en sangre, por eso la carga glucémica se calcula con los carbohidratos disponibles, que son los totales menos la fibra. En unos garbanzos la diferencia es enorme: de 27 g de carbohidratos totales, casi 8 son fibra.',
    },
    {
      q: '¿Qué es el índice de saciedad?',
      a: 'Es una escala experimental publicada por Susanna Holt en 1995 que midió cuánta hambre quedaba después de comer 240 kcal de distintos alimentos. El pan blanco se fijó en 100 como referencia. La papa hervida llegó a 323 (sacia más de tres veces que el pan) y el croissant quedó en 47, menos de la mitad. Explica por qué dos alimentos con las mismas calorías te dejan muy distinto.',
    },
    {
      q: '¿Qué son los grupos NOVA?',
      a: 'Es la clasificación por grado de procesamiento que usan las guías alimentarias de varios países, incluidas las argentinas. NOVA 1 son alimentos naturales o mínimamente procesados; NOVA 2, ingredientes culinarios como aceite, sal y azúcar; NOVA 3, alimentos procesados que combinan los dos anteriores, como el pan o el queso; NOVA 4, ultraprocesados formulados industrialmente, con aditivos y una lista larga de ingredientes.',
    },
    {
      q: '¿Cuántas calorías tiene una copa de vino?',
      a: 'Una copa de 150 ml de vino tinto ronda las 128 kcal, y unas 123 si es blanco. Cerca del 90% de esas calorías vienen del etanol, que aporta 7 kcal por gramo sin ningún nutriente. Una botella entera de 750 ml supera las 630 kcal.',
    },
    {
      q: '¿Cuántas calorías tiene un huevo?',
      a: 'El huevo en sí ronda las 75 kcal. Lo que cambia el número es la cocción: duro o pasado por agua queda en 75, revuelto sin grasa unas 80, frito en aceite unas 95, revuelto con manteca unas 110 y en omelette unas 120. La diferencia es la grasa de cocción, no el huevo.',
    },
    {
      q: '¿El arroz integral tiene menos calorías que el blanco?',
      a: 'Sí, pero mucho menos de lo que se cree: 112 kcal cada 100 g cocido contra 130 del blanco. La ventaja real está en la fibra (1,8 g contra 0,4 g) y en el índice glucémico, que baja de 73 a 68. Cocido, ambos absorben agua y la diferencia calórica por plato es chica.',
    },
    {
      q: '¿Qué es la densidad nutricional?',
      a: 'Es cuántos nutrientes que conviene sumar (proteína y fibra) aporta un alimento por cada 100 kcal, descontando los que conviene limitar (azúcares añadidos, sodio y grasas saturadas). Un alimento denso te da mucho nutriente por caloría; uno "calórico vacío" te da calorías y poco más. Es la lógica detrás de los índices tipo NRF que usan las guías alimentarias.',
    },
    {
      q: '¿Las calorías de la etiqueta son exactas?',
      a: 'Son un promedio declarado con una tolerancia que en la mayoría de los marcos regulatorios llega al 20%. Sumado a que la variedad, la maduración y la cocción mueven los valores, tomar el número al gramo no tiene sentido: sirve para comparar alimentos y para ver órdenes de magnitud.',
    },
    {
      q: '¿Contar calorías alcanza para bajar de peso?',
      a: 'El balance energético manda, pero no es lo único: dos dietas con las mismas calorías pueden dejarte con distinta hambre según la proteína, la fibra y el grado de procesamiento, y eso cambia cuánto podés sostenerlas. Por eso este hub muestra saciedad y NOVA junto a las calorías. Cualquier plan de descenso de peso conviene consultarlo con un profesional de la salud matriculado.',
    },
  ],

  sources: [
    {
      name: 'FoodData Central — composición de alimentos por 100 g',
      url: 'https://fdc.nal.usda.gov/',
      publisher: 'USDA, Departamento de Agricultura de los Estados Unidos',
    },
    {
      name: 'International Tables of Glycemic Index and Glycemic Load Values 2008',
      url: 'https://diabetesjournals.org/care/article/31/12/2281/24911',
      publisher: 'Atkinson, Foster-Powell y Brand-Miller · Diabetes Care',
      date: '2008',
    },
    {
      name: 'Glycemic index and glycemic load for 100+ foods',
      url: 'https://www.health.harvard.edu/diseases-and-conditions/glycemic-index-and-glycemic-load-for-100-foods',
      publisher: 'Harvard Health Publishing',
    },
    {
      name: 'A satiety index of common foods (Holt et al., 1995)',
      url: 'https://pubmed.ncbi.nlm.nih.gov/7498104/',
      publisher: 'European Journal of Clinical Nutrition · PubMed',
      date: '1995',
    },
    {
      name: 'Ultra-processed foods, diet quality and health using the NOVA classification system',
      url: 'https://www.fao.org/documents/card/en/c/ca5644en',
      publisher: 'FAO',
      date: '2019',
    },
    {
      name: 'Guías Alimentarias para la Población Argentina',
      url: 'https://www.argentina.gob.ar/salud/alimentacion-saludable/guias',
      publisher: 'Ministerio de Salud de la Nación',
    },
  ],

  replaces: [
    '/calculadora-indice-glucemico-por-alimento',
    '/calculadora-calorias-bebida-alcoholica',
    '/calculadora-carga-glucemica-comida',
    '/calculadora-calorias-aproximadas-receta-plato',
    '/calculadora-calorias-alimento-porcion',
    '/calculadora-calorias-palta-aguacate-completa-mitad',
    '/calculadora-calorias-copa-vino',
    '/calculadora-procesados-nova-clasificacion',
    '/calculadora-indice-glucemico-carga-alimento-porcion',
    '/calculadora-densidad-nutricional-score',
    '/calculadora-calorias-plato-argentino-tipico',
    '/calculadora-calorias-huevo-revuelto-frito-cocido',
    '/calculadora-indice-saciedad-alimento',
    '/calculadora-calorias-pan-blanco-integral-porcion',
    '/calculadora-calorias-hamburguesa-casera-comercial',
    '/calculadora-calorias-arroz-blanco-integral-cocido',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Catálogo unificado, por 100 g (o por 100 ml en las bebidas).
 *   n    nombre
 *   kcal calorías
 *   p/c/g/f  proteína, carbohidratos totales, grasa y fibra en gramos
 *   ig   índice glucémico (0 = sin dato: alimentos sin carbohidratos relevantes)
 *   is   índice de saciedad de Holt, pan blanco = 100 (0 = sin dato)
 *   nova grupo NOVA de procesamiento (1 a 4)
 *   abv  graduación alcohólica en % v/v, sólo bebidas
 *
 * Composición: USDA FoodData Central. IG: tablas internacionales de la
 * Universidad de Sídney. Saciedad: Holt et al. 1995.
 */
export const ALIMENTOS: Record<
  string,
  { n: string; kcal: number; p: number; c: number; g: number; f: number; ig: number; is: number; nova: number; abv?: number }
> = {
  arroz_blanco:     { n: 'Arroz blanco cocido',        kcal: 130, p: 2.7,  c: 28.2, g: 0.3,  f: 0.4,  ig: 73, is: 138, nova: 1 },
  arroz_integral:   { n: 'Arroz integral cocido',      kcal: 112, p: 2.6,  c: 23.5, g: 0.8,  f: 1.8,  ig: 68, is: 0,   nova: 1 },
  arroz_basmati:    { n: 'Arroz basmati cocido',       kcal: 121, p: 2.7,  c: 26.0, g: 0.4,  f: 0.5,  ig: 58, is: 0,   nova: 1 },
  arroz_parboil:    { n: 'Arroz parboilizado cocido',  kcal: 123, p: 2.6,  c: 25.0, g: 0.4,  f: 1.0,  ig: 61, is: 0,   nova: 1 },
  pan_blanco:       { n: 'Pan blanco',                 kcal: 265, p: 9.0,  c: 49.0, g: 3.2,  f: 2.7,  ig: 75, is: 100, nova: 3 },
  pan_integral:     { n: 'Pan integral',               kcal: 247, p: 13.0, c: 41.0, g: 3.4,  f: 6.8,  ig: 51, is: 154, nova: 3 },
  pasta:            { n: 'Pasta al dente',             kcal: 158, p: 5.8,  c: 30.9, g: 0.9,  f: 1.8,  ig: 49, is: 0,   nova: 3 },
  pasta_integral:   { n: 'Pasta integral cocida',      kcal: 124, p: 5.3,  c: 26.5, g: 0.5,  f: 4.5,  ig: 42, is: 188, nova: 3 },
  avena:            { n: 'Avena cruda',                kcal: 389, p: 16.9, c: 66.3, g: 6.9,  f: 10.6, ig: 55, is: 209, nova: 1 },
  quinoa:           { n: 'Quinoa cocida',              kcal: 120, p: 4.4,  c: 21.3, g: 1.9,  f: 2.8,  ig: 53, is: 0,   nova: 1 },
  papa_hervida:     { n: 'Papa hervida',               kcal: 87,  p: 1.9,  c: 20.1, g: 0.1,  f: 1.8,  ig: 78, is: 323, nova: 1 },
  batata:           { n: 'Batata',                     kcal: 90,  p: 2.0,  c: 20.7, g: 0.2,  f: 3.3,  ig: 63, is: 0,   nova: 1 },
  zanahoria:        { n: 'Zanahoria cruda',            kcal: 41,  p: 0.9,  c: 9.6,  g: 0.2,  f: 2.8,  ig: 39, is: 0,   nova: 1 },
  lenteja:          { n: 'Lentejas cocidas',           kcal: 116, p: 9.0,  c: 20.1, g: 0.4,  f: 7.9,  ig: 32, is: 133, nova: 1 },
  garbanzo:         { n: 'Garbanzos cocidos',          kcal: 164, p: 8.9,  c: 27.4, g: 2.6,  f: 7.6,  ig: 28, is: 0,   nova: 1 },
  palta:            { n: 'Palta o aguacate',           kcal: 160, p: 2.0,  c: 8.53, g: 14.66,f: 6.7,  ig: 0,  is: 0,   nova: 1 },
  manzana:          { n: 'Manzana',                    kcal: 52,  p: 0.3,  c: 13.8, g: 0.2,  f: 2.4,  ig: 36, is: 197, nova: 1 },
  banana:           { n: 'Banana',                     kcal: 89,  p: 1.1,  c: 22.8, g: 0.3,  f: 2.6,  ig: 51, is: 118, nova: 1 },
  naranja:          { n: 'Naranja',                    kcal: 47,  p: 0.9,  c: 11.8, g: 0.1,  f: 2.4,  ig: 43, is: 202, nova: 1 },
  uva:              { n: 'Uva',                        kcal: 69,  p: 0.7,  c: 18.1, g: 0.2,  f: 0.9,  ig: 53, is: 0,   nova: 1 },
  sandia:           { n: 'Sandía',                     kcal: 30,  p: 0.6,  c: 7.6,  g: 0.2,  f: 0.4,  ig: 76, is: 0,   nova: 1 },
  leche:            { n: 'Leche entera',               kcal: 61,  p: 3.2,  c: 4.8,  g: 3.3,  f: 0,    ig: 31, is: 0,   nova: 1 },
  yogur_natural:    { n: 'Yogur natural sin azúcar',   kcal: 61,  p: 3.5,  c: 4.7,  g: 3.3,  f: 0,    ig: 35, is: 88,  nova: 3 },
  huevo:            { n: 'Huevo cocido',               kcal: 155, p: 12.6, c: 1.1,  g: 10.6, f: 0,    ig: 0,  is: 150, nova: 1 },
  pescado:          { n: 'Pescado blanco (merluza)',   kcal: 90,  p: 18.5, c: 0,    g: 1.3,  f: 0,    ig: 0,  is: 225, nova: 1 },
  carne_magra:      { n: 'Carne vacuna magra cocida',  kcal: 187, p: 30.0, c: 0,    g: 6.9,  f: 0,    ig: 0,  is: 176, nova: 1 },
  queso:            { n: 'Queso semiduro',             kcal: 356, p: 25.0, c: 2.4,  g: 27.5, f: 0,    ig: 0,  is: 146, nova: 3 },
  mani:             { n: 'Maní tostado',               kcal: 587, p: 24.4, c: 21.5, g: 49.7, f: 8.0,  ig: 14, is: 84,  nova: 3 },
  miel:             { n: 'Miel',                       kcal: 304, p: 0.3,  c: 82.4, g: 0,    f: 0.2,  ig: 61, is: 0,   nova: 2 },
  azucar:           { n: 'Azúcar de mesa',             kcal: 387, p: 0,    c: 100,  g: 0,    f: 0,    ig: 65, is: 0,   nova: 2 },
  chocolate_negro:  { n: 'Chocolate 70%',              kcal: 598, p: 7.8,  c: 45.9, g: 42.6, f: 10.9, ig: 40, is: 0,   nova: 3 },
  chocolate_leche:  { n: 'Chocolate con leche',        kcal: 535, p: 7.7,  c: 59.4, g: 29.7, f: 3.4,  ig: 0,  is: 70,  nova: 4 },
  galletita:        { n: 'Galletitas dulces',          kcal: 480, p: 6.0,  c: 70.0, g: 19.0, f: 2.2,  ig: 0,  is: 120, nova: 4 },
  cereal_azucarado: { n: 'Cereal de desayuno azucarado', kcal: 383, p: 6.0, c: 87.0, g: 1.5, f: 2.5,  ig: 0,  is: 118, nova: 4 },
  papa_frita:       { n: 'Papas fritas',               kcal: 312, p: 3.4,  c: 41.4, g: 14.7, f: 3.8,  ig: 63, is: 116, nova: 4 },
  helado:           { n: 'Helado de crema',            kcal: 207, p: 3.5,  c: 23.6, g: 11.0, f: 0.7,  ig: 0,  is: 96,  nova: 4 },
  cerveza:          { n: 'Cerveza',                    kcal: 43,  p: 0.5,  c: 3.6,  g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 5 },
  vino_tinto:       { n: 'Vino tinto',                 kcal: 85,  p: 0.1,  c: 2.6,  g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 13 },
  vino_blanco:      { n: 'Vino blanco',                kcal: 82,  p: 0.1,  c: 2.6,  g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 12 },
  champagne:        { n: 'Champagne o espumante',      kcal: 76,  p: 0.1,  c: 1.4,  g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 12 },
  whisky:           { n: 'Whisky',                     kcal: 231, p: 0,    c: 0,    g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 40 },
  gin:              { n: 'Gin',                        kcal: 231, p: 0,    c: 0,    g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 40 },
  vodka:            { n: 'Vodka',                      kcal: 231, p: 0,    c: 0,    g: 0,    f: 0,    ig: 0,  is: 0,   nova: 3, abv: 40 },
  fernet:           { n: 'Fernet con cola',            kcal: 105, p: 0,    c: 10.5, g: 0,    f: 0,    ig: 0,  is: 0,   nova: 4, abv: 7 },
};

/**
 * Platos y unidades enteras. Valores POR UNIDAD o porción servida.
 * Platos argentinos y hamburguesas: tablas de referencia de las calculadoras
 * originales (USDA para las caseras, datos oficiales de cadena para las
 * comerciales). Huevos: 75 kcal el huevo, el resto es grasa de cocción.
 */
export const PLATOS: Record<string, { n: string; kcal: number; p: number; c: number; g: number; nota: string }> = {
  asado_completo:      { n: 'Asado completo',            kcal: 1050, p: 70, c: 15, g: 75, nota: '~400 g de carne + achuras + chorizo' },
  milanesa_napolitana: { n: 'Milanesa napolitana',       kcal: 800,  p: 45, c: 40, g: 50, nota: '1 milanesa con jamón, salsa y queso' },
  milanesa_simple:     { n: 'Milanesa con puré',         kcal: 750,  p: 40, c: 55, g: 40, nota: '1 milanesa + puré de papas' },
  empanada_carne:      { n: 'Empanada de carne',         kcal: 300,  p: 12, c: 22, g: 18, nota: '1 unidad al horno' },
  empanada_jyq:        { n: 'Empanada de jamón y queso', kcal: 280,  p: 10, c: 20, g: 17, nota: '1 unidad al horno' },
  choripan:            { n: 'Choripán',                  kcal: 500,  p: 22, c: 30, g: 32, nota: '1 chorizo en pan francés' },
  pizza_muzzarella:    { n: 'Pizza de muzzarella',       kcal: 280,  p: 12, c: 30, g: 12, nota: '1 porción (⅛ de pizza)' },
  locro:               { n: 'Locro',                     kcal: 650,  p: 30, c: 55, g: 35, nota: '1 plato hondo' },
  ravioles_tuco:       { n: 'Ravioles con tuco',         kcal: 580,  p: 25, c: 60, g: 25, nota: '1 plato' },
  bife_ensalada:       { n: 'Bife de chorizo con ensalada', kcal: 550, p: 55, c: 10, g: 33, nota: '1 bife de ~300 g + ensalada' },
  matambre_rusa:       { n: 'Matambre con ensalada rusa', kcal: 700,  p: 35, c: 40, g: 45, nota: '3 o 4 fetas + ensalada rusa' },
  flan_ddl:            { n: 'Flan con dulce de leche y crema', kcal: 450, p: 10, c: 50, g: 22, nota: '1 porción' },
  medialunas:          { n: 'Medialunas de manteca (3)', kcal: 500,  p: 10, c: 60, g: 25, nota: '3 medialunas' },
  alfajor_maicena:     { n: 'Alfajor de maicena',        kcal: 250,  p: 3,  c: 35, g: 12, nota: '1 alfajor' },
  mate_facturas:       { n: 'Mate con 3 facturas',       kcal: 550,  p: 8,  c: 70, g: 28, nota: 'mate + 3 facturas surtidas' },

  burger_casera_simple: { n: 'Hamburguesa casera simple', kcal: 350, p: 0, c: 0, g: 0, nota: 'medallón de ~110 g + pan, sin queso' },
  burger_casera_queso:  { n: 'Hamburguesa casera con queso', kcal: 450, p: 0, c: 0, g: 0, nota: '+ feta de queso' },
  burger_casera_doble:  { n: 'Hamburguesa casera doble',  kcal: 620, p: 0, c: 0, g: 0, nota: 'doble medallón + queso' },
  burger_mc_simple:     { n: "Hamburguesa simple de McDonald's", kcal: 250, p: 0, c: 0, g: 0, nota: 'dato oficial de la cadena' },
  burger_cuarto:        { n: 'Cuarto de Libra con queso', kcal: 520, p: 0, c: 0, g: 0, nota: 'dato oficial de la cadena' },
  burger_bigmac:        { n: 'Big Mac',                   kcal: 540, p: 0, c: 0, g: 0, nota: 'dato oficial de la cadena' },
  burger_whopper:       { n: 'Whopper',                   kcal: 660, p: 0, c: 0, g: 0, nota: 'dato oficial de la cadena' },
  burger_whopper_doble: { n: 'Whopper doble',             kcal: 900, p: 0, c: 0, g: 0, nota: 'dato oficial de la cadena' },

  huevo_cocido:        { n: 'Huevo duro o pasado por agua', kcal: 75, p: 0, c: 0, g: 0, nota: 'sin grasa agregada' },
  huevo_revuelto_sin:  { n: 'Huevo revuelto sin grasa',     kcal: 80, p: 0, c: 0, g: 0, nota: 'sartén antiadherente' },
  huevo_frito:         { n: 'Huevo frito',                  kcal: 95, p: 0, c: 0, g: 0, nota: 'en aceite' },
  huevo_revuelto:      { n: 'Huevo revuelto con manteca',   kcal: 110, p: 0, c: 0, g: 0, nota: 'con manteca o aceite' },
  huevo_omelette:      { n: 'Omelette',                     kcal: 120, p: 0, c: 0, g: 0, nota: 'por huevo, con grasa' },
};

/** Constantes nutricionales del hub. */
export const NUTRI = {
  /** Factores de Atwater, en kcal por gramo. */
  KCAL_PROT: 4,
  KCAL_CARB: 4,
  KCAL_GRASA: 9,
  KCAL_ALCOHOL: 7,
  /** Densidad del etanol, g/ml. */
  DENSIDAD_ETANOL: 0.789,
  /** Gasto de referencia caminando, kcal por minuto. */
  KCAL_MIN_CAMINATA: 5,
  /** Dieta de referencia para el porcentaje diario. */
  DIETA_REF: 2000,
  /** Kcal base de un huevo grande, sin grasa de cocción. */
  HUEVO_BASE: 75,
  /** Hamburguesa casera simple, base de comparación. */
  BURGER_BASE: 350,
  /** Etiquetas del grupo NOVA. */
  NOVA: {
    1: 'NOVA 1 · natural o mínimamente procesado',
    2: 'NOVA 2 · ingrediente culinario',
    3: 'NOVA 3 · procesado',
    4: 'NOVA 4 · ultraprocesado',
  } as Record<number, string>,
};
