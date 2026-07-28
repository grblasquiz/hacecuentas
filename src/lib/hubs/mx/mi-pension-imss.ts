import type { HubData } from '../types';
import { MEXICO_2026 } from '../../data/mexico-2026';

/**
 * Hub de decisión MX — "¿De cuánto va a ser mi pensión y me alcanzan las semanas?"
 *
 * Absorbe 9 calculadoras que respondían pedazos de la misma pregunta: la pensión
 * por Ley 73, la de Ley 97 (cuenta individual + pensión garantizada), la compra de
 * semanas y salario por Modalidad 40, el conteo de semanas cotizadas, la pensión
 * del ISSSTE por el Décimo Transitorio, la de invalidez y la de viudez.
 *
 * Todas las constantes salen de la fuente única src/lib/data/mexico-2026.ts
 * (UMA, salario mínimo, tabla del Art. 167 LSS-73, factores de edad, requisitos de
 * la pensión garantizada Art. 170 y porcentajes de invalidez del Art. 141).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** UMA 2026 (INEGI, DOF 09-ene-2026). */
export const UMA_MX = { diaria: MEXICO_2026.uma.diaria, mensual: MEXICO_2026.uma.mensual };

/** Salario mínimo general 2026 y factor de mensualización IMSS. */
export const SM_MX = {
  generalDiario: MEXICO_2026.salarioMinimo.generalDiario,
  generalMensual: MEXICO_2026.salarioMinimo.generalMensual,
  factorMensual: MEXICO_2026.salarioMinimo.factorMensual,
};

/**
 * Régimen Ley 73 (LSS 1973). `Infinity` del último renglón de la tabla del Art. 167
 * se serializa como `null` al cruzar a `define:vars`.
 */
export const LEY73_MX = {
  semanasMinimas: MEXICO_2026.ley73.semanasMinimas,
  topeSalarioUmas: MEXICO_2026.ley73.topeSalarioUmas,
  tablaArt167: MEXICO_2026.ley73.tablaArt167.map((f) => [
    Number.isFinite(f[0]) ? f[0] : null,
    f[1],
    f[2],
  ]),
  factorEdad: MEXICO_2026.ley73.factorEdad,
  asignaciones: MEXICO_2026.ley73.asignaciones,
  /** Decreto DOF 20-dic-2001: las pensiones de cesantía/vejez Ley 73 se incrementan 11%. */
  factorDecreto2001: 1.11,
  /** La pensión mínima publicada por el IMSS se mensualiza con 365/12 días. */
  diasMesOficial: 365 / 12,
};

/** Pensión garantizada Ley 97 (LSS Art. 170, reforma DOF 16-dic-2020). */
export const PMG_MX = MEXICO_2026.pmgLey97;

/** Pensión por invalidez (LSS Arts. 138 y 141). */
export const INVALIDEZ_MX = MEXICO_2026.pensionInvalidez;

/** Cuotas IMSS que integran la tasa de Modalidad 40 (LSS Arts. 25, 147, 168). */
export const IMSS_MX = {
  topeSbcUmas: MEXICO_2026.imss.topeSbcUmas,
  patronRetiro: MEXICO_2026.imss.patron.retiro,
  patronInvalidezVida: MEXICO_2026.imss.patron.invalidezVida,
  patronGastosMedicos: MEXICO_2026.imss.patron.gastosMedicosPensionados,
  obreroInvalidezVida: MEXICO_2026.imss.obrero.invalidezVida,
  obreroGastosMedicos: MEXICO_2026.imss.obrero.gastosMedicosPensionados,
  obreroCesantiaVejez: MEXICO_2026.imss.obrero.cesantiaVejez,
  ceavTabla2026: MEXICO_2026.imss.patron.ceavTabla2026.map((t) => ({
    hastaUmas: Number.isFinite(t.hastaUmas) ? t.hastaUmas : null,
    tasa: t.tasa,
  })),
};

/**
 * ISSSTE — Artículo Décimo Transitorio de la Ley del ISSSTE 2007.
 * Tope del sueldo básico: 10 UMA elevadas al mes (Art. 17 LISSSTE, SCJN 2a./J. 200/2020).
 * Edad mínima de jubilación 2026-2027 tras la reforma DOF 24-jun-2025.
 */
