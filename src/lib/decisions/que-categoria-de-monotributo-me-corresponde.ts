/**
 * Sala de decisión — "¿Qué categoría de monotributo me corresponde y cuándo cambiar?"
 *
 * Patrón CLASIFICACIÓN. Toma tu facturación anual (real y proyectada) más
 * alquiler y energía devengados y la ubica contra los TOPES de facturación de
 * las categorías A–K (valores aproximados 2026; deben verificarse en ARCA).
 * Devuelve la categoría estimada y, con tu proyección mensual, en cuántos meses
 * superarías el tope (gatillo de recategorización semestral).
 *
 * Math inline determinístico: rangos de facturación por categoría. Los montos
 * son ORIENTATIVOS y se aclara fuerte en notes/verdict.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';
import { TOPES, categoriaPorIngresos } from '../data/monotributo-2026';

/**
 * Topes y categorías = FUENTE ÚNICA DE VERDAD src/lib/data/monotributo-2026.ts
 * (la misma que alimenta /datos-monotributo-2026). Cuando ARCA actualice la
 * escala (recategorización semestral: enero y julio), se corrige en UN solo
 * lugar y esta sala se sincroniza sola. En 2026 los topes de ingresos son
 * iguales para servicios y venta de bienes; lo que difiere es la cuota.
 */
function categoriaPara(facturacion: number): { cat: string; tope: number } | null {
  const c = categoriaPorIngresos(facturacion);
  return c ? { cat: c, tope: TOPES[c] } : null;
}

