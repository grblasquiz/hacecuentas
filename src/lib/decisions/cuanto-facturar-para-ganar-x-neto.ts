/**
 * Sala de decisión — "¿Cuánto tengo que facturar para ganar X neto?"
 *
 * Patrón META INVERSA. Partís del neto que querés en el bolsillo y reconstruís
 * la facturación bruta mensual que necesitás emitir para que, después de
 * impuestos, la cuota de monotributo/aportes y los gastos fijos del negocio, te
 * queden esos X netos. Math inline determinístico (despeje algebraico).
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const netoDeseado = Math.max(0, num(inputs.netoDeseado));
  const impuestosPct = Math.min(95, Math.max(0, num(inputs.impuestos)));
  const cuota = Math.max(0, num(inputs.cuotaMonotributoOaportes));
  const gastosFijos = Math.max(0, num(inputs.gastosFijosNegocio));

  if (!netoDeseado) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuánto querés que te quede neto por mes. Con eso, tus impuestos, la cuota y los gastos fijos, calculamos cuánto tenés que facturar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Facturación mensual necesaria' },
      scenarios: [],
      nextActions: [
        'Cargá el **neto deseado** (lo que querés que te quede limpio por mes).',
        'Sumá tu **cuota de monotributo o aportes** y tus **gastos fijos del negocio**.',
      ],
    };
  }

  // Despeje: neto = facturacion*(1 - imp) - cuota - gastos
  //   =>  facturacion = (neto + cuota + gastos) / (1 - imp/100)
  const factor = 1 - impuestosPct / 100;
  const facturacion = factor > 0 ? (netoDeseado + cuota + gastosFijos) / factor : Infinity;

  const impuestoMonto = facturacion * (impuestosPct / 100);
  const cargaTotal = impuestoMonto + cuota + gastosFijos;
  const tasaEfectiva = facturacion > 0 ? (cargaTotal / facturacion) * 100 : 0;
  const facturacionAnual = facturacion * 12;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  if (!Number.isFinite(facturacion)) {
    status = 'a';
    tone = 'bad';
    title = 'Con esos impuestos es imposible';
    badge = 'Revisá impuestos';
  } else if (tasaEfectiva >= 50) {
    status = 'tie';
    tone = 'warn';
    title = 'Tenés que facturar bastante: la carga es alta';
    badge = 'Carga alta';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Esta es tu facturación objetivo';
    badge = 'Objetivo claro';
  }

  const detail = Number.isFinite(facturacion)
    ? `Para quedarte ${fmtMoney(netoDeseado)} netos por mes tenés que facturar ${fmtMoney(facturacion)}. De cada peso facturado, ${fmtPct(tasaEfectiva, 0).replace('+', '')} se va en impuestos, cuota y gastos fijos; el resto es tuyo.`
    : `Con ${impuestosPct}% de impuestos no es posible alcanzar un neto positivo: revisá ese porcentaje.`;

  // — Escenarios: facturación para netos +/- 20% —
  const factPara = (neto: number) => (factor > 0 ? (neto + cuota + gastosFijos) / factor : 0);
  const scenarios = [
    {
      label: 'Neto −20%',
      value: fmtMoney(factPara(netoDeseado * 0.8)),
      detail: `Si te conformás con ${fmtMoney(netoDeseado * 0.8)} netos.`,
    },
    {
      label: 'Tu objetivo',
      value: fmtMoney(facturacion),
      detail: `Para ${fmtMoney(netoDeseado)} netos por mes.`,
    },
    {
      label: 'Neto +20%',
      value: fmtMoney(factPara(netoDeseado * 1.2)),
      detail: `Si apuntás a ${fmtMoney(netoDeseado * 1.2)} netos.`,
    },
  ];

  const breakdown = [
    { label: 'Neto que querés', value: fmtMoney(netoDeseado) },
    { label: `+ Impuestos (${impuestosPct}% de la facturación)`, value: fmtMoney(impuestoMonto) },
    { label: '+ Cuota monotributo / aportes', value: fmtMoney(cuota) },
    { label: '+ Gastos fijos del negocio', value: fmtMoney(gastosFijos) },
    { label: 'Facturación mensual necesaria', value: fmtMoney(facturacion), hint: `tasa efectiva ${fmtPct(tasaEfectiva, 0).replace('+', '')}` },
    { label: 'Facturación anual', value: fmtMoney(facturacionAnual), hint: 'útil para ver tu categoría de monotributo' },
  ];

  const nextActions = [
    `Tu meta de facturación es **${fmtMoney(facturacion)} por mes**. Repartila entre tus clientes/ventas para ver si es alcanzable con tu capacidad actual.`,
    `A ${fmtMoney(facturacionAnual)} anuales, **verificá tu categoría de monotributo**: si te acercás al tope, anticipá la recategorización o el pase a Responsable Inscripto.`,
    cuota > 0
      ? `Tu cuota fija (${fmtMoney(cuota)}) pesa más cuanto menos facturás: si tu facturación cae, tu neto cae más rápido. Mantené un mínimo de actividad.`
      : 'Cargá tu cuota de monotributo o aportes: es un costo fijo que tenés que cubrir factures lo que factures.',
    'Si el objetivo de facturación queda lejos, las palancas son tres: **subir precios**, **vender más** o **bajar gastos fijos**. Probá cada una en la sala y mirá cuánto baja la meta.',
  ];

  const notes = [
    'Se despeja la facturación a partir de: neto = facturación × (1 − impuestos) − cuota − gastos fijos. Los impuestos se modelan como un porcentaje único sobre la facturación.',
    'La cuota de monotributo o los aportes se tratan como un costo fijo mensual; los gastos fijos del negocio también. No incluye gastos variables que escalan con las ventas.',
    'La tasa efectiva real depende de tu régimen (monotributo, autónomo, RI): verificá tu alícuota y cuota vigentes en ARCA.',
    'No es asesoramiento contable. Es una guía de planificación: para tu carga impositiva exacta consultá con un contador público matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(facturacion),
      label: 'Facturación mensual necesaria',
      sub: `Para quedarte ${fmtMoney(netoDeseado)} netos. Carga total (impuestos + cuota + gastos): **${fmtPct(tasaEfectiva, 0).replace('+', '')}** de lo que facturás.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-facturar-para-ganar-x-neto',
  title: '¿Cuánto facturar para ganar X neto? Calculadora 2026',
  h1: '¿Cuánto tengo que facturar para ganar X neto?',
  description:
    'Partí del neto que querés en el bolsillo y calculá cuánto tenés que facturar por mes, descontando impuestos, cuota de monotributo o aportes y gastos fijos del negocio. Con facturación anual y tasa efectiva.',
  intro:
    'Sabés cuánto querés ganar limpio, pero no cuánto tenés que facturar para llegar. Esta sala hace el camino inverso: parte del neto deseado y le suma los impuestos, la cuota de monotributo o tus aportes y los gastos fijos del negocio para decirte exactamente cuánto tenés que facturar por mes (y por año) para que te queden esos X netos.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    netoDeseado: 1_800_000,
    impuestos: 30,
    cuotaMonotributoOaportes: 90_000,
    gastosFijosNegocio: 250_000,
  },
  fields: [
    {
      id: 'netoDeseado',
      label: 'Neto que querés ganar ($/mes)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1800000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Lo que querés que te quede limpio en el bolsillo cada mes.',
      group: 'Tu objetivo',
      groupIcon: '🎯',
    },
    {
      id: 'impuestos',
      label: 'Impuestos sobre la facturación',
      type: 'number',
      suffix: '%',
      default: 30,
      min: 0,
      max: 95,
      help: 'Porcentaje aproximado de la facturación que se va en impuestos (IVA, Ganancias, IIBB) según tu régimen.',
      group: 'Costos',
      groupIcon: '📉',
    },
    {
      id: 'cuotaMonotributoOaportes',
      label: 'Cuota monotributo / aportes ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'Tu cuota mensual fija de monotributo, o tus aportes como autónomo.',
      group: 'Costos',
    },
    {
      id: 'gastosFijosNegocio',
      label: 'Gastos fijos del negocio ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '250000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Alquiler, servicios, software, contador: lo que pagás todos los meses pase lo que pase.',
      group: 'Costos',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo' },
    { slug: 'calculadora-break-even-freelance-mes', label: 'Break-even freelance' },
    { slug: 'calculadora-monotributo-vs-responsable-inscripto', label: 'Monotributo vs RI' },
    { slug: 'calculadora-costo-hora-empleado-real', label: 'Costo real de la hora' },
  ],
  howItWorks: `Esta sala invierte la ecuación habitual: en vez de "facturé X, me quedó Y", arranca de la Y que querés.

1. **Tu neto deseado.** El punto de partida: lo que querés que te quede limpio por mes.
2. **Sumar los costos fijos.** Le agrega la cuota de monotributo o tus aportes y los gastos fijos del negocio: son montos que tenés que cubrir factures lo que factures.
3. **Compensar los impuestos.** Como los impuestos se llevan un porcentaje de TODO lo que facturás, divide el subtotal por (1 − impuestos). Así, después de pagar ese porcentaje, queda exactamente tu neto.
4. **Facturación necesaria.** El resultado es cuánto tenés que facturar por mes. Lo anualiza para que cruces el número con tu categoría de monotributo.
5. **Escenarios y palancas.** Muestra cuánto cambia la meta si subís o bajás tu objetivo neto, y deja claro que las palancas para bajar la meta son subir precios, vender más o reducir gastos fijos.`,
  faq: [
    {
      q: '¿Por qué tengo que facturar tanto más que mi objetivo neto?',
      a: 'Porque entre tu facturación y tu bolsillo hay tres filtros: los impuestos (un porcentaje de todo lo que facturás), la cuota fija de monotributo o aportes, y los gastos fijos del negocio. La facturación necesaria los cubre a todos y recién después deja tu neto.',
    },
    {
      q: '¿Cómo sé qué porcentaje de impuestos poner?',
      a: 'Depende de tu régimen. Como Responsable Inscripto sumás IVA, Ganancias e IIBB sobre la facturación. Como monotributista, el peso impositivo está más en la cuota fija que en un porcentaje. Si no estás seguro, empezá con 25–35% y afinalo con tu contador.',
    },
    {
      q: '¿La diferencia entre cuota fija y porcentaje de impuestos importa?',
      a: 'Mucho. La cuota fija (monotributo) pesa más cuando facturás poco: si tu facturación baja, tu neto baja más rápido porque la cuota sigue igual. El porcentaje, en cambio, escala con tus ventas. Por eso esta sala los trata por separado.',
    },
    {
      q: '¿Qué pasa si la facturación necesaria me deja fuera del monotributo?',
      a: 'Si la facturación anual que necesitás supera el tope de la categoría K, te corresponde Responsable Inscripto, con otra carga impositiva. Recalculá entonces con un porcentaje de impuestos más alto y sin cuota fija de monotributo, o revisá nuestra sala "¿Monotributo o RI?".',
    },
    {
      q: '¿Cómo bajo la facturación que necesito?',
      a: 'Hay tres palancas: subir tus precios (facturás lo mismo con menos volumen), vender más (diluís los costos fijos) o bajar gastos fijos (alquiler, software, etc.). Probá cada cambio en la sala y mirá cuánto baja la meta: suele sorprender lo mucho que mueve recortar un gasto fijo.',
    },
    {
      q: '¿Incluye los gastos variables (materiales, comisiones)?',
      a: 'No directamente. Esta sala modela costos fijos y un porcentaje de impuestos. Si tenés costos variables fuertes (materia prima, comisiones por venta), conviene incluirlos en el porcentaje o calcular tu margen aparte con la sala "¿Cuánto cobrar por mi producto?".',
    },
    {
      q: '¿Cada cuánto recalculo mi facturación objetivo?',
      a: 'En Argentina, por la inflación, conviene revisarlo cada pocos meses: tu neto deseado, tu cuota y tus gastos fijos suben con el tiempo, así que la facturación objetivo también. Mantenerla desactualizada te hace trabajar para perder poder de compra.',
    },
    {
      q: '¿Esto es asesoramiento contable?',
      a: 'No. Es una herramienta de planificación para fijar una meta de facturación realista. Tu carga impositiva exacta depende de tu actividad y régimen: consultá con un contador público matriculado y verificá los valores vigentes en ARCA.',
    },
  ],
  sources: [
    { name: 'ARCA — Monotributo y Responsable Inscripto', url: 'https://www.arca.gob.ar/' },
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
  ],
};
