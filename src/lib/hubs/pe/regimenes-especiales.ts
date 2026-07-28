import type { HubData } from '../types';
import {
  PERU_2026,
  AGUINALDO_FIESTAS_PATRIAS_2026,
  CONSTRUCCION_CIVIL_2026,
  PRACTICAS_PERU_2026,
} from '../../data/peru-2026';

/**
 * Hub de decisión PE — "No estoy en el régimen general privado: ¿qué me corresponde?"
 *
 * Absorbe aguinaldo de Fiestas Patrias y de Navidad del sector público, jornal de
 * construcción civil, subvención de prácticas preprofesionales y profesionales, y
 * liquidación de trabajadora del hogar. Cálculo espejado de las fórmulas vivas
 * homónimas, con la corrección documentada de la gratificación del régimen del hogar
 * (dos gratificaciones al año, no una) y su bonificación extraordinaria.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABORAL =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const RMV = PERU_2026.rmv;
export const BONIF_GRATI = PERU_2026.gratificacion.bonificacionExtraordinaria;

/** D.S. 128-2026-EF: S/ 300 en la planilla de julio, base 90 días de servicio. */
export const AGUINALDO_FP = AGUINALDO_FIESTAS_PATRIAS_2026.monto;
export const AGUINALDO_BASE_DIAS = AGUINALDO_FIESTAS_PATRIAS_2026.baseDias;
/**
 * Aguinaldo de Navidad del sector público: NO existe constante verificada.
 * El monto lo fija el MEF por decreto supremo recién hacia noviembre-diciembre.
 * Se usa como REFERENCIA el mismo monto del aguinaldo de Fiestas Patrias, que es
 * lo que viene repitiéndose en los últimos ejercicios. No es un dato oficial de
 * Navidad: el hub lo declara como referencia editable y así lo advierte en pantalla.
 */
export const AGUINALDO_NAVIDAD_REFERENCIA = AGUINALDO_FIESTAS_PATRIAS_2026.monto;

/** Convenio FTCCP-CAPECO homologado por R.M. 197-2025-TR (vigencia anual). */
export const CONSTRUCCION = {
  jornal: CONSTRUCCION_CIVIL_2026.jornal as unknown as Record<string, number>,
  bucPct: CONSTRUCCION_CIVIL_2026.bucPct as unknown as Record<string, number>,
  movilidadDia: CONSTRUCCION_CIVIL_2026.movilidadDia,
  escolaridadJornalesAnio: CONSTRUCCION_CIVIL_2026.escolaridadJornalesAnio,
};

/** Ley 28518: jornada máxima semanal de la práctica formativa. */
export const JORNADA_PRACTICAS = PRACTICAS_PERU_2026.jornadaMaxSemanal as unknown as Record<string, number>;

