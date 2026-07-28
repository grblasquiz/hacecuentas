import type { HubData } from '../types';

/**
 * Hub de decisión ES — "¿Qué coche me conviene comprar y cómo pagarlo?"
 *
 * Absorbe 6 calculadoras: eléctrico vs gasolina, diésel vs gasolina, renting vs
 * leasing vs compra, préstamo de coche frente a renting, impuesto de
 * matriculación (IEDMT) y etiqueta ambiental de la DGT.
 *
 * Constantes: espejo de src/lib/formulas/impuesto-matriculacion-iedmt-coche-espana.ts
 * y de las calculadoras de comparativa de combustibles.
 */

/** Disclaimer — textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FINANZAS =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const hub: HubData = {
  slug: 'es/automotor/comprar-coche',
  title: 'Qué coche comprar en España: eléctrico o gasolina, renting o compra',
  description:
    'Compara el coste total de un coche eléctrico, diésel o gasolina en España, decide entre comprar, financiar o renting, y calcula el impuesto de matriculación y tu etiqueta DGT.',
  silo: 'Coche',
  siloHref: '/es/automotor',

  eyebrow: 'Guía de compra de coche',
  h1: '¿Qué coche me conviene y cómo lo pago?',
  lede:
    'Elegir coche en España son dos decisiones encadenadas. Primero la mecánica: el diésel sólo compensa a partir de muchos kilómetros al año, y el eléctrico depende por completo de si puedes cargar en casa. Después la forma de pago: comprar, financiar o renting cambian el coste total mucho más de lo que sugiere la cuota mensual.',
  stamps: ['Impuesto de matriculación por CO₂', 'Etiquetas ambientales de la DGT', '6 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué estás decidiendo?',
    intro: 'La comparación honesta es siempre a coste total de propiedad, no a precio de catálogo.',
    items: [
      {
        id: 'electrico',
        label: 'Eléctrico o gasolina',
        hint: 'Depende de dónde cargues',
        answer:
          'El eléctrico cuesta más de comprar y muchísimo menos de usar: la clave es el precio al que cargas.',
        yes: [
          'Sobreprecio de compra frente al equivalente de gasolina',
          'Coste de recarga en casa frente al coste del combustible',
          'Exención del impuesto de matriculación y bonificaciones municipales',
          'Etiqueta Cero, que da acceso a las zonas de bajas emisiones',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Cargando en punto público rápido, el ahorro frente a gasolina se reduce mucho o desaparece',
          'La batería se degrada con los años y afecta al valor de reventa, que todavía es difícil de estimar',
          'Sin plaza de garaje propia con enchufe, el caso de uso cambia por completo',
        ],
        plazo: 'las ayudas a la compra de vehículo eléctrico tienen convocatorias con plazo y presupuesto limitado.',
      },
      {
        id: 'diesel',
        label: 'Diésel o gasolina',
        hint: 'Cuestión de kilómetros al año',
        answer:
          'El diésel compensa a partir de un umbral de kilómetros anuales que hace recuperar su sobreprecio.',
        yes: [
          'Sobreprecio de compra del diésel frente al gasolina',
          'Menor consumo por cada cien kilómetros',
          'Diferencia de precio entre gasóleo y gasolina',
          'Kilómetros anuales a partir de los cuales sale rentable',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'Los diésel modernos tienen mantenimiento más caro: filtro de partículas, aditivo y sistema de escape',
          'Muchas zonas de bajas emisiones penalizan los diésel antiguos: revisa la etiqueta antes de comprar',
          'La reventa de un diésel en ciudad se ha vuelto más difícil',
        ],
        plazo: 'las restricciones de las zonas de bajas emisiones se endurecen por fases.',
      },
      {
        id: 'renting',
        label: 'Comprar, financiar o renting',
        hint: 'Coste total, no cuota',
        answer:
          'El renting incluye todo pero nunca es tuyo; comprar sale más barato a largo plazo si aguantas el coche muchos años.',
        yes: [
          'Compra al contado: sin intereses, con toda la depreciación a tu cargo',
          'Financiación: cuota más intereses, y el coche acaba siendo tuyo',
          'Renting: cuota que incluye seguro, mantenimiento e impuesto, sin propiedad al final',
          'Valor residual del coche al terminar el período',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'La cuota de renting no se compara con la de financiación sin sumar seguro, mantenimiento e impuesto a la segunda',
          'El renting tiene límite de kilómetros y penalizaciones por exceso y por desperfectos',
          'Cancelar un renting anticipadamente suele ser muy caro',
        ],
        plazo: 'los contratos de renting habituales son de 36 a 60 meses.',
      },
      {
        id: 'matriculacion',
        label: 'Impuesto de matriculación y etiqueta',
        hint: 'IEDMT por emisiones',
        answer:
          'El impuesto de matriculación depende de las emisiones de CO₂: por debajo del primer tramo no se paga nada.',
        yes: [
          'Cuatro tramos de CO₂, el primero exento',
          'Tipos distintos en península y Baleares, Canarias y Ceuta y Melilla',
          'Etiqueta ambiental según motorización y emisiones',
          'La etiqueta determina el acceso a las zonas de bajas emisiones',
        ],
        warn: [
          DISCLAIMER_FINANZAS,
          'El impuesto se calcula sobre el valor del vehículo, así que en coches caros y contaminantes es una cifra muy alta',
          'Las emisiones homologadas que constan en la ficha técnica son las que cuentan, no las reales',
        ],
        plazo: 'el impuesto de matriculación se liquida antes de matricular el vehículo.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro: 'Compara siempre modelos equivalentes: mismo segmento, mismo equipamiento.',
  fields: [
    { id: 'precioA', label: 'Precio del coche que valoras', prefix: '€', value: '30.000', thousands: true },
    { id: 'precioB', label: 'Precio de la alternativa', prefix: '€', value: '24.000', thousands: true },
    { id: 'kmAnuales', label: 'Kilómetros al año', type: 'number', value: '15.000', min: 0, max: 100000, step: 500, thousands: true },
    { id: 'consumoA', label: 'Consumo del primero', type: 'number', value: '16', min: 0, max: 30, step: 0.1, suffix: ' l o kWh/100 km' },
    { id: 'consumoB', label: 'Consumo de la alternativa', type: 'number', value: '6,5', min: 0, max: 30, step: 0.1, suffix: ' l/100 km' },
    { id: 'precioEnergiaA', label: 'Precio de la energía del primero', prefix: '€', value: '0,15', suffix: '/kWh o /l' },
    { id: 'precioEnergiaB', label: 'Precio del combustible de la alternativa', prefix: '€', value: '1,55', suffix: '/l' },
    { id: 'anios', label: 'Años que piensas tenerlo', type: 'number', value: '8', min: 1, max: 20, step: 1 },
    { id: 'co2', label: 'Emisiones homologadas de CO₂', type: 'number', value: '140', min: 0, max: 400, step: 1, suffix: ' g/km' },
    {
      id: 'territorio',
      label: 'Territorio para el impuesto de matriculación',
      type: 'select',
      value: 'peninsula_baleares',
      options: [
        { value: 'peninsula_baleares', label: 'Península y Baleares' },
        { value: 'canarias', label: 'Canarias' },
        { value: 'ceuta_melilla', label: 'Ceuta y Melilla' },
      ],
    },
    { id: 'cuotaRenting', label: 'Cuota mensual de renting', prefix: '€', value: '450', thousands: true },
    { id: 'tinPrestamo', label: 'TIN del préstamo del coche', type: 'number', value: '7', min: 0, max: 25, step: 0.1, suffix: '%' },
  ],
  fineprint: DISCLAIMER_FINANZAS,

  chart: {
    type: 'bars',
    title: 'Coste total de cada opción',
    caption:
      'Compara lo que te costará cada alternativa durante todos los años que pienses tener el coche, no la cuota ni el precio de catálogo.',
  },
  breakdownTitle: 'La comparación completa',
  breakdownIntro:
    'Los importes son del período completo salvo donde se indica. Las filas de kilómetros y emisiones llevan su unidad.',

  faq: [
    {
      q: '¿Cuándo compensa un coche eléctrico?',
      a: 'Cuando puedes cargar en casa a precio doméstico y haces bastantes kilómetros. Ahí el ahorro por cada cien kilómetros frente a la gasolina es muy grande y recupera el sobreprecio de compra. Si dependes de la recarga pública rápida, el ahorro se reduce hasta casi desaparecer.',
    },
    {
      q: '¿A partir de cuántos kilómetros compensa un diésel?',
      a: 'Depende del sobreprecio del modelo diésel y de la diferencia de consumo y de precio del carburante, pero como regla general hace falta un uso alto y sostenido durante varios años. Con un uso urbano de pocos kilómetros al año, el diésel casi nunca sale a cuenta.',
    },
    {
      q: '¿Qué mantenimiento tiene un eléctrico frente a un térmico?',
      a: 'Bastante menos: no hay aceite, correa, filtros de combustible ni embrague, y los frenos duran más por la retención regenerativa. A cambio, la batería es el componente caro, y su sustitución fuera de garantía puede acercarse al valor del coche.',
    },
    {
      q: '¿Qué es la etiqueta ambiental y por qué importa?',
      a: 'Clasifica el vehículo por emisiones: Cero para eléctricos y algunos híbridos enchufables, Eco para híbridos y gas, C para gasolina y diésel recientes, B para los algo más antiguos, y sin etiqueta para los más viejos. Determina si puedes entrar en las zonas de bajas emisiones de las ciudades grandes.',
    },
    {
      q: '¿Cuánto se paga de impuesto de matriculación?',
      a: 'Depende del CO₂ homologado: por debajo del primer tramo está exento, y por encima se aplica un porcentaje creciente sobre el valor del vehículo, con tipos más bajos en Canarias y en Ceuta y Melilla. En un coche caro y contaminante puede suponer varios miles de euros.',
    },
    {
      q: '¿Merece la pena el renting para un particular?',
      a: 'Depende de cómo valores la comodidad y la previsibilidad. La cuota incluye seguro, mantenimiento e impuesto, así que no hay sorpresas, pero al terminar no tienes nada. Comprar sale más barato si aguantas el coche muchos años; el renting gana si cambias cada tres o cuatro.',
    },
    {
      q: '¿Cómo comparo una cuota de renting con una de financiación?',
      a: 'Sumando a la cuota de financiación el seguro a todo riesgo, el mantenimiento, el impuesto de circulación y la ITV, que en renting van incluidos. Comparar la cuota pelada contra la de renting es el error que hace parecer barato lo que no lo es, y al revés.',
    },
    {
      q: '¿Qué pasa si me paso de kilómetros en el renting?',
      a: 'Se paga una penalización por cada kilómetro de exceso, fijada en el contrato. También se revisa el estado del vehículo al devolverlo y se cobran los desperfectos que superen el desgaste normal. Ajustar bien los kilómetros contratados es la decisión clave del contrato.',
    },
    {
      q: '¿Cuánto pierde de valor un coche nuevo?',
      a: 'La mayor parte de la depreciación se concentra en los primeros años, y es el coste más grande de tener un coche nuevo, muy por encima del combustible. Por eso comprar un seminuevo de dos o tres años es la fórmula que mejor coste total suele dar.',
    },
    {
      q: '¿Conviene financiar aunque tenga el dinero?',
      a: 'Sólo si el tipo de interés es muy bajo o si el descuento por financiar compensa los intereses, algo habitual en campañas de marca. Con tipos normales, pagar al contado ahorra el coste financiero completo, que en un préstamo largo es una cifra apreciable.',
    },
    {
      q: '¿Los híbridos enchufables tienen sentido?',
      a: 'Sólo si haces trayectos cortos y puedes cargarlos a diario: ahí funcionan como eléctricos. Si no se cargan, arrastran el peso de la batería con un motor térmico y consumen más que un híbrido convencional, sin ninguna ventaja más allá de la etiqueta.',
    },
  ],

  sources: [
    {
      name: 'Ley 38/1992 de Impuestos Especiales — impuesto de matriculación (IEDMT)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'DGT — distintivos ambientales',
      url: 'https://www.dgt.es/nuestros-servicios/permisos-de-conducir/tramites-y-gestiones/distintivo-ambiental/',
      publisher: 'Dirección General de Tráfico',
    },
    {
      name: 'IDAE — consumo de carburante y emisiones de turismos nuevos',
      url: 'https://coches.idae.es/',
      publisher: 'Instituto para la Diversificación y Ahorro de la Energía',
    },
    {
      name: 'Precios de carburantes en estaciones de servicio',
      url: 'https://geoportalgasolineras.es/',
      publisher: 'Ministerio para la Transición Ecológica',
    },
  ],

  replaces: [
    '/calculadora-comprar-coche-electrico-vs-gasolina-espana-2026',
    '/calculadora-diesel-vs-gasolina-rentabilidad-km-ano-espana',
    '/calculadora-renting-leasing-compra-coche-espana-tco',
    '/calculadora-prestamo-coche-espana-cdc-vs-renting',
    '/calculadora-impuesto-matriculacion-iedmt-coche-espana',
    '/calculadora-etiqueta-dgt-coche-espana-eco-cero-b-c',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Tipos del IEDMT por tramo de CO₂. Espejo de la fórmula vieja (art. 70 Ley 38/1992). */
