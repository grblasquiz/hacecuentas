import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuántos días de vacaciones me corresponden?"
 * Arquetipo RAMIFICADO: la rama por defecto es vacaciones por antigüedad
 * (LCT arts. 150-157) y las otras cubren las licencias especiales del art. 158
 * y de la ley 24.716.
 *
 * Absorbe 11 URLs de calculadora suelta (ver `replaces`), incluida la de
 * vacaciones del CCT 130/75 de comercio, que en días sigue la escala general
 * de la LCT y sólo agrega el plus vacacional del 3%.
 */
export const hub: HubData = {
  slug: 'trabajo/vacaciones',
  title: '¿Cuántos días de vacaciones me corresponden? — Calculadora LCT 2026',
  description:
    'Calculá los días que te corresponden según tu antigüedad (14, 21, 28 o 35 días, LCT art. 150) y también las licencias por maternidad, paternidad, fallecimiento de familiar y examen. Con el escalón donde caés y cuánto te falta para el próximo.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y cálculo de licencias',
  h1: '¿Cuántos días de vacaciones me corresponden?',
  lede:
    'Partimos del caso más común: vacaciones anuales por antigüedad. Cargá tu fecha de ingreso y te decimos en qué escalón caés y cuánto te falta para el siguiente. Si lo que buscás es una licencia especial, la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'LCT arts. 150 a 158', 'CCT 130/75 comercio', '11 calculadoras adentro'],

  resultLabel: 'Días que te corresponden',

  cases: {
    title: '¿Qué licencia estás mirando?',
    intro: 'Arrancamos por las vacaciones anuales. Si tu caso es otro, elegilo.',
    items: [
      {
        id: 'antiguedad',
        label: 'Vacaciones por antigüedad',
        hint: 'El caso más común · Art. 150',
        answer: 'Los días salen de tu antigüedad: 14, 21, 28 o 35 días corridos.',
        yes: [
          'Hasta 5 años de antigüedad: 14 días corridos',
          'De 5 a 10 años: 21 días corridos',
          'De 10 a 20 años: 28 días corridos',
          'Más de 20 años: 35 días corridos',
          'La antigüedad se mide al 31 de diciembre del año que se gozan (Art. 150)',
          'Comercio (CCT 130/75) usa la misma escala de la LCT: no suma días, pero suma un plus vacacional del 3% sobre el pago de la licencia',
        ],
        warn: [
          'Si no trabajaste más de la mitad de los días hábiles del año, no cobrás el tramo completo: te corresponde 1 día por cada 20 días hábiles trabajados (Art. 153)',
          'Las vacaciones se gozan, no se cobran: sólo se pagan en dinero si el vínculo se extingue (Art. 156)',
          'El convenio puede mejorar el piso en licencias especiales (duelo, paternidad) aunque deje los días de vacaciones igual: es lo que pasa en comercio',
        ],
        plazo: 'se otorgan entre el 1 de octubre y el 30 de abril, y te tienen que avisar por escrito con 45 días de anticipación (Art. 154).',
      },
      {
        id: 'maternidad',
        label: 'Licencia por maternidad',
        hint: '90 días · Art. 177',
        answer: 'Son 90 días corridos pagados por ANSES, no por el empleador.',
        yes: [
          '90 días corridos: 45 antes y 45 después del parto',
          'Podés optar por reducir el tramo previo a 30 días y pasar 60 al posterior',
          'Lo paga ANSES como asignación por maternidad, equivalente al bruto',
          'Al reintegrarte tenés 1 hora diaria de lactancia (o 2 descansos de media hora) por un año (Art. 179)',
        ],
        warn: [
          'Hay que notificar el embarazo de forma fehaciente y presentar certificado con fecha probable de parto',
          'Terminada la licencia podés optar por la excedencia de 3 a 6 meses, sin goce de sueldo',
        ],
        plazo: 'el tramo previo no puede bajar de 30 días: es piso legal, no negociable.',
      },
      {
        id: 'paternidad',
        label: 'Licencia por paternidad',
        hint: '2 días LCT · Art. 158 inc. a',
        answer: 'La LCT da sólo 2 días corridos; el convenio suele dar más.',
        yes: [
          '2 días corridos con goce de sueldo por nacimiento de hijo (Art. 158 inc. a)',
          'Son días corridos: cuentan sábados, domingos y feriados',
          'Los paga el empleador, no ANSES',
        ],
        warn: [
          'Muchos convenios mejoran el piso: bancarios, sanidad y camioneros llegan a 5 días o más. Mirá tu CCT antes de pedir sólo 2',
          'Empleo público nacional y varias provincias tienen regímenes propios más largos',
        ],
        plazo: 'presentá el certificado de nacimiento apenas lo tengas; la licencia se toma sobre la fecha del parto.',
      },
      {
        id: 'fallecimiento',
        label: 'Licencia por fallecimiento de familiar',
        hint: 'Duelo · Art. 158 inc. b y c',
        answer: 'Son 3 días por cónyuge, hijo o padres; 1 día por hermano.',
        yes: [
          '3 días corridos por fallecimiento de cónyuge o conviviente, hijo/a o padre/madre',
          '1 día corrido por fallecimiento de hermano/a',
          'Son días pagos al 100% y ya vienen dentro del sueldo mensual',
        ],
        warn: [
          'La LCT no contempla abuelos, suegros, cuñados ni tíos: ahí dependés del convenio o de un permiso especial',
          'De los 3 días, al menos uno tiene que ser hábil si el fallecimiento cae en fin de semana o feriado',
        ],
        plazo: 'avisá al empleador de inmediato y presentá el acta de defunción en los días siguientes.',
      },
      {
        id: 'examen',
        label: 'Licencia por examen',
        hint: 'Estudiante · Art. 149',
        answer: 'Son 2 días corridos por examen, con tope de 10 días al año.',
        yes: [
          '2 días corridos pagos por examen (día previo + día del examen)',
          'Tope de 10 días por año calendario, o sea 5 exámenes',
          'Vale para secundario, terciario, universitario y posgrado en instituciones reconocidas',
          'Se cobra por haber rendido, apruebes o no',
        ],
        warn: [
          'Los días no usados no se acumulan al año siguiente',
          'Sin certificado de examen rendido el empleador puede descontar el día',
        ],
        plazo: 'avisá con 5 a 7 días y presentá el certificado dentro de los 5 días posteriores al examen.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Los valores de ejemplo ya sirven para ver cómo funciona: cambiá los tuyos y actualizá.',
  fields: [
    { id: 'fechaIngreso', label: 'Fecha de ingreso al trabajo', type: 'date', value: '2019-03-01' },
    {
      id: 'medioAnio',
      label: '¿Trabajaste más de la mitad de los días hábiles del año?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí — me corresponden vacaciones completas' },
        { value: 'no', label: 'No — entré este año / falté mucho' },
      ],
    },
    {
      id: 'opcionMaternidad',
      label: 'Maternidad: cómo repartís los 90 días',
      type: 'select',
      value: '45-45',
      options: [
        { value: '45-45', label: '45 antes + 45 después del parto' },
        { value: '30-60', label: '30 antes + 60 después del parto' },
      ],
    },
    {
      id: 'parentesco',
      label: 'Fallecimiento: vínculo con la persona fallecida',
      type: 'select',
      value: 'padre-madre',
      options: [
        { value: 'conyuge', label: 'Cónyuge o conviviente' },
        { value: 'hijo', label: 'Hijo o hija' },
        { value: 'padre-madre', label: 'Padre o madre' },
        { value: 'hermano', label: 'Hermano o hermana' },
        { value: 'otro', label: 'Abuelo, suegro, cuñado u otro' },
      ],
    },
    {
      id: 'sector',
      label: 'Tu convenio (mejora los pisos de la LCT)',
      type: 'select',
      value: 'general-lct',
      options: [
        { value: 'general-lct', label: 'Sin convenio / LCT general' },
        { value: 'comercio', label: 'Comercio — CCT 130/75 (misma escala LCT + plus 3%)' },
        { value: 'bancarios', label: 'Bancarios — CCT 18/75' },
        { value: 'sanidad', label: 'Sanidad — CCT 122/75' },
        { value: 'camioneros', label: 'Camioneros — CCT 40/89' },
      ],
    },
    { id: 'examenes', label: 'Exámenes que vas a rendir este año', type: 'number', min: 1, max: 20, value: 3 },
    { id: 'examenesTomados', label: 'Exámenes que ya rendiste con licencia', type: 'number', min: 0, max: 20, value: 1 },
  ],
  fineprint:
    'Es una orientación sobre los pisos legales. Tu convenio colectivo, el estatuto de tu actividad o un acuerdo de empresa pueden darte más días.',

  chart: {
    type: 'steps',
    title: 'La escalera de la antigüedad',
    caption:
      'Cada escalón es un tramo del Art. 150: hasta 5 años son 14 días, de 5 a 10 son 21, de 10 a 20 son 28 y arriba de 20 son 35. El resultado te marca en qué escalón caés y cuánto te falta para el próximo salto.',
    bands: [
      { label: 'Hasta 5 años · 14 días', from: 0, to: 5, tone: 'neutral' },
      { label: 'De 5 a 10 años · 21 días', from: 5, to: 10, tone: 'good' },
      { label: 'De 10 a 20 años · 28 días', from: 10, to: 20, tone: 'good' },
      { label: 'Más de 20 años · 35 días', from: 20, to: 25, tone: 'good' },
    ],
  },
  breakdownTitle: 'Cómo se arma tu licencia',
  breakdownIntro:
    'Cada fila muestra su propia unidad (días corridos, días hábiles, meses) junto al número: este hub cuenta tiempo, no plata. La referencia de la derecha es el artículo de la ley que lo manda.',

  faq: [
    {
      q: '¿Cuántos días de vacaciones me corresponden por ley en Argentina?',
      a: 'El Art. 150 de la LCT fija cuatro escalones según la antigüedad al 31 de diciembre del año que se gozan: hasta 5 años, 14 días corridos; de 5 a 10 años, 21 días; de 10 a 20 años, 28 días; y con más de 20 años, 35 días corridos. Son días corridos, no hábiles: cuentan sábados, domingos y feriados.',
    },
    {
      q: 'Entré este año, ¿me corresponden vacaciones igual?',
      a: 'Sí, pero proporcionales. Si no trabajaste más de la mitad de los días hábiles del año calendario, el Art. 153 te da 1 día de descanso por cada 20 días hábiles efectivamente trabajados. Recién al superar la mitad del año pasás a cobrar el tramo completo de tu antigüedad.',
    },
    {
      q: '¿Cuándo me las tienen que dar y con cuánta anticipación me avisan?',
      a: 'Entre el 1 de octubre y el 30 de abril del año siguiente (Art. 154), y el empleador tiene que comunicarte la fecha por escrito con 45 días de anticipación como mínimo. Si no te las otorga, el Art. 157 te habilita a tomártelas por tu cuenta notificando de forma fehaciente, de modo que terminen antes del 31 de mayo.',
    },
    {
      q: '¿Me pueden pagar las vacaciones en plata en lugar de dármelas?',
      a: 'No. El Art. 162 prohíbe compensarlas en dinero: las vacaciones se gozan. La única excepción es la extinción del contrato, donde se pagan las vacaciones proporcionales no gozadas junto con su SAC (Art. 156).',
    },
    {
      q: '¿Cómo se paga el día de vacaciones?',
      a: 'El Art. 155 manda dividir el sueldo mensual por 25 —no por 30— y multiplicar por los días de licencia. Ese divisor más chico hace que el día de vacaciones se pague algo más caro que un día común, y el pago se hace al inicio de la licencia.',
    },
    {
      q: '¿Cuántos días de licencia por maternidad y paternidad hay?',
      a: 'Maternidad: 90 días corridos, 45 antes y 45 después del parto, con opción a reducir el tramo previo a 30 y pasar 60 al posterior (Art. 177). Los paga ANSES como asignación por maternidad. Paternidad: la LCT da apenas 2 días corridos a cargo del empleador (Art. 158 inc. a), aunque muchos convenios llegan a 5 o más.',
    },
    {
      q: '¿Cuántos días de licencia me dan por fallecimiento de un familiar?',
      a: '3 días corridos por cónyuge o conviviente, hijo/a o padre/madre, y 1 día corrido por hermano/a (Art. 158 inc. b y c). De esos días, al menos uno tiene que ser hábil. Abuelos, suegros y cuñados no están en la LCT: ahí dependés del convenio.',
    },
    {
      q: '¿Cuántos días de licencia por examen tengo como estudiante trabajador?',
      a: '2 días corridos pagos por examen, con un tope de 10 días por año calendario (Art. 149), o sea 5 exámenes. Se cobran por haber rendido, apruebes o no, y hay que presentar el certificado emitido por la institución. Los días no usados no se acumulan al año siguiente.',
    },
    {
      q: 'Trabajo en comercio (CCT 130/75), ¿me corresponden más días de vacaciones?',
      a: 'No: en días, el CCT 130/75 de Comercio sigue la misma escala del Art. 150 de la LCT — 14 días hasta 5 años de antigüedad, 21 de 5 a 10, 28 de 10 a 20 y 35 con más de 20. Lo que sí agrega es un plus vacacional del 3% sobre el pago de la licencia, y mejora los pisos de las licencias especiales: 5 días por fallecimiento de cónyuge o hijo/a y 2 por hermano/a, contra los 3 y 1 de la LCT. La ventana para tomarlas también es la general: del 1 de octubre al 30 de abril.',
    },
    {
      q: '¿Cómo se paga el plus vacacional del 3% de comercio?',
      a: 'Se calcula sobre el importe de los días de vacaciones ya liquidados. Si el día de vacaciones sale del sueldo dividido 25 (Art. 155 LCT) y la licencia son 21 días, el plus es el 3% de ese total, y se abona junto con el pago de la licencia al inicio del descanso. No reemplaza al SAC ni al presentismo: es un adicional propio del convenio.',
    },
    {
      q: '¿Las licencias especiales me descuentan días de vacaciones?',
      a: 'No. Las licencias del Art. 158 y la de maternidad son adicionales a las vacaciones anuales y además cuentan como tiempo trabajado a los efectos de la antigüedad. Tampoco te descuentan el presentismo si presentaste la documentación en término.',
    },
    {
      q: '¿Qué es la licencia por excedencia después de la maternidad?',
      a: 'Es la opción de extender la ausencia entre 3 y 6 meses más al terminar los 90 días, sin goce de sueldo y conservando el puesto (ley 24.716 y Art. 183 LCT). Hay que tener al menos un año de antigüedad y avisar 48 horas antes de finalizar la licencia por maternidad.',
    },
  ],

  sources: [
    {
      name: 'Ley de Contrato de Trabajo 20.744, arts. 150 a 157 — vacaciones anuales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg — Ministerio de Justicia',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley de Contrato de Trabajo 20.744, art. 158 — licencias especiales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg — Ministerio de Justicia',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 24.716 — licencia y asignación especial por nacimiento de hijo con Síndrome de Down',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/35000-39999/38534/norma.htm',
      publisher: 'InfoLeg — Ministerio de Justicia',
      date: '1996',
    },
    {
      name: 'Asignación por maternidad — requisitos y duración',
      url: 'https://www.anses.gob.ar/asignacion-por-maternidad',
      publisher: 'ANSES',
    },
  ],

  replaces: [
    '/calculadora-dias-vacaciones-ley',
    '/calculadora-licencia-vacaciones-cct-comercio-empleados-comercio-argentina-2026',
    '/calculadora-vacaciones-argentina',
    '/calculadora-licencia-maternidad-paternidad',
    '/calculadora-licencia-maternidad-anses-90-dias-extension',
    '/calculadora-maternidad-licencia-sueldo-anses-duracion',
    '/calculadora-licencia-fallecimiento-familiar-duelo-dias-lct',
    '/calculadora-licencia-examen-estudiante-trabajador-art-149-lct',
    '/calculadora-horas-trabajadas-semanal',
    '/calculadora-dias-vacaciones-me-alcanza',
    '/calculadora-puente-optimo-vacaciones-2026',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Escalera del Art. 150: años cumplidos → días corridos. */
export const ESCALERA = [
  { desde: 0, hasta: 5, dias: 14, label: 'Hasta 5 años' },
  { desde: 5, hasta: 10, dias: 21, label: 'De 5 a 10 años' },
  { desde: 10, hasta: 20, dias: 28, label: 'De 10 a 20 años' },
  { desde: 20, hasta: 25, dias: 35, label: 'Más de 20 años' },
];

/** Días de duelo (Art. 158 inc. b y c) y mejoras habituales por convenio. */
export const DUELO: Record<string, number> = {
  conyuge: 3,
  hijo: 3,
  'padre-madre': 3,
  hermano: 1,
  otro: 0,
};

export const DUELO_CCT: Record<string, Record<string, number>> = {
  'general-lct': {},
  comercio: { conyuge: 5, hijo: 5, 'padre-madre': 3, hermano: 2 },
  bancarios: { conyuge: 5, hijo: 5, 'padre-madre': 3, hermano: 2 },
  sanidad: { conyuge: 5, hijo: 5, 'padre-madre': 3, hermano: 2 },
  camioneros: { conyuge: 5, hijo: 5, 'padre-madre': 3, hermano: 1 },
};

/** Licencia por paternidad: piso LCT 2 días, mejoras de convenio. */
export const PATERNIDAD_CCT: Record<string, number> = {
  'general-lct': 2,
  comercio: 3,
  bancarios: 5,
  sanidad: 5,
  camioneros: 5,
};

/** Licencia por examen (Art. 149): 2 días por examen, tope anual. */
export const EXAMEN_CCT: Record<string, { porExamen: number; topeAnual: number }> = {
  'general-lct': { porExamen: 2, topeAnual: 10 },
  comercio: { porExamen: 2, topeAnual: 10 },
  bancarios: { porExamen: 3, topeAnual: 15 },
  sanidad: { porExamen: 2, topeAnual: 12 },
  camioneros: { porExamen: 2, topeAnual: 10 },
};
