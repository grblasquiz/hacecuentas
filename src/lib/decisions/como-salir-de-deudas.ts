/**
 * Sala de decisión — "¿Cómo salgo de mis deudas?"
 *
 * Patrón ESTRATEGIA. Tomás hasta 3 deudas (monto + tasa) y un pago extra mensual,
 * y simulás dos métodos clásicos de cancelación:
 *   - Avalancha: pagás primero la deuda de MAYOR tasa → minimiza intereses totales.
 *   - Bola de nieve: pagás primero la de MENOR monto → primeras victorias rápidas.
 * Devuelve cuántos meses tardás en librarte y cuánto ahorrás de intereses con
 * avalancha, más el orden de pago recomendado.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

interface Deuda {
  nombre: string;
  saldo: number;
  tasaMensual: number; // i mensual decimal (TNA/12/100)
}

/**
 * Simula la cancelación de un set de deudas con un pago disponible mensual fijo.
 * En cada mes capitaliza el interés de cada deuda, paga el mínimo (interés) y
 * vuelca todo el excedente a la deuda objetivo según el orden dado. Cuando una
 * deuda se cancela, su capacidad libera para la siguiente (efecto bola/avalancha).
 * Devuelve { meses, interesTotal }. Corta a 600 meses (50 años) por seguridad.
 */
function simular(deudas: Deuda[], pagoDisponible: number): { meses: number; interesTotal: number } {
  const ds = deudas.map((d) => ({ ...d }));
  let interesTotal = 0;
  let meses = 0;
  const MAX = 600;
  while (ds.some((d) => d.saldo > 0.5) && meses < MAX) {
    meses++;
    // 1) Capitalizar interés del mes en cada deuda viva.
    for (const d of ds) {
      if (d.saldo > 0.5) {
        const interes = d.saldo * d.tasaMensual;
        interesTotal += interes;
        d.saldo += interes;
      }
    }
    // 2) Aplicar el pago disponible en el orden dado (primera deuda viva primero).
    let pago = pagoDisponible;
    for (const d of ds) {
      if (pago <= 0) break;
      if (d.saldo > 0.5) {
        const aplica = Math.min(pago, d.saldo);
        d.saldo -= aplica;
        pago -= aplica;
      }
    }
    // Si el pago no cubre ni el interés, no se avanza nunca → cortar.
    if (pago === pagoDisponible) break;
  }
  return { meses, interesTotal };
}

const fmtMeses = (m: number) => {
  if (m <= 0) return '—';
  if (m >= 600) return 'más de 50 años';
  const a = Math.floor(m / 12);
  const r = m % 12;
  if (a === 0) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  if (r === 0) return `${a} ${a === 1 ? 'año' : 'años'}`;
  return `${a} ${a === 1 ? 'año' : 'años'} y ${r} ${r === 1 ? 'mes' : 'meses'}`;
};

