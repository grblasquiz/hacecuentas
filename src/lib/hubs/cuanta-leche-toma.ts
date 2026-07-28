import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta leche toma mi bebé por día?"
 * Arquetipo RAMIFICADO: la rama es el TIPO DE ALIMENTACIÓN (fórmula exclusiva,
 * pecho exclusivo, mixta, o ya con sólidos), que cambia el volumen que hay que
 * preparar y qué se espera del bebé.
 *
 * Absorbe 6 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs — no se pisan:
 *   · /bebes/crecimiento          → percentiles de peso y talla, edad corregida
 *   · /salud/cuanto-dormir        → horas de sueño y siestas
 *   · /familia/costo-de-un-bebe   → el gasto mensual completo (pañales, jardín)
 *   Este responde volumen: mililitros por toma, tomas por día y latas por mes.
 *
 * NÚMEROS: tabla SAP/AAP de ml/kg/día por semanas de vida, espejo de
 * src/lib/formulas/formula-leche-bebe-litros-mes-edad-marca.ts (150/140/130/
 * 120/110 ml/kg/día con 8/7/6/5/5 tomas), tope de 1.000 ml/día, y 40% del total
 * cuando la fórmula es suplementaria. Polvo: 1 g cada 7 ml preparados, lata de
 * 400 g, mes de 30,4 días. La progresión de sólidos sale de
 * src/lib/formulas/alimentacion-complementaria.ts.
 *
 * YMYL DE VIDA (bebés): aviso textual del dominio `health` de
 * src/lib/disclaimers.ts en `fineprint` y como PRIMER `warn` de cada rama, más
 * las advertencias específicas de preparación segura.
 *
 * NOTAS DE CONTRATO: el resultado principal son mililitros, no plata. TODA fila
 * lleva `format` explícito; la única fila en pesos lo declara con 'ars'.
 */

export const DISCLAIMER =
  'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.';

