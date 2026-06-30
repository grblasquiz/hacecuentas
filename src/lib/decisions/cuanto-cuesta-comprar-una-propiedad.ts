/**
 * Sala de decisión — "¿Cuánto cuesta realmente comprar una propiedad?"
 *
 * Patrón VIVIENDA / BREAKDOWN. El precio publicado no es lo que pagás: hay
 * comisión, escritura y sellos, informes, refacciones y mudanza. Esta sala suma
 * el EFECTIVO TOTAL que necesitás para entrar (anticipo + todos los gastos) y el
 * costo mensual posterior, para que sepas con cuánta plata real hay que llegar.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precioPublicado));
  const comisionPct = Math.max(0, num(inputs.comision));
  const escrituraPct = Math.max(0, num(inputs.escrituraSellos));
  const informes = Math.max(0, num(inputs.informes));
  const anticipo = Math.max(0, num(inputs.anticipo));
  const refacciones = Math.max(0, num(inputs.refacciones));
  const mudanza = Math.max(0, num(inputs.mudanza));
  const expensas = Math.max(0, num(inputs.expensas));

  if (!precio) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio publicado de la propiedad. Con eso estimamos comisión, escritura y todos los gastos que se suman al precio para darte el efectivo total que necesitás.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Efectivo total necesario' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio publicado** de la propiedad que querés comprar.',
        'Indicá tu **anticipo** y, si los conocés, ajustá los porcentajes de **comisión y escritura**.',
      ],
    };
  }

  const comision = precio * (comisionPct / 100);
  const escritura = precio * (escrituraPct / 100);

  // El "anticipo" es la parte del precio que ponés de tu bolsillo (el resto, si
  // hay crédito, lo pone el banco). Si no hay crédito, anticipo = precio.
  const anticipoReal = anticipo > 0 ? Math.min(anticipo, precio) : precio;

  const gastosOperacion = comision + escritura + informes;
  const gastosPostMudanza = refacciones + mudanza;
  const efectivoTotal = anticipoReal + gastosOperacion + gastosPostMudanza;

  // Los gastos "extra" sobre el precio (lo que la gente subestima).
  const sobrecosto = gastosOperacion + gastosPostMudanza;
  const sobrecostoPct = precio > 0 ? (sobrecosto / precio) * 100 : 0;

  const costoMensualPosterior = expensas; // posterior recurrente

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  // Semáforo según cuánto se dispara el efectivo sobre el anticipo.
  if (sobrecostoPct <= 9) {
    status = 'b';
    tone = 'good';
    title = 'Los gastos extra están dentro de lo esperable';
    badge = 'Gastos típicos';
  } else if (sobrecostoPct <= 14) {
    status = 'tie';
    tone = 'neutral';
    title = 'Ojo: los gastos extra son significativos';
    badge = 'Gastos altos';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Atención: los gastos extra disparan el efectivo';
    badge = 'Gastos muy altos';
  }
  detail = `Sobre el precio publicado de ${fmtMoney(precio)}, los gastos suman ${fmtMoney(sobrecosto)} (${fmtPct(sobrecostoPct)} extra). Para entrar necesitás ${fmtMoney(efectivoTotal)} en efectivo${anticipo > 0 ? ` (anticipo ${fmtMoney(anticipoReal)} + gastos)` : ' (precio completo + gastos)'}, más ${fmtMoney(costoMensualPosterior)}/mes de expensas después.`;

  const scenarios = [
    {
      label: 'Solo el anticipo',
      value: fmtMoney(anticipoReal),
      detail: anticipo > 0 ? 'La parte del precio que ponés de tu bolsillo.' : 'El precio completo (sin crédito).',
    },
    {
      label: 'Gastos de operación',
      value: fmtMoney(gastosOperacion),
      detail: 'Comisión + escritura/sellos + informes. No se financian: van en efectivo.',
    },
    {
      label: 'Efectivo total para entrar',
      value: fmtMoney(efectivoTotal),
      detail: 'Todo lo que necesitás líquido el día de la operación y la mudanza.',
    },
  ];

  const breakdown = [
    { label: anticipo > 0 ? 'Anticipo (tu parte del precio)' : 'Precio de compra', value: fmtMoney(anticipoReal) },
    { label: `Comisión inmobiliaria (${fmtPct(comisionPct)})`, value: fmtMoney(comision), hint: 'Honorarios de la inmobiliaria' },
    { label: `Escritura y sellos (${fmtPct(escrituraPct)})`, value: fmtMoney(escritura), hint: 'Escribano + impuesto de sellos' },
    { label: 'Informes y certificados', value: fmtMoney(informes), hint: 'Dominio, inhibiciones, planos' },
    { label: 'Refacciones / puesta a punto', value: fmtMoney(refacciones) },
    { label: 'Mudanza', value: fmtMoney(mudanza) },
    { label: 'Efectivo total necesario', value: fmtMoney(efectivoTotal), hint: `${fmtPct(sobrecostoPct)} de gastos sobre el precio` },
    { label: 'Costo mensual posterior (expensas)', value: fmtMoney(costoMensualPosterior) + '/mes' },
  ];

  const nextActions = [
    `Tené listos **${fmtMoney(efectivoTotal)}** en efectivo: el precio publicado es solo el ${(100 - sobrecostoPct).toFixed(0)}% de lo que vas a desembolsar para entrar.`,
    'Pedí presupuesto de **escribano** por adelantado: los honorarios y sellos varían por jurisdicción y por quién paga qué. No los des por sentado.',
    'Negociá la **comisión inmobiliaria** y confirmá su tope legal: es uno de los gastos más grandes y a veces es negociable.',
    refacciones > 0
      ? `Presupuestá las **refacciones** con margen (${fmtMoney(refacciones)} es solo una estimación): las obras casi siempre se pasan del presupuesto inicial.`
      : 'Si la propiedad necesita arreglos, presupuestalos antes de comprar: entrar y refaccionar después descapitaliza.',
  ];

  const notes = [
    'Los porcentajes de comisión (~3-4%) y escritura/sellos (~6-8%) son típicos pero varían por jurisdicción, monto y quién paga cada parte. Ajustalos a tu caso real.',
    'Si comprás con crédito, el "anticipo" es tu parte del precio; el banco aporta el resto, pero los gastos de operación los pagás igual en efectivo.',
    'No incluye seguros que pueda exigir el banco ni el costo financiero del crédito (eso se calcula aparte con la calculadora de cuota).',
    'No es asesoramiento financiero ni inmobiliario. Es una estimación orientativa: confirmá cada gasto con tu escribano e inmobiliaria.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(efectivoTotal),
      label: 'Efectivo total para entrar',
      sub: `Precio ${fmtMoney(precio)} + ${fmtMoney(sobrecosto)} de gastos (${fmtPct(sobrecostoPct)}). Después: ${fmtMoney(costoMensualPosterior)}/mes de expensas.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cuesta-comprar-una-propiedad',
  title: '¿Cuánto cuesta realmente comprar una propiedad? Gastos 2026',
  h1: '¿Cuánto cuesta realmente comprar una propiedad?',
  description:
    'El precio publicado no es lo que pagás. Sumá comisión, escritura, sellos, informes, refacciones y mudanza para saber el efectivo total que necesitás para entrar y el costo mensual posterior.',
  intro:
    'Ves una propiedad publicada y pensás que ese es el precio. Pero entre comisión inmobiliaria, escritura, sellos, informes, refacciones y mudanza, lo que de verdad necesitás en efectivo es bastante más. Esta sala suma todos los gastos sobre el precio para decirte cuánta plata real hay que tener el día de la operación, y cuánto te cuesta por mes después.',
  icon: '🧾',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioPublicado: 120000000,
    comision: 3.5,
    escrituraSellos: 6,
    informes: 600000,
    anticipo: 120000000,
    refacciones: 5000000,
    mudanza: 400000,
    expensas: 90000,
  },
  fields: [
    {
      id: 'precioPublicado',
      label: 'Precio publicado',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '120000000',
      help: 'El precio de venta que figura en la publicación.',
      group: 'La operación',
      groupIcon: '🏠',
    },
    {
      id: 'anticipo',
      label: 'Tu aporte (anticipo o precio completo)',
      type: 'number',
      prefix: '$',
      min: 0,
      default: 0,
      placeholder: '120000000',
      profileKey: 'finanzas.ahorros',
      help: 'Si comprás de contado, poné el precio completo. Si hay crédito, poné solo tu anticipo.',
      group: 'La operación',
    },
    {
      id: 'comision',
      label: 'Comisión inmobiliaria',
      type: 'number',
      suffix: '%',
      default: 3.5,
      min: 0,
      placeholder: '3.5',
      help: 'Honorarios de la inmobiliaria. Suele ser 3-4% para el comprador.',
      group: 'Gastos de compra',
      groupIcon: '🧾',
    },
    {
      id: 'escrituraSellos',
      label: 'Escritura y sellos',
      type: 'number',
      suffix: '%',
      default: 6,
      min: 0,
      placeholder: '6',
      help: 'Honorarios del escribano + impuesto de sellos. Ronda 5-8% según jurisdicción.',
      group: 'Gastos de compra',
    },
    {
      id: 'informes',
      label: 'Informes y certificados',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '600000',
      help: 'Informe de dominio, inhibiciones, planos, certificados.',
      group: 'Gastos de compra',
    },
    {
      id: 'refacciones',
      label: 'Refacciones / puesta a punto',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '5000000',
      help: 'Lo que vas a gastar para dejar la propiedad habitable o a tu gusto.',
      group: 'Después de comprar',
      groupIcon: '🔨',
    },
    {
      id: 'mudanza',
      label: 'Mudanza',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '400000',
      help: 'Flete y traslado de tus cosas.',
      group: 'Después de comprar',
    },
    {
      id: 'expensas',
      label: 'Expensas mensuales',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'El costo fijo mensual posterior a la compra.',
      group: 'Después de comprar',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-costo-total-comprar-propiedad-gastos', label: 'Costo total de comprar' },
    { slug: 'calculadora-honorarios-escribano-pba-escritura', label: 'Honorarios de escribano' },
    { slug: 'arba-sellos-inmobiliarios-pba-compraventa', label: 'Sellos inmobiliarios (PBA)' },
    { slug: 'calculadora-comision-inmobiliaria-venta-inmueble-4-porciento', label: 'Comisión inmobiliaria' },
  ],
  howItWorks: `Esta sala desarma el precio publicado en el efectivo real que necesitás para entrar.

1. **Tu aporte.** Si comprás de contado, es el precio completo; si hay crédito, es tu anticipo (el banco aporta el resto).
2. **Gastos de operación.** Calcula la comisión inmobiliaria y la escritura/sellos como porcentaje del precio, y suma los informes y certificados. Estos gastos NO se financian: van en efectivo el día de la escritura.
3. **Gastos posteriores.** Suma las refacciones para dejar la propiedad a punto y el costo de la mudanza.
4. **Efectivo total.** Junta tu aporte más todos los gastos: ese es el dinero líquido que necesitás tener. Casi siempre es entre 9% y 15% más que el precio publicado.
5. **Costo mensual posterior.** Muestra las expensas, que son el gasto fijo que arranca apenas te mudás.`,
  faq: [
    {
      q: '¿Qué gastos se suman al precio de una propiedad?',
      a: 'Comisión inmobiliaria (3-4%), escritura y sellos (5-8% entre honorarios del escribano e impuesto de sellos), informes y certificados, refacciones para dejarla a punto y la mudanza. En total, suelen sumar entre el 9% y el 15% sobre el precio publicado.',
    },
    {
      q: '¿Cuánto cuesta la escritura?',
      a: 'Entre honorarios del escribano e impuesto de sellos, ronda el 5-8% del valor de la operación, según la jurisdicción y quién paga cada parte. Pedí un presupuesto al escribano por adelantado para tener el número exacto.',
    },
    {
      q: '¿La comisión inmobiliaria la paga el comprador?',
      a: 'En general el comprador paga una comisión de alrededor del 3-4%, aunque puede variar y tener topes legales según la normativa local. Confirmá el porcentaje y a quién corresponde antes de firmar la reserva.',
    },
    {
      q: '¿Los gastos de compra se financian con el crédito?',
      a: 'No. El crédito hipotecario financia una parte del precio, pero los gastos de operación (comisión, escritura, sellos, informes) los pagás en efectivo el día de la escritura. Por eso necesitás más plata líquida de la que parece.',
    },
    {
      q: '¿Cuánto efectivo necesito para comprar?',
      a: 'Tu aporte (anticipo o precio completo) más todos los gastos de operación y posteriores. Esta sala lo calcula: típicamente es entre 9% y 15% por encima del precio publicado solo en gastos, sin contar el anticipo.',
    },
    {
      q: '¿Conviene comprar para refaccionar?',
      a: 'Puede convenir si el descuento por el estado supera el costo de la obra. Pero presupuestá las refacciones con margen: casi siempre se pasan del estimado inicial. Cargá un número realista para ver el efectivo total.',
    },
    {
      q: '¿Qué costos tengo después de comprar?',
      a: 'Las expensas (si es un edificio o barrio cerrado), los impuestos inmobiliarios y los servicios. Esta sala muestra las expensas como costo mensual posterior; sumá impuestos y servicios para tu presupuesto completo.',
    },
    {
      q: '¿Esto reemplaza el consejo de un escribano?',
      a: 'No. Es una estimación orientativa para que sepas con cuánta plata llegar, no asesoramiento financiero ni inmobiliario. Confirmá cada gasto con tu escribano e inmobiliaria antes de la operación.',
    },
  ],
  sources: [
    { name: 'Colegio de Escribanos — Aranceles', url: 'https://www.colegio-escribanos.org.ar/' },
    { name: 'ARBA — Impuesto de sellos', url: 'https://www.arba.gov.ar/' },
  ],
};
