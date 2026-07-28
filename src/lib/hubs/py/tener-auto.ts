import type { HubData } from '../types';
import { PARAGUAY_2026, PETROPAR_2026, TIPO_CAMBIO_PY } from '../../data/paraguay-2026';

/**
 * Hub de decisión PY — "Tener un auto en Paraguay: importarlo, transferirlo, patentarlo y usarlo".
 *
 * Precios de combustible (Petropar), IVA y jornal mínimo salen de la tabla maestra.
 * Aranceles de importación, honorarios notariales, tasa judicial y patente son
 * REFERENCIALES: se replican de las fórmulas vivas y quedan editables. Ver ARANCELES
 * y PATENTE.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'legal'). */
const DISCLAIMER_LEGAL =
  'Guía informativa para estimar requisitos, plazos o importes. Confirmá el trámite y la normativa vigente con el organismo oficial; ante efectos jurídicos, consultá a un abogado o escribano.';

/**
 * Aranceles de importación por tipo de vehículo. ⚠️ Referenciales: la posición
 * arancelaria concreta la determina la DNIT sobre el despacho, y hay regímenes
 * especiales. Se dejan editables.
 */
export const ARANCELES_IMPORTACION = [
  { id: 'auto', label: 'Automóvil de pasajeros', tasa: 0.2 },
  { id: 'medio', label: 'Gama intermedia', tasa: 0.14 },
  { id: 'utilitario', label: 'Utilitario o pick-up', tasa: 0.1 },
  { id: 'electrico', label: '100% eléctrico', tasa: 0 },
];

/** Gasto de despacho estimado por defecto, como porcentaje del CIF. Referencial. */
export const DESPACHO_PCT = 0.03;

/**
 * Costos de la transferencia. ⚠️ Referenciales: la escala notarial y los
 * certificados se replican de la fórmula viva, no de un arancel oficial.
 */
export const TRANSFERENCIA = {
  escalaNotarial: [
    { hasta: 50000000, tasa: 0.02 },
    { hasta: 75000000, tasa: 0.0175 },
    { hasta: 100000000, tasa: 0.015 },
    { hasta: 150000000, tasa: 0.0125 },
    { hasta: 200000000, tasa: 0.01 },
    { hasta: null as number | null, tasa: 0.0075 },
  ],
  minimoJornales: 5,
  jornalMinimo: PARAGUAY_2026.jornalMinimo,
  tasaJudicial: 0.005,
  certificadoPolicia: 100000,
  certificadoMunicipal: 80000,
  iva: PARAGUAY_2026.iva.general,
};

/**
 * Patente municipal del vehículo. ⚠️ Tasa, depreciación y descuento son
 * referenciales: cada municipalidad los fija por ordenanza.
 */
export const PATENTE = {
  tasa: 0.003,
  depreciacionPorAnio: 0.05,
  depreciacionTope: 0.5,
  descuentoProntoPago: 0.12,
  anioReferencia: 2026,
};

/** Precios de combustible de Petropar (Gs./litro). Cambian por resolución. */
export const COMBUSTIBLES = [
  { id: '88', label: 'Nafta Kape (88)', precio: PETROPAR_2026.nafta88 },
  { id: '93', label: 'Nafta Oikoite (93)', precio: PETROPAR_2026.nafta93 },
  { id: '97', label: 'Nafta Aratiri (97)', precio: PETROPAR_2026.nafta97 },
  { id: 'diesel', label: 'Diésel Porã', precio: PETROPAR_2026.dieselPora },
  { id: 'diesel-premium', label: 'Diésel Mbarete', precio: PETROPAR_2026.dieselMbarete },
];

export const IVA_GENERAL = PARAGUAY_2026.iva.general;
export const USD_PYG = TIPO_CAMBIO_PY.usdPyg;
export const FX_AS_OF = TIPO_CAMBIO_PY.asOf;

