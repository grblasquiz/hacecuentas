import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta plata necesito para entrar a un alquiler?"
 * Punto de vista: EL INQUILINO. La cara del propietario (rendimiento, vender o
 * alquilar) vive en /vivienda/rentabilidad-de-un-alquiler y no se solapa acá.
 *
 * Los números salen de las fórmulas reales:
 *  - comisión: src/lib/formulas/comision-inmobiliaria-alquiler-caba-pba.ts
 *  - caución:  src/lib/formulas/seguro-caucion-alquiler-costo-mensual.ts
 *  - expensas: src/lib/formulas/expensas-departamento-calcular-m2-categoria.ts
 *  - sueldo:   src/lib/formulas/sueldo-necesario-alquiler.ts
 *              src/lib/formulas/cuanto-alquiler-puedo-pagar-sueldo-argentina.ts
 *  - depósito: src/lib/formulas/depositos-alquiler-cuantos-meses-devolucion.ts
 *  - quién paga: src/lib/formulas/abl-expensas-quien-paga-inquilino-propietario.ts
 */

const LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

export const hub: HubData = {
  slug: 'alquiler/entrar-a-un-alquiler',
  title: '¿Cuánta plata necesito para entrar a un alquiler? — Depósito, comisión y sueldo mínimo',
  description:
    'Calculá la plata de entrada a un alquiler: primer mes, depósito, comisión inmobiliaria y seguro de caución, más el sueldo mínimo que te van a pedir. CABA y provincia de Buenos Aires.',
  silo: 'Alquiler',
  siloHref: '/alquiler',

  eyebrow: 'Guía y estimación para inquilinos',
  h1: 'Vas a alquilar: cuánta plata necesitás para entrar.',
  lede:
    'Partimos del caso más habitual: entrás con depósito y garantía propietaria. Ajustá tus datos y, si tu situación es otra —caución, presupuesto según tu sueldo, devolución del depósito—, la cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'CABA (Ley 5.859) y provincia de Buenos Aires', '8 calculadoras adentro'],

  resultLabel: 'Plata de entrada estimada',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'deposito',
        label: 'Entro con depósito y garantía propietaria',
        hint: 'El caso más común',
        answer:
          'Con garantía propietaria la entrada es primer mes + expensas + depósito, más la comisión si estás en provincia.',
        yes: [
          'Primer mes de alquiler por adelantado',
          'Expensas del primer mes (ordinarias, a tu cargo)',
          'Depósito en garantía: hoy se pacta libremente y la práctica de mercado es 1 mes',
          'Comisión inmobiliaria: en CABA la paga el propietario; en provincia se reparte',
        ],
        warn: [
          LEGAL,
          'La garantía propietaria no cuesta plata, pero exige una escritura a nombre de tu garante en la misma jurisdicción y suele pedir que el inmueble no tenga otra garantía activa',
          'Pedí recibo del depósito con el monto, la fecha y a nombre de quién queda: sin comprobante la devolución se discute',
        ],
        plazo: 'el depósito se devuelve al egreso, contra entrega de llaves y deudas de servicios saldadas.',
      },
      {
        id: 'caucion',
        label: 'Entro con seguro de caución',
        hint: 'Sin garante propietario',
        answer: 'La caución reemplaza al garante: pagás una prima única en vez de inmovilizar el depósito.',
        yes: [
          'Prima única del seguro de caución, según el plazo del contrato',
          'Primer mes de alquiler y expensas',
          'Comisión inmobiliaria cuando corresponde',
          'La póliza reemplaza la garantía propietaria: no hace falta garante',
        ],
        warn: [
          LEGAL,
          'La prima no se recupera: es el costo del servicio, no un depósito. Si la aseguradora paga por vos, después te lo reclama a vos',
          'Algunas inmobiliarias piden caución Y depósito. Es legal pactarlo, pero negocialo: es la parte más cara de la entrada',
        ],
        plazo: 'la póliza se emite en 24-72 h con recibo de sueldo o facturación; pedila antes de reservar.',
      },
      {
        id: 'presupuesto',
        label: 'Sólo quiero saber qué alquiler puedo pagar',
        hint: 'Según tu sueldo',
        answer: 'La regla sana es que alquiler más expensas no pasen del 30% de tu ingreso neto.',
        yes: [
          'Presupuesto de vivienda = ingreso neto por el porcentaje que elijas',
          'De ese presupuesto se descuentan las expensas: el alquiler puro es lo que queda',
          'Rango sano entre el 25% (conservador) y el 35% (límite) del ingreso',
          'La entrada se recalcula sobre ese alquiler máximo, no sobre el que buscabas',
        ],
        warn: [
          LEGAL,
          'Muchas inmobiliarias piden demostrar ingresos por 3 veces el alquiler, sumando titular y garantes: ese filtro es más duro que la regla del 30%',
          'Si el contrato ajusta por índice, el alquiler sube durante el año pero tu sueldo puede no seguirle el ritmo: dejá margen',
        ],
        plazo: 'revisá el presupuesto en cada ajuste del contrato, no sólo al firmar.',
      },
      {
        id: 'devolucion',
        label: 'Me voy y quiero saber cuánto depósito me devuelven',
        hint: 'Al egreso',
        answer: 'Corresponde que te devuelvan el depósito al valor del último alquiler, menos daños comprobados.',
        yes: [
          'Devolución del depósito al valor del último mes de alquiler, no al del primero',
          'Descuentos sólo por daños comprobados o deudas de servicios y expensas a tu cargo',
          'Contratos firmados bajo la ley 27.551 pudieron pactar hasta 3 meses de depósito',
        ],
        warn: [
          LEGAL,
          'El desgaste normal de uso no es daño: pintura gastada o herrajes flojos no justifican retención',
          'Hacé el acta de entrega de llaves con inventario y fotos, y pedí los libres de deuda de expensas y servicios el mismo día',
        ],
        plazo: 'el plazo habitual pactado para devolver es de 10 a 30 días desde la entrega de llaves.',
      },
      {
        id: 'quien-paga',
        label: 'Quiero saber quién paga qué',
        hint: 'ABL, expensas y servicios',
        answer: 'Ordinarias y servicios los paga el inquilino; ABL y extraordinarias, el propietario.',
        yes: [
          'Expensas ordinarias: las paga el inquilino, cubren el uso y mantenimiento corriente',
          'Servicios a tu nombre (luz, gas, agua, internet): los paga el inquilino',
          'ABL o inmobiliario provincial: lo paga el propietario, es un impuesto al inmueble',
          'Expensas extraordinarias: las paga el propietario, financian obras que valorizan el edificio',
        ],
        warn: [
          LEGAL,
          'Si la liquidación de expensas no separa ordinarias de extraordinarias, pedí el detalle al administrador antes de pagar',
          'Que el contrato diga otra cosa no lo vuelve automáticamente válido: una cláusula que te traslade impuestos del inmueble es discutible',
        ],
        plazo: 'reclamá por escrito al administrador dentro del mes de la liquidación observada.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'alquiler', label: 'Alquiler mensual que te piden', prefix: '$', value: '650.000', thousands: true },
    {
      id: 'expensas',
      label: 'Expensas mensuales (dejalo en 0 y las estimamos)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Si no las sabés todavía, las estimamos por metros cuadrados a valor de edificio de categoría media.',
    },
    { id: 'm2', label: 'Metros cuadrados del departamento', type: 'number', min: 10, max: 500, value: 55 },
    { id: 'ingreso', label: 'Tu ingreso neto mensual (en mano)', prefix: '$', value: '2.200.000', thousands: true },
    {
      id: 'regla',
      label: 'Porcentaje del ingreso que querés destinar a vivienda',
      type: 'number',
      min: 10,
      max: 60,
      suffix: '%',
      value: 30,
      help: 'La regla sana es 30% del ingreso neto para alquiler más expensas. 25% es conservador, 35% ya aprieta.',
    },
    {
      id: 'jurisdiccion',
      label: 'Dónde está el inmueble',
      type: 'select',
      value: 'caba',
      options: [
        { value: 'caba', label: 'Ciudad de Buenos Aires' },
        { value: 'pba', label: 'Provincia de Buenos Aires' },
      ],
    },
    {
      id: 'plazo',
      label: 'Plazo del contrato',
      type: 'select',
      value: '24',
      options: [
        { value: '12', label: '12 meses' },
        { value: '24', label: '24 meses' },
        { value: '36', label: '36 meses' },
      ],
    },
  ],
  fineprint: LEGAL,

  chart: {
    type: 'donut',
    title: 'Cómo se compone la entrada',
    caption:
      'Cada porción es un rubro de la plata que ponés el día que firmás. El primer mes y el depósito suelen ser lo más pesado; la comisión aparece sólo si tu jurisdicción te la traslada.',
  },
  breakdownTitle: 'Qué pagás el día que firmás',
  breakdownIntro: 'Las barras comparan cada rubro con el más grande de la entrada.',

  faq: [
    {
      q: '¿Cuánta plata necesito para entrar a un alquiler?',
      a: 'La entrada típica es primer mes de alquiler más expensas, más un mes de depósito, más la comisión inmobiliaria cuando la jurisdicción te la traslada. Con un alquiler de $650.000 y expensas de $120.000, en CABA la entrada ronda un mes y medio de alquiler porque la comisión la paga el propietario; en provincia hay que sumar la mitad de la comisión.',
    },
    {
      q: '¿Cuánto es el depósito de garantía hoy?',
      a: 'Después de la derogación de la ley de alquileres el depósito se pacta libremente, pero la práctica de mercado quedó en un mes de alquiler. Los contratos firmados bajo la ley 27.551 lo tenían limitado a un mes, y los anteriores a esa ley podían llegar a tres meses.',
    },
    {
      q: '¿Quién paga la comisión inmobiliaria en CABA?',
      a: 'En la Ciudad de Buenos Aires la ley 5.859 prohíbe cobrarle comisión al inquilino en la locación de vivienda: la comisión, del orden del 4,15% del valor total del contrato más IVA, corre por cuenta del propietario. En provincia de Buenos Aires no rige esa prohibición y lo habitual es que se reparta entre las partes.',
    },
    {
      q: '¿Cuánto sale un seguro de caución para alquilar?',
      a: 'La prima única ronda el 10% de un mes de alquiler para contratos de 12 meses, el 15% para 24 meses y el 20% para 36 meses. Es un costo que no se recupera, pero evita inmovilizar el depósito y reemplaza al garante propietario.',
    },
    {
      q: '¿Qué sueldo me piden para alquilar?',
      a: 'Por la regla del 30%, el ingreso neto mínimo es alquiler más expensas dividido 0,30. Además, muchas inmobiliarias exigen demostrar ingresos por tres veces el alquiler sumando titular y garantes, que es un filtro más exigente que la regla presupuestaria.',
    },
    {
      q: '¿Las expensas cuentan dentro del 30%?',
      a: 'Sí. El costo de vivienda es alquiler más expensas: si mirás sólo el alquiler te vas a pasar del presupuesto. En un edificio con amenities las expensas pueden representar el 20% o más del costo mensual total.',
    },
    {
      q: '¿Cómo se estiman las expensas si todavía no las sé?',
      a: 'Por metro cuadrado y categoría de edificio: alrededor de $1.500/m² en edificios básicos, $2.200/m² en categoría media y $3.500/m² en categoría alta, más unos $400/m² por cada amenity relevante (pileta, gimnasio, SUM, seguridad 24 h).',
    },
    {
      q: '¿Quién paga el ABL y las expensas extraordinarias?',
      a: 'El ABL en CABA y el inmobiliario provincial gravan al inmueble, no al uso, así que los paga el propietario. Las expensas extraordinarias financian obras mayores que valorizan el edificio y también son del propietario. El inquilino paga las expensas ordinarias y los servicios a su nombre.',
    },
    {
      q: '¿Cuándo me tienen que devolver el depósito?',
      a: 'Al egreso, contra entrega de llaves y con los servicios y expensas al día. Corresponde devolverlo al valor del último mes de alquiler, no al valor de cuando firmaste, y sólo pueden descontar daños comprobados: el desgaste normal de uso no se descuenta.',
    },
    {
      q: '¿Qué pasa si no pago el alquiler y el propietario inicia un desalojo?',
      a: 'Un desalojo por falta de pago suele demorar entre 6 y 18 meses en la Justicia; por vencimiento de contrato, entre 3 y 8 meses; por incumplimiento de otras cláusulas, entre 8 y 24 meses. Los honorarios profesionales rondan el 15% al 25% del valor locativo y los plazos varían mucho según la jurisdicción y la saturación de los juzgados.',
    },
    {
      q: '¿Puedo negociar la entrada?',
      a: 'Sí. Los puntos con más margen son la exigencia simultánea de caución y depósito, el pago del depósito en dos cuotas y la comisión en provincia. Lo que no se negocia es el mes adelantado.',
    },
    {
      q: '¿Conviene caución o depósito?',
      a: 'Si tenés el capital libre, el depósito es más barato porque lo recuperás al final. Si necesitás esa plata para la mudanza o no tenés garante propietario, la caución resuelve el ingreso a un costo bajo respecto de inmovilizar un mes entero.',
    },
  ],

  sources: [
    {
      name: 'Ley 5.859 CABA — prohibición de cobrar comisión al inquilino en locaciones de vivienda',
      url: 'https://boletinoficial.buenosaires.gob.ar/normativaba/norma/398889',
      publisher: 'Boletín Oficial de la Ciudad de Buenos Aires',
    },
    {
      name: 'Código Civil y Comercial de la Nación — Locación (arts. 1187 a 1226)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 27.551 de Alquileres (régimen aplicable a contratos firmados bajo su vigencia)',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/231663/20200630',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '30-06-2020',
    },
    {
      name: 'DNU 70/2023 — derogación de la ley de alquileres',
      url: 'https://www.boletinoficial.gob.ar/detalleAviso/primera/300985/20231221',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '21-12-2023',
    },
    {
      name: 'Seguro de caución — normativa y aseguradoras autorizadas',
      url: 'https://www.argentina.gob.ar/ssn',
      publisher: 'Superintendencia de Seguros de la Nación',
    },
  ],

  replaces: [
    '/calculadora-cuanto-alquiler-puedo-pagar-sueldo-argentina',
    '/calculadora-sueldo-minimo-para-alquilar',
    '/calculadora-depositos-alquiler-cuantos-meses-devolucion',
    '/calculadora-comision-inmobiliaria-alquiler-caba-pba',
    '/calculadora-seguro-caucion-alquiler-costo-mensual',
    '/calculadora-abl-expensas-quien-paga-inquilino-propietario',
    '/calculadora-expensas-departamento-calcular-m2-categoria',
    '/calculadora-desalojo-causa-plazos-honorarios-juicio',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-poliza-juridica-arrendamiento-mexico',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Constantes de las fórmulas originales, sin inventar nada.
 * comision: comision-inmobiliaria-alquiler-caba-pba.ts (pct del valor total del
 * contrato, más IVA; `propietario` es la fracción que absorbe el dueño).
 */
export const COMISION: Record<string, { pct: number; propietario: number }> = {
  caba: { pct: 0.0415, propietario: 1 },
  pba: { pct: 0.05, propietario: 0.5 },
};

export const IVA = 1.21;

/** seguro-caucion-alquiler-costo-mensual.ts: prima única sobre un mes de alquiler. */
export const CAUCION_TASA: Record<string, number> = { '12': 0.1, '24': 0.15, '36': 0.2 };

/** expensas-departamento-calcular-m2-categoria.ts: valor por m² de categoría media. */
export const EXPENSAS_M2_MEDIO = 2200;

/** Depósito de mercado tras la derogación, y tope de los contratos viejos. */
export const DEPOSITO_MESES = 1;
export const DEPOSITO_MESES_LEY_VIEJA = 3;
