import type { HubData } from '../types';
import { ECUADOR_2026, COMBUSTIBLES_EC_2026 } from '../../data/ecuador-2026';

/**
 * Hub de decisión EC — "¿Cuánto me cuesta al año tener el auto al día en el Ecuador?"
 *
 * Cálculo espejado de las fórmulas vivas:
 *   matriculacion-vehicular-ecuador.ts · impuesto-rodaje-vehiculos-ecuador.ts ·
 *   sppat-seguro-accidentes-transito-ecuador.ts · revision-tecnica-vehicular-ecuador.ts ·
 *   multas-transito-ecuador.ts · costo-viaje-gasolina-ecuador.ts
 *
 * CORRECCIÓN respecto de la fórmula vieja de matriculación: su tabla interna del impuesto
 * al rodaje cobraba $35 en el tramo de avalúo $30.001–$40.000. El texto del Art. 539 del
 * COOTAD fija $50 en ese tramo (el $35 es un error de transcripción que circula en prensa,
 * y la propia calculadora de impuesto al rodaje ya lo tenía bien). Aquí va $50.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'finance'). */
const DISCLAIMER_FIN =
  'Estimación informativa. Tasas, costos, comisiones y condiciones reales dependen de cada entidad y contrato; compará la documentación oficial antes de decidir.';

export const SBU = ECUADOR_2026.sbu;
export const COMBUSTIBLES = COMBUSTIBLES_EC_2026;

/** IPVM — Impuesto a la Propiedad de Vehículos Motorizados (SRI). Tabla progresiva. */
export const IPVM_TABLA = [
  { desde: 0, hasta: 4000, base: 0, pct: 0.005 },
  { desde: 4000, hasta: 8000, base: 20, pct: 0.01 },
  { desde: 8000, hasta: 12000, base: 60, pct: 0.02 },
  { desde: 12000, hasta: 16000, base: 140, pct: 0.03 },
  { desde: 16000, hasta: 20000, base: 260, pct: 0.04 },
  { desde: 20000, hasta: 24000, base: 420, pct: 0.05 },
  { desde: 24000, hasta: null, base: 620, pct: 0.06 },
];

/** Impuesto al rodaje municipal — tabla del Art. 539 del COOTAD (tarifa fija por tramo). */
export const RODAJE_TABLA = [
  { desde: 0, tarifa: 0 },
  { desde: 1000.01, tarifa: 5 },
  { desde: 4000.01, tarifa: 10 },
  { desde: 8000.01, tarifa: 15 },
  { desde: 12000.01, tarifa: 20 },
  { desde: 16000.01, tarifa: 25 },
  { desde: 20000.01, tarifa: 30 },
  { desde: 30000.01, tarifa: 50 },
  { desde: 40000.01, tarifa: 70 },
];

/** Tasa SPPAT por clase de vehículo (Norma Técnica SPPAT, art. 83). */
export const SPPAT_POR_TIPO = {
  liviano: { valor: 26.74, label: 'Auto liviano particular', rango: '$21,11 a $31,67 según cilindraje (0 a 9 años)' },
  moto: { valor: 24.63, label: 'Motocicleta', rango: '$19,71 a $30,26 según cilindraje' },
  taxi: { valor: 41.13, label: 'Taxi o comercial de alquiler', rango: '$32,56 a $51,41 según cilindraje (0 a 9 años)' },
};

/** Coberturas de ley del SPPAT por víctima (Norma Técnica SPPAT, arts. 59, 63, 66, 70 y 77). */
export const COBERTURAS_SPPAT = {
  gastosMedicos: 3000,
  fallecimiento: 5000,
  discapacidad: 5000,
  gastosFunerarios: 400,
  traslado: 200,
};

/** Tasa de matriculación y servicios de la ANT (referencial). */
export const TASA_ANT = { liviano: 29.0, moto: 15.0, taxi: 29.0 };

/** Tarifa base de la Revisión Técnica Vehicular (1ª revisión, base AMT Quito). */
export const RTV_BASE = { liviano: 31.56, moto: 18.55, taxi: 21.39 };
/** Factor por ciudad sobre la tarifa base de Quito. Guayaquil calibrado al tarifario ATM. */
export const RTV_FACTOR_CIUDAD = { quito: 1.0, guayaquil: 0.946, otra: 0.9 };
/** Adhesivo de la RTV (Quito). */
export const STICKER_RTV = 3.9;

