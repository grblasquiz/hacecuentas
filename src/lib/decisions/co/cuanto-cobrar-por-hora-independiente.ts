/**
 * Sala de decisión CO — "¿Cuánto cobrar por hora como independiente?"
 *
 * Patrón TARIFA localizado a Colombia: reconstruye la tarifa hacia atrás desde
 * el neto mensual deseado, sumando los aportes PILA de independiente (salud
 * 12,5% + pensión 16% sobre el 40% del ingreso ≈ 11,4% efectivo, con piso de
 * IBC de 1 SMLV), la retención en la fuente si aplica y los gastos fijos, y
 * dividiendo por las horas FACTURABLES (60-70% de las trabajadas).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

const SMLV_2026 = 1750905;
/** Salud 12,5% + pensión 16% = 28,5% sobre el IBC (40% del ingreso). */
const PILA_SOBRE_IBC = 0.285;

/**
 * Facturación mensual necesaria para que quede `neto` después de PILA,
 * retención y gastos. Resuelve considerando el piso de IBC de 1 SMLV.
 */
function facturacionNecesaria(neto: number, gastos: number, retPct: number): number {
  const ret = retPct / 100;
  // Caso general: IBC = 40% de la facturación → PILA = 11,4% de la facturación.
  const fGeneral = (neto + gastos) / (1 - PILA_SOBRE_IBC * 0.4 - ret);
  if (fGeneral * 0.4 >= SMLV_2026) return fGeneral;
  // Piso: el IBC no puede bajar de 1 SMLV → la PILA es un monto fijo.
  return (neto + gastos + PILA_SOBRE_IBC * SMLV_2026) / (1 - ret);
}

