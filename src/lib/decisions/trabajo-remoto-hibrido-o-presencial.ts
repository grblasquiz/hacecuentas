/**
 * Sala de decisión — "¿Me conviene remoto, híbrido o presencial?"
 *
 * Patrón COSTO OCULTO. Ir a la oficina tiene un costo real que casi nadie suma:
 * transporte, comida y, sobre todo, el tiempo de viaje (que vale plata si lo
 * valuás a tu valor hora). Trabajar remoto traslada otro costo: energía y
 * conectividad. Esta sala compara el costo mensual de cada modalidad y te dice
 * cuánto ahorrás (o gastás) yendo remoto frente a presencial.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

const W = 4.33; // semanas promedio por mes

function compute(inputs: Record<string, any>): DecisionResult {
  const diasOficina = Math.max(0, Math.min(7, num(inputs.diasOficina)));
  const transporteDia = Math.max(0, num(inputs.transporteDia));
  const comidaDia = Math.max(0, num(inputs.comidaDia));
  const minutosViajeDia = Math.max(0, num(inputs.minutosViajeDia));
  const valorHora = Math.max(0, num(inputs.valorHora));
  const energiaRemotoMes = Math.max(0, num(inputs.energiaConectividadRemotoMes));

  if (!transporteDia && !comidaDia && !minutosViajeDia) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuánto gastás por día en transporte y comida, y cuántos minutos te lleva el viaje. Con eso calculamos el costo real de ir a la oficina vs trabajar remoto.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ahorro mensual yendo remoto' },
      scenarios: [],
      nextActions: [
        'Cargá el **transporte y la comida por día** y los **minutos de viaje** (ida y vuelta).',
        'Si querés contar el tiempo, sumá tu **valor hora** para ver cuánto te cuesta el viaje en plata.',
      ],
    };
  }

  // Costo de un día de oficina = transporte + comida + tiempo de viaje valuado.
  const costoTiempoDia = (minutosViajeDia / 60) * valorHora;
  const costoDiaOficina = transporteDia + comidaDia + costoTiempoDia;

  // Costo mensual de cada modalidad.
  const costoPresencial = 5 * costoDiaOficina * W + energiaRemotoMes * 0; // 5 días, sin energía remota
  const costoHibrido = diasOficina * costoDiaOficina * W + energiaRemotoMes; // los días que vas + energía los días remoto
  const costoRemoto = energiaRemotoMes; // 0 días de oficina

  // Número decisivo: ahorro yendo 100% remoto frente a 100% presencial.
  const ahorroRemotoVsPresencial = costoPresencial - costoRemoto;

  // Costo en bolsillo (sin valuar tiempo) y costo en tiempo, para desglosar.
  const costoBolsilloPresencialMes = 5 * (transporteDia + comidaDia) * W;
  const costoTiempoPresencialMes = 5 * costoTiempoDia * W;
  const horasViajePresencialMes = (minutosViajeDia / 60) * 5 * W;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (ahorroRemotoVsPresencial >= 150000) {
    status = 'a'; // A aquí = remoto conviene fuerte
    tone = 'good';
    title = 'Remoto te ahorra mucho: el costo de la oficina es alto';
    badge = 'Remoto gana';
  } else if (ahorroRemotoVsPresencial >= 40000) {
    status = 'tie';
    tone = 'neutral';
    title = 'Remoto ahorra, pero el híbrido es un buen punto medio';
    badge = 'Híbrido razonable';
  } else {
    status = 'b';
    tone = 'neutral';
    title = 'El costo de ir es bajo: decidí por preferencia, no por plata';
    badge = 'Da casi igual';
  }
  const detail = `Ir 5 días a la oficina te cuesta ${fmtMoney(costoPresencial)} por mes (${fmtMoney(costoBolsilloPresencialMes)} de bolsillo${valorHora > 0 ? ` + ${fmtMoney(costoTiempoPresencialMes)} de tiempo de viaje` : ''}). Trabajar 100% remoto cuesta ${fmtMoney(costoRemoto)} en energía y conectividad. La diferencia a tu favor yendo remoto es de ${fmtMoney(ahorroRemotoVsPresencial)} por mes.`;

  const scenarios = [
    {
      label: 'Remoto (0 días)',
      value: fmtMoney(costoRemoto) + '/mes',
      detail: 'Solo energía y conectividad en casa. Sin transporte, comida ni viaje.',
    },
    {
      label: `Híbrido (${diasOficina} días)`,
      value: fmtMoney(costoHibrido) + '/mes',
      detail: `Transporte, comida y tiempo los ${diasOficina} días que vas, más la energía los días en casa.`,
    },
    {
      label: 'Presencial (5 días)',
      value: fmtMoney(costoPresencial) + '/mes',
      detail: 'El costo completo de ir todos los días a la oficina.',
    },
  ];

  const breakdown = [
    { label: 'Transporte y comida (5 días/sem)', value: fmtMoney(costoBolsilloPresencialMes) + '/mes', hint: `${fmtMoney(transporteDia + comidaDia)}/día × 5 días` },
    { label: 'Tiempo de viaje valuado', value: valorHora > 0 ? fmtMoney(costoTiempoPresencialMes) + '/mes' : 'Sin valuar', hint: `${horasViajePresencialMes.toFixed(0)} hs/mes en el transporte` },
    { label: 'Costo presencial total', value: fmtMoney(costoPresencial) + '/mes' },
    { label: `Costo híbrido (${diasOficina} días)`, value: fmtMoney(costoHibrido) + '/mes' },
    { label: 'Costo remoto (energía + internet)', value: fmtMoney(costoRemoto) + '/mes' },
    { label: 'Ahorro remoto vs presencial', value: fmtMoney(ahorroRemotoVsPresencial) + '/mes', hint: `≈ ${fmtMoney(ahorroRemotoVsPresencial * 12)} al año` },
  ];

  const nextActions = [
    `Trabajar remoto te ahorra **${fmtMoney(ahorroRemotoVsPresencial)} por mes** (${fmtMoney(ahorroRemotoVsPresencial * 12)} al año). Tenelo en cuenta al evaluar ofertas: una remota que pague algo menos puede dejarte más en el bolsillo.`,
    valorHora > 0
      ? `Recuperás **${horasViajePresencialMes.toFixed(0)} horas por mes** que hoy se van en el transporte. Pensá qué harías con ese tiempo (descanso, otro ingreso, familia).`
      : 'Cargá tu **valor hora** para ver cuánto te cuesta en plata el tiempo de viaje, no solo el pasaje.',
    'Si negociás híbrido, recordá que **cada día menos en la oficina** te ahorra transporte, comida y tiempo: es parte de tu compensación real.',
    'Si trabajás remoto, pedí que la empresa cubra **conectividad y un plus por gastos** de home office: la ley de teletrabajo lo contempla.',
  ];

  const notes = [
    'El costo mensual prorratea los días de oficina por 4,33 semanas. El tiempo de viaje se valoriza a tu valor hora solo si lo cargás (si no, queda como costo de bolsillo nada más).',
    'El costo remoto considera energía y conectividad; no incluye el valor de tener una habitación dedicada ni el desgaste de equipos.',
    'Es una estimación orientativa de costos, no asesoramiento. No contempla el impacto en tu carrera, tu salud o tu vida social de cada modalidad.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(ahorroRemotoVsPresencial) + '/mes',
      label: 'Ahorro mensual yendo remoto',
      sub: `Presencial cuesta **${fmtMoney(costoPresencial)}/mes** vs remoto **${fmtMoney(costoRemoto)}/mes**. ≈ ${fmtMoney(ahorroRemotoVsPresencial * 12)} al año.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'trabajo-remoto-hibrido-o-presencial',
  title: '¿Remoto, híbrido o presencial? Cuánto te cuesta ir a la oficina 2026',
  h1: '¿Me conviene remoto, híbrido o presencial?',
  description:
    'Calculá cuánto te cuesta de verdad ir a la oficina: transporte, comida y tiempo de viaje, frente al costo de trabajar remoto. Compará las tres modalidades y descubrí cuánto ahorrás por mes y por año trabajando desde casa.',
  intro:
    'Ir a la oficina tiene un costo que casi nadie suma: además del transporte y la comida, está el tiempo de viaje, que vale plata. Esta sala compara remoto, híbrido y presencial poniendo todos esos costos en pesos por mes, y te dice cuánto ahorrás trabajando desde casa. Útil para negociar modalidad o evaluar una oferta remota.',
  icon: '🏠',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    diasOficina: 2,
    transporteDia: 4000,
    comidaDia: 8000,
    minutosViajeDia: 120,
    valorHora: 9000,
    energiaConectividadRemotoMes: 25000,
  },
  fields: [
    {
      id: 'diasOficina',
      label: 'Días de oficina por semana (híbrido)',
      type: 'number',
      required: true,
      min: 0,
      max: 7,
      default: 2,
      placeholder: '2',
      help: 'Para el escenario híbrido: cuántos días irías a la oficina por semana.',
      group: 'Tu modalidad',
      groupIcon: '🗓️',
    },
    {
      id: 'transporteDia',
      label: 'Transporte por día',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '4000',
      help: 'Ida y vuelta a la oficina: colectivo, subte, nafta, peajes, estacionamiento.',
      group: 'Costo de ir',
      groupIcon: '🚇',
    },
    {
      id: 'comidaDia',
      label: 'Comida por día',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '8000',
      help: 'Lo que gastás en almuerzo y café los días que vas a la oficina.',
      group: 'Costo de ir',
    },
    {
      id: 'minutosViajeDia',
      label: 'Tiempo de viaje por día (min)',
      type: 'number',
      suffix: 'min',
      required: true,
      min: 0,
      placeholder: '120',
      help: 'Ida y vuelta. Es el tiempo que recuperás trabajando remoto.',
      group: 'Costo de ir',
    },
    {
      id: 'valorHora',
      label: 'Valor de tu hora',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      recommended: true,
      placeholder: '9000',
      help: 'Opcional. Para valorizar el tiempo de viaje en pesos. Lo podés sacar de la sala "¿Cuánto vale mi hora?".',
      group: 'Costo de ir',
    },
    {
      id: 'energiaConectividadRemotoMes',
      label: 'Energía y conectividad remoto ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '25000',
      help: 'Lo extra que gastás trabajando en casa: luz, internet, gas en invierno.',
      group: 'Costo de quedarte',
      groupIcon: '🏠',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-combustible-viaje-auto', label: 'Combustible de un viaje en auto' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Esta sala pone en pesos el costo real de cada modalidad de trabajo.

1. **Costo de un día de oficina.** Suma el transporte, la comida y —si lo cargás— el tiempo de viaje valuado a tu valor hora. Ir a la oficina no es solo el pasaje.
2. **Costo presencial.** Multiplica el costo diario por 5 días y lo prorratea por 4,33 semanas. Es lo que te cuesta ir todos los días.
3. **Costo híbrido.** Hace lo mismo con los días que realmente irías, y suma la energía y conectividad de los días que trabajás en casa.
4. **Costo remoto.** Solo la energía y conectividad: sin transporte, sin comida afuera, sin viaje.
5. **Ahorro yendo remoto.** Compara el presencial completo contra el remoto puro y te muestra cuánto ahorrás por mes y por año, más las horas de viaje que recuperás.`,
  faq: [
    {
      q: '¿Cuánto cuesta realmente ir a la oficina?',
      a: 'Más que el pasaje. Hay que sumar el transporte ida y vuelta, la comida afuera y el tiempo de viaje (que vale plata si lo valuás a tu valor hora). Esta sala junta todo y lo expresa como un costo mensual, que suele sorprender.',
    },
    {
      q: '¿Por qué cuenta el tiempo de viaje como un costo?',
      a: 'Porque es tiempo de tu vida que no podés usar para descansar, ganar plata o estar con tu familia. Si valuás ese tiempo a tu valor hora, el viaje diario puede costar tanto o más que el transporte y la comida juntos.',
    },
    {
      q: '¿Conviene siempre el trabajo remoto?',
      a: 'En plata casi siempre ahorra, sobre todo si vivís lejos o gastás mucho en comida. Pero hay factores no monetarios (carrera, vínculos, foco) que pesan. Esta sala te da el número para que el resto de la decisión sea consciente, no a ciegas.',
    },
    {
      q: '¿Qué gastos suma el trabajo remoto?',
      a: 'Energía eléctrica, internet de mayor velocidad y, en invierno, calefacción durante toda la jornada. Suele ser bastante menos que el costo de ir a la oficina, pero conviene cargarlo para que la comparación sea honesta.',
    },
    {
      q: '¿La empresa tiene que pagarme la conectividad si trabajo remoto?',
      a: 'La ley de teletrabajo (Ley 27.555) prevé que el empleador compense los mayores gastos de conectividad y servicios derivados del trabajo a distancia. Conviene pactarlo por escrito al acordar la modalidad.',
    },
    {
      q: '¿Cómo uso esto para negociar una oferta remota?',
      a: 'Si una oferta remota paga algo menos pero te ahorra el costo de ir a la oficina, el ahorro mensual que calcula esta sala puede compensar esa diferencia. Es plata real que se suma a tu bolsillo, aunque no figure en el sueldo.',
    },
    {
      q: '¿El híbrido es buen punto medio?',
      a: 'Suele serlo: combina algo de presencialidad (vínculos, visibilidad) con buena parte del ahorro del remoto. Esta sala te muestra el costo exacto según cuántos días irías, para que elijas la cantidad de días que mejor te cierra.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una estimación de costos orientativa. No contempla el impacto de cada modalidad en tu carrera ni en tu salud. Tomalo como un insumo más para una decisión que también es personal.',
    },
  ],
  sources: [
    { name: 'Ley 27.555 — Régimen legal del teletrabajo', url: 'https://www.argentina.gob.ar/normativa/nacional/ley-27555-341093' },
    { name: 'INDEC — Gastos de los hogares', url: 'https://www.indec.gob.ar/' },
  ],
};
