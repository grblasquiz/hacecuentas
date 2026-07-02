/**
 * Sala de decisión — "¿Puedo mantener este auto?"
 *
 * Patrón BREAKDOWN (una columna). Suma todos los costos mensuales de tener el auto
 * (cuota, seguro, patente prorrateada, combustible, service prorrateado,
 * estacionamiento, peajes) y lo mide contra tu ingreso neto. Regla práctica: el
 * auto no debería comerse más del 15–20% de tu ingreso. Devuelve el % real.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const cuota = Math.max(0, num(inputs.cuota));
  const seguro = Math.max(0, num(inputs.seguroMensual));
  const patente = Math.max(0, num(inputs.patenteMensual));
  const combustible = Math.max(0, num(inputs.combustibleMensual));
  const service = Math.max(0, num(inputs.serviceMensual));
  const estacionamiento = Math.max(0, num(inputs.estacionamiento));
  const peajes = Math.max(0, num(inputs.peajes));
  const ingreso = Math.max(0, num(inputs.ingresoNeto));

  const costoTotal = cuota + seguro + patente + combustible + service + estacionamiento + peajes;

  if (!ingreso || costoTotal <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu ingreso neto mensual y los costos del auto (cuota, seguro, patente, combustible, service). Con eso calculamos qué porcentaje de tu sueldo se lleva el auto.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'El auto se lleva' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ingreso neto** (lo que te queda en mano por mes).',
        'Sumá los **costos del auto**: cuota, seguro, patente, combustible y service.',
      ],
    };
  }

  const pct = (costoTotal / ingreso) * 100;
  const sobra = ingreso - costoTotal;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (pct < 15) {
    status = 'b'; // B = bien
    tone = 'good';
    title = 'Sí, podés mantenerlo con holgura';
    badge = 'Sostenible';
    detail = `El auto se lleva ${fmtPct(pct, 0)} de tu ingreso (${fmtMoney(costoTotal)} de ${fmtMoney(ingreso)}). Estás por debajo del 15% recomendado: el auto no compromete tu economía.`;
  } else if (pct <= 25) {
    status = 'tie';
    tone = 'neutral';
    title = 'Lo bancás, pero está ajustado';
    badge = 'Ajustado';
    detail = `El auto se lleva ${fmtPct(pct, 0)} de tu ingreso (${fmtMoney(costoTotal)} de ${fmtMoney(ingreso)}). Es sostenible pero está en la zona alta (15–25%): cuidá que no crezca y tené un colchón para imprevistos.`;
  } else {
    status = 'a'; // A = riesgo
    tone = 'warn';
    title = 'Atención: el auto te está apretando';
    badge = 'Riesgoso';
    detail = `El auto se lleva ${fmtPct(pct, 0)} de tu ingreso (${fmtMoney(costoTotal)} de ${fmtMoney(ingreso)}), muy por encima del 25%. A este ritmo te queda poco margen para ahorrar o para un imprevisto. Conviene revisar gastos o el plan.`;
  }

  const scenarios = [
    {
      label: 'Sin la cuota',
      value: fmtPct(ingreso > 0 ? ((costoTotal - cuota) / ingreso) * 100 : 0, 0),
      detail: cuota > 0
        ? `Si terminás de pagar la cuota de ${fmtMoney(cuota)}, el auto baja a ese % de tu ingreso.`
        : 'No tenés cuota: este es tu costo de uso puro.',
    },
    {
      label: 'Hoy',
      value: fmtPct(pct, 0),
      detail: `Costo total de ${fmtMoney(costoTotal)} sobre tu ingreso.`,
    },
    {
      label: 'Combustible +30%',
      value: fmtPct(ingreso > 0 ? ((costoTotal + combustible * 0.3) / ingreso) * 100 : 0, 0),
      detail: 'Si sube la nafta o manejás más, el auto pesa todavía más.',
    },
  ];

  const breakdown = [
    { label: 'Cuota del crédito', value: fmtMoney(cuota), hint: cuota > 0 ? `${fmtPct((cuota / costoTotal) * 100, 0)} del costo del auto` : 'Sin financiación' },
    { label: 'Seguro', value: fmtMoney(seguro) },
    { label: 'Patente (prorrateada)', value: fmtMoney(patente) },
    { label: 'Combustible', value: fmtMoney(combustible) },
    { label: 'Service y mantenimiento', value: fmtMoney(service) },
    { label: 'Estacionamiento / cochera', value: fmtMoney(estacionamiento) },
    { label: 'Peajes', value: fmtMoney(peajes) },
    { label: 'Costo mensual total del auto', value: fmtMoney(costoTotal), hint: `${fmtPct(pct, 0)} de tu ingreso` },
    { label: 'Te queda después del auto', value: fmtMoney(sobra) },
  ];

  const nextActions = [
    pct > 25
      ? `El auto se lleva ${fmtPct(pct, 0)} de tu ingreso. Empezá por el rubro más grande: revisá la **cuota** (¿podés precancelar o refinanciar?) y el **seguro** (cotizá en 3 aseguradoras, suele bajar 20–30%).`
      : `El auto se lleva ${fmtPct(pct, 0)} de tu ingreso, dentro de lo sano. Igual cotizá el **seguro** una vez por año: es el gasto que más fácil baja.`,
    'Apartá un **fondo para imprevistos del auto** (gomería, frenos, embrague): el costo real no es solo el mensual, hay golpes grandes que aparecen de golpe.',
    cuota > 0
      ? 'Si la cuota es lo que más pesa, evaluá precancelar parte del crédito o pasar a un auto que requiera menos financiación.'
      : 'Sin cuota, tu mayor variable es el combustible: agrupá viajes y mantené las gomas a presión para gastar menos.',
    'Si el auto supera el 25% de tu ingreso de forma sostenida, considerá bajar de gama o complementar con transporte público: usá la sala "¿Auto, transporte público, taxi o app?".',
  ];

  const notes = [
    'La regla del 15–20% es una guía práctica de presupuesto, no una norma. Lo importante es que el auto no te impida ahorrar ni cubrir imprevistos.',
    'Prorrateá la patente (anual ÷ 12) y el service (gasto anual estimado ÷ 12) para que el mensual refleje el costo real promedio.',
    'Orientativo, no es asesoramiento financiero. No incluye la depreciación del auto (pérdida de valor), que es un costo real aunque no salga de tu bolsillo cada mes.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtPct(pct, 0),
      label: 'El auto se lleva esto de tu ingreso',
      sub: `Costo mensual del auto: **${fmtMoney(costoTotal)}** sobre un ingreso de **${fmtMoney(ingreso)}**.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-mantener-este-auto',
  title: '¿Puedo mantener este auto? Test de presupuesto 2026',
  h1: '¿Puedo mantener este auto?',
  description:
    'Sumá cuota, seguro, patente, combustible y service y descubrí qué porcentaje de tu ingreso se lleva el auto. Si supera el 20–25%, te está apretando. Te decimos qué ajustar.',
  intro:
    'Comprar el auto es la mitad: lo que de verdad pesa es mantenerlo todos los meses. Esta sala suma cuota, seguro, patente, combustible, service, cochera y peajes, y lo mide contra tu ingreso. Si el auto se lleva más del 20–25% de lo que ganás, te está apretando, y te decimos por dónde empezar a recortar.',
  icon: '🚙',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    cuota: 350000,
    seguroMensual: 100000,
    patenteMensual: 47000,
    combustibleMensual: 180000,
    serviceMensual: 60000,
    estacionamiento: 90000,
    peajes: 30000,
    ingresoNeto: 1500000,
  },
  fields: [
    {
      id: 'ingresoNeto',
      label: 'Tu ingreso neto mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Lo que te queda en mano por mes, sumando todos tus ingresos.',
      group: 'Tu ingreso',
      groupIcon: '💰',
    },
    {
      id: 'cuota',
      label: 'Cuota del crédito',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '350000',
      help: 'Cuota mensual del crédito prendario o leasing. Si lo pagaste, dejá 0.',
      group: 'Costos del auto',
      groupIcon: '🚗',
    },
    {
      id: 'seguroMensual',
      label: 'Seguro mensual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '100000',
      help: 'Cuota mensual del seguro.',
      group: 'Costos del auto',
    },
    {
      id: 'patenteMensual',
      label: 'Patente (mensual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '47000',
      help: 'Patente anual dividida por 12.',
      group: 'Costos del auto',
    },
    {
      id: 'combustibleMensual',
      label: 'Combustible mensual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '180000',
      help: 'Lo que cargás de nafta o gasoil por mes.',
      group: 'Costos del auto',
    },
    {
      id: 'serviceMensual',
      label: 'Service (mensual)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '60000',
      help: 'Mantenimiento anual estimado dividido por 12 (service, cubiertas).',
      group: 'Costos del auto',
    },
    {
      id: 'estacionamiento',
      label: 'Estacionamiento / cochera',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'Cochera fija o estacionamiento mensual.',
      group: 'Costos del auto',
    },
    {
      id: 'peajes',
      label: 'Peajes',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '30000',
      help: 'Gasto mensual en peajes.',
      group: 'Costos del auto',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota del crédito' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano' },
  ],
  howItWorks: `La sala mide cuánto de tu ingreso se lleva tener el auto y lo compara con un umbral de presupuesto sano.

1. **Costo mensual total.** Suma cuota, seguro, patente prorrateada, combustible, service prorrateado, estacionamiento y peajes. Es lo que el auto te saca del bolsillo cada mes.
2. **Porcentaje del ingreso.** Divide ese costo por tu ingreso neto: es el indicador que decide.
3. **Veredicto por umbral.** Menos del 15% es holgado; entre 15% y 25% es sostenible pero ajustado; más del 25% es riesgoso y conviene actuar.
4. **Lo que te queda.** Muestra cuánta plata te sobra después del auto, para que veas si todavía podés ahorrar.
5. **Escenarios.** Calcula tu situación sin la cuota (cuando termines de pagar) y con el combustible más caro, para anticiparte.`,
  faq: [
    {
      q: '¿Cuánto de mi sueldo debería gastar en el auto?',
      a: 'Como guía, el auto no debería llevarse más del 15–20% de tu ingreso neto, contando todos los costos (cuota, seguro, patente, combustible, service). Hasta 25% es sostenible si tenés colchón; por encima de eso, te aprieta y conviene ajustar.',
    },
    {
      q: '¿Qué costos del auto tengo que contar?',
      a: 'Todos los recurrentes: cuota del crédito, seguro, patente, combustible, service y mantenimiento, estacionamiento o cochera y peajes. El error más común es mirar solo la cuota y olvidar el resto, que suele ser igual o mayor.',
    },
    {
      q: '¿Cómo prorrateo la patente y el service que pago una vez al año?',
      a: 'Dividilos por 12 para llevarlos a mensual. Por ejemplo, una patente anual de $560.000 son unos $47.000 por mes. Así el costo mensual refleja el promedio real, sin sorpresas cuando llega el vencimiento.',
    },
    {
      q: 'El auto me da más del 25% del ingreso, ¿qué hago?',
      a: 'Empezá por el gasto más grande. Si es la cuota, evaluá precancelar o refinanciar; si es el seguro, cotizá en varias aseguradoras (baja 20–30% fácil). Si nada alcanza, considerá bajar de gama o complementar con transporte público.',
    },
    {
      q: '¿Incluye la depreciación del auto?',
      a: 'No, porque la depreciación no sale de tu bolsillo cada mes. Pero es un costo real: el auto pierde valor con el tiempo. Para esa cuenta usá la sala "¿Me conviene comprar un auto nuevo o usado?".',
    },
    {
      q: '¿Conviene tener auto o usar apps y transporte público?',
      a: 'Depende de cuánto lo uses. Si manejás poco, el costo fijo del auto (seguro, patente, cuota) puede ser más caro que pagar viajes sueltos. Compará tu caso con la sala "¿Auto, transporte público, taxi o app?".',
    },
    {
      q: '¿Esto reemplaza un presupuesto completo?',
      a: 'No. Es un test enfocado en el auto. Para ver tu presupuesto entero (vivienda, gastos, ahorro) usá la regla 50/30/20: el transporte entra dentro del 50% de necesidades, junto con vivienda y comida.',
    },
  ],
  sources: [
    { name: 'Regla 50/30/20 de presupuesto personal' },
    { name: 'Superintendencia de Seguros de la Nación', url: 'https://www.argentina.gob.ar/ssn' },
  ],
};
