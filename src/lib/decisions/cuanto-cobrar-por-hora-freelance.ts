/**
 * Sala de decisión — "¿Cuánto tengo que cobrar por hora como freelance?"
 *
 * Patrón TARIFA. La hora que cobrás NO es tu ingreso objetivo dividido tus
 * horas: hay que descontar impuestos, gastos de equipamiento, clientes que no
 * pagan y el tiempo comercial no facturable (propuestas, reuniones, admin). Esta
 * sala parte de tu ingreso NETO deseado y reconstruye hacia atrás la tarifa
 * bruta por hora que necesitás cobrar para que, después de todo eso, te quede.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingresoObjetivo = Math.max(0, num(inputs.ingresoNetoObjetivo));
  const horasFacturables = Math.max(0, num(inputs.horasFacturablesMes));
  const impuestosPct = Math.min(90, Math.max(0, num(inputs.impuestos)));
  const equipamientoMes = Math.max(0, num(inputs.equipamientoMes));
  const impagosPct = Math.min(90, Math.max(0, num(inputs.porcentajeClientesImpagos)));
  const comercialPct = Math.min(90, Math.max(0, num(inputs.tiempoComercialNoFacturable)));

  if (!ingresoObjetivo || !horasFacturables) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá cuánto querés ganar neto por mes y cuántas horas podés facturar realmente. Con eso reconstruimos la tarifa por hora que necesitás cobrar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tarifa por hora a cobrar' },
      scenarios: [],
      nextActions: [
        'Cargá tu **ingreso neto objetivo** (lo que querés que te quede por mes).',
        'Cargá tus **horas facturables reales** por mes (no las 160 teóricas: las que de verdad facturás).',
      ],
    };
  }

  // Ingreso bruto que necesito antes de impuestos para que quede el neto objetivo,
  // sumando los gastos de equipamiento (que también pago con lo que facturo).
  const brutoNecesario = (ingresoObjetivo + equipamientoMes) / (1 - impuestosPct / 100);

  // Horas que REALMENTE cobro: descuento impagos (no me pagan) y tiempo comercial
  // no facturable (esas horas no generan factura pero igual las trabajo).
  const horasCobradas =
    horasFacturables * (1 - impagosPct / 100) * (1 - comercialPct / 100);

  const tarifaHora = horasCobradas > 0 ? brutoNecesario / horasCobradas : 0;

  // Tarifa "ingenua" (lo que cobraría alguien que NO ajusta) para mostrar la brecha.
  const tarifaIngenua = ingresoObjetivo / horasFacturables;
  const recargo = tarifaIngenua > 0 ? (tarifaHora / tarifaIngenua - 1) * 100 : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;

  if (tarifaHora <= 0) {
    status = 'insufficient';
    tone = 'warn';
    title = 'Los porcentajes dejan tus horas en cero';
    badge = 'Revisá los datos';
  } else if (recargo >= 60) {
    status = 'a';
    tone = 'warn';
    title = 'Cobrá bastante más de lo que pensabas';
    badge = 'Recargo alto';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu tarifa por hora, ya ajustada';
    badge = 'Tarifa lista';
  }

  const detail = `Para que te queden ${fmtMoney(ingresoObjetivo)} netos por mes tenés que cobrar ${fmtMoney(tarifaHora)} por hora. Es ${fmtPct(recargo, 0)} más que dividir tu objetivo por tus horas: la diferencia la comen los impuestos (${impuestosPct}%), los clientes que no pagan (${impagosPct}%) y el tiempo comercial no facturable (${comercialPct}%).`;

  // — Escenarios: cómo cambia la tarifa con distintos niveles de "fricción" —
  const tarifaCon = (imp: number, com: number) => {
    const hc = horasFacturables * (1 - imp / 100) * (1 - com / 100);
    return hc > 0 ? brutoNecesario / hc : 0;
  };
  const scenarios = [
    {
      label: 'Optimista',
      value: fmtMoney(tarifaCon(Math.max(0, impagosPct - 5), Math.max(0, comercialPct - 5))) + '/h',
      detail: 'Si cobrás casi todo y reducís el tiempo comercial.',
    },
    {
      label: 'Probable',
      value: fmtMoney(tarifaHora) + '/h',
      detail: 'Con los porcentajes que cargaste.',
    },
    {
      label: 'Conservador',
      value: fmtMoney(tarifaCon(impagosPct + 5, comercialPct + 5)) + '/h',
      detail: 'Si te pagan menos y el tiempo comercial crece.',
    },
  ];

  const breakdown = [
    { label: 'Ingreso neto que querés', value: fmtMoney(ingresoObjetivo) },
    { label: '+ Equipamiento/gastos del mes', value: fmtMoney(equipamientoMes) },
    { label: `Bruto necesario (antes de ${impuestosPct}% impuestos)`, value: fmtMoney(brutoNecesario) },
    { label: 'Horas facturables nominales', value: `${horasFacturables.toFixed(0)} h` },
    { label: `− Clientes impagos (${impagosPct}%)`, value: `-${(horasFacturables * impagosPct / 100).toFixed(0)} h` },
    { label: `− Tiempo comercial no facturable (${comercialPct}%)`, value: `-${(horasFacturables * (1 - impagosPct / 100) * comercialPct / 100).toFixed(0)} h` },
    { label: 'Horas realmente cobradas', value: `${horasCobradas.toFixed(0)} h` },
    { label: 'Tarifa por hora a cobrar', value: fmtMoney(tarifaHora) + '/h', hint: `vs ${fmtMoney(tarifaIngenua)}/h "ingenua"` },
  ];

  const nextActions = [
    `Cobrá al menos **${fmtMoney(tarifaHora)} por hora**. Por debajo de eso estás trabajando para pagar impuestos y cubrir a los que no te pagan.`,
    'Pasá la tarifa a **precio por proyecto**: estimá las horas reales (incluí revisiones) y multiplicá. Cobrar por proyecto evita discutir la hora y premia tu eficiencia.',
    impagosPct > 0
      ? `Pedí **anticipo (30–50%)** y facturá por hitos: reduce tu ${impagosPct}% de impagos, que es lo que más te encarece la hora.`
      : 'Pedí anticipo y facturá por hitos: aunque hoy te paguen todos, un impago puntual te arruina el mes.',
    comercialPct > 0
      ? `Tu tiempo comercial es el ${comercialPct}% de tus horas: cobralo indirecto en la tarifa (como ya hace esta sala) o bajalo automatizando propuestas y onboarding.`
      : 'Acordate de contar el tiempo de propuestas, reuniones y administración: si no lo cargás, esa hora la regalás.',
    'Revisá la tarifa cada 3–6 meses contra la inflación: una tarifa fija en pesos pierde poder de compra rápido.',
  ];

  const notes = [
    'La tarifa se reconstruye hacia atrás desde tu ingreso neto deseado, sumando equipamiento, dividiendo por (1 − impuestos) y por las horas que realmente cobrás (descontando impagos y tiempo comercial).',
    'Los impuestos se aplican como un porcentaje único sobre el bruto (aproximación): tu carga real depende de tu situación (monotributo, autónomo, RI). Verificá tu cuota/alícuota efectiva.',
    'No considera estacionalidad ni meses sin trabajo: si tu demanda es irregular, subí el colchón o las horas conservadoras.',
    'No es asesoramiento financiero ni contable. Es una guía para fijar precio: ajustala a tu mercado y consultá a un contador para tu carga impositiva exacta.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(tarifaHora) + '/h',
      label: 'Tarifa por hora a cobrar',
      sub: `Para quedarte ${fmtMoney(ingresoObjetivo)} netos/mes. Es ${fmtPct(recargo, 0)} más que la tarifa "ingenua" de ${fmtMoney(tarifaIngenua)}/h.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-hora-freelance',
  title: '¿Cuánto cobrar por hora como freelance? Calculadora de tarifa 2026',
  h1: '¿Cuánto tengo que cobrar por hora como freelance?',
  description:
    'Calculá tu tarifa por hora freelance partiendo del ingreso neto que querés ganar. Descuenta impuestos, equipamiento, clientes que no pagan y tiempo comercial no facturable para darte la hora real que tenés que cobrar.',
  intro:
    'La tarifa por hora no es tu objetivo dividido tus horas: hay que cubrir impuestos, gastos, los clientes que no pagan y todo el tiempo que trabajás sin facturar (propuestas, reuniones, administración). Esta sala parte de cuánto querés que te quede neto y reconstruye hacia atrás la hora bruta que necesitás cobrar para llegar de verdad.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    ingresoNetoObjetivo: 1_500_000,
    horasFacturablesMes: 120,
    impuestos: 35,
    equipamientoMes: 80_000,
    porcentajeClientesImpagos: 8,
    tiempoComercialNoFacturable: 20,
  },
  fields: [
    {
      id: 'ingresoNetoObjetivo',
      label: 'Ingreso neto que querés ($/mes)',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1500000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Lo que querés que te quede en el bolsillo por mes, después de impuestos y gastos.',
      group: 'Tu objetivo',
      groupIcon: '🎯',
    },
    {
      id: 'horasFacturablesMes',
      label: 'Horas facturables por mes',
      type: 'number',
      suffix: 'h',
      required: true,
      default: 120,
      min: 1,
      max: 320,
      help: 'Horas que realmente facturás por mes (no las 160 teóricas: descontá feriados, vacaciones, días flojos).',
      group: 'Tu objetivo',
    },
    {
      id: 'impuestos',
      label: 'Impuestos sobre lo que facturás',
      type: 'number',
      suffix: '%',
      default: 35,
      min: 0,
      max: 90,
      help: 'Porcentaje aproximado que se va en impuestos/aportes (monotributo, autónomo, etc.).',
      group: 'Fricciones',
      groupIcon: '📉',
    },
    {
      id: 'equipamientoMes',
      label: 'Equipamiento y gastos ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '80000',
      help: 'Compu, software, internet, coworking, herramientas: prorrateado por mes.',
      group: 'Fricciones',
    },
    {
      id: 'porcentajeClientesImpagos',
      label: 'Clientes que no pagan',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 90,
      help: 'Porcentaje de facturación que terminás sin cobrar (incobrables, demoras eternas).',
      group: 'Fricciones',
    },
    {
      id: 'tiempoComercialNoFacturable',
      label: 'Tiempo comercial no facturable',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      max: 90,
      help: 'Porcentaje de tu tiempo en propuestas, reuniones de venta, administración: no se factura pero lo trabajás.',
      group: 'Fricciones',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-break-even-freelance-mes', label: 'Break-even freelance' },
    { slug: 'calculadora-costo-hora-empleado-real', label: 'Costo real de la hora' },
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo' },
    { slug: 'calculadora-cuanto-cobrar-traduccion-palabra-2026-espanol-ingles', label: 'Cuánto cobrar (por palabra)' },
  ],
  howItWorks: `Esta sala calcula tu tarifa partiendo de lo que querés ganar, no de lo que el mercado "paga".

1. **Tu ingreso neto objetivo.** Es el punto de partida: lo que querés que te quede limpio por mes.
2. **Bruto necesario.** Le suma tus gastos de equipamiento y divide por (1 − impuestos), porque los impuestos se comen una parte de todo lo que facturás. Ese es el bruto que necesitás generar.
3. **Horas realmente cobradas.** Tus horas facturables no son todas plata: descuenta el porcentaje de clientes que no pagan y el tiempo comercial no facturable (propuestas, reuniones, admin). Lo que queda son las horas que de verdad se convierten en factura cobrada.
4. **Tarifa por hora.** Divide el bruto necesario por esas horas cobradas. El resultado es bastante más alto que dividir tu objetivo por tus horas: esa brecha es lo que casi todo freelance subestima.
5. **Escenarios.** Muestra cómo se mueve la tarifa si cobrás más (o menos) y si tu tiempo comercial sube o baja.`,
  faq: [
    {
      q: '¿Por qué mi tarifa tiene que ser más alta que mi objetivo dividido las horas?',
      a: 'Porque de cada hora facturada no te queda todo: se va una parte en impuestos, otra en clientes que no pagan, y además trabajás muchas horas sin facturar (propuestas, reuniones, administración). Para que te quede tu objetivo limpio, la hora bruta tiene que cubrir todo eso.',
    },
    {
      q: '¿Cuántas horas facturables tiene un freelance por mes?',
      a: 'Mucho menos que las 160 teóricas de un full-time. Entre captación, administración, días flojos, vacaciones y descanso, lo realista suele ser 100–130 horas facturables. Usar las 160 teóricas es el error más común: te lleva a cobrar barato.',
    },
    {
      q: '¿Qué porcentaje de impuestos debería poner?',
      a: 'Depende de tu régimen. Como monotributista, calculá la cuota mensual como porcentaje de lo que facturás. Como autónomo o Responsable Inscripto, sumá aportes, IVA y Ganancias. Si no estás seguro, 30–40% es un punto de partida razonable que después conviene afinar con un contador.',
    },
    {
      q: '¿Cómo cobro el tiempo de reuniones y propuestas?',
      a: 'No lo facturás directo, pero lo trabajás. La forma sana es recuperarlo en la tarifa: si el 20% de tu tiempo es comercial, tu hora facturable tiene que ser más alta para compensar. Esta sala lo hace automáticamente. La alternativa es cobrar por proyecto.',
    },
    {
      q: '¿Me conviene cobrar por hora o por proyecto?',
      a: 'Por proyecto casi siempre conviene: dejás de penalizar tu eficiencia (si tardás menos, ganás más por hora) y el cliente sabe el total. Usá la tarifa por hora de esta sala como base para estimar el precio del proyecto, sumando las horas reales y un colchón de revisiones.',
    },
    {
      q: '¿Cómo manejo a los clientes que no pagan?',
      a: 'Primero, prevenir: pedí anticipo (30–50%) y facturá por hitos. Segundo, cubrirte: si históricamente un porcentaje no paga, súbelo en la tarifa para que los que sí pagan compensen. Bajar ese porcentaje es la palanca más fuerte para mejorar tu hora.',
    },
    {
      q: '¿Cada cuánto debería actualizar mi tarifa?',
      a: 'En Argentina, por la inflación, conviene revisarla cada 3–6 meses como mínimo. Una tarifa fija en pesos pierde poder de compra rápido. Recalculá con tu nuevo objetivo y tus costos actualizados, y avisá a tus clientes recurrentes con tiempo.',
    },
    {
      q: '¿Esto reemplaza el análisis de mercado?',
      a: 'No. Te da el piso desde tus números (cuánto necesitás cobrar). El techo lo pone el valor que generás y lo que tu mercado paga. Si tu tarifa-piso queda por encima del mercado, el problema es tu estructura de costos o tu posicionamiento, no la fórmula.',
    },
  ],
  sources: [
    { name: 'ARCA — Monotributo (cuotas y categorías)', url: 'https://www.arca.gob.ar/monotributo/' },
    { name: 'INDEC — Índice de Precios al Consumidor', url: 'https://www.indec.gob.ar/' },
  ],
};
