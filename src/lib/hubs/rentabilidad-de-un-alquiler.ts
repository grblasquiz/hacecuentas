import type { HubData } from './types';

/**
 * Hub de decisión — "Tengo una propiedad: ¿la alquilo, la vendo o alquilo yo?"
 * Punto de vista: EL PROPIETARIO (o quien está por comprar para invertir).
 * La cara del inquilino —depósito, comisión, sueldo mínimo— vive en
 * /alquiler/entrar-a-un-alquiler y no se solapa acá.
 *
 * Los números salen de las fórmulas reales:
 *  - cap rate:   src/lib/formulas/rentabilidad-alquiler-vs-venta.ts
 *  - neto/bruto: src/lib/formulas/rentabilidad-alquiler-inmueble-caba-neto-bruto.ts
 *  - vs vender:  src/lib/formulas/rentabilidad-alquiler.ts
 *  - vs comprar: src/lib/formulas/alquiler-vs-comprar.ts
 *  - vacancia:   src/lib/formulas/costo-mantener-propiedad-vacia-mensual.ts
 *  - valor m²:   src/lib/formulas/precio-m2-zona.ts
 *  - leasing:    src/lib/formulas/alquiler-con-opcion-a-compra-leasing-inmueble.ts
 *
 * Dólar, tasa de plazo fijo e inflación salen siempre de src/data/live/.
 */

const INVESTMENT =
  'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.';

