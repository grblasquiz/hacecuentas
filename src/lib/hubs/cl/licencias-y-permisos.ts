import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "Me enfermé o nació mi guagua: ¿cuánto cobro y por cuánto tiempo?"
 *
 * Absorbe licencia médica común y laboral, prenatal y postnatal, postnatal
 * parental y permiso de paternidad.
 *
 * Espejo de:
 *  - src/lib/formulas/licencia-medica-chile-pago-subsidio-isapre-fonasa.ts (CORREGIDO)
 *  - src/lib/formulas/permiso-postnatal-chile-12-semanas-extension.ts (CORREGIDO)
 *  - src/lib/formulas/permiso-paternidad-chile-5-dias-corridos.ts
 *
 * CORRECCIONES respecto de las fórmulas viejas (ver reporte):
 *  1. Las dos fórmulas tenían la UF hardcodeada y desactualizada ($35.274,09 y
 *     $36.850 cuando la UF viva ronda los $40.845). Acá sale de
 *     src/data/live/chile.json.
 *  2. `licencia-medica` cobraba SIEMPRE 3 días de carencia. El Art. 14 del DFL 44
 *     solo la aplica a las licencias de 10 días o menos: desde el día 11 la
 *     licencia se paga íntegra desde el primer día.
 *  3. `licencia-medica` hacía que el EMPLEADOR pagara esos 3 días al 100%. En
 *     Fonasa e Isapre los 3 días de carencia simplemente no se pagan, salvo que
 *     el contrato o el convenio digan otra cosa.
 *  4. `licencia-medica` decía que el prenatal lo paga el empleador. El prenatal
 *     y el postnatal los paga el subsidio maternal estatal.
 *  5. `permiso-postnatal` calculaba `TOPE_SUBSIDIO_DIARIO = 73,2 UF × UF` y lo
 *     comparaba contra el sueldo DIARIO: el tope mensual quedaba usado como tope
 *     diario, así que nunca se activaba y a las rentas altas les prometía el 100%
 *     de su sueldo. Acá el tope es mensual y se aplica sobre la renta mensual.
 *  6. Los topes de 81,4 UF y 73,2 UF de las fórmulas viejas son valores de años
 *     anteriores: el tope imponible vigente es de 90 UF.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
export const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Indicadores vivos (mindicador.cl), con el mismo fallback que las fórmulas originales. */
export const UF = (clLive as any)?.uf?.valor ?? 40844.79;
export const UF_FECHA = String((clLive as any)?.uf?.fecha ?? '').slice(0, 10);

export const REGLAS = {
  /** Tope imponible mensual del subsidio, en UF (mismo tope que AFP y salud). */
  topeUf: CHILE_2026.topeImponibleAfpUf,
  /** Art. 14 DFL 44: la carencia de 3 días solo aplica a licencias de 10 días o menos. */
  carenciaDias: 3,
  carenciaSoloHastaDias: 10,
  /** Art. 195 CT — descanso prenatal: 6 semanas. */
  prenatalSemanas: 6,
  /** Art. 195 CT — descanso postnatal: 12 semanas. */
  postnatalSemanas: 12,
  /** Art. 197 bis CT — postnatal parental jornada completa: 12 semanas. */
  parentalCompletaSemanas: 12,
  /** Art. 197 bis CT — postnatal parental media jornada: 18 semanas al 50%. */
  parentalMediaSemanas: 18,
  parentalMediaFactor: 0.5,
  /** Art. 197 bis CT — semanas máximas traspasables al padre en jornada completa. */
  parentalPadreMaxCompleta: 6,
  /** Art. 197 bis CT — semanas máximas traspasables al padre en media jornada. */
  parentalPadreMaxMedia: 12,
  /** Art. 195 inc. 2 CT — permiso de paternidad: 5 días pagados por el empleador. */
  paternidadDias: 5,
  /** Días del mes comercial que usa la legislación laboral chilena. */
  mesComercial: 30,
};