export const ISSSTE_MX = {
  topeUma: 10,
  edadMinimaJubilacion: { hombre: 58, mujer: 56 },
  aniosPara100: { hombre: 30, mujer: 28 },
  tablaEdadServicio: {
    15: 0.5, 16: 0.525, 17: 0.55, 18: 0.575, 19: 0.6, 20: 0.625,
    21: 0.65, 22: 0.675, 23: 0.7, 24: 0.725, 25: 0.75, 26: 0.8,
    27: 0.85, 28: 0.9, 29: 0.95,
  } as Record<number, number>,
  tablaCesantia: { 65: 0.4, 66: 0.42, 67: 0.44, 68: 0.46, 69: 0.48 } as Record<number, number>,
  cesantiaMax: 0.5,
};

/**
 * Pensión de viudez y orfandad del IMSS (LSS Arts. 130, 131, 137, 138, 164).
 * La viudez es el 90% de la pensión que le correspondía al asegurado, no de su salario.
 */
export const VIUDEZ_MX = {
  porcentajeViudez: 0.9,
  porcentajeOrfandad: 0.2,
  porcentajeAscendiente: 0.2,
  semanasMinimas: 150,
  semanasMatrimonioMinimas: 52,
  /** LSS Art. 164: el aguinaldo de una pensión equivale a una mensualidad al año. */
  mesesAguinaldo: 1,
};

