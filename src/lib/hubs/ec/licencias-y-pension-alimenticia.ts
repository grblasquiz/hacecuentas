import type { HubData } from '../types';
import { ECUADOR_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "Nace un hijo o me enfermo: qué me pagan y quién lo paga".
 *
 * Constantes: src/lib/data/ecuador-2026.ts (SBU, aporte personal IESS) y la Tabla de
 * Pensiones Alimenticias Mínimas del Acuerdo MDH-DM-2026-0005-A, espejada de
 * src/lib/formulas/pension-alimenticia-ecuador.ts y de
 * src/pages/ec/datos-pension-alimenticia-ecuador-2026.astro.
 * Cálculo espejado además de licencia-maternidad-ecuador.ts, licencia-paternidad-ecuador.ts
 * y subsidio-enfermedad-iess-ecuador.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LAB =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const SBU = ECUADOR_2026.sbu;
export const IESS_PERSONAL = ECUADOR_2026.iessPersonal;

/** Maternidad (art. 152): 12 semanas; parto múltiple, +10 días. IESS 75% / empleador 25%. */
export const MATERNIDAD_DIAS = 84;
export const MATERNIDAD_EXTRA_MULTIPLE = 10;
export const MATERNIDAD_PRENATAL = 14;
export const SUBSIDIO_IESS_MATERNIDAD = 0.75;
export const PARTE_EMPLEADOR_MATERNIDAD = 0.25;
export const MATERNIDAD_APORTES_REQUERIDOS = 12;

/** Paternidad (art. 152, reforma Ley Orgánica del Derecho al Cuidado Humano, RO 309 de 2023). */
export const PATERNIDAD_BASE = 15;
export const PATERNIDAD_CESAREA_MULTIPLE = 5;
export const PATERNIDAD_PREMATURO = 8;
export const PATERNIDAD_ENFERMEDAD_GRAVE = 25;

/** Subsidio de enfermedad del IESS. */
export const ENFERMEDAD_DIAS_EMPLEADOR = 3;
export const ENFERMEDAD_MAX_DIAS_IESS = 185;
export const ENFERMEDAD_CORTE_TRAMO_1 = 67;
export const ENFERMEDAD_PCT_TRAMO_1 = 0.75;
export const ENFERMEDAD_PCT_TRAMO_2 = 0.6666;

/**
 * Tabla de Pensiones Alimenticias Mínimas 2026 (Acuerdo MDH-DM-2026-0005-A, 29-ene-2026),
 * sobre el ingreso ya neto del aporte personal al IESS. Niveles 3 a 6: porcentaje único
 * "para uno o más derechohabientes".
 */
export const TABLA_ALIMENTOS = [
  { nivel: 1, topeSBU: 1.25, uno: { joven: 0.2812, mayor: 0.2949 }, dos: { joven: 0.3971, mayor: 0.4313 }, tres: { joven: 0.5218, mayor: 0.5423 } },
  { nivel: 2, topeSBU: 3.0, uno: { joven: 0.3484, mayor: 0.3696 }, dos: { joven: 0.4745, mayor: 0.4951 }, tres: { joven: 0.4745, mayor: 0.4951 } },
  { nivel: 3, topeSBU: 4.0, uno: { joven: 0.3849, mayor: 0.4083 }, dos: { joven: 0.3849, mayor: 0.4083 }, tres: { joven: 0.3849, mayor: 0.4083 } },
  { nivel: 4, topeSBU: 6.5, uno: { joven: 0.3979, mayor: 0.4221 }, dos: { joven: 0.3979, mayor: 0.4221 }, tres: { joven: 0.3979, mayor: 0.4221 } },
  { nivel: 5, topeSBU: 9.0, uno: { joven: 0.4114, mayor: 0.4364 }, dos: { joven: 0.4114, mayor: 0.4364 }, tres: { joven: 0.4114, mayor: 0.4364 } },
  { nivel: 6, topeSBU: null, uno: { joven: 0.4253, mayor: 0.4512 }, dos: { joven: 0.4253, mayor: 0.4512 }, tres: { joven: 0.4253, mayor: 0.4512 } },
];

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/trabajo/licencias-y-pension-alimenticia',
  title: 'Licencias por hijos y enfermedad en Ecuador: qué te pagan y quién lo paga',
  description:
    'Licencia de maternidad de 12 semanas con el 75% del IESS y el 25% del empleador, licencia de paternidad de 15 a 25 días, subsidio de enfermedad del IESS y la Tabla de Pensiones Alimenticias Mínimas vigente.',
  silo: 'Trabajo',
  siloHref: '/ec/trabajo',
  locale: 'ec',

  eyebrow: 'Ecuador · licencias y cuidado · Código del Trabajo e IESS',
  h1: 'Nace un hijo o me enfermo: ¿qué me pagan y quién lo paga?',
  lede:
    'Las licencias de maternidad, paternidad y enfermedad tienen dos preguntas: cuántos días te corresponden y de qué bolsillo sale la plata. Casi nunca sale de uno solo: en maternidad el IESS pone el 75% y el empleador el 25%; en enfermedad los primeros días los paga la empresa y recién después entra el subsidio. Y si la familia se separa, aparece una tercera cuenta: la pensión alimenticia, que tiene tabla oficial y piso legal.',
  stamps: [
    'Maternidad 12 semanas · IESS 75% + empleador 25%',
    'Paternidad 15 días · hasta 25 en casos especiales',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿Qué situación estás atravesando?',
    intro:
      'Cada licencia tiene su duración, su forma de pago y su trámite. Elige la tuya: en el desglose vas a ver quién paga cada parte.',
    items: [
      {
        id: 'maternidad',
        label: 'Voy a ser madre',
        hint: '12 semanas · IESS 75% + empleador 25%',
        answer:
          'La licencia de maternidad es de 12 semanas —84 días— y se cobra el 100% de la remuneración: el IESS subsidia el 75% y el empleador paga el 25%.',
        yes: [
          'Doce semanas de licencia remunerada por el nacimiento (art. 152)',
          'Diez días adicionales en caso de nacimiento múltiple',
          'La licencia arranca dos semanas antes de la fecha probable de parto',
          `Para cobrar el subsidio del IESS hacen falta al menos ${MATERNIDAD_APORTES_REQUERIDOS} aportaciones previas`,
        ],
        warn: [
          DISCLAIMER_LAB,
          'Las ampliaciones por cesárea y por nacimiento prematuro que introdujo la Ley Orgánica del Derecho al Cuidado Humano corresponden a la licencia de paternidad, no a la de maternidad: la maternidad solo se extiende por parto múltiple',
          'Después de la licencia corresponden dos horas diarias de permiso de lactancia hasta que el hijo cumpla doce meses, sin descuento de remuneración',
        ],
        plazo:
          'la licencia se solicita con el certificado del IESS; el subsidio se tramita en línea y se acredita una vez validado el aviso de reposo.',
      },
      {
        id: 'paternidad',
        label: 'Voy a ser padre',
        hint: '15 días · más en casos especiales',
        answer:
          'La licencia de paternidad es de 15 días calendario remunerados al 100%, y sube a 20, 23 o 25 días según la circunstancia del nacimiento.',
        yes: [
          'Quince días calendario por nacimiento normal, remunerados al 100% (art. 152)',
          'Veinte días si hubo cesárea o nacimiento múltiple',
          'Veintitrés días si el hijo nació prematuro o requiere cuidados especiales',
          'Veinticinco días si el hijo nació con enfermedad degenerativa, terminal o irreversible, o con discapacidad severa',
        ],
        warn: [
          DISCLAIMER_LAB,
          'La licencia la paga íntegramente el empleador: no hay subsidio del IESS para la paternidad como sí lo hay para la maternidad',
          'Los días son calendario, no hábiles, y se justifican con el certificado médico correspondiente',
        ],
        plazo:
          'se toma desde el nacimiento o dentro de los días posteriores que fija el reglamento; se justifica con el certificado médico.',
      },
      {
        id: 'enfermedad',
        label: 'Estoy con reposo médico',
        hint: 'Empleador 3 días · después subsidio IESS',
        answer:
          'Los primeros tres días de reposo los paga el empleador al 100%; desde el cuarto entra el subsidio del IESS, con tope de 185 días.',
        yes: [
          'Los primeros tres días de reposo los cubre el empleador al 100% de la remuneración',
          'Desde el cuarto día el IESS paga un subsidio calculado sobre el promedio de la materia gravada de los últimos meses',
          'El subsidio arranca en el 75% y baja después a alrededor de dos tercios',
          'El tope del subsidio por enfermedad no profesional es de 185 días',
        ],
        warn: [
          DISCLAIMER_LAB,
          'Los tramos del subsidio y sus días de corte los fija la normativa vigente del IESS y pueden cambiar: verifica el porcentaje aplicable a tu caso antes de contar con el monto',
          'Si el reposo viene de un accidente de trabajo o de una enfermedad profesional el régimen es otro, el del Seguro General de Riesgos del Trabajo, con prestaciones distintas',
        ],
        plazo:
          'el aviso de reposo lo emite el médico tratante y debe validarse en el IESS dentro de los plazos del instituto para no perder el subsidio.',
      },
      {
        id: 'alimenticia',
        label: 'Tengo que pagar o cobrar pensión alimenticia',
        hint: 'Tabla oficial · piso legal por hijo',
        answer:
          'La pensión alimenticia mínima sale de una tabla oficial: se descuenta el aporte al IESS del ingreso, se ubica el nivel y se aplica el porcentaje según edad y número de hijos.',
        yes: [
          'La base de cálculo es el ingreso del alimentante descontando el aporte personal al IESS del 9,45%',
          'Seis niveles de ingreso expresados en SBU, cada uno con su porcentaje',
          'El porcentaje sube si el beneficiario tiene 3 años o más; con hijos de distintas edades se usa el del mayor',
          `Si el alimentante gana menos de un SBU o no declara ingresos, la base mínima es 1 SBU (${usd(SBU)})`,
        ],
        warn: [
          DISCLAIMER_LAB,
          'Es un piso legal, no un techo: el juez puede fijar un valor mayor según las necesidades del beneficiario y la capacidad del alimentante, nunca menor',
          'Si el hijo tiene discapacidad se suma un porcentaje adicional de un SBU según el grado, que esta cuenta no incluye',
        ],
        plazo:
          'la tabla la actualiza el Ministerio de Desarrollo Humano una vez al año, cuando cambia el SBU; las pensiones fijadas en el mínimo se ajustan solas.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Todo en dólares. Ecuador está dolarizado: las licencias, los subsidios y la pensión alimenticia se fijan y se pagan en dólares.',
  fields: [
    {
      id: 'remuneracion',
      label: 'Remuneración mensual (USD)',
      prefix: '$',
      value: '800',
      thousands: true,
      help: 'Base de las licencias y del subsidio. Para la pensión alimenticia, el ingreso mensual del alimentante antes de descuentos.',
    },
    {
      id: 'tipoParto',
      label: 'Tipo de nacimiento (maternidad)',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Nacimiento simple' },
        { value: 'multiple', label: 'Nacimiento múltiple' },
      ],
      help: 'La licencia de maternidad solo se extiende por nacimiento múltiple: diez días más.',
    },
    {
      id: 'circunstancia',
      label: 'Circunstancia del nacimiento (paternidad)',
      type: 'select',
      value: 'normal',
      options: [
        { value: 'normal', label: 'Parto normal' },
        { value: 'cesarea', label: 'Cesárea o parto múltiple' },
        { value: 'prematuro', label: 'Prematuro o cuidados especiales' },
        { value: 'grave', label: 'Enfermedad grave o discapacidad severa del hijo' },
      ],
      help: 'Define los días de la licencia de paternidad: 15, 20, 23 o 25 días calendario.',
    },
    {
      id: 'diasReposo',
      label: 'Días de reposo médico',
      type: 'number',
      value: 30,
      min: 0,
      max: 365,
      step: 1,
      help: 'Los tres primeros los paga el empleador; desde el cuarto entra el subsidio del IESS, con tope de 185 días.',
    },
    {
      id: 'hijos',
      label: 'Cantidad de hijos del alimentante',
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      help: 'El monto total de la pensión se divide entre todos los hijos del alimentante.',
    },
    {
      id: 'edadHijo',
      label: 'Edad del beneficiario de mayor edad',
      type: 'number',
      value: 5,
      min: 0,
      max: 21,
      step: 1,
      help: 'La tabla distingue entre 0 a 2 años y 3 años en adelante. Con hijos de distintas edades se usa el del mayor.',
    },
  ],
  fineprint: DISCLAIMER_LAB,

  chart: {
    type: 'donut',
    title: 'Quién paga qué',
    caption:
      'En maternidad y enfermedad, cómo se reparte el pago entre el IESS y el empleador. En pensión alimenticia, qué parte del ingreso del alimentante se va a la pensión.',
  },
  breakdownTitle: 'Días, montos y quién los paga',
  breakdownIntro:
    'Cada línea con la norma que la manda. Las licencias se calculan sobre un mes comercial de 30 días.',

  faq: [
    {
      q: '¿Cuántas semanas de licencia por maternidad hay en Ecuador?',
      a: 'Doce semanas, es decir 84 días, según el art. 152 del Código del Trabajo. En caso de nacimiento múltiple el plazo se extiende diez días más, o sea 94 días. La licencia empieza dos semanas antes de la fecha probable de parto, y durante todo ese período la madre cobra el 100% de su remuneración.',
    },
    {
      q: '¿Quién paga la licencia de maternidad, el IESS o la empresa?',
      a: `Los dos. El IESS subsidia el ${(SUBSIDIO_IESS_MATERNIDAD * 100).toFixed(0)}% de la remuneración y el empleador completa el ${(PARTE_EMPLEADOR_MATERNIDAD * 100).toFixed(0)}% restante, de modo que la madre percibe el 100%. Para acceder al subsidio del IESS hacen falta al menos ${MATERNIDAD_APORTES_REQUERIDOS} aportaciones mensuales previas; si no se llega a ese mínimo, la remuneración queda íntegramente a cargo del empleador.`,
    },
    {
      q: '¿Cuántos días de licencia por paternidad corresponden?',
      a: 'Quince días calendario por un parto normal, tras la reforma de la Ley Orgánica del Derecho al Cuidado Humano. Suben a 20 días si hubo cesárea o parto múltiple, a 23 si el hijo nació prematuro o requiere cuidados especiales, y a 25 días si nació con enfermedad degenerativa, terminal o irreversible, o con discapacidad severa. En todos los casos la paga el empleador al 100%.',
    },
    {
      q: '¿La cesárea alarga la licencia de maternidad?',
      a: 'No. Es una confusión frecuente: las ampliaciones por cesárea y por nacimiento prematuro que trajo la reforma de 2023 se aplican a la licencia de paternidad. La licencia de maternidad solo se extiende por nacimiento múltiple, con diez días adicionales sobre las doce semanas.',
    },
    {
      q: '¿Cómo funciona el permiso de lactancia?',
      a: 'Terminada la licencia de maternidad, la madre tiene derecho a una jornada reducida de seis horas —o a dos horas diarias de permiso, según cómo se organice— hasta que el hijo cumpla doce meses de edad, sin que eso afecte su remuneración. Es un derecho independiente de la licencia y no se descuenta de ella.',
    },
    {
      q: '¿Quién me paga si estoy con reposo por enfermedad?',
      a: `Los primeros ${ENFERMEDAD_DIAS_EMPLEADOR} días los cubre el empleador al 100% de la remuneración. Desde el cuarto día entra el subsidio del IESS, calculado sobre el promedio de la materia gravada de los últimos meses: arranca en el 75% y baja después a alrededor de dos tercios, con un tope de ${ENFERMEDAD_MAX_DIAS_IESS} días por enfermedad no profesional. Los tramos exactos los fija la normativa del IESS.`,
    },
    {
      q: '¿Qué pasa si el reposo supera los 185 días?',
      a: 'Se agota el subsidio por enfermedad no profesional. A partir de ahí el caso se evalúa por otras vías: la comisión de valuación de incapacidades del IESS puede derivar en una pensión por incapacidad, o la relación laboral puede terminar según lo que prevé el Código del Trabajo. Si el origen fue un accidente de trabajo o una enfermedad profesional, el régimen aplicable es el de Riesgos del Trabajo, con sus propias prestaciones.',
    },
    {
      q: '¿Cuánto es la pensión alimenticia mínima en Ecuador?',
      a: `El piso absoluto de la tabla vigente es de ${usd(SBU * 0.2812)} al mes por un hijo de 0 a 2 años y de ${usd(SBU * 0.2949)} por uno de 3 años en adelante: el 28,12% y el 29,49% de un SBU en el nivel más bajo. Ese mínimo se aplica incluso si el alimentante gana menos de un SBU o no declara ingresos, porque la tabla toma un SBU como base mínima referencial.`,
    },
    {
      q: '¿Sobre qué ingreso se calcula la pensión alimenticia?',
      a: 'Sobre el ingreso del alimentante descontando el aporte personal al IESS del 9,45%, según el acuerdo ministerial vigente y la jurisprudencia constitucional. Es decir que un sueldo de mil dólares se calcula sobre novecientos cinco y medio, no sobre mil. Esa base se expresa en SBU para ubicar el nivel de la tabla.',
    },
    {
      q: '¿Tener más hijos sube el porcentaje de la pensión?',
      a: 'Solo en los dos niveles más bajos de ingreso. Del tercer nivel en adelante el acuerdo fija un porcentaje único para uno o más beneficiarios: lo que cambia es que ese monto total se reparte entre todos los hijos, así que la pensión por hijo baja aunque el porcentaje sea el mismo.',
    },
    {
      q: '¿La pensión alimenticia se puede fijar por encima del mínimo?',
      a: 'Sí. La tabla es un piso, no un techo. El juez puede fijar una pensión mayor atendiendo a las necesidades del beneficiario y a la capacidad económica real del alimentante, incluidos ingresos que no figuran en un rol de pagos. Lo que no puede es fijar una pensión por debajo del mínimo de la tabla.',
    },
    {
      q: '¿Se puede despedir a una trabajadora embarazada o a alguien con reposo médico?',
      a: 'La trabajadora embarazada o en período de lactancia tiene estabilidad reforzada: un despido en ese período es ineficaz y da lugar a indemnizaciones agravadas además de las ordinarias. Durante el reposo médico validado por el IESS la relación laboral se suspende, no termina: el despido en ese contexto se trata como despido intempestivo con las consecuencias del art. 188.',
    },
  ],

  sources: [
    { name: 'Ministerio del Trabajo — Código del Trabajo (art. 152, licencias de maternidad y paternidad)', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
    { name: 'IESS — Subsidios de maternidad y enfermedad', url: 'https://www.iess.gob.ec/', publisher: 'Instituto Ecuatoriano de Seguridad Social' },
    { name: 'Ministerio de Desarrollo Humano — Tabla de Pensiones Alimenticias Mínimas (Acuerdo MDH-DM-2026-0005-A)', url: 'https://www.desarrollohumano.gob.ec/', publisher: 'Ministerio de Desarrollo Humano del Ecuador' },
    { name: 'Consejo de la Judicatura — Pensiones alimenticias (SUPA)', url: 'https://www.funcionjudicial.gob.ec/', publisher: 'Consejo de la Judicatura del Ecuador' },
    { name: 'Datos citables: tabla de pensiones alimenticias mínimas del año en curso', url: 'https://hacecuentas.com/ec/datos-pension-alimenticia-ecuador-2026', publisher: 'Hacé Cuentas' },
  ],

  replaces: [
    '/ec/calculadora-licencia-maternidad-ecuador',
    '/ec/calculadora-licencia-paternidad-ecuador',
    '/ec/calculadora-subsidio-enfermedad-iess-ecuador',
    '/ec/calculadora-pension-alimenticia-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
