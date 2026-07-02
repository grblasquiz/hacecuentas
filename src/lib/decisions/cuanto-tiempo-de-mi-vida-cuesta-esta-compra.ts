/**
 * Sala de decisión — "¿Cuánto tiempo de mi vida cuesta esta compra?"
 *
 * Patrón REFRAMING. Reexpresa el precio de algo en la moneda que no se recupera:
 * tu tiempo. Calcula tu valor-hora NETO real (sueldo en mano menos gastos de
 * trabajar, sobre las horas que efectivamente trabajás) y traduce el precio en
 * horas, días y semanas laborales. El número que frena (o habilita) una compra.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, num } from './types';

const W = 4.33; // semanas promedio por mes

function compute(inputs: Record<string, any>): DecisionResult {
  const precio = Math.max(0, num(inputs.precio));
  const sueldoNeto = Math.max(0, num(inputs.sueldoNeto));
  const horasSemana = num(inputs.horasSemana) > 0 ? num(inputs.horasSemana) : 45;
  const gastosLaborales = Math.max(0, num(inputs.gastosLaboralesMes));

  if (!precio || !sueldoNeto) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio de lo que querés comprar y tu sueldo neto mensual para traducirlo en horas y días de tu vida.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tiempo de trabajo que cuesta' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio** de lo que querés comprar.',
        'Cargá tu **sueldo neto** mensual (lo que cobrás en la mano).',
      ],
    };
  }

  const horasMes = horasSemana * W;
  const netoReal = Math.max(0, sueldoNeto - gastosLaborales);
  const valorHora = horasMes > 0 ? netoReal / horasMes : 0;
  const valorDia = valorHora * (horasSemana / 5); // jornada laboral promedio

  const horasDeVida = valorHora > 0 ? precio / valorHora : Infinity;
  const diasLaborales = valorDia > 0 ? precio / valorDia : Infinity;
  const semanasLaborales = diasLaborales / 5;
  const mesesSueldo = netoReal > 0 ? precio / netoReal : Infinity;

  const fmtH = (h: number) =>
    !Number.isFinite(h) ? '—' : `${h.toFixed(1).replace('.', ',').replace(',0', '')} h`;
  const fmtD = (d: number) =>
    !Number.isFinite(d) ? '—' : `${d.toFixed(1).replace('.', ',').replace(',0', '')} días`;
  const fmtS = (s: number) =>
    !Number.isFinite(s) ? '—' : `${s.toFixed(1).replace('.', ',').replace(',0', '')} semanas`;

  // Veredicto por "peso" en tiempo: cuántos días laborales cuesta.
  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (diasLaborales <= 1) {
    status = 'b';
    tone = 'good';
    title = 'Es una compra liviana en tiempo';
    badge = 'Liviana';
  } else if (diasLaborales <= 10) {
    status = 'tie';
    tone = 'neutral';
    title = 'Cuesta un buen pedazo de tu mes de trabajo';
    badge = 'Pensala';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'Es cara en horas de tu vida';
    badge = 'Cara en tiempo';
  }

  const detail = `A tu valor-hora neto real de ${fmtMoney(valorHora)}, esta compra de ${fmtMoney(precio)} cuesta ${fmtH(horasDeVida)} de trabajo: ${fmtD(diasLaborales)} laborales (${fmtS(semanasLaborales)}). Es el equivalente a ${mesesSueldo < 1 ? `${(mesesSueldo * 100).toFixed(0)}% de` : fmtH(mesesSueldo).replace(' h', '')} ${mesesSueldo >= 1 ? 'sueldos' : 'tu sueldo'} netos.`;

  const scenarios = [
    {
      label: 'En horas',
      value: fmtH(horasDeVida),
      detail: `A ${fmtMoney(valorHora)} netos por hora trabajada.`,
    },
    {
      label: 'En días laborales',
      value: fmtD(diasLaborales),
      detail: `Jornadas completas de trabajo (${(horasSemana / 5).toFixed(1).replace('.', ',')} h/día).`,
    },
    {
      label: 'En sueldos',
      value: !Number.isFinite(mesesSueldo)
        ? '—'
        : `${mesesSueldo.toFixed(1).replace('.', ',').replace(',0', '')} sueldos`,
      detail: 'Cuántos sueldos netos enteros representa.',
    },
  ];

  const breakdown = [
    { label: 'Sueldo neto mensual', value: fmtMoney(sueldoNeto) },
    {
      label: 'Gastos de trabajar (por mes)',
      value: '-' + fmtMoney(gastosLaborales).replace('-', ''),
      hint: 'transporte, comida, ropa de trabajo',
    },
    { label: 'Ingreso neto real', value: fmtMoney(netoReal) },
    { label: 'Horas trabajadas por mes', value: `${Math.round(horasMes)} h`, hint: `${horasSemana} h/semana × 4,33` },
    { label: 'Valor de tu hora (neto real)', value: fmtMoney(valorHora) },
    { label: 'Precio de la compra', value: fmtMoney(precio) },
    { label: 'Cuesta en horas de trabajo', value: fmtH(horasDeVida), hint: fmtD(diasLaborales) },
  ];

  const nextActions = [
    `Esta compra te cuesta **${fmtD(diasLaborales)}** de trabajo. Preguntate: ¿vale ese tiempo de tu vida?`,
    'Restá los **gastos de trabajar** (transporte, comida, ropa): bajan tu valor-hora real y muestran que ganás menos por hora de lo que parece.',
    diasLaborales > 10
      ? 'Es una compra grande en tiempo: dejala "en pausa" 48 horas antes de decidir. Si la seguís queriendo igual, adelante; muchas veces el impulso se enfría.'
      : 'Si la querés y es liviana en tiempo, no la sobreanalices: el objetivo es decidir con conciencia, no privarte de todo.',
    'Para compras grandes, compará este "precio en tiempo" con cuánto rendiría esa plata invertida: a veces el costo real es doble (el tiempo y el rendimiento que resignás).',
  ];

  const notes = [
    'El valor-hora se calcula sobre las horas que efectivamente trabajás (horas/semana × 4,33) y descuenta los gastos de trabajar, así refleja lo que realmente ganás por hora, no el bruto teórico.',
    'Es un ejercicio de perspectiva, no una regla: el tiempo libre, el disfrute y la necesidad también valen. La idea es decidir con conciencia del costo real.',
    'No es asesoramiento financiero. Para compras financiadas, sumá los intereses: el "precio en tiempo" sube con cada cuota.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtD(diasLaborales),
      label: 'Días de trabajo que cuesta',
      sub: `${fmtH(horasDeVida)} a tu valor-hora neto real de **${fmtMoney(valorHora)}**. Equivale a ${!Number.isFinite(mesesSueldo) ? '—' : mesesSueldo.toFixed(1).replace('.', ',').replace(',0', '') + ' sueldos'}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-tiempo-de-mi-vida-cuesta-esta-compra',
  title: '¿Cuánto tiempo de tu vida cuesta esta compra? 2026',
  h1: '¿Cuánto tiempo de mi vida cuesta esta compra?',
  description:
    'Traducí el precio de lo que querés comprar en horas, días y semanas de tu trabajo. Calcula tu valor-hora neto real (descontando los gastos de trabajar) y te dice cuánto tiempo de tu vida cuesta de verdad.',
  intro:
    'El dinero se recupera; el tiempo no. Esta sala toma el precio de lo que querés comprar y lo traduce a la única moneda que no vuelve: las horas y días de tu vida que tenés que trabajar para pagarlo. Calcula tu valor-hora neto real (ya descontados los gastos de ir a trabajar) y te da una perspectiva que el precio en pesos esconde.',
  icon: '⏳',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precio: 1200000,
    sueldoNeto: 1200000,
    horasSemana: 45,
    gastosLaboralesMes: 150000,
  },
  fields: [
    {
      id: 'precio',
      label: 'Precio de la compra',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      help: 'Lo que cuesta lo que querés comprar (precio de contado).',
      group: 'La compra',
      groupIcon: '🛍️',
    },
    {
      id: 'sueldoNeto',
      label: 'Tu sueldo neto mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '1200000',
      profileKey: 'trabajo.sueldoNeto',
      help: 'Lo que cobrás en la mano por mes, después de descuentos.',
      group: 'Tu trabajo',
      groupIcon: '💼',
    },
    {
      id: 'horasSemana',
      label: 'Horas que trabajás por semana',
      type: 'number',
      default: 45,
      min: 1,
      max: 80,
      suffix: 'hs',
      help: 'Tus horas reales de trabajo semanales (por defecto 45).',
      group: 'Tu trabajo',
    },
    {
      id: 'gastosLaboralesMes',
      label: 'Gastos de trabajar (por mes)',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '150000',
      help: 'Transporte, comida, ropa de trabajo: lo que gastás por mes solo por ir a trabajar. Baja tu valor-hora real.',
      group: 'Tu trabajo',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-presupuesto-regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'calculadora-interes-compuesto', label: 'Interés compuesto' },
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota de préstamo' },
  ],
  howItWorks: `Esta sala convierte pesos en tiempo de vida con tu valor-hora real.

1. **Horas que trabajás por mes.** Multiplica tus horas semanales por 4,33 semanas. Es el tiempo real que dedicás a ganar tu sueldo.
2. **Ingreso neto real.** A tu sueldo neto le resta los gastos de trabajar (transporte, comida, ropa). Eso es lo que de verdad te queda por trabajar.
3. **Valor de tu hora.** Divide el ingreso neto real por las horas trabajadas. Suele ser bastante menor de lo que la gente cree.
4. **Precio en tiempo.** Divide el precio de la compra por tu valor-hora para obtener las horas de trabajo que cuesta, y las pasa a días laborales, semanas y sueldos netos.
5. **Perspectiva.** Te muestra el mismo precio en cuatro monedas de tiempo para que decidas sabiendo cuánto de tu vida estás cambiando por ese objeto.`,
  faq: [
    {
      q: '¿Por qué descuentan los gastos de trabajar del valor-hora?',
      a: 'Porque ganar tu sueldo también cuesta: transporte, comida fuera de casa, ropa de trabajo. Tu valor-hora real es lo que te queda después de esos gastos, dividido por las horas trabajadas. Suele ser menor que el bruto por hora, y por eso una compra cuesta más tiempo del que parece.',
    },
    {
      q: '¿Cómo calculan las horas trabajadas por mes?',
      a: 'Multiplicamos tus horas semanales por 4,33 (el promedio de semanas en un mes). Con 45 horas semanales son unas 195 horas mensuales. Podés ajustar las horas a tu jornada real.',
    },
    {
      q: '¿Sirve para compras financiadas en cuotas?',
      a: 'Cargá el precio de contado para ver el costo base en tiempo. Si vas a financiar, el costo real en horas es mayor por los intereses: usá nuestra calculadora de cuota de préstamo para ver el total y volvé a cargarlo acá.',
    },
    {
      q: '¿Esto significa que no debería comprarme nada?',
      a: 'No. Es una herramienta de perspectiva, no de culpa. El disfrute, la necesidad y el tiempo libre también valen. La idea es que decidas con conciencia: a veces ver que algo cuesta "dos semanas de trabajo" cambia la decisión, y a veces confirma que vale la pena.',
    },
    {
      q: '¿Qué pasa si trabajo por mi cuenta o tengo ingresos variables?',
      a: 'Usá tu ingreso neto mensual promedio y tus horas reales de trabajo (incluí las no facturables si querés un número honesto). El valor-hora va a reflejar lo que realmente ganás por hora dedicada.',
    },
    {
      q: '¿Por qué traducen el precio también a "sueldos"?',
      a: 'Porque para compras grandes "días de trabajo" se queda corto y "sueldos netos enteros" es más intuitivo. Ver que algo cuesta, por ejemplo, un sueldo completo ayuda a dimensionar el impacto real en tu economía.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es un ejercicio de reframing para tomar decisiones de consumo con más conciencia. Para planificar tus finanzas en serio, combinalo con un presupuesto (regla 50/30/20) y, si hace falta, un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'Vicki Robin & Joe Domínguez — "La bolsa o la vida" (concepto de energía vital)', url: undefined },
    { name: 'INDEC — Encuesta Permanente de Hogares (ingresos)', url: 'https://www.indec.gob.ar/' },
  ],
};