export const hub: HubData = {
  slug: 'mx/trabajo/mi-pension-imss',
  title: 'Pensión IMSS 2026: Ley 73, Ley 97, Modalidad 40 y semanas cotizadas',
  description:
    'Calcula de cuánto sería tu pensión del IMSS y si te alcanzan las semanas: régimen de Ley 73 con la tabla del Art. 167, cuenta individual y pensión garantizada de Ley 97, Modalidad 40, ISSSTE por el Décimo Transitorio, invalidez y viudez.',
  silo: 'Trabajo',
  siloHref: '/mx/trabajo',

  eyebrow: 'México · pensiones IMSS e ISSSTE',
  h1: '¿De cuánto va a ser mi pensión y me alcanzan las semanas?',
  lede:
    'La respuesta cambia por completo según cuándo empezaste a cotizar. Si fue antes del 1 de julio de 1997 estás en Ley 73 y tu pensión sale de una tabla; si fue después, dependes del saldo de tu Afore y de la pensión garantizada. Elige tu caso y pon tus datos: te decimos el monto estimado y cuántas semanas te faltan.',
  stamps: [
    'Tabla del Art. 167 LSS-73',
    'Pensión garantizada · LSS Art. 170',
    `Requisito 2026: ${MEXICO_2026.pmgLey97.semanasRequeridas2026} semanas`,
    '9 calculadoras fusionadas',
  ],

  resultLabel: 'Pensión mensual estimada',

  cases: {
    title: '¿Cuál es tu caso?',
    intro:
      'Empezamos por el régimen de Ley 73, el de quienes cotizaron por primera vez antes del 1 de julio de 1997.',
    items: [
      {
        id: 'ley73',
        label: 'Ley 73 — cotizo desde antes de julio de 1997',
        hint: 'La pensión sale de la tabla del Art. 167 sobre tu salario promedio de las últimas 250 semanas.',
        yes: [
          'Cuantía básica de la tabla del Art. 167 de la LSS de 1973 según tu salario promedio expresado en UMA',
          'Incrementos por cada 52 semanas cotizadas arriba de las 500 mínimas',
          'Asignaciones familiares: 15% por cónyuge y 10% por hijo, o ayuda asistencial del 15% si no tienes dependientes',
          'Factor por edad de retiro (75% a los 60, 100% a los 65) y el incremento del 11% del decreto de 2001',
          'Piso de la pensión mínima garantizada de la Ley 73',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El salario promedio se topa a 25 UMA diarias: lo que ganes arriba de ese tope no sube tu pensión',
          'Cada 52 semanas completas arriba de las 500 suman un incremento; las semanas sueltas que no completan un año no cuentan',
          'La pensión con asignaciones familiares no puede exceder el 100% de tu salario promedio (Art. 169)',
        ],
        plazo:
          'la pensión se solicita ante la subdelegación del IMSS; el salario promedio se calcula sobre las últimas 250 semanas, así que conviene no bajar de salario en los últimos cinco años.',
        answer:
          'En Ley 73 tu pensión depende de tu salario promedio de las últimas 250 semanas, de las semanas cotizadas y de la edad a la que te retires.',
      },
      {
        id: 'ley97',
        label: 'Ley 97 — cotizo desde julio de 1997 en adelante',
        hint: 'Tu pensión es lo que alcance el saldo de tu Afore, con la pensión garantizada como piso.',
        yes: [
          'Proyección del saldo de tu Afore hasta la edad de retiro, con el rendimiento anual que elijas',
          'Estimación de la pensión mensual que compraría ese saldo con una renta vitalicia',
          'Requisito de semanas del año en curso y cuántas te faltan',
          'Pensión garantizada del Art. 170 como piso, estimada por tu salario base de cotización en UMA',
        ],
        warn: [
          DISCLAIMER_LABOR,
          `El requisito de semanas sube 25 por año: en 2026 son ${MEXICO_2026.pmgLey97.semanasRequeridas2026} y llega a ${MEXICO_2026.pmgLey97.semanasTope} en ${MEXICO_2026.pmgLey97.anioTope}`,
          'La renta vitalicia real la cotizan las aseguradoras según tu edad, tu sexo y tus beneficiarios: el monto definitivo puede diferir del estimado',
          'El monto exacto de la pensión garantizada sale del cruce de salario, edad y semanas de la tabla del Art. 170; aquí se estima por interpolación',
        ],
        plazo:
          'la pensión garantizada se puede pedir desde los 60 años por cesantía o a los 65 por vejez, siempre que cumplas las semanas del año en que la solicites.',
        answer:
          'En Ley 97 cobras lo que alcance tu saldo, y si no llega, el Estado te garantiza un piso siempre que cumplas semanas y edad.',
      },
      {
        id: 'modalidad40',
        label: 'Quiero saber si me conviene la Modalidad 40',
        hint: 'Continuación voluntaria: pagas tú la cuota completa para subir tu salario promedio y sumar semanas.',
        yes: [
          'Cuota mensual con la tasa 2026 de Modalidad 40, que es progresiva según el nivel de salario elegido',
          'Aportación total del período, con el incremento anual que estimes para la UMA',
          'Semanas totales al cierre y pensión de Ley 73 proyectada con el salario elegido',
          'Meses de pensión que necesitas para recuperar todo lo aportado',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La Modalidad 40 solo sirve si estás en Ley 73: en Ley 97 lo que sube es el saldo de tu Afore, no una tabla',
          'Tienes que inscribirte dentro de los cinco años siguientes a tu baja del régimen obligatorio',
          'La cuota sube cada año con la UMA, y si dejas de pagar dos meses seguidos se cancela la continuación voluntaria',
          'Solo cuentan las últimas 250 semanas para el salario promedio: inscribirte más de cinco años antes del retiro no mejora el promedio',
        ],
        plazo:
          'la cuota se paga mes a mes; la baja por falta de pago es automática y volver a inscribirte reinicia el trámite.',
        answer:
          'La Modalidad 40 conviene cuando el aumento de pensión se recupera en pocos años de cobro, no cuando la cuota se come el beneficio.',
      },
      {
        id: 'issste',
        label: 'Trabajo en el sector público (ISSSTE, Décimo Transitorio)',
        hint: 'Para quienes cotizaban antes del 1 de abril de 2007 y eligieron el régimen de reparto.',
        yes: [
          'Régimen que te aplica: jubilación, retiro por edad y tiempo de servicios, o cesantía en edad avanzada',
          'Porcentaje del sueldo básico que te corresponde según tus años de servicio y tu edad',
          'Tope del sueldo básico de cotización en 10 UMA elevadas al mes',
          'Piso de un salario mínimo mensual y tasa de reemplazo resultante',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La edad mínima de jubilación bajó con la reforma publicada en el DOF el 24 de junio de 2025 y sigue bajando: en 2026 y 2027 es de 58 años para hombres y 56 para mujeres',
          'El sueldo básico se topa en 10 UMA elevadas al mes, no en salarios mínimos: así lo resolvió la Suprema Corte',
          'Si te pasaste a cuentas individuales de PENSIONISSSTE, este cálculo no te aplica',
        ],
        plazo:
          'la pensión se calcula sobre el sueldo básico promedio del último año de cotización, así que el último año de sueldo es el que manda.',
        answer:
          'Con 30 años de servicio (28 mujeres) y la edad mínima cumplida cobras el 100% de tu sueldo básico topado a 10 UMA.',
      },
      {
        id: 'invalidez',
        label: 'Me van a dictaminar invalidez',
        hint: 'Pensión del 35% del salario promedio de las últimas 500 semanas, más asignaciones familiares.',
        yes: [
          'Cuantía básica del 35% de tu salario promedio de las últimas 500 semanas (LSS Art. 141)',
          'Asignaciones familiares: 15% por cónyuge, 10% por hijo, 10% por ascendiente sin cónyuge ni hijos, o ayuda asistencial del 15%',
          'Requisito de 250 semanas cotizadas, que baja a 150 si el dictamen determina invalidez del 75% o más',
          'Tope del salario promedio en 25 UMA diarias',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La invalidez la dictamina el IMSS: no basta con estar incapacitado, tiene que declararse la pérdida de más de la mitad de tu capacidad de trabajo',
          'Los ascendientes solo generan asignación cuando no hay cónyuge ni hijos con derecho',
          'La pensión no puede quedar por debajo de la pensión garantizada vigente',
        ],
        plazo:
          'el dictamen de invalidez cierra el subsidio por enfermedad general; conviene revisar las semanas antes de que el subsidio se agote.',
        answer:
          'La pensión por invalidez es el 35% de tu salario promedio de las últimas 500 semanas más las asignaciones familiares que te correspondan.',
      },
      {
        id: 'viudez',
        label: 'Falleció mi cónyuge asegurado',
        hint: 'Pensión de viudez del 90% de la pensión que le correspondía, más orfandad por cada hijo.',
        yes: [
          'Pensión de viudez del 90% de la pensión que recibía o le habría correspondido al asegurado',
          'Pensión de orfandad del 20% de esa misma base por cada hijo con derecho',
          'Ascendientes con derecho al 20% cada uno cuando no hay viuda ni huérfanos',
          'Aguinaldo anual equivalente a una mensualidad (LSS Art. 164)',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Se exigen 150 semanas cotizadas del asegurado y, en general, un año de matrimonio, salvo que haya hijos en común o que la muerte haya sido por un riesgo de trabajo',
          'El 90% se calcula sobre la PENSIÓN del asegurado, no sobre su salario: es el error más común al estimarla',
          'La pensión de viudez se pierde al contraer nuevo matrimonio, aunque se entrega una suma de tres anualidades',
          'La suma de viudez, orfandad y ascendientes no puede exceder el 100% de la pensión base',
        ],
        plazo:
          'la pensión corre desde el día del fallecimiento y el trámite se hace en la subdelegación del IMSS con el acta de defunción.',
        answer:
          'La viudez es el 90% de la pensión del asegurado; cada hijo con derecho suma un 20% de orfandad sobre la misma base.',
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'En pesos mexicanos. Cada caso usa solo los campos que le tocan: los demás quedan sin efecto en ese cálculo.',
  fields: [
    {
      id: 'salarioPromedio',
      label: 'Salario mensual promedio (MXN)',
      prefix: '$',
      value: 18000,
      thousands: true,
      help: 'Ley 73: promedio de las últimas 250 semanas. Invalidez: de las últimas 500. ISSSTE: sueldo básico del último año.',
    },
    {
      id: 'semanas',
      label: 'Semanas cotizadas',
      type: 'number',
      value: 900,
      min: 0,
      max: 3000,
      step: 1,
      help: 'Las ves en tu constancia de semanas cotizadas del IMSS.',
    },
    {
      id: 'edadRetiro',
      label: 'Edad a la que te pensionas',
      type: 'select',
      value: '65',
      options: [
        { value: '58', label: '58 años (solo ISSSTE)' },
        { value: '60', label: '60 años — cesantía' },
        { value: '61', label: '61 años' },
        { value: '62', label: '62 años' },
        { value: '63', label: '63 años' },
        { value: '64', label: '64 años' },
        { value: '65', label: '65 años — vejez' },
        { value: '66', label: '66 años' },
        { value: '67', label: '67 años' },
        { value: '68', label: '68 años' },
        { value: '70', label: '70 años o más' },
      ],
      help: 'En Ley 73 el factor va del 75% a los 60 al 100% a los 65.',
    },
    {
      id: 'conyuge',
      label: '¿Tienes cónyuge o concubina(o)?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No' },
        { value: 'si', label: 'Sí' },
      ],
      help: 'Genera asignación familiar del 15% en Ley 73 e invalidez.',
    },
    {
      id: 'hijos',
      label: 'Hijos con derecho',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: 'Menores de 16, o hasta 25 si estudian. Suman 10% cada uno en Ley 73 e invalidez, y 20% de orfandad en viudez.',
    },
    {
      id: 'saldoAfore',
      label: 'Saldo actual de tu Afore (MXN)',
      prefix: '$',
      value: 450000,
      thousands: true,
      help: 'Solo para Ley 97. Es el saldo de la subcuenta de retiro, cesantía y vejez de tu estado de cuenta.',
    },
    {
      id: 'edadActual',
      label: 'Tu edad hoy',
      type: 'number',
      value: 45,
      min: 18,
      max: 75,
      step: 1,
      help: 'Solo para Ley 97: define cuántos años le quedan a tu saldo para capitalizar.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento anual esperado (%)',
      suffix: '%',
      type: 'number',
      value: 5,
      min: 0,
      max: 15,
      step: 0.5,
      help: 'Rendimiento nominal neto de comisiones que esperas de tu Afore.',
    },
    {
      id: 'umaM40',
      label: 'Modalidad 40: salario en UMA',
      type: 'number',
      value: 10,
      min: 1,
      max: 25,
      step: 1,
      help: 'Con cuántas UMA quieres cotizar. El máximo legal son 25.',
    },
    {
      id: 'aniosM40',
      label: 'Modalidad 40: años que vas a pagar',
      type: 'number',
      value: 5,
      min: 1,
      max: 10,
      step: 1,
      help: 'Solo las últimas 250 semanas (unos 5 años) cuentan para el salario promedio.',
    },
    {
      id: 'incrementoM40',
      label: 'Modalidad 40: alza anual de la cuota (%)',
      suffix: '%',
      type: 'number',
      value: 5,
      min: 0,
      max: 20,
      step: 0.5,
      help: 'La cuota sube cada año con la UMA. Estima la inflación que esperas.',
    },
    {
      id: 'aniosServicio',
      label: 'ISSSTE: años de servicio',
      type: 'number',
      value: 30,
      min: 0,
      max: 50,
      step: 1,
      help: 'Años cotizados al ISSSTE bajo el Décimo Transitorio.',
    },
    {
      id: 'sexo',
      label: 'ISSSTE: sexo',
      type: 'select',
      value: 'hombre',
      options: [
        { value: 'hombre', label: 'Hombre — 30 años para el 100%' },
        { value: 'mujer', label: 'Mujer — 28 años para el 100%' },
      ],
      help: 'Define los años necesarios para el 100% y la edad mínima de jubilación.',
    },
    {
      id: 'gradoInvalidez',
      label: 'Invalidez: grado dictaminado',
      type: 'select',
      value: 'menor75',
      options: [
        { value: 'menor75', label: 'Del 50% al 74% — 250 semanas' },
        { value: 'mayor75', label: 'Del 75% o más — 150 semanas' },
      ],
      help: 'El grado de invalidez cambia el requisito de semanas, no el porcentaje de la pensión.',
    },
    {
      id: 'pensionAsegurado',
      label: 'Viudez: pensión mensual del asegurado (MXN)',
      prefix: '$',
      value: 12000,
      thousands: true,
      help: 'La pensión que cobraba o que le habría correspondido. Si no la sabes, calcúlala antes en el caso de Ley 73.',
    },
    {
      id: 'semanasMatrimonio',
      label: 'Viudez: semanas de matrimonio',
      type: 'number',
      value: 260,
      min: 0,
      max: 3000,
      step: 1,
      help: 'Se piden 52 semanas (un año), salvo que haya hijos en común o muerte por riesgo de trabajo.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu pensión',
    caption:
      'Cada porción es un componente del monto mensual: la cuantía básica, lo que suman las semanas extra y lo que aportan las asignaciones familiares.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada concepto contra el mayor del cálculo.',

  faq: [
    {
      q: '¿Cómo sé si estoy en Ley 73 o en Ley 97?',
      a: 'Depende de una sola fecha: la de tu primera alta en el IMSS. Si cotizaste por primera vez antes del 1 de julio de 1997 estás en la Ley 73 y puedes elegir ese régimen al pensionarte, aunque hoy tengas cuenta en una Afore. Si tu primera alta fue el 1 de julio de 1997 o después, estás en la Ley 97 y tu pensión sale de lo que acumules en tu cuenta individual. Puedes confirmarlo en tu constancia de semanas cotizadas.',
    },
    {
      q: '¿Cuántas semanas necesito para pensionarme?',
      a: `En Ley 73 el mínimo es de 500 semanas, y no ha cambiado. En Ley 97 la reforma de 2020 dejó el requisito en 750 semanas para 2021 y lo sube 25 cada año: en 2026 son ${MEXICO_2026.pmgLey97.semanasRequeridas2026} y llegará a ${MEXICO_2026.pmgLey97.semanasTope} en ${MEXICO_2026.pmgLey97.anioTope}. Cuenta el requisito del año en que solicitas la pensión, no el del año en que empezaste a cotizar.`,
    },
    {
      q: '¿Qué salario se usa para calcular la pensión?',
      a: 'En Ley 73, el promedio del salario base de cotización de las últimas 250 semanas, es decir de los últimos cinco años aproximadamente. En la pensión por invalidez, el promedio de las últimas 500 semanas. En los dos casos el salario se topa a 25 UMA diarias, así que lo que ganes arriba de ese tope ni cotiza ni aumenta la pensión.',
    },
    {
      q: '¿Por qué me conviene esperar a los 65 años?',
      a: 'Porque en Ley 73 la pensión por cesantía en edad avanzada se reduce con un factor por edad: a los 60 años cobras el 75% del cálculo, a los 61 el 80%, y así hasta el 100% a los 65. Retirarte cinco años antes te cuesta una cuarta parte de la pensión de por vida, no solo durante esos cinco años. En Ley 97 el efecto es parecido, pero por otra vía: menos años de aportación y menos rendimiento acumulado.',
    },
    {
      q: '¿La Modalidad 40 realmente conviene?',
      a: 'Conviene cuando el aumento de pensión se recupera en pocos años de cobro. La cuota es alta porque pagas los ramos del trabajador y del patrón, y la parte de cesantía y vejez es progresiva: sube conforme eliges más UMA. La regla práctica es comparar cuánto pagarías en total contra el aumento mensual de pensión: si recuperas lo aportado en dos o tres años de pensión, la operación es buena; si tardas diez, no. Y solo aplica si estás en Ley 73.',
    },
    {
      q: '¿Cuántos años de Modalidad 40 me sirven?',
      a: 'Para efectos del salario promedio, solo las últimas 250 semanas, es decir unos cinco años. Inscribirte diez años antes de retirarte no mejora el promedio más que hacerlo cinco años antes: lo único que ganas son semanas cotizadas. Por eso el esquema clásico es entrar cinco años antes del retiro con el salario más alto que puedas pagar.',
    },
    {
      q: '¿Qué es la pensión garantizada y a cuánto asciende?',
      a: `Es el piso que el Estado asegura a quien está en Ley 97, cumple la edad y las semanas, pero cuyo saldo en la Afore no alcanza para una pensión digna. La reforma de 2020 sustituyó el monto único por una tabla del Art. 170 que cruza salario base de cotización, edad y semanas cotizadas. En 2026 va de alrededor de ${MEXICO_2026.pmgLey97.montoMin.toLocaleString('es-MX')} a ${MEXICO_2026.pmgLey97.montoMax.toLocaleString('es-MX')} pesos mensuales, con un promedio del sistema cercano a ${MEXICO_2026.pmgLey97.montoPromedioSistema.toLocaleString('es-MX')}.`,
    },
    {
      q: '¿La pensión de viudez es el 90% del salario del fallecido?',
      a: 'No, y es el error más frecuente. Es el 90% de la PENSIÓN que el asegurado recibía o que le habría correspondido, que a su vez se calculó sobre su salario. Como la pensión suele ser bastante menor que el salario, tomar el 90% del sueldo infla el resultado. Por eso este cálculo te pide la pensión del asegurado y no su sueldo.',
    },
    {
      q: '¿Puedo cobrar pensión de viudez y de orfandad al mismo tiempo?',
      a: 'Sí. Son prestaciones distintas: la viudez es el 90% de la pensión base y cada hijo con derecho genera un 20% adicional de orfandad sobre esa misma base. Lo que la ley limita es la suma: viudez, orfandad y ascendientes no pueden exceder el 100% de la pensión que le correspondía al asegurado. Cuando la suma se pasa, todas las pensiones se reducen proporcionalmente.',
    },
    {
      q: '¿Qué pasa si me faltan semanas cuando llego a la edad?',
      a: 'Tienes tres salidas. Puedes seguir cotizando en un empleo formal, inscribirte en la continuación voluntaria si estás en Ley 73, o darte de alta en la incorporación voluntaria como independiente para seguir sumando. También puedes retirar el saldo de tu Afore en una sola exhibición, pero renuncias a la pensión y a la atención médica del IMSS como pensionado, así que suele ser la peor opción.',
    },
    {
      q: '¿La pensión del ISSSTE se calcula igual que la del IMSS?',
      a: 'No. Quien cotizaba al ISSSTE antes del 1 de abril de 2007 y eligió el régimen de reparto se pensiona por el Artículo Décimo Transitorio: la pensión es un porcentaje del sueldo básico promedio del último año de cotización, no de un promedio de cinco años. Con 30 años de servicio (28 en el caso de las mujeres) llega al 100%. El sueldo básico se topa en 10 UMA elevadas al mes.',
    },
    {
      q: '¿Cuántas veces al año se paga la pensión?',
      a: 'Las pensiones del IMSS se pagan mensualmente y llevan un aguinaldo anual equivalente a una mensualidad, que se cubre en noviembre. Las pensiones de Ley 73 se actualizan cada febrero con la inflación del año anterior; la pensión mínima garantizada sigue al salario mínimo, que suele subir más.',
    },
  ],

  sources: [
    {
      name: 'Ley del Seguro Social vigente (Arts. 28, 141, 154, 162, 164, 170)',
      url: 'https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf',
      publisher: 'IMSS',
    },
    {
      name: 'Ley del Seguro Social de 1973 — cuantía básica e incrementos (Arts. 167, 168, 169, 171)',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/abro/lss/LSS_abro.pdf',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'Reforma al sistema de pensiones — DOF 16-dic-2020',
      url: 'https://www.dof.gob.mx/nota_detalle.php?codigo=5607729&fecha=16/12/2020',
      publisher: 'Diario Oficial de la Federación',
      date: '16-12-2020',
    },
    {
      name: 'Ley del ISSSTE — Artículo Décimo Transitorio y Art. 17',
      url: 'https://www.diputados.gob.mx/LeyesBiblio/ref/lissste.htm',
      publisher: 'Cámara de Diputados',
    },
    {
      name: 'INEGI — valor de la UMA',
      url: 'https://www.inegi.org.mx/temas/uma/',
      publisher: 'INEGI',
    },
    {
      name: 'CONASAMI — salarios mínimos 2026 (DOF 09-dic-2025)',
      url: 'https://www.gob.mx/conasami',
      publisher: 'CONASAMI',
      date: '09-12-2025',
    },
    {
      name: 'IMSS — Modalidad 40, continuación voluntaria en el régimen obligatorio',
      url: 'https://www.imss.gob.mx/tramites/imss02008',
      publisher: 'IMSS',
    },
  ],

  replaces: [
    '/calculadora-pension-imss-1997',
    '/calculadora-pension-imss-ley-73-mexico',
    '/calculadora-pension-imss-modalidad-40-mexico-aportacion',
    '/calculadora-pension-minima-garantizada-ley-97-mexico-2026',
    '/calculadora-semanas-cotizadas-imss-requisito',
    '/calculadora-pension-issste-decimo-transitorio-mexico-2026',
    '/calculadora-pension-invalidez-imss-mexico',
    '/calculadora-pension-viudez-imss-90-porcentaje-mexico',
    '/calculadora-imss-independientes-modalidad-10',
  ],

  lastReviewed: '2026-07-28',
  locale: 'mx',
};