/** Clases de contravención de tránsito del COIP, en % del SBU y puntos de licencia. */
export const MULTAS_TRANSITO = [
  { id: 'ninguna', label: 'Ninguna multa pendiente', pct: 0, puntos: 0 },
  { id: 'leve_1', label: 'Leve de 1ª clase (no usar cinturón)', pct: 0.05, puntos: 1.5 },
  { id: 'leve_2', label: 'Leve de 2ª clase (celular al conducir, mal estacionado)', pct: 0.1, puntos: 3 },
  { id: 'leve_3', label: 'Leve de 3ª clase (sin luces, exceso leve de velocidad)', pct: 0.15, puntos: 4.5 },
  { id: 'grave_1', label: 'Grave de 1ª clase (pasarse el semáforo en rojo)', pct: 0.3, puntos: 6 },
  { id: 'grave_2', label: 'Grave de 2ª clase (exceso de velocidad)', pct: 0.4, puntos: 7.5 },
  { id: 'grave_3', label: 'Grave de 3ª clase (licencia caducada)', pct: 0.5, puntos: 9 },
  { id: 'muy_grave', label: 'Muy grave (sin licencia, en estado de embriaguez)', pct: 1.0, puntos: 10 },
];

/** Multas y recargos del calendario de matriculación (AMT Quito). */
export const MULTA_NO_CALENDARIO = 25;
export const MULTA_NO_APROBAR_RTV = 50;
export const RECARGO_MATRICULA_VENCIDA = 25;

/** Depreciación del avalúo del SRI: 20% anual con piso del 10% del PVP. */
export const DEPRECIACION_ANUAL = 0.2;
export const PISO_RESIDUAL = 0.1;
export const ANIO_FISCAL = 2026;

