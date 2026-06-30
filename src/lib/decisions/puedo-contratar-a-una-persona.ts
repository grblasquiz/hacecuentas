/**
 * Sala de decisión — "¿Puedo contratar a una persona?"
 *
 * Patrón BREAKDOWN. El sueldo de bolsillo es solo una parte: contratar en blanco
 * cuesta ~1,5× el bruto entre cargas patronales, ART, aguinaldo y vacaciones.
 * Esta sala arma el costo TOTAL mensual real del empleado y lo cruza con el
 * ingreso del negocio para decirte si lo podés sostener. Math inline.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

const CARGAS = 0.21;     // contribuciones patronales aprox post Ley 27.802 (2026): seg. social 15-17,4% + obra social 5%; varía por actividad/tamaño
const ART = 0.05;        // ART (% variable) + seguro de vida (suma fija); ~5% como proxy
const VACAC = 0.05;      // provisión vacaciones: 14 días LCT pagados a sueldo/25 ≈ 4,7%/mes (sube con antigüedad)

function compute(inputs: Record<string, any>): DecisionResult {
  const bruto = Math.max(0, num(inputs.sueldoBrutoOfrecido));
  const ingresoNegocio = Math.max(0, num(inputs.ingresoNegocioMensual));
  const otrosGastos = Math.max(0, num(inputs.otrosGastos));

  if (!bruto) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el sueldo bruto que pensás ofrecer para calcular el costo total real (con cargas, ART, aguinaldo y vacaciones) y ver si tu negocio lo sostiene.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo total mensual del empleado' },
      scenarios: [],
      nextActions: [
        'Cargá el **sueldo bruto** que pensás ofrecer.',
        'Sumá el **ingreso mensual de tu negocio** para ver si lo soporta.',
      ],
    };
  }

  // — Costo total mensual real del empleado —
  const cargas = bruto * CARGAS;
  const art = bruto * ART;
  const aguinaldoMes = bruto / 12;       // SAC prorrateado por mes
  const vacaciones = bruto * VACAC;      // provisión mensual de vacaciones
  const costoTotal = bruto + cargas + art + aguinaldoMes + vacaciones;
  const multiplicador = costoTotal / bruto; // ~1,5×

  // — ¿El negocio lo soporta? regla: el empleado no debería superar ~40% del ingreso —
  const disponible = ingresoNegocio - otrosGastos;
  const pesoSobreIngreso = ingresoNegocio > 0 ? (costoTotal / ingresoNegocio) * 100 : Infinity;
  const sobranteTrasContratar = disponible - costoTotal;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (ingresoNegocio <= 0) {
    status = 'tie';
    tone = 'neutral';
    title = `Contratar te cuesta ${fmtMoney(costoTotal)}/mes`;
    badge = 'Costo calculado';
    detail = `El costo total real es ${fmtMoney(costoTotal)} por mes (${multiplicador.toFixed(2).replace('.', ',')}× el bruto de ${fmtMoney(bruto)}). Cargá el ingreso de tu negocio para saber si lo podés sostener.`;
  } else if (sobranteTrasContratar < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Todavía no: el costo se come tu margen';
    badge = 'No conviene aún';
    detail = `El empleado te cuesta ${fmtMoney(costoTotal)}/mes y, tras tus otros gastos, te quedan ${fmtMoney(disponible)}: contratarlo te dejaría en rojo (${fmtMoney(sobranteTrasContratar)}). Necesitás más ingresos antes de sumar gente.`;
  } else if (pesoSobreIngreso > 40 || sobranteTrasContratar < costoTotal * 0.5) {
    status = 'tie';
    tone = 'warn';
    title = 'Podés, pero quedás ajustado';
    badge = 'Ajustado';
    detail = `El empleado cuesta ${fmtMoney(costoTotal)}/mes: el ${fmtPct(pesoSobreIngreso, 0).replace('+', '')} de tu ingreso. Te quedarían ${fmtMoney(sobranteTrasContratar)} de colchón. Se puede, pero con poco margen para meses flojos.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Sí, podés contratar con margen';
    badge = 'Podés contratar';
    detail = `El costo total es ${fmtMoney(costoTotal)}/mes (el ${fmtPct(pesoSobreIngreso, 0).replace('+', '')} de tu ingreso) y aún te quedan ${fmtMoney(sobranteTrasContratar)} de colchón. Tu negocio lo sostiene cómodo.`;
  }

  const scenarios = [
    {
      label: 'Solo el bruto',
      value: fmtMoney(bruto) + '/mes',
      detail: 'Lo que figura en el recibo, sin cargas: NO es lo que te cuesta.',
    },
    {
      label: 'Costo total real',
      value: fmtMoney(costoTotal) + '/mes',
      detail: `Con cargas, ART, aguinaldo y vacaciones (${multiplicador.toFixed(2).replace('.', ',')}× el bruto).`,
    },
    {
      label: 'Costo anual',
      value: fmtMoney(costoTotal * 12),
      detail: 'Lo que te compromete el primer año (incluye los dos aguinaldos).',
    },
  ];

  const breakdown = [
    { label: 'Sueldo bruto ofrecido', value: fmtMoney(bruto) },
    { label: `Cargas patronales (~${(CARGAS * 100).toFixed(0)}%)`, value: fmtMoney(cargas) },
    { label: `ART + seguro de vida (~${(ART * 100).toFixed(0)}%)`, value: fmtMoney(art) },
    { label: 'Aguinaldo (SAC prorrateado)', value: fmtMoney(aguinaldoMes), hint: 'bruto ÷ 12' },
    { label: `Provisión de vacaciones (~${(VACAC * 100).toFixed(0)}%)`, value: fmtMoney(vacaciones) },
    { label: 'Costo total mensual', value: fmtMoney(costoTotal), hint: `${multiplicador.toFixed(2).replace('.', ',')}× el bruto` },
    { label: 'Ingreso del negocio', value: fmtMoney(ingresoNegocio) },
    { label: '− Otros gastos del negocio', value: '-' + fmtMoney(otrosGastos).replace('-', '') },
    { label: 'Colchón tras contratar', value: fmtMoney(sobranteTrasContratar) },
  ];

  const nextActions = [
    `Presupuestá **${fmtMoney(costoTotal)} por mes** (no ${fmtMoney(bruto)}): el sueldo de bolsillo es solo dos tercios del costo real de tener a alguien en blanco.`,
    `Acordate del **aguinaldo doble** (junio y diciembre): provisioná ${fmtMoney(aguinaldoMes)} por mes para no descapitalizarte cuando llegue.`,
    sobranteTrasContratar < costoTotal
      ? 'Antes de contratar full-time, evaluá un **monotributista por proyecto, part-time o período de prueba**: probás la necesidad real con menos riesgo y compromiso.'
      : 'Tu negocio sostiene el costo: igual arrancá con **período de prueba (3 meses)** para confirmar que la persona suma lo esperado.',
    'Sumá los costos ocultos: **indemnización potencial, ropa/herramientas, capacitación y tiempo tuyo de gestión**. Contratar bien es una inversión, no solo un gasto.',
  ];

  const notes = [
    'El costo total se estima como bruto + cargas patronales (~21%, ya con la baja de contribuciones de la Ley 27.802 vigente 2026) + ART/seguro (~5%) + aguinaldo (bruto/12) + provisión de vacaciones (~5%), dando ~1,4× el bruto. Es una aproximación: las alícuotas varían por actividad, convenio y zona, y hay reducciones para pymes y nuevas contrataciones.',
    'No incluye la indemnización por despido (un costo eventual importante) ni costos de incorporación (ropa, herramientas, capacitación).',
    'La regla "el empleado no debería superar ~40% del ingreso" es una guía de prudencia, no una norma: tu caso depende de tu margen y de cuánto genere esa persona.',
    'No es asesoramiento contable ni laboral. Para las cargas exactas de tu actividad y convenio, consultá con un contador y/o un abogado laboral matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(costoTotal) + '/mes',
      label: 'Costo total real del empleado',
      sub: `${multiplicador.toFixed(2).replace('.', ',')}× el bruto de ${fmtMoney(bruto)}. ${ingresoNegocio > 0 ? `Te dejaría ${fmtMoney(sobranteTrasContratar)} de colchón.` : 'Cargá el ingreso del negocio para ver si lo sostenés.'}`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'puedo-contratar-a-una-persona',
  title: '¿Puedo contratar a una persona? Costo real 2026',
  h1: '¿Puedo contratar a una persona?',
  description:
    'Calculá el costo total real de contratar un empleado en blanco: sueldo bruto + cargas patronales + ART + aguinaldo + vacaciones (≈1,5× el bruto) y cruzalo con el ingreso de tu negocio para saber si lo podés sostener.',
  intro:
    'Contratar no cuesta el sueldo: cuesta cerca de 1,5 veces el bruto una vez que sumás cargas patronales, ART, aguinaldo y vacaciones. Esta sala arma ese costo total real mes a mes y lo cruza con el ingreso de tu negocio para responder lo que de verdad importa antes de sumar gente: ¿lo podés sostener, o todavía no?',
  icon: '🧑‍💼',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoBrutoOfrecido: 900_000,
    ingresoNegocioMensual: 5_000_000,
    otrosGastos: 2_200_000,
  },
  fields: [
    {
      id: 'sueldoBrutoOfrecido',
      label: 'Sueldo bruto que ofrecés',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '900000',
      help: 'El bruto del recibo (antes de descuentos). El costo real es bastante mayor.',
      group: 'El puesto',
      groupIcon: '🧑‍💼',
    },
    {
      id: 'ingresoNegocioMensual',
      label: 'Ingreso mensual del negocio',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '5000000',
      help: 'Lo que factura/ingresa tu negocio por mes (promedio).',
      group: 'Tu negocio',
      groupIcon: '🏢',
    },
    {
      id: 'otrosGastos',
      label: 'Otros gastos del negocio ($/mes)',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '2200000',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo demás que pagás por mes: alquiler, insumos, impuestos, tu propio retiro.',
      group: 'Tu negocio',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-costo-laboral-total-empleador-cargas', label: 'Costo laboral total' },
    { slug: 'calculadora-aportes-patronales-empleado-registrado-cargas-sociales-2026', label: 'Aportes patronales' },
    { slug: 'calculadora-costo-hora-empleado-real', label: 'Costo real de la hora' },
    { slug: 'calculadora-aguinaldo-sac', label: 'Aguinaldo (SAC)' },
  ],
  howItWorks: `Esta sala te muestra lo que de verdad cuesta sumar a alguien y si tu negocio lo aguanta.

1. **Sueldo bruto.** El punto de partida: lo que figura en el recibo, antes de descuentos.
2. **Cargas patronales.** Suma ~21% del bruto en contribuciones patronales (jubilación, obra social, asignaciones, etc.) que paga el empleador, ya con la baja de la Ley 27.802 (2026), además de lo que se le descuenta al empleado.
3. **ART y seguros.** Agrega ~5% por la ART (riesgos del trabajo) y el seguro de vida obligatorio.
4. **Aguinaldo y vacaciones.** Prorratea el aguinaldo (bruto ÷ 12) y provisiona las vacaciones (~5%, 14 días LCT a sueldo/25): son costos que vienen sí o sí, aunque no los pagues todos los meses.
5. **Costo total y test de sostenibilidad.** Suma todo (≈1,5× el bruto) y lo compara con tu ingreso menos tus otros gastos. Si el empleado se come tu margen, te avisa; si te deja colchón, te dice que podés contratar.`,
  faq: [
    {
      q: '¿Por qué contratar cuesta 1,5 veces el sueldo?',
      a: 'Porque al bruto se le suman las cargas patronales (~21%, ya con la baja de la Ley 27.802), la ART y el seguro de vida (~5%), el aguinaldo (un sueldo extra al año, prorrateado da bruto/12) y la provisión de vacaciones (~5%). Todo eso lo paga el empleador además del sueldo, llevando el costo real a cerca de 1,4× el bruto.',
    },
    {
      q: '¿Qué incluyen las cargas patronales?',
      a: 'Los aportes que paga el empleador sobre el sueldo: jubilación (SIPA), obra social, PAMI, asignaciones familiares y fondo de empleo, entre otros. Rondan el 21% del bruto tras la baja de contribuciones de la Ley 27.802 (2026), aunque la alícuota exacta depende de la actividad y del tamaño de la empresa (hay reducciones para pymes y nuevas contrataciones).',
    },
    {
      q: '¿Tengo que pagar el aguinaldo aparte?',
      a: 'Sí. El aguinaldo (SAC) es medio sueldo en junio y medio en diciembre. Para no descapitalizarte cuando llega, lo sano es provisionar bruto/12 cada mes. Esta sala ya lo incluye en el costo total mensual.',
    },
    {
      q: '¿El costo incluye una posible indemnización?',
      a: 'No. La indemnización por despido es un costo eventual importante que esta sala no provisiona, porque no sabés si va a ocurrir. Tenelo en el radar: si tuvieras que desvincular, un período de prueba de 3 meses te protege de pagarla durante ese tiempo.',
    },
    {
      q: '¿Cuánto de mi ingreso debería destinar a sueldos?',
      a: 'Como guía de prudencia, que el costo total de un empleado no supere ~40% de tu ingreso, dejando margen para los meses flojos y para lo demás. No es una regla rígida: depende de tu margen y de cuánto genere esa persona. Esta sala te avisa si quedás ajustado.',
    },
    {
      q: '¿Conviene contratar en blanco o por monotributo?',
      a: 'Depende de la relación. Si hay subordinación, horario y exclusividad, corresponde relación de dependencia (en blanco): contratar como "monotributista" una relación laboral encubierta es riesgoso y puede salir mucho más caro en juicios. Para tareas por proyecto o autónomas, un monotributista es legítimo y más flexible.',
    },
    {
      q: '¿Y si no estoy seguro de sostenerlo todo el año?',
      a: 'Empezá con menos riesgo: período de prueba (3 meses), part-time, o un monotributista por proyecto. Así validás que la necesidad y los ingresos justifican el puesto antes de comprometerte con el costo full-time, que es difícil de revertir.',
    },
    {
      q: '¿Esto reemplaza a un contador?',
      a: 'No. Las alícuotas de cargas, ART y las reducciones para pymes varían por actividad, convenio y zona. Esta sala da una estimación para que dimensiones el costo; las cifras exactas y la modalidad de contratación validalas con un contador y un abogado laboral matriculados.',
    },
  ],
  sources: [
    { name: 'Ley 20.744 (LCT) — Régimen de contrato de trabajo', url: 'https://www.argentina.gob.ar/normativa' },
    { name: 'ARCA — Empleadores y cargas sociales', url: 'https://www.arca.gob.ar/' },
    { name: 'SRT — Aseguradoras de Riesgos del Trabajo (ART)', url: 'https://www.argentina.gob.ar/srt' },
  ],
};
