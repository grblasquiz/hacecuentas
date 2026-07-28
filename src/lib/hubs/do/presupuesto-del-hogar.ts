import type { HubData } from '../types';
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  SUPERATE_2026,
} from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "¿Me alcanza el sueldo? A dónde se va la plata cada mes."
 *
 * Junta los gastos que sí se pueden calcular con reglas concretas (factura de luz
 * por bloques, combustible por galón, pago mínimo de tarjeta, útiles escolares
 * prorrateados, bonos de Supérate) con los que el usuario carga a mano.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANCE =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

/**
 * Bloques tarifarios residenciales BTS1 (RD$/kWh) y cargo fijo.
 * ⚠️ REFERENCIALES: salen del pliego tarifario de la SIE y del calc vivo
 * (factura-luz-consumo-electrico-republica-dominicana.ts). No pudieron verificarse
 * contra una resolución publicada de la SIE: revisarlos cuando se publique el pliego.
 */
export const LUZ = {
  bloques: [
    { hasta: 100, precio: 5.10 },
    { hasta: 200, precio: 7.85 },
    { hasta: 300, precio: 9.50 },
    { hasta: 700, precio: 11.50 },
    { hasta: null as number | null, precio: 13.20 },
  ],
  cargoFijo: 120,
  umbralItbis: 700,
  itbis: RD.itbis,
};

/**
 * Rendimiento de referencia de un vehículo mediano, en kilómetros por galón.
 * ⚠️ No es un dato oficial: es un supuesto editable en el copy. El combustible en
 * República Dominicana se vende por galón y el MICM publica los precios cada semana.
 */
export const RENDIMIENTO_KM_GALON = 30;

/**
 * Presupuesto anual de regreso a clases por hijo en escuela pública, gama media
 * (útiles + uniformes, ya descontado el kit que entrega el INABIE).
 * ⚠️ Estimación de precios de referencia, no un dato oficial.
 */
export const UTILES_ANUAL_POR_HIJO = 4_250;

/** Bonos de la tarjeta Supérate (ADESS). Bonoluz varía por consumo. */
export const SUPERATE = SUPERATE_2026;

/** Salario mínimo de referencia para medir el gasto (empresa grande, no sectorizado). */
export const SALARIO_MINIMO_REF = RD.salarioMinimo.noSectorizado.grande;

