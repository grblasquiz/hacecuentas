import type { HubData } from '../types';
import { IPREM_2026, SMI_2026 } from '../../data/espana-2026';

/**
 * Hub de decisión ES — "Me quedo sin trabajo: ¿cuánto me corresponde?"
 *
 * Absorbe 5 calculadoras: finiquito y despido improcedente, prestación por
 * desempleo, ERTE vs ERE, subsidio para mayores de 52 años y excedencia
 * voluntaria.
 *
 * DESLINDE: src/lib/hubs/liquidacion-latam.ts tiene una rama de España con la
 * indemnización de 20 días, pero es un hub LATAM comparativo y no reclama
 * ninguna de estas URLs. Este hub es el de España y no toca su `replaces`.
 *
 * Constantes: espejo de
 * src/lib/formulas/finiquito-despido-improcedente-espana-2026.ts y
 * src/lib/formulas/paro-prestacion-desempleo-espana-2026-meses.ts, más
 * src/lib/data/espana-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio fiscal/plata). */
const DISCLAIMER_FISCAL =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const hub: HubData = {
  slug: 'es/trabajo/perder-el-trabajo',
  title: 'Me quedo sin trabajo en España: finiquito, indemnización y paro',
  description:
    'Calcula qué te corresponde al salir de la empresa: finiquito, indemnización de 33 o 20 días por año, prestación por desempleo con sus topes y subsidio para mayores de 52 años.',
  silo: 'Trabajo',
  siloHref: '/es/trabajo',

  eyebrow: 'Guía laboral y estimación',
  h1: 'Me quedo sin trabajo: ¿cuánto me tienen que pagar y de qué vivo?',
  lede:
    'Al salir de una empresa hay tres cosas distintas que la gente confunde: el finiquito, que es lo que ya has ganado y siempre te corresponde; la indemnización, que sólo existe si el despido lo justifica; y el paro, que lo paga el SEPE y depende de lo cotizado. La causa del cese decide cuál de las tres cobras.',
  stamps: ['Estatuto de los Trabajadores', 'Topes del SEPE según IPREM', '5 calculadoras dentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Por qué sales de la empresa?',
    intro: 'La causa lo cambia todo: los días de indemnización, el tope y el derecho al paro.',
    items: [
      {
        id: 'improcedente',
        label: 'Despido improcedente',
        hint: '33 días por año, tope de 24 mensualidades',
        answer:
          'Un despido declarado improcedente da 33 días de salario por año trabajado, con un tope de 24 mensualidades.',
        yes: [
          'Finiquito completo: días del mes, vacaciones no disfrutadas y pagas prorrateadas',
          'Indemnización de 33 días por año, con tope de 24 mensualidades',
          'El tramo trabajado antes del 12 de febrero de 2012 se indemniza a 45 días por año',
          'Derecho a paro desde el día siguiente al cese',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La improcedencia la reconoce la empresa o la declara el juzgado: si no la reconoce, hay que demandar en 20 días hábiles',
          'La indemnización por despido está exenta de IRPF hasta 180.000 €; el finiquito, en cambio, tributa entero',
          'Firmar el finiquito como "saldo y finiquito" sin la coletilla de no conformidad puede complicar la reclamación posterior',
        ],
        plazo: 'tienes 20 días hábiles desde el despido para presentar la papeleta de conciliación.',
      },
      {
        id: 'objetivo',
        label: 'Despido objetivo o por causas de empresa',
        hint: '20 días por año, tope de 12 mensualidades',
        answer:
          'El despido por causas económicas, técnicas, organizativas o de producción da 20 días por año con tope de 12 mensualidades.',
        yes: [
          'Finiquito completo',
          'Indemnización de 20 días por año, tope de 12 mensualidades, a pagar en el momento del cese',
          'Preaviso de 15 días o su equivalente en dinero',
          'Derecho a paro desde el día siguiente al cese',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Si la empresa no pone la indemnización a tu disposición al entregar la carta, el despido puede declararse improcedente',
          'Puedes impugnarlo igualmente si crees que la causa alegada no existe: si el juzgado te da la razón, pasa a 33 días',
        ],
        plazo: 'también 20 días hábiles para impugnar.',
      },
      {
        id: 'fin',
        label: 'Fin de contrato o baja voluntaria',
        hint: 'Sólo finiquito',
        answer:
          'Si te vas tú o vence un contrato temporal, no hay indemnización por despido: sólo finiquito, y el paro únicamente en el fin de contrato.',
        yes: [
          'Días trabajados del mes en curso',
          'Vacaciones generadas y no disfrutadas',
          'Parte proporcional de las pagas extra',
          'En contratos temporales, 12 días por año de indemnización por fin de contrato',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'La baja voluntaria NO da derecho a paro: sólo se recupera si después trabajas y cesas por causa ajena a tu voluntad',
          'Irse sin preavisar lo que marca el convenio permite a la empresa descontar del finiquito los días de preaviso incumplidos',
        ],
        plazo: 'el finiquito se paga en el momento del cese, con la última nómina.',
      },
      {
        id: 'erte',
        label: 'ERTE',
        hint: 'Suspensión temporal, no extinción',
        answer:
          'En un ERTE no te despiden: se suspende el contrato y cobras prestación del SEPE mientras dura, sin indemnización.',
        yes: [
          'Prestación del SEPE del 70% de la base reguladora, con topes según hijos',
          'El contrato sigue vivo: al terminar el ERTE vuelves a tu puesto',
          'La empresa mantiene la obligación de cotizar en la parte que corresponda',
          'Sin indemnización, porque no hay extinción',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Un ERTE puede ser de suspensión total o de reducción de jornada: en el segundo caso cobras una parte de nómina y una parte de prestación',
          'El consumo de paro durante el ERTE puede tener reglas específicas según la norma que lo ampare: confírmalo en el SEPE',
        ],
        plazo: 'la empresa tramita el ERTE ante la autoridad laboral; el SEPE paga a partir de la comunicación.',
      },
      {
        id: 'subsidio52',
        label: 'Subsidio para mayores de 52 años',
        hint: '80% del IPREM hasta la jubilación',
        answer:
          'Agotado el paro, a partir de los 52 años se puede cobrar un subsidio del 80% del IPREM hasta la edad de jubilación.',
        yes: [
          'Cuantía del 80% del IPREM mensual',
          'Se cobra hasta la edad ordinaria de jubilación si se mantienen los requisitos',
          'El SEPE cotiza por jubilación mientras lo cobras, sobre la base mínima',
          'Requiere haber cotizado al menos 15 años, seis de ellos por desempleo',
        ],
        warn: [
          DISCLAIMER_FISCAL,
          'Hay límite de rentas propias: superar el 75% del salario mínimo hace perder el subsidio',
          'Hay que renovar la demanda y comunicar cualquier cambio de ingresos: el cobro indebido se reclama con recargo',
        ],
        plazo: 'se solicita en los 15 días hábiles siguientes al fin del paro o del mes de espera.',
      },
    ],
  },

  inputsTitle: 'Completa lo que sepas',
  inputsIntro:
    'El salario bruto anual incluye pagas extra. La base reguladora del paro se calcula con las bases de cotización de los últimos 180 días.',
  fields: [
    { id: 'brutoAnual', label: 'Salario bruto anual', prefix: '€', value: '28.000', thousands: true },
    { id: 'anios', label: 'Años trabajados en la empresa', type: 'number', value: '5', min: 0, max: 45, step: 0.5 },
    {
      id: 'aniosPre2012',
      label: 'De esos años, ¿cuántos son anteriores a febrero de 2012?',
      type: 'number',
      value: '0',
      min: 0,
      max: 45,
      step: 0.5,
      help: 'Ese tramo se indemniza a 45 días por año según la disposición transitoria 11ª del Estatuto.',
    },
    {
      id: 'diasCotizados',
      label: 'Días cotizados por desempleo en los últimos 6 años',
      type: 'number',
      value: '1080',
      min: 0,
      max: 2500,
      step: 30,
      help: 'Hacen falta 360 días como mínimo para tener paro contributivo.',
    },
    {
      id: 'hijos',
      label: 'Hijos a cargo menores de 26 años',
      type: 'select',
      value: '0',
      options: [
        { value: '0', label: 'Ninguno' },
        { value: '1', label: 'Uno' },
        { value: '2', label: 'Dos o más' },
      ],
    },
    {
      id: 'diasVacaciones',
      label: 'Días de vacaciones no disfrutados',
      type: 'number',
      value: '10',
      min: 0,
      max: 40,
      step: 1,
    },
    {
      id: 'diasMes',
      label: 'Días trabajados del mes en curso sin cobrar',
      type: 'number',
      value: '15',
      min: 0,
      max: 31,
      step: 1,
    },
  ],
  fineprint: DISCLAIMER_FISCAL,

  chart: {
    type: 'bars',
    title: 'Lo que entra en tu bolsillo',
    caption:
      'Compara el finiquito, la indemnización y lo que cobrarás de prestación durante toda su duración.',
  },
  breakdownTitle: 'Todo lo que te corresponde',
  breakdownIntro:
    'Los importes son brutos salvo donde se indica. Las filas de meses y días llevan su unidad.',

  faq: [
    {
      q: '¿Qué diferencia hay entre finiquito e indemnización?',
      a: 'El finiquito es dinero que ya has ganado: los días trabajados del mes, las vacaciones no disfrutadas y la parte proporcional de las pagas extra. Te corresponde siempre, incluso si te vas tú. La indemnización sólo aparece cuando la causa del cese la genera: despido improcedente, objetivo o fin de contrato temporal.',
    },
    {
      q: '¿Cuántos días por año me corresponden?',
      a: 'Treinta y tres días de salario por año trabajado si el despido es improcedente, con tope de 24 mensualidades; veinte días por año si es objetivo, con tope de doce mensualidades; y doce días por año en el fin de un contrato temporal. Los períodos inferiores al año se prorratean por meses.',
    },
    {
      q: '¿Qué pasa si llevo en la empresa desde antes de 2012?',
      a: 'El tramo anterior al 12 de febrero de 2012 se indemniza a 45 días por año y el posterior a 33, con topes distintos para cada tramo. Es la disposición transitoria 11ª del Estatuto, y para carreras largas supone una diferencia de miles de euros que muchas empresas "olvidan" aplicar.',
    },
    {
      q: '¿La indemnización tributa?',
      a: 'La indemnización por despido está exenta de IRPF hasta el importe legal obligatorio y con un máximo de 180.000 €. Lo que exceda de esa cifra o del mínimo legal tributa como rendimiento del trabajo. El finiquito, en cambio, tributa entero, porque es salario.',
    },
    {
      q: '¿Cuánto cobraré de paro?',
      a: 'El 70% de la base reguladora los primeros 180 días y el 60% a partir del día 181, siempre dentro de unos topes mínimo y máximo que se calculan en veces el IPREM y que suben si tienes hijos a cargo. Por eso casi todo el mundo con sueldo medio o alto cobra el tope y no su porcentaje.',
    },
    {
      q: '¿Cuánto tiempo dura la prestación?',
      a: 'Depende de lo cotizado en los últimos seis años: con 360 días cotizados son cuatro meses, y por cada 180 días adicionales se suman dos meses, hasta un máximo de 24 meses con 2.160 días o más. Con menos de 360 días no hay prestación contributiva, sólo se puede pedir un subsidio.',
    },
    {
      q: '¿Puedo cobrar el paro si me voy voluntariamente?',
      a: 'No. La baja voluntaria no es situación legal de desempleo. Si después trabajas para otra empresa y ese contrato termina por causa ajena a tu voluntad, recuperas el derecho y se computa también lo cotizado antes, siempre que no lo hubieras consumido.',
    },
    {
      q: '¿Qué diferencia hay entre un ERTE y un ERE?',
      a: 'El ERTE suspende el contrato o reduce la jornada de forma temporal: no hay despido ni indemnización, y cobras prestación del SEPE mientras dura. El ERE extingue el contrato: es un despido colectivo con indemnización mínima de 20 días por año y acceso al paro.',
    },
    {
      q: '¿Qué es la excedencia voluntaria y cómo vuelvo?',
      a: 'Es una suspensión del contrato a petición tuya, de entre cuatro meses y cinco años, para quien lleva al menos un año en la empresa. No genera derecho a paro ni a indemnización y sólo da un derecho preferente al reingreso si hay vacante de tu grupo profesional: no es un derecho automático a tu puesto.',
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar un despido?',
      a: 'Veinte días hábiles desde el despido para presentar la papeleta de conciliación. Es un plazo de caducidad, no de prescripción: pasado ese plazo no hay forma de recuperar la acción, por mucha razón que tengas.',
    },
    {
      q: '¿Debo firmar el finiquito el mismo día?',
      a: 'No estás obligado. Puedes firmar añadiendo "no conforme" para dejar constancia de que recibes el dinero pero no aceptas las cifras, o pedir una copia y revisarla. Firmar un finiquito conforme sin leerlo es la vía más rápida de perder una indemnización mal calculada.',
    },
    {
      q: '¿El subsidio para mayores de 52 años cotiza para la jubilación?',
      a: 'Sí, y es su mayor ventaja: el SEPE cotiza por jubilación sobre la base mínima mientras lo cobras, lo que evita un agujero en la carrera de cotización justo en los años que más pesan al calcular la pensión.',
    },
  ],

  sources: [
    {
      name: 'Estatuto de los Trabajadores — extinción del contrato e indemnizaciones',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'Ley General de la Seguridad Social — prestación y subsidios por desempleo',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
      publisher: 'Boletín Oficial del Estado',
    },
    {
      name: 'SEPE — cuantía y duración de la prestación contributiva',
      url: 'https://www.sepe.es/HomeSepe/Personas/distributiva-prestaciones/estoy-cobrando-el-paro/cuantia-duracion.html',
      publisher: 'Servicio Público de Empleo Estatal',
    },
    {
      name: 'SEPE — subsidio para mayores de 52 años',
      url: 'https://www.sepe.es/HomeSepe/Personas/distributiva-prestaciones/quiero-cobrar-el-paro/subsidio-mayores-52.html',
      publisher: 'Servicio Público de Empleo Estatal',
    },
    {
      name: 'Indicador Público de Renta de Efectos Múltiples (IPREM)',
      url: 'https://www.iprem.com.es/',
      publisher: 'Indicador oficial publicado en la Ley de Presupuestos',
    },
  ],

  replaces: [
    '/calculadora-finiquito-despido-improcedente-espana-2026',
    '/calculadora-paro-prestacion-desempleo-espana-2026-meses',
    '/calculadora-erte-vs-ere-diferencias-cuantia-espana',
    '/calculadora-subsidio-mayores-52-anos-espana-cuantia-meses',
    '/calculadora-excedencia-voluntaria-reincorporacion-espana',
  ],

  lastReviewed: '2026-07-28',
  audience: 'global',
  locale: 'es',
};

