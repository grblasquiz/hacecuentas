import type { HubData } from '../types';
import { MEXICO_2026, JCF_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿Me toca un apoyo del gobierno y de cuánto?"
 *
 * Fusiona las calculadoras de transferencias directas: la Pensión para el
 * Bienestar de las Personas Adultas Mayores, la Pensión Mujeres Bienestar, la
 * de personas con discapacidad y el apoyo de Jóvenes Construyendo el Futuro.
 * Todas responden la misma duda: si califico, cuánto cobro y cada cuánto.
 *
 * Montos desde la fuente única src/lib/data/mexico-2026.ts.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/** Montos bimestrales de los programas del Bienestar 2026. */
export const BIENESTAR_MX = MEXICO_2026.bienestar;

/** Jóvenes Construyendo el Futuro 2026: apoyo mensual ligado al salario mínimo. */
export const JCF_MX = JCF_2026;

export const hub: HubData = {
  slug: 'mx/vida/apoyos-del-bienestar',
  title: 'Apoyos del Bienestar 2026: pensión de adultos mayores, mujeres y jóvenes',
  description:
    'Checa si calificas para la Pensión para el Bienestar de Adultos Mayores, la Pensión Mujeres Bienestar, la de personas con discapacidad o Jóvenes Construyendo el Futuro, con los montos bimestrales vigentes y cuánto suman al año.',
  silo: 'Vida',
  siloHref: '/mx/vida',

  eyebrow: 'México · programas sociales',
  h1: '¿Me toca un apoyo del Bienestar y de cuánto?',
  lede:
    'Los programas de transferencia directa se pagan por bimestre y cada uno tiene su propio requisito de edad o situación. Pon tu edad y tu caso: te decimos cuál te corresponde hoy, cuánto cobras al año y cuándo cambias de programa.',
  stamps: [
    'Adultos Mayores 65+ · pago bimestral',
    'Mujeres Bienestar 60 a 64',
    'Jóvenes Construyendo el Futuro',
    '3 calculadoras fusionadas',
  ],

  resultLabel: 'Lo que cobras por bimestre',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Empezamos por la pensión de adultos mayores, que es el programa con más padrón del país.',
    items: [
      {
        id: 'adultos',
        label: 'Pensión de Adultos Mayores y Mujeres Bienestar',
        hint: 'Universal desde los 65 años; de 60 a 64 aplica el programa para mujeres.',
        yes: [
          'Programa que te corresponde hoy según tu edad y tu situación',
          'Monto bimestral, mensual equivalente y total del año',
          'Cuántos años faltan para el próximo programa al que pasas',
          'Suma de programas cuando son compatibles',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La Pensión de Adultos Mayores es universal desde los 65 años: no depende de tus ingresos ni de si tienes otra pensión',
          'Quien cobra Mujeres Bienestar pasa automáticamente a la de Adultos Mayores al cumplir 65, sin volver a registrarse',
          'El registro se abre por convocatoria en los Módulos del Bienestar: hay que estar atenta a las fechas, no es un trámite permanente',
        ],
        plazo: 'los pagos se depositan por bimestre en la Tarjeta del Bienestar.',
        answer:
          'Desde los 65 años la pensión es universal; entre los 60 y los 64, las mujeres cobran el programa Mujeres Bienestar.',
      },
      {
        id: 'discapacidad',
        label: 'Pensión para personas con discapacidad',
        hint: 'Apoyo bimestral para personas con discapacidad permanente.',
        yes: [
          'Monto bimestral del programa de discapacidad',
          'Compatibilidad con otros programas del Bienestar según tu edad',
          'Equivalente mensual y anual del apoyo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Se requiere certificado o constancia de discapacidad permanente emitida por una institución pública de salud',
          'Al cumplir 65 años el beneficiario pasa a la pensión de adultos mayores, que tiene un monto mayor',
          'La cobertura y los requisitos han variado entre entidades: conviene confirmar en el Módulo del Bienestar de tu zona',
        ],
        plazo: 'el pago es bimestral, igual que el resto de los programas.',
        answer:
          'Es un apoyo bimestral propio, que se sustituye por la pensión de adultos mayores al cumplir 65 años.',
      },
      {
        id: 'jovenes',
        label: 'Jóvenes Construyendo el Futuro',
        hint: 'Apoyo mensual mientras dura la capacitación en un centro de trabajo.',
        yes: [
          'Apoyo mensual del programa, que está ligado al salario mínimo general',
          'Total que juntas según los meses de capacitación que te quedan',
          'Seguro médico del IMSS durante toda la capacitación',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Es para personas de 18 a 29 años que no estudian ni trabajan, y la capacitación dura hasta doce meses',
          'No es una relación laboral: no genera antigüedad, aguinaldo ni vacaciones, aunque sí da cobertura del IMSS mientras dura',
          'El apoyo se paga por mes efectivamente cursado; las faltas se descuentan',
        ],
        plazo: 'el apoyo se deposita mensualmente mientras estés activo en el centro de trabajo.',
        answer:
          'Es un apoyo mensual ligado al salario mínimo, por hasta doce meses de capacitación, con seguro médico del IMSS incluido.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro: 'Solo necesitamos tu edad y tu situación. Nada de ingresos: estos programas no los piden.',
  fields: [
    {
      id: 'edad',
      label: 'Tu edad (años)',
      type: 'number',
      value: 66,
      min: 0,
      max: 120,
      step: 1,
      help: 'La edad es el requisito principal de casi todos los programas.',
    },
    {
      id: 'sexo',
      label: 'Sexo',
      type: 'select',
      value: 'mujer',
      options: [
        { value: 'mujer', label: 'Mujer' },
        { value: 'hombre', label: 'Hombre' },
      ],
      help: 'El programa Mujeres Bienestar aplica de los 60 a los 64 años.',
    },
    {
      id: 'discapacidad',
      label: '¿Tienes discapacidad permanente?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí, con constancia' },
      ],
      help: 'Requiere certificado de una institución pública de salud.',
    },
    {
      id: 'mesesJcf',
      label: 'Meses de capacitación que te faltan (Jóvenes)',
      type: 'number',
      value: 12,
      min: 0,
      max: 12,
      step: 1,
      help: 'La capacitación dura hasta doce meses.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'bars',
    title: 'Monto por programa',
    caption: 'Compara el monto bimestral de cada programa del Bienestar contra el que te corresponde hoy.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Desde qué edad me toca la Pensión para el Bienestar?',
      a: 'La pensión para personas adultas mayores es universal a partir de los 65 años: no depende de tus ingresos, de si tienes otra pensión ni de si sigues trabajando. Entre los 60 y los 64 años existe un programa distinto y con monto menor, la Pensión Mujeres Bienestar, dirigido solo a mujeres.',
    },
    {
      q: '¿Cada cuánto se paga?',
      a: 'Por bimestre, es decir seis pagos al año, depositados en la Tarjeta del Bienestar. Por eso los montos oficiales se anuncian siempre en cifra bimestral y conviene dividir entre dos para compararlos con un ingreso mensual.',
    },
    {
      q: '¿La pensión del Bienestar se descuenta de mi pensión del IMSS?',
      a: 'No. Son programas independientes: la del IMSS es contributiva y sale de tus semanas cotizadas, mientras que la del Bienestar es una transferencia universal financiada con recursos fiscales. Puedes cobrar las dos al mismo tiempo.',
    },
    {
      q: '¿Qué pasa cuando cumplo 65 si ya cobraba Mujeres Bienestar?',
      a: 'Pasas automáticamente a la pensión de adultos mayores, que tiene un monto bastante mayor, y no hay que volver a registrarse. El cambio lo hace el propio programa cuando el padrón detecta el cumpleaños, aunque conviene verificar que el depósito efectivamente subió.',
    },
    {
      q: '¿Puedo cobrar dos apoyos a la vez?',
      a: 'Depende de la combinación. La pensión de discapacidad y la de adultos mayores no se acumulan: al cumplir 65 se sustituye una por otra. En cambio, apoyos de programas distintos, como una beca educativa de un hijo, sí conviven con la pensión del titular.',
    },
    {
      q: '¿Cómo me registro?',
      a: 'Los registros se abren por convocatoria en los Módulos del Bienestar, con fechas publicadas por la Secretaría del Bienestar. Normalmente piden acta de nacimiento, identificación oficial vigente, CURP, comprobante de domicilio reciente y un número de teléfono. No hay gestores ni intermediarios: el trámite es gratuito y personal.',
    },
    {
      q: '¿Cuánto paga Jóvenes Construyendo el Futuro?',
      a: 'Un apoyo mensual ligado al salario mínimo general, que por eso sube cada año junto con él, durante un máximo de doce meses de capacitación en un centro de trabajo. Además del dinero, el programa da cobertura médica del IMSS por enfermedades, maternidad y riesgos de trabajo mientras dura la capacitación.',
    },
    {
      q: '¿Jóvenes Construyendo el Futuro cuenta como empleo?',
      a: 'No genera una relación laboral: no acumula antigüedad, ni aguinaldo, ni vacaciones, ni prima de antigüedad, y al terminar no hay finiquito. Sí da seguro médico del IMSS durante la capacitación, pero esas semanas no se computan como semanas cotizadas para pensión.',
    },
    {
      q: '¿Los apoyos del Bienestar pagan ISR?',
      a: 'No. Las transferencias de programas sociales del gobierno federal no son ingresos acumulables para efectos del impuesto sobre la renta, así que no se declaran ni generan retención. Tampoco afectan tu cálculo de ISR si además tienes un sueldo.',
    },
    {
      q: '¿Los montos suben cada año?',
      a: 'Sí, se han venido actualizando cada año, y en el caso de Jóvenes Construyendo el Futuro el monto está atado directamente al salario mínimo general, que fija la CONASAMI en diciembre. Por eso conviene mirar siempre el monto del ejercicio en curso y no el del año pasado.',
    },
    {
      q: '¿Qué pasa si me cambio de domicilio o de estado?',
      a: 'El apoyo no se pierde, pero hay que actualizar los datos en un Módulo del Bienestar para que el depósito y las notificaciones lleguen bien. Los pagos son federales y no dependen del estado en el que vivas.',
    },
  ],

  sources: [
    {
      name: 'Secretaría del Bienestar — programas para el bienestar',
      url: 'https://www.gob.mx/bienestar',
      publisher: 'Secretaría del Bienestar',
    },
    {
      name: 'Pensión para el Bienestar de las Personas Adultas Mayores',
      url: 'https://www.gob.mx/pensionadultosmayores',
      publisher: 'Gobierno de México',
    },
    {
      name: 'Jóvenes Construyendo el Futuro',
      url: 'https://jovenesconstruyendoelfuturo.stps.gob.mx/',
      publisher: 'Secretaría del Trabajo y Previsión Social',
    },
    {
      name: 'CONASAMI — salarios mínimos 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
  ],

  replaces: [
    '/calculadora-pension-bienestar-2026-monto',
    '/calculadora-pension-mujeres-bienestar-2026-elegibilidad-monto',
    '/calculadora-jovenes-construyendo-futuro-monto-2026',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
