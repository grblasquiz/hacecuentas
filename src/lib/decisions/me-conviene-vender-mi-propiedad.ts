/**
 * Sala de decisión — "¿Me conviene vender mi propiedad ahora?"
 *
 * Patrón VIVIENDA / BREAKDOWN. El precio de venta no es lo que te queda: hay
 * comisión, impuestos, deuda pendiente y mudanza. Esta sala calcula el PRECIO
 * NETO que te queda en la mano y cuánto rendiría ese capital invertido, para que
 * compares contra lo que la propiedad te da hoy (alquiler/uso) y decidas.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precioVenta = Math.max(0, num(inputs.precioVenta));
  const comisionPct = Math.max(0, num(inputs.comision));
  const impuestosPct = Math.max(0, num(inputs.impuestos));
  const deudaPendiente = Math.max(0, num(inputs.deudaPendiente));
  const costoMudanza = Math.max(0, num(inputs.costoMudanza));
  const rendimientoTNA = Math.max(0, num(inputs.rendimientoCapitalTNA));

  if (!precioVenta) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de venta estimado. Con eso calculamos cuánto te queda neto después de comisión, impuestos, deuda y mudanza, y qué rinde ese capital.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Te queda neto' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio de venta** estimado de tu propiedad.',
        'Indicá la **comisión, impuestos y deuda pendiente** para ver cuánto te queda realmente en la mano.',
      ],
    };
  }

  const comision = precioVenta * (comisionPct / 100);
  const impuestos = precioVenta * (impuestosPct / 100);

  const gastosVenta = comision + impuestos;
  const precioNeto = Math.max(0, precioVenta - gastosVenta - deudaPendiente - costoMudanza);
  const gastoTotal = gastosVenta + deudaPendiente + costoMudanza;
  const gastoPct = precioVenta > 0 ? (gastoTotal / precioVenta) * 100 : 0;

  // Qué rinde ese capital neto invertido (anual y mensual).
  const rendimientoAnual = precioNeto * (rendimientoTNA / 100);
  const rendimientoMensual = rendimientoAnual / 12;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  // Semáforo según cuánto erosionan los gastos al precio.
  if (gastoPct <= 8) {
    status = 'b';
    tone = 'good';
    title = 'Vender deja un neto sano';
    badge = 'Neto sano';
  } else if (gastoPct <= 18) {
    status = 'tie';
    tone = 'neutral';
    title = 'Vender deja menos de lo que parece';
    badge = 'Gastos altos';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Atención: los gastos y la deuda se llevan mucho';
    badge = 'Neto bajo';
  }
  detail = `Del precio de venta de ${fmtMoney(precioVenta)}, te quedan ${fmtMoney(precioNeto)} en la mano después de ${fmtMoney(gastosVenta)} de comisión e impuestos${deudaPendiente > 0 ? `, ${fmtMoney(deudaPendiente)} de deuda` : ''} y la mudanza. Invertido al ${fmtPct(rendimientoTNA)}, ese capital rinde ${fmtMoney(rendimientoMensual)}/mes.`;

  const scenarios = [
    {
      label: 'Te queda neto',
      value: fmtMoney(precioNeto),
      detail: 'El capital líquido que te queda en la mano después de todos los gastos.',
    },
    {
      label: 'Rinde por mes',
      value: fmtMoney(rendimientoMensual),
      detail: `Lo que genera ese capital invertido al ${fmtPct(rendimientoTNA)} anual.`,
    },
    {
      label: 'Rinde por año',
      value: fmtMoney(rendimientoAnual),
      detail: 'Comparalo con lo que te da la propiedad hoy (alquiler o ahorro de alquiler).',
    },
  ];

  const breakdown = [
    { label: 'Precio de venta', value: fmtMoney(precioVenta) },
    { label: `− Comisión inmobiliaria (${fmtPct(comisionPct)})`, value: '-' + fmtMoney(comision).replace('-', '') },
    { label: `− Impuestos (${fmtPct(impuestosPct)})`, value: '-' + fmtMoney(impuestos).replace('-', ''), hint: 'ITI / Ganancias / sellos según el caso' },
    { label: '− Deuda pendiente (hipoteca)', value: '-' + fmtMoney(deudaPendiente).replace('-', '') },
    { label: '− Mudanza', value: '-' + fmtMoney(costoMudanza).replace('-', '') },
    { label: 'Te queda neto', value: fmtMoney(precioNeto), hint: `${fmtPct(gastoPct)} se va en gastos y deuda` },
    { label: 'Rendimiento si lo invertís (anual)', value: fmtMoney(rendimientoAnual), hint: `Al ${fmtPct(rendimientoTNA)} TNA` },
  ];

  const nextActions = [
    `Te quedan **${fmtMoney(precioNeto)}** netos: compará lo que ese capital rinde invertido (**${fmtMoney(rendimientoMensual)}/mes**) con lo que la propiedad te da hoy (alquiler que cobrás o que te ahorrás).`,
    'Confirmá qué **impuesto** te corresponde al vender: ITI o Impuesto a las Ganancias según cuándo compraste y si es tu única vivienda. Cambia bastante el neto.',
    deudaPendiente > 0
      ? `Tenés ${fmtMoney(deudaPendiente)} de deuda que se cancela con la venta: confirmá el saldo exacto y los costos de cancelación anticipada con tu banco.`
      : 'Si no tenés deuda, el neto es más limpio; igual reservá para impuestos, que se pagan al escriturar.',
    'No decidas solo por el número de hoy: pesá si el mercado está alto o bajo y si necesitás la liquidez ahora o podés esperar un mejor momento.',
  ];

  const notes = [
    'El neto descuenta comisión, impuestos, deuda pendiente y mudanza. Los impuestos dependen de tu caso (ITI 1,5% sobre el precio, o Ganancias si corresponde): ajustá el porcentaje.',
    'El rendimiento es una referencia de lo que daría el capital invertido a la TNA indicada; no garantiza ese retorno y no descuenta impuestos sobre la renta financiera.',
    'No considera la posible revalorización futura de la propiedad ni el costo de volver a comprar más adelante: vender y recomprar tiene costos en ambas puntas.',
    'No es asesoramiento financiero, impositivo ni inmobiliario. Es una estimación orientativa; consultá a un escribano y un contador matriculados antes de vender.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(precioNeto),
      label: 'Te queda neto en la mano',
      sub: `Precio ${fmtMoney(precioVenta)} − ${fmtMoney(gastoTotal)} (${fmtPct(gastoPct)}). Invertido rinde ${fmtMoney(rendimientoMensual)}/mes.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-vender-mi-propiedad',
  title: '¿Me conviene vender mi propiedad ahora? Neto real 2026',
  h1: '¿Me conviene vender mi propiedad ahora?',
  description:
    'Calculá cuánto te queda realmente al vender tu propiedad después de comisión, impuestos, deuda y mudanza, y cuánto rinde ese capital invertido. Para que decidas si vender ahora conviene.',
  intro:
    'El precio de venta de tu propiedad no es lo que te queda. Entre comisión inmobiliaria, impuestos, la deuda que tengas que cancelar y la mudanza, el neto es bastante menor. Esta sala calcula cuánto te queda en la mano después de todos los gastos y cuánto rendiría ese capital invertido, para que lo compares con lo que la propiedad te da hoy y decidas si conviene vender ahora.',
  icon: '🏷️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioVenta: 110000000,
    comision: 3,
    impuestos: 1.5,
    deudaPendiente: 0,
    costoMudanza: 500000,
    rendimientoCapitalTNA: 35,
  },
  fields: [
    {
      id: 'precioVenta',
      label: 'Precio de venta estimado',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '110000000',
      help: 'A cuánto pensás vender tu propiedad.',
      group: 'La venta',
      groupIcon: '🏷️',
    },
    {
      id: 'comision',
      label: 'Comisión inmobiliaria',
      type: 'number',
      suffix: '%',
      default: 3,
      min: 0,
      placeholder: '3',
      help: 'Honorarios de la inmobiliaria al vendedor (suele ser ~3%).',
      group: 'Gastos de venta',
      groupIcon: '🧾',
    },
    {
      id: 'impuestos',
      label: 'Impuestos sobre la venta',
      type: 'number',
      suffix: '%',
      default: 1.5,
      min: 0,
      placeholder: '1.5',
      help: 'ITI (1,5%) o Impuesto a las Ganancias según tu caso. Ajustá al que te corresponda.',
      group: 'Gastos de venta',
    },
    {
      id: 'deudaPendiente',
      label: 'Deuda pendiente (hipoteca)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '0',
      profileKey: 'finanzas.deudas',
      help: 'Saldo de hipoteca u otra deuda que se cancela con la venta.',
      group: 'Gastos de venta',
    },
    {
      id: 'costoMudanza',
      label: 'Costo de mudanza',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '500000',
      help: 'Lo que te cuesta mudarte una vez vendida.',
      group: 'Gastos de venta',
    },
    {
      id: 'rendimientoCapitalTNA',
      label: 'Rendimiento del capital (TNA)',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 35,
      min: 0,
      placeholder: '35',
      help: 'A qué TNA invertirías el neto (plazo fijo, money market, etc.) para comparar contra el uso de la propiedad.',
      group: 'Qué hacés con la plata',
      groupIcon: '💰',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-comision-inmobiliaria-venta-inmueble-4-porciento', label: 'Comisión inmobiliaria' },
    { slug: 'calculadora-rentabilidad-alquiler-cap-rate', label: 'Rentabilidad de alquiler' },
    { slug: 'plazo-fijo', label: 'Plazo fijo' },
    { slug: 'interes-compuesto', label: 'Interés compuesto' },
  ],
  howItWorks: `Esta sala traduce el precio de venta en el dinero que de verdad te queda y lo que rinde.

1. **Gastos de venta.** Calcula la comisión inmobiliaria y los impuestos como porcentaje del precio.
2. **Deuda y mudanza.** Resta el saldo de hipoteca u otra deuda que se cancela con la venta, más el costo de mudarte.
3. **Precio neto.** Lo que te queda líquido en la mano después de todo: ese es el número real de la operación, no el precio de venta.
4. **Rendimiento del capital.** Calcula cuánto generaría ese neto invertido a la TNA que indiques, por mes y por año.
5. **La comparación.** Poné ese rendimiento al lado de lo que la propiedad te da hoy (el alquiler que cobrás o el que te ahorrás viviendo ahí). Si el capital invertido rinde más, vender libera valor; si la propiedad rinde más, conviene conservarla.`,
  faq: [
    {
      q: '¿Cuánto me queda realmente al vender una propiedad?',
      a: 'El precio de venta menos la comisión inmobiliaria (~3%), los impuestos (ITI 1,5% o Ganancias según el caso), la deuda pendiente que se cancela y la mudanza. Entre todo, suele irse entre el 5% y el 18% del precio antes de descontar deuda.',
    },
    {
      q: '¿Qué impuesto pago al vender mi propiedad?',
      a: 'Depende de cuándo compraste y de si es tu única vivienda. Para inmuebles adquiridos antes de 2018 suele aplicar el ITI (1,5% sobre el precio); para los posteriores, el Impuesto a las Ganancias sobre la utilidad. La venta de la única vivienda para comprar otra puede estar exenta. Confirmalo con un contador.',
    },
    {
      q: '¿Conviene vender o alquilar mi propiedad?',
      a: 'Compará lo que rinde el capital neto invertido contra lo que te da la propiedad alquilada (el cap rate). Si invertir el neto rinde más que el alquiler, vender libera valor; si la propiedad rinde más y se revaloriza, conservarla puede ser mejor.',
    },
    {
      q: '¿Por qué comparar contra el rendimiento de invertir?',
      a: 'Porque la propiedad inmoviliza un capital grande. Vender lo convierte en plata líquida que puede rendir en otras inversiones. Si ese rendimiento supera lo que la propiedad te da (alquiler o uso), vender tiene sentido financiero.',
    },
    {
      q: '¿El cálculo incluye la revalorización futura?',
      a: 'No. Asume el precio de hoy. Si esperás que la propiedad se revalorice fuerte, eso juega a favor de conservarla; si el mercado está estancado o a la baja, vender ahora puede convenir. Es un factor a pesar aparte del número.',
    },
    {
      q: '¿Vender y recomprar más adelante tiene costos?',
      a: 'Sí, y altos: pagás comisión e impuestos al vender y de nuevo gastos de escrituración al comprar. Vender para recomprar pronto rara vez conviene por esos costos en ambas puntas.',
    },
    {
      q: '¿Cómo afecta tener una hipoteca pendiente?',
      a: 'El saldo de la hipoteca se cancela con la venta, así que reduce directamente lo que te queda neto. Confirmá el saldo exacto y si hay costos por cancelación anticipada con tu banco antes de cerrar la operación.',
    },
    {
      q: '¿Esto reemplaza el consejo de un profesional?',
      a: 'No. Es una estimación orientativa para decidir con números, no asesoramiento financiero, impositivo ni inmobiliario. Antes de vender, consultá a un escribano y un contador matriculados.',
    },
  ],
  sources: [
    { name: 'AFIP/ARCA — ITI e Impuesto a las Ganancias en inmuebles', url: 'https://www.arca.gob.ar/' },
    { name: 'BCRA — Tasas de referencia', url: 'https://www.bcra.gob.ar/' },
  ],
};