const gs = (n: number) => 'Gs. ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'py/automotor/tener-auto',
  title: 'Auto en Paraguay: costo de importar, transferir, patentar y andar',
  description:
    'Cuánto cuesta un auto en Paraguay de punta a punta: arancel e IVA de importación sobre el CIF, gastos de transferencia ante escribano, patente municipal con depreciación y el gasto de nafta o diésel por viaje.',
  silo: 'Automotor',
  siloHref: '/py/automotor',
  locale: 'py',

  eyebrow: 'Paraguay · DNIT · municipalidades · Petropar',
  h1: '¿Cuánto te cuesta el auto, de punta a punta?',
  lede:
    'El precio del vehículo nunca es el costo del vehículo. Esta cuenta suma lo que se paga al traerlo o comprarlo, lo que cuesta ponerlo a tu nombre, la patente de cada año y lo que se va en combustible cada vez que salís a la ruta.',
  stamps: [
    `Diésel Porã: ${gs(PETROPAR_2026.dieselPora)}/L · Nafta 93: ${gs(PETROPAR_2026.nafta93)}/L`,
    `IVA de importación: ${(IVA_GENERAL * 100).toFixed(0)}% sobre CIF más arancel`,
    `Patente: ${(PATENTE.tasa * 100).toLocaleString('de-DE')}% del valor fiscal depreciado`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo de la operación',

  cases: {
    title: '¿Qué estás por hacer con el auto?',
    intro:
      'Traerlo del exterior, comprarlo acá, ponerlo a tu nombre o simplemente usarlo son cuentas distintas. Elegí la tuya.',
    items: [
      {
        id: 'importar',
        label: 'Lo quiero traer del exterior',
        hint: 'Arancel + IVA sobre el CIF',
        answer: 'El impuesto se calcula sobre el CIF: primero el arancel, y el IVA se aplica sobre el CIF ya con arancel adentro.',
        yes: [
          'Valor CIF: costo, seguro y flete hasta el punto de ingreso',
          `Arancel de importación según el tipo de vehículo, de 0% para los 100% eléctricos hasta ${(ARANCELES_IMPORTACION[0].tasa * 100).toFixed(0)}% en autos de pasajeros`,
          `IVA del ${(IVA_GENERAL * 100).toFixed(0)}% sobre la base ya incrementada con el arancel`,
          'Gastos de despachante, tasas portuarias y trámites, que se estiman aparte',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los aranceles de esta cuenta son de referencia: la posición arancelaria concreta la determina la DNIT sobre el despacho real y puede diferir',
          'El IVA se calcula sobre CIF más arancel, no sobre el CIF pelado: aplicarlo sobre el CIF subestima el total',
          'Hay límites de antigüedad y requisitos técnicos para importar usados: verificá antes de comprar afuera',
        ],
        plazo: 'los tributos se liquidan en el despacho aduanero, antes de retirar el vehículo.',
      },
      {
        id: 'transferir',
        label: 'Lo compré acá y lo quiero poner a mi nombre',
        hint: 'Transferencia ante escribano',
        answer: 'La transferencia se hace por escritura pública e inscripción en el Registro del Automotor, más los certificados.',
        yes: [
          'Honorario del escribano según el valor del vehículo, más IVA',
          'Tasa de inscripción en el Registro del Automotor',
          'Informe de la Policía Nacional de que el vehículo no tiene pedido de secuestro',
          'Certificado municipal de libre deuda de patente',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los honorarios y las tasas de esta cuenta son valores de referencia del mercado, no un arancel oficial verificado: pedí presupuesto al escribano',
          'No transferir deja el vehículo a nombre del vendedor: las multas y la responsabilidad civil siguen apuntando a él, y a vos te complican cualquier trámite',
          'Chequeá que no haya deuda de patente ni prenda antes de pagar: la deuda viaja con el vehículo',
        ],
        plazo: 'conviene hacer la transferencia en el mismo acto de la compra, no "cuando haya tiempo".',
      },
      {
        id: 'patente',
        label: 'Tengo que pagar la patente',
        hint: 'Impuesto municipal anual',
        answer: `La patente es un porcentaje del valor fiscal ya depreciado, con un descuento de alrededor del ${(PATENTE.descuentoProntoPago * 100).toFixed(0)}% si pagás contado.`,
        yes: [
          `Depreciación del ${(PATENTE.depreciacionPorAnio * 100).toFixed(0)}% por año de antigüedad, con tope del ${(PATENTE.depreciacionTope * 100).toFixed(0)}%`,
          `Alícuota de alrededor del ${(PATENTE.tasa * 100).toLocaleString('de-DE')}% sobre el valor fiscal depreciado`,
          `Descuento cercano al ${(PATENTE.descuentoProntoPago * 100).toFixed(0)}% por pago contado anticipado`,
          'La cobra la municipalidad donde está registrado el vehículo',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'La alícuota, la tabla de valores fiscales y el descuento por pronto pago los fija cada municipalidad por ordenanza: los números de acá son de referencia',
          `La depreciación tiene tope del ${(PATENTE.depreciacionTope * 100).toFixed(0)}%: un auto de 30 años no paga cero, paga sobre la mitad del valor fiscal`,
          'La deuda de patente impide transferir el vehículo y genera recargos',
        ],
        plazo: 'el descuento por pronto pago suele estar disponible sólo en los primeros meses del año.',
      },
      {
        id: 'usarlo',
        label: 'Quiero saber cuánto me sale un viaje',
        hint: 'Combustible y peajes',
        answer: 'El gasto de combustible sale de la distancia dividida por el rendimiento, por el precio del litro.',
        yes: [
          'Distancia total del viaje, ida y vuelta si corresponde',
          'Rendimiento real de tu vehículo en kilómetros por litro',
          'Precio del litro del combustible que cargás',
          'Peajes del trayecto, que se suman aparte',
        ],
        warn: [
          DISCLAIMER_LEGAL,
          'Los precios de Petropar cambian por resolución y las estaciones privadas cotizan distinto: tomalos como referencia y actualizalos con tu último ticket',
          'El rendimiento de la ficha del fabricante suele ser optimista: usá el que medís vos en ruta y en ciudad',
        ],
        plazo: 'cargá antes de salir a ruta: en el interior la diferencia de precio entre estaciones se agranda.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu auto',
  inputsIntro:
    'Cada bloque funciona por separado: si sólo te interesa la patente, cargá el valor fiscal y el año y listo.',
  fields: [
    {
      id: 'cif',
      label: 'Valor CIF del vehículo (US$)',
      prefix: 'US$',
      value: '15.000',
      thousands: true,
      help: `Costo, seguro y flete. Se convierte a guaraníes a ${gs(USD_PYG)} por dólar (referencia BCP al ${FX_AS_OF}).`,
    },
    {
      id: 'tipoArancel',
      label: 'Tipo de vehículo a importar',
      type: 'select',
      value: 'auto',
      options: ARANCELES_IMPORTACION.map((a) => ({
        value: a.id,
        label: `${a.label} — ${(a.tasa * 100).toFixed(0)}%`,
      })),
      help: 'Arancel de referencia: la posición concreta la determina la DNIT en el despacho.',
    },
    {
      id: 'valorVehiculo',
      label: 'Valor del vehículo para la transferencia (Gs.)',
      prefix: 'Gs.',
      value: '90.000.000',
      thousands: true,
      help: 'Precio de la operación o tasación. Es la base del honorario del escribano.',
    },
    {
      id: 'valorFiscal',
      label: 'Valor imponible o fiscal del vehículo (Gs.)',
      prefix: 'Gs.',
      value: '110.000.000',
      thousands: true,
      help: 'El que usa la municipalidad para la patente, antes de depreciar.',
    },
    {
      id: 'anioFabricacion',
      label: 'Año de fabricación',
      type: 'number',
      value: 2019,
      min: 1950,
      max: PATENTE.anioReferencia,
      step: 1,
      help: `Cada año resta ${(PATENTE.depreciacionPorAnio * 100).toFixed(0)}% del valor fiscal, hasta un tope del ${(PATENTE.depreciacionTope * 100).toFixed(0)}%.`,
    },
    {
      id: 'km',
      label: 'Kilómetros del viaje',
      type: 'number',
      value: 330,
      min: 0,
      max: 20000,
      step: 10,
      help: 'Sólo la ida: marcá abajo si volvés por el mismo camino.',
    },
    {
      id: 'idaVuelta',
      label: '¿Es ida y vuelta?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí, duplicar la distancia' },
        { value: 'no', label: 'No, sólo ida' },
      ],
      help: 'Duplica los kilómetros y el combustible, no los peajes que cargues.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento del vehículo (km por litro)',
      type: 'number',
      value: 12,
      min: 1,
      max: 40,
      step: 0.5,
      help: 'El real medido por vos, no el de la ficha del fabricante.',
    },
    {
      id: 'combustible',
      label: 'Combustible que cargás',
      type: 'select',
      value: '93',
      options: COMBUSTIBLES.map((c) => ({ value: c.id, label: `${c.label} — ${gs(c.precio)}/L` })),
      help: 'Precios de Petropar. Las estaciones privadas cotizan distinto.',
    },
    {
      id: 'peajes',
      label: 'Peajes del viaje (Gs.)',
      prefix: 'Gs.',
      value: '0',
      thousands: true,
      help: 'Suma de las cabinas del trayecto.',
    },
  ],
  fineprint: DISCLAIMER_LEGAL,

  chart: {
    type: 'donut',
    title: 'Dónde se va la plata del auto',
    caption:
      'Compara los tributos de importación, los gastos de ponerlo a tu nombre, la patente anual y lo que gastás en un viaje típico.',
  },
  breakdownTitle: 'Cada costo por separado',
  breakdownIntro:
    'Primero traerlo, después ponerlo a tu nombre, después la patente de cada año y al final el gasto de andar.',

  faq: [
    {
      q: '¿Cuánto se paga por importar un auto a Paraguay?',
      a: `Sobre el valor CIF se aplica primero el arancel de importación, que va de 0% para los 100% eléctricos hasta cerca del ${(ARANCELES_IMPORTACION[0].tasa * 100).toFixed(0)}% para automóviles de pasajeros, y después el IVA del ${(IVA_GENERAL * 100).toFixed(0)}% sobre la base ya incrementada con el arancel. A eso se suman los gastos de despachante y las tasas, que rondan un ${(DESPACHO_PCT * 100).toFixed(0)}% del CIF. Los aranceles concretos los determina la DNIT en el despacho.`,
    },
    {
      q: '¿El IVA de importación se calcula sobre el CIF?',
      a: 'No, y es el error más caro de la cuenta. El IVA se calcula sobre el CIF más el arancel ya sumado. Con un arancel del 20%, aplicar el IVA sobre el CIF pelado subestima el impuesto en un 20% del propio IVA. En una unidad de US$ 15.000 esa diferencia son varios millones de guaraníes.',
    },
    {
      q: '¿Qué es el valor CIF?',
      a: 'Costo, seguro y flete: el precio del vehículo más lo que costó asegurarlo y traerlo hasta el punto de ingreso al país. No es el precio de lista del vendedor en el exterior, y tampoco incluye los tributos locales. Es la base sobre la que la aduana calcula todo lo demás.',
    },
    {
      q: '¿Conviene importar un auto eléctrico?',
      a: `En el arancel sí: los 100% eléctricos entran con arancel del 0% frente al ${(ARANCELES_IMPORTACION[0].tasa * 100).toFixed(0)}% de un auto de pasajeros a combustión. El IVA se paga igual. Después hay que sumar el ahorro de combustible contra el costo de la electricidad y la disponibilidad de carga, que fuera de Asunción y Central sigue siendo limitada.`,
    },
    {
      q: '¿Cuánto sale transferir un vehículo?',
      a: `El honorario del escribano se escalona por el valor del vehículo, del ${(TRANSFERENCIA.escalaNotarial[0].tasa * 100).toLocaleString('de-DE')}% en operaciones chicas al ${(TRANSFERENCIA.escalaNotarial[5].tasa * 100).toLocaleString('de-DE')}% en las más grandes, más IVA y con un mínimo de ${TRANSFERENCIA.minimoJornales} jornales. A eso se suma la tasa de inscripción en el Registro del Automotor y los certificados de la Policía Nacional y de la municipalidad. Son valores de referencia: pedí presupuesto.`,
    },
    {
      q: '¿Qué pasa si no transfiero el auto que compré?',
      a: 'El vehículo sigue figurando a nombre del vendedor. Eso significa que las multas, la responsabilidad civil por un siniestro y cualquier requerimiento judicial le llegan a él, y que vos no podés venderlo, patentarlo a tu nombre ni sacar el libre deuda. Es una de las causas más comunes de conflicto en la compraventa entre particulares.',
    },
    {
      q: '¿Cómo se calcula la patente del vehículo?',
      a: `Se parte del valor imponible o fiscal, se le aplica una depreciación de alrededor del ${(PATENTE.depreciacionPorAnio * 100).toFixed(0)}% por año de antigüedad con tope del ${(PATENTE.depreciacionTope * 100).toFixed(0)}%, y sobre ese valor depreciado se aplica la alícuota, cercana al ${(PATENTE.tasa * 100).toLocaleString('de-DE')}%. Pagando contado suele haber un descuento del ${(PATENTE.descuentoProntoPago * 100).toFixed(0)}%. Cada municipalidad fija los valores por ordenanza, así que el número final depende de dónde esté registrado el auto.`,
    },
    {
      q: '¿Un auto viejo no paga patente?',
      a: `Sí paga. La depreciación tiene tope del ${(PATENTE.depreciacionTope * 100).toFixed(0)}%, así que por más antiguo que sea el vehículo la base nunca baja del ${(100 - PATENTE.depreciacionTope * 100).toFixed(0)}% de su valor fiscal. Lo que sí ocurre es que el valor fiscal asignado a modelos viejos suele ser bajo, y por eso la patente termina siendo chica.`,
    },
    {
      q: '¿Cuánto gasto de combustible en un viaje?',
      a: `Dividí los kilómetros por el rendimiento en kilómetros por litro y multiplicá por el precio del litro. Con los precios de Petropar vigentes, la Nafta Oikoite 93 está en ${gs(PETROPAR_2026.nafta93)} y el Diésel Porã en ${gs(PETROPAR_2026.dieselPora)}. Si viajás con acompañantes, dividir el total entre los pasajeros cambia bastante la comparación contra el colectivo.`,
    },
    {
      q: '¿Conviene diésel o nafta?',
      a: `El diésel rinde más kilómetros por litro y el Porã está más barato que la nafta 97, pero la unidad diésel suele costar más y el mantenimiento también. La cuenta que importa es el costo por kilómetro, no el precio del litro: un vehículo naftero eficiente puede salir más barato por kilómetro que un diésel pesado.`,
    },
    {
      q: '¿Los precios de Petropar son los mismos en todo el país?',
      a: 'Los de Petropar sí, porque es la petrolera estatal y publica una lista única. Las estaciones privadas fijan sus propios precios y en el interior suelen ser algo más altos por el costo de flete. Para presupuestar un viaje largo, tomá el precio de tu último ticket real en lugar de la lista.',
    },
    {
      q: '¿Qué reviso antes de comprar un auto usado?',
      a: 'Que el vehículo no tenga pedido de secuestro, mediante el informe de la Policía Nacional; que no arrastre deuda de patente, con el certificado municipal; que no tenga prenda inscripta; y que los datos del título coincidan con los del chasis y el motor. La deuda y los gravámenes viajan con el vehículo, no con el vendedor.',
    },
  ],

  sources: [
    {
      name: 'DNIT — Aduanas e importación de vehículos',
      url: 'https://www.dnit.gov.py/',
      publisher: 'Dirección Nacional de Ingresos Tributarios',
    },
    {
      name: 'Petropar — Precios vigentes de combustibles',
      url: 'https://www.petropar.gov.py/?page_id=4460',
      publisher: 'Petróleos Paraguayos',
    },
    {
      name: 'Ley N° 6380/19 — IVA (art. 90)',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/8993/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional',
      publisher: 'Biblioteca y Archivo Central del Congreso Nacional',
    },
    {
      name: 'Municipalidad de Asunción — Patente de rodados',
      url: 'https://www.asuncion.gov.py/',
      publisher: 'Municipalidad de Asunción',
    },
  ],

  replaces: [
    '/py/calculadora-costo-importar-auto-paraguay',
    '/py/calculadora-costo-transferencia-vehiculo-paraguay',
    '/py/calculadora-patente-vehiculo-paraguay',
    '/py/calculadora-costo-viaje-nafta-paraguay',
  ],

  lastReviewed: '2026-07-28',
};
