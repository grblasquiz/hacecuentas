import type { HubData } from './types';
import { FRANQUICIA_VIAJERO_2026, DOLAR_OFICIAL_REF } from '../data/argentina-2026';

/**
 * Hub de decisión — "Ya tengo el pasaje: qué me falta resolver antes de volar".
 *
 * Números espejados de:
 *   src/lib/formulas/jet-lag.ts / jet-lag-recuperacion-horas-diferencia-dias.ts /
 *   src/lib/formulas/jet-lag-zonas-horarias-adaptacion-dias.ts   (1 día/zona al este, 2/3 al oeste)
 *   src/lib/formulas/costo-roaming-datos-exterior.ts             (roaming vs eSIM vs chip local)
 *   src/lib/formulas/franquicia-aduana-viajero-argentina.ts      (constantes de src/lib/data/argentina-2026)
 *   src/lib/formulas/impuesto-pais-pasaje-avion-internacional.ts (PAÍS derogado, percepción 30%)
 */

export const FRANQUICIA = {
  aereaMaritimaUSD: FRANQUICIA_VIAJERO_2026.aereaMaritimaUSD,
  terrestreFluvialUSD: FRANQUICIA_VIAJERO_2026.terrestreFluvialUSD,
  freeShopLlegadaUSD: FRANQUICIA_VIAJERO_2026.freeShopLlegadaUSD,
  menores16Factor: FRANQUICIA_VIAJERO_2026.menores16Factor,
  alicuotaExcedente: FRANQUICIA_VIAJERO_2026.alicuotaExcedente,
};

export const DOLAR_REF = DOLAR_OFICIAL_REF.venta;

