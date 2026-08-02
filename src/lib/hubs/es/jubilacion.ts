import type { HubData } from '../types';
import { PENSIONES_2026, BRECHA_GENERO_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "¿Cuándo me puedo jubilar y con qué pensión?"
 *
 * Absorbe 5 calculadoras: pensión de jubilación por años cotizados, jubilación
 * anticipada con coeficientes reductores, revalorización con el IPC, complemento
 * de brecha de género y pensión de viudedad.
 *
 * Constantes: src/lib/data/espana-2026.ts (PENSIONES_2026, BRECHA_GENERO_2026),
 * porcentajes y coeficientes espejados de
 * src/lib/formulas/jubilacion-espana-2026-pension-anos-cotizados.ts y
 * src/lib/formulas/jubilacion-anticipada-coeficientes-reductores-espana-2026.ts.
 *
 * OJO: la fórmula vieja de jubilación lleva la pensión máxima a 3.267,60 €/mes
 * mientras que espana-2026.ts la sitúa en 3.355,72 €. Se usa la del fichero de
 * datos, que es la fuente mantenida, y la discrepancia queda reportada.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal/plata). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verifica el organismo fiscal aplicable y consulta a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/trabajo/jubilacion',
  title: 'Jubilación en España: cuándo puedes jubilarte y con qué pensión',
  description:
    'Calcula tu pensión de jubilación según años cotizados y base reguladora, lo que te quita jubilarte antes, la revalorización con el IPC y la pensión de viudedad.',
  silo: 'Trabajo',
  siloHref: '/es/trabajo',

  eyebrow: 'Guía y estimación de pensiones',
  h1: '¿Cuándo me puedo jubilar y cuánto voy a cobrar?',
  lede:
    'La pensión española sale de tres números: la base reguladora, que resume lo que cotizaste; el porcentaje que te da tu carrera de cotización; y el coeficiente que se aplica si te jubilas antes de tiempo. Encima de todo hay un tope: por mucho que hayas cotizado, la pensión máxima no se supera.',
  stamps: ['Ley General de la Seguridad Social', 'Revalorización con el IPC', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Qué quieres calcular?',
    intro: 'La edad ordinaria depende de lo cotizado, y adelantarla tiene precio.',
    items: [
      {
        id: 'ordinaria',
        label: 'Jubilación ordinaria',
        hint: 'A la edad legal que me toca',
        answer:
          'A la edad ordinaria cobras el porcentaje completo que te dé tu carrera de cotización, sin recortes.',
        yes: [
          'Base reguladora calculada con las bases de cotización de los últimos años',
          '50% de la base con 15 años cotizados, que es el mínimo para tener pensión',
          'El porcentaje sube por meses cotizados hasta llegar al 100%',
          'Tope de la pensión máxima y suelo de la pensión mínima',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La edad ordinaria está en un calendario transitorio: se jubila antes quien acredita carreras largas de cotización',
          'La base reguladora se calcula con un período largo de bases, así que los últimos años de sueldo alto no compensan una carrera irregular',
          'La pensión de jubilación tributa en el IRPF como rendimiento del trabajo',
        ],
        plazo: 'se puede solicitar desde tres meses antes de la fecha prevista de jubilación.',
      },
      {
        id: 'anticipada_voluntaria',
        label: 'Jubilación anticipada voluntaria',
        hint: 'Hasta 24 meses antes',
        answer:
          'Adelantarla por decisión propia aplica un coeficiente reductor por cada mes de anticipación, y el recorte es para siempre.',
        yes: [
          'Hasta 24 meses de anticipación sobre la edad ordinaria',
          'Coeficiente reductor mensual, menor cuanto más larga sea tu carrera de cotización',
          'Exige un mínimo de años cotizados y que la pensión resultante supere la mínima',
          'El recorte es definitivo: no se recupera al llegar a la edad ordinaria',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Los coeficientes usados son los del tramo que corresponde a tu carrera: la Seguridad Social aplica una tabla detallada por meses',
          'Anticipar dos años puede costar en torno a un 20% de pensión de por vida',
        ],
        plazo: 'la solicitud debe presentarse antes de la fecha de efectos deseada.',
      },
      {
        id: 'anticipada_involuntaria',
        label: 'Jubilación anticipada involuntaria',
        hint: 'Hasta 48 meses antes, por cese ajeno',
        answer:
          'Si el cese no depende de ti, puedes adelantarla hasta cuatro años y con coeficientes más suaves.',
        yes: [
          'Hasta 48 meses de anticipación',
          'Coeficientes reductores más benignos que en la voluntaria',
          'Exige que el cese se deba a causa no imputable al trabajador',
          'Requiere estar inscrito como demandante de empleo durante un tiempo previo',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Hay que acreditar documentalmente la causa del cese: no vale una baja voluntaria disfrazada',
          'El recorte, aunque menor, también es de por vida',
        ],
        plazo: 'hay que acreditar la inscripción como demandante de empleo en el plazo exigido.',
      },
      {
        id: 'viudedad',
        label: 'Pensión de viudedad',
        hint: 'Del 52% al 70% de la base',
        answer:
          'La viudedad es el 52% de la base reguladora, que sube al 60% o al 70% según edad, rentas y cargas familiares.',
        yes: [
          'Porcentaje general del ' + PENSIONES_2026.viudedad.general + '% de la base reguladora',
          PENSIONES_2026.viudedad.mayor65SinRentas + '% para mayores de 65 sin otra pensión ni rentas de trabajo',
          'Hasta el ' + PENSIONES_2026.viudedad.cargasFamiliares + '% con cargas familiares y límites de renta',
          'Pensiones mínimas garantizadas según edad y cargas',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'El porcentaje ampliado exige mantener los requisitos: si suben tus rentas, vuelve al general',
          'En caso de divorcio la pensión se reparte en proporción al tiempo de convivencia con cada cónyuge',
        ],
        plazo: 'solicitada dentro de los tres meses siguientes al fallecimiento, tiene efectos desde el día siguiente.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'La base reguladora aproximada es la media de tus bases de cotización de los últimos años. Si no la sabes, usa tu salario bruto mensual como referencia.',
  fields: [
    { id: 'base', label: 'Base reguladora mensual estimada', prefix: '€', value: '2.000', thousands: true },
    { id: 'aniosCotizados', label: 'Años cotizados', type: 'number', value: '35', min: 0, max: 50, step: 1 },
    {
      id: 'mesesAnticipados',
      label: 'Meses que quieres anticipar la jubilación',
      type: 'number',
      value: '0',
      min: 0,
      max: 48,
      step: 1,
      help: 'Máximo 24 en la voluntaria y 48 en la involuntaria.',
    },
    {
      id: 'hijos',
      label: 'Hijos a efectos del complemento de brecha de género',
      type: 'number',
      value: '0',
      min: 0,
      max: 4,
      step: 1,
      help: 'Se reconoce a partir del primer hijo y hasta cuatro.',
    },
    {
      id: 'ipc',
      label: 'IPC de referencia para la revalorización',
      type: 'number',
      value: PENSIONES_2026.revalorizacionPct,
      min: 0,
      max: 15,
      step: 0.1,
      suffix: '%',
    },
    {
      id: 'situacionViudedad',
      label: 'Situación (sólo para la rama de viudedad)',
      type: 'select',
      value: 'general',
      options: [
        { value: 'general', label: 'General' },
        { value: 'mayor65', label: 'Mayor de 65 sin otra pensión ni rentas de trabajo' },
        { value: 'cargas', label: 'Con cargas familiares y límite de rentas' },
      ],
    },
    {
      id: 'pagas',
      label: 'Número de pagas',
      type: 'select',
      value: '14',
      options: [
        { value: '14', label: '14 pagas' },
        { value: '12', label: '12 pagas' },
      ],
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'bars',
    title: 'Tu pensión frente a los límites',
    caption:
      'Compara la pensión que te sale con la máxima del sistema y con lo que perderías por anticipar la jubilación.',
  },
  breakdownTitle: 'Cómo se calcula tu pensión',
  breakdownIntro:
    'Los importes son mensuales salvo donde se indica. Las filas de porcentaje y de años llevan su unidad.',

  faq: [
    {
      q: '¿A qué edad me puedo jubilar?',
      a: 'Depende de lo cotizado. El sistema mantiene dos puertas: quien acredita una carrera larga se jubila antes que quien tiene una carrera corta, con un calendario transitorio que va endureciendo la edad año a año. Por eso la respuesta no es una edad fija sino una combinación de edad y años cotizados.',
    },
    {
      q: '¿Qué es la base reguladora?',
      a: 'Es la media de tus bases de cotización de un período largo inmediatamente anterior a la jubilación, actualizadas con el IPC salvo las más recientes. No es tu último sueldo: una carrera irregular con años de paro o de bases bajas arrastra la media hacia abajo aunque acabes ganando mucho.',
    },
    {
      q: '¿Cuántos años hay que cotizar para tener pensión?',
      a: 'Quince años como mínimo, y al menos dos de ellos dentro de los quince inmediatamente anteriores al hecho causante. Con quince años justos se cobra el 50% de la base reguladora; a partir de ahí el porcentaje sube por meses cotizados hasta alcanzar el 100%.',
    },
    {
      q: '¿Cuánto pierdo por jubilarme antes?',
      a: 'Se aplica un coeficiente reductor por cada mes de anticipación, más suave cuanto más larga sea tu carrera de cotización y cuando el cese no depende de ti. Adelantar dos años de forma voluntaria puede costar en torno a un 20% de pensión, y el recorte no se recupera nunca: se arrastra el resto de la vida.',
    },
    {
      q: '¿Existe una pensión máxima?',
      a: 'Sí. Por mucho que hayas cotizado, la pensión no supera el tope anual que fija la ley, y ese tope se aplica después de calcular tu porcentaje. Es la razón por la que cotizar por bases muy altas durante los últimos años tiene un rendimiento decreciente.',
    },
    {
      q: '¿Cómo se revalorizan las pensiones?',
      a: 'Con el IPC medio interanual del período que fija la ley, de forma automática y con garantía de mantener el poder adquisitivo. Si el IPC es negativo, la pensión no baja: se mantiene. La subida se aplica en enero sobre el importe del año anterior.',
    },
    {
      q: '¿Qué es el complemento de brecha de género?',
      a: 'Un importe mensual adicional por cada hijo, hasta cuatro, que se reconoce al progenitor cuya carrera de cotización se vio perjudicada. Se cobra en todas las pagas y se suma a la pensión de jubilación, de incapacidad permanente o de viudedad, aunque no puede reconocerse a los dos progenitores a la vez.',
    },
    {
      q: '¿Cuánto se cobra de pensión de viudedad?',
      a: 'El 52% de la base reguladora del fallecido con carácter general. Sube al 60% si el beneficiario tiene 65 años o más y no cobra otra pensión ni tiene rentas de trabajo, y hasta el 70% cuando hay cargas familiares, la pensión es la fuente principal de ingresos y no se superan ciertos límites de renta.',
    },
    {
      q: '¿La viudedad es compatible con trabajar?',
      a: 'Sí, la pensión de viudedad es compatible con el trabajo y con la mayoría de rentas. Lo que no es compatible es el porcentaje ampliado del 60% o del 70%, que exige precisamente no tener esos ingresos.',
    },
    {
      q: '¿Puedo trabajar cobrando la pensión de jubilación?',
      a: 'Sí, mediante las modalidades de jubilación activa o parcial, que permiten compatibilizar trabajo y pensión en distintos porcentajes según los requisitos que cumplas. La jubilación anticipada, en cambio, es mucho más restrictiva al respecto.',
    },
    {
      q: '¿Cómo pido mi informe de vida laboral?',
      a: 'En la sede electrónica de la Seguridad Social con certificado digital, Cl@ve o mediante SMS con el número de afiliación. Ese informe y el de bases de cotización son la única forma seria de estimar tu pensión: cualquier cálculo hecho de memoria fallará.',
    },
  ],

  sources: [
    {
      name: 'Ley General de la Seguridad Social — jubilación, base reguladora y porcentajes',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Seguridad Social — cuantía y cálculo de la pensión de jubilación',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Seguridad Social — jubilación anticipada y coeficientes reductores',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10963/28393/28396',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Seguridad Social — pensión de viudedad',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10952/28479',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
    {
      name: 'Complemento para la reducción de la brecha de género',
      url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/complemento-brecha-genero',
      publisher: 'Instituto Nacional de la Seguridad Social',
    },
  ],

  replaces: [
    '/calculadora-jubilacion-espana-2026-pension-anos-cotizados',
    '/calculadora-jubilacion-anticipada-coeficientes-reductores-espana-2026',
    '/calculadora-revalorizacion-pension-2026-ipc-espana',
    '/calculadora-complemento-brecha-genero-pension-espana-2026',
    '/calculadora-pension-viudedad-cuantia-espana-2026',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

export const PENSIONES = PENSIONES_2026;
export const BRECHA = BRECHA_GENERO_2026;

/**
 * Porcentaje de la base reguladora por carrera de cotización.
 * Espejo de jubilacion-espana-2026-pension-anos-cotizados.ts.
 */
export const PORCENTAJE = {
  mesesMinimos: 180,
  pctMinimo: 50,
  /** Puntos porcentuales por mes cotizado en el primer tramo (hasta 25 años). */
  porMesTramo1: 0.19,
  mesesTramo1: 120,
  /** Puntos porcentuales por mes a partir del año 25. */
  porMesTramo2: 0.18,
  pctMaximo: 100,
};

/**
 * Coeficientes reductores mensuales de la jubilación anticipada.
 * Espejo de jubilacion-anticipada-coeficientes-reductores-espana-2026.ts:
 * son aproximaciones del tramo de la tabla oficial, que es más detallada.
 */
export const ANTICIPACION = {
  coefVoluntaria: [
    [38.5, 0.0088],
    [41.5, 0.0086],
    [44.5, 0.0084],
    [Infinity, 0.0082],
  ] as Array<[number, number]>,
  factorInvoluntaria: 0.85,
  maxMesesVoluntaria: 24,
  maxMesesInvoluntaria: 48,
};
