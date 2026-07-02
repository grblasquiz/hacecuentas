/**
 * Sala de decisión PE — "¿Cancelo mi deuda o invierto la plata?"
 *
 * Patrón OPTIMIZACIÓN. En el Perú la brecha es brutal y hace la decisión casi
 * obvia: las tarjetas cargan TCEA de 40-90% y los préstamos personales 20-40%,
 * mientras la inversión segura rinde 4-5% (depósito a plazo en banco) o 6-7%
 * (cajas municipales). Cancelar deuda cara es un rendimiento GARANTIZADO a la
 * TCEA de la deuda — y el pago anticipado es un derecho: reducción de
 * intereses sin penalidad (Código de Protección al Consumidor + normas SBS).
 * Excepción típica: hipotecario a tasa baja. Nunca con el fondo de emergencia.
 */

import type { DecisionRoom, DecisionResult } from '../types';
import { fmtPct, num } from '../types';
import { fmtPEN as fmtMoney } from '../locales';

function compute(inputs: Record<string, any>): DecisionResult {
  const saldoDeuda = Math.max(0, num(inputs.saldoDeuda));
  const tceaDeuda = Math.max(0, num(inputs.tceaDeuda));
  const montoDisponible = Math.max(0, num(inputs.montoDisponible));
  const teaInversion = Math.max(0, num(inputs.teaInversion));
  const fondoEmergencia = Math.max(0, num(inputs.fondoEmergencia));

  if (!saldoDeuda || !tceaDeuda || !montoDisponible || !teaInversion) {
    return {
      status: 'insufficient',
      verdict: {
        title: 'Aún falta información',
        detail:
          'Carga el saldo y la TCEA de tu deuda, la plata que tienes disponible y la TEA de la inversión que estás considerando (depósito a plazo, caja municipal). Como ambas tasas ya son efectivas anuales, la comparación es directa.',
        tone: 'neutral',
        badge: 'Faltan datos',
      },
      decisiveNumber: { value: '—', label: 'Ventaja a 12 meses' },
      scenarios: [],
      nextActions: [
        'Carga el **saldo** de tu deuda y su **TCEA** (está en tu estado de cuenta o en Retasas de la SBS).',
        'Carga **cuánta plata tienes disponible** y la **TEA** que te ofrece el depósito o la caja.',
      ],
    };
  }

  // TCEA y TEA ya son tasas efectivas anuales en el Perú: comparación directa.
  const eaDeuda = tceaDeuda / 100;
  const eaInversion = teaInversion / 100;

  const usable = Math.max(0, montoDisponible - fondoEmergencia);
  const aplicaCancelar = Math.min(usable, saldoDeuda);

  const ahorroAnual = aplicaCancelar * eaDeuda; // intereses que dejas de pagar
  const gananciaAnual = aplicaCancelar * eaInversion; // lo que rendiría invertido
  const ventaja = ahorroAnual - gananciaAnual;
  const spread = (eaDeuda - eaInversion) * 100;

  const sobrante = Math.max(0, usable - saldoDeuda);
  const gananciaSobrante = sobrante * eaInversion;

  let status: DecisionResult['status'];
  let title: string;
  let tone: DecisionResult['verdict']['tone'];
  let badge: string;
  let detail: string;

  if (spread >= 2) {
    status = 'a';
    tone = 'good';
    title = 'Cancela la deuda: es tu mejor inversión';
    badge = 'Cancela la deuda';
    detail = `Tu deuda te cuesta ${fmtPct(tceaDeuda, 1).replace('+', '')} de TCEA y la inversión rinde ${fmtPct(teaInversion, 1).replace('+', '')} TEA. Cancelar equivale a una inversión garantizada a la tasa de la deuda: te ahorra ${fmtMoney(ventaja)} al año frente a invertir. Y en el Perú es tu derecho: pago anticipado con reducción de intereses, sin penalidad.`;
  } else if (spread <= -2) {
    status = 'b';
    tone = 'good';
    title = 'Invierte: tu deuda es más barata que el rendimiento';
    badge = 'Invierte';
    detail = `La inversión rinde ${fmtPct(teaInversion, 1).replace('+', '')} TEA y tu deuda cuesta ${fmtPct(tceaDeuda, 1).replace('+', '')}: invertir te deja ${fmtMoney(-ventaja)} más al año. Este caso se da con deudas baratas (hipotecario Mivivienda, préstamo con convenio): mantén el cronograma al día e invierte el excedente. Solo si la deuda no te quita el sueño.`;
  } else {
    status = 'tie';
    tone = 'neutral';
    title = 'Está parejo: decide por liquidez y tranquilidad';
    badge = 'Parejo';
    detail = `La TCEA de tu deuda (${fmtPct(tceaDeuda, 1).replace('+', '')}) y la TEA de la inversión (${fmtPct(teaInversion, 1).replace('+', '')}) están muy cerca: la diferencia es de apenas ${fmtMoney(Math.abs(ventaja))} al año. Con tasas parejas, prioriza quedarte líquido y sacarte la deuda de la cabeza.`;
  }

  const scenarios = [
    { label: 'Cancelar la deuda', value: '+' + fmtMoney(ahorroAnual).replace('-', ''), detail: `Intereses que dejas de pagar en 12 meses sobre ${fmtMoney(aplicaCancelar)}.` },
    { label: 'Invertir todo', value: '+' + fmtMoney(gananciaAnual).replace('-', ''), detail: `Lo que rendiría ese mismo capital al ${fmtPct(teaInversion, 1).replace('+', '')} TEA.` },
    {
      label: 'Mixta',
      value: '+' + fmtMoney(ahorroAnual + gananciaSobrante).replace('-', ''),
      detail: sobrante > 0 ? `Cancelas la deuda completa e inviertes el sobrante de ${fmtMoney(sobrante)}.` : 'Cancelar hasta donde alcanza (tu plata no cubre todo el saldo).',
    },
  ];

  const comparison = {
    columns: ['Cancelar deuda', 'Invertir'] as [string, string],
    rows: [
      { label: 'Tasa efectiva anual', a: fmtPct(tceaDeuda, 1).replace('+', '') + ' TCEA', b: fmtPct(teaInversion, 1).replace('+', '') + ' TEA', hint: `${spread >= 0 ? '+' : ''}${spread.toFixed(1).replace('.', ',')} puntos a favor de cancelar` },
      { label: `Resultado a 12 meses sobre ${fmtMoney(aplicaCancelar)}`, a: '+' + fmtMoney(ahorroAnual).replace('-', ''), b: '+' + fmtMoney(gananciaAnual).replace('-', '') },
      { label: 'Riesgo', a: 'Cero: el ahorro es garantizado', b: 'Bajo en depósitos; existe en otros instrumentos' },
      { label: 'Capital que aplicas', a: fmtMoney(aplicaCancelar), b: fmtMoney(usable) },
    ],
  };

  const nextActions = [
    'Cancela **primero la deuda más cara** (tarjeta o línea paralela): con TCEA de 40-90%, ningún depósito ni caja le gana. Pagarla ES tu mejor inversión garantizada.',
    'Ejerce tu derecho: pide el **pago anticipado con reducción de intereses** — en el Perú el banco no puede cobrarte penalidad ni negarse (Código de Protección al Consumidor y normas SBS). Elige reducir plazo, no cuota, para ahorrar más interés.',
    fondoEmergencia > 0
      ? `Mantienes ${fmtMoney(fondoEmergencia)} de fondo de emergencia intacto ✓. No lo toques para cancelar: un imprevisto sin colchón te devuelve a la tarjeta, a TCEA de tarjeta.`
      : 'Antes de cancelar, separa un **fondo de emergencia** (3-6 meses de gastos). Tu CTS ayuda como respaldo de largo plazo, pero no reemplaza tener liquidez disponible.',
    'Verifica la **TCEA real** de tu deuda en el estado de cuenta o en Retasas de la SBS: incluye comisiones, portes y seguro de desgravamen — suele ser bastante mayor que la tasa que te dijeron.',
    'Si tu deuda es un hipotecario Mivivienda o un préstamo por convenio a tasa baja, no te apures: ahí sí puede ganar la inversión. Compara tasa contra tasa, como hace esta sala.',
  ];

  const notes = [
    'En el Perú tanto la TCEA (costo de la deuda) como la TEA (rendimiento de depósitos) ya son tasas efectivas anuales: se comparan directamente, sin conversión. Cancelar deuda equivale a invertir sin riesgo a la TCEA de tu crédito.',
    'La comparación no considera el impuesto a la renta sobre intereses ganados (los depósitos de personas naturales están exonerados) ni el ITF, que es marginal (0,005%).',
    'Los depósitos en bancos, financieras y cajas están cubiertos por el Fondo de Seguro de Depósitos hasta el tope vigente por entidad.',
    'No es asesoría financiera. Mantén siempre un fondo de emergencia líquido antes de cancelar o invertir.',
  ];

  return {
    status,
    verdict: { title, detail, tone, badge },
    decisiveNumber: {
      value: fmtMoney(Math.abs(ventaja)) + '/año',
      label: ventaja >= 0 ? 'Ahorras cancelando la deuda' : 'Ganas invirtiendo',
      sub: `Deuda: ${fmtPct(tceaDeuda, 1).replace('+', '')} TCEA vs inversión: ${fmtPct(teaInversion, 1).replace('+', '')} TEA. La diferencia de tasas decide.`,
    },
    scenarios,
    comparison,
    nextActions,
    notes,
  };
}

