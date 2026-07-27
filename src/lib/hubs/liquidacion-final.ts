import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/liquidacion-final',
  title: 'Renuncio: ¿cuánto cobro de liquidación final? — Calculadora 2026',
  description:
    'Si renunciás no cobrás indemnización por antigüedad, preaviso ni integración: sólo lo devengado. Calculá días trabajados, SAC proporcional y vacaciones no gozadas. Casas particulares (ley 26.844) incluido.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: 'Renunciás. Veamos qué te tienen que pagar.',
  lede:
    'La renuncia no es un despido: no hay indemnización por antigüedad, ni preaviso a tu favor, ni integración del mes. Lo que sí se cobra es todo lo devengado hasta el último día. Partimos del caso más común y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'LCT arts. 121, 123, 150 y 156', '5 calculadoras adentro'],

  resultLabel: 'Estimación inicial',

  cases: {
    title: '¿Cuál es tu situación?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'renuncia',
        label: 'Renuncio a mi trabajo (caso común)',
        hint: 'LCT · el caso más consultado',
        answer: 'Al renunciar cobrás lo devengado: días del mes, SAC proporcional y vacaciones no gozadas.',
        yes: [
          'Días trabajados del último mes (sueldo ÷ 30 × días)',
          'SAC proporcional del semestre en curso (Art. 121 LCT)',
          'Vacaciones no gozadas, a razón de sueldo ÷ 25 por día (Art. 156 LCT)',
          'SAC sobre esas vacaciones (Art. 123 LCT)',
        ],
        warn: [
          'NO cobrás indemnización por antigüedad (Art. 245): eso es exclusivo del despido',
          'NO cobrás preaviso ni integración del mes: al revés, sos vos quien debe preavisar (Art. 240)',
          'Si no preavisás, el empleador puede descontarte el equivalente al plazo omitido',
        ],
        plazo: 'la liquidación final vence a los 4 días hábiles del cese; la renuncia se hace por telegrama gratuito o ante escribano.',
      },
      {
        id: 'casas-particulares',
        label: 'Soy empleada de casas particulares',
        hint: 'Ley 26.844',
        answer: 'Si renunciás, la ley 26.844 paga lo mismo que la LCT: sólo lo devengado hasta el último día.',
        yes: [
          'Días trabajados del último mes (sueldo ÷ 30 × días)',
          'SAC proporcional del semestre en curso (Art. 39 ley 26.844)',
          'Vacaciones no gozadas a razón de sueldo ÷ 25 por día (Art. 30)',
          'SAC sobre esas vacaciones',
        ],
        warn: [
          'La estimación de abajo liquida la RENUNCIA: no incluye indemnización por antigüedad, preaviso ni integración',
          'Si en cambio te DESPIDIERON sin causa, se suman: indemnización por antigüedad de 1 mes de sueldo por año o fracción mayor a 3 meses (Art. 48), preaviso (Art. 42) e integración del mes del cese por los días que faltaban (Art. 43)',
          'En ese caso de despido el régimen no tiene tope de convenio: no se aplica Vizzoti',
          'Al renunciar tenés que preavisar 10 días (Art. 42); si no lo hacés, te pueden descontar ese plazo',
          'Con menos de 16 hs semanales no hay aportes obligatorios, pero los rubros devengados se deben igual',
        ],
        plazo: 'si el cese fuera un despido, la fracción mayor a 3 meses suma un año entero de antigüedad (Art. 48).',
      },
      {
        id: 'vacaciones',
        label: 'Me voy con vacaciones sin tomar',
        hint: 'Art. 156 LCT',
        answer: 'Las vacaciones no gozadas se pagan siempre, renuncies o te despidan.',
        yes: [
          'Valor del día de vacaciones = sueldo ÷ 25 (Art. 155 LCT)',
          'Se multiplica por los días no gozados y se suma el SAC sobre ese importe',
          'Se cobra cualquiera sea la causa del cese: renuncia, despido o mutuo acuerdo',
        ],
        warn: [
          'Estando el contrato vigente las vacaciones NO se pueden cambiar por plata: sólo se indemnizan al egresar',
          'El divisor es 25, no 30: el día de vacaciones vale más que el día común',
        ],
        plazo: 'por antigüedad te corresponden 14 días (hasta 5 años), 21 (5-10), 28 (10-20) o 35 (más de 20).',
      },
      {
        id: 'antiguedad',
        label: 'Quiero saber sólo mi antigüedad',
        hint: 'Art. 150 LCT',
        answer: 'Tu antigüedad define el tramo de vacaciones y los plazos de preaviso.',
        yes: [
          'Años y meses computados desde el ingreso real, no desde la registración',
          'Tramo de días de vacaciones que te corresponde por año (Art. 150 LCT)',
          'Valorización en pesos de esos días al valor del Art. 155 (sueldo ÷ 25)',
        ],
        warn: [
          'Con menos de 6 meses no hay tramo completo: se liquida 1 día por cada 20 trabajados',
          'La antigüedad no te da indemnización si renunciás: sólo define vacaciones y plazos',
        ],
        plazo: 'los períodos en negro cuentan igual para la antigüedad y habilitan las multas de la ley 24.013.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'sueldo', label: 'Último sueldo bruto mensual', prefix: '$', value: '1.500.000', thousands: true },
    { id: 'diasMes', label: 'Días trabajados en el último mes', type: 'number', min: 0, max: 30, value: 15, suffix: 'días' },
    { id: 'diasVac', label: 'Días de vacaciones no gozadas', type: 'number', min: 0, max: 60, value: 14, suffix: 'días' },
    { id: 'mesesSemestre', label: 'Meses trabajados del semestre en curso', type: 'number', min: 1, max: 6, value: 3 },
    { id: 'anios', label: 'Años de antigüedad', type: 'number', min: 0, max: 50, value: 4 },
    { id: 'meses', label: 'Meses sueltos además de los años', type: 'number', min: 0, max: 11, value: 5 },
  ],
  fineprint: 'Es una orientación bruta, antes de descuentos de jubilación, obra social y Ganancias. Un convenio puede mejorar estos mínimos.',

  chart: {
    type: 'donut',
    title: 'Composición de la liquidación',
    caption:
      'Cada porción es un rubro devengado: los días trabajados del mes, el aguinaldo proporcional y las vacaciones no gozadas con su SAC. En la renuncia no hay porción de indemnización.',
  },
  breakdownTitle: 'Qué pesa en tu liquidación final',
  breakdownIntro: 'Las barras comparan cada concepto con el rubro más grande.',

  faq: [
    {
      q: 'Si renuncio, ¿cobro indemnización por antigüedad?',
      a: 'No. La indemnización del Art. 245 LCT es la reparación del despido sin causa. Al renunciar cobrás solamente lo devengado: los días trabajados del último mes, el SAC proporcional y las vacaciones no gozadas con su SAC. Tampoco corresponde preaviso ni integración del mes de egreso.',
    },
    {
      q: '¿Qué rubros tiene la liquidación final por renuncia?',
      a: 'Cuatro: días trabajados del mes (sueldo ÷ 30 × días), aguinaldo proporcional del semestre (Art. 121 LCT), vacaciones no gozadas a sueldo ÷ 25 por día (Art. 156) y el SAC sobre esas vacaciones (Art. 123). Nada más.',
    },
    {
      q: '¿Con cuánta anticipación tengo que avisar que renuncio?',
      a: 'El Art. 240 LCT exige que la renuncia se comunique por telegrama laboral (es gratuito en el correo) o ante escribano. El preaviso del trabajador es de 15 días. Si te vas sin preavisar, el empleador puede descontarte de la liquidación el equivalente al plazo omitido.',
    },
    {
      q: '¿Cuándo me tienen que pagar la liquidación final?',
      a: 'Dentro de los 4 días hábiles de la extinción del contrato. Si no te pagan, intimá por telegrama laboral dándole 2 días hábiles: recién ahí se configura la mora y podés reclamar.',
    },
    {
      q: '¿Cómo se calculan las vacaciones no gozadas al renunciar?',
      a: 'Se toma el sueldo dividido 25 (Art. 155 LCT) y se multiplica por los días no gozados. Ese divisor 25 hace que el día de vacaciones valga más que el día común, que se calcula sobre 30. Al resultado se le suma el SAC (una doceava parte).',
    },
    {
      q: '¿Cuántos días de vacaciones me corresponden por año?',
      a: 'Según el Art. 150 LCT: 14 días corridos hasta 5 años de antigüedad, 21 días de 5 a 10, 28 días de 10 a 20 y 35 días con más de 20. Con menos de 6 meses en el puesto se liquida 1 día por cada 20 días trabajados.',
    },
    {
      q: 'Soy empleada de casas particulares: ¿me rige la misma ley?',
      a: 'No, te rige la ley 26.844. Los rubros devengados de la renuncia son equivalentes, pero el despido tiene su propio esquema: indemnización de 1 mes por año o fracción mayor a 3 meses (Art. 48), preaviso de 10 días / 1 mes / 2 meses según antigüedad (Art. 42) e integración del mes (Art. 43). No se aplica tope de convenio.',
    },
    {
      q: '¿La liquidación final por renuncia paga Impuesto a las Ganancias?',
      a: 'Sí. A diferencia de la indemnización por antigüedad del despido —que está exenta hasta el tope—, todo lo que se cobra por renuncia es remuneración común: días trabajados, SAC proporcional y vacaciones no gozadas tributan y sufren aportes.',
    },
    {
      q: 'Estuve parte del tiempo en negro: ¿cuenta para la antigüedad?',
      a: 'Cuenta desde el ingreso real, no desde la fecha de registración. Ese tiempo suma para el tramo de vacaciones y, si además intimás antes de irte, habilita las multas de la ley 24.013 por deficiente registración.',
    },
    {
      q: '¿Me conviene renunciar o negociar un retiro por mutuo acuerdo?',
      a: 'Son cosas distintas: la renuncia no genera indemnización, mientras que el mutuo acuerdo del Art. 241 LCT se instrumenta ante escribano o autoridad administrativa y suele incluir una gratificación pactada. Si estás por firmar, conviene comparar el monto ofrecido contra lo que saldría un despido sin causa.',
    },
  ],

  sources: [
    {
      name: 'Ley de Contrato de Trabajo 20.744 — arts. 121, 123, 150, 155, 156 y 240',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 26.844 — Régimen Especial de Contrato de Trabajo para el Personal de Casas Particulares (arts. 30, 42, 43, 48 y 49)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/210000-214999/210489/norma.htm',
      publisher: 'InfoLeg',
      date: 'texto vigente',
    },
    {
      name: 'Telegrama laboral gratuito (ley 23.789) y trámites de extinción',
      url: 'https://www.argentina.gob.ar/trabajo',
      publisher: 'Ministerio de Trabajo, Empleo y Seguridad Social',
    },
  ],

  replaces: [
    '/calculadora-liquidacion-final-renuncia',
    '/calculadora-antiguedad-laboral',
    '/calculadora-liquidacion-final-empleada-casa-particular-despido-art-49',
    '/calculadora-vacaciones-no-tomadas-indemnizacion-formula',
    '/calculadora-dias-vacaciones-ganadas-antiguedad-lct',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/** Días de vacaciones por año según antigüedad (Art. 150 LCT / Art. 30 ley 26.844). */
export const TRAMOS_VACACIONES = [
  { hastaAnios: 5, dias: 14, label: 'hasta 5 años' },
  { hastaAnios: 10, dias: 21, label: '5 a 10 años' },
  { hastaAnios: 20, dias: 28, label: '10 a 20 años' },
  { hastaAnios: 999, dias: 35, label: 'más de 20 años' },
];
