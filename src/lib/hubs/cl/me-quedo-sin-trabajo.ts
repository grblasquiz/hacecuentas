import type { HubData } from '../types';
import { CHILE_2026 } from '../../data/chile-2026';
import clLive from '../../../data/live/chile.json';

/**
 * Hub de decisión CL — "Me despidieron o renuncié: ¿cuánta plata me corresponde?"
 *
 * Reúne finiquito, indemnización por años de servicio, vacaciones proporcionales y
 * seguro de cesantía en una sola página, porque son la misma decisión.
 *
 * REGLAS LEGALES QUE ACÁ SE APLICAN Y QUE LAS FÓRMULAS VIEJAS SE SALTEABAN:
 *  - Art. 172 CT: la base de cálculo de la indemnización TOPA en 90 UF. La fórmula
 *    `finiquito-chile-completo-causal-despido.ts` usaba el sueldo crudo sin tope y
 *    sobreestimaba fuerte los finiquitos de sueldos altos.
 *  - Art. 163 CT: tope de 11 años computables y la fracción superior a 6 meses cuenta
 *    como año completo (la fórmula vieja multiplicaba por años fraccionarios).
 *  - Art. 178 CT + Art. 17 N°13 LIR: las indemnizaciones legales por término de contrato
 *    NO constituyen renta: no pagan AFP, ni salud, ni impuesto. La fórmula vieja les
 *    descontaba cotizaciones sobre el 80% del monto y les aplicaba impuesto.
 *  - El impuesto que sí corresponde (sobre vacaciones proporcionales, sueldo pendiente y
 *    aviso previo) es el Impuesto Único mensual del Art. 43 N°1 LIR, progresivo con rebaja,
 *    no una tasa marginal plana sobre toda la base.
 *
 * La UF y la UTM son datos VIVOS (src/data/live/chile.json): el tope de 90 UF se mueve
 * todos los días y por eso acá nunca se hardcodea en pesos.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
export const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

export const UF = (clLive as any)?.uf?.valor ?? 40627.62;
export const UTM = (clLive as any)?.utm?.valor ?? 71506;

export const LEY = {
  /** Art. 172 CT — tope de la base de cálculo de la indemnización. */
  topeBaseUf: 90,
  /** Art. 163 CT — tope de años computables. */
  topeAnios: 11,
  /** Art. 67 CT — feriado anual básico, en días hábiles. */
  feriadoDiasHabiles: 15,
  /** Art. 68 CT — feriado progresivo: 1 día extra cada 3 años sobre 10 de antigüedad. */
  progresivoDesdeAnios: 10,
  progresivoCadaAnios: 3,
  afpObligatorio: CHILE_2026.afpObligatorio,
  saludFonasa: CHILE_2026.saludFonasa,
  cesantia: CHILE_2026.afcTrabajadorIndefinido,
  topeAfpUf: CHILE_2026.topeImponibleAfpUf,
};

/** Art. 168 CT — recargos sobre la indemnización cuando el despido se declara improcedente. */
export const RECARGOS_ART168 = [
  { id: 'ninguno', label: 'No reclamé o el despido fue procedente', pct: 0 },
  { id: 'r30', label: 'Despido por necesidades de la empresa declarado injustificado (+30%)', pct: 30 },
  { id: 'r50', label: 'Se invocó el Art. 159 o el 160 y se declaró improcedente (+50%)', pct: 50 },
  { id: 'r80', label: 'Me despidieron sin invocar ninguna causal (+80%)', pct: 80 },
  { id: 'r100', label: 'Se invocó el Art. 160 N°1, 5 o 6 y el tribunal lo rechazó (+100%)', pct: 100 },
];

/**
 * Ley 19.728 — escala decreciente de los giros del seguro de cesantía, como porcentaje
 * del promedio de las últimas remuneraciones. Espejo de retiro-cesantia-cic-afc-chile.ts.
 */
export const ESCALA_GIROS_AFC = [0.7, 0.55, 0.45, 0.4, 0.35, 0.3];
export const MIN_COTIZACIONES = { indefinido: 12, plazoFijo: 6 };

