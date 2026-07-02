/**
 * Sala de decisión — "¿Cuánto alquiler puedo pagar?"
 *
 * Patrón VIVIENDA / BREAKDOWN. La regla sana: el alquiler MÁS expensas no debería
 * superar el 30-35% de tu ingreso, una vez descontadas las deudas. Esta sala
 * calcula el alquiler máximo saludable, lo cruza con servicios y ahorro objetivo,
 * y muestra el reparto de tu ingreso.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoFamiliar));
  const deudas = Math.max(0, num(inputs.deudas));
  const expensas = Math.max(0, num(inputs.expensasEstimadas));
  const servicios = Math.max(0, num(inputs.serviciosEstimados));
  const ahorroObjetivoPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu ingreso familiar neto. Con eso calculamos cuánto alquiler podés pagar de forma saludable, descontando deudas, servicios y tu objetivo de ahorro.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Alquiler máximo saludable' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ingreso familiar neto** (lo que entra en mano por mes).',
        'Sumá tus **deudas, servicios estimados** y tu **objetivo de ahorro** para afinar el resultado.',
      ],
    };
  }

  // Ingreso disponible para vivienda = ingreso − deudas.
  const ingresoNetoDeudas = Math.max(0, ingreso - deudas);

  // Tres umbrales de "carga de vivienda" (alquiler + expensas) sobre el ingreso.
  // El estándar internacional es 30%; 35% es el techo sano local.
  const techo30 = ingreso * 0.30;
  const techo35 = ingreso * 0.35;
  // Recomendado descontando deudas y dejando lugar al ahorro objetivo.
  const margenAhorro = ingreso * (ahorroObjetivoPct / 100);
  const recomendadoCarga = Math.max(0, Math.min(techo30, ingresoNetoDeudas - margenAhorro - servicios));

  // El "alquiler" puro = carga − expensas (las expensas van dentro del 30%).
  const alquilerMax30 = Math.max(0, techo30 - expensas);
  const alquilerMax35 = Math.max(0, techo35 - expensas);
  const alquilerRecomendado = Math.max(0, recomendadoCarga - expensas);

  const cargaRecomendadaPct = ingreso > 0 ? ((alquilerRecomendado + expensas) / ingreso) * 100 : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (alquilerRecomendado >= alquilerMax30 * 0.9 && deudas <= ingreso * 0.2) {
    status = 'b';
    tone = 'good';
    title = 'Tenés margen sano para alquilar';
    badge = 'Margen sano';
  } else if (alquilerRecomendado > 0) {
    status = 'tie';
    tone = 'neutral';
    title = 'Podés alquilar, pero ajustado';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Con estos números el alquiler te aprieta';
    badge = 'Apretado';
  }
  detail = `Con un ingreso de ${fmtMoney(ingreso)}, tu alquiler máximo saludable es ${fmtMoney(alquilerRecomendado)} (más ${fmtMoney(expensas)} de expensas = ${cargaRecomendadaPct.toFixed(0)}% del ingreso). El techo absoluto, estirándote al 35%, es ${fmtMoney(alquilerMax35)} de alquiler, pero ahí queda poco aire para deudas, servicios y ahorro.`;

  const scenarios = [
    {
      label: 'Cómodo (30% con ahorro)',
      value: fmtMoney(alquilerRecomendado),
      detail: `Deja lugar a tu ahorro objetivo (${ahorroObjetivoPct}%) y a deudas. Es el número recomendado.`,
    },
    {
      label: 'Estándar (30% del ingreso)',
      value: fmtMoney(alquilerMax30),
      detail: 'La regla clásica: alquiler + expensas ≤ 30% del ingreso.',
    },
    {
      label: 'Techo (35% del ingreso)',
      value: fmtMoney(alquilerMax35),
      detail: 'El máximo que conviene no superar. Por encima, la vivienda te ahoga.',
    },
  ];

  const breakdown = [
    { label: 'Ingreso familiar neto', value: fmtMoney(ingreso) },
    { label: '− Deudas mensuales', value: '-' + fmtMoney(deudas).replace('-', ''), hint: 'Cuotas que pagás igual' },
    { label: '− Servicios estimados', value: '-' + fmtMoney(servicios).replace('-', ''), hint: 'Luz, gas, agua, internet' },
    { label: `− Ahorro objetivo (${ahorroObjetivoPct}%)`, value: '-' + fmtMoney(margenAhorro).replace('-', '') },
    { label: 'Disponible para vivienda', value: fmtMoney(Math.max(0, ingresoNetoDeudas - servicios - margenAhorro)) },
    { label: 'Expensas estimadas', value: fmtMoney(expensas), hint: 'Cuentan dentro del 30%' },
    { label: 'Alquiler máximo saludable', value: fmtMoney(alquilerRecomendado), hint: `${cargaRecomendadaPct.toFixed(0)}% del ingreso con expensas` },
  ];

  const nextActions = [
    `Buscá alquileres de hasta **${fmtMoney(alquilerRecomendado)}** (más expensas): así te queda aire para imprevistos y para ahorrar.`,
    `No pases de **${fmtMoney(alquilerMax35)}** de alquiler bajo ningún concepto: arriba del 35% del ingreso, la vivienda te deja sin margen.`,
    deudas > ingreso * 0.2
      ? `Tus deudas se llevan ${(deudas / ingreso * 100).toFixed(0)}% del ingreso: bajándolas, te liberás plata para un mejor alquiler o más ahorro.`
      : 'Antes de firmar, dejá un fondo para depósito, comisión y los primeros meses: la entrada cuesta más que un alquiler.',
    'Recordá que el alquiler **se ajusta** durante el contrato: tomá el techo de hoy con margen para los aumentos.',
  ];

  const notes = [
    'La regla de referencia es que el alquiler más expensas no supere el 30% del ingreso (35% como techo). Es una guía de salud financiera, no una norma legal.',
    'El cálculo descuenta deudas, servicios y tu ahorro objetivo para darte un número sostenible, no solo el máximo teórico.',
    'No incluye el costo de entrada (depósito, comisión) ni los aumentos futuros del contrato: tomá el resultado con margen.',
    'No es asesoramiento financiero. Es una guía orientativa para presupuestar; adaptala a tu situación y, ante dudas, consultá a un profesional matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(alquilerRecomendado),
      label: 'Alquiler máximo saludable',
      sub: `Más ${fmtMoney(expensas)} de expensas = ${cargaRecomendadaPct.toFixed(0)}% de tu ingreso. Techo absoluto: ${fmtMoney(alquilerMax35)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-alquiler-puedo-pagar',
  title: '¿Cuánto alquiler puedo pagar? Calculá tu tope sano 2026',
  h1: '¿Cuánto alquiler puedo pagar?',
  description:
    'Calculá el alquiler máximo que podés pagar sin ahogarte, usando la regla del 30-35% del ingreso, descontando deudas, servicios y tu objetivo de ahorro. Con el reparto de tu ingreso.',
  intro:
    'Antes de salir a buscar departamento conviene saber hasta dónde llegás. La regla sana es que el alquiler más expensas no supere el 30% de tu ingreso (35% como techo). Esta sala calcula tu alquiler máximo saludable descontando deudas, servicios y lo que querés ahorrar, y te muestra cómo queda repartido tu ingreso para que no te quedes corto a fin de mes.',
  icon: '🔑',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingresoFamiliar: 2200000,
    deudas: 150000,
    expensasEstimadas: 90000,
    serviciosEstimados: 130000,
    ahorroObjetivo: 10,
  },
  fields: [
    {
      id: 'ingresoFamiliar',
      label: 'Ingreso familiar neto',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2200000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'La suma de lo que entra en mano por mes en tu grupo familiar.',
      group: 'Tus ingresos',
      groupIcon: '💵',
    },
    {
      id: 'deudas',
      label: 'Deudas mensuales',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '150000',
      profileKey: 'finanzas.deudas',
      help: 'Cuotas de tarjeta, préstamos u otras deudas que pagás cada mes.',
      group: 'Tus gastos',
      groupIcon: '🧾',
    },
    {
      id: 'expensasEstimadas',
      label: 'Expensas estimadas',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'Cuánto pagarías de expensas en la zona/tipo de propiedad que buscás. Cuentan dentro del 30%.',
      group: 'Tus gastos',
    },
    {
      id: 'serviciosEstimados',
      label: 'Servicios estimados',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '130000',
      help: 'Luz, gas, agua e internet por mes.',
      group: 'Tus gastos',
    },
    {
      id: 'ahorroObjetivo',
      label: 'Objetivo de ahorro',
      type: 'number',
      suffix: '%',
      recommended: true,
      default: 10,
      min: 0,
      max: 100,
      placeholder: '10',
      help: 'Qué porcentaje de tu ingreso querés guardar cada mes (la regla 50-30-20 sugiere 20%).',
      group: 'Tu meta',
      groupIcon: '🎯',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-aumento-alquiler-trimestral-cuatrimestral-semestral', label: 'Aumento del alquiler' },
    { slug: 'calculadora-actualizacion-alquiler-icl', label: 'Actualización de alquiler (ICL)' },
    { slug: 'calculadora-alquiler-vs-comprar', label: 'Alquilar vs comprar' },
  ],
  howItWorks: `Esta sala traduce tu ingreso en un alquiler que podés sostener sin ahogarte.

1. **Punto de partida.** Toma tu ingreso familiar neto y le resta las deudas mensuales que pagás igual.
2. **Regla del 30-35%.** Calcula el techo clásico: alquiler más expensas no debería superar el 30% del ingreso (35% como máximo absoluto).
3. **Servicios y ahorro.** Reserva un lugar para los servicios (luz, gas, agua, internet) y para tu objetivo de ahorro, para que el alquiler no se coma todo.
4. **Alquiler máximo saludable.** Resta las expensas del techo recomendado para darte el alquiler puro que podés pagar de forma cómoda.
5. **Tres niveles.** Muestra el cómodo (con ahorro), el estándar (30%) y el techo (35%), para que elijas con criterio según tu situación.`,
  faq: [
    {
      q: '¿Qué porcentaje del sueldo se puede gastar en alquiler?',
      a: 'La regla sana es que el alquiler más las expensas no superen el 30% de tu ingreso, con un techo absoluto del 35%. Por encima de eso, la vivienda te deja sin margen para deudas, ahorro e imprevistos.',
    },
    {
      q: '¿Las expensas cuentan dentro del 30%?',
      a: 'Sí. Lo que importa es el costo total de vivir ahí, no solo el alquiler. Por eso el 30% se mide sobre alquiler más expensas, y esta sala te da el alquiler puro ya descontando las expensas estimadas.',
    },
    {
      q: '¿Por qué se descuentan las deudas?',
      a: 'Porque las cuotas de tarjeta o préstamos las pagás sí o sí. Si ya se llevan una parte grande de tu ingreso, el alquiler que podés sostener baja. La sala las resta para darte un número realista.',
    },
    {
      q: '¿Y si tengo ingresos variables?',
      a: 'Usá un promedio conservador de tus últimos meses, tirando para abajo. Es mejor calcular el alquiler sobre un ingreso prudente que firmar un contrato que no podés sostener en los meses flojos.',
    },
    {
      q: '¿Debería gastar el máximo que me da?',
      a: 'No. El máximo es un techo, no una meta. Cuanto más bajo el alquiler respecto a tu ingreso, más aire te queda para ahorrar, para imprevistos y para los aumentos del contrato. Apuntá al número cómodo, no al techo.',
    },
    {
      q: '¿El cálculo considera los aumentos del alquiler?',
      a: 'No directamente: te da el techo de hoy. Como el alquiler se ajusta durante el contrato, conviene tomar un número con margen para que los aumentos no te dejen fuera de presupuesto en unos meses.',
    },
    {
      q: '¿Cuánto necesito además del primer mes?',
      a: 'La entrada suele incluir depósito (un mes), comisión inmobiliaria y el primer alquiler por adelantado. Es bastante más que un alquiler: tené ese efectivo reservado antes de firmar.',
    },
    {
      q: '¿Esto reemplaza un presupuesto completo?',
      a: 'No. Es una guía orientativa para el alquiler, no asesoramiento financiero. Para un presupuesto completo combinala con la regla 50/30/20 y, ante dudas, consultá a un profesional matriculado.',
    },
  ],
  sources: [
    { name: 'Regla 50/30/20 de presupuesto personal', url: 'https://hacecuentas.com/regla-50-30-20' },
  ],
};