/** Pago mínimo típico de tarjeta: porcentaje del capital que exige el emisor. */
export const PCT_MINIMO_TARJETA = 0.05;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/finanzas/presupuesto-del-hogar',
  title: 'Presupuesto del hogar en República Dominicana: ¿te alcanza el sueldo?',
  description:
    'Calculá a dónde se va tu sueldo en RD$: factura de luz por bloques, gasolina por galón, pago mínimo de tarjeta, útiles escolares y bonos de Supérate, contra tu ingreso mensual.',
  silo: 'Finanzas',
  siloHref: '/do/finanzas',
  locale: 'do',

  eyebrow: 'República Dominicana · presupuesto familiar',
  h1: '¿A dónde se te va el sueldo cada mes?',
  lede:
    'La luz se calcula por bloques y salta cuando pasás los 700 kWh; el combustible se paga por galón; el pago mínimo de la tarjeta apenas roza el capital. Cargá tus números y mirá el margen real que te queda al final del mes.',
  stamps: [
    `Salario mínimo de referencia: ${dop(SALARIO_MINIMO_REF)}`,
    'Luz por bloques + ITBIS sobre 700 kWh',
    '6 calculadoras adentro',
  ],

  resultLabel: 'Margen que te queda al mes',

  cases: {
    title: '¿Cómo es tu hogar?',
    intro:
      'El mismo gasto pesa distinto según cuántos ingresos entran y cuántas bocas hay. Partimos del caso más frecuente.',
    items: [
      {
        id: 'unico',
        label: 'Un solo ingreso en la casa',
        hint: 'Sueldo único',
        answer: 'Con un solo ingreso, la luz y la tarjeta son los dos gastos que más se descontrolan.',
        yes: [
          'Vivienda, alimentos, luz, transporte y la cuota de la tarjeta',
          'La factura de luz sube por bloques: cada tramo se cobra a un precio distinto',
          'Al pasar los ' + LUZ.umbralItbis + ' kWh mensuales se agrega ITBIS sobre toda la factura',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Con un solo ingreso, un imprevisto se paga con tarjeta y ahí empieza la bola de nieve: mirá el plazo real de pago del mínimo',
        ],
        plazo: 'revisá el presupuesto cada vez que cambie la tarifa eléctrica o el precio del combustible.',
      },
      {
        id: 'dos',
        label: 'Dos ingresos en el hogar',
        hint: 'Pareja o convivientes',
        answer: 'Sumá los dos ingresos netos en el primer campo: los gastos son del hogar, no de una persona.',
        yes: [
          'Se suman los dos ingresos netos, después de TSS e ISR',
          'Los gastos fijos se cuentan una sola vez, pero el transporte suele duplicarse',
          'Con dos ingresos el margen para ahorrar es real: definilo antes de gastarlo',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'Ojo con calcular el presupuesto sobre el bruto: lo que cuenta es el neto en mano después de TSS e ISR',
        ],
        plazo: 'acordá quién paga qué y separá el ahorro apenas entra el sueldo, no a fin de mes.',
      },
      {
        id: 'hijos',
        label: 'Tengo hijos en la escuela',
        hint: 'Regreso a clases prorrateado',
        answer: 'El regreso a clases no es un gasto de agosto: prorrateado son varios cientos de pesos por mes.',
        yes: [
          'Útiles, uniformes y calzado escolar, prorrateados a lo largo del año',
          'En la escuela pública el INABIE entrega un kit que reduce bastante el desembolso',
          'En colegios privados hay que sumar inscripción, mensualidad y libros de texto',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'La estimación de útiles es un promedio de precios de referencia, no un dato oficial: ajustala a tu realidad',
          'El colegio privado no está en esta cuenta: agregá la mensualidad en el gasto de vivienda o creá una línea aparte',
        ],
        plazo: 'el año escolar arranca a finales de agosto: guardar por adelantado evita la tarjeta en julio.',
      },
      {
        id: 'superate',
        label: 'Mi hogar recibe bonos de Supérate',
        hint: 'Tarjeta Supérate · ADESS',
        answer: 'Los bonos son ingreso: sumalos antes de decidir si te alcanza.',
        yes: [
          'Aliméntate: ' + dop(SUPERATE.alimentate) + ' al mes por hogar',
          'Bonogás Hogar: ' + dop(SUPERATE.bonogasHogar) + ' al mes para la compra de GLP',
          'Bonoluz: varía según el consumo eléctrico y se descuenta de la factura',
        ],
        warn: [
          DISCLAIMER_FINANCE,
          'El monto de Bonoluz no es fijo: depende de tu consumo y tiene tope por hogar',
          'Los bonos se acreditan en la tarjeta Supérate y sólo se pueden usar en comercios afiliados a la Red de Abasto Social',
        ],
        plazo: 'los pagos siguen el calendario mensual de la ADESS: consultalo antes de contar con la plata.',
      },
    ],
  },

  inputsTitle: 'Tus ingresos y tus gastos del mes',
  inputsIntro: 'Todo en pesos dominicanos. Poné el ingreso NETO, el que te queda después de TSS e ISR.',
  fields: [
    {
      id: 'ingreso',
      label: 'Ingreso neto del hogar (RD$)',
      prefix: 'RD$',
      value: 55000,
      thousands: true,
      help: 'Suma de todos los ingresos netos que entran a la casa cada mes.',
    },
    {
      id: 'vivienda',
      label: 'Alquiler o cuota de la vivienda (RD$)',
      prefix: 'RD$',
      value: 18000,
      thousands: true,
      help: 'Alquiler, cuota hipotecaria o mantenimiento del condominio.',
    },
    {
      id: 'alimentos',
      label: 'Alimentos y supermercado (RD$)',
      prefix: 'RD$',
      value: 18000,
      thousands: true,
      help: 'Compra del mes, incluidos gas de cocina y agua.',
    },
    {
      id: 'consumoKwh',
      label: 'Consumo eléctrico del mes (kWh)',
      type: 'number',
      value: 350,
      min: 0,
      max: 5000,
      step: 10,
      suffix: 'kWh',
      help: 'Figura en tu factura de EDESUR, EDEESTE o EDENORTE.',
    },
    {
      id: 'kmMes',
      label: 'Kilómetros que manejás al mes',
      type: 'number',
      value: 800,
      min: 0,
      max: 10000,
      step: 50,
      suffix: 'km',
      help: 'Ida y vuelta al trabajo más los recorridos del fin de semana.',
    },
    {
      id: 'precioGalon',
      label: 'Precio del galón de combustible (RD$)',
      prefix: 'RD$',
      value: '290',
      thousands: true,
      help: 'El MICM publica los precios cada semana. Editable: cambian todo el tiempo.',
    },
    {
      id: 'saldoTarjeta',
      label: 'Saldo de la tarjeta de crédito (RD$)',
      prefix: 'RD$',
      value: 60000,
      thousands: true,
      help: 'Lo que debés hoy. Dejá 0 si no tenés deuda de tarjeta.',
    },
    {
      id: 'tasaTarjeta',
      label: 'Tasa anual de la tarjeta (%)',
      type: 'number',
      value: 55,
      min: 0,
      max: 120,
      step: 1,
      suffix: '%',
      help: 'En República Dominicana rondan el 50% al 60% anual y no hay tope legal de usura.',
    },
    {
      id: 'hijosEscuela',
      label: 'Hijos en la escuela',
      type: 'number',
      value: 0,
      min: 0,
      max: 12,
      step: 1,
      help: 'Se prorratea el gasto anual de útiles y uniformes de escuela pública.',
    },
  ],
  fineprint: DISCLAIMER_FINANCE,

  chart: {
    type: 'donut',
    title: 'Cómo se reparte tu ingreso',
    caption:
      'Si el trozo de "margen" es chico o inexistente, el problema no está en los gastos chicos: mirá primero vivienda, la factura de luz si superás los 700 kWh y el interés de la tarjeta.',
  },
  breakdownTitle: 'Gasto por gasto',
  breakdownIntro:
    'Los gastos calculados (luz, combustible, tarjeta, escuela) salen de reglas concretas; el resto es lo que cargaste vos. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cómo se calcula la factura de luz en República Dominicana?',
      a: `Por bloques escalonados: los primeros kWh se cobran baratos y el precio sube en cada tramo. Además hay un cargo fijo mensual de comercialización de alrededor de ${dop(LUZ.cargoFijo)}. El salto importante está en los ${LUZ.umbralItbis} kWh: al superarlos se aplica ITBIS del 18% sobre toda la factura, no sólo sobre el excedente. Por eso pasar de 690 a 710 kWh encarece la boleta mucho más de lo que sugiere el consumo extra.`,
    },
    {
      q: '¿Cómo bajo la factura de luz sin dejar de usar el aire?',
      a: 'La palanca más grande es no cruzar el umbral de los 700 kWh, porque ahí entra el ITBIS sobre el total. Después vienen las de siempre: aire acondicionado a 24 grados en vez de 20, mantenimiento de filtros, cambiar iluminación a LED y desconectar los equipos en espera. Medí un mes antes y después: la factura es la única prueba.',
    },
    {
      q: '¿Por qué el combustible se calcula por galón?',
      a: 'Porque en República Dominicana se vende por galón estadounidense, no por litro. Un galón son 3,785 litros. El Ministerio de Industria, Comercio y Mipymes publica los precios cada semana mediante resolución, así que el gasto de transporte cambia mes a mes aunque manejes lo mismo.',
    },
    {
      q: '¿Por qué el pago mínimo de la tarjeta nunca termina de bajar la deuda?',
      a: 'Porque está diseñado para cubrir el interés del mes y apenas una parte chica del capital. Con tasas del 50% al 60% anual, el interés mensual ronda el 4% o 5% del saldo: si tu pago mínimo es 5% del capital más el interés, cada mes bajás muy poco. La cuenta de arriba te dice en cuántos meses saldarías la deuda pagando sólo el mínimo, y suele ser un número incómodo.',
    },
    {
      q: '¿Hay tope legal de intereses de tarjeta en República Dominicana?',
      a: 'No existe una ley de usura que fije un techo para las tarjetas: cada emisor define su tasa. Lo que sí existe es la obligación de informarla y de mostrar en el estado de cuenta cuánto tardarías en saldar la deuda pagando el mínimo, según las normas de la Superintendencia de Bancos. ProUsuario es el canal para reclamar si eso no aparece.',
    },
    {
      q: '¿Cuánto cuesta el regreso a clases?',
      a: `Depende mucho del sector. En la escuela pública el INABIE entrega un kit con mochila, cuadernos, lápices y uniforme oficial, así que la familia sólo complementa: unos ${dop(UTILES_ANUAL_POR_HIJO)} por hijo al año en gama media, que prorrateados son poco más de ${dop(UTILES_ANUAL_POR_HIJO / 12)} por mes. En colegios privados hay que sumar inscripción, mensualidad y libros de texto, que suelen multiplicar esa cifra varias veces.`,
    },
    {
      q: '¿Qué bonos entrega Supérate y cuánto pagan?',
      a: `Aliméntate aporta ${dop(SUPERATE.alimentate)} al mes por hogar para la compra de alimentos, y Bonogás Hogar ${dop(SUPERATE.bonogasHogar)} para el gas de cocina. Bonoluz es distinto: varía según el consumo eléctrico del hogar y se descuenta directamente de la factura, con un tope. Todos se acreditan en la tarjeta Supérate que administra la ADESS y se usan en los comercios de la Red de Abasto Social.`,
    },
    {
      q: '¿Cuánto debería gastar en vivienda?',
      a: 'La regla de referencia más usada es no pasar del 30% del ingreso neto en vivienda. No es una ley, es una guía: por encima de ese porcentaje, cualquier imprevisto obliga a endeudarse porque no queda colchón. En zonas urbanas dominicanas es habitual superarlo, y por eso conviene compensar con transporte y servicios más ajustados.',
    },
    {
      q: '¿Cuánto es el costo de vida en República Dominicana?',
      a: `No hay una cifra oficial: la Oficina Nacional de Estadística publica el IPC, que mide la variación de precios, no una canasta cerrada en pesos. Por eso esta cuenta parte de tus gastos reales y los compara con una referencia útil: cuántos salarios mínimos representan. Con el mínimo del sector privado no sectorizado en ${dop(SALARIO_MINIMO_REF)}, un hogar que gasta el doble de eso necesita dos ingresos formales completos.`,
    },
    {
      q: '¿Cuánto debería poder ahorrar por mes?',
      a: 'La referencia clásica es 20% del ingreso neto, pero antes de eso está la prioridad real: un fondo de emergencia de tres a seis meses de gastos fijos. Si hoy no llegás a nada de eso, empezá por el margen que arroja esta cuenta y automatizá la transferencia el mismo día que cobrás. Lo que queda a fin de mes rara vez se ahorra.',
    },
    {
      q: '¿Conviene pagar la tarjeta o ahorrar primero?',
      a: 'Con las tasas de tarjeta dominicanas, casi siempre conviene pagar la deuda: un certificado financiero rinde una fracción de lo que te cobra la tarjeta, y el interés ahorrado es rendimiento garantizado y libre de impuesto. La excepción es mantener un colchón mínimo de emergencia para no volver a endeudarte al primer imprevisto.',
    },
  ],

  sources: [
    {
      name: 'Superintendencia de Electricidad — pliego tarifario residencial',
      url: 'https://sie.gob.do/',
      publisher: 'SIE',
    },
    {
      name: 'MICM — precios semanales de los combustibles',
      url: 'https://micm.gob.do/direcciones/hidrocarburos/precios-de-combustibles',
      publisher: 'Ministerio de Industria, Comercio y Mipymes',
    },
    {
      name: 'Supérate / ADESS — bonos y calendario de pagos',
      url: 'https://superate.gob.do/',
      publisher: 'Supérate',
    },
    {
      name: 'ProUsuario — Superintendencia de Bancos, derechos del usuario financiero',
      url: 'https://prousuario.gob.do/',
      publisher: 'Superintendencia de Bancos',
    },
    {
      name: 'ONE — Índice de Precios al Consumidor',
      url: 'https://www.one.gob.do/',
      publisher: 'Oficina Nacional de Estadística',
    },
    {
      name: 'INABIE — kit escolar y uniformes',
      url: 'https://inabie.gob.do/',
      publisher: 'INABIE',
    },
  ],

  replaces: [
    '/do/calculadora-costo-vida-republica-dominicana',
    '/do/calculadora-factura-luz-consumo-electrico-republica-dominicana',
    '/do/calculadora-presupuesto-utiles-escolares-republica-dominicana',
    '/do/calculadora-bonos-superate-alimentate-monto-republica-dominicana',
    '/do/calculadora-gasto-gasolina-viaje-republica-dominicana',
    '/do/calculadora-tarjeta-credito-pago-minimo-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
