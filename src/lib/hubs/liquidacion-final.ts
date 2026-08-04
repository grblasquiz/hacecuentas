import type { HubData } from './types';

export const hub: HubData = {
  slug: 'trabajo/liquidacion-final',
  title: 'Calculadora de liquidación final por renuncia 2026',
  description:
    'Si renunciás no cobrás indemnización por antigüedad, preaviso ni integración: sólo lo devengado. Calculá días trabajados, SAC proporcional y vacaciones no gozadas. Casas particulares (ley 26.844) incluido.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: 'Calculadora de liquidación final por renuncia 2026',
  lede:
    'La renuncia no es un despido: no hay indemnización por antigüedad, ni preaviso a tu favor, ni integración del mes. Lo que sí se cobra es todo lo devengado hasta el último día. Partimos del caso más común y lo ajustás con tus datos.',
  stamps: ['Revisado 04-08-2026', 'LCT actualizada', 'Cálculo explicado'],

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
          'SAC proporcional al tiempo trabajado en el semestre (arts. 121 a 123 LCT)',
          'Vacaciones no gozadas, a razón de sueldo ÷ 25 por día (Art. 156 LCT)',
          'SAC sobre esas vacaciones (Art. 123 LCT)',
        ],
        warn: [
          'NO cobrás indemnización por antigüedad (Art. 245): eso es exclusivo del despido',
          'NO cobrás preaviso ni integración del mes: al revés, sos vos quien debe preavisar (Art. 240)',
          'Si no preavisás, el empleador puede descontarte el equivalente al plazo omitido',
        ],
        plazo: 'para personal mensual o quincenal, el pago vence dentro de 4 días hábiles; para pago semanal, dentro de 3. La renuncia se formaliza por telegrama laboral físico o digital, o ante la autoridad laboral.',
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
          'La registración y los aportes son obligatorios cualquiera sea la cantidad de horas; el importe cambia según el tramo horario',
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
        plazo: 'los períodos no registrados pueden discutirse y probarse, pero las indemnizaciones automáticas de los arts. 8 a 17 de la ley 24.013 fueron derogadas.',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Podés dejar los valores de ejemplo y volver después.',
  fields: [
    { id: 'sueldo', label: 'Último sueldo bruto mensual', prefix: '$', value: '1.500.000', thousands: true },
    { id: 'diasMes', label: 'Días trabajados en el último mes', type: 'number', min: 0, max: 30, value: 15, suffix: 'días' },
    { id: 'diasVac', label: 'Días de vacaciones no gozadas', type: 'number', min: 0, max: 60, value: 14, suffix: 'días' },
    { id: 'mesesSemestre', label: 'Días trabajados del semestre en curso', type: 'number', min: 0, max: 180, value: 90, suffix: 'días' },
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
      a: 'Como base: días trabajados del mes, aguinaldo proporcional y vacaciones no gozadas. También pueden existir horas extra, comisiones, premios u otros conceptos ya devengados. El SAC sobre vacaciones no gozadas tiene criterios jurídicos divergentes, por eso el resultado debe tomarse como estimación.',
    },
    {
      q: '¿Con cuánta anticipación tengo que avisar que renuncio?',
      a: 'El Art. 240 LCT actualizado exige comunicar la renuncia mediante despacho telegráfico físico o digital, gratuito, o ante la autoridad administrativa laboral. El preaviso del trabajador es de 15 días. Si se omite, puede discutirse la indemnización sustitutiva correspondiente.',
    },
    {
      q: '¿Cuándo me tienen que pagar la liquidación final?',
      a: 'La LCT remite a los plazos de pago: hasta 4 días hábiles para remuneración mensual o quincenal y hasta 3 para semanal. Si no pagan, conviene intimar de manera fehaciente y buscar asesoramiento antes de fijar plazos por cuenta propia.',
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
      a: 'No todos los rubros tienen el mismo tratamiento. Días trabajados y SAC son remunerativos; las vacaciones no gozadas al extinguirse el contrato tienen naturaleza indemnizatoria. Ganancias y aportes dependen del concepto y del caso, por lo que conviene revisar el recibo con un profesional.',
    },
    {
      q: 'Estuve parte del tiempo en negro: ¿cuenta para la antigüedad?',
      a: 'La antigüedad puede reclamarse desde el ingreso real si se logra probar. Las indemnizaciones automáticas de los arts. 8 a 17 de la ley 24.013 fueron derogadas por la ley 27.742, aunque siguen pudiendo existir diferencias salariales, aportes y otros reclamos.',
    },
    {
      q: '¿Me conviene renunciar o negociar un retiro por mutuo acuerdo?',
      a: 'Son cosas distintas: la renuncia no genera indemnización, mientras que el mutuo acuerdo del Art. 241 LCT se instrumenta ante escribano o autoridad administrativa y suele incluir una gratificación pactada. Si estás por firmar, conviene comparar el monto ofrecido contra lo que saldría un despido sin causa.',
    },
  ],

  sources: [
    {
      name: 'Ley de Contrato de Trabajo 20.744 — arts. 121, 123, 150, 155, 156 y 240',
      url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552/actualizacion',
      publisher: 'Argentina.gob.ar',
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
    {
      name: 'Registración, aportes y contribuciones de casas particulares',
      url: 'https://www.arca.gob.ar/casasparticulares/aportes-contribuciones-ART/conceptos.asp',
      publisher: 'ARCA',
    },
  ],

  replaces: [
    '/calculadora-liquidacion-final-renuncia',
    '/calculadora-antiguedad-laboral',
    '/calculadora-liquidacion-final-empleada-casa-particular-despido-art-49',
    '/calculadora-vacaciones-no-tomadas-indemnizacion-formula',
    '/calculadora-dias-vacaciones-ganadas-antiguedad-lct',
  ],

  lastReviewed: '2026-08-04',
  audience: 'AR',
};

/** Días de vacaciones por año según antigüedad (Art. 150 LCT / Art. 30 ley 26.844). */
export const TRAMOS_VACACIONES = [
  { hastaAnios: 5, dias: 14, label: 'hasta 5 años' },
  { hastaAnios: 10, dias: 21, label: '5 a 10 años' },
  { hastaAnios: 20, dias: 28, label: '10 a 20 años' },
  { hastaAnios: 999, dias: 35, label: 'más de 20 años' },
];
