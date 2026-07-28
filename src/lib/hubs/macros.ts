import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cómo reparto mis calorías en proteína, carbos y grasa?"
 * Arquetipo RAMIFICADO: la rama es la DIETA o el OBJETIVO, y lo único que
 * cambia es el vector de porcentajes (y, en cut/bulk, el multiplicador sobre
 * las calorías de mantenimiento).
 *
 * Absorbe 7 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs — no se pisan:
 *   · /nutricion/calorias-diarias → cuántas CALORÍAS comer (TDEE, déficit)
 *   · /salud/proteina             → gramos de proteína por kilo de peso
 *   · /salud/nutrientes-diarios   → micronutrientes y topes
 *   Este es el paso del medio: ya sabés las calorías, ahora las repartís.
 *   El punto de partida son tus calorías de mantenimiento, que salen del hub
 *   de calorías diarias.
 *
 * NÚMEROS: los vectores de porcentajes son los de las fórmulas originales
 * (src/lib/formulas/macros*.ts), y las densidades son las estándar:
 * 4 kcal/g proteína, 4 kcal/g carbohidratos, 9 kcal/g grasa.
 *
 * YMYL DE SALUD: aviso textual del dominio `health` de src/lib/disclaimers.ts
 * en `fineprint` y como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO: acá no hay plata. TODA fila lleva `format` explícito.
 */

export const DISCLAIMER =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

