/**
 * Sala de decisión — "¿Cuánto cuesta vivir en esta ciudad?"
 *
 * Patrón PRESUPUESTO. Suma los rubros mensuales de un costo de vida real
 * (alquiler, transporte, alimentos, servicios, salud, educación, ocio) y los
 * traduce en el número que de verdad importa antes de mudarte o aceptar un
 * trabajo en otra ciudad: el INGRESO NETO mensual que necesitás para vivir ahí
 * con margen de ahorro. Devuelve un desglose por rubro y el peso de cada uno.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

const MARGEN_AHORRO = 0.2; // 20% objetivo de ahorro → ingreso = costo / (1 - 0.2)

function compute(inputs: Record<string, any>): DecisionResult {
  const alquiler = Math.max(0, num(inputs.alquiler));
  const transporte = Math.max(0, num(inputs.transporteMes));
  const alimentos = Math.max(0, num(inputs.alimentosMes));
  const servicios = Math.max(0, num(inputs.serviciosMes));
  const salud = Math.max(0, num(inputs.saludMes));
  const educacion = Math.max(0, num(inputs.educacionMes));
  const ocio = Math.max(0, num(inputs.ocioMes));

  const costoVida =
    alquiler + transporte + alimentos + servicios + salud + educacion + ocio;

  if (costoVida <= 0) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá al menos el alquiler, los alimentos y los servicios para estimar cuánto cuesta vivir en la ciudad y qué ingreso neto necesitás.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Costo de vida mensual' },
      scenarios: [],
      nextActions: [
        'Cargá tu **alquiler** mensual y los **alimentos** (el súper de todo el mes).',
        'Sumá **servicios** (luz, gas, agua, internet, celular) y el resto de los rubros para el costo real.',
      ],
    };
  }

  const ingresoNecesario = costoVida / (1 - MARGEN_AHORRO);
  const costoAnual = costoVida * 12;

  // Peso de cada rubro sobre el total (para el desglose).
  const pct = (x: number) => (costoVida > 0 ? (x / costoVida) * 100 : 0);
  const fmtRubro = (x: number) =>
    `${fmtMoney(x)} · ${pct(x).toFixed(0)}% del total`;

  // Sub-veredicto según el peso del alquiler (regla práctica: ≤30% es sano).
  const pesoAlquiler = pct(alquiler);
  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  if (pesoAlquiler <= 30) {
    status = 'b';
    tone = 'good';
    title = 'El alquiler está en una proporción sana';
    badge = 'Equilibrado';
  } else if (pesoAlquiler <= 40) {
    status = 'tie';
    tone = 'neutral';
    title = 'El alquiler pesa fuerte en tu presupuesto';
    badge = 'Ajustado';
  } else {
    status = 'a';
    tone = 'warn';
    title = 'El alquiler se come gran parte de tu presupuesto';
    badge = 'Vivienda cara';
  }

  const detail = `Vivir en esta ciudad cuesta ${fmtMoney(costoVida)} por mes (${fmtMoney(costoAnual)} al año). Para cubrirlo dejando un 20% de margen de ahorro, necesitás un ingreso neto de ${fmtMoney(ingresoNecesario)} mensuales. El alquiler representa el ${pesoAlquiler.toFixed(0)}% de tus gastos.`;

  const scenarios = [
    {
      label: 'Austero',
      value: fmtMoney(costoVida * 0.85),
      detail: 'Recortando ~15% en ocio, alimentos y transporte (vida más mínima).',
    },
    {
      label: 'Probable',
      value: fmtMoney(costoVida),
      detail: 'El costo con los rubros que cargaste.',
    },
    {
      label: 'Holgado',
      value: fmtMoney(costoVida * 1.15),
      detail: 'Con un 15% extra de colchón para imprevistos y salidas.',
    },
  ];

  const breakdown = [
    { label: 'Alquiler', value: fmtRubro(alquiler) },
    { label: 'Alimentos', value: fmtRubro(alimentos) },
    { label: 'Servicios (luz, gas, agua, internet)', value: fmtRubro(servicios) },
    { label: 'Transporte', value: fmtRubro(transporte) },
    { label: 'Salud (prepaga, medicamentos)', value: fmtRubro(salud) },
    { label: 'Educación', value: fmtRubro(educacion) },
    { label: 'Ocio y salidas', value: fmtRubro(ocio) },
    { label: 'Costo de vida total', value: fmtMoney(costoVida), hint: `${fmtMoney(costoAnual)} al año` },
    {
      label: 'Ingreso neto necesario',
      value: fmtMoney(ingresoNecesario),
      hint: 'Para vivir con 20% de margen de ahorro',
    },
  ];

  const nextActions = [
    `Apuntá a un ingreso neto de al menos **${fmtMoney(ingresoNecesario)}** por mes: cubre tus gastos y te deja un 20% para ahorrar e imprevistos.`,
    pesoAlquiler > 30
      ? `El alquiler se lleva el **${pesoAlquiler.toFixed(0)}%** de tus gastos. La regla sana es no pasar el 30%: buscar una zona más barata o compartir libera mucho margen.`
      : `El alquiler está en el ${pesoAlquiler.toFixed(0)}% de tus gastos, dentro de lo recomendable (hasta 30%). Buen punto de partida.`,
    'Antes de mudarte, validá los **servicios y el transporte** con alguien que ya viva ahí: suelen ser los rubros que más cambian entre ciudades.',
    'Si vas por trabajo, compará este costo de vida contra el **sueldo neto** que te ofrecen, no el bruto.',
  ];

  const notes = [
    'El ingreso necesario asume un objetivo de ahorro del 20%: ingreso = costo de vida / (1 − 0,20). Bajá el margen si tu prioridad es solo cubrir gastos.',
    'Es una estimación orientativa: los precios varían por barrio, temporada y estilo de vida. Cargá tus propios valores para el cálculo más fiel.',
    'No es asesoramiento financiero. Para una mudanza grande, sumá costos puntuales (depósito, mudanza, garantía) que no son mensuales.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(costoVida) + '/mes',
      label: 'Costo de vida mensual',
      sub: `Ingreso neto necesario (con 20% de ahorro): **${fmtMoney(ingresoNecesario)}/mes** · ${fmtMoney(costoAnual)} al año.`,
    },
    scenarios,
    breakdown,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cuanto-cuesta-vivir-en-esta-ciudad',
  title: '¿Cuánto cuesta vivir en esta ciudad? Presupuesto mensual 2026',
  h1: '¿Cuánto cuesta vivir en esta ciudad?',
  description:
    'Sumá alquiler, transporte, alimentos, servicios, salud, educación y ocio para saber cuánto cuesta vivir por mes en una ciudad y qué ingreso neto necesitás para hacerlo con margen de ahorro. Con desglose por rubro.',
  intro:
    'Antes de mudarte o aceptar un trabajo en otra ciudad necesitás un número claro: cuánto cuesta vivir ahí por mes y qué ingreso neto te hace falta. Esta sala suma todos tus rubros, calcula el ingreso necesario dejando un 20% de margen de ahorro y te muestra qué porcentaje se lleva cada gasto para que sepas dónde apretar.',
  icon: '🏙️',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    alquiler: 450000,
    transporteMes: 70000,
    alimentosMes: 350000,
    serviciosMes: 120000,
    saludMes: 90000,
    educacionMes: 0,
    ocioMes: 120000,
  },
  fields: [
    {
      id: 'alquiler',
      label: 'Alquiler mensual',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '450000',
      profileKey: 'vivienda.alquilerMensual',
      help: 'Lo que pagás (o pagarías) de alquiler por mes. Si tenés casa propia, poné las expensas/impuestos.',
      group: 'Vivienda y servicios',
      groupIcon: '🏠',
    },
    {
      id: 'serviciosMes',
      label: 'Servicios',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '120000',
      help: 'Luz, gas, agua, internet, celular y expensas (si no las pusiste arriba).',
      group: 'Vivienda y servicios',
    },
    {
      id: 'alimentosMes',
      label: 'Alimentos',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '350000',
      help: 'Súper y comida de todo el mes para tu hogar.',
      group: 'Día a día',
      groupIcon: '🛒',
    },
    {
      id: 'transporteMes',
      label: 'Transporte',
      type: 'number',
      prefix: '$',
      recommended: true,
      min: 0,
      placeholder: '70000',
      help: 'SUBE, nafta, peajes, estacionamiento o lo que gastes en moverte al mes.',
      group: 'Día a día',
    },
    {
      id: 'saludMes',
      label: 'Salud',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '90000',
      help: 'Prepaga, obra social complementaria, medicamentos habituales.',
      group: 'Día a día',
    },
    {
      id: 'educacionMes',
      label: 'Educación',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      help: 'Cuotas de colegio, universidad o cursos. Dejá 0 si no aplica.',
      group: 'Día a día',
    },
    {
      id: 'ocioMes',
      label: 'Ocio y salidas',
      type: 'number',
      prefix: '$',
      recommended: true,
      default: 0,
      min: 0,
      placeholder: '120000',
      help: 'Salidas, streaming, gimnasio, hobbies y gastos no esenciales.',
      group: 'Día a día',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'regla-50-30-20', label: 'Regla 50/30/20' },
    { slug: 'sueldo-en-mano-argentina', label: 'Sueldo en mano (neto)' },
    { slug: 'calculadora-actualizacion-alquiler-icl', label: 'Actualización de alquiler (ICL)' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `Esta sala convierte tus gastos en el ingreso neto que necesitás para vivir en la ciudad.

1. **Suma de rubros.** Toma los siete rubros del costo de vida (alquiler, servicios, alimentos, transporte, salud, educación y ocio) y los suma para el costo de vida mensual.
2. **Ingreso neto necesario.** Aplica un margen de ahorro del 20%: el ingreso necesario es costo de vida ÷ (1 − 0,20). Así no quedás cubriendo justo los gastos sin poder ahorrar.
3. **Peso de cada rubro.** Calcula qué porcentaje del total representa cada gasto, para que veas de un vistazo cuál se lleva la mayor parte.
4. **Chequeo del alquiler.** Marca si el alquiler supera el 30% de tus gastos, el umbral práctico para que la vivienda no te ahogue.
5. **Escenarios.** Muestra un costo austero (−15%), el probable y uno holgado (+15%) para que tengas un rango, no un único número.`,
  faq: [
    {
      q: '¿Qué incluye el costo de vida mensual?',
      a: 'Alquiler, servicios (luz, gas, agua, internet, celular), alimentos, transporte, salud, educación y ocio. Son los rubros recurrentes que pagás todos los meses. No incluye gastos puntuales como una mudanza, un viaje o una compra grande.',
    },
    {
      q: '¿Por qué el ingreso necesario es mayor al costo de vida?',
      a: 'Porque suma un margen de ahorro del 20%. Si ganás exactamente lo que gastás, no podés ahorrar ni cubrir imprevistos. La fórmula ingreso = costo ÷ (1 − 0,20) te asegura que, después de pagar todo, te quede ese 20% para ahorrar.',
    },
    {
      q: '¿Cuánto debería gastar en alquiler?',
      a: 'La regla práctica es no superar el 30% de tus gastos (o de tu ingreso) en vivienda. Por encima de eso, el alquiler te deja poco margen para el resto y para ahorrar. Esta sala te dice qué porcentaje representa tu alquiler.',
    },
    {
      q: '¿Sirve para comparar dos ciudades?',
      a: 'Sí. Calculá el costo en cada ciudad cargando los precios de cada una y compará el ingreso neto necesario. Es la forma correcta de evaluar una mudanza por trabajo: no alcanza con mirar el sueldo, hay que mirar cuánto cuesta vivir ahí.',
    },
    {
      q: '¿Uso el sueldo bruto o el neto para compararlo?',
      a: 'El neto, siempre. El ingreso necesario que calcula la sala es neto (lo que te queda en la mano). Si te ofrecen un sueldo bruto, calculá primero el neto con la calculadora de sueldo en mano y recién ahí compará.',
    },
    {
      q: '¿Cómo afecta la inflación a este cálculo?',
      a: 'Los precios cambian rápido en Argentina. El número es una foto de hoy: revisalo cada pocos meses, sobre todo el alquiler (que se ajusta por ICL u otro índice) y los servicios. Podés usar nuestra calculadora de inflación acumulada para proyectar.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa para presupuestar. Para decisiones grandes (mudanza internacional, cambio de vida) sumá los costos puntuales y, si lo necesitás, consultá con un asesor financiero matriculado.',
    },
  ],
  sources: [
    { name: 'INDEC — Canasta Básica Total', url: 'https://www.indec.gob.ar/' },
    { name: 'BCRA — Índice de Contratos de Locación (ICL)', url: 'https://www.bcra.gob.ar/' },
  ],
};
