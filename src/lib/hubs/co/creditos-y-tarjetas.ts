import type { HubData } from '../types';
import { NEQUI_PRESTAMOS_2026 } from '../../data/colombia-2026';

/**
 * Hub de decisión CO — "¿Qué cuota voy a pagar y cuánto de eso es interés?"
 *
 * Todo el hub corre sobre la conversión correcta de efectiva anual a mensual:
 *   TEM = (1 + EA)^(1/12) − 1
 * NUNCA EA/12. Cuatro de las calculadoras que absorbe usaban la división lineal
 * (ver reporte); eso subestima la cuota y el costo total del crédito.
 *
 * Constantes: src/lib/data/colombia-2026.ts + certificación de la Superfinanciera.
 */

/** Disclaimer YMYL — copiado textual de src/lib/disclaimers.ts (dominio 'tax'). */
const DISCLAIMER_TAX =
  'Estimación informativa basada en los parámetros indicados. Las normas y escalas pueden cambiar; verificá el organismo fiscal aplicable y consultá a un contador para una liquidación definitiva.';

/**
 * Interés bancario corriente certificado por la Superintendencia Financiera para
 * la modalidad de crédito de consumo y ordinario. Se certifica MENSUALMENTE.
 * Valor de la certificación vigente al armar el hub: 19,19% EA
 * (Resolución SFC 0823 de 2026, jun-2026).
 */
export const IBC_CONSUMO_EA_PCT = 19.19;
export const IBC_RESOLUCION = 'Resolución SFC 0823 de 2026';

/**
 * Tasa de usura = 1,5 × interés bancario corriente (art. 305 Código Penal y
 * art. 884 Código de Comercio). Es el techo legal: cobrar por encima es delito.
 * También es el tope del interés de mora.
 */
export const USURA_EA_PCT = Math.round(IBC_CONSUMO_EA_PCT * 1.5 * 100) / 100;

/** Interés legal civil del art. 1617 del Código Civil: 6% anual. */
export const INTERES_LEGAL_CIVIL_PCT = 6;

/** Préstamos Nequi — verificado 2026-07-18 (ver colombia-2026.ts). */
export const NEQUI = NEQUI_PRESTAMOS_2026;

/**
 * Tope de descuento por libranza: la cuota no puede dejar al trabajador con menos
 * del 50% de su salario neto, descontados los aportes obligatorios
 * (Ley 1527 de 2012, art. 3, literal e).
 */
export const LIBRANZA_TOPE_PCT = 50;

const pct = (n: number) => n.toFixed(2).replace('.', ',') + '%';

