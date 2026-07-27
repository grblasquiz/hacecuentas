import type { HubData } from './types';
import { NAFTA_NACIONAL, NAFTA_POR_PROVINCIA, NAFTA_META } from '../data/nafta-precios';

/**
 * Hub de decisión — "¿Cuánto consume mi auto?"
 *
 * OJO, no confundir con el hub hermano `auto/nafta-y-peajes`, que responde
 * "¿cuánto me sale ESTE viaje?" (distancia + peajes + pasajeros). Este hub
 * responde otra pregunta: la EFICIENCIA y la AUTONOMÍA de MI auto —
 * cuántos litros cada 100 km rinde de verdad, cuántos km hago con el tanque
 * lleno, cuánto me cuesta cada kilómetro y cuánto se lleva el aire.
 * Los `replaces` de los dos hubs son disjuntos a propósito.
 *
 * Arquetipo: CÁLCULO DOMINANTE (la medición de consumo real entre dos cargas
 * se lleva el cluster), así que no usa `cases`: la respuesta va en `answer`.
 *
 * PRECIO DEL LITRO: no se hardcodea. Sale de `src/lib/data/nafta-precios.ts`,
 * el snapshot oficial de la Secretaría de Energía (Res. 314/2016) que también
 * alimenta /precio-nafta-hoy y el hub de nafta y peajes. No hay dato de
 * combustible en `src/data/live/` (ahí viven dólar, inflación y países).
 *
 * FORMATO: el hub mezcla magnitudes, así que TODA fila lleva `format` explícito
 * (el default del contrato es 'ars' y una fila sin `format` propio se imprime
 * en pesos). Litros y km van en 'unit', el consumo en 'unit' con decimales,
 * y solo las filas de plata quedan en 'ars'.
 */

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
  slug: 'auto/consumo',
  title: '¿Cuánto consume mi auto? Calculadora de consumo real y autonomía',
  description:
    'Medí el consumo real de tu auto en L/100 km y km/L con los litros que cargaste y los kilómetros que hiciste. Además: cuántos km hacés con el tanque lleno, cuánto sale llenarlo con el precio oficial de tu provincia, el costo por kilómetro y cuánta nafta extra se lleva el aire acondicionado.',
  silo: 'Auto',
  siloHref: '/auto',

  eyebrow: 'Eficiencia y autonomía de tu auto',
  h1: '¿Cuánto consume mi auto?',
  lede:
    'Anotá los kilómetros que hiciste entre dos cargas y los litros que pusiste: con eso sale tu consumo real en L/100 km y en km/L, que casi nunca coincide con el que promete el folleto. Con la capacidad del tanque te decimos cuántos kilómetros hacés con el tanque lleno, cuánto te sale llenarlo y cuánto te cuesta cada kilómetro.',
  stamps: [
    'Consumo medido, no el de fábrica',
    `${COMBUSTIBLE_DEFAULT} $${precioDefault.toLocaleString('es-AR')}/L en ${PROVINCIA_DEFAULT} (${mesLabel})`,
    'Precios oficiales de Secretaría de Energía',
    '7 calculadoras adentro',
  ],

  resultLabel: 'Lo que consume tu auto',

  inputsTitle: 'Contame tu última carga',
  inputsIntro:
    'El método del tanque lleno: llenás, ponés el cuentakilómetros parcial en cero, manejás normal y en la próxima carga anotás los km y los litros. Con esos dos números ya tenés el consumo real.',
  fields: [
    {
      id: 'km',
      label: 'Kilómetros recorridos entre cargas',
      type: 'number',
      suffix: 'km',
      min: 1,
      step: 1,
      value: 420,
      help: 'Usá el cuentakilómetros parcial puesto en cero al llenar. Cuantos más km, más confiable la medición.',
    },
    {
      id: 'litros',
      label: 'Litros que cargaste para volver a llenarlo',
      type: 'number',
      suffix: 'L',
      min: 0.5,
      step: 0.1,
      value: 36,
      help: 'Los litros del ticket de la última carga, con el mismo criterio de corte del surtidor que la vez anterior.',
    },
    {
      id: 'tanque',
      label: 'Capacidad del tanque',
      type: 'number',
      suffix: 'L',
      min: 10,
      max: 200,
      step: 1,
      value: 50,
      help: 'Un auto chico anda en 40–45 L, un mediano en 50–55 L, una pick-up en 70–80 L. Está en el manual.',
    },
    {
      id: 'reserva',
      label: 'Margen de reserva que querés dejar',
      type: 'number',
      suffix: '% del tanque',
      min: 0,
      max: 40,
      step: 1,
      value: 10,
      help: 'La autonomía útil es la que podés usar sin llegar en falso. Con 10% dejás margen para buscar estación.',
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
      help: 'El precio sale del relevamiento oficial de surtidores. Entre provincias hay diferencias de más del 50%.',
    },
    {
      id: 'precioManual',
      label: 'Precio del litro en tu estación (opcional)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 para usar el promedio oficial de tu provincia. Si tenés el ticket, poné el precio exacto.',
    },
    {
      id: 'horasAire',
      label: 'Horas de aire acondicionado por día',
      type: 'number',
      suffix: 'h',
      min: 0,
      max: 12,
      step: 0.5,
      value: 1,
      help: 'Poné 0 en invierno. El compresor suma alrededor de 12% sobre el consumo base en ciudad.',
    },
    {
      id: 'kmMes',
      label: 'Kilómetros que hacés por mes',
      type: 'number',
      suffix: 'km',
      min: 0,
      step: 10,
      value: 1000,
      help: 'Para pasar el costo por km a gasto mensual de combustible.',
    },
    {
      id: 'sueldo',
      label: 'Tu sueldo de bolsillo (opcional)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Si lo cargás, te decimos cuántos litros y cuántos kilómetros comprás con un sueldo. Dejalo en 0 para saltearlo.',
    },
  ],
  fineprint:
    'Es una estimación basada en tu propia medición. El consumo real cambia con la carga, la presión de los neumáticos, el tránsito, el viento y la velocidad, así que lo ideal es promediar tres o cuatro cargas seguidas.',

  chart: {
    type: 'scale',
    title: 'Dónde cae tu consumo',
    caption:
      'La barra va de 0 a 20 L/100 km y el marcador muestra tu consumo medido. Menos es mejor: por debajo de 7 L/100 km el auto es muy eficiente y por encima de 16 hay algo que revisar.',
    bands: [
      { label: 'Muy eficiente', from: 0, to: 7, tone: 'good' },
      { label: 'Eficiente', from: 7, to: 10, tone: 'good' },
      { label: 'Promedio', from: 10, to: 13, tone: 'neutral' },
      { label: 'Alto', from: 13, to: 16, tone: 'warn' },
      { label: 'Muy alto', from: 16, to: 20, tone: 'bad' },
    ],
  },
  breakdownTitle: 'Tu auto, número por número',
  breakdownIntro: 'Consumo, autonomía y lo que cuesta cada kilómetro con el precio del combustible que elegiste.',

  answer: {
    title: 'Cómo se mide bien el consumo',
    copy:
      'El único consumo que sirve es el que medís vos: litros ÷ kilómetros × 100. El de la ficha técnica se saca en un ciclo de laboratorio y en la calle casi siempre queda 15–25% por debajo de la realidad. Dos cargas y una cuenta y ya sabés cuánto gasta tu auto de verdad.',
    yes: [
      'Consumo real en L/100 km y su equivalente en km/L (y en MPG, si comparás con datos de afuera)',
      'Autonomía con el tanque lleno y autonomía útil, dejando el margen de reserva que elijas',
      'Cuánto sale llenar el tanque con el precio oficial de tu provincia o el de tu ticket',
      'Costo por kilómetro y gasto mensual de combustible según los km que hagas',
      'Litros extra que se lleva el aire acondicionado y cuánto es eso al mes',
      'Cuántos litros y cuántos kilómetros comprás con un sueldo, como termómetro de poder de compra',
    ],
    warn: [
      'Medir con una sola carga da un número ruidoso: el corte del surtidor varía. Promediá tres o cuatro cargas.',
      'Ciudad y ruta son mundos distintos: el mismo auto puede hacer 12 L/100 km en el centro y 6,5 en autopista.',
      'La autonomía del tanque es teórica: la luz de reserva se enciende bastante antes de que el tanque esté vacío.',
      'La nafta premium tiene más octanaje, no más energía por litro: no baja el consumo salvo que el motor la exija.',
      'Si el consumo se disparó de golpe, mirá presión de neumáticos, filtro de aire, bujías y sensor de oxígeno antes de culpar a la nafta.',
    ],
    plazo:
      'medí siempre en la misma estación y con el mismo surtidor si podés: es la forma más simple de sacarle ruido a la medición.',
  },

  faq: [
    {
      q: '¿Cómo se calcula el consumo de nafta en L/100 km?',
      a: 'Dividí los litros que cargaste por los kilómetros que hiciste con esa carga y multiplicá por 100. Si hiciste 420 km y cargaste 36 litros: 36 ÷ 420 × 100 = 8,6 L/100 km. Es la medida que usan las fichas técnicas en Argentina y Europa.',
    },
    {
      q: '¿Cómo paso de L/100 km a km por litro?',
      a: 'Son inversos: km/L = 100 ÷ (L/100 km). Un auto de 8,6 L/100 km hace 11,6 km/L. Al revés funciona igual: si sabés que hacés 12 km/L, tu consumo es 100 ÷ 12 = 8,3 L/100 km.',
    },
    {
      q: '¿Cuál es un consumo normal para un auto?',
      a: 'Un auto chico naftero anda entre 6 y 8 L/100 km, un mediano entre 8 y 10, una SUV entre 11 y 13 y una pick-up puede pasar los 14. Por debajo de 7 estás muy bien y por encima de 16 conviene revisar el auto o los hábitos de manejo.',
    },
    {
      q: '¿Cuántos kilómetros hago con el tanque lleno?',
      a: 'Autonomía = capacidad del tanque ÷ consumo × 100. Con un tanque de 50 litros y 8,6 L/100 km hacés unos 581 km teóricos. En la práctica conviene descontar un 10% de margen: quedan unos 523 km reales antes de tener que buscar estación.',
    },
    {
      q: '¿Cuánto sale llenar el tanque?',
      a: 'Capacidad del tanque por precio del litro. El precio que usamos sale del relevamiento oficial de la Secretaría de Energía por provincia y tipo de combustible, así que se actualiza solo. Si tenés el ticket de tu estación, cargá ese precio y el número es exacto.',
    },
    {
      q: '¿Cuánto consume de más el aire acondicionado?',
      a: 'El compresor agrega alrededor de un 12% sobre el consumo base en manejo urbano. En litros por hora eso son unos 0,3 L/h en un auto de 12 km/L: con una hora por día son cerca de 9 litros al mes. A más de 60 km/h el aire conviene más que bajar las ventanillas, porque la resistencia aerodinámica pesa más que el compresor.',
    },
    {
      q: '¿Por qué mi consumo real no coincide con el de la ficha técnica?',
      a: 'Porque el de fábrica se mide en un ciclo homologado de laboratorio, con temperatura controlada, sin aire acondicionado, sin carga y con una conducción suavísima. En uso real es normal quedar 15–25% por encima, y más todavía si manejás solo en ciudad.',
    },
    {
      q: '¿Cómo se calcula el costo por kilómetro?',
      a: 'Consumo ÷ 100 × precio del litro. Con 8,6 L/100 km y el litro a $1.503, cada kilómetro te cuesta unos $129 solo de combustible. Multiplicalo por los kilómetros del mes y tenés el gasto mensual; no incluye cubiertas, service ni seguro.',
    },
    {
      q: '¿Conviene cargar premium para gastar menos?',
      a: 'En general no. La premium tiene más octanaje, que evita la detonación en motores de alta compresión, pero la energía por litro es prácticamente la misma que la de la súper. Si el fabricante no la exige, pagás entre 12% y 18% más por una mejora de rendimiento que casi nunca compensa.',
    },
    {
      q: '¿Cuántos litros de nafta compro con mi sueldo?',
      a: 'Dividí tu sueldo de bolsillo por el precio del litro. Es un termómetro directo de poder de compra: con el consumo real de tu auto también sale cuántos kilómetros podrías hacer con un sueldo entero, que es el número que de verdad se siente.',
    },
    {
      q: '¿Qué puedo hacer para bajar el consumo?',
      a: 'Presión correcta de neumáticos (la mala presión sola puede costar 3%), sacar peso muerto del baúl, quitar la parrilla de techo cuando no la usás, mantener velocidad pareja y no pasar de 110–120 km/h en ruta, y hacer el service en fecha. El filtro de aire sucio y las bujías gastadas son los sospechosos clásicos de un consumo que se disparó.',
    },
    {
      q: '¿El gasoil se mide igual que la nafta?',
      a: 'Sí, exactamente igual: litros ÷ km × 100. Los motores diésel suelen dar entre 20% y 30% menos de consumo que un naftero equivalente, aunque el gasoil común hoy está casi al mismo precio que la súper, así que la ventaja real es menor que la de hace unos años.',
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
      name: 'Factors that affect fuel economy — efecto del aire acondicionado, la velocidad y el peso',
      url: 'https://www.fueleconomy.gov/feg/factors.jsp',
      publisher: 'U.S. Department of Energy / EPA',
    },
    {
      name: 'Fuel economy tips: presión de neumáticos, peso y accesorios de techo',
      url: 'https://www.fueleconomy.gov/feg/drivehabits.jsp',
      publisher: 'U.S. Department of Energy / EPA',
    },
    {
      name: 'Ciclo WLTP de homologación de consumo y su diferencia con el uso real',
      url: 'https://www.acea.auto/fact/what-is-wltp-and-how-does-it-work/',
      publisher: 'ACEA — Asociación Europea de Fabricantes de Automóviles',
    },
    {
      name: 'Precios de combustibles YPF por estación',
      url: 'https://www.ypf.com/productosyservicios/Paginas/precios-de-combustibles.aspx',
      publisher: 'YPF',
    },
  ],

  replaces: [
    '/calculadora-consumo-nafta-litros-100km',
    '/calculadora-autonomia-tanque-combustible',
    '/calculadora-consumo-combustible-km-litro',
    '/calculadora-autonomia-tanque-lleno-kilometros',
    '/calculadora-consumo-aire-acondicionado-auto-extra',
    '/calculadora-litros-nafta-por-salario-poder-compra',
    '/calculadora-llenar-tanque-nafta-argentina-costo',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};
