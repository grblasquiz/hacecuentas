import type { HubData } from './types';

/**
 * Hub de decisión — "¿Tengo que pagar Bienes Personales?"
 * Arquetipo: RAMIFICADO. La pregunta real es BINARIA: ¿superás el mínimo no
 * imponible o no? Eso va primero y grande en el panel de resultado. Recién
 * después viene el cuánto.
 *
 * Absorbe 8 URLs (ver hub.replaces). Tres de ellas son impuestos PROVINCIALES
 * o municipales (ABL de CABA, inmobiliario de PBA, valuación fiscal de
 * Neuquén), que NO son Bienes Personales —que es nacional—. Entran por la rama
 * de valuación: la valuación fiscal del inmueble y del automotor sí es el
 * insumo con el que se arma la base imponible de Bienes Personales, y es la
 * confusión más común del contribuyente. El ABL en sí no se calcula acá.
 *
 * DE DÓNDE SALEN LOS NÚMEROS:
 *  - MNI, deducción de casa-habitación y escala de 3 tramos: espejo exacto de
 *    `src/lib/formulas/bienes-personales.ts` (período fiscal 2025, DDJJ 2026,
 *    Ley 23.966 con la reforma de la Ley 27.743). Es la misma escala que usa
 *    /datos-bienes-personales-2026.
 *  - REIBP: tasa fija 0,45% × 5 años de la misma fórmula.
 *  - Depreciación del automotor: `Math.max(0.40, 1 - antiguedad * 0.08)`, el
 *    factor de `src/lib/formulas/valuacion-fiscal-automotor-provincia.ts`.
 *
 * EL GRÁFICO ES POSICIONAL (`scale`): el eje es la base imponible, la primera
 * franja es el mínimo no imponible y el marcador te dice de un vistazo si caés
 * adentro o afuera. Es la respuesta a la pregunta binaria, dibujada.
 */

/** Mínimo no imponible — período fiscal 2025 (DDJJ 2026). */
export const MNI = 384_728_044.57;

/** Tope de la deducción por casa-habitación. */
export const DEDUCCION_CASA = 1_346_548_155.99;

/** Escala progresiva sobre el EXCEDENTE del MNI (Ley 27.743, tope general 1%). */
export const ESCALA: Array<{ hasta: number; tasa: number; acumulado: number; label: string }> = [
  { hasta: 52_664_283.73, tasa: 0.005, acumulado: 0, label: '0,50% — primer tramo' },
  { hasta: 114_105_948.16, tasa: 0.0075, acumulado: 263_321.42, label: '0,75% — segundo tramo' },
  { hasta: Number.MAX_SAFE_INTEGER, tasa: 0.01, acumulado: 724_133.89, label: '1,00% — tramo superior' },
];

/** REIBP: régimen especial de ingreso, tasa fija por 5 años adelantados. */
export const REIBP_TASA = 0.0045;
export const REIBP_ANIOS = 5;

/** Depreciación del automotor para su valuación fiscal. */
export const DEPRECIACION_ANUAL = 0.08;
export const DEPRECIACION_PISO = 0.4;

/** Período fiscal al que corresponden la escala y el mínimo. */
export const PERIODO_FISCAL = '2025';

/**
 * Qué cambia en cada rama.
 *  - casa: 1 aplica la deducción de casa-habitación, 0 la apaga.
 *  - exterior: 1 suma los bienes del exterior a la base (unificado por Ley 27.743).
 *  - reibp: usa la tasa fija en vez de la escala progresiva.
 */
export const CASE_MATH: Record<string, { casa: number; exterior: number; reibp: number }> = {
  basico: { casa: 1, exterior: 1, reibp: 0 },
  'sin-casa': { casa: 0, exterior: 1, reibp: 0 },
  cripto: { casa: 1, exterior: 1, reibp: 0 },
  exterior: { casa: 1, exterior: 1, reibp: 0 },
  reibp: { casa: 1, exterior: 1, reibp: 1 },
  valuacion: { casa: 1, exterior: 1, reibp: 0 },
};

