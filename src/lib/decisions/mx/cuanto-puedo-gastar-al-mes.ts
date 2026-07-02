/**
 * Sala de decisión (México) — "¿Cuánto puedo gastar al mes sin endeudarme?"
 *
 * Patrón PRESUPUESTO. Adapta la regla 50/30/20 al bolsillo mexicano: del
 * ingreso neto resta los fijos (renta o mantenimiento, servicios, transporte,
 * mensualidades de deuda) y el ahorro objetivo, y devuelve el tope de gasto
 * variable por mes, por quincena — que es como cobra la mayoría — y por día.
 * Contexto local: salario mínimo 2026 y costo de la canasta básica.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtMXN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const fijos = Math.max(0, num(inputs.gastosFijos));
  const ahorroPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información para decidir',
        detail:
          'Ingresa tu ingreso neto mensual y tus gastos fijos. Te decimos cuánto puedes gastar en lo variable cada mes, cada quincena y cada día sin caer en la tarjeta.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Tope de gasto variable al mes' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **ingreso neto mensual** (suma tus dos quincenas libres).',
        'Suma tus **gastos fijos** (renta, servicios, transporte, mensualidades) y define un **% de ahorro**.',
      ],
    };
  }

  const ahorro = ingreso * (ahorroPct / 100);
  const variable = ingreso - fijos - ahorro;
  const pctFijos = (fijos / ingreso) * 100;

  // Referencias 50/30/20.
  const ref50 = ingreso * 0.5;
  const ref30 = ingreso * 0.3;
  const ref20 = ingreso * 0.2;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (variable < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Tus fijos ya rebasan lo que entra';
    badge = 'En rojo';
    detail = `Entre gastos fijos (${fmtMoney(fijos)}) y el ahorro objetivo (${fmtMoney(ahorro)}) te pasas de tu ingreso de ${fmtMoney(ingreso)}: te faltan ${fmtMoney(-variable)} antes de gastar un peso en lo variable. Toca recortar fijos, bajar el ahorro objetivo o subir ingresos — pero no cubrir el hueco con la tarjeta.`;
  } else if (pctFijos > 60) {
    status = 'tie';
    tone = 'warn';
    title = 'Puedes gastar poco: tus fijos pesan demasiado';
    badge = 'Justo';
    detail = `Te quedan ${fmtMoney(variable)} al mes para gasto variable, pero tus fijos se llevan el ${fmtPct(pctFijos, 0)} de tu ingreso (lo sano es hasta 50%). Con tan poco margen, cualquier imprevisto te manda a los meses sin intereses o al pago mínimo de la tarjeta.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tienes un margen sano para gastar';
    badge = 'Equilibrado';
    detail = `Después de cubrir fijos (${fmtMoney(fijos)}) y apartar ${fmtMoney(ahorro)} de ahorro, puedes gastar hasta ${fmtMoney(variable)} al mes en lo variable sin endeudarte. Repartido por quincena son ${fmtMoney(variable / 2)}: si respetas ese tope, la tarjeta se paga completa cada mes.`;
  }

  const porQuincena = variable > 0 ? variable / 2 : 0;
  const porDia = variable > 0 ? variable / 30 : 0;

  const scenarios = [
    { label: 'Por mes', value: fmtMoney(Math.max(0, variable)), detail: 'Tu tope de gasto variable mensual sin caer en deuda.' },
    { label: 'Por quincena', value: fmtMoney(porQuincena), detail: 'El mismo tope partido en dos, como cobras: más fácil de respetar.' },
    { label: 'Por día', value: fmtMoney(porDia), detail: 'Lo que puedes gastar al día en lo no esencial (antojos, apps, salidas).' },
  ];

  const breakdown = [
    { label: 'Ingreso neto mensual', value: fmtMoney(ingreso) },
    { label: 'Necesidades / gastos fijos', value: fmtMoney(fijos), hint: `${fmtPct(pctFijos, 0)} de tu ingreso (ref. 50%: ${fmtMoney(ref50)})` },
    { label: 'Ahorro objetivo', value: fmtMoney(ahorro), hint: `${fmtPct(ahorroPct, 0)} (ref. 20%: ${fmtMoney(ref20)})` },
    { label: 'Gasto variable disponible', value: fmtMoney(Math.max(0, variable)), hint: `ref. 30%: ${fmtMoney(ref30)}` },
  ];

  const nextActions = [
    variable < 0
      ? 'Estás en rojo estructural: recorta fijos o sube ingresos hasta que el gasto variable dé positivo. Mientras tanto, **no sumes mensualidades nuevas** — ni siquiera a meses sin intereses.'
      : `Tu tope de gasto variable es **${fmtMoney(variable)}/mes** (${fmtMoney(porQuincena)} por quincena). Anota tus gastos no esenciales y frena al llegar al tope.`,
    pctFijos > 50
      ? `Tus fijos se llevan el ${fmtPct(pctFijos, 0)} (lo sano es hasta 50%): revisa renta, suscripciones y mensualidades de deuda, que son lo que más mueve la aguja.`
      : 'Tus fijos están en nivel sano (≤50%): el reto es que lo variable no se desborde entre quincena y quincena.',
    ahorroPct < 10 && variable > 0
      ? 'Estás ahorrando poco: si te sobra del variable, sube el ahorro objetivo antes de gastarlo. El ahorro que no se aparta el día de la quincena, no se ahorra.'
      : 'Aparta el ahorro **el mismo día que cae la quincena**, no al final del mes con lo que sobre: págate a ti primero y gasta lo que queda.',
    'Cuidado con los **meses sin intereses**: cada compra convierte gasto variable de hoy en gasto fijo de los próximos meses. Réstalos de tu tope antes de firmar otro.',
  ];

  const notes = [
    'Adapta la regla 50/30/20 (50% necesidades, 30% deseos, 20% ahorro) a tus números reales: el gasto variable disponible es tu ingreso menos gastos fijos y ahorro objetivo.',
    'Los "gastos fijos" incluyen renta o mantenimiento, servicios (luz CFE, agua, gas, internet), súper básico, transporte, colegiaturas y mensualidades de deuda (incluidos los meses sin intereses). Lo variable es lo discrecional: salidas, ropa, apps de comida.',
    'Referencias 2026: el salario mínimo general ronda los $315 diarios (unos $9,600 al mes) y la canasta alimentaria más no alimentaria por persona se estima cerca de $4,800 mensuales en zonas urbanas (INEGI/CONEVAL). No es asesoría financiera.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.max(0, variable)) + '/mes',
      label: 'Puedes gastar en lo variable sin endeudarte',
      sub: `≈ ${fmtMoney(porQuincena)} por quincena, tras cubrir fijos (${fmtMoney(fijos)}) y ahorrar ${fmtMoney(ahorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-puedo-gastar-al-mes',
  title: '¿Cuánto puedo gastar al mes sin endeudarme? México 2026',
  h1: '¿Cuánto puedo gastar al mes sin endeudarme?',
  description:
    'Tu tope de gasto variable en México con la regla 50/30/20 adaptada: ingreso neto menos renta, servicios, transporte y mensualidades, menos ahorro. Cuánto puedes gastar por mes, por quincena y por día sin caer en la tarjeta.',
  intro:
    'Gastar sin un número en la cabeza es el camino directo al pago mínimo de la tarjeta. Esta sala adapta la regla 50/30/20 a tu caso: toma tu ingreso neto, descuenta tus gastos fijos (renta, servicios, transporte, mensualidades) y el ahorro que quieres sostener, y te da un tope claro de gasto variable por mes, por quincena — que es como cobra la mayoría en México — y por día.',
  icon: '🧮',
  category: 'finanzas',
  audience: 'MX',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNeto: 25000,
    gastosFijos: 14000,
    ahorroObjetivo: 15,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '25,000', help: 'Lo que recibes libre al mes: suma tus dos quincenas ya con ISR e IMSS descontados, más otros ingresos.', group: 'Tu dinero', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: '$', format: 'thousands', required: true, min: 0, placeholder: '14,000', help: 'Renta o mantenimiento, luz, agua, gas, internet, súper básico, transporte, colegiaturas y mensualidades de deuda.', group: 'Tu dinero' },
    { id: 'ahorroObjetivo', label: '% de ahorro que quieres sostener', type: 'number', suffix: '%', default: 20, min: 0, max: 100, placeholder: '15', help: 'Qué porcentaje de tu ingreso quieres apartar cada mes. La regla 50/30/20 sugiere 20%.', group: 'Tu dinero' },
  ],
  compute,
  componentCalcs: [
    { slug: 'mx/calculadora-sueldo-neto-mexico', label: 'Sueldo neto en México' },
    { slug: 'mx/calculadora-coste-vida-mensual-mexico-soltero-pareja-familia', label: 'Costo de vida mensual' },
    { slug: 'mx/calculadora-canasta-basica-mexico-costo-mensual-familia', label: 'Canasta básica familiar' },
    { slug: 'mx/calculadora-salario-minimo-mexico-2026', label: 'Salario mínimo 2026' },
  ],
  howItWorks: `Esta sala convierte la regla 50/30/20 en un tope concreto para tu quincena.

1. **Tu ingreso real.** Parte de lo que recibes libre al mes: tus dos quincenas netas más cualquier otro ingreso constante.
2. **Necesidades primero.** Resta tus gastos fijos: renta o mantenimiento, servicios, súper básico, transporte, colegiaturas y las mensualidades que ya firmaste (incluidos los meses sin intereses). La regla dice que no deberían pasar del 50% de tu ingreso.
3. **Págate a ti primero.** Aparta el ahorro objetivo (la regla sugiere 20%) el día que cae la quincena: el ahorro que se deja "para el final del mes" no sobrevive.
4. **Lo que queda es tu tope.** El resto es gasto variable: salidas, ropa, apps de comida, antojos. Ese es el máximo que puedes gastar sin recurrir a la tarjeta.
5. **En porciones de quincena.** Reparte el tope por quincena y por día para que sea fácil de respetar, y enciende una alerta si tus fijos pesan más de la cuenta.`,
  faq: [
    { q: '¿Qué es la regla 50/30/20?', a: 'Una guía de presupuesto: 50% del ingreso a necesidades, 30% a deseos (gasto variable) y 20% a ahorro. Esta sala la adapta a tus números reales — con tus fijos y tu ahorro objetivo — en lugar de imponer los porcentajes fijos.' },
    { q: '¿Qué cuenta como gasto fijo en México?', a: 'Lo que pagas sí o sí cada mes: renta o mantenimiento, luz (CFE), agua, gas, internet y celular, súper básico, transporte al trabajo, colegiaturas y todas tus mensualidades de deuda, incluidas las compras a meses sin intereses. Lo recortable (salidas, ropa, plataformas extra) es variable.' },
    { q: '¿Cómo manejo el presupuesto si cobro por quincena?', a: 'Divide el tope mensual entre dos y adminístralo quincena a quincena: es más realista que pensar en el mes completo. Un truco útil: paga los fijos grandes con la primera quincena y deja la segunda para variable y ahorro, o reparte mitad y mitad según tus fechas de corte.' },
    { q: '¿Los meses sin intereses cuentan como gasto variable?', a: 'La compra fue variable, pero la mensualidad se vuelve gasto fijo hasta terminar de pagarla. Por eso conviene sumarlas a tus fijos: tres o cuatro compras a MSI pueden comerse $2,000–$3,000 de tu margen mensual sin que lo notes.' },
    { q: '¿Cuánto debería ahorrar al mes?', a: 'La regla sugiere 20% del ingreso, pero lo importante es la constancia. Si hoy no llegas, empieza con 5–10% y súbelo cuando liberes alguna mensualidad. Con $25,000 netos, 10% son $2,500 al mes: en un año, tu primer colchón de emergencia.' },
    { q: '¿Qué hago si mis fijos superan el 50% del ingreso?', a: 'Es la causa número uno de vivir al día. Revisa los rubros grandes: la renta (lo sano es que no pase del 30% del ingreso), las suscripciones acumuladas y las mensualidades de deuda. Si no puedes bajarlos, la salida es subir ingresos; mientras tanto, ajusta ahorro y variable.' },
    { q: '¿Sirve esta regla si gano cerca del salario mínimo?', a: 'Sirve como brújula, pero los porcentajes se comprimen: con un ingreso cercano al mínimo 2026 (unos $9,600 al mes) las necesidades absorben casi todo, porque la canasta básica urbana ronda los $4,800 por persona. En ese caso la prioridad es proteger un micro-ahorro fijo, aunque sea $200 por quincena.' },
    { q: '¿Sirve si mi ingreso es variable (propinas, comisiones, ventas)?', a: 'Sí, pero calcula con tu mes promedio bajo, no con el mejor. Presupuesta los fijos y el ahorro sobre ese piso, y trata lo que llegue de más como refuerzo del ahorro, no como permiso para gastar más.' },
    { q: '¿Esto reemplaza llevar un registro de gastos?', a: 'No: lo complementa. Esta sala te da el tope; el registro (una app o la libreta de siempre) te dice si lo estás cumpliendo. Comparar lo gastado contra el tope cada quincena es lo que de verdad evita la deuda.' },
  ],
  sources: [
    { name: 'INEGI — Ingreso y gasto de los hogares (ENIGH)', url: 'https://www.inegi.org.mx/' },
    { name: 'CONDUSEF — Presupuesto y educación financiera', url: 'https://www.condusef.gob.mx/' },
  ],
};