export const hub: HubData = {
  slug: 'bebes/cuanta-leche-toma',
  title: '¿Cuánta leche toma mi bebé por día? Mililitros por toma, tomas y latas por mes',
  description:
    'Cuántos mililitros necesita tu bebé por día según su peso y sus semanas de vida, en cuántas tomas repartirlos, cuántas latas de fórmula se van por mes y cuándo empiezan los sólidos.',
  silo: 'Bebés',
  siloHref: '/bebes',

  eyebrow: 'Guía y estimación de lactancia',
  h1: '¿Cuánta leche toma mi bebé?',
  lede:
    'La cuenta base son mililitros por kilo de peso, y el número por kilo baja a medida que el bebé crece. Partimos del caso más consultado —fórmula exclusiva— y ya podés ver los mililitros por toma, las tomas del día y las latas del mes. Si das el pecho o estás con lactancia mixta, lo cambiás abajo.',
  stamps: [
    'Tabla SAP/AAP de ml por kilo',
    'Latas por mes y gasto estimado',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Volumen diario',

  cases: {
    title: '¿Cómo se alimenta tu bebé?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'formula',
        label: 'Fórmula exclusiva',
        hint: 'Sólo biberón',
        answer: 'La referencia es 150 ml por kilo de peso por día en el primer mes.',
        yes: [
          'Volumen diario total, mililitros por toma y cantidad de tomas',
          'Gramos de polvo por día y latas de 400 g por mes',
          'Costo mensual estimado si cargás el precio de la lata',
        ],
        warn: [
          DISCLAIMER,
          'Preparación segura: agua potable hervida, respetar la proporción exacta del envase (una medida rasa por cada 30 ml). Diluir de más desnutre y concentrar de más sobrecarga el riñón',
          'La fórmula preparada no se guarda: lo que sobra de una toma se descarta, no se recalienta',
          'Nunca calentar el biberón en microondas: calienta de forma despareja y quema',
        ],
        plazo: 'el tope práctico es 1.000 ml por día: por encima de eso lo que falta son sólidos, no más leche.',
      },
      {
        id: 'pecho',
        label: 'Pecho exclusivo',
        hint: 'A demanda',
        answer: 'Con pecho exclusivo el bebé regula solo: las cifras son sólo referencia.',
        yes: [
          'Los volúmenes te sirven de referencia, pero el bebé regula la cantidad',
          'Lo que se mira no es el volumen sino el peso, los pañales mojados y las deposiciones',
          'La OMS recomienda pecho exclusivo hasta los 6 meses',
        ],
        warn: [
          DISCLAIMER,
          'La señal de que la lactancia va bien es la curva de peso y unos 6 pañales bien mojados por día, no los mililitros',
          'Un bebé que no recupera el peso de nacimiento a los 15 días, duerme de más o moja pocos pañales necesita consulta ese mismo día',
          'No hace falta ofrecer agua antes de los 6 meses: la leche ya la aporta',
        ],
        plazo: 'la producción se acomoda a la demanda: cuanto más se pone al pecho, más se produce.',
      },
      {
        id: 'mixta',
        label: 'Lactancia mixta',
        hint: 'Pecho y fórmula',
        answer: 'En lactancia mixta la fórmula suele cubrir cerca del 40% del volumen.',
        yes: [
          'El cálculo estima la fórmula como el 40% del volumen total del día',
          'El resto lo aporta el pecho, que no se mide en mililitros',
          'Las latas por mes bajan en la misma proporción',
        ],
        warn: [
          DISCLAIMER,
          'El orden importa: ofrecer primero el pecho y completar después ayuda a sostener la producción',
          'Cada biberón que reemplaza una puesta al pecho baja el estímulo y, con él, la producción',
        ],
        plazo: 'si la idea es volver al pecho exclusivo, la transición se hace acompañada por una puericultora o el pediatra.',
      },
      {
        id: 'solidos',
        label: 'Ya come sólidos',
        hint: '6 meses en adelante',
        answer: 'Desde los 6 meses la leche acompaña a los sólidos, no al revés.',
        yes: [
          'La leche sigue siendo el alimento principal hasta el año',
          'De 6 a 7 meses: purés o trozos blandos, 1 o 2 comidas por día',
          'De 8 a 9 meses: se suman legumbres, huevo bien cocido y carnes',
          'De 10 a 12 meses: casi todo, en trocitos',
        ],
        warn: [
          DISCLAIMER,
          'Nada de miel antes del año: riesgo de botulismo del lactante',
          'Sin sal ni azúcar agregada en el primer año',
          'Frutos secos enteros, uvas enteras y trozos duros y redondos son riesgo de atragantamiento hasta los 4 o 5 años',
          'La incorporación de sólidos antes de los 6 meses se hace sólo por indicación del pediatra',
        ],
        plazo: 'la OMS marca los 6 meses cumplidos como el momento de arrancar con sólidos.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'semanas', label: 'Edad del bebé', type: 'number', min: 0, max: 130, value: 12, suffix: 'semanas' },
    { id: 'peso', label: 'Peso del bebé', type: 'number', min: 1, max: 20, step: 0.1, value: 5.5, suffix: 'kg' },
    {
      id: 'precioLata',
      label: 'Precio de la lata de 400 g',
      prefix: '$',
      value: '32.000',
      thousands: true,
      help: 'Dejalo en 0 si no te interesa el costo. Sólo se usa para estimar el gasto del mes.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el día',
    caption:
      'Cada porción son los mililitros de una franja del día: las tomas de la mañana, las de la tarde y las de la noche. Sirve para ver el tamaño real de cada biberón contra el total, no para fijar horarios.',
  },
  breakdownTitle: 'La cuenta del día y del mes',
  breakdownIntro: 'Las barras comparan cada número con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuántos ml de leche toma un bebé por día?',
      a: 'La regla base son 150 ml por kilo de peso por día en el primer mes, y el número por kilo baja con la edad: unos 140 hasta las 8 semanas, 130 hasta las 16, 120 hasta las 24 y 110 después. Un bebé de 5,5 kg a las 12 semanas toma alrededor de 715 ml por día repartidos en 6 tomas.',
    },
    {
      q: '¿Cuántas tomas por día le corresponden?',
      a: 'Unas 8 en las primeras 4 semanas, 7 hasta las 8 semanas, 6 hasta los 4 meses y 5 de ahí en adelante. Son referencias: un bebé que se alimenta a demanda puede tener días de 7 tomas y días de 5, y eso también es normal.',
    },
    {
      q: '¿Hay un tope de leche por día?',
      a: 'Sí, alrededor de 1.000 ml diarios de fórmula. Por encima de ese volumen el bebé se llena de leche y deja lugar para poco más; si a partir de los 6 meses parece necesitar más, lo que falta son sólidos, no leche.',
    },
    {
      q: '¿Cuántas latas de fórmula se van por mes?',
      a: 'Con la proporción estándar de 1 g de polvo por cada 7 ml preparados, un bebé que toma 715 ml al día usa unos 102 g de polvo diarios, es decir cerca de 3.100 g al mes: unas 8 latas de 400 g. Conviene comprar siempre con una lata de margen.',
    },
    {
      q: '¿Cómo se prepara bien un biberón?',
      a: 'Agua potable hervida y enfriada, la medida rasa que indica el envase (habitualmente una cada 30 ml de agua), primero el agua y después el polvo. La proporción no se ajusta "a ojo": diluir de más deja al bebé sin calorías y concentrar de más sobrecarga el riñón.',
    },
    {
      q: '¿Se puede guardar la leche que sobró?',
      a: 'La fórmula que el bebé ya empezó a tomar se descarta al terminar la toma: la saliva contamina el resto. La fórmula preparada y no tocada se puede guardar en heladera hasta 24 horas, pero nunca a temperatura ambiente.',
    },
    {
      q: '¿Cómo sé si el bebé toma suficiente si le doy el pecho?',
      a: 'No se mide en mililitros: se mira la curva de peso en los controles, unos 6 pañales bien mojados por día a partir de la primera semana, deposiciones frecuentes en el primer mes y un bebé que se despierta a pedir y queda tranquilo después. Si algo de eso falla, es motivo de consulta.',
    },
    {
      q: '¿Cuándo empiezan los sólidos?',
      a: 'A los 6 meses cumplidos, según la OMS. Antes de esa edad sólo por indicación del pediatra. Las señales de que el bebé está listo son que se sostenga sentado con poco apoyo, tenga interés en la comida y haya perdido el reflejo de extrusión.',
    },
    {
      q: '¿La leche se reduce cuando empiezan los sólidos?',
      a: 'Sigue siendo el alimento principal hasta el año: los primeros meses de sólidos son de exploración de sabores y texturas, no de reemplazo calórico. La leche se ofrece antes o después de la comida, no en lugar de ella.',
    },
    {
      q: '¿Qué alimentos están prohibidos en el primer año?',
      a: 'Miel (riesgo de botulismo del lactante), leche de vaca como bebida principal, sal y azúcar agregadas, y todo lo que sea riesgo de atragantamiento: frutos secos enteros, uvas enteras, zanahoria cruda en rodajas, caramelos duros.',
    },
    {
      q: '¿Cuánta agua necesita un bebé?',
      a: 'Antes de los 6 meses ninguna: la leche materna o la fórmula aportan toda el agua necesaria. Desde el inicio de los sólidos se ofrece agua segura en vaso, en pequeñas cantidades con las comidas.',
    },
  ],

  sources: [
    {
      name: 'Guía de alimentación del niño menor de 2 años',
      url: 'https://www.argentina.gob.ar/salud/crecerconsalud/alimentacion',
      publisher: 'Ministerio de Salud de la Nación (Argentina)',
    },
    {
      name: 'Amount and Schedule of Baby Formula Feedings',
      url: 'https://www.healthychildren.org/English/ages-stages/baby/formula-feeding/Pages/Amount-and-Schedule-of-Formula-Feedings.aspx',
      publisher: 'American Academy of Pediatrics · HealthyChildren',
    },
    {
      name: 'Infant and young child feeding — recomendaciones de lactancia y alimentación complementaria',
      url: 'https://www.who.int/news-room/fact-sheets/detail/infant-and-young-child-feeding',
      publisher: 'Organización Mundial de la Salud',
    },
    {
      name: 'Safe preparation, storage and handling of powdered infant formula',
      url: 'https://www.who.int/publications/i/item/9789241595414',
      publisher: 'Organización Mundial de la Salud / FAO',
    },
  ],

  replaces: [
    '/calculadora-leche-materna-formula',
    '/calculadora-formula-infantil-biberon-edad-ml-dia',
    '/calculadora-leche-formula-biberon-cantidad-peso-bebe',
    '/calculadora-onzas-biberon-peso-bebe-dia',
    '/calculadora-formula-leche-bebe-litros-mes-edad-marca',
    '/calculadora-alimentacion-complementaria',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Volumen por kilo y tomas del día según semanas de vida (SAP/AAP).
 * Espejo de formula-leche-bebe-litros-mes-edad-marca.ts.
 */
export const TABLA_EDAD: Array<{ semMax: number; mlKgDia: number; tomas: number }> = [
  { semMax: 4, mlKgDia: 150, tomas: 8 },
  { semMax: 8, mlKgDia: 140, tomas: 7 },
  { semMax: 16, mlKgDia: 130, tomas: 6 },
  { semMax: 24, mlKgDia: 120, tomas: 5 },
  { semMax: 9999, mlKgDia: 110, tomas: 5 },
];

/** Constantes de preparación y envase. */
export const FORMULA = {
  mlMaxDia: 1000,
  mlPorGramoPolvo: 7,
  gramosPorLata: 400,
  diasMes: 30.4,
  /** Proporción del volumen que cubre la fórmula en lactancia mixta. */
  fraccionSuplementaria: 0.4,
  /** Onza líquida en mililitros, para quien lee tablas en oz. */
  mlPorOnza: 29.57,
};

/** Etapas de la alimentación complementaria, por meses cumplidos. */
export const ETAPAS_SOLIDOS: Array<{ hastaMeses: number; titulo: string; comidas: number; cucharadas: number }> = [
  { hastaMeses: 5, titulo: 'Todavía sólo leche', comidas: 0, cucharadas: 0 },
  { hastaMeses: 7, titulo: 'Primeros sólidos: frutas y verduras', comidas: 2, cucharadas: 3 },
  { hastaMeses: 9, titulo: 'Se suman proteínas y legumbres', comidas: 3, cucharadas: 6 },
  { hastaMeses: 12, titulo: 'Casi todo, sin miel ni sal', comidas: 4, cucharadas: 8 },
  { hastaMeses: 9999, titulo: 'Comida familiar adaptada', comidas: 5, cucharadas: 10 },
];