/** Copiado textual de getCalculatorDisclaimer() — dominio 'tax'. */
const DISCLAIMER =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'impuestos/bienes-personales',
  title: '¿Tengo que pagar Bienes Personales? — Mínimo no imponible y escala',
  description:
    'Primero la respuesta binaria: si tu patrimonio supera el mínimo no imponible o no. Después, cuánto pagás según la escala por tramo, con la deducción de casa-habitación, la valuación fiscal del auto y el régimen REIBP.',
  silo: 'Impuestos',
  siloHref: '/impuestos',

  eyebrow: 'Guía y estimación impositiva',
  h1: '¿Tengo que pagar Bienes Personales?',
  lede:
    'La pregunta es binaria antes que numérica: o superás el mínimo no imponible o no lo superás. Si no lo superás, no pagás nada y no hay más cuenta que hacer. Si lo superás, sólo tributa el excedente, y con la escala progresiva por tramo.',
  stamps: [
    'Actualizado 27-07-2026',
    `Período fiscal ${PERIODO_FISCAL} · Ley 27.743`,
    '8 calculadoras adentro',
  ],

  resultLabel: 'Bienes Personales a pagar',

  cases: {
    title: '¿Cuál es tu situación patrimonial?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'basico',
        label: 'Tengo casa propia, auto y ahorros',
        hint: 'El caso más común',
        answer: 'Si tu patrimonio no supera el mínimo no imponible, no pagás Bienes Personales.',
        yes: [
          'Se suman todos los bienes al 31 de diciembre: inmuebles, automotores, plazos fijos, fondos, acciones, cripto y efectivo',
          'Se descuenta la casa-habitación hasta el tope de la deducción',
          'Del resto se resta el mínimo no imponible, y sólo el excedente tributa',
          'Sobre ese excedente se aplica la escala progresiva por tramo',
        ],
        warn: [
          DISCLAIMER,
          'Los bienes se valúan al 31 de diciembre, no al día de hoy: lo que compraste o vendiste en enero no cambia la declaración del período anterior',
          'Los inmuebles se toman por la valuación fiscal actualizada, no por lo que pagaste ni por lo que valen en el mercado',
        ],
        plazo: 'la DDJJ y el pago del saldo vencen entre junio y julio, según terminación de CUIT.',
      },
      {
        id: 'sin-casa',
        label: 'Alquilo, no tengo casa propia',
        hint: 'Sin deducción de vivienda',
        answer: 'Sin casa-habitación no hay deducción de vivienda: sólo corre el mínimo no imponible.',
        yes: [
          'Todos tus bienes suman a la base sin la deducción de casa-habitación',
          'El mínimo no imponible sigue aplicando igual',
        ],
        warn: [
          DISCLAIMER,
          'Si tenés un inmueble que no es tu vivienda permanente (una inversión, una casa de fin de semana, un lote), ese no accede a la deducción de casa-habitación',
        ],
        plazo: 'la condición de casa-habitación se prueba con la residencia permanente, no con la escritura.',
      },
      {
        id: 'cripto',
        label: 'Tengo cripto, cedears o acciones',
        hint: 'Activos financieros',
        answer: 'La cripto y los cedears se declaran a su valor al 31 de diciembre.',
        yes: [
          'Cripto, cedears, acciones y fondos comunes entran a la base como cualquier otro bien',
          'Se valúan a su cotización al 31 de diciembre del período fiscal',
          'Los plazos fijos en pesos y los títulos públicos nacionales tienen tratamiento propio: revisalo con tu contador',
        ],
        warn: [
          DISCLAIMER,
          'La cotización del 31 de diciembre puede estar muy lejos del promedio del año: la volatilidad juega a favor o en contra según cuándo cierre',
          'Las tenencias en exchanges del exterior también se declaran, y el organismo cruza información',
        ],
        plazo: 'guardá el screenshot del saldo al 31 de diciembre: es la prueba de la valuación.',
      },
      {
        id: 'exterior',
        label: 'Tengo bienes en el exterior',
        hint: 'Alícuota unificada',
        answer: 'Desde la Ley 27.743 los bienes del exterior tributan con la misma escala que los del país.',
        yes: [
          'La escala diferencial que castigaba a los bienes del exterior quedó eliminada',
          'Ahora se suman a la misma base y tributan a la misma alícuota',
          'Podés computar como pago a cuenta impuestos análogos pagados en el exterior, con tope',
        ],
        warn: [
          DISCLAIMER,
          'La unificación no cambia la obligación de informar: los bienes en el exterior siguen siendo declarables',
          'La conversión a pesos se hace al tipo de cambio del 31 de diciembre',
        ],
        plazo: 'el pago a cuenta por impuestos análogos del exterior tiene tope: no puede generar saldo a favor.',
      },
      {
        id: 'reibp',
        label: 'Entré al REIBP',
        hint: 'Régimen especial',
        answer: 'En el REIBP pagás una tasa fija por cinco años adelantados.',
        yes: [
          'Tasa fija del 0,45% anual sobre la base, pagada por cinco períodos por adelantado',
          'A cambio quedás blindado ante subas de alícuota durante ese plazo',
        ],
        warn: [
          DISCLAIMER,
          'El REIBP es un régimen de adhesión con plazo de ingreso propio: no se entra retroactivamente',
          'Si tu patrimonio va a bajar en los próximos años, adelantar cinco períodos puede salir más caro que tributar año a año',
        ],
        plazo: 'la adhesión al régimen tiene fecha límite propia, distinta de la del vencimiento de la DDJJ.',
      },
      {
        id: 'valuacion',
        label: 'Sólo quiero saber cuánto valen mi casa y mi auto para el fisco',
        hint: 'Valuación fiscal',
        answer: 'La valuación fiscal es el insumo del impuesto, no el impuesto.',
        yes: [
          'El automotor se toma por la tabla de valuación, que baja con la antigüedad: 8% anual con piso del 40% del valor de origen',
          'El inmueble se toma por su valuación fiscal actualizada, que suele estar muy por debajo del valor de mercado',
          'Esas mismas valuaciones son las que después usan la patente, el ABL de CABA y el inmobiliario provincial',
        ],
        warn: [
          DISCLAIMER,
          'El ABL de CABA, el inmobiliario de la Provincia de Buenos Aires y el inmobiliario de Neuquén son impuestos provinciales o municipales: NO son Bienes Personales, que es nacional. Comparten el insumo (la valuación fiscal), no el impuesto',
          'Cada jurisdicción actualiza su valuación fiscal por su cuenta y en fechas distintas',
        ],
        plazo: 'la valuación fiscal del inmueble figura en la boleta del impuesto inmobiliario o del ABL.',
      },
    ],
  },

  inputsTitle: 'Tu patrimonio al 31 de diciembre',
  inputsIntro:
    'Cargá los valores fiscales, no los de mercado. Podés dejar en cero lo que no tengas.',
  fields: [
    {
      id: 'casa',
      label: 'Valuación fiscal de tu casa-habitación',
      prefix: '$',
      value: '900.000.000',
      thousands: true,
      help: 'Se deduce hasta el tope de la exención de vivienda. Si alquilás, dejalo en 0.',
    },
    {
      id: 'otrosInmuebles',
      label: 'Otros inmuebles (valuación fiscal)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Inversión, casa de fin de semana, lotes, cocheras.',
    },
    {
      id: 'autoValor',
      label: 'Valor del auto 0 km (tabla de valuación)',
      prefix: '$',
      value: '30.000.000',
      thousands: true,
    },
    { id: 'antiguedad', label: 'Años de antigüedad del auto', type: 'number', min: 0, max: 40, value: 5 },
    {
      id: 'inversiones',
      label: 'Plazos fijos, fondos, acciones y cedears',
      prefix: '$',
      value: '40.000.000',
      thousands: true,
    },
    { id: 'cripto', label: 'Cripto (valor al 31 de diciembre)', prefix: '$', value: '5.000.000', thousands: true },
    { id: 'exterior', label: 'Bienes en el exterior', prefix: '$', value: '0', thousands: true },
    {
      id: 'otros',
      label: 'Efectivo, obras de arte y otros bienes',
      prefix: '$',
      value: '3.000.000',
      thousands: true,
    },
  ],
  fineprint: `${DISCLAIMER} El mínimo no imponible, el tope de la deducción de casa-habitación y la escala corresponden al período fiscal ${PERIODO_FISCAL}.`,

  chart: {
    type: 'scale',
    title: '¿De qué lado del mínimo caés?',
    caption:
      'El eje es tu base imponible. La primera franja es el mínimo no imponible: si el marcador cae ahí adentro, no pagás. Pasado el mínimo, cada franja es un tramo de la escala progresiva y sólo el excedente tributa.',
  },
  breakdownTitle: 'Cómo se arma tu base imponible',
  breakdownIntro:
    'Primero se suman todos los bienes, después se descuentan la casa-habitación y el mínimo no imponible. Sólo lo que queda paga.',

  faq: [
    {
      q: '¿Cuál es el mínimo no imponible de Bienes Personales?',
      a: `Para el período fiscal ${PERIODO_FISCAL} (la DDJJ que se presenta en 2026) el mínimo no imponible es de $384.728.044,57. Si tu patrimonio gravado queda por debajo de esa cifra, no pagás Bienes Personales y no hay escala que aplicar. Es un piso, no una franquicia: si lo superás, sólo tributa el excedente, no todo el patrimonio.`,
    },
    {
      q: '¿Cuánto se puede deducir por la casa propia?',
      a: 'La casa-habitación está exenta hasta $1.346.548.155,99 para el mismo período fiscal. Si tu vivienda vale menos que ese tope, se descuenta entera de la base. Si vale más, sólo se descuenta hasta el tope y el excedente queda gravado. La condición es que sea tu vivienda permanente: una casa de fin de semana o un inmueble de inversión no accede a esta deducción.',
    },
    {
      q: '¿Cuáles son los tramos y las alícuotas?',
      a: 'La escala se aplica sobre el excedente del mínimo no imponible, no sobre el patrimonio total. El primer tramo tributa 0,50%, el segundo 0,75% y el tramo superior 1,00%, que es el tope general que fijó la Ley 27.743. Como cada tramo se calcula por separado y se acumula, la alícuota efectiva sobre tu patrimonio total siempre queda bastante por debajo de la marginal.',
    },
    {
      q: '¿Los bienes del exterior pagan más?',
      a: 'Ya no. Hasta la reforma de la Ley 27.743 existía una escala diferencial más alta para los bienes en el exterior. Esa escala quedó eliminada y hoy los bienes del país y del exterior se suman a la misma base y tributan con la misma alícuota. Lo que sí subsiste es la obligación de declararlos, y el cómputo como pago a cuenta de impuestos análogos abonados afuera, con tope.',
    },
    {
      q: '¿Cómo se valúa el auto para Bienes Personales?',
      a: 'Por la tabla de valuación del organismo, no por lo que pagaste ni por lo que vale en el mercado. Como referencia, la valuación baja alrededor de un 8% por cada año de antigüedad con un piso del 40% del valor de origen: a partir de unos siete u ocho años deja de caer. Ese mismo valor es el que después define cuánta patente pagás.',
    },
    {
      q: '¿La cripto y los cedears se declaran?',
      a: 'Sí. Se declaran a su cotización al 31 de diciembre del período fiscal, incluidas las tenencias en exchanges del exterior. La fecha de corte importa mucho: en activos volátiles el valor del 31 de diciembre puede estar muy lejos del promedio del año, y es ese el que manda. Conviene guardar el comprobante del saldo a esa fecha.',
    },
    {
      q: '¿Qué es el REIBP y me conviene?',
      a: 'Es un régimen especial de ingreso que permite pagar una tasa fija del 0,45% anual sobre la base por cinco períodos adelantados, a cambio de quedar blindado ante subas de alícuota. Conviene cuando esperás que tu patrimonio crezca o que las alícuotas suban. Si el patrimonio va a bajar, adelantar cinco años puede terminar costando más que tributar año a año.',
    },
    {
      q: '¿El ABL de CABA es Bienes Personales?',
      a: 'No. El ABL es un tributo de la Ciudad de Buenos Aires y el inmobiliario provincial es de cada provincia; Bienes Personales es un impuesto nacional. Lo único que comparten es el insumo: la valuación fiscal del inmueble. Podés no pagar Bienes Personales y pagar ABL igual, o al revés.',
    },
    {
      q: '¿Cuándo vence Bienes Personales?',
      a: 'La presentación de la declaración jurada y el pago del saldo caen entre junio y julio del año siguiente al período fiscal, según la terminación del CUIT. Durante el año además pueden corresponder anticipos, que son pagos a cuenta del período en curso.',
    },
    {
      q: '¿Se pueden restar las deudas?',
      a: 'En Bienes Personales el criterio general es que el impuesto grava los bienes, no el patrimonio neto: las deudas personales, en principio, no se descuentan. La excepción típica es el saldo del crédito hipotecario sobre el inmueble destinado a casa-habitación. Es uno de los puntos donde más conviene consultar con un contador antes de presentar.',
    },
    {
      q: '¿Qué pasa si me olvidé de declarar un bien?',
      a: 'Se rectifica la declaración jurada. Presentar una rectificativa a tiempo y por iniciativa propia suele salir mucho más barato que esperar a que el organismo lo detecte por cruce de información, algo cada vez más frecuente con cuentas bancarias, exchanges y registros de propiedad.',
    },
    {
      q: '¿Tengo que presentar la declaración aunque no pague?',
      a: 'Puede corresponder. La obligación de presentar y la de pagar son cosas distintas: hay contribuyentes que quedan alcanzados por el deber de informar aunque su base no supere el mínimo no imponible, por ejemplo por estar inscriptos en el impuesto o por otras rentas. Que el resultado dé cero no equivale automáticamente a no presentar nada.',
    },
  ],

  sources: [
    {
      name: 'Ley 23.966 — Título VI, Impuesto sobre los Bienes Personales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/826/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 27.743 de Medidas Fiscales Paliativas y Relevantes — unificación de alícuotas y REIBP',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/310958/20240708',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '08-07-2024',
    },
    {
      name: 'Bienes Personales — mínimo no imponible, escala y vencimientos',
      url: 'https://www.afip.gob.ar/gananciasYBienes/bienes-personales/',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Valuación fiscal de automotores',
      url: 'https://www.dnrpa.gov.ar/',
      publisher: 'Dirección Nacional de los Registros Nacionales de la Propiedad del Automotor',
    },
    {
      name: 'Alumbrado, Barrido y Limpieza (ABL) y valuación fiscal de inmuebles',
      url: 'https://www.agip.gob.ar/impuestos/inmobiliario-abl',
      publisher: 'AGIP · Ciudad de Buenos Aires',
    },
    {
      name: 'Impuesto Inmobiliario — Provincia de Buenos Aires',
      url: 'https://www.arba.gov.ar/Aplicaciones/Inmobiliario.asp',
      publisher: 'ARBA',
    },
  ],

  replaces: [
    '/calculadora-bienes-personales-2026',
    '/calculadora-valuacion-fiscal-automotor-argentina',
    '/calculadora-bienes-personales-tramos-alicuota-2026',
    '/calculadora-renta-financiera-cedular-personas',
    '/calculadora-valuacion-fiscal-neuquen-2026-impuesto-inmobiliario',
    '/calculadora-inmobiliario-provincial-pba-tramos',
    '/calculadora-abl-caba-valuacion-fiscal-actualizada-2026',
    '/calculadora-impuesto-bienes-personales-2026-cripto-cedears',
  ],

  lastReviewed: '2026-08-04',
  audience: 'AR',
};