export const hub: HubData = {
  slug: 'vivienda/rentabilidad-de-un-alquiler',
  title: '¿Conviene alquilarla, venderla o alquilar yo? — Rentabilidad de una propiedad',
  description:
    'Calculá cuánto rinde de verdad poner una propiedad en alquiler: cap rate bruto y neto, comparación contra el plazo fijo, costo de tenerla vacía y alquiler con opción a compra.',
  silo: 'Vivienda',
  siloHref: '/vivienda',

  eyebrow: 'Guía y estimación para propietarios',
  h1: 'Tenés una propiedad: veamos cuánto rinde de verdad.',
  lede:
    'Partimos del caso más habitual: ponerla en alquiler y ver el rendimiento neto anual. Si lo que estás evaluando es vender, comprar para vivir o cuánto te cuesta tenerla vacía, cambiá el caso abajo.',
  stamps: ['Actualizado 27-07-2026', 'Dólar y tasa de plazo fijo en vivo', '7 calculadoras adentro'],

  resultLabel: 'Rendimiento neto anual',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'rendir',
        label: 'Quiero saber cuánto rinde ponerla en alquiler',
        hint: 'Cap rate bruto y neto',
        answer: 'El rendimiento que importa es el neto: bruto menos gastos y menos vacancia.',
        yes: [
          'Rendimiento bruto: alquiler anual sobre el valor de la propiedad',
          'Rendimiento neto (cap rate): descuenta expensas, impuestos, mantenimiento y vacancia',
          'Años de repago: cuánto tarda la renta neta en devolverte el precio de compra',
        ],
        warn: [
          INVESTMENT,
          'Un cap rate calculado sin vacancia ni gastos es optimista: la diferencia entre bruto y neto suele ser de dos a tres puntos porcentuales',
          'El alquiler se cobra en pesos y el valor de la propiedad se mide en dólares: el rendimiento se mueve con el tipo de cambio aunque no cambie nada del inmueble',
        ],
        plazo: 'recalculá el rendimiento en cada ajuste del contrato, no una vez al año.',
      },
      {
        id: 'vender',
        label: 'Evalúo venderla y poner la plata a rendir',
        hint: 'Ladrillo vs plazo fijo',
        answer: 'Se compara la renta neta anual del alquiler contra lo que rendiría el capital colocado.',
        yes: [
          'Renta neta anual del alquiler, en pesos',
          'Renta financiera del capital si vendieras y colocaras a plazo fijo',
          'Diferencia en puntos porcentuales entre las dos alternativas',
        ],
        warn: [
          INVESTMENT,
          'La comparación es de flujo del primer año: no incluye la apreciación o desvalorización del inmueble, ni los costos de la venta (comisión, sellos, impuesto a la transferencia)',
          'La tasa de plazo fijo es nominal en pesos: mirá también la tasa real contra la inflación antes de concluir que conviene vender',
        ],
        plazo: 'la decisión se sostiene en años, no en el rendimiento de un mes puntual.',
      },
      {
        id: 'comprar',
        label: 'Estoy decidiendo si alquilar o comprar para vivir',
        hint: 'Cuota vs alquiler',
        answer: 'Se comparan los desembolsos totales del período: alquileres ajustados contra anticipo más cuotas.',
        yes: [
          'Costo total de alquilar durante el horizonte, con ajuste anual',
          'Anticipo más cuotas de un crédito hipotecario a 20 años',
          'Cuota mensual estimada del crédito',
        ],
        warn: [
          INVESTMENT,
          'Comprar deja patrimonio y alquilar no: la comparación de desembolsos no alcanza sola para decidir',
          'Un crédito indexado ajusta la cuota con la inflación; si tu ingreso no la sigue, la relación cuota-ingreso se deteriora',
        ],
        plazo: 'la mayoría de los créditos exige que la cuota no supere el 25-30% del ingreso familiar.',
      },
      {
        id: 'vacia',
        label: 'Quiero saber cuánto me cuesta tenerla vacía',
        hint: 'Costo de vacancia',
        answer: 'Tenerla vacía cuesta los gastos fijos más el alquiler que dejás de cobrar.',
        yes: [
          'Gastos fijos que corren igual: expensas, impuestos, mantenimiento y seguro',
          'Alquiler no percibido: el componente más pesado del costo de vacancia',
          'Impacto de la vacancia sobre el rendimiento neto anual',
        ],
        warn: [
          INVESTMENT,
          'Esperar meses a un inquilino que pague un poco más suele costar más que bajar el precio y llenarla rápido',
          'Una unidad desocupada se deteriora más rápido y varias pólizas encarecen la prima o exigen aviso cuando está vacía',
        ],
        plazo: 'cada mes de vacancia equivale a perder alrededor de ocho por ciento del alquiler anual.',
      },
      {
        id: 'leasing',
        label: 'Me ofrecen alquiler con opción a compra',
        hint: 'Leasing inmobiliario',
        answer: 'Sólo una parte de cada alquiler se descuenta del precio: el resto es alquiler puro.',
        yes: [
          'Total pagado en alquileres durante el período pactado',
          'Parte descontable del precio (habitualmente el 30% de lo pagado)',
          'Cuánto faltaría todavía para ejercer la opción de compra',
        ],
        warn: [
          INVESTMENT,
          'El porcentaje descontable, el precio de ejercicio y el plazo de la opción se pactan libremente: sin esos tres números escritos, la promesa no vale',
          'Si el precio de ejercicio se fija en dólares y vos pagás en pesos, todo el riesgo cambiario queda de tu lado',
        ],
        plazo: 'la opción caduca en la fecha pactada: pasada esa fecha, lo acumulado se pierde.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    {
      id: 'zona',
      label: 'Zona',
      type: 'select',
      value: 'caballito-almagro',
      options: [
        { value: 'puerto-madero', label: 'Puerto Madero' },
        { value: 'palermo-belgrano', label: 'Palermo / Belgrano' },
        { value: 'recoleta-barrio-norte', label: 'Recoleta / Barrio Norte' },
        { value: 'villa-crespo-colegiales', label: 'Villa Crespo / Colegiales' },
        { value: 'caballito-almagro', label: 'Caballito / Almagro' },
        { value: 'flores-floresta', label: 'Flores / Floresta' },
        { value: 'caba-sur', label: 'CABA sur' },
        { value: 'gba-norte', label: 'GBA norte' },
        { value: 'gba-oeste', label: 'GBA oeste' },
        { value: 'cordoba', label: 'Córdoba' },
        { value: 'rosario', label: 'Rosario' },
        { value: 'mendoza', label: 'Mendoza' },
      ],
    },
    { id: 'm2', label: 'Metros cuadrados', type: 'number', min: 10, max: 1000, value: 55 },
    {
      id: 'estado',
      label: 'Estado del inmueble',
      type: 'select',
      value: 'bueno',
      options: [
        { value: 'a-estrenar', label: 'A estrenar' },
        { value: 'excelente', label: 'Excelente' },
        { value: 'bueno', label: 'Bueno' },
        { value: 'regular', label: 'Regular' },
        { value: 'a-reciclar', label: 'A reciclar' },
      ],
    },
    {
      id: 'valorUsd',
      label: 'Valor de la propiedad (dejalo en 0 y lo estimamos por zona)',
      prefix: 'US$',
      value: '0',
      thousands: true,
      help: 'Si lo dejás en 0 usamos el valor de referencia del metro cuadrado de la zona, ajustado por estado.',
    },
    { id: 'alquiler', label: 'Alquiler mensual que cobrás o cobrarías', prefix: '$', value: '650.000', thousands: true },
    {
      id: 'gastos',
      label: 'Gastos mensuales a tu cargo',
      prefix: '$',
      value: '180.000',
      thousands: true,
      help: 'Expensas que absorbés, ABL o inmobiliario prorrateado, mantenimiento y seguro.',
    },
    {
      id: 'mesesVacios',
      label: 'Meses vacíos por año que esperás',
      type: 'number',
      min: 0,
      max: 12,
      step: 0.5,
      value: 1,
    },
    { id: 'apreciacion', label: 'Apreciación anual esperada del inmueble', type: 'number', suffix: '%', value: 2 },
    {
      id: 'tasaCredito',
      label: 'Tasa anual del crédito hipotecario',
      type: 'number',
      suffix: '%',
      value: 8,
      help: 'Sólo se usa en el caso "alquilar o comprar para vivir". Los créditos indexados rondan un dígito de tasa más el ajuste por inflación.',
    },
    { id: 'anios', label: 'Horizonte de la decisión', type: 'number', min: 1, max: 40, suffix: ' años', value: 10 },
  ],
  fineprint: INVESTMENT,

  chart: {
    type: 'scale',
    title: '¿Dónde cae tu rendimiento?',
    caption:
      'El eje es el rendimiento neto anual sobre el valor de la propiedad. El marcador muestra dónde cae el tuyo: por debajo del 3% el ladrillo rinde poco, entre 3% y 5% está en el rango habitual del mercado y por encima del 5% es un buen rendimiento.',
    bands: [
      { label: 'Bajo', from: 0, to: 3, tone: 'bad' },
      { label: 'Normal', from: 3, to: 5, tone: 'warn' },
      { label: 'Bueno', from: 5, to: 8, tone: 'good' },
      { label: 'Muy bueno', from: 8, to: 12, tone: 'good' },
    ],
  },
  breakdownTitle: 'De dónde sale ese rendimiento',
  breakdownIntro: 'Las barras comparan cada concepto con el más grande del cálculo.',

  faq: [
    {
      q: '¿Qué es el cap rate de una propiedad?',
      a: 'Es el ingreso neto anual del alquiler dividido por el valor de la propiedad, expresado en porcentaje. Neto quiere decir después de descontar expensas a cargo del propietario, impuestos, mantenimiento y vacancia. Es la forma estándar de comparar inmuebles entre sí y contra otras inversiones.',
    },
    {
      q: '¿Cuánto rinde hoy un departamento en alquiler?',
      a: 'El rango habitual del mercado argentino está entre el 3% y el 5% neto anual medido en dólares. Por debajo del 3% el alquiler rinde poco frente al valor de venta; por encima del 5% es un rendimiento alto y conviene revisar por qué: suele haber más vacancia, más gasto de mantenimiento o una zona con menor liquidez de venta.',
    },
    {
      q: '¿Cuál es la diferencia entre rentabilidad bruta y neta?',
      a: 'La bruta divide el alquiler anual por el valor de la propiedad sin descontar nada. La neta descuenta los gastos que corren por cuenta del propietario y la vacancia esperada. La brecha entre las dos suele ser de dos a tres puntos porcentuales, así que decidir mirando la bruta es decidir con un número inflado.',
    },
    {
      q: '¿Conviene más alquilar o vender y poner la plata a plazo fijo?',
      a: 'Depende del flujo y de la moneda. El alquiler genera renta en pesos sobre un capital medido en dólares, mientras que el plazo fijo paga una tasa nominal en pesos que hay que comparar contra la inflación para ver la tasa real. Comparar sólo el número nominal contra el cap rate lleva a conclusiones equivocadas.',
    },
    {
      q: '¿Cuánto cuesta tener una propiedad vacía?',
      a: 'Cuesta los gastos fijos que corren igual —expensas completas, impuestos, mantenimiento y seguro— más el alquiler que dejás de cobrar, que casi siempre es el componente más pesado. Un mes de vacancia al año equivale a perder alrededor del ocho por ciento del ingreso anual.',
    },
    {
      q: '¿Cómo estimo el valor de mi propiedad?',
      a: 'Multiplicando los metros cuadrados por el valor de referencia del metro cuadrado de la zona y ajustando por estado: a estrenar suma alrededor de un 18%, excelente un 8%, regular resta un 12% y a reciclar un 25%. Es una referencia de mercado, no una tasación.',
    },
    {
      q: '¿Cómo funciona el alquiler con opción a compra?',
      a: 'Se alquila con un acuerdo escrito de que una porción de cada alquiler —habitualmente el 30%— se descuenta del precio si ejercés la opción dentro del plazo pactado. Lo que no es descontable es alquiler puro y no vuelve. Sin precio de ejercicio, porcentaje y fecha por escrito, la operación no tiene sustento.',
    },
    {
      q: '¿La apreciación del inmueble cuenta como rentabilidad?',
      a: 'Cuenta, pero es otra cosa. El cap rate mide flujo de caja y la apreciación es ganancia de capital que sólo se realiza al vender. Sumarlas da el retorno total esperado, útil para comparar, pero la apreciación es una estimación y el flujo del alquiler es plata que entra todos los meses.',
    },
    {
      q: '¿Qué gastos puedo descontar del alquiler que cobro?',
      a: 'Los que efectivamente pagás como propietario: expensas extraordinarias, ABL o inmobiliario, seguro, mantenimiento, honorarios de administración y la vacancia esperada. Las expensas ordinarias y los servicios los paga el inquilino, así que no entran en tu cuenta salvo que las hayas absorbido por contrato.',
    },
    {
      q: '¿En cuántos años recupero lo que pagué por la propiedad?',
      a: 'Es el valor dividido por el ingreso neto anual. Con un rendimiento neto del 4% el repago con renta pura ronda los 25 años; con 3%, más de 30. Ese número explica por qué la apreciación pesa tanto en la decisión de comprar para alquilar.',
    },
    {
      q: '¿El alquiler temporario rinde más?',
      a: 'Suele rendir más bruto y menos neto de lo que parece: hay que restar comisiones de plataforma, limpieza, reposición, mayor mantenimiento y una vacancia bastante más alta. Compará siempre contra el mismo denominador, el valor de la propiedad, y con los mismos descuentos.',
    },
    {
      q: '¿Qué pasa con el rendimiento cuando se mueve el dólar?',
      a: 'El alquiler está en pesos y el valor de referencia en dólares, así que un salto del tipo de cambio baja el cap rate medido en dólares aunque no cambie nada del inmueble ni del contrato. Por eso conviene recalcular el rendimiento en cada ajuste del alquiler.',
    },
  ],

  sources: [
    {
      name: 'Principales variables monetarias — tasa de plazo fijo y BADLAR',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'Índice de precios al consumidor (IPC)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'Código Civil y Comercial de la Nación — Locación y leasing (arts. 1187 a 1250)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235975/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Relevamiento del mercado inmobiliario y precios por barrio',
      url: 'https://www.estadisticaciudad.gob.ar/eyc/?cat=87',
      publisher: 'Dirección General de Estadística y Censos — CABA',
    },
    {
      name: 'Cotizaciones del dólar',
      url: 'https://dolarapi.com/v1/dolares',
      publisher: 'DolarAPI',
    },
  ],

  replaces: [
    '/calculadora-cap-rate-rentabilidad-alquiler-inmobiliario',
    '/calculadora-rentabilidad-alquiler-inmueble-caba-neto-bruto',
    '/calculadora-rentabilidad-alquiler-vs-venta',
    '/calculadora-alquiler-vs-comprar',
    '/calculadora-costo-mantener-propiedad-vacia-mensual',
    '/calculadora-precio-m2-zona',
    '/calculadora-alquiler-con-opcion-a-compra-leasing-inmueble',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** precio-m2-zona.ts — rango US$/m² por zona (mínimo y máximo). */
export const PRECIO_M2: Record<string, [number, number]> = {
  'puerto-madero': [3000, 4500],
  'palermo-belgrano': [2300, 3000],
  'recoleta-barrio-norte': [2000, 2800],
  'caballito-almagro': [1600, 2200],
  'villa-crespo-colegiales': [1800, 2500],
  'flores-floresta': [1300, 1800],
  'caba-sur': [1000, 1600],
  'gba-norte': [1800, 2500],
  'gba-oeste': [1200, 1600],
  cordoba: [1000, 1500],
  rosario: [1000, 1400],
  mendoza: [900, 1300],
};

/** precio-m2-zona.ts — multiplicador por estado de conservación. */
export const AJUSTE_ESTADO: Record<string, number> = {
  'a-estrenar': 1.18,
  excelente: 1.08,
  bueno: 1,
  regular: 0.88,
  'a-reciclar': 0.75,
};

/** alquiler-vs-comprar.ts — plazo estándar del crédito hipotecario y anticipo. */
export const CREDITO_PLAZO_ANIOS = 20;
export const CREDITO_PIE_PCT = 25;

/** alquiler-con-opcion-a-compra-leasing-inmueble.ts — porción descontable por defecto. */
export const LEASING_PCT_DESCONTABLE = 30;

/** Franjas del gráfico de escala (cap rate neto anual, en %). */
export const ESCALA_MAX = 12;
