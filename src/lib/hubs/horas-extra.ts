import type { HubData } from './types';

/**
 * Hub de decisión — "¿Cuánto me tienen que pagar las horas extra?"
 * Arquetipo RAMIFICADO: la respuesta cambia según cuándo trabajaste esa hora.
 *
 * Absorbe 10 calculadoras (ver hub.replaces): valor hora, horas extra al 50 y
 * al 100, nocturnas, presentismo, antigüedad y cuota sindical. Es el recibo de
 * sueldo partido en pedazos.
 *
 * OJO CON LA HORA NOCTURNA (LCT art. 200): NO es un recargo del 50%. Entre las
 * 21:00 y las 06:00 la jornada se acorta y cada hora nocturna trabajada suma 8
 * minutos al cómputo (una hora nocturna "vale" 1 h 8 min de jornada). El plus
 * salarial nocturno, si existe, sale del convenio, no de la ley. Por eso el
 * cálculo de la rama nocturna paga horas equivalentes + el % de tu CCT, y
 * nunca multiplica por 1,5.
 */
export const hub: HubData = {
  slug: 'trabajo/horas-extra',
  title: '¿Cuánto me tienen que pagar las horas extra? — Calculadora 2026 (Argentina)',
  description:
    'Calculá tus horas extra al 50% y al 100%, las horas nocturnas del art. 200 LCT, el valor de tu hora normal y cómo quedan el plus por antigüedad, el presentismo y los descuentos sindicales en el recibo.',
  silo: 'Trabajo',
  siloHref: '/trabajo',

  eyebrow: 'Guía y estimación laboral',
  h1: '¿Cuánto me tienen que pagar las horas extra?',
  lede:
    'Todo arranca por el valor de tu hora normal: sueldo bruto dividido por las horas del mes. Sobre ese número corren el 50%, el 100% y el cómputo especial de la jornada nocturna. Partimos del caso más común y lo ajustás con tus datos.',
  stamps: ['Actualizado 27-07-2026', 'LCT art. 196, 200 y 201', '10 calculadoras adentro'],

  resultLabel: 'Lo que te tienen que pagar',

  cases: {
    title: '¿Cuándo trabajaste esas horas?',
    intro: 'Partimos del caso más frecuente. Si el tuyo es distinto, cambialo.',
    items: [
      {
        id: 'extra50',
        label: 'Hice extras en un día hábil',
        hint: 'Recargo del 50% — el caso más común',
        answer: 'Cada hora extra en día hábil se paga una vez y media la hora normal: valor hora × 1,5.',
        yes: [
          'Rige de lunes a viernes y el sábado hasta las 13:00 (LCT art. 201)',
          'Valor de la hora extra = sueldo bruto ÷ horas del mes × 1,5',
          'El divisor estándar de jornada completa es 200 horas mensuales (48 h semanales × 4,33)',
          'La hora extra es remunerativa: paga aportes y engrosa la base del aguinaldo',
        ],
        warn: [
          'El tope legal es 30 horas extra por mes y 200 por año (decreto 484/2000)',
          'Si tu convenio fija un divisor menor a 200, tu hora normal vale más y la extra también',
          'Los conceptos no remunerativos del recibo no entran en la base del valor hora',
        ],
        plazo: 'las extras del mes se liquidan con el sueldo del mismo mes, dentro de los 4 días hábiles de vencido.',
      },
      {
        id: 'extra100',
        label: 'Sábado después de las 13, domingo o feriado',
        hint: 'Recargo del 100% — la hora vale el doble',
        answer: 'La hora extra en sábado después de las 13, domingo o feriado se paga al doble: valor hora × 2.',
        yes: [
          'Aplica desde el sábado a las 13:00 hasta el lunes a las 00:00, y todo el feriado nacional (art. 201)',
          'Valor de la hora al 100% = sueldo bruto ÷ horas del mes × 2',
          'Si trabajás un feriado dentro de tu jornada habitual, además cobrás el día doble por el art. 166',
          'No hace falta que sea "extra" para el 100%: alcanza con que caiga en ese tramo',
        ],
        warn: [
          'El día no laborable (no el feriado) se paga simple salvo que el empleador decida lo contrario',
          'Un franco compensatorio no reemplaza el pago del recargo: son cosas distintas',
          'El tope de 30 horas mensuales también corre para las del 100%',
        ],
        plazo: 'si trabajaste un feriado, el pago con recargo va en el recibo de ese mismo mes.',
      },
      {
        id: 'nocturna',
        label: 'Trabajé de noche (21 a 6)',
        hint: 'Art. 200 LCT — 8 minutos por hora, no un recargo',
        answer:
          'La hora nocturna no lleva recargo del 50%: cada hora trabajada entre las 21 y las 6 suma 8 minutos al cómputo de la jornada.',
        yes: [
          'Jornada nocturna = de 21:00 a 06:00 del día siguiente (LCT art. 200)',
          'La jornada nocturna íntegra es de 7 horas en lugar de 8',
          'En jornada mixta, cada hora nocturna se computa como 1 hora y 8 minutos',
          'Si el empleador te hace cumplir las 8 horas igual, esos 8 minutos por hora se pagan como tiempo extra',
        ],
        warn: [
          'El plus salarial nocturno NO es legal, es convencional: sale de tu CCT y el porcentaje varía',
          'No confundas nocturnidad con hora extra: son dos cosas que se suman, no se reemplazan',
          'Si la hora es nocturna Y extra, primero se computa el equivalente y después corre el 50% o el 100%',
        ],
        plazo: 'reclamá la diferencia de cómputo dentro de los 2 años: es el plazo de prescripción del art. 256 LCT.',
      },
      {
        id: 'hora',
        label: 'Solo quiero saber cuánto vale mi hora',
        hint: 'La base de todos los cálculos',
        answer: 'Tu hora normal es el sueldo bruto dividido por las horas que trabajás en el mes.',
        yes: [
          'Valor hora = sueldo bruto ÷ horas mensuales',
          'Jornada completa: 8 horas diarias, 48 semanales, 200 horas mensuales como divisor estándar',
          'Si trabajás 8 horas por 22 días, el divisor real es 176 y tu hora vale más',
          'Con el valor hora salen el día, la semana y cualquier hora extra',
        ],
        warn: [
          'Para cotizar tu hora por fuera del recibo sumá el costo de viajar: la hora real de bolsillo es menor',
          'El valor hora se calcula sobre el bruto remunerativo, no sobre el neto en mano',
          'Cambiar el divisor cambia todo: revisá qué usa tu recibo antes de reclamar',
        ],
        plazo: 'el recibo tiene que detallar la cantidad de horas y el valor unitario (ley 20.744 art. 140).',
      },
    ],
  },

  inputsTitle: 'Completá lo que sepas',
  inputsIntro: 'Con el sueldo y las horas alcanza. Los demás campos arman el recibo completo.',
  fields: [
    {
      id: 'sueldo',
      label: 'Sueldo bruto mensual',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'El bruto remunerativo de convenio, sin los no remunerativos.',
    },
    {
      id: 'horasMes',
      label: 'Horas mensuales de jornada (divisor)',
      type: 'number',
      min: 1,
      max: 400,
      step: 1,
      value: 200,
      help: 'Estándar de jornada completa: 200 (48 h semanales × 4,33). Si trabajás 8 h por 22 días, poné 176.',
    },
    { id: 'horas50', label: 'Horas extra al 50% (día hábil)', type: 'number', min: 0, max: 200, step: 0.5, value: 10 },
    {
      id: 'horas100',
      label: 'Horas extra al 100% (sáb. post 13, dom. o feriado)',
      type: 'number',
      min: 0,
      max: 200,
      step: 0.5,
      value: 0,
    },
    {
      id: 'horasNoct',
      label: 'Horas nocturnas trabajadas (21 a 6)',
      type: 'number',
      min: 0,
      max: 200,
      step: 0.5,
      value: 0,
      help: 'No llevan recargo del 50%: cada una suma 8 minutos al cómputo (art. 200 LCT).',
    },
    {
      id: 'pctNocturno',
      label: 'Plus nocturno de tu convenio',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      help: 'No hay porcentaje legal: buscalo en tu CCT o en el recibo. Dejá 0 si no tenés.',
    },
    {
      id: 'diasMes',
      label: 'Días trabajados por mes',
      type: 'number',
      min: 1,
      max: 31,
      step: 1,
      value: 22,
      help: 'Se usa para el valor del día y de la semana.',
    },
    { id: 'anios', label: 'Años de antigüedad', type: 'number', min: 0, max: 50, step: 1, value: 5 },
    {
      id: 'pctAntiguedad',
      label: 'Antigüedad por año que paga tu convenio',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 10,
      step: 0.1,
      value: 1,
      help: 'Lo más común es 1% del básico por año, pero cada CCT tiene el suyo.',
    },
    {
      id: 'pctPresentismo',
      label: 'Presentismo de tu convenio',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 30,
      step: 0.01,
      value: 8.33,
      help: 'El 8,33% equivale a un sueldo más por año. Comercio y metalúrgicos lo tienen.',
    },
    {
      id: 'faltas',
      label: 'Faltas del mes',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      value: 0,
      help: 'Con 1 falta se pierde un tercio del presentismo, con 2 dos tercios y con 3 o más, todo.',
    },
    {
      id: 'pctSindical',
      label: 'Cuota sindical y aporte solidario',
      type: 'number',
      suffix: '%',
      min: 0,
      max: 15,
      step: 0.1,
      value: 3,
      help: 'Sumá la cuota del gremio más el aporte solidario que figuran en tu recibo.',
    },
  ],
  fineprint:
    'Es una orientación sobre el bruto. Tu convenio, el divisor de jornada y los adicionales no remunerativos pueden cambiar el número final del recibo.',

  chart: {
    type: 'stacked',
    title: 'Tu recibo partido en pedazos',
    caption:
      'La barra muestra de qué está hecho tu bruto del mes: el sueldo base, cada tipo de hora extra, la nocturnidad, el plus por antigüedad y el presentismo. El último tramo son los descuentos que se van antes de que cobres.',
  },
  breakdownTitle: 'Cómo se arma el pago de tus horas',
  breakdownIntro:
    'Las filas en pesos son plata; las de horas y minutos están marcadas con su unidad. Las barras comparan cada concepto con el mayor.',

  faq: [
    {
      q: '¿Cómo se calculan las horas extra en Argentina?',
      a: 'Primero sale el valor de tu hora normal: sueldo bruto dividido por las horas mensuales de jornada (200 es el divisor estándar de jornada completa). Después, la hora extra en día hábil se paga con un recargo del 50% —o sea, hora normal × 1,5— y la de sábado después de las 13, domingo o feriado con un recargo del 100%, es decir hora normal × 2 (LCT art. 201).',
    },
    {
      q: '¿Cuándo corresponde el 50% y cuándo el 100%?',
      a: 'El 50% corre de lunes a viernes y el sábado hasta las 13:00. El 100% arranca el sábado a las 13:00 y sigue hasta el lunes a las 00:00, e incluye todos los feriados nacionales. No importa la actividad ni el convenio: el art. 201 de la LCT es piso mínimo para todos.',
    },
    {
      q: '¿La hora nocturna se paga con un 50% más?',
      a: 'No, y es el error más difundido. El art. 200 de la LCT no fija un recargo salarial sino un cómputo distinto: la jornada nocturna íntegra es de 7 horas en vez de 8, y en jornada mixta cada hora trabajada entre las 21:00 y las 06:00 se computa como 1 hora y 8 minutos. Si el empleador te hace cumplir 8 horas igual, esos 8 minutos por hora se abonan como tiempo extra. El plus salarial por nocturnidad existe en muchos convenios, pero es convencional, no legal.',
    },
    {
      q: '¿Cuánto vale mi hora de trabajo?',
      a: 'Dividí el sueldo bruto por las horas mensuales. Con $1.200.000 y el divisor estándar de 200 horas, la hora normal vale $6.000. Si tu jornada real es de 8 horas por 22 días, el divisor baja a 176 y esa misma hora pasa a valer $6.818: por eso conviene mirar qué divisor usa tu recibo.',
    },
    {
      q: '¿Hay un tope de horas extra por mes?',
      a: 'Sí. El decreto 484/2000 fija 30 horas extra por mes y 200 por año calendario sin autorización administrativa previa. Superar el tope no te hace perder el derecho a cobrarlas —se pagan igual con recargo— pero expone al empleador a una infracción laboral.',
    },
    {
      q: '¿Las horas extra entran en el aguinaldo y en la indemnización?',
      a: 'En el aguinaldo, sí: son remunerativas y engrosan la base del mejor mes del semestre (LCT art. 121). En la indemnización por antigüedad entran cuando son habituales y normales, criterio que la jurisprudencia sostiene desde el fallo "Brandi" para las horas extra pagadas mes a mes.',
    },
    {
      q: '¿Cómo funciona el presentismo y cuánto se pierde por faltar?',
      a: 'Es un adicional de convenio, típicamente el 8,33% del básico —equivalente a un sueldo extra al año—. El esquema más habitual descuenta un tercio del adicional con una falta, dos tercios con dos y el 100% con tres o más. Las llegadas tarde suelen descontar igual que las faltas y no se suman: se aplica el descuento mayor.',
    },
    {
      q: '¿Cómo se calcula el plus por antigüedad?',
      a: 'La mayoría de los convenios paga un porcentaje del básico por cada año cumplido, muy frecuentemente el 1%. Con 5 años y 1% anual sumás un 5% del básico todos los meses. Como es remunerativo, el impacto anual son 13 pagos: los 12 meses más el aguinaldo.',
    },
    {
      q: '¿Cuánto me descuentan de cuota sindical?',
      a: 'La cuota sindical ronda el 2% al 3% del bruto remunerativo y muchos convenios suman un aporte solidario para los no afiliados. Se retiene todos los meses y también sobre el aguinaldo, así que el impacto anual equivale a 13 descuentos, no a 12.',
    },
    {
      q: 'Mi empleador no me paga las horas extra, ¿qué puedo hacer?',
      a: 'Intimalo por telegrama laboral, que es gratuito para el trabajador (ley 23.789), pidiendo el pago y la registración correcta de la jornada. Guardá toda la prueba de los horarios: planillas, fichadas, mensajes y testigos. El plazo de prescripción es de 2 años (LCT art. 256), así que no dejes correr el reclamo.',
    },
    {
      q: '¿Puedo negarme a hacer horas extra?',
      a: 'Como regla, sí: las horas extra son voluntarias y el empleador no puede imponerlas, salvo casos de peligro, fuerza mayor o exigencias excepcionales de la economía nacional o de la empresa (LCT art. 203). Negarte fuera de esos supuestos no es causal de sanción.',
    },
    {
      q: '¿Una hora nocturna que además es extra cómo se paga?',
      a: 'Se combinan los dos institutos. Primero se aplica el cómputo del art. 200 —la hora nocturna equivale a 1 hora y 8 minutos— y sobre ese tiempo corre el recargo que corresponda: 50% si es día hábil o 100% si cae después de las 13 del sábado, domingo o feriado. Si tu convenio además paga un plus de nocturnidad, se suma aparte.',
    },
  ],

  sources: [
    {
      name: 'Ley de Contrato de Trabajo 20.744, art. 196 (jornada), 200 (trabajo nocturno) y 201 (horas suplementarias)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/25552/texact.htm',
      publisher: 'InfoLeg',
      date: 'texto ordenado vigente',
    },
    {
      name: 'Ley 11.544 — Jornada de trabajo (8 horas diarias y 48 semanales)',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/63368/texact.htm',
      publisher: 'InfoLeg',
      date: '1929',
    },
    {
      name: 'Decreto 484/2000 — tope de 30 horas extra mensuales y 200 anuales',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/63377/norma.htm',
      publisher: 'InfoLeg',
      date: '2000',
    },
    {
      name: 'Ley 23.789 — Telegrama y carta documento laboral gratuitos',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/271/norma.htm',
      publisher: 'InfoLeg',
      date: '1990',
    },
    {
      name: 'Trabajo registrado y jornada laboral — información oficial',
      url: 'https://www.argentina.gob.ar/trabajo',
      publisher: 'Ministerio de Capital Humano',
    },
    {
      name: 'Convenios colectivos de trabajo (buscador oficial de CCT y escalas)',
      url: 'https://www.argentina.gob.ar/trabajo/convenios-colectivos',
      publisher: 'Ministerio de Capital Humano',
    },
  ],

  replaces: [
    '/calculadora-sueldo-por-hora',
    '/calculadora-horas-extra',
    '/calculadora-presentismo-puntualidad',
    '/calculadora-horas-extras-50-100',
    '/calculadora-sueldo-hora-extra-nocturna-feriado',
    '/calculadora-plus-antiguedad',
    '/calculadora-cuota-sindical-descuento-sueldo',
    '/calculadora-valor-hora-trabajo',
    '/calculadora-valor-hora-trabajo-mensual',
    '/calculadora-horas-nocturnas-argentina',
  ],

  lastReviewed: '2026-07-27',
  audience: 'AR',
};

/**
 * Parámetros por rama.
 *  - focus: qué número manda en el panel de resultado.
 *  - norma: artículo que gobierna esa rama.
 */
export const CASE_MATH: Record<string, { focus: 'e50' | 'e100' | 'noct' | 'hora'; norma: string }> = {
  extra50: { focus: 'e50', norma: 'Art. 201 LCT' },
  extra100: { focus: 'e100', norma: 'Art. 201 LCT' },
  nocturna: { focus: 'noct', norma: 'Art. 200 LCT' },
  hora: { focus: 'hora', norma: 'Art. 196 LCT' },
};

/** Constantes del cálculo. */
export const PARAMS = {
  /** Recargo de la hora extra en día hábil (art. 201). */
  RECARGO_50: 1.5,
  /** Recargo de sábado post 13, domingo y feriado (art. 201). */
  RECARGO_100: 2,
  /** Minutos que suma cada hora nocturna al cómputo de la jornada (art. 200). */
  MINUTOS_NOCTURNOS: 8,
  /** Aportes personales del trabajador: 11% jubilación + 3% PAMI + 3% obra social. */
  APORTES: 0.17,
  /** Tope legal de horas extra mensuales (decreto 484/2000). */
  TOPE_MENSUAL: 30,
};
