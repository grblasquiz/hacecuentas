/**
 * Sala de decisión — "¿Cuánto puedo invertir en publicidad?"
 *
 * Patrón PRESUPUESTO + BREAKDOWN. Calcula el CAC máximo rentable (cuánto podés
 * pagar por captar un cliente sin perder plata) a partir del ticket, el margen,
 * el LTV (compras repetidas) y la tasa de conversión, y lo cruza con tu flujo de
 * caja disponible para recomendar un presupuesto seguro y un ROAS objetivo.
 * Math inline determinístico.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ticket = Math.max(0, num(inputs.ticketPromedio));
  const margenPct = Math.min(100, Math.max(0, num(inputs.margenPorVenta)));
  const conversionPct = Math.min(100, Math.max(0, num(inputs.tasaConversion)));
  const ltvMult = Math.max(1, num(inputs.comprasRepetidas) || 1);
  const flujoCaja = Math.max(0, num(inputs.flujoCajaDisponible));

  if (!ticket || !margenPct) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu ticket promedio y tu margen por venta para calcular cuánto podés pagar por captar un cliente y cuánto invertir en publicidad.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'CAC máximo rentable' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ticket promedio** y tu **margen por venta** (el % que te queda de cada venta).',
        'Sumá tus **compras repetidas** (LTV) y tu **flujo de caja disponible** para fijar el presupuesto.',
      ],
    };
  }

  // Margen por cliente a lo largo de su vida (LTV en margen).
  const margenPorVenta = ticket * (margenPct / 100);
  const ltvMargen = margenPorVenta * ltvMult;

  // CAC máximo: lo máximo que podés pagar por cliente sin perder. Regla sana:
  // gastar como mucho 1/3 del LTV-margen para que quede ganancia (relación LTV:CAC = 3).
  const cacMaximo = ltvMargen / 3;
  const cacBreakeven = ltvMargen; // por encima de esto, pérdida segura

  // Costo por click/visita derivado de la conversión: si convierte conversionPct,
  // necesitás 1/conversion visitas por cliente. El CAC máx / visitas = puja máx.
  const visitasPorCliente = conversionPct > 0 ? 100 / conversionPct : 0;
  const pujaMaxima = visitasPorCliente > 0 ? cacMaximo / visitasPorCliente : 0;

  // ROAS objetivo: ingresos / inversión. Con CAC máx, ROAS = ticket / CAC (primera compra).
  const roasObjetivo = cacMaximo > 0 ? ticket / cacMaximo : 0;
  const roasLTV = cacMaximo > 0 ? (ticket * ltvMult) / cacMaximo : 0;

  // Presupuesto seguro: limitado por el flujo de caja. Si no cargó flujo, recomienda
  // por CAC máximo × clientes que podría costear (queda como guía mensual).
  const presupuestoSeguro = flujoCaja; // tope mensual = lo que tu caja banca
  const clientesAlcanzables = cacMaximo > 0 && presupuestoSeguro > 0
    ? Math.floor(presupuestoSeguro / cacMaximo)
    : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (margenPorVenta <= 0) {
    status = 'a';
    tone = 'bad';
    title = 'Sin margen no podés invertir en publicidad';
    badge = 'Sin margen';
    detail = 'Si cada venta no deja margen, cualquier peso en publicidad es pérdida. Primero arreglá tu precio o tus costos.';
  } else if (flujoCaja > 0 && presupuestoSeguro < cacMaximo) {
    status = 'tie';
    tone = 'warn';
    title = 'Podés invertir poco: tu flujo es ajustado';
    badge = 'Presupuesto chico';
    detail = `Podés pagar hasta ${fmtMoney(cacMaximo)} por cliente, pero tu flujo de caja (${fmtMoney(flujoCaja)}) solo alcanza para captar ${clientesAlcanzables}. Empezá chico, medí y reinvertí lo que rinda.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu presupuesto de publicidad';
    badge = 'Presupuesto listo';
    detail = `Podés pagar hasta ${fmtMoney(cacMaximo)} por cliente captado y sostener una inversión de ${flujoCaja > 0 ? fmtMoney(presupuestoSeguro) : 'lo que te permita tu caja'} por mes. Apuntá a un ROAS de al menos ${roasObjetivo.toFixed(1).replace('.', ',')}× en la primera compra.`;
  }

  const scenarios = [
    {
      label: 'CAC break-even',
      value: fmtMoney(cacBreakeven),
      detail: 'Por encima de esto, captar un cliente te hace perder plata (todo el margen).',
    },
    {
      label: 'CAC máximo sano',
      value: fmtMoney(cacMaximo),
      detail: 'Lo máximo que conviene pagar por cliente (1/3 del LTV, deja ganancia).',
    },
    {
      label: 'Presupuesto mensual',
      value: flujoCaja > 0 ? fmtMoney(presupuestoSeguro) : '—',
      detail: flujoCaja > 0
        ? `Limitado por tu flujo de caja: ~${clientesAlcanzables} clientes/mes.`
        : 'Cargá tu flujo de caja disponible para fijar el tope mensual.',
    },
  ];

  const breakdown = [
    { label: 'Margen por venta', value: fmtMoney(margenPorVenta), hint: `${margenPct}% de ${fmtMoney(ticket)}` },
    { label: 'Compras repetidas (LTV)', value: `${ltvMult.toFixed(1).replace('.', ',')}×` },
    { label: 'LTV en margen', value: fmtMoney(ltvMargen), hint: 'margen por venta × compras repetidas' },
    { label: 'CAC máximo rentable', value: fmtMoney(cacMaximo), hint: '1/3 del LTV (relación 3:1)' },
    { label: 'Visitas por cliente', value: visitasPorCliente > 0 ? `${visitasPorCliente.toFixed(0)}` : '—', hint: conversionPct > 0 ? `conversión ${conversionPct}%` : 'cargá la conversión' },
    { label: 'Puja máxima por visita/click', value: pujaMaxima > 0 ? fmtMoney(pujaMaxima) : '—' },
    { label: 'ROAS objetivo (1ª compra)', value: roasObjetivo > 0 ? `${roasObjetivo.toFixed(1).replace('.', ',')}×` : '—' },
    { label: 'ROAS considerando LTV', value: roasLTV > 0 ? `${roasLTV.toFixed(1).replace('.', ',')}×` : '—' },
  ];

  const nextActions = [
    `No pagues más de **${fmtMoney(cacMaximo)} por cliente**: es tu CAC máximo sano. Si una campaña te cuesta más que eso por venta, pausala o mejorala.`,
    conversionPct > 0
      ? `Con tu conversión (${conversionPct}%), la puja máxima por click/visita es **${fmtMoney(pujaMaxima)}**. Configurala como tope en tus campañas (CPC/CPM máximo).`
      : 'Cargá tu tasa de conversión para saber cuánto podés pagar por click: sin eso, no sabés si una puja es rentable.',
    'Empezá con un **presupuesto de prueba chico**, medí el CAC real por canal y recién después escalá lo que rinda por debajo de tu CAC máximo. No escales lo que no medís.',
    ltvMult > 1
      ? `Tus clientes compran ${ltvMult.toFixed(1).replace('.', ',')}× en promedio: podés pagar más por captarlos porque el LTV lo justifica. Cuidá la recompra (retención) tanto como la captación.`
      : 'Si lográs que los clientes vuelvan a comprar (LTV > 1), podés pagar más por captarlos. La retención es la palanca más barata para subir tu CAC máximo.',
  ];

  const notes = [
    'El CAC máximo se calcula como un tercio del LTV en margen (relación LTV:CAC = 3:1, estándar sano para negocios). El break-even es el LTV completo: gastar eso no deja ganancia.',
    'La puja máxima por click/visita se deriva de tu tasa de conversión: visitas por cliente = 100 / conversión. Una conversión más alta te permite pujar más por visita.',
    'El presupuesto recomendado está limitado por tu flujo de caja: la publicidad rentable igual requiere bancar el desfasaje entre el gasto y el cobro de las ventas.',
    'No es asesoramiento financiero. El CAC y la conversión reales varían por canal, creatividad y temporada: estos números son un punto de partida para fijar topes, no una garantía de resultado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(cacMaximo),
      label: 'CAC máximo rentable',
      sub: `Lo máximo que conviene pagar por cliente. ${flujoCaja > 0 ? `Presupuesto seguro: **${fmtMoney(presupuestoSeguro)}**/mes (~${clientesAlcanzables} clientes).` : 'ROAS objetivo: **' + (roasObjetivo > 0 ? roasObjetivo.toFixed(1).replace('.', ',') + '×' : '—') + '**.'}`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-invertir-en-publicidad',
  title: '¿Cuánto invertir en publicidad? CAC máximo y presupuesto 2026',
  h1: '¿Cuánto puedo invertir en publicidad?',
  description:
    'Calculá cuánto podés pagar por captar un cliente (CAC máximo) según tu ticket, margen, LTV y conversión, y definí un presupuesto de publicidad seguro y un ROAS objetivo a partir de tu flujo de caja.',
  intro:
    'Invertir en publicidad sin saber tu CAC máximo es tirar plata o frenarte de más. Esta sala calcula cuánto podés pagar por captar un cliente sin perder (según tu ticket, margen y cuántas veces te compra), te da la puja máxima por click según tu conversión, y cruza todo con tu flujo de caja para recomendarte un presupuesto seguro y el ROAS objetivo que tenés que superar.',
  icon: '📣',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ticketPromedio: 80_000,
    margenPorVenta: 40,
    tasaConversion: 2,
    comprasRepetidas: 2.5,
    flujoCajaDisponible: 1_500_000,
  },
  fields: [
    {
      id: 'ticketPromedio',
      label: 'Ticket promedio',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '80000',
      help: 'Lo que gasta en promedio un cliente por compra.',
      group: 'Tu negocio',
      groupIcon: '🛍️',
    },
    {
      id: 'margenPorVenta',
      label: 'Margen por venta',
      type: 'number',
      suffix: '%',
      required: true,
      min: 0,
      max: 100,
      placeholder: '40',
      help: 'Qué porcentaje del ticket te queda como ganancia (tras costos variables).',
      group: 'Tu negocio',
    },
    {
      id: 'comprasRepetidas',
      label: 'Compras repetidas (LTV)',
      type: 'number',
      suffix: '×',
      default: 1,
      min: 1,
      placeholder: '2.5',
      help: 'Cuántas veces te compra un cliente a lo largo de su vida (1 = compra una sola vez).',
      group: 'Tu negocio',
    },
    {
      id: 'tasaConversion',
      label: 'Tasa de conversión',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 2,
      min: 0,
      max: 100,
      help: 'De cada 100 visitas/clicks, cuántas terminan en venta. Define la puja máxima por click.',
      group: 'Publicidad',
      groupIcon: '📣',
    },
    {
      id: 'flujoCajaDisponible',
      label: 'Flujo de caja disponible ($/mes)',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'finanzas.ahorros',
      help: 'Cuánto podés destinar por mes a publicidad sin afectar la operación.',
      group: 'Publicidad',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cac-ltv-costo-adquisicion-cliente', label: 'CAC y LTV' },
    { slug: 'calculadora-cpa-cac-ltv', label: 'CPA máximo rentable' },
    { slug: 'calculadora-roas-retorno-inversion-publicitaria', label: 'Break-even de campaña' },
    { slug: 'calculadora-cac-costo-adquisicion-sales-funnel', label: 'Payback del CAC' },
  ],
  howItWorks: `Esta sala parte de cuánto vale un cliente para vos y deriva cuánto podés gastar en captarlo.

1. **Valor del cliente (LTV en margen).** Multiplica el margen por venta por las compras repetidas. Es la ganancia total que te deja un cliente a lo largo de su vida, no solo en la primera compra.
2. **CAC máximo rentable.** Toma un tercio de ese LTV (relación LTV:CAC = 3:1, el estándar sano). Es lo máximo que conviene pagar por captar un cliente para que el negocio gane plata, no solo se pague la publicidad.
3. **Puja máxima por click.** Con tu tasa de conversión calcula cuántas visitas necesitás por cliente y divide el CAC máximo entre ellas: ese es el costo por click máximo que podés pagar.
4. **Presupuesto seguro.** Limita la inversión a tu flujo de caja disponible y muestra cuántos clientes podrías captar por mes a ese CAC.
5. **ROAS objetivo.** Calcula el retorno sobre la inversión publicitaria que tenés que superar, tanto en la primera compra como considerando el LTV.`,
  faq: [
    {
      q: '¿Qué es el CAC y por qué es el número clave?',
      a: 'El CAC (Costo de Adquisición de Cliente) es lo que te cuesta, en publicidad, conseguir un cliente nuevo. Es el número clave porque define si tu publicidad es rentable: si pagás más por captar un cliente de lo que ese cliente te deja de ganancia, perdés plata aunque vendas mucho.',
    },
    {
      q: '¿Por qué el CAC máximo es un tercio del LTV?',
      a: 'Por la relación LTV:CAC de 3:1, un estándar sano: por cada peso que gastás en captar, el cliente debería dejarte tres de ganancia a lo largo de su vida. Eso deja margen para cubrir costos operativos y ganar. Gastar hasta el LTV completo (relación 1:1) no deja ganancia: es el break-even.',
    },
    {
      q: '¿Qué es el LTV y cómo lo estimo?',
      a: 'El LTV (valor de vida del cliente) es la ganancia total que te deja un cliente mientras te compra. Lo estimás como el margen por venta multiplicado por cuántas veces te compra. Si tus clientes compran una sola vez, el LTV es el margen de esa compra; si vuelven, sube y podés pagar más por captarlos.',
    },
    {
      q: '¿Qué es el ROAS y qué valor debería buscar?',
      a: 'El ROAS (retorno sobre la inversión publicitaria) es cuántos pesos de venta generás por cada peso de publicidad. El mínimo depende de tu margen: si tu margen es 40%, necesitás un ROAS de al menos ~2,5× solo para no perder en la primera compra. Esta sala te calcula el objetivo según tus números.',
    },
    {
      q: '¿Cómo se relaciona la conversión con cuánto puedo pagar por click?',
      a: 'Cuanto mejor convertís, más podés pagar por visita. Si convertís el 2%, necesitás 50 visitas por cliente, así que tu CAC máximo se reparte entre esas 50: el costo por click máximo es bajo. Si subís la conversión al 4%, necesitás la mitad de visitas y podés pagar el doble por click.',
    },
    {
      q: '¿Por qué importa el flujo de caja si la publicidad es rentable?',
      a: 'Porque hay un desfasaje: pagás la publicidad hoy y cobrás las ventas (y el LTV) más adelante. Aunque cada cliente sea rentable, necesitás bancar ese período. Por eso el presupuesto seguro está limitado por tu flujo de caja disponible, no solo por el CAC máximo teórico.',
    },
    {
      q: '¿Por dónde empiezo si nunca hice publicidad paga?',
      a: 'Con un presupuesto de prueba chico, midiendo el CAC real por canal antes de escalar. No confíes en el CAC teórico: medilo en la realidad. Escalá solo los canales y campañas que te traigan clientes por debajo de tu CAC máximo, y reinvertí lo que rinde.',
    },
    {
      q: '¿Esto reemplaza a un especialista en marketing?',
      a: 'No. Te da los topes financieros (cuánto podés pagar por cliente y por click, qué ROAS buscar). La ejecución (segmentación, creatividades, optimización de campañas) requiere experiencia. Usá estos números como guardrails para que tu inversión no deje de ser rentable.',
    },
  ],
  sources: [
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
  ],
};
