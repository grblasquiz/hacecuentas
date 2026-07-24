/**
 * Sala de decisión CL — "¿Cuánto cobrar por hora como freelance?"
 *
 * Patrón TARIFA con boleta de honorarios: parte del líquido mensual que quieres
 * y reconstruye hacia atrás la tarifa bruta. La fricción central en Chile es la
 * retención de honorarios (15,25% en 2026, sube gradual hasta 17%), que financia
 * las cotizaciones obligatorias del independiente (AFP + salud) en la Operación
 * Renta. Divide por horas FACTURABLES (60-70% de las trabajadas), no por las
 * totales.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const liquidoDeseado = Math.max(0, num(inputs.liquidoDeseado));
  const horasMes = Math.max(0, num(inputs.horasTrabajadasMes));
  const retencionPct = Math.min(50, Math.max(0, num(inputs.retencionPorcentaje)));
  const gastosMes = Math.max(0, num(inputs.gastosFijosMes));
  const facturablePct = Math.min(100, Math.max(1, num(inputs.porcentajeFacturable) || 65));

  if (!liquidoDeseado || !horasMes) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa el líquido mensual que quieres ganar y cuántas horas trabajas al mes. Reconstruimos hacia atrás la tarifa por hora que necesitas cobrar con boleta de honorarios.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tarifa por hora a cobrar' },
      scenarios: [],
      nextActions: [
        'Ingresa el **líquido mensual** que quieres que te quede.',
        'Ingresa tus **horas trabajadas** al mes y qué porcentaje es realmente **facturable**.',
      ],
    };
  }

  // Bruto a boletear: líquido deseado + gastos, inflado por la retención.
  const brutoNecesario = (liquidoDeseado + gastosMes) / (1 - retencionPct / 100);
  const retencionMes = brutoNecesario * (retencionPct / 100);

  // Horas que generan boleta: las trabajadas × % facturable.
  const horasFacturables = horasMes * (facturablePct / 100);
  const tarifaHora = horasFacturables > 0 ? brutoNecesario / horasFacturables : 0;

  // Tarifa "ingenua": líquido / horas totales, sin retención ni gastos.
  const tarifaIngenua = liquidoDeseado / horasMes;
  const recargo = tarifaIngenua > 0 ? (tarifaHora / tarifaIngenua - 1) * 100 : 0;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (tarifaHora <= 0) {
    status = 'insufficient';
    tone = 'warn';
    title = 'Revisa los porcentajes: las horas quedan en cero';
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

  const detail = `Para que te queden ${fmtMoney(liquidoDeseado)} líquidos al mes tienes que boletear ${fmtMoney(brutoNecesario)} y cobrar ${fmtMoney(tarifaHora)} por hora facturable. Es ${fmtPct(recargo, 0)} más que dividir tu meta por tus horas: la diferencia se va en la retención de honorarios (${String(retencionPct).replace('.', ',')}%), tus gastos fijos (${fmtMoney(gastosMes)}) y las horas no facturables (el ${100 - facturablePct}% de tu tiempo se va en propuestas, reuniones y administración).`;

  const tarifaConFacturable = (fPct: number) => {
    const h = horasMes * (fPct / 100);
    return h > 0 ? brutoNecesario / h : 0;
  };
  const fOpt = Math.min(100, facturablePct + 10);
  const fCons = Math.max(30, facturablePct - 10);

  const scenarios = [
    { label: `Optimista (${fOpt}% facturable)`, value: fmtMoney(tarifaConFacturable(fOpt)) + '/h', detail: 'Si automatizas propuestas y administración y facturas más horas de las que trabajas.' },
    { label: `Probable (${facturablePct}% facturable)`, value: fmtMoney(tarifaHora) + '/h', detail: 'Con el porcentaje facturable que ingresaste.' },
    { label: `Conservador (${fCons}% facturable)`, value: fmtMoney(tarifaConFacturable(fCons)) + '/h', detail: 'Si las reuniones, cotizaciones y meses lentos se comen más horas.' },
  ];

  const breakdown = [
    { label: 'Líquido mensual que quieres', value: fmtMoney(liquidoDeseado) },
    { label: '+ Gastos fijos del negocio', value: fmtMoney(gastosMes), hint: 'equipo, software, internet, cowork' },
    { label: `Bruto a boletear (retención ${String(retencionPct).replace('.', ',')}%)`, value: fmtMoney(brutoNecesario), hint: `retienen ${fmtMoney(retencionMes)}/mes` },
    { label: 'Horas trabajadas al mes', value: `${horasMes.toFixed(0)} h` },
    { label: `Horas facturables (${facturablePct}%)`, value: `${horasFacturables.toFixed(0)} h`, hint: 'las que terminan en una boleta' },
    { label: 'Tarifa por hora a cobrar', value: fmtMoney(tarifaHora) + '/h', hint: `vs ${fmtMoney(tarifaIngenua)}/h "ingenua"` },
  ];

  const nextActions = [
    `Cobra al menos **${fmtMoney(tarifaHora)} por hora facturable**. Por debajo de eso estás financiando tú la retención, tus gastos y las horas de reuniones que nadie paga.`,
    'Pasa la tarifa a **precio por proyecto**: estima las horas reales (con revisiones incluidas) y multiplica. Evitas discutir la hora y no castigas tu propia eficiencia.',
    `Recuerda que la retención (${fmtMoney(retencionMes)}/mes con estos números) **no es plata perdida ni es el impuesto final**: financia tus cotizaciones de AFP y salud, y en la Operación Renta de abril se ajusta — puede haber devolución o pago extra.`,
    'Guarda un colchón para abril: si tus cotizaciones más el impuesto superan lo retenido durante el año, el SII te cobrará la diferencia en la Operación Renta.',
    'Reajusta la tarifa una vez al año (referencia: IPC, 3-4%) y cada vez que tu demanda supere tu capacidad: en Chile no necesitas repactarla cada tres meses, pero sí revisarla.',
  ];

  const notes = [
    'La tarifa se reconstruye desde tu líquido deseado: se suman los gastos fijos, se divide por (1 − retención) para obtener el bruto a boletear, y ese bruto se divide por las horas facturables (horas trabajadas × % facturable).',
    'La retención de boletas de honorarios es 15,25% en 2026 y sube gradualmente hasta llegar a 17% (2028). Financia las cotizaciones obligatorias del independiente: AFP (10% + comisión), salud (7%) y seguros, que se liquidan en la Operación Renta.',
    'La retención NO es el impuesto final: tu impuesto de segunda categoría real depende de tu renta anual. Según tus números, en abril puede tocarte devolución o pago.',
    'No es asesoría tributaria. Para tu caso exacto (cobertura total o parcial de cotizaciones, gastos presuntos vs efectivos), consulta a un contador.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(tarifaHora) + '/h',
      label: 'Tarifa por hora a cobrar',
      sub: `Para quedarte ${fmtMoney(liquidoDeseado)} líquidos/mes boleteando ${fmtMoney(brutoNecesario)}. Es ${fmtPct(recargo, 0)} sobre la tarifa "ingenua" de ${fmtMoney(tarifaIngenua)}/h.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-hora-freelance',
  title: '¿Cuánto cobrar por hora como freelance en Chile? Tarifa con boleta 2026',
  h1: '¿Cuánto tengo que cobrar por hora como freelance?',
  description:
    'Calcula tu tarifa freelance en Chile partiendo del líquido mensual que quieres: suma la retención de boletas de honorarios (15,25% en 2026), tus gastos fijos y divide por tus horas realmente facturables. Con la Operación Renta explicada.',
  intro:
    'Tu tarifa por hora no es tu meta dividida por tus horas. Si trabajas con boleta de honorarios, de cada pago te retienen un 15,25% (2026) que financia tus cotizaciones de AFP y salud en la Operación Renta; además tienes gastos fijos, y de las horas que trabajas solo el 60-70% termina en una boleta — el resto se va en propuestas, reuniones y administración. Esta sala parte del líquido que quieres que te quede y reconstruye hacia atrás la hora bruta que necesitas cobrar.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    liquidoDeseado: 1400000,
    horasTrabajadasMes: 160,
    retencionPorcentaje: 15.25,
    gastosFijosMes: 120000,
    porcentajeFacturable: 65,
  },
  fields: [
    { id: 'liquidoDeseado', label: 'Líquido mensual que quieres', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '1400000', help: 'Lo que quieres que te quede en el bolsillo al mes, después de retención y gastos.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'horasTrabajadasMes', label: 'Horas trabajadas al mes', type: 'number', suffix: 'h', required: true, default: 160, min: 1, max: 320, placeholder: '160', help: 'Todas las horas que le dedicas al trabajo, facturables o no.', group: 'Tu meta' },
    { id: 'porcentajeFacturable', label: '% de horas facturables', type: 'number', suffix: '%', default: 65, min: 30, max: 100, placeholder: '65', help: 'Qué parte de tus horas termina en una boleta. Lo realista es 60-70%: el resto son propuestas, reuniones y administración.', group: 'Fricciones', groupIcon: '📉' },
    { id: 'retencionPorcentaje', label: 'Retención de honorarios', type: 'number', suffix: '%', default: 15.25, min: 0, max: 50, step: 0.25, placeholder: '15,25', help: 'Retención legal de boletas 2026: 15,25% (sube gradual hasta 17%). Financia tus cotizaciones en la Operación Renta.', group: 'Fricciones' },
    { id: 'gastosFijosMes', label: 'Gastos fijos del negocio', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '120000', help: 'Computador, software, internet, celular, cowork: prorrateado al mes.', group: 'Fricciones' },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-aporte-trabajador-honorarios-chile-cotizacion-obligatoria', label: 'Cotizaciones del trabajador a honorarios' },
    { slug: 'cl/calculadora-honorarios-vs-contrato-chile-conveniencia-tributaria', label: 'Honorarios vs contrato' },
    { slug: 'cl/calculadora-iva-honorarios-chile-10-porciento-retencion', label: 'Retención de honorarios' },
    { slug: 'cl/calculadora-impuesto-renta-segunda-categoria-chile-2026-tabla', label: 'Impuesto de segunda categoría' },
  ],
  howItWorks: `Esta sala calcula tu tarifa desde lo que necesitas que te quede, no desde lo que "se cobra en el mercado".

1. **Tu líquido objetivo.** El punto de partida es lo que quieres que llegue a tu bolsillo cada mes.
2. **El bruto a boletear.** Suma tus gastos fijos del negocio y divide por (1 − retención): con la retención de 15,25% de 2026, para que te queden $100 necesitas boletear unos $118.
3. **Las horas que de verdad facturas.** De tus horas trabajadas, solo una parte (60-70% es lo realista) termina en una boleta; propuestas, reuniones, cobranza y administración no las paga nadie directamente.
4. **La tarifa.** Divide el bruto necesario por las horas facturables. El resultado es bastante más alto que tu meta dividida por tus horas — esa brecha es la que casi todo independiente subestima al partir.
5. **El ajuste de abril.** Te recuerda que la retención no es el impuesto final: en la Operación Renta se liquidan tus cotizaciones obligatorias (AFP y salud) y tu impuesto real, con devolución o pago según tu año.`,
  faq: [
    { q: '¿Cuánto es la retención de boletas de honorarios en 2026?', a: 'El 15,25% de cada boleta. Viene subiendo gradualmente desde el 10% (era 14,5% en 2025) hasta llegar al 17% en 2028. Si emites la boleta a una empresa, ella retiene y entera al SII; si atiendes a personas, debes pagar tú el pago provisional mensual (PPM) equivalente.' },
    { q: '¿La retención es el impuesto que pago y ya?', a: 'No: es un anticipo. En la Operación Renta de abril, el SII calcula tu impuesto real según tu renta anual y descuenta primero tus cotizaciones previsionales obligatorias de lo retenido. Si lo retenido sobra, hay devolución; si falta, pagas la diferencia. Por eso conviene tener un colchón para abril.' },
    { q: '¿Qué cotizaciones pago como independiente a honorarios?', a: 'Si boleteas sobre ciertos montos anuales, estás obligado a cotizar: AFP (10% de pensión más la comisión de la administradora), salud (7%, Fonasa o isapre), el seguro de accidentes del trabajo y el SANNA. Todo eso se financia con la retención de tus boletas y se liquida en la Operación Renta — puedes optar por cobertura parcial los primeros años, pero cotizas menos para pensión.' },
    { q: '¿Boleta de honorarios o factura?', a: 'La boleta de honorarios es para servicios profesionales de persona natural y no lleva IVA. Si tu actividad es comercial (vendes productos, revendes, tienes local) o quieres operar como empresa, necesitas inicio de actividades en primera categoría y emitir factura, generalmente con IVA del 19%. Para la mayoría de los freelance de servicios, la boleta basta al partir.' },
    { q: '¿Por qué dividir por el 65% de mis horas y no por todas?', a: 'Porque nadie te paga las horas de propuestas, reuniones de venta, correos, cobranza y contabilidad — y son fácilmente un tercio de tu semana. Si divides tu meta por 160 horas cuando solo facturas 104, tu tarifa queda un 35% corta y lo descubres a fin de mes.' },
    { q: '¿Me conviene cobrar por hora o por proyecto?', a: 'Por proyecto, casi siempre: usas tu tarifa por hora como base interna, estimas las horas reales (con revisiones) y das un precio cerrado. Así no castigas tu eficiencia —si terminas antes, tu hora efectiva sube— y el cliente tiene certeza del total.' },
    { q: '¿Cada cuánto reajusto mi tarifa en Chile?', a: 'Una vez al año contra el IPC (en torno al 3-4%) suele bastar, a diferencia de países con alta inflación donde hay que repactar cada tres meses. El otro gatillo es la demanda: si estás rechazando trabajo o agendando a semanas, tu tarifa está barata, súbela.' },
    { q: '¿Esto reemplaza el análisis de mercado o al contador?', a: 'No. Esta sala te da tu piso: la tarifa bajo la cual pierdes plata. El techo lo pone el valor que generas y lo que paga tu mercado. Y para tu situación tributaria exacta (cobertura de cotizaciones, gastos efectivos vs presuntos), un contador te ahorra sorpresas en abril.' },
  ],
  sources: [
    { name: 'SII — Boletas de honorarios y retención vigente', url: 'https://www.sii.cl/' },
    { name: 'SII — Operación Renta: cotizaciones de independientes', url: 'https://www.sii.cl/destacados/renta/2026/index.html' },
    { name: 'CMF — Educación financiera para independientes', url: 'https://www.cmfchile.cl/educa/' },
  ],
};
