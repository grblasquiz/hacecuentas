import type { HubData } from '../types';
import { REPUBLICA_DOMINICANA_2026 as RD } from '../../data/republica-dominicana-2026';

/**
 * Hub de decisión DO — "¿Cuánto me queda del sueldo y qué me descuentan?"
 *
 * Fuente única de constantes: src/lib/data/republica-dominicana-2026.ts (la misma
 * tabla maestra que usan las fórmulas vivas). Nada hardcodeado de memoria.
 *
 * Escala del ISR verificada contra la Resolución DGII DDG-AR1-2026-00001 (exención
 * anual RD$416.220, tramos 15/20/25%). Topes de la TSS verificados contra la
 * Resolución TSS 01-2025 vigente desde el 1-feb-2026.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Tasas y topes de la TSS (Resolución TSS 01-2025, vigente desde feb-2026). */
export const TSS = RD.tss;

/**
 * Escala anual del ISR (Art. 296 Cód. Tributario). `Infinity` no sobrevive a la
 * serialización de `define:vars` → viaja como null.
 */
export const ISR_TRAMOS = RD.isr.tramos.map((t) => ({
  desde: t.desde,
  hasta: Number.isFinite(t.hasta) ? t.hasta : null,
  cuotaFija: t.cuotaFija,
  tasa: t.tasa,
}));
export const ISR_EXENCION_ANUAL = RD.isr.exencionAnual;

/** Divisor universal de nómina dominicano (Reglamento 258-93). */
export const DIVISOR_DIARIO = RD.divisorDiario;
export const HORAS_MES = RD.horasMensuales;

/** Recargos del Art. 203 y 204 del Código de Trabajo. */
export const RECARGOS = RD.laboral.recargos;

/** Salario mínimo del sector privado no sectorizado (Resol. CNS-01-2025). */
export const SALARIO_MINIMO = RD.salarioMinimo.noSectorizado;

const dop = (n: number) => 'RD$ ' + Math.round(n).toLocaleString('de-DE');

