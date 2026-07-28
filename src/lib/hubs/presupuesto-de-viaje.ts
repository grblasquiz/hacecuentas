import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánta plata necesito para este viaje?".
 *
 * Números espejados de:
 *   src/lib/formulas/viaje-presupuesto.ts / presupuesto-viaje.ts (suma por rubro, noches = días − 1)
 *   src/lib/formulas/presupuesto-viaje-rio-janeiro.ts  (hotel 50/120/280 · comida 40 · transporte 8 · actividades 30 USD)
 *   src/lib/formulas/presupuesto-viaje-dubai.ts        (hotel 100/250/600 · comida 80 · transporte 15 · actividades 60 USD)
 *   src/lib/formulas/vacaciones-bariloche-presupuesto-7-dias-familia.ts (tarifas por temporada y categoría en ARS)
 *   src/lib/formulas/noches-hospedaje-costo.ts
 *   src/lib/formulas/alquiler-auto-costo-dias.ts
 *   src/lib/formulas/moneda-local-cambio-pais.ts
 *   src/lib/formulas/dias-ideales-viaje.ts
 */

export const hub: HubData = {
  slug: 'viajes/presupuesto-de-viaje',
  title: '¿Cuánta plata necesito para este viaje? — Presupuesto por destino y por día',
  description:
    'Armá el presupuesto del viaje rubro por rubro: alojamiento, comida, transporte y actividades, con referencias de costo diario para Río de Janeiro, Dubái y Bariloche, cuánto efectivo llevar y cuántos días conviene quedarse.',
  silo: 'Viajes',
  siloHref: '/viajes',

  eyebrow: 'Presupuesto y costos de viaje',
  h1: '¿Cuánta plata necesitás para ese viaje?',
  lede:
    'Empezamos por el presupuesto armado a tu medida, con tus propios números. Si querés partir de referencias de un destino concreto, o calcular sólo el alojamiento, el auto o el efectivo, lo cambiás abajo.',
  stamps: ['Actualizado 27-07-2026', 'Referencias de costo por destino', '10 calculadoras adentro'],

  resultLabel: 'Presupuesto estimado',

  cases: {
    title: '¿Qué querés presupuestar?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'generico',
        label: 'El viaje completo, con mis propios números',
        hint: 'Rubro por rubro',
        answer: 'El presupuesto se arma sumando alojamiento, comida, transporte, actividades y extras fijos.',
        yes: [
          'Alojamiento por noche multiplicado por las noches, que son los días menos uno',
          'Comida, transporte y actividades por día y por persona',
          'Extras fijos: pasajes, seguro de viaje y traslados al aeropuerto',
        ],
        warn: [
          'Un viaje de 7 días tiene 6 noches de hotel: contar 7 es el error más común y sobrestima el alojamiento',
          'El presupuesto es una suma de tus supuestos: si los precios de partida están viejos, el total también',
        ],
        plazo: 'revisá el presupuesto cuando cierres los pasajes: es el rubro que más se mueve.',
      },
      {
        id: 'rio',
        label: 'Río de Janeiro',
        hint: 'Referencias en dólares',
        answer: 'Río es de los destinos accesibles de la región: la playa es gratis y comer fuera del circuito turístico baja mucho la cuenta.',
        yes: [
          'Hotel por noche en tres niveles, con habitaciones para dos personas',
          'Comida, transporte y actividades por persona y por día',
          'Vuelo estimado desde Latinoamérica, opcional',
        ],
        warn: [
          'Las referencias son valores orientativos por nivel de hotel, no cotizaciones: verificá precios reales antes de reservar',
          'El carnaval y el fin de año mueven las tarifas de alojamiento muy por encima de estas referencias',
        ],
        plazo: 'las tarifas de alojamiento en temporada alta se disparan con meses de anticipación.',
      },
      {
        id: 'dubai',
        label: 'Dubái',
        hint: 'Referencias en dólares',
        answer: 'Dubái es caro: el hotel y las actividades son los que disparan el presupuesto.',
        yes: [
          'Hotel por noche en tres niveles, con habitaciones para dos personas',
          'Comida, transporte y actividades por persona y por día',
          'Vuelo estimado, opcional: desde Latinoamérica es un tramo largo',
        ],
        warn: [
          'Las referencias son valores orientativos por nivel de hotel, no cotizaciones: verificá precios reales antes de reservar',
          'Bajar de hotel de lujo a hotel medio es lo que más recorta la cuenta, más que ajustar comidas',
        ],
        plazo: 'el verano del hemisferio norte es temporada baja en Dubái por el calor extremo.',
      },
      {
        id: 'bariloche',
        label: 'Bariloche en familia',
        hint: 'Referencias en pesos',
        answer: 'En Bariloche el hospedaje y las comidas se llevan casi todo, y la temporada cambia el total por completo.',
        yes: [
          'Tarifa por noche según temporada y categoría: 3, 4 o 5 estrellas, o cabaña',
          'Comidas por persona y por día, ajustadas por temporada',
          'Excursiones por persona, más vuelos y gastos extra diarios',
        ],
        warn: [
          'Las tarifas de alojamiento son referencias en pesos que se desactualizan con la inflación: usalas como orden de magnitud',
          'La temporada alta de invierno puede duplicar el mismo alojamiento respecto de la temporada baja',
        ],
        plazo: 'la temporada alta de nieve concentra la demanda entre julio y agosto.',
      },
      {
        id: 'alojamiento',
        label: 'Sólo el alojamiento',
        hint: 'Noches y habitaciones',
        answer: 'El alojamiento se calcula por noches, no por días, y se multiplica por las habitaciones.',
        yes: [
          'Costo total por noches, precio por noche y cantidad de habitaciones',
          'Costo por persona si van varios',
          'Costo promedio por noche del total',
        ],
        warn: [
          'Chequeá si el precio publicado incluye impuestos y tasa turística: en muchos destinos se cobran aparte al hacer el check-out',
          'Dos habitaciones dobles casi nunca salen lo mismo que una habitación cuádruple: cargá las habitaciones reales',
        ],
        plazo: 'las cancelaciones sin cargo suelen vencer entre 24 y 72 horas antes del check-in.',
      },
      {
        id: 'auto',
        label: 'El alquiler del auto',
        hint: 'Días, seguro y nafta',
        answer: 'El seguro y la nafta pueden costar tanto como el alquiler en sí.',
        yes: [
          'Alquiler por días y precio diario',
          'Seguro por día, que suele contratarse aparte',
          'Combustible estimado del viaje',
        ],
        warn: [
          'El precio publicado casi nunca incluye el seguro con franquicia baja: cargalo aparte o el número real te va a sorprender',
          'Devolver el auto con menos combustible del que te lo entregaron se cobra a tarifa premium',
        ],
        plazo: 'la mayoría de las agencias cobra el día completo aunque devuelvas antes de la hora.',
      },
      {
        id: 'efectivo',
        label: 'Cuánto efectivo llevar',
        hint: 'Efectivo contra tarjeta',
        answer: 'Un tercio del gasto en efectivo suele cubrir lo que no toma plástico.',
        yes: [
          'Gasto total estimado del viaje por persona y en total',
          'Cuánto de eso conviene llevar en efectivo según el porcentaje que elijas',
          'Cuánto queda para pagar con tarjeta',
        ],
        warn: [
          'Llevar más de la mitad del gasto en efectivo es mucha plata en mano: repartila entre las personas del grupo y la caja de seguridad',
          'Propinas, transporte local y mercados suelen ser efectivo: no bajes demasiado esa proporción',
        ],
        plazo: 'avisá a tu banco antes de viajar para que no bloquee la tarjeta por operar en el exterior.',
      },
      {
        id: 'dias',
        label: 'Cuántos días conviene quedarme',
        hint: 'Según destino y ritmo',
        answer: 'Los días ideales dependen del tipo de destino y del ritmo con el que viajás.',
        yes: [
          'Rango de días mínimo, ideal y máximo según el tipo de destino',
          'Ajuste según viajes relajado, moderado o intenso',
          'Un día extra si contás los traslados de ida y vuelta',
        ],
        warn: [
          'Quedarse por debajo del mínimo suele significar pasar más tiempo en traslados que disfrutando el destino',
          'Los rangos son referencias de planificación, no una regla: dependen mucho de qué querés hacer',
        ],
        plazo: 'sumá siempre un día de margen para los traslados de ida y vuelta.',
      },
    ],
  },

  inputsTitle: 'Cargá los números de tu viaje',
  inputsIntro: 'Los campos que no aplican a tu caso se ignoran. Podés dejar los valores de ejemplo.',
  fields: [
    { id: 'dias', label: 'Días de viaje', type: 'number', min: 1, max: 365, value: 7 },
    { id: 'personas', label: 'Personas que viajan', type: 'number', min: 1, max: 20, value: 2 },
    { id: 'alojamientoNoche', label: 'Alojamiento por noche', prefix: '$', value: '90.000', thousands: true },
    { id: 'comidaDia', label: 'Comida por día y por persona', prefix: '$', value: '35.000', thousands: true },
    { id: 'transporteDia', label: 'Transporte por día', prefix: '$', value: '15.000', thousands: true },
    { id: 'actividadesDia', label: 'Actividades por día y por persona', prefix: '$', value: '20.000', thousands: true },
    { id: 'extraFijo', label: 'Extras fijos: pasajes, seguro y traslados', prefix: '$', value: '600.000', thousands: true },
    { id: 'habitaciones', label: 'Habitaciones a reservar', type: 'number', min: 1, max: 10, value: 1 },
    {
      id: 'nivelHotel',
      label: 'Nivel de hotel (Río y Dubái)',
      type: 'select',
      value: 'medio',
      options: [
        { value: 'bajo', label: 'Económico' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto / lujo' },
      ],
    },
    { id: 'vueloUsd', label: 'Vuelo por persona en USD (Río y Dubái; 0 para ver sólo el gasto en destino)', type: 'number', min: 0, value: 0 },
    {
      id: 'temporada',
      label: 'Temporada (Bariloche)',
      type: 'select',
      value: 'alta',
      options: [
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' },
      ],
    },
    {
      id: 'categoriaHotel',
      label: 'Categoría de alojamiento (Bariloche)',
      type: 'select',
      value: '3estrellas',
      options: [
        { value: '3estrellas', label: '3 estrellas' },
        { value: '4estrellas', label: '4 estrellas' },
        { value: '5estrellas', label: '5 estrellas' },
        { value: 'cabana', label: 'Cabaña' },
      ],
    },
    { id: 'vueloPorPersona', label: 'Vuelo por persona (Bariloche)', prefix: '$', value: '350.000', thousands: true },
    { id: 'precioDiaAuto', label: 'Precio del alquiler del auto por día', prefix: '$', value: '55.000', thousands: true },
    { id: 'seguroDiaAuto', label: 'Seguro del auto por día', prefix: '$', value: '18.000', thousands: true },
    { id: 'combustibleAuto', label: 'Combustible estimado del viaje', prefix: '$', value: '120.000', thousands: true },
    { id: 'gastoDiarioUsd', label: 'Gasto diario por persona (USD, para el efectivo)', type: 'number', min: 1, value: 80 },
    { id: 'pctEfectivo', label: 'Porcentaje del gasto que llevás en efectivo', type: 'number', min: 0, max: 100, value: 35 },
    {
      id: 'tipoDestino',
      label: 'Tipo de destino (para los días ideales)',
      type: 'select',
      value: 'ciudad-grande',
      options: [
        { value: 'ciudad-grande', label: 'Ciudad grande' },
        { value: 'ciudad-chica', label: 'Ciudad chica' },
        { value: 'playa', label: 'Playa' },
        { value: 'montana', label: 'Montaña o naturaleza' },
        { value: 'ruta-multiple', label: 'Ruta con varios destinos' },
      ],
    },
    {
      id: 'ritmo',
      label: 'Ritmo con el que viajás',
      type: 'select',
      value: 'moderado',
      options: [
        { value: 'relajado', label: 'Relajado' },
        { value: 'moderado', label: 'Moderado' },
        { value: 'intenso', label: 'Intenso' },
      ],
    },
  ],
  fineprint:
    'Estimación armada con los valores que cargás y con referencias de costo orientativas por destino. Los precios de alojamiento, comida y pasajes cambian por temporada y por anticipación: verificá con la fuente antes de reservar.',

  chart: {
    type: 'donut',
    title: 'A dónde se va el presupuesto',
    caption:
      'Cada porción es un rubro del viaje. El más grande es la palanca con más impacto: bajar un 20% el rubro dominante recorta más que ajustar todos los demás juntos.',
  },
  breakdownTitle: 'El desglose del viaje',
  breakdownIntro: 'Cada fila es un rubro con el criterio de cálculo que lo genera.',

  faq: [
    {
      q: '¿Cuántas noches de hotel tiene un viaje de 7 días?',
      a: 'Seis. Las noches son los días menos uno, porque el último día se hace el check-out sin dormir esa noche. Contar siete noches para siete días infla el rubro más caro del presupuesto.',
    },
    {
      q: '¿Qué rubros tengo que incluir en el presupuesto de un viaje?',
      a: 'Alojamiento por noche, comida por día y por persona, transporte local, actividades y entradas, y los extras fijos: pasajes, seguro de viaje, traslados al aeropuerto y visas si corresponden.',
    },
    {
      q: '¿Qué rubro suele ser el más caro de un viaje?',
      a: 'Depende del destino y de la duración. En viajes largos y en destinos caros manda el alojamiento; en viajes cortos a destinos lejanos, los pasajes. Ver cuál domina tu presupuesto es lo que indica dónde conviene ajustar.',
    },
    {
      q: '¿Cuánto efectivo conviene llevar de viaje?',
      a: 'Como referencia, alrededor de un tercio del gasto estimado en destino. Es lo suficiente para propinas, transporte local y mercados que no toman tarjeta, sin cargar demasiada plata en mano.',
    },
    {
      q: '¿Cuántos días conviene quedarse en una ciudad grande?',
      a: 'Entre 3 y 5 días con ritmo moderado, y hasta 6 o más si viajás relajado. Menos de 3 suele significar pasar buena parte del tiempo en traslados y entradas en vez de en el destino.',
    },
    {
      q: '¿Cuánto se gasta por día en Río de Janeiro?',
      a: 'Con hotel de nivel medio y ritmo turista habitual, el gasto por persona y por día en destino ronda los 100 dólares sumando alojamiento, comida, transporte y actividades. Es un destino accesible dentro de la región.',
    },
    {
      q: '¿Por qué Dubái sale tanto más que Río?',
      a: 'Por el alojamiento y las actividades, que son varias veces más caros. La comida también pesa más. La palanca más efectiva para bajar el presupuesto de Dubái es elegir hotel medio en lugar de lujo.',
    },
    {
      q: '¿Cuánto cuesta una semana en Bariloche para una familia?',
      a: 'Depende sobre todo de la temporada y de la categoría del alojamiento: entre la temporada baja en cabaña y la alta en cinco estrellas hay una diferencia de varias veces sobre el mismo viaje. El hospedaje y las comidas se llevan la mayor parte.',
    },
    {
      q: '¿El alquiler de auto incluye el seguro?',
      a: 'La tarifa publicada suele incluir sólo la cobertura básica con franquicia alta. La cobertura con franquicia baja se contrata aparte y puede costar tanto como el alquiler diario, así que conviene sumarla al presupuesto desde el principio.',
    },
    {
      q: '¿Conviene reservar el alojamiento con anticipación?',
      a: 'En temporada alta sí, sobre todo en destinos con oferta limitada como Bariloche en invierno o Río en carnaval. En temporada baja las tarifas de último momento a veces son mejores, pero la disponibilidad es una lotería.',
    },
    {
      q: '¿Los precios publicados de hotel incluyen impuestos?',
      a: 'No siempre. En muchos destinos la tasa turística municipal se cobra aparte al hacer el check-out, y en otros el impuesto al valor agregado se suma recién al confirmar. Leé el detalle antes de cargar el número en el presupuesto.',
    },
    {
      q: '¿Cómo actualizo un presupuesto de viaje viejo?',
      a: 'Los rubros no se mueven todos igual: los pasajes dependen de la temporada y de la anticipación, el alojamiento de la demanda del destino y la comida de la inflación local. Actualizá cada rubro por separado en vez de aplicar un porcentaje único a todo.',
    },
  ],

  sources: [
    {
      name: 'Numbeo — Cost of Living por ciudad (referencias de gasto diario)',
      url: 'https://www.numbeo.com/cost-of-living/',
      publisher: 'Numbeo',
    },
    {
      name: 'Cerro Catedral — tarifas oficiales de pases y servicios',
      url: 'https://catedralaltapatagonia.com/tarifas/',
      publisher: 'Catedral Alta Patagonia',
    },
    {
      name: 'Ministerio de Turismo y Deportes — información y estadística turística',
      url: 'https://www.argentina.gob.ar/turismodeportes',
      publisher: 'República Argentina',
    },
    {
      name: 'Assist Card — coberturas y costos de seguro de viaje',
      url: 'https://www.assistcard.com/ar/',
      publisher: 'Assist Card',
    },
  ],

  replaces: [
    '/calculadora-presupuesto-viaje',
    '/calculadora-presupuesto-viaje-vacaciones',
    '/calculadora-presupuesto-viaje-rio-janeiro',
    '/calculadora-presupuesto-viaje-dubai',
    '/calculadora-vacaciones-bariloche-presupuesto-7-dias-familia',
    '/calculadora-noches-hospedaje-costo',
    '/calculadora-alquiler-auto-costo-dias',
    '/calculadora-moneda-local-cambio-pais',
    '/calculadora-dias-ideales-viaje-destino',
    '/calculadora-esqui-pase-cerro-catedral-bariloche-precio-dia',
    '/calculadora-emigrar-espana-presupuesto-primer-ano-familia',
    // Absorbidas en el cierre del catálogo (27-07-2026): ya no existen como calc suelta.
    '/calculadora-presupuesto-viaje-lima-peru',
    '/calculadora-presupuesto-viaje-madrid',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Referencias de costo en destino, en USD — espejo de presupuesto-viaje-rio-janeiro.ts y -dubai.ts.
 *
 * NO incluye el vuelo a propósito: las dos calculadoras originales usaban el mismo
 * estimado de USD 900 para Río y para Dubái, lo que es incorrecto (un tramo regional
 * de 3 h no cuesta lo mismo que uno de 16 h). Acá el pasaje lo carga el usuario en el
 * campo "extras fijos", que es el único dato que puede tener actualizado.
 */
export const CIUDADES: Record<string, { nombre: string; hotel: Record<string, number>; comida: number; transporte: number; actividades: number }> = {
  rio: {
    nombre: 'Río de Janeiro',
    hotel: { bajo: 50, medio: 120, alto: 280 },
    comida: 40,
    transporte: 8,
    actividades: 30,
  },
  dubai: {
    nombre: 'Dubái',
    hotel: { bajo: 100, medio: 250, alto: 600 },
    comida: 80,
    transporte: 15,
    actividades: 60,
  },
};

/** Bariloche en ARS — espejo de vacaciones-bariloche-presupuesto-7-dias-familia.ts */
export const BARILOCHE = {
  hotelNoche: {
    alta: { '3estrellas': 120000, '4estrellas': 220000, '5estrellas': 450000, cabana: 180000 },
    media: { '3estrellas': 85000, '4estrellas': 150000, '5estrellas': 320000, cabana: 130000 },
    baja: { '3estrellas': 60000, '4estrellas': 110000, '5estrellas': 230000, cabana: 95000 },
  } as Record<string, Record<string, number>>,
  comidaPorPersonaDia: { alta: 28000, media: 22000, baja: 18000 } as Record<string, number>,
  excursionesPorPersona: 45000,
};

/** Días ideales por destino y ritmo — espejo de dias-ideales-viaje.ts (min, ideal, max) */
export const DIAS_IDEALES: Record<string, { nombre: string; relajado: number[]; moderado: number[]; intenso: number[] }> = {
  'ciudad-grande': { nombre: 'Ciudad grande', relajado: [4, 6, 9], moderado: [3, 5, 7], intenso: [2, 4, 5] },
  'ciudad-chica': { nombre: 'Ciudad chica', relajado: [2, 3, 5], moderado: [2, 3, 4], intenso: [1, 2, 3] },
  playa: { nombre: 'Playa', relajado: [5, 7, 14], moderado: [4, 6, 10], intenso: [3, 4, 7] },
  montana: { nombre: 'Montaña / naturaleza', relajado: [4, 6, 10], moderado: [3, 5, 8], intenso: [3, 4, 6] },
  'ruta-multiple': { nombre: 'Ruta con varios destinos', relajado: [10, 15, 21], moderado: [7, 12, 18], intenso: [5, 10, 14] },
};
