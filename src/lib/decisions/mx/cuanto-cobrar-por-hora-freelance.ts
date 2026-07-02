/**
 * Sala de decisión (México) — "¿Cuánto cobrar por hora como freelance?"
 *
 * Patrón TARIFA, reconstruido desde la realidad fiscal mexicana: parte del
 * neto mensual deseado y arma la tarifa hacia atrás sumando gastos fijos y
 * el ISR según régimen (RESICO ~2.5% sobre ingresos si calificas, o actividad
 * empresarial/profesional con tarifa progresiva), y divide entre las horas
 * FACTURABLES reales (60–70% de las trabajadas). El IVA del 16% se traslada
 * aparte en el CFDI — no es tu precio, pero hay que cuidar el flujo — y al
 * facturar a persona moral aplican retenciones (10% ISR y 2/3 del IVA en
 * servicios profesionales; 1.25% de ISR en RESICO).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const neto = Math.max(0, num(inputs.netoDeseado));
  const horasTrab = Math.max(0, num(inputs.horasTrabajadasMes));
  const pctFactRaw = num(inputs.pctFacturable);
  const pctFact = Math.min(100, Math.max(10, pctFactRaw || 65));
  const regimen = String(inputs.regimen || 'resico'); // resico | actividad
  const gastos = Math.max(0, num(inputs.gastosFijosMes));

  if (!neto || !horasTrab) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Ingresa cuánto quieres ganar neto al mes y cuántas horas trabajas. Con tu régimen fiscal (RESICO o actividad empresarial) reconstruimos la tarifa por hora que necesitas poner en tus CFDI.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tarifa por hora a cobrar' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **ingreso neto objetivo** (lo que quieres que te quede al mes).',
        'Ingresa tus **horas trabajadas** al mes: la sala descuenta sola las no facturables.',
      ],
    };
  }

  // ISR estimado según régimen: RESICO ~2.5% sobre ingresos (tope de la tabla);
  // actividad empresarial/profesional: ~20% efectivo como aproximación media.
  const isrPct = regimen === 'actividad' ? 20 : 2.5;
  const regimenLabel = regimen === 'actividad' ? 'actividad empresarial y profesional' : 'RESICO';

  // Bruto a facturar (sin IVA) para que, tras ISR y gastos, quede el neto deseado.
  const brutoNecesario = (neto + gastos) / (1 - isrPct / 100);

  // Horas que de verdad se facturan: 60-70% de las trabajadas (el resto es
  // buscar clientes, cotizar, administrar, timbrar y cobrar).
  const horasFact = horasTrab * (pctFact / 100);
  const tarifa = horasFact > 0 ? brutoNecesario / horasFact : 0;
  const tarifaConIva = tarifa * 1.16;

  // Tarifa "ingenua" (neto / horas trabajadas) para dimensionar la brecha.
  const tarifaIngenua = neto / horasTrab;
  const recargo = tarifaIngenua > 0 ? (tarifa / tarifaIngenua - 1) * 100 : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (tarifa <= 0) {
    status = 'insufficient';
    tone = 'warn';
    title = 'Los porcentajes dejan tus horas en cero';
    badge = 'Revisa los datos';
  } else if (recargo >= 60) {
    status = 'a';
    tone = 'warn';
    title = 'Cobra bastante más de lo que pensabas';
    badge = 'Brecha grande';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu tarifa por hora, ya ajustada';
    badge = 'Tarifa lista';
  }

  const detail = `Para que te queden ${fmtMoney(neto)} netos al mes en ${regimenLabel}, tu hora facturable vale ${fmtMoney(tarifa)} (+ IVA: ${fmtMoney(tarifaConIva)} en el CFDI). Es ${fmtPct(recargo, 0)} más que dividir tu objetivo entre tus horas trabajadas, porque solo el ${pctFact}% de tu tiempo se factura y el ISR y tus gastos fijos salen de lo mismo que cobras.`;

  const tarifaConPct = (pf: number) => {
    const hf = horasTrab * (pf / 100);
    return hf > 0 ? brutoNecesario / hf : 0;
  };
  const scenarios = [
    { label: 'Bien vendido (70% facturable)', value: fmtMoney(tarifaConPct(70)) + '/h', detail: 'Con clientes recurrentes y poco tiempo perdido en cotizar.' },
    { label: 'Probable', value: fmtMoney(tarifa) + '/h', detail: `Con el ${pctFact}% facturable que ingresaste.` },
    { label: 'Arrancando (60% facturable)', value: fmtMoney(tarifaConPct(60)) + '/h', detail: 'Si todavía inviertes muchas horas en conseguir clientes.' },
  ];

  const breakdown = [
    { label: 'Neto que quieres al mes', value: fmtMoney(neto) },
    { label: '+ Gastos fijos del negocio', value: fmtMoney(gastos), hint: 'equipo, software, internet, coworking' },
    { label: `Bruto a facturar (antes de ISR ${regimenLabel})`, value: fmtMoney(brutoNecesario), hint: `ISR estimado: ${isrPct}%` },
    { label: 'Horas trabajadas al mes', value: `${horasTrab.toFixed(0)} h` },
    { label: `Horas facturables (${pctFact}%)`, value: `${horasFact.toFixed(0)} h`, hint: 'el resto: cotizar, administrar, cobrar' },
    { label: 'Tarifa por hora (sin IVA)', value: fmtMoney(tarifa) + '/h', hint: `vs ${fmtMoney(tarifaIngenua)}/h "ingenua"` },
    { label: 'Tu hora en el CFDI (+16% IVA)', value: fmtMoney(tarifaConIva) + '/h', hint: 'el IVA se traslada, no es tuyo' },
  ];

  const nextActions = [
    `Cobra al menos **${fmtMoney(tarifa)} + IVA por hora**. Por debajo de eso estás pagando tú los impuestos, los gastos y las horas que nadie factura.`,
    'Convierte la hora en **precio por proyecto**: estima las horas reales (con revisiones) y multiplica. Evitas negociar la hora y ganas cuando eres eficiente.',
    regimen === 'resico'
      ? 'Verifica cada año que sigues **calificando para RESICO** (ingresos hasta $3.5 millones anuales y sin ciertos supuestos): su ISR de 1–2.5% sobre ingresos es la ventaja fiscal más grande que tienes.'
      : 'En actividad empresarial el ISR es progresivo y las **deducciones autorizadas** (equipo, internet, gastos del negocio con factura) bajan tu tasa efectiva: guarda todos tus CFDI de gastos.',
    'Si facturas a **persona moral**, espera retenciones: 10% de ISR y dos terceras partes del IVA en servicios profesionales (en RESICO, 1.25% de ISR). No es dinero perdido — se acredita en tus declaraciones — pero cóbralo en tu flujo: te llega menos hoy.',
    'El IVA que trasladas **no es tuyo**: sepáralo apenas te paguen para la declaración mensual del SAT, o el mes que toque pagar será un susto.',
  ];

  const notes = [
    'La tarifa se reconstruye hacia atrás: (neto deseado + gastos fijos) ÷ (1 − ISR estimado) ÷ horas facturables. El ISR usado es una aproximación: 2.5% en RESICO (el tope de su tabla sobre ingresos) y ~20% efectivo en actividad empresarial y profesional, cuya tarifa es progresiva y depende de tus deducciones.',
    'El IVA del 16% no forma parte de la tarifa: se agrega en el CFDI y se entera al SAT (restando el IVA acreditable de tus gastos). Sí afecta tu flujo de efectivo, sobre todo con clientes que pagan a 30–90 días.',
    'No considera meses flojos ni estacionalidad: si tu demanda es irregular, usa el escenario conservador. No es asesoría fiscal: confirma tu régimen y tasas con un contador.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(tarifa) + '/h',
      label: 'Tarifa por hora a cobrar (+ IVA)',
      sub: `Para quedarte ${fmtMoney(neto)} netos/mes. En el CFDI: **${fmtMoney(tarifaConIva)}/h** con IVA. Es ${fmtPct(recargo, 0)} más que la cuenta "ingenua".`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-hora-freelance',
  title: '¿Cuánto cobrar por hora como freelance en México? Tarifa 2026',
  h1: '¿Cuánto debo cobrar por hora como freelance?',
  description:
    'Arma tu tarifa freelance en México desde el neto que quieres ganar: suma ISR (RESICO o actividad empresarial), gastos fijos y divide entre horas facturables reales. Con IVA, CFDI y retenciones de persona moral explicados.',
  intro:
    'Tu hora no vale "lo que quieres ganar entre tus horas": de lo que facturas salen el ISR de tu régimen, tus gastos fijos, y solo el 60–70% de tu tiempo termina en un CFDI — el resto se va en cotizar, administrar y cobrar. Esta sala parte del neto mensual que quieres y reconstruye hacia atrás la tarifa que debes poner en tu factura, te la muestra con IVA y te avisa de las retenciones cuando el cliente es persona moral.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    netoDeseado: 25000,
    horasTrabajadasMes: 160,
    pctFacturable: 65,
    regimen: 'resico',
    gastosFijosMes: 3000,
  },
  fields: [
    { id: 'netoDeseado', label: 'Neto que quieres al mes', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '25,000', help: 'Lo que quieres que te quede libre al mes, después de impuestos y gastos del negocio.', group: 'Tu objetivo', groupIcon: '🎯' },
    { id: 'horasTrabajadasMes', label: 'Horas trabajadas al mes', type: 'number', suffix: 'h', required: true, default: 160, min: 1, max: 320, placeholder: '160', help: 'Todas las horas que le dedicas al negocio, facturables o no.', group: 'Tu objetivo' },
    { id: 'pctFacturable', label: '% de horas que sí facturas', type: 'number', suffix: '%', default: 65, min: 10, max: 100, placeholder: '65', help: 'Lo realista es 60–70%: el resto se va en buscar clientes, cotizar, administrar y cobrar.', group: 'Tu objetivo' },
    {
      id: 'regimen', label: 'Tu régimen ante el SAT', type: 'select', default: 'resico', recommended: true,
      options: [
        { value: 'resico', label: 'RESICO (ISR ~1–2.5% sobre ingresos)' },
        { value: 'actividad', label: 'Actividad empresarial y profesional (ISR progresivo)' },
      ],
      help: 'RESICO aplica si tus ingresos no pasan de $3.5 millones al año y no caes en supuestos excluidos.', group: 'Fricciones', groupIcon: '📉',
    },
    { id: 'gastosFijosMes', label: 'Gastos fijos del negocio al mes', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '3,000', help: 'Computadora prorrateada, software, internet, celular, coworking, contador.', group: 'Fricciones' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-resico-personas-fisicas-mexico-2026-cuota', label: 'ISR en RESICO personas físicas' },
    { slug: 'mx/calculadora-isr-honorarios-persona-fisica', label: 'ISR por honorarios' },
    { slug: 'mx/calculadora-iva-mexico-trasladado-acreditable', label: 'IVA trasladado y acreditable' },
    { slug: 'mx/calculadora-honorarios-asimilados-vs-honorarios-libres-mexico', label: 'Asimilados vs honorarios libres' },
  ],
  howItWorks: `Esta sala arma tu tarifa desde lo que quieres ganar, no desde "lo que cobra el mercado".

1. **Tu neto objetivo.** El punto de partida es lo que quieres que te quede limpio al mes, ya pagados impuestos y gastos.
2. **El bruto a facturar.** Suma tus gastos fijos del negocio y divide entre (1 − ISR de tu régimen): en RESICO el ISR es de apenas 1–2.5% sobre ingresos; en actividad empresarial y profesional la tarifa es progresiva (usamos ~20% efectivo como aproximación). Ese es el subtotal que tus CFDI deben sumar cada mes.
3. **Tus horas facturables.** De tus horas trabajadas, solo el 60–70% termina facturado: el resto es conseguir clientes, cotizar, timbrar, perseguir pagos. Dividir entre las facturables — no entre todas — es lo que casi todo freelance omite.
4. **La tarifa, con y sin IVA.** El resultado es tu hora sin IVA; en el CFDI se le agrega el 16% de IVA trasladado, que no es tuyo: se declara al SAT restando el IVA de tus gastos.
5. **Las retenciones.** Si el cliente es persona moral, te retiene impuestos al pagarte (10% de ISR y 2/3 del IVA en servicios profesionales; 1.25% de ISR en RESICO). Se acreditan después, pero reducen lo que te llega hoy: la sala te lo recuerda para que lo metas en tu flujo.`,
  faq: [
    { q: '¿Por qué mi tarifa debe ser mayor que mi objetivo entre mis horas?', a: 'Porque de cada peso facturado salen el ISR y tus gastos fijos, y porque de tus horas trabajadas solo el 60–70% se factura: cotizaciones, juntas de venta, administración y cobranza no generan CFDI pero consumen tu tiempo. Si quieres $25,000 netos trabajando 160 horas, la cuenta ingenua da $156/h; la real, con RESICO y 65% facturable, ronda los $276/h + IVA.' },
    { q: '¿Qué es el RESICO y me conviene?', a: 'El Régimen Simplificado de Confianza para personas físicas cobra ISR de 1% a 2.5% sobre tus ingresos (sin deducciones), si facturas hasta $3.5 millones al año y no caes en supuestos excluidos (como ser socio de una empresa). Para la mayoría de freelancers con pocos gastos deducibles es la opción más barata y simple. Si tienes muchos gastos con factura, compara contra actividad empresarial con un contador.' },
    { q: '¿Cómo funciona el ISR en actividad empresarial y profesional?', a: 'Es una tarifa progresiva sobre tu utilidad (ingresos menos deducciones autorizadas), con pagos provisionales mensuales y declaración anual. Tu tasa efectiva depende de cuánto deduces: equipo, internet, renta de oficina, cursos. Por eso ahí cada gasto con CFDI vale oro; en esta sala usamos ~20% como aproximación media.' },
    { q: '¿El IVA del 16% lo cobro yo o lo pago yo?', a: 'Lo trasladas: tu CFDI dice subtotal + 16% de IVA, el cliente lo paga y tú lo enteras al SAT en la declaración mensual, restando el IVA acreditable de tus gastos. No es ingreso tuyo, así que no lo cuentes como parte de tu tarifa — pero sepáralo apenas cobres, porque gastarlo y deberlo al SAT es un clásico doloroso.' },
    { q: '¿Qué me retienen cuando facturo a una empresa (persona moral)?', a: 'En servicios profesionales (honorarios), la persona moral retiene 10% de ISR y dos terceras partes del IVA (10.67 puntos de los 16). En RESICO la retención de ISR es de 1.25%. Las retenciones se acreditan en tus declaraciones — no las pierdes — pero el depósito que recibes es menor: considéralo al cotizar y al proyectar tu flujo.' },
    { q: '¿Cuántas horas facturables al mes son realistas?', a: 'De unas 160 horas trabajadas, entre 96 y 112 facturables (60–70%). Quien arranca suele estar más cerca del 60% porque invierte mucho en conseguir clientes; con cartera estable y recurrente se llega al 70% o un poco más. Usar las 160 completas en la cuenta es la receta para cobrarte barato.' },
    { q: '¿Necesito facturar (emitir CFDI) sí o sí?', a: 'Para clientes empresa, sí: sin CFDI 4.0 no te pagan. Y aun con clientes personas físicas, estar dado de alta en el SAT y facturar te abre RESICO, te permite deducir y construye historial de ingresos para créditos. El costo del contador o del facturador es parte de los gastos fijos que esta sala ya suma a tu tarifa.' },
    { q: '¿Cobro por hora o por proyecto?', a: 'Usa la hora como base interna y cotiza por proyecto: estima las horas reales (con revisiones y juntas), multiplica por tu tarifa y presenta un precio cerrado + IVA. El cliente gana certeza y tú dejas de castigar tu propia eficiencia: si terminas antes, tu hora efectiva sube.' },
    { q: '¿Cada cuánto actualizo mi tarifa?', a: 'Revísala al menos una vez al año: con inflación en México alrededor del 4% anual, una tarifa congelada dos o tres años pierde poder de compra en silencio. Aprovecha enero (cuando se actualizan las tablas del SAT y los salarios) para ajustar, y avisa a tus clientes recurrentes con un mes de anticipación.' },
  ],
  sources: [
    { name: 'SAT — Régimen Simplificado de Confianza (RESICO)', url: 'https://www.sat.gob.mx/' },
    { name: 'SAT — Facturación electrónica (CFDI 4.0)', url: 'https://www.sat.gob.mx/' },
    { name: 'INEGI — Índice Nacional de Precios al Consumidor', url: 'https://www.inegi.org.mx/' },
  ],
};
