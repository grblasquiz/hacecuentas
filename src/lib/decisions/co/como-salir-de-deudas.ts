/**
 * Sala de decisión CO — "¿Cómo salgo de mis deudas?"
 *
 * Patrón ESTRATEGIA. Hasta 3 deudas típicas colombianas (tarjeta cerca de
 * usura ~26% EA, libre inversión 18-25% EA, libranza 12-18% EA) y un pago
 * mensual disponible. Simula mes a mes los dos métodos clásicos:
 *   - Avalancha: primero la de MAYOR tasa EA → minimiza intereses totales.
 *   - Bola de nieve: primero la de MENOR saldo → victorias rápidas.
 * Muestra la diferencia en intereses y meses, y las palancas locales:
 * compra de cartera (tasa menor) y el reporte en Datacrédito/TransUnion.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

interface Deuda {
  nombre: string;
  saldo: number;
  tasaEA: number; // EA % (para mostrar)
  iMensual: number; // tasa mensual equivalente (decimal)
}

/** EA % → tasa mensual equivalente (decimal). */
function eaToMensual(eaPct: number): number {
  return Math.pow(1 + eaPct / 100, 1 / 12) - 1;
}

/**
 * Simula la cancelación con un pago mensual fijo: capitaliza el interés de cada
 * deuda viva y vuelca el pago en el orden dado (efecto cascada al cancelar).
 * Corta a 600 meses por seguridad. Devuelve { meses, interesTotal }.
 */
