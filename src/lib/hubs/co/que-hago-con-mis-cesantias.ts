import type { HubData } from '../types';
import { COLOMBIA_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Retiro, traslado o dejo quietas mis cesantías?"
 *
 * Constantes de plata: src/lib/data/colombia-2026.ts (la misma tabla maestra que
 * usan las fórmulas vivas). Las rentabilidades de los fondos vienen de la
 * Superfinanciera y viajan en RENTABILIDAD_FONDOS, donde se ven y se auditan.
 */

/** Disclaimer YMYL — textual, igual que en el resto de los hubs de plata. */
const DISCLAIMER =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Salario mínimo vigente — Decreto 1469/2025. */
export const SMLMV = COLOMBIA_2026.smlmv;

/** Aporte del empleador: 1/12 del salario por año trabajado (art. 249 CST). */
export const CESANTIAS_PCT = COLOMBIA_2026.prestaciones.cesantiasPorcentaje;

/** Intereses a las cesantías: 12% anual, los paga el empleador DIRECTO al trabajador (Ley 52/1975). */
export const INTERES_CESANTIAS = COLOMBIA_2026.prestaciones.interesesCesantias;

/** Sanción moratoria por no consignar al 14 de febrero: 1 día de salario por día (Ley 50/1990 art. 99). */
export const SANCION_MORA_DIAS = COLOMBIA_2026.prestaciones.sancionMoraCesantiasDiasPorDia;

/**
 * Rentabilidad nominal y comisión del portafolio de corto plazo de cada fondo de
 * cesantías. Superfinanciera, corte 31-mar-2026 (mismos valores que usaba
 * src/lib/formulas/cesantias-traslado-fondo-rendimiento-colombia.ts).
 * El FNA no cobra comisión y su rendimiento es el que reconoce sobre el saldo.
 */
export const RENTABILIDAD_FONDOS = [
  { id: 'porvenir', nombre: 'Porvenir', rentabilidad: 9.84, comision: 0.48 },
  { id: 'proteccion', nombre: 'Protección', rentabilidad: 10.55, comision: 0.5 },
  { id: 'colfondos', nombre: 'Colfondos', rentabilidad: 8.4, comision: 0.45 },
  { id: 'skandia', nombre: 'Skandia (ex Old Mutual)', rentabilidad: 8.64, comision: 0.52 },
  { id: 'fna', nombre: 'Fondo Nacional del Ahorro (FNA)', rentabilidad: 3.2, comision: 0 },
];

/** Costo estimado del traslado entre fondos: días fuera del mercado mientras viaja el saldo. */
export const TRASLADO = { costoPct: 0.0015, diasHabiles: 12, cadaCuantosAnios: 2 };

/** Multiplicador de crédito del FNA sobre el saldo de cesantías (referencial: el FNA lo revisa por convocatoria). */
export const FNA_MULTIPLO_CREDITO = 4;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/trabajo/que-hago-con-mis-cesantias',
  title: 'Cesantías en Colombia: ¿retiro, traslado de fondo o las dejo quietas?',
  description:
    'Compará las cuatro salidas de tus cesantías: retiro para vivienda, retiro para educación, traslado a otro fondo o dejarlas quietas ganando el 12% de intereses más el rendimiento del fondo. Con el aporte del empleador y la consignación del 14 de febrero.',
  silo: 'Trabajo',
  siloHref: '/co/trabajo',
  locale: 'co',

  eyebrow: 'Colombia · cesantías · CST art. 249',
  h1: '¿Retiro, traslado o dejo quietas mis cesantías?',
  lede:
    'Las cesantías son tuyas, pero sacarlas tiene costo y dejarlas tiene rendimiento. Esta cuenta pone las cuatro salidas una al lado de la otra con tu saldo real: cuánto te queda hoy, cuánto en unos años y qué perdés en cada camino.',
  stamps: [
    'Aporte del empleador: 1/12 del salario por año',
    `Intereses del ${(INTERES_CESANTIAS * 100).toFixed(0)}% anual · Ley 52/1975`,
    'Consignación al fondo: 14 de febrero',
    '4 calculadoras adentro',
  ],

  resultLabel: 'Con lo que te quedás por este camino',

  cases: {
    title: '¿Qué querés hacer con el saldo?',
    intro:
      'Las cuatro salidas son legales y ninguna es "la correcta" siempre: dependen de para qué necesitás la plata y de cuántos años falta para que la uses. Arrancamos por la más frecuente.',
    items: [
      {
        id: 'quietas',
        label: 'Las dejo quietas en el fondo',
        hint: 'Intereses del 12% + rendimiento del fondo',
        answer:
          'Quietas ganás dos cosas distintas: el 12% anual que te paga el empleador en efectivo y el rendimiento que el fondo le saca al saldo.',
        yes: [
          'El empleador consigna al fondo lo causado hasta el 31 de diciembre, con plazo hasta el 14 de febrero',
          `Los intereses del ${(INTERES_CESANTIAS * 100).toFixed(0)}% anual NO van al fondo: te los paga el empleador directo, en tu cuenta, a más tardar el 31 de enero`,
          'El saldo dentro del fondo sigue rindiendo al portafolio de corto plazo, libre de retención mientras no lo saques',
          'Son tu colchón real si te despiden: es la plata que te entregan sin trámite cuando termina el contrato',
        ],
        warn: [
          DISCLAIMER,
          'El rendimiento del fondo es variable y el pasado no lo garantiza: la Superfinanciera publica el dato con rezago de meses',
          'Si la inflación del año le gana al rendimiento neto del fondo, quietas perdés poder de compra aunque el saldo suba',
        ],
        plazo:
          'si el empleador no consigna al 14 de febrero, debe un día de salario por cada día de retraso (Ley 50/1990 art. 99).',
      },
      {
        id: 'vivienda',
        label: 'Las retiro para vivienda',
        hint: 'Compra, construcción, mejora o pago de hipoteca',
        answer:
          'Vivienda es el único destino que te deja sacar el 100% del saldo, y el retiro no paga impuesto si el destino se acredita.',
        yes: [
          'Compra de vivienda, lote para construir, construcción, mejora o remodelación, y abono a un crédito hipotecario',
          'Podés retirar hasta el 100% del saldo si el soporte del destino cubre el monto',
          'El fondo exige el soporte antes de girar: promesa de compraventa, escritura, licencia, contrato de obra o certificado del banco',
          'El giro sale a nombre del vendedor, el constructor o el banco, no a tu cuenta personal',
        ],
        warn: [
          DISCLAIMER,
          'El retiro corta en seco el rendimiento del saldo: lo que sacás deja de capitalizar desde ese día',
          'Si el destino no se acredita, el fondo no gira y algunos casos quedan gravados como ingreso: guardá todo el soporte',
          'Retirar para vivienda no reemplaza la cuota inicial: mirá antes si te alcanza sin vaciar el fondo, porque es tu red si te despiden',
        ],
        plazo: 'el fondo suele girar entre 5 y 15 días hábiles desde que el soporte queda aprobado.',
      },
      {
        id: 'educacion',
        label: 'Las retiro para educación',
        hint: 'Tuya, del cónyuge o de los hijos',
        answer:
          'Educación permite retiros parciales para matrícula tuya, de tu cónyuge o de tus hijos, contra recibo de la institución.',
        yes: [
          'Matrícula de educación superior, técnica o tecnológica en institución aprobada por el Ministerio de Educación',
          'Cubre al trabajador, al cónyuge o compañero permanente y a los hijos (Ley 1064/2006 y art. 102 Ley 50/1990)',
          'Se puede retirar semestre a semestre: no hay que vaciar el fondo de una',
          'El giro va directo a la institución educativa o al ICETEX, contra el recibo de matrícula',
        ],
        warn: [
          DISCLAIMER,
          'Cada fondo fija su propio tope por solicitud: verificá cuánto te dejan sacar por semestre antes de contar con la plata',
          'La parte retirada deja de ganar el rendimiento del fondo, pero los intereses del 12% del empleador siguen corriendo sobre lo causado en el año',
          'Cursos cortos, diplomados y colegios no siempre califican: confirmá que la institución esté en la lista aprobada',
        ],
        plazo: 'pedilo con el recibo de matrícula en mano y antes de la fecha de pago: el giro no es inmediato.',
      },
      {
        id: 'traslado',
        label: 'Las traslado a otro fondo',
        hint: 'Rentabilidad neta comparada · una vez cada 2 años',
        answer:
          'Trasladar sólo conviene si la diferencia de rentabilidad neta compensa los días que el saldo pasa fuera del mercado.',
        yes: [
          'Comparás rentabilidad menos comisión, no rentabilidad bruta: la comisión se come buena parte de la diferencia',
          'El traslado es gratis, pero el saldo pasa días en tránsito sin rendir',
          `Sólo podés trasladarte una vez cada ${TRASLADO.cadaCuantosAnios} años y sin deuda pendiente con el fondo de origen`,
          'El FNA es una alternativa aparte: rinde menos, pero da acceso a crédito de vivienda y a subsidio con reglas propias',
        ],
        warn: [
          DISCLAIMER,
          'La rentabilidad publicada es histórica y no se repite: una diferencia de menos de un punto puede darse vuelta el año que viene',
          'Con saldos chicos la diferencia anual son unos pocos miles de pesos, y el trámite no lo vale',
          `Este cálculo usa el corte de la Superfinanciera del 31-mar-2026: verificá el dato del mes antes de decidir`,
        ],
        plazo: `el traslado tarda del orden de ${TRASLADO.diasHabiles} días hábiles y en ese lapso el saldo no rinde.`,
      },
    ],
  },

  inputsTitle: 'Tu situación de cesantías',
  inputsIntro:
    'Con el salario y el saldo alcanza para ver las cuatro salidas. El monto a retirar y el fondo destino sólo pesan en las ramas que los usan.',
  fields: [
    {
      id: 'salario',
      label: 'Salario mensual (COP)',
      prefix: '$',
      value: '2.600.000',
      thousands: true,
      help: 'Sueldo base más lo que sea salario. Si ganás hasta 2 SMLMV, sumale el auxilio de transporte: también entra en la base de cesantías.',
    },
    {
      id: 'meses',
      label: 'Meses trabajados en el año',
      type: 'number',
      value: 12,
      min: 1,
      max: 12,
      step: 1,
      help: 'Meses causados en el año que se consigna en febrero. Si entraste a mitad de año, poné los meses reales.',
    },
    {
      id: 'saldo',
      label: 'Saldo que ya tenés en el fondo (COP)',
      prefix: '$',
      value: '5.000.000',
      thousands: true,
      help: 'Lo acumulado de años anteriores, antes de la consignación de este febrero.',
    },
    {
      id: 'retiro',
      label: 'Cuánto querés retirar (COP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'Sólo se usa en las ramas de vivienda y educación. Vivienda admite hasta el 100% del saldo.',
    },
    {
      id: 'fondo',
      label: 'Fondo donde están hoy',
      type: 'select',
      value: 'porvenir',
      options: RENTABILIDAD_FONDOS.map((f) => ({ value: f.id, label: f.nombre })),
      help: 'Rentabilidad y comisión del portafolio de corto plazo, según el corte de la Superfinanciera.',
    },
    {
      id: 'destino',
      label: 'Fondo al que pensás trasladarlas',
      type: 'select',
      value: 'proteccion',
      options: RENTABILIDAD_FONDOS.map((f) => ({ value: f.id, label: f.nombre })),
      help: 'Sólo se usa en la rama de traslado. Incluye al FNA como alternativa.',
    },
    {
      id: 'anios',
      label: 'Años que pensás dejarlas quietas',
      type: 'number',
      value: 3,
      min: 1,
      max: 15,
      step: 1,
      help: 'Horizonte de la proyección. Cuanto más corto, menos pesa la diferencia de rentabilidad entre fondos.',
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'bars',
    title: 'Cuánto valdría cada camino al final del horizonte',
    caption:
      'Compara las cuatro salidas medidas con la misma vara: el saldo que te queda en el fondo al final del plazo más la plata que ya sacaste. El retiro no aparece castigado porque la plata sigue siendo tuya, pero deja de capitalizar desde el día que la girás.',
  },
  breakdownTitle: 'De dónde sale cada peso',
  breakdownIntro:
    'Primero lo que entra este año (aporte del empleador e intereses del 12%), después lo que pasa con el saldo según el camino que elijas.',

  faq: [
    {
      q: '¿Cuánto me tienen que consignar de cesantías al año?',
      a: 'Un mes de salario por cada año trabajado, o la parte proporcional si trabajaste menos: eso es un doceavo del salario mensual por cada mes causado, alrededor del 8,33%. La base incluye el salario y todo lo que sea constitutivo de salario, más el auxilio de transporte si lo recibís. El empleador liquida lo causado al 31 de diciembre y lo consigna en tu fondo con plazo máximo hasta el 14 de febrero del año siguiente.',
    },
    {
      q: '¿Qué pasa si mi empleador no consigna antes del 14 de febrero?',
      a: 'Entra en mora y debe un día de salario por cada día de retraso, sin tope, según el artículo 99 de la Ley 50 de 1990. No es una multa que va al Estado: es plata que te debe a vos. Se reclama por vía laboral y prescribe a los tres años, así que conviene revisar el extracto del fondo en febrero, no en diciembre.',
    },
    {
      q: '¿Los intereses del 12% van al fondo o a mi bolsillo?',
      a: `A tu bolsillo. Es la confusión más común: los intereses del ${(INTERES_CESANTIAS * 100).toFixed(0)}% anual sobre las cesantías causadas los paga el empleador directamente al trabajador, a más tardar el 31 de enero, y nunca entran al fondo. Lo que va al fondo es el capital de las cesantías. Por eso el rendimiento del fondo y el 12% son dos cosas distintas que se suman, no compiten.`,
    },
    {
      q: '¿Para qué puedo retirar mis cesantías sin que sea un retiro irregular?',
      a: 'Por tres puertas: terminación del contrato, vivienda (compra, lote, construcción, mejora o abono a hipoteca) y educación (tuya, de tu cónyuge o de tus hijos, en institución aprobada). Cualquier otro destino no está permitido y el fondo no gira. Retirar por fuera de esas causales expone al trabajador y a quien facilite el trámite.',
    },
    {
      q: '¿Puedo sacar todo el saldo para comprar vivienda?',
      a: 'Sí. Vivienda es el único destino que admite el 100% del saldo, siempre que el soporte del destino cubra el monto que pedís. El giro sale a nombre del vendedor, del constructor o del banco, no a tu cuenta. Pensalo dos veces igual: vaciar el fondo te deja sin colchón el día que termine el contrato, que es justo cuando esa plata rinde más.',
    },
    {
      q: '¿Cada cuánto me puedo cambiar de fondo de cesantías?',
      a: `Una vez cada ${TRASLADO.cadaCuantosAnios} años, y sólo si no tenés obligaciones pendientes con el fondo de origen. El trámite es gratis y lo inicia el fondo destino, pero el saldo pasa del orden de ${TRASLADO.diasHabiles} días hábiles en tránsito, sin rendir. Con saldos chicos ese lapso se come buena parte de lo que ibas a ganar.`,
    },
    {
      q: '¿Conviene trasladarme al fondo que más rinde?',
      a: 'Sólo si mirás rentabilidad neta, es decir rendimiento menos comisión, y sólo si la diferencia se sostiene en el tiempo. Los rankings de la Superfinanciera rotan año a año: el fondo que lidera un trimestre puede quedar último el siguiente. Como regla práctica, una diferencia neta menor a un punto porcentual sobre un saldo de unos pocos millones no justifica el trámite.',
    },
    {
      q: '¿Qué es el FNA y por qué aparece en la comparación?',
      a: `El Fondo Nacional del Ahorro es una entidad estatal que también administra cesantías. Rinde bastante menos que los fondos privados, pero a cambio te habilita crédito de vivienda con tasas por debajo del mercado y te da puntaje para postularte a subsidios. La regla gruesa es que el crédito puede llegar a varias veces tu saldo (del orden de ${FNA_MULTIPLO_CREDITO} veces), aunque el monto real lo define cada convocatoria y tu capacidad de pago. Si el objetivo declarado es casa propia, el FNA suele ganarle a un punto extra de rentabilidad.`,
    },
    {
      q: '¿Las cesantías pagan impuesto de renta?',
      a: 'El auxilio de cesantías y sus intereses están tratados como renta exenta hasta cierto tope, con reglas propias según el nivel de ingreso del trabajador: los salarios medios y bajos, en la práctica, no pagan. Lo que sí pesa siempre es que el saldo del fondo es patrimonio tuyo al 31 de diciembre y suma para los topes que definen si estás obligado a declarar. Consultá a un contador si tu ingreso mensual es alto.',
    },
    {
      q: '¿Qué pasa con mis cesantías si me despiden?',
      a: 'Se liquidan hasta el último día trabajado y se te entregan a vos, sin exigirte destino: se retiran por terminación del contrato. Junto con eso corren los intereses del 12% proporcionales al tiempo del año. Por eso el saldo del fondo es la red real de un trabajador colombiano: es lo único que se cobra rápido y sin trámite el día que se cae el contrato.',
    },
    {
      q: '¿El régimen de cesantías cambia si entré antes de 1991?',
      a: 'Sí. Quienes siguen en el régimen tradicional, anterior a la Ley 50 de 1990, tienen retroactividad: la liquidación se hace con el último salario, no año por año, y no hay consignación anual a un fondo. Es un grupo cada vez más chico, pero si es tu caso esta cuenta no aplica tal cual: pedile al empleador la liquidación bajo el régimen tuyo.',
    },
    {
      q: '¿El salario integral genera cesantías?',
      a: 'No. Quien está en salario integral, que arranca en 13 salarios mínimos, ya tiene incluido el factor prestacional del 30% dentro del sueldo: no hay cesantías, ni intereses, ni prima aparte. Si estás en integral y tu empleador te consigna cesantías, hay algo mal armado en el contrato.',
    },
  ],

  sources: [
    {
      name: 'Código Sustantivo del Trabajo, art. 249 — auxilio de cesantía',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_sustantivo_trabajo_pr008.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 52 de 1975 — intereses del 12% anual sobre las cesantías',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/1616468',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Ley 50 de 1990, art. 99 — consignación al 14 de febrero y sanción por mora',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0050_1990.html',
      publisher: 'Secretaría del Senado',
    },
    {
      name: 'Ley 1064 de 2006 — retiro de cesantías para educación',
      url: 'https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/1673444',
      publisher: 'SUIN-Juriscol',
    },
    {
      name: 'Superintendencia Financiera de Colombia — rentabilidad de los fondos de cesantías',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superfinanciera',
      date: '31-03-2026',
    },
    {
      name: 'Fondo Nacional del Ahorro — cesantías y crédito de vivienda',
      url: 'https://www.fna.gov.co/',
      publisher: 'FNA',
    },
    {
      name: 'Decreto 1469 de 2025 — salario mínimo legal mensual vigente',
      url: 'https://www.mintrabajo.gov.co/',
      publisher: 'MinTrabajo',
      date: '29-12-2025',
    },
  ],

  replaces: [
    '/co/calculadora-retiro-cesantias-porvenir',
    '/co/calculadora-cesantias-traslado-fondo-rendimiento-colombia',
    '/co/calculadora-fna-cesantias-colombia-vivienda-rentabilidad',
    '/co/calculadora-aporte-cesantias-empleador-empleado-colombia-fondo',
  ],

  lastReviewed: '2026-07-28',
};

/** Export usado por el sello de la página. */
export const SMLMV_FMT = cop(SMLMV);
