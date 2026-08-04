import type { HubData } from './types';

/**
 * Hub de decisión — "¿De cuántas semanas estoy?"
 *
 * Arquetipo LÍNEA DE TIEMPO. Absorbe 10 calculadoras sueltas de embarazo
 * (ver `replaces`). Toda la lógica se reimplementa en el compute() de
 * src/pages/embarazo/semanas.astro.
 *
 * ⚠️ YMYL — SALUD. Este hub NO da consejo clínico: estima edad gestacional y
 * fechas orientativas. El texto de disclaimer sale de src/lib/disclaimers.ts
 * (dominio 'health' + override ES de 'calculadora-embarazo') y se repite en
 * `fineprint`, en los `warn` de cada caso y en la FAQ. No se puede reemplazar
 * por un texto más liviano ni sacar del fold: es la condición para publicar
 * contenido de salud según src/lib/content-policy.ts.
 */
export const hub: HubData = {
  slug: 'embarazo/semanas',
  title: 'Calculadora de semanas de embarazo y fecha de parto',
  description:
    'Calculá de cuántas semanas y días estás, en qué mes y trimestre vas, la fecha probable de parto y cuánto mide tu bebé. Por fecha de última menstruación, por ecografía o embarazo gemelar.',
  silo: 'Embarazo',
  siloHref: '/embarazo',

  eyebrow: 'Guía y estimación de embarazo',
  h1: 'Calculadora de semanas de embarazo',
  lede:
    'Partimos del método más usado: contar desde el primer día de tu última menstruación. Si te databan por ecografía o esperás mellizos, cambiá el método abajo y las cuentas se ajustan.',
  stamps: [
    'Revisado 04-08-2026',
    'Criterio OMS / ACOG de edad gestacional',
    '10 calculadoras adentro',
    'Orientativo: no reemplaza tu control obstétrico',
  ],

  resultLabel: 'Tu edad gestacional estimada',

  cases: {
    title: '¿Cómo querés calcularlo?',
    intro:
      'Partimos del método más frecuente. Si tu obstetra te databa por ecografía o tu embarazo es múltiple, cambialo acá.',
    items: [
      {
        id: 'fum',
        label: 'Por fecha de última menstruación',
        hint: 'Regla de Naegele — el método estándar',
        answer: 'Con la FUM se cuenta desde el primer día de tu última menstruación: 40 semanas hasta la fecha probable de parto.',
        yes: [
          'Semanas y días estimados de gestación contados desde el primer día de la última menstruación',
          'Mes de embarazo y trimestre según el criterio de la OMS y ACOG',
          'Fecha probable de parto: FUM + 280 días (regla de Naegele)',
          'Ajuste por duración de tu ciclo si no es de 28 días',
          'Tamaño y peso aproximados del bebé para esa semana',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'Si tus ciclos son irregulares o no recordás bien la FUM, la estimación puede correrse una o dos semanas: la ecografía del primer trimestre es más confiable',
          'La fecha probable de parto es una referencia; el nacimiento puede ocurrir antes o después',
        ],
        plazo: 'la ecografía temprana ayuda a confirmar o ajustar la edad gestacional; la fecha obstétrica documentada por tu equipo es la referencia clínica.',
      },
      {
        id: 'ecografia',
        label: 'Por ecografía (LCC o DBP)',
        hint: 'Cuando tu obstetra ya te databa',
        answer: 'Si te databan por ecografía, esa edad gestacional manda sobre la FUM.',
        yes: [
          'Edad gestacional estimada a partir de la medida fetal (LCC o DBP en milímetros)',
          'Suma de los días transcurridos desde la ecografía hasta hoy',
          'Fecha probable de parto recalculada sobre la datación ecográfica',
          'Mes, trimestre y días que faltan según esa datación',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'El LCC (longitud céfalo-caudal) solo sirve hasta las 14 semanas aproximadamente; después se usa DBP, circunferencia craneana y fémur',
          'Después de las 22 semanas la ecografía pierde precisión para datar: no se cambia la fecha probable de parto ya establecida',
          'Esta estimación usa tablas de referencia; el informe de tu ecografista es el dato válido',
        ],
        plazo: 'la ecografía del primer trimestre suele ofrecer la datación más precisa; usá la edad gestacional escrita en el informe.',
      },
      {
        id: 'gemelar',
        label: 'Embarazo gemelar o de mellizos',
        hint: 'Las semanas se cuentan igual, el parto no',
        answer: 'En un embarazo gemelar las semanas se cuentan igual, pero el parto se planifica antes de las 40.',
        yes: [
          'Las mismas semanas y días de gestación que en un embarazo único',
          'Fecha de finalización planificada a las 37 semanas (bicorial-biamniótico, el caso más frecuente)',
          'Peso estimado por bebé, en general 10-15% menor que en un embarazo único',
        ],
        warn: [
          'Resultado orientativo: no reemplaza diagnóstico, tratamiento ni seguimiento profesional. Consultá con un profesional de la salud matriculado.',
          'La semana de finalización depende de la corionicidad: 37 en bicorial, 36 en monocorial-biamniótico y 32-34 en monocorial-monoamniótico. La define tu equipo obstétrico, no esta calculadora',
          'Un embarazo múltiple es de mayor riesgo: controles más frecuentes y ecografías más seguidas',
        ],
        plazo: 'la corionicidad se determina mejor antes de las 14 semanas: pedí que quede escrita en el informe.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro:
    'Con la fecha de tu última menstruación alcanza. Los campos de ecografía solo se usan si elegís ese método.',
  fields: [
    { id: 'fum', label: 'Primer día de tu última menstruación', type: 'date', value: '2026-02-09' },
    { id: 'ciclo', label: 'Duración de tu ciclo (días)', type: 'number', min: 20, max: 45, value: 28 },
    { id: 'fechaEco', label: 'Fecha de la ecografía', type: 'date', value: '2026-04-06' },
    {
      id: 'tipoMedida',
      label: 'Medida de la ecografía',
      type: 'select',
      value: 'lcc',
      options: [
        { value: 'lcc', label: 'LCC — longitud céfalo-caudal' },
        { value: 'dbp', label: 'DBP — diámetro biparietal' },
      ],
    },
    { id: 'medidaMm', label: 'Valor de esa medida (mm)', type: 'number', min: 1, max: 100, value: 60 },
  ],
  fineprint:
    'Estimación basada en la regla indicada; la fecha real puede variar. No reemplaza diagnóstico, tratamiento ni seguimiento profesional: confirmá el control con tu obstetra o partera.',

  chart: {
    type: 'timeline',
    title: 'Las 40 semanas y dónde estás',
    caption:
      'La línea son las 40 semanas de embarazo partidas en los tres trimestres (1 a 13+6, 14 a 27+6 y 28 en adelante). El tramo coloreado es lo que ya recorriste dentro de cada trimestre.',
    bands: [
      { label: '1er trimestre (sem. 1-13)', from: 0, to: 35, tone: 'neutral' },
      { label: '2º trimestre (sem. 14-27)', from: 35, to: 70, tone: 'good' },
      { label: '3er trimestre (sem. 28-40)', from: 70, to: 100, tone: 'warn' },
    ],
  },
  breakdownTitle: 'Tu embarazo en números',
  breakdownIntro:
    'Cada fila es un dato distinto y muestra su unidad junto al número: semanas, días, meses, centímetros o gramos. Ningún valor de este hub es dinero.',

  faq: [
    {
      q: '¿Desde cuándo se cuentan las semanas de embarazo?',
      a: 'Desde el primer día de tu última menstruación, no desde la relación sexual ni desde la concepción. Es una convención obstétrica universal: cuando te confirman el embarazo ya estás, en general, de 4 o 5 semanas. La concepción ocurre unas dos semanas después de esa fecha de inicio.',
    },
    {
      q: '¿Cuántas semanas dura un embarazo?',
      a: '40 semanas contadas desde la última menstruación, es decir 280 días. Se considera a término entre las 37 y las 41+6 semanas: antes es pretérmino y a partir de las 42 se habla de postérmino. Nacer en la semana 38 o en la 41 es igual de normal.',
    },
    {
      q: '¿Cómo paso las semanas a meses de embarazo?',
      a: 'Un mes calendario no son 4 semanas exactas sino 4,35, así que la cuenta se corre. En criollo: la semana 12 cierra el tercer mes, la 20 el quinto, la 28 el séptimo y la 36 el noveno. Por eso 40 semanas dan poco más de 9 meses calendario.',
    },
    {
      q: '¿Cuándo empieza cada trimestre?',
      a: 'El primer trimestre va de la semana 1 a la 13+6, el segundo de la 14 a la 27+6 y el tercero de la 28 hasta el parto. Es el corte que usan la OMS y ACOG, y es el que aplica esta calculadora.',
    },
    {
      q: '¿Qué pasa si mis ciclos no son de 28 días?',
      a: 'La regla de Naegele asume ciclos de 28 días con ovulación el día 14. Si tu ciclo es más largo o más corto, la ovulación se corre y la edad gestacional también: por eso el cálculo ajusta la diferencia entre tu ciclo y los 28 días. Con ciclos irregulares, la datación por ecografía del primer trimestre es la confiable.',
    },
    {
      q: '¿Qué método manda: la última menstruación o la ecografía?',
      a: 'Tu equipo compara la FUM con la primera ecografía precisa y documenta la mejor estimación obstétrica. El umbral para cambiar la fecha depende de la semana en que se hizo la ecografía; no conviene reemplazar esa decisión con una regla única. Las ecografías posteriores no suelen usarse para redatar un embarazo ya bien fechado.',
    },
    {
      q: '¿La fecha probable de parto es la fecha real?',
      a: 'No. Es una referencia para seguir el embarazo y programar controles; el nacimiento puede ocurrir antes o después. La fecha que vale para el seguimiento es la mejor estimación obstétrica documentada por tu equipo de salud.',
    },
    {
      q: '¿Cambian las semanas si espero mellizos o gemelos?',
      a: 'No: las semanas se cuentan igual. Lo que cambia es el momento en que se planifica el nacimiento, que suele adelantarse a las 37 semanas en gemelares bicoriales y antes en los monocoriales, y también la frecuencia de los controles. La decisión es del equipo obstétrico según la corionicidad.',
    },
    {
      q: '¿Esta calculadora sirve para decidir algo médico?',
      a: 'No. Es una herramienta informativa que estima fechas y semanas. No diagnostica, no evalúa el bienestar de tu bebé ni reemplaza el control prenatal. Ante sangrado, dolor, pérdida de líquido, fiebre o disminución de los movimientos fetales, consultá de inmediato con tu obstetra o una guardia.',
    },
  ],

  sources: [
    {
      name: 'Recomendaciones de la OMS sobre atención prenatal para una experiencia positiva del embarazo',
      url: 'https://www.who.int/publications/i/item/9789241549912',
      publisher: 'Organización Mundial de la Salud',
      date: '2016',
    },
    {
      name: 'Recomendaciones para la práctica del control preconcepcional, prenatal y puerperal',
      url: 'https://www.argentina.gob.ar/salud/saludsexual',
      publisher: 'Ministerio de Salud de la Nación (Argentina)',
    },
    {
      name: 'Criterios de edad gestacional y curvas de crecimiento fetal',
      url: 'https://www.sap.org.ar/',
      publisher: 'Sociedad Argentina de Pediatría (SAP)',
    },
    {
      name: 'Methods for Estimating the Due Date — Committee Opinion 700',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
      publisher: 'American College of Obstetricians and Gynecologists (ACOG)',
      date: '2017',
    },
  ],

  replaces: [
    '/calculadora-embarazo',
    '/calculadora-semanas-embarazo',
    '/calculadora-semanas-gestacion-ecografia',
    '/calculadora-percentil-ecografia',
    '/calculadora-semanas-meses-trimestres-embarazo',
    '/calculadora-embarazo-gemelar',
    '/calculadora-tamano-bebe-semana',
    '/calculadora-trimestre-embarazo',
    '/calculadora-semanas-gestacion-hoy-bebe-trimestre',
    '/calculadora-calendario-ecografias-embarazo-semanas',
  ],

  lastReviewed: '2026-08-04',
  audience: 'AR',
};

/** Tamaño y peso aproximados del bebé por semana (OMS / INTERGROWTH-21st). */
export const TAMANO_SEMANA: Record<number, { fruta: string; cm: number; g: number }> = {
  4: { fruta: 'una semilla de amapola', cm: 0.1, g: 0 },
  5: { fruta: 'una semilla de sésamo', cm: 0.2, g: 0 },
  6: { fruta: 'una lenteja', cm: 0.5, g: 0 },
  7: { fruta: 'un arándano', cm: 1, g: 0 },
  8: { fruta: 'una frambuesa', cm: 1.6, g: 1 },
  9: { fruta: 'una cereza', cm: 2.3, g: 2 },
  10: { fruta: 'una frutilla', cm: 3, g: 4 },
  11: { fruta: 'un higo', cm: 4, g: 7 },
  12: { fruta: 'una lima', cm: 5.4, g: 14 },
  13: { fruta: 'un limón', cm: 7.4, g: 23 },
  14: { fruta: 'un durazno', cm: 8.7, g: 43 },
  15: { fruta: 'una manzana', cm: 10, g: 70 },
  16: { fruta: 'una palta', cm: 11.6, g: 100 },
  17: { fruta: 'una pera', cm: 13, g: 140 },
  18: { fruta: 'una batata', cm: 14, g: 190 },
  19: { fruta: 'un mango', cm: 15, g: 240 },
  20: { fruta: 'una banana', cm: 25, g: 300 },
  21: { fruta: 'una zanahoria', cm: 27, g: 360 },
  22: { fruta: 'una papaya', cm: 28, g: 430 },
  23: { fruta: 'una berenjena chica', cm: 29, g: 500 },
  24: { fruta: 'un choclo', cm: 30, g: 600 },
  25: { fruta: 'un brócoli', cm: 34, g: 660 },
  26: { fruta: 'una lechuga', cm: 36, g: 760 },
  27: { fruta: 'un pepino', cm: 37, g: 875 },
  28: { fruta: 'una berenjena', cm: 38, g: 1000 },
  29: { fruta: 'un zapallo chico', cm: 39, g: 1150 },
  30: { fruta: 'un repollo', cm: 40, g: 1300 },
  31: { fruta: 'un coco', cm: 41, g: 1500 },
  32: { fruta: 'un zapallo', cm: 42, g: 1700 },
  33: { fruta: 'un ananá', cm: 44, g: 1900 },
  34: { fruta: 'un melón', cm: 45, g: 2100 },
  35: { fruta: 'un melón honeydew', cm: 46, g: 2400 },
  36: { fruta: 'una lechuga romana', cm: 47, g: 2600 },
  37: { fruta: 'una acelga', cm: 48, g: 2800 },
  38: { fruta: 'un puerro', cm: 49, g: 3000 },
  39: { fruta: 'una sandía mini', cm: 50, g: 3200 },
  40: { fruta: 'una sandía', cm: 51, g: 3400 },
  41: { fruta: 'una sandía grande', cm: 51, g: 3600 },
  42: { fruta: 'una sandía XL', cm: 52, g: 3700 },
};

/** Hitos de control y ecografías por ventana de semanas (Ministerio de Salud AR / ACOG). */
export const HITOS: Array<{ desde: number; hasta: number; evento: string }> = [
  { desde: 8, hasta: 12, evento: 'primera ecografía: confirma edad gestacional y vitalidad' },
  { desde: 11, hasta: 14, evento: 'ecografía de tamiz del 1er trimestre (translucencia nucal)' },
  { desde: 16, hasta: 20, evento: 'laboratorio de control (hemograma, orina, VDRL, HIV)' },
  { desde: 20, hasta: 22, evento: 'ecografía morfológica o scan de anatomía fetal' },
  { desde: 24, hasta: 28, evento: 'test de tolerancia a la glucosa (diabetes gestacional)' },
  { desde: 27, hasta: 28, evento: 'vacuna triple bacteriana acelular (dTpa)' },
  { desde: 32, hasta: 34, evento: 'ecografía de crecimiento' },
  { desde: 35, hasta: 37, evento: 'cultivo de estreptococo grupo B' },
  { desde: 37, hasta: 41, evento: 'controles semanales y monitoreo fetal' },
];

/** Semanas de finalización planificada por tipo de caso. */
export const CASE_MATH: Record<string, { semanasParto: number; factorPeso: number }> = {
  fum: { semanasParto: 40, factorPeso: 1 },
  ecografia: { semanasParto: 40, factorPeso: 1 },
  gemelar: { semanasParto: 37, factorPeso: 0.875 },
};
