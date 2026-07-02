/**
 * Sala de decisión (Perú) — "¿Cuánto puedo gastar al mes sin endeudarme?"
 *
 * Adapta la regla 50/30/20 a números peruanos: del ingreso neto (planilla u
 * honorarios) resta los fijos (alquiler o mantenimiento, servicios, transporte,
 * cuotas) y el ahorro objetivo, y devuelve el tope de gasto variable por mes,
 * semana y día. Con inflación baja (~2.5%), el enemigo no es que la plata se
 * derrita: es el goteo de gastos chicos y las cuotas de tarjeta.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const ingreso = Math.max(0, num(inputs.ingresoNeto));
  const fijos = Math.max(0, num(inputs.gastosFijos));
  const ahorroPct = Math.max(0, Math.min(100, num(inputs.ahorroObjetivo)));

  if (!ingreso) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía falta información',
        detail:
          'Ingresa tu ingreso neto mensual y tus gastos fijos. Te decimos cuánto puedes gastar en lo variable cada mes, semana y día sin terminar financiándote con la tarjeta.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Gasto variable disponible al mes' },
      scenarios: [],
      nextActions: [
        'Ingresa tu **ingreso neto mensual** (lo que te llega libre, de planilla u honorarios).',
        'Suma tus **gastos fijos** (alquiler, servicios, transporte, cuotas) y fija un **% de ahorro**.',
      ],
    };
  }

  const ahorro = ingreso * (ahorroPct / 100);
  const variable = ingreso - fijos - ahorro;

  // Referencias 50/30/20.
  const ref50 = ingreso * 0.5;
  const ref30 = ingreso * 0.3;
  const ref20 = ingreso * 0.2;
  const pctFijos = (fijos / ingreso) * 100;

  let status: DecisionResult['status'];
  let tone: DecisionResult['verdict']['tone'];
  let title: string;
  let badge: string;
  let detail: string;

  if (variable < 0) {
    status = 'a';
    tone = 'bad';
    title = 'Tus fijos ya superan lo que te entra';
    badge = 'En rojo';
    detail = `Entre gastos fijos (${fmtMoney(fijos)}) y el ahorro objetivo (${fmtMoney(ahorro)}) te pasas de tu ingreso de ${fmtMoney(ingreso)}: faltan ${fmtMoney(-variable)} antes de gastar un sol en lo variable. Toca recortar fijos, bajar el ahorro objetivo por un tiempo o generar ingreso extra — pero no cubrir el hueco con la tarjeta.`;
  } else if (pctFijos > 60) {
    status = 'tie';
    tone = 'warn';
    title = 'Puedes gastar poco: tus fijos pesan demasiado';
    badge = 'Justo';
    detail = `Te quedan ${fmtMoney(variable)} al mes para gastos variables, pero tus fijos se llevan el ${fmtPct(pctFijos, 0)} del ingreso (lo sano es hasta 50%). Con tan poco margen, cualquier imprevisto te empuja a las cuotas de la tarjeta, que en el Perú son de las deudas más caras.`;
  } else {
    status = 'b';
    tone = 'good';
    title = 'Tienes un margen sano para gastar';
    badge = 'Equilibrado';
    detail = `Después de cubrir fijos (${fmtMoney(fijos)}) y separar ${fmtMoney(ahorro)} de ahorro, puedes gastar hasta ${fmtMoney(variable)} al mes en lo variable sin endeudarte. Si respetas ese tope, la tarjeta se paga completa cada mes y no entras en rojo.`;
  }

  const semanal = variable > 0 ? variable / 4.33 : 0;
  const diario = variable > 0 ? variable / 30 : 0;

  const scenarios = [
    { label: 'Al mes', value: fmtMoney(Math.max(0, variable)), detail: 'Tu tope de gasto variable mensual sin endeudarte.' },
    { label: 'A la semana', value: fmtMoney(semanal), detail: 'El mismo tope repartido por semana, más fácil de controlar.' },
    { label: 'Al día', value: fmtMoney(diario), detail: 'Lo que puedes gastar por día en lo no esencial: menús afuera, delivery, antojos.' },
  ];

  const breakdown = [
    { label: 'Ingreso neto mensual', value: fmtMoney(ingreso) },
    { label: 'Necesidades / gastos fijos', value: fmtMoney(fijos), hint: `${fmtPct(pctFijos, 0)} del ingreso (ref. 50%: ${fmtMoney(ref50)})` },
    { label: 'Ahorro objetivo', value: fmtMoney(ahorro), hint: `${fmtPct(ahorroPct, 0)} (ref. 20%: ${fmtMoney(ref20)})` },
    { label: 'Deseos / gasto variable disponible', value: fmtMoney(Math.max(0, variable)), hint: `ref. 30%: ${fmtMoney(ref30)}` },
  ];

  const nextActions = [
    variable < 0
      ? 'Estás en rojo estructural: revisa primero alquiler, planes de celular/cable y cuotas — y **no financies el hueco con el pago mínimo de la tarjeta**, que multiplica el problema.'
      : `Tu tope variable es **${fmtMoney(variable)}/mes** (${fmtMoney(semanal)}/semana). Anota lo no esencial —delivery, taxis por app, salidas— y frena al llegar al tope.`,
    pctFijos > 50
      ? `Tus fijos se llevan el ${fmtPct(pctFijos, 0)} (lo sano es hasta 50%): el alquiler y las cuotas son lo que más mueve la aguja. Renegociar o mudarte suena drástico, pero es lo único que cambia el número de fondo.`
      : 'Tus fijos están en nivel sano (≤50%): el reto es que el gasto variable no se desborde con el goteo de gastos chicos, que con inflación baja es el verdadero enemigo del presupuesto peruano.',
    ahorroPct < 10 && variable > 0
      ? 'Estás ahorrando poco: si te sobra del variable, sube el ahorro objetivo antes de gastarlo. El ahorro que no se separa apenas cobras, no existe.'
      : 'Separa el ahorro **apenas te paguen**, no a fin de mes con lo que sobre: págate a ti primero y gasta lo que queda.',
    'Las gratificaciones de julio y diciembre son ingreso EXTRA, no presupuesto mensual: úsalas para el fondo de emergencia o para amortizar deudas, no para subir tu nivel de gasto de todos los meses.',
  ];

  const notes = [
    'Adapta la regla 50/30/20 (50% necesidades, 30% deseos, 20% ahorro) a tus números reales: el gasto variable disponible es tu ingreso menos los fijos y el ahorro objetivo.',
    'Los "gastos fijos" incluyen alquiler o mantenimiento, servicios (luz, agua, internet), transporte esencial, colegio y cuotas de deuda. Lo discrecional (salidas, ropa, delivery) es gasto variable.',
    'Contexto 2026: la remuneración mínima vital ronda S/ 1,130 y la línea de pobreza urbana del INEI, unos S/ 450 por persona al mes. Si tu ingreso está cerca de esos niveles, la prioridad es cubrir esenciales; los porcentajes de la regla vienen después.',
    'No es asesoría financiera: es una guía de presupuesto orientativa. Ajusta los porcentajes a tu realidad y prioridades.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.max(0, variable)) + '/mes',
      label: 'Puedes gastar en lo variable sin endeudarte',
      sub: `≈ ${fmtMoney(semanal)} por semana, tras cubrir fijos (${fmtMoney(fijos)}) y ahorrar ${fmtMoney(ahorro)}.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-puedo-gastar-al-mes',
  title: '¿Cuánto puedo gastar al mes sin endeudarme? Perú 2026',
  h1: '¿Cuánto puedo gastar al mes sin endeudarme?',
  description:
    'Encuentra tu tope de gasto variable en soles con la regla 50/30/20 adaptada al Perú: de tu ingreso neto restamos fijos (alquiler, servicios, cuotas) y ahorro. Tope por mes, semana y día, sin caer en el pago mínimo de la tarjeta.',
  intro:
    'Gastar sin un número en la cabeza es la ruta directa al pago mínimo de la tarjeta, la deuda más cara del sistema peruano. Esta sala adapta la regla 50/30/20 a tu caso: toma tu ingreso neto —de planilla o de recibos por honorarios—, descuenta tus gastos fijos y el ahorro que quieres sostener, y te da un tope claro de cuánto puedes gastar en lo variable cada mes, semana y día sin entrar en rojo.',
  icon: '🧮',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    ingresoNeto: 3500,
    gastosFijos: 2000,
    ahorroObjetivo: 15,
  },
  fields: [
    { id: 'ingresoNeto', label: 'Tu ingreso neto mensual', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '3500', help: 'Lo que te llega libre al mes: sueldo de planilla ya con descuentos (AFP/ONP) u honorarios netos, sumando todas tus fuentes.', group: 'Tu plata', groupIcon: '💰' },
    { id: 'gastosFijos', label: 'Gastos fijos mensuales', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '2000', help: 'Alquiler o mantenimiento, servicios, transporte esencial, colegio y cuotas de deuda: lo que pagas sí o sí.', group: 'Tu plata' },
    { id: 'ahorroObjetivo', label: '% de ahorro que quieres sostener', type: 'number', suffix: '%', default: 20, min: 0, max: 100, placeholder: '15', help: 'Qué porcentaje de tu ingreso quieres guardar cada mes. La regla 50/30/20 sugiere 20%.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-sueldo-bruto-a-neto-peru', label: 'Sueldo bruto a neto' },
    { slug: 'pe/calculadora-costo-vida-mensual-peru', label: 'Costo de vida mensual' },
    { slug: 'pe/calculadora-canasta-basica-peru-inei', label: 'Canasta básica (INEI)' },
    { slug: 'pe/calculadora-alquiler-asequible-ingreso-peru', label: 'Alquiler según tu ingreso' },
  ],
  howItWorks: `Esta sala convierte la regla 50/30/20 en un tope concreto en soles para ti.

1. **Tu ingreso real.** Parte de lo que te llega libre al mes: sueldo neto de planilla u honorarios ya descontados, sumando todas tus fuentes.
2. **Necesidades primero.** Resta tus gastos fijos: alquiler o mantenimiento, servicios, transporte, colegio y cuotas de deuda. La regla dice que no deberían pasar del 50% del ingreso.
3. **Págate a ti.** Separa el ahorro objetivo que elijas (la regla sugiere 20%) antes de gastar nada más: el ahorro que no se separa primero, no se concreta.
4. **Lo que queda es para gastar.** El resto es tu gasto variable: salidas, delivery, ropa, gustos. Ese es tu tope sin endeudarte.
5. **En porciones manejables.** Reparte el tope por semana y por día, y enciende la alerta si tus fijos pesan más del 50-60%: ahí el problema no es el gasto hormiga, es la estructura.`,
  faq: [
    { q: '¿Qué es la regla 50/30/20?', a: 'Una guía de presupuesto: 50% del ingreso a necesidades, 30% a deseos (gasto variable) y 20% a ahorro. Esta sala la adapta a tus números reales — en el Perú, donde muchos hogares destinan más del 50% a necesidades, el punto de partida es saber cuánto pesan de verdad tus fijos.' },
    { q: '¿Qué cuenta como gasto fijo?', a: 'Todo lo que pagas sí o sí cada mes: alquiler o mantenimiento del departamento, luz, agua, internet y celular, transporte al trabajo, pensión del colegio y cuotas de préstamos o tarjeta. Lo que puedes recortar sin drama —salidas, delivery, ropa— es gasto variable.' },
    { q: '¿Cuánto debería ahorrar con un sueldo peruano promedio?', a: 'La regla sugiere 20%, pero lo importante es sostenerlo. Con un neto de S/ 3,500, el 20% son S/ 700 al mes; si hoy no te da, empieza con 5-10% (S/ 175-350) y sube conforme ordenas los fijos. El hábito pesa más que el porcentaje inicial.' },
    { q: '¿Qué hago si mis fijos superan el 50% del ingreso?', a: 'Es la causa principal de quedarse sin margen. Revisa los rubros grandes: el alquiler es el que más pesa (la referencia sana es que no pase del 30% del ingreso), seguido de cuotas y planes contratados. Si no puedes bajarlos, la salida de fondo es subir ingresos; mientras tanto, modera el ahorro y el variable.' },
    { q: '¿Cómo manejo las gratificaciones de julio y diciembre?', a: 'Como ingreso extraordinario, no como presupuesto mensual. Si estás en planilla recibes un sueldo extra en cada fecha (más la bonificación del 9%): úsalo para el fondo de emergencia, amortizar deudas o metas grandes. El error común es subir el nivel de gasto de todos los meses contando con plata que llega solo dos veces al año.' },
    { q: '¿Sirve si vivo de recibos por honorarios?', a: 'Sí, pero usa tu ingreso promedio de los últimos 6 meses o el más bajo razonable, para no sobreestimar. Con ingreso variable conviene ser conservador: guarda en los meses buenos para cubrir los flojos, y considera un ahorro objetivo mayor porque no tienes CTS ni gratificaciones.' },
    { q: '¿El tope variable incluye la comida?', a: 'Depende: el mercado y la comida del hogar van en fijos (necesidades); los menús afuera, el delivery y los antojos van en el variable. Carga la comida básica dentro de tus fijos para que el tope variable sea realista — es donde más se disfraza el gasto en el presupuesto peruano.' },
    { q: '¿Por qué preocuparme si la inflación en el Perú es baja?', a: 'Justamente por eso: con inflación cerca del 2.5% anual (dentro del rango meta del BCRP), tu plata no se derrite sola — el que rompe el presupuesto eres tú, no los precios. La disciplina del tope mensual rinde de verdad, porque lo que ahorras conserva su valor, y las cuotas de tarjeta al 60-100% de TCEA sí son un incendio comparadas con precios estables.' },
  ],
  sources: [
    { name: 'INEI — Canasta básica y condiciones de vida', url: 'https://www.inei.gob.pe/' },
    { name: 'BCRP — Inflación y rango meta', url: 'https://www.bcrp.gob.pe/' },
  ],
};
