import type { HubData } from '../types';
import { PARAGUAY_2026, CHE_ROGA_PORA_2026, ANDE_PLIEGO21 } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "Comprar y mantener una casa: cuánto cuesta de verdad".
 *
 * Che Róga Porã, ANDE, IVA y jornal mínimo salen de src/lib/data/paraguay-2026.ts.
 * Los aranceles notariales, la tasa de inscripción y el impuesto inmobiliario NO
 * están en la tabla maestra: se replican de las fórmulas vivas y quedan editables
 * porque su fuente es referencial (ver ARANCELES y INMOBILIARIO).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const CHE_ROGA = {
  version: CHE_ROGA_PORA_2026.version,
  plazoMax: CHE_ROGA_PORA_2026.plazoMaxAnios,
  plazoMin: CHE_ROGA_PORA_2026.plazoMinAnios,
  cuotaMaxPct: CHE_ROGA_PORA_2026.cuotaMaxPctIngreso,
  ingresoMaxSalarios: CHE_ROGA_PORA_2026.ingresoMaxSalarios,
  tasaHasta6SM: CHE_ROGA_PORA_2026.tasaHasta6SM,
  tasa6a9SM: CHE_ROGA_PORA_2026.tasa6a9SM,
  umbralSalarios: CHE_ROGA_PORA_2026.umbralTasaSalarios,
  montoMaxCentral: CHE_ROGA_PORA_2026.montoMaxCentral,
  montoMaxInterior: CHE_ROGA_PORA_2026.montoMaxInterior,
};

/**
 * Escala de honorarios notariales por tramo de valor, con mínimo de 5 jornales.
 * ⚠️ Referencial: replicada de las fórmulas vivas de escrituración y transferencia.
 * No sale de un arancel oficial verificado; el escribano puede cotizar distinto.
 */
export const ARANCELES = {
  escala: [
    { hasta: 50000000, tasa: 0.02 },
    { hasta: 75000000, tasa: 0.0175 },
    { hasta: 100000000, tasa: 0.015 },
    { hasta: 150000000, tasa: 0.0125 },
    { hasta: 200000000, tasa: 0.01 },
    { hasta: null as number | null, tasa: 0.0075 },
  ],
  minimoJornales: 5,
  jornalMinimo: PARAGUAY_2026.jornalMinimo,
  /** Inscripción en la Dirección General de los Registros Públicos. Referencial. */
  inscripcion: 0.008,
  /** Tasa o impuesto municipal de transferencia. Referencial. */
  municipal: 0.003,
  iva: PARAGUAY_2026.iva.general,
};

/** Impuesto inmobiliario: 1% del avalúo fiscal, con descuento por pronto pago. Referencial. */
export const INMOBILIARIO = { tasa: 0.01, descuentoProntoPago: 0.1 };

/** Comisión inmobiliaria de referencia del mercado: 5% + IVA en venta, 1 mes en alquiler. */
export const COMISION = { ventaPctDefault: 5, alquilerMeses: 1, iva: PARAGUAY_2026.iva.general };

/** ANDE, Pliego de Tarifas N° 21: TODO el consumo se factura al precio de su faja. */
export const ANDE = {
  fajas: ANDE_PLIEGO21.fajasResidencial.map((f) => ({
    hasta: Number.isFinite(f.hasta) ? f.hasta : null,
    precio: f.precio,
  })),
  iva: ANDE_PLIEGO21.iva,
  tarifaSocial: ANDE_PLIEGO21.tarifaSocial.map((t) => ({ hasta: t.hasta, pagaPct: t.pagaPct })),
};

