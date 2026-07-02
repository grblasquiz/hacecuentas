/**
 * Sala de decisión CL — "¿Cuándo alcanzo mi meta de ahorro?"
 *
 * Patrón PROYECCIÓN TEMPORAL. Simula mes a mes capital inicial + aportes +
 * rendimiento compuesto hasta tocar la meta. Con inflación chilena (~3,5%), la
 * meta se puede ajustar como objetivo móvil — y a diferencia de economías de
 * alta inflación, acá un depósito a plazo al 5-6% anual sí le gana al IPC:
 * el rendimiento real positivo es alcanzable sin riesgo.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCLP as fmtMoney } from '../locales';

/** Simula meses hasta la meta. Si metaMovil, la meta crece con la inflación. */
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
  const d = new Date(2026, 6, 1); // jul 2026 (referencia)
  d.setMonth(d.getMonth() + m);
  return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
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
        title: 'Todavía falta información',
        detail:
          'Ingresa tu meta de ahorro y cuánto puedes guardar al mes (o cuánto tienes ya). Calculamos en cuánto tiempo llegas, con rendimiento compuesto y ajuste por IPC.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo para alcanzar tu meta' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **meta de ahorro** y tu **aporte mensual**.',
        'Suma lo que **ya tienes ahorrado** y el **rendimiento** esperado (un depósito a plazo rinde 5-6% anual).',
      ],
    };
  }

  const rendMensual = Math.pow(1 + rendAnual / 100, 1 / 12) - 1;
  const inflMensual = Math.pow(1 + inflacionAnual / 100, 1 / 12) - 1;

  const resNominal = simular(meta, inicial, aporte, rendMensual, inflMensual, false);
  const resReal = simular(meta, inicial, aporte, rendMensual, inflMensual, true);

  const principal = inflacionAnual > 0 ? resReal : resNominal;
  const totalAportado = inicial + aporte * principal.meses;
  const gananciaRend = principal.saldoFinal - totalAportado;
  const rendimientoReal = rendAnual - inflacionAnual;

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
    badge = 'A la vuelta de la esquina';
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
    detail = `Con un aporte de ${fmtMoney(aporte)}/mes y un rendimiento de ${fmtPct(rendAnual, 1).replace('+', '')} anual, la meta ajustada por IPC se aleja más rápido de lo que ahorras. Necesitas subir el aporte o el rendimiento.`;
  } else {
    detail = `Partiendo con ${fmtMoney(inicial)} y guardando ${fmtMoney(aporte)}/mes a un ${fmtPct(rendAnual, 1).replace('+', '')} anual, alcanzas tu meta de ${fmtMoney(meta)} en ${fmtMeses(principal.meses)} (alrededor de ${fechaEn(principal.meses)})${inflacionAnual > 0 ? ', manteniendo el poder de compra frente a un IPC de ' + fmtPct(inflacionAnual, 1).replace('+', '') + ' anual' : ''}. De ese total, ${fmtMoney(Math.max(0, gananciaRend))} los pone el interés compuesto, no tu bolsillo${rendimientoReal > 0 ? ` — y con inflación baja, tu rendimiento real es positivo (${fmtPct(rendimientoReal, 1)} al año): cada peso invertido de verdad crece` : ''}.`;
  }

  const resMas = simular(meta, inicial, aporte * 1.5, rendMensual, inflMensual, inflacionAnual > 0);
  const resSinRend = simular(meta, inicial, aporte, 0, inflMensual, inflacionAnual > 0);

  const scenarios = [
    { label: 'Aportando 50% más', value: fmtMeses(resMas.meses), detail: `Si guardas ${fmtMoney(aporte * 1.5)}/mes en vez de ${fmtMoney(aporte)}.` },
    { label: 'Tu plan actual', value: fmtMeses(principal.meses), detail: `Con ${fmtMoney(aporte)}/mes al ${fmtPct(rendAnual, 1).replace('+', '')} anual${inflacionAnual > 0 ? ', meta ajustada por IPC' : ''}.` },
    { label: 'Debajo del colchón (0%)', value: fmtMeses(resSinRend.meses), detail: 'Si la plata no rinde nada: la diferencia es lo que regala quien no invierte.' },
  ];

  const breakdown = [
    { label: 'Meta de ahorro', value: fmtMoney(meta) },
    { label: 'Punto de partida', value: fmtMoney(inicial) },
    { label: 'Aporte mensual', value: fmtMoney(aporte) },
    { label: 'Rendimiento', value: `${fmtPct(rendAnual, 1).replace('+', '')} anual`, hint: `${fmtPct(rendMensual * 100, 2).replace('+', '')} mensual compuesto` },
    ...(inflacionAnual > 0
      ? [
          { label: 'Rendimiento real (sobre IPC)', value: fmtPct(rendimientoReal, 1), hint: rendimientoReal > 0 ? 'le ganas a la inflación' : 'pierdes contra la inflación' },
          { label: 'Tiempo (meta fija en pesos)', value: fmtMeses(resNominal.meses) },
          { label: 'Tiempo (manteniendo poder de compra)', value: fmtMeses(resReal.meses), hint: `la meta crece ${fmtPct(inflacionAnual, 1).replace('+', '')}/año` },
        ]
      : [{ label: 'Tiempo para llegar', value: fmtMeses(resNominal.meses) }]),
    { label: 'Fecha estimada', value: principal.meses < 1200 ? fechaEn(principal.meses) : '—' },
    { label: 'Total que aportas tú', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el rendimiento', value: fmtMoney(Math.max(0, gananciaRend)) },
  ];

  const nextActions = [
    principal.meses >= 1200
      ? 'Con estos números no llegas: **sube el aporte** — es la palanca que más mueve la aguja en metas de mediano plazo.'
      : `La palanca más fuerte es el **aporte mensual**: subirlo a ${fmtMoney(aporte * 1.5)} te adelanta a ${fmtMeses(resMas.meses)}.`,
    'Automatiza el aporte con una transferencia programada el día que te pagan: el ahorro que depende de la fuerza de voluntad a fin de mes, no ocurre.',
    rendAnual < 3
      ? 'Tu plata está rindiendo menos que el IPC: un **depósito a plazo (5-6% anual)** o un **fondo mutuo conservador** te dan rendimiento real positivo sin apostar. Debajo del colchón, la meta se aleja sola.'
      : 'Para metas de 1-3 años, depósitos a plazo renovables o fondos mutuos conservadores; para metas más largas, evalúa fondos balanceados o el **APV**, que además tiene beneficio tributario o bonificación estatal.',
    'Si tu meta es comprar algo concreto (el pie de una vivienda, un auto), actualiza su precio una vez al año: la meta también se mueve, aunque en Chile lo haga despacio.',
  ];

  const notes = [
    'Simulamos mes a mes: el saldo rinde a la tasa mensual compuesta y se le suma tu aporte. Si ingresas inflación, la meta se ajusta cada mes para decirte cuándo llegas manteniendo el poder de compra.',
    'El rendimiento se asume constante y no descuenta comisiones de administración ni el impuesto a los intereses cuando corresponde. Las tasas de depósitos y fondos varían con la TPM del Banco Central.',
    'Referencias 2026: depósitos a plazo en torno a 5-6% anual e IPC cerca del 3,5%. Verifica las tasas vigentes antes de decidir el instrumento.',
    'No es asesoría financiera: es una proyección orientativa para ponerle fecha a tu meta.',
  ];

  return {
    status,
    verdict: {
      title:
        principal.meses >= 1200
          ? 'Con este plan, la meta se aleja en vez de acercarse'
          : `Llegas a tu meta en ${fmtMeses(principal.meses)}`,
      detail,
      tone,
      badge,
    },
    decisiveNumber: {
      value: fmtMeses(principal.meses),
      label: 'Tiempo para alcanzar tu meta',
      sub:
        principal.meses < 1200
          ? `Fecha estimada: **${fechaEn(principal.meses)}**${inflacionAnual > 0 ? ' (manteniendo poder de compra)' : ''}.`
          : 'Necesitas aportar más o mejorar el rendimiento.',
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-mi-meta-de-ahorro',
  title: '¿Cuándo alcanzo mi meta de ahorro? Fecha con interés compuesto Chile 2026',
  h1: '¿Cuándo alcanzo mi meta de ahorro?',
  description:
    'Calcula en cuánto tiempo llegas a tu meta de ahorro en Chile según tu aporte mensual y el rendimiento (depósito a plazo 5-6%, fondos mutuos, APV), con ajuste por IPC. Fecha estimada y cuánto pone el interés compuesto versus tu bolsillo.',
  intro:
    'Tienes una meta —el pie de un departamento, un auto, un viaje— y quieres ponerle fecha. Esta sala simula mes a mes tu acumulación: capital inicial, aportes y rendimiento compuesto, hasta tocar la meta. Y aprovecha una ventaja chilena que no todos usan: con el IPC en torno al 3,5%, un simple depósito a plazo al 5-6% anual ya rinde por sobre la inflación, así que invertir el ahorro acorta el plazo de verdad — dejarlo debajo del colchón lo alarga solo.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'CL',
  lastReviewed: '2026-07-02',
  example: {
    meta: 5000000,
    ahorroInicial: 500000,
    aporteMensual: 200000,
    rendimientoAnual: 5.5,
    inflacionAnual: 3.5,
  },
  fields: [
    { id: 'meta', label: 'Tu meta de ahorro', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '5000000', help: 'Cuánta plata quieres llegar a juntar.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ahorroInicial', label: 'Lo que ya tienes', type: 'number', prefix: '$', format: 'thousands', default: 0, min: 0, placeholder: '500000', help: 'Tu punto de partida.', group: 'Tu meta' },
    { id: 'aporteMensual', label: 'Cuánto guardas al mes', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '200000', help: 'Lo que sumas a tu ahorro cada mes.', group: 'Tu plan', groupIcon: '💪' },
    { id: 'rendimientoAnual', label: 'Rendimiento esperado (anual)', type: 'number', suffix: '%', default: 5.5, min: 0, max: 50, step: 0.5, placeholder: '5,5', help: 'Depósito a plazo: 5-6% anual. Fondos mutuos conservadores: similar. Pon 0 si la guardas sin invertir.', group: 'Tu plan' },
    { id: 'inflacionAnual', label: 'IPC anual esperado', type: 'number', suffix: '%', default: 3.5, min: 0, max: 50, step: 0.5, placeholder: '3,5', help: 'Opcional. Si lo ingresas, ajustamos la meta para que llegues con el mismo poder de compra.', group: 'Tu plan', advanced: true },
  ],
  compute,
  componentCalcs: [
    { slug: 'cl/calculadora-deposito-plazo-chile-bancos-2026-tasa', label: 'Depósito a plazo' },
    { slug: 'cl/calculadora-fondos-mutuos-chile-rentabilidad-comparativa-2026', label: 'Fondos mutuos (rentabilidad)' },
    { slug: 'cl/calculadora-apv-beneficio-tributario-chile-regimen-a-b', label: 'APV (régimen A o B)' },
    { slug: 'cl/calculadora-cuenta-2-afp-chile-aporte-voluntario-rendimiento', label: 'Cuenta 2 de la AFP' },
  ],
  howItWorks: `Esta sala simula tu ahorro mes a mes hasta que toca la meta.

1. **Tu punto de partida.** Arranca con lo que ya tienes guardado.
2. **Mes a mes, compuesto.** Cada mes el saldo rinde a la tasa mensual equivalente de tu rendimiento anual y se le suma tu aporte: el interés genera interés, y con el tiempo esa bola de nieve pone una parte creciente de la meta.
3. **El ajuste por IPC.** Si ingresas inflación, la meta no se queda quieta: crece cada mes (~3,5% anual en Chile), porque lo que quieres comprar también sube de precio. La sala te dice cuándo llegas manteniendo el poder de compra.
4. **La fecha.** Cuando el saldo alcanza la meta, te devuelve los meses y la fecha estimada del calendario.
5. **Las palancas.** Compara tres caminos — aportar 50% más, tu plan actual y guardar sin invertir — para que veas qué mueve más la aguja según tu plazo.`,
  faq: [
    { q: '¿Cómo se calcula cuándo llego a la meta?', a: 'Con una simulación mes a mes: el saldo rinde a la tasa mensual compuesta y se le suma tu aporte, hasta igualar o superar la meta. Es más preciso que una fórmula cerrada porque combina aportes periódicos, interés compuesto y, si quieres, una meta que crece con el IPC.' },
    { q: '¿Cuánto rinde un depósito a plazo en Chile en 2026?', a: 'Las tasas dependen de la TPM del Banco Central y del banco, pero en 2026 un depósito a plazo en pesos ronda el 5-6% anual. Con el IPC cerca del 3,5%, eso deja un rendimiento real positivo de 1,5-2,5 puntos: tu plata crece por sobre los precios sin tomar riesgo de mercado.' },
    { q: '¿Depósito a plazo o fondo mutuo para mi meta?', a: 'Para metas cortas (menos de 1-2 años), depósito a plazo renovable o fondo mutuo money market: rentabilidad conocida y rescate rápido. Para metas de 3 años o más puedes evaluar fondos balanceados, que rinden más en promedio pero fluctúan. La regla: mientras más cerca la meta, menos riesgo.' },
    { q: '¿Cuándo conviene el APV?', a: 'El APV (Ahorro Previsional Voluntario) es un vehículo de largo plazo: el régimen A da una bonificación estatal del 15% de lo ahorrado (con tope anual) y el B rebaja tu base tributable. Es excelente para complementar la pensión, pero castiga los retiros anticipados — no lo uses para el pie del departamento a 2 años; para eso están los depósitos y fondos.' },
    { q: '¿Por qué la meta sube con la inflación si el IPC es bajo?', a: 'Porque incluso un 3,5% anual se acumula: en 3 años, tu meta de $5.000.000 equivale a unos $5.550.000 para comprar lo mismo. La diferencia con economías de alta inflación es que acá el ajuste es pequeño y tu rendimiento lo cubre con holgura — pero ignorarlo en metas largas te deja corto.' },
    { q: '¿Qué mueve más la aguja: aportar más o invertir mejor?', a: 'En metas de meses o pocos años, aportar más — el interés compuesto necesita tiempo para pesar. En horizontes largos (5+ años), el rendimiento se vuelve protagonista: un punto extra de rentabilidad anual cambia años de plazo. La sala te muestra ambos escenarios con tus números.' },
    { q: '¿Y si guardo la plata en la cuenta corriente o debajo del colchón?', a: 'Llegas igual, pero más tarde y más pobre: con IPC de 3,5%, la plata quieta pierde poder de compra todos los meses, y regalas el rendimiento que un simple depósito a plazo te daría sin esfuerzo. El escenario "0%" de la sala te muestra exactamente cuántos meses cuesta esa decisión.' },
    { q: '¿La fecha que me da es exacta?', a: 'Es una estimación con supuestos constantes: aporte fijo y rendimiento parejo. En la realidad las tasas se mueven con la TPM y tus aportes pueden variar, así que recalcula cada 6-12 meses. Para metas grandes o de muy largo plazo, complementa con asesoría profesional.' },
  ],
  sources: [
    { name: 'CMF — Comparador de depósitos a plazo y fondos mutuos', url: 'https://www.cmfchile.cl/' },
    { name: 'Banco Central de Chile — TPM, tasas e IPC', url: 'https://www.bcentral.cl/' },
    { name: 'SII — APV y beneficios tributarios del ahorro', url: 'https://www.sii.cl/' },
  ],
};