/** Tope mensual del subsidio, en pesos, con la UF viva. */
export const TOPE_SUBSIDIO_MENSUAL = REGLAS.topeUf * UF;

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
slug: 'cl/trabajo/licencias-y-permisos',
  title: 'Licencia médica, prenatal, postnatal y permiso de paternidad en Chile: cuánto se paga',
  description:
    'Calcula cuánto cobras por una licencia médica común o de accidente del trabajo, por el prenatal y el postnatal, por el postnatal parental completo o a media jornada, y por los 5 días de permiso de paternidad, con el tope imponible en UF vigente.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · licencias y permisos',
  h1: 'Me enfermé o nació mi guagua: ¿cuánto cobro y por cuánto tiempo?',
  lede:
    'Una licencia médica corta se paga distinto a una larga, el prenatal lo paga el Estado y no la empresa, y el postnatal parental te deja elegir entre 12 semanas completas o 18 a media jornada. Elige tu caso, pon tu renta imponible y mira los días y la plata exactos.',
  stamps: [
    `Tope del subsidio: ${REGLAS.topeUf} UF al mes (hoy ${fmt(TOPE_SUBSIDIO_MENSUAL)})`,
    `Carencia: ${REGLAS.carenciaDias} días solo en licencias de hasta ${REGLAS.carenciaSoloHastaDias} días`,
    `Prenatal ${REGLAS.prenatalSemanas} semanas + postnatal ${REGLAS.postnatalSemanas} semanas`,
    'Arts. 195 y 197 bis CT · DFL 44 · Ley 16.744',
    '5 casos en una sola página',
  ],

  resultLabel: 'Lo que vas a cobrar',

  cases: {
    title: '¿Cuál es tu situación?',
    intro:
      'Partimos por el caso más común: una licencia médica por enfermedad común, con Fonasa o con Isapre.',
    items: [
      {
        id: 'comun',
        label: 'Tengo una licencia médica por enfermedad común',
        hint: 'La regla de los 3 días de carencia solo se aplica si la licencia dura 10 días o menos.',
        yes: [
          `Subsidio diario: tu renta imponible promedio dividida en ${REGLAS.mesComercial} días`,
          `Los ${REGLAS.carenciaDias} primeros días NO se pagan si la licencia es de ${REGLAS.carenciaSoloHastaDias} días o menos (Art. 14 DFL 44)`,
          `Si la licencia dura ${REGLAS.carenciaSoloHastaDias + 1} días o más, se paga completa desde el primer día`,
          `El tope del subsidio: ${REGLAS.topeUf} UF de renta mensual`,
        ],
        warn: [
          DISCLAIMER_LABOR,
          `Los ${REGLAS.carenciaDias} días de carencia no los paga nadie: ni el empleador ni la Isapre ni Fonasa, salvo que el contrato o el convenio colectivo lo pacten`,
          'El subsidio se calcula sobre el promedio de las rentas imponibles de los 3 meses anteriores, no sobre el sueldo del mes de la licencia',
          'El subsidio es "ingreso no renta" (Art. 17 N°13 LIR): no paga Impuesto Único, pero sí se le descuentan las cotizaciones previsionales',
          'La COMPIN o la Isapre pueden reducir o rechazar la licencia: si eso pasa, tienes 15 días hábiles para apelar',
        ],
        plazo:
          'la licencia se presenta dentro de 2 días hábiles desde el inicio del reposo (3 días si eres funcionario público); el pago del subsidio llega dentro de los 10 días desde la autorización.',
        answer:
          'Si la licencia dura 10 días o menos, los 3 primeros no se pagan; si dura 11 días o más, se paga completa desde el día 1.',
      },
      {
        id: 'laboral',
        label: 'Es un accidente del trabajo o una enfermedad profesional',
        hint: 'Ley 16.744: la mutual o el ISL paga el 100% desde el primer día, sin carencia.',
        yes: [
          'Subsidio del 100% de la renta imponible desde el primer día, sin descuento de carencia',
          'Lo paga la mutualidad o el Instituto de Seguridad Laboral, no tu empleador ni tu Isapre',
          'Cobertura de las prestaciones médicas sin copago',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El accidente tiene que ser calificado como laboral por el organismo administrador: si lo califican como común, pasa a las reglas de la licencia común con carencia',
          'El accidente de trayecto (de la casa al trabajo y viceversa) también está cubierto por la Ley 16.744',
          'Si el organismo rechaza la calificación, puedes reclamar ante la Superintendencia de Seguridad Social',
          'El subsidio también está topado en la renta imponible máxima',
        ],
        plazo:
          'el accidente debe denunciarse mediante la DIAT dentro de las 24 horas de ocurrido; el reclamo por la calificación va a la SUSESO en 90 días hábiles.',
        answer:
          'Un accidente del trabajo se paga al 100% desde el primer día por la mutual: no hay días de carencia.',
      },
      {
        id: 'maternal',
        label: 'Estoy embarazada: prenatal y postnatal',
        hint: 'Seis semanas antes del parto y doce después, con subsidio maternal del Estado.',
        yes: [
          `Descanso prenatal de ${REGLAS.prenatalSemanas} semanas antes de la fecha probable del parto`,
          `Descanso postnatal de ${REGLAS.postnatalSemanas} semanas después del parto`,
          'Subsidio maternal del 100% de la renta imponible promedio, con el tope de UF',
          'El total de días y el monto acumulado del período',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El prenatal y el postnatal los paga el subsidio maternal estatal, no el empleador: la fórmula anterior de este sitio decía lo contrario',
          'El descanso de maternidad es irrenunciable: no se puede cambiar por dinero',
          'Si el parto se adelanta, los días de prenatal no usados se suman al postnatal',
          'El fuero maternal va desde el inicio del embarazo hasta un año después de terminado el postnatal',
        ],
        plazo:
          'el prenatal empieza 6 semanas antes de la fecha probable de parto que certifica el médico o la matrona.',
        answer:
          `El descanso maternal es de ${REGLAS.prenatalSemanas} semanas de prenatal más ${REGLAS.postnatalSemanas} de postnatal, pagadas por el subsidio maternal estatal.`,
      },
      {
        id: 'parental',
        label: 'Quiero el postnatal parental (y ver si lo tomo completo o a media jornada)',
        hint: 'Doce semanas de jornada completa o dieciocho a media jornada con el 50% del subsidio.',
        yes: [
          `Modalidad completa: ${REGLAS.parentalCompletaSemanas} semanas con el 100% del subsidio`,
          `Modalidad media jornada: ${REGLAS.parentalMediaSemanas} semanas con el ${REGLAS.parentalMediaFactor * 100}% del subsidio, más lo que te pague el empleador por la media jornada trabajada`,
          'Comparación de los dos caminos en plata total',
          'Las semanas que puedes traspasar al padre en cada modalidad',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'En media jornada el subsidio es la mitad, pero además el empleador te paga la media jornada que sí trabajas: el ingreso total puede ser parecido al de la modalidad completa',
          `Al padre puedes traspasarle hasta ${REGLAS.parentalPadreMaxCompleta} semanas en jornada completa o ${REGLAS.parentalPadreMaxMedia} en media jornada, y siempre a partir de la séptima semana`,
          'La opción de media jornada hay que avisarla al empleador con al menos 30 días de anticipación al término del postnatal',
          'El subsidio del padre se calcula sobre la renta imponible del padre, no sobre la de la madre',
        ],
        plazo:
          'la opción por la media jornada se avisa por carta certificada al empleador y a la Inspección del Trabajo con 30 días de anticipación al término del postnatal.',
        answer:
          `El postnatal parental son ${REGLAS.parentalCompletaSemanas} semanas completas o ${REGLAS.parentalMediaSemanas} a media jornada con la mitad del subsidio.`,
      },
      {
        id: 'paternidad',
        label: 'Soy el padre y quiero mis días de permiso',
        hint: 'Cinco días pagados por el empleador, dentro del primer mes desde el parto.',
        yes: [
          `${REGLAS.paternidadDias} días de permiso pagado por el nacimiento (Art. 195 inc. 2 CT)`,
          'Lo paga el empleador como remuneración normal, no es subsidio',
          'El monto que corresponde a esos días según tu remuneración',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El permiso es irrenunciable: no se puede cambiar por dinero ni por días adicionales de vacaciones',
          'Se puede usar de corrido desde el parto o distribuido dentro del primer mes',
          'En caso de adopción, los 5 días se cuentan desde la sentencia definitiva',
          'Además de estos 5 días, el padre puede recibir semanas traspasadas del postnatal parental de la madre',
        ],
        plazo:
          `los ${REGLAS.paternidadDias} días se usan dentro del primer mes desde la fecha del nacimiento.`,
        answer:
          `El permiso de paternidad es de ${REGLAS.paternidadDias} días pagados por el empleador, usables dentro del primer mes desde el parto.`,
      },
    ],
  },

  inputsTitle: 'Tus datos',
  inputsIntro:
    'La renta imponible promedio es el promedio de tus últimas 3 rentas imponibles, que es la base con la que se calculan todos los subsidios. Según el caso que elijas, algunos campos quedan sin efecto.',
  fields: [
    {
      id: 'renta',
      label: 'Renta imponible mensual promedio',
      type: 'number',
      value: 1000000,
      prefix: '$',
      min: 0,
      step: 10000,
      thousands: true,
      help: 'Promedio de las últimas 3 rentas imponibles. Es la base del subsidio.',
    },
    {
      id: 'dias',
      label: 'Días de licencia',
      type: 'number',
      value: 7,
      min: 1,
      max: 365,
      step: 1,
      help: `La carencia de ${REGLAS.carenciaDias} días solo se aplica si la licencia dura ${REGLAS.carenciaSoloHastaDias} días o menos.`,
    },
    {
      id: 'modalidadParental',
      label: 'Modalidad del postnatal parental',
      type: 'select',
      value: 'completa',
      options: [
        { value: 'completa', label: `Jornada completa — ${REGLAS.parentalCompletaSemanas} semanas al 100%` },
        { value: 'media', label: `Media jornada — ${REGLAS.parentalMediaSemanas} semanas al ${REGLAS.parentalMediaFactor * 100}%` },
      ],
    },
    {
      id: 'semanasPadre',
      label: 'Semanas del postnatal parental traspasadas al padre',
      type: 'number',
      value: 0,
      min: 0,
      max: 12,
      step: 1,
      help: `Máximo ${REGLAS.parentalPadreMaxCompleta} en jornada completa y ${REGLAS.parentalPadreMaxMedia} en media jornada, siempre desde la séptima semana.`,
    },
    {
      id: 'sistema',
      label: 'Tu sistema de salud',
      type: 'select',
      value: 'fonasa',
      options: [
        { value: 'fonasa', label: 'Fonasa' },
        { value: 'isapre', label: 'Isapre' },
      ],
      help: 'El monto del subsidio no cambia entre Fonasa e Isapre: cambia quién lo paga y quién autoriza la licencia.',
    },
  ],
  fineprint:
    'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional. El tope del subsidio está expresado en UF y se recalcula con el valor del día publicado por mindicador.cl.',

  chart: {
    type: 'donut',
    title: 'Cómo se reparte el pago de la licencia',
    caption:
      'Muestra qué parte del período te la pagan como subsidio, qué parte cae en la carencia sin pago y cuánto te recorta el tope imponible.',
  },
  breakdownTitle: 'El cálculo, línea por línea',
  breakdownIntro:
    'Cada fila indica la norma que la respalda. El tope está en UF, así que el monto en pesos cambia todos los días.',

  faq: [
    {
      q: '¿Me pagan los 3 primeros días de licencia médica?',
      a: 'Depende de la duración. Si la licencia dura 10 días o menos, los 3 primeros días no se pagan: es la carencia del Art. 14 del DFL 44. Si dura 11 días o más, se paga íntegra desde el primer día. La carencia no la paga nadie: ni el empleador, ni Fonasa, ni la Isapre, salvo que el contrato o el convenio colectivo lo pacten expresamente.',
    },
    {
      q: '¿Sobre qué renta se calcula el subsidio por licencia?',
      a: 'Sobre el promedio de las rentas imponibles de los 3 meses calendario anteriores al mes en que se inicia la licencia, no sobre el sueldo del mes de la licencia. Ese promedio se divide en 30 para obtener el subsidio diario.',
    },
    {
      q: '¿Cuál es el tope del subsidio por licencia médica?',
      a: `El subsidio se calcula sobre la renta imponible, que está topada en ${REGLAS.topeUf} UF mensuales, hoy ${fmt(TOPE_SUBSIDIO_MENSUAL)}. Si tu renta supera ese tope, el subsidio se calcula solo sobre la parte topada: la diferencia la pierdes.`,
    },
    {
      q: '¿El subsidio por licencia paga impuestos?',
      a: 'No paga Impuesto Único de Segunda Categoría: el Art. 17 N°13 de la Ley de la Renta lo califica como ingreso no constitutivo de renta. Sí se le descuentan las cotizaciones previsionales de AFP y salud, que se siguen pagando durante la licencia.',
    },
    {
      q: '¿Qué pasa si es un accidente del trabajo?',
      a: 'Cambia todo: la Ley 16.744 obliga a la mutualidad o al Instituto de Seguridad Laboral a pagar el 100% de la renta imponible desde el primer día, sin carencia, y a cubrir las prestaciones médicas sin copago. Lo mismo vale para el accidente de trayecto.',
    },
    {
      q: '¿Cuánto dura el descanso de maternidad en Chile?',
      a: `Seis semanas de prenatal antes de la fecha probable de parto y doce semanas de postnatal después (Art. 195 CT), es decir 126 días. A eso se suma el postnatal parental del Art. 197 bis: doce semanas más de jornada completa o dieciocho a media jornada.`,
    },
    {
      q: '¿Quién paga el prenatal y el postnatal?',
      a: 'El subsidio maternal estatal, administrado por Fonasa, la Isapre o la Caja de Compensación según corresponda. No lo paga el empleador. El monto es el 100% de la renta imponible promedio, con el tope de UF.',
    },
    {
      q: '¿Me conviene el postnatal parental completo o a media jornada?',
      a: 'En jornada completa recibes 12 semanas con el 100% del subsidio. A media jornada recibes 18 semanas con el 50% del subsidio, pero además el empleador te paga la media jornada que sí trabajas: en total el ingreso puede terminar siendo parecido, y ganas 6 semanas más de vínculo con la guagua. La decisión suele ser más de organización que de plata.',
    },
    {
      q: '¿Cuántas semanas le puedo traspasar al padre?',
      a: 'Hasta 6 semanas del postnatal parental si se toma en jornada completa, o hasta 12 si se toma a media jornada. En ambos casos el traspaso solo puede empezar desde la séptima semana del postnatal parental, y el subsidio del padre se calcula sobre la renta imponible de él.',
    },
    {
      q: '¿Cuántos días de permiso de paternidad hay en Chile?',
      a: `Cinco días pagados por el nacimiento (Art. 195 inc. 2 CT). Los paga el empleador como remuneración normal, no son subsidio, y se pueden usar de corrido desde el parto o repartidos dentro del primer mes. En caso de adopción se cuentan desde la sentencia definitiva.`,
    },
    {
      q: '¿Puedo trabajar durante una licencia médica?',
      a: 'No. Trabajar durante el reposo médico es causal de pérdida del subsidio y puede dar lugar a sanciones, además de habilitar el término del contrato por incumplimiento grave. La única excepción es la media jornada del postnatal parental, que está expresamente permitida.',
    },
    {
      q: '¿Qué hago si me rechazan o reducen la licencia?',
      a: 'Puedes apelar. Si estás en Fonasa, la resolución la dicta la COMPIN y la apelación va a la Superintendencia de Seguridad Social. Si estás en Isapre, primero reclamas ante la COMPIN y luego ante la SUSESO. El plazo general para apelar es de 15 días hábiles desde la notificación.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo — protección a la maternidad, paternidad y vida familiar (Arts. 194 a 208)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=207436',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'DFL 44 — normas comunes para los subsidios por incapacidad laboral (Art. 14, carencia)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=4859',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Superintendencia de Seguridad Social — subsidios por incapacidad laboral',
      url: 'https://www.suseso.cl/606/w3-propertyvalue-137293.html',
      publisher: 'SUSESO',
    },
    {
      name: 'ChileAtiende — permiso postnatal parental',
      url: 'https://www.chileatiende.gob.cl/fichas/3113-permiso-postnatal-parental',
      publisher: 'ChileAtiende',
    },
    {
      name: 'Ley 16.744 — accidentes del trabajo y enfermedades profesionales',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=28650',
      publisher: 'Biblioteca del Congreso Nacional',
    },
    {
      name: 'Superintendencia de Pensiones — tope imponible vigente',
      url: 'https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9891.html',
      publisher: 'Superintendencia de Pensiones',
    },
    {
      name: 'UF, UTM y UTA del día',
      url: 'https://mindicador.cl/',
      publisher: 'mindicador.cl (Banco Central de Chile / SII)',
    },
  ],

  replaces: [
    '/calculadora-licencia-medica-chile-pago-subsidio-isapre-fonasa',
    '/calculadora-permiso-postnatal-chile-12-semanas-extension',
    '/calculadora-permiso-paternidad-chile-5-dias-corridos',
  ],

lastReviewed: '2026-07-28',
};
