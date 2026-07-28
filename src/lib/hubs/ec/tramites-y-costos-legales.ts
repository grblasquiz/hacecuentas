import type { HubData } from '../types';
import { ECUADOR_2026, PASAPORTE_EC_2026, MULTA_SUFRAGIO_EC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto cuesta ese trámite, esa firma de notaría o esa multa?"
 *
 * Cálculo espejado de las fórmulas vivas:
 *   costo-pasaporte-registro-civil-ecuador.ts · multa-no-sufragar-cne-ecuador.ts ·
 *   honorarios-notariales-ecuador.ts · traspaso-dominio-vehicular-ecuador.ts
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const SBU = ECUADOR_2026.sbu;
export const IVA = ECUADOR_2026.iva;
export const PASAPORTE = PASAPORTE_EC_2026;
export const MULTA_SUFRAGIO = MULTA_SUFRAGIO_EC_2026;

/** Costo de la cédula, requisito previo del pasaporte. */
export const COSTO_CEDULA = 15;

/**
 * Aranceles notariales de valor fijo (USD, sin IVA), tarifario del Consejo de la Judicatura.
 * OJO: el tarifario los expresa como porcentaje del SBU. Se guardan también en % del SBU para
 * que el día que cambie el salario básico el valor se recalcule solo y no quede congelado.
 */
export const NOTARIA_FIJOS = {
  poder_especial: { label: 'Poder especial', pctSBU: 0.12 },
  reconocimiento_firma: { label: 'Reconocimiento de firma', pctSBU: 0.032884 },
  declaracion_juramentada: { label: 'Declaración juramentada', pctSBU: 0.032884 },
  protocolizacion: { label: 'Protocolización', pctSBU: 0.058465 },
};

/** Tabla gradual descendente para actos de cuantía determinada (compraventa y promesa). */
export const NOTARIA_CUANTIA = [
  { hasta: 5000, tasa: 0.005 },
  { hasta: 20000, tasa: 0.0045 },
  { hasta: 60000, tasa: 0.004 },
  { hasta: 200000, tasa: 0.0035 },
  { hasta: null, tasa: 0.003 },
];
/** Honorario mínimo referencial del acto de cuantía. */
export const NOTARIA_MINIMO = 15;

/** Traspaso de dominio vehicular. */
export const TRASPASO = {
  impuestoPct: 0.01,
  tramiteANT: 9,
  especieMatricula: 24,
  notariaDefault: 45,
  mantenimientoVial: { liviano: 5, moto: 2.5, pesado: 10, extrapesado: 15 },
};

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/tramites/tramites-y-costos-legales',
  title: 'Cuánto cuesta un trámite en Ecuador: pasaporte, multa por no votar, notaría y traspaso',
  description:
    'Calcula el costo real de los trámites más comunes en el Ecuador: el pasaporte del Registro Civil según tu caso, la multa del CNE por no sufragar en porcentaje del SBU, los honorarios notariales del tarifario del Consejo de la Judicatura con IVA, y el traspaso de dominio de un vehículo usado.',
  silo: 'Trámites',
  siloHref: '/ec/tramites',
  locale: 'ec',

  eyebrow: 'Ecuador · Registro Civil, CNE, Consejo de la Judicatura y ANT',
  h1: '¿Cuánto te va a costar ese trámite, esa firma en la notaría o esa multa?',
  lede:
    'Los trámites en el Ecuador tienen un precio publicado, pero casi nunca es un solo número: hay exoneraciones que la gente no reclama, multas que suben solas cada año porque van atadas al salario básico, y actos notariales donde el IVA y los descuentos cambian bastante el total. Aquí sale la cuenta completa.',
  stamps: [
    `SBU ${usd(SBU)} · las multas electorales van en % del SBU`,
    `Pasaporte adulto ${usd(PASAPORTE_EC_2026.adulto)} · tercera edad ${usd(PASAPORTE_EC_2026.terceraEdad)} · discapacidad exonerada`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo total del trámite',

  cases: {
    title: '¿Qué trámite estás haciendo?',
    intro:
      'Cada trámite lo cobra una institución distinta y con una lógica distinta: el pasaporte tiene tarifa fija con exoneraciones, la multa electoral es un porcentaje del salario básico, la notaría tiene tarifario nacional con IVA y el traspaso vehicular mezcla un impuesto con varias tasas.',
    items: [
      {
        id: 'pasaporte',
        label: 'Pasaporte',
        hint: 'Registro Civil · con exoneraciones',
        answer: `El pasaporte ordinario electrónico cuesta ${usd(PASAPORTE_EC_2026.adulto)} para adultos con diez años de vigencia, y hay descuentos y exoneraciones que mucha gente no reclama.`,
        yes: [
          `Adulto de 18 años o más: ${usd(PASAPORTE_EC_2026.adulto)}, con vigencia de ${PASAPORTE_EC_2026.vigenciaAdulto} años`,
          `Menor de 18 años: ${usd(PASAPORTE_EC_2026.menor)}, con vigencia máxima de ${PASAPORTE_EC_2026.vigenciaMenor} años`,
          `Persona de 65 años o más: 50% de descuento, ${usd(PASAPORTE_EC_2026.terceraEdad)}`,
          'Persona con discapacidad del 30% o más: exonerada del costo',
          'La renovación cuesta exactamente lo mismo que la primera emisión',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'No existe un recargo por trámite urgente: en las oficinas principales de Quito Matriz, Guayaquil y Cuenca San Blas la entrega es el mismo día sin costo extra. Si te lo cobran, reclama',
          'La cédula vigente es requisito previo: si además tienes que renovarla, súmale ese costo al trámite',
          'La vigencia del pasaporte de un menor no puede superar los cinco años aunque pagues lo mismo cada vez',
        ],
        plazo: 'la cita se agenda en el portal del Registro Civil; en las oficinas principales la entrega es el mismo día y en el resto tarda de 24 a 72 horas.',
      },
      {
        id: 'sufragio',
        label: 'Multa por no sufragar',
        hint: 'CNE · en % del SBU',
        answer: `No votar cuesta el 10% del salario básico unificado, es decir ${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.1)}, y las multas son acumulativas por cada elección.`,
        yes: [
          `No sufragar: 10% del SBU, ${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.1)}`,
          `Miembro de junta receptora del voto que no asiste a la capacitación: 10% del SBU, ${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.1)}`,
          `Miembro designado que no concurre a integrar la mesa: 15% del SBU, ${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.15)}`,
          `El voto es obligatorio de los ${MULTA_SUFRAGIO_EC_2026.edadObligatorioMin} a los ${MULTA_SUFRAGIO_EC_2026.edadObligatorioMax} años`,
          'Tienen voto facultativo, y por lo tanto no generan multa: los de 16 y 17 años, los de 65 o más, las personas con discapacidad, quienes no saben leer y escribir, y los ecuatorianos residentes en el exterior',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Como la multa se fija en porcentaje del SBU, dejarla impaga no congela su valor: el monto sube automáticamente cada enero cuando sube el salario básico',
          'Sin el certificado de votación, o sin el comprobante de pago de la multa, quedas trabado en varios trámites ante instituciones públicas',
          'El abandono injustificado de funciones de junta receptora se sanciona con 11 a 20 SBU, un rango que fija el organismo electoral caso por caso: por eso no se puede calcular automáticamente',
          'Hay justificativos válidos que eximen de la multa: enfermedad o impedimento con certificado, calamidad doméstica y ausencia del país',
        ],
        plazo: 'la justificación o el pago se tramitan ante el Consejo Nacional Electoral, y conviene resolverlo antes de necesitar el certificado para otro trámite.',
      },
      {
        id: 'notaria',
        label: 'Trámite ante notaría',
        hint: 'Tarifario nacional · más IVA',
        answer: 'El tarifario de notarías lo fija el Consejo de la Judicatura y es el mismo en todo el país: ninguna notaría puede cobrar distinto por el mismo acto.',
        yes: [
          'Los actos de cuantía determinada, como una compraventa, se cobran con una tabla gradual descendente: del 0,50% en cuantías chicas al 0,30% en las más altas',
          'Los actos de valor fijo, como un poder especial, un reconocimiento de firma, una declaración juramentada o una protocolización, tienen tarifa única expresada como porcentaje del salario básico',
          `A todos los honorarios notariales se les suma el IVA del ${(ECUADOR_2026.iva * 100).toFixed(0)}%`,
          'Hay descuentos de ley: 25% para vivienda de interés social y 50% para adultos mayores',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El honorario notarial no es todo el costo de una compraventa: aparte van el registro de la propiedad, que ronda el 0,3%, y el impuesto de alcabala municipal del 1%',
          'La tabla gradual se aplica sobre el valor total del acto, no por tramos marginales: pasar de un escalón a otro cambia la tasa de todo el monto',
          'Los valores fijos son referenciales del tarifario vigente; el tarifario del Consejo de la Judicatura es la única fuente vinculante y se actualiza con el salario básico',
        ],
        plazo: 'el tarifario notarial vigente se consulta en el portal del Consejo de la Judicatura y rige para todas las notarías del país.',
      },
      {
        id: 'traspaso',
        label: 'Traspaso de dominio vehicular',
        hint: 'Impuesto 1% más tasas y notaría',
        answer: 'Comprar un auto usado cuesta el precio más un 1% de impuesto sobre el mayor entre el contrato y el avalúo del SRI, más el trámite y la notaría.',
        yes: [
          'Impuesto a la transferencia de dominio: 1% sobre el mayor entre el valor del contrato de compraventa y el avalúo registrado en el SRI',
          `Trámite de traspaso en la ANT: ${usd(TRASPASO.tramiteANT)} · nueva especie de matrícula: ${usd(TRASPASO.especieMatricula)}`,
          'Tasa de mantenimiento vial según la clase de vehículo',
          'Honorario de la notaría por el contrato de compraventa legalizado',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'El impuesto se calcula sobre el MAYOR entre el precio pactado y el avalúo del SRI: declarar un precio bajo en el contrato no baja el impuesto si el avalúo es más alto',
          'Antes de traspasar, revisa que el vehículo no tenga multas ni gravámenes pendientes: se transfieren con el auto y bloquean la matriculación',
          'Este costo es aparte de la matriculación anual del vehículo, que se paga igual en el mes que corresponde por placa',
        ],
        plazo: 'el traspaso debe registrarse en la ANT dentro del plazo legal desde la firma del contrato; pasado ese plazo hay recargo.',
      },
    ],
  },

  inputsTitle: 'Los datos del trámite',
  inputsIntro:
    'Solo se usan los campos de la rama que elegiste; el resto puedes dejarlo como está. Todo en dólares.',
  fields: [
    {
      id: 'solicitante',
      label: 'Quién solicita el pasaporte',
      type: 'select',
      value: 'adulto',
      options: [
        { value: 'adulto', label: 'Adulto de 18 años o más' },
        { value: 'menor', label: 'Menor de 18 años' },
        { value: 'tercera_edad', label: 'Persona de 65 años o más (50% de descuento)' },
        { value: 'discapacidad', label: 'Persona con discapacidad del 30% o más (exonerada)' },
      ],
      help: 'La renovación cuesta lo mismo que la primera emisión.',
    },
    {
      id: 'incluyeCedula',
      label: '¿Necesitas renovar también la cédula?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, la tengo vigente' },
        { value: 'si', label: `Sí, súmame la cédula (${usd(COSTO_CEDULA)})` },
      ],
      help: 'La cédula vigente es requisito previo para tramitar el pasaporte.',
    },
    {
      id: 'situacionElectoral',
      label: 'Situación electoral',
      type: 'select',
      value: 'no_sufragar',
      options: [
        { value: 'no_sufragar', label: 'No sufragué (10% del SBU)' },
        { value: 'jrv_capacitacion', label: 'Miembro de JRV: no asistí a la capacitación (10% del SBU)' },
        { value: 'jrv_no_integrar', label: 'Miembro de JRV designado: no fui a integrar la mesa (15% del SBU)' },
        { value: 'facultativo', label: 'Tengo voto facultativo o justificativo válido (sin multa)' },
      ],
      help: 'El voto es facultativo, y por lo tanto sin multa, para 16 y 17 años, 65 o más, discapacidad, analfabetismo y residencia en el exterior.',
    },
    {
      id: 'elecciones',
      label: 'Elecciones sin sufragar',
      type: 'number',
      value: 1,
      min: 1,
      max: 20,
      step: 1,
      help: 'Las multas electorales son acumulativas: una por cada elección.',
    },
    {
      id: 'tipoActo',
      label: 'Acto notarial',
      type: 'select',
      value: 'compraventa',
      options: [
        { value: 'compraventa', label: 'Compraventa o transferencia de dominio (por cuantía)' },
        { value: 'promesa', label: 'Promesa de compraventa (por cuantía)' },
        { value: 'poder_especial', label: 'Poder especial' },
        { value: 'reconocimiento_firma', label: 'Reconocimiento de firma' },
        { value: 'declaracion_juramentada', label: 'Declaración juramentada' },
        { value: 'protocolizacion', label: 'Protocolización' },
      ],
      help: 'Los actos de cuantía usan la tabla gradual sobre el valor; el resto tiene tarifa fija.',
    },
    {
      id: 'cuantia',
      label: 'Valor del acto notarial ($)',
      prefix: '$',
      value: '80.000',
      thousands: true,
      help: 'Solo se usa en compraventa y promesa. Es el valor de la transacción que se escritura.',
    },
    {
      id: 'descuentoNotarial',
      label: 'Descuento de ley aplicable',
      type: 'select',
      value: 'ninguno',
      options: [
        { value: 'ninguno', label: 'Sin descuento' },
        { value: 'vis', label: 'Vivienda de interés social (−25%)' },
        { value: 'adulto_mayor', label: 'Adulto mayor (−50%)' },
      ],
      help: 'El descuento de vivienda de interés social aplica en actos de cuantía de hasta $60.000.',
    },
    {
      id: 'valorVehiculo',
      label: 'Valor de compraventa del vehículo ($)',
      prefix: '$',
      value: '12.000',
      thousands: true,
      help: 'El precio pactado en el contrato. El impuesto se calcula sobre el mayor entre este valor y el avalúo del SRI.',
    },
    {
      id: 'avaluoSRI',
      label: 'Avalúo del vehículo en el SRI ($)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Lo consultas por placa en el portal del SRI. Si es mayor al precio del contrato, manda el avalúo.',
    },
    {
      id: 'tipoVehiculo',
      label: 'Clase de vehículo que traspasas',
      type: 'select',
      value: 'liviano',
      options: [
        { value: 'liviano', label: 'Liviano' },
        { value: 'moto', label: 'Motocicleta' },
        { value: 'pesado', label: 'Pesado' },
        { value: 'extrapesado', label: 'Extrapesado' },
      ],
      help: 'Define la tasa de mantenimiento vial que se cobra en el traspaso.',
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo del trámite',
    caption:
      'Separa lo que es impuesto o multa de lo que es tasa de servicio, honorario profesional e IVA. En los trámites del Estado la tasa suele ser lo de menos: lo que pesa es el impuesto o el honorario privado.',
  },
  breakdownTitle: 'El trámite, línea por línea',
  breakdownIntro:
    'Cada componente por separado, con la norma o el organismo que lo cobra, y el total que realmente vas a pagar en ventanilla.',

  faq: [
    {
      q: '¿Cuánto cuesta el pasaporte en Ecuador?',
      a: `El pasaporte ordinario electrónico cuesta ${usd(PASAPORTE_EC_2026.adulto)} para mayores de 18 años, con una vigencia de ${PASAPORTE_EC_2026.vigenciaAdulto} años. Para menores de 18 cuesta ${usd(PASAPORTE_EC_2026.menor)} con vigencia máxima de ${PASAPORTE_EC_2026.vigenciaMenor} años. Las personas de 65 años o más tienen 50% de descuento, o sea ${usd(PASAPORTE_EC_2026.terceraEdad)}, y las personas con discapacidad del 30% o más están exoneradas. La renovación cuesta lo mismo que la primera emisión.`,
    },
    {
      q: '¿Se paga más si necesito el pasaporte urgente?',
      a: 'No. No existe un recargo por trámite urgente en el Registro Civil ecuatoriano. En las oficinas principales de Quito Matriz, Guayaquil y Cuenca San Blas la entrega es el mismo día sin costo adicional; en el resto de agencias la emisión tarda entre 24 y 72 horas. Si alguien te ofrece "acelerar" el trámite por un pago extra, no es un servicio oficial.',
    },
    {
      q: '¿Cuánto es la multa por no votar en Ecuador?',
      a: `El 10% del salario básico unificado, es decir ${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.1)} con el SBU vigente. Si eras miembro designado de una junta receptora del voto y no fuiste a integrar la mesa, la multa sube al 15% del SBU (${usd(MULTA_SUFRAGIO_EC_2026.sbu * 0.15)}); no asistir a la capacitación siendo miembro designado es el 10%. Las multas son acumulativas por cada elección en la que no sufragaste.`,
    },
    {
      q: '¿Quiénes no pagan multa por no votar?',
      a: `El voto es obligatorio entre los ${MULTA_SUFRAGIO_EC_2026.edadObligatorioMin} y los ${MULTA_SUFRAGIO_EC_2026.edadObligatorioMax} años. Es facultativo, y por lo tanto no genera multa, para las personas de 16 y 17 años, las de 65 años o más, las personas con discapacidad, quienes no saben leer y escribir, y los ecuatorianos residentes en el exterior. Además hay justificativos válidos: enfermedad o impedimento con certificado, calamidad doméstica y ausencia del país.`,
    },
    {
      q: '¿Por qué la multa electoral sube todos los años?',
      a: 'Porque no está fijada en un monto de dólares sino en un porcentaje del salario básico unificado del año de la elección. Cada enero, cuando el Ministerio del Trabajo actualiza el SBU, todas las multas atadas a él suben en la misma proporción, sin que haga falta una resolución nueva. Por eso dejar una multa impaga no la congela: la encarece.',
    },
    {
      q: '¿Cuánto cobra una notaría en Ecuador y puede cobrarme lo que quiera?',
      a: `No puede. El tarifario lo fija el Consejo de la Judicatura y es obligatorio para todas las notarías del país. Los actos de cuantía determinada, como una compraventa, se cobran con una tabla gradual descendente que va del 0,50% para valores de hasta $5.000 al 0,30% para valores de más de $200.000. Los actos de valor fijo tienen tarifa única. A todo se le suma el IVA del ${(ECUADOR_2026.iva * 100).toFixed(0)}%.`,
    },
    {
      q: '¿Qué descuentos existen en los aranceles notariales?',
      a: 'Dos principales: 25% de descuento para actos relacionados con vivienda de interés social, que aplica en cuantías de hasta $60.000, y 50% de descuento para adultos mayores. No se acumulan entre sí. Hay que pedirlos expresamente y acreditar la condición: la notaría no los aplica sola.',
    },
    {
      q: '¿Qué más se paga en una compraventa de inmueble además de la notaría?',
      a: 'El honorario notarial es solo una parte. Aparte van el impuesto de alcabala municipal, que ronda el 1% del valor, y la inscripción en el Registro de la Propiedad, que ronda el 0,3%. En algunos casos también corresponde el impuesto a la utilidad en la compraventa de predios urbanos, la llamada plusvalía municipal, que paga el vendedor. Conviene presupuestar todo junto, no solo la notaría.',
    },
    {
      q: '¿Cuánto cuesta traspasar un auto usado?',
      a: `El componente grande es el impuesto a la transferencia de dominio: 1% sobre el mayor entre el valor del contrato de compraventa y el avalúo del vehículo registrado en el SRI. A eso se suman el trámite de traspaso en la ANT (${usd(TRASPASO.tramiteANT)}), la nueva especie de matrícula (${usd(TRASPASO.especieMatricula)}), la tasa de mantenimiento vial según la clase de vehículo, y el honorario de la notaría por el contrato de compraventa.`,
    },
    {
      q: '¿Conviene declarar un precio bajo en el contrato del vehículo?',
      a: 'No sirve de nada, porque el impuesto se calcula sobre el mayor entre el precio del contrato y el avalúo del SRI. Si declaras menos que el avalúo, el impuesto igual se calcula sobre el avalúo. Y además te deja sin respaldo del precio real ante cualquier reclamo posterior, que es exactamente lo que un contrato de compraventa sirve para evitar.',
    },
    {
      q: '¿Qué reviso antes de comprar un auto usado?',
      a: 'Que no tenga multas de tránsito pendientes, que no esté prendado ni tenga gravámenes, y que el avalúo del SRI coincida con lo que estás pagando. Las multas se transfieren con el vehículo y bloquean la matriculación, así que una deuda del vendedor termina siendo tu problema. Todo eso se consulta por placa en los portales del SRI y de la ANT antes de firmar.',
    },
    {
      q: '¿Necesito el certificado de votación para hacer trámites?',
      a: 'En varias gestiones ante instituciones públicas sí lo piden, y si no votaste tienes que presentar el comprobante de pago de la multa o la justificación aceptada por el Consejo Nacional Electoral. Por eso conviene resolver la multa apenas se genera y no cuando ya estás apurado por otro trámite.',
    },
  ],

  sources: [
    { name: 'Registro Civil (DIGERCIC) — Emisión de pasaporte ordinario', url: 'https://www.gob.ec/dgrcic/tramites/emision-pasaporte-ordinario-primera-vez-renovacion-mayores-18-anos', publisher: 'Dirección General de Registro Civil, Identificación y Cedulación' },
    { name: 'CNE — Compensación y multas a los miembros de las juntas receptoras del voto', url: 'https://www.cne.gob.ec/compensacion-y-multas-a-los-miembros-de-las-juntas-receptoras-del-voto/', publisher: 'Consejo Nacional Electoral' },
    { name: 'Consejo de la Judicatura — Tarifario de servicios notariales', url: 'https://www.funcionjudicial.gob.ec/', publisher: 'Consejo de la Judicatura del Ecuador' },
    { name: 'SRI — Impuestos vehiculares y transferencia de dominio', url: 'https://www.sri.gob.ec/impuestos-vehiculares', publisher: 'Servicio de Rentas Internas' },
    { name: 'ANT — Traspaso de dominio de vehículos', url: 'https://www.ant.gob.ec/', publisher: 'Agencia Nacional de Tránsito' },
    { name: 'Ministerio del Trabajo — Salario básico unificado', url: 'https://www.trabajo.gob.ec/', publisher: 'Ministerio del Trabajo del Ecuador' },
  ],

  replaces: [
    '/ec/calculadora-costo-pasaporte-registro-civil-ecuador',
    '/ec/calculadora-multa-no-sufragar-cne-ecuador',
    '/ec/calculadora-honorarios-notariales-ecuador',
    '/ec/calculadora-traspaso-dominio-vehicular-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