function compute(inputs: Record<string, any>): DecisionResult {
  const netoDeseado = Math.max(0, num(inputs.netoDeseado));
  const horasMes = Math.max(0, num(inputs.horasTrabajadasMes));
  const facturablePct = Math.min(100, Math.max(1, num(inputs.facturablePct) || 65));
  const gastosMes = Math.max(0, num(inputs.gastosMes));
  const retencionPct = Math.min(30, Math.max(0, num(inputs.retencionPct)));

  if (!netoDeseado || !horasMes) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún faltan datos para darte una respuesta',
        detail:
          'Ingresa cuánto quieres que te quede libre al mes y cuántas horas trabajas. Con eso reconstruimos tu tarifa por hora contando la PILA de independiente, la retención y tus gastos.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tarifa por hora a cobrar' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **neto mensual deseado**: lo que quieres que quede después de PILA, retención y gastos.',
        'Ingresa tus **horas trabajadas al mes**: la sala descuenta sola el tiempo no facturable.',
      ],
    };
  }

  const facturacion = facturacionNecesaria(netoDeseado, gastosMes, retencionPct);
  const ibc = Math.max(facturacion * 0.4, SMLV_2026);
  const pila = ibc * PILA_SOBRE_IBC;
  const retencion = facturacion * (retencionPct / 100);
  const pilaEfectivaPct = (pila / facturacion) * 100;

  const horasFacturables = horasMes * (facturablePct / 100);
  const tarifa = horasFacturables > 0 ? facturacion / horasFacturables : 0;

  // Tarifa "ingenua": neto deseado dividido las horas trabajadas totales.
  const tarifaIngenua = netoDeseado / horasMes;
  const brecha = tarifaIngenua > 0 ? (tarifa / tarifaIngenua - 1) * 100 : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (tarifa <= 0) {
    status = 'insufficient';
    tone = 'warn';
    title = 'Revisa los datos: las horas facturables quedan en cero';
    badge = 'Revisa los datos';
  } else if (brecha >= 80) {
    status = 'a';
    tone = 'warn';
    title = 'Tu hora vale bastante más de lo que creías';
    badge = 'Brecha grande';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Esta es tu tarifa por hora, con la PILA ya cubierta';
    badge = 'Tarifa lista';
  }

  const detail = `Para que te queden ${fmtMoney(netoDeseado)} libres al mes necesitas facturar ${fmtMoney(facturacion)} y cobrar ${fmtMoney(tarifa)} por hora facturable. Es ${fmtPct(brecha, 0)} más que la cuenta ingenua de dividir tu meta por las horas: la diferencia se va en la PILA de independiente (${fmtMoney(pila)}, ≈${fmtPct(pilaEfectivaPct, 1)} de lo facturado)${retencionPct > 0 ? `, la retención en la fuente (${fmtMoney(retencion)})` : ''}, tus gastos y las horas que trabajas pero no facturas.`;

  const tarifaCon = (pct: number) => {
    const hf = horasMes * (pct / 100);
    return hf > 0 ? facturacion / hf : 0;
  };
  const scenarios = [
    { label: 'Optimista (75% facturable)', value: fmtMoney(tarifaCon(75)) + '/h', detail: 'Con clientes recurrentes y poco tiempo en propuestas y cobros.' },
    { label: `Tu caso (${facturablePct.toFixed(0)}% facturable)`, value: fmtMoney(tarifa) + '/h', detail: `${horasFacturables.toFixed(0)} horas cobradas de ${horasMes.toFixed(0)} trabajadas.` },
    { label: 'Conservador (55% facturable)', value: fmtMoney(tarifaCon(55)) + '/h', detail: 'Si buscar clientes, cotizar y perseguir pagos te come casi la mitad del tiempo.' },
  ];

  const breakdown = [
    { label: 'Neto mensual deseado', value: fmtMoney(netoDeseado) },
    { label: '+ Gastos fijos del negocio', value: fmtMoney(gastosMes), hint: 'equipo, software, internet, coworking' },
    { label: `+ PILA independiente (salud 12,5% + pensión 16%)`, value: fmtMoney(pila), hint: `sobre IBC de ${fmtMoney(ibc)}${ibc === SMLV_2026 ? ' (piso: 1 SMLV)' : ' (40% de lo facturado)'}` },
    ...(retencionPct > 0 ? [{ label: `+ Retención en la fuente (${fmtPct(retencionPct, 0)})`, value: fmtMoney(retencion), hint: 'te la descuentan al pagarte; es anticipo de renta' }] : []),
    { label: 'Facturación mensual necesaria', value: fmtMoney(facturacion) },
    { label: 'Horas trabajadas al mes', value: `${horasMes.toFixed(0)} h` },
    { label: `Horas facturables (${facturablePct.toFixed(0)}%)`, value: `${horasFacturables.toFixed(0)} h`, hint: 'el resto se va en propuestas, reuniones y administración' },
    { label: 'Tarifa por hora a cobrar', value: fmtMoney(tarifa) + '/h', hint: `vs ${fmtMoney(tarifaIngenua)}/h de la cuenta ingenua` },
  ];

  const nextActions = [
    `Tu piso es **${fmtMoney(tarifa)} por hora facturable**. Cotizar por debajo significa trabajar para pagar la PILA y los gastos, no para ti.`,
    'Convierte la hora en **precio por entregable o por proyecto**: estima las horas reales (con revisiones incluidas), multiplica por tu tarifa y presenta un valor cerrado. Al cliente le da certeza y a ti te premia la eficiencia.',
    `Paga tu PILA como independiente sobre el 40% de lo que facturas (IBC mínimo de 1 SMLV: ${fmtMoney(SMLV_2026)}). Cotizar te da EPS, te suma semanas de pensión y muchas empresas te exigen la planilla para pagarte la cuenta de cobro.`,
    retencionPct > 0
      ? 'La retención en la fuente que te descuentan es un anticipo del impuesto de renta, no plata perdida: guarda los certificados, porque si al declarar tu impuesto es menor, esa diferencia se te devuelve.'
      : 'Confirma si tus clientes te aplican retención en la fuente por honorarios (típicamente 10-11% para no declarantes): si te la descuentan y no la contaste, tu neto real queda por debajo de la meta.',
    'Sube tu tarifa al menos una vez al año: los contratos por prestación de servicios no tienen reajuste automático, y una tarifa congelada pierde contra el IPC (~5% anual).',
  ];

  const notes = [
    'La PILA de independiente se calcula como salud (12,5%) más pensión (16%) sobre un IBC del 40% de lo facturado, con piso de 1 SMLV: en la práctica ronda el 11,4% de tus ingresos brutos. No incluye ARL, que es obligatoria solo en contratos de riesgo IV-V o si quieres cubrirte voluntariamente.',
    'La retención en la fuente se modela como un porcentaje fijo sobre lo facturado. Tu tarifa efectiva depende de si eres declarante, del tipo de contrato y de la depuración: es un anticipo de renta, no un impuesto final.',
    'El porcentaje facturable (60-70% típico) reconoce que buscar clientes, cotizar, facturar y cobrar también es trabajo: si no lo cargas a la tarifa, lo regalas.',
    'Es una guía para fijar tu piso de tarifa, no asesoría tributaria: para tu caso exacto (declaración de renta, deducciones) consulta a un contador.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(tarifa) + '/h',
      label: 'Tarifa por hora a cobrar',
      sub: `Para quedarte **${fmtMoney(netoDeseado)}** libres al mes, facturando ${fmtMoney(facturacion)} en ${horasFacturables.toFixed(0)} horas facturables.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-hora-independiente',
  title: '¿Cuánto cobrar por hora como independiente en Colombia? 2026',
  h1: '¿Cuánto debo cobrar por hora como independiente?',
  description:
    'Calcula tu tarifa por hora como independiente o freelance en Colombia partiendo del neto que quieres ganar: suma la PILA (salud y pensión sobre el 40% del ingreso), la retención en la fuente y tus gastos, y divide por tus horas facturables reales.',
  intro:
    'Si facturas por prestación de servicios en Colombia, tu hora no vale "lo que ganabas como empleado dividido 160": de cada cuenta de cobro salen la PILA de independiente (salud y pensión sobre el 40% de tus ingresos), la retención en la fuente si aplica y los gastos de tu operación — y encima solo el 60-70% de tus horas se facturan, porque cotizar, facturar y cobrar también consumen tiempo. Esta sala parte del neto mensual que quieres y reconstruye hacia atrás la tarifa por hora que de verdad necesitas cobrar.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    netoDeseado: 4500000,
    horasTrabajadasMes: 160,
    facturablePct: 65,
    gastosMes: 400000,
    retencionPct: 10,
  },
  fields: [
    { id: 'netoDeseado', label: 'Neto que quieres al mes', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '4.500.000', help: 'Lo que quieres que te quede libre después de PILA, retención y gastos del negocio.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'horasTrabajadasMes', label: 'Horas que trabajas al mes', type: 'number', suffix: 'h', required: true, default: 160, min: 1, max: 320, help: 'Todas las horas dedicadas al trabajo, incluyendo propuestas, reuniones y administración.', group: 'Tu meta' },
    { id: 'facturablePct', label: '% de horas facturables', type: 'number', suffix: '%', default: 65, min: 10, max: 100, help: 'Qué parte de tus horas termina en una cuenta de cobro. Para un independiente típico: 60-70%.', group: 'Tu meta' },
    { id: 'gastosMes', label: 'Gastos fijos del negocio', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '400.000', help: 'Computador, software, internet, coworking, celular: prorrateados al mes.', group: 'Descuentos', groupIcon: '📉' },
    { id: 'retencionPct', label: 'Retención en la fuente', type: 'number', suffix: '%', default: 0, min: 0, max: 30, advanced: true, help: 'Si tus clientes te retienen por honorarios (típico: 10-11%). Déjalo en 0 si no te aplican retención.', group: 'Descuentos' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-pila-independientes-colombia-2026', label: 'PILA de independientes' },
    { slug: 'co/calculadora-honorarios-prestacion-servicios-colombia-retencion', label: 'Honorarios y retención' },
    { slug: 'co/calculadora-ibc-independientes-contratista-colombia-2026-40-porciento', label: 'IBC del independiente (40%)' },
    { slug: 'co/calculadora-costo-hora-empleado-empresa-colombia-2026', label: 'Costo hora de un empleado' },
  ],
  howItWorks: `Esta sala calcula tu tarifa desde lo que necesitas que te quede, no desde "lo que cobra el mercado".

1. **Tu neto deseado.** El punto de partida es la plata que quieres libre cada mes, ya pagado todo.
2. **La PILA de independiente.** Como contratista cotizas salud (12,5%) y pensión (16%) sobre un IBC del 40% de lo que facturas — cerca del 11,4% efectivo de tus ingresos — con un piso: el IBC nunca baja de 1 SMLV ($1.750.905 en 2026). La sala lo suma automáticamente.
3. **Retención y gastos.** Si tus clientes te aplican retención en la fuente por honorarios, se agrega como porcentaje de lo facturado; tus gastos fijos (equipo, software, internet) se suman como costo mensual.
4. **Las horas que de verdad cobras.** De tus horas trabajadas, solo una parte termina en cuenta de cobro: cotizar, reunirse, facturar y perseguir pagos no se facturan. Con el 60-70% típico, tus 160 horas se vuelven 96-112 cobrables.
5. **La tarifa piso.** Divide la facturación necesaria por esas horas facturables: ese es el mínimo por hora que puedes cobrar sin trabajar a pérdida, y la base para cotizar por proyecto.`,
  faq: [
    { q: '¿Cuánto paga de PILA un independiente en Colombia?', a: 'Salud (12,5%) más pensión (16%) suman 28,5%, pero se aplican sobre un IBC del 40% de tus ingresos mensuales: en la práctica pagas cerca del 11,4% de lo que facturas. Ojo con el piso: el IBC no puede ser inferior a 1 SMLV ($1.750.905 en 2026), así que quien factura poco paga proporcionalmente más.' },
    { q: '¿Estoy obligado a pagar PILA si trabajo por prestación de servicios?', a: 'Sí, si tus ingresos mensuales son de 1 SMLV o más. Además de la obligación legal, muchas empresas exigen la planilla PILA pagada antes de girar la cuenta de cobro. Cotizar también te da atención en salud por la EPS y va sumando semanas para tu pensión.' },
    { q: '¿Qué porcentaje de retención en la fuente me aplican por honorarios?', a: 'Depende de tu situación: la tarifa típica por honorarios y servicios es del 10% u 11% para personas naturales no declarantes, y puede variar según el concepto del contrato. Es un anticipo del impuesto de renta: si al declarar tu impuesto final es menor que lo retenido, la diferencia se te devuelve.' },
    { q: '¿Por qué solo el 60-70% de mis horas son facturables?', a: 'Porque ser independiente es también dirigir un negocio de una persona: buscar clientes, preparar cotizaciones, reunirte, facturar, pagar la PILA y perseguir pagos consume entre 3 y 4 de cada 10 horas. Si divides tu meta solo entre las horas de trabajo "de verdad", terminas regalando todas las demás.' },
    { q: '¿Cómo comparo mi tarifa de independiente con un salario de empleado?', a: 'No compares el neto contra el neto: al independiente nadie le paga prima, cesantías, vacaciones ni aportes patronales. Como regla rápida, para igualar la plata real de un salario como empleado necesitas facturar entre un 40% y un 50% más. Esta sala ya incorpora la parte de PILA y tiempo no facturable de esa brecha.' },
    { q: '¿Me conviene cobrar por hora o por proyecto?', a: 'Usa la hora como unidad interna y cotiza por proyecto hacia afuera: estima las horas que tomará (con revisiones), multiplícalas por tu tarifa y entrega un precio cerrado. Así el cliente no cuestiona tu velocidad y tú capturas el beneficio de volverte más eficiente.' },
    { q: '¿Cada cuánto debo subir mi tarifa?', a: 'Mínimo una vez al año. Los contratos por prestación de servicios no tienen reajuste automático como el salario mínimo, así que una tarifa congelada pierde contra la inflación (~5% anual en 2026). El mejor momento para subirla es al renovar contrato o al cerrar un cliente nuevo, no a mitad de proyecto.' },
    { q: '¿Debo cotizar ARL como independiente?', a: 'Es obligatoria si tu contrato implica actividades de riesgo IV o V (construcción, alturas, ciertas operaciones industriales); en riesgos I a III es voluntaria en la mayoría de los casos, aunque algunos contratantes la exigen. Cuesta poco comparada con salud y pensión y te cubre accidentes laborales, así que vale la pena considerarla.' },
  ],
  sources: [
    { name: 'Ministerio de Salud — Aportes y planilla PILA', url: 'https://www.minsalud.gov.co/' },
    { name: 'DIAN — Retención en la fuente', url: 'https://www.dian.gov.co/' },
    { name: 'Ministerio del Trabajo — Salario mínimo 2026', url: 'https://www.mintrabajo.gov.co/' },
  ],
};
