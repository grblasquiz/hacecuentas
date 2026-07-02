/**
 * Sala de decisión MX — "¿Cómo salgo de mis deudas?"
 *
 * Simula la salida con varias deudas típicas mexicanas (tarjeta con CAT alto,
 * crédito de nómina, préstamo personal) usando los dos métodos clásicos:
 *   - Avalancha: primero la de MAYOR CAT → minimiza intereses totales.
 *   - Bola de nieve: primero la de MENOR saldo → victorias rápidas.
 * Muestra la diferencia en intereses y meses, y suma el contexto local:
 * Buró de Crédito (historial, no lista negra), reparadoras (las quitas dañan
 * el buró) y consolidación a tasa menor como acelerador.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

interface Deuda {
  nombre: string;
  saldo: number;
  tasaMensual: number; // efectiva mensual, derivada del CAT anual
}

/** CAT anual % → tasa efectiva mensual (raíz doceava). */
function catAMensual(catPct: number): number {
  return Math.pow(1 + catPct / 100, 1 / 12) - 1;
}

/**
 * Simula la cancelación con un pago mensual fijo: capitaliza el interés de
 * cada deuda viva y vuelca el pago a la primera del orden dado; al liquidarse
 * una, su capacidad se libera para la siguiente. Corta a 600 meses.
 */
function simular(deudas: Deuda[], pagoMensual: number): { meses: number; interesTotal: number } {
  const ds = deudas.map((d) => ({ ...d }));
  let interesTotal = 0;
  let meses = 0;
  while (ds.some((d) => d.saldo > 0.5) && meses < 600) {
    meses++;
    for (const d of ds) {
      if (d.saldo > 0.5) {
        const interes = d.saldo * d.tasaMensual;
        interesTotal += interes;
        d.saldo += interes;
      }
    }
    let pago = pagoMensual;
    for (const d of ds) {
      if (pago <= 0) break;
      if (d.saldo > 0.5) {
        const abono = Math.min(pago, d.saldo);
        d.saldo -= abono;
        pago -= abono;
      }
    }
    if (pago === pagoMensual) break; // el pago no cubre nada: cortar
  }
  return { meses, interesTotal };
}

