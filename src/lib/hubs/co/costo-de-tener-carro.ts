import type { HubData } from '../types';
import {
  COLOMBIA_2026,
  SOAT_MOTO_2026,
  TECNOMECANICA_MOTO_2026,
  TAXI_BOGOTA_2026,
} from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Cuánto me cuesta al año tener este carro o esta moto?"
 *
 * Suma las cuatro obligaciones anuales que casi nadie presupuesta juntas:
 * impuesto de vehículos, SOAT, revisión tecnomecánica y combustible. Más los
 * costos de una sola vez cuando el vehículo es nuevo (matrícula) o usado (traspaso).
 *
 * 🔴 Dos tablas falsas encontradas en las fórmulas que este hub reemplaza, ninguna
 * replicada acá:
 *
 * 1. `impuesto-vehiculos-colombia-2026-departamento.ts` trae unas "tarifas máximas
 *    por departamento (DIAN)" que van del 1,5% al 2,5% según el departamento. Eso
 *    no existe: el art. 145 de la Ley 488 de 1998 fija una escala PROGRESIVA
 *    NACIONAL por valor comercial del vehículo, igual en todo el país — los
 *    departamentos recaudan, no fijan la tarifa. Además esa tabla se corta en 2,5%
 *    y por lo tanto NUNCA llega al 3,5% del tramo alto, así que subfactura a los
 *    vehículos más caros, que son justamente los que más pagan. Y lista "cartagena"
 *    y "distago" como departamentos, que no lo son.
 *
 * 2. `soat-colombia-precio-2026-vehiculo.ts` devuelve una `comparativa_aseguradoras`
 *    con precios distintos por aseguradora. El SOAT es una tarifa REGULADA: la fija
 *    el Gobierno por decreto y es idéntica en todas las compañías. No se puede
 *    cotizar SOAT por precio, y sugerir que sí induce a error. Encima sus tarifas de
 *    moto (por ejemplo $500.000 hasta 125 c.c.) contradicen la tabla maestra del
 *    propio repo (`SOAT_MOTO_2026`: $256.200 por debajo de 100 c.c., $343.300 entre
 *    100 y 200 c.c.), que sí está verificada.
 *
 * ⚠️ Los umbrales en pesos de la escala del art. 145 se actualizan cada año por
 * resolución y NO están en src/lib/data/colombia-2026.ts. Van como campos
 * editables con valor de referencia, no como constantes con pretensión de autoridad.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const MULTAS = COLOMBIA_2026.multasTransito;

/**
 * Escala del impuesto sobre vehículos automotores — art. 145 de la Ley 488 de 1998.
 * Las TARIFAS son legales y nacionales. Los UMBRALES en pesos son referenciales:
 * se actualizan cada año por resolución del Ministerio de Transporte / Hacienda.
 * La tarifa del tramo se aplica sobre TODO el avalúo, no es marginal.
 */
export const ESCALA_VEHICULOS = [
  { hastaRef: 60_000_000, tasa: 0.015, etiqueta: 'Tramo bajo' },
  { hastaRef: 135_000_000, tasa: 0.02, etiqueta: 'Tramo medio' },
  { hastaRef: null as number | null, tasa: 0.035, etiqueta: 'Tramo alto' },
];

/** Motos de más de 125 c.c.: tarifa única del 1,5% (art. 145 Ley 488/1998). Por debajo, no gravadas. */
export const MOTO = { cilindradaGravadaDesde: 125, tasa: 0.015 };

/** Vehículos eléctricos e híbridos: tarifa reducida como incentivo (Ley 1964 de 2019). */
export const ELECTRICO = { tasaElectrico: 0.01, tasaHibrido: 0.015 };

/** SOAT de motos — tabla maestra verificada (Superfinanciera, vigente desde 01-01-2026). */
export const SOAT_MOTO = SOAT_MOTO_2026;

/** Revisión tecnomecánica de motos — tabla maestra verificada. */
export const TECNO_MOTO = TECNOMECANICA_MOTO_2026;

/**
 * ⚠️ REFERENCIAL — SOAT de automóvil particular por cilindraje y antigüedad.
 * La tarifa real la fija el Gobierno por decreto y es idéntica en todas las
 * aseguradoras. Estos valores vienen de la fórmula vieja y NO están en la tabla
 * maestra: el campo del hub es editable.
 */