function compute(inputs: Record<string, any>): DecisionResult {
  const facturacionAnual = Math.max(0, num(inputs.facturacionAnual));
  const proyMensual = Math.max(0, num(inputs.facturacionMensualProyectada));
  const alquilerAnual = Math.max(0, num(inputs.alquilerAnual));
  const energiaAnual = Math.max(0, num(inputs.energiaAnual));

  if (!facturacionAnual && !proyMensual) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu facturación de los últimos 12 meses (o tu proyección mensual) para ubicarte en una categoría y estimar cuándo te tocaría recategorizar.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Categoría estimada' },
      scenarios: [],
      nextActions: [
        'Cargá tu **facturación de los últimos 12 meses** (la suma de todas tus facturas).',
        'Si esperás crecer, cargá tu **facturación mensual proyectada** para ver en cuántos meses superarías el tope.',
      ],
    };
  }

  // Facturación de referencia: la mayor entre la anual histórica y la anualización de la proyección.
  const proyAnualizada = proyMensual * 12;
  const facturacionRef = Math.max(facturacionAnual, proyAnualizada);

  const actual = categoriaPara(facturacionAnual || proyAnualizada);
  const refCat = categoriaPara(facturacionRef);

  // — Meses hasta superar el tope de la categoría actual con la proyección —
  const catBase = actual;
  let mesesHastaTope = Infinity;
  if (catBase && proyMensual > 0) {
    const margenRestante = Math.max(0, catBase.tope - facturacionAnual);
    mesesHastaTope = margenRestante / proyMensual;
  }
  const fmtMeses = (m: number) =>
    !Number.isFinite(m) ? 'sin proyección de crecimiento'
      : m <= 0 ? 'ya superado'
      : `${m.toFixed(1).replace('.', ',').replace(',0', '')} meses`;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (!refCat) {
    // Supera la K → debería pasar a Responsable Inscripto.
    status = 'a';
    tone = 'bad';
    title = 'Superás el tope del monotributo';
    badge = 'Fuera de monotributo';
    detail = `Con una facturación de referencia de ${fmtMoney(facturacionRef)} estás por encima del tope máximo (categoría K). Te correspondería pasar a Responsable Inscripto. Verificá tu situación exacta en ARCA.`;
  } else if (catBase && refCat.cat !== catBase.cat) {
    status = 'tie';
    tone = 'warn';
    title = `Hoy estás en ${catBase.cat}, pero proyectás ${refCat.cat}`;
    badge = `${catBase.cat} → ${refCat.cat}`;
    detail = `Tu facturación de los últimos 12 meses te ubica en categoría ${catBase.cat}, pero con tu proyección llegarías a ${refCat.cat}. A este ritmo superarías el tope de ${catBase.cat} en ${fmtMeses(mesesHastaTope)}.`;
  } else if (Number.isFinite(mesesHastaTope) && mesesHastaTope <= 6) {
    status = 'tie';
    tone = 'warn';
    title = `Categoría ${refCat.cat}: el tope está cerca`;
    badge = `Categoría ${refCat.cat}`;
    detail = `Te corresponde la categoría ${refCat.cat} (tope ${fmtMoney(refCat.tope)} anuales). Con tu proyección superarías ese tope en ${fmtMeses(mesesHastaTope)}: vigilá la próxima recategorización.`;
  } else {
    status = 'b';
    tone = 'good';
    title = `Te corresponde la categoría ${refCat.cat}`;
    badge = `Categoría ${refCat.cat}`;
    detail = `Con tu facturación estás cómodo en categoría ${refCat.cat} (tope ${fmtMoney(refCat.tope)} anuales). No proyectás superar el tope en el corto plazo. Recordá que la recategorización es semestral (enero y julio).`;
  }

  // — Escenarios: dónde caés con +0%, +20% y +40% de facturación —
  const escenario = (factor: number) => {
    const f = facturacionRef * factor;
    const c = categoriaPara(f);
    return { f, label: c ? `Categoría ${c.cat}` : 'Responsable Inscripto' };
  };
  const e0 = escenario(1);
  const e20 = escenario(1.2);
  const e40 = escenario(1.4);

  const scenarios = [
    { label: 'Facturación actual', value: e0.label, detail: `Anual de referencia: ${fmtMoney(e0.f)}.` },
    { label: 'Si crecés +20%', value: e20.label, detail: `Anual proyectada: ${fmtMoney(e20.f)}.` },
    { label: 'Si crecés +40%', value: e40.label, detail: `Anual proyectada: ${fmtMoney(e40.f)}.` },
  ];

  const breakdown = [
    { label: 'Facturación últimos 12 meses', value: fmtMoney(facturacionAnual) },
    { label: 'Proyección anualizada (mensual × 12)', value: fmtMoney(proyAnualizada), hint: proyMensual > 0 ? `${fmtMoney(proyMensual)}/mes` : 'sin proyección' },
    { label: 'Facturación de referencia (la mayor)', value: fmtMoney(facturacionRef) },
    { label: 'Alquiler devengado anual', value: fmtMoney(alquilerAnual), hint: 'parámetro adicional de categorización' },
    { label: 'Energía eléctrica anual', value: fmtMoney(energiaAnual), hint: 'parámetro adicional de categorización' },
    { label: 'Categoría estimada', value: refCat ? refCat.cat : 'Fuera (RI)', hint: refCat ? `tope ${fmtMoney(refCat.tope)}` : undefined },
    { label: 'Tope de tu categoría actual', value: catBase ? fmtMoney(catBase.tope) : '—' },
    { label: 'Meses hasta superar el tope', value: fmtMeses(mesesHastaTope) },
  ];

  const nextActions = [
    'Verificá los **topes y montos oficiales en ARCA** (Mi Monotributo): los valores de esta sala son aproximados y se actualizan en cada recategorización.',
    'La recategorización es **semestral (enero y julio)**: revisá tu facturación de los últimos 12 meses antes de cada fecha para no quedar excluido.',
    Number.isFinite(mesesHastaTope) && mesesHastaTope <= 6
      ? `A tu ritmo superarías el tope en ${fmtMeses(mesesHastaTope)}: preparate para recategorizar a la categoría siguiente y ajustá tus precios para cubrir la cuota mayor.`
      : 'No proyectás superar el tope pronto: mantené tu facturación documentada (facturas emitidas) por si ARCA te pide respaldo.',
    'Además de la facturación, ARCA mira **alquiler devengado y energía eléctrica consumida**: si tu local consume mucho, puede empujarte a una categoría superior aunque factures poco.',
    (alquilerAnual > 0 || energiaAnual > 0)
      ? 'Cargaste alquiler/energía: tenelos a mano, son parámetros que ARCA cruza con la facturación.'
      : 'Si tenés local, cargá el alquiler anual y el consumo eléctrico: pueden cambiar tu categoría.',
  ];

  const notes = [
    '⚠️ Los topes de facturación A–K son APROXIMADOS para 2026 y cambian en cada recategorización. Esta sala es orientativa: confirmá siempre los valores vigentes en ARCA antes de decidir.',
    'La categorización de monotributo considera tres parámetros: facturación anual, alquiler devengado y energía eléctrica consumida. Esta estimación se basa principalmente en la facturación; los otros dos pueden elevar tu categoría.',
    'En 2026 los topes de ingresos son iguales para servicios y para venta de cosas muebles; lo que cambia por categoría es la cuota mensual, no el tope. Verificá el valor de tu cuota según tu actividad en ARCA.',
    'No es asesoramiento contable. Para tu situación exacta (actividad, recategorización, exclusión) consultá con un contador público matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: refCat ? `Categoría ${refCat.cat}` : 'Responsable Inscripto',
      label: 'Categoría estimada de monotributo',
      sub: `Facturación de referencia: **${fmtMoney(facturacionRef)}**. Tope hasta recategorizar: **${fmtMeses(mesesHastaTope)}**. Valores aproximados — verificá en ARCA.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'que-categoria-de-monotributo-me-corresponde',
  title: '¿Qué categoría de monotributo me corresponde? Guía 2026',
  h1: '¿Qué categoría de monotributo me corresponde y cuándo cambiar?',
  description:
    'Estimá tu categoría de monotributo (A–K) según tu facturación anual, alquiler y energía, y descubrí en cuántos meses superarías el tope para recategorizar. Valores orientativos 2026, verificables en ARCA.',
  intro:
    'El monotributo se recategoriza por tramos de facturación, y quedarse en la categoría equivocada te puede excluir del régimen. Esta sala ubica tu facturación de los últimos 12 meses (y tu proyección) contra los topes A–K, te dice qué categoría te corresponde y en cuántos meses superarías el tope al ritmo que venís. Los montos son aproximados: la fuente oficial siempre es ARCA.',
  icon: '🧾',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    facturacionAnual: 16_800_000,
    facturacionMensualProyectada: 1_700_000,
    alquilerAnual: 2_400_000,
    energiaAnual: 480_000,
  },
  fields: [
    {
      id: 'facturacionAnual',
      label: 'Facturación últimos 12 meses',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '16800000',
      help: 'La suma de todas las facturas que emitiste en los últimos 12 meses.',
      group: 'Tu facturación',
      groupIcon: '🧾',
    },
    {
      id: 'facturacionMensualProyectada',
      label: 'Facturación mensual proyectada',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '1700000',
      help: 'Lo que esperás facturar por mes de acá en adelante. Sirve para estimar cuándo superarías el tope.',
      group: 'Tu facturación',
    },
    {
      id: 'alquilerAnual',
      label: 'Alquiler devengado anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      profileKey: 'vivienda.alquilerMensual',
      help: 'Alquiler anual del local/oficina afectado a la actividad. Es un parámetro que ARCA cruza con la facturación.',
      group: 'Otros parámetros',
      groupIcon: '🏠',
    },
    {
      id: 'energiaAnual',
      label: 'Energía eléctrica anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Consumo eléctrico anual (kWh o $) afectado a la actividad. También influye en la categoría.',
      group: 'Otros parámetros',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-monotributo-2026', label: 'Cuota de monotributo 2026' },
    { slug: 'calculadora-monotributo-categoria-ingresos-tope', label: 'Categoría por ingresos y topes' },
    { slug: 'calculadora-facturacion-maxima-monotributo-vs-ri', label: 'Facturación máxima vs RI' },
    { slug: 'calculadora-monotributo-vs-responsable-inscripto', label: 'Monotributo vs Responsable Inscripto' },
  ],
  howItWorks: `Esta sala te ubica en la escala del monotributo y proyecta cuándo te tocaría cambiar.

1. **Facturación de referencia.** Toma la mayor entre tu facturación de los últimos 12 meses y tu proyección mensual anualizada (mensual × 12). Esa es la base de la categorización.
2. **Categoría estimada.** Compara esa facturación contra los topes anuales de las categorías A a K (valores aproximados 2026). La categoría es la primera cuyo tope no superás.
3. **Meses hasta recategorizar.** Con tu proyección mensual, calcula cuánto margen te queda hasta el tope de tu categoría actual y en cuántos meses lo alcanzarías.
4. **Escenarios de crecimiento.** Muestra en qué categoría caerías si tu facturación sube 20% o 40%, para que veas el salto antes de que ocurra.
5. **Parámetros adicionales.** Recuerda que el alquiler devengado y la energía consumida también definen tu categoría: si tu local consume mucho, podés subir de categoría aunque factures poco.`,
  faq: [
    {
      q: '¿Cómo se determina mi categoría de monotributo?',
      a: 'Por tu facturación bruta de los últimos 12 meses, pero ARCA también considera el alquiler devengado del local y la energía eléctrica consumida. La categoría es la que corresponde al mayor de esos parámetros. Esta sala se basa principalmente en la facturación y te recuerda mirar los otros dos.',
    },
    {
      q: '¿Cada cuánto tengo que recategorizar?',
      a: 'La recategorización es semestral: en enero y en julio. En cada fecha tenés que revisar tu facturación de los últimos 12 meses y, si cambió de tramo, ajustar tu categoría en ARCA. Si no recategorizás cuando corresponde, podés tener multas o quedar excluido.',
    },
    {
      q: '¿Qué pasa si supero el tope de la categoría K?',
      a: 'Quedás excluido del monotributo y tenés que inscribirte como Responsable Inscripto (IVA + Ganancias). Conviene anticiparlo: usá nuestra sala "¿Monotributo o Responsable Inscripto?" para estimar la carga impositiva del cambio.',
    },
    {
      q: '¿Los montos de esta calculadora son oficiales?',
      a: 'No. Los topes A–K son aproximados para 2026 y se actualizan en cada recategorización. Esta sala es orientativa para que sepas en qué tramo estás y cuándo prestar atención. La fuente oficial siempre es ARCA (Mi Monotributo).',
    },
    {
      q: '¿La escala es igual para servicios y para venta de productos?',
      a: 'En 2026 los topes de facturación (ingresos brutos) son iguales para servicios y para venta de cosas muebles de las categorías A a K. Lo que difiere según la actividad es el monto de la cuota mensual, no el tope de facturación. Verificá tu cuota en ARCA según tu actividad.',
    },
    {
      q: '¿Conviene quedarse en una categoría más baja facturando menos por fuera?',
      a: 'No. No declarar facturación para no subir de categoría es evasión y ARCA cruza datos (bancos, tarjetas, AFIP). Si crecés, lo correcto es recategorizar o pasar a Responsable Inscripto. Esta sala te ayuda a planificar ese paso, no a esconderlo.',
    },
    {
      q: '¿El alquiler y la energía realmente cambian mi categoría?',
      a: 'Sí. Si el alquiler devengado o la energía eléctrica consumida superan los límites de tu categoría por facturación, ARCA te ubica en la categoría superior. Por eso conviene cargarlos: un local con alto consumo puede empujarte hacia arriba aunque factures poco.',
    },
    {
      q: '¿Esto reemplaza a un contador?',
      a: 'No. Es una estimación orientativa. Para tu recategorización exacta, exclusiones, o el pase a Responsable Inscripto, consultá con un contador público matriculado y verificá los valores vigentes en ARCA.',
    },
  ],
  sources: [
    { name: 'ARCA — Monotributo (categorías y recategorización)', url: 'https://www.arca.gob.ar/monotributo/' },
    { name: 'Ley 24.977 — Régimen Simplificado para Pequeños Contribuyentes', url: 'https://www.argentina.gob.ar/normativa' },
  ],
};
