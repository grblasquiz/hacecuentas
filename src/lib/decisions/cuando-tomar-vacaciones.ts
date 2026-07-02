/**
 * Sala de decisión — "¿Cuándo me conviene tomar vacaciones?"
 *
 * Patrón DESGLOSE (1 columna). El mismo viaje cuesta muy distinto en temporada
 * alta vs baja, y si tu ingreso es variable, irte de vacaciones también te hace
 * resignar facturación. Esta sala suma las dos cosas: el ahorro en el viaje por
 * elegir temporada baja, y el costo de oportunidad de los días que no trabajás,
 * para decirte cuánto ganás eligiendo bien la fecha.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const costoAlta = Math.max(0, num(inputs.costoViajeTemporadaAlta));
  const costoBaja = Math.max(0, num(inputs.costoViajeTemporadaBaja));
  const diasDisponibles = Math.max(0, Math.min(60, num(inputs.diasDisponibles)));
  const ingresoVariableMes = Math.max(0, num(inputs.ingresoVariableMensual));

  if (!costoAlta || !costoBaja) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuánto te sale el viaje en temporada alta y en temporada baja. Con eso calculamos cuánto ahorrás eligiendo bien la fecha, y cuánto te cuesta tu tiempo si tu ingreso es variable.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ahorro eligiendo temporada baja' },
      scenarios: [],
      nextActions: [
        'Cargá el **costo del viaje en temporada alta** y en **temporada baja**.',
        'Si tu ingreso es variable, sumá lo que **dejás de ganar por mes** mientras estás de vacaciones.',
      ],
    };
  }

  // Ahorro directo en el viaje por elegir temporada baja.
  const ahorroViaje = Math.max(0, costoAlta - costoBaja);
  const ahorroPct = costoAlta > 0 ? (ahorroViaje / costoAlta) * 100 : 0;

  // Costo de oportunidad: lo que dejás de facturar por los días que no trabajás.
  // Se prorratea el ingreso variable mensual por 22 días hábiles aprox.
  const ingresoDiario = ingresoVariableMes / 22;
  const costoOportunidad = ingresoDiario * diasDisponibles;

  // Beneficio neto de elegir temporada baja:
  //   ahorro del viaje (igual en ambas) + el costo de oportunidad pesa más en
  //   temporada alta solo si esos días son más productivos. Mantenemos el
  //   foco en el ahorro del viaje; el costo de oportunidad se informa aparte.
  const beneficioNetoBaja = ahorroViaje; // el ahorro tangible de elegir baja

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (ahorroPct >= 30) {
    status = 'b'; // conviene fuerte temporada baja
    tone = 'good';
    title = 'Temporada baja te ahorra mucho: planificá fuera de pico';
    badge = 'Baja gana';
  } else if (ahorroPct >= 12) {
    status = 'tie';
    tone = 'neutral';
    title = 'Hay ahorro en temporada baja, pero no es enorme';
    badge = 'Ahorro moderado';
  } else {
    status = 'a';
    tone = 'neutral';
    title = 'La diferencia es chica: elegí por agenda, no por precio';
    badge = 'Casi igual';
  }
  const detail = `Tomarte vacaciones en temporada baja te ahorra ${fmtMoney(ahorroViaje)} en el viaje (un ${ahorroPct.toFixed(0)}% menos que en temporada alta).${ingresoVariableMes > 0 ? ` Además, los ${diasDisponibles} días que no trabajás te cuestan ${fmtMoney(costoOportunidad)} de ingreso variable: conviene tomarlos cuando tu facturación baja.` : ''}`;

  const scenarios = [
    {
      label: 'Temporada alta',
      value: fmtMoney(costoAlta),
      detail: 'Lo que sale el viaje en pico (enero, julio, fines de semana largos).',
    },
    {
      label: 'Temporada baja',
      value: fmtMoney(costoBaja),
      detail: `El mismo viaje fuera de pico: ${fmtMoney(ahorroViaje)} más barato.`,
    },
    {
      label: 'Costo de tu tiempo',
      value: ingresoVariableMes > 0 ? fmtMoney(costoOportunidad) : 'Ingreso fijo',
      detail: ingresoVariableMes > 0
        ? `Lo que dejás de facturar en ${diasDisponibles} días de vacaciones.`
        : 'Con ingreso fijo no resignás facturación: el día que elijas no cambia tu sueldo.',
    },
  ];

  const breakdown = [
    { label: 'Costo en temporada alta', value: fmtMoney(costoAlta) },
    { label: 'Costo en temporada baja', value: fmtMoney(costoBaja) },
    { label: 'Ahorro eligiendo baja', value: fmtMoney(ahorroViaje), hint: `${ahorroPct.toFixed(0)}% menos` },
    { label: 'Días de vacaciones', value: diasDisponibles + ' días' },
    { label: 'Ingreso variable diario', value: ingresoVariableMes > 0 ? fmtMoney(ingresoDiario) : '—', hint: ingresoVariableMes > 0 ? 'Ingreso mensual / 22 días hábiles' : 'Tenés ingreso fijo' },
    { label: 'Costo de oportunidad del tiempo', value: ingresoVariableMes > 0 ? fmtMoney(costoOportunidad) : 'No aplica' },
  ];

  const nextActions = [
    `Elegí **temporada baja** y guardate los ${fmtMoney(ahorroViaje)} que ahorrás: es plata real por la misma experiencia.`,
    ingresoVariableMes > 0
      ? `Si tu ingreso es variable, tomate las vacaciones en tu **mes más flojo**: así el costo de oportunidad de ${fmtMoney(costoOportunidad)} pesa lo menos posible.`
      : 'Como tenés ingreso fijo, cobrás igual estés o no de vacaciones: optimizá solo por precio y clima.',
    'Reservá con **anticipación** y mirá los pasajes y el alojamiento en días de semana: suele haber otra rebaja además de la de temporada.',
    'Si trabajás en relación de dependencia, recordá que las vacaciones se **pagan** (sueldo + plus vacacional): no resignás ingreso, solo elegís cuándo descansar.',
  ];

  const notes = [
    'El ahorro se calcula como la diferencia entre el costo del viaje en temporada alta y en temporada baja, según los montos que cargues.',
    'El costo de oportunidad solo aplica si tu ingreso es variable (monotributo, freelance, comisiones): prorratea el ingreso mensual por 22 días hábiles. Con sueldo fijo no resignás facturación.',
    'Es una estimación orientativa de precios, no asesoramiento financiero. No contempla el valor del descanso ni la disponibilidad real de cada fecha.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(beneficioNetoBaja),
      label: 'Ahorro eligiendo temporada baja',
      sub: `${ahorroPct.toFixed(0)}% más barato que en temporada alta.${ingresoVariableMes > 0 ? ` Costo de oportunidad del tiempo: **${fmtMoney(costoOportunidad)}**.` : ''}`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-tomar-vacaciones',
  title: '¿Cuándo conviene tomar vacaciones? Temporada alta vs baja 2026',
  h1: '¿Cuándo me conviene tomar vacaciones?',
  description:
    'Compará cuánto te ahorrás tomando vacaciones en temporada baja vs alta, y cuánto te cuesta tu tiempo si tenés ingreso variable. Elegí la mejor fecha para tu bolsillo sin resignar el descanso.',
  intro:
    'El mismo viaje puede salir mucho más barato fuera de temporada, y si tu ingreso es variable, irte de vacaciones también te hace resignar facturación. Esta sala suma las dos cosas: el ahorro por elegir temporada baja y el costo de oportunidad de los días que no trabajás, para que elijas la fecha que mejor le cae a tu bolsillo.',
  icon: '🏖️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    costoViajeTemporadaAlta: 1400000,
    costoViajeTemporadaBaja: 900000,
    diasDisponibles: 14,
    ingresoVariableMensual: 1500000,
  },
  fields: [
    {
      id: 'costoViajeTemporadaAlta',
      label: 'Costo del viaje en temporada alta',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1400000',
      help: 'Pasajes + alojamiento + gastos en enero, julio o fin de semana largo.',
      group: 'El viaje',
      groupIcon: '✈️',
    },
    {
      id: 'costoViajeTemporadaBaja',
      label: 'Costo del viaje en temporada baja',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '900000',
      help: 'El mismo viaje fuera de pico (marzo, mayo, septiembre, noviembre).',
      group: 'El viaje',
    },
    {
      id: 'diasDisponibles',
      label: 'Días de vacaciones que vas a tomar',
      type: 'number',
      default: 14,
      min: 1,
      max: 60,
      placeholder: '14',
      help: 'Cuántos días te vas a tomar de descanso.',
      group: 'Tu tiempo',
      groupIcon: '🗓️',
    },
    {
      id: 'ingresoVariableMensual',
      label: 'Ingreso variable que dejás de ganar',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '1500000',
      help: 'Solo si tu ingreso es variable (freelance, comisiones): lo que facturás por mes. Dejalo en 0 si tenés sueldo fijo.',
      group: 'Tu tiempo',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-vacaciones-no-tomadas-indemnizacion-formula', label: 'Vacaciones no tomadas' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Elegir bien la fecha de las vacaciones tiene un impacto real en el bolsillo. Esta sala lo cuantifica.

1. **Ahorro por temporada.** Compara cuánto sale el mismo viaje en temporada alta y en temporada baja. La diferencia es plata que te ahorrás por la misma experiencia, eligiendo fuera de pico.
2. **Porcentaje de ahorro.** Muestra qué tan grande es ese ahorro en relación al costo de temporada alta, para que veas si vale la pena reacomodar las fechas.
3. **Costo de oportunidad del tiempo.** Si tu ingreso es variable, prorratea tu facturación mensual por día hábil y calcula lo que dejás de ganar en los días que no trabajás.
4. **Cuándo tomarlas.** Junta las dos cosas: conviene viajar en temporada baja y, si tu ingreso es variable, en tu mes más flojo, para que el costo de oportunidad pese lo menos posible.
5. **Sueldo fijo vs variable.** Si tenés relación de dependencia, las vacaciones se pagan: no resignás ingreso, solo elegís cuándo descansar y a qué precio.`,
  faq: [
    {
      q: '¿Cuánto se ahorra viajando en temporada baja?',
      a: 'Depende del destino, pero la diferencia entre pico y temporada baja suele ir del 20% al 40% en pasajes y alojamiento. Esta sala te muestra el ahorro exacto según los precios que cargues para tu viaje.',
    },
    {
      q: '¿Cuáles son las temporadas bajas en Argentina?',
      a: 'En general marzo, mayo, junio (salvo vacaciones de invierno), septiembre y noviembre. Enero, febrero, las vacaciones de invierno de julio y los fines de semana largos son los picos más caros.',
    },
    {
      q: '¿Qué es el costo de oportunidad de tomarse vacaciones?',
      a: 'Es lo que dejás de ganar mientras no trabajás. Solo aplica si tu ingreso es variable (freelance, comisiones, monotributo): cada día de vacaciones es un día que no facturás. Con sueldo fijo no existe ese costo, porque cobrás igual.',
    },
    {
      q: '¿Si tengo sueldo fijo, importa cuándo me tomo vacaciones?',
      a: 'Para tu ingreso no, porque las vacaciones se pagan: cobrás el sueldo más el plus vacacional estés donde estés. Lo que sí cambia es el precio del viaje, así que conviene igual elegir temporada baja para que te rinda más.',
    },
    {
      q: '¿Conviene tomarse las vacaciones en el mes más flojo?',
      a: 'Si tu ingreso es variable, sí: tomarlas cuando tu facturación naturalmente baja reduce el costo de oportunidad. Irte justo en tu mejor mes de ventas es lo más caro en términos de plata que dejás sobre la mesa.',
    },
    {
      q: '¿Cómo combino el ahorro del viaje con el costo de mi tiempo?',
      a: 'Buscá la fecha que sea temporada baja para el destino y, a la vez, temporada baja para tu actividad. Así maximizás el ahorro en el viaje y minimizás lo que dejás de facturar. Esta sala te muestra ambos números para decidir.',
    },
    {
      q: '¿Las vacaciones en relación de dependencia se pagan distinto?',
      a: 'Sí: por la LCT se cobran por adelantado y con un cálculo especial (sueldo dividido 25 por día de licencia), más alto que un día normal. No perdés ingreso por tomarlas; al contrario, conviene gozarlas y no acumularlas.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una estimación de precios orientativa para ayudarte a elegir fecha. No contempla la disponibilidad real ni el valor personal del descanso, que también pesa en la decisión.',
    },
  ],
  sources: [
    { name: 'Ley 20.744 (LCT) — Vacaciones (Arts. 150 a 157)', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-20744-25552' },
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
  ],
};
