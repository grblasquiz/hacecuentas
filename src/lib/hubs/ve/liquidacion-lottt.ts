import type { HubData } from '../types';
import { VENEZUELA_2026 } from '../../data/venezuela-2026';

/**
 * Hub de decisión VE — "Se termina la relación de trabajo: ¿cuánto me tienen que pagar?"
 *
 * Fuente única de constantes: src/lib/data/venezuela-2026.ts (la misma tabla maestra
 * que usan las fórmulas vivas de prestaciones, liquidación, preaviso, utilidades,
 * vacaciones, salario integral y anticipo). Nada hardcodeado de memoria acá.
 *
 * ⚠️ Venezuela: NO se muestra ningún monto en bolívares como constante. El salario
 * entra siempre como campo editable, porque el bolívar se deprecia en semanas y
 * cualquier importe fijo caduca. El salario mínimo legal del módulo (Bs. 130) está
 * marcado "⚠️ ACTUALIZAR" en la propia tabla maestra: no se usa como default de cálculo.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'labor'). */
const DISCLAIMER_LABOR =
  'Cálculo orientativo según los datos y reglas indicados. Convenios, topes y situaciones particulares pueden cambiar el resultado; verificá con RR. HH., el organismo laboral o un profesional.';

/** Constantes LOTTT serializables para el <script> de la página. */
export const LOTTT = {
  diasAnioComercial: VENEZUELA_2026.lottt.diasAnioComercial,
  vacacionesDiasBase: VENEZUELA_2026.lottt.vacacionesDiasBase,
  vacacionesDiasPorAnio: VENEZUELA_2026.lottt.vacacionesDiasPorAnio,
  vacacionesDiasMax: VENEZUELA_2026.lottt.vacacionesDiasMax,
  bonoVacacionalDiasBase: VENEZUELA_2026.lottt.bonoVacacionalDiasBase,
  bonoVacacionalDiasPorAnio: VENEZUELA_2026.lottt.bonoVacacionalDiasPorAnio,
  bonoVacacionalDiasMax: VENEZUELA_2026.lottt.bonoVacacionalDiasMax,
  utilidadesDiasMin: VENEZUELA_2026.lottt.utilidadesDiasMin,
  utilidadesDiasMax: VENEZUELA_2026.lottt.utilidadesDiasMax,
  garantiaDiasPorTrimestre: VENEZUELA_2026.lottt.prestaciones.garantiaDiasPorTrimestre,
  diasAdicionalesPorAnio: VENEZUELA_2026.lottt.prestaciones.diasAdicionalesPorAnio,
  diasAdicionalesMax: VENEZUELA_2026.lottt.prestaciones.diasAdicionalesMax,
  retroactivoDiasPorAnio: VENEZUELA_2026.lottt.prestaciones.retroactivoDiasPorAnio,
  fraccionSuperiorMeses: VENEZUELA_2026.lottt.prestaciones.fraccionSuperiorMeses,
  /** `Infinity` no sobrevive a `define:vars` → viaja como null. */
  preaviso: VENEZUELA_2026.lottt.preaviso.map((t) => ({
    hastaMeses: Number.isFinite(t.hastaMeses) ? t.hastaMeses : null,
    dias: t.dias,
  })),
};

/** Tope legal del anticipo de prestaciones (LOTTT Art. 144). */
export const ANTICIPO_TOPE_PCT = 75;

