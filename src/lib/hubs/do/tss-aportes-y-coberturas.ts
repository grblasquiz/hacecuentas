import type { HubData } from '../types';
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  AFP_PENSION_DO,
} from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "¿Cuánto se aporta a la TSS por mí y qué me devuelve?"
 *
 * Junta las dos caras de la seguridad social dominicana: lo que se paga cada mes
 * (descuento del trabajador + aportes patronales + costo real del empleado para la
 * empresa) y lo que ese aporte compra (pensión de la CCI y subsidio de maternidad).
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

export const TSS = RD.tss;
export const AFP = AFP_PENSION_DO;
export const DIVISOR_DIARIO = RD.divisorDiario;
/** INFOTEP: 1% de la nómina a cargo del empleador (Ley 116-80). No es TSS. */
export const INFOTEP_PATRONAL = 0.01;
/** Días de cesantía que se provisionan por año en el tramo más común (1 a 5 años). */
export const CESANTIA_DIAS_PROVISION = 21;
/** Semanas de descanso pre y post natal que cubre el subsidio del SFS. */
export const SEMANAS_MATERNIDAD = 14;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/trabajo/tss-aportes-y-coberturas',
  title: 'TSS República Dominicana: aportes, costo del empleado, pensión y maternidad',
  description:
    'Cuánto aporta el trabajador y cuánto el empleador a la TSS (AFP, SFS, riesgos laborales e INFOTEP), cuánto cuesta realmente un empleado y qué devuelve el sistema: pensión de la CCI y subsidio de maternidad.',
  silo: 'Trabajo',
  siloHref: '/do/trabajo',
  locale: 'do',

  eyebrow: 'República Dominicana · TSS · Ley 87-01',
  h1: 'La TSS: cuánto se aporta por vos y qué te devuelve.',
  lede:
    'Cada mes salen tres cheques hacia la seguridad social: el tuyo, el de tu empleador y el de las cargas que no son TSS pero pesan igual. Esta cuenta muestra los tres, el costo real de un empleado para la empresa y qué comprás con eso: pensión y subsidio de maternidad.',
  stamps: [
    'Trabajador 5,91% · empleador 15,39% aprox.',
    `Topes: SFS ${dop(TSS.topeSfs)} · AFP ${dop(TSS.topeAfp)}`,
    '4 calculadoras adentro',
  ],

  resultLabel: 'Costo mensual total del empleado',

  cases: {
    title: '¿Desde qué lado mirás la cuenta?',
    intro:
      'El mismo salario se ve muy distinto según seas quien cobra, quien paga o quien está proyectando su jubilación.',
    items: [
      {
        id: 'trabajador',
        label: 'Soy el trabajador y quiero ver mis descuentos',
        hint: 'AFP 2,87% + SFS 3,04%',
        answer: 'Te descuentan 5,91%, pero por vos se aporta casi el triple de eso.',
        yes: [
          'AFP (pensiones): ' + (TSS.afpEmpleado * 100).toFixed(2).replace('.', ',') + '% de tu salario cotizable',
          'SFS (salud): ' + (TSS.sfsEmpleado * 100).toFixed(2).replace('.', ',') + '%, que financia tu plan básico de salud en la ARS o SeNaSa',
          'El empleador aporta además AFP ' + (TSS.afpPatronal * 100).toFixed(2).replace('.', ',') + '%, SFS ' + (TSS.sfsPatronal * 100).toFixed(2).replace('.', ',') + '% y el seguro de riesgos laborales',
          'La regalía pascual no cotiza: sobre ella no se descuenta nada',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Sólo el 8,4% del salario cotizable termina en tu cuenta de capitalización individual: el resto del aporte a pensiones financia el seguro de discapacidad y sobrevivencia, comisiones y el Fondo de Solidaridad',
          'Revisá tu historia laboral en tss.gob.do: si tu empleador reporta un salario menor al real, tu pensión y tu subsidio se calculan sobre ese número más chico',
        ],
        plazo: 'el empleador tiene hasta el día 3 de cada mes para autodeterminar la factura de la TSS.',
      },
      {
        id: 'empleador',
        label: 'Soy el empleador y quiero saber cuánto cuesta',
        hint: 'Aportes patronales + provisiones',
        answer: 'Un empleado cuesta bastante más que su salario bruto: sumá cargas y provisiones.',
        yes: [
          'AFP patronal ' + (TSS.afpPatronal * 100).toFixed(2).replace('.', ',') + '% y SFS patronal ' + (TSS.sfsPatronal * 100).toFixed(2).replace('.', ',') + '%',
          'Seguro de Riesgos Laborales, a cargo íntegro del empleador, con tope de ' + dop(TSS.topeSrl),
          'INFOTEP: 1% de la nómina, que no es TSS pero se paga igual',
          'Provisión mensual de regalía pascual (un doceavo del sueldo) y de cesantía',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La provisión de cesantía es una estimación: sólo se desembolsa si el contrato termina por desahucio o despido injustificado, y la tasa sube de 21 a 23 días por año a partir del quinto año',
          'La bonificación del Art. 223 no está en esta cuenta porque depende de las utilidades del ejercicio',
        ],
        plazo: 'la factura de la TSS se paga dentro de los primeros días del mes siguiente; la mora genera recargos.',
      },
      {
        id: 'pension',
        label: 'Quiero estimar mi pensión de AFP',
        hint: 'Cuenta de capitalización individual · Ley 87-01',
        answer: 'Tu pensión sale de lo acumulado en tu CCI, no de una fórmula de años y sueldo.',
        yes: [
          'A la CCI va el ' + (AFP.aportePctCci * 100).toFixed(1).replace('.', ',') + '% del salario cotizable',
          'Edad de jubilación por vejez: ' + AFP.edadJubilacionVejez + ' años',
          'Requisito de cotización: ' + AFP.mesesMinimos + ' meses, o sea 30 años',
          'El saldo acumulado se convierte en una renta mensual repartida entre los años esperados de retiro',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Es una proyección orientativa: el rendimiento real de tu fondo, tus años sin cotizar y la comisión de tu AFP cambian el resultado',
          'Con menos de ' + AFP.mesesMinimos + ' meses cotizados a los ' + AFP.edadJubilacionVejez + ' años no accedés a la pensión por vejez, sino a la devolución del saldo',
          'Esta cuenta no contempla ninguna propuesta de devolución anticipada de aportes: no es ley',
        ],
        plazo: 'pedí tu estado de cuenta a tu AFP al menos una vez al año y verificá los meses cotizados.',
      },
      {
        id: 'maternidad',
        label: 'Estoy embarazada y quiero saber cuánto cobro',
        hint: 'Subsidio del SFS · SISALRIL',
        answer: 'SISALRIL paga tres salarios cotizables por las 14 semanas de descanso.',
        yes: [
          'Subsidio = salario cotizable promedio × 3, por las ' + SEMANAS_MATERNIDAD + ' semanas de licencia',
          'Lo paga el Seguro Familiar de Salud, no tu empleador',
          'La base se topea en 10 salarios mínimos cotizables (' + dop(TSS.topeSfs) + ')',
          'Si tu salario supera ese tope, el empleador completa la diferencia hasta tu salario íntegro',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Se exige un mínimo de cotizaciones en los 12 meses previos al parto: verificá tu historia laboral antes de la licencia',
          'Durante el embarazo y hasta 3 meses después del parto el empleador no puede ejercer el desahucio',
        ],
        plazo: 'la licencia son 6 semanas antes y 8 después del parto; tramitá el subsidio con tu ARS apenas empiece.',
      },
    ],
  },

  inputsTitle: 'Tu salario y tu proyección',
  inputsIntro: 'El salario cotizable mensual y, si querés la proyección de pensión, tu edad y tu saldo.',
  fields: [
    {
      id: 'salario',
      label: 'Salario cotizable mensual (RD$)',
      prefix: 'RD$',
      value: 45000,
      thousands: true,
      help: 'Salario ordinario, sin regalía: la regalía no cotiza a la TSS.',
    },
    {
      id: 'edad',
      label: 'Tu edad actual',
      type: 'number',
      value: 35,
      min: 16,
      max: 74,
      step: 1,
      help: 'Para proyectar los años que faltan hasta la jubilación.',
    },
    {
      id: 'saldoCci',
      label: 'Saldo actual de tu cuenta de AFP (RD$)',
      prefix: 'RD$',
      value: 600000,
      thousands: true,
      help: 'Lo que figura hoy en tu estado de cuenta. Si no lo sabés, dejá 0.',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento anual esperado del fondo (%)',
      type: 'number',
      value: 7,
      min: 0,
      max: 20,
      step: 0.5,
      suffix: '%',
      help: 'Rendimiento nominal promedio. Editable: no es un dato garantizado.',
    },
    {
      id: 'aniosRetiro',
      label: 'Años esperados de retiro',
      type: 'number',
      value: 20,
      min: 5,
      max: 40,
      step: 1,
      help: 'Entre cuántos años se reparte el saldo acumulado.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'Quién pone cada peso del costo mensual',
    caption:
      'El salario bruto es sólo una parte del costo. Los aportes patronales, el INFOTEP y las provisiones de regalía y cesantía son plata que la empresa desembolsa aunque no aparezca en tu volante.',
  },
  breakdownTitle: 'Los aportes y lo que compran',
  breakdownIntro:
    'Primero lo que se paga cada mes, después lo que ese aporte devuelve en pensión y maternidad. Montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cuánto aporta el trabajador y cuánto el empleador a la TSS?',
      a: `El trabajador aporta 5,91% (${(TSS.afpEmpleado * 100).toFixed(2).replace('.', ',')}% de AFP y ${(TSS.sfsEmpleado * 100).toFixed(2).replace('.', ',')}% de SFS). El empleador aporta ${(TSS.afpPatronal * 100).toFixed(2).replace('.', ',')}% de AFP, ${(TSS.sfsPatronal * 100).toFixed(2).replace('.', ',')}% de SFS y el Seguro de Riesgos Laborales, que ronda el 1,2% y es enteramente suyo. Sumado, por cada peso que te descuentan hay cerca de tres pesos que pone la empresa.`,
    },
    {
      q: '¿Cuáles son los topes de cotización y qué pasa si mi sueldo los supera?',
      a: `Los topes vigentes desde febrero, fijados sobre el salario mínimo cotizable de ${dop(TSS.salarioMinimoCotizable)}, son: ${dop(TSS.topeSrl)} para riesgos laborales, ${dop(TSS.topeSfs)} para salud y ${dop(TSS.topeAfp)} para pensiones. Sobre el excedente no se cotiza, ni vos ni tu empleador. Eso significa que un salario muy alto tiene una tasa efectiva de TSS más baja, aunque una retención de ISR más alta.`,
    },
    {
      q: '¿Cuánto de mi aporte va realmente a mi cuenta de pensión?',
      a: `Menos de lo que la gente cree. Del ${(AFP.aporteTotalPensiones * 100).toFixed(2).replace('.', ',')}% total que se aporta a pensiones entre vos y tu empleador, sólo el ${(AFP.aportePctCci * 100).toFixed(1).replace('.', ',')}% del salario cotizable se deposita en tu cuenta de capitalización individual. El resto financia el seguro de discapacidad y sobrevivencia, la comisión de la AFP, la operación de la TSS, la SIPEN, la DIDA y el Fondo de Solidaridad Social.`,
    },
    {
      q: '¿Cuánto cuesta realmente un empleado para la empresa?',
      a: 'Entre un 30% y un 40% por encima del salario bruto, según cómo se contabilicen las provisiones. Sobre el bruto van los aportes patronales de TSS, el 1% de INFOTEP y las provisiones de regalía pascual (un doceavo del sueldo por mes) y de cesantía. La bonificación del Art. 223 va aparte y depende de las utilidades.',
    },
    {
      q: '¿A qué edad puedo jubilarme en República Dominicana?',
      a: `La pensión por vejez del régimen contributivo exige ${AFP.edadJubilacionVejez} años de edad y ${AFP.mesesMinimos} meses cotizados, o sea 30 años de aportes. También existe la pensión por vejez anticipada, que se puede solicitar antes si el saldo acumulado alcanza para financiar una renta superior a un umbral definido por la ley. Si llegás a los ${AFP.edadJubilacionVejez} sin los ${AFP.mesesMinimos} meses, lo que corresponde es la devolución del saldo, no una pensión vitalicia.`,
    },
    {
      q: '¿Cómo se calcula la pensión que voy a cobrar?',
      a: 'No hay una fórmula de "porcentaje del último sueldo" como en un sistema de reparto. Tu pensión sale de convertir el saldo acumulado en tu cuenta en una renta mensual, que depende del monto acumulado, del rendimiento del fondo y de la expectativa de vida al momento del retiro. Por eso los años sin cotizar pesan tanto: cada mes sin aporte es capital que nunca se acumuló ni generó rendimiento.',
    },
    {
      q: '¿Cuánto paga el subsidio de maternidad y quién lo paga?',
      a: `El Seguro Familiar de Salud, a través de SISALRIL, paga tres veces tu salario cotizable promedio para cubrir las ${SEMANAS_MATERNIDAD} semanas de descanso pre y post natal. No lo paga tu empleador. La base se topea en ${dop(TSS.topeSfs)}; si tu salario lo supera, el empleador debe completar la diferencia para que cobres tu salario ordinario íntegro.`,
    },
    {
      q: '¿Qué requisitos hay para cobrar el subsidio de maternidad?',
      a: 'Estar afiliada al Régimen Contributivo y tener un mínimo de cotizaciones en los doce meses previos al parto. El número exacto lo fija el Reglamento de Subsidios y conviene confirmarlo con tu ARS, porque las fuentes difieren entre 8 y 12 cotizaciones. Si te faltan cotizaciones, el descanso sigue siendo un derecho laboral pero el subsidio en efectivo puede no proceder.',
    },
    {
      q: '¿Cómo verifico que mi empleador me está cotizando bien?',
      a: 'Con la certificación de historia laboral que emite la TSS en tss.gob.do. Ahí figura mes a mes el salario reportado y el empleador que lo reportó. Es el documento que resuelve cualquier discusión sobre antigüedad o salario, y también el que revela el problema más común: que te reporten por un salario menor al que efectivamente cobrás, lo que achica tu pensión y tus subsidios.',
    },
    {
      q: '¿Qué cubre el Seguro de Riesgos Laborales?',
      a: 'Accidentes de trabajo y enfermedades profesionales: atención médica, subsidio por incapacidad temporal y pensiones por discapacidad o sobrevivencia derivadas del trabajo. Lo paga íntegramente el empleador, con una tasa que va del 1,1% al 1,3% según el nivel de riesgo de la actividad, y tiene su propio tope de cotización.',
    },
    {
      q: '¿El INFOTEP es parte de la TSS?',
      a: 'No. El INFOTEP es el instituto de formación técnico profesional y se financia con un 1% de la nómina a cargo del empleador más un 0,5% sobre las bonificaciones a cargo del empleado. Se paga por fuera de la factura de la TSS, pero forma parte del costo laboral y por eso entra en esta cuenta.',
    },
  ],

  sources: [
    {
      name: 'TSS — topes de cotización del Régimen Contributivo (Resolución 01-2025)',
      url: 'https://tss.gob.do/aumento-topes-salario-minimo-cotizable/',
      publisher: 'Tesorería de la Seguridad Social',
      date: '2026-02-01',
    },
    {
      name: 'Ley 87-01 que crea el Sistema Dominicano de Seguridad Social',
      url: 'https://www.sipen.gob.do/',
      publisher: 'SIPEN',
    },
    {
      name: 'SISALRIL — subsidio por maternidad del Seguro Familiar de Salud',
      url: 'https://www.sisalril.gob.do/',
      publisher: 'SISALRIL',
    },
    {
      name: 'DIDA — ABC del Sistema Dominicano de Seguridad Social',
      url: 'https://dida.gob.do/',
      publisher: 'DIDA',
    },
    {
      name: 'INFOTEP — aportes de empleadores y trabajadores',
      url: 'https://www.infotep.gob.do/',
      publisher: 'INFOTEP',
    },
  ],

  replaces: [
    '/do/calculadora-tss-afp-sfs-republica-dominicana',
    '/do/costo-empleador-republica-dominicana',
    '/do/calculadora-pension-afp-estimacion-republica-dominicana',
    '/do/calculadora-subsidio-maternidad-sisalril-republica-dominicana',
  ],

  lastReviewed: '2026-07-28',
};