function compute(inputs: Record<string, any>): DecisionResult {
  const raw: Deuda[] = [
    { nombre: 'Deuda 1', saldo: Math.max(0, num(inputs.deuda1Monto)), tasaMensual: Math.max(0, num(inputs.deuda1Tna)) / 12 / 100 },
    { nombre: 'Deuda 2', saldo: Math.max(0, num(inputs.deuda2Monto)), tasaMensual: Math.max(0, num(inputs.deuda2Tna)) / 12 / 100 },
    { nombre: 'Deuda 3', saldo: Math.max(0, num(inputs.deuda3Monto)), tasaMensual: Math.max(0, num(inputs.deuda3Tna)) / 12 / 100 },
  ];
  const deudas = raw.filter((d) => d.saldo > 0);
  const pagoExtra = Math.max(0, num(inputs.pagoExtraMensual));
  const ingreso = Math.max(0, num(inputs.ingresoMensual));
  const gastos = Math.max(0, num(inputs.gastosMensual));

  const saldoTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  // Pago disponible para deudas: el extra que indicás, o el sobrante ingreso-gastos.
  const sobrante = Math.max(0, ingreso - gastos);
  const pagoDisponible = pagoExtra > 0 ? pagoExtra : sobrante;

  if (deudas.length === 0 || pagoDisponible <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá al menos una deuda (monto y tasa TNA) y cuánto podés destinar por mes a pagarlas (un pago extra fijo o tu ingreso menos gastos). Con eso comparamos avalancha vs bola de nieve.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para librarte de las deudas' },
      scenarios: [],
      nextActions: [
        'Cargá el **monto y la tasa (TNA)** de cada deuda (tarjeta, préstamo, descubierto).',
        'Indicá cuánto podés poner por mes: un **pago extra fijo** o tu **ingreso menos gastos**.',
      ],
    };
  }

  // Avalancha: mayor tasa primero.
  const ordenAvalancha = [...deudas].sort((a, b) => b.tasaMensual - a.tasaMensual);
  // Bola de nieve: menor saldo primero.
  const ordenBola = [...deudas].sort((a, b) => a.saldo - b.saldo);

  const resAval = simular(ordenAvalancha, pagoDisponible);
  const resBola = simular(ordenBola, pagoDisponible);

  // Si el pago no cubre ni los intereses, ambas simulaciones cortan en seco.
  const interesMensualTotal = deudas.reduce((s, d) => s + d.saldo * d.tasaMensual, 0);
  if (pagoDisponible <= interesMensualTotal) {
    return {
      status: 'a',
      verdict: {
        title: 'Tu pago no alcanza a cubrir ni los intereses',
        detail: `Con ${fmtMoney(pagoDisponible)}/mes no llegás a cubrir los ${fmtMoney(interesMensualTotal)} de intereses que generan tus deudas cada mes: el saldo crece en lugar de bajar. Necesitás liberar más plata o renegociar las tasas antes de que la bola se haga más grande.`,
        tone: 'bad',
        badge: 'Pago insuficiente',
      },
      decisiveNumber: {
        value: fmtMoney(interesMensualTotal) + '/mes',
        label: 'Intereses que generás por mes',
        sub: `Tu pago disponible (${fmtMoney(pagoDisponible)}) no los cubre: la deuda se agranda sola.`,
      },
      scenarios: [
        { label: 'Intereses/mes', value: fmtMoney(interesMensualTotal), detail: 'Lo mínimo que tenés que pagar solo para que la deuda no crezca.' },
        { label: 'Tu pago actual', value: fmtMoney(pagoDisponible), detail: 'Lo que estás destinando por mes hoy.' },
        { label: 'Falta cubrir', value: fmtMoney(interesMensualTotal - pagoDisponible), detail: 'Plata extra por mes que necesitás solo para frenar el crecimiento.' },
      ],
      nextActions: [
        `**Liberá al menos ${fmtMoney(interesMensualTotal - pagoDisponible)} más por mes** o vas a estar pagando para siempre sin bajar el capital.`,
        'Llamá a tus acreedores y **pedí refinanciar a una tasa menor** o un plan de pagos: una tarjeta refinanciada cuesta menos que el resumen impago.',
        'Cortá el uso de la **tarjeta y el descubierto** ya: cada consumo nuevo se suma a la bola a la tasa más cara.',
      ],
      notes: [
        'Es una estimación orientativa, no asesoramiento financiero. Las tasas reales (CFT) suelen ser más altas que la TNA.',
        'Si tu deuda es impagable, consultá con un profesional o con la asociación de defensa del consumidor antes de tomar más crédito.',
      ],
    };
  }

  const ahorroIntereses = resBola.interesTotal - resAval.interesTotal;
  const ahorroMeses = resBola.meses - resAval.meses;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (resAval.meses <= 24) {
    status = 'b';
    tone = 'good';
    badge = 'A tiro';
  } else if (resAval.meses <= 60) {
    status = 'tie';
    tone = 'neutral';
    badge = 'Largo pero sale';
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Plazo muy largo';
  }

  const ordenTxt = ordenAvalancha
    .map((d, idx) => `${idx + 1}º ${fmtMoney(d.saldo)} al ${fmtPct(d.tasaMensual * 12 * 100, 0)}`)
    .join(' → ');

  const detail = `Destinando ${fmtMoney(pagoDisponible)}/mes con el método avalancha (la deuda más cara primero), te librás de tus ${fmtMoney(saldoTotal)} en ${fmtMeses(resAval.meses)} y pagás ${fmtMoney(resAval.interesTotal)} de intereses. Frente a la bola de nieve, ahorrás ${fmtMoney(Math.abs(ahorroIntereses))}${ahorroMeses > 0 ? ` y te liberás ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} antes` : ''}.`;

  const scenarios = [
    {
      label: 'Avalancha (recomendado)',
      value: fmtMeses(resAval.meses),
      detail: `Pagás la deuda más cara primero. Intereses totales: ${fmtMoney(resAval.interesTotal)}.`,
    },
    {
      label: 'Bola de nieve',
      value: fmtMeses(resBola.meses),
      detail: `Pagás la deuda más chica primero (victorias rápidas). Intereses: ${fmtMoney(resBola.interesTotal)}.`,
    },
    {
      label: 'Con +50% de pago',
      value: fmtMeses(simular(ordenAvalancha, pagoDisponible * 1.5).meses),
      detail: `Si ponés un 50% más por mes (${fmtMoney(pagoDisponible * 1.5)}), te liberás mucho antes.`,
    },
  ];

  const breakdown = [
    { label: 'Deuda total a saldar', value: fmtMoney(saldoTotal) },
    { label: 'Pago disponible por mes', value: fmtMoney(pagoDisponible), hint: pagoExtra > 0 ? 'pago extra que indicaste' : 'ingreso − gastos' },
    { label: 'Orden de pago (avalancha)', value: `${deudas.length} deudas`, hint: ordenTxt },
    { label: 'Tiempo con avalancha', value: fmtMeses(resAval.meses) },
    { label: 'Intereses con avalancha', value: fmtMoney(resAval.interesTotal) },
    { label: 'Intereses con bola de nieve', value: fmtMoney(resBola.interesTotal) },
    { label: 'Ahorro eligiendo avalancha', value: fmtMoney(Math.abs(ahorroIntereses)), hint: ahorroMeses > 0 ? `y ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} menos` : 'mismo plazo' },
  ];

  const nextActions = [
    `Atacá **primero la deuda más cara**: ${fmtMoney(ordenAvalancha[0].saldo)} al ${fmtPct(ordenAvalancha[0].tasaMensual * 12 * 100, 0)} de TNA. Pagá el mínimo del resto y volcá todo el excedente ahí.`,
    `Cuando canceles esa, **mandá ese mismo pago a la siguiente** (efecto avalancha): así se acelera mes a mes sin poner más plata.`,
    deudas.length > 1 && resBola.meses < resAval.meses + 6
      ? 'Si te cuesta sostener la motivación, la **bola de nieve** (deuda más chica primero) da victorias rápidas a un costo extra chico. Elegí la que vayas a poder cumplir.'
      : 'Cortá el uso de tarjeta y descubierto mientras pagás: cada consumo nuevo entra a la tasa más cara y alarga todo.',
    'Antes de seguir, **renegociá las tasas**: una refinanciación de tarjeta o un préstamo más barato para cancelar el caro puede acortar muchísimo el plazo.',
  ];

  const notes = [
    'La simulación capitaliza intereses mes a mes sobre cada saldo y vuelca el pago disponible a la deuda objetivo según el método. Es una estimación orientativa.',
    'Usamos la TNA que cargás; el CFT real de tarjetas y préstamos suele ser más alto (incluye IVA, sellos y comisiones), así que el plazo real puede ser algo mayor.',
    'No es asesoramiento financiero. Si tu deuda es impagable, consultá con un profesional matriculado o con defensa del consumidor antes de tomar más crédito.',
  ];

  return {
    status,
    verdict: { title: status === 'b' ? 'Tenés las deudas a tiro: arrancá por la más cara' : status === 'tie' ? 'Sale, pero es un plan largo: empezá por la más cara' : 'El plazo es largo: priorizá bajar tasas y subir el pago', detail, tone, badge },
    decisiveNumber: {
      value: fmtMeses(resAval.meses),
      label: 'Tiempo para librarte (método avalancha)',
      sub: `Pagás ${fmtMoney(resAval.interesTotal)} de intereses y ahorrás **${fmtMoney(Math.abs(ahorroIntereses))}** frente a la bola de nieve.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'como-salir-de-deudas',
  title: 'Cómo salir de deudas: simulador avalancha vs bola de nieve 2026',
  h1: 'Cómo salir de deudas: armá tu plan (avalancha o bola de nieve)',
  description:
    'Cargá tus deudas y cuánto podés pagar por mes: te decimos en cuánto tiempo te liberás y cuánto ahorrás con el método avalancha (la más cara primero) frente a la bola de nieve. Plan de pago ordenado.',
  intro:
    'Tenés varias deudas y no sabés por cuál empezar. Esta sala simula tu salida con los dos métodos probados: avalancha (pagás primero la de mayor tasa, minimiza intereses) y bola de nieve (la más chica primero, da victorias rápidas). Te dice en cuántos meses te librás, cuánto pagás de intereses y en qué orden conviene atacar cada deuda.',
  icon: '🪜',
  category: 'finanzas',
  audience: 'AR',
  answer: 'Hay dos métodos que funcionan: **avalancha** (pagás primero la deuda de mayor tasa, es el que menos intereses te cuesta) y **bola de nieve** (pagás primero la más chica, para ganar impulso). Matemáticamente gana avalancha; si necesitás ver progreso para no abandonar, elegí bola de nieve. En ambos pagás el mínimo de todas las deudas y volcás cada peso extra a UNA sola por vez.',
  lastReviewed: '2026-07-21',
  example: {
    deuda1Monto: 800000,
    deuda1Tna: 110,
    deuda2Monto: 300000,
    deuda2Tna: 75,
    deuda3Monto: 150000,
    deuda3Tna: 60,
    pagoExtraMensual: 180000,
    ingresoMensual: 0,
    gastosMensual: 0,
  },
  fields: [
    { id: 'deuda1Monto', label: 'Deuda 1 — monto', type: 'number', prefix: '$', required: true, min: 0, placeholder: '800000', help: 'Saldo pendiente de tu deuda más grande o más cara.', group: 'Tus deudas', groupIcon: '💳' },
    { id: 'deuda1Tna', label: 'Deuda 1 — tasa (TNA)', type: 'number', suffix: '%', required: true, min: 0, placeholder: '110', help: 'Tasa nominal anual. La tarjeta suele estar arriba de 100%.', group: 'Tus deudas' },
    { id: 'deuda2Monto', label: 'Deuda 2 — monto', type: 'number', prefix: '$', default: 0, min: 0, placeholder: '300000', help: 'Saldo de una segunda deuda (opcional).', group: 'Tus deudas' },
    { id: 'deuda2Tna', label: 'Deuda 2 — tasa (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '75', group: 'Tus deudas' },
    { id: 'deuda3Monto', label: 'Deuda 3 — monto', type: 'number', prefix: '$', default: 0, min: 0, placeholder: '150000', help: 'Saldo de una tercera deuda (opcional).', group: 'Tus deudas', advanced: true },
    { id: 'deuda3Tna', label: 'Deuda 3 — tasa (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '60', group: 'Tus deudas', advanced: true },
    { id: 'pagoExtraMensual', label: 'Pago mensual que podés destinar', type: 'number', prefix: '$', recommended: true, min: 0, placeholder: '180000', help: 'Cuánta plata fija podés volcar por mes a pagar deudas, más allá de los mínimos.', group: 'Tu capacidad de pago', groupIcon: '💪' },
    { id: 'ingresoMensual', label: 'Ingreso mensual neto', type: 'number', prefix: '$', default: 0, min: 0, profileKey: 'trabajo.sueldoNeto', help: 'Opcional. Si no cargás un pago fijo, usamos ingreso menos gastos.', group: 'Tu capacidad de pago', advanced: true },
    { id: 'gastosMensual', label: 'Gastos mensuales', type: 'number', prefix: '$', default: 0, min: 0, profileKey: 'gastos.recurrentesMensual', help: 'Opcional. Para estimar cuánto te sobra por mes.', group: 'Tu capacidad de pago', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT de un préstamo' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Presupuesto 50/30/20' },
  ],
  howItWorks: `Esta sala simula tu salida de deudas mes a mes con dos estrategias.

1. **Tus deudas y tu pago.** Cargás hasta tres deudas (monto y tasa TNA) y cuánto podés destinar por mes. Si no ponés un pago fijo, usamos tu ingreso menos tus gastos.
2. **Método avalancha.** Ordena tus deudas de mayor a menor tasa. Pagás el mínimo de todas y volcás el excedente a la más cara. Es el método que **minimiza los intereses totales** y suele liberarte antes.
3. **Método bola de nieve.** Ordena de menor a mayor saldo. Cancelás primero la deuda más chica para tener una victoria rápida y mantener la motivación. Cuesta algo más en intereses, pero psicológicamente funciona.
4. **Efecto cascada.** En ambos métodos, cuando cancelás una deuda, su pago se suma al de la siguiente: por eso cada mes vas más rápido sin poner más plata.
5. **El veredicto.** Te muestra en cuántos meses te liberás con cada método y cuánto ahorrás eligiendo avalancha, más el orden exacto de pago recomendado.`,
  faq: [
    { q: '¿Qué es el método avalancha?', a: 'Consiste en pagar el mínimo de todas tus deudas y volcar todo el excedente a la de mayor tasa de interés. Cuando la cancelás, pasás a la siguiente más cara. Es el método matemáticamente óptimo: minimiza los intereses totales que pagás y, en general, te libera antes.' },
    { q: '¿Qué es el método bola de nieve?', a: 'Consiste en atacar primero la deuda de menor saldo, sin importar la tasa, para cancelarla rápido y tener una victoria que te motive. Cuesta un poco más en intereses que la avalancha, pero a mucha gente le resulta más fácil de sostener.' },
    { q: '¿Cuál me conviene elegir?', a: 'Si te guiás solo por la plata, la avalancha gana casi siempre porque ahorra intereses. Si te cuesta mantener la disciplina, la bola de nieve te da logros rápidos. La mejor es la que vayas a poder cumplir hasta el final; esta sala te muestra el costo extra de cada una.' },
    { q: '¿Qué pasa si mi pago no cubre ni los intereses?', a: 'Si lo que podés pagar por mes es menor que los intereses que generan tus deudas, el saldo crece en lugar de bajar y nunca terminás de pagar. En ese caso lo prioritario es liberar más plata o renegociar las tasas con tus acreedores antes de seguir.' },
    { q: '¿Conviene tomar un préstamo para pagar las tarjetas?', a: 'Puede convenir si el préstamo tiene una tasa (CFT) bastante menor que la de la tarjeta o el descubierto. Cancelás la deuda cara con una más barata y bajás el costo total. Compará el CFT real de ambos antes de hacerlo y no vuelvas a usar la tarjeta.' },
    { q: '¿Por qué uso la TNA y no la TEA?', a: 'Cargás la TNA porque es el dato que figura en tu resumen o contrato. Internamente la convertimos a tasa mensual (TNA dividido 12) y capitalizamos mes a mes, que es como funcionan realmente las tarjetas y préstamos. El costo real (CFT) suele ser algo más alto.' },
    { q: '¿Sirve para deudas en cuotas fijas como un préstamo personal?', a: 'Sirve mejor para deudas de saldo revolvente (tarjeta, descubierto, línea de crédito) donde podés adelantar pagos libremente. Para un préstamo personal con cuota fija, fijate antes si permite cancelación anticipada y con qué costo.' },
    { q: '¿Esto reemplaza a un asesor financiero?', a: 'No. Es una herramienta orientativa para ordenar tu plan de pago. Si tu nivel de deuda es inmanejable, consultá con un profesional matriculado o con una asociación de defensa del consumidor antes de tomar nuevas decisiones.' },
  ],
  sources: [
    { name: 'BCRA — Costo Financiero Total (CFT)', url: 'https://www.bcra.gob.ar/' },
    { name: 'BCRA — Información para usuarios financieros', url: 'https://www.bcra.gob.ar/BCRAyVos/default.asp' },
  ],
};