const fmtMeses = (m: number): string => {
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
    { nombre: 'Tarjeta', saldo: Math.max(0, num(inputs.deuda1Monto)), tasaMensual: catAMensual(Math.max(0, num(inputs.deuda1Cat))) },
    { nombre: 'Deuda 2', saldo: Math.max(0, num(inputs.deuda2Monto)), tasaMensual: catAMensual(Math.max(0, num(inputs.deuda2Cat))) },
    { nombre: 'Deuda 3', saldo: Math.max(0, num(inputs.deuda3Monto)), tasaMensual: catAMensual(Math.max(0, num(inputs.deuda3Cat))) },
  ];
  const deudas = raw.filter((d) => d.saldo > 0);
  const pagoMensual = Math.max(0, num(inputs.pagoMensual));
  const ingreso = Math.max(0, num(inputs.ingresoMensual));
  const gastos = Math.max(0, num(inputs.gastosMensual));

  const saldoTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  const sobrante = Math.max(0, ingreso - gastos);
  const pagoDisponible = pagoMensual > 0 ? pagoMensual : sobrante;

  if (deudas.length === 0 || pagoDisponible <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Carga al menos una deuda (saldo y CAT) y cuánto puedes destinar cada mes a pagarlas — un monto fijo, o tu ingreso menos gastos. Con eso comparamos avalancha contra bola de nieve y armamos tu orden de pago.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para quedar libre de deudas' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo y el CAT** de cada deuda (tarjeta, crédito de nómina, préstamo personal).',
        'Indica cuánto puedes abonar al mes: un **monto fijo** o tu **ingreso menos gastos**.',
      ],
    };
  }

  const ordenAvalancha = [...deudas].sort((a, b) => b.tasaMensual - a.tasaMensual);
  const ordenBola = [...deudas].sort((a, b) => a.saldo - b.saldo);

  const resAval = simular(ordenAvalancha, pagoDisponible);
  const resBola = simular(ordenBola, pagoDisponible);

  const interesMensualTotal = deudas.reduce((s, d) => s + d.saldo * d.tasaMensual, 0);
  if (pagoDisponible <= interesMensualTotal) {
    return {
      status: 'a',
      verdict: {
        title: 'Tu pago no alcanza ni para los intereses',
        detail: `Con ${fmtMoney(pagoDisponible)}/mes no cubres los ${fmtMoney(interesMensualTotal)} de intereses que generan tus deudas cada mes: el saldo crece aunque pagues. Antes de cualquier método necesitas liberar más dinero o renegociar — una consolidación o reestructura con tu banco baja la tasa y frena la bola.`,
        tone: 'bad',
        badge: 'Pago insuficiente',
      },
      decisiveNumber: {
        value: fmtMoney(interesMensualTotal) + '/mes',
        label: 'Intereses que generas cada mes',
        sub: `Tu pago disponible (${fmtMoney(pagoDisponible)}) no los cubre: la deuda se agranda sola.`,
      },
      scenarios: [
        { label: 'Intereses/mes', value: fmtMoney(interesMensualTotal), detail: 'El mínimo para que la deuda al menos no crezca.' },
        { label: 'Tu pago actual', value: fmtMoney(pagoDisponible), detail: 'Lo que estás destinando por mes hoy.' },
        { label: 'Falta cubrir', value: fmtMoney(interesMensualTotal - pagoDisponible), detail: 'Dinero extra al mes solo para frenar el crecimiento.' },
      ],
      nextActions: [
        `**Libera al menos ${fmtMoney(interesMensualTotal - pagoDisponible)} más al mes**, o estarás pagando para siempre sin bajar el capital.`,
        'Habla con tu banco y pide una **reestructura o consolidación a tasa menor** (un crédito de nómina o personal al 25-40% sale mucho más barato que la tarjeta al 70%).',
        'Deja de usar la **tarjeta** mientras tanto: cada compra nueva entra a la tasa más cara y agranda la bola.',
        'Cuidado con las **reparadoras de crédito**: negocian quitas, pero dejar de pagar mientras negocian y liquidar "con descuento" queda registrado en tu Buró y te cierra el crédito por años.',
      ],
      notes: [
        'Es una estimación orientativa, no asesoría financiera. Usamos el CAT que cargas, que ya incluye comisiones y seguros.',
        'Si tu deuda es impagable, acude a la CONDUSEF: es gratuita y puede mediar con los bancos antes de que caigas en manos de una reparadora.',
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
    .map((d, idx) => `${idx + 1}º ${fmtMoney(d.saldo)} al ${fmtPct(d.tasaMensual > 0 ? (Math.pow(1 + d.tasaMensual, 12) - 1) * 100 : 0, 0).replace('+', '')} CAT`)
    .join(' → ');

  const detail = `Destinando ${fmtMoney(pagoDisponible)}/mes con el método avalancha (la deuda con mayor CAT primero), liquidas tus ${fmtMoney(saldoTotal)} en ${fmtMeses(resAval.meses)} y pagas ${fmtMoney(resAval.interesTotal)} de intereses. Frente a la bola de nieve te ahorras ${fmtMoney(Math.abs(ahorroIntereses))}${ahorroMeses > 0 ? ` y quedas libre ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} antes` : ''}.`;

  const scenarios = [
    {
      label: 'Avalancha (recomendado)',
      value: fmtMeses(resAval.meses),
      detail: `Atacas primero la de mayor CAT. Intereses totales: ${fmtMoney(resAval.interesTotal)}.`,
    },
    {
      label: 'Bola de nieve',
      value: fmtMeses(resBola.meses),
      detail: `Atacas primero la más chica (victorias rápidas). Intereses: ${fmtMoney(resBola.interesTotal)}.`,
    },
    {
      label: 'Con +50% de pago',
      value: fmtMeses(simular(ordenAvalancha, pagoDisponible * 1.5).meses),
      detail: `Si logras destinar ${fmtMoney(pagoDisponible * 1.5)}/mes (por ejemplo, todo un aguinaldo o la PTU al capital), sales mucho antes.`,
    },
  ];

  const breakdown = [
    { label: 'Deuda total a liquidar', value: fmtMoney(saldoTotal) },
    { label: 'Pago disponible por mes', value: fmtMoney(pagoDisponible), hint: pagoMensual > 0 ? 'monto fijo que indicaste' : 'ingreso − gastos' },
    { label: 'Orden de ataque (avalancha)', value: `${deudas.length} ${deudas.length === 1 ? 'deuda' : 'deudas'}`, hint: ordenTxt },
    { label: 'Tiempo con avalancha', value: fmtMeses(resAval.meses) },
    { label: 'Intereses con avalancha', value: fmtMoney(resAval.interesTotal) },
    { label: 'Intereses con bola de nieve', value: fmtMoney(resBola.interesTotal) },
    { label: 'Ahorro eligiendo avalancha', value: fmtMoney(Math.abs(ahorroIntereses)), hint: ahorroMeses > 0 ? `y ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} menos` : 'mismo plazo' },
  ];

  const nextActions = [
    `Ataca **primero la deuda con mayor CAT**: ${fmtMoney(ordenAvalancha[0].saldo)} al ${((Math.pow(1 + ordenAvalancha[0].tasaMensual, 12) - 1) * 100).toFixed(0)}% anual. Paga el mínimo de las demás y vuelca todo el excedente ahí — y nunca solo el pago mínimo de la tarjeta, que apenas frena los intereses.`,
    'Cuando liquides esa, **pasa ese mismo pago completo a la siguiente** (efecto cascada): cada deuda liquidada acelera la siguiente sin poner más dinero.',
    'Cotiza una **consolidación a tasa menor**: pasar la deuda de la tarjeta (60-80% CAT) a un crédito de nómina o personal (25-45%) puede recortar meses y miles de pesos. Solo funciona si dejas de usar la tarjeta después.',
    deudas.length > 1 && resBola.meses < resAval.meses + 6
      ? 'Si te cuesta sostener la disciplina, la **bola de nieve** (la más chica primero) te da victorias rápidas por un costo extra pequeño. El mejor método es el que sí vas a cumplir.'
      : 'Congela la tarjeta mientras pagas: cada compra nueva entra al CAT más caro y alarga todo el plan.',
    'Aguinaldo, PTU y devolución de impuestos van **directo a capital** de la deuda más cara: un pago extraordinario al año puede recortar el plan varios meses.',
  ];

  const notes = [
    'La simulación capitaliza intereses mes a mes sobre cada saldo (a partir del CAT, que ya incluye comisiones y seguros) y vuelca tu pago a la deuda objetivo según el método. Es una estimación orientativa.',
    'El Buró de Crédito no es una lista negra: es tu historial. Pagar puntual durante este plan lo mejora mes a mes; los registros negativos van desapareciendo con el tiempo una vez que liquidas.',
    'No es asesoría financiera. Si tu deuda es impagable, acude primero a la CONDUSEF (gratuita) antes que a una reparadora de crédito: las quitas negociadas quedan marcadas en tu Buró.',
  ];

  return {
    status,
    verdict: {
      title:
        status === 'b'
          ? 'Tus deudas están a tu alcance: empieza por la de mayor CAT'
          : status === 'tie'
            ? 'Sale, pero es un plan largo: empieza por la de mayor CAT'
            : 'El plazo es muy largo: consolida a tasa menor y sube el pago',
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMeses(resAval.meses),
      label: 'Tiempo para quedar libre (método avalancha)',
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
  title: 'Cómo salir de deudas en México: avalancha o bola de nieve 2026',
  h1: '¿Cómo salgo de mis deudas?',
  description:
    'Carga tus deudas (tarjeta, crédito de nómina, personal) con su CAT y cuánto puedes pagar al mes: te decimos en cuántos meses quedas libre y cuánto ahorras con avalancha frente a bola de nieve. Con orden de ataque y el papel del Buró.',
  intro:
    'Traes la tarjeta, un crédito de nómina y quizá un préstamo personal, y no sabes por cuál empezar. Esta sala simula tu salida mes a mes con los dos métodos probados: avalancha (primero la deuda con mayor CAT, minimiza intereses) y bola de nieve (primero la más chica, da victorias rápidas). Te dice en cuántos meses quedas libre, cuántos intereses pagas con cada método, y cuándo conviene consolidar a una tasa menor en lugar de solo apretar el paso.',
  icon: '🪜',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    deuda1Monto: 45000,
    deuda1Cat: 75,
    deuda2Monto: 30000,
    deuda2Cat: 30,
    deuda3Monto: 15000,
    deuda3Cat: 45,
    pagoMensual: 6000,
    ingresoMensual: 0,
    gastosMensual: 0,
  },
  fields: [
    { id: 'deuda1Monto', label: 'Deuda 1 — saldo', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '45000', help: 'El saldo de tu deuda más grande o más cara (típicamente la tarjeta).', group: 'Tus deudas', groupIcon: '💳' },
    { id: 'deuda1Cat', label: 'Deuda 1 — CAT', type: 'number', suffix: '%', required: true, min: 0, max: 200, placeholder: '75', help: 'El Costo Anual Total (viene en el estado de cuenta). Tarjetas: 60-80%.', group: 'Tus deudas' },
    { id: 'deuda2Monto', label: 'Deuda 2 — saldo', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '30000', help: 'Saldo de una segunda deuda, como un crédito de nómina (opcional).', group: 'Tus deudas' },
    { id: 'deuda2Cat', label: 'Deuda 2 — CAT', type: 'number', suffix: '%', default: 0, min: 0, max: 200, placeholder: '30', help: 'Crédito de nómina: 25-40% típico.', group: 'Tus deudas' },
    { id: 'deuda3Monto', label: 'Deuda 3 — saldo', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '15000', help: 'Saldo de una tercera deuda, como un préstamo personal (opcional).', group: 'Tus deudas', advanced: true },
    { id: 'deuda3Cat', label: 'Deuda 3 — CAT', type: 'number', suffix: '%', default: 0, min: 0, max: 200, placeholder: '45', help: 'Préstamo personal: 30-60% típico.', group: 'Tus deudas', advanced: true },
    { id: 'pagoMensual', label: 'Pago mensual que puedes destinar', type: 'number', prefix: '$', format: 'thousands', recommended: true, min: 0, placeholder: '6000', help: 'Cuánto puedes abonar al mes a tus deudas, más allá de los mínimos. Piénsalo por quincena y súmalo.', group: 'Tu capacidad de pago', groupIcon: '💪' },
    { id: 'ingresoMensual', label: 'Ingreso mensual neto', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '25000', advanced: true, help: 'Opcional: si no cargas un pago fijo, usamos ingreso menos gastos.', group: 'Tu capacidad de pago' },
    { id: 'gastosMensual', label: 'Gastos mensuales', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '19000', advanced: true, help: 'Opcional: para estimar cuánto te sobra al mes.', group: 'Tu capacidad de pago' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-tarjeta-credito-cat-mexico-pago-minimo-trampa', label: 'La trampa del pago mínimo' },
    { slug: 'mx/calculadora-prestamo-personal-mensualidad-cat-mexico', label: 'Préstamo personal y CAT' },
    { slug: 'mx/calculadora-fonacot-credito-mexico-monto-cat-tasa', label: 'Crédito FONACOT' },
    { slug: 'mx/calculadora-fondo-emergencia-mexico-meses-gastos', label: 'Fondo de emergencia' },
  ],
  howItWorks: `Esta sala simula tu salida de deudas mes a mes con dos estrategias.

1. **Tus deudas y tu pago.** Cargas hasta tres deudas con su saldo y su CAT — el costo real, que en México es obligatorio publicar — y cuánto puedes destinar al mes. Si no pones un monto fijo, usamos tu ingreso menos tus gastos.
2. **Método avalancha.** Ordena tus deudas de mayor a menor CAT: pagas el mínimo de todas y vuelcas el excedente a la más cara. Es el método que **minimiza los intereses totales** — con tarjetas al 70% de CAT, la diferencia es grande.
3. **Método bola de nieve.** Ordena de menor a mayor saldo: liquidas primero la más chica para tener una victoria rápida y sostener la motivación. Cuesta algo más en intereses, pero a mucha gente le funciona mejor.
4. **Efecto cascada.** En ambos métodos, al liquidar una deuda su pago completo pasa a la siguiente: el plan se acelera solo, sin poner más dinero.
5. **El veredicto.** Te muestra en cuántos meses quedas libre con cada método, cuánto te ahorras eligiendo avalancha, y cuándo lo que en realidad necesitas es consolidar a una tasa menor.`,
  faq: [
    { q: '¿Qué es el método avalancha?', a: 'Pagar el mínimo de todas tus deudas y volcar todo el excedente a la de mayor CAT. Al liquidarla, pasas a la siguiente más cara. Es el método matemáticamente óptimo: con una tarjeta al 75% de CAT y un crédito de nómina al 30%, cada peso rinde más del doble atacando primero la tarjeta.' },
    { q: '¿Qué es el método bola de nieve?', a: 'Atacar primero la deuda de menor saldo, sin importar la tasa, para liquidarla rápido y sentir avance. Cuesta algo más en intereses que la avalancha — esta sala te dice exactamente cuánto — pero las victorias tempranas ayudan a no abandonar el plan.' },
    { q: '¿Cuál me conviene?', a: 'Si solo miras el dinero, la avalancha gana casi siempre. Si has intentado salir de deudas antes y abandonaste, la bola de nieve tiene mejor tasa de éxito psicológico. Compara ambos resultados en esta sala: si la diferencia es chica, elige el que sí vas a cumplir hasta el final.' },
    { q: '¿Por qué el pago mínimo de la tarjeta no me saca de la deuda?', a: 'Porque el mínimo está diseñado para cubrir sobre todo intereses y una fracción pequeña del capital. Con CAT de 60-80%, pagando solo el mínimo una deuda de $45,000 puede tomar más de una década y costar varias veces el monto original. Todo plan serio empieza por pagar bastante más que el mínimo.' },
    { q: '¿Estar en Buró de Crédito es estar "boletinado"?', a: 'No. El Buró no es una lista negra: es tu historial crediticio, y todos los que usan crédito están en él. Lo que importa es cómo apareces: pagos puntuales construyen buen historial; atrasos y quitas lo dañan. Salir de deudas pagando mejora tu Buró mes a mes — es un efecto secundario valioso de este plan.' },
    { q: '¿Me conviene una reparadora de crédito?', a: 'Con mucho cuidado. Las reparadoras negocian quitas (pagar menos de lo que debes), pero el método usual implica dejar de pagar mientras negocian: los atrasos y la leyenda de quita quedan en tu Buró años y te cierran el crédito futuro. Antes de eso, intenta reestructurar directo con tu banco o con mediación gratuita de la CONDUSEF.' },
    { q: '¿Cuándo conviene consolidar mis deudas?', a: 'Cuando puedes cambiar deuda cara por barata: pasar saldos de tarjeta (60-80% CAT) a un crédito de nómina, personal o FONACOT con CAT de 25-45% reduce los intereses de golpe y simplifica todo a un solo pago. La condición no negociable: dejar de usar la tarjeta después, o acabas con las dos deudas.' },
    { q: '¿Qué hago con el aguinaldo y la PTU mientras pago deudas?', a: 'Van directo a capital de la deuda más cara. Un aguinaldo de $10,000 abonado a una tarjeta al 75% de CAT te ahorra unos $7,500 de intereses en el siguiente año — ninguna inversión te da eso. Los pagos extraordinarios son el acelerador más potente del plan.' },
    { q: '¿Y si ni pagando todo lo que puedo salgo en un plazo razonable?', a: 'Si la simulación te da plazos de más de 5 años o tu pago no cubre ni los intereses, el problema no es el método sino la tasa o el monto: prioriza consolidar a tasa menor, renegociar con el banco o buscar mediación en la CONDUSEF. Y evita tomar crédito nuevo para "tapar" el viejo a una tasa igual o peor.' },
  ],
  sources: [
    { name: 'CONDUSEF — Educación financiera y reclamaciones', url: 'https://www.condusef.gob.mx/' },
    { name: 'Banco de México — Indicadores de tasas de tarjetas de crédito', url: 'https://www.banxico.org.mx/' },
    { name: 'Buró de Crédito — Tu reporte de crédito especial', url: 'https://www.burodecredito.com.mx/' },
  ],
};
