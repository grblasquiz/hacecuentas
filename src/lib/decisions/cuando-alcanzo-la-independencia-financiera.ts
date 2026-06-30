/**
 * Sala de decisión — "¿Cuándo alcanzo la independencia financiera (FIRE)?"
 *
 * Patrón PROYECCIÓN. Aplica la regla del 4%: tu "número FIRE" es 25× tus gastos
 * anuales (lo que necesitás invertido para vivir de la renta). Simula año a año,
 * con tu ahorro actual, tus aportes y un rendimiento real, cuándo tu cartera
 * llega a ese número. Los ingresos pasivos bajan el objetivo. El número
 * decisivo: años hasta FIRE + el monto objetivo.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

const SWR = 0.04; // safe withdrawal rate (regla del 4%) → número FIRE = gastos / 0.04 = ×25
const MAX_ANIOS = 80;

function compute(inputs: Record<string, any>): DecisionResult {
  const gastosAnuales = Math.max(0, num(inputs.gastosAnuales));
  const ahorroActual = Math.max(0, num(inputs.ahorroActual));
  const aporteMensual = Math.max(0, num(inputs.aporteMensual));
  const rendimientoReal =
    num(inputs.rendimientoRealAnual) > 0 ? num(inputs.rendimientoRealAnual) : 4;
  const ingresosPasivos = Math.max(0, num(inputs.ingresosPasivos));

  if (!gastosAnuales) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá tus gastos anuales para calcular tu número FIRE (25× tus gastos). Sumá tu ahorro actual y tu aporte mensual para proyectar cuándo llegás.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Años hasta la independencia financiera' },
      scenarios: [],
      nextActions: [
        'Cargá tus **gastos anuales** (lo que gastás por año para vivir).',
        'Sumá tu **ahorro/inversión actual** y cuánto **aportás por mes**.',
      ],
    };
  }

  // El objetivo cubre solo los gastos NO cubiertos por ingresos pasivos.
  const gastosACubrir = Math.max(0, gastosAnuales - ingresosPasivos);
  const numeroFIRE = gastosACubrir / SWR; // = gastosACubrir × 25

  // Simulación año a año con aportes mensuales y rendimiento real anual.
  const r = rendimientoReal / 100;
  const aporteAnual = aporteMensual * 12;

  const simularAnios = (capital0: number, aporteAnio: number, tasa: number): number => {
    if (capital0 >= numeroFIRE) return 0;
    let capital = capital0;
    for (let anio = 1; anio <= MAX_ANIOS; anio++) {
      capital = capital * (1 + tasa) + aporteAnio;
      if (capital >= numeroFIRE) return anio;
    }
    return Infinity;
  };

  const aniosFIRE = simularAnios(ahorroActual, aporteAnual, r);

  const fmtAnios = (a: number) =>
    !Number.isFinite(a)
      ? `más de ${MAX_ANIOS} años`
      : a <= 0
        ? 'ya lo lograste'
        : a === 1
          ? '1 año'
          : `${a} años`;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (aniosFIRE <= 0) {
    status = 'b';
    tone = 'good';
    title = '¡Ya alcanzaste la independencia financiera!';
    badge = 'FIRE logrado';
    detail = `Tu cartera de ${fmtMoney(ahorroActual)} ya supera tu número FIRE de ${fmtMoney(numeroFIRE)}: podrías vivir de la renta retirando el 4% anual. Validá los supuestos antes de dejar de trabajar.`;
  } else if (Number.isFinite(aniosFIRE) && aniosFIRE <= 15) {
    status = 'b';
    tone = 'good';
    title = `Vas en camino: FIRE en ${fmtAnios(aniosFIRE)}`;
    badge = 'En camino';
    detail = `Con un ahorro de ${fmtMoney(ahorroActual)}, aportes de ${fmtMoney(aporteMensual)}/mes y un rendimiento real del ${rendimientoReal.toString().replace('.', ',')}%, llegás a tu número FIRE de ${fmtMoney(numeroFIRE)} en ${fmtAnios(aniosFIRE)}.`;
  } else if (Number.isFinite(aniosFIRE)) {
    status = 'tie';
    tone = 'neutral';
    title = `FIRE a la vista, pero lejos: ${fmtAnios(aniosFIRE)}`;
    badge = 'Largo plazo';
    detail = `Llegás a tu número FIRE de ${fmtMoney(numeroFIRE)} en ${fmtAnios(aniosFIRE)} al ritmo actual. Subir el aporte mensual o el rendimiento acorta mucho ese plazo; mirá los escenarios.`;
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Al ritmo actual, FIRE no llega';
    badge = 'No alcanza';
    detail = `Con los aportes actuales no alcanzás tu número FIRE de ${fmtMoney(numeroFIRE)} en un horizonte razonable. Necesitás aportar más, bajar tus gastos (que reduce el objetivo) o sumar ingresos pasivos.`;
  }

  // Escenarios: aporte +50%, rendimiento +2pts, gastos -15% (baja el número FIRE).
  const aniosMasAporte = simularAnios(ahorroActual, aporteAnual * 1.5, r);
  const aniosMasRend = simularAnios(ahorroActual, aporteAnual, r + 0.02);
  const numeroFIREMenosGasto = (gastosACubrir * 0.85) / SWR;
  const simularConObjetivo = (objetivo: number): number => {
    if (ahorroActual >= objetivo) return 0;
    let capital = ahorroActual;
    for (let anio = 1; anio <= MAX_ANIOS; anio++) {
      capital = capital * (1 + r) + aporteAnual;
      if (capital >= objetivo) return anio;
    }
    return Infinity;
  };
  const aniosMenosGasto = simularConObjetivo(numeroFIREMenosGasto);

  const scenarios = [
    {
      label: 'Aportando 50% más',
      value: fmtAnios(aniosMasAporte),
      detail: `Si subís el aporte a ${fmtMoney(aporteMensual * 1.5)}/mes.`,
    },
    {
      label: 'Probable',
      value: fmtAnios(aniosFIRE),
      detail: `Con tus aportes y rendimiento actuales.`,
    },
    {
      label: 'Gastando 15% menos',
      value: fmtAnios(aniosMenosGasto),
      detail: `Bajar gastos reduce el objetivo a ${fmtMoney(numeroFIREMenosGasto)}.`,
    },
  ];

  const nextActions = [
    `Tu meta es acumular **${fmtMoney(numeroFIRE)}** invertidos (25× tus gastos a cubrir). Tenés ${fmtMoney(ahorroActual)}: te falta ${fmtMoney(Math.max(0, numeroFIRE - ahorroActual))}.`,
    'La palanca más poderosa es la **tasa de ahorro**: cada peso que recortás de gastos baja tu número FIRE (×25) y a la vez sube tu aporte. Bajar gastos acelera por los dos lados.',
    ingresosPasivos > 0
      ? `Tus ingresos pasivos (${fmtMoney(ingresosPasivos)}/año) ya bajan el objetivo. Hacerlos crecer es la vía más directa al FIRE: cubrir gastos sin tocar el capital.`
      : 'Construir **ingresos pasivos** (alquileres, dividendos, renta) reduce directamente tu número FIRE, porque tenés que cubrir menos gastos con la cartera.',
    'Usá un **rendimiento real** (ya descontada la inflación) conservador. En Argentina, medí en dólares o en términos reales para no engañarte con tasas nominales altas.',
  ];

  const notes = [
    'Aplica la regla del 4% (safe withdrawal rate): el número FIRE es 25× tus gastos anuales a cubrir. La simulación capitaliza año a año con tu rendimiento real y suma tus aportes anuales.',
    'El rendimiento debe ser REAL (neto de inflación). La regla del 4% surge de estudios sobre mercados de EE.UU. (Trinity Study); en Argentina conviene ser más conservador y medir en moneda dura.',
    'No es asesoramiento financiero ni garantía de resultados. Los rendimientos varían y no están garantizados. Para un plan de retiro serio, consultá con un asesor financiero matriculado.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtAnios(aniosFIRE),
      label: 'Años hasta la independencia financiera',
      sub: `Número FIRE objetivo: **${fmtMoney(numeroFIRE)}** (25× tus gastos a cubrir). Hoy tenés ${fmtMoney(ahorroActual)}.`,
    },
    scenarios,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuando-alcanzo-la-independencia-financiera',
  title: '¿Cuándo alcanzo la independencia financiera (FIRE)? 2026',
  h1: '¿Cuándo alcanzo la independencia financiera (FIRE)?',
  description:
    'Calculá tu número FIRE (25× tus gastos anuales, regla del 4%) y proyectá en cuántos años lo alcanzás con tu ahorro actual, tus aportes mensuales y un rendimiento real. Con escenarios para acelerarlo.',
  intro:
    'La independencia financiera (FIRE) llega cuando tu cartera invertida es tan grande que podés vivir de su renta sin trabajar. La regla del 4% dice que ese número es 25 veces tus gastos anuales. Esta sala calcula tu número objetivo y simula año a año, con tu ahorro y tus aportes, cuándo lo alcanzás, y te muestra qué palancas acortan más el camino.',
  icon: '🔥',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    gastosAnuales: 12000000,
    ahorroActual: 20000000,
    aporteMensual: 600000,
    rendimientoRealAnual: 5,
    ingresosPasivos: 0,
  },
  fields: [
    {
      id: 'gastosAnuales',
      label: 'Tus gastos anuales',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '12000000',
      help: 'Lo que gastás por año para vivir. Es la base del número FIRE (×25).',
      group: 'Tu objetivo',
      groupIcon: '🎯',
    },
    {
      id: 'ingresosPasivos',
      label: 'Ingresos pasivos anuales',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      help: 'Renta que ya cobrás sin trabajar (alquileres, dividendos). Bajan el objetivo.',
      group: 'Tu objetivo',
    },
    {
      id: 'ahorroActual',
      label: 'Ahorro / inversión actual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '20000000',
      profileKey: 'finanzas.ahorros',
      help: 'El capital que ya tenés invertido o ahorrado, el punto de partida.',
      group: 'Tu plan de ahorro',
      groupIcon: '💰',
    },
    {
      id: 'aporteMensual',
      label: 'Aporte mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '600000',
      help: 'Cuánto sumás a tu cartera cada mes.',
      group: 'Tu plan de ahorro',
    },
    {
      id: 'rendimientoRealAnual',
      label: 'Rendimiento real anual',
      type: 'number',
      suffix: '%',
      default: 4,
      min: 0,
      max: 30,
      step: 0.5,
      help: 'Rendimiento esperado YA descontada la inflación (real). Conservador: 3-5%.',
      group: 'Tu plan de ahorro',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-fire-retiro-temprano', label: 'Número FIRE / retiro temprano' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-plazo-fijo', label: 'Plazo fijo' },
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
  ],
  howItWorks: `Esta sala aplica la regla del 4% y proyecta tu camino al retiro.

1. **Número FIRE.** Multiplica tus gastos anuales por 25 (equivalente a retirar el 4% anual sin agotar el capital). Si tenés ingresos pasivos, primero los resta de los gastos, así el objetivo baja.
2. **Punto de partida.** Toma tu ahorro o inversión actual como capital inicial de la simulación.
3. **Simulación año a año.** Hace crecer tu capital con el rendimiento real anual y le suma tus aportes anuales, año tras año, hasta que alcanza el número FIRE.
4. **Años hasta FIRE.** Devuelve cuántos años faltan a ese ritmo, y el monto que todavía te falta acumular.
5. **Escenarios.** Compara qué pasa si aportás 50% más, si el rendimiento es 2 puntos mayor, o si bajás tus gastos un 15% (lo que reduce el objetivo y acelera por partida doble).`,
  faq: [
    {
      q: '¿Qué es el número FIRE y la regla del 4%?',
      a: 'FIRE (Financial Independence, Retire Early) es tener invertido suficiente para vivir de la renta. La regla del 4% dice que podés retirar el 4% de tu cartera por año sin agotarla, así que tu número objetivo es 25 veces tus gastos anuales (porque 1 ÷ 0,04 = 25).',
    },
    {
      q: '¿Por qué multiplican mis gastos por 25?',
      a: 'Porque retirar el 4% anual equivale a dividir por 0,04, que es lo mismo que multiplicar por 25. Si gastás $12.000.000 al año, necesitás $300.000.000 invertidos para que el 4% ($12.000.000) cubra tus gastos sin tocar el capital.',
    },
    {
      q: '¿Qué rendimiento debería usar?',
      a: 'Un rendimiento REAL, ya descontada la inflación. Históricamente una cartera diversificada rinde entre 3% y 5% real anual a largo plazo. Poné un número conservador: si usás tasas nominales altas argentinas sin descontar inflación, el resultado va a ser irreal.',
    },
    {
      q: '¿Cómo acelero mi camino al FIRE?',
      a: 'La palanca más potente es la tasa de ahorro. Bajar gastos hace doble efecto: reduce tu número objetivo (×25) y aumenta lo que podés aportar. Subir ingresos y construir renta pasiva también acortan mucho el plazo, como muestran los escenarios.',
    },
    {
      q: '¿Sirve la regla del 4% en Argentina?',
      a: 'Es una guía, no una ley. Surge de estudios sobre el mercado de EE.UU. (Trinity Study). En Argentina, con alta inflación y volatilidad, conviene ser más conservador, medir en dólares o términos reales, y quizás apuntar a una tasa de retiro menor (3-3,5%).',
    },
    {
      q: '¿Qué pasa si tengo ingresos pasivos?',
      a: 'Bajan tu número FIRE. Si cobrás renta de alquileres o dividendos, esa parte de tus gastos ya está cubierta y no necesitás capital para ella. La sala resta los ingresos pasivos de tus gastos antes de calcular el objetivo.',
    },
    {
      q: '¿Esto garantiza que me pueda retirar?',
      a: 'No. Es una proyección con supuestos (rendimiento constante, aportes sostenidos) que la realidad no cumple al pie de la letra. Los rendimientos varían y no están garantizados. Usalo como brújula y, para un plan de retiro real, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'Trinity Study — Safe Withdrawal Rate (regla del 4%)', url: undefined },
    { name: 'CNV — Educación financiera e inversiones', url: 'https://www.argentina.gob.ar/cnv' },
  ],
};
