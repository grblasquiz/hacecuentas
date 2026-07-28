import type { HubData } from '../types';
import { ADUANA_VIAJERO_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "¿Cuánto sale de verdad este vuelo, y me conviene comprar afuera?"
 *
 * Absorbe cuatro calculadoras: tasa de embarque internacional, tarifa de vuelo
 * doméstico con tasas, valor de las millas LATAM Pass y comparación de comprar
 * un iPhone en EE. UU. contra Chile con los impuestos de viajero.
 *
 * DIFERENCIAS DELIBERADAS CON LAS FÓRMULAS VIEJAS (ver reporte):
 *  - Las dos fórmulas de vuelos aplicaban IVA del 19% al pasaje y a la tasa de
 *    embarque. El transporte aéreo de pasajeros está exento de IVA en Chile
 *    (Art. 13 N°3 del DL 825) y el transporte internacional también lo está
 *    (Art. 12 letra E N°2). Acá no se aplica IVA al pasaje.
 *  - Las dos se contradecían entre sí en la tasa doméstica: una usaba $4.500 y
 *    la otra entre $18.000 y $19.500, un factor de cuatro. Acá la tasa es un
 *    CAMPO EDITABLE con su fecha de dato, porque la fija la concesionaria y
 *    cambia por aeropuerto.
 *  - Las dos hardcodeaban el dólar ($967 y $1.000). Acá sale vivo de
 *    src/data/live/chile.json.
 *  - La comparación con EE. UU. calculaba el derecho y el IVA de aduana sobre el
 *    precio + sales tax. El valor aduanero es el precio pagado por la mercancía;
 *    el impuesto interno del estado de compra no forma parte de él.
 *
 * ADUANA_VIAJERO_2026 sale de src/lib/data/chile-2026.ts (fuente: aduana.cl):
 * 6% de derecho ad valorem, 19% de IVA sobre valor + derecho, +3% si es usado,
 * duty free hasta US$675, obsequios hasta US$300, declaración simplificada
 * hasta US$1.500 FOB.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Indicadores vivos, con el mismo fallback que usan las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const USD = (clLive as any)?.dolar?.valor ?? 941.93;
export const USD_FECHA = String((clLive as any)?.dolar?.fecha ?? '').slice(0, 10);

/** Reglas de aduana de viajero — Servicio Nacional de Aduanas. */
export const ADUANA = ADUANA_VIAJERO_2026;

/**
 * Tasas aeroportuarias de referencia. Las fija la DGAC y la concesionaria de
 * cada terminal y CADUCAN: van como campo editable con fecha de dato.
 * Valores de referencia de julio de 2026.
 */
export const TASAS_AS_OF = '2026-07';
export const TASA_INTERNACIONAL_USD = 30;
export const TASA_DOMESTICA_CLP = 4_500;

/** Cargo por uso de terminal (embarque doméstico) por aeropuerto, CLP. Editable. */
export const AEROPUERTOS: Array<{ id: string; nombre: string; terminalDom: number; terminalIntl: number }> = [
  { id: 'scl', nombre: 'Santiago — Arturo Merino Benítez', terminalDom: 3_500, terminalIntl: 5_000 },
  { id: 'antofagasta', nombre: 'Antofagasta — Cerro Moreno', terminalDom: 2_200, terminalIntl: 3_100 },
  { id: 'punta_arenas', nombre: 'Punta Arenas — Carlos Ibáñez del Campo', terminalDom: 2_300, terminalIntl: 3_200 },
  { id: 'concepcion', nombre: 'Concepción — Carriel Sur', terminalDom: 2_100, terminalIntl: 2_900 },
  { id: 'puerto_montt', nombre: 'Puerto Montt — El Tepual', terminalDom: 2_100, terminalIntl: 2_900 },
  { id: 'iquique', nombre: 'Iquique — Diego Aracena', terminalDom: 2_000, terminalIntl: 2_800 },
  { id: 'temuco', nombre: 'Temuco — La Araucanía', terminalDom: 2_000, terminalIntl: 2_800 },
  { id: 'calama', nombre: 'Calama — El Loa', terminalDom: 1_800, terminalIntl: 2_500 },
];

/**
 * LATAM Pass — factor de millas por dólar gastado según familia tarifaria.
 * Orientativo: el reglamento vigente acumula según tarifa y ruta y cambia con
 * las promociones. Esta página NO tiene afiliación con LATAM Airlines.
 */
export const TARIFAS: Array<{ id: string; nombre: string; factor: number }> = [
  { id: 'light', nombre: 'Economy Light', factor: 0.6 },
  { id: 'plus', nombre: 'Economy Plus / flexible', factor: 1.0 },
  { id: 'top', nombre: 'Economy Top', factor: 1.5 },
  { id: 'premium', nombre: 'Premium Economy o Business', factor: 2.0 },
];

/** Bonus de acumulación por categoría Elite, como proporción adicional. */
export const CATEGORIAS: Array<{ id: string; nombre: string; bonus: number }> = [
  { id: 'base', nombre: 'Sin categoría', bonus: 0 },
  { id: 'gold', nombre: 'Gold (+25%)', bonus: 0.25 },
  { id: 'platinum', nombre: 'Platinum (+50%)', bonus: 0.5 },
  { id: 'black', nombre: 'Black (+80%)', bonus: 0.8 },
];

/** Valor de canje de referencia de la milla, en centavos de dólar. Editable. */
export const VALOR_MILLA_CENTAVOS_USD = 1.4;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/vida/viajar-y-comprar-afuera',
  title: 'Viajar desde Chile: tasas del pasaje, valor de tus millas e impuestos de aduana',
  description:
    'Cuánto sale de verdad un vuelo desde Chile con las tasas de embarque y el cargo de terminal, si el pasaje lleva IVA o no, cuánto valen realmente tus millas LATAM Pass y qué pagas en la aduana si traes un iPhone de Estados Unidos: 6% de derecho ad valorem y 19% de IVA, con la franquicia de viajero.',
  silo: 'Vida',
  siloHref: '/cl/vida',
  locale: 'cl',

  eyebrow: 'Chile · viajes y aduana',
  h1: '¿Cuánto sale de verdad este vuelo, y me conviene comprar afuera?',
  lede:
    'El precio que ves publicado no es el que pagas: encima van la tasa de embarque y el cargo de uso de terminal. Acá calculas el total real de un pasaje doméstico o internacional, cuánto valen las millas que vas a acumular con ese vuelo, y qué te va a cobrar la aduana si vuelves con algo comprado afuera.',
  stamps: [
    `Dólar de hoy: ${fmt(USD)}`,
    `Aduana de viajero: ${(ADUANA.derechoAdValorem * 100).toFixed(0)}% de derecho + ${(ADUANA.iva * 100).toFixed(0)}% de IVA`,
    `Duty free hasta US$${ADUANA.dutyFreeMaxUsd} · obsequios hasta US$${ADUANA.obsequiosMaxUsd}`,
    `Tasas aeroportuarias de referencia de ${TASAS_AS_OF}`,
    '4 calculadoras en una sola página',
  ],

  resultLabel: 'Costo total estimado',

  cases: {
    title: '¿Qué estás calculando?',
    intro:
      'Empezamos por el vuelo internacional, que es donde el recargo se nota más. Si tu caso es otro, cámbialo acá.',
    items: [
      {
        id: 'internacional',
        label: 'Vuelo internacional saliendo de Chile',
        hint: 'Tasa de embarque internacional y cargo de terminal sobre la tarifa publicada.',
        yes: [
          'Tarifa base del pasaje, la que se publica',
          'Tasa de embarque internacional, expresada en dólares y convertida con el dólar del día',
          'Cargo por uso de terminal del aeropuerto de salida',
          'Qué porcentaje del total final son tasas y no tarifa',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El transporte aéreo internacional de pasajeros está exento de IVA en Chile (Art. 12 letra E N°2 del DL 825): si alguna calculadora te suma un 19% al pasaje internacional, está inflando el resultado',
          `La tasa de embarque la fija la autoridad aeronáutica y la concesionaria del terminal y cambia sin aviso: el valor de esta página es de referencia de ${TASAS_AS_OF} y es editable`,
          'La mayoría de las aerolíneas ya cobra la tasa dentro del ticket: si tu pasaje la incluye, no la sumes dos veces',
        ],
        plazo:
          'las tasas aeroportuarias se reajustan por resolución y suelen actualizarse una vez al año: verifica el valor vigente en la DGAC antes de presupuestar un viaje lejano.',
        answer:
          'En un vuelo internacional el recargo sobre la tarifa publicada es la tasa de embarque más el cargo de terminal; el pasaje en sí no lleva IVA.',
      },
      {
        id: 'domestico',
        label: 'Vuelo doméstico dentro de Chile',
        hint: 'La tarifa de $9.900 que viste en la publicidad, con todo lo que se le suma.',
        yes: [
          'Tarifa base del pasaje doméstico',
          'Tasa de embarque nacional del aeropuerto de salida',
          'Cargo por uso de terminal doméstico',
          'Cuánto pesa el recargo sobre una tarifa promocional barata',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El transporte de pasajeros está exento de IVA en Chile (Art. 13 N°3 del DL 825): el pasaje aéreo doméstico no lleva 19% encima',
          'Las tasas son un monto fijo por pasajero: sobre una tarifa promocional muy baja pueden pesar más que el pasaje mismo, y por eso hay que comparar el total final y no el precio publicitado',
          'El equipaje de bodega, la selección de asiento y los cambios son cargos aparte que suelen superar a las tasas: agrégalos antes de decidir',
        ],
        plazo:
          'la tarifa base cambia todos los días con la demanda; las tasas y el cargo de terminal son fijos y no dependen de cuándo compres.',
        answer:
          'En un vuelo doméstico barato las tasas fijas pueden pesar tanto o más que la tarifa: siempre hay que comparar el precio final, no el publicitado.',
      },
      {
        id: 'millas',
        label: '¿Pago con millas o con plata?',
        hint: 'Cuánto valen realmente las millas LATAM Pass que vas a acumular o a canjear.',
        yes: [
          'Millas base que acumulas según el gasto en dólares y la familia tarifaria',
          'Bonus por tu categoría Elite',
          'Cuánto valen esas millas en pesos, a un valor de canje de referencia',
          'Qué porcentaje del gasto te vuelve en millas',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Esta página no tiene afiliación con LATAM Airlines: los factores de acumulación son orientativos y el reglamento vigente manda',
          'El valor de la milla no es fijo: depende del canje concreto. En rutas cortas y en temporada alta el valor por milla baja, y en canjes de cabina superior sube',
          'Un canje sólo conviene si el valor por milla que obtienes supera lo que te habría costado comprar la misma milla o el mismo pasaje: compara siempre contra el precio en plata del mismo vuelo',
          'Las millas caducan según el reglamento del programa: acumular para "algún día" tiene un costo real',
        ],
        plazo:
          'las millas de un vuelo se acreditan normalmente dentro de los quince días posteriores al viaje; si no aparecen, hay plazo para reclamar la acreditación retroactiva.',
        answer:
          'Una milla LATAM Pass vale del orden de 1,4 centavos de dólar al canjearla: si el canje te da menos que eso, conviene pagar con plata y guardar las millas.',
      },
      {
        id: 'aduana',
        label: 'Traer algo comprado afuera',
        hint: 'Franquicia de viajero, derecho ad valorem del 6% e IVA del 19%.',
        yes: [
          `Derecho ad valorem del ${(ADUANA.derechoAdValorem * 100).toFixed(0)}% sobre el valor aduanero`,
          `IVA del ${(ADUANA.iva * 100).toFixed(0)}% sobre el valor aduanero más el derecho`,
          `Recargo adicional del ${(ADUANA.recargoUsado * 100).toFixed(0)}% si el artículo es usado`,
          'Comparación directa contra el precio del mismo producto en Chile',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los efectos personales de uso del viajero no tributan: un teléfono o un notebook que traes en uso, para ti, entra como equipaje. Lo que corresponde declarar es la mercancía nueva, en su caja, especialmente si es para regalo o reventa',
          `Las franquicias tienen tope: duty free hasta US$${ADUANA.dutyFreeMaxUsd}, obsequios hasta US$${ADUANA.obsequiosMaxUsd} y declaración simplificada hasta US$${ADUANA.declaracionSimplificadaMaxUsd.toLocaleString('es-CL')} FOB. Sobre eso hay que hacer una destinación aduanera formal`,
          'El sales tax que pagaste en Estados Unidos no forma parte del valor aduanero: la aduana grava el precio de la mercancía, no el impuesto interno del estado donde la compraste',
          'La garantía de un equipo comprado afuera suele valer sólo en el país de compra, y algunos modelos no soportan todas las bandas de las redes chilenas: eso puede costar más que el ahorro',
          'No declarar mercancía afecta a impuestos es una infracción aduanera y puede terminar en incautación y multa',
        ],
        plazo:
          'la declaración se hace al llegar, en el mismo aeropuerto o paso fronterizo, antes de pasar el control: después ya es tarde.',
        answer:
          'Lo que declares paga un 6% de derecho ad valorem más un 19% de IVA sobre el valor más el derecho: cerca de un 26% del valor aduanero.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu viaje',
  inputsIntro:
    'El dólar sale del valor observado del día. Las tasas aeroportuarias vienen precargadas con valores de referencia y son editables: si tu boleto muestra otro monto, usa el tuyo.',
  fields: [
    {
      id: 'tarifa',
      label: 'Tarifa base del pasaje (CLP)',
      prefix: '$',
      value: '450.000',
      thousands: true,
      help: 'El precio publicado, antes de tasas y cargos.',
    },
    {
      id: 'pasajeros',
      label: 'Pasajeros',
      type: 'number',
      value: 2,
      min: 1,
      max: 20,
      step: 1,
    },
    {
      id: 'aeropuerto',
      label: 'Aeropuerto de salida',
      type: 'select',
      value: 'scl',
      options: AEROPUERTOS.map((a) => ({ value: a.id, label: a.nombre })),
    },
    {
      id: 'tasaIntlUsd',
      label: 'Tasa de embarque internacional (USD)',
      suffix: 'USD',
      type: 'number',
      value: TASA_INTERNACIONAL_USD,
      min: 0,
      max: 100,
      step: 0.5,
      help: `Valor de referencia de ${TASAS_AS_OF}. La fija la autoridad aeronáutica: verifica el vigente o el que muestra tu boleto.`,
    },
    {
      id: 'tasaDomCLP',
      label: 'Tasa de embarque nacional (CLP)',
      prefix: '$',
      value: '4.500',
      thousands: true,
      help: `Valor de referencia de ${TASAS_AS_OF}. Cambia por aeropuerto y por resolución.`,
    },
    {
      id: 'equipaje',
      label: 'Cargos opcionales por pasajero: equipaje, asiento (CLP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Bodega, selección de asiento y cambios. Suelen pesar más que las tasas.',
    },
    {
      id: 'gastoUsd',
      label: 'Gasto del pasaje en dólares, neto de tasas (USD)',
      suffix: 'USD',
      type: 'number',
      value: 480,
      min: 0,
      max: 20000,
      step: 10,
      help: 'Base de acumulación de millas LATAM Pass.',
    },
    {
      id: 'tarifaMillas',
      label: 'Familia tarifaria del pasaje',
      type: 'select',
      value: 'light',
      options: TARIFAS.map((t) => ({ value: t.id, label: `${t.nombre} — factor ${t.factor.toFixed(1).replace('.', ',')}` })),
    },
    {
      id: 'categoria',
      label: 'Tu categoría LATAM Pass',
      type: 'select',
      value: 'base',
      options: CATEGORIAS.map((c) => ({ value: c.id, label: c.nombre })),
    },
    {
      id: 'valorMilla',
      label: 'Valor de canje de la milla (centavos de USD)',
      suffix: '¢USD',
      type: 'number',
      value: VALOR_MILLA_CENTAVOS_USD,
      min: 0.1,
      max: 10,
      step: 0.1,
      help: 'Referencia de mercado. Calcula el tuyo dividiendo el precio en plata de un pasaje por las millas que te pide.',
    },
    {
      id: 'precioUsa',
      label: 'Precio del producto en Estados Unidos (USD, sin impuestos)',
      suffix: 'USD',
      type: 'number',
      value: 999,
      min: 0,
      max: 50000,
      step: 10,
    },
    {
      id: 'salesTax',
      label: 'Sales tax del estado donde compras (%)',
      suffix: '%',
      type: 'number',
      value: 8.5,
      min: 0,
      max: 15,
      step: 0.1,
      help: 'En Oregón, Delaware, Montana y New Hampshire es 0%.',
    },
    {
      id: 'precioChile',
      label: 'Precio del mismo producto en Chile (CLP)',
      prefix: '$',
      value: '1.299.000',
      thousands: true,
    },
    {
      id: 'declara',
      label: '¿Lo vas a declarar en aduana?',
      type: 'select',
      value: 'equipaje',
      options: [
        { value: 'equipaje', label: 'No: viene en uso, como efecto personal' },
        { value: 'declarar', label: 'Sí: viene nuevo, en su caja' },
      ],
    },
    {
      id: 'usado',
      label: '¿El artículo que declaras es usado?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, es nuevo' },
        { value: 'si', label: `Sí, es usado (+${(ADUANA.recargoUsado * 100).toFixed(0)}% de recargo)` },
      ],
    },
    {
      id: 'dolar',
      label: 'Tipo de cambio a usar (CLP por USD, 0 = el del día)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: `Si lo dejas en 0 se usa el dólar observado del día: ${fmt(USD)}.`,
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el precio final',
    caption:
      'Muestra cuánto del total que pagas es tarifa y cuánto son tasas, cargos o impuestos de aduana. En pasajes promocionales el recargo puede superar a la tarifa.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada monto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cuánto es la tasa de embarque internacional en Chile?',
      a: 'En los vuelos internacionales que salen de Chile la tasa de embarque se expresa en dólares y ronda los treinta dólares por pasajero, convertidos al tipo de cambio del día. La fija la autoridad aeronáutica junto con la concesionaria del terminal y se reajusta por resolución, así que el valor exacto conviene verificarlo antes de un viaje planificado con mucha anticipación. Hoy prácticamente todas las aerolíneas la cobran incluida dentro del ticket, así que aparece en el desglose de tu boleto y no se paga aparte en el aeropuerto.',
    },
    {
      q: '¿El pasaje de avión lleva IVA en Chile?',
      a: 'No. El transporte de pasajeros está exento de IVA por el Art. 13 N°3 del DL 825, y el transporte internacional lo está además por el Art. 12 letra E N°2. Eso significa que ni la tarifa de un vuelo doméstico ni la de un internacional llevan un 19% encima. Es un error frecuente en calculadoras y en comparadores: si ves un desglose que suma IVA sobre el pasaje, el total está inflado en cerca de un quinto. Lo que sí puede llevar IVA son servicios accesorios contratados en tierra.',
    },
    {
      q: '¿Cuánto es la tasa de embarque en un vuelo nacional?',
      a: 'Es bastante más baja que la internacional y se cobra en pesos: en el orden de unos pocos miles de pesos por pasajero, más el cargo por uso de terminal, que varía por aeropuerto y es mayor en Santiago que en regiones. El punto relevante no es el monto sino su naturaleza: es un cargo fijo por persona, así que sobre una tarifa promocional muy barata puede pesar tanto como el pasaje mismo. Por eso siempre hay que comparar el precio final y no el número grande de la publicidad.',
    },
    {
      q: '¿Cuánto vale una milla LATAM Pass?',
      a: 'Como referencia de mercado, alrededor de 1,4 centavos de dólar por milla al canjearla, pero ese número es un promedio y el valor real depende del canje concreto: en rutas cortas y en temporada alta baja, y en canjes de cabina superior o de tramos largos sube. La forma honesta de evaluarlo es sacar tu propio valor: divide el precio en plata del pasaje que quieres por la cantidad de millas que te pide. Si el resultado por milla es mayor que el promedio, ese canje conviene; si es menor, paga con plata y guarda las millas.',
    },
    {
      q: '¿Cuántas millas acumulo por un vuelo?',
      a: 'Depende de la familia tarifaria más que del precio. Las tarifas económicas más baratas acumulan una fracción de la milla por dólar gastado, y a medida que subes de tarifa el factor crece, hasta duplicar en cabinas superiores. Encima de eso se aplica el bonus de tu categoría Elite, que suma un porcentaje adicional sobre las millas base. Los factores exactos los fija el reglamento vigente del programa y cambian con las promociones: esta página usa valores orientativos y no tiene afiliación con la aerolínea.',
    },
    {
      q: '¿Qué impuestos pago si traigo algo comprado en el extranjero?',
      a: 'Sobre lo que declaras, el Servicio Nacional de Aduanas aplica un derecho ad valorem del 6% sobre el valor aduanero y un IVA del 19% sobre ese valor más el derecho. En conjunto eso equivale a cerca de un 26% del valor de la mercancía. Si el artículo es usado hay un recargo adicional del 3%. Existen franquicias con tope: compras en duty free hasta seiscientos setenta y cinco dólares, obsequios hasta trescientos dólares, y declaración simplificada hasta mil quinientos dólares FOB, monto sobre el cual hay que hacer una destinación aduanera formal.',
    },
    {
      q: '¿Tengo que declarar el teléfono nuevo que traigo de viaje?',
      a: 'La regla es la finalidad y el estado del artículo. Los efectos personales que el viajero trae en uso, para su propio uso, entran como equipaje y no tributan: un teléfono que ya usas, un notebook, una cámara. Lo que corresponde declarar es la mercancía nueva, en su caja, sobre todo si es para regalar o revender. No declarar mercancía afecta a impuestos es una infracción aduanera que puede terminar en incautación y multa, así que si estás en el límite conviene declarar y pagar.',
    },
    {
      q: '¿El sales tax que pagué en Estados Unidos suma al valor sobre el que cobra la aduana chilena?',
      a: 'No. El valor aduanero es el precio efectivamente pagado por la mercancía; el impuesto sobre las ventas de un estado de Estados Unidos es un tributo interno de ese país y no forma parte de ese valor. Cualquier cálculo que aplique el 6% y el 19% sobre el precio con sales tax incluido sobreestima el impuesto. Sí forman parte del valor aduanero, en cambio, el flete y el seguro cuando la mercancía viene por carga, aunque en el equipaje del viajero eso normalmente no aplica.',
    },
    {
      q: '¿Conviene comprar un iPhone en Estados Unidos y traerlo a Chile?',
      a: 'Depende de tres cosas: la brecha de precio, el tipo de cambio del día y si vas a declararlo. Con la brecha típica, traerlo en uso como efecto personal suele salir a cuenta; declarándolo, ese 26% de impuestos se come buena parte de la diferencia y el resultado se vuelve marginal. Y hay dos costos que no aparecen en la calculadora: la garantía de un equipo comprado afuera normalmente sólo vale en el país de compra, y algunos modelos no soportan todas las bandas de las redes chilenas. Un problema con cualquiera de esas dos cosas se come el ahorro completo.',
    },
    {
      q: '¿Cuánto puedo traer sin pagar impuestos?',
      a: 'Los artículos de uso personal del viajero no tributan sin un tope en dinero, porque no son mercancía. Para lo demás rigen las franquicias con tope: hasta seiscientos setenta y cinco dólares en compras de duty free, hasta trescientos dólares en obsequios, y hasta mil quinientos dólares FOB con declaración simplificada, monto sobre el cual hay que hacer una destinación aduanera formal con agente. Los montos exactos y sus condiciones los publica el Servicio Nacional de Aduanas y conviene verificarlos antes de viajar.',
    },
    {
      q: '¿Por qué el precio final del pasaje es tan distinto del publicitado?',
      a: 'Porque a la tarifa se le suman cargos que son fijos por pasajero: la tasa de embarque, el cargo por uso de terminal y, en muchos casos, los servicios que en las tarifas más baratas ya no vienen incluidos, como el equipaje de bodega, la selección de asiento y el cambio de fecha. En una tarifa promocional esos cargos pueden más que duplicar el precio. La comparación correcta entre aerolíneas es siempre sobre el total final con el mismo equipaje y el mismo asiento, no sobre la tarifa de portada.',
    },
    {
      q: '¿Con qué tipo de cambio se convierten las tasas en dólares?',
      a: 'Las tasas expresadas en dólares se convierten al tipo de cambio vigente al momento de la emisión del boleto, no al del día del vuelo. Por eso dos pasajes iguales comprados con semanas de diferencia pueden mostrar tasas distintas en pesos. Esta página usa el dólar observado del día que publica el Banco Central, y te deja fijar otro tipo de cambio si quieres reproducir exactamente el desglose de un boleto ya emitido.',
    },
  ],

  sources: [
    {
      name: 'Servicio Nacional de Aduanas — pago de impuestos de viajeros y viajeras',
      url: 'https://www.aduana.cl/pago-impuestos-viajeros-y-viajeras/aduana/2018-12-28/084707.html',
      publisher: 'Servicio Nacional de Aduanas de Chile',
    },
    {
      name: 'Servicio Nacional de Aduanas — equipaje de viajero y franquicias',
      url: 'https://www.aduana.cl/equipaje-de-viajero-y-viajera/aduana/2018-12-28/083959.html',
      publisher: 'Servicio Nacional de Aduanas de Chile',
    },
    {
      name: 'DGAC — tarifas y derechos aeronáuticos',
      url: 'https://www.dgac.gob.cl/',
      publisher: 'Dirección General de Aeronáutica Civil',
    },
    {
      name: 'BCN — DL 825 sobre impuesto a las ventas y servicios (exención del transporte de pasajeros, Art. 13 N°3)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=6369',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'SII — exenciones del IVA y transporte internacional',
      url: 'https://www.sii.cl/preguntas_frecuentes/iva/001_030_0691.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Banco Central de Chile — dólar observado y valor de la UF',
      url: 'https://si3.bcentral.cl/indicadoressiete/secure/Indicadoressiete.aspx',
      publisher: 'Banco Central de Chile',
    },
    {
      name: 'LATAM Pass — reglamento del programa de pasajero frecuente',
      url: 'https://www.latamairlines.com/cl/es/latam-pass',
      publisher: 'LATAM Airlines (referencia, sin afiliación)',
    },
    {
      name: 'SERNAC — derechos del pasajero aéreo y cargos del pasaje',
      url: 'https://www.sernac.cl/portal/604/w3-propertyvalue-78511.html',
      publisher: 'Servicio Nacional del Consumidor',
    },
  ],

  replaces: [
    '/calculadora-impuesto-aerolinea-chile-tasa-embarque-internacional',
    '/calculadora-tarifa-vuelo-domestico-chile-impuestos-tasas-aeropuerto',
    '/calculadora-millas-latam-pass-acumulacion-valor-chile',
    '/calculadora-comprar-iphone-usa-vs-chile-impuestos-viajero',
  ],

  lastReviewed: '2026-07-28',
};