export const room: DecisionRoom = {
  slug: 'cancelar-deuda-o-invertir',
  title: '¿Cancelar la deuda o invertir? Qué conviene en el Perú 2026',
  h1: '¿Me conviene cancelar mi deuda o invertir la plata?',
  description:
    'Compara la TCEA de tu deuda contra la TEA de un depósito a plazo o caja municipal y descubre qué te deja mejor parado. En el Perú, cancelar una tarjeta con TCEA de 40-90% le gana a cualquier inversión segura — y el pago anticipado sin penalidad es tu derecho.',
  intro:
    'Tienes un dinero extra —una gratificación, utilidades, un ingreso inesperado— y una deuda pendiente. ¿La cancelas o lo inviertes? En el Perú la respuesta suele ser contundente: las tarjetas cargan TCEA de 40% a 90% y los préstamos personales de 20% a 40%, mientras un depósito a plazo rinde 4-5% TEA y una caja municipal 6-7%. Cancelar deuda cara es un rendimiento garantizado a la tasa de la deuda, y la ley te respalda: el pago anticipado con reducción de intereses y sin penalidad es un derecho del consumidor. Esta sala compara tus tasas y te dice cuál gana, por cuánto, y cuánto fondo de emergencia dejar intacto.',
  icon: '⚖️',
  category: 'finanzas',
  audience: 'PE',
  lastReviewed: '2026-07-02',
  example: {
    saldoDeuda: 8000,
    tceaDeuda: 65,
    montoDisponible: 10000,
    teaInversion: 4.5,
    fondoEmergencia: 3000,
  },
  fields: [
    { id: 'saldoDeuda', label: 'Saldo de la deuda', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '8,000', help: 'Lo que te falta pagar de la tarjeta, préstamo o línea de crédito.', group: 'Tu deuda', groupIcon: '💳' },
    { id: 'tceaDeuda', label: 'TCEA de la deuda', type: 'number', suffix: '%', required: true, min: 0, max: 200, placeholder: '65', help: 'El costo efectivo anual total: tarjetas 40-90%, préstamos personales 20-40%. Está en tu estado de cuenta o en Retasas (SBS).', group: 'Tu deuda' },
    { id: 'montoDisponible', label: 'Plata que tienes disponible', type: 'number', prefix: 'S/', format: 'thousands', required: true, min: 0, placeholder: '10,000', help: 'El dinero que podrías usar para cancelar la deuda o invertir (gratificación, utilidades, ahorros).', group: 'Tu plata', groupIcon: '💰' },
    { id: 'teaInversion', label: 'Rendimiento de la inversión (TEA)', type: 'number', suffix: '%', required: true, min: 0, max: 50, default: 4.5, placeholder: '4.5', help: 'TEA de tu alternativa: depósito a plazo en banco ~4-5%, cajas municipales ~6-7%.', group: 'Tu plata' },
    { id: 'fondoEmergencia', label: 'Fondo de emergencia a mantener', type: 'number', prefix: 'S/', format: 'thousands', default: 0, min: 0, recommended: true, placeholder: '3,000', help: 'Plata líquida que NO tocas pase lo que pase (ideal: 3-6 meses de gastos). No se usa para cancelar.', group: 'Tu plata' },
  ],
  compute,
  componentCalcs: [
    { slug: 'pe/calculadora-tarjeta-credito-pago-minimo-peru', label: 'Pago mínimo de tarjeta' },
    { slug: 'pe/calculadora-deposito-plazo-fijo-peru', label: 'Depósito a plazo fijo' },
    { slug: 'pe/calculadora-prestamo-personal-tcea-peru', label: 'Préstamo personal (TCEA)' },
    { slug: 'pe/calculadora-retiro-cts-desempleo-peru', label: 'Retiro de CTS' },
  ],
  howItWorks: `La decisión se reduce a comparar dos tasas efectivas sobre el mismo capital — y en el Perú ambas ya vienen listas para comparar.

1. **La tasa de tu deuda.** Toma la TCEA de tu crédito: es efectiva anual e incluye interés, comisiones y seguro de desgravamen. Cancelar la deuda equivale a "invertir" a esa tasa, garantizado y sin riesgo.
2. **La tasa de tu inversión.** Toma la TEA de tu alternativa real: depósito a plazo (~4-5%), caja municipal (~6-7%) u otro instrumento. También es efectiva anual: la comparación con la TCEA es directa.
3. **Mismo capital, dos caminos.** Aplica ambas tasas a la plata disponible (después de proteger tu fondo de emergencia) y calcula, a 12 meses, cuánto ahorras cancelando versus cuánto ganas invirtiendo.
4. **El veredicto.** Gana la tasa más alta. Con una tarjeta a TCEA de 65%, cancelar "rinde" 60 puntos más que el mejor depósito: no hay inversión segura que compita. Con un hipotecario Mivivienda a 9%, el resultado puede invertirse.
5. **Estrategia mixta.** Si tu plata supera el saldo de la deuda, calcula el combo: cancelar todo e invertir el sobrante.`,
  faq: [
    { q: '¿Por qué cancelar una deuda es "invertir"?', a: 'Porque cada sol que amortizas deja de generar intereses a la TCEA de tu crédito. Si tu tarjeta cobra 65% de TCEA, cancelarla te "rinde" 65% garantizado — más de diez veces lo que paga el mejor depósito a plazo del sistema. Es la única inversión de dos dígitos sin riesgo que existe.' },
    { q: '¿Puedo pagar mi deuda por adelantado sin penalidad en el Perú?', a: 'Sí, es un derecho reconocido por el Código de Protección y Defensa del Consumidor y las normas de la SBS: el pago anticipado, parcial o total, se aplica con reducción de los intereses al día del pago, sin penalidades ni cobros adicionales. El banco debe además dejarte elegir entre reducir la cuota o reducir el plazo.' },
    { q: '¿Qué TCEA tienen las tarjetas y préstamos en el Perú?', a: 'Las tarjetas de crédito van de ~40% a más de 90% de TCEA según entidad y perfil; los préstamos personales, de ~20% a 40%; las líneas paralelas y efectivo de tarjeta suelen estar arriba de 60%. Puedes comparar las tasas vigentes de todas las entidades en el portal Retasas de la SBS.' },
    { q: '¿Cuánto rinde la inversión segura en el Perú?', a: 'Un depósito a plazo en banco ronda 4-5% TEA; las cajas municipales y rurales pagan más, ~6-7% TEA, y están igualmente cubiertas por el Fondo de Seguro de Depósitos hasta el tope por entidad. Los intereses de depósitos de personas naturales están exonerados del impuesto a la renta.' },
    { q: '¿Cuándo conviene invertir en vez de cancelar?', a: 'Cuando la deuda es más barata que el rendimiento: típicamente un crédito hipotecario Mivivienda o bancario a TCEA de 9-11%, o un préstamo por convenio de descuento por planilla a tasa preferencial... y aun ahí la ventaja es chica. Con cualquier deuda de consumo (tarjeta, personal, vehicular), cancelar gana por goleada.' },
    { q: '¿Uso mi CTS para cancelar deudas?', a: 'Como regla, no: la CTS es tu seguro de desempleo y solo puedes disponer libremente del excedente cuando las reglas de retiro lo permiten. Sácala del cálculo salvo que tengas deuda muy cara y estabilidad laboral sólida. Y nunca dejes de lado el fondo de emergencia líquido: sin colchón, cualquier imprevisto te regresa a la tarjeta.' },
    { q: '¿Y si mi plata no alcanza para cancelar toda la deuda?', a: 'Amortiza igual: el pago parcial anticipado también reduce intereses sin penalidad. Prioriza la deuda de mayor TCEA y pide al banco que la amortización reduzca el plazo (no la cuota): así maximizas el interés que te ahorras.' },
    { q: '¿Pagar la deuda mejora mi historial en Infocorp?', a: 'Sí. Al cancelar, la entidad reporta la deuda como saldada y tu calificación (Normal, CPP, Deficiente, Dudoso, Pérdida) mejora en los siguientes reportes. El historial negativo no se borra de inmediato, pero una deuda pagada pesa mucho menos que una vencida — y te reabre la puerta a crédito más barato.' },
  ],
  sources: [
    { name: 'SBS — Retasas: tasas de tarjetas, préstamos y depósitos', url: 'https://www.sbs.gob.pe/app/retasas/paginas/retasasInicio.aspx' },
    { name: 'SBS — Derechos del usuario financiero (pago anticipado)', url: 'https://www.sbs.gob.pe/usuarios' },
    { name: 'BCRP — Tasas de interés del sistema financiero', url: 'https://www.bcrp.gob.pe/' },
  ],
};