export const hub: HubData = {
  slug: 'do/trabajo/sueldo-neto',
  title: 'Sueldo neto República Dominicana 2026: TSS e ISR',
  description:
    'Calculá tu salario neto en RD$ 2026: AFP 2,87%, SFS 3,04%, retención de ISR por la escala de la DGII, horas extra al 35% y recargo nocturno del 15%.',
  silo: 'Trabajo',
  siloHref: '/do/trabajo',
  locale: 'do',

  eyebrow: 'República Dominicana · TSS y DGII · nómina',
  h1: 'De tu salario bruto en República Dominicana a lo que cobrás en mano.',
  lede:
    'Una sola cuenta con todo lo que mueve tu boleta: los descuentos de la TSS (AFP y SFS), la retención del ISR según la escala de la DGII, el valor de tu hora con el divisor de nómina dominicano y lo que suman las horas extra y la nocturnidad.',
  stamps: [
    `Exención de ISR: ${dop(ISR_EXENCION_ANUAL)} al año`,
    'Descuento TSS del trabajador: 5,91%',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Salario neto del mes',

  cases: {
    title: '¿Cómo cobrás?',
    intro:
      'Los descuentos son los mismos para todos, pero lo que entra a la base cambia según cómo esté armado tu pago. Partimos del caso más frecuente.',
    items: [
      {
        id: 'mensual',
        label: 'Sueldo fijo mensual, jornada completa',
        hint: '44 horas semanales · pago mensual',
        answer: 'Sobre tu bruto se descuenta 5,91% de TSS y, recién sobre lo que queda, el ISR.',
        yes: [
          'AFP (pensiones): 2,87% del salario cotizable, con tope de ' + dop(TSS.topeAfp),
          'SFS (salud): 3,04% del salario cotizable, con tope de ' + dop(TSS.topeSfs),
          'Retención de ISR sobre la base (bruto − AFP − SFS), anualizada y pasada por la escala del Art. 296',
          'La regalía pascual va aparte y se cobra completa: no paga ISR ni cotiza a la TSS',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'AFP y SFS son deducibles del ISR: si alguien te calcula la retención sobre el bruto pelado, te está cobrando de más',
        ],
        plazo: 'la nómina se paga como máximo el último día del mes o de la quincena que corresponda.',
      },
      {
        id: 'parcial',
        label: 'Trabajo por horas o media jornada',
        hint: 'Menos de 44 horas por semana',
        answer: 'Tu sueldo es proporcional: la hora sale del divisor de 191 horas al mes.',
        yes: [
          'Valor de la hora ordinaria = salario de jornada completa ÷ ' + HORAS_MES,
          'Sueldo proporcional = valor hora × horas del mes según tu jornada real',
          'Los descuentos de TSS se aplican sobre lo que realmente devengás',
          'Con jornada reducida es muy probable que quedes por debajo de la exención del ISR',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La cotización a la TSS tiene un piso: el salario mínimo cotizable nacional de ' + dop(TSS.salarioMinimoCotizable) + '. Si cotizás por menos, revisá que tu empleador esté reportando bien la jornada',
        ],
        plazo: 'pedí tu historial de cotización en tss.gob.do para verificar que reporten tus horas.',
      },
      {
        id: 'extras',
        label: 'Hago horas extra y turnos de noche',
        hint: 'Art. 203 y 204 del Código de Trabajo',
        answer: 'Las horas 44 a 68 van con +35%, las de más de 68 con +100% y la noche suma +15%.',
        yes: [
          'Hora extra entre 44 y 68 horas semanales: +' + Math.round(RECARGOS.extra44a68 * 100) + '% sobre la hora ordinaria',
          'Hora extra por encima de 68 horas semanales: +' + Math.round(RECARGOS.extraMas68 * 100) + '%',
          'Trabajo nocturno (9 p.m. a 7 a.m.): recargo mínimo del ' + Math.round(RECARGOS.nocturno * 100) + '%',
          'Día feriado trabajado: +' + Math.round(RECARGOS.diaFeriado * 100) + '%',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'El tope legal es de ' + RECARGOS.maxExtraTrimestre + ' horas extra por trimestre: por encima de eso el empleador está en falta',
          'Si tu jornada mixta tiene más de 3 horas de noche, toda la jornada se computa como nocturna',
          'Las horas extra sí cotizan a la TSS y sí pagan ISR, a diferencia de la regalía',
        ],
        plazo: 'las horas extra se pagan con la nómina del período en que se trabajaron, no al final del año.',
      },
      {
        id: 'minimo',
        label: 'Cobro cerca del salario mínimo',
        hint: 'Sector privado no sectorizado',
        answer: 'Con salario mínimo no hay ISR: la base anual no llega ni cerca de la exención.',
        yes: [
          'Empresa grande: ' + dop(SALARIO_MINIMO.grande) + ' · mediana: ' + dop(SALARIO_MINIMO.mediana),
          'Pequeña: ' + dop(SALARIO_MINIMO.pequena) + ' · micro: ' + dop(SALARIO_MINIMO.micro),
          'Igual se descuenta la TSS (5,91%): la seguridad social no tiene mínimo exento',
          'La retención de ISR da cero porque la base anual queda muy por debajo de ' + dop(ISR_EXENCION_ANUAL),
        ],
        warn: [
          DISCLAIMER_LABOR,
          'República Dominicana no tiene un salario mínimo único: lo fija el Comité Nacional de Salarios por sector y tamaño de empresa',
          'Zonas francas, hotelería y construcción tienen resoluciones propias con montos distintos',
        ],
        plazo: 'los ajustes del CNS suelen aplicarse en dos fases; verificá desde qué mes rige el tuyo.',
      },
    ],
  },

  inputsTitle: 'Tu salario y tu jornada',
  inputsIntro:
    'Todo en pesos dominicanos y en valores mensuales. Podés dejar el ejemplo cargado y volver después con tus números.',
  fields: [
    {
      id: 'bruto',
      label: 'Salario bruto mensual de jornada completa (RD$)',
      prefix: 'RD$',
      value: 45000,
      thousands: true,
      help: 'El salario ordinario que figura en tu contrato, antes de descuentos y sin horas extra.',
    },
    {
      id: 'horasSemana',
      label: 'Horas que trabajás por semana',
      type: 'number',
      value: 44,
      min: 1,
      max: 44,
      step: 1,
      help: 'La jornada legal máxima es de 44 horas. Si trabajás menos, el sueldo se prorratea.',
    },
    {
      id: 'horasExtra',
      label: 'Horas extra al mes (recargo del 35%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 1,
      help: 'Horas que exceden la jornada legal sin pasar de 68 semanales.',
    },
    {
      id: 'horasNocturnas',
      label: 'Horas nocturnas al mes (9 p.m. a 7 a.m.)',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 1,
      help: 'Sólo el recargo del 15%: la hora base ya está dentro de tu salario ordinario.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'A dónde va cada peso de tu bruto',
    caption:
      'Compara lo que te queda en mano con lo que se lleva la seguridad social (AFP y SFS) y lo que retiene la DGII por ISR. Si el trozo de ISR no aparece, es porque tu base anual no supera la exención.',
  },
  breakdownTitle: 'Tu boleta, línea por línea',
  breakdownIntro:
    'El mismo orden de un volante de pago dominicano: devengado, descuentos de ley y neto. Todos los montos en pesos dominicanos.',

  faq: [
    {
      q: '¿Cuánto me descuenta la TSS de mi sueldo?',
      a: `El trabajador aporta 5,91% del salario cotizable: 2,87% al AFP (pensiones, tu cuenta de capitalización individual) y 3,04% al SFS (salud, tu ARS o SeNaSa). Sobre un sueldo de ${dop(50000)} eso son ${dop(50000 * TSS.totalEmpleado)} al mes. El empleador aporta bastante más por su cuenta —7,10% de AFP, 7,09% de SFS y el seguro de riesgos laborales— pero eso no sale de tu bolsillo. Los topes de cotización vigentes desde febrero son ${dop(TSS.topeSfs)} para salud y ${dop(TSS.topeAfp)} para pensiones: sobre el exceso no se cotiza.`,
    },
    {
      q: '¿Desde qué salario se empieza a pagar ISR en República Dominicana?',
      a: `La exención anual es de ${dop(ISR_EXENCION_ANUAL)}, que equivale a ${dop(ISR_EXENCION_ANUAL / 12)} por mes de base gravable. Pero ojo con un detalle que cambia la cuenta: la base no es tu bruto, es tu bruto menos AFP y SFS. Como esos descuentos son el 5,91%, en la práctica empezás a pagar ISR recién con un bruto de alrededor de ${dop(ISR_EXENCION_ANUAL / 12 / (1 - TSS.totalEmpleado))} al mes.`,
    },
    {
      q: '¿Cuáles son los tramos de la escala del ISR?',
      a: `Cuatro tramos anuales, sobre la base ya descontada de AFP y SFS: 0% hasta ${dop(ISR_EXENCION_ANUAL)}; 15% sobre el excedente entre ${dop(ISR_TRAMOS[1].desde)} y ${dop(ISR_TRAMOS[1].hasta as number)}; ${dop(ISR_TRAMOS[2].cuotaFija)} fijos más 20% sobre el excedente entre ${dop(ISR_TRAMOS[2].desde)} y ${dop(ISR_TRAMOS[2].hasta as number)}; y ${dop(ISR_TRAMOS[3].cuotaFija)} fijos más 25% de ahí en adelante. Es progresiva: la tasa alta sólo pega sobre la parte del sueldo que entra en ese tramo, nunca sobre todo.`,
    },
    {
      q: '¿Por qué la escala del ISR no se actualiza?',
      a: 'El Art. 327 del Código Tributario obliga a ajustarla cada año por inflación, pero las leyes de presupuesto vienen suspendiendo ese ajuste desde 2018. El resultado es un impuesto que se traga aumentos que sólo compensaban la inflación: cada año hay más asalariados dentro de la escala sin que haya subido su poder de compra. La reforma aprobada en la Ley 30-26 modifica la escala recién a partir del 1 de enero de 2027, con una exención más alta y un tramo superior nuevo; durante este año la DGII mantiene la escala heredada.',
    },
    {
      q: '¿Cómo se calcula el valor de mi hora?',
      a: `Salario mensual dividido ${HORAS_MES} horas. Ese ${HORAS_MES} sale de la jornada legal de 44 horas semanales: 44 × 52 ÷ 12 ≈ ${HORAS_MES} horas al mes. Para el valor del día el divisor es ${String(DIVISOR_DIARIO).replace('.', ',')} días, del Reglamento 258-93, que es el mismo que usa la calculadora oficial del Ministerio de Trabajo y el que manda en cesantía, preaviso, vacaciones y regalía. Si en tu empresa dividen por 30 días, te están pagando el día más barato de lo que corresponde.`,
    },
    {
      q: '¿Cuánto se paga una hora extra?',
      a: `Depende de en qué franja cae. Las horas que exceden las 44 semanales y no pasan de 68 se pagan con un recargo del ${Math.round(RECARGOS.extra44a68 * 100)}%; las que superan las 68 horas semanales, con ${Math.round(RECARGOS.extraMas68 * 100)}% de recargo, es decir el doble de la hora ordinaria. Trabajar un día feriado también lleva ${Math.round(RECARGOS.diaFeriado * 100)}% de recargo. Y hay un tope: ${RECARGOS.maxExtraTrimestre} horas extra por trimestre.`,
    },
    {
      q: '¿El recargo nocturno se suma al de horas extra?',
      a: `Sí, y se acumulan de forma multiplicativa. El recargo nocturno del ${Math.round(RECARGOS.nocturno * 100)}% se aplica primero sobre la hora ordinaria, y sobre esa hora ya recargada corre después el recargo de hora extra. Una hora extra nocturna entre 44 y 68 horas termina valiendo 1,15 × 1,35 = 1,55 veces la hora ordinaria. Además, si tu jornada mixta incluye más de tres horas nocturnas, toda la jornada se computa como nocturna.`,
    },
    {
      q: '¿La regalía pascual paga ISR o TSS?',
      a: 'Ninguno de los dos. La regalía pascual —el "doble sueldo" de diciembre— está expresamente exenta del ISR y no cotiza a la TSS, según la Ley 87-01 y la Resolución 72-03 del CNSS. Se cobra completa. Por eso tu ingreso anual real no son 12 sueldos netos sino 12 netos más una regalía íntegra.',
    },
    {
      q: '¿Cuál es el salario mínimo en República Dominicana?',
      a: `No hay uno solo: el Comité Nacional de Salarios lo fija por sector y por tamaño de empresa. En el sector privado no sectorizado va de ${dop(SALARIO_MINIMO.micro)} en microempresas a ${dop(SALARIO_MINIMO.grande)} en empresas grandes, pasando por ${dop(SALARIO_MINIMO.pequena)} en pequeñas y ${dop(SALARIO_MINIMO.mediana)} en medianas. Zonas francas (${dop(RD.salarioMinimo.zonasFrancas)}), hotelería y construcción tienen resoluciones propias. El tamaño de la empresa se define por cantidad de trabajadores o por ventas anuales: basta exceder uno de los dos parámetros para subir de categoría.`,
    },
    {
      q: '¿Qué pasa si mi sueldo supera los topes de cotización?',
      a: `Sobre el excedente simplemente no se cotiza. El tope de SFS es ${dop(TSS.topeSfs)} —diez salarios mínimos cotizables— y el de AFP ${dop(TSS.topeAfp)}, veinte salarios mínimos cotizables. Un sueldo de ${dop(300000)} cotiza salud sólo hasta el tope, así que el descuento de SFS deja de crecer, pero el de AFP sigue. El efecto práctico es que a partir de ahí tu tasa de descuento total baja, aunque el ISR sube.`,
    },
    {
      q: '¿Por qué mi neto no coincide con el que me da RR. HH.?',
      a: 'Las causas típicas son cuatro: que en tu empresa apliquen un plan de salud complementario o un seguro que se descuenta aparte, que tengas préstamos o cooperativa con descuento por nómina, que la retención de ISR se ajuste a fin de año por ingresos variables (comisiones, bonos), o que tu empresa use el divisor de 30 días en lugar del legal. Este cálculo cubre las deducciones de ley: cualquier descuento adicional es contractual y debe estar en tu volante de pago.',
    },
    {
      q: '¿Puedo recuperar ISR retenido de más?',
      a: 'Sí. Si durante el año te retuvieron más de lo que corresponde —por ejemplo, porque cobraste un bono grande un mes y después bajaron tus ingresos—, en la declaración jurada anual (formulario IR-1) queda un saldo a favor que podés compensar o pedir en devolución a la DGII. Los asalariados con un único empleador normalmente no declaran porque la retención mensual ya cierra la cuenta, pero declarar es la vía para recuperar el exceso.',
    },
  ],

  sources: [
    {
      name: 'DGII — Impuesto Sobre la Renta de personas físicas y escala de retención',
      url: 'https://dgii.gov.do/Paginas/inicio.aspx',
      publisher: 'Dirección General de Impuestos Internos',
    },
    {
      name: 'TSS — Nuevos topes de cotización del Régimen Contributivo (Resolución TSS 01-2025)',
      url: 'https://tss.gob.do/aumento-topes-salario-minimo-cotizable/',
      publisher: 'Tesorería de la Seguridad Social',
      date: '2026-02-01',
    },
    {
      name: 'Código de Trabajo de la República Dominicana (Ley 16-92), arts. 203 y 204',
      url: 'https://mt.gob.do/index.php/component/jdownloads/send/2-leyes/2-codigo-de-trabajo',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'Comité Nacional de Salarios — resoluciones de salario mínimo',
      url: 'https://mt.gob.do/index.php/servicios/comite-nacional-de-salarios',
      publisher: 'Ministerio de Trabajo',
    },
    {
      name: 'Código Tributario (Ley 11-92), art. 296 — escala del ISR de personas físicas',
      url: 'https://dgii.gov.do/legislacion/codigoTributario/Documents/Codigo-Tributario.pdf',
      publisher: 'DGII',
    },
  ],

  replaces: [
    '/do/salario-neto-republica-dominicana',
    '/do/sueldo-bruto-a-neto-republica-dominicana',
    '/do/sueldo-anual-republica-dominicana',
    '/do/calculadora-retencion-isr-salario-republica-dominicana',
    '/do/calculadora-isr-republica-dominicana',
    '/do/calculadora-salario-por-hora-republica-dominicana',
    '/do/calculadora-salario-minimo-republica-dominicana',
    '/do/calculadora-horas-extras-republica-dominicana',
    '/do/calculadora-recargo-nocturno-republica-dominicana',
    '/do/calculadora-dias-laborables-feriados-republica-dominicana',
  ],

  lastReviewed: '2026-08-16',
};