export const SOAT_CARRO_REF: Record<string, number> = {
  'hasta1500': 990_000,
  'hasta2000': 1_100_000,
  'mas2000': 1_300_000,
};

/** ⚠️ REFERENCIAL — revisión tecnomecánica de automóvil. La fija cada CDA dentro del tope oficial. */
export const TECNO_CARRO_REF = 320_000;

/** ⚠️ REFERENCIAL — tarifas de trámite de traspaso y matrícula (RUNT / organismos de tránsito). */
export const TRAMITES_REF = {
  traspasoCarro: 260_400,
  traspasoMoto: 145_500,
  retencionTraspaso: 0.01,
  matriculaCarro: 950_000,
  matriculaMoto: 420_000,
};

/**
 * Tarifas de taxi de Bogotá — tabla maestra verificada (Decreto Distrital 042 de 2026).
 * Se usan para la comparación de cierre del hub: cuánto te costaría el mismo
 * kilometraje en taxi en vez de en carro propio. La unidad vale por cada 100 m.
 */
export const TAXI = TAXI_BOGOTA_2026;

/** Descuento típico por pago anticipado del impuesto de vehículos, según departamento. */
export const DESCUENTO_ANTICIPADO_REF = 0.1;

const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

export const hub: HubData = {
  slug: 'co/automotor/costo-de-tener-carro',
  title: 'Cuánto cuesta tener carro o moto en Colombia: impuesto, SOAT y tecnomecánica',
  description:
    'Sumá el costo real anual de tu vehículo en Colombia: impuesto de vehículos con la escala del art. 145 de la Ley 488, SOAT, revisión tecnomecánica y combustible, más matrícula o traspaso.',
  silo: 'Automotor',
  siloHref: '/co/automotor',
  locale: 'co',

  eyebrow: 'Colombia · costo anual del vehículo',
  h1: '¿Cuánto me cuesta de verdad tener este carro al año?',
  lede:
    'La cuota del crédito es la parte que todos miran. Lo que descuadra el presupuesto es el resto: impuesto de vehículos, SOAT, tecnomecánica y combustible, que llegan en momentos distintos del año y suman más que varias cuotas juntas. Acá salen todos, con el costo por mes y por kilómetro.',
  stamps: [
    'Art. 145 de la Ley 488 de 1998',
    `SOAT y tecnomecánica de moto verificados`,
    '10 calculadoras adentro',
  ],

  resultLabel: 'Lo que te cuesta el vehículo al año',

  cases: {
    title: '¿Qué vehículo tenés?',
    intro:
      'El impuesto y el SOAT cambian bastante entre carro, moto y eléctrico. Elegí el tuyo y el hub arma la cuenta completa.',
    items: [
      {
        id: 'carro',
        label: 'Carro particular',
        hint: 'Escala del 1,5% al 3,5% sobre el avalúo',
        answer: 'El impuesto sube con el avalúo comercial del vehículo, del 1,5% al 3,5%.',
        yes: [
          'Impuesto de vehículos sobre el avalúo comercial que fija el Ministerio de Transporte cada año',
          'SOAT anual, obligatorio y de tarifa regulada',
          'Revisión tecnomecánica, obligatoria desde el sexto año para vehículos particulares nuevos',
          'Combustible según tus kilómetros y el rendimiento real del vehículo',
          'Descuento por pago anticipado del impuesto, donde el departamento lo ofrezca',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La tarifa del impuesto NO es marginal: la del tramo se aplica sobre todo el avalúo. Cruzar de tramo por poca plata puede subir el impuesto bastante más de lo que subió el avalúo',
          'La base es el avalúo comercial oficial del Ministerio de Transporte, no lo que vos pagaste ni lo que creés que vale',
          '⚠️ Los umbrales en pesos de cada tramo se actualizan por resolución cada año: los valores cargados acá son de referencia y podés editarlos',
          'Circular sin SOAT o sin tecnomecánica vigente es infracción tipo C con inmovilización del vehículo',
        ],
        plazo: 'el impuesto vence entre mayo y junio según el departamento; el descuento por pago anticipado suele ser en marzo o abril.',
      },
      {
        id: 'moto',
        label: 'Moto',
        hint: 'Sólo desde 125 c.c. paga impuesto',
        answer: `Por debajo de ${MOTO.cilindradaGravadaDesde} c.c. la moto no paga impuesto de vehículos.`,
        yes: [
          `Las motos de más de ${MOTO.cilindradaGravadaDesde} c.c. pagan el ${(MOTO.tasa * 100).toFixed(1).replace('.', ',')}% del avalúo comercial`,
          `SOAT según cilindraje: desde ${cop(SOAT_MOTO.menos100cc)} hasta ${cop(SOAT_MOTO.mas200cc)}`,
          `Revisión tecnomecánica entre ${cop(TECNO_MOTO.min)} y ${cop(TECNO_MOTO.max)} según antigüedad y CDA`,
          'Combustible, que en moto suele ser la parte más chica del total',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Que no pague impuesto por ser de menos de ${MOTO.cilindradaGravadaDesde} c.c. no la exime del SOAT ni de la tecnomecánica: esas son obligatorias siempre`,
          'La tecnomecánica de motos es obligatoria desde el segundo año, antes que en carros particulares',
          'El SOAT de moto es el más caro en relación al valor del vehículo: en motos de bajo cilindraje puede pesar más que el impuesto',
        ],
        plazo: 'el SOAT vence en la fecha exacta de su expedición: un día tarde ya es infracción.',
      },
      {
        id: 'electrico',
        label: 'Eléctrico o híbrido',
        hint: 'Tarifa reducida · Ley 1964 de 2019',
        answer: 'Los eléctricos pagan tarifa reducida de impuesto y además están exentos de pico y placa.',
        yes: [
          `Impuesto de vehículos con tarifa reducida: ${(ELECTRICO.tasaElectrico * 100).toFixed(1).replace('.', ',')}% para eléctricos y ${(ELECTRICO.tasaHibrido * 100).toFixed(1).replace('.', ',')}% para híbridos`,
          'Exención de pico y placa en las principales ciudades',
          'SOAT y tecnomecánica normales, sin descuento',
          'Costo de recarga en vez de combustible, bastante más bajo por kilómetro',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El beneficio es sobre el impuesto de vehículos y la restricción de circulación, no sobre el SOAT ni la tecnomecánica: esos se pagan completos',
          'Los híbridos tienen tratamiento distinto según la ciudad y la categoría ambiental: verificá el tuyo antes de asumir la exención de pico y placa',
          'El ahorro en energía frente a combustible depende mucho de si cargás en casa con tarifa residencial o en carga rápida pública',
        ],
        plazo: 'los incentivos de la Ley 1964 tienen vigencias definidas: revisá que sigan aplicando a tu modelo.',
      },
      {
        id: 'compra',
        label: 'Lo estoy comprando (nuevo o usado)',
        hint: 'Matrícula o traspaso, una sola vez',
        answer: 'Sumale el trámite: matrícula si es nuevo, traspaso más retención del 1% si es usado.',
        yes: [
          'Matrícula inicial si el vehículo es nuevo: derechos de tránsito, placas y RUNT',
          `Traspaso si es usado: tarifa del trámite más la retención del ${(TRAMITES_REF.retencionTraspaso * 100).toFixed(0)}% sobre el avalúo`,
          'El primer año de impuesto, SOAT y tecnomecánica ya proyectados',
        ],
        warn: [
          DISCLAIMER_TAX,
          `La retención del ${(TRAMITES_REF.retencionTraspaso * 100).toFixed(0)}% en el traspaso está a cargo del vendedor por ley, pero en la práctica se negocia: dejá claro por escrito quién la paga antes de firmar`,
          'Antes de traspasar, verificá comparendos pendientes: un comparendo impago bloquea el trámite y termina pagándolo el comprador para poder cerrar',
          '⚠️ Las tarifas de matrícula y traspaso las fija cada organismo de tránsito y varían por ciudad: las de acá son de referencia',
        ],
        plazo: 'el traspaso debe hacerse dentro de los 60 días hábiles siguientes a la venta; pasado ese plazo hay sanción.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu vehículo',
  inputsIntro:
    'El avalúo comercial es el que publica el Ministerio de Transporte cada año, no el precio que pagaste. Todo lo demás podés ajustarlo a tu caso.',
  fields: [
    {
      id: 'avaluo',
      label: 'Avalúo comercial del vehículo (COP)',
      prefix: '$',
      value: '75.000.000',
      thousands: true,
      help: 'El de la tabla del Ministerio de Transporte para tu marca, línea y modelo.',
    },
    {
      id: 'cilindraje',
      label: 'Cilindraje (c.c.)',
      type: 'number',
      value: 1600,
      min: 0,
      max: 8000,
      step: 50,
      help: `En motos define el SOAT y si paga impuesto (sólo desde ${MOTO.cilindradaGravadaDesde} c.c.).`,
    },
    {
      id: 'umbral1',
      label: 'Tope del tramo del 1,5% (COP)',
      prefix: '$',
      value: '60.000.000',
      thousands: true,
      help: '⚠️ Se actualiza por resolución cada año y no está en la tabla maestra del sitio: verificá el vigente y ajustalo.',
    },
    {
      id: 'umbral2',
      label: 'Tope del tramo del 2% (COP)',
      prefix: '$',
      value: '135.000.000',
      thousands: true,
      help: '⚠️ También referencial. Por encima de este valor la tarifa salta al 3,5%.',
    },
    {
      id: 'soat',
      label: 'Valor del SOAT (COP)',
      prefix: '$',
      value: '1.100.000',
      thousands: true,
      help: 'Tarifa regulada: es la MISMA en todas las aseguradoras. En motos se calcula solo por cilindraje.',
    },
    {
      id: 'tecno',
      label: 'Revisión tecnomecánica (COP)',
      prefix: '$',
      value: '320.000',
      thousands: true,
      help: 'Varía por CDA dentro del tope oficial. Dejalo en cero si tu vehículo todavía no está obligado.',
    },
    {
      id: 'kmMes',
      label: 'Kilómetros que recorrés por mes',
      type: 'number',
      value: 800,
      min: 0,
      max: 20000,
      step: 50,
      help: 'Para calcular el combustible y el costo por kilómetro.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento (km por galón)',
      type: 'number',
      value: 38,
      min: 1,
      max: 200,
      step: 1,
      help: 'El real de tu vehículo. En moto suele estar entre 100 y 150.',
    },
    {
      id: 'precioGalon',
      label: 'Precio del galón (COP)',
      prefix: '$',
      value: '16.500',
      thousands: true,
      help: 'Cambia mes a mes y por ciudad: poné el de tu estación habitual.',
    },
    {
      id: 'anticipado',
      label: '¿Pagás el impuesto con descuento por pago anticipado?',
      type: 'select',
      value: 'si',
      options: [
        { value: 'si', label: 'Sí' },
        { value: 'no', label: 'No' },
      ],
      help: 'No todos los departamentos lo ofrecen, y el porcentaje varía.',
    },
    {
      id: 'tramite',
      label: 'Trámite de compra',
      type: 'select',
      value: 'ninguno',
      options: [
        { value: 'ninguno', label: 'Ninguno, ya es mío' },
        { value: 'matricula', label: 'Matrícula de vehículo nuevo' },
        { value: 'traspaso', label: 'Traspaso de vehículo usado' },
      ],
      help: 'Costo de una sola vez, se suma aparte del costo anual recurrente.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'En qué se te va la plata del vehículo',
    caption:
      'Reparte el costo anual entre impuesto, SOAT, tecnomecánica y combustible. En vehículos de bajo valor el combustible domina; en los caros, el impuesto se lleva la mayor parte.',
  },
  breakdownTitle: 'El costo anual, concepto por concepto',
  breakdownIntro:
    'Primero el impuesto con su tramo y su tarifa, después los obligatorios anuales, después el combustible, y al final el costo mensual y por kilómetro.',

  faq: [
    {
      q: '¿Cómo se calcula el impuesto de vehículos en Colombia?',
      a: 'Avalúo comercial por tarifa, según la escala del art. 145 de la Ley 488 de 1998: 1,5% para el tramo bajo, 2% para el medio y 3,5% para el alto, sobre el avalúo que publica el Ministerio de Transporte cada año. Las motos de más de 125 c.c. pagan 1,5% y las de menos no pagan. La tarifa del tramo se aplica sobre todo el avalúo, no sólo sobre el excedente.',
    },
    {
      q: '¿El impuesto de vehículos cambia según el departamento?',
      a: 'No, y este es un error muy repetido. Las tarifas las fija la ley nacional y son iguales en todo el país: los departamentos son los que recaudan y administran el impuesto, no los que ponen la tarifa. Lo que sí cambia por departamento son las fechas de vencimiento y si ofrecen o no descuento por pago anticipado. Si ves una tabla de "tarifas por departamento" con porcentajes distintos, está mal.',
    },
    {
      q: '¿Puedo cotizar el SOAT más barato en otra aseguradora?',
      a: 'No. El SOAT es un seguro obligatorio de tarifa regulada: el precio lo fija el Gobierno por decreto según el tipo de vehículo, el cilindraje y la antigüedad, y es idéntico en todas las compañías. Lo único que puede variar es el servicio y la facilidad para comprarlo. Cualquier comparador que te muestre precios distintos de SOAT entre aseguradoras te está desinformando.',
    },
    {
      q: '¿Cuánto cuesta el SOAT de una moto?',
      a: `Depende del cilindraje. Con las tarifas vigentes: ciclomotor ${cop(SOAT_MOTO.ciclomotor)}, menos de 100 c.c. ${cop(SOAT_MOTO.menos100cc)}, entre 100 y 200 c.c. ${cop(SOAT_MOTO.de100a200cc)}, más de 200 c.c. ${cop(SOAT_MOTO.mas200cc)} y motocarro ${cop(SOAT_MOTO.motocarro)}. El salto entre 200 c.c. y más de 200 c.c. es enorme, así que en la frontera vale la pena mirar el cilindraje exacto de la ficha técnica.`,
    },
    {
      q: '¿Desde cuándo tengo que hacer la revisión tecnomecánica?',
      a: 'Los vehículos particulares nuevos la hacen por primera vez a los seis años de la matrícula, y después todos los años. Las motos nuevas la hacen a los dos años, y luego anualmente. Los vehículos de servicio público la hacen desde el primer año. Circular con la tecnomecánica vencida es infracción tipo C con inmovilización.',
    },
    {
      q: '¿Cuánto cuesta la revisión tecnomecánica?',
      a: `En motos está entre ${cop(TECNO_MOTO.min)} y ${cop(TECNO_MOTO.max)} según antigüedad y CDA. En automóviles ronda los ${cop(TECNO_CARRO_REF)}, con variación entre centros de diagnóstico. El precio tiene un tope oficial, pero dentro de ese tope cada CDA fija el suyo, así que sí vale la pena comparar acá (a diferencia del SOAT).`,
    },
    {
      q: '¿Qué pasa si no pago el impuesto de vehículos?',
      a: 'Corren intereses de mora y sanción por extemporaneidad. Además el vehículo queda con deuda en el RUNT, lo que impide traspasarlo, renovar la matrícula o sacar el SOAT en algunos casos. Los departamentos hacen cobro coactivo con embargo, y periódicamente abren amnistías con condonación parcial de intereses, que es el momento en que conviene ponerse al día si venís atrasado.',
    },
    {
      q: '¿Cuánto ahorro con un carro eléctrico?',
      a: `Por tres vías. El impuesto de vehículos baja al ${(ELECTRICO.tasaElectrico * 100).toFixed(1).replace('.', ',')}% en vez del 1,5% a 3,5% de la escala general. Está exento de pico y placa en las principales ciudades, lo que evita el permiso solidario o el riesgo de comparendo. Y la energía por kilómetro cuesta bastante menos que el combustible, sobre todo si cargás en casa. Lo que no cambia es el SOAT ni la tecnomecánica.`,
    },
    {
      q: '¿Quién paga la retención del 1% en el traspaso?',
      a: `Por ley está a cargo del vendedor, porque es un anticipo del impuesto sobre la utilidad de la venta. En la práctica se negocia, y no es raro que el comprador termine asumiéndola total o parcialmente para cerrar el trato. Lo importante es dejarlo por escrito antes de firmar: la retención sobre un vehículo de avalúo alto no es un monto menor.`,
    },
    {
      q: '¿Cuánto cuesta matricular un carro nuevo?',
      a: `Los derechos de tránsito, las placas y el registro en el RUNT, que en conjunto rondan el orden de ${cop(TRAMITES_REF.matriculaCarro)} para un automóvil y ${cop(TRAMITES_REF.matriculaMoto)} para una moto, con variación importante entre organismos de tránsito. A eso hay que sumarle el SOAT del primer año, que es obligatorio para poder matricular, y el impuesto proporcional al tiempo que reste del año.`,
    },
    {
      q: '¿Me sale más barato usar taxi que tener carro?',
      a: `Depende casi por completo de cuánto manejes. En Bogotá la tarifa la fija el Decreto Distrital 042 de 2026: banderazo de ${cop(TAXI_BOGOTA_2026.banderazoPesos.basico)}, ${cop(TAXI_BOGOTA_2026.unidadPesos.basico)} por cada 100 metros y carrera mínima de ${cop(TAXI_BOGOTA_2026.carreraMinimaPesos.basico)}, más recargos nocturno y de aeropuerto. Eso da un costo por kilómetro muy superior al de tu propio carro, pero sin impuesto, sin SOAT, sin tecnomecánica y sin depreciación. El punto de cruce suele estar bastante más abajo de lo que la gente cree: por debajo de unos pocos cientos de kilómetros al mes, el carro propio casi nunca se justifica sólo por costo.`,
    },
    {
      q: '¿Cuál es el costo real por kilómetro de tener carro?',
      a: 'Los cuatro rubros de este hub —impuesto, SOAT, tecnomecánica y combustible— son el piso, no el total. Falta mantenimiento preventivo, llantas, parqueadero, lavado y la depreciación del vehículo, que suele ser el costo más grande de todos y el que nadie contabiliza porque no llega como factura. Si estás comparando tener carro contra usar aplicaciones o transporte público, la depreciación es la que decide la cuenta.',
    },
  ],

  sources: [
    {
      name: 'Ley 488 de 1998, art. 145 — tarifas del impuesto sobre vehículos automotores',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=186',
      publisher: 'Función Pública',
    },
    {
      name: 'Ley 1964 de 2019 — incentivos para vehículos eléctricos',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=97066',
      publisher: 'Función Pública',
    },
    {
      name: 'Ministerio de Transporte — avalúo comercial de vehículos y normativa de tránsito',
      url: 'https://www.mintransporte.gov.co/',
      publisher: 'Ministerio de Transporte',
    },
    {
      name: 'Superintendencia Financiera — tarifas del SOAT',
      url: 'https://www.superfinanciera.gov.co/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
    {
      name: 'Decreto Distrital 042 de 2026 — tarifas de taxi en Bogotá',
      url: 'https://www.movilidadbogota.gov.co/',
      publisher: 'Secretaría Distrital de Movilidad de Bogotá',
      date: '12-02-2026',
    },
    {
      name: 'RUNT — consulta de vehículos, comparendos y trámites',
      url: 'https://www.runt.gov.co/',
      publisher: 'Registro Único Nacional de Tránsito',
    },
    {
      name: 'Ley 769 de 2002 — Código Nacional de Tránsito',
      url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5557',
      publisher: 'Función Pública',
    },
  ],

  replaces: [
    '/co/calculadora-impuesto-vehiculos-colombia-2026-departamento',
    '/co/calculadora-impuesto-vehiculos-bogota-2026-tabla',
    '/co/calculadora-impuesto-circulacion-vehiculo-electrico-colombia',
    '/co/calculadora-soat-colombia-precio-2026-vehiculo',
    '/co/calculadora-revision-tecnomecanica-colombia-precio-multa',
    '/co/calculadora-costo-anual-moto-colombia-2026-soat-tecnomecanica',
    '/co/calculadora-precio-gasolina-acpm-galon-colombia-2026',
    '/co/calculadora-costo-matricula-vehiculo-nuevo-colombia-2026',
    '/co/calculadora-traspaso-vehiculo-colombia-2026',
    '/co/calculadora-tarifa-taxi-bogota-2026-unidades-recargos',
  ],

  lastReviewed: '2026-07-28',
};
