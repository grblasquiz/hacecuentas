/**
 * Sala de decisión — "¿Cuándo voy a alcanzar mi meta de ahorro?"
 *
 * Patrón PROYECCIÓN TEMPORAL. Simula mes a mes la acumulación (capital inicial +
 * aportes mensuales + rendimiento) hasta alcanzar la meta. Si hay inflación, la
 * meta se actualiza cada mes (objetivo móvil en términos reales) para que el
 * resultado refleje cuándo llegás con poder de compra equivalente.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/**
 * Simula meses hasta alcanzar la meta.
 * @param metaReal si true, la meta crece por inflación cada mes (objetivo móvil).
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
    // Si no aportás ni rendís y la meta sube, nunca llegás → cortar.
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
  const d = new Date(2026, 5, 1); // jun 2026 (referencia 2026-06)
  d.setMonth(d.getMonth() + m);
  return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

function compute(inputs: Record<string, any>): DecisionResult {
  const meta = Math.max(0, num(inputs.meta));
  const inicial = Math.max(0, num(inputs.ahorroInicial));
  const aporte = Math.max(0, num(inputs.aporteMensual));
  const rendTNA = Math.max(0, num(inputs.rendimientoTNA));
  const inflacionAnual = Math.max(0, num(inputs.inflacionAnual));

  if (!meta || (inicial <= 0 && aporte <= 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tu meta de ahorro y cuánto aportás por mes (o cuánto tenés ya). Calculamos en cuánto tiempo llegás, con y sin ajuste por inflación.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para alcanzar tu meta' },
      scenarios: [],
      nextActions: [
        'Cargá tu **meta de ahorro** y tu **aporte mensual**.',
        'Sumá lo que **ya tenés ahorrado** y el **rendimiento** esperado.',
      ],
    };
  }

  const rendMensual = rendTNA / 12 / 100;
  const inflMensual = Math.pow(1 + inflacionAnual / 100, 1 / 12) - 1;

  // Nominal: meta fija. Real: meta crece por inflación.
  const resNominal = simular(meta, inicial, aporte, rendMensual, inflMensual, false);
  const resReal = simular(meta, inicial, aporte, rendMensual, inflMensual, true);

  // El número decisivo: si hay inflación, el plazo REAL (objetivo móvil); si no, el nominal.
  const principal = inflacionAnual > 0 ? resReal : resNominal;
  const totalAportado = inicial + aporte * principal.meses;
  const gananciaRend = principal.saldoFinal - totalAportado;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (principal.meses >= 1200) {
    status = 'a';
    tone = 'warn';
    badge = 'No llegás así';
  } else if (principal.meses <= 24) {
    status = 'b';
    tone = 'good';
    badge = 'A tiro';
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
    detail = `Con tu aporte de ${fmtMoney(aporte)}/mes y un rendimiento del ${fmtPct(rendTNA, 0)} TNA, la inflación (${fmtPct(inflacionAnual, 0)} anual) hace crecer tu meta más rápido de lo que ahorrás: así no llegás. Necesitás aportar más, conseguir mejor rendimiento o reconsiderar la meta.`;
  } else {
    detail = `Empezando con ${fmtMoney(inicial)} y aportando ${fmtMoney(aporte)}/mes a un rendimiento del ${fmtPct(rendTNA, 0)} TNA, alcanzás tu meta de ${fmtMoney(meta)} en ${fmtMeses(principal.meses)} (alrededor de ${fechaEn(principal.meses)})${inflacionAnual > 0 ? ', manteniendo el poder de compra frente a la inflación' : ''}. De ese total, ${fmtMoney(Math.max(0, gananciaRend))} los pone el rendimiento, no tu bolsillo.`;
  }

  // Escenarios: aporte +50%, base, y sin rendimiento (guardar en el colchón).
  const resMas = simular(meta, inicial, aporte * 1.5, rendMensual, inflMensual, inflacionAnual > 0);
  const resSinRend = simular(meta, inicial, aporte, 0, inflMensual, inflacionAnual > 0);

  const scenarios = [
    { label: 'Aportando 50% más', value: fmtMeses(resMas.meses), detail: `Si ponés ${fmtMoney(aporte * 1.5)}/mes en vez de ${fmtMoney(aporte)}.` },
    { label: 'Tu plan actual', value: fmtMeses(principal.meses), detail: `Con ${fmtMoney(aporte)}/mes al ${fmtPct(rendTNA, 0)} TNA${inflacionAnual > 0 ? ', meta ajustada por inflación' : ''}.` },
    { label: 'Sin invertir (guardado)', value: fmtMeses(resSinRend.meses), detail: 'Si no le sacás rendimiento y solo acumulás los aportes.' },
  ];

  const breakdown = [
    { label: 'Meta de ahorro', value: fmtMoney(meta) },
    { label: 'Ahorro inicial', value: fmtMoney(inicial) },
    { label: 'Aporte mensual', value: fmtMoney(aporte) },
    { label: 'Rendimiento', value: `${fmtPct(rendTNA, 0)} TNA`, hint: `${fmtPct(rendMensual * 100, 2)} mensual` },
    ...(inflacionAnual > 0
      ? [
          { label: 'Tiempo (sin ajustar inflación)', value: fmtMeses(resNominal.meses), hint: 'meta fija en pesos' },
          { label: 'Tiempo (manteniendo poder de compra)', value: fmtMeses(resReal.meses), hint: `meta crece ${fmtPct(inflacionAnual, 0)}/año` },
        ]
      : [{ label: 'Tiempo para llegar', value: fmtMeses(resNominal.meses) }]),
    { label: 'Fecha estimada', value: principal.meses < 1200 ? fechaEn(principal.meses) : '—' },
    { label: 'Total que vas a aportar', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el rendimiento', value: fmtMoney(Math.max(0, gananciaRend)) },
  ];

  const nextActions = [
    principal.meses >= 1200
      ? 'Con estos números no llegás: **subí el aporte** o buscá un rendimiento que le gane a la inflación. Una meta fija en pesos pierde sentido si los precios suben más rápido que tu ahorro.'
      : `Para llegar antes, la palanca más fuerte es el **aporte mensual**: subirlo a ${fmtMoney(aporte * 1.5)} te adelanta a ${fmtMeses(resMas.meses)}.`,
    'Automatizá el aporte: programá una transferencia fija apenas cobrás, así no depende de tu fuerza de voluntad a fin de mes.',
    inflacionAnual > 0
      ? 'Con inflación, conseguir un rendimiento que al menos la empate es clave: si tu plata queda quieta, la meta se aleja sola. Buscá un instrumento que le gane a la inflación.'
      : 'Poner los aportes a rendir (plazo fijo, money market) acorta el plazo sin que pongas más plata: el interés trabaja por vos.',
    'Revisá la meta cada tanto: si tu objetivo es comprar algo concreto, actualizá su precio, porque también sube con la inflación.',
  ];

  const notes = [
    'Simulamos mes a mes: cada mes el saldo rinde a la tasa mensual y le sumás tu aporte. Si cargás inflación, la meta se actualiza cada mes para reflejar cuándo llegás manteniendo el poder de compra.',
    'El rendimiento es el que vos cargás (TNA) y se asume constante; las tasas reales varían. No se descuentan impuestos sobre la renta ni comisiones.',
    'No es asesoramiento financiero. Es una proyección orientativa basada en supuestos que conviene revisar periódicamente.',
  ];

  return {
    status,
    verdict: {
      title: principal.meses >= 1200 ? 'Con este plan, la meta se aleja en vez de acercarse' : `Llegás a tu meta en ${fmtMeses(principal.meses)}`,
      detail, tone, badge,
    },
    decisiveNumber: {
      value: fmtMeses(principal.meses),
      label: 'Tiempo para alcanzar tu meta',
      sub: principal.meses < 1200 ? `Fecha estimada: **${fechaEn(principal.meses)}**${inflacionAnual > 0 ? ' (manteniendo poder de compra)' : ''}.` : 'Necesitás aportar más o mejorar el rendimiento.',
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-mi-meta-de-ahorro',
  title: '¿Cuándo voy a alcanzar mi meta de ahorro? Calculá la fecha 2026',
  h1: '¿Cuándo voy a alcanzar mi meta de ahorro?',
  description:
    'Calculá en cuánto tiempo llegás a tu meta de ahorro según tu aporte mensual y el rendimiento, con ajuste por inflación. Te damos la fecha estimada y cuánto pone el interés vs tu bolsillo.',
  intro:
    'Tenés una meta de ahorro (un viaje, un auto, el pie de un departamento) y querés saber cuándo llegás. Esta sala simula mes a mes tu acumulación —capital inicial, aportes y rendimiento— hasta tocar la meta, y si cargás inflación ajusta el objetivo para decirte cuándo llegás manteniendo el poder de compra, no solo el número nominal.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    meta: 10000000,
    ahorroInicial: 1500000,
    aporteMensual: 300000,
    rendimientoTNA: 40,
    inflacionAnual: 25,
  },
  fields: [
    { id: 'meta', label: 'Tu meta de ahorro', type: 'number', prefix: '$', required: true, min: 0, placeholder: '10000000', help: 'Cuánto querés llegar a juntar.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ahorroInicial', label: 'Lo que ya tenés ahorrado', type: 'number', prefix: '$', default: 0, min: 0, placeholder: '1500000', profileKey: 'finanzas.ahorros', help: 'Tu punto de partida.', group: 'Tu meta' },
    { id: 'aporteMensual', label: 'Cuánto aportás por mes', type: 'number', prefix: '$', required: true, min: 0, placeholder: '300000', help: 'Lo que sumás a tu ahorro cada mes.', group: 'Tu plan', groupIcon: '💪' },
    { id: 'rendimientoTNA', label: 'Rendimiento esperado (TNA)', type: 'number', suffix: '%', default: 0, min: 0, placeholder: '40', help: 'La TNA a la que ponés a rendir tu ahorro (plazo fijo, money market). 0 si lo guardás sin invertir.', group: 'Tu plan' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 0, min: 0, max: 500, placeholder: '25', help: 'Opcional. Si la cargás, ajustamos la meta para que llegues con el mismo poder de compra.', group: 'Tu plan', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
    { slug: 'calculadora-fire-retiro-temprano', label: 'FIRE / retiro temprano' },
  ],
  howItWorks: `Esta sala simula tu ahorro mes a mes hasta que toca la meta.

1. **Tu punto de partida.** Arranca con lo que ya tenés ahorrado.
2. **Mes a mes.** Cada mes, el saldo rinde a la tasa que cargues y le suma tu aporte. Así se va acercando a la meta, con el interés compuesto trabajando a favor.
3. **El efecto inflación.** Si cargás inflación, la meta no se queda fija: crece cada mes, porque dentro de dos años vas a necesitar más pesos para comprar lo mismo. La sala calcula cuándo llegás manteniendo el poder de compra.
4. **La fecha.** Cuando el saldo alcanza la meta, te devuelve cuántos meses pasaron y la fecha estimada.
5. **Las palancas.** Muestra cómo cambia el plazo si aportás más o si le sacás rendimiento, para que veas qué mueve más la aguja: casi siempre, subir el aporte.`,
  faq: [
    { q: '¿Cómo se calcula cuándo llego a la meta?', a: 'Con una simulación mes a mes: cada mes tu saldo rinde a la tasa que indicás y le sumás tu aporte. Se repite hasta que el saldo iguala o supera la meta. Es más preciso que una fórmula cerrada porque incorpora aportes periódicos y rendimiento compuesto.' },
    { q: '¿Por qué la meta sube con la inflación?', a: 'Porque si tu meta es comprar algo concreto, su precio sube con el tiempo. Juntar "10 millones" sirve de poco si dentro de tres años eso ya no alcanza. Al ajustar la meta por inflación, la sala te dice cuándo llegás con el mismo poder de compra de hoy.' },
    { q: '¿Qué pasa si el rendimiento no le gana a la inflación?', a: 'Si tu plata rinde menos que la inflación y la meta es móvil, el objetivo puede alejarse más rápido de lo que ahorrás, y nunca llegás solo con rendimiento. En ese caso la palanca es aumentar el aporte o conseguir un instrumento que le gane a la inflación.' },
    { q: '¿Qué mueve más la aguja: aportar más o invertir mejor?', a: 'En plazos cortos y medianos, casi siempre aportar más: el rendimiento necesita tiempo para hacer diferencia. En plazos largos, el interés compuesto pesa cada vez más. La sala te muestra ambos escenarios para que lo veas con tus números.' },
    { q: '¿Tengo que poner un rendimiento?', a: 'No es obligatorio. Si dejás 0, la sala asume que guardás el dinero sin invertirlo y solo acumulás los aportes. Pero ponerlo a rendir, aunque sea en un plazo fijo, acorta el plazo sin que pongas más plata de tu bolsillo.' },
    { q: '¿Conviene un aporte fijo o ir subiéndolo?', a: 'Esta sala asume un aporte fijo en pesos. En la práctica, si tu ingreso se actualiza con la inflación, conviene ir subiendo el aporte para no quedar atrás: un aporte fijo pierde peso real con el tiempo.' },
    { q: '¿La fecha es exacta?', a: 'Es una estimación basada en tus supuestos (aporte y rendimiento constantes). En la realidad las tasas varían y los aportes pueden cambiar, así que conviene recalcular cada tanto y ajustar el plan.' },
    { q: '¿Esto reemplaza un plan financiero?', a: 'No: es una herramienta orientativa para ponerle fecha a una meta. Para objetivos grandes o de largo plazo (jubilación, vivienda), conviene complementarlo con el asesoramiento de un profesional matriculado.' },
  ],
  sources: [
    { name: 'CNV — Educación financiera', url: 'https://www.argentina.gob.ar/cnv' },
    { name: 'BCRA — Plazos fijos online', url: 'https://www.bcra.gob.ar/BCRAyVos/plazos_fijos_online.asp' },
  ],
};