export const hub: HubData = {
  slug: 'salud/macros',
  title: '¿Cómo reparto mis macros? Calculadora de proteína, carbos y grasa por dieta y objetivo',
  description:
    'Pasá tus calorías diarias a gramos de proteína, carbohidratos y grasa según la dieta o el objetivo: balanceada, alta en proteína, low carb, keto, paleo, mediterránea, DASH, déficit, recomposición o volumen.',
  silo: 'Salud',
  siloHref: '/salud',

  eyebrow: 'Guía y estimación nutricional',
  h1: '¿Cómo reparto mis macros?',
  lede:
    'Las calorías definen si subís o bajás de peso; los macros definen de qué está hecho ese cambio. Partimos del reparto balanceado, el que sirve para la mayoría. Si seguís una dieta concreta o estás en una fase de definición o volumen, lo cambiás abajo y los gramos se recalculan.',
  stamps: [
    'Densidades 4/4/9 kcal por gramo',
    'Vectores de cada dieta explicitados',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Tus calorías objetivo',

  cases: {
    title: '¿Qué estás siguiendo?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'balanceado',
        label: 'Un reparto balanceado',
        hint: '25% P · 45% C · 30% G',
        answer: 'El reparto balanceado es 25% proteína, 45% carbohidratos y 30% grasa.',
        yes: [
          'Sirve de base para cualquiera que no siga una dieta concreta',
          'Cae dentro de los rangos aceptables de macronutrientes (AMDR) del IOM',
          'Los gramos salen de dividir las calorías de cada macro por 4, 4 y 9',
        ],
        warn: [
          DISCLAIMER,
          'Los porcentajes son un punto de partida, no una prescripción: el número que más cambia resultados es la adherencia, no el decimal del reparto',
        ],
        plazo: 'dale 3 o 4 semanas antes de juzgar un reparto nuevo.',
      },
      {
        id: 'alta-proteina',
        label: 'Alta en proteína',
        hint: '35% P · 40% C · 25% G',
        answer: 'Alta en proteína son 35% de las calorías en proteína.',
        yes: [
          'Pensada para preservar masa magra en déficit o ganar músculo',
          'Es el reparto con mayor saciedad por caloría',
          'Verificá que los gramos por kilo caigan en 1,6-2,2 g/kg',
        ],
        warn: [
          DISCLAIMER,
          'Con enfermedad renal, la carga proteica alta se indica y se controla con el profesional: no se decide por porcentaje',
          'Subir proteína y no bajar el resto no es un reparto: son más calorías',
        ],
        plazo: 'repartí la proteína en 3 o 4 comidas: de una sola vez se aprovecha peor.',
      },
      {
        id: 'lowcarb',
        label: 'Low carb',
        hint: '30% P · 25% C · 45% G',
        answer: 'Low carb baja los carbos al 25% y sube la grasa al 45%.',
        yes: [
          'Reduce carbohidratos sin llegar a cetosis',
          'La grasa toma el lugar calórico que dejan los carbos',
          'Suele bajar peso rápido las primeras dos semanas por pérdida de agua',
        ],
        warn: [
          DISCLAIMER,
          'La bajada inicial de 1 a 2 kg es glucógeno y agua, no grasa: se recupera al volver a comer carbos',
          'Si entrenás fuerte, con carbos bajos el rendimiento en series largas cae',
        ],
        plazo: 'los primeros 10 días suelen dar cansancio hasta que el cuerpo se adapta.',
      },
      {
        id: 'keto',
        label: 'Keto (cetogénica)',
        hint: '25% P · 5% C · 70% G',
        answer: 'La keto clásica es 70% grasa, 25% proteína y 5% carbohidratos.',
        yes: [
          'Los carbos quedan en un puñado de gramos netos por día para inducir cetosis',
          'La grasa pasa a ser la fuente principal de energía',
          'Es la dieta más sensible al detalle: un desliz de carbos corta la cetosis',
        ],
        warn: [
          DISCLAIMER,
          'La keto terapéutica (epilepsia refractaria y otras indicaciones) se hace bajo supervisión médica y nutricional, no por cuenta propia',
          'Con diabetes tipo 1, medicación hipoglucemiante, embarazo, lactancia o antecedentes de trastorno de la conducta alimentaria, no se arranca sin profesional',
          'La "gripe keto" de los primeros días suele ser deshidratación y pérdida de electrolitos',
        ],
        plazo: 'la cetosis nutricional aparece a los 2-4 días de carbos muy bajos.',
      },
      {
        id: 'paleo',
        label: 'Paleo',
        hint: '30% P · 30% C · 40% G',
        answer: 'Paleo reparte 30% proteína, 30% carbos y 40% grasa.',
        yes: [
          'Los carbos vienen de frutas y verduras, sin cereales ni legumbres',
          'Proteína y grasa quedan altas respecto de un reparto convencional',
          'Sacar cereales y legumbres baja fibra: compensala con verduras y frutos secos',
        ],
        warn: [
          DISCLAIMER,
          'Excluir legumbres y lácteos deja huecos de calcio y de fibra que hay que cubrir a propósito',
        ],
        plazo: 'revisá el calcio del día: sin lácteos hay que buscarlo en otro lado.',
      },
      {
        id: 'mediterranea',
        label: 'Mediterránea',
        hint: '15% P · 50% C · 35% G',
        answer: 'La mediterránea es 50% carbos integrales, 35% grasa y 15% proteína.',
        yes: [
          'La grasa viene sobre todo del aceite de oliva, los frutos secos y el pescado',
          'Los carbos son integrales: es el reparto con más evidencia cardiovascular acumulada',
          'Es un patrón alimentario, no sólo un porcentaje',
        ],
        warn: [
          DISCLAIMER,
          'El 35% de grasa sólo tiene sentido si la fuente es la que la dieta describe: aceite de oliva y pescado, no fritura',
        ],
        plazo: 'el beneficio se mide en años de patrón sostenido, no en semanas.',
      },
      {
        id: 'dash',
        label: 'DASH (para la presión)',
        hint: '18% P · 55% C · 27% G',
        answer: 'DASH es 55% carbos, 27% grasa, 18% proteína y sodio por debajo de 2.300 mg.',
        yes: [
          'Diseñada para bajar la presión arterial',
          'El macro que menos importa acá es el reparto: la palanca real es el sodio',
          'Objetivo de sodio: menos de 2.300 mg/día, e idealmente 1.500 mg',
        ],
        warn: [
          DISCLAIMER,
          'DASH no reemplaza la medicación antihipertensiva: se suma a ella y cualquier cambio de dosis lo decide tu médico',
          'El potasio de la dieta DASH es alto: con enfermedad renal eso se controla',
        ],
        plazo: 'el efecto sobre la presión aparece en 2 a 4 semanas de adherencia.',
      },
      {
        id: 'cut',
        label: 'Estoy en déficit (definición)',
        hint: '−20% de calorías',
        answer: 'En definición se come un 20% por debajo del mantenimiento, con proteína alta.',
        yes: [
          'Las calorías objetivo son el 80% de tus calorías de mantenimiento',
          'Proteína al 30% y grasa al 25%: el resto son carbos',
          'La proteína alta es lo que protege el músculo mientras bajás grasa',
        ],
        warn: [
          DISCLAIMER,
          'Un déficit mayor al 20-25% sostenido acelera la pérdida de masa magra y hunde el rendimiento',
          'En embarazo, lactancia o adolescencia no se planifica un déficit sin profesional',
        ],
        plazo: 'medí el progreso cada 2 semanas con el promedio de peso, no día a día.',
      },
      {
        id: 'recomp',
        label: 'Recomposición (mantenimiento)',
        hint: 'Calorías al 100%',
        answer: 'En recomposición se come el mantenimiento con proteína alta.',
        yes: [
          'Comés tus calorías de mantenimiento y cambiás la composición, no el peso',
          'Proteína al 30% y grasa al 25%; el resto, carbos',
          'Funciona mejor en principiantes, en quien vuelve a entrenar y con sobrepeso',
        ],
        warn: [
          DISCLAIMER,
          'Es el camino más lento en la balanza: si mirás sólo el peso vas a creer que no pasa nada',
        ],
        plazo: 'los cambios de recomposición se ven en 8 a 12 semanas, no antes.',
      },
      {
        id: 'lean-bulk',
        label: 'Volumen limpio (lean bulk)',
        hint: '+12% de calorías',
        answer: 'El volumen limpio es un 12% por encima del mantenimiento.',
        yes: [
          'Superávit chico para ganar músculo minimizando la grasa',
          'Proteína al 30% y grasa al 25%; el resto, carbos para entrenar',
          'El ritmo esperable es 0,25-0,5% del peso corporal por semana',
        ],
        warn: [
          DISCLAIMER,
          'Sin un estímulo de fuerza progresivo, el superávit es grasa y nada más',
        ],
        plazo: 'si en 4 semanas no subiste nada, el superávit no era tal.',
      },
      {
        id: 'bulk',
        label: 'Volumen (bulk)',
        hint: '+22% de calorías',
        answer: 'El volumen clásico es un 22% por encima del mantenimiento.',
        yes: [
          'Superávit amplio: más margen para ganar, más grasa de acompañamiento',
          'Proteína al 30% y grasa al 25%; el resto, carbos',
          'Tiene sentido en fases cortas y con entrenamiento serio',
        ],
        warn: [
          DISCLAIMER,
          'La ganancia muscular tiene un techo semanal: por encima de cierto superávit lo que sube es grasa, no músculo',
        ],
        plazo: 'las fases de volumen se planifican con fecha de salida, no abiertas.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Las calorías de mantenimiento salen del hub de calorías diarias; si no las tenés, dejá el ejemplo.',
  fields: [
    {
      id: 'calorias',
      label: 'Tus calorías de mantenimiento',
      type: 'number',
      min: 800,
      max: 6000,
      step: 50,
      value: 2200,
      suffix: 'kcal',
      help: 'Es tu gasto energético total diario (TDEE). En las ramas de déficit y volumen se le aplica el ajuste de la fase.',
    },
    { id: 'peso', label: 'Tu peso', type: 'number', min: 30, max: 250, value: 70, suffix: 'kg' },
    {
      id: 'comidas',
      label: 'Comidas por día',
      type: 'number',
      min: 1,
      max: 8,
      value: 4,
      help: 'Sólo se usa para repartir la proteína entre las comidas.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'De dónde salen tus calorías',
    caption:
      'Cada porción son las calorías que aporta ese macronutriente, no los gramos. Por eso la grasa siempre ocupa más de lo que su peso sugiere: rinde 9 kcal por gramo contra las 4 de la proteína y los carbos.',
  },
  breakdownTitle: 'Tus macros en gramos',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuántas calorías tiene un gramo de cada macronutriente?',
      a: 'Proteína 4 kcal/g, carbohidratos 4 kcal/g y grasa 9 kcal/g. El alcohol, que no es un macronutriente esencial, aporta 7 kcal/g. Todo el cálculo de macros es esa conversión: se reparte el total de calorías en porcentajes y cada porción se divide por su densidad.',
    },
    {
      q: '¿Qué reparto de macros es el mejor?',
      a: 'A igualdad de calorías y de proteína, las diferencias entre repartos en pérdida de grasa son chicas. El reparto que funciona es el que podés sostener. La excepción es la proteína: subirla sí cambia resultados de composición corporal y saciedad.',
    },
    {
      q: '¿Cuánta proteína me toca en gramos por kilo?',
      a: 'Para preservar o ganar músculo, la referencia habitual es 1,6 a 2,2 g por kilo de peso corporal. Si el porcentaje que elegiste te deja por debajo de 1,6 g/kg, conviene subir el porcentaje de proteína en vez de aumentar las calorías.',
    },
    {
      q: '¿Qué son los carbos netos en keto?',
      a: 'Son los carbohidratos totales menos la fibra (y, en algunas cuentas, menos los polialcoholes), porque la fibra no eleva la glucemia. En una keto estricta el objetivo suele estar entre 20 y 50 g netos por día, que es lo que da el 5% de las calorías.',
    },
    {
      q: '¿Cuánto déficit es seguro?',
      a: 'Un 20% por debajo del mantenimiento es el estándar: sostenible, con buena preservación de masa magra. Por encima del 25% aumenta la pérdida de músculo, cae el rendimiento y sube la probabilidad de abandonar. En términos de peso, entre 0,5 y 1% del peso corporal por semana.',
    },
    {
      q: '¿Cuánto superávit para ganar músculo?',
      a: 'Entre un 10 y un 20% por encima del mantenimiento. El lean bulk usa el extremo bajo (+12%) porque la síntesis muscular tiene un techo semanal: pasarlo no acelera la ganancia, sólo agrega grasa que después hay que sacar.',
    },
    {
      q: '¿Se puede ganar músculo y perder grasa a la vez?',
      a: 'Sí, es la recomposición, y funciona sobre todo en principiantes, en quien vuelve después de una pausa y en personas con sobrepeso. Se come el mantenimiento con proteína alta y entrenamiento de fuerza. Es lento en la balanza y por eso frustra si sólo mirás el peso.',
    },
    {
      q: '¿La dieta DASH sirve sólo para la presión?',
      a: 'Es su objetivo original y donde tiene la evidencia más fuerte, pero el patrón (mucha verdura y fruta, lácteos descremados, granos integrales, poco sodio) sirve también como base cardiovascular general. La palanca principal de DASH no es el reparto de macros sino el sodio.',
    },
    {
      q: '¿Tengo que pesar toda la comida?',
      a: 'Al principio ayuda a calibrar el ojo, pero no es sostenible ni necesario a largo plazo. Después de unas semanas la mayoría estima bastante bien con porciones de referencia. Lo que conviene medir con cuidado son los aceites y los frutos secos: son los que más calorías esconden por volumen.',
    },
    {
      q: '¿De dónde saco mis calorías de mantenimiento?',
      a: 'De tu gasto energético total diario, que se estima con una ecuación como Mifflin-St Jeor multiplicada por un factor de actividad. Es el número que este hub toma como punto de partida: acá no se calcula, se reparte.',
    },
    {
      q: '¿Cambia el reparto si soy vegetariano?',
      a: 'El porcentaje no cambia, pero llegar a la proteína cuesta más porque las fuentes vegetales traen carbos o grasa de acompañamiento. Suele haber que apoyarse en legumbres, tofu, seitán, lácteos o un suplemento de proteína para no pasarse del total calórico.',
    },
  ],

  sources: [
    {
      name: 'Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids — rangos aceptables (AMDR)',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK56068/',
      publisher: 'Institute of Medicine / NASEM',
      date: '2002/2005',
    },
    {
      name: 'ISSN Position Stand: Diets and Body Composition',
      url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0174-y',
      publisher: 'Journal of the International Society of Sports Nutrition',
      date: '2017',
    },
    {
      name: 'DASH Eating Plan',
      url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan',
      publisher: 'National Heart, Lung, and Blood Institute (NIH)',
    },
    {
      name: 'The Mediterranean Diet — evidencia y patrón alimentario',
      url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
      publisher: 'Organización Mundial de la Salud',
    },
  ],

  replaces: [
    '/calculadora-macros-distribucion-proteina-carbos-grasas',
    '/calculadora-macros-keto-dieta',
    '/calculadora-macros-paleo-dieta',
    '/calculadora-macros-mediterranea',
    '/calculadora-macros-dash-hipertension',
    '/calculadora-macros-deficit-volumen-mantenimiento',
    '/calculadora-macros-recomp-cut-bulk-lean-calorias',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-macronutrientes-dieta',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Vector de cada rama: multiplicador sobre las calorías de mantenimiento y
 * porcentajes de proteína / carbohidratos / grasa. Los números son los de las
 * fórmulas originales de src/lib/formulas/macros*.ts.
 */
export const MACRO_CASES: Record<string, { mult: number; p: number; c: number; g: number; nota?: string }> = {
  balanceado: { mult: 1, p: 0.25, c: 0.45, g: 0.30 },
  'alta-proteina': { mult: 1, p: 0.35, c: 0.40, g: 0.25 },
  lowcarb: { mult: 1, p: 0.30, c: 0.25, g: 0.45 },
  keto: { mult: 1, p: 0.25, c: 0.05, g: 0.70 },
  paleo: { mult: 1, p: 0.30, c: 0.30, g: 0.40 },
  mediterranea: { mult: 1, p: 0.15, c: 0.50, g: 0.35 },
  dash: { mult: 1, p: 0.18, c: 0.55, g: 0.27, nota: 'sodio por debajo de 2.300 mg/día' },
  cut: { mult: 0.80, p: 0.30, c: 0.45, g: 0.25 },
  recomp: { mult: 1.00, p: 0.30, c: 0.45, g: 0.25 },
  'lean-bulk': { mult: 1.12, p: 0.30, c: 0.45, g: 0.25 },
  bulk: { mult: 1.22, p: 0.30, c: 0.45, g: 0.25 },
};

/** kcal por gramo de cada macronutriente. */
export const KCAL_POR_G = { p: 4, c: 4, g: 9 };