export const hub: HubData = {
  slug: 'co/finanzas/creditos-y-tarjetas',
  title: 'Cuota de crédito y tarjeta en Colombia: cuánto pagás y cuánto es interés',
  description:
    'Calculá la cuota real de tu tarjeta, libranza, préstamo de cooperativa, préstamo de app o crédito de vehículo con la conversión correcta de efectiva anual a mensual, contra la tasa de usura y con seguros y comisiones adentro.',
  silo: 'Finanzas',
  siloHref: '/co/finanzas',
  locale: 'co',

  eyebrow: 'Colombia · Superfinanciera · tasa de usura',
  h1: '¿Qué cuota voy a pagar y cuánto de eso es interés?',
  lede:
    'La tasa que te dicen es efectiva anual; la cuota se calcula con la mensual, y convertir una en otra no es dividir por doce. Acá se usa la conversión correcta, se suman los seguros y las comisiones que casi nunca aparecen en la simulación del banco, y se compara tu tasa contra el techo legal.',
  stamps: [
    `Interés bancario corriente ${pct(IBC_CONSUMO_EA_PCT)} EA`,
    `Tasa de usura ${pct(USURA_EA_PCT)} EA`,
    '7 calculadoras adentro',
  ],

  resultLabel: 'Cuota mensual total',

  cases: {
    title: '¿Qué crédito estás mirando?',
    intro:
      'La matemática de la cuota es la misma en todos: sistema francés sobre la tasa mensual equivalente. Lo que cambia es la tasa que te van a cobrar, quién te la descuenta y qué costos se esconden fuera de la tasa.',
    items: [
      {
        id: 'tarjeta',
        label: 'Tarjeta de crédito',
        hint: 'La trampa del pago mínimo',
        answer: 'Pagando el mínimo, la mayor parte de tu cuota es interés y la deuda casi no baja.',
        yes: [
          'El pago mínimo es un porcentaje del saldo, así que baja mes a mes junto con la deuda: por eso el plazo se estira tanto',
          'Los intereses corren sobre el saldo, y todo lo que no abones a capital vuelve a generar interés el mes siguiente',
          'Las compras a una cuota y las que están dentro del período de gracia no generan interés si pagás el total antes del corte',
          'Pagar el total en vez del mínimo es la decisión de mayor retorno financiero disponible para casi cualquier persona',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Ninguna entidad puede cobrarte por encima de la tasa de usura, hoy ${pct(USURA_EA_PCT)} EA. Si tu extracto muestra más, hay algo mal y podés reclamar ante la Superfinanciera`,
          'Los avances en efectivo suelen liquidarse a la tasa máxima y sin período de gracia: son de lo más caro del sistema',
          'La cuota de manejo es un costo fijo que no depende de cuánto debas: si no usás la tarjeta, cancelala en vez de dejarla dormida',
          'Un mes de atraso se reporta a las centrales de riesgo y te encarece todos los créditos futuros, no sólo este',
        ],
        plazo: 'la fecha de corte y la de pago son distintas: pagar justo después del corte te da hasta un mes más de financiación gratis.',
      },
      {
        id: 'libranza',
        label: 'Crédito de libranza',
        hint: 'Descuento directo de nómina',
        answer: 'La libranza es de las tasas más bajas del mercado porque el pago se descuenta antes de que cobres.',
        yes: [
          'La cuota se descuenta directamente de tu nómina o mesada pensional, así que el riesgo para la entidad es bajísimo y la tasa lo refleja',
          `El descuento no puede dejarte con menos del ${LIBRANZA_TOPE_PCT}% de tu salario neto, descontados los aportes obligatorios (Ley 1527 de 2012, art. 3)`,
          'Podés comparar y trasladar la libranza a otra entidad: la ley te da libertad de elegir el operador',
          'Al ser un descuento automático, no hay riesgo de olvidarte y caer en mora',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Si te desvinculás del empleador la libranza no se extingue: se vuelve una obligación directa tuya, muchas veces con otra tasa',
          'Revisá si hay seguro de vida deudor obligatorio y cuánto suma: puede cambiar bastante la cuota total',
          'Que la cuota "no se sienta" porque nunca pasa por tu cuenta es justamente lo que hace fácil sobreendeudarse',
        ],
        plazo: 'pedí la tasa en EA y el valor de la cuota TOTAL con seguros: son dos preguntas distintas.',
      },
      {
        id: 'cooperativa',
        label: 'Préstamo de cooperativa',
        hint: 'Tasa preferencial para asociados',
        answer: 'La cooperativa suele descontarte puntos de tasa por ser asociado, pero te pide aportes que quedan inmovilizados.',
        yes: [
          'Tasas típicamente por debajo de las de un banco para el mismo perfil de riesgo',
          'Descuento adicional de tasa por antigüedad o por nivel de aportes como asociado',
          'Los excedentes del ejercicio se devuelven a los asociados según el estatuto de cada cooperativa',
          'Suelen ser más flexibles con historiales crediticios cortos o con reportes ya subsanados',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Los aportes sociales que te exigen para ser asociado son plata inmovilizada: sumala al costo real del crédito, porque no rinde mientras esté ahí',
          'Las cooperativas también están sujetas a la tasa de usura: el tope legal es el mismo',
          'Verificá que la cooperativa esté vigilada por la Superintendencia de Economía Solidaria o la Financiera según su tipo',
        ],
        plazo: 'preguntá cuánto de tu aporte te devuelven al cancelar el crédito y en cuánto tiempo.',
      },
      {
        id: 'app',
        label: 'Préstamo de app (Nequi, fintech)',
        hint: `Salvavidas ${NEQUI.salvavidas.emPct}% mensual · Bajo Monto hasta ${NEQUI.bajoMonto.eaMaxPct}% EA`,
        answer: 'Los préstamos de app son inmediatos y chicos, y por eso mismo están entre los más caros por peso prestado.',
        yes: [
          `Salvavidas: de ${'$' + NEQUI.salvavidas.min.toLocaleString('es-CO')} a ${'$' + NEQUI.salvavidas.max.toLocaleString('es-CO')}, a ${NEQUI.salvavidas.emPct}% mensual y ${NEQUI.salvavidas.plazoMeses} mes de plazo`,
          `Bajo Monto: hasta ${'$' + NEQUI.bajoMonto.max.toLocaleString('es-CO')}, entre ${NEQUI.bajoMonto.emMinPct}% y ${NEQUI.bajoMonto.emMaxPct}% mensual, hasta ${NEQUI.bajoMonto.plazoMesesMax} meses`,
          'Desembolso inmediato y sin papeleo: para una urgencia real puede tener sentido',
          'El cupo se asigna por comportamiento en la app, así que sirve para construir historial desde cero',
        ],
        warn: [
          DISCLAIMER_TAX,
          `Una tasa mensual de ${NEQUI.salvavidas.emPct}% equivale a alrededor del ${pct((Math.pow(1 + NEQUI.salvavidas.emPct / 100, 12) - 1) * 100)} EA: siempre convertí la mensual a anual antes de comparar`,
          'Encima de la tasa suele ir un seguro de vida y en algunos productos una comisión del fondo de garantías: pedí el valor total a pagar, no la tasa',
          'El plazo cortísimo hace que la cuota sea altísima aunque el monto sea chico',
          'Renovar el préstamo mes a mes para no incumplir es la forma más rápida de que el costo supere al capital',
        ],
        plazo: 'antes de aceptar, mirá el total a pagar que muestra la app: ese número dice más que la tasa.',
      },
      {
        id: 'vehiculo',
        label: 'Crédito de vehículo o leasing',
        hint: 'Leasing con opción de compra vs crédito',
        answer: 'El leasing baja la cuota porque no financia el valor residual, pero al final tenés que pagarlo para quedarte con el carro.',
        yes: [
          'En el crédito el vehículo es tuyo desde el principio y queda con prenda a favor de la entidad',
          'En el leasing financiero la entidad es la dueña y vos pagás un canon; al final ejercés la opción de compra por el valor residual pactado',
          'La cuota del leasing es más baja porque financia el precio menos el residual, no el precio completo',
          'Para uso empresarial el tratamiento tributario del canon de leasing puede diferir del de la depreciación en el crédito: eso lo define tu contador, no una calculadora',
        ],
        warn: [
          DISCLAIMER_TAX,
          'Comparar leasing y crédito por la cuota mensual es engañoso: hay que comparar el TOTAL pagado, y en el leasing eso incluye la opción de compra final',
          'El seguro todo riesgo es obligatorio y no es menor: sumalo siempre a la cuota',
          'El vehículo se deprecia más rápido de lo que amortizás al principio: durante los primeros años podés deber más de lo que vale',
          'La cuota inicial alta baja la cuota pero es plata que dejás de tener disponible',
        ],
        plazo: 'pedí las dos ofertas con el mismo plazo y el mismo monto financiado, o no son comparables.',
      },
    ],
  },

  inputsTitle: 'Los números de tu crédito',
  inputsIntro:
    'Cargá lo que te ofrecieron. Si estás mirando una tarjeta, poné en "monto" el saldo que debés y en "cuota" lo que pensás pagar cada mes.',
  fields: [
    {
      id: 'monto',
      label: 'Monto del crédito o saldo de la tarjeta (COP)',
      prefix: '$',
      value: '12.000.000',
      thousands: true,
      help: 'El capital que te prestan, o lo que debés hoy en la tarjeta.',
    },
    {
      id: 'tasa',
      label: 'Tasa efectiva anual (% EA)',
      suffix: '% EA',
      type: 'number',
      value: 22,
      min: 0,
      max: 200,
      step: 0.01,
      help: `Si te la dieron mensual, multiplicala así: (1+mensual)^12−1. El techo legal es la usura, hoy ${pct(USURA_EA_PCT)} EA.`,
    },
    {
      id: 'plazo',
      label: 'Plazo en meses',
      type: 'number',
      value: 48,
      min: 1,
      max: 360,
      step: 1,
      help: 'En tarjeta, dejá el plazo máximo que estarías dispuesto a tolerar: la cuenta te dice si el pago elegido alcanza.',
    },
    {
      id: 'seguro',
      label: 'Seguro mensual (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Seguro de vida deudor, todo riesgo del vehículo o cuota de manejo de la tarjeta. Va por fuera de la tasa y encarece la cuota real.',
    },
    {
      id: 'comision',
      label: 'Comisión o estudio de crédito al desembolso (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Comisión del fondo de garantías, estudio de crédito o aportes que te exigen de entrada. Se paga una vez pero es costo del crédito.',
    },
    {
      id: 'pago',
      label: 'Si es tarjeta: cuánto pensás pagar por mes (COP)',
      prefix: '$',
      value: '0',
      thousands: true,
      help: 'Dejalo en 0 para que la cuenta use la cuota del crédito. Poné un valor para simular pagos fijos en tarjeta y ver cuánto tardás.',
    },
    {
      id: 'ingreso',
      label: 'Tu ingreso mensual neto (COP)',
      prefix: '$',
      value: '4.000.000',
      thousands: true,
      help: 'Sirve para ver cuánto de tu sueldo se va en la cuota, y para el tope legal del 50% en libranza.',
    },
  ],
  fineprint: DISCLAIMER_TAX,

  chart: {
    type: 'stacked',
    title: 'De todo lo que vas a pagar, cuánto es realmente tuyo',
    caption:
      'La barra es el total que vas a desembolsar hasta cancelar el crédito, partida en tres: el capital que efectivamente te prestaron, los intereses que le pagás a la entidad, y los seguros y comisiones que van por fuera de la tasa. Mientras más grande la parte oscura, peor el negocio.',
  },
  breakdownTitle: 'Tu cuota, desarmada',
  breakdownIntro:
    'Primero la conversión de efectiva anual a mensual, después la cuota del sistema francés, después lo que sumás por fuera de la tasa, y al final el costo total y la comparación contra el techo legal.',

  faq: [
    {
      q: '¿Cómo se pasa de tasa efectiva anual a mensual?',
      a: 'Con la fórmula (1 + EA)^(1/12) − 1, no dividiendo entre doce. La diferencia no es menor: una tasa del 24% EA equivale a 1,809% mensual, no al 2% que da la división. Al revés, una tasa del 2% mensual es 26,82% EA, no 24%. Dividir por doce subestima la cuota y el costo total del crédito, y es el error más común en simuladores caseros. La razón es que el interés se capitaliza: cada mes los intereses se calculan sobre el saldo, que ya incluye lo generado antes.',
    },
    {
      q: '¿Cuál es la tasa de usura en Colombia y qué pasa si me cobran más?',
      a: `La tasa de usura es 1,5 veces el interés bancario corriente que certifica la Superintendencia Financiera. Con el interés bancario corriente de consumo y ordinario en ${pct(IBC_CONSUMO_EA_PCT)} EA (${IBC_RESOLUCION}), el techo queda en ${pct(USURA_EA_PCT)} EA. Cobrar por encima es el delito de usura del art. 305 del Código Penal, además de dar lugar a la pérdida de los intereses cobrados en exceso. Importante: la certificación se actualiza MENSUALMENTE, así que verificá el valor vigente el mes en que firmás, no el de una tabla vieja.`,
    },
    {
      q: '¿Por qué el pago mínimo de la tarjeta es una trampa?',
      a: 'Porque se calcula como un porcentaje del saldo, y ese porcentaje suele estar apenas por encima del interés del mes. Resultado: casi todo lo que pagás se va en intereses y el capital baja muy poco. Además, como el mínimo se recalcula sobre un saldo que baja lentísimo, la cuota también baja, y el plazo se estira durante años. En muchos casos terminás pagando más del doble de lo que compraste. La cuenta de este hub te muestra exactamente cuántos meses tardás y cuánto pagás de más si elegís esa ruta.',
    },
    {
      q: '¿Cuánto es el interés de mora máximo que me pueden cobrar?',
      a: `El interés moratorio no puede superar la tasa de usura vigente, es decir el mismo tope de ${pct(USURA_EA_PCT)} EA. Y hay un detalle que muchos ignoran: la mora se liquida sobre las cuotas vencidas, no sobre todo el saldo del crédito, salvo que la entidad haya acelerado el plazo conforme al contrato. Si te están cobrando mora sobre el capital completo desde el primer día de atraso, vale la pena reclamar. En créditos de vivienda hay una regla propia, más protectora, por la Ley 546 de 1999.`,
    },
    {
      q: '¿Qué es el sistema francés de amortización?',
      a: 'Es el sistema de cuota fija que usan casi todos los créditos de consumo en Colombia. La cuota no cambia durante todo el plazo, pero su composición sí: al principio casi todo es interés y muy poco capital, y hacia el final se invierte. Por eso, si cancelás anticipadamente en los primeros años, el saldo baja mucho menos de lo que esperabas por la cantidad de cuotas que ya pagaste. Es también la razón por la que estirar el plazo baja la cuota pero dispara el interés total.',
    },
    {
      q: '¿Por qué la cuota que me cobran es mayor que la que da la fórmula?',
      a: 'Casi siempre por lo que va fuera de la tasa. El seguro de vida deudor es obligatorio en la mayoría de los créditos de consumo y libranza; el todo riesgo lo es en vehículo; la tarjeta suma cuota de manejo; y algunos préstamos de app cobran comisión del fondo de garantías. Ninguno de esos costos está dentro de la tasa de interés, pero todos salen de tu bolsillo el mismo día. Por eso este hub te pide cargarlos aparte: la cuota total es la que importa para tu presupuesto.',
    },
    {
      q: '¿Cuánto me pueden descontar por libranza?',
      a: `El descuento no puede dejarte con menos del ${LIBRANZA_TOPE_PCT}% de tu salario o pensión, una vez descontados los aportes obligatorios a salud y pensión y las demás deducciones de ley (Ley 1527 de 2012, art. 3, literal e). Ese es el tope legal, no una recomendación de prudencia: aun así, comprometer la mitad del ingreso en cuotas es financieramente frágil. Tené en cuenta además que la libranza no desaparece si cambiás de trabajo: se convierte en una obligación directa tuya.`,
    },
    {
      q: '¿Conviene un préstamo de cooperativa o uno de banco?',
      a: 'La cooperativa suele ganar en tasa, sobre todo si ya sos asociado con antigüedad, y es más flexible con historiales cortos. El costo escondido son los aportes sociales: plata que tenés que dejar inmovilizada y que no rinde mientras esté ahí. Para comparar de verdad, sumá esos aportes al costo del crédito y fijate en cuánto tiempo te los devuelven al cancelar. Si el crédito es chico o corto, los aportes pueden pesar más que la diferencia de tasa.',
    },
    {
      q: '¿Los préstamos de las apps son más caros?',
      a: `Por peso prestado, casi siempre sí. Un producto tipo Salvavidas al ${NEQUI.salvavidas.emPct}% mensual equivale a alrededor del ${pct((Math.pow(1 + NEQUI.salvavidas.emPct / 100, 12) - 1) * 100)} efectivo anual. Lo que estás pagando es la inmediatez y el hecho de que no te piden nada. Para una urgencia puntual puede tener sentido; como fuente habitual de financiación es carísimo. La señal de alarma es renovar el préstamo mes a mes para no incumplir: ahí el costo acumulado supera rápido al capital.`,
    },
    {
      q: '¿Leasing o crédito para comprar el carro?',
      a: 'Comparalos por el total pagado, nunca por la cuota. El leasing muestra una cuota más baja porque financia el precio menos el valor residual, pero ese residual lo pagás igual al final si querés quedarte con el vehículo. Si sumás cuotas más opción de compra, la ventaja suele achicarse mucho. La otra diferencia es la propiedad: en el crédito el carro es tuyo desde el día uno; en el leasing es de la entidad hasta que ejercés la opción. Para uso empresarial hay consideraciones tributarias adicionales que debe evaluar tu contador.',
    },
    {
      q: '¿Me conviene abonar a capital o estirar el plazo?',
      a: 'Abonar a capital siempre reduce los intereses futuros, porque los intereses se calculan sobre el saldo. Estirar el plazo hace exactamente lo contrario: baja la cuota mensual y aumenta bastante el interés total. Si abonás, pedí expresamente que el abono se aplique a capital y decidí si querés reducir plazo (ahorra más) o reducir cuota (alivia el mes a mes). Son dos efectos muy distintos y la entidad suele aplicar uno por defecto sin preguntarte.',
    },
    {
      q: '¿Qué pasa si me atraso una cuota?',
      a: 'Empiezan a correr intereses de mora sobre lo vencido, con el tope de la usura, y a partir de cierto atraso la entidad reporta a las centrales de riesgo. Ese reporte es lo más caro a largo plazo: te encarece o te bloquea todos los créditos futuros, no sólo este. Si ves que no vas a poder pagar, hablá con la entidad ANTES de caer en mora: reestructurar antes del incumplimiento casi siempre da mejores condiciones que negociar después de estar reportado.',
    },
  ],

  sources: [
    {
      name: 'Certificación del interés bancario corriente — consumo y ordinario',
      url: 'https://www.superfinanciera.gov.co/publicaciones/10829/tasas-de-interes-bancario-corriente-60961/',
      publisher: 'Superintendencia Financiera de Colombia',
      date: '2026',
    },
    {
      name: 'Código Penal, art. 305 — usura',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_0599_2000_pr011.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Código de Comercio, art. 884 — límite de los intereses',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_comercio_pr027.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Ley 1527 de 2012 — libranza o descuento directo de nómina',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/ley_1527_2012.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Código Civil, art. 1617 — interés legal civil',
      url: 'https://www.secretariasenado.gov.co/senado/basedoc/codigo_civil_pr050.html',
      publisher: 'Congreso de la República',
    },
    {
      name: 'Simulador y condiciones de préstamos Nequi',
      url: 'https://www.nequi.com.co/',
      publisher: 'Nequi',
      date: '2026-07-18',
    },
    {
      name: 'Consumidor financiero — derechos y reclamaciones',
      url: 'https://www.superfinanciera.gov.co/consumidor-financiero/',
      publisher: 'Superintendencia Financiera de Colombia',
    },
  ],

  replaces: [
    '/co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo',
    '/co/calculadora-deuda-mes-tarjeta-credito-colombia-pago-tope',
    '/co/calculadora-tasa-interes-mora-colombia-tarjeta-credito-2026',
    '/co/calculadora-credito-libranza-colombia-empleado-cuota-tasa',
    '/co/calculadora-cooperativas-prestamo-colombia-tasa-interes',
    '/co/calculadora-prestamo-nequi-colombia-cuota-salvavidas-bajo-monto',
    '/co/calculadora-credito-vehiculos-colombia-leasing-vs-credito',
  ],

  lastReviewed: '2026-07-28',
};
