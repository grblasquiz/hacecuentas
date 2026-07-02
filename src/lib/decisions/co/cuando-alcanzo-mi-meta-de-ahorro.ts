/**
 * Sala de decisión CO — "¿Cuándo alcanzo mi meta de ahorro?"
 *
 * Patrón PROYECCIÓN TEMPORAL localizado a Colombia: simula mes a mes el
 * capital inicial + aportes + rendimiento (tasa EFECTIVA ANUAL, como rinden
 * cuentas remuneradas ~8%, CDT 9-9,5% EA y FIC) y, si se indica inflación
 * (~5%), convierte la meta en objetivo móvil para responder cuándo llegas
 * manteniendo el poder de compra, no solo el número nominal.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtCOP as fmtMoney } from '../locales';

/** Simula meses hasta la meta. Si `metaMovil`, la meta crece con la inflación. */
function simular(
  meta: number,
  inicial: number,
  aporte: number,
  rendMensual: number,
  inflMensual: number,
  metaMovil: boolean,
): { meses: number; saldoFinal: number } {
  let saldo = inicial;
  let objetivo = meta;
  let meses = 0;
  const MAX = 1200;
  if (saldo >= objetivo) return { meses: 0, saldoFinal: saldo };
  while (saldo < objetivo && meses < MAX) {
    meses++;
    saldo = saldo * (1 + rendMensual) + aporte;
    if (metaMovil) objetivo = objetivo * (1 + inflMensual);
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
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};

function compute(inputs: Record<string, any>): DecisionResult {
  const meta = Math.max(0, num(inputs.meta));
  const inicial = Math.max(0, num(inputs.ahorroInicial));
  const aporte = Math.max(0, num(inputs.aporteMensual));
  const rendEA = Math.max(0, num(inputs.rendimientoEA));
  const inflacion = Math.max(0, num(inputs.inflacionAnual));

  if (!meta || (inicial <= 0 && aporte <= 0)) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún faltan datos para darte una respuesta',
        detail:
          'Ingresa tu meta de ahorro y cuánto puedes guardar al mes (o cuánto tienes ya). Calculamos en cuántos meses llegas, con el rendimiento trabajando a tu favor y la inflación en contra.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo hasta tu meta' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **meta de ahorro** y tu **aporte mensual**.',
        'Suma lo que **ya tienes guardado** y la **tasa EA** a la que rinde (CDT, cuenta remunerada, FIC).',
      ],
    };
  }

  // Las tasas colombianas se publican en efectivo anual → mensual compuesta.
  const rendMensual = Math.pow(1 + rendEA / 100, 1 / 12) - 1;
  const inflMensual = Math.pow(1 + inflacion / 100, 1 / 12) - 1;

  const resNominal = simular(meta, inicial, aporte, rendMensual, inflMensual, false);
  const resReal = simular(meta, inicial, aporte, rendMensual, inflMensual, true);

  const principal = inflacion > 0 ? resReal : resNominal;
  const totalAportado = inicial + aporte * principal.meses;
  const rendimientoAporta = Math.max(0, principal.saldoFinal - totalAportado);

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
    badge = 'Meta cercana';
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
    detail = `Guardando ${fmtMoney(aporte)} al mes con un rendimiento del ${fmtPct(rendEA, 1)} EA, la inflación (${fmtPct(inflacion, 1)} anual) encarece tu meta más rápido de lo que acumulas: con este plan no llegas. Toca subir el aporte, buscar una tasa mejor o replantear la meta.`;
  } else {
    detail = `Arrancando con ${fmtMoney(inicial)} y guardando ${fmtMoney(aporte)} al mes a una tasa del ${fmtPct(rendEA, 1)} EA, alcanzas tu meta de ${fmtMoney(meta)} en ${fmtMeses(principal.meses)} (hacia ${fechaEn(principal.meses)})${inflacion > 0 ? ', ya ajustada para que compre lo mismo que hoy' : ''}. De lo acumulado, ${fmtMoney(rendimientoAporta)} los pone el interés compuesto — plata que no sale de tu bolsillo.`;
  }

  const resMas = simular(meta, inicial, aporte * 1.5, rendMensual, inflMensual, inflacion > 0);
  const resSinRend = simular(meta, inicial, aporte, 0, inflMensual, inflacion > 0);

  const scenarios = [
    { label: 'Guardando 50% más', value: fmtMeses(resMas.meses), detail: `Si subes el aporte a ${fmtMoney(aporte * 1.5)} al mes.` },
    { label: 'Tu plan actual', value: fmtMeses(principal.meses), detail: `${fmtMoney(aporte)}/mes al ${fmtPct(rendEA, 1)} EA${inflacion > 0 ? ', meta ajustada por inflación' : ''}.` },
    { label: 'Debajo del colchón (0% EA)', value: fmtMeses(resSinRend.meses), detail: 'Si la plata no rinde: solo acumulas los aportes.' },
  ];

  const breakdown = [
    { label: 'Meta de ahorro', value: fmtMoney(meta) },
    { label: 'Punto de partida', value: fmtMoney(inicial) },
    { label: 'Aporte mensual', value: fmtMoney(aporte) },
    { label: 'Rendimiento', value: `${fmtPct(rendEA, 1)} EA`, hint: `${fmtPct(rendMensual * 100, 2)} mensual compuesto` },
    ...(inflacion > 0
      ? [
          { label: 'Tiempo con meta fija en pesos', value: fmtMeses(resNominal.meses), hint: 'sin ajustar por inflación' },
          { label: 'Tiempo manteniendo poder de compra', value: fmtMeses(resReal.meses), hint: `la meta sube ${fmtPct(inflacion, 1)} al año` },
        ]
      : [{ label: 'Tiempo hasta la meta', value: fmtMeses(resNominal.meses) }]),
    { label: 'Fecha estimada', value: principal.meses < 1200 ? fechaEn(principal.meses) : '—' },
    { label: 'Total que pones tú', value: fmtMoney(totalAportado) },
    { label: 'Lo que pone el rendimiento', value: fmtMoney(rendimientoAporta) },
  ];

  const nextActions = [
    principal.meses >= 1200
      ? 'Con estos números la meta se aleja sola: **sube el aporte** o pasa la plata a un instrumento que le gane a la inflación (CDT al 9-9,5% EA o un FIC). Un ahorro que rinde 0% en Colombia pierde ~5% de poder de compra al año.'
      : `La palanca más fuerte es el **aporte**: subirlo 50% (a ${fmtMoney(aporte * 1.5)}) te adelanta la meta a ${fmtMeses(resMas.meses)}. El rendimiento ayuda, pero en plazos cortos manda lo que guardas.`,
    'Programa el aporte como **débito automático el día que te consignan** hacia una cuenta o fondo separado: el ahorro que depende de la fuerza de voluntad de fin de mes no sobrevive a la quincena.',
    rendEA < 8
      ? `Tu tasa (${fmtPct(rendEA, 1)} EA) está por debajo de lo que paga el mercado en 2026: varias cuentas remuneradas rondan el 8% EA y los CDT el 9-9,5% EA. Mover la plata no cuesta nada y te recorta meses.`
      : 'Si parte de la meta es de largo plazo, escalona: la plata que no vas a tocar en 6-12 meses puede ir a CDT más largos o a un FIC con mejor rendimiento; la de corto plazo, en cuenta remunerada.',
    'Si la meta es un bien concreto (carro, cuota inicial de vivienda), actualiza su precio cada tanto: la inflación también corre para el objetivo, no solo para tu ahorro.',
  ];

  const notes = [
    'La simulación es mes a mes: el saldo rinde a la tasa mensual equivalente de la EA que ingresas y recibe tu aporte. Si indicas inflación, la meta se actualiza cada mes para reflejar cuándo llegas con el mismo poder de compra.',
    'La tasa se asume constante, pero en la realidad las tasas de captación cambian con la política del Banco de la República: recalcula cuando renueves un CDT.',
    'No se descuentan la retención en la fuente sobre rendimientos financieros ni el 4×1000 (GMF) en los traslados — si tu cuenta de ahorro no está marcada como exenta, ese 0,4% también muerde.',
    'Es una proyección orientativa, no asesoría de inversión.',
  ];

  return {
    status,
    verdict: {
      title: principal.meses >= 1200 ? 'Con este plan, la meta se aleja en vez de acercarse' : `Llegas a tu meta en ${fmtMeses(principal.meses)}`,
      detail, tone, badge,
    },
    decisiveNumber: {
      value: fmtMeses(principal.meses),
      label: 'Tiempo hasta tu meta',
      sub: principal.meses < 1200 ? `Fecha estimada: **${fechaEn(principal.meses)}**${inflacion > 0 ? ' (manteniendo poder de compra)' : ''}.` : 'Necesitas guardar más o conseguir mejor tasa.',
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-mi-meta-de-ahorro',
  title: '¿Cuándo alcanzo mi meta de ahorro en Colombia? Ponle fecha 2026',
  h1: '¿Cuándo alcanzo mi meta de ahorro?',
  description:
    'Calcula en cuántos meses llegas a tu meta de ahorro en Colombia según tu aporte mensual y la tasa EA (cuenta remunerada, CDT o FIC), con ajuste por inflación. Fecha estimada y cuánto pone el interés compuesto por ti.',
  intro:
    'Tienes una meta — la cuota inicial de un apartamento, un carro, un viaje, tu colchón — y quieres saber cuándo la tocas. Esta sala simula tu ahorro mes a mes: lo que ya tienes, lo que guardas y lo que rinde a la tasa efectiva anual de una cuenta remunerada (~8% EA), un CDT (9-9,5% EA) o un FIC. Y como en Colombia la inflación ronda el 5%, también ajusta la meta para decirte cuándo llegas con plata que compre lo mismo que hoy, no solo el número en la cuenta.',
  icon: '🎯',
  category: 'finanzas',
  audience: 'CO',
  lastReviewed: '2026-07-02',
  example: {
    meta: 20000000,
    ahorroInicial: 3000000,
    aporteMensual: 800000,
    rendimientoEA: 9,
    inflacionAnual: 5,
  },
  fields: [
    { id: 'meta', label: 'Tu meta de ahorro', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '20.000.000', help: 'La plata que quieres juntar: cuota inicial, carro, viaje, colchón.', group: 'Tu meta', groupIcon: '🎯' },
    { id: 'ahorroInicial', label: 'Lo que ya tienes', type: 'number', prefix: '$', default: 0, min: 0, format: 'thousands', placeholder: '3.000.000', help: 'Tu punto de partida hoy.', group: 'Tu meta' },
    { id: 'aporteMensual', label: 'Cuánto guardas al mes', type: 'number', prefix: '$', required: true, min: 0, format: 'thousands', placeholder: '800.000', help: 'El aporte que puedes sostener cada mes.', group: 'Tu plan', groupIcon: '💪' },
    { id: 'rendimientoEA', label: 'Rendimiento (efectivo anual)', type: 'number', suffix: '%', default: 9, min: 0, max: 30, step: 0.1, placeholder: '9', help: 'Cuenta remunerada ~8% EA, CDT 9-9,5% EA, FIC variable. Pon 0 si la guardas sin rendir.', group: 'Tu plan' },
    { id: 'inflacionAnual', label: 'Inflación anual esperada', type: 'number', suffix: '%', default: 5, min: 0, max: 50, step: 0.1, advanced: true, placeholder: '5', help: 'Con esto la meta se ajusta para que llegues con el mismo poder de compra. El Banrep apunta al 3%; 2026 corre cerca del 5%.', group: 'Tu plan' },
  ],
  compute,
  componentCalcs: [
    { slug: 'co/calculadora-cdt-colombia-rentabilidad-90-180-360-dias', label: 'Rentabilidad de un CDT' },
    { slug: 'co/calculadora-ahorro-en-pesos-vs-cdt-vs-fic-vs-tes-colombia', label: 'Pesos vs CDT vs FIC vs TES' },
    { slug: 'co/calculadora-rentabilidad-fondo-inversion-colectiva-fic-colombia', label: 'Rentabilidad de un FIC' },
    { slug: 'co/calculadora-cuenta-afc-ahorro-fomento-construccion-colombia', label: 'Cuenta AFC (vivienda)' },
  ],
  howItWorks: `Esta sala le pone fecha a tu meta simulando el ahorro mes a mes, con las tasas como se publican en Colombia.

1. **Tu punto de partida.** Arranca con lo que ya tienes guardado hoy.
2. **Mes a mes, con tasa EA.** Convierte la tasa efectiva anual que ingresas a su equivalente mensual compuesta — así rinden de verdad los CDT y las cuentas remuneradas — y cada mes suma el rendimiento más tu aporte.
3. **La meta también se mueve.** Con inflación del 5%, lo que hoy cuesta $20.000.000 costará cerca de $21.000.000 en un año. La sala hace crecer la meta cada mes para decirte cuándo llegas con poder de compra de verdad, no con un número que ya no alcanza.
4. **La fecha.** Cuando el saldo simulado toca la meta, te devuelve los meses y el mes calendario estimado.
5. **Las palancas.** Compara tres caminos — guardar 50% más, tu plan actual y dejar la plata sin rendir — para que veas qué acelera más: en plazos cortos gana el aporte; en plazos largos, el interés compuesto hace cada vez más del trabajo.`,
  faq: [
    { q: '¿Cómo se calcula la fecha en que llego a mi meta?', a: 'Con una simulación mes a mes: el saldo rinde a la tasa mensual equivalente de la EA que ingresas y recibe tu aporte, hasta igualar la meta. Es más fiel que una fórmula cerrada porque combina aportes periódicos, interés compuesto y, si la activas, una meta que crece con la inflación.' },
    { q: '¿Qué tasa pongo si tengo la plata en un CDT?', a: 'La tasa efectiva anual que te certificó el banco al abrirlo: en 2026 los CDT a 90-360 días pagan entre 9% y 9,5% EA según plazo y entidad. Si mezclas instrumentos — parte en cuenta remunerada al 8% EA, parte en CDT — usa un promedio ponderado aproximado.' },
    { q: '¿Por qué la meta sube con la inflación?', a: 'Porque si tu meta es comprar algo concreto, su precio no espera: con inflación del 5%, la cuota inicial que hoy vale $20.000.000 costará unos $21.000.000 el próximo año. Ajustar la meta te dice cuándo llegas con plata que compra lo mismo que hoy — que es lo que de verdad importa.' },
    { q: '¿Qué pasa si mi plata rinde menos que la inflación?', a: 'Tu ahorro pierde poder de compra: acumulas pesos pero la meta real se aleja. Es lo que pasa con la plata "debajo del colchón" o en cuentas que pagan 0%. En 2026 es evitable: cuentas remuneradas cerca del 8% EA y CDT al 9-9,5% EA le ganan a una inflación de ~5% sin asumir riesgo alto.' },
    { q: '¿Qué acelera más: guardar más o buscar mejor tasa?', a: 'En metas de menos de 3-4 años, guardar más gana casi siempre: el interés compuesto necesita tiempo para pesar. Pasar de 9% a 10% EA te recorta semanas; subir el aporte 50% te recorta meses. En metas largas la tasa se vuelve protagonista. La sala te muestra ambos escenarios con tus números.' },
    { q: '¿Cuenta remunerada, CDT o FIC: dónde pongo el ahorro?', a: 'Depende de cuándo lo necesites. Corto plazo o fondo de emergencia: cuenta remunerada (~8% EA, disponible el mismo día). Plata con fecha conocida: CDT, que paga más (9-9,5% EA) pero se bloquea hasta el vencimiento. Un FIC de bajo riesgo queda en el medio: buen rendimiento con retiro en uno o dos días.' },
    { q: '¿Los rendimientos que calculo son los que voy a recibir netos?', a: 'No exactamente: sobre los rendimientos financieros aplica retención en la fuente, y los traslados entre cuentas pueden causar el 4×1000 (GMF) si tu cuenta no está marcada como exenta — puedes marcar una sola cuenta de ahorros para que no te lo cobren. Son mordiscos pequeños pero existen; la proyección no los descuenta.' },
    { q: '¿Y si mi meta es la cuota inicial de vivienda?', a: 'Mira la cuenta AFC (Ahorro para el Fomento de la Construcción): los aportes que destines a vivienda pueden reducir tu base de retención y de renta, lo que en la práctica es rendimiento extra. Combínala con subsidios como Mi Casa Ya si aplicas — la meta puede quedar más cerca de lo que crees.' },
  ],
  sources: [
    { name: 'Banco de la República — Tasa de política e inflación', url: 'https://www.banrep.gov.co/' },
    { name: 'Superintendencia Financiera — Tasas de captación (CDT y cuentas)', url: 'https://www.superfinanciera.gov.co/' },
    { name: 'DANE — Índice de Precios al Consumidor', url: 'https://www.dane.gov.co/' },
  ],
};
