/**
 * Sala de decisión (Perú) — "¿Cuánto cobrar por hora como freelance?"
 *
 * Reconstruye la tarifa hacia atrás desde el neto mensual deseado, con la
 * fricción tributaria peruana: retención del 8% de renta de cuarta categoría
 * (cuando el pagador es agente de retención y el recibo supera S/ 1,500),
 * gastos fijos del oficio, y el hecho de que solo el 60-70% de tus horas
 * trabajadas son FACTURABLES. Avisa además cuándo puedes pedir la suspensión
 * de retenciones ante SUNAT (~S/ 43,313 proyectados al año).
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num, bool } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

const UMBRAL_SUSPENSION_ANUAL = 43313; // referencia SUNAT 2026 (aprox.)

function compute(inputs: Record<string, any>): DecisionResult {
  const netoObjetivo = Math.max(0, num(inputs.ingresoNetoObjetivo));
  const horasTrabajadas = Math.max(0, num(inputs.horasTrabajadasMes));
  const pctFacturable = Math.min(100, Math.max(1, num(inputs.porcentajeFacturable) || 65));
  const gastosFijos = Math.max(0, num(inputs.gastosFijosMes));
  const conRetencion = bool(inputs.leRetienen ?? 'si');

  if (!netoObjetivo || !horasTrabajadas) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa cuánto quieres que te quede neto al mes y cuántas horas trabajas. Reconstruimos hacia atrás la tarifa por hora que necesitas poner en tus recibos por honorarios.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tarifa por hora a cobrar' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **neto mensual objetivo** (lo que quieres que te quede libre).',
        'Ingresa tus **horas trabajadas al mes**: la sala descuenta sola las no facturables.',
      ],
    };
  }

  // Bruto a facturar: neto deseado + gastos, dividido por (1 − 8%) si te retienen.
  const factorRetencion = conRetencion ? 1 - 0.08 : 1;
  const brutoNecesario = (netoObjetivo + gastosFijos) / factorRetencion;

  // Horas que de verdad generan recibo: 60-70% de las trabajadas.
  const horasFacturables = horasTrabajadas * (pctFacturable / 100);
  const tarifa = horasFacturables > 0 ? brutoNecesario / horasFacturables : 0;

  // Tarifa "ingenua" (neto / horas trabajadas) para mostrar la brecha.
  const tarifaIngenua = netoObjetivo / horasTrabajadas;
  const recargo = tarifaIngenua > 0 ? (tarifa / tarifaIngenua - 1) * 100 : 0;

  // Proyección anual: define si puedes pedir suspensión de retenciones.
  const facturacionAnual = brutoNecesario * 12;
  const puedeSuspender = facturacionAnual <= UMBRAL_SUSPENSION_ANUAL;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  if (tarifa <= 0) {
    status = 'insufficient';
    tone = 'warn';
    title = 'Revisa las horas: el cálculo queda en cero';
    badge = 'Revisa los datos';
  } else if (recargo >= 60) {
    status = 'a';
    tone = 'warn';
    title = 'Cobra bastante más de lo que pensabas';
    badge = 'Recargo alto';
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tu tarifa por hora, ya ajustada';
    badge = 'Tarifa lista';
  }

  const detail = `Para que te queden ${fmtMoney(netoObjetivo)} netos al mes tienes que cobrar ${fmtMoney(tarifa)} por hora facturable. Es ${fmtPct(recargo, 0)} más que dividir tu objetivo entre tus horas: la diferencia la explican ${conRetencion ? 'la retención del 8% de cuarta categoría, ' : ''}tus gastos fijos (${fmtMoney(gastosFijos)}/mes) y que solo el ${pctFacturable}% de tus horas termina en un recibo.`;

  // Escenarios: la palanca es el % facturable.
  const tarifaCon = (pct: number) => {
    const h = horasTrabajadas * (pct / 100);
    return h > 0 ? brutoNecesario / h : 0;
  };
  const scenarios = [
    { label: 'Optimista (75% facturable)', value: fmtMoney(tarifaCon(75)) + '/h', detail: 'Con clientes recurrentes y poco tiempo en propuestas y cobranzas.' },
    { label: 'Tu caso', value: fmtMoney(tarifa) + '/h', detail: `Con el ${pctFacturable}% de tus ${horasTrabajadas.toFixed(0)} horas convertido en recibos.` },
    { label: 'Conservador (55% facturable)', value: fmtMoney(tarifaCon(55)) + '/h', detail: 'Si buscar clientes, cotizar y perseguir pagos te come casi la mitad del tiempo.' },
  ];

  const breakdown = [
    { label: 'Neto mensual que quieres', value: fmtMoney(netoObjetivo) },
    { label: '+ Gastos fijos del oficio', value: fmtMoney(gastosFijos), hint: 'internet, equipo, software, coworking' },
    ...(conRetencion
      ? [{ label: 'Bruto a facturar (antes del 8% de retención)', value: fmtMoney(brutoNecesario), hint: 'renta de cuarta categoría' }]
      : [{ label: 'Bruto a facturar (sin retención)', value: fmtMoney(brutoNecesario), hint: 'con suspensión o pagadores no agentes' }]),
    { label: 'Horas trabajadas al mes', value: `${horasTrabajadas.toFixed(0)} h` },
    { label: `Horas facturables (${pctFacturable}%)`, value: `${horasFacturables.toFixed(0)} h`, hint: 'las que terminan en un recibo' },
    { label: 'Tarifa por hora a cobrar', value: fmtMoney(tarifa) + '/h', hint: `vs ${fmtMoney(tarifaIngenua)}/h "ingenua"` },
    { label: 'Facturación anual proyectada', value: fmtMoney(facturacionAnual), hint: `umbral de suspensión: ${fmtMoney(UMBRAL_SUSPENSION_ANUAL)}` },
  ];

  const nextActions = [
    `Cobra al menos **${fmtMoney(tarifa)} por hora facturable**. Por debajo estás subsidiando tus propias horas no facturables y ${conRetencion ? 'la retención de SUNAT' : 'tus gastos fijos'}.`,
    puedeSuspender
      ? `Tu facturación proyectada (${fmtMoney(facturacionAnual)}/año) está bajo el umbral de SUNAT (≈ ${fmtMoney(UMBRAL_SUSPENSION_ANUAL)}): **solicita la suspensión de retenciones** en SUNAT Virtual (Formulario 1609) y ese 8% se queda contigo mes a mes.`
      : `Tu facturación proyectada (${fmtMoney(facturacionAnual)}/año) supera el umbral de suspensión (≈ ${fmtMoney(UMBRAL_SUSPENSION_ANUAL)}): te retendrán el 8%, pero en la regularización anual puedes recuperar el exceso — la deducción del 20% de cuarta categoría más las 7 UIT hacen que muchos recuperen buena parte.`,
    'Emite siempre tu **recibo por honorarios electrónico** desde SUNAT Virtual o el app: sin recibo no hay sustento, y a los clientes formales (los que mejor pagan) no puedes cobrarles de otra forma.',
    'Pasa la tarifa a **precio por proyecto** cuando puedas: estima las horas reales (incluye revisiones), multiplica por tu tarifa, y deja de discutir la hora. Pide adelanto del 30-50% con clientes nuevos.',
  ];

  const notes = [
    'La tarifa se reconstruye hacia atrás: (neto deseado + gastos fijos) ÷ (1 − 8% si te retienen) ÷ horas facturables. El 8% aplica cuando el pagador es agente de retención (empresas del régimen general) y el recibo supera S/ 1,500.',
    'La retención del 8% es un pago a cuenta, no el impuesto final: la renta de cuarta categoría se regulariza en la declaración anual, con deducción automática del 20% del bruto y 7 UIT libres. Tu carga efectiva final puede ser menor que el 8%.',
    'El umbral de suspensión de retenciones es referencial (~S/ 43,313 proyectados al año, ligado a la UIT vigente): confirma el valor exacto del ejercicio en la web de SUNAT.',
    'No incluye aportes previsionales (ONP/AFP como independiente son voluntarios) ni seguro de salud. Si quieres cubrirlos, súmalos a tus gastos fijos. No es asesoría tributaria: para tu caso puntual, consulta a un contador.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(tarifa) + '/h',
      label: 'Tarifa por hora a cobrar',
      sub: `Para quedarte ${fmtMoney(netoObjetivo)} netos/mes. Es ${fmtPct(recargo, 0)} más que la tarifa "ingenua" de ${fmtMoney(tarifaIngenua)}/h.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cobrar-por-hora-freelance',
  title: '¿Cuánto cobrar por hora como freelance? Tarifa con recibos por honorarios Perú 2026',
  h1: '¿Cuánto tengo que cobrar por hora como freelance?',
  description:
    'Define tu tarifa por hora freelance en soles partiendo del neto que quieres ganar: descuenta la retención del 8% de cuarta categoría, tus gastos fijos y las horas no facturables. Incluye cuándo pedir la suspensión de retenciones ante SUNAT.',
  intro:
    'Si vives de recibos por honorarios, tu hora no vale tu objetivo dividido entre tus horas: cuando el cliente es agente de retención te descuenta el 8% de renta de cuarta categoría, tus gastos fijos salen de lo que facturas, y de cada 10 horas trabajadas solo 6 o 7 terminan en un recibo — el resto se va en cotizar, reunirse y perseguir pagos. Esta sala parte de cuánto quieres que te quede limpio y reconstruye hacia atrás la tarifa que tienes que poner.',
  icon: '⏱️',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNetoObjetivo: 3500,
    horasTrabajadasMes: 160,
    porcentajeFacturable: 65,
    gastosFijosMes: 400,
    leRetienen: 'si',
  },
  fields: [
    { id: 'ingresoNetoObjetivo', label: 'Neto mensual que quieres', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '3500', help: 'Lo que quieres que te quede libre al mes, después de retenciones y gastos.', group: 'Tu objetivo', groupIcon: '🎯' },
    { id: 'horasTrabajadasMes', label: 'Horas que trabajas al mes', type: 'number', suffix: 'h', required: true, default: 160, min: 1, max: 320, placeholder: '160', help: 'Todas tus horas de trabajo, incluidas las que no facturas (propuestas, reuniones, administración).', group: 'Tu objetivo' },
    { id: 'porcentajeFacturable', label: '% de horas facturables', type: 'number', suffix: '%', default: 65, min: 1, max: 100, placeholder: '65', help: 'Qué parte de tus horas termina en un recibo. Lo realista para un freelance es 60-70%.', group: 'Fricciones', groupIcon: '📉' },
    { id: 'gastosFijosMes', label: 'Gastos fijos del oficio', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '400', help: 'Internet, equipo, software, coworking, movilidad: prorrateado al mes.', group: 'Fricciones' },
    {
      id: 'leRetienen', label: '¿Te retienen el 8% de cuarta categoría?', type: 'select', default: 'si',
      options: [
        { value: 'si', label: 'Sí (clientes empresa, recibos > S/ 1,500)' },
        { value: 'no', label: 'No (suspensión aprobada o pagadores sin retención)' },
      ],
      help: 'Las empresas del régimen general retienen 8% en recibos mayores a S/ 1,500, salvo que tengas suspensión de SUNAT.', group: 'Fricciones',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-renta-cuarta-categoria-honorarios-peru', label: 'Renta de cuarta categoría' },
    { slug: 'pe/calculadora-salario-por-hora-dia-peru', label: 'Salario por hora y día' },
    { slug: 'pe/calculadora-aporte-onp-afp-independiente-peru', label: 'Aporte ONP/AFP independiente' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala calcula tu tarifa desde lo que necesitas ganar, no desde lo que "se cobra" en el mercado.

1. **Tu neto objetivo.** El punto de partida es lo que quieres que te quede limpio al mes, más los gastos fijos de tu oficio, que también salen de lo que facturas.
2. **La fricción de SUNAT.** Si tus clientes son agentes de retención (empresas del régimen general) y tus recibos superan S/ 1,500, te descuentan el 8% de renta de cuarta categoría. Para que el neto te quede igual, el bruto se divide entre 0.92.
3. **Horas facturables, no trabajadas.** De tus horas de trabajo, solo el 60-70% termina en un recibo: el resto es cotizar, reunirse, administrar y cobrar. La tarifa se calcula sobre las horas que sí facturas.
4. **La tarifa.** Bruto necesario ÷ horas facturables. Sale bastante más alta que la cuenta ingenua — esa brecha es lo que casi todo freelance peruano subestima al empezar.
5. **El semáforo de la suspensión.** Con tu facturación anual proyectada te dice si puedes pedir la suspensión de retenciones ante SUNAT (umbral ≈ S/ 43,313) y quedarte con el 8% desde el primer recibo.`,
  faq: [
    { q: '¿Por qué mi tarifa debe ser más alta que mi objetivo dividido entre mis horas?', a: 'Porque de cada recibo no te queda todo: si el pagador es agente de retención se va el 8% a cuenta del impuesto, tus gastos fijos salen de lo facturado, y muchas horas de trabajo (propuestas, reuniones, cobranzas) nunca generan recibo. Para que el neto te alcance, la hora facturable tiene que cargar con todo eso.' },
    { q: '¿Cuándo me retienen el 8% de cuarta categoría?', a: 'Cuando emites un recibo por honorarios mayor a S/ 1,500 a un pagador que es agente de retención (en general, empresas del régimen general del impuesto a la renta). Personas naturales y negocios pequeños normalmente no retienen. La retención es un pago a cuenta: se descuenta de tu impuesto anual.' },
    { q: '¿Qué es la suspensión de retenciones y cómo la pido?', a: 'Si proyectas que tus rentas de cuarta categoría del año no superarán el umbral que fija SUNAT (alrededor de S/ 43,313, ligado a la UIT), puedes pedir la suspensión con el Formulario Virtual 1609 en SUNAT Virtual. Aprobada la solicitud, presentas la constancia a tus clientes y dejan de retenerte el 8%: la plata completa llega a tu bolsillo desde el primer recibo.' },
    { q: '¿El 8% es lo que finalmente pago de impuesto?', a: 'No necesariamente. Es un adelanto. En la declaración anual, la renta de cuarta se calcula con una deducción automática del 20% del bruto y 7 UIT libres de impuesto: con ingresos moderados, tu impuesto final puede ser menor a lo retenido y SUNAT te devuelve la diferencia. Muchos freelance recuperan buena parte del 8%.' },
    { q: '¿Cuántas horas facturables tiene un freelance al mes?', a: 'Muchas menos que las 160 de un empleado en planilla. Entre buscar clientes, cotizar, reuniones no cobradas, administración y cobranzas, lo realista es que el 60-70% de tus horas trabajadas termine en un recibo: unas 95-115 horas facturables si trabajas 160. Calcular con las 160 completas es el error que lleva a cobrar barato.' },
    { q: '¿Estoy obligado a emitir recibo por honorarios electrónico?', a: 'Sí: los recibos por honorarios se emiten electrónicamente desde SUNAT Virtual (Clave SOL) o el app de SUNAT, y quedan registrados automáticamente. Además de la obligación, te conviene: los clientes formales solo pagan contra recibo, y tu historial de recibos sirve como sustento de ingresos para créditos o alquileres.' },
    { q: '¿Y los aportes a AFP u ONP como independiente?', a: 'Hoy son voluntarios para quienes emiten recibos por honorarios: nadie te los descuenta, pero tampoco nadie los aporta por ti. Si quieres construir jubilación, decide un monto mensual y súmalo a tus "gastos fijos" en esta sala para que la tarifa lo cubra — lo mismo con un seguro de salud si no tienes cobertura.' },
    { q: '¿Cada cuánto actualizo mi tarifa?', a: 'Con inflación baja (~2.5% anual) no necesitas reajustar cada tres meses como en otros países: una revisión anual basta para los precios. Lo que sí debería mover tu tarifa es tu valor — portafolio, especialización, demanda —, así que revísala cada vez que subas de nivel o cierres proyectos que antes no conseguías.' },
  ],
  sources: [
    { name: 'SUNAT — Renta de cuarta categoría y suspensión de retenciones', url: 'https://www.sunat.gob.pe/' },
    { name: 'SUNAT — Recibo por honorarios electrónico', url: 'https://www.sunat.gob.pe/' },
    { name: 'BCRP — Inflación y estadísticas', url: 'https://www.bcrp.gob.pe/' },
  ],
};
