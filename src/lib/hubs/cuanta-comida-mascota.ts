import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta comida le doy a mi mascota?"
 *
 * Arquetipo RAMIFICADO: la ración se calcula distinto según la especie y la
 * etapa, así que cada caso es una especie (perro adulto, cachorro, gato,
 * conejo, tortuga). Absorbe 10 URLs de calculadora suelta (ver hub.replaces),
 * incluidas las dos "por raza" (bulldog francés y yorkshire), que usaban la
 * misma ecuación RER/MER con otros factores.
 *
 * NOTAS DE CONTRATO:
 *  - Acá NO hay pesos: el resultado declara `format:'unit'` y CADA fila declara
 *    el suyo (gramos, kcal, tomas, ml). Una fila sin `format` cae a "$" y la
 *    página miente.
 *  - `chart.type: 'donut'` = composición: en perro/gato/cachorro reparte las
 *    kcal entre metabolismo basal y sobrecarga por etapa/actividad; en conejo
 *    reparte los gramos entre heno, verduras y pellets.
 *  - Es salud animal (categoría `mascotas` → dominio `pets` en
 *    `getCalculatorDisclaimer`): el copy no da indicación clínica.
 */
export const hub: HubData = {
  slug: 'mascotas/cuanta-comida',
  title: '¿Cuánta comida le doy a mi mascota? Gramos por día según peso y edad',
  description:
    'Calculá los gramos diarios de tu perro, gato, cachorro, conejo o tortuga con la ecuación veterinaria real (RER = 70 × peso^0,75 × factor de etapa). Cuántas tomas, cuánto dura la bolsa y cuánta agua necesita.',
  silo: 'Mascotas',
  siloHref: '/mascotas',

  eyebrow: 'Guía y estimación para mascotas',
  h1: '¿Cuánta comida le doy a mi mascota?',
  lede:
    'La medida del envase es un promedio de fábrica: sirve para vender bolsas, no para tu animal. La cuenta que usan los veterinarios arranca del metabolismo en reposo —70 × peso^0,75— y la multiplica por un factor según la etapa de vida, la actividad y si está castrado. Elegí la especie, poné el peso y salen los gramos del día, en cuántas tomas repartirlos y cuánto te va a durar la bolsa.',
  stamps: ['Actualizado 27-07-2026', 'Ecuación RER/MER — WSAVA Global Nutrition Guidelines', '10 calculadoras adentro'],

  resultLabel: 'Su ración de hoy',

  cases: {
    title: 'Perro adulto',
    intro: 'Elegí la especie y la etapa: la ecuación es la misma, pero el factor y la densidad del alimento cambian mucho.',
    items: [
      {
        id: 'perro',
        label: 'Perro adulto o senior',
        hint: 'Balanceado seco, ración diaria repartida en dos tomas.',
        yes: [
          'Metabolismo en reposo: RER = 70 × peso^0,75 kcal/día',
          'Factor de mantenimiento: 1,8 activo · 1,6 estándar · 1,4 sedentario, castrado o senior · 1,2 senior tranquilo',
          'Densidad del alimento: 3,3 kcal/g estándar y 3,9 kcal/g super premium',
          'Dos tomas diarias y la cuenta de cuánto te dura una bolsa de 15 kg',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Calculá siempre sobre el peso IDEAL, no sobre el actual, si el perro está pasado de kilos: si no, le das de comer para seguir gordo',
          'La densidad real de tu marca está en la etiqueta (kcal/kg o kcal/100 g): si difiere, ajustá los gramos en proporción',
          'Castrado y sedentario es el perfil que más engorda: pesá la ración con balanza, la taza medidora se llena distinto cada vez',
        ],
        plazo: 'repesá al perro cada 4 a 8 semanas y recalculá si cambió más de un 5% del peso.',
        answer: 'Un perro adulto de 20 kg con actividad media necesita unas 1.500 kcal/día, o sea unos 455 g de balanceado estándar repartidos en dos tomas.',
      },
      {
        id: 'cachorro',
        label: 'Cachorro de perro',
        hint: 'Crece rápido: la ración se recalcula cada dos o tres semanas.',
        yes: [
          'Factor por edad: ×3,0 hasta los 4 meses, ×2,5 de 4 a 8, ×2,0 de 8 a 12 y ×1,8 pasado el año',
          'Ajuste por tamaño adulto: las razas grandes van al 85% y las gigantes al 75% para no forzar el crecimiento',
          'Densidad del balanceado puppy: 3,8 kcal/g',
          'Tomas: 4 hasta los 4 meses, 3 hasta los 6 y 2 de ahí en adelante',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'En razas grandes y gigantes el exceso de calorías y de calcio provoca displasia y osteocondrosis: crecer rápido no es crecer bien',
          'En cachorros toy de menos de 4 meses no dejes pasar más de 3 o 4 horas sin comida: el riesgo real es la hipoglucemia',
          'La transición al alimento adulto va gradual, mezclando durante 7 a 14 días',
        ],
        plazo: 'recalculá la ración cada 2 o 3 semanas mientras el cachorro siga ganando peso.',
        answer: 'Un cachorro de 5 kg y 3 meses necesita unas 700 kcal/día, cerca de 185 g de balanceado puppy repartidos en 4 tomas.',
      },
      {
        id: 'gato',
        label: 'Gato',
        hint: 'Gasta menos que un perro del mismo peso, sobre todo si es indoor.',
        yes: [
          'Factor felino: ×2,5 gatito hasta 4 meses, ×2,0 gatito de 4 a 12 meses, ×1,4 adulto con salidas, ×1,0 adulto indoor o castrado, ×1,1 senior',
          'Densidades: 3,8 kcal/g el seco y 0,9 kcal/g el húmedo (por eso el húmedo pesa mucho más para las mismas calorías)',
          'Litros de agua: los gatos beben poco y con alimento seco hay que asegurar unos 60 ml por kilo',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'El plato lleno todo el día es la vía rápida al sobrepeso felino y de ahí a la diabetes',
          'Nunca pongas a un gato con sobrepeso en ayuno ni en dieta brusca: la pérdida rápida de peso dispara lipidosis hepática, que es grave',
          'Si toma mucha más agua que antes sin cambio de dieta, es consulta veterinaria: riñón o tiroides',
        ],
        plazo: 'controlá el peso cada 2 meses; desde los 7 años el control veterinario pasa a ser semestral.',
        answer: 'Un gato indoor castrado de 4 kg necesita unas 198 kcal/día, o sea unos 52 g de alimento seco (o 220 g de húmedo).',
      },
      {
        id: 'conejo',
        label: 'Conejo',
        hint: 'El heno no se pesa: va ilimitado. Lo que se mide son los pellets.',
        yes: [
          'Heno: mínimo 40 g por kilo de conejo por día, pero siempre disponible sin límite (es el 80% de la dieta)',
          'Verduras de hoja: 100 g por kilo por día en el adulto',
          'Pellets: 25 g por kilo en el adulto, 20 g en el senior y casi libres en el gazapo',
          'Agua: unos 100 ml por kilo por día',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Un conejo que deja de comer o de defecar 12 horas es una urgencia veterinaria: la estasis gastrointestinal mata',
          'La alfalfa es para gazapos y hembras lactantes; en el adulto el exceso de calcio favorece barro vesical y cálculos',
          'Nada de mezclas con semillas, cereales de colores ni pan: el conejo elige lo dulce y deja el pellet',
        ],
        plazo: 'pesá al conejo una vez por mes y revisá los dientes en cada control.',
        answer: 'Un conejo adulto de 2 kg come 80 g de heno como piso (ilimitado), 200 g de verduras y 50 g de pellets por día.',
      },
      {
        id: 'tortuga',
        label: 'Tortuga',
        hint: 'Se calcula como porcentaje del peso corporal, no en tomas.',
        yes: [
          'Ración diaria: 4,5% del peso corporal en crías, 3% en juveniles y 2% en adultas',
          'Las acuáticas comen un 30% menos que las terrestres del mismo peso',
          'Terrestre: 70% hojas verdes oscuras, 20% otros vegetales y hasta 10% de fruta ocasional',
          'Acuática: balanceado específico más verduras, con proteína animal ocasional',
        ],
        warn: [
          'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo.',
          'Sin lámpara UVB la tortuga no fija el calcio aunque coma perfecto: el resultado es caparazón blando y deforme',
          'En la acuática, retirá lo que no coma: la comida en descomposición arruina el agua y trae infecciones',
          'Prohibidos: lechuga iceberg, pan, lácteos, chocolate, cebolla, ajo y comida humana condimentada',
        ],
        plazo: 'suplementá calcio a diario y reemplazá el tubo UVB cada 6 a 12 meses aunque siga encendiendo.',
        answer: 'Una tortuga terrestre juvenil de 500 g come unos 15 g de vegetales por día, con calcio diario y UVB.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu animal',
  inputsIntro:
    'El peso es lo único imprescindible. Etapa, actividad y tipo de alimento afinan el número; si no los sabés, dejá los valores por defecto.',
  fields: [
    {
      id: 'peso',
      label: 'Peso del animal',
      type: 'number',
      suffix: 'kg',
      min: 0.05,
      max: 100,
      step: 0.1,
      value: 20,
      help: 'Si está pasado de peso, usá el peso ideal, no el de la balanza. En tortugas podés poner decimales: 500 g son 0,5.',
    },
    {
      id: 'etapa',
      label: 'Etapa de vida',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'bebe', label: 'Cría o gazapo · cachorro de hasta 4 meses' },
        { value: 'juvenil', label: 'Juvenil · cachorro de 4 a 8 meses' },
        { value: 'adulto', label: 'Adulto · cachorro de 8 a 12 meses' },
        { value: 'senior', label: 'Senior (más de 7 años) · cachorro de más de 12 meses' },
      ],
      help: 'En el caso "cachorro" cada opción es un tramo de edad y define el factor de crecimiento (×3,0 · ×2,5 · ×2,0 · ×1,8). En tortugas define el porcentaje del peso corporal.',
    },
    {
      id: 'actividad',
      label: 'Nivel de actividad',
      type: 'select',
      value: 'media',
      options: [
        { value: 'baja', label: 'Baja — casi todo el día adentro' },
        { value: 'media', label: 'Media — paseos o juego diario' },
        { value: 'alta', label: 'Alta — deporte, trabajo o mucha calle' },
      ],
      help: 'No aplica a tortugas ni cambia la ración de heno del conejo.',
    },
    {
      id: 'alimento',
      label: 'Tipo de alimento',
      type: 'select',
      value: 'estandar',
      options: [
        { value: 'estandar', label: 'Seco estándar (3,3 kcal/g en perro · 3,8 en gato)' },
        { value: 'premium', label: 'Seco super premium (3,9 kcal/g)' },
        { value: 'humedo', label: 'Húmedo / lata (0,9 kcal/g)' },
      ],
      help: 'Mirá la etiqueta: dice kcal/kg o kcal/100 g. Si tu marca difiere, ajustá los gramos en proporción.',
    },
    {
      id: 'castrado',
      label: '¿Está castrado o esterilizado?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Después de la cirugía el gasto energético baja: es el factor que más sobrepeso genera si no se ajusta la ración.',
    },
    {
      id: 'tamanoAdulto',
      label: 'Tamaño adulto de la raza (sólo cachorros)',
      type: 'select',
      value: 'mediano',
      options: [
        { value: 'mini', label: 'Toy o mini (hasta 5 kg de adulto)' },
        { value: 'chico', label: 'Chica (5 a 10 kg)' },
        { value: 'mediano', label: 'Mediana (10 a 25 kg)' },
        { value: 'grande', label: 'Grande (25 a 45 kg)' },
        { value: 'gigante', label: 'Gigante (más de 45 kg)' },
      ],
      help: 'Las razas grandes y gigantes llevan un ajuste a la baja para que el crecimiento sea lento y las articulaciones aguanten.',
    },
  ],
  fineprint:
    'Resultado orientativo: no reemplaza la evaluación de un veterinario. No mediques ni cambies la alimentación de tu mascota sólo con este cálculo. La ecuación RER/MER es una estimación poblacional: el gasto real de un animal concreto puede desviarse un 20% para arriba o para abajo, y quien manda es la condición corporal (costillas palpables sin apretar, cintura visible desde arriba).',

  chart: {
    type: 'donut',
    title: 'De dónde salen esas calorías',
    caption:
      'En perro, gato y cachorro el gráfico parte la energía diaria en dos: lo que el animal gasta sólo por estar vivo (RER) y lo que suma por su etapa de vida y su actividad. En conejo reparte los gramos del plato entre heno, verduras y pellets, y en tortuga entre hojas, vegetales y fruta.',
  },
  breakdownTitle: 'La ración, número por número',
  breakdownIntro:
    'Todo en gramos, kilocalorías, mililitros o cantidad de tomas: no hay pesos en esta página. Las barras comparan cada valor contra el mayor.',

  faq: [
    {
      q: '¿Cuántos gramos de comida le doy a mi perro por día?',
      a: 'Depende del peso y de la etapa, no del tamaño del plato. La cuenta veterinaria es RER = 70 × peso^0,75 kcal, multiplicado por el factor de mantenimiento: 1,8 si es activo, 1,6 estándar, 1,4 si es sedentario, castrado o senior. Esas calorías se dividen por la densidad del alimento (3,3 kcal/g en un seco estándar, 3,9 en un super premium). Un perro de 20 kg con actividad media da unas 1.500 kcal, es decir unos 455 g de balanceado estándar por día.',
    },
    {
      q: '¿Y si mi perro está pasado de peso?',
      a: 'Calculá sobre el peso ideal, no sobre el de la balanza: si usás el peso actual le estás dando exactamente lo que necesita para seguir gordo. La reducción se hace gradual, del orden del 10 al 20% por debajo del mantenimiento del peso objetivo, y con controles de peso cada dos semanas. En el gato esto es todavía más delicado: una bajada brusca puede provocar lipidosis hepática, así que el plan de descenso felino lo tiene que llevar un veterinario.',
    },
    {
      q: '¿Cuánta comida come un gato por día?',
      a: 'Bastante menos de lo que la gente supone. Un gato adulto indoor o castrado se calcula con factor 1,0 sobre su RER: 4 kg dan unas 198 kcal/día, que son unos 52 g de alimento seco o unos 220 g de húmedo. El húmedo pesa mucho más para las mismas calorías porque es agua en su mayor parte, y por eso mismo ayuda a los gatos que beben poco.',
    },
    {
      q: '¿Cuántas veces por día le doy de comer?',
      a: 'Perro adulto y gato adulto: dos tomas. Cachorro de perro: cuatro hasta los 4 meses, tres hasta los 6 y dos de ahí en adelante. Gatito: cuatro si pesa menos de 2 kg y tres después. En cachorros de razas toy la frecuencia no es un capricho: pasar muchas horas sin comer les baja la glucemia y eso sí es una urgencia.',
    },
    {
      q: '¿Cuánto me dura una bolsa de 15 kg?',
      a: 'Se divide 15.000 g por la ración diaria. Un perro de 20 kg que come 455 g por día vacía la bolsa en unos 33 días; uno de 10 kg que come 270 g la estira a unos 55. Sirve para dos cosas: planificar la compra y detectar que estás dando de más, porque si la bolsa se termina mucho antes de lo que dice la cuenta, alguien está sirviendo a ojo.',
    },
    {
      q: '¿Cuánto come un cachorro según la edad?',
      a: 'El factor arranca en 3,0 veces el RER hasta los 4 meses, baja a 2,5 entre los 4 y los 8, a 2,0 entre los 8 y los 12 y a 1,8 después del año. Con balanceado puppy de 3,8 kcal/g, un cachorro de 5 kg y 3 meses come unos 185 g diarios. Lo importante es recalcular cada dos o tres semanas: a esa edad el peso cambia rápido y una ración vieja se queda corta enseguida.',
    },
    {
      q: '¿Por qué las razas grandes comen proporcionalmente menos de cachorras?',
      a: 'Porque en ellas el enemigo es crecer rápido. Un exceso de calorías —y de calcio— en un cachorro de raza grande o gigante acelera el crecimiento óseo por encima de lo que la articulación puede consolidar, y eso se paga con displasia de cadera y osteocondrosis. Por eso la ración lleva un ajuste al 85% en razas grandes y al 75% en gigantes, y por eso la transición a alimento adulto se estira hasta los 15 a 24 meses.',
    },
    {
      q: '¿Cuánto heno tiene que comer mi conejo?',
      a: 'Todo el que quiera: el heno va ilimitado y tiene que representar cerca del 80% de la dieta. El piso de referencia son 40 g por kilo de conejo por día, pero es un mínimo para calcular la compra, no una ración. El heno de pasto —timothy, ballica, brome— es el del adulto; la alfalfa queda para gazapos y hembras lactantes, porque su exceso de calcio favorece barro vesical y cálculos.',
    },
    {
      q: '¿Cuánta comida le doy a mi tortuga?',
      a: 'Se mide como porcentaje del peso corporal: alrededor del 4,5% diario en crías, 3% en juveniles y 2% en adultas, y las acuáticas comen cerca de un 30% menos que las terrestres del mismo peso. Una terrestre juvenil de 500 g come unos 15 g de vegetales por día. Más importante que el gramaje: calcio a diario y lámpara UVB, porque sin UVB no fija el calcio por bien que coma.',
    },
    {
      q: '¿La castración cambia cuánto tiene que comer?',
      a: 'Sí, y bastante. Después de la cirugía el gasto energético cae, así que el factor de mantenimiento baja a 1,4 en el perro y a 1,0 en el gato. Si nadie ajusta la ración, el animal sigue comiendo para un metabolismo que ya no tiene y el sobrepeso aparece en cuestión de meses. Es el motivo más común de obesidad en gatos de departamento.',
    },
    {
      q: '¿Sirve la tabla que viene en la bolsa de alimento?',
      a: 'Como punto de partida, sí; como verdad, no. Las tablas del envase están calculadas para un animal promedio, entero y de actividad media, y por eso casi siempre quedan por encima de lo que necesita un adulto castrado de departamento. Lo que sí conviene tomar del envase es la densidad calórica (kcal/kg o kcal/100 g), porque es el dato que convierte las calorías de la cuenta en gramos reales de tu marca.',
    },
    {
      q: '¿Cómo sé si le estoy dando la cantidad correcta?',
      a: 'Con las manos y la balanza, no con la vista. Tenés que poder palpar las costillas pasando la mano con presión suave, y ver una cintura marcada mirando al animal desde arriba y desde el costado. Si las costillas no se palpan, sobra comida; si se ven a simple vista, falta. Repesá cada 4 a 8 semanas y recalculá cuando el peso se mueva más de un 5%.',
    },
  ],

  sources: [
    {
      name: 'WSAVA Global Nutrition Guidelines — evaluación nutricional y cálculo de requerimiento energético',
      url: 'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
      publisher: 'World Small Animal Veterinary Association',
    },
    {
      name: 'AAHA Nutrition and Weight Management Guidelines for Dogs and Cats',
      url: 'https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/',
      publisher: 'American Animal Hospital Association',
      date: '2021',
    },
    {
      name: 'National Research Council — Nutrient Requirements of Dogs and Cats',
      url: 'https://nap.nationalacademies.org/catalog/10668/nutrient-requirements-of-dogs-and-cats',
      publisher: 'National Academies Press',
    },
    {
      name: 'House Rabbit Society — What should I feed my bunny?',
      url: 'https://rabbit.org/care/what-to-feed-your-rabbit/',
      publisher: 'House Rabbit Society',
    },
    {
      name: 'WALTHAM / Salt C. et al. — Growth standard charts for monitoring bodyweight in dogs of different sizes (PLOS ONE, 2017)',
      url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0182064',
      publisher: 'PLOS ONE',
      date: '2017',
    },
    {
      name: 'Tortoise Trust — Feeding and diet in chelonians',
      url: 'https://www.tortoisetrust.org/articles/feeding.html',
      publisher: 'The Tortoise Trust',
    },
  ],

  replaces: [
    '/calculadora-comida-perro-diaria-gramos',
    '/calculadora-comida-gato-diaria-gramos',
    '/calculadora-comida-cachorro-gramos-edad',
    '/calculadora-alimento-diario-perro',
    '/calculadora-calorias-perro-por-raza-edad',
    '/calculadora-comida-bulldog-frances-cantidad-edad-peso',
    '/calculadora-comida-yorkshire-terrier-porcion-diaria-edad',
    '/calculadora-comida-diaria-conejo-peso',
    '/calculadora-conejo-comida-heno-peso-edad',
    '/calculadora-comida-tortuga-diaria-gramos',
  ],

  lastReviewed: '2026-07-27',
  audience: 'global',
};

/**
 * Factores de mantenimiento (MER = RER × factor), calcados de los módulos
 * reales `comida-perro-diaria.ts`, `comida-gato-diaria.ts` y
 * `comida-cachorro-gramos-edad.ts`.
 */
export const FACTORES = {
  perro: { bebe: 3.0, juvenil: 2.0, adultoAlta: 1.8, adultoMedia: 1.6, adultoBaja: 1.4, castrado: 1.4, seniorActivo: 1.4, senior: 1.2 },
  gato: { bebe: 2.5, juvenil: 2.0, adultoActivo: 1.4, adultoInterior: 1.0, castrado: 1.0, senior: 1.1 },
  /**
   * Cachorro: factor por edad, calcado de `comida-cachorro-gramos-edad.ts`.
   * Los tramos originales son <4 meses ×3,0 · 4-8 ×2,5 · 8-12 ×2,0 · 12+ ×1,8,
   * y por eso las cuatro opciones del select `etapa` representan esos tramos en
   * el caso "cachorro" (no las etapas de vida del adulto).
   */
  cachorro: { bebe: 3.0, juvenil: 2.5, adulto: 2.0, senior: 1.8 },
};

/** Ajuste del cachorro por tamaño adulto de la raza. Calcado de FACTOR_TAMANO. */
export const AJUSTE_TAMANO: Record<string, number> = {
  mini: 1.0,
  chico: 1.0,
  mediano: 1.0,
  grande: 0.85,
  gigante: 0.75,
};

/** Densidad calórica en kcal/g por especie y tipo de alimento. */
export const DENSIDAD: Record<string, Record<string, number>> = {
  perro: { estandar: 3.3, premium: 3.9, humedo: 0.9 },
  cachorro: { estandar: 3.8, premium: 3.8, humedo: 0.9 },
  gato: { estandar: 3.8, premium: 3.8, humedo: 0.9 },
};

/**
 * Conejo: gramos por kilo de conejo y por día, calcado de
 * `comida-diaria-conejo-peso.ts` (heno 40, verduras 100, pellets 25/50/20)
 * más los ajustes por condición y actividad.
 */
export const CONEJO = {
  henoPorKg: 40,
  verdurasPorKg: 100,
  verdurasCriaPorKg: 50,
  pelletsAdultoPorKg: 25,
  pelletsCriaPorKg: 50,
  pelletsSeniorPorKg: 20,
  aguaPorKg: 100,
  /** Merma de almacenamiento y desperdicio al calcular el heno del mes. */
  factorDesperdicioMes: 1.3,
};

/**
 * Tortuga: porcentaje del peso corporal por día, calcado de
 * `comida-tortuga-diaria-gramos.ts`. Las acuáticas comen un 30% menos.
 */
export const TORTUGA = {
  cria: 0.045,
  juvenil: 0.03,
  adulto: 0.02,
  factorAcuatica: 0.7,
  /** Composición del plato terrestre: hojas / vegetales / fruta. */
  hojas: 0.7,
  vegetales: 0.2,
  fruta: 0.1,
};
