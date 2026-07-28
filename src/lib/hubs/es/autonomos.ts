import type { HubData } from '../types';
import { RETENCION_AUTONOMO } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Cuánto le tengo que pagar a Hacienda como autónomo?"
 *
 * Absorbe 4 calculadoras sueltas: modelo 130, retención del 15/7% en factura y
 * las dos calculadoras de IVA (que estaban duplicadas entre sí).
 *
 * Constantes: la tabla del RETA sale de
 * src/lib/formulas/autonomo-cuota-2026-espana-rendimiento-neto.ts (la misma que
 * alimenta /es/datos-cuota-autonomos-2026) y los porcentajes de retención de
 * src/lib/data/espana-2026.ts. Nada de memoria.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/impuestos/autonomos',
  title: 'Impuestos de autónomo en España: cuota, modelo 130, IVA y retención en factura',
  description:
    'Calcula lo que te queda como autónomo: cuota del RETA según tu rendimiento neto, retención del 15% o del 7% en factura, pago fraccionado del modelo 130 e IVA del modelo 303.',
  silo: 'Impuestos',
  siloHref: '/es/impuestos',

  eyebrow: 'Guía y estimación fiscal',
  h1: 'Como autónomo, ¿cuánto se lleva Hacienda de lo que facturas?',
  lede:
    'Un autónomo paga por tres vías a la vez: la cuota mensual del RETA, que ya no es plana sino que depende de tu rendimiento neto; el IRPF, que anticipas cada trimestre con el modelo 130 o que te retienen en factura; y el IVA, que no es tuyo aunque pase por tu cuenta. Aquí sale todo junto y en el mismo orden en que lo pagas.',
  stamps: ['Tabla del RETA por tramos', 'Modelos 130 y 303', '4 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué tipo de autónomo eres?',
    intro:
      'La diferencia clave es si tus clientes te retienen IRPF en factura o no: eso decide si presentas el modelo 130 y cuánto anticipas.',
    items: [
      {
        id: 'profesional',
        label: 'Profesional con retención en factura',
        hint: 'Facturas a empresas: te retienen el 15%',
        answer:
          'Si más del 70% de tus ingresos llevan retención, no tienes que presentar el modelo 130: el anticipo ya va en cada factura.',
        yes: [
          'Retención del ' + RETENCION_AUTONOMO.general + '% del IRPF en cada factura a empresas y a otros autónomos',
          'Cuota del RETA según el tramo de rendimiento neto',
          'IVA repercutido menos IVA soportado, liquidado con el modelo 303',
          'Gastos deducibles de la actividad, que bajan el IRPF y la cuota',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La exención del modelo 130 exige que al menos el 70% de tus ingresos del año anterior llevaran retención: si no llegas, hay que presentarlo',
          'La retención de factura no es el impuesto final: la cuenta se cierra en la declaración de la renta',
        ],
        plazo:
          'el modelo 303 del IVA vence el 20 de abril, julio y octubre, y el 30 de enero el del cuarto trimestre.',
      },
      {
        id: 'empresarial',
        label: 'Actividad empresarial, sin retención',
        hint: 'Vendes a particulares: modelo 130',
        answer:
          'Sin retención en factura, anticipas tú el IRPF: el 20% del rendimiento neto acumulado cada trimestre con el modelo 130.',
        yes: [
          'Pago fraccionado del 20% del rendimiento neto acumulado desde el 1 de enero',
          'Se descuentan los pagos fraccionados de trimestres anteriores del mismo año',
          'Cuota del RETA según el tramo de rendimiento neto',
          'IVA repercutido menos IVA soportado, liquidado con el modelo 303',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'El modelo 130 es acumulativo: si un trimestre va flojo, el pago puede salir cero o negativo, y ese negativo se arrastra',
          'Presentar el 130 fuera de plazo con resultado a ingresar lleva recargo automático',
        ],
        plazo: 'el modelo 130 vence el 20 de abril, julio y octubre, y el 30 de enero.',
      },
      {
        id: 'nuevo',
        label: 'Recién dado de alta',
        hint: 'Tarifa plana y retención del ' + RETENCION_AUTONOMO.nuevos + '%',
        answer:
          'El primer año pagas tarifa plana en la cuota y puedes aplicar el ' +
          RETENCION_AUTONOMO.nuevos +
          '% de retención en factura en vez del ' +
          RETENCION_AUTONOMO.general +
          '%.',
        yes: [
          'Tarifa plana de la cuota de autónomos durante el primer año, prorrogable si el rendimiento es bajo',
          'Retención reducida del ' + RETENCION_AUTONOMO.nuevos + '% el año de alta y los dos siguientes',
          'Mismos modelos 130 y 303 que el resto',
          'Gastos de puesta en marcha deducibles',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La retención reducida es opcional: reduce lo que anticipas, pero sube lo que te sale a pagar en la declaración',
          'La prórroga de la tarifa plana un segundo año exige que el rendimiento neto quede por debajo del salario mínimo',
        ],
        plazo: 'la retención reducida sólo dura el año de alta y los dos siguientes.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'La facturación va sin IVA. Los gastos son los deducibles de la actividad: alquiler, suministros, material, asesoría, seguros.',
  fields: [
    { id: 'facturacion', label: 'Facturación anual sin IVA', prefix: '€', value: '40.000', thousands: true },
    { id: 'gastos', label: 'Gastos deducibles anuales', prefix: '€', value: '8.000', thousands: true },
    {
      id: 'tipoIva',
      label: 'Tipo de IVA que repercutes',
      type: 'select',
      value: '21',
      options: [
        { value: '21', label: 'General 21% (la mayoría de servicios y bienes)' },
        { value: '10', label: 'Reducido 10% (hostelería, transporte, vivienda nueva)' },
        { value: '4', label: 'Superreducido 4% (pan, leche, libros, medicamentos)' },
        { value: '0', label: 'Actividad exenta (sanidad, enseñanza reglada, seguros)' },
      ],
      help: 'Los tipos y las categorías están en el art. 91 de la Ley 37/1992.',
    },
    {
      id: 'ivaSoportado',
      label: 'IVA soportado anual (el de tus compras)',
      prefix: '€',
      value: '1.200',
      thousands: true,
    },
    {
      id: 'societario',
      label: '¿Eres autónomo societario?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, autónomo persona física' },
        { value: 'si', label: 'Sí, administrador de sociedad' },
      ],
      help: 'La deducción por gastos genéricos es del 7% para personas físicas y del 3% para societarios.',
    },
    {
      id: 'tarifaPlana',
      label: '¿Tienes tarifa plana?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No, cuota ordinaria del tramo' },
        { value: 'si', label: 'Sí, 80 € al mes' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'donut',
    title: 'A dónde va lo que facturas',
    caption:
      'De cada euro facturado, una parte se va en gastos, otra en cuota de autónomos, otra en IRPF y el resto es tuyo. El IVA no aparece porque nunca fue tuyo.',
  },
  breakdownTitle: 'Cómo se reparte tu facturación',
  breakdownIntro:
    'Los importes son anuales salvo donde se indica. Las filas de porcentaje y de IVA llevan su unidad.',

  faq: [
    {
      q: '¿De qué depende hoy la cuota de autónomos?',
      a: 'Del rendimiento neto, no de la base que elijas. Desde el sistema de cotización por ingresos reales, la Seguridad Social ordena los rendimientos en quince tramos y a cada uno le corresponde una base mínima y una cuota. Al cierre del año se regulariza: si ganaste más de lo previsto, pagas la diferencia; si ganaste menos, te la devuelven.',
    },
    {
      q: '¿Qué es exactamente el rendimiento neto que mira la Seguridad Social?',
      a: 'Ingresos menos gastos deducibles, y a ese resultado se le aplica una deducción adicional por gastos genéricos del 7% si eres persona física o del 3% si eres autónomo societario. Ese importe, dividido entre doce, es el que determina tu tramo mensual.',
    },
    {
      q: '¿Tengo que presentar el modelo 130?',
      a: 'Sólo si no te retienen suficiente en factura. La regla es que si al menos el 70% de tus ingresos del ejercicio anterior llevaron retención, quedas exento. Los profesionales que facturan a empresas suelen estarlo; quien vende a particulares, casi nunca.',
    },
    {
      q: '¿Cuánto se paga con el modelo 130?',
      a: 'El 20% del rendimiento neto acumulado desde el 1 de enero, restando los pagos fraccionados que ya hiciste ese año y las retenciones que te practicaron. Al ser acumulativo, un trimestre malo puede dar resultado negativo, que se arrastra a los siguientes.',
    },
    {
      q: '¿Me retienen el 15% o el 7%?',
      a: 'El general es el ' + RETENCION_AUTONOMO.general + '%. El ' + RETENCION_AUTONOMO.nuevos +
        '% reducido lo puedes aplicar el año en que te das de alta y los dos siguientes, siempre que no hayas ejercido actividad profesional en el año anterior. Es opcional: retener menos ahora significa pagar más en la declaración.',
    },
    {
      q: '¿La retención se aplica en todas mis facturas?',
      a: 'No. Sólo en las que emites a empresas, sociedades u otros profesionales. Si facturas a un particular, no hay retención, porque un particular no es sujeto obligado a retener. Por eso quien trabaja para consumidores finales acaba presentando el modelo 130.',
    },
    {
      q: '¿El IVA que cobro es dinero mío?',
      a: 'No. Lo recaudas para Hacienda y lo liquidas cada trimestre con el modelo 303, restando el IVA que soportaste en tus compras. Tratarlo como ingreso es el error clásico del primer año: llega el trimestre y el dinero ya no está.',
    },
    {
      q: '¿Qué va al 21%, al 10% y al 4%?',
      a: 'El 21% es el tipo general y cubre la mayoría de servicios profesionales. El 10% se aplica a hostelería, transporte de viajeros, vivienda nueva y buena parte de la alimentación. El 4% queda para pan común, leche, huevos, frutas y verduras, libros, periódicos y medicamentos de uso humano. Los tipos de la alimentación han tenido rebajas temporales que van y vienen: comprueba el tipo vigente antes de emitir la factura.',
    },
    {
      q: '¿La cuota de autónomos se puede deducir?',
      a: 'Sí, es gasto deducible de la actividad. Se resta de los ingresos junto con el resto de gastos antes de aplicar la escala del IRPF, así que reduce tanto la base del impuesto como el rendimiento que determina tu propio tramo de cotización.',
    },
    {
      q: '¿Qué gastos puedo deducirme?',
      a: 'Los vinculados a la actividad y justificados con factura: alquiler y suministros del local, material, asesoría, seguros, formación, cuota del RETA, teléfono y software. Si trabajas en casa puedes deducir un porcentaje de los suministros sobre la superficie afecta. Los que Hacienda revisa con lupa son coche, comidas y móvil.',
    },
    {
      q: '¿Qué pasa si presento un modelo fuera de plazo?',
      a: 'Si sale a ingresar y lo presentas tú antes de que te reclamen, se aplica un recargo por declaración extemporánea que crece con el retraso, sin sanción. Si te lo reclama Hacienda primero, ya es sanción. Presentar tarde una declaración con resultado cero o negativo también se sanciona, aunque con importes pequeños.',
    },
    {
      q: '¿Cuánto debería apartar cada mes para no llevarme sustos?',
      a: 'Una regla prudente es reservar el IVA cobrado en cuanto entra, y encima de eso en torno a un 20% del rendimiento neto para el IRPF. Este cálculo te da las dos cifras del año: divídelas entre doce y esa es la parte de cada cobro que no es tuya.',
    },
  ],

  sources: [
    {
      name: 'Cotización de trabajadores autónomos por ingresos reales — tramos y bases',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/44539',
      publisher: 'Tesorería General de la Seguridad Social',
    },
    {
      name: 'Reglamento del IRPF, art. 110 — pago fraccionado del modelo 130',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley 37/1992 del IVA, art. 91 — tipos reducido y superreducido',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Modelo 303 — autoliquidación trimestral del IVA',
      url: 'https://sede.agenciatributaria.gob.es/Sede/iva/modelo-303.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
    {
      name: 'Modelo 130 — pago fraccionado del IRPF en estimación directa',
      url: 'https://sede.agenciatributaria.gob.es/Sede/irpf/modelo-130.html',
      publisher: 'Agencia Estatal de Administración Tributaria',
    },
  ],

  replaces: [
    '/calculadora-modelo-130-pago-fraccionado-autonomo-espana',
    '/calculadora-retencion-irpf-factura-autonomo-15-7-espana',
    '/calculadora-iva-espana-21-10-4',
    '/calculadora-iva-espana-21-10-4-categorias',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Retenciones en factura. Espejo de src/lib/data/espana-2026.ts. */
export const RETENCIONES = RETENCION_AUTONOMO;

/**
 * Tramos del RETA por rendimiento neto mensual: [rendimiento máximo, cuota mensual].
 * Espejo de TRAMOS_RETA_2026 en
 * src/lib/formulas/autonomo-cuota-2026-espana-rendimiento-neto.ts.
 */
export const TRAMOS_RETA: Array<[number, number]> = [
  [670, 200],
  [900, 220],
  [1166.7, 260],
  [1300, 290],
  [1500, 294],
  [1700, 294],
  [1850, 310],
  [2030, 315],
  [2330, 320],
  [2760, 330],
  [3190, 350],
  [3620, 370],
  [4050, 390],
  [6000, 420],
  [Infinity, 500],
];

export const AUTONOMO_PARAMS = {
  /** Deducción adicional por gastos genéricos (RD-ley 13/2022). */
  reduccionFisica: 0.07,
  reduccionSocietario: 0.03,
  /** Tipo del pago fraccionado del modelo 130 (art. 110.3 RIRPF). */
  tipoPagoFraccionado: 0.2,
  tarifaPlanaMensual: 80,
};

/** Escala general del IRPF (estatal + autonómica agregada), la del rendimiento de actividades. */
export const ESCALA_GENERAL: Array<[number, number]> = [
  [12450, 0.19],
  [20200, 0.24],
  [35200, 0.3],
  [60000, 0.37],
  [300000, 0.45],
  [Infinity, 0.47],
];

/** Mínimo del contribuyente: se le aplica la escala aparte, no se resta de la base. */
export const MINIMO_CONTRIBUYENTE = 5550;
