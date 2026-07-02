/**
 * Sala de decisión (México) — "¿Cuándo alcanzo mi meta de ahorro?"
 *
 * Patrón PROYECCIÓN TEMPORAL. Simula mes a mes la acumulación (ahorro inicial
 * + aportes + rendimiento compuesto) hasta tocar la meta. A diferencia del
 * caso argentino, en México la inflación ronda el 4% anual y los CETES pagan
 * 8–9%: el rendimiento REAL es positivo, así que invertir el ahorro sí acorta
 * el plazo de verdad (el concepto GAT real de CONDUSEF). La meta puede
 * ajustarse por inflación para llegar con el mismo poder de compra.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

/**
 * Simula meses hasta alcanzar la meta.
 * @param metaMovil si true, la meta crece con la inflación (poder de compra).
 */
function simular(
  meta: number,
  inicial: number,
  aporte: number,
  rendMensual: number,
  inflMensual: number,
  metaMovil: boolean,
): { meses: number; saldoFinal: number } {
  let saldo = inicial;
  let metaActual = meta;
  let meses = 0;
  const MAX = 1200; // 100 años
  if (saldo >= metaActual) return { meses: 0, saldoFinal: saldo };
  while (saldo < metaActual && meses < MAX) {
    meses++;
    saldo = saldo * (1 + rendMensual) + aporte;
    if (metaMovil) metaActual = metaActual * (1 + inflMensual);
    if (aporte <= 0 && rendMensual <= inflMensual && metaMovil) break;
  }
  return { meses, saldoFinal: saldo };
}

const fmtMeses = (m: number) => {
  if (m <= 0) return 'ya la alcanzaste';
  if (m >= 1200) return 'más de 100 años';
  const a = Math.floor(m / 12);
  const r = m % 12;
  if (a === 0) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  if (r === 0) return `${a} ${a === 1 ? 'año' : 'años'}`;
  return `${a} ${a === 1 ? 'año' : 'años'} y ${r} ${r === 1 ? 'mes' : 'meses'}`;
};

const fechaEn = (m: number) => {
  const d = new Date(2026, 6, 1); // jul 2026 (referencia 2026-07)
  d.setMonth(d.getMonth() + m);
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
};

