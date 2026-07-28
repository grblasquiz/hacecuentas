import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto cuesta un bebé por mes?"
 * Arquetipo RAMIFICADO: la rama define QUÉ entra en el presupuesto (con o sin
 * jardín, sólo el jardín, o la proyección del primer año).
 *
 * Absorbe 3 URLs (ver hub.replaces).
 *
 * DIFERENCIA con los otros hubs — no se pisan:
 *   · /bebes/cuanta-leche-toma      → cuántos ml y cuántas latas (nutrición)
 *   · /familia/asignaciones-anses   → lo que ENTRA por AUH y asignaciones
 *   · /familia/cuota-alimentaria    → cuánto le corresponde a un hijo por ley
 *   Este responde el egreso mensual concreto: pañales, fórmula y jardín.
 *
 * NÚMEROS: precios unitarios de pañal de julio 2026 y cambios por día por edad,
 * espejo de src/lib/formulas/pañales-mes-bebe-talle-gasto-anual.ts. Modelo de
 * jardín maternal (base por zona × tipo × sala × turno + matrícula + extras),
 * espejo de cuota-jardin-maternal-cama-cuna-mensual-2026.ts. Fórmula: 1 g de
 * polvo cada 7 ml preparados y lata de 400 g, misma base que
 * /bebes/cuanta-leche-toma.
 *
 * YMYL DE PLATA: los precios son un relevamiento con fecha, no una cotización.
 * El aviso del dominio `family` de src/lib/disclaimers.ts va en `fineprint` y
 * como PRIMER `warn` de cada rama.
 *
 * NOTAS DE CONTRATO: este hub SÍ es de plata, así que el default 'ars' está
 * bien, pero toda fila que no sea plata (cantidades, meses) declara su formato.
 */

export const DISCLAIMER =
  'Información general. En decisiones de salud, fertilidad, embarazo o crianza, consultá al profesional correspondiente.';

