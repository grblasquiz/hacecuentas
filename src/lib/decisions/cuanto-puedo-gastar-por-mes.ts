/**
 * Sala de decisión — "¿Cuánto puedo gastar por mes sin endeudarme?"
 *
 * Patrón PRESUPUESTO. Adapta la regla 50/30/20: del ingreso neto, separa las
 * obligaciones fijas y un ahorro objetivo, y devuelve cuánto te queda para gastos
 * variables (deseos) sin entrar en deuda. Breakdown en necesidades / deseos /
 * ahorro.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const obligaciones = Math.max(0, num(inputs.obligacionesFijas));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu ingreso neto mensual y tus obligaciones fijas. Te decimos cuánto podés gastar en lo variable cada mes sin endeudarte, separando un ahorro objetivo.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Gasto variable disponible por mes' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ingreso neto mensual** (lo que te queda en mano).',
        'Sumá tus **obligaciones fijas** (alquiler, servicios, cuotas) y fijá un **% de ahorro**.',
      ],
    };
  }

  const ahorro = ingreso * (ahorroObjetivoPct / 100);
  const gastableVariable = ingreso - obligaciones - ahorro;

  // Referencia 50/30/20.
  const ref50 = ingreso * 0.5; // necesidades
  const ref30 = ingreso * 0.3; // deseos
  const ref20 = ingreso * 0.2; // ahorro
  const pctObligaciones = (obligaciones / ingreso) * 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (gastableVariable < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Tus obligaciones ya superan lo que entra';
    badge = 'En rojo';
    detail = `Entre obligaciones fijas (${fmtMoney(obligaciones)}) y el ahorro objetivo (${fmtMoney(ahorro)}) te pasás de tu ingreso de ${fmtMoney(ingreso)}: te faltan ${fmtMoney(-gastableVariable)} antes de gastar un peso en lo variable. Necesitás recortar gastos fijos, bajar el ahorro objetivo o subir tus ingresos.`;
  } else if (pctObligaciones > 60) {
    status = 'tie';
    tone = 'warn';
    title = 'Podés gastar poco: tus fijos pesan demasiado';
    badge = 'Justo';
    detail = `Te quedan ${fmtMoney(gastableVariable)} por mes para gastos variables, pero tus obligaciones fijas se llevan el ${fmtPct(pctObligaciones, 0)} de tu ingreso (lo sano es hasta 50%). Tenés poco margen: cualquier imprevisto te empuja a la deuda.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tenés un margen sano para gastar';
    badge = 'Equilibrado';
    detail = `Después de cubrir obligaciones fijas (${fmtMoney(obligaciones)}) y apartar ${fmtMoney(ahorro)} de ahorro, podés gastar hasta ${fmtMoney(gastableVariable)} por mes en lo variable sin endeudarte. Si te mantenés en ese tope, no entrás en rojo.`;
  }

  const gastableDiario = gastableVariable > 0 ? gastableVariable / 30 : 0;
  const gastableSemanal = gastableVariable > 0 ? gastableVariable / 4.33 : 0;

  const scenarios = [
    { label: 'Por mes', value: fmtMoney(Math.max(0, gastableVariable)), detail: 'Tu tope de gasto variable mensual sin endeudarte.' },
    { label: 'Por semana', value: fmtMoney(gastableSemanal), detail: 'El mismo tope repartido por semana, más fácil de controlar.' },
    { label: 'Por día', value: fmtMoney(gastableDiario), detail: 'Lo que podés gastar por día en lo no esencial.' },
  ];

  const breakdown = [
    { label: 'Ingreso neto mensual', value: fmtMoney(ingreso) },
    { label: 'Necesidades / obligaciones fijas', value: fmtMoney(obligaciones), hint: `${fmtPct(pctObligaciones, 0)} de tu ingreso (ref. 50%: ${fmtMoney(ref50)})` },
    { label: 'Ahorro objetivo', value: fmtMoney(ahorro), hint: `${fmtPct(ahorroObjetivoPct, 0)} (ref. 20%: ${fmtMoney(ref20)})` },
    { label: 'Deseos / gasto variable disponible', value: fmtMoney(Math.max(0, gastableVariable)), hint: `ref. 30%: ${fmtMoney(ref30)}` },
  ];

  const nextActions = [
    gastableVariable < 0
      ? `Estás en rojo estructural: recortá obligaciones fijas o subí ingresos hasta que el gasto variable dé positivo. Antes de eso, **no sumes deuda nueva**.`
      : `Tu tope de gasto variable es **${fmtMoney(gastableVariable)}/mes** (${fmtMoney(gastableSemanal)}/semana). Anotá tus gastos no esenciales y frená al llegar al tope.`,
    pctObligaciones > 50
      ? `Tus gastos fijos se llevan el ${fmtPct(pctObligaciones, 0)} (lo sano es hasta 50%): revisá alquiler, suscripciones y cuotas, que son los que más mueven la aguja.`
      : 'Tus gastos fijos están en un nivel sano (≤50%): el desafío es no dejar que los gastos variables se desborden mes a mes.',
    ahorroObjetivoPct < 10 && gastableVariable > 0
      ? 'Estás ahorrando poco: si te sobra del gasto variable, subí el ahorro objetivo antes de gastarlo. El ahorro que no se aparta primero, no se ahorra.'
      : 'Apartá el ahorro **apenas cobrás**, no a fin de mes con lo que sobre: pagate a vos primero y gastá lo que queda.',
    'Usá la calculadora 50/30/20 para ordenar el detalle y detectar en qué categoría se te va el dinero de más.',
  ];

  const notes = [
    'Adapta la regla 50/30/20 (50% necesidades, 30% deseos, 20% ahorro) a tus números reales: el gasto variable disponible es tu ingreso menos las obligaciones fijas y el ahorro objetivo.',
    'Las "obligaciones fijas" deberían incluir alquiler, servicios, transporte esencial y cuotas de deuda. El gasto variable es lo discrecional (salidas, ropa, delivery, etc.).',
    'No es asesoramiento financiero. Es una guía de presupuesto orientativa; ajustá los porcentajes a tu realidad y prioridades.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.max(0, gastableVariable)) + '/mes',
      label: 'Podés gastar en lo variable sin endeudarte',
      sub: `≈ ${fmtMoney(gastableSemanal)} por semana, tras cubrir fijos (${fmtMoney(obligaciones)}) y ahorrar ${fmtMoney(ahorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-puedo-gastar-por-mes',
  title: '¿Cuánto puedo gastar por mes sin endeudarme? 2026',
  h1: '¿Cuánto puedo gastar por mes sin endeudarme?',
  description:
    'Calculá tu tope de gasto variable mensual con la regla 50/30/20 adaptada: de tu ingreso, restamos obligaciones fijas y ahorro objetivo. Te decimos cuánto podés gastar por mes, semana y día sin entrar en rojo.',
  intro:
    'Gastar sin un número en la cabeza es la forma más fácil de terminar en deuda. Esta sala adapta la regla 50/30/20 a tu situación: toma tu ingreso, descuenta tus obligaciones fijas y el ahorro que querés sostener, y te da un tope claro de cuánto podés gastar en lo variable cada mes, semana y día sin endeudarte.',
  icon: '🧮',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingresoNeto: 1300000,
    obligacionesFijas: 650000,
    ahorroObjetivo: 15,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', required: true, min: 0, placeholder: '1300000', profileKey: 'trabajo.sueldoNeto', help: 'Lo que te queda en mano por mes, sumando todos tus ingresos.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'obligacionesFijas', label: 'Obligaciones fijas mensuales', type: 'number', prefix: '$', required: true, min: 0, placeholder: '650000', profileKey: 'gastos.recurrentesMensual', help: 'Alquiler, servicios, transporte esencial, cuotas de deuda: lo que pagás sí o sí.', group: 'Tu plata' },
    { id: 'ahorroObjetivo', label: '% de ahorro que querés sostener', type: 'number', suffix: '%', default: 20, min: 0, max: 100, placeholder: '15', help: 'Qué porcentaje de tu ingreso querés guardar cada mes. La regla 50/30/20 sugiere 20%.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Presupuesto 50/30/20' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
  ],
  howItWorks: `Esta sala convierte la regla 50/30/20 en un tope concreto para vos.

1. **Tu ingreso real.** Parte de lo que te queda en mano por mes, sumando todas tus fuentes.
2. **Necesidades primero.** Resta tus obligaciones fijas: alquiler, servicios, transporte esencial y cuotas de deuda. La regla dice que no deberían superar el 50% de tu ingreso.
3. **Pagate a vos.** Aparta el ahorro objetivo que elijas (la regla sugiere 20%) antes de gastar nada más: el ahorro que no se separa primero, no se concreta.
4. **Lo que queda es para gastar.** El resto es tu gasto variable disponible: salidas, ropa, delivery, gustos. Ese es tu tope sin endeudarte.
5. **En porciones manejables.** Reparte ese tope por semana y por día para que sea fácil de controlar en el día a día, y enciende una alerta si tus fijos pesan demasiado.`,
  faq: [
    { q: '¿Qué es la regla 50/30/20?', a: 'Una guía de presupuesto que sugiere destinar el 50% del ingreso a necesidades, el 30% a deseos (gasto variable) y el 20% al ahorro. Esta sala la adapta a tus números reales en vez de imponer los porcentajes fijos.' },
    { q: '¿Qué cuenta como obligación fija?', a: 'Todo lo que pagás sí o sí cada mes: alquiler o expensas, servicios, transporte esencial, obra social y cuotas de deuda. No incluye gastos que podés controlar o recortar, como salidas, ropa o delivery: esos son gasto variable.' },
    { q: '¿Cuánto debería ahorrar?', a: 'La regla sugiere un 20% del ingreso, pero lo importante es sostenerlo. Si recién empezás, arrancá con un porcentaje que puedas cumplir (aunque sea 5-10%) y subilo a medida que ordenás tus gastos. El hábito importa más que el número inicial.' },
    { q: '¿Qué hago si mis gastos fijos superan el 50%?', a: 'Es la principal causa de quedar sin margen. Revisá los rubros grandes: el alquiler suele ser el más pesado, seguido por suscripciones y cuotas. Si no podés bajarlos, la salida es aumentar ingresos; mientras tanto, ajustá el ahorro y el gasto variable.' },
    { q: '¿Por qué conviene apartar el ahorro primero?', a: 'Porque si esperás a fin de mes para ahorrar "lo que sobre", casi nunca sobra. Apartar el ahorro apenas cobrás (pagarte a vos primero) lo vuelve una obligación más, y gastás tranquilo con lo que queda.' },
    { q: '¿El tope de gasto variable incluye comida?', a: 'Depende de cómo la clasifiques. La comida esencial del hogar suele ir en necesidades (obligaciones fijas); los gastos de comer afuera, delivery y antojos van en el variable. Cargá la comida básica dentro de tus obligaciones para que el tope sea realista.' },
    { q: '¿Sirve si mi ingreso es variable?', a: 'Sí, pero usá tu ingreso promedio de los últimos meses o el más bajo razonable, para no sobreestimar. Con ingresos variables conviene ser conservador con el gasto y guardar los meses buenos para los flojos.' },
    { q: '¿Esto reemplaza llevar un registro de gastos?', a: 'No: lo complementa. Esta sala te da el tope; el registro te dice si lo estás cumpliendo. Anotar tus gastos variables y compararlos con el tope es lo que realmente evita que te endeudes.' },
  ],
  sources: [
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
    { name: 'INDEC — Índice de Precios al Consumidor (IPC)', url: 'https://www.indec.gob.ar/' },
  ],
};