export const IEDMT_TIPOS: Record<string, number[]> = {
  peninsula_baleares: [0, 4.75, 9.75, 14.75],
  canarias: [0, 3.75, 8.75, 13.75],
  ceuta_melilla: [0, 2.75, 6.75, 10.75],
};

/** Tramos de CO₂ del IEDMT: [límite superior en g/km, índice del tipo]. */
export const IEDMT_TRAMOS: Array<[number, number]> = [
  [120, 0],
  [159, 1],
  [199, 2],
  [Infinity, 3],
];

/** Umbrales de la etiqueta ambiental de la DGT, de forma simplificada. */
export const ETIQUETAS = [
  { nombre: 'Cero', descripcion: 'Eléctrico puro, de autonomía extendida o enchufable con más de 40 km' },
  { nombre: 'Eco', descripcion: 'Híbrido no enchufable, gas natural o GLP' },
  { nombre: 'C', descripcion: 'Gasolina desde Euro 4 y diésel desde Euro 6' },
  { nombre: 'B', descripcion: 'Gasolina Euro 3 y diésel Euro 4 y 5' },
  { nombre: 'Sin etiqueta', descripcion: 'Gasolina anterior a Euro 3 y diésel anterior a Euro 4' },
];

/** Depreciación acumulada de referencia, como porcentaje del precio de compra. */
export const DEPRECIACION = { primerAnio: 0.2, anualPosterior: 0.1, suelo: 0.15 };

/** Coste anual de seguro, mantenimiento e impuesto que el renting incluye. */
export const RENTING_INCLUYE_ANUAL = 900;