export const hub: HubData = {
  slug: 'viajes/antes-de-volar',
  title: 'Ya tengo el pasaje: ¿qué me falta antes de volar? — Jet lag, datos, aduana e impuestos',
  description:
    'Cuántos días vas a tardar en acomodarte al huso horario, si te conviene roaming, eSIM o chip local, cuánto podés traer sin pagar en la Aduana y cuántos impuestos se suman sobre un pasaje internacional.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Preparativos del viaje',
  h1: 'Ya tenés el pasaje. Ahora, lo que hay que resolver antes de volar.',
  lede:
    'Partimos por lo primero que se siente al llegar: el jet lag y cuántos días te va a llevar acomodarte. Si lo que te preocupa son los datos del celular, la Aduana o los impuestos del pasaje, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Franquicia ARCA vigente', '6 calculadoras adentro'],

  resultLabel: 'Tu estimación',

  cases: {
    title: '¿Qué tenés que resolver?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'jetlag',
        label: 'Cuántos días me va a durar el jet lag',
        hint: 'Zonas horarias y dirección',
        answer: 'Volar al este cuesta más: el reloj interno avanza más lento de lo que retrasa.',
        yes: [
          'Días estimados de adaptación según las zonas horarias cruzadas y la dirección del vuelo',
          'Al este, el reloj circadiano adelanta cerca de 1 hora por día: un día por zona',
          'Al oeste, retrasa alrededor de 1,5 horas por día: unos dos tercios de día por zona',
        ],
        warn: [
          'La recuperación se enlentece con la edad: a partir de los 40 conviene sumar margen',
          'Cruzar menos de 3 zonas casi no produce jet lag real: lo que se siente suele ser fatiga de viaje',
        ],
        plazo: 'empezá a correr tus horarios 2 o 3 días antes del vuelo para llegar medio adaptado.',
      },
      {
        id: 'datos',
        label: 'Roaming, eSIM o chip local',
        hint: 'Datos en el exterior',
        answer: 'Para viajes de más de una semana, la eSIM o el chip local casi siempre ganan.',
        yes: [
          'Costo del roaming de tu operador según los días de viaje',
          'Costo de una eSIM internacional escalado por días y consumo',
          'Costo de un chip local comprado al llegar',
        ],
        warn: [
          'El chip local suele ser lo más barato, pero recién lo comprás al llegar: durante el traslado del aeropuerto quedás sin datos',
          'Sin paquete contratado, el roaming por consumo se factura a tarifa plena y ahí aparecen las cuentas de terror',
        ],
        plazo: 'la eSIM se activa antes de salir; el paquete de roaming, también.',
      },
      {
        id: 'aduana',
        label: 'Cuánto puedo traer sin pagar en la Aduana',
        hint: 'Franquicia de viajero',
        answer: 'La franquicia se suma por integrante del grupo familiar y el excedente tributa la mitad.',
        yes: [
          'Franquicia por persona según la vía de ingreso: aérea y marítima o terrestre y fluvial',
          'Franquicia adicional del free shop de llegada en los ingresos aéreos y marítimos',
          'Impuesto sobre el excedente, en dólares y en pesos',
        ],
        warn: [
          'Los menores de 16 años computan la mitad de la franquicia',
          'La ropa y los efectos personales usados no computan: la franquicia es para lo que traés nuevo',
          'Declarar espontáneamente lo que excede evita la multa; que lo detecte la Aduana no',
        ],
        plazo: 'la declaración se hace al llegar, antes de pasar el control aduanero.',
      },
      {
        id: 'pasaje',
        label: 'Cuántos impuestos tiene mi pasaje',
        hint: 'Percepción sobre pasajes al exterior',
        answer: 'El impuesto PAÍS está derogado; lo que sigue vigente es la percepción a cuenta.',
        yes: [
          'Percepción a cuenta de Ganancias y Bienes Personales sobre el pasaje pagado en pesos',
          'Cuánto de ese recargo es recuperable en tu declaración jurada',
          'Costo final del pasaje con todos los recargos sumados',
        ],
        warn: [
          'El impuesto PAÍS quedó derogado a fines de 2024: cualquier cuenta que lo siga sumando está desactualizada',
          'La percepción no es un impuesto perdido: se computa a cuenta y se puede recuperar en la declaración jurada anual',
        ],
        plazo: 'la percepción se recupera al presentar la declaración jurada del año siguiente.',
      },
    ],
  },

  inputsTitle: 'Cargá los datos de tu viaje',
  inputsIntro: 'Los campos que no aplican a tu caso se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    { id: 'zonas', label: 'Zonas horarias que cruzás', type: 'number', min: 0, max: 14, value: 5 },
    {
      id: 'direccion',
      label: 'Dirección del vuelo',
      type: 'select',
      value: 'este',
      options: [
        { value: 'este', label: 'Hacia el este (Europa, Asia)' },
        { value: 'oeste', label: 'Hacia el oeste (América, Oceanía)' },
      ],
    },
    { id: 'edad', label: 'Tu edad', type: 'number', min: 1, max: 100, value: 35 },
    { id: 'dias', label: 'Días de viaje', type: 'number', min: 1, max: 365, value: 15 },
    {
      id: 'destino',
      label: 'Región de destino (para los datos móviles)',
      type: 'select',
      value: 'europa',
      options: [
        { value: 'europa', label: 'Europa' },
        { value: 'eeuu', label: 'Estados Unidos y Canadá' },
        { value: 'latam', label: 'Latinoamérica' },
        { value: 'asia', label: 'Asia' },
        { value: 'mundial', label: 'Otros destinos' },
      ],
    },
    { id: 'gbDia', label: 'Gigabytes de datos por día', type: 'number', min: 0.1, max: 20, step: 0.1, value: 1 },
    {
      id: 'via',
      label: 'Vía de ingreso a Argentina',
      type: 'select',
      value: 'aerea',
      options: [
        { value: 'aerea', label: 'Aérea o marítima' },
        { value: 'terrestre', label: 'Terrestre o fluvial' },
      ],
    },
    { id: 'adultos', label: 'Mayores de 16 que viajan juntos', type: 'number', min: 1, max: 20, value: 2 },
    { id: 'menores16', label: 'Menores de 16 que viajan juntos', type: 'number', min: 0, max: 20, value: 1 },
    { id: 'valorCompras', label: 'Valor de lo que traés en el equipaje (USD)', type: 'number', min: 0, value: 900 },
    { id: 'compraFreeShop', label: 'Compras en el free shop de llegada (USD)', type: 'number', min: 0, value: 0 },
    { id: 'cotizacionDolar', label: 'Cotización del dólar para pasar a pesos', prefix: '$', value: String(DOLAR_OFICIAL_REF.venta), thousands: true },
    { id: 'pasajeUsd', label: 'Precio del pasaje internacional (USD)', type: 'number', min: 0, value: 900 },
    { id: 'percepcion', label: 'Percepción vigente (%)', type: 'number', min: 0, max: 100, step: 0.5, value: 30 },
  ],
  fineprint:
    'Estimación informativa. La franquicia aduanera, la percepción sobre pasajes y las tarifas de datos cambian: verificá el organismo oficial y tu operador antes de viajar.',

  chart: {
    type: 'bars',
    title: 'Tu caso contra las alternativas',
    caption:
      'Las barras comparan tu resultado con los escenarios que podrías elegir: días de adaptación al este y al oeste, las tres formas de tener datos, la franquicia frente a lo que traés, o el pasaje frente a sus recargos.',
  },
  breakdownTitle: 'El detalle del cálculo',
  breakdownIntro: 'Cada fila muestra un componente y la referencia que lo respalda.',

  faq: [
    {
      q: '¿Cuántos días dura el jet lag?',
      a: 'Como referencia clínica, alrededor de un día por zona horaria cuando volás al este y unos dos tercios de día por zona cuando volás al oeste. Cruzar 8 zonas hacia el este puede llevar más de una semana de adaptación.',
    },
    {
      q: '¿Por qué el jet lag es peor volando al este?',
      a: 'Porque el reloj circadiano humano es algo más largo que 24 horas y le resulta más fácil retrasarse que adelantarse. Al oeste el día se alarga, que es la dirección natural; al este hay que forzar el adelanto.',
    },
    {
      q: '¿Cómo se puede reducir el jet lag?',
      a: 'Adelantando o retrasando los horarios de sueño 2 o 3 días antes del vuelo, buscando luz solar por la mañana en destino si viajaste al este y al final del día si viajaste al oeste, y comiendo en el horario local desde el primer día.',
    },
    {
      q: '¿Conviene roaming, eSIM o chip local?',
      a: 'Para viajes muy cortos el paquete de roaming del propio operador suele ser lo más práctico. A partir de una semana, la eSIM internacional o el chip local salen bastante menos. El chip local es el más barato pero se compra recién al llegar.',
    },
    {
      q: '¿Qué pasa si uso datos en el exterior sin paquete contratado?',
      a: 'Se factura por consumo a la tarifa plena de roaming, que es varias veces más cara que cualquier paquete. Es el origen de las facturas desproporcionadas después de un viaje: activá el paquete o desactivá los datos móviles antes de aterrizar.',
    },
    {
      q: '¿Cuánto puedo traer a Argentina sin pagar impuestos?',
      a: 'La franquicia de viajero es de 500 dólares por persona ingresando por vía aérea o marítima, más otros 500 dólares para el free shop de llegada, y de 300 dólares por vía terrestre o fluvial.',
    },
    {
      q: '¿La franquicia se suma entre los que viajamos juntos?',
      a: 'Sí: el grupo familiar acumula las franquicias individuales. Los menores de 16 años computan la mitad, así que una familia de dos adultos y un menor por vía aérea suma 1.250 dólares de franquicia de equipaje.',
    },
    {
      q: '¿Cuánto se paga por lo que excede la franquicia?',
      a: 'El excedente tributa el 50% de su valor. Conviene declararlo de forma espontánea al llegar: si lo detecta la Aduana, además del tributo puede aplicarse una multa.',
    },
    {
      q: '¿La ropa que llevo puesta cuenta para la franquicia?',
      a: 'No. La ropa y los efectos personales usados que forman parte del equipaje habitual del viajero no computan. La franquicia aplica a lo que traés nuevo, sobre todo electrónica, ropa sin uso y regalos.',
    },
    {
      q: '¿Sigue vigente el impuesto PAÍS sobre los pasajes al exterior?',
      a: 'No: el impuesto PAÍS quedó derogado a fines de 2024. Lo que continúa es la percepción a cuenta de Ganancias y Bienes Personales sobre los consumos en moneda extranjera pagados en pesos.',
    },
    {
      q: '¿La percepción sobre el pasaje se puede recuperar?',
      a: 'Sí. Es un pago a cuenta, no un impuesto definitivo: se computa contra el saldo de Ganancias o Bienes Personales al presentar la declaración jurada. Quienes no son contribuyentes de esos impuestos pueden pedir la devolución.',
    },
    {
      q: '¿Conviene pagar el pasaje en dólares o en pesos?',
      a: 'Pagarlo en dólares propios evita la percepción, pero implica desprenderse de la divisa al tipo de cambio del momento. Pagarlo en pesos suma el recargo, aunque una parte se recupera después. La comparación depende del tipo de cambio del día y de si vas a poder computar la percepción.',
    },
  ],

  sources: [
    {
      name: 'CDC Yellow Book — Jet Lag Disorder (tasas de ajuste circadiano)',
      url: 'https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html',
      publisher: 'Centers for Disease Control and Prevention',
    },
    {
      name: 'Franquicia de equipaje de viajeros — régimen vigente',
      url: 'https://www.afip.gob.ar/viajeros/ayuda/franquicia.asp',
      publisher: 'ARCA (ex AFIP)',
    },
    {
      name: 'Impuesto PAÍS — vigencia hasta el 22 de diciembre de 2024',
      url: 'https://www.boletinoficial.gob.ar/',
      publisher: 'Boletín Oficial de la República Argentina',
      date: '2024',
    },
    {
      name: 'Percepción a cuenta de Ganancias y Bienes Personales sobre consumos en moneda extranjera',
      url: 'https://www.afip.gob.ar/gananciasYBienes/',
      publisher: 'ARCA (ex AFIP)',
    },
  ],

  replaces: [
    '/calculadora-jet-lag-recuperacion',
    '/calculadora-jet-lag-recuperacion-horas-diferencia-dias',
    '/calculadora-jet-lag-zonas-horarias-adaptacion-dias',
    '/calculadora-costo-roaming-datos-exterior',
    '/calculadora-franquicia-aduana-viajero-argentina-equipaje',
    '/calculadora-impuesto-pais-pasaje-avion-internacional',
    '/calculadora-adaptador-enchufe-voltaje-pais',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Precios de datos por región en USD — espejo de costo-roaming-datos-exterior.ts */
export const REGIONES: Record<string, { roamingDia: number; esim15d: number; chipLocal: number; nombre: string }> = {
  europa: { roamingDia: 12, esim15d: 40, chipLocal: 20, nombre: 'Europa' },
  eeuu: { roamingDia: 12, esim15d: 40, chipLocal: 25, nombre: 'EE.UU. y Canadá' },
  latam: { roamingDia: 6, esim15d: 30, chipLocal: 15, nombre: 'Latinoamérica' },
  asia: { roamingDia: 15, esim15d: 35, chipLocal: 12, nombre: 'Asia' },
  mundial: { roamingDia: 18, esim15d: 50, chipLocal: 25, nombre: 'Otros destinos' },
};

/** Factores de escala de la eSIM y del chip local por días — espejo del original. */
export const ESCALA = {
  esim: [
    { hasta: 7, factor: 0.6 },
    { hasta: 15, factor: 1.0 },
    { hasta: 30, factor: 1.5 },
  ],
  esimMax: 2.0,
  chip: [
    { hasta: 7, factor: 0.8 },
    { hasta: 15, factor: 1.0 },
    { hasta: 30, factor: 1.3 },
  ],
  chipMax: 1.8,
  uso: [
    { mayorA: 2, factor: 1.3 },
    { mayorA: 1, factor: 1.1 },
  ],
  usoBase: 1.0,
};

/**
 * Días de adaptación al jet lag.
 * Las tres calculadoras originales usaban factores distintos (1,3 al este en jet-lag.ts;
 * 1,0 al este y 0,67 al oeste en las otras dos). Acá unificamos con el criterio del
 * CDC Yellow Book, que es la fuente citada: 1 día por zona al este, 2/3 al oeste.
 */
export const JETLAG = { este: 1.0, oeste: 2 / 3, ajusteEdadDesde: 40, ajusteEdadPorAnio: 0.01 };
