import type { HubData } from './types';
import { NAFTA_NACIONAL, NAFTA_POR_PROVINCIA, NAFTA_META } from '../data/nafta-precios';

/**
 * Hub de decisión — "¿Cuánta nafta y peaje gasto en este viaje?"
 * Arquetipo: CÁLCULO DOMINANTE (calculadora-combustible-viaje-auto se lleva casi
 * todo el tráfico del cluster), así que NO usa `cases`: la respuesta va en `answer`.
 *
 * Absorbe 8 calculadoras: combustible de viaje, litros de nafta, costo por km,
 * peajes por ruta, peajes Ruta 2 / Ruta 3, peaje Buenos Aires–La Plata,
 * velocidad promedio de trayecto y nafta mensual del commute.
 *
 * PRECIO DEL COMBUSTIBLE: NO se hardcodea. Sale de `src/lib/data/nafta-precios.ts`,
 * el mismo snapshot oficial (Secretaría de Energía, Res. 314/2016) que alimenta
 * /precio-nafta-hoy. Cuando corre `scripts/fetch-nafta-precios.py`, este hub se
 * actualiza solo.
 *
 * FORMATO DEL DESGLOSE: el contrato de `HubRow` ya soporta `format`/`unit`/
 * `decimals` por fila, así que el desglose mezcla pesos con magnitudes:
 * combustible, peajes, desgaste, otros gastos y costo por persona van en `ars`
 * (default del hub); litros van en `unit` "L" y las horas al volante en `unit`
 * "h", ambos con 1 decimal. Nada de esto necesita tocar DecisionHub.astro.
 *
 * TELEPASE: el descuento es 10% (factor 0,9), el vigente en AUBASA y Corredores
 * Viales. La calculadora vieja `costo-peaje-ruta` usaba 15% (0,85), un valor ya
 * desactualizado: el hub NO lo replica a propósito.
 */

/** Precio de referencia del litro, por provincia y tipo de combustible. */
export const PRECIOS_PROVINCIA = NAFTA_POR_PROVINCIA;
export const PRECIOS_NACIONAL = NAFTA_NACIONAL;
export const PRECIOS_META = NAFTA_META;

const PROVINCIA_DEFAULT = 'Buenos Aires';
const COMBUSTIBLE_DEFAULT = 'Nafta Súper';

const precioDefault =
  (NAFTA_POR_PROVINCIA[PROVINCIA_DEFAULT] || NAFTA_NACIONAL)[COMBUSTIBLE_DEFAULT] ??
  NAFTA_NACIONAL[COMBUSTIBLE_DEFAULT] ??
  0;