const sol = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));
const sol2 = (n: number) => 'S/ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const hub: HubData = {
  slug: 'pe/trabajo/regimenes-especiales',
  title: 'Regímenes laborales especiales en Perú: público, construcción civil, prácticas y hogar',
  description:
    'Qué te corresponde cobrar si no estás en el régimen laboral privado general del Perú: aguinaldo del sector público, jornal y BUC de construcción civil, subvención de prácticas preprofesionales y liquidación de trabajadora del hogar bajo la Ley 31047.',
  silo: 'Trabajo',
  siloHref: '/pe/trabajo',
  locale: 'pe',

  eyebrow: 'Perú · regímenes especiales · sector público, obra, prácticas y hogar',
  h1: 'No estoy en el régimen general privado: ¿qué me corresponde?',
  lede:
    'Casi toda la información laboral peruana está escrita para el régimen privado general: sueldo mensual, dos gratificaciones, CTS y 30 días de vacaciones. Pero si eres servidor público, trabajas en obra, estás haciendo prácticas o trabajas en casa de familia, tu régimen se rige por otras normas —y por otros montos— que casi nunca aparecen en la misma página.',
  stamps: [
    `RMV ${sol(RMV)} · aguinaldo público ${sol(AGUINALDO_FP)}`,
    `Jornal operario ${sol2(CONSTRUCCION.jornal.operario)} · peón ${sol2(CONSTRUCCION.jornal.peon)}`,
    '5 calculadoras adentro',
  ],

  resultLabel: 'Lo que te corresponde',

  cases: {
    title: '¿En qué régimen estás?',
    intro:
      'Cada régimen tiene su propia norma, su propio calendario de pagos y sus propios montos. Elige el tuyo y el cálculo cambia entero.',
    items: [
      {
        id: 'publico',
        label: 'Soy servidor público',
        hint: 'Aguinaldo de monto fijo, no gratificación',
        answer: `En el sector público no cobras un sueldo de gratificación: cobras un aguinaldo de monto fijo de ${sol(AGUINALDO_FP)} en julio y otro en diciembre.`,
        yes: [
          `Aguinaldo por Fiestas Patrias de ${sol(AGUINALDO_FP)} en la planilla de julio (D.S. 128-2026-EF)`,
          'Requisitos: vínculo laboral vigente al corte y al menos 3 meses de servicio',
          `Con menos de 3 meses se paga proporcional sobre una base de ${AGUINALDO_BASE_DIAS} días`,
          'Alcanza al D.L. 276, docentes (Ley 29944 y Ley 30512), docentes universitarios (Ley 30220), personal de salud (D.L. 1153), FF.AA. y PNP, y pensionistas a cargo del Estado',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Los trabajadores CAS (D.L. 1057) quedaron FUERA del aguinaldo: la Ley 32563 les reconoció gratificaciones en su reemplazo, pero esa gratificación no tenía presupuesto asignado y en la práctica muchos no cobraron ni una cosa ni la otra',
          'El monto del aguinaldo de Navidad no está fijado hasta que el MEF publique su decreto supremo hacia fin de año: el número que ves acá es una referencia basada en el de julio, no un dato oficial de diciembre',
          'Si trabajas en una entidad pública pero bajo el régimen privado (D.L. 728), no cobras aguinaldo: te corresponde la gratificación de un sueldo completo más la bonificación extraordinaria',
        ],
        plazo:
          'el aguinaldo de Fiestas Patrias se abona con la planilla de julio y el de Navidad con la de diciembre.',
      },
      {
        id: 'construccion',
        label: 'Trabajo en construcción civil',
        hint: 'Jornal diario + BUC + movilidad',
        answer:
          'En construcción civil no cobras sueldo mensual: cobras un jornal diario por categoría, más la Bonificación Unificada de Construcción y la movilidad.',
        yes: [
          `Jornal básico diario por categoría: operario ${sol2(CONSTRUCCION.jornal.operario)}, oficial ${sol2(CONSTRUCCION.jornal.oficial)}, peón ${sol2(CONSTRUCCION.jornal.peon)}`,
          `BUC sobre el jornal básico: ${(CONSTRUCCION.bucPct.operario * 100).toFixed(0)}% para operario y ${(CONSTRUCCION.bucPct.peon * 100).toFixed(0)}% para oficial y peón, por día laborado`,
          `Bonificación por movilidad acumulada: ${sol2(CONSTRUCCION.movilidadDia)} por día efectivamente laborado`,
          `Asignación por escolaridad: ${CONSTRUCCION.escolaridadJornalesAnio} jornales básicos al año por cada hijo en edad escolar`,
          'Dominical: un jornal básico si se labora la semana completa, proporcional si no',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Las tablas salariales se renegocian cada año en el pliego FTCCP-CAPECO y rigen del 1 de junio al 31 de mayo o por año calendario según el convenio: verifica que la tabla que estás usando sea la vigente para tu obra',
          'El cálculo no incluye horas extras, bonificación por altitud, por trabajo en altura, por contacto con agua ni por especialización: en obra esas bonificaciones pueden pesar tanto como el BUC',
          'La CTS y las gratificaciones de construcción civil tienen reglas propias del régimen (no son las del régimen general): consúltalas antes de liquidar un cese',
        ],
        plazo:
          'el pago del jornal es semanal, no mensual, y la escolaridad se abona según el calendario que fije el convenio.',
      },
      {
        id: 'practicante',
        label: 'Estoy de practicante',
        hint: 'Subvención, no remuneración',
        answer: `Un practicante no cobra sueldo sino una subvención económica, cuyo mínimo es una RMV (${sol(RMV)}) a jornada completa, proporcional si haces menos horas.`,
        yes: [
          `Subvención mensual mínima de una RMV (${sol(RMV)}) cumpliendo la jornada máxima; proporcional a las horas si es menor`,
          `Jornada máxima: preprofesional ${JORNADA_PRACTICAS.preprofesional} horas semanales; profesional ${JORNADA_PRACTICAS.profesional} horas semanales`,
          'Media subvención adicional por cada 6 meses continuos de práctica',
          'Seguro de salud a cargo de la empresa y 15 días de descanso subvencionado si el convenio llega a 12 meses',
          'La subvención no está afecta a AFP, ONP ni a las contribuciones de una remuneración',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'Si haces las tareas de un puesto de planilla, cumples horario de trabajador y no hay convenio ni plan de aprendizaje, la práctica está desnaturalizada: se presume relación laboral y te corresponde todo el régimen general, con beneficios retroactivos',
          'La modalidad formativa tiene límites de cantidad de practicantes por empresa y de duración máxima del convenio: excederlos también desnaturaliza la práctica',
        ],
        plazo:
          'el convenio debe registrarse ante el MTPE; el certificado de la práctica se entrega al finalizar.',
      },
      {
        id: 'hogar',
        label: 'Trabajo (o empleo) en casa de familia',
        hint: 'Ley 31047 · beneficios del régimen general',
        answer:
          'Desde la Ley 31047 el régimen del hogar tiene los mismos beneficios que el régimen general: CTS, dos gratificaciones al año y 30 días de vacaciones.',
        yes: [
          'Remuneración no menor a la RMV cuando la jornada es completa',
          'CTS equivalente a una remuneración por año, con la base que incluye un sexto de gratificación',
          'Dos gratificaciones al año, cada una de una remuneración, más la bonificación extraordinaria de la Ley 30334',
          'Vacaciones de 30 días por año completo de servicios',
          'Contrato por escrito, jornada máxima de 8 horas diarias o 48 semanales, y afiliación obligatoria a EsSalud y al sistema de pensiones',
        ],
        warn: [
          DISCLAIMER_LABORAL,
          'La Ley 31047 derogó la vieja Ley 27986, que reconocía solo medio sueldo de gratificación y media CTS. Si te liquidaron con esos montos por un período posterior a la vigencia de la nueva ley, te pagaron de menos',
          'El registro del contrato en la plataforma de trabajadores del hogar del MTPE es obligación del empleador: sin registro no hay aportes ni cobertura de EsSalud',
          'Los aportes a EsSalud del trabajador del hogar son deducibles al 100% dentro de las 3 UIT adicionales del impuesto a la renta del empleador',
        ],
        plazo:
          'la liquidación se paga al terminar el vínculo; los depósitos de CTS siguen el calendario de mayo y noviembre del régimen general.',
      },
    ],
  },

  inputsTitle: 'Tus cifras',
  inputsIntro:
    'Completa solo los campos de tu régimen: los demás no afectan el resultado de tu rama. Todo en soles.',
  fields: [
    {
      id: 'sueldo',
      label: 'Remuneración mensual (S/)',
      prefix: 'S/',
      value: 1130,
      thousands: true,
      help: 'Se usa en la rama de trabajo del hogar y en el caso de un servidor público bajo régimen privado (D.L. 728).',
    },
    {
      id: 'regimen',
      label: 'Tu régimen en el sector público',
      type: 'select',
      value: 'dl276',
      options: [
        { value: 'dl276', label: 'Carrera administrativa (D.L. 276)' },
        { value: 'docente', label: 'Docente (Ley 29944 / Ley 30512)' },
        { value: 'universitario', label: 'Docente universitario (Ley 30220)' },
        { value: 'salud', label: 'Personal de la salud (D.L. 1153)' },
        { value: 'ffaa_pnp', label: 'FF.AA. y PNP' },
        { value: 'pensionista', label: 'Pensionista a cargo del Estado' },
        { value: 'cas', label: 'CAS (D.L. 1057)' },
        { value: 'dl728', label: 'Régimen privado en entidad pública (D.L. 728)' },
      ],
      help: 'Solo se usa en la rama del sector público: define si cobras aguinaldo de monto fijo, gratificación de un sueldo, o nada.',
    },
    {
      id: 'meses',
      label: 'Meses de servicio (o duración del convenio)',
      type: 'number',
      value: 12,
      min: 0,
      max: 60,
      step: 1,
      help: 'Sector público: meses de servicio a la fecha de corte. Prácticas: duración del convenio. Hogar: meses trabajados a liquidar.',
    },
    {
      id: 'dias',
      label: 'Días sueltos además de esos meses',
      type: 'number',
      value: 0,
      min: 0,
      max: 29,
      step: 1,
      help: 'Días que sobran del último mes completo. Se usan en el aguinaldo proporcional y en la liquidación del hogar.',
    },
    {
      id: 'categoria',
      label: 'Tu categoría en construcción civil',
      type: 'select',
      value: 'operario',
      options: [
        { value: 'operario', label: 'Operario' },
        { value: 'oficial', label: 'Oficial' },
        { value: 'peon', label: 'Peón' },
      ],
      help: 'Define el jornal básico diario y el porcentaje de BUC del convenio vigente.',
    },
    {
      id: 'diasSemana',
      label: 'Días trabajados en la semana (obra)',
      type: 'number',
      value: 6,
      min: 1,
      max: 6,
      step: 1,
      help: 'La semana completa de construcción civil es de 6 días. El dominical se paga proporcional a los días laborados.',
    },
    {
      id: 'hijos',
      label: 'Hijos en edad escolar (obra)',
      type: 'number',
      value: 0,
      min: 0,
      max: 10,
      step: 1,
      help: `Cada hijo genera ${CONSTRUCCION.escolaridadJornalesAnio} jornales básicos al año de asignación por escolaridad.`,
    },
    {
      id: 'tipoPractica',
      label: 'Tipo de práctica',
      type: 'select',
      value: 'preprofesional',
      options: [
        { value: 'preprofesional', label: 'Preprofesional (aún estudiando)' },
        { value: 'profesional', label: 'Profesional (ya egresado)' },
      ],
      help: `La jornada máxima es de ${JORNADA_PRACTICAS.preprofesional} h/semana en la preprofesional y ${JORNADA_PRACTICAS.profesional} h/semana en la profesional.`,
    },
    {
      id: 'horasSemana',
      label: 'Horas semanales de práctica',
      type: 'number',
      value: 30,
      min: 1,
      max: 48,
      step: 1,
      help: 'Si haces menos horas que la jornada máxima, la subvención mínima baja en la misma proporción.',
    },
  ],
  fineprint: DISCLAIMER_LABORAL,

  chart: {
    type: 'donut',
    title: 'De qué se compone lo que cobras',
    caption:
      'En los regímenes especiales el monto casi nunca es un solo concepto: son bonificaciones y asignaciones separadas, cada una con su propia regla. Verlas partidas ayuda a detectar cuál falta en tu boleta.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro:
    'Cada línea trae la norma que la respalda, para que puedas contrastarla con lo que efectivamente te pagaron.',

  faq: [
    {
      q: '¿Los trabajadores del Estado cobran gratificación como en el sector privado?',
      a: `No. En el sector público lo que se paga es un aguinaldo de monto fijo —${sol(AGUINALDO_FP)} en la planilla de julio según el D.S. 128-2026-EF— y no un sueldo completo. La diferencia es enorme: un servidor con S/ 3.000 de ingreso cobra ${sol(AGUINALDO_FP)}, mientras que un trabajador del régimen privado con el mismo ingreso cobra S/ 3.000 más su bonificación extraordinaria.`,
    },
    {
      q: '¿Los CAS cobran aguinaldo?',
      a: 'El decreto que fijó el aguinaldo excluyó expresamente a los trabajadores CAS, porque la Ley 32563 les reconoció gratificaciones de julio y diciembre en su reemplazo. El problema es que esa gratificación quedó sin presupuesto asignado, así que en la práctica muchos CAS no cobraron ni el aguinaldo ni la gratificación. Es el punto más conflictivo del régimen y conviene seguir los comunicados del MEF.',
    },
    {
      q: '¿Cuánto se cobra por día en construcción civil?',
      a: `Depende de la categoría. Con la tabla vigente del convenio FTCCP-CAPECO, el jornal básico diario es de ${sol2(CONSTRUCCION.jornal.operario)} para operario, ${sol2(CONSTRUCCION.jornal.oficial)} para oficial y ${sol2(CONSTRUCCION.jornal.peon)} para peón. Sobre ese básico se suma el BUC —${(CONSTRUCCION.bucPct.operario * 100).toFixed(0)}% para operario, ${(CONSTRUCCION.bucPct.peon * 100).toFixed(0)}% para oficial y peón— más ${sol2(CONSTRUCCION.movilidadDia)} de movilidad por día laborado.`,
    },
    {
      q: '¿Qué es el BUC y por qué no cuenta para todo?',
      a: 'Es la Bonificación Unificada de Construcción, un porcentaje del jornal básico que se paga por día efectivamente laborado y que agrupa varias bonificaciones históricas del régimen (desgaste de ropa y herramientas, alimentación, entre otras). No entra en la base de cálculo de todos los beneficios: por eso conviene mirar siempre el jornal básico, que es el número sobre el que se calculan gratificaciones, CTS y la asignación por escolaridad.',
    },
    {
      q: '¿Cuánto le tienen que pagar a un practicante?',
      a: `La subvención mínima es una RMV (${sol(RMV)}) cuando se cumple la jornada máxima de la modalidad: ${JORNADA_PRACTICAS.preprofesional} horas semanales en la práctica preprofesional y ${JORNADA_PRACTICAS.profesional} en la profesional. Si haces menos horas, el mínimo baja en la misma proporción. Es un piso: la empresa puede pagar más, y muchas lo hacen.`,
    },
    {
      q: '¿Un practicante cobra gratificación y CTS?',
      a: 'No, porque la subvención no es una remuneración y el convenio de práctica no es un contrato de trabajo. Lo que sí corresponde es la media subvención adicional por cada 6 meses continuos de práctica, el seguro de salud a cargo de la empresa, y 15 días de descanso subvencionado cuando el convenio llega a 12 meses.',
    },
    {
      q: '¿Cuándo una práctica se convierte en un contrato de trabajo?',
      a: 'Cuando desaparece el componente formativo: no hay convenio registrado ni plan de aprendizaje, el practicante hace exactamente el trabajo de un puesto de planilla, cumple horario y órdenes como cualquier trabajador, o se exceden los límites de duración y de cantidad de practicantes por empresa. En esos casos se presume relación laboral desde el inicio y corresponden todos los beneficios del régimen general, con carácter retroactivo.',
    },
    {
      q: '¿Qué cambió la Ley 31047 para las trabajadoras del hogar?',
      a: 'Cambió casi todo. La vieja Ley 27986 reconocía solo la mitad de los beneficios: media gratificación y media CTS. Desde la Ley 31047 el régimen del hogar tiene los mismos beneficios que el régimen laboral general: CTS de una remuneración por año, dos gratificaciones completas al año, 30 días de vacaciones, contrato escrito y afiliación obligatoria a EsSalud y al sistema de pensiones.',
    },
    {
      q: '¿Cómo se liquida a una trabajadora del hogar?',
      a: 'Igual que en el régimen general, proporcional al tiempo trabajado: CTS sobre la base que incluye un sexto de gratificación, las gratificaciones devengadas del período con su bonificación extraordinaria, y las vacaciones truncas. Si te liquidaron con medio sueldo de gratificación por un período posterior a la vigencia de la nueva ley, la liquidación está mal hecha.',
    },
    {
      q: '¿El empleador del hogar tiene que registrarse en algún lado?',
      a: 'Sí. El registro del contrato y de la trabajadora en la plataforma de trabajadores del hogar del MTPE es obligación del empleador, y es lo que habilita los aportes a EsSalud y al sistema de pensiones. Sin registro no hay cobertura de salud ni aportes previsionales, y la fiscalización de SUNAFIL alcanza también a los hogares.',
    },
    {
      q: '¿Los aportes que pago por mi trabajadora del hogar me sirven para algo?',
      a: 'Sí: los aportes a EsSalud de trabajadores del hogar se deducen al 100% dentro del régimen de las 3 UIT adicionales del impuesto a la renta de trabajo, siempre que estén sustentados y bancarizados según las reglas de SUNAT. Es uno de los pocos gastos que se deducen íntegros y no por un porcentaje.',
    },
    {
      q: '¿Por qué los regímenes especiales no aparecen en las calculadoras comunes?',
      a: 'Porque la mayoría de las herramientas asume el régimen privado general: sueldo mensual, dos gratificaciones de un sueldo, CTS semestral y 30 días de vacaciones. Aplicar esa lógica a un servidor público, a un jornalero de obra o a un practicante da números que no tienen nada que ver con la realidad, casi siempre por exceso. Por eso este hub separa las cuatro ramas.',
    },
  ],

  sources: [
    {
      name: 'MEF — Decretos supremos de aguinaldos y bonificaciones del sector público',
      url: 'https://www.gob.pe/mef',
      publisher: 'Ministerio de Economía y Finanzas',
    },
    {
      name: 'D.L. 276 — Ley de Bases de la Carrera Administrativa',
      url: 'https://www.gob.pe/institucion/servir/normas-legales',
      publisher: 'SERVIR',
    },
    {
      name: 'MTPE — Convenio colectivo de construcción civil (R.M. 197-2025-TR)',
      url: 'https://www.gob.pe/institucion/mtpe/normas-legales',
      publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    },
    {
      name: 'Ley 28518 — Modalidades formativas laborales',
      url: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 31047 — Ley de las trabajadoras y trabajadores del hogar',
      url: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales',
      publisher: 'Congreso de la República',
    },
    {
      name: 'SUNAFIL — Regímenes laborales especiales',
      url: 'https://www.gob.pe/sunafil',
      publisher: 'Superintendencia Nacional de Fiscalización Laboral',
    },
  ],

  replaces: [
    '/pe/calculadora-aguinaldo-fiestas-patrias-sector-publico-peru-2026',
    '/pe/calculadora-aguinaldo-navidad-sector-publico-peru-2026',
    '/pe/calculadora-jornal-construccion-civil-peru-2026-tabla',
    '/pe/calculadora-subvencion-practicas-preprofesionales-peru',
    '/pe/calculadora-liquidacion-trabajadora-hogar-peru',
  ],

  lastReviewed: '2026-07-28',
};