/** Impuesto Único de Segunda Categoría — Art. 43 N°1 LIR, tramos mensuales en UTM. */
export const TRAMOS_IUSC: Array<{ hastaUtm: number | null; factor: number; rebajaUtm: number }> = [
  { hastaUtm: 13.5, factor: 0, rebajaUtm: 0 },
  { hastaUtm: 30, factor: 0.04, rebajaUtm: 0.54 },
  { hastaUtm: 50, factor: 0.08, rebajaUtm: 1.74 },
  { hastaUtm: 70, factor: 0.135, rebajaUtm: 4.49 },
  { hastaUtm: 90, factor: 0.23, rebajaUtm: 11.14 },
  { hastaUtm: 120, factor: 0.304, rebajaUtm: 17.8 },
  { hastaUtm: 310, factor: 0.35, rebajaUtm: 23.32 },
  { hastaUtm: null, factor: 0.4, rebajaUtm: 38.82 },
];

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

export const hub: HubData = {
  slug: 'cl/trabajo/me-quedo-sin-trabajo',
  title: 'Finiquito en Chile: cuánta plata te corresponde según la causal',
  description:
    'Calcula tu finiquito completo en Chile: indemnización por años de servicio con el tope de 90 UF del Art. 172, mes de aviso previo, vacaciones proporcionales, sueldo pendiente y los giros del seguro de cesantía. Con los recargos del Art. 168 si el despido fue injustificado.',
  silo: 'Trabajo',
  siloHref: '/cl/trabajo',
  locale: 'cl',

  eyebrow: 'Chile · término de contrato',
  h1: 'Me quedé sin trabajo: ¿cuánta plata me corresponde?',
  lede:
    'Lo que te tienen que pagar depende de la causal con la que te sacaron. Elige tu caso y mira el finiquito completo: indemnización por años de servicio, mes de aviso previo, vacaciones proporcionales y sueldo pendiente, más lo que puedes girar del seguro de cesantía.',
  stamps: [
    `Tope Art. 172: 90 UF = ${fmt(LEY.topeBaseUf * UF)}`,
    'Tope de 11 años · Art. 163 CT',
    'Indemnización legal exenta · Art. 178 CT',
    'Recargos del Art. 168 incluidos',
    '4 causales en una sola página',
  ],

  resultLabel: 'Finiquito líquido estimado',

  cases: {
    title: '¿Con qué causal terminó tu contrato?',
    intro:
      'Partimos por la causal más frecuente. La causal define casi todo: si hay indemnización, si hay aviso previo y si puedes girar del Fondo de Cesantía Solidario.',
    items: [
      {
        id: 'necesidades',
        label: 'Necesidades de la empresa (Art. 161)',
        hint: 'El despido "sin culpa": reestructuración, baja de productividad, cambios del mercado.',
        yes: [
          'Indemnización por años de servicio: un mes de remuneración por año, con tope de 11 años',
          'La base de cálculo topa en 90 UF (Art. 172): sobre ese monto no crece más',
          'Mes de aviso previo si no te avisaron con 30 días de anticipación (Art. 162)',
          'Vacaciones proporcionales y sueldo de los días trabajados del mes',
          'Derecho a girar de tu cuenta individual y, si no alcanza, del Fondo de Cesantía Solidario',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Las indemnizaciones legales por término de contrato no constituyen renta (Art. 178 CT y Art. 17 N°13 LIR): no pagan AFP, ni salud, ni impuesto',
          'Sí pagan cotizaciones e impuesto las vacaciones proporcionales y el sueldo pendiente del mes',
          'La "ley Bustos" (Art. 162 inc. 5) obliga al empleador a tener las cotizaciones al día: si no lo están, el despido no produce efecto y te siguen pagando el sueldo',
        ],
        plazo:
          'el finiquito se debe pagar y ratificar dentro de los 10 días hábiles siguientes a la separación; tienes 60 días hábiles para reclamar judicialmente.',
        answer:
          'Por necesidades de la empresa te corresponde un mes por año trabajado (máximo 11), sobre una base topada en 90 UF, más el mes de aviso previo si no te avisaron.',
      },
      {
        id: 'renuncia',
        label: 'Renuncié voluntariamente',
        hint: 'También aplica al mutuo acuerdo sin indemnización pactada.',
        yes: [
          'Vacaciones proporcionales por el período trabajado y no tomado',
          'Sueldo de los días efectivamente trabajados del mes',
          'Gratificación proporcional y otros haberes devengados y no pagados',
          'Puedes girar tu cuenta individual de cesantía (lo que aportaste tú y tu empleador)',
        ],
        warn: [
          DISCLAIMER_TAX,
          'La renuncia NO da derecho a indemnización por años de servicio ni a mes de aviso previo',
          'La renuncia tampoco da acceso al Fondo de Cesantía Solidario: sólo a tu cuenta individual',
          'Debes avisar con 30 días de anticipación; si no lo haces, el empleador puede descontar ese mes',
          'La renuncia debe ir firmada ante ministro de fe para que sea oponible',
        ],
        plazo:
          'el aviso de renuncia es con 30 días de anticipación y el finiquito se paga dentro de los 10 días hábiles de la separación.',
        answer:
          'Si renuncias sólo te pagan lo devengado: vacaciones proporcionales, días trabajados y haberes pendientes. No hay indemnización.',
      },
      {
        id: 'injustificado',
        label: 'Me despidieron y creo que fue injustificado',
        hint: 'Reclamaste ante el tribunal y el despido se declaró improcedente o sin causal.',
        yes: [
          'Todo lo del despido por necesidades de la empresa',
          'Más el recargo del Art. 168 sobre la indemnización por años de servicio: 30%, 50%, 80% o 100% según el caso',
          'El recargo se calcula sobre la indemnización por años de servicio, no sobre el aviso previo',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El recargo lo fija el tribunal: acá se estima el porcentaje que corresponde según la causal invocada',
          'Tienes 60 días hábiles desde la separación para reclamar; el plazo se suspende si vas a la Inspección del Trabajo, con tope de 90 días',
          'El recargo también es indemnización legal: tampoco constituye renta',
        ],
        plazo:
          'el reclamo judicial se presenta dentro de 60 días hábiles desde la separación (suspendible por el reclamo administrativo, con tope de 90 días).',
        answer:
          'Si el despido se declara injustificado, la indemnización por años de servicio se recarga entre un 30% y un 100% según la causal que te invocaron.',
      },
      {
        id: 'plazo-fijo',
        label: 'Se venció mi contrato a plazo fijo o terminó la obra',
        hint: 'Art. 159 N°4 y N°5: vencimiento del plazo o conclusión de la obra o faena.',
        yes: [
          'Vacaciones proporcionales y sueldo de los días trabajados',
          'Con 6 cotizaciones puedes girar tu cuenta individual de cesantía',
          'Si la obra o faena termina, corresponde la indemnización especial del Art. 163 ter cuando aplica',
        ],
        warn: [
          DISCLAIMER_TAX,
          'El vencimiento del plazo no da indemnización por años de servicio ni aviso previo',
          'En contrato a plazo fijo el seguro de cesantía lo financia sólo el empleador (3%), así que tu cuenta individual crece más rápido pero no hay aporte tuyo',
          'Si te renovaron dos veces o llevas más de un año, el contrato puede haberse transformado en indefinido y cambiar todo el cálculo',
        ],
        plazo:
          'el finiquito se paga dentro de los 10 días hábiles siguientes al término del contrato.',
        answer:
          'Por vencimiento del plazo no hay indemnización por años de servicio: te pagan lo devengado y puedes girar tu cuenta individual de cesantía.',
      },
    ],
  },

  inputsTitle: 'Los datos de tu contrato',
  inputsIntro:
    'La remuneración es la última mensual imponible, incluyendo lo que se paga mes a mes. Los topes en UF se convierten con el valor de la UF de hoy.',
  fields: [
    {
      id: 'sueldo',
      label: 'Última remuneración mensual imponible (CLP)',
      prefix: '$',
      value: '1.200.000',
      thousands: true,
      help: 'Sueldo base más los haberes fijos imponibles. La base de la indemnización topa en 90 UF.',
    },
    {
      id: 'anios',
      label: 'Años completos trabajados',
      type: 'number',
      value: 5,
      min: 0,
      max: 45,
      step: 1,
    },
    {
      id: 'mesesExtra',
      label: 'Meses adicionales sobre esos años',
      type: 'number',
      value: 7,
      min: 0,
      max: 11,
      step: 1,
      help: 'La fracción superior a 6 meses cuenta como un año completo (Art. 163 CT).',
    },
    {
      id: 'avisoPrevio',
      label: '¿Te avisaron con 30 días de anticipación?',
      type: 'select',
      value: 'no',
      options: [
        { value: 'no', label: 'No me avisaron: corresponde el mes sustitutivo' },
        { value: 'si', label: 'Sí, me avisaron con 30 días' },
      ],
    },
    {
      id: 'diasVacaciones',
      label: 'Días hábiles de vacaciones pendientes',
      type: 'number',
      value: 10,
      min: 0,
      max: 60,
      step: 1,
      help: 'Feriado básico de 15 días hábiles al año (Art. 67), más el progresivo si llevas más de 10 años.',
    },
    {
      id: 'diasSueldo',
      label: 'Días trabajados del último mes',
      type: 'number',
      value: 15,
      min: 0,
      max: 30,
      step: 1,
      help: 'Sobre un mes comercial de 30 días.',
    },
    {
      id: 'recargo',
      label: 'Recargo del Art. 168 (sólo si reclamaste)',
      type: 'select',
      value: 'ninguno',
      options: RECARGOS_ART168.map((r) => ({ value: r.id, label: r.label })),
    },
    {
      id: 'mesesCotizados',
      label: 'Meses cotizados al seguro de cesantía',
      type: 'number',
      value: 24,
      min: 0,
      max: 480,
      step: 1,
      help: 'Se necesitan 12 cotizaciones en contrato indefinido y 6 en plazo fijo para girar.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'donut',
    title: 'De qué está hecho tu finiquito',
    caption:
      'Separa la parte indemnizatoria —que no paga cotizaciones ni impuesto— de la parte remuneracional, que sí los paga.',
  },
  breakdownTitle: 'Concepto por concepto',
  breakdownIntro: 'Las barras comparan cada partida contra la mayor del finiquito.',

  faq: [
    {
      q: '¿Cuánto me corresponde de indemnización por años de servicio?',
      a: 'Un mes de la última remuneración mensual por cada año de servicio y por la fracción superior a seis meses, con un tope de 11 años (Art. 163 del Código del Trabajo). Sólo corresponde si te despidieron por necesidades de la empresa (Art. 161) o si el despido se declaró injustificado. Con renuncia, mutuo acuerdo sin pacto o vencimiento del plazo, no hay indemnización por años de servicio.',
    },
    {
      q: '¿Qué es el tope de 90 UF y por qué me importa?',
      a: `El Art. 172 del Código del Trabajo dice que la base de cálculo de la indemnización no puede superar 90 unidades de fomento. Hoy eso equivale a ${fmt(LEY.topeBaseUf * UF)} mensuales. Si tu remuneración es mayor, la indemnización se calcula igual sobre ese tope, no sobre tu sueldo real. Como el tope está en UF y la UF cambia todos los días, el monto en pesos se mueve: por eso esta página lo calcula con el valor vigente y no con una cifra fija.`,
    },
    {
      q: '¿El finiquito paga impuestos y cotizaciones?',
      a: 'Depende de la partida. Las indemnizaciones legales por término de contrato —años de servicio, aviso previo sustitutivo y los recargos del Art. 168— no constituyen renta según el Art. 178 del Código del Trabajo y el Art. 17 N°13 de la Ley de la Renta: no pagan AFP, ni salud, ni impuesto. En cambio, las vacaciones proporcionales, el sueldo de los días trabajados y la gratificación proporcional sí son remuneración y pagan cotizaciones e Impuesto Único de Segunda Categoría.',
    },
    {
      q: '¿Cómo se calculan las vacaciones proporcionales?',
      a: 'El feriado anual básico es de 15 días hábiles por año trabajado (Art. 67), más un día adicional por cada tres años sobre los diez de antigüedad (feriado progresivo, Art. 68). Si te vas antes de cumplir el año o con días pendientes, se pagan en proporción al tiempo trabajado. El valor del día sale de dividir la remuneración mensual en 30, aunque los días de feriado se cuenten como hábiles.',
    },
    {
      q: '¿Qué son los recargos del Art. 168?',
      a: 'Si reclamas judicialmente y el tribunal declara que el despido fue improcedente, injustificado o indebido, la indemnización por años de servicio se aumenta: 30% si te despidieron por necesidades de la empresa y no se justificó, 50% si se invocó una causal del Art. 159 o del 160 y se declaró improcedente, 80% si te despidieron sin invocar causal alguna, y 100% si se invocaron las causales más graves del Art. 160 (N°1, 5 o 6) y el tribunal las rechazó. El recargo se aplica sobre la indemnización por años de servicio, no sobre el aviso previo.',
    },
    {
      q: '¿Cuánto puedo girar del seguro de cesantía?',
      a: 'Los giros de la Ley 19.728 son un porcentaje decreciente del promedio de tus últimas remuneraciones: 70% el primer mes, 55% el segundo, 45% el tercero, 40% el cuarto, 35% el quinto y 30% el sexto, cada uno con un tope en UF. Con contrato indefinido necesitas 12 cotizaciones para girar y con plazo fijo, 6. Si tu cuenta individual no alcanza y te despidieron por una causal que da derecho (Art. 161), completas con el Fondo de Cesantía Solidario. La renuncia sólo da acceso a tu cuenta individual.',
    },
    {
      q: '¿Qué pasa si el empleador no tenía mis cotizaciones al día?',
      a: 'Es la llamada "ley Bustos" (Art. 162 inciso 5). Si al momento del despido el empleador no ha pagado íntegramente tus cotizaciones previsionales, el despido no produce el efecto de poner término al contrato: el empleador debe seguir pagándote la remuneración y las cotizaciones hasta que convalide el despido acreditando el pago. Es una de las razones más frecuentes de reclamo, y no está incluida en esta estimación.',
    },
    {
      q: '¿En qué plazo me tienen que pagar el finiquito?',
      a: 'Dentro de los 10 días hábiles siguientes a la separación. El finiquito debe constar por escrito y firmarse ante ministro de fe (inspector del trabajo, notario, oficial del registro civil o el presidente del sindicato) para que tenga poder liberatorio. Firmar "con reserva de derechos" te permite cobrar lo que te ofrecen y reclamar igual por las diferencias.',
    },
    {
      q: '¿Cuánto tiempo tengo para reclamar si no estoy de acuerdo?',
      a: 'Sesenta días hábiles contados desde la separación para demandar ante el juzgado laboral. Ese plazo se suspende si presentas un reclamo en la Inspección del Trabajo, pero en ningún caso puede pasar de 90 días hábiles. Si dejas pasar el plazo, pierdes la acción aunque el despido haya sido claramente injustificado.',
    },
    {
      q: '¿La indemnización se descuenta de lo que giro del seguro de cesantía?',
      a: 'Sí, en parte. Cuando el término es por necesidades de la empresa, el empleador puede imputar a la indemnización por años de servicio la parte de la cuenta individual financiada con sus propios aportes. Es la llamada imputación del Art. 13 de la Ley 19.728: no reduce lo que giras, pero sí puede reducir lo que el empleador te paga de indemnización. Conviene revisarlo en la propuesta de finiquito.',
    },
    {
      q: '¿Y si tenía contrato a plazo fijo?',
      a: 'El vencimiento del plazo (Art. 159 N°4) o la conclusión de la obra o faena (N°5) no dan derecho a indemnización por años de servicio ni a mes de aviso previo: sólo a lo devengado. Ojo con una excepción importante: si te renovaron el contrato dos veces, o si prestaste servicios de forma discontinua en más de 12 meses dentro de 15, el contrato se entiende indefinido por ley y todo el cálculo cambia.',
    },
    {
      q: '¿La gratificación entra en el finiquito?',
      a: 'Sí. La gratificación legal del Art. 50 —25% de lo devengado con tope de 4,75 ingresos mínimos anuales— se paga en proporción al tiempo trabajado en el ejercicio, y es remuneración: paga cotizaciones e impuesto. Si tu empleador paga la gratificación mensualizada, ya la recibiste mes a mes y no vuelve a aparecer en el finiquito.',
    },
  ],

  sources: [
    {
      name: 'Código del Trabajo — Arts. 159 a 178 (término de contrato, indemnizaciones y topes)',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=207436',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'Dirección del Trabajo — finiquito, indemnizaciones y plazos de pago',
      url: 'https://www.dt.gob.cl/portal/1628/w3-propertyvalue-22345.html',
      publisher: 'Dirección del Trabajo',
    },
    {
      name: 'Ley 19.728 — seguro obligatorio de cesantía y escala de giros',
      url: 'https://www.bcn.cl/leychile/navegar?idNorma=185536',
      publisher: 'Biblioteca del Congreso Nacional de Chile',
    },
    {
      name: 'AFC Chile — requisitos y montos de los giros del seguro de cesantía',
      url: 'https://www.afc.cl/',
      publisher: 'Administradora de Fondos de Cesantía',
    },
    {
      name: 'SII — Impuesto Único de Segunda Categoría y rentas exentas del Art. 17 N°13 LIR',
      url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm',
      publisher: 'Servicio de Impuestos Internos',
    },
    {
      name: 'Banco Central de Chile — valor diario de la Unidad de Fomento',
      url: 'https://www.bcentral.cl/',
      publisher: 'Banco Central de Chile',
    },
  ],

  replaces: [
    '/calculadora-finiquito-chile-completo-causal-despido',
    '/calculadora-finiquito-renuncia-voluntaria-chile-vacaciones-proporcionales',
    '/calculadora-indemnizacion-anos-servicio-chile-despido',
    '/calculadora-vacaciones-chile-15-dias-habiles-progresivas',
    '/calculadora-seguro-cesantia-chile-afc-cuota-fondo',
    '/calculadora-retiro-seguro-cesantia-cic-afc-chile-giros',
  ],

  lastReviewed: '2026-07-28',
};
