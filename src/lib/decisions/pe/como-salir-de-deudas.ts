/**
 * Sala de decisión PE — "¿Cómo salgo de mis deudas?"
 *
 * Patrón ESTRATEGIA. Hasta 3 deudas típicas del sistema peruano (tarjeta,
 * préstamo personal, línea paralela) con su TCEA, y un pago mensual disponible.
 * Simula avalancha (mayor TCEA primero: minimiza intereses) vs bola de nieve
 * (menor saldo primero: victorias rápidas) y muestra la diferencia en soles y
 * meses. Suma las herramientas locales: compra de deuda a tasa menor, pago
 * anticipado sin penalidad (derecho SBS) y qué pasa con tu reporte en
 * Infocorp (Equifax) cuando pagas.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

interface Deuda {
  nombre: string;
  saldo: number;
  tasaMensual: number; // efectiva mensual decimal desde la TCEA
}

/** TCEA % → tasa efectiva mensual decimal. */
function tceaAMensual(tceaPct: number): number {
  return Math.pow(1 + tceaPct / 100, 1 / 12) - 1;
}

/**
 * Simula la cancelación mes a mes: capitaliza el interés de cada deuda viva y
 * aplica el pago disponible en el orden dado. Al cancelarse una deuda, su
 * capacidad libera para la siguiente (efecto avalancha/bola). Corta a 600 meses.
 */
