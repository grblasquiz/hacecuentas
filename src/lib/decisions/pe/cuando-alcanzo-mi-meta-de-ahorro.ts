/**
 * Sala de decisión (Perú) — "¿Cuándo alcanzo mi meta de ahorro?"
 *
 * Simula mes a mes la acumulación (inicial + aportes + rendimiento compuesto)
 * hasta tocar la meta. A diferencia de los países de alta inflación, en el Perú
 * (~2.5% anual, dentro del rango meta del BCRP) un depósito bien elegido le
 * gana a la inflación: la meta casi no se mueve y el interés compuesto trabaja
 * de verdad. La palanca peruana: bancos pagan 4-5%, cajas municipales 6-7%
 * (con la misma cobertura del Fondo de Seguro de Depósitos), fondos mutuos
 * según riesgo.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

/** Simula meses hasta alcanzar la meta. Si metaMovil, la meta sube con inflación. */
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
  return d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
};

function compute(inputs: Record<string, any>): DecisionResult {
  const meta = Math.max(0, num(inputs.meta));
  const inicial = Math.max(0, num(inputs.ahorroInicial));
  const aporte = Math.max(0, num(inputs.aporteMensual));
  const trea = Math.max(0, num(inputs.rendimientoTrea));
  const inflacion = Math.max(0, num(inputs.inflacionAnual));

  if (!meta || (inicial <= 0 && aporte <= 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa tu meta de ahorro y cuánto puedes guardar al mes (o cuánto tienes ya). Calculamos en cuánto tiempo llegas, con el rendimiento y la inflación que elijas.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para alcanzar tu meta' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **meta de ahorro** y tu **aporte mensual**.',
        'Suma lo que **ya tienes guardado** y la **TREA** del instrumento donde lo pondrás.',
      ],
    };
  }

  // La TREA de bancos y cajas es efectiva anual: tasa mensual compuesta.
  const rendMensual = Math.pow(1 + trea / 100, 1 / 12) - 1;
  const inflMensual = Math.pow(1 + inflacion / 100, 1 / 12) - 1;

  const resNominal = simular(meta, inicial, aporte, rendMensual, inflMensual, false);
  const resReal = simular(meta, inicial, aporte, rendMensual, inflMensual, true);

  const principal = inflacion > 0 ? resReal : resNominal;
  const totalAportado = inicial + aporte * principal.meses;
  const gananciaRend = principal.saldoFinal - totalAportado;

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
    badge = 'A la vista';
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
    detail = `Con un aporte de ${fmtMoney(aporte)}/mes y una TREA de ${fmtPct(trea, 1)}, la meta crece más rápido de lo que acumulas: así no llegas. Sube el aporte o busca un instrumento con mejor tasa (las cajas municipales suelen pagar más que los bancos, con la misma cobertura).`;
  } else {
    detail = `Empezando con ${fmtMoney(inicial)} y guardando ${fmtMoney(aporte)}/mes a una TREA de ${fmtPct(trea, 1)}, alcanzas tu meta de ${fmtMoney(meta)} en ${fmtMeses(principal.meses)} (alrededor de ${fechaEn(principal.meses)})${inflacion > 0 ? ', ya ajustando la meta por la inflación' : ''}. De ese total, ${fmtMoney(Math.max(0, gananciaRend))} los pone el interés, no tu bolsillo.`;
  }

  const resMas = simular(meta, inicial, aporte * 1.5, rendMensual, inflMensual, inflacion > 0);
  const resSinRend = simular(meta, inicial, aporte, 0, inflMensual, inflacion > 0);

  const scenarios = [
    { label: 'Aportando 50% más', value: fmtMeses(resMas.meses), detail: `Si guardas ${fmtMoney(aporte * 1.5)}/mes en vez de ${fmtMoney(aporte)} — por ejemplo, sumando parte de la gratificación.` },
    { label: 'Tu plan actual', value: fmtMeses(principal.meses), detail: `Con ${fmtMoney(aporte)}/mes a ${fmtPct(trea, 1)} TREA${inflacion > 0 ? ', meta ajustada por inflación' : ''}.` },
    { label: 'Bajo el colchón (0%)', value: fmtMeses(resSinRend.meses), detail: 'Si no lo pones a rendir y solo acumulas los aportes.' },
  ];

  const breakdown = [
    { label: 'Meta de ahorro', value: fmtMoney(meta) },
    { label: 'Ahorro inicial', value: fmtMoney(inicial) },
    { label: 'Aporte mensual', value: fmtMoney(aporte) },
    { label: 'Rendimiento', value: `${fmtPct(trea, 1)} TREA`, hint: `${fmtPct(rendMensual * 100, 2)} mensual compuesto` },
    ...(inflacion > 0
      ? [
          { label: 'Tiempo (meta fija en soles)', value: fmtMeses(resNominal.meses), hint: 'sin ajustar por inflación' },
          { label: 'Tiempo (manteniendo poder de compra)', value: fmtMeses(resReal.meses), hint: `meta crece ${fmtPct(inflacion, 1)}/año` },
        ]
      : [{ label: 'Tiempo para llegar', value: fmtMeses(resNominal.meses) }]),
    { label: 'Fecha estimada', value: principal.meses < 1200 ? fechaEn(principal.meses) : '—' },
    { label: 'Total que aportarás', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el interés', value: fmtMoney(Math.max(0, gananciaRend)) },
  ];

  const nextActions = [
    principal.meses >= 1200
      ? 'Con estos números no llegas: **sube el aporte** o mejora la tasa. En el Perú es raro que la inflación te gane si el dinero está colocado: compara TREA entre bancos, financieras y cajas antes de rendirte.'
      : `La palanca más fuerte es el **aporte mensual**: subirlo a ${fmtMoney(aporte * 1.5)} te adelanta a ${fmtMeses(resMas.meses)}. Las gratificaciones de julio y diciembre son la oportunidad natural para esos empujones.`,
    'Compara por **TREA** (tasa de rendimiento efectivo anual, neta de comisiones): un depósito a plazo en caja municipal paga 6-7% frente al 4-5% de los bancos grandes, con la misma cobertura del Fondo de Seguro de Depósitos.',
    'Automatiza el aporte: programa la transferencia apenas te paguen, para que ahorrar no dependa de tu fuerza de voluntad a fin de mes.',
    inflacion > 0
      ? `Con inflación de ${fmtPct(inflacion, 1)} anual, una TREA de 5-7% deja rendimiento real positivo: tu plata crece de verdad, no solo en número. Evita dejarla en una cuenta que pague casi cero.`
      : 'Aunque no cargues inflación, recuerda que existe (~2.5% anual): si tu meta es comprar algo concreto, su precio también sube un poco cada año.',
  ];

  const notes = [
    'Simulamos mes a mes: cada mes el saldo rinde a la tasa mensual (derivada de la TREA, efectiva anual) y se suma tu aporte. Si cargas inflación, la meta se actualiza cada mes para reflejar cuándo llegas manteniendo el poder de compra.',
    'La TREA se asume constante durante todo el plazo; en la práctica las tasas cambian al renovar el depósito. No se descuentan el ITF ni el impuesto a la renta de segunda categoría cuando aplique a los intereses.',
    'Referencias 2026: depósitos a plazo en bancos 4-5% TREA, cajas municipales y rurales 6-7%, fondos mutuos según su nivel de riesgo. La inflación peruana ronda 2.5% anual, dentro del rango meta del BCRP (1-3%).',
    'No es asesoría financiera: es una proyección orientativa que conviene recalcular cuando cambien tus tasas o tus aportes.',
  ];

  return {
    status,
    verdict: {
      title: principal.meses >= 1200 ? 'Con este plan, la meta se aleja en vez de acercarse' : `Llegas a tu meta en ${fmtMeses(principal.meses)}`,
      detail, tone, badge,
    },
    decisiveNumber: {
      value: fmtMeses(principal.meses),
      label: 'Tiempo para alcanzar tu meta',
      sub: principal.meses < 1200 ? `Fecha estimada: **${fechaEn(principal.meses)}**${inflacion > 0 ? ' (manteniendo poder de compra)' : ''}.` : 'Necesitas aportar más o mejorar la tasa.',
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-mi-meta-de-ahorro',
  title: '¿Cuándo alcanzo mi meta de ahorro? Fecha y plan Perú 2026',
  h1: '¿Cuándo voy a alcanzar mi meta de ahorro?',
  description:
    'Ponle fecha a tu meta de ahorro en soles: simulamos mes a mes tus aportes con el rendimiento del depósito a plazo (bancos 4-5%, cajas 6-7%) o fondo mutuo que elijas, ajustando la meta por la inflación peruana (~2.5%).',
  intro:
    'Tienes una meta —la inicial de un departamento, un carro, un viaje, capital para tu negocio— y quieres saber cuándo llegas. Esta sala simula mes a mes tu acumulación: lo que ya tienes, lo que guardas cada mes y el interés compuesto del instrumento que elijas. Y con una ventaja peruana que no todos aprovechan: con inflación cerca del 2.5% anual, un depósito a plazo en una caja municipal al 6-7% le gana a los precios — tu plata crece de verdad, no solo en número.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    meta: 20000,
    ahorroInicial: 3000,
    aporteMensual: 500,
    rendimientoTrea: 6,
    inflacionAnual: 2.5,
  },
  fields: [
    { id: 'meta', label: 'Tu meta de ahorro', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '20000', help: 'Cuánto quieres llegar a juntar.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ahorroInicial', label: 'Lo que ya tienes guardado', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, placeholder: '3000', help: 'Tu punto de partida.', group: 'Tu meta' },
    { id: 'aporteMensual', label: 'Cuánto guardas al mes', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '500', help: 'Lo que sumas a tu ahorro cada mes.', group: 'Tu plan', groupIcon: '💪' },
    { id: 'rendimientoTrea', label: 'Rendimiento esperado (TREA)', type: 'number', suffix: '%', default: 5, min: 0, max: 30, placeholder: '6', help: 'Tasa de rendimiento efectivo anual del instrumento: depósito a plazo en banco 4-5%, cajas 6-7%, fondos mutuos según riesgo. 0 si lo guardas sin rendir.', group: 'Tu plan' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 2.5, min: 0, max: 50, placeholder: '2.5', advanced: true, help: 'La inflación peruana ronda 2.5% (rango meta del BCRP: 1-3%). Ajustamos la meta para que llegues con el mismo poder de compra.', group: 'Tu plan' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-deposito-plazo-fijo-peru', label: 'Depósito a plazo fijo' },
    { slug: 'pe/calculadora-cts-peru-deposito-semestral', label: 'Depósito de CTS' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
  ],
  howItWorks: `Esta sala simula tu ahorro mes a mes hasta que toca la meta.

1. **Tu punto de partida.** Arranca con lo que ya tienes guardado.
2. **Mes a mes.** Cada mes el saldo rinde a la tasa mensual derivada de la TREA (la tasa efectiva neta que bancos y cajas están obligados a publicar) y se le suma tu aporte. El interés compuesto acelera el final del camino.
3. **El ajuste por inflación.** Si cargas inflación, la meta sube un poquito cada mes — en el Perú es un ajuste suave (~2.5% anual), no la carrera contra el reloj de los países de alta inflación. La sala te dice cuándo llegas manteniendo el poder de compra.
4. **La fecha.** Cuando el saldo alcanza la meta, te devuelve cuántos meses pasaron y la fecha estimada en el calendario.
5. **Las palancas.** Compara tu plan contra aportar 50% más y contra guardar sin rendimiento, para que veas qué mueve más la aguja: en plazos cortos, el aporte; en plazos largos, la tasa.`,
  faq: [
    { q: '¿Cómo se calcula cuándo llego a la meta?', a: 'Con una simulación mes a mes: el saldo rinde a la tasa mensual derivada de la TREA que ingresas y se le suma tu aporte, hasta igualar o superar la meta. Es más preciso que una fórmula cerrada porque incorpora los aportes periódicos y el interés compuesto.' },
    { q: '¿Qué es la TREA y en qué se diferencia de la TEA?', a: 'La TREA (tasa de rendimiento efectivo anual) es lo que de verdad ganas: la tasa efectiva ya descontadas comisiones y gastos de la cuenta. La TEA es la tasa "de vitrina". Las entidades están obligadas a publicar la TREA, y es la que debes usar para comparar depósitos — y la que espera esta sala.' },
    { q: '¿Dónde pongo el ahorro para que rinda más?', a: 'Depende del plazo y tu tolerancia: depósitos a plazo en bancos pagan alrededor de 4-5% TREA, las cajas municipales y rurales 6-7%, y los fondos mutuos varían según su riesgo. Para metas de 1-3 años, un depósito a plazo en caja suele ser el mejor equilibrio entre tasa, seguridad y simplicidad.' },
    { q: '¿Es seguro ahorrar en una caja municipal?', a: 'Sí, mientras estés dentro de la cobertura: las cajas están supervisadas por la SBS y sus depósitos los protege el mismo Fondo de Seguro de Depósitos que cubre a los bancos, hasta un tope que supera los S/ 120,000 por persona y entidad. Bajo ese monto, la tasa extra de la caja no implica riesgo extra.' },
    { q: '¿Vale la pena ajustar por una inflación de solo 2.5%?', a: 'Para metas cortas casi no cambia la foto, pero en metas largas suma: a 2.5% anual, en 5 años los precios acumulan más de 13%. La buena noticia peruana es que un depósito al 5-7% le gana a esa inflación: tu rendimiento real es positivo, algo impensable en países vecinos con precios desbocados.' },
    { q: '¿Qué mueve más la aguja: aportar más o conseguir mejor tasa?', a: 'En metas de 1-3 años, aportar más gana por lejos: el interés necesita tiempo para hacer diferencia. En horizontes largos, la tasa pesa cada vez más por el interés compuesto. La sala te muestra ambos escenarios con tus números para que no decidas a ciegas.' },
    { q: '¿Cómo uso la gratificación y la CTS para llegar antes?', a: 'Si estás en planilla, julio y diciembre traen un sueldo extra (gratificación): destinar la mitad a tu meta equivale a un mes entero de aportes dobles o triples, y adelanta la fecha varios meses. La CTS, en cambio, conviene reservarla como fondo para desempleo antes que para metas de consumo.' },
    { q: '¿La fecha que me da es exacta?', a: 'Es una estimación con supuestos constantes (aporte y TREA fijos). En la realidad las tasas cambian al renovar el depósito y tus aportes pueden variar, así que recalcula cada vez que renueves o cambies el plan. La dirección importa más que el día exacto.' },
  ],
  sources: [
    { name: 'SBS — Comparativo de TREA de depósitos', url: 'https://www.sbs.gob.pe/' },
    { name: 'BCRP — Inflación y rango meta', url: 'https://www.bcrp.gob.pe/' },
  ],
};