function compute(inputs: Record<string, any>): DecisionResult {
  const meta = Math.max(0, num(inputs.meta));
  const inicial = Math.max(0, num(inputs.ahorroInicial));
  const aporte = Math.max(0, num(inputs.aporteMensual));
  const rendAnual = Math.max(0, num(inputs.rendimientoAnual));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));

  if (!meta || (inicial <= 0 && aporte <= 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Ingresa tu meta de ahorro y cuánto aportas al mes (o cuánto ya tienes). Calculamos en cuánto tiempo llegas, con el rendimiento de CETES o tu cuenta y, si quieres, ajustando por inflación.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para alcanzar tu meta' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **meta de ahorro** y tu **aporte mensual**.',
        'Suma lo que **ya tienes guardado** y el **rendimiento anual** esperado.',
      ],
    };
  }

  const rendMensual = rendAnual / 12 / 100;
  const inflMensual = Math.pow(1 + inflacionAnual / 100, 1 / 12) - 1;

  const resNominal = simular(meta, inicial, aporte, rendMensual, inflMensual, false);
  const resReal = simular(meta, inicial, aporte, rendMensual, inflMensual, true);

  const principal = inflacionAnual > 0 ? resReal : resNominal;
  const totalAportado = inicial + aporte * principal.meses;
  const gananciaRend = principal.saldoFinal - totalAportado;
  const rendRealAnual = rendAnual - inflacionAnual; // aproximación del "GAT real"

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (principal.meses >= 1200) {
    status = 'a';
    tone = 'warn';
    badge = 'Así no llegas';
  } else if (principal.meses <= 24) {
    status = 'b';
    tone = 'good';
    badge = 'A tu alcance';
  } else if (principal.meses <= 60) {
    status = 'tie';
    tone = 'neutral';
    badge = 'Mediano plazo';
  } else {
    status = 'a';
    tone = 'warn';
    badge = 'Largo plazo';
  }

  let detail: string;
  if (principal.meses >= 1200) {
    detail = `Con un aporte de ${fmtMoney(aporte)}/mes y rendimiento de ${fmtPct(rendAnual, 1)} anual, la meta crece más rápido de lo que ahorras. Necesitas aportar más o buscar un instrumento con mejor rendimiento.`;
  } else {
    detail = `Empezando con ${fmtMoney(inicial)} y aportando ${fmtMoney(aporte)}/mes a ${fmtPct(rendAnual, 1)} anual, alcanzas tu meta de ${fmtMoney(meta)} en ${fmtMeses(principal.meses)} (alrededor de ${fechaEn(principal.meses)})${inflacionAnual > 0 ? ', manteniendo el poder de compra frente a una inflación del ' + Math.round(inflacionAnual) + '%' : ''}. De ese total, ${fmtMoney(Math.max(0, gananciaRend))} los pone el interés compuesto, no tu bolsillo${rendRealAnual > 0 ? ` — con inflación baja, tu rendimiento real es de ${fmtPct(rendRealAnual, 1)} anual y de verdad suma` : ''}.`;
  }

  const resMas = simular(meta, inicial, aporte * 1.5, rendMensual, inflMensual, inflacionAnual > 0);
  const resSinRend = simular(meta, inicial, aporte, 0, inflMensual, inflacionAnual > 0);

  const scenarios = [
    { label: 'Aportando 50% más', value: fmtMeses(resMas.meses), detail: `Si apartas ${fmtMoney(aporte * 1.5)}/mes en lugar de ${fmtMoney(aporte)}.` },
    { label: 'Tu plan actual', value: fmtMeses(principal.meses), detail: `Con ${fmtMoney(aporte)}/mes a ${fmtPct(rendAnual, 1)} anual${inflacionAnual > 0 ? ', meta ajustada por inflación' : ''}.` },
    { label: 'Sin invertir (debajo del colchón)', value: fmtMeses(resSinRend.meses), detail: 'Si el dinero no genera rendimiento y solo acumulas aportes.' },
  ];

  const breakdown = [
    { label: 'Meta de ahorro', value: fmtMoney(meta) },
    { label: 'Ahorro inicial', value: fmtMoney(inicial) },
    { label: 'Aporte mensual', value: fmtMoney(aporte) },
    { label: 'Rendimiento anual', value: `${fmtPct(rendAnual, 1)}`, hint: inflacionAnual > 0 ? `real (tras inflación): ${fmtPct(rendRealAnual, 1)}` : 'nominal' },
    ...(inflacionAnual > 0
      ? [
          { label: 'Tiempo (meta fija en pesos)', value: fmtMeses(resNominal.meses), hint: 'sin ajustar por inflación' },
          { label: 'Tiempo (mismo poder de compra)', value: fmtMeses(resReal.meses), hint: `la meta sube ${Math.round(inflacionAnual)}% al año` },
        ]
      : [{ label: 'Tiempo para llegar', value: fmtMeses(resNominal.meses) }]),
    { label: 'Fecha estimada', value: principal.meses < 1200 ? fechaEn(principal.meses) : '—' },
    { label: 'Total que aportas tú', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el rendimiento', value: fmtMoney(Math.max(0, gananciaRend)) },
  ];

  const nextActions = [
    principal.meses >= 1200
      ? 'Con estos números no llegas: **sube el aporte** o busca mejor rendimiento (CETES, fondos de deuda, cuentas con rendimiento).'
      : `La palanca más fuerte es el **aporte mensual**: subirlo a ${fmtMoney(aporte * 1.5)} te adelanta a ${fmtMeses(resMas.meses)}.`,
    'Pon el ahorro a trabajar: **CETES en cetesdirecto** (desde $100, sin comisiones), fondos de deuda o una cuenta con rendimiento. Con inflación cerca del 4% y tasas de 8–9%, cada peso invertido gana poder de compra — dejarlo en una cuenta sin intereses es perderlo lento.',
    'Automatiza: programa la transferencia **cada quincena, el día que cobras**, y trata los extras (aguinaldo, prima vacacional, PTU, devolución del SAT) como aportes directos a la meta.',
    'Al comparar instrumentos, mira el **GAT real** (rendimiento después de inflación) que las instituciones deben publicar: es el número que dice cuánto crece de verdad tu dinero.',
  ];

  const notes = [
    'Simulación mes a mes: el saldo rinde a la tasa mensual y se le suma tu aporte. Si indicas inflación, la meta se actualiza cada mes para que llegues con el mismo poder de compra.',
    'El rendimiento se asume constante, pero las tasas siguen a Banxico y cambian. No se descuenta la retención de ISR sobre intereses ni comisiones: el plazo real puede variar un poco.',
    'No es asesoría financiera: es una proyección orientativa que conviene recalcular cada pocos meses.',
  ];

  return {
    status,
    verdict: {
      title: principal.meses >= 1200 ? 'Con este plan, la meta se aleja en vez de acercarse' : `Alcanzas tu meta en ${fmtMeses(principal.meses)}`,
      detail, tone, badge,
    },
    decisiveNumber: {
      value: fmtMeses(principal.meses),
      label: 'Tiempo para alcanzar tu meta',
      sub: principal.meses < 1200 ? `Fecha estimada: **${fechaEn(principal.meses)}**${inflacionAnual > 0 ? ' (manteniendo poder de compra)' : ''}.` : 'Necesitas aportar más o mejorar el rendimiento.',
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-mi-meta-de-ahorro',
  title: '¿Cuándo alcanzo mi meta de ahorro? Fecha con CETES México 2026',
  h1: '¿Cuándo alcanzo mi meta de ahorro?',
  description:
    'Calcula en cuánto tiempo llegas a tu meta de ahorro en México según tu aporte mensual y el rendimiento (CETES 8–9%, fondos, cuenta con rendimiento), con ajuste por inflación (~4%). Fecha estimada y cuánto pone el interés compuesto.',
  intro:
    'Tienes una meta — el enganche de una casa, un coche, un viaje, tu colchón — y quieres ponerle fecha. Esta sala simula mes a mes tu ahorro: lo que ya tienes, lo que aportas y el rendimiento que le saques (CETES pagan 8–9% anual; la inflación ronda el 4%, así que invertir sí gana terreno real). Si quieres, ajusta la meta por inflación para llegar con el mismo poder de compra, no solo con el número redondo.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    meta: 100000,
    ahorroInicial: 15000,
    aporteMensual: 3000,
    rendimientoAnual: 8.5,
    inflacionAnual: 4,
  },
  fields: [
    { id: 'meta', label: 'Tu meta de ahorro', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '100,000', help: 'Cuánto quieres juntar (enganche, coche, viaje, colchón).', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ahorroInicial', label: 'Lo que ya tienes guardado', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '15,000', help: 'Tu punto de partida hoy.', group: 'Tu meta' },
    { id: 'aporteMensual', label: 'Cuánto aportas al mes', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '3,000', help: 'Lo que sumas cada mes (o reparte el monto entre tus dos quincenas).', group: 'Tu plan', groupIcon: '💪' },
    { id: 'rendimientoAnual', label: 'Rendimiento anual esperado', type: 'number', suffix: '%', default: 8, min: 0, placeholder: '8.5', help: 'CETES y cuentas con rendimiento pagan alrededor de 8–9% anual. Pon 0 si lo guardas sin invertir.', group: 'Tu plan' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 4, min: 0, max: 100, placeholder: '4', help: 'Opcional. En México ronda el 4% anual; con ella ajustamos la meta para conservar poder de compra.', group: 'Tu plan', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-cetes-mexico-rendimiento-28-91-182-364-dias', label: 'Rendimiento de CETES' },
    { slug: 'mx/calculadora-ahorro-programado-mexico', label: 'Ahorro programado' },
    { slug: 'mx/calculadora-pagare-bancario-vs-cete-rendimiento-mexico', label: 'Pagaré bancario vs CETES' },
    { slug: 'mx/calculadora-cuenta-de-ahorro-mexico-rendimiento-cetes-directo-nu-mercado-pago', label: 'Cuentas con rendimiento' },
  ],
  howItWorks: `Esta sala simula tu ahorro mes a mes hasta que toca la meta.

1. **Tu punto de partida.** Arranca con lo que ya tienes guardado.
2. **Mes a mes.** Cada mes el saldo genera rendimiento a la tasa que indiques y se le suma tu aporte. El interés compuesto hace que el rendimiento de este mes también rinda el siguiente.
3. **El efecto inflación.** Si la activas, la meta no se queda quieta: crece ~4% al año, porque el enganche o el coche que quieres también suben de precio. La sala te dice cuándo llegas conservando el poder de compra.
4. **La ventaja mexicana.** Con CETES pagando 8–9% y la inflación cerca del 4%, el rendimiento real es positivo: invertir el ahorro acorta el plazo de verdad, no solo en apariencia. Es el "GAT real" que CONDUSEF obliga a publicar.
5. **Las palancas.** Compara qué pasa si aportas 50% más o si no inviertes nada, para ver qué mueve más tu fecha: en plazos cortos, casi siempre el aporte.`,
  faq: [
    { q: '¿Cómo se calcula cuándo llego a mi meta?', a: 'Con una simulación mes a mes: el saldo genera rendimiento a la tasa mensual y se le suma tu aporte, hasta igualar o superar la meta. Es más preciso que una fórmula cerrada porque combina aportes periódicos con interés compuesto, y permite que la meta crezca con la inflación.' },
    { q: '¿Dónde pongo mi ahorro para que rinda en México?', a: 'Las opciones más comunes de bajo riesgo: CETES a través de cetesdirecto (desde $100, sin comisiones, respaldo del Gobierno federal), cuentas y apps con rendimiento diario, pagarés bancarios y fondos de deuda. Para metas a menos de 3 años conviene quedarse en este tipo de instrumentos y no en renta variable.' },
    { q: '¿Vale la pena invertir si la inflación es de solo 4%?', a: 'Precisamente por eso vale más: con CETES a 8–9% y una inflación del 4%, tu rendimiento real es de 4–5 puntos al año. En una cuenta sin intereses pierdes 4% de poder de compra anual; invertido, lo ganas. En metas de 2–3 años esa diferencia se traduce en varios meses de adelanto.' },
    { q: '¿Qué es el GAT nominal y el GAT real?', a: 'La Ganancia Anual Total es el rendimiento que las instituciones deben publicar para que compares productos de ahorro: el GAT nominal es la ganancia antes de inflación y el GAT real es la ganancia descontando la inflación esperada. Para decidir dónde ahorrar, el número honesto es el GAT real.' },
    { q: '¿Qué mueve más la fecha: aportar más o mejorar el rendimiento?', a: 'En plazos cortos y medianos, aportar más — el interés necesita años para hacer diferencia grande. En un plan de $3,000 al mes, subir el aporte 50% suele adelantar la meta varios meses; subir un punto de tasa, apenas semanas. En plazos de 10 años o más, el compuesto se vuelve protagonista.' },
    { q: '¿Los intereses pagan impuestos?', a: 'Sí: hay una retención anual de ISR sobre intereses que el banco o casa de bolsa aplica automáticamente sobre el capital invertido, y el ajuste fino se hace en tu declaración anual. Para montos de ahorro personal el efecto es moderado, pero explica por qué el rendimiento neto es un poco menor al publicado.' },
    { q: '¿Y si mi meta es en dólares o para viajar al extranjero?', a: 'Entonces tu riesgo no es solo la inflación local sino el tipo de cambio. Una parte del ahorro en instrumentos en dólares (o comprar los dólares gradualmente) reduce el riesgo de que una depreciación del peso aleje la meta de golpe. Para metas en pesos, CETES y fondos de deuda bastan.' },
    { q: '¿Conviene un aporte fijo o irlo subiendo?', a: 'La sala asume aporte fijo, pero en la práctica conviene subirlo cuando sube tu ingreso: si tu sueldo aumenta 5% en enero, sube el aporte al menos ese 5%. Los extras — aguinaldo, prima vacacional, PTU, devolución de impuestos — son aceleradores perfectos porque no salen de tu quincena.' },
    { q: '¿La fecha que me da es exacta?', a: 'Es una estimación con supuestos constantes (aporte y tasa fijos). Las tasas siguen las decisiones de Banxico y bajan o suben con los años, así que recalcula cada 3–6 meses y ajusta el plan. La utilidad está en tener una fecha realista y ver qué palanca la acerca.' },
  ],
  sources: [
    { name: 'Banxico — Tasas de CETES y política monetaria', url: 'https://www.banxico.org.mx/' },
    { name: 'CONDUSEF — GAT nominal y GAT real', url: 'https://www.condusef.gob.mx/' },
    { name: 'INEGI — Inflación (INPC)', url: 'https://www.inegi.org.mx/' },
  ],
};