export const hub: HubData = {
  slug: 've/trabajo/liquidacion-lottt',
  title: 'Liquidación en Venezuela (LOTTT): prestaciones, vacaciones y utilidades',
  description:
    'Calculá tu liquidación completa en Venezuela con la LOTTT: prestaciones sociales del Art. 142 (garantía vs. retroactivo, se paga el mayor), vacaciones y bono vacacional fraccionados, utilidades, preaviso del Art. 81 e indemnización del Art. 92.',
  silo: 'Trabajo',
  siloHref: '/ve/trabajo',
  locale: 've',

  eyebrow: 'Venezuela · LOTTT · fin de la relación de trabajo',
  h1: 'Me voy o me sacan: cuánto me tienen que pagar.',
  lede:
    'Una sola cuenta con todos los conceptos del cierre. Con tu salario y tu antigüedad se arma el salario integral diario, se comparan los dos sistemas de prestaciones del Art. 142, se fraccionan vacaciones, bono y utilidades del período en curso y se suma —solo si corresponde— la indemnización del Art. 92.',
  stamps: [
    'LOTTT Arts. 81, 92, 104, 131, 142, 144, 190 y 192',
    'Prestaciones: se paga el MAYOR entre garantía y retroactivo',
    '9 calculadoras adentro',
  ],

  resultLabel: 'Total de tu liquidación',

  cases: {
    title: '¿Cómo termina tu relación de trabajo?',
    intro:
      'Las prestaciones sociales se pagan siempre, salgas como salgas. Lo que cambia según el motivo es la indemnización del Art. 92 y quién le debe el preaviso a quién. Partimos del caso más frecuente.',
    items: [
      {
        id: 'renuncia',
        label: 'Renuncié',
        hint: 'Retiro voluntario · sin indemnización del Art. 92',
        answer: 'Renunciando cobrás prestaciones y todo lo fraccionado, pero no la indemnización del Art. 92.',
        yes: [
          'Prestaciones sociales del Art. 142: el mayor entre la garantía trimestral y el retroactivo de 30 días por año',
          'Vacaciones y bono vacacional fraccionados por los meses del período en curso (Art. 196)',
          'Utilidades fraccionadas por los meses del ejercicio (Art. 131)',
          'Los intereses del Art. 143 que el patrono acreditó sobre tu saldo',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La indemnización del Art. 92 NO corresponde: es exclusiva del despido injustificado',
          'Si ya pediste anticipos del Art. 144, se descuentan de lo que te queda por cobrar',
        ],
        plazo: 'la ley manda pagar las prestaciones dentro de los 5 días hábiles siguientes al fin de la relación; pasado ese plazo corren intereses de mora.',
      },
      {
        id: 'injustificado',
        label: 'Me despidieron sin causa justificada',
        hint: 'Art. 92 · la indemnización duplica las prestaciones',
        answer: 'En despido injustificado la indemnización del Art. 92 iguala tus prestaciones: cobrás el doble de ese concepto.',
        yes: [
          'Todo lo de la renuncia, más la indemnización del Art. 92 por un monto igual al de las prestaciones sociales',
          'El preaviso del Art. 81 si el patrono no te lo concedió como tiempo de trabajo',
          'Derecho a pedir el reenganche ante la Inspectoría del Trabajo en lugar de cobrar, si estás amparado por inamovilidad',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'Cobrar la indemnización del Art. 92 cierra la vía del reenganche: son caminos alternativos, no acumulables',
          'La inamovilidad laboral vigente exige autorización previa de la Inspectoría para despedir: sin ella el despido es nulo',
        ],
        plazo: 'la solicitud de reenganche ante la Inspectoría tiene un plazo corto desde el despido; si vas por esa vía, no firmes el finiquito antes de asesorarte.',
      },
      {
        id: 'justificado',
        label: 'Me despidieron con causa justificada',
        hint: 'Art. 79 · prestaciones sí, indemnización no',
        answer: 'Aunque el despido sea justificado, las prestaciones sociales y lo fraccionado se pagan igual.',
        yes: [
          'Prestaciones sociales completas del Art. 142: son un derecho adquirido, no un premio por buena conducta',
          'Vacaciones, bono vacacional y utilidades fraccionados',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'No corresponde la indemnización del Art. 92 ni el preaviso a cargo del patrono',
          'La causa justificada tiene que estar dentro de la lista taxativa del Art. 79 y notificarse en plazo: si no, el despido pasa a ser injustificado',
        ],
        plazo: 'el patrono debe participar el despido justificado al Tribunal del Trabajo dentro de los 5 días hábiles; si no lo hace, se presume que el despido fue sin causa.',
      },
      {
        id: 'anticipo',
        label: 'Sigo trabajando: quiero pedir un anticipo',
        hint: 'Art. 144 · hasta el 75% de la garantía',
        answer: `Podés anticipar hasta el ${ANTICIPO_TOPE_PCT}% de lo acreditado en tu garantía de prestaciones.`,
        yes: [
          `Anticipo de hasta el ${ANTICIPO_TOPE_PCT}% del saldo de la garantía (15 días por trimestre + días adicionales)`,
          'Destinos previstos por la ley: vivienda, salud, educación y liberación de hipoteca',
          'El saldo que queda sigue generando los intereses del Art. 143',
        ],
        warn: [
          DISCLAIMER_LABOR,
          'La base del anticipo es la GARANTÍA acreditada, no el retroactivo: aunque al cierre te paguen el retroactivo por ser mayor, anticipar no se calcula sobre él',
          'Lo que anticipes se descuenta de la liquidación final',
        ],
        plazo: 'el anticipo se pide por escrito al patrono con el soporte del destino; no hay una única fecha, pero conviene documentar la solicitud.',
      },
    ],
  },

  inputsTitle: 'Tus datos del contrato',
  inputsIntro:
    'Todo en bolívares y en valores actuales. El salario va como campo editable a propósito: en Venezuela cualquier monto fijo queda viejo en semanas.',
  fields: [
    {
      id: 'salarioMensual',
      label: 'Salario normal mensual (Bs.)',
      prefix: 'Bs.',
      value: '3.000',
      thousands: true,
      help: 'El salario normal, sin cestaticket ni bonos en divisas: esos no generan prestaciones.',
    },
    {
      id: 'anios',
      label: 'Años completos de antigüedad',
      type: 'number',
      value: 4,
      min: 0,
      max: 50,
      step: 1,
      help: 'Años enteros de servicio en la empresa.',
    },
    {
      id: 'meses',
      label: 'Meses adicionales del período en curso',
      type: 'number',
      value: 7,
      min: 0,
      max: 11,
      step: 1,
      help: 'Meses sueltos además de los años completos. Definen los conceptos fraccionados y, si pasan de 6, suman un año al retroactivo.',
    },
    {
      id: 'diasUtilidades',
      label: 'Días de utilidades que paga la empresa',
      type: 'number',
      value: 30,
      min: 15,
      max: 120,
      step: 1,
      help: `Mínimo legal ${VENEZUELA_2026.lottt.utilidadesDiasMin} días, máximo habitual ${VENEZUELA_2026.lottt.utilidadesDiasMax} (Art. 131). Mirá tu contrato o convención.`,
    },
    {
      id: 'diasBonoVacacional',
      label: 'Días de bono vacacional del contrato',
      type: 'number',
      value: 15,
      min: 15,
      max: 30,
      step: 1,
      help: `Mínimo legal ${VENEZUELA_2026.lottt.bonoVacacionalDiasBase} días más 1 por año, tope ${VENEZUELA_2026.lottt.bonoVacacionalDiasMax} (Art. 192). Si tu contrato da más, cargalo acá.`,
    },
    {
      id: 'anticipos',
      label: 'Anticipos de prestaciones ya cobrados (Bs.)',
      prefix: 'Bs.',
      value: '0',
      thousands: true,
      help: 'Lo que ya retiraste por el Art. 144. Se descuenta del total.',
    },
    {
      id: 'tasaBcv',
      label: 'Tasa BCV anual sobre prestaciones (%)',
      type: 'number',
      value: 0,
      min: 0,
      max: 200,
      step: 0.1,
      help: 'Art. 143: la fija el BCV mes a mes, por eso va editable. Dejala en 0 si no querés estimar intereses.',
    },
  ],
  fineprint: DISCLAIMER_LABOR,

  chart: {
    type: 'donut',
    title: 'De qué está hecha tu liquidación',
    caption:
      'Compara el peso de cada concepto: las prestaciones del Art. 142, lo fraccionado del período en curso (vacaciones, bono y utilidades) y —solo en despido injustificado— la indemnización del Art. 92, que sola vale tanto como todas las prestaciones.',
  },
  breakdownTitle: 'Concepto por concepto, como en el finiquito',
  breakdownIntro:
    'Primero el salario integral diario, que es la base de todo. Después los dos sistemas de prestaciones enfrentados, los fraccionados y, si corresponde, la indemnización.',

  faq: [
    {
      q: '¿Qué son exactamente las prestaciones sociales y cómo se calculan?',
      a: `Son la garantía de antigüedad que el Art. 142 de la LOTTT te reconoce por el tiempo trabajado. La ley manda hacer DOS cuentas y pagarte la mayor. La primera, la garantía: ${VENEZUELA_2026.lottt.prestaciones.garantiaDiasPorTrimestre} días de salario integral por cada trimestre completo, más ${VENEZUELA_2026.lottt.prestaciones.diasAdicionalesPorAnio} días adicionales por año a partir del segundo, acumulativos con tope de ${VENEZUELA_2026.lottt.prestaciones.diasAdicionalesMax} días. La segunda, el retroactivo: ${VENEZUELA_2026.lottt.prestaciones.retroactivoDiasPorAnio} días de salario integral por cada año de servicio, calculados con el ÚLTIMO salario integral. En antigüedades largas o con salarios que subieron mucho al final, casi siempre gana el retroactivo.`,
    },
    {
      q: '¿Qué es el salario integral y por qué no es mi sueldo?',
      a: `Es la base de cálculo de las prestaciones (Art. 104). Toma tu salario normal diario y le suma dos alícuotas: la de utilidades y la de bono vacacional, ambas prorrateadas sobre el año comercial de ${VENEZUELA_2026.lottt.diasAnioComercial} días. La cuenta es días del concepto por salario diario dividido ${VENEZUELA_2026.lottt.diasAnioComercial}. Por eso el integral siempre es más alto que el normal, y por eso conviene revisar cuántos días de utilidades paga realmente tu empresa: cada día extra levanta la base de toda la liquidación.`,
    },
    {
      q: 'El cestaticket y el bono de guerra, ¿entran en la liquidación?',
      a: 'No. El cestaticket socialista es un beneficio de alimentación y el bono de guerra económica es una asignación del Sistema Patria: ninguno de los dos tiene carácter salarial, así que no generan prestaciones, ni vacaciones, ni utilidades, ni bono vacacional. En la práctica esto significa que, para la mayoría de los trabajadores venezolanos, el grueso del ingreso mensual no produce ningún pasivo laboral y la liquidación se calcula sobre una fracción chica de lo que realmente cobran.',
    },
    {
      q: '¿Cuándo corresponde la indemnización del Art. 92?',
      a: 'Solo cuando el despido es injustificado, y equivale exactamente al monto de las prestaciones sociales: en los hechos duplica ese concepto. Si renunciaste o el despido fue justificado, no corresponde. Ojo con una decisión importante: cobrar esa indemnización cierra la vía del reenganche ante la Inspectoría del Trabajo. Son caminos alternativos y hay que elegir uno.',
    },
    {
      q: '¿Cuántos días de vacaciones y de bono vacacional me tocan?',
      a: `Las vacaciones del Art. 190 arrancan en ${VENEZUELA_2026.lottt.vacacionesDiasBase} días hábiles el primer año y suman ${VENEZUELA_2026.lottt.vacacionesDiasPorAnio} día por cada año adicional, con tope de ${VENEZUELA_2026.lottt.vacacionesDiasMax}. El bono vacacional del Art. 192 sigue la misma progresión y el mismo tope. Al cerrar la relación, ambos se pagan fraccionados: los días que te tocan por tu antigüedad, multiplicados por la proporción de meses del período en curso.`,
    },
    {
      q: 'Trabajé 4 años y 7 meses. ¿Eso son 4 años o 5?',
      a: `Depende del concepto. Para el retroactivo del Art. 142 la fracción superior a ${VENEZUELA_2026.lottt.prestaciones.fraccionSuperiorMeses} meses cuenta como año completo, así que 4 años y 7 meses liquidan como 5 años, es decir ${5 * VENEZUELA_2026.lottt.prestaciones.retroactivoDiasPorAnio} días. Para la garantía, en cambio, se cuentan los trimestres completos efectivamente transcurridos. Y para los fraccionados de vacaciones, bono y utilidades se usa la proporción exacta de meses sobre 12. Los tres criterios conviven en la misma liquidación.`,
    },
    {
      q: '¿Cuánto es el preaviso y quién se lo debe a quién?',
      a: 'El Art. 81 escalona el preaviso por antigüedad: no aplica con menos de un mes, es de 7 días entre 1 y 6 meses, de 15 días entre 6 meses y un año, y de 30 días con más de un año. Puede darse como tiempo de trabajo o pagarse en dinero, y en ese caso son los días de preaviso por tu salario diario. En el despido injustificado lo debe el patrono; en la renuncia, el trabajador, y el patrono puede descontarlo si no lo cumplís.',
    },
    {
      q: '¿Hasta cuánto puedo anticipar y sobre qué base?',
      a: `Hasta el ${ANTICIPO_TOPE_PCT}% de lo acreditado en la GARANTÍA de prestaciones (Art. 144), para vivienda, salud, educación o liberación de hipoteca. Es un detalle que confunde a mucha gente: la base del anticipo es la garantía trimestral, no el retroactivo. Podés terminar cobrando el retroactivo al cierre por ser el mayor y, aun así, haber anticipado solo sobre la garantía. Todo lo anticipado se descuenta de la liquidación final.`,
    },
    {
      q: '¿Qué pasa con los intereses de mis prestaciones?',
      a: 'El Art. 143 obliga a que el saldo acumulado genere intereses, con la tasa que fija el BCV mensualmente: la activa de los seis principales bancos si el depósito queda en la contabilidad de la empresa, o la pasiva si está en un fideicomiso o en el Fondo Nacional de Prestaciones. Como esa tasa cambia todos los meses, este hub no la fija: la cargás vos con el dato del período que quieras verificar. Los intereses se pagan aparte del capital y son anualmente exigibles.',
    },
    {
      q: '¿En cuánto tiempo me tienen que pagar?',
      a: 'Las prestaciones sociales son exigibles de inmediato al terminar la relación de trabajo y la ley da un plazo breve —cinco días hábiles— para pagarlas. Vencido ese plazo, la deuda genera intereses de mora a la tasa activa. Si el patrono no paga, la reclamación se hace ante la Inspectoría del Trabajo y, si no prospera, por vía judicial. Los derechos laborales en Venezuela son irrenunciables: firmar un finiquito por menos de lo que corresponde no valida la diferencia.',
    },
    {
      q: '¿Conviene que me paguen en bolívares o en divisas?',
      a: 'Legalmente la liquidación se calcula sobre el salario pactado, y el salario que genera pasivos es el que consta como tal en el recibo. Si tu remuneración está parcialmente dolarizada pero figura como bono no salarial, esa parte no entra en la cuenta. Antes de firmar conviene revisar cómo está descrito cada concepto en los recibos de los últimos meses: ahí se define la base sobre la que se liquida todo, más allá de en qué moneda te terminen pagando.',
    },
  ],

  sources: [
    {
      name: 'Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)',
      url: 'https://www.inces.gob.ve/wp-content/uploads/2020/03/LOTTT.pdf',
      publisher: 'INCES / Gaceta Oficial 6.076 Extraordinario',
    },
    {
      name: 'LOTTT Art. 142 — prestaciones sociales (garantía y retroactivo)',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/142',
      publisher: 'ley.com.ve',
    },
    {
      name: 'LOTTT Art. 92 — indemnización por terminación injustificada',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/92',
      publisher: 'ley.com.ve',
    },
    {
      name: 'LOTTT Arts. 190 y 192 — vacaciones y bono vacacional',
      url: 'https://www.ley.com.ve/leyes/federales/ley-organica-del-trabajo-los-trabajadores-y-las-trabajadoras/190',
      publisher: 'ley.com.ve',
    },
    {
      name: 'Ministerio del Poder Popular para el Proceso Social de Trabajo',
      url: 'http://www.mpppst.gob.ve/',
      publisher: 'MinTrabajo Venezuela',
    },
    {
      name: 'Banco Central de Venezuela — tasas de interés sobre prestaciones (Art. 143)',
      url: 'https://www.bcv.org.ve/estadisticas/tasas-de-interes',
      publisher: 'BCV',
    },
  ],

  replaces: [
    '/ve/calculadora-prestaciones-sociales-venezuela',
    '/ve/calculadora-liquidacion-finiquito-venezuela',
    '/ve/calculadora-preaviso-venezuela',
    '/ve/calculadora-antiguedad-laboral-venezuela',
    '/ve/calculadora-utilidades-aguinaldo-venezuela',
    '/ve/calculadora-vacaciones-bono-vacacional-venezuela',
    '/ve/calculadora-salario-integral-venezuela',
    '/ve/calculadora-anticipo-prestaciones-sociales-venezuela',
    '/ve/calculadora-intereses-prestaciones-sociales-venezuela',
  ],

  lastReviewed: '2026-07-28',
};
