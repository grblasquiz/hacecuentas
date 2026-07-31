import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto crece mi plata con interés compuesto?"
 * Arquetipo: RAMIFICADO. La pregunta de fondo es una sola, pero se hace de
 * cuatro maneras: cuánto tengo en X años, cuánto tarda en duplicarse, cuál de
 * dos inversiones conviene y cómo paso de TNA a TEA.
 *
 * Absorbe 13 calculadoras: interés compuesto (y su variante diaria), interés
 * simple (×2), conversión TNA/TEM/TEA, TEA, regla del 72 (×2), TIR/VAN,
 * comparar dos inversiones, ROI, CAGR y "el primer millón".
 *
 * NOTA DE CONTRATO — MEZCLA DE UNIDADES: este hub tiene plata (pesos), tasas
 * (%) y plazos (años) en el mismo desglose. El formato base del resultado es
 * 'ars', así que TODA fila que no sea plata declara su propio `format` +
 * `unit`. El runtime hace Object.assign: una fila sin `format` cae a pesos.
 */
export const hub: HubData = {
  slug: 'inversiones/interes-compuesto',
  title: 'Calculadora de interés compuesto y conversor TNA a TEA y TEM',
  description:
    'Calculá cuánto vale tu inversión dentro de X años con aportes mensuales, cuánto tarda en duplicarse por la regla del 72, cuál de dos tasas conviene y cómo pasar de TNA a TEM y TEA. Con el desglose entre capital aportado e interés ganado.',
  silo: 'Inversiones',
  siloHref: '/inversiones',

  eyebrow: 'Guía y estimación de inversiones',
  h1: 'Interés compuesto: calculá el rendimiento y convertí TNA a TEA',
  lede:
    'El interés compuesto es el interés que empieza a generar interés. Partimos del caso más común —cuánto vas a tener dentro de X años— y desde ahí mirás cuánto tarda en duplicarse, comparás dos tasas o traducís una TNA a TEA.',
  stamps: ['Actualizado 27-07-2026', 'Capitalización configurable · TNA / TEM / TEA', '13 calculadoras adentro'],

  resultLabel: 'Valor de tu inversión',

  cases: {
    title: '¿Qué querés saber?',
    intro: 'Partimos de la pregunta más frecuente. Si la tuya es otra, cambiala.',
    items: [
      {
        id: 'futuro',
        label: 'Cuánto tengo en X años',
        hint: 'El caso más común',
        answer: 'El valor final sale del capital, los aportes y el interés que generan.',
        yes: [
          'Fórmula: VF = capital × (1+i)^n + aporte × ((1+i)^n − 1) ÷ i, con i mensual y n en meses',
          'La tasa mensual equivalente sale de la TNA y de la frecuencia de capitalización elegida',
          'Los aportes mensuales se suman al principio de cada mes y capitalizan desde ahí',
          'El desglose separa el capital que pusiste vos del interés que generó la inversión',
        ],
        warn: [
          'La proyección es nominal: no descuenta inflación, impuestos ni comisiones del broker',
          'Una TNA constante durante 10 años no existe en la práctica: es un escenario, no una promesa',
          'Si la tasa es variable (plazo fijo que se renueva), el resultado es una referencia optimista',
        ],
        plazo: 'el interés compuesto necesita tiempo: la mitad de la ganancia de 20 años suele aparecer en los últimos 6 o 7.',
      },
      {
        id: 'duplicar',
        label: 'Cuánto tarda en duplicarse',
        hint: 'Regla del 72',
        answer: 'Dividí 72 por la tasa anual y te da los años que tarda en duplicarse.',
        yes: [
          'Regla del 72: años ≈ 72 ÷ tasa anual en porcentaje',
          'Cálculo exacto: ln(2) ÷ ln(1 + TEA), que es el número que mostramos como referencia',
          'Con la misma cuenta sale el tiempo para triplicar: ln(3) ÷ ln(1 + TEA)',
          'La regla se usa igual para estimar cuánto tarda la inflación en partir tu poder de compra al medio',
        ],
        warn: [
          'La regla del 72 es una aproximación: es muy buena entre 4% y 15% anual y se desvía en tasas altas',
          'Duplicar en pesos nominales no es duplicar en poder de compra: restá la inflación del período',
          'La cuenta asume que reinvertís el 100% del interés; si retirás, el plazo se estira',
        ],
        plazo: 'a 10% anual el capital se duplica en unos 7,3 años; a 20%, en 3,8.',
      },
      {
        id: 'comparar',
        label: 'Comparar dos inversiones',
        hint: 'Tasa A contra tasa B',
        answer: 'A igual plazo y capital, gana la que tiene mayor tasa efectiva.',
        yes: [
          'Las dos opciones se proyectan con el mismo capital, los mismos aportes y el mismo plazo',
          'La comparación se hace sobre tasa efectiva, no sobre la nominal publicada',
          'La diferencia se muestra en plata, que es lo que se siente en el bolsillo',
          'Sirve para plazo fijo contra fondo, banco contra banco o billetera contra billetera',
        ],
        warn: [
          'Dos productos con la misma TNA pueden rendir distinto si capitalizan con frecuencia distinta',
          'Una tasa más alta suele venir con más riesgo, menos liquidez o un plazo de inmovilización mayor',
          'Comisiones de suscripción, rescate y custodia no entran en la cuenta y pueden dar vuelta el resultado',
        ],
        plazo: 'compará siempre a igual plazo: una tasa a 30 días y otra a 365 no son comparables tal cual salen.',
      },
      {
        id: 'tasas',
        label: 'Pasar de TNA a TEA',
        hint: 'TNA · TEM · TEA',
        answer: 'La TEA es la tasa que ya incluye la capitalización: es la comparable.',
        yes: [
          'TEM = (1 + TNA ÷ m)^(m ÷ 12) − 1, donde m son las capitalizaciones por año',
          'TEA = (1 + TNA ÷ m)^m − 1',
          'Con capitalización mensual la cuenta se simplifica: TEM = TNA ÷ 12 y TEA = (1 + TNA÷12)^12 − 1',
          'La diferencia entre TEA y TNA es exactamente lo que aporta la capitalización',
        ],
        warn: [
          'La TNA por sí sola no dice cuánto ganás: sin la frecuencia de capitalización está incompleta',
          'En préstamos la tasa comparable es el CFT, que además suma seguros, gastos e impuestos',
          'Cuidado con comparar una TEA contra una TNA: la nominal siempre parece más baja',
        ],
        plazo: 'para cualquier comparación entre productos usá la TEA; es la única tasa que se puede poner al lado de otra.',
      },
    ],
  },

  inputsTitle: 'Completá los datos de tu inversión',
  inputsIntro: 'Podés dejar los valores de ejemplo. Los últimos dos campos sólo pesan en algunas ramas.',
  fields: [
    {
      id: 'capital',
      label: 'Capital inicial',
      prefix: '$',
      value: '1.000.000',
      thousands: true,
      help: 'Lo que ponés hoy. Puede ser 0 si arrancás sólo con aportes.',
    },
    {
      id: 'aporte',
      label: 'Aporte mensual',
      prefix: '$',
      value: '50.000',
      thousands: true,
      help: 'Lo que sumás todos los meses. Poné 0 si no aportás.',
    },
    { id: 'tasa', label: 'Tasa nominal anual (TNA)', type: 'number', suffix: '%', min: 0, max: 500, step: 0.1, value: 40 },
    { id: 'anios', label: 'Plazo', type: 'number', suffix: 'años', min: 1, max: 60, step: 1, value: 10 },
    {
      id: 'capitalizaciones',
      label: 'Frecuencia de capitalización',
      type: 'select',
      value: '12',
      options: [
        { value: '365', label: 'Diaria' },
        { value: '12', label: 'Mensual' },
        { value: '4', label: 'Trimestral' },
        { value: '2', label: 'Semestral' },
        { value: '1', label: 'Anual' },
      ],
      help: 'Cada cuánto el interés se suma al capital. Es lo que separa la TNA de la TEA.',
    },
    {
      id: 'tasaB',
      label: 'Tasa de la segunda opción (TNA)',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 500,
      step: 0.1,
      value: 34,
      help: 'Sólo se usa en la rama "Comparar dos inversiones".',
    },
  ],
  fineprint:
    'Herramienta educativa, no constituye asesoramiento ni recomendación de inversión. Rentabilidad y capital pueden variar o perderse; verificá costos y riesgos con una entidad o asesor habilitado.',

  chart: {
    type: 'stacked',
    title: 'Capital aportado contra interés ganado',
    caption:
      'La barra parte el valor final en dos: la plata que pusiste vos —capital inicial más aportes— y el interés que generó la inversión. Cuanto más largo el plazo, más grande se vuelve la parte del interés: esa es toda la idea del interés compuesto.',
  },
  breakdownTitle: 'Cómo se arma tu resultado',
  breakdownIntro:
    'Las filas de plata van en pesos; las de tasa en porcentaje y las de plazo en años. Las barras comparan cada valor con el más grande.',

  faq: [
    {
      q: '¿Cómo se calcula el interés compuesto?',
      a: 'Con VF = capital × (1 + i)^n, donde i es la tasa del período y n la cantidad de períodos. Si además hacés aportes periódicos se suma el término aporte × ((1+i)^n − 1) ÷ i. La diferencia con el interés simple es que acá el interés de cada período se suma al capital y en el siguiente también genera interés.',
    },
    {
      q: '¿Cuál es la diferencia entre interés simple y compuesto?',
      a: 'El interés simple se calcula siempre sobre el capital original: I = C × tasa × tiempo. El compuesto se calcula sobre el capital más los intereses ya acumulados. A un año la diferencia es chica; a diez años es enorme: $1.000.000 al 40% da $5.000.000 con interés simple y más de $28.000.000 con capitalización mensual.',
    },
    {
      q: '¿Qué es la TNA y en qué se diferencia de la TEA?',
      a: 'La TNA es la tasa nominal anual: no contempla la capitalización, es simplemente la tasa del período multiplicada por la cantidad de períodos del año. La TEA es la tasa efectiva anual e incluye el efecto de la capitalización. Una TNA de 40% con capitalización mensual equivale a una TEA de 48,21%.',
    },
    {
      q: '¿Cómo paso de TNA a TEM y a TEA?',
      a: 'Con capitalización mensual, la TEM es la TNA dividida 12 y la TEA es (1 + TNA÷12)^12 − 1. Para 40% de TNA: TEM 3,33% y TEA 48,21%. Con otra frecuencia de capitalización cambia el divisor: en la fórmula general, TEA = (1 + TNA ÷ m)^m − 1, donde m son las capitalizaciones por año.',
    },
    {
      q: '¿Qué es la regla del 72 y cuándo falla?',
      a: 'Es un atajo mental: dividiendo 72 por la tasa anual en porcentaje obtenés los años que tarda tu capital en duplicarse. Funciona muy bien entre 4% y 15% anual. En tasas altas se desvía: al 40% la regla da 1,8 años y el cálculo exacto, 2,06. El cálculo preciso es ln(2) ÷ ln(1 + tasa).',
    },
    {
      q: '¿Conviene capitalizar diario, mensual o anual?',
      a: 'Cuanto más frecuente la capitalización, mayor el rendimiento efectivo con la misma tasa nominal. Una TNA de 40% da TEA 40% con capitalización anual, 48,21% mensual y 49,18% diaria. La ganancia extra de pasar de diaria a continua es marginal: el salto grande está entre anual y mensual.',
    },
    {
      q: '¿Qué es el CAGR y para qué sirve?',
      a: 'El CAGR es la tasa de crecimiento anual compuesta que hubiera producido el mismo resultado: CAGR = (valor final ÷ valor inicial)^(1÷años) − 1. Sirve para comparar inversiones con recorridos distintos. Si $100.000 se convirtieron en $250.000 en 5 años, el CAGR es 20,1% anual.',
    },
    {
      q: '¿Cómo comparo dos inversiones con tasas distintas?',
      a: 'Llevá las dos a tasa efectiva del mismo período y proyectá el mismo capital al mismo plazo. Comparar una TNA contra una TEA, o una tasa a 30 días contra una a 365, da conclusiones equivocadas. Después mirá lo que la tasa no dice: riesgo, liquidez, plazo de inmovilización y comisiones.',
    },
    {
      q: '¿El interés compuesto le gana a la inflación?',
      a: 'Sólo si la tasa efectiva supera la inflación del mismo período. El rendimiento real se calcula como (1 + tasa) ÷ (1 + inflación) − 1. Con una TEA de 48% y una inflación de 45% el rendimiento real es apenas 2,1%: casi todo el crecimiento nominal fue reponer poder de compra.',
    },
    {
      q: '¿Cuánto tengo que aportar por mes para llegar al primer millón?',
      a: 'Depende de la tasa y del plazo. Con una TEA cercana al 48% y 10 años por delante, un aporte mensual de $50.000 sin capital inicial supera holgadamente el millón. Poné tu aporte y tu plazo en la rama "Cuánto tengo en X años" y el desglose te muestra cuánto de ese total lo puso el interés.',
    },
    {
      q: '¿Qué son la TIR y el VAN?',
      a: 'El VAN es el valor presente de todos los flujos de una inversión descontados a una tasa exigida: si da positivo, la inversión supera esa tasa. La TIR es la tasa que hace el VAN igual a cero, o sea el rendimiento implícito del proyecto. Para una inversión de un solo desembolso y un solo cobro, la TIR coincide con el CAGR.',
    },
    {
      q: '¿Los impuestos afectan el resultado de la calculadora?',
      a: 'Sí, y esta proyección es nominal y bruta. Según el instrumento y tu situación pueden aplicar Impuesto a las Ganancias sobre el rendimiento, Bienes Personales sobre la tenencia y el impuesto al crédito y débito sobre los movimientos. Confirmá el tratamiento con un contador antes de decidir.',
    },
  ],

  sources: [
    {
      name: 'BCRA — Tasas de interés por depósitos a plazo fijo',
      url: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'BCRA — Educación financiera: interés simple e interés compuesto',
      url: 'https://www.bcra.gob.ar/BCRAyVos/BCRAyVos.asp',
      publisher: 'Banco Central de la República Argentina',
    },
    {
      name: 'CNV — Educación del inversor: conceptos básicos de rendimiento y riesgo',
      url: 'https://www.argentina.gob.ar/cnv/educacion-del-inversor',
      publisher: 'Comisión Nacional de Valores',
    },
    {
      name: 'BCRA — Comunicación "A" 5460: régimen de transparencia y cálculo de CFT/TEA',
      url: 'https://www.bcra.gob.ar/Pdfs/comytexord/A5460.pdf',
      publisher: 'BCRA',
      date: '2013',
    },
    {
      name: 'INDEC — Índice de precios al consumidor (para calcular rendimiento real)',
      url: 'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31',
      publisher: 'INDEC',
    },
    {
      name: 'US SEC — Compound Interest Calculator y material del inversor',
      url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator',
      publisher: 'U.S. Securities and Exchange Commission',
    },
  ],

  replaces: [
    '/calculadora-interes-compuesto',
    '/calculadora-conversion-tna-tem-tea',
    '/calculadora-tasa-anual-equivalente-tea',
    '/calculadora-interes-simple',
    '/calculadora-interes-simple-capital-tiempo-tasa',
    '/calculadora-tir-van-inversion',
    '/calculadora-ahorro-compuesto-tiempo-duplicar-regla-72',
    '/calculadora-comparar-dos-inversiones-rendimiento',
    '/calculadora-roi-inversion',
    '/calculadora-primer-millon-ahorro-interes',
    '/calculadora-cagr-rendimiento-anualizado-compuesto',
    '/calculadora-regla-72-duplicar-dinero',
    '/calculadora-interes-compuesto-diario',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Constantes de cálculo del hub. */
export const TASAS = {
  /** Numerador del atajo mental para duplicar capital. */
  REGLA: 72,
  /** Capitalizaciones por año soportadas (valor del select). */
  PERIODOS: [1, 2, 4, 12, 365],
};
