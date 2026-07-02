/**
 * Sala de decisión — "¿Me conviene emigrar?"
 *
 * Patrón COMPARACIÓN A vs B sobre la métrica que de verdad cuenta: la CAPACIDAD
 * DE AHORRO mensual (sueldo neto − costo de vida) en tu país actual vs el
 * destino. Calcula la mejora de ahorro y en cuántos meses recuperás el costo de
 * la mudanza. Honesto sobre lo que NO mide (impuestos del destino, visa,
 * intangibles familiares y emocionales).
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

function compute(inputs: Record<string, any>): DecisionResult {
  const sueldoActual = Math.max(0, num(inputs.sueldoNetoActual));
  const sueldoDestino = Math.max(0, num(inputs.sueldoNetoDestino));
  const costoActual = Math.max(0, num(inputs.costoVidaActual));
  const costoDestino = Math.max(0, num(inputs.costoVidaDestino));
  const costoMudanza = Math.max(0, num(inputs.costoMudanza));
  const mesesAdaptacion = Math.max(0, Math.min(36, num(inputs.mesesAdaptacion)));

  if (!sueldoActual || !sueldoDestino || !costoActual || !costoDestino) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu sueldo neto y costo de vida actuales, y los del destino (ambos en la misma moneda, ej. USD). Con eso comparamos tu capacidad de ahorro a cada lado.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Mejora de ahorro mensual' },
      scenarios: [],
      nextActions: [
        'Cargá tu **sueldo neto** y tu **costo de vida** de hoy.',
        'Cargá el **sueldo neto esperado** y el **costo de vida** del destino, en la **misma moneda** (convertí todo a USD si hace falta).',
      ],
    };
  }

  const ahorroActual = sueldoActual - costoActual;
  const ahorroDestino = sueldoDestino - costoDestino;
  const mejora = ahorroDestino - ahorroActual; // $/mes

  // Meses para recuperar la mudanza: durante la adaptación asumimos que NO
  // ahorrás de más (gastos de instalación se comen la mejora). Después, la
  // mudanza se recupera con la mejora mensual de ahorro.
  const mesesRecupero =
    mejora > 0 ? mesesAdaptacion + costoMudanza / mejora : Infinity;

  const fmtMeses = (m: number) =>
    !Number.isFinite(m)
      ? 'nunca (no mejora el ahorro)'
      : m <= 0
        ? 'de inmediato'
        : `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (mejora <= 0) {
    status = 'a'; // A = quedarte
    tone = 'warn';
    title = 'Por la plata, te conviene quedarte';
    badge = 'No conviene';
    detail = `Tu capacidad de ahorro en el destino (${fmtMoney(ahorroDestino)}/mes) es igual o menor a la de hoy (${fmtMoney(ahorroActual)}/mes): perdés ${fmtMoney(Math.abs(mejora))} de ahorro por mes. Por lo económico no se justifica; si igual querés emigrar, que sea por motivos no financieros.`;
  } else if (Number.isFinite(mesesRecupero) && mesesRecupero <= 24) {
    status = 'b'; // B = emigrar
    tone = 'good';
    title = 'Económicamente, emigrar conviene';
    badge = 'Conviene';
    detail = `En el destino ahorrás ${fmtMoney(mejora)} más por mes. Recuperás el costo de la mudanza (${fmtMoney(costoMudanza)}) en ${fmtMeses(mesesRecupero)} y de ahí en adelante todo es ganancia neta de ahorro.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Mejora, pero el repago es largo';
    badge = 'A evaluar';
    detail = `Ahorrás ${fmtMoney(mejora)} más por mes, pero recuperar la mudanza (${fmtMoney(costoMudanza)}) te lleva ${fmtMeses(mesesRecupero)}. Conviene si tu horizonte es de varios años; si pensás volver pronto, los números no cierran solos.`;
  }

  const mejoraAnual = mejora * 12;
  const ahorro5Anios = mejora * 60 - costoMudanza;

  const scenarios = [
    {
      label: 'Conservador',
      value: fmtMoney(mejora * 0.8 * 12 - costoMudanza),
      detail: 'Si el costo de vida del destino resulta ~12% más alto de lo previsto, a 1 año neto.',
    },
    {
      label: 'Probable (1 año)',
      value: fmtMoney(mejoraAnual - costoMudanza),
      detail: 'Mejora de ahorro a 12 meses, descontando la mudanza.',
    },
    {
      label: 'A 5 años',
      value: fmtMoney(ahorro5Anios),
      detail: 'Ahorro extra acumulado en 5 años, ya neto de la mudanza.',
    },
  ];

  const comparison = {
    columns: ['Quedarte', 'Emigrar'] as [string, string],
    rows: [
      { label: 'Sueldo neto', a: fmtMoney(sueldoActual), b: fmtMoney(sueldoDestino) },
      { label: 'Costo de vida', a: '-' + fmtMoney(costoActual).replace('-', ''), b: '-' + fmtMoney(costoDestino).replace('-', '') },
      {
        label: 'Capacidad de ahorro mensual',
        a: fmtMoney(ahorroActual),
        b: fmtMoney(ahorroDestino),
        hint: `${mejora >= 0 ? '+' : ''}${fmtMoney(mejora).replace('-', mejora < 0 ? '-' : '')}/mes en destino`,
      },
      {
        label: 'Costo de mudanza (una vez)',
        a: '—',
        b: '-' + fmtMoney(costoMudanza).replace('-', ''),
        hint: `se recupera en ${fmtMeses(mesesRecupero)}`,
      },
    ],
  };

  const nextActions = [
    'Convertí **todo a la misma moneda** (sueldos y costos en USD, por ejemplo) antes de comparar: mezclar monedas distorsiona el resultado.',
    mejora > 0
      ? `Tu ahorro mejora ${fmtMoney(mejora)}/mes y recuperás la mudanza en ${fmtMeses(mesesRecupero)}. Validá el **costo de vida real** del destino con alguien que viva ahí antes de decidir.`
      : 'Los números económicos no dan a favor: si emigrás igual, que sea por carrera, seguridad o calidad de vida, no esperando ahorrar más.',
    'Sumá aparte los **costos de visa, trámites y revalidación de títulos**, y averiguá los **impuestos del destino**: esta sala no los descuenta y pueden cambiar el resultado.',
    'Pesá los **intangibles** (familia, idioma, red de contactos, clima): no entran en el número pero pesan tanto o más que la plata.',
  ];

  const notes = [
    'Compara la capacidad de ahorro (sueldo neto − costo de vida) a cada lado. El repago de la mudanza asume que durante los meses de adaptación no ahorrás de más; después, la mejora mensual amortiza el costo.',
    'NO considera impuestos del país de destino, costos de visa/trámites, ni intangibles (familia, idioma, seguridad, proyección profesional). Cargá los sueldos NETOS reales del destino.',
    'No es asesoramiento financiero ni migratorio. Para visas, impuestos y revalidaciones consultá con profesionales matriculados de cada país.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: `${mejora >= 0 ? '+' : ''}${fmtMoney(mejora)}/mes`,
      label: mejora >= 0 ? 'Ahorrás más emigrando' : 'Ahorrás menos emigrando',
      sub: `Recuperás la mudanza en **${fmtMeses(mesesRecupero)}**. Ahorro actual ${fmtMoney(ahorroActual)}/mes vs destino ${fmtMoney(ahorroDestino)}/mes.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'me-conviene-emigrar',
  title: '¿Me conviene emigrar? Comparador de ahorro y costo de vida 2026',
  h1: '¿Me conviene emigrar?',
  description:
    'Compará tu capacidad de ahorro real (sueldo neto menos costo de vida) en tu país actual contra el destino, y descubrí en cuántos meses recuperás el costo de la mudanza. Honesto sobre lo que no mide.',
  intro:
    'Emigrar no se decide por el sueldo que te ofrecen afuera, sino por cuánto podés ahorrar de verdad allá vs acá. Esta sala compara tu capacidad de ahorro (sueldo neto menos costo de vida) a cada lado, calcula cuánto mejora por mes y en cuánto tiempo recuperás la mudanza. Te dice qué dicen los números, y es honesta sobre lo que no mide.',
  icon: '✈️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    sueldoNetoActual: 1300,
    sueldoNetoDestino: 2800,
    costoVidaActual: 900,
    costoVidaDestino: 1900,
    costoMudanza: 5000,
    mesesAdaptacion: 3,
  },
  fields: [
    {
      id: 'sueldoNetoActual',
      label: 'Sueldo neto actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1300',
      help: 'Lo que cobrás hoy en la mano, por mes. Convertilo a USD para comparar parejo.',
      group: 'Tu situación actual',
      groupIcon: '🏠',
    },
    {
      id: 'costoVidaActual',
      label: 'Costo de vida actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '900',
      profileKey: 'gastos.recurrentesMensual',
      help: 'Todo lo que gastás por mes para vivir hoy, en la misma moneda.',
      group: 'Tu situación actual',
    },
    {
      id: 'sueldoNetoDestino',
      label: 'Sueldo neto esperado en destino',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '2800',
      help: 'El sueldo NETO (después de impuestos del destino) que esperás cobrar, misma moneda.',
      group: 'El destino',
      groupIcon: '✈️',
    },
    {
      id: 'costoVidaDestino',
      label: 'Costo de vida en destino',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1900',
      help: 'Cuánto cuesta vivir por mes en el destino (alquiler, comida, transporte, salud), misma moneda.',
      group: 'El destino',
    },
    {
      id: 'costoMudanza',
      label: 'Costo de la mudanza',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '5000',
      help: 'Pasajes, depósito inicial, instalación, trámites. El gasto de una sola vez para llegar.',
      group: 'El destino',
    },
    {
      id: 'mesesAdaptacion',
      label: 'Meses de adaptación',
      type: 'number',
      default: 3,
      min: 0,
      max: 36,
      suffix: 'meses',
      advanced: true,
      help: 'Meses iniciales en los que todavía no ahorrás de más (instalación, buscar trabajo estable).',
      group: 'El destino',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala compara lo único que se puede comparar parejo entre dos países: cuánto te queda para ahorrar.

1. **Capacidad de ahorro a cada lado.** Resta tu costo de vida a tu sueldo neto, hoy y en el destino. Ese es el dinero que realmente podés guardar por mes en cada lugar.
2. **Mejora mensual.** Calcula la diferencia entre el ahorro del destino y el actual. Si es negativa, por la plata no conviene.
3. **Repago de la mudanza.** Suma los meses de adaptación (en los que no ahorrás de más) y divide el costo de la mudanza por la mejora mensual: así sabés en cuántos meses "recuperás" lo que gastaste en irte.
4. **Veredicto.** Conviene si la mudanza se paga sola en un plazo razonable (≈2 años) y de ahí en más todo es ahorro extra.
5. **Lo que NO entra.** Es transparente: no descuenta impuestos del destino, visa ni intangibles. Esos hay que sumarlos aparte antes de decidir.`,
  faq: [
    {
      q: '¿Por qué comparan la capacidad de ahorro y no el sueldo?',
      a: 'Porque un sueldo más alto en un país más caro puede dejarte ahorrando menos. Lo que mejora tu vida financiera es cuánto te queda después de pagar el costo de vida. Por eso la métrica correcta es sueldo neto menos costo de vida a cada lado.',
    },
    {
      q: '¿En qué moneda cargo los datos?',
      a: 'En la misma para los dos lados. Lo más práctico es convertir todo a dólares (USD): tu sueldo y costo de vida actuales, y los del destino. Si mezclás monedas, la comparación no tiene sentido.',
    },
    {
      q: '¿El sueldo del destino va antes o después de impuestos?',
      a: 'Después: cargá siempre el NETO, lo que realmente cobrarías en la mano allá. Los impuestos varían mucho entre países y esta sala no los calcula, así que ya tienen que estar descontados en el número que ingresás.',
    },
    {
      q: '¿Qué incluye el costo de la mudanza?',
      a: 'El gasto de una sola vez para instalarte: pasajes, depósito y primer alquiler, muebles básicos, trámites de visa y traslado de pertenencias. Es lo que tenés que "recuperar" con el mayor ahorro mensual para que la jugada cierre.',
    },
    {
      q: '¿Qué son los meses de adaptación?',
      a: 'El período inicial en el que todavía no ahorrás de más: estás instalándote, quizás buscando un trabajo estable o gastando en cosas de arranque. La sala los suma al plazo de repago para no ser demasiado optimista.',
    },
    {
      q: '¿La decisión es solo económica?',
      a: 'No, y la sala lo dice de entrada. Familia, idioma, seguridad, clima, proyección profesional y red de contactos pesan tanto o más que la plata. Este cálculo te da el lado financiero; el resto lo ponés vos.',
    },
    {
      q: '¿Esto reemplaza a un asesor migratorio o contable?',
      a: 'No. Es una herramienta orientativa para el lado financiero. Para visas, impuestos del destino, revalidación de títulos y planificación patrimonial internacional, consultá con profesionales matriculados de cada país.',
    },
  ],
  sources: [
    { name: 'OCDE — Better Life Index (costo de vida comparado)', url: 'https://www.oecdbetterlifeindex.org/' },
    { name: 'INDEC — Canasta Básica Total', url: 'https://www.indec.gob.ar/' },
  ],
};