export const SMVM = PARAGUAY_2026.salarioMinimo;

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/vivienda/casa-propia',
  title: 'Comprar casa en Paraguay: cuota Che Róga Porã, escritura, comisión e impuestos',
  description:
    'Cuánto cuesta realmente la casa propia en Paraguay: la cuota del crédito Che Róga Porã al 6,5% o 9,9%, los gastos de escrituración, la comisión inmobiliaria, el impuesto inmobiliario anual y la factura de la ANDE.',
  silo: 'Vivienda',
  siloHref: '/py/vivienda',
  locale: 'py',

  eyebrow: 'Paraguay · MUVH · AFD · ANDE',
  h1: '¿Cuánto cuesta de verdad tu casa propia?',
  lede:
    'El precio de la casa es sólo el principio. Esta cuenta junta las cuatro plata que nadie suma al principio: la cuota del crédito, lo que se va en escritura y comisión al firmar, el impuesto inmobiliario de cada año y la factura de luz de cada mes.',
  stamps: [
    `Che Róga Porã ${CHE_ROGA.version}: ${(CHE_ROGA.tasaHasta6SM * 100).toLocaleString('de-DE')}% y ${(CHE_ROGA.tasa6a9SM * 100).toLocaleString('de-DE')}% anual`,
    `La cuota no puede superar el ${(CHE_ROGA.cuotaMaxPct * 100).toFixed(0)}% del ingreso familiar`,
    'ANDE — Pliego de Tarifas N° 21',
    '5 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual del crédito',

  cases: {
    title: '¿En qué etapa estás?',
    intro:
      'Los costos de comprar, los de escriturar y los de mantener la casa son plata distinta y en momentos distintos. Elegí el que te toca ahora.',
    items: [
      {
        id: 'credito',
        label: 'Quiero saber si me da la cuota',
        hint: `Che Róga Porã ${CHE_ROGA.version} · hasta ${CHE_ROGA.plazoMax} años`,
        answer: `La cuota no puede superar el ${(CHE_ROGA.cuotaMaxPct * 100).toFixed(0)}% del ingreso familiar, y la tasa depende de cuántos salarios mínimos ganes.`,
        yes: [
          `Tasa del ${(CHE_ROGA.tasaHasta6SM * 100).toLocaleString('de-DE')}% anual si el ingreso familiar es de hasta ${CHE_ROGA.umbralSalarios} salarios mínimos`,
          `Tasa del ${(CHE_ROGA.tasa6a9SM * 100).toLocaleString('de-DE')}% anual para el tramo de ${CHE_ROGA.umbralSalarios} a ${CHE_ROGA.ingresoMaxSalarios} salarios mínimos`,
          `Plazo de hasta ${CHE_ROGA.plazoMax} años, con cuota fija de sistema francés`,
          `Monto máximo financiable: ${gs(CHE_ROGA.montoMaxCentral)} en Asunción y Central, ${gs(CHE_ROGA.montoMaxInterior)} en el interior`,
        ],
        warn: [
          DISCLAIMER_LEGAL,
          `El programa tiene tope de ingreso: por encima de ${CHE_ROGA.ingresoMaxSalarios} salarios mínimos (${gs(SMVM * CHE_ROGA.ingresoMaxSalarios)}) no calificás`,
          'Es un crédito para la primera vivienda: si ya tenés un inmueble a tu nombre, el programa no aplica',
          'Estirar el plazo baja la cuota pero multiplica los intereses totales: mirá siempre las dos cifras juntas',
        ],
        plazo: 'la aprobación depende del banco o cooperativa que opere el programa y de la calificación crediticia.',
      },
      {
        id: 'escritura',
        label: 'Voy a firmar: cuánto se va en gastos',
        hint: 'Escritura, inscripción y comisión',
        answer: 'Entre escribano, inscripción, tasa municipal y comisión, el costo de cerrar la operación ronda un porcentaje de un dígito sobre el valor.',
        yes: [
          'Honorario del escribano, que baja porcentualmente a medida que sube el valor del inmueble, más IVA',
          'Inscripción en la Dirección General de los Registros Públicos',
          'Tasa o impuesto municipal de transferencia',
          `Comisión inmobiliaria, habitualmente del ${COMISION.ventaPctDefault}% más IVA en una venta`,
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los aranceles notariales y las tasas de inscripción de esta cuenta son valores de referencia del mercado, no una tarifa oficial verificada: pedí presupuesto al escribano antes de cerrar números',
          'Quién paga la comisión y los gastos se define en el contrato: no hay una regla legal única, se negocia',
          `El honorario tiene un mínimo equivalente a ${ARANCELES.minimoJornales} jornales mínimos, así que en operaciones chicas pesa más de lo que sugiere el porcentaje`,
        ],
        plazo: 'los gastos se pagan al momento de la escritura, no se financian con el crédito.',
      },
      {
        id: 'impuesto',
        label: 'Ya tengo la casa: el impuesto de cada año',
        hint: 'Impuesto inmobiliario municipal',
        answer: `El impuesto inmobiliario es del ${(INMOBILIARIO.tasa * 100).toFixed(0)}% del avalúo fiscal, no del precio de mercado.`,
        yes: [
          `Base imponible: el avalúo fiscal del inmueble, que suele ser bastante menor al valor de mercado`,
          `Descuento de alrededor del ${(INMOBILIARIO.descuentoProntoPago * 100).toFixed(0)}% por pago contado anticipado, según la municipalidad`,
          'Lo recauda la municipalidad donde está el inmueble, no la DNIT',
          'El certificado de no adeudar es requisito para escriturar una transferencia',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'La tasa y el descuento por pronto pago varían por municipalidad y por ordenanza: confirmá los tuyos en la municipalidad correspondiente antes de presupuestar',
          'El avalúo fiscal se actualiza: una revaluación puede subir el impuesto sin que la casa haya cambiado en nada',
        ],
        plazo: 'el vencimiento y el descuento por pronto pago los fija cada municipalidad al inicio del año.',
      },
      {
        id: 'ande',
        label: 'La factura de la luz de cada mes',
        hint: 'ANDE · Pliego de Tarifas N° 21',
        answer: 'La ANDE factura TODO el consumo del mes al precio de una sola faja: la que corresponde al total, no por bloques.',
        yes: [
          'El precio por kWh sale de la faja en la que cae tu consumo TOTAL del mes',
          `Sobre el importe de energía se suma el IVA del ${(ANDE.iva * 100).toFixed(0)}%`,
          'La tarifa social (Ley 3480/2008) reduce la factura de usuarios familiares habilitados con consumos de hasta 300 kWh',
          'El aire acondicionado suele ser el que empuja el consumo a la faja siguiente',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'No es una tarifa marginal por bloques: pasarte de la faja encarece TODO el consumo del mes, no sólo los kWh excedentes. Por eso la factura puede pegar un salto desproporcionado',
          'La tarifa social se pierde por encima de los 300 kWh mensuales, sin escalón intermedio',
        ],
        plazo: 'la lectura y la facturación son mensuales: el ahorro se nota recién en el ciclo siguiente.',
      },
    ],
  },

  inputsTitle: 'Los números de tu casa',
  inputsIntro:
    'Cargá lo que ya sepas. Cada bloque de la cuenta funciona solo: si todavía no vas a escriturar, dejá el valor del inmueble y mirá la cuota.',
  fields: [
    {
      id: 'valor',
      label: 'Valor del inmueble (Gs.)',
      prefix: 'Gs.',
      value: '350.000.000',
      thousands: true,
      help: 'Precio de la operación. Es la base de la comisión y de los gastos de escritura.',
    },
    {
      id: 'credito',
      label: 'Monto del crédito a solicitar (Gs.)',
      prefix: 'Gs.',
      value: '300.000.000',
      thousands: true,
      help: `Máximo ${gs(CHE_ROGA.montoMaxCentral)} en Asunción y Central; ${gs(CHE_ROGA.montoMaxInterior)} en el interior.`,
    },
    {
      id: 'plazo',
      label: 'Plazo del crédito (años)',
      type: 'number',
      value: 30,
      min: 5,
      max: CHE_ROGA.plazoMax,
      step: 1,
      help: `El programa financia hasta ${CHE_ROGA.plazoMax} años. Más plazo, menos cuota y más intereses totales.`,
    },
    {
      id: 'ingreso',
      label: 'Ingreso familiar mensual (Gs.)',
      prefix: 'Gs.',
      value: '9.000.000',
      thousands: true,
      help: `Define la tasa y el tope de la cuota. Máximo ${CHE_ROGA.ingresoMaxSalarios} salarios mínimos (${gs(SMVM * CHE_ROGA.ingresoMaxSalarios)}).`,
    },
    {
      id: 'region',
      label: 'Dónde está el inmueble',
      type: 'select',
      value: 'central',
      options: [
        { value: 'central', label: 'Asunción o Departamento Central' },
        { value: 'interior', label: 'Interior del país' },
      ],
      help: 'Cambia el monto máximo financiable del programa.',
    },
    {
      id: 'avaluo',
      label: 'Avalúo fiscal del inmueble (Gs.)',
      prefix: 'Gs.',
      value: '120.000.000',
      thousands: true,
      help: 'El valor fiscal de la municipalidad, no el de mercado. Base del impuesto inmobiliario.',
    },
    {
      id: 'comisionPct',
      label: 'Comisión inmobiliaria (%)',
      type: 'number',
      value: COMISION.ventaPctDefault,
      min: 0,
      max: 10,
      step: 0.5,
      help: 'Se negocia. En venta suele ser del 5% más IVA; en alquiler, un mes de gestión.',
    },
    {
      id: 'consumo',
      label: 'Consumo eléctrico mensual (kWh)',
      type: 'number',
      value: 350,
      min: 0,
      max: 5000,
      step: 10,
      help: 'Lo que figura en tu factura de la ANDE. Define la faja de precio de todo el mes.',
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'Los tres costos de tener casa propia',
    caption:
      'Pone en la misma escala anual lo que pagás de cuota, lo que se va en el impuesto inmobiliario y lo que cuesta la luz, para ver qué pesa realmente en el presupuesto.',
  },
  breakdownTitle: 'Todo lo que pagás por tu casa',
  breakdownIntro:
    'Primero la cuota y su viabilidad, después los gastos de una sola vez al firmar, y al final los costos que se repiten todos los años.',

  faq: [
    {
      q: '¿Cuánto es la cuota de Che Róga Porã?',
      a: `Depende del monto, del plazo y de tu ingreso. La tasa es del ${(CHE_ROGA.tasaHasta6SM * 100).toLocaleString('de-DE')}% anual para ingresos familiares de hasta ${CHE_ROGA.umbralSalarios} salarios mínimos y del ${(CHE_ROGA.tasa6a9SM * 100).toLocaleString('de-DE')}% para el tramo de ${CHE_ROGA.umbralSalarios} a ${CHE_ROGA.ingresoMaxSalarios}. El plazo llega hasta ${CHE_ROGA.plazoMax} años y la cuota se calcula por sistema francés, así que es fija en guaraníes durante toda la vida del crédito.`,
    },
    {
      q: '¿Cuánto tengo que ganar para que me aprueben el crédito?',
      a: `Dos condiciones a la vez. Por abajo: la cuota no puede superar el ${(CHE_ROGA.cuotaMaxPct * 100).toFixed(0)}% del ingreso familiar, así que necesitás ganar al menos dos veces y media la cuota. Por arriba: el programa tiene tope de ${CHE_ROGA.ingresoMaxSalarios} salarios mínimos, ${gs(SMVM * CHE_ROGA.ingresoMaxSalarios)} con el mínimo vigente. Si ganás más que eso, quedás fuera del programa y tenés que ir a un crédito hipotecario comercial.`,
    },
    {
      q: '¿Cuánto puedo pedir prestado?',
      a: `El monto máximo financiable es de ${gs(CHE_ROGA.montoMaxCentral)} para inmuebles en Asunción y el Departamento Central, y de ${gs(CHE_ROGA.montoMaxInterior)} para el resto del país. La diferencia responde a los precios de cada mercado. Si la casa cuesta más, la diferencia la ponés vos de entrada.`,
    },
    {
      q: '¿Conviene pedir 20 o 30 años?',
      a: `Depende de qué te aprieta. A 30 años la cuota baja y entrás en el tope del ${(CHE_ROGA.cuotaMaxPct * 100).toFixed(0)}%, pero pagás muchos más intereses en total. A 20 la cuota sube pero el crédito sale bastante más barato. Una salida intermedia es tomar el plazo largo para calificar y después adelantar capital cuando puedas: revisá antes que el contrato no penalice la precancelación.`,
    },
    {
      q: '¿Cuánto se paga de escritura al comprar una casa?',
      a: `El honorario del escribano se escalona por el valor del inmueble, del ${(ARANCELES.escala[0].tasa * 100).toLocaleString('de-DE')}% en operaciones chicas al ${(ARANCELES.escala[5].tasa * 100).toLocaleString('de-DE')}% en las más grandes, más IVA, con un mínimo de ${ARANCELES.minimoJornales} jornales. A eso se suman la inscripción en los Registros Públicos y la tasa municipal de transferencia. Son valores de referencia del mercado: pedí presupuesto antes de cerrar la cuenta.`,
    },
    {
      q: '¿Quién paga la comisión inmobiliaria?',
      a: `En una venta la comisión ronda el ${COMISION.ventaPctDefault}% más IVA y suele pagarla el vendedor, aunque se negocia y a veces se reparte. En un alquiler, la gestión equivale a un mes de renta más IVA, habitualmente dividido entre inquilino y propietario. No hay una regla legal que lo imponga: lo que vale es lo que firmes.`,
    },
    {
      q: '¿Cuánto es el impuesto inmobiliario y sobre qué se calcula?',
      a: `Alrededor del ${(INMOBILIARIO.tasa * 100).toFixed(0)}% anual sobre el avalúo fiscal del inmueble, que es el valor que le asigna la municipalidad y que suele estar bastante por debajo del precio de mercado. Muchas municipalidades ofrecen un descuento cercano al ${(INMOBILIARIO.descuentoProntoPago * 100).toFixed(0)}% por pago contado anticipado. La tasa exacta y el descuento los fija cada ordenanza municipal.`,
    },
    {
      q: '¿Por qué me llegó la factura de la ANDE tan alta si consumí un poco más?',
      a: 'Porque el Pliego N° 21 no funciona por bloques marginales. Todo el consumo del mes se factura al precio de la faja en la que cae el total. Si pasás de una faja a la siguiente, el precio más caro se aplica a cada kWh del mes, no sólo a los que excediste. Ese es el motivo del salto desproporcionado en los meses de calor.',
    },
    {
      q: '¿Cómo funciona la tarifa social de la ANDE?',
      a: `La Ley 3480/2008 habilita a usuarios familiares a pagar sólo una parte de la tarifa normal según su banda de consumo: hasta 100 kWh se paga el ${(ANDE.tarifaSocial[0].pagaPct * 100).toFixed(0)}%, hasta 200 kWh el ${(ANDE.tarifaSocial[1].pagaPct * 100).toFixed(0)}% y hasta 300 kWh el ${(ANDE.tarifaSocial[2].pagaPct * 100).toFixed(0)}%. Por encima de 300 kWh mensuales el beneficio se pierde por completo, sin escalón intermedio. Hay que estar habilitado: no se aplica sola.`,
    },
    {
      q: '¿El crédito cubre los gastos de escritura?',
      a: 'No. El crédito financia el inmueble; los gastos de escrituración, inscripción, tasas y comisión se pagan aparte y en efectivo al momento de firmar. Es la sorpresa más frecuente de quien llega al cierre con el crédito aprobado y sin reservar esa plata. Presupuestalos desde el principio, no al final.',
    },
    {
      q: '¿Qué pasa si me atraso con el impuesto inmobiliario?',
      a: 'Corren recargos y multas municipales, y además no vas a poder escriturar una transferencia: el certificado de libre deuda de la municipalidad es requisito para pasar la propiedad. La deuda queda pegada al inmueble, así que también es lo primero que hay que chequear cuando comprás una casa usada.',
    },
    {
      q: '¿Puedo acceder al programa si ya tuve una casa antes?',
      a: 'Che Róga Porã es un programa de primera vivienda: está pensado para quien no tiene un inmueble a su nombre. Si ya sos propietario, el camino es un crédito hipotecario comercial, con tasas de mercado bastante más altas que las del programa. Consultá los requisitos vigentes en el MUVH antes de descartarlo por tu cuenta.',
    },
  ],

  sources: [
    {
      name: 'MUVH — Programa Che Róga Porã',
      url: 'https://www.cherogapora.gov.py/',
      publisher: 'Ministerio de Urbanismo, Vivienda y Hábitat',
    },
    {
      name: 'AFD — Agencia Financiera de Desarrollo',
      url: 'https://www.afd.gov.py/',
      publisher: 'Agencia Financiera de Desarrollo',
    },
    {
      name: 'ANDE — Pliego de Tarifas N° 21',
      url: 'https://www.ande.gov.py/docs/tarifas/PLIEGO21.pdf',
      publisher: 'Administración Nacional de Electricidad',
    },
    {
      name: 'Ley N° 6380/19 — IVA sobre inmuebles y alquiler de vivienda (art. 90)',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/8993/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'Dirección General de los Registros Públicos — inscripción de inmuebles',
      url: 'https://www.pj.gov.py/',
      publisher: 'Poder Judicial del Paraguay',
    },
  ],

  replaces: [
    '/py/calculadora-cuota-che-roga-pora-paraguay',
    '/py/calculadora-gastos-escritura-compraventa-inmueble-paraguay',
    '/py/calculadora-comision-inmobiliaria-paraguay',
    '/py/calculadora-impuesto-inmobiliario-paraguay',
    '/py/calculadora-factura-ande-consumo-electrico-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