function simular(deudas: Deuda[], pagoDisponible: number): { meses: number; interesTotal: number } {
  const ds = deudas.map((d) => ({ ...d }));
  let interesTotal = 0;
  let meses = 0;
  const MAX = 600;
  while (ds.some((d) => d.saldo > 0.5) && meses < MAX) {
    meses++;
    for (const d of ds) {
      if (d.saldo > 0.5) {
        const interes = d.saldo * d.tasaMensual;
        interesTotal += interes;
        d.saldo += interes;
      }
    }
    let pago = pagoDisponible;
    for (const d of ds) {
      if (pago <= 0) break;
      if (d.saldo > 0.5) {
        const aplica = Math.min(pago, d.saldo);
        d.saldo -= aplica;
        pago -= aplica;
      }
    }
    if (pago === pagoDisponible) break; // no cubre ni intereses
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
    { nombre: 'Deuda 1', saldo: Math.max(0, num(inputs.deuda1Monto)), tasaMensual: tceaAMensual(Math.max(0, num(inputs.deuda1Tcea))) },
    { nombre: 'Deuda 2', saldo: Math.max(0, num(inputs.deuda2Monto)), tasaMensual: tceaAMensual(Math.max(0, num(inputs.deuda2Tcea))) },
    { nombre: 'Deuda 3', saldo: Math.max(0, num(inputs.deuda3Monto)), tasaMensual: tceaAMensual(Math.max(0, num(inputs.deuda3Tcea))) },
  ];
  const deudas = raw.filter((d) => d.saldo > 0);
  const pagoExtra = Math.max(0, num(inputs.pagoMensual));
  const ingreso = Math.max(0, num(inputs.ingresoMensual));
  const gastos = Math.max(0, num(inputs.gastosMensuales));

  const saldoTotal = deudas.reduce((s, d) => s + d.saldo, 0);
  const sobrante = Math.max(0, ingreso - gastos);
  const pagoDisponible = pagoExtra > 0 ? pagoExtra : sobrante;

  if (deudas.length === 0 || pagoDisponible <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga al menos una deuda (saldo y TCEA) y cuánto puedes destinar al mes a pagarlas — un monto fijo, o tu ingreso menos gastos. Con eso simulamos tu salida con los métodos avalancha y bola de nieve.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para quedar libre de deudas' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo y la TCEA** de cada deuda (tarjeta, préstamo personal, línea paralela). La TCEA está en tu estado de cuenta.',
        'Indica cuánto puedes pagar al mes: un **monto fijo** o tu **ingreso menos gastos**.',
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
        title: 'Tu pago no cubre ni los intereses',
        detail: `Con ${fmtMoney(pagoDisponible)} al mes no llegas a cubrir los ${fmtMoney(interesMensualTotal)} de intereses que generan tus deudas: el saldo crece solo. Antes de seguir pagando a ciegas, busca una compra de deuda a menor tasa o negocia una refinanciación con tus bancos — con TCEA de tarjeta, cada mes que pasa la bola se agranda.`,
        tone: 'bad',
        badge: 'Pago insuficiente',
      },
      decisiveNumber: {
        value: fmtMoney(interesMensualTotal) + '/mes',
        label: 'Intereses que generas cada mes',
        sub: `Tu pago disponible (${fmtMoney(pagoDisponible)}) no los cubre: la deuda se agranda sola.`,
      },
      scenarios: [
        { label: 'Intereses al mes', value: fmtMoney(interesMensualTotal), detail: 'Lo mínimo para que la deuda no crezca.' },
        { label: 'Tu pago actual', value: fmtMoney(pagoDisponible), detail: 'Lo que estás destinando hoy.' },
        { label: 'Falta cubrir', value: fmtMoney(interesMensualTotal - pagoDisponible), detail: 'Lo extra que necesitas solo para frenar el crecimiento.' },
      ],
      nextActions: [
        `**Libera al menos ${fmtMoney(interesMensualTotal - pagoDisponible)} más al mes**, o la deuda nunca va a bajar por más que pagues.`,
        'Cotiza una **compra de deuda**: otro banco o caja cancela tus deudas caras y te deja una sola cuota a menor TCEA. Compara ofertas en Retasas de la SBS.',
        'Deja de usar la tarjeta y la línea paralela YA: cada consumo nuevo entra a la tasa más cara.',
        'Si nada alcanza, negocia una **refinanciación** con tu banco antes de caer en mora: una deuda refinanciada golpea menos tu calificación en Infocorp que una vencida.',
      ],
      notes: [
        'Estimación orientativa con la TCEA que cargaste, no asesoría financiera.',
        'La mora empeora tu calificación en las centrales de riesgo (Infocorp/Equifax) y encarece todo tu crédito futuro: actúa antes de dejar de pagar.',
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
    badge = 'Salida cercana';
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
    .map((d, idx) => `${idx + 1}º ${fmtMoney(d.saldo)} a TCEA ${fmtPct((Math.pow(1 + d.tasaMensual, 12) - 1) * 100, 0).replace('+', '')}`)
    .join(' → ');

  const detail = `Destinando ${fmtMoney(pagoDisponible)} al mes con el método avalancha (la TCEA más alta primero), sales de tus ${fmtMoney(saldoTotal)} de deuda en ${fmtMeses(resAval.meses)}, pagando ${fmtMoney(resAval.interesTotal)} de intereses. Frente a la bola de nieve te ahorras ${fmtMoney(Math.abs(ahorroIntereses))}${ahorroMeses > 0 ? ` y quedas libre ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} antes` : ''}. Cada pago que hagas por encima del mínimo es tu derecho: amortización anticipada sin penalidad.`;

  const scenarios = [
    { label: 'Avalancha (recomendado)', value: fmtMeses(resAval.meses), detail: `Atacas la TCEA más alta primero. Intereses totales: ${fmtMoney(resAval.interesTotal)}.` },
    { label: 'Bola de nieve', value: fmtMeses(resBola.meses), detail: `Cancelas primero la deuda más chica (victorias rápidas). Intereses: ${fmtMoney(resBola.interesTotal)}.` },
    { label: 'Con +50% de pago', value: fmtMeses(simular(ordenAvalancha, pagoDisponible * 1.5).meses), detail: `Si logras poner ${fmtMoney(pagoDisponible * 1.5)} al mes (una gratificación ayuda), sales mucho antes.` },
  ];

  const breakdown = [
    { label: 'Deuda total', value: fmtMoney(saldoTotal) },
    { label: 'Pago disponible al mes', value: fmtMoney(pagoDisponible), hint: pagoExtra > 0 ? 'monto fijo que indicaste' : 'ingreso − gastos' },
    { label: 'Orden de ataque (avalancha)', value: `${deudas.length} ${deudas.length === 1 ? 'deuda' : 'deudas'}`, hint: ordenTxt },
    { label: 'Tiempo con avalancha', value: fmtMeses(resAval.meses) },
    { label: 'Intereses con avalancha', value: fmtMoney(resAval.interesTotal) },
    { label: 'Intereses con bola de nieve', value: fmtMoney(resBola.interesTotal) },
    { label: 'Ahorro eligiendo avalancha', value: fmtMoney(Math.abs(ahorroIntereses)), hint: ahorroMeses > 0 ? `y ${ahorroMeses} ${ahorroMeses === 1 ? 'mes' : 'meses'} menos` : 'mismo plazo' },
  ];

  const nextActions = [
    `Ataca **primero la deuda más cara**: ${fmtMoney(ordenAvalancha[0].saldo)} a TCEA ${fmtPct((Math.pow(1 + ordenAvalancha[0].tasaMensual, 12) - 1) * 100, 0).replace('+', '')}. Paga el mínimo del resto y vuelca todo el excedente ahí — sin penalidad, es tu derecho.`,
    'Cuando canceles una, **traslada ese mismo pago a la siguiente**: el plan se acelera solo, sin poner más plata.',
    'Cotiza una **compra de deuda**: si otro banco o caja te ofrece consolidar a una TCEA claramente menor, el plazo se acorta muchísimo. Compara en Retasas (SBS) y ojo con las comisiones del traslado.',
    'Deja de usar la tarjeta mientras pagas: paga con débito o efectivo. Cada consumo nuevo entra a la TCEA más alta y arruina la simulación.',
    deudas.length > 1 && resBola.meses < resAval.meses + 6
      ? 'Si te cuesta la disciplina, la **bola de nieve** (la deuda más chica primero) da victorias tempranas por un sobrecosto pequeño. El mejor método es el que sí vas a cumplir.'
      : 'Guarda constancia de cada cancelación: sirve para que la entidad actualice tu reporte en Infocorp y recuperes acceso a crédito barato.',
  ];

  const notes = [
    'La simulación convierte cada TCEA a tasa efectiva mensual, capitaliza mes a mes y vuelca tu pago a la deuda objetivo según el método. Es una estimación orientativa.',
    'Usa la TCEA (no la TEA): es el costo real con comisiones, portes y seguro de desgravamen. La encuentras en tu estado de cuenta o en el portal Retasas de la SBS.',
    'Pagar no te "borra" de Infocorp de inmediato: la central actualiza tu calificación con los reportes siguientes y el historial mejora con cada mes al día. Lo que sí desaparece es la deuda vencida.',
    'No es asesoría financiera. Si tu deuda es inmanejable, acude a la plataforma de atención al usuario de la SBS o a Indecopi antes de tomar más crédito.',
  ];

  return {
    status,
    verdict: {
      title:
        status === 'b'
          ? 'Tu salida está cerca: ataca la TCEA más alta'
          : status === 'tie'
            ? 'Sale, pero es un plan largo: empieza por la más cara'
            : 'El plazo es muy largo: baja tasas con compra de deuda y sube el pago',
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMeses(resAval.meses),
      label: 'Tiempo para quedar libre (método avalancha)',
      sub: `Pagas ${fmtMoney(resAval.interesTotal)} de intereses y ahorras **${fmtMoney(Math.abs(ahorroIntereses))}** frente a la bola de nieve.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'como-salir-de-deudas',
  title: '¿Cómo salir de deudas en el Perú? Avalancha vs bola de nieve 2026',
  h1: '¿Cómo salgo de mis deudas?',
  description:
    'Carga tus deudas (tarjeta, préstamo, línea paralela) con su TCEA y cuánto puedes pagar al mes: te decimos en cuánto tiempo quedas libre con avalancha vs bola de nieve, cuánto ahorras, y cómo usar la compra de deuda y el pago anticipado sin penalidad.',
  intro:
    'Tarjeta, préstamo personal, línea paralela: varias deudas a la vez y no sabes por cuál empezar. Esta sala simula tu salida mes a mes con los dos métodos probados — avalancha (primero la TCEA más alta, minimiza intereses) y bola de nieve (primero la más chica, da victorias rápidas) — usando las tasas reales del sistema peruano, donde una tarjeta puede costar 40-90% de TCEA. Te dice en cuántos meses quedas libre, cuánto pagas de intereses con cada método, y cómo acelerar con las herramientas locales: la compra de deuda a menor tasa y tu derecho al pago anticipado sin penalidad. También, qué pasa con tu reporte en Infocorp cuando pagas.',
  icon: '🪜',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    deuda1Monto: 8000,
    deuda1Tcea: 65,
    deuda2Monto: 12000,
    deuda2Tcea: 32,
    deuda3Monto: 3000,
    deuda3Tcea: 85,
    pagoMensual: 900,
    ingresoMensual: 0,
    gastosMensuales: 0,
  },
  fields: [
    { id: 'deuda1Monto', label: 'Deuda 1 — saldo', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '8,000', help: 'Saldo pendiente. Típico: la tarjeta de crédito.', group: 'Tus deudas', groupIcon: '💳' },
    { id: 'deuda1Tcea', label: 'Deuda 1 — TCEA', type: 'number', suffix: '%', required: true, min: 0, max: 200, placeholder: '65', help: 'Las tarjetas van de 40% a 90% de TCEA. Revisa tu estado de cuenta.', group: 'Tus deudas' },
    { id: 'deuda2Monto', label: 'Deuda 2 — saldo', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '12,000', help: 'Saldo de una segunda deuda (opcional). Típico: préstamo personal.', group: 'Tus deudas' },
    { id: 'deuda2Tcea', label: 'Deuda 2 — TCEA', type: 'number', suffix: '%', default: 0, min: 0, max: 200, placeholder: '32', help: 'Los préstamos personales rondan 20-40% de TCEA.', group: 'Tus deudas' },
    { id: 'deuda3Monto', label: 'Deuda 3 — saldo', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '3,000', help: 'Una tercera deuda (opcional). Típico: línea paralela o efectivo de tarjeta.', group: 'Tus deudas', advanced: true },
    { id: 'deuda3Tcea', label: 'Deuda 3 — TCEA', type: 'number', suffix: '%', default: 0, min: 0, max: 200, placeholder: '85', help: 'Las líneas paralelas y disposición de efectivo suelen superar 60%.', group: 'Tus deudas', advanced: true },
    { id: 'pagoMensual', label: 'Pago mensual que puedes destinar', type: 'number', prefix: 'S/', format: 'thousands', recommended: true, min: 0, placeholder: '900', help: 'La plata fija que puedes volcar cada mes a tus deudas, por encima de los mínimos.', group: 'Tu capacidad de pago', groupIcon: '💪' },
    { id: 'ingresoMensual', label: 'Ingreso neto mensual', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '3,500', help: 'Opcional: si no pones un pago fijo, usamos ingreso menos gastos.', group: 'Tu capacidad de pago', advanced: true },
    { id: 'gastosMensuales', label: 'Gastos mensuales', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '2,600', help: 'Opcional: para estimar cuánto te sobra al mes.', group: 'Tu capacidad de pago', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-tarjeta-credito-pago-minimo-peru', label: 'Pago mínimo de tarjeta' },
    { slug: 'pe/calculadora-prestamo-personal-tcea-peru', label: 'Préstamo personal (TCEA)' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala simula tu salida de deudas mes a mes con las tasas reales del sistema peruano.

1. **Tus deudas y tu pago.** Cargas hasta tres deudas con su saldo y su TCEA (el costo efectivo anual real, con comisiones y seguros) y cuánto puedes destinar al mes. Si no pones un monto fijo, usamos tu ingreso menos gastos.
2. **Método avalancha.** Ordena las deudas de mayor a menor TCEA: pagas el mínimo de todas y vuelcas el excedente a la más cara. Es el método que **minimiza los intereses totales** — y en el Perú, donde una tarjeta puede costar el triple que un préstamo personal, la diferencia es grande.
3. **Método bola de nieve.** Ordena de menor a mayor saldo: cancelas primero la más chica para tener una victoria rápida que te mantenga en el plan. Cuesta algo más en intereses, pero psicológicamente funciona.
4. **Efecto cascada.** En ambos métodos, al cancelar una deuda su pago completo pasa a la siguiente: cada mes avanzas más rápido sin poner más plata. Cada sol por encima del mínimo es amortización anticipada — tu derecho, sin penalidad.
5. **El veredicto.** Te muestra los meses y los intereses de cada método, el orden exacto de ataque, y cuándo conviene acelerar con una compra de deuda a menor TCEA.`,
  faq: [
    { q: '¿Qué es el método avalancha y por qué conviene en el Perú?', a: 'Consiste en pagar el mínimo de todas tus deudas y volcar todo el excedente a la de mayor TCEA. En el Perú la brecha de tasas es enorme — una tarjeta puede costar 65% mientras un préstamo personal cuesta 30% — así que atacar primero la más cara ahorra mucho más interés que en mercados de tasas parejas.' },
    { q: '¿Qué es el método bola de nieve?', a: 'Atacas primero la deuda de menor saldo, sin importar la tasa, para cancelarla rápido y sentir el avance. Cuesta algo más en intereses que la avalancha (esta sala te muestra exactamente cuánto), pero si la motivación es tu punto débil, es el método que más gente logra sostener hasta el final.' },
    { q: '¿Qué es la compra de deuda y cuándo conviene?', a: 'Es cuando otro banco, financiera o caja cancela tus deudas caras y las consolida en un solo crédito a menor TCEA. Conviene cuando la nueva tasa es claramente menor (por ejemplo, pasar una tarjeta de 65% a un préstamo de 25%) y las comisiones del traslado no se comen el ahorro. Compara ofertas en el portal Retasas de la SBS.' },
    { q: '¿Puedo adelantar pagos sin que me penalicen?', a: 'Sí: en el Perú el pago anticipado y la amortización parcial son derechos del consumidor financiero — la entidad debe aplicarlos con reducción de intereses y sin penalidad, y debe dejarte elegir entre reducir cuota o plazo (para salir antes, elige plazo). Está garantizado por el Código de Protección al Consumidor y las normas de la SBS.' },
    { q: '¿Cómo afecta estar reportado en Infocorp?', a: 'Infocorp (la central de riesgo de Equifax) refleja tu calificación crediticia: Normal, CPP, Deficiente, Dudoso o Pérdida. Una calificación deteriorada te cierra el crédito formal o te lo encarece — incluso para compra de deuda. Por eso conviene actuar antes de caer en mora: refinanciar golpea menos que dejar de pagar.' },
    { q: '¿Cómo salgo de Infocorp una vez que pago?', a: 'La deuda pagada se reporta como cancelada en la siguiente actualización de la entidad (guarda tu constancia de no adeudo). Tu historial no se borra al instante: la calificación mejora progresivamente con los meses al día. Ojo con quienes ofrecen "borrarte de Infocorp" por una comisión: es estafa; lo único que limpia el reporte es pagar.' },
    { q: '¿Qué hago si mi pago no cubre ni los intereses?', a: 'Con TCEA de tarjeta, si pagas menos que el interés mensual el saldo crece solo y el mínimo te condena a pagar por años. Prioriza bajar la tasa: compra de deuda o refinanciación con tu propio banco. La sala detecta este caso y te dice cuánto más necesitas liberar al mes solo para frenar el crecimiento.' },
    { q: '¿Uso mi CTS o mi gratificación para pagar deudas?', a: 'La gratificación de julio o diciembre es el mejor acelerador del plan: un pago extraordinario a la deuda más cara puede recortar meses enteros. La CTS, en cambio, es tu respaldo si te quedas sin trabajo: tócala solo como último recurso y nunca por deudas pequeñas.' },
  ],
  sources: [
    { name: 'SBS — Retasas: comparador de TCEA de tarjetas y préstamos', url: 'https://www.sbs.gob.pe/app/retasas/paginas/retasasInicio.aspx' },
    { name: 'SBS — Central de riesgos y derechos del usuario', url: 'https://www.sbs.gob.pe/usuarios' },
    { name: 'BCRP — Tasas de interés activas del sistema financiero', url: 'https://www.bcrp.gob.pe/' },
  ],
};