/** Días de indemnización y topes. Espejo de finiquito-despido-improcedente-espana-2026.ts. */
export const DESPIDO = {
  diasImprocedente: 33,
  diasImprocedentePre2012: 45,
  diasObjetivo: 20,
  diasFinContrato: 12,
  topeImprocedente: 24,
  topePre2012: 42,
  topeObjetivo: 12,
  vacacionesDiasAnio: 30,
  limiteExencionIrpf: 180000,
};

/** Prestación por desempleo. Espejo de paro-prestacion-desempleo-espana-2026-meses.ts. */
export const PARO = {
  iprem: IPREM_2026.mensual,
  pctPrimeros180: 0.7,
  pctDesde181: 0.6,
  diasMinimos: 360,
  /** Topes en veces el IPREM mensual, por número de hijos a cargo. */
  topeMin: { 0: 0.95, 1: 1.125, 2: 1.2 } as Record<string, number>,
  topeMax: { 0: 1.75, 1: 2.0, 2: 2.25 } as Record<string, number>,
  /** Duración en meses por tramo de días cotizados: [días mínimos, meses]. */
  duracion: [
    [360, 4],
    [540, 6],
    [720, 8],
    [900, 10],
    [1080, 12],
    [1260, 14],
    [1440, 16],
    [1620, 18],
    [1800, 20],
    [1980, 22],
    [2160, 24],
  ] as Array<[number, number]>,
};

/** Subsidio para mayores de 52 años. LGSS art. 278. */
export const SUBSIDIO_52 = {
  pctIprem: 0.8,
  limiteRentasPctSmi: 0.75,
  smiMensual: SMI_2026.mensual12,
};