function simular(deudas: Deuda[], pagoMensual: number): { meses: number; interesTotal: number } {
  const ds = deudas.map((d) => ({ ...d }));
  let interesTotal = 0;
  let meses = 0;
  const MAX = 600;
  while (ds.some((d) => d.saldo > 0.5) && meses < MAX) {
    meses++;
    for (const d of ds) {
      if (d.saldo > 0.5) {
        const interes = d.saldo * d.iMensual;
        interesTotal += interes;
        d.saldo += interes;
      }
    }
    let pago = pagoMensual;
    for (const d of ds) {
      if (pago <= 0) break;
      if (d.saldo > 0.5) {
        const aplica = Math.min(pago, d.saldo);
        d.saldo -= aplica;
        pago -= aplica;
      }
    }
    if (pago === pagoMensual) break; // el pago no cubre nada: no avanza
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
    { nombre: 'Deuda 1', saldo: Math.max(0, num(inputs.deuda1Monto)), tasaEA: Math.max(0, num(inputs.deuda1Tasa)), iMensual: eaToMensual(Math.max(0, num(inputs.deuda1Tasa))) },
    { nombre: 'Deuda 2', saldo: Math.max(0, num(inputs.deuda2Monto)), tasaEA: Math.max(0, num(inputs.deuda2Tasa)), iMensual: eaToMensual(Math.max(0, num(inputs.deuda2Tasa))) },
    { nombre: 'Deuda 3', saldo: Math.max(0, num(inputs.deuda3Monto)), tasaEA: Math.max(0, num(inputs.deuda3Tasa)), iMensual: eaToMensual(Math.max(0, num(inputs.deuda3Tasa))) },
  ];
  const deudas = raw.filter((d) => d.saldo > 0);
  const pagoFijo = Math.max(0, num(inputs.pagoMensual));
  const ingreso = Math.max(0, num(inputs.ingresoMensual));
  const gastos = Math.max(0, num(inputs.gastosMensuales));

  const saldoTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  const sobrante = Math.max(0, ingreso - gastos);
  const pagoDisponible = pagoFijo > 0 ? pagoFijo : sobrante;

  if (deudas.length === 0 || pagoDisponible <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga al menos una deuda (saldo y tasa EA) y cuánto puedes destinar cada mes a pagarlas — un monto fijo o tu ingreso menos gastos. Con eso simulamos avalancha vs bola de nieve y armamos tu orden de pago.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para quedar a paz y salvo' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo y la tasa EA** de cada deuda (tarjeta, libre inversión, libranza; la EA está en el extracto).',
        'Indica cuánto puedes poner al mes: un **pago fijo** o tu **ingreso menos gastos**.',
      ],
    };
  }

  const ordenAvalancha = [...deudas].sort((a, b) => b.iMensual - a.iMensual);
  const ordenBola = [...deudas].sort((a, b) => a.saldo - b.saldo);

  const resAval = simular(ordenAvalancha, pagoDisponible);
  const resBola = simular(ordenBola, pagoDisponible);

  const interesMensualTotal = deudas.reduce((s, d) => s + d.saldo * d.iMensual, 0);
  if (pagoDisponible <= interesMensualTotal) {
    return {
      status: 'a',
      verdict: {
        title: 'Tu pago no alcanza ni para los intereses',
        detail: `Con ${fmtMoney(pagoDisponible)}/mes no cubres los ${fmtMoney(interesMensualTotal)} de intereses que generan tus deudas cada mes: el saldo crece en vez de bajar. Antes de seguir, necesitas liberar más plata o bajar las tasas — una compra de cartera o una reestructuración con el banco puede frenar la bola.`,
        tone: 'bad',
        badge: 'Pago insuficiente',
      },
      decisiveNumber: {
        value: fmtMoney(interesMensualTotal) + '/mes',
        label: 'Intereses que generas cada mes',
        sub: `Tu pago disponible (${fmtMoney(pagoDisponible)}) no los cubre: la deuda se agranda sola.`,
      },
      scenarios: [
        { label: 'Intereses/mes', value: fmtMoney(interesMensualTotal), detail: 'Lo mínimo para que la deuda al menos no crezca.' },
        { label: 'Tu pago actual', value: fmtMoney(pagoDisponible), detail: 'Lo que estás destinando por mes hoy.' },
        { label: 'Falta cubrir', value: fmtMoney(interesMensualTotal - pagoDisponible), detail: 'Plata extra mensual necesaria solo para frenar el crecimiento.' },
      ],
      nextActions: [
        `**Libera al menos ${fmtMoney(interesMensualTotal - pagoDisponible)} más al mes** o estarás pagando para siempre sin bajar el capital.`,
        'Cotiza una **compra de cartera** o pide al banco reestructurar: bajar la tasa de una tarjeta cercana a usura a la de un crédito de libranza puede reducir los intereses a la mitad.',
        'Deja de usar la **tarjeta y el sobregiro** ya: cada compra nueva entra a la tasa más cara y agranda la bola.',
        'Si ya estás en mora, negocia antes de que el reporte negativo en **Datacrédito y TransUnion** se endurezca: un acuerdo de pago documentado limita el daño a tu historial.',
      ],
      notes: [
        'Estimación orientativa con la tasa EA que cargaste; los cobros reales pueden incluir seguros y cuotas de manejo que empeoran el cuadro.',
        'Si la deuda se volvió impagable, busca asesoría: la Ley de insolvencia de persona natural (Ley 1564) permite negociar con todos los acreedores a la vez.',
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
    badge = 'A tu alcance';
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
    .map((d, idx) => `${idx + 1}º ${fmtMoney(d.saldo)} al ${fmtPct(d.tasaEA, 0).replace('+', '')} EA`)
    .join(' → ');

  const detail = `Destinando ${fmtMoney(pagoDisponible)}/mes con el método avalancha (la deuda de mayor tasa EA primero), quedas a paz y salvo de tus ${fmtMoney(saldoTotal)} en ${fmtMeses(resAval.meses)}, pagando ${fmtMoney(resAval.interesTotal)} de intereses. Frente a la bola de nieve, te ahorras ${fmtMoney(Math.abs(ahorroIntereses))}${ahorroMeses > 0 ? ` y terminas ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} antes` : ''}.`;

  const scenarios = [
    {
      label: 'Avalancha (recomendado)',
      value: fmtMeses(resAval.meses),
      detail: `Primero la deuda de mayor tasa EA. Intereses totales: ${fmtMoney(resAval.interesTotal)}.`,
    },
    {
      label: 'Bola de nieve',
      value: fmtMeses(resBola.meses),
      detail: `Primero la deuda más pequeña (victorias rápidas). Intereses: ${fmtMoney(resBola.interesTotal)}.`,
    },
    {
      label: 'Con +50% de pago',
      value: fmtMeses(simular(ordenAvalancha, pagoDisponible * 1.5).meses),
      detail: `Si logras poner ${fmtMoney(pagoDisponible * 1.5)}/mes (una prima o ingreso extra ayuda), sales mucho antes.`,
    },
  ];

  const breakdown = [
    { label: 'Deuda total', value: fmtMoney(saldoTotal) },
    { label: 'Pago disponible al mes', value: fmtMoney(pagoDisponible), hint: pagoFijo > 0 ? 'monto fijo que indicaste' : 'ingreso − gastos' },
    { label: 'Orden de pago (avalancha)', value: `${deudas.length} ${deudas.length === 1 ? 'deuda' : 'deudas'}`, hint: ordenTxt },
    { label: 'Tiempo con avalancha', value: fmtMeses(resAval.meses) },
    { label: 'Intereses con avalancha', value: fmtMoney(resAval.interesTotal) },
    { label: 'Intereses con bola de nieve', value: fmtMoney(resBola.interesTotal) },
    { label: 'Ahorro eligiendo avalancha', value: fmtMoney(Math.abs(ahorroIntereses)), hint: ahorroMeses > 0 ? `y ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} menos` : 'mismo plazo' },
  ];

  const nextActions = [
    `Ataca **primero la deuda más cara**: ${fmtMoney(ordenAvalancha[0].saldo)} al ${fmtPct(ordenAvalancha[0].tasaEA, 0).replace('+', '')} EA. Paga el mínimo de las demás y vuelca todo el excedente ahí.`,
    'Cuando la canceles, **pasa ese mismo pago a la siguiente** (efecto cascada): cada mes avanzas más rápido sin poner plata extra.',
    'Cotiza una **compra de cartera** para la deuda más cara: pasar una tarjeta cercana a usura (~26% EA) a una libranza o crédito al 14-16% EA recorta los intereses casi a la mitad. Eso sí: cancela el cupo o guárdalo sin usar.',
    deudas.length > 1 && resBola.meses < resAval.meses + 6
      ? 'Si te cuesta sostener la disciplina, la **bola de nieve** (deuda más pequeña primero) da victorias rápidas por un sobrecosto pequeño. El mejor método es el que sí vas a cumplir.'
      : 'Congela la tarjeta y el sobregiro mientras pagas: cada compra nueva entra a la tasa más cara y alarga todo el plan.',
    'Mantente al día durante el plan: evitar la mora te ahorra intereses de mora y protege tu historial en **Datacrédito y TransUnion**, que define las tasas que te darán en el futuro.',
  ];

  const notes = [
    'La simulación convierte cada tasa EA a su equivalente mensual, capitaliza los intereses mes a mes y vuelca tu pago a la deuda objetivo según el método. Es una estimación orientativa.',
    'No incluye cuotas de manejo, seguros ni intereses de mora, que encarecen el costo real. Verifica la EA exacta de cada producto en tu extracto.',
    'Los abonos a capital en créditos de consumo no tienen penalización en Colombia: aprovecha primas y cesantías para acelerar el plan.',
    'No es asesoría financiera. Si la deuda se volvió inmanejable, consulta sobre la insolvencia de persona natural o busca apoyo profesional antes de tomar más crédito.',
  ];

  return {
    status,
    verdict: {
      title:
        status === 'b'
          ? 'Tienes las deudas a tu alcance: empieza por la más cara'
          : status === 'tie'
            ? 'Sale, pero es un plan largo: empieza por la más cara'
            : 'El plazo es muy largo: baja tasas y sube el pago primero',
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMeses(resAval.meses),
      label: 'Tiempo para quedar a paz y salvo (avalancha)',
      sub: `Pagas ${fmtMoney(resAval.interesTotal)} de intereses y te ahorras **${fmtMoney(Math.abs(ahorroIntereses))}** frente a la bola de nieve.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'como-salir-de-deudas',
  title: '¿Cómo salir de deudas en Colombia? Avalancha vs bola de nieve 2026',
  h1: '¿Cómo salgo de mis deudas?',
  description:
    'Carga tus deudas (tarjeta, libre inversión, libranza) y cuánto puedes pagar al mes: simulamos avalancha vs bola de nieve y te decimos en cuántos meses quedas a paz y salvo, cuántos intereses ahorras y cuándo conviene una compra de cartera.',
  intro:
    'Tienes varias deudas — la tarjeta cerca de la tasa de usura, un libre inversión, quizá una libranza — y no sabes por cuál empezar. Esta sala simula tu salida mes a mes con los dos métodos probados: avalancha (primero la de mayor tasa EA, minimiza intereses) y bola de nieve (primero la más pequeña, da victorias rápidas). Te muestra en cuánto tiempo quedas a paz y salvo, la diferencia en plata entre métodos, y cuándo una compra de cartera acelera todo el plan.',
  icon: '🪜',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    deuda1Monto: 8000000,
    deuda1Tasa: 26,
    deuda2Monto: 12000000,
    deuda2Tasa: 20,
    deuda3Monto: 6000000,
    deuda3Tasa: 14,
    pagoMensual: 1500000,
    ingresoMensual: 0,
    gastosMensuales: 0,
  },
  fields: [
    { id: 'deuda1Monto', label: 'Deuda 1 — saldo (ej. tarjeta)', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '8000000', help: 'Saldo pendiente de tu deuda más cara. La tarjeta suele estar cerca de la usura.', group: 'Tus deudas', groupIcon: '💳' },
    { id: 'deuda1Tasa', label: 'Deuda 1 — tasa (EA)', type: 'number', suffix: '%', required: true, min: 0, max: 40, placeholder: '26', help: 'Tasa efectiva anual (está en el extracto). Tope de usura 2026: ~26% EA.', group: 'Tus deudas' },
    { id: 'deuda2Monto', label: 'Deuda 2 — saldo (ej. libre inversión)', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '12000000', help: 'Saldo de una segunda deuda (opcional). Libre inversión: 18-25% EA.', group: 'Tus deudas' },
    { id: 'deuda2Tasa', label: 'Deuda 2 — tasa (EA)', type: 'number', suffix: '%', default: 0, min: 0, max: 40, placeholder: '20', group: 'Tus deudas' },
    { id: 'deuda3Monto', label: 'Deuda 3 — saldo (ej. libranza)', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '6000000', advanced: true, help: 'Saldo de una tercera deuda (opcional). La libranza suele ser la más barata: 12-18% EA.', group: 'Tus deudas' },
    { id: 'deuda3Tasa', label: 'Deuda 3 — tasa (EA)', type: 'number', suffix: '%', default: 0, min: 0, max: 40, placeholder: '14', advanced: true, group: 'Tus deudas' },
    { id: 'pagoMensual', label: 'Pago mensual que puedes destinar', type: 'number', prefix: '$', format: 'thousands', recommended: true, min: 0, placeholder: '1500000', help: 'Plata fija que puedes volcar cada mes a las deudas, más allá de los mínimos.', group: 'Tu capacidad de pago', groupIcon: '💪' },
    { id: 'ingresoMensual', label: 'Ingreso mensual neto', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, advanced: true, help: 'Opcional. Si no indicas un pago fijo, usamos ingreso menos gastos.', group: 'Tu capacidad de pago' },
    { id: 'gastosMensuales', label: 'Gastos mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, advanced: true, help: 'Opcional. Para estimar cuánto te sobra al mes.', group: 'Tu capacidad de pago' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-tarjeta-credito-colombia-tasa-usura-cuota-pago-minimo', label: 'Tarjeta y pago mínimo' },
    { slug: 'co/calculadora-credito-libranza-colombia-empleado-cuota-tasa', label: 'Crédito de libranza' },
    { slug: 'co/calculadora-cooperativas-prestamo-colombia-tasa-interes', label: 'Préstamo en cooperativa' },
    { slug: 'co/calculadora-tasa-interes-mora-colombia-tarjeta-credito-2026', label: 'Interés de mora' },
  ],
  howItWorks: `Esta sala simula tu salida de deudas mes a mes con las dos estrategias clásicas, usando tasas EA colombianas.

1. **Tus deudas y tu pago.** Cargas hasta tres deudas (saldo y tasa EA de cada una) y cuánto puedes destinar al mes. Si no pones un pago fijo, usamos tu ingreso menos tus gastos.
2. **Método avalancha.** Ordena las deudas de mayor a menor tasa EA: pagas el mínimo de todas y vuelcas el excedente a la más cara (normalmente la tarjeta, que cobra cerca de la usura). Es el método que **minimiza los intereses totales**.
3. **Método bola de nieve.** Ordena de menor a mayor saldo: cancelas primero la deuda más pequeña para tener una victoria rápida que te mantenga motivado. Cuesta algo más en intereses, pero funciona psicológicamente.
4. **Efecto cascada.** En ambos métodos, al cancelar una deuda su pago se suma al de la siguiente: por eso el plan se acelera solo mes a mes.
5. **Las palancas locales.** Compara los resultados y te recuerda cuándo acelerar con una compra de cartera (bajar la tasa), abonos de prima o cesantías, y por qué evitar la mora protege tu historial en Datacrédito y TransUnion.`,
  faq: [
    { q: '¿Qué es el método avalancha?', a: 'Pagar el mínimo de todas tus deudas y volcar todo el excedente a la de mayor tasa EA. En Colombia esa casi siempre es la tarjeta de crédito, que cobra cerca del tope de usura (~26% EA). Cuando la cancelas, pasas a la siguiente más cara. Es el método matemáticamente óptimo: paga menos intereses totales.' },
    { q: '¿Qué es el método bola de nieve?', a: 'Atacar primero la deuda de menor saldo, sin importar la tasa, para cancelarla rápido y sentir avance. Cuesta un poco más en intereses que la avalancha, pero a mucha gente le resulta más fácil de sostener. Esta sala te muestra exactamente cuánto cuesta esa motivación extra.' },
    { q: '¿Cuál de mis deudas suele ser la más cara en Colombia?', a: 'En orden típico: sobregiro y tarjeta de crédito (cerca de la usura, ~26% EA), crédito de libre inversión (18-25% EA), crédito de libranza descontado de nómina (12-18% EA) y al final el hipotecario (11-13% EA). Verifica la EA exacta en el extracto de cada producto: ese dato define tu orden de pago.' },
    { q: '¿Qué es la compra de cartera y cuándo usarla?', a: 'Es que otra entidad "compre" tu deuda y te la deje a una tasa menor — típico pasar una tarjeta al 26% EA a un crédito al 14-16% EA. Reduce los intereses casi a la mitad sin poner plata extra. Conviene apenas detectas que la deuda cara te tomará más de unos meses. La condición: no volver a llenar el cupo liberado.' },
    { q: '¿Qué pasa si solo pago el mínimo de la tarjeta?', a: 'El pago mínimo apenas cubre intereses y un abono pequeño a capital: una deuda de tarjeta pagando solo el mínimo puede tardar muchos años en morir. Si tu pago disponible no cubre ni los intereses de todas tus deudas, la sala te lo alerta: en ese punto la prioridad es bajar tasas o liberar más plata, no elegir método.' },
    { q: '¿Cómo afecta esto mi reporte en Datacrédito?', a: 'Mientras pagues a tiempo, tu historial mejora a medida que baja tu endeudamiento y el uso del cupo. Si caes en mora de más de 30 días, el reporte negativo queda visible por el doble del tiempo de la mora (máximo 4 años tras ponerte al día) y encarece o bloquea tus créditos futuros. Evitar la mora vale tanto como los intereses ahorrados.' },
    { q: '¿Uso la prima o las cesantías para pagar deudas?', a: 'La prima (junio y diciembre) es de libre destinación: usarla como abono a capital acelera cualquier método sin afectar tu presupuesto mensual. Las cesantías solo se pueden retirar para vivienda, educación o al quedar cesante — pero si vas a retirarlas legalmente, abonar a una deuda al 26% EA les da más valor que dejarlas al rendimiento del fondo.' },
    { q: '¿Y si mis deudas ya son impagables?', a: 'Si ni reestructurando llegas, Colombia tiene el régimen de insolvencia de persona natural no comerciante: un procedimiento ante centros de conciliación para negociar con todos los acreedores a la vez, congelar intereses y armar un acuerdo de pago. Búscalo antes de tomar créditos "gota a gota", que están fuera de toda regulación.' },
  ],
  sources: [
    { name: 'Superintendencia Financiera — Tasa de usura e interés bancario corriente', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'Banco de la República — Tasas de interés de consumo', url: 'https://www.banrep.gov.co/' },
    { name: 'DANE — IPC e inflación', url: 'https://www.dane.gov.co/' },
  ],
};
