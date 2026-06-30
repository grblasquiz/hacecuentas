/**
 * Sala de decisión — "¿Me conviene comprar un auto nuevo o usado?"
 *
 * Patrón COMPARACIÓN (A vs B). Compara el costo total de propiedad (TCO) de un 0km
 * contra un usado a N años de tenencia: precio − valor de reventa (descontando la
 * depreciación compuesta) + patente + seguro + mantenimiento por los años. El 0km
 * deprecia más rápido y arranca más caro; el usado suele ganar salvo que la brecha
 * de precio sea chica. Gana el menor costo total.
 */

import type { DecisionRoom, DecisionResult } from './types';
import { fmtMoney, fmtPct, num } from './types';

/** Valor de reventa tras N años con depreciación compuesta anual. */
function valorReventa(precio: number, deprPct: number, anios: number): number {
  return precio * Math.pow(1 - deprPct / 100, anios);
}

function compute(inputs: Record<string, any>): DecisionResult {
  const precioNuevo = Math.max(0, num(inputs.precioNuevo));
  const precioUsado = Math.max(0, num(inputs.precioUsado));
  const tnaFinanciacion = Math.max(0, num(inputs.tnaFinanciacion));
  const plazoMeses = Math.max(0, num(inputs.plazoMeses));
  const patenteAnual = Math.max(0, num(inputs.patenteAnual));
  const seguroAnual = Math.max(0, num(inputs.seguroAnual));
  const mantenimientoAnual = Math.max(0, num(inputs.mantenimientoAnual));
  const deprNuevo = Math.max(0, num(inputs.depreciacionNuevo));
  const deprUsado = Math.max(0, num(inputs.depreciacionUsado));
  const anios = Math.max(1, num(inputs.aniosTenencia));

  if (!precioNuevo || !precioUsado) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Todavía no alcanza la información',
        detail:
          'Cargá el precio del 0km y del usado equivalente. Sumá patente, seguro y mantenimiento anuales para comparar el costo total real de cada uno.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Diferencia de costo total' },
      scenarios: [],
      nextActions: [
        'Cargá el **precio del 0km** y el de un **usado equivalente** (misma gama, pocos años).',
        'Sumá **patente, seguro y mantenimiento** anuales: el usado suele gastar más en service.',
      ],
    };
  }

  // Costos recurrentes a N años (patente + seguro + mantenimiento).
  const recurrentes = (patenteAnual + seguroAnual + mantenimientoAnual) * anios;

  // El 0km típicamente tiene más patente/seguro (vale más) y menos mantenimiento.
  // Para mantenerlo simple usamos los mismos recurrentes ingresados para ambos,
  // y la diferencia real la captura precio + depreciación.
  const reventaNuevo = valorReventa(precioNuevo, deprNuevo, anios);
  const reventaUsado = valorReventa(precioUsado, deprUsado, anios);

  const depreciaNuevo = precioNuevo - reventaNuevo;
  const depreciaUsado = precioUsado - reventaUsado;

  // TCO = (lo que perdés de valor) + costos recurrentes.
  const tcoNuevo = depreciaNuevo + recurrentes;
  const tcoUsado = depreciaUsado + recurrentes;

  const ventaja = tcoNuevo - tcoUsado; // + => usado más barato; - => nuevo más barato
  const ganaUsado = ventaja > 0;
  const diff = Math.abs(ventaja);
  const margenPct = Math.min(tcoNuevo, tcoUsado) > 0 ? (diff / Math.min(tcoNuevo, tcoUsado)) * 100 : 0;

  // Costo de financiar la diferencia de precio (informativo).
  const i = tnaFinanciacion / 100 / 12;
  const brechaPrecio = precioNuevo - precioUsado;
  const costoFinanciarBrecha = plazoMeses > 0 && i > 0
    ? (brechaPrecio * i * plazoMeses) / (1 - Math.pow(1 + i, -plazoMeses)) - brechaPrecio
    : 0;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (margenPct < 8) {
    status = 'tie';
    tone = 'neutral';
    title = 'Es parejo: decidí por gustos y garantía';
    badge = 'Es parejo';
    detail = `El costo total a ${anios} años es muy similar: ${fmtMoney(tcoNuevo)} el 0km vs ${fmtMoney(tcoUsado)} el usado (diferencia de apenas ${fmtMoney(diff)}). Con esa brecha, pesa más la garantía del 0km o lo que te guste el usado.`;
  } else if (ganaUsado) {
    status = 'b'; // B = usado
    tone = 'good';
    title = 'Conviene el usado';
    badge = 'Comprá usado';
    detail = `A ${anios} años, el usado cuesta ${fmtMoney(diff)} menos (${fmtPct(margenPct, 0)} más barato). El 0km pierde ${fmtMoney(depreciaNuevo)} de valor por la depreciación fuerte de los primeros años; el usado ya pasó ese golpe.`;
  } else {
    status = 'a'; // A = nuevo
    tone = 'good';
    title = 'Conviene el 0km';
    badge = 'Comprá 0km';
    detail = `A ${anios} años, el 0km termina costando ${fmtMoney(diff)} menos (${fmtPct(margenPct, 0)}). La brecha de precio con el usado es chica frente a lo que el usado gasta en mantenimiento y a su propia depreciación.`;
  }

  const scenarios = [
    {
      label: `Tenencia corta (${Math.max(1, anios - 2)} años)`,
      value: (() => {
        const a = Math.max(1, anios - 2);
        const n = (precioNuevo - valorReventa(precioNuevo, deprNuevo, a)) + (patenteAnual + seguroAnual + mantenimientoAnual) * a;
        const u = (precioUsado - valorReventa(precioUsado, deprUsado, a)) + (patenteAnual + seguroAnual + mantenimientoAnual) * a;
        return n < u ? '0km' : 'Usado';
      })(),
      detail: 'A menos años, pesa más la depreciación: castiga al 0km.',
    },
    {
      label: `Tu horizonte (${anios} años)`,
      value: ganaUsado ? 'Usado' : '0km',
      detail: `Diferencia de ${fmtMoney(diff)} a favor del ${ganaUsado ? 'usado' : '0km'}.`,
    },
    {
      label: `Tenencia larga (${anios + 3} años)`,
      value: (() => {
        const a = anios + 3;
        const n = (precioNuevo - valorReventa(precioNuevo, deprNuevo, a)) + (patenteAnual + seguroAnual + mantenimientoAnual) * a;
        const u = (precioUsado - valorReventa(precioUsado, deprUsado, a)) + (patenteAnual + seguroAnual + mantenimientoAnual) * a;
        return n < u ? '0km' : 'Usado';
      })(),
      detail: 'Cuanto más años lo tengas, más se diluye la diferencia de precio.',
    },
  ];

  const comparison = {
    columns: ['0km', 'Usado'] as [string, string],
    rows: [
      { label: 'Precio de compra', a: fmtMoney(precioNuevo), b: fmtMoney(precioUsado) },
      { label: `Valor de reventa a ${anios} años`, a: fmtMoney(reventaNuevo), b: fmtMoney(reventaUsado), hint: `Depr. ${deprNuevo}% vs ${deprUsado}% anual` },
      { label: 'Pérdida por depreciación', a: fmtMoney(depreciaNuevo), b: fmtMoney(depreciaUsado) },
      { label: `Patente + seguro + service (${anios} años)`, a: fmtMoney(recurrentes), b: fmtMoney(recurrentes) },
      { label: 'Costo total de propiedad', a: fmtMoney(tcoNuevo), b: fmtMoney(tcoUsado), hint: ganaUsado ? 'gana el usado' : 'gana el 0km' },
    ],
  };

  const nextActions = [
    ganaUsado
      ? `El usado te ahorra **${fmtMoney(diff)}** a ${anios} años. Antes de cerrar, pagá una **revisión pre-compra** en un taller de confianza: un problema oculto se come esa ventaja.`
      : `El 0km te conviene por **${fmtMoney(diff)}**. Aprovechá para negociar **bonificación de patentamiento** o accesorios, que mejoran aún más la cuenta.`,
    brechaPrecio > 0 && costoFinanciarBrecha > 0
      ? `Si financiás la diferencia de ${fmtMoney(brechaPrecio)} a ${plazoMeses} meses, pagás ~${fmtMoney(costoFinanciarBrecha)} de intereses. Sumalo a la cuenta del 0km antes de decidir.`
      : 'Si vas a financiar, mirá el **CFT** (no solo la TNA): los intereses pueden dar vuelta la comparación.',
    'Verificá el **historial del usado**: dominio, deudas de patente, infracciones, prenda y service oficial. Un usado con papeles en regla vale la diferencia.',
    'No mires solo el precio de la etiqueta: el verdadero costo es **precio − reventa + gastos**. Esta sala ya lo hace por vos.',
  ];

  const notes = [
    'El costo total de propiedad (TCO) compara precio menos valor de reventa (depreciación compuesta anual) más patente, seguro y mantenimiento por los años de tenencia.',
    'La depreciación es un supuesto: un 0km típicamente pierde 15–25% el primer año y un usado deprecia más lento. Ajustá los porcentajes a tu modelo y mercado.',
    'No incluye combustible (igual para ambos si es el mismo modelo) ni el costo de oportunidad del dinero. Es orientativo, no asesoramiento financiero.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(diff),
      label: ganaUsado ? 'Ahorrás con el usado' : 'Ahorrás con el 0km',
      sub: `Costo total a ${anios} años: 0km **${fmtMoney(tcoNuevo)}** vs usado **${fmtMoney(tcoUsado)}**.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'auto-nuevo-o-usado',
  title: '¿Auto nuevo o usado? Comparador de costo total 2026',
  h1: '¿Me conviene comprar un auto nuevo o usado?',
  description:
    'Compará el costo total de propiedad de un 0km contra un usado a varios años: precio, depreciación, patente, seguro y mantenimiento. Te decimos cuál sale más barato y por cuánto.',
  intro:
    'Un 0km arranca más caro y pierde valor rápido los primeros años; un usado ya pasó ese golpe pero gasta más en mantenimiento. La decisión no es el precio de la etiqueta, es el costo total de propiedad: precio menos reventa más todos los gastos durante los años que lo vas a tener. Esta sala calcula los dos y te dice cuál te deja mejor parado.',
  icon: '🚗',
  category: 'finanzas',
  audience: 'AR',
  lastReviewed: '2026-06-29',
  example: {
    precioNuevo: 28000000,
    precioUsado: 18000000,
    tnaFinanciacion: 85,
    plazoMeses: 48,
    patenteAnual: 560000,
    seguroAnual: 1200000,
    mantenimientoAnual: 700000,
    depreciacionNuevo: 20,
    depreciacionUsado: 12,
    aniosTenencia: 5,
  },
  fields: [
    {
      id: 'precioNuevo',
      label: 'Precio del 0km',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '28000000',
      profileKey: 'vehiculo.valor',
      help: 'Precio de lista del auto nuevo que mirás.',
      group: 'Precios',
      groupIcon: '🏷️',
    },
    {
      id: 'precioUsado',
      label: 'Precio del usado equivalente',
      type: 'number',
      prefix: '$',
      required: true,
      min: 0,
      placeholder: '18000000',
      help: 'Mismo modelo o gama, con pocos años de uso.',
      group: 'Precios',
    },
    {
      id: 'aniosTenencia',
      label: '¿Cuántos años lo vas a tener?',
      type: 'number',
      required: true,
      min: 1,
      max: 30,
      default: 5,
      help: 'Tu horizonte de tenencia define cuánta depreciación absorbés.',
      group: 'Precios',
    },
    {
      id: 'patenteAnual',
      label: 'Patente anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '560000',
      help: 'Impuesto a la radicación del automotor, por año.',
      group: 'Gastos anuales',
      groupIcon: '🧾',
    },
    {
      id: 'seguroAnual',
      label: 'Seguro anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '1200000',
      help: 'Prima anual de la cobertura (terceros completo o todo riesgo).',
      group: 'Gastos anuales',
    },
    {
      id: 'mantenimientoAnual',
      label: 'Mantenimiento anual',
      type: 'number',
      prefix: '$',
      default: 0,
      min: 0,
      placeholder: '700000',
      help: 'Service, cubiertas, reparaciones. El usado suele gastar más.',
      group: 'Gastos anuales',
    },
    {
      id: 'depreciacionNuevo',
      label: 'Depreciación 0km (%/año)',
      type: 'number',
      suffix: '%',
      default: 20,
      min: 0,
      max: 60,
      advanced: true,
      help: 'Cuánto valor pierde el 0km por año (típico 15–25%).',
      group: 'Supuestos',
      groupIcon: '📉',
    },
    {
      id: 'depreciacionUsado',
      label: 'Depreciación usado (%/año)',
      type: 'number',
      suffix: '%',
      default: 12,
      min: 0,
      max: 60,
      advanced: true,
      help: 'El usado deprecia más lento (típico 8–14%).',
      group: 'Supuestos',
    },
    {
      id: 'tnaFinanciacion',
      label: 'TNA si financiás',
      type: 'number',
      suffix: '%',
      default: 0,
      min: 0,
      advanced: true,
      help: 'Tasa nominal anual del crédito prendario, si financiás la diferencia.',
      group: 'Supuestos',
    },
    {
      id: 'plazoMeses',
      label: 'Plazo de financiación (meses)',
      type: 'number',
      default: 0,
      min: 0,
      max: 84,
      advanced: true,
      help: 'En cuántas cuotas financiarías la diferencia de precio.',
      group: 'Supuestos',
    },
  ],
  compute,
  componentCalcs: [
    { slug: 'calculadora-cuota-prestamo', label: 'Cuota del crédito prendario' },
    { slug: 'calculadora-cft-prestamo-personal-comparativa', label: 'CFT del préstamo' },
    { slug: 'calculadora-combustible-viaje-auto', label: 'Costo de combustible' },
    { slug: 'calculadora-inflacion-acumulada-periodo', label: 'Inflación acumulada' },
  ],
  howItWorks: `La decisión se resuelve comparando el costo total de propiedad (TCO) de cada opción, no el precio de venta.

1. **Pérdida por depreciación.** A cada auto le calculamos cuánto valor pierde a tus años de tenencia, aplicando una depreciación compuesta anual (el 0km deprecia más fuerte los primeros años).
2. **Gastos recurrentes.** Sumamos patente, seguro y mantenimiento multiplicados por los años que lo vas a tener.
3. **Costo total.** TCO = pérdida de valor + gastos recurrentes. Es lo que realmente te cuesta tener el auto durante ese período.
4. **Veredicto.** Gana el menor TCO. Si la diferencia es chica (menos de 8%), lo declaramos parejo y mandan los gustos y la garantía.
5. **Escenarios.** Mostramos cómo cambia el ganador si lo tenés menos o más años: a menos años pesa más la depreciación (castiga al 0km).`,
  faq: [
    {
      q: '¿Qué es el costo total de propiedad de un auto?',
      a: 'Es todo lo que te cuesta tener el auto durante los años que lo usás: el precio que pagaste menos lo que recuperás al venderlo (depreciación), más patente, seguro y mantenimiento. Es la forma correcta de comparar un 0km con un usado, porque el precio de etiqueta engaña.',
    },
    {
      q: '¿Por qué un 0km pierde tanto valor el primer año?',
      a: 'Apenas sale de la concesionaria deja de ser nuevo: típicamente pierde entre 15% y 25% en el primer año. Por eso un usado de 1 o 2 años suele ser el punto óptimo: ya absorbió la depreciación fuerte pero todavía está casi nuevo.',
    },
    {
      q: '¿Siempre conviene el usado?',
      a: 'No siempre. Si la brecha de precio con el 0km es chica, si el usado tiene muchos kilómetros o necesita reparaciones, o si vas a tenerlo muchos años, el 0km puede empatar o ganar. Esta sala compara los números de tu caso concreto.',
    },
    {
      q: '¿Conviene financiar el auto o pagarlo de contado?',
      a: 'Depende del CFT del crédito y de qué harías con esa plata. Si la tasa del crédito supera lo que rendiría tu dinero invertido, conviene contado. Para ese análisis usá la sala "¿Financiar el auto o pagarlo al contado?".',
    },
    {
      q: '¿El seguro y la patente son más caros en un 0km?',
      a: 'Suelen serlo, porque ambos dependen del valor del auto: a mayor valor, mayor prima de seguro y mayor patente. Cargá los montos reales de cada opción para una comparación más fina.',
    },
    {
      q: '¿Qué reviso antes de comprar un usado?',
      a: 'Pedí un informe de dominio (deudas, prenda, embargos), verificá patentes e infracciones impagas, controlá el historial de service y hacé una revisión pre-compra en un taller independiente. Un problema oculto puede borrar el ahorro frente al 0km.',
    },
    {
      q: '¿Esto incluye el combustible?',
      a: 'No, porque si comparás el mismo modelo el consumo es prácticamente igual y se cancela. Si comparás un nafta contra un híbrido o eléctrico, usá la sala "¿Nafta, híbrido o eléctrico?" que sí incluye el costo de energía.',
    },
    {
      q: '¿Esto es asesoramiento financiero?',
      a: 'No. Es una herramienta orientativa basada en supuestos de depreciación y costos que cargás vos. Los valores reales dependen del modelo, el mercado y el estado del usado. Para una compra grande, asesorate con un profesional de confianza.',
    },
  ],
  sources: [
    { name: 'ACARA — Mercado automotor argentino', url: 'https://www.acara.org.ar/' },
    { name: 'Superintendencia de Seguros de la Nación', url: 'https://www.argentina.gob.ar/ssn' },
  ],
};