const usd = (n: number) =>
  '$' + new Intl.NumberFormat('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export const hub: HubData = {
  slug: 'ec/auto/costos-del-auto',
  title: 'Cuánto cuesta tener el auto al día en Ecuador: matrícula, SPPAT, RTV y combustible',
  description:
    'Calcula el costo anual real de tu vehículo en el Ecuador: impuesto a la propiedad del SRI, impuesto al rodaje del COOTAD, tasa SPPAT, revisión técnica vehicular, tasa de la ANT, multas de tránsito en porcentaje del SBU y el gasto de combustible por galón.',
  silo: 'Auto',
  siloHref: '/ec/auto',
  locale: 'ec',

  eyebrow: 'Ecuador · SRI, ANT, SPPAT y municipios',
  h1: '¿Cuánto te cuesta al año tener el auto al día en el Ecuador?',
  lede:
    'La matrícula no es un solo rubro: son cinco cobros distintos de tres instituciones distintas, más lo que hayas acumulado en multas y el combustible que quemas todo el año. Aquí ves el total, y sobre todo ves cuál de los rubros es el que realmente pesa.',
  stamps: [
    `SBU ${usd(SBU)} · las multas de tránsito van en % del SBU`,
    `Combustible por galón · Extra y Ecopaís ${usd(COMBUSTIBLES_EC_2026.precios.extra.usdGalon)} · Diésel ${usd(COMBUSTIBLES_EC_2026.precios.diesel.usdGalon)}`,
    '6 calculadoras adentro',
  ],

  resultLabel: 'Costo anual del vehículo',

  cases: {
    title: '¿Qué vehículo tienes?',
    intro:
      'Los impuestos dependen del avalúo, pero las tasas fijas (SPPAT, ANT, revisión técnica) dependen de la clase de vehículo y del uso. Un taxi y una moto no pagan lo mismo que un auto particular.',
    items: [
      {
        id: 'particular',
        label: 'Auto particular',
        hint: 'Uso personal · avalúo del SRI',
        answer: 'La matrícula de un auto particular suma el impuesto a la propiedad del SRI, el rodaje municipal, el SPPAT, la tasa de la ANT y la revisión técnica.',
        yes: [
          'Impuesto a la Propiedad de Vehículos Motorizados (IPVM) del SRI, progresivo del 0,5% al 6% sobre el avalúo',
          'Impuesto al rodaje municipal, tarifa fija por tramo de avalúo según el Art. 539 del COOTAD',
          `Tasa SPPAT de ${usd(SPPAT_POR_TIPO.liviano.valor)} para el auto liviano representativo (${SPPAT_POR_TIPO.liviano.rango})`,
          'Tasa de matriculación y servicios de la ANT, y revisión técnica vehicular según el cantón',
          'El avalúo se deprecia un 20% cada año, con un piso del 10% del precio de venta al público original',
        ],
        warn: [
          DISCLAIMER_FIN,
          'El avalúo que manda es el que tiene registrado el SRI para tu modelo, que no siempre coincide con lo que pagaste ni con lo que vale hoy en el mercado: consúltalo por placa antes de presupuestar',
          'La revisión técnica y el impuesto al rodaje los administra tu municipio, así que el valor exacto cambia de cantón a cantón',
          'Matricular fuera del mes que te asigna el calendario suma una multa aparte',
        ],
        plazo: 'la matriculación se hace en el mes que te corresponde según el último dígito de la placa; el calendario lo publica la ANT cada año.',
      },
      {
        id: 'taxi',
        label: 'Taxi o vehículo de trabajo',
        hint: 'Servicio comercial · SPPAT más alto',
        answer: 'Un vehículo de servicio comercial paga una tasa SPPAT más alta y hace muchos más kilómetros, así que el combustible pesa más que los impuestos.',
        yes: [
          `Tasa SPPAT de servicio de alquiler: ${usd(SPPAT_POR_TIPO.taxi.valor)} (${SPPAT_POR_TIPO.taxi.rango})`,
          'Los impuestos del SRI y del municipio se calculan igual que en un particular, sobre el avalúo',
          'La revisión técnica del comercial liviano tiene su propia tarifa, distinta a la del particular',
          'Al hacer decenas de miles de kilómetros al año, el combustible suele superar largamente al total de impuestos y tasas',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Los vehículos de transporte comercial tienen frecuencias de revisión técnica más exigentes que los particulares: en varias ciudades es más de una vez al año',
          'Esta cuenta no incluye el cupo, el permiso de operación ni la afiliación a la operadora, que son costos propios del servicio comercial',
          'Tampoco incluye mantenimiento, llantas ni seguro: en un vehículo de trabajo esos rubros son los que más crecen',
        ],
        plazo: 'el permiso de operación y la revisión del transporte comercial se renuevan según el calendario de la ANT y de tu operadora.',
      },
      {
        id: 'moto',
        label: 'Motocicleta',
        hint: 'Avalúo bajo · tasas reducidas',
        answer: 'Una moto paga poco de impuestos porque su avalúo es bajo, y las tasas fijas también son menores que las del auto.',
        yes: [
          `Tasa SPPAT de motocicleta: ${usd(SPPAT_POR_TIPO.moto.valor)} (${SPPAT_POR_TIPO.moto.rango})`,
          `Tasa de la ANT reducida: ${usd(TASA_ANT.moto)}`,
          'Revisión técnica con tarifa menor a la del vehículo liviano',
          'Con un avalúo de hasta $1.000 la moto queda exenta del impuesto al rodaje',
        ],
        warn: [
          DISCLAIMER_FIN,
          'Que la tasa SPPAT sea baja no significa que la cobertura lo sea: las coberturas de ley son las mismas para todo vehículo, y el motociclista es el usuario más expuesto',
          'El rendimiento en km por galón de una moto es muy superior al de un auto: si usas el valor por defecto del formulario, ajústalo o el gasto de combustible te va a salir inflado',
          'En varias ciudades la revisión técnica de motos tiene su propio calendario, distinto al de los livianos',
        ],
        plazo: 'la moto se matricula con el mismo calendario por último dígito de placa que el resto de vehículos.',
      },
      {
        id: 'multas',
        label: 'Tengo multas pendientes',
        hint: 'En % del SBU · suben cada enero',
        answer: 'Sin pagar las multas no se matricula, y como las multas van en porcentaje del SBU, suben solas cada enero.',
        yes: [
          `Las contravenciones del COIP se sancionan en porcentaje del SBU: leve de 1ª clase 5% (${usd(SBU * 0.05)}) hasta muy grave 1 SBU completo (${usd(SBU)})`,
          'Cada clase de contravención también descuenta puntos de la licencia: de 1,5 a 10 puntos',
          `Matricular fuera del mes asignado suma ${usd(MULTA_NO_CALENDARIO)}, y no presentarse o no aprobar la revisión técnica suma ${usd(MULTA_NO_APROBAR_RTV)}`,
          `Cada año de matrícula vencida agrega un recargo de ${usd(RECARGO_MATRICULA_VENCIDA)}`,
        ],
        warn: [
          DISCLAIMER_FIN,
          'Como las multas se fijan en porcentaje del SBU, dejar una multa impaga no congela su valor: el monto sube automáticamente cada enero cuando sube el salario básico',
          'La licencia arranca con 30 puntos: llegar a cero implica la suspensión, y las contravenciones muy graves pueden acarrear prisión',
          'La segunda revisión técnica (el rechequeo) no tiene costo si se hace dentro del plazo, y la tercera cuesta la mitad: no pagues de más',
        ],
        plazo: 'las multas pendientes bloquean la matriculación; conviene pagarlas antes de que empiece el mes que te toca por placa.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu vehículo',
  inputsIntro:
    'Todo en dólares. El avalúo lo calculamos depreciando el precio original un 20% por año, igual que el SRI, pero si ya conoces tu avalúo registrado puedes escribirlo directamente como precio y poner el año actual.',
  fields: [
    {
      id: 'pvp',
      label: 'Precio de venta al público del modelo ($)',
      prefix: '$',
      value: '25.000',
      thousands: true,
      help: 'El precio del vehículo cuando era nuevo. Sobre este valor el SRI aplica la depreciación anual del 20% para llegar al avalúo del año.',
    },
    {
      id: 'anioModelo',
      label: 'Año del modelo',
      type: 'number',
      value: 2022,
      min: 1950,
      max: 2027,
      step: 1,
      help: 'El año que figura en la matrícula. La depreciación corre desde ese año, con un piso del 10% del precio original.',
    },
    {
      id: 'ciudad',
      label: 'Ciudad donde matriculas',
      type: 'select',
      value: 'quito',
      options: [
        { value: 'quito', label: 'Quito (AMT)' },
        { value: 'guayaquil', label: 'Guayaquil (ATM)' },
        { value: 'otra', label: 'Otra ciudad (GAD municipal)' },
      ],
      help: 'Solo cambia la tarifa de la revisión técnica vehicular, que la fija cada municipio.',
    },
    {
      id: 'kmAnio',
      label: 'Kilómetros que haces al año',
      type: 'number',
      value: 12000,
      min: 0,
      step: 500,
      thousands: true,
      help: 'Si pones 0 el hub calcula solo impuestos y tasas, sin combustible.',
    },
    {
      id: 'kmPorGalon',
      label: 'Rendimiento del vehículo (km por galón)',
      type: 'number',
      value: 40,
      min: 1,
      step: 1,
      help: 'En Ecuador el combustible se vende por galón. Un auto liviano ronda los 35 a 45 km por galón; una moto puede pasar de 100.',
    },
    {
      id: 'combustible',
      label: 'Combustible que cargas',
      type: 'select',
      value: 'extra',
      options: [
        { value: 'extra', label: 'Gasolina Extra' },
        { value: 'ecopais', label: 'Gasolina Ecopaís' },
        { value: 'super', label: 'Gasolina Súper' },
        { value: 'diesel', label: 'Diésel Premium' },
      ],
      help: 'Precios sugeridos de Petroecuador del período vigente. Extra y Ecopaís se mueven mes a mes dentro del sistema de bandas.',
    },
    {
      id: 'multa',
      label: 'Multa de tránsito pendiente',
      type: 'select',
      value: 'ninguna',
      options: MULTAS_TRANSITO.map((m) => ({ value: m.id, label: m.label })),
      help: 'Elige la clase de contravención. El valor sale como porcentaje del SBU vigente.',
    },
    {
      id: 'aniosVencida',
      label: 'Años de matrícula vencida',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada año vencido agrega un recargo de ${usd(RECARGO_MATRICULA_VENCIDA)}. Si estás al día, dejalo en 0.`,
    },
  ],
  fineprint: DISCLAIMER_FIN,

  chart: {
    type: 'donut',
    title: 'De qué está hecho el costo anual de tu auto',
    caption:
      'Compara los impuestos (propiedad y rodaje) con las tasas fijas (SPPAT, ANT, revisión técnica), las multas y el combustible. En la mayoría de los casos el combustible se come todo lo demás: la matrícula duele una vez al año, el tanque duele todas las semanas.',
  },
  breakdownTitle: 'Rubro por rubro',
  breakdownIntro:
    'Primero el avalúo del que salen los impuestos, después cada cobro de la matrícula, y al final las multas y el combustible del año.',

  faq: [
    {
      q: '¿Qué se paga exactamente en la matriculación vehicular en Ecuador?',
      a: 'Cinco cosas distintas que llegan juntas: el impuesto a la propiedad de vehículos motorizados que cobra el SRI, el impuesto al rodaje que cobra tu municipio, la tasa del SPPAT, la tasa de matriculación y servicios de la ANT, y la revisión técnica vehicular. Las tres primeras dependen del avalúo o de la clase de vehículo; las dos últimas son tasas fijas por servicio.',
    },
    {
      q: '¿Cómo se calcula el avalúo de mi vehículo?',
      a: 'El SRI parte del precio de venta al público del modelo cuando era nuevo y lo deprecia un 20% por cada año transcurrido, con un piso: el avalúo nunca baja del 10% del precio original. Por eso un auto viejo sigue pagando algo aunque en el mercado valga poco. El avalúo oficial se consulta por placa en el portal del SRI.',
    },
    {
      q: '¿Cuánto es el impuesto al rodaje y quién lo cobra?',
      a: 'Es un impuesto municipal con tarifa fija por tramo de avalúo, según el artículo 539 del COOTAD: va desde estar exento con avalúo de hasta $1.000, pasa por $5, $10, $15, $20, $25, $30 y $50, y llega a un tope de $70 para avalúos de más de $40.000. Lo cobra el GAD municipal del cantón donde está matriculado el vehículo, pero se paga junto con la matrícula.',
    },
    {
      q: '¿Qué es el SPPAT y en qué se diferencia del SOAT?',
      a: `El SPPAT reemplazó al SOAT. No es un seguro privado sino una tasa pública obligatoria que se cobra dentro de la matriculación. Cubre a las víctimas de un accidente de tránsito con hasta ${usd(COBERTURAS_SPPAT.gastosMedicos)} en gastos médicos, ${usd(COBERTURAS_SPPAT.fallecimiento)} por fallecimiento, ${usd(COBERTURAS_SPPAT.discapacidad)} por discapacidad, ${usd(COBERTURAS_SPPAT.gastosFunerarios)} en gastos funerarios y ${usd(COBERTURAS_SPPAT.traslado)} de traslado, por víctima y por evento. Las coberturas son iguales para todo vehículo; lo que cambia según la clase es la tasa que pagas.`,
    },
    {
      q: '¿Cuánto cuestan las multas de tránsito y por qué suben cada año?',
      a: `Las contravenciones del COIP se sancionan en porcentaje del salario básico unificado, no en un monto fijo. Una leve de 1ª clase es el 5% del SBU (${usd(SBU * 0.05)}), una grave de 1ª clase el 30% (${usd(SBU * 0.3)}) y una muy grave un SBU completo (${usd(SBU)}). Como el SBU sube cada enero, las multas suben automáticamente con él: dejar una multa impaga no congela su valor.`,
    },
    {
      q: '¿La segunda revisión técnica se paga?',
      a: 'No, el rechequeo es gratuito si se hace dentro del plazo. La tercera revisión cuesta la mitad de la tarifa y la cuarta vuelve a costar la tarifa completa. Además, no presentarse o no aprobar la revisión técnica genera una multa aparte, y no matricular en el mes que te asigna el calendario genera otra.',
    },
    {
      q: '¿Cuánto cuesta el combustible en Ecuador y por qué se mide por galón?',
      a: `Ecuador vende el combustible por galón, no por litro, así que el rendimiento del vehículo se expresa en kilómetros por galón. En el período vigente la Extra y la Ecopaís están en ${usd(COMBUSTIBLES_EC_2026.precios.extra.usdGalon)}, el Diésel Premium en ${usd(COMBUSTIBLES_EC_2026.precios.diesel.usdGalon)} y la Súper en ${usd(COMBUSTIBLES_EC_2026.precios.super.usdGalon)}. La Extra y la Ecopaís se mueven dentro de un sistema de bandas que permite subir como máximo un 5% y bajar hasta un 10% cada mes; la Súper tiene precio liberalizado.`,
    },
    {
      q: '¿Cuándo me toca matricular?',
      a: 'Según el último dígito de tu placa, en el mes que fija el calendario anual de la ANT. Matricular fuera de ese mes tiene una multa, y cada año de matrícula vencida suma un recargo. Si tienes multas pendientes no puedes matricular hasta pagarlas, así que conviene revisarlas con anticipación al mes que te toca.',
    },
    {
      q: '¿Al comprar un auto usado, qué pago además del precio?',
      a: 'El traspaso de dominio tiene su propio costo: un impuesto del 1% sobre el mayor entre el precio del contrato y el avalúo del SRI, más el trámite en la ANT, la nueva especie de matrícula, la tasa de mantenimiento vial y el honorario de la notaría por el contrato de compraventa. Ese cálculo está en el hub de trámites y costos legales, y es aparte de la matrícula anual.',
    },
    {
      q: '¿Los impuestos del auto se pueden pagar en cuotas?',
      a: 'La matriculación se paga de una sola vez por año, con los rubros del SRI, del municipio y de la ANT juntos. Lo que sí conviene es presupuestarla mes a mes: dividir el total anual entre 12 y guardarlo evita el golpe de una sola vez, sobre todo cuando hay multas acumuladas o años vencidos.',
    },
    {
      q: '¿Qué gasto del auto pesa más al año?',
      a: 'Casi siempre el combustible. Un auto que hace 12.000 km al año con un rendimiento de 40 km por galón consume 300 galones, y eso ya supera al total de impuestos y tasas de la matrícula de un vehículo de gama media. Los impuestos duelen porque llegan de golpe una vez al año; el combustible cuesta más pero se paga de a poco.',
    },
    {
      q: '¿Un vehículo viejo deja de pagar impuestos?',
      a: 'No. La depreciación del avalúo baja el impuesto a la propiedad y puede llevarte a un tramo más bajo del rodaje, pero el avalúo tiene un piso del 10% del precio original y las tasas fijas (SPPAT, ANT, revisión técnica) no dependen de la antigüedad. De hecho la tasa del SPPAT es más alta para vehículos de más de nueve años que para los de 0 a 9.',
    },
  ],

  sources: [
    { name: 'SRI — Impuestos vehiculares', url: 'https://www.sri.gob.ec/impuestos-vehiculares', publisher: 'Servicio de Rentas Internas' },
    { name: 'ANT — Matriculación vehicular', url: 'https://www.ant.gob.ec/', publisher: 'Agencia Nacional de Tránsito' },
    { name: 'SPPAT — Servicio Público para Pago de Accidentes de Tránsito', url: 'https://www.sppat.gob.ec/', publisher: 'SPPAT' },
    { name: 'AMT Quito — Revisión técnica vehicular', url: 'https://www.amt.gob.ec/', publisher: 'Agencia Metropolitana de Tránsito de Quito' },
    { name: 'ATM Guayaquil — Tarifario de revisión técnica', url: 'https://atm.gob.ec/', publisher: 'Autoridad de Tránsito Municipal de Guayaquil' },
    { name: 'EP Petroecuador — Precios de combustibles', url: 'https://www.eppetroecuador.ec/', publisher: 'EP Petroecuador' },
  ],

  replaces: [
    '/ec/calculadora-matriculacion-vehicular-ecuador',
    '/ec/calculadora-impuesto-rodaje-vehiculos-ecuador',
    '/ec/calculadora-sppat-seguro-accidentes-transito-ecuador',
    '/ec/calculadora-revision-tecnica-vehicular-ecuador',
    '/ec/calculadora-multas-transito-ecuador',
    '/ec/calculadora-costo-viaje-gasolina-ecuador',
  ],

  lastReviewed: '2026-07-28',
};