export const hub: HubData = {
  slug: 'familia/costo-de-un-bebe',
  title: '¿Cuánto cuesta un bebé por mes? Pañales, leche de fórmula y jardín maternal',
  description:
    'Presupuesto mensual de un bebé en Argentina: cuántos pañales por día según la edad y cuánto salen, latas de fórmula por mes, y la cuota del jardín maternal por zona, tipo, sala y turno, con matrícula y extras incluidos.',
  silo: 'Familia',
  siloHref: '/familia',

  eyebrow: 'Guía y estimación de presupuesto',
  h1: '¿Cuánto cuesta un bebé por mes?',
  lede:
    'Tres rubros se llevan casi todo: pañales, leche y jardín. Partimos del caso más común —bebé en casa, todavía sin jardín— y ya podés ver el número del mes. Si ya lo anotaste en el maternal, cambiá la rama y el jardín entra a la cuenta con matrícula y extras.',
  stamps: [
    'Precios relevados julio 2026',
    'Modelo de jardín por zona, sala y turno',
    '3 calculadoras adentro',
  ],

  resultLabel: 'Gasto del mes',

  cases: {
    title: '¿Qué querés presupuestar?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'casa',
        label: 'El bebé está en casa',
        hint: 'Sin jardín todavía',
        answer: 'Sin jardín, el mes se lo llevan los pañales y la leche.',
        yes: [
          'Pañales por día según la edad, y su costo del mes y del año',
          'Latas de fórmula por mes según el peso y las semanas',
          'Un rubro de varios (ropa, higiene, farmacia) estimado como porcentaje',
        ],
        warn: [
          DISCLAIMER,
          'Los precios son un relevamiento con fecha, no una cotización: cargá los tuyos y el resultado se ajusta',
          'Si el bebé toma pecho exclusivo, el rubro leche es cero: bajá el precio de la lata a 0',
        ],
        plazo: 'el consumo de pañales cae fuerte después del año: de 11 cambios por día a 5.',
      },
      {
        id: 'jardin',
        label: 'Ya va al jardín maternal',
        hint: 'Cuota, matrícula y extras',
        answer: 'Con jardín, la cuota se convierte en el rubro más pesado del mes.',
        yes: [
          'Cuota mensual por zona, tipo de institución, sala y turno',
          'La matrícula prorrateada sobre el ciclo lectivo, que suele olvidarse',
          'Extras mensuales (materiales, seguro, cooperadora) estimados en 4% de la cuota base',
        ],
        warn: [
          DISCLAIMER,
          'La matrícula es un pago de golpe: presupuestala aparte aunque acá aparezca prorrateada',
          'Los jardines estatales no cobran cuota, pero las vacantes son muy limitadas: conviene anotarse con mucha anticipación y tener un plan B',
          'Las salas de bebés más chicos son más caras porque exigen más docentes por niño',
        ],
        plazo: 'el ciclo lectivo son unos 10 meses: la cuota anual no se divide por 12.',
      },
      {
        id: 'solo-jardin',
        label: 'Sólo quiero comparar jardines',
        hint: 'Cuota y costo anual',
        answer: 'El costo real por mes incluye la matrícula prorrateada, no sólo la cuota.',
        yes: [
          'Cuota, matrícula, extras y costo anual total',
          'El costo mensual efectivo sobre el ciclo lectivo, que es mayor que la cuota',
          'Sirve para comparar dos presupuestos que no se presentan igual',
        ],
        warn: [
          DISCLAIMER,
          'Cuando compares, mirá el costo anual: dos jardines con la misma cuota pueden diferir mucho en matrícula y extras',
          'Preguntá si la cuota se ajusta durante el año y con qué criterio',
        ],
        plazo: 'las inscripciones suelen abrir entre agosto y octubre del año anterior.',
      },
      {
        id: 'anual',
        label: 'La proyección del año',
        hint: '12 meses de pañales y leche',
        answer: 'Proyectado a doce meses, el gasto se multiplica pero no de forma lineal.',
        yes: [
          'Pañales y leche proyectados a 12 meses con el consumo de hoy',
          'Jardín proyectado sobre el ciclo lectivo de 10 meses',
          'Es una proyección a precios de hoy: no incluye inflación futura',
        ],
        warn: [
          DISCLAIMER,
          'La proyección congela el consumo actual: en la práctica los pañales bajan y la comida sube a lo largo del año',
          'No incluye inflación ni aumentos de cuota: es el número a precios de hoy',
        ],
        plazo: 'volvé a correr la cuenta cada 3 o 4 meses: el consumo cambia rápido en el primer año.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'edadMeses', label: 'Edad del bebé', type: 'number', min: 0, max: 48, value: 6, suffix: 'meses' },
    { id: 'pesoBebe', label: 'Peso del bebé', type: 'number', min: 2, max: 20, step: 0.1, value: 7.5, suffix: 'kg' },
    {
      id: 'marca',
      label: 'Marca de pañales',
      type: 'select',
      value: 'huggies',
      options: [
        { value: 'pampers', label: 'Pampers' },
        { value: 'huggies', label: 'Huggies' },
        { value: 'estrella', label: 'Estrella' },
      ],
    },
    {
      id: 'precioLata',
      label: 'Precio de la lata de fórmula (400 g)',
      prefix: '$',
      value: '32.000',
      thousands: true,
      help: 'Poné 0 si el bebé toma pecho exclusivo.',
    },
    {
      id: 'zona',
      label: 'Zona del jardín',
      type: 'select',
      value: 'caba',
      options: [
        { value: 'caba', label: 'CABA' },
        { value: 'gba_norte', label: 'GBA Norte' },
        { value: 'gba_sur_oeste', label: 'GBA Sur / Oeste' },
        { value: 'interior_grande', label: 'Interior, ciudad grande' },
        { value: 'interior_medio', label: 'Interior, ciudad mediana' },
        { value: 'interior_chico', label: 'Interior, ciudad chica' },
      ],
    },
    {
      id: 'tipoJardin',
      label: 'Tipo de institución',
      type: 'select',
      value: 'privado_medio',
      options: [
        { value: 'estatal', label: 'Estatal (sin cuota)' },
        { value: 'cooperativo', label: 'Cooperativo o comunitario' },
        { value: 'privado_basico', label: 'Privado básico' },
        { value: 'privado_medio', label: 'Privado medio' },
        { value: 'privado_premium', label: 'Privado premium o bilingüe' },
      ],
    },
    {
      id: 'turno',
      label: 'Turno',
      type: 'select',
      value: 'completo',
      options: [
        { value: 'simple', label: 'Simple (4 hs)' },
        { value: 'extendido', label: 'Extendido (6 hs)' },
        { value: 'completo', label: 'Jornada completa (8 hs)' },
      ],
    },
    {
      id: 'comida',
      label: '¿La cuota incluye comida?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, desayuno, almuerzo y merienda' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el mes',
    caption:
      'Cada porción es un rubro del gasto mensual. Cuando el jardín entra en la cuenta, todo lo demás se vuelve chico al lado: por eso conviene decidir turno y tipo de institución antes que la marca de pañales.',
  },
  breakdownTitle: 'El desglose del mes',
  breakdownIntro: 'Las barras comparan cada rubro con el más grande del desglose.',

  faq: [
    {
      q: '¿Cuántos pañales usa un bebé por día?',
      a: 'Unos 11 en el primer mes, 9 entre el mes y los 2, 7 de 3 a 5 meses, 6 de 6 a 11, 5 de 1 a 2 años y 4 de 2 a 3. Después de los 3, cuando ya hay control parcial de esfínteres, bajan a unos 3 por día.',
    },
    {
      q: '¿Cuántos pañales por mes hay que comprar?',
      a: 'El consumo diario por 30. Un recién nacido usa unos 330 al mes; un bebé de 6 meses, unos 180; uno de un año y medio, unos 150. Conviene no stockear talles chicos: se pasan de talle más rápido de lo que uno cree.',
    },
    {
      q: '¿Cuánto se gasta en leche de fórmula por mes?',
      a: 'Depende del peso y de la edad. Con la proporción estándar de 1 g de polvo cada 7 ml preparados, un bebé de 7,5 kg que toma unos 900 ml diarios consume alrededor de 3.900 g al mes: unas 10 latas de 400 g. Si toma pecho exclusivo, el rubro es cero.',
    },
    {
      q: '¿Cuánto sale un jardín maternal?',
      a: 'Cambia muchísimo por zona, tipo, sala y turno. Sobre una base de privado medio, sala de 1 año, jornada completa y sin comida, la referencia va de unos $72.000 en el interior chico a unos $210.000 en CABA. Un premium bilingüe multiplica esa base por 1,65 y una sala de lactario por 1,3.',
    },
    {
      q: '¿Por qué la sala de bebés más chicos es más cara?',
      a: 'Por el ratio docente/niño. Un lactario necesita muchos más adultos por niño que una sala de 2 años, y ese es el costo principal de la institución. Por eso el mismo jardín cobra más por lactario que por sala 2.',
    },
    {
      q: '¿La matrícula cuenta en el costo mensual?',
      a: 'Debería. En privado medio o premium la matrícula suele equivaler a una cuota y media, y en básico o cooperativo a unas 0,8 cuotas. Prorrateada sobre el ciclo lectivo puede sumar un 10 a 15% al costo mensual real, que es la diferencia entre "la cuota" y "lo que sale".',
    },
    {
      q: '¿El jardín estatal es realmente gratis?',
      a: 'No cobra cuota ni matrícula, pero las vacantes son muy limitadas y la demanda las supera holgadamente. La recomendación práctica es anotarse apenas abra la inscripción y sostener un plan B privado hasta tener la vacante confirmada.',
    },
    {
      q: '¿Cuánto se ahorra con media jornada?',
      a: 'El turno simple de 4 horas ronda el 60% de la jornada completa y el extendido de 6 horas, el 80%. La cuenta que hay que hacer no es sólo esa: si media jornada obliga a contratar cuidado por las otras horas, el ahorro se evapora.',
    },
    {
      q: '¿Qué otros gastos hay además de estos tres?',
      a: 'Ropa (que se renueva por talle cada pocos meses), higiene y farmacia, cochecito, cuna y silla de auto (compras únicas y caras), y controles pediátricos si no hay cobertura. Este hub estima ropa, higiene y farmacia como un rubro de varios; los equipamientos únicos quedan afuera porque no son mensuales.',
    },
    {
      q: '¿Conviene comprar pañales por mayor?',
      a: 'En precio unitario, casi siempre sí, sobre todo en talles medianos y grandes que duran más tiempo. En talles RN y P conviene ir de a poco: el bebé cambia de talle en semanas y quedarte con paquetes sin usar borra el ahorro.',
    },
    {
      q: '¿Estos precios se actualizan?',
      a: 'Los valores de referencia son de un relevamiento de julio de 2026 y quedan desactualizados rápido. Por eso todos los campos de precio son editables: cargá lo que pagás vos y la cuenta se recalcula sobre tus números, no sobre los nuestros.',
    },
  ],

  sources: [
    {
      name: 'Índice de precios al consumidor — división Bienes y servicios diversos',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'Inscripción en línea a jardines maternales y de infantes de gestión estatal',
      url: 'https://buenosaires.gob.ar/educacion/inscripcion-escolar',
      publisher: 'Gobierno de la Ciudad de Buenos Aires',
    },
    {
      name: 'Educación inicial — normativa de jardines maternales',
      url: 'https://www.argentina.gob.ar/educacion/inicial',
      publisher: 'Ministerio de Capital Humano (Argentina)',
    },
  ],

  replaces: [
    '/calculadora-panales-mes-bebe-talle-gasto-anual',
    '/calculadora-guarderia-jardin-maternal-costo-caba-mensual',
    '/calculadora-cuota-jardin-maternal-cama-cuna-mensual-2026',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Precio unitario de pañal en ARS, relevamiento julio 2026, por marca y talle.
 * Espejo de src/lib/formulas/pañales-mes-bebe-talle-gasto-anual.ts.
 */
export const PRECIO_PANAL: Record<string, Record<string, number>> = {
  pampers: { rn: 500, p: 500, m: 510, g: 510, xg: 610, xxg: 610 },
  huggies: { rn: 500, p: 500, m: 440, g: 440, xg: 520, xxg: 520 },
  estrella: { rn: 350, p: 350, m: 350, g: 350, xg: 420, xxg: 420 },
};

/** Cambios de pañal por día, por edad en meses. */
export const CAMBIOS_POR_DIA: Array<{ hastaMeses: number; cambios: number; talle: string }> = [
  { hastaMeses: 1, cambios: 11, talle: 'rn' },
  { hastaMeses: 3, cambios: 9, talle: 'p' },
  { hastaMeses: 6, cambios: 7, talle: 'm' },
  { hastaMeses: 12, cambios: 6, talle: 'g' },
  { hastaMeses: 24, cambios: 5, talle: 'xg' },
  { hastaMeses: 36, cambios: 4, talle: 'xxg' },
  { hastaMeses: 9999, cambios: 3, talle: 'xxg' },
];

/** Modelo de cuota del jardín maternal (ARS 2026). */
export const JARDIN = {
  baseZona: {
    caba: 210000,
    gba_norte: 165000,
    gba_sur_oeste: 130000,
    interior_grande: 115000,
    interior_medio: 95000,
    interior_chico: 72000,
  } as Record<string, number>,
  factorTipo: {
    estatal: 0,
    cooperativo: 0.35,
    privado_basico: 0.75,
    privado_medio: 1.0,
    privado_premium: 1.65,
  } as Record<string, number>,
  /** Ratio docente/niño: cuanto más chico el bebé, más cara la sala. */
  factorSala: { lactario: 1.3, cuna: 1.15, sala1: 1.0, sala2: 0.92 } as Record<string, number>,
  factorTurno: { simple: 0.6, extendido: 0.8, completo: 1.0 } as Record<string, number>,
  adicionalComida: 22000,
  ratioMatricula: {
    estatal: 0,
    cooperativo: 0.8,
    privado_basico: 0.8,
    privado_medio: 1.5,
    privado_premium: 1.5,
  } as Record<string, number>,
  /** Materiales, seguro y cooperadora, sobre la cuota base sin comida. */
  ratioExtras: 0.04,
  /** Meses del ciclo lectivo. */
  mesesCiclo: 10,
};

/** Fórmula infantil: misma base que /bebes/cuanta-leche-toma. */
export const FORMULA = { mlPorGramoPolvo: 7, gramosPorLata: 400, diasMes: 30.4, mlMaxDia: 1000 };

/** Ropa, higiene y farmacia, como proporción de pañales + leche. */
export const RATIO_VARIOS = 0.25;