const mesLabel = (() => {
  const [y, m] = String(NAFTA_META.mes).split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${meses[Number(m) - 1] || m}-${y}`;
})();

export const hub: HubData = {
  slug: 'auto/nafta-y-peajes',
  title: 'Costo de viaje en auto: nafta, consumo y peajes',
  description:
    'Calculá el costo real de tu viaje en auto: litros de nafta o gasoil con el precio oficial de tu provincia, peajes con y sin Telepase, desgaste del auto y cuánto le toca a cada pasajero. Sirve también para el gasto mensual de ir al trabajo.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Guía y estimación de viaje en auto',
  h1: '¿Cuánta nafta y peaje gasto en este viaje?',
  lede:
    'Poné los kilómetros, el consumo de tu auto y las cabinas de peaje del camino: te decimos cuántos litros vas a quemar, cuánta plata es con el precio oficial del combustible en tu provincia y cuánto sale el viaje por cabeza. Si es tu viaje de todos los días al trabajo, poné los viajes del mes y sale el gasto mensual.',
  stamps: [
    'Actualizado 07-08-2026',
    `${COMBUSTIBLE_DEFAULT} $${precioDefault.toLocaleString('es-AR')}/L en ${PROVINCIA_DEFAULT} (${mesLabel})`,
    'Precios oficiales de Secretaría de Energía',
    '8 calculadoras adentro',
  ],

  resultLabel: 'Lo que sale el viaje',

  inputsTitle: 'Contame el viaje',
  inputsIntro:
    'Con la distancia y el consumo ya sale el número. Los peajes, el desgaste y los pasajeros lo afinan.',
  fields: [
    { id: 'distancia', label: 'Distancia (solo ida)', type: 'number', suffix: 'km', min: 1, step: 1, value: 400 },
    {
      id: 'sentido',
      label: '¿Volvés por el mismo camino?',
      type: 'select',
      value: 'ida-vuelta',
      options: [
        { value: 'ida-vuelta', label: 'Ida y vuelta' },
        { value: 'ida', label: 'Solo ida' },
      ],
    },
    {
      id: 'consumo',
      label: 'Consumo de tu auto',
      type: 'number',
      suffix: 'L / 100 km',
      min: 1,
      max: 40,
      step: 0.1,
      value: 8.5,
      help: 'Un auto chico nafta anda en 6–7, un mediano en 8–9, una SUV en 11–13. En ruta gastás menos que en ciudad.',
    },
    {
      id: 'combustible',
      label: 'Qué cargás',
      type: 'select',
      value: COMBUSTIBLE_DEFAULT,
      options: [
        { value: 'Nafta Súper', label: 'Nafta súper' },
        { value: 'Nafta Premium', label: 'Nafta premium (V-Power, Infinia)' },
        { value: 'Gasoil', label: 'Gasoil común' },
        { value: 'Gasoil Premium', label: 'Gasoil premium (Infinia Diesel, V-Power Diesel)' },
      ],
    },
    {
      id: 'provincia',
      label: 'Dónde cargás',
      type: 'select',
      value: PROVINCIA_DEFAULT,
      options: [
        { value: 'nacional', label: 'Promedio nacional' },
        ...Object.keys(NAFTA_POR_PROVINCIA).map((p) => ({ value: p, label: p })),
      ],
      help: 'El precio sale del relevamiento oficial de surtidores, que cambia bastante entre provincias.',
    },
    {
      id: 'cabinas',
      label: 'Cabinas de peaje en el camino (solo ida)',
      type: 'number',
      min: 0,
      max: 40,
      step: 1,
      value: 3,
      help: 'Buenos Aires–Mar del Plata por la Autovía 2 son 3; Buenos Aires–Córdoba por la RN 9, alrededor de 7.',
    },
    {
      id: 'precioCabina',
      label: 'Precio promedio por cabina',
      prefix: '$',
      value: '6.100',
      thousands: true,
      help: 'Tarifa auto categoría 2, pago manual. En la Autovía 2 (AUBASA) las cabinas van de $4.400 a $7.000.',
    },
    {
      id: 'telepase',
      label: '¿Pagás con Telepase?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí (10% de descuento)' },
        { value: 'no', label: 'No, pago manual' },
      ],
    },
    { id: 'pasajeros', label: 'Cuántos van en el auto', type: 'number', min: 1, max: 9, step: 1, value: 2 },
    {
      id: 'desgaste',
      label: 'Desgaste del auto por km',
      prefix: '$',
      suffix: 'por km',
      type: 'number',
      min: 0,
      max: 2000,
      step: 5,
      value: 60,
      help: 'Cubiertas, aceite, filtros y service prorrateados. Poné 0 si sólo querés nafta y peaje.',
    },
    {
      id: 'extras',
      label: 'Otros gastos del viaje',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Estacionamiento, comidas en la ruta, alojamiento. Se suman tal cual al total.',
    },
    {
      id: 'velocidad',
      label: 'Velocidad promedio esperada',
      type: 'number',
      suffix: 'km/h',
      min: 5,
      max: 130,
      step: 1,
      value: 95,
      help: 'En ruta rondás 90–100 km/h con paradas. En ciudad, 18–25 km/h en hora pico.',
    },
    {
      id: 'viajesMes',
      label: 'Cuántas veces hacés este viaje por mes',
      type: 'number',
      min: 1,
      max: 60,
      step: 1,
      value: 1,
      help: 'Dejá 1 para un viaje suelto. Poné 22 si es tu viaje diario al trabajo y sale el gasto mensual.',
    },
  ],
  fineprint:
    'Es una estimación. El consumo real cambia con la carga, el aire acondicionado, el viento y la velocidad, y las tarifas de peaje se actualizan varias veces al año.',

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del viaje',
    caption:
      'Cada porción es un rubro del costo: combustible, peajes y el desgaste del auto. En viajes cortos con muchas cabinas el peaje puede pesar más que la nafta.',
  },
  breakdownTitle: 'Desglose del viaje',
  breakdownIntro: 'Las barras comparan cada rubro con el más caro del viaje.',

  answer: {
    title: 'Qué mirar antes de salir',
    copy:
      'El combustible es la parte grande y previsible: litros = km ÷ 100 × consumo. Lo que suele desarmar el presupuesto son los peajes (que se actualizan sin aviso) y el desgaste, que no se paga ese día pero se paga.',
    yes: [
      'Litros del viaje: distancia efectiva ÷ 100 × consumo en L/100 km',
      'Costo del combustible con el precio oficial de tu provincia, no con un promedio inventado',
      'Peajes de ida y de vuelta, con el 10% de descuento de Telepase si lo usás',
      'Desgaste estimado del auto por kilómetro (cubiertas, aceite, service)',
      'Costo por pasajero, para dividir sin discutir',
      'Horas al volante según la velocidad promedio que esperás',
      'Gasto mensual si repetís el viaje (commute al trabajo)',
    ],
    warn: [
      'El precio del litro varía hasta 50% entre provincias: en Tierra del Fuego la súper está muy por debajo del promedio nacional y en Catamarca muy por encima',
      'La premium rinde apenas más pero cuesta bastante más: en un viaje largo casi nunca compensa salvo que el auto la pida por compresión',
      'Las tarifas de peaje se actualizan por resolución varias veces al año; el número por cabina envejece rápido',
      'El aire acondicionado y andar a 130 en vez de 110 pueden sumar 15–20% de consumo',
      'Si el auto es de la empresa o alquilado, el desgaste no lo pagás vos: poné 0 en ese campo',
    ],
    plazo:
      'cargá antes de salir de la ciudad: en las estaciones de ruta el litro suele estar por encima del promedio provincial.',
  },

  faq: [
    {
      q: '¿Cómo calculo cuántos litros de nafta necesito para un viaje?',
      a: 'Dividí los kilómetros por 100 y multiplicalo por el consumo de tu auto en L/100 km. Para 400 km con un auto que hace 8,5 L/100 km son 34 litros solo de ida, 68 litros ida y vuelta. Después multiplicás por el precio del litro y tenés la plata.',
    },
    {
      q: '¿Cuánto combustible gasto en un viaje en auto y cuánto me sale por km?',
      a: `El combustible para un viaje en auto sale de una sola cuenta: litros = kilómetros ÷ 100 × consumo, y plata = litros × precio del litro. El costo por km es el consumo dividido 100 por ese mismo precio: un auto de 8,5 L/100 km con la súper a $${precioDefault.toLocaleString('es-AR')} en ${PROVINCIA_DEFAULT} (dato oficial de ${mesLabel}) gasta ${(precioDefault * 0.085).toLocaleString('es-AR', { maximumFractionDigits: 0 })} pesos por kilómetro solo de nafta. A eso el hub le suma peajes, desgaste y otros gastos, y te lo divide por pasajero.`,
    },
    {
      q: '¿De dónde sale el precio del litro que usa la calculadora?',
      a: 'Del relevamiento oficial de precios en surtidor de la Secretaría de Energía (Resolución 314/2016), que las estaciones YPF, Shell, Axion y Puma están obligadas a declarar. Tomamos el promedio diurno del mes vigente para la provincia que elijas, así que se actualiza solo cuando se actualiza el dato oficial.',
    },
    {
      q: '¿Cuánto cuestan los peajes de Buenos Aires a Mar del Plata?',
      a: 'La Autovía 2 la opera AUBASA y tiene tres cabinas principales (Hudson, Samborombón y Maipú). Con tarifa de auto categoría 2 y pago manual el corredor completo ronda los $18.400 de ida a comienzos de 2026, y con Telepase pagás alrededor de 10% menos.',
    },
    {
      q: '¿Conviene el Telepase?',
      a: 'Si pasás cabinas seguido, sí: el descuento es del orden del 10% sobre la tarifa manual en los corredores de AUBASA y Corredores Viales, además de que no frenás. En un viaje largo con 3 o 4 cabinas ida y vuelta el ahorro ya paga el abono del dispositivo.',
    },
    {
      q: '¿Cuánto sale el peaje de la Autopista Buenos Aires–La Plata?',
      a: 'Es una sola estación troncal en el corredor y en 2026 la tarifa de auto ronda los $600 por paso en horario normal, con recargo en hora pico y tarifa reducida de noche. Con Telepase se aplica el mismo 10% de descuento.',
    },
    {
      q: '¿Cuánto gasto de nafta por mes yendo al trabajo?',
      a: 'Multiplicá los km de ida por 2, por los días que vas por semana y por 4,33 semanas: eso te da los km del mes. Con 20 km de ida, 5 días por semana, son unos 866 km mensuales; a 8,5 L/100 km son 74 litros. En el hub poné los viajes por mes y te lo calcula directo.',
    },
    {
      q: '¿Qué velocidad promedio conviene usar para estimar el tiempo?',
      a: 'En ruta con paradas de carga y baño, 90–100 km/h reales aunque manejes a 120. En ciudad el promedio de hora pico en el AMBA está entre 18 y 25 km/h. Dividí los kilómetros por esa velocidad y tenés las horas al volante.',
    },
    {
      q: '¿El desgaste del auto hay que contarlo?',
      a: 'Si el auto es tuyo, sí: cubiertas, aceite, filtros, pastillas y el service prorrateado se pagan en kilómetros, no en meses. Ponerle un valor por km hace visible ese costo que el ticket de la estación no muestra. Si el auto es alquilado o de la empresa, poné 0.',
    },
    {
      q: '¿Conviene cargar premium para un viaje largo?',
      a: 'En la mayoría de los autos no. La premium tiene más octanaje, no más energía por litro: la mejora de rendimiento es de pocos puntos porcentuales y la diferencia de precio con la súper ronda el 15%. Sólo conviene si el fabricante exige alto octanaje.',
    },
    {
      q: '¿Cómo se divide el gasto entre los que viajan?',
      a: 'Lo más limpio es dividir combustible más peajes entre todos los que van, incluido el que maneja, y dejar el desgaste del auto a cargo del dueño. El hub te muestra el costo por persona con el total ya armado.',
    },
  ],

  sources: [
    {
      name: 'Precios en surtidor — relevamiento oficial de estaciones de servicio (Res. 314/2016)',
      url: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',
      publisher: 'Secretaría de Energía de la Nación',
      date: NAFTA_META.actualizado,
    },
    {
      name: 'Precios de combustibles YPF por estación',
      url: 'https://www.ypf.com/productosyservicios/Paginas/precios-de-combustibles.aspx',
      publisher: 'YPF',
    },
    {
      name: 'Precios de combustibles Shell / Raízen',
      url: 'https://www.shell.com.ar/automovilistas/combustibles-shell.html',
      publisher: 'Shell Argentina',
    },
    {
      name: 'Cuadro tarifario de peajes de la Autovía 2 y la Autopista Buenos Aires–La Plata',
      url: 'https://aubasa.com.ar/tarifas/',
      publisher: 'AUBASA — Autopistas de Buenos Aires S.A.',
    },
    {
      name: 'Cuadro tarifario de peajes de los corredores viales nacionales (Ruta 3, RN 9, RN 7)',
      url: 'https://cvsa.com.ar/tarifas/',
      publisher: 'Corredores Viales S.A.',
    },
    {
      name: 'Tarifas de peaje de los accesos Norte y Oeste',
      url: 'https://www.ausol.com.ar/tarifas',
      publisher: 'Autopistas del Sol',
    },
  ],

  replaces: [
    '/calculadora-combustible-viaje-auto',
    '/calculadora-costo-peaje-ruta',
    '/calculadora-litros-nafta-viaje-ruta-argentina',
    '/calculadora-autovia-peajes-argentina-ruta-2-ruta-3',
    '/calculadora-costo-viaje-combustible-kilometros',
    '/calculadora-peaje-autopista-baires-la-plata-costo',
    '/calculadora-velocidad-promedio-trayecto-ciudad',
    '/calculadora-nafta-mensual-commute',
  ],

  lastReviewed: '2026-08-07',
  audience: 'AR',
};
